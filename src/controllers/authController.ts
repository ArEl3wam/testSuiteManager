import { getUserModel } from "../model/User";
import express from "express";
import catchAsync from "../shared/catchAsync";
import jwt from "jsonwebtoken";
import { AppError } from "../shared/errors";
import sendEmail from "../shared/email";
import { getDBMetadataModel } from "../model/DBMetadata";

export const signup = catchAsync(
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const User = getUserModel();
    const user = await User.findOne({ email: req.body.email });
    if (user) return next(new AppError("This email is already taken.", 400));

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

    const baseUrl = `${req.protocol}://${req.hostname}:${process.env.PORT}`;
    const text = `Click here to verify your account: ${baseUrl}/verify/${verificationToken}`;

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
      return next(new AppError("Incorrect email or password.", 401));
    }

    if (!user.isVerified)
      return next(new AppError("Please verify your account first.", 401));

    if (!user.isActive)
      return next(new AppError("Account is not activated by admin yet.", 401));

    res.status(200).json({
      status: "success",
      token: user.getToken(),
    });
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
    // console.log(payload.id);

    if (!user) return next(new AppError("This user does not exist.", 401));

    if (!user.isVerified)
      return next(new AppError("Please verify your account first.", 401));

    if (!user.isActive)
      return next(new AppError("Account is not activated by admin yet.", 401));

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
    console.log("verify");
    const token = req.params.token;
    const payload: any = jwt.verify(token, <string>process.env.JWT_SECRET);
    console.log(payload);
    if (!payload.verification) return next(new AppError("wrong token!", 401));

    const User = getUserModel();
    const user = await User.findOneAndUpdate(
      { _id: payload.id },
      { isVerified: true }
    );
    if (!user) return next(new AppError("This user doesn't exist", 404));

    res
      .status(301)
      .redirect(
        `${req.protocol}://${req.hostname}:${process.env.FRONTEND_PORT}/login`
      );
  }
);

export async function checkRequestedDatabase(request: express.Request, response: express.Response, next: express.NextFunction) {
  if (request.method != 'GET') return next();
  
  const databaseName = request.query.databaseName as string;
  if(!databaseName) return next()
  const DBMetadataModel = getDBMetadataModel();
  const dbMetadata = await DBMetadataModel.findOne({ DatabaseName: databaseName });
  if (!dbMetadata) {
    return response.json({message: "Invalid database"})  
  } 
  return next();

}