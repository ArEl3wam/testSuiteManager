import catchAsync from "../shared/catchAsync";
import express from "express";
import { AppError } from "../shared/errors";

export const isAuthenticated = catchAsync(
  async (req: any, res: any, next: express.NextFunction) => {
    if (!req.user) {
      return next(
        new AppError("you must be logged in to access this resource", 401)
      );
    }
    next();
  }
);

export const isAdmin = catchAsync(
  async (req: any, res: any, next: express.NextFunction) => {
    if (!req.user || !req.user.isAdmin) {
      return next(
        new AppError("You must be an Admin to access this resource.", 401)
      );
    }
    next();
  }
);
