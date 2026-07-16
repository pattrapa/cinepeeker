import type {
  NextFunction,
  Request,
  Response,
} from "express";

import UserModel from "../models/User";
import {
  verifyAccessToken,
} from "../utils/jwt";

export async function authMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authorizationHeader =
      request.headers.authorization;

    if (
      !authorizationHeader ||
      !authorizationHeader.startsWith(
        "Bearer ",
      )
    ) {
      response.status(401).json({
        success: false,
        message:
          "Authentication token was not found.",
      });

      return;
    }

    const token =
      authorizationHeader
        .slice("Bearer ".length)
        .trim();

    if (!token) {
      response.status(401).json({
        success: false,
        message:
          "Authentication token was not found.",
      });

      return;
    }

    const payload =
      verifyAccessToken(token);

    const user =
      await UserModel.findById(
        payload.userId,
      );

    if (!user) {
      response.status(401).json({
        success: false,
        message:
          "The account associated with this token no longer exists.",
      });

      return;
    }

    request.user = {
      id:
        user._id.toString(),

      username:
        user.username,

      email:
        user.email,

      image:
        user.image || "",
    };

    next();
  } catch (error) {
    console.error(
      "Authentication error:",
      error,
    );

    response.status(401).json({
      success: false,
      message:
        "The authentication token is invalid or has expired.",
    });
  }
}