import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import isSiemensEmail from "../validators/isSiemensEmail";
import jwt from "jsonwebtoken";
import { DbConnectionHandler } from "../shared/DbConnectionsHandler";

export enum SolutionEnum {
  ETHERNET = "ETHERNET",
  FIVEG = "5G",
  OTN = "OTN",
}

export interface IUser {
  name: string;
  email: string;
  password: string;
  passwordChangedAt: Date;
  isAdmin: boolean;
  isActive: boolean;
  isVerified: boolean;
  solutions: string[];

  changedPasswordAfter: (timeStamp: Date) => boolean;
  getToken: (extra_payload?: object, token_options?: object) => string;
}

const UserSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    required: [true, "A User must have a name."],
  },

  email: {
    type: String,
    required: [true, "A User must have an email."],
    unique: true,
    lowercase: true,
    // validate: isSiemensEmail,
  },

  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: [8, "Password should be at least 8 char long."],
    select: false,
  },

  passwordChangedAt: Date,

  isActive: {
    type: Boolean,
    default: false,
  },

  isAdmin: {
    type: Boolean,
    default: false,
  },

  isVerified: {
    type: Boolean,
    default: false,
  },

  solutions: {
    type: [String],
    enum: Object.values(SolutionEnum),
    default: [],
  },
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.correctPassword = async function (
  candidatePassword: string,
  userPassword: string
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

UserSchema.methods.getToken = function (
  extra_payload: object,
  token_options: object
) {
  return jwt.sign(
    { id: this._id, ...extra_payload },
    process.env.JWT_SECRET as string,
    {
      expiresIn: process.env.JWT_EXPIRATION,
      ...token_options,
    }
  );
};

UserSchema.methods.changedPasswordAfter = function (timeStamp: Date) {
  if (!this.passwordChangedAt) return false;
  return timeStamp < this.passwordChangedAt;
};

export function getUserModel() {
  let conn = DbConnectionHandler.getInstance().getUsersDbConnection();
  // const conn = mongoose.connection.useDb("users", { useCache: true });
  conn = conn.useDb("users", { useCache: true });
  return conn.model<IUser>("User", UserSchema);
}

export default UserSchema;
