import express from "express";
import { getUserModel } from "../model/User";
import { AppError } from "../shared/errors";
import catchAsync from "../shared/catchAsync";
import { SolutionEnum } from "../model/User";

export const getAllUsers = catchAsync(
  async (req: express.Request, res: express.Response) => {
    const activated = req.query.activated;
    const User = getUserModel();
    if (activated) {
      const users = await User.find({ isActive: true }).exec();
      res.status(200).json(users);
    } else {
      const users = await User.find({ isActive: false }).exec();
      res.status(200).json(users);
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
        return res.status(200).json(user);
      } else {
        await user.deleteOne();
        return res.status(200).json({ message: "User is deleted." });
      }
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }
);

export const updateUserSolutions = catchAsync(
  async (req: any, res: express.Response, next: express.NextFunction) => {
    const User = getUserModel();
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return next(new AppError("This user does not exist.", 401));
    let { solutions } = req.body;

    solutions = solutions.map((solution: string) => solution.toUpperCase());
    const containsInvalidSolution = solutions.some(
      (solution: string) =>
        !Object.values(SolutionEnum).includes(
          solution.toUpperCase() as SolutionEnum
        )
    );

    if (containsInvalidSolution)
      return next(new AppError("Invalid solution type.", 401));

    if (solutions) user.solutions = solutions;
    await user.save();

    return res.status(200).json(user);
  }
);

export const deleteUser = catchAsync(
  async (req: any, res: express.Response, next: express.NextFunction) => {
    const User = getUserModel();
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) throw new AppError("This user does not exist.", 401);
    await user.deleteOne();
    res.status(200).json({ message: "User is deleted." });
  }
);
