import multer from "multer";
import sharp from "sharp";
import User from "../models/userModel";
import AppError from "../utils/appErrors";
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { deleteOne, getAll, getOne, updateOne } from "./handlerFactory";
import dotenv from "dotenv";
import cloudinary from "../utils/cloudinary";
import { join } from "path";
import { promises as fsPromises } from "fs";

dotenv.config();

const multerStorage = multer.memoryStorage();

const multerFilter = (
  _req: Request,
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
  async (req: Request, _res: Response, next: NextFunction) => {
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

const filterObj = (obj: Object, ...allowedFields: any[]) => {
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

    if (req.file) {
      const tempDirPath = join(__dirname, "temp");
      const tempFilePath = join(tempDirPath, req.file.filename);
      // Create the temp directory if it doesn't exist
      await fsPromises.mkdir(tempDirPath, { recursive: true });

      // Create a temporary file with the buffer content
      await fsPromises.writeFile(tempFilePath, req.file.buffer);

      const cloudUpload = await cloudinary.uploader.upload(tempFilePath, {
        folder: "Receipt/Users",
        width: 500,
        height: 500,
        crop: "fill",
      });
      if (req.user.avatar && req.user.avatar.public_id) {
        await cloudinary.uploader.destroy(req.user.avatar.public_id);
      }

      filteredBody.avatar = {
        public_id: cloudUpload.public_id,
        url: cloudUpload.secure_url,
      };

      // Remove the temporary file after uploading to Cloudinary
      await fsPromises.unlink(tempFilePath);
    }

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
  async (req: Request, res: Response, _next: NextFunction) => {
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

export const getUserByEmail = () =>
  catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const searchedEmail = req.body.email;

    const searchDivided = searchedEmail.split(" ").filter(Boolean); // Split the searchedEmail into individual slugs

    const regexConditions = searchDivided.map((s: any) => new RegExp(s, "i"));

    const query = { email: { $in: regexConditions } };

    const data = await User.find(query);

    console.log(query);

    res.status(200).json({
      status: "success",
      result: data.length,
      data,
    });
  });
