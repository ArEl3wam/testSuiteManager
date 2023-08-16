import express from "express";
import { getUserData } from "../controllers/userController";
import { isAuthenticated } from "../permissions/permissions";

const userRouter = express.Router();
userRouter.use(isAuthenticated);

userRouter.route("/").get(getUserData);

export default userRouter;
