import { Router } from "express";
import {
  authCallback,
  getUserProfile,
} from "../controllers/user.controller.js";
import { checkAuth } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.post("/auth/callback", authCallback);
userRouter.get("/", checkAuth, getUserProfile);

export default userRouter;
