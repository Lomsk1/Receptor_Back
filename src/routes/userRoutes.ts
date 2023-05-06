import express from "express";
import {
  forgetPassword,
  login,
  protect,
  resetPassword,
  signUp,
  updatePassword,
} from "../controllers/authController";

const userRouter = express.Router();

userRouter.post("/signup", signUp);
userRouter.post("/login", login);

userRouter.post("/forgotPassword", forgetPassword);
userRouter.patch("/resetPassword/:token", resetPassword);

userRouter.use(protect); //After this, everything needs to be authorized

userRouter.patch("/updateMyPassword", updatePassword);

export default userRouter;
