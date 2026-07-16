import bcrypt from "bcryptjs";

import type { Request, Response } from "express";

import mongoose from "mongoose";

import UserModel, {
  type AuthProvider,
  type UserDocument,
} from "../models/User";

import { claimLegacyRecipes } from "../services/legacyRecipeService";

import { createAccessToken } from "../utils/jwt";

type RegisterBody = {
  username?: unknown;
  email?: unknown;
  password?: unknown;
};

type LoginBody = {
  email?: unknown;
  password?: unknown;
};

type GoogleSyncBody = {
  name?: unknown;
  email?: unknown;
  image?: unknown;
};

type PublicUser = {
  id: string;
  username: string;
  name: string;
  email: string;
  image: string;
  providers: AuthProvider[];
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function register(
  request: Request<unknown, unknown, RegisterBody>,
  response: Response,
): Promise<void> {
  try {
    const username = readString(request.body.username);

    const email = normalizeEmail(request.body.email);

    const password =
      typeof request.body.password === "string" ? request.body.password : "";

    const validationErrors: string[] = [];

    if (username.length < 3 || username.length > 30) {
      validationErrors.push(
        "Username must contain between 3 and 30 characters.",
      );
    }

    if (!emailPattern.test(email)) {
      validationErrors.push("Please enter a valid email address.");
    }

    if (password.length < 6) {
      validationErrors.push("Password must contain at least 6 characters.");
    }

    if (validationErrors.length > 0) {
      response.status(400).json({
        success: false,
        message: "Invalid registration data.",
        errors: validationErrors,
      });

      return;
    }

    const usernameKey = normalizeUsernameKey(username);

    const existingByEmail = await UserModel.findOne({
      email,
    }).select("+passwordHash +usernameKey");

    const existingByUsername = await UserModel.findOne({
      usernameKey,
    }).select("+usernameKey");

    /*
     * มี Google Account อีเมลนี้อยู่แล้ว
     * แต่ยังไม่มี Password
     *
     * ให้รวม Credentials เข้า User เดิม
     */
    if (existingByEmail) {
      if (
        existingByEmail.passwordHash ||
        existingByEmail.providers.includes("credentials")
      ) {
        response.status(409).json({
          success: false,
          message: "This email address is already registered.",
        });

        return;
      }

      if (
        existingByUsername &&
        existingByUsername._id.toString() !== existingByEmail._id.toString()
      ) {
        response.status(409).json({
          success: false,
          message: "This username is already being used.",
        });

        return;
      }

      const passwordHash = await bcrypt.hash(password, 12);

      existingByEmail.username = username;

      existingByEmail.usernameKey = usernameKey;

      existingByEmail.passwordHash = passwordHash;

      if (!existingByEmail.providers.includes("credentials")) {
        existingByEmail.providers.push("credentials");
      }

      await existingByEmail.save();

      response.status(200).json({
        success: true,
        message: "Password login was added to your existing account.",

        data: {
          user: toPublicUser(existingByEmail),
        },
      });

      return;
    }

    if (existingByUsername) {
      response.status(409).json({
        success: false,
        message: "This username is already being used.",
      });

      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await UserModel.create({
      username,
      usernameKey,
      email,
      passwordHash,

      providers: ["credentials"],

      legacyRecipesClaimed: false,
    });

    response.status(201).json({
      success: true,
      message: "Account created successfully.",

      data: {
        user: toPublicUser(user),
      },
    });
  } catch (error) {
    console.error("Unable to register user:", error);

    if (isDuplicateKeyError(error)) {
      response.status(409).json({
        success: false,
        message: "The email or username is already registered.",
      });

      return;
    }

    if (error instanceof mongoose.Error.ValidationError) {
      response.status(400).json({
        success: false,
        message: "Invalid registration data.",

        errors: Object.values(error.errors).map(
          (validationError) => validationError.message,
        ),
      });

      return;
    }

    response.status(500).json({
      success: false,
      message: "Unable to create the account.",
    });
  }
}

export async function login(
  request: Request<unknown, unknown, LoginBody>,
  response: Response,
): Promise<void> {
  try {
    const email = normalizeEmail(request.body.email);

    const password =
      typeof request.body.password === "string" ? request.body.password : "";

    if (!emailPattern.test(email) || !password) {
      response.status(400).json({
        success: false,
        message: "Please enter your email and password.",
      });

      return;
    }

    const user = await UserModel.findOne({
      email,
    }).select("+passwordHash");

    if (!user || !user.passwordHash) {
      response.status(401).json({
        success: false,
        message: "Email or password is incorrect.",
      });

      return;
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      response.status(401).json({
        success: false,
        message: "Email or password is incorrect.",
      });

      return;
    }

    if (!user.providers.includes("credentials")) {
      user.providers.push("credentials");
    }

    await user.save();

    const migratedRecipeCount = await claimLegacyRecipes(user);

    const accessToken = createAccessToken(user);

    response.status(200).json({
      success: true,
      message: "Login successful.",

      data: {
        user: toPublicUser(user),

        accessToken,
        migratedRecipeCount,
      },
    });
  } catch (error) {
    console.error("Unable to login:", error);

    response.status(500).json({
      success: false,
      message: "Unable to login.",
    });
  }
}

export async function syncGoogleUser(
  request: Request<unknown, unknown, GoogleSyncBody>,
  response: Response,
): Promise<void> {
  try {
    const email = normalizeEmail(request.body.email);

    const providedName = readString(request.body.name);

    const image = readString(request.body.image);

    if (!emailPattern.test(email)) {
      response.status(400).json({
        success: false,
        message: "A valid Google email is required.",
      });

      return;
    }

    let user = await UserModel.findOne({
      email,
    });

    if (!user) {
      const username = await createUniqueUsername(
        providedName || email.split("@")[0],
      );

      user = await UserModel.create({
        username,

        usernameKey: normalizeUsernameKey(username),

        email,
        image,

        providers: ["google"],

        legacyRecipesClaimed: false,
      });
    } else {
      let changed = false;

      if (!user.providers.includes("google")) {
        user.providers.push("google");

        changed = true;
      }

      if (!user.image && image) {
        user.image = image;
        changed = true;
      }

      if (changed) {
        await user.save();
      }
    }

    const migratedRecipeCount = await claimLegacyRecipes(user);

    const accessToken = createAccessToken(user);

    response.status(200).json({
      success: true,
      message: "Google account synchronized successfully.",

      data: {
        user: toPublicUser(user),

        accessToken,
        migratedRecipeCount,
      },
    });
  } catch (error) {
    console.error("Unable to synchronize Google user:", error);

    response.status(500).json({
      success: false,
      message: "Unable to synchronize the Google account.",
    });
  }
}

export async function getMe(
  request: Request,
  response: Response,
): Promise<void> {
  if (!request.user) {
    response.status(401).json({
      success: false,
      message: "You are not authenticated.",
    });

    return;
  }

  response.status(200).json({
    success: true,

    data: {
      user: {
        id: request.user.id,

        username: request.user.username,

        name: request.user.username,

        email: request.user.email,

        image: request.user.image,
      },
    },
  });
}

function toPublicUser(user: UserDocument): PublicUser {
  return {
    id: user._id.toString(),

    username: user.username,

    name: user.username,

    email: user.email,

    image: user.image || "",

    providers: user.providers,
  };
}

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeEmail(value: unknown): string {
  return readString(value).toLowerCase();
}

function normalizeUsernameKey(username: string): string {
  return username.trim().toLocaleLowerCase();
}

async function createUniqueUsername(preferredName: string): Promise<string> {
  let baseUsername = preferredName.trim().replace(/\s+/g, " ");

  if (baseUsername.length < 3) {
    baseUsername = `user_${baseUsername}`;
  }

  baseUsername = baseUsername.slice(0, 24).trim();

  if (baseUsername.length < 3) {
    baseUsername = "RecipePeeker User";
  }

  let candidate = baseUsername;

  let suffix = 1;

  while (
    await UserModel.exists({
      usernameKey: normalizeUsernameKey(candidate),
    })
  ) {
    const suffixText = String(suffix);

    candidate = `${baseUsername.slice(0, 30 - suffixText.length)}${suffixText}`;

    suffix += 1;
  }

  return candidate;
}

function isDuplicateKeyError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  return "code" in error && error.code === 11000;
}
