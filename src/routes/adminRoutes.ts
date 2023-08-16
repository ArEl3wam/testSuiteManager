import express from "express";
import { isAdmin } from "../permissions/permissions";
import {
  getAllUsers,
  activateUser,
  updateUserSolutions,
  deleteUser,
} from "../controllers/adminController";

export const adminRouter = express.Router();

adminRouter.use(isAdmin);

adminRouter.route("/admin/users").get(getAllUsers);
adminRouter
  .route("/admin/users/:id")
  .get(activateUser)
  .patch(updateUserSolutions)
  .delete(deleteUser);
