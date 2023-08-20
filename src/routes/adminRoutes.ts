import express from "express";
import { isAdmin } from "../permissions/permissions";
import {
  getAllUsers,
  activateUser,
  updateUser,
  deleteUser,
  getAllSolutions,
} from "../controllers/adminController";

export const adminRouter = express.Router();

adminRouter.use(isAdmin);

adminRouter.route("/users").get(getAllUsers);
adminRouter
  .route("/users/:id")
  .get(activateUser)
  .patch(updateUser)
  .delete(deleteUser);

adminRouter.route("/solutions").get(getAllSolutions);
