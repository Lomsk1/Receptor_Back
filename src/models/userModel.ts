import mongoose, { Document, Query, Model } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";

interface UserTypes {
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  role: string;
  password: string;
  passwordConfirm: string;
  passwordChangedAt: Date;
  passwordResetToken: string;
  passwordResetExpires: Date;
  active: boolean;
}

export interface UserModel extends Model<UserDoc> {
  build(attrs: UserTypes): UserDoc;
}

export interface UserDoc extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirm: string;
  passwordChangedAt?: Date;
  active: boolean;
  correctPassword(
    candidatePassword: string,
    userPassword: string
  ): Promise<boolean>;
  changedPasswordAfter(JWTTimestamp: number): Promise<boolean>;
  createPasswordResetToken(): Promise<boolean>;
}

const userSchema = new mongoose.Schema<UserTypes>({
  firstName: {
    type: String,
    required: [true, "გთხოვთ შეიყვანოთ სახელი"],
  },
  lastName: {
    type: String,
    required: [true, "გთხოვთ შეიყვანოთ გვარი"],
  },
  email: {
    type: String,
    required: [true, "გთხოვთ, შეიყვანოთ თქვენი იმეილი"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "გთხოვთ მიუთითოთ ვალიდური იმეილი"],
  },
  avatar: {
    type: String,
    default: "user/defaultAvatar.png",
  },
  role: {
    type: String,
    enum: ["user", "editor", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "გთხოვთ შეიყვანეთ პაროლი"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "გთხოვთ დაადასტურეთ პაროლი"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "პაროლები არ ემთხვევა ერთმანეთს",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  //   Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  //   Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

// For QUERY
userSchema.pre(/^find/, function (this: Query<UserTypes[], UserTypes>, next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword: string,
  userPassword: string
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp: number) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      String(this.passwordChangedAt.getTime() / 1000)
    );
    return JWTTimestamp < changedTimestamp;
  }

  //   False means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model<UserTypes & UserDoc & Document>("User", userSchema);

export default User;
