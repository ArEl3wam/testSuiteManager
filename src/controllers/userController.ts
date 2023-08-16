import express from "express";
import catchAsync from "../shared/catchAsync";

export const getUserData = catchAsync(
  async (req: any, res: express.Response, next: express.NextFunction) => {
    res.status(200).json({
      status: "success",
      data: {
        user: req.user,
      },
    });
  }
);
