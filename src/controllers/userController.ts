import multer from "multer";
import sharp from "sharp";
import User from "../models/userModel";
import AppError from "../utils/appErrors";
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { deleteOne, getAll, getOne, updateOne } from "./handlerFactory";

const multerStorage = multer.memoryStorage();

const multerFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: Function
) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("გთხოვთ ატვირთოთ ფოტო!", 400), false);
  }
};

const upload = multer({
  dest: "src/images/user",
  storage: multerStorage,
  fileFilter: multerFilter,
});

export const uploadUserPhoto = upload.single("avatar");

export const resizeUserPhoto = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) return next();
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`src/images/user/${req.file.filename}`);

    next();
  }
);

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

export const updateMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Create error if user POSTs password data

    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError("გთხოვთ განაახლოთ მხოლოდ ინფორმაცია, პაროლის გარეშე", 400)
      );
    }

    // 2) Filtered out unwanted fields that are not allowed too be updated
    const filteredBody: any = filterObj(
      req.body,
      "firstName",
      "lastName",
      "email",
      "avatar"
    ); //if we need to change other fields, just add here

    // Upload image to database
    if (req.file) filteredBody.avatar = req.file.filename;

    // 3) Update user document
    const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "success",
      data: {
        user: updateUser,
      },
    });
  }
);
export const deleteMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
      status: "success",
      data: null,
    });
  }
);

export const getMe = (req: Request, _res: Response, next: NextFunction) => {
  req.params.id = req.user.id;
  next();
};

export const getAllUsers = getAll(User);

export const getUser = getOne(User);

// Except password
export const updateUser = updateOne(User);


export const deleteUser = deleteOne(User);
