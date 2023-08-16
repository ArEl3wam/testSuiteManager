import express from "express";
import { isAdmin } from "../permissions/permissions";
import { getAllUnActivatedUsers,  getAllUsers, activateUser} from "../controllers/adminController";

export const adminRouter = express.Router();

adminRouter.use(isAdmin);

adminRouter.route("/admin/unactiveusers").get(getAllUnActivatedUsers);
adminRouter.route("/admin/users").get(getAllUsers);
adminRouter.route("/admin/users/:id").get(activateUser);


