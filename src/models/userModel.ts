import mongoose, { Document, Query, Model } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { NextFunction } from "express";

interface UserTypes {
  firstName: string;
  lastName: string;
  email: string;
  avatar: {
    data: Buffer;
    contentType: string;
    name: string;
    destination: string;
    public_id: string;
    url: string;
  };
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

const userSchema = new mongoose.Schema<UserTypes>(
  {
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
      data: Buffer,
      contentType: String,
      name: String,
      destination: String,
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
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
        validator: function (el: string) {
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
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual("favorites", {
  ref: "RecipeFavorite",
  foreignField: "user",
  localField: "_id",
});

userSchema.pre(/^find/, function (next: NextFunction) {
  const query = this as Query<UserModel[], UserModel>;

  query.populate({
    path: "favorites",
    select: "_id -user recipe",
  });

  next();
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

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model<UserTypes & UserDoc & Document>("User", userSchema);

export default User;
