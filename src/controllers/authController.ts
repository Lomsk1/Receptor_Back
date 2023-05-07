import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { promisify } from "util";
import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import User from "../models/userModel";
import Email from "../utils/email";
import AppError from "../utils/appErrors";

dotenv.config();

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const signToken = (id: number) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res: Response, req: Request) => {
  const token = signToken(user.id);

  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() +
        parseInt(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  });

  //   Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

export const signUp = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const newUser = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      role: req.body.role,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    const url = `${req.protocol}://${req.get("host")}/me`;

    await new Email(newUser, url).sendWelcome();

    createSendToken(newUser, 201, res, req);
  }
);

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    // 1) check if email and password exist
    if (!email || !password) {
      return next(new AppError("გთხოვთ შეიყვანოთ იმეილი და პაროლი", 400));
    }
    // 2) check if user exist && password is correct
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError("არასწორი იმეილი ან პაროლი", 401));
    }

    // 3) if everything is OK, send token to client
    createSendToken(user, 200, res, req);
  }
);

export const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Getting token and check of it's there
    let token: string;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(
        new AppError("არ ხართ ავტორიზებული! გთხოვთ გაიაროთ ავტორიზაცია", 401)
      );
    }

    // 2) Verification token
    const verify = promisify<string, string>(jwt.verify);
    const decoded: any = await verify(token, process.env.JWT_SECRET);

    // 3) check if user still exist
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError("ვალიდურობის დროს გასულია", 401));
    }

    // 4) Check if user changed password after the  JWT was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError(
          "პაროლი ახალი შეცვლილია! გთხოვთ თავიდან გაიაროთ ავტორიზაცია",
          401
        )
      );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
  }
);

export const restrictTo = (...roles) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("არ გაქვთ წვდომა მოქმედების განსახორციელებლად", 403)
      );
    }
    next();
  };
};

export const forgetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return next(new AppError("ამ იმეილით მომხმარებელი არ არსებობს", 404));
    }
    // 2) Generate the random reset
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send it to user's email
    try {
      const resetURL = `${req.protocol}://${req.get(
        "host"
      )}/api/v1/users/resetPassword/${resetToken}`;

      await new Email(user, resetURL).sendPasswordReset();

      res.status(200).json({
        status: "success",
        message: "ლინკი გამოგზავნილია იმეილზე",
      });
    } catch (ere) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(new AppError("შეცდომა! გთხოვთ სცადოთ მოგვიანებით", 500));
    }
  }
);

export const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Get token based on the token
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
      return next(new AppError("ვალიდურობის დრო გასულია", 400));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    // 3) Update changedPasswordAt property for the user

    // 4) Log the user in, send JWT
    createSendToken(user, 200, res, req);
  }
);

export const updatePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select("+password");

    // 2) check if POSTed current password is correct
    if (!user.correctPassword(req.body.passwordCurrent, user.password)) {
      return next(new AppError("ახლანდელი პაროლი არასწორია", 401));
    }

    // 3) If so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // 4) Log user in, send JWT
    createSendToken(user, 200, res, req);
  }
);
