import express from "express";
import { getUserModel } from "../model/User";

export async function getAllUnActivatedUsers(
  req: express.Request,
  res: express.Response
) {
  const User = getUserModel();
  const users = await User.find({ isActive: false }).exec();
  res.status(200).json(users);
}
