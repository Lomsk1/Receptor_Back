import express from "express";
import {
  forgetPassword,
  login,
  protect,
  resetPassword,
  restrictTo,
  signUp,
  updatePassword,
} from "../controllers/authController";
import {
  deleteMe,
  deleteUser,
  getAllUsers,
  getMe,
  getUser,
  resizeUserPhoto,
  updateMe,
  updateUser,
  uploadUserPhoto,
} from "../controllers/userController";

const userRouter = express.Router();


userRouter.route("/").get(getAllUsers);


userRouter.post("/signup", signUp);
userRouter.post("/login", login);

userRouter.post("/forgotPassword", forgetPassword);
userRouter.patch("/resetPassword/:token", resetPassword);

userRouter.use(protect); //After this, everything needs to be authorized

userRouter.patch("/updateMyPassword", updatePassword);

userRouter.get("/me", getMe, getUser);
userRouter.patch("/updateMe", uploadUserPhoto, resizeUserPhoto, updateMe);
userRouter.delete("/deleteMe", deleteMe);

userRouter.use(restrictTo("admin"));

// userRouter.route("/").get(getAllUsers);
userRouter.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

export default userRouter;
