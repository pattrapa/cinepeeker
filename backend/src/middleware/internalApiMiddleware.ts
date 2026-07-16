import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { env } from "../config/env";

export function internalApiMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  const providedSecret =
    request.headers[
      "x-internal-api-secret"
    ];

  if (
    typeof providedSecret !==
      "string" ||
    providedSecret !==
      env.internalApiSecret
  ) {
    response.status(401).json({
      success: false,
      message:
        "Invalid internal API secret.",
    });

    return;
  }

  next();
}