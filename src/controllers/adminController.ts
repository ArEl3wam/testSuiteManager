import express from "express";
import { getUserModel } from "../model/User";
import { AppError } from "../shared/errors";
import catchAsync from "../shared/catchAsync";

export const getAllUsers = catchAsync(
  async (req: express.Request, res: express.Response) => {
    const queryBody = {
      isActive: req.query.activated,
      isAdmin: false,
      isVerified: true,
    };
    const User = getUserModel();
    try {
      const users = await User.find(queryBody).exec();
      res.status(200).json(users);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }
);

export const activateUser = catchAsync(
  async (req: express.Request, res: express.Response) => {
    const User = getUserModel();
    const userId = req.params.id;
    const approve = req.query.approve;
    const user = await User.findById(userId);
    if (!user) throw new AppError("This user does not exist.", 401);
    try {
      if (approve) {
        user.isActive = true;
        await user.save();
        return res.status(200).json({
          status: "success",
          message: "User is Activated.",
          data: user,
        });
      } else {
        await user.deleteOne();
        return res
          .status(200)
          .json({ status: "success", message: "User is deleted." });
      }
    } catch (err: any) {
      return res.status(400).json({ status: "fail", message: err.message });
    }
  }
);

export const updateUser = catchAsync(
  async (req: any, res: express.Response, next: express.NextFunction) => {
    const User = getUserModel();
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return next(new AppError("This user does not exist.", 401));
    let { solutions, deletableDatabases } = req.body;

    solutions = solutions.map((solution: string) => solution.toUpperCase());

    if (solutions) user.solutions = solutions;
    if (deletableDatabases) user.deletableDatabases = deletableDatabases;
    console.log(user);

    await user.save();

    return res.status(200).json({
      status: "success",
      message: "User updated successfully",
      data: user,
    });
  }
);

export const deleteUser = catchAsync(
  async (req: any, res: express.Response, next: express.NextFunction) => {
    const User = getUserModel();
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) throw new AppError("This user does not exist.", 401);
    await user.deleteOne();
    res.status(200).json({ status: "success", message: "User is deleted." });
  }
);

