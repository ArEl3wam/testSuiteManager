import express from "express";
import { signup, verify, login } from "../controllers/authController";

export const authRouter = express.Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.get("/verify/:token", verify);
