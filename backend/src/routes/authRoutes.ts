import { Router } from "express";

import {
  getMe,
  login,
  register,
  syncGoogleUser,
} from "../controllers/authController";

import {
  authMiddleware,
} from "../middleware/authMiddleware";

import {
  internalApiMiddleware,
} from "../middleware/internalApiMiddleware";

const authRouter = Router();

authRouter.post(
  "/register",
  register,
);

authRouter.post(
  "/login",
  login,
);

authRouter.post(
  "/google",
  internalApiMiddleware,
  syncGoogleUser,
);

authRouter.get(
  "/me",
  authMiddleware,
  getMe,
);

export default authRouter;