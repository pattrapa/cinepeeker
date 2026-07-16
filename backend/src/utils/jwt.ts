import jwt, {
  type JwtPayload,
} from "jsonwebtoken";

import { env } from "../config/env";
import type {
  UserDocument,
} from "../models/User";

type AccessTokenPayload = {
  userId: string;
  email: string;
  username: string;
};

export function createAccessToken(
  user: UserDocument,
): string {
  const payload: AccessTokenPayload = {
    userId:
      user._id.toString(),

    email:
      user.email,

    username:
      user.username,
  };

  return jwt.sign(
    payload,
    env.jwtSecret,
    {
      expiresIn:
        60 * 60 * 24 * 7,
    },
  );
}

export function verifyAccessToken(
  token: string,
): AccessTokenPayload {
  const decoded = jwt.verify(
    token,
    env.jwtSecret,
  ) as JwtPayload &
    Partial<AccessTokenPayload>;

  if (
    !decoded.userId ||
    !decoded.email ||
    !decoded.username
  ) {
    throw new Error(
      "Invalid access token payload.",
    );
  }

  return {
    userId:
      decoded.userId,

    email:
      decoded.email,

    username:
      decoded.username,
  };
}