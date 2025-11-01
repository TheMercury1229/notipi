import { Router } from "express";
import {
  getUserProfile,
  login,
  signup,
} from "../controllers/user.controller.js";
import { checkAuth } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.post("/login", login);
userRouter.post("/signup", signup);
userRouter.get("/", checkAuth, getUserProfile);

export default userRouter;
