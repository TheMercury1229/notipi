import { Router } from "express";
import {
  getUserProfile,
  login,
  signup,
  updateUserPlan,
} from "../controllers/user.controller.js";
import { checkAuth } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.post("/login", login);
userRouter.post("/signup", signup);
userRouter.get("/", checkAuth, getUserProfile);
userRouter.patch("/plan", checkAuth, updateUserPlan); 

export default userRouter;
