import { getUserModel } from "../model/User";
import express from "express";
import catchAsync from "../shared/catchAsync";
import jwt from "jsonwebtoken";
import { AppError } from "../shared/errors";
import sendEmail from "../shared/email";

export const signup = catchAsync(
  async (req: express.Request, res: express.Response) => {
    const User = getUserModel();
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });

    const token = newUser.getToken();

    res.status(201).json({
      status: "success",
      token,
      data: {
        name: newUser.name,
        email: newUser.email,
        isActive: newUser.isActive,
        _id: newUser._id,
      },
    });

    const verificationToken = newUser.getToken(
      { verification: true },
      { expiresIn: "10m" }
    );

    const baseUrl = `${req.protocol}://${process.env.BACKEND_HOST}:${process.env.PORT}`;
    const text = `click here to activate: ${baseUrl}/verify/${verificationToken}`;

    return await sendEmail({
      to: newUser.email,
      subject: "Email Verficiation",
      text,
    });
  }
);

export const login = catchAsync(
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError("Please provide an email and password!", 400));
    }
    const User = getUserModel();

    const user: any = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError("Incorrect Credentials", 401));
    }

    res.status(200).json({
      status: "success",
      token: user.getToken(),
    });
  }
);

export const protect = catchAsync(
  async (req: any, res: any, next: express.NextFunction) => {
    if (!req.user) {
      return next(
        new AppError("you must be logged in to access this resource", 401)
      );
    }
    next();
  }
);

export const authMiddleware = catchAsync(
  async (req: any, res: express.Response, next: express.NextFunction) => {
    const auth = req.headers.authorization;
    let token;
    if (auth && auth.startsWith("Bearer")) {
      token = auth.split(" ")[1];
    }

    if (!token) return next();
    const payload: any = jwt.verify(token, <string>process.env.JWT_SECRET);

    const User = getUserModel();
    const user = await User.findById(payload.id);
    console.log(payload.id);

    if (!user)
      return next(new AppError("This user does no longer exist.", 401));

    if (!user.isActive)
      return next(new AppError("Please activate your account first!", 401));

    if (user.changedPasswordAfter(new Date(payload.iat * 1000)))
      return next(
        new AppError("User changed password, please log in again", 401)
      );

    req.user = user;
    next();
  }
);

export const verify = catchAsync(
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const token = req.params.token;
    const payload: any = jwt.verify(token, <string>process.env.JWT_SECRET);
    console.log(payload);
    if (!payload.verification) return next(new AppError("wrong token!", 401));

    const User = getUserModel();
    const user = await User.findOneAndUpdate(
      { _id: payload.id },
      { isActive: true }
    );
    if (!user) return next(new AppError("This user doesn't exist", 404));

    res.status(200).json({
      status: "success",
      message: "Account is activated successfully!",
    });
  }
);
