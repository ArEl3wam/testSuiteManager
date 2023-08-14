import express from "express";
import { isAdmin } from "../permissions/permissions";
import { getAllUnActivatedUsers } from "../controllers/adminController";

export const adminRouter = express.Router();

adminRouter.use(isAdmin);

adminRouter.route("/admin/unactiveusers").get(getAllUnActivatedUsers);
