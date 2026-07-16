import { unlink } from "node:fs/promises";
import path from "node:path";

import type {
  Request,
  Response,
} from "express";

import mongoose from "mongoose";

import RecipeModel, {
  type RecipeDifficulty,
} from "../models/Recipe";

type RecipeParams = {
  id: string;
};

type RecipeBody =
  Record<string, unknown>;

const recipeUploadDirectory =
  path.resolve(
    process.cwd(),
    "uploads",
    "recipes",
  );

export async function getRecipes(
  _request: Request,
  response: Response,
): Promise<void> {
  try {
    const recipes =
      await RecipeModel.find()
        .sort({
          createdAt: -1,
        });

    response.status(200).json({
      success: true,
      count: recipes.length,
      data: recipes,
    });
  } catch (error) {
    console.error(
      "Unable to get recipes:",
      error,
    );

    response.status(500).json({
      success: false,
      message:
        "Unable to load recipes.",
    });
  }
}

export async function getMyRecipes(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    if (!request.user) {
      response.status(401).json({
        success: false,
        message:
          "You must login before viewing your recipes.",
      });

      return;
    }

    const recipes =
      await RecipeModel.find({
        ownerId:
          request.user.id,
      }).sort({
        createdAt: -1,
      });

    response.status(200).json({
      success: true,
      count: recipes.length,
      data: recipes,
    });
  } catch (error) {
    console.error(
      "Unable to get user's recipes:",
      error,
    );

    response.status(500).json({
      success: false,
      message:
        "Unable to load your recipes.",
    });
  }
}

export async function getRecipeById(
  request: Request<RecipeParams>,
  response: Response,
): Promise<void> {
  try {
    const { id } =
      request.params;

    if (
      !mongoose.isValidObjectId(id)
    ) {
      response.status(400).json({
        success: false,
        message:
          "Invalid recipe ID.",
      });

      return;
    }

    const recipe =
      await RecipeModel.findById(
        id,
      );

    if (!recipe) {
      response.status(404).json({
        success: false,
        message:
          "Recipe not found.",
      });

      return;
    }

    response.status(200).json({
      success: true,
      data: recipe,
    });
  } catch (error) {
    console.error(
      "Unable to get recipe:",
      error,
    );

    response.status(500).json({
      success: false,
      message:
        "Unable to load recipe.",
    });
  }
}

export async function createRecipe(
  request: Request<
    Record<string, never>,
    unknown,
    RecipeBody
  >,
  response: Response,
): Promise<void> {
  try {
    if (!request.user) {
      await removeUploadedFile(
        request.file?.path,
      );

      response.status(401).json({
        success: false,
        message:
          "You must login before creating a recipe.",
      });

      return;
    }

    const body =
      request.body;

    const uploadedImageUrl =
      request.file
        ? createUploadedImageUrl(
            request,
            request.file.filename,
          )
        : typeof body.imageUrl ===
            "string"
          ? body.imageUrl.trim()
          : "";

    const recipe =
      await RecipeModel.create({
        title:
          readOptionalString(
            body.title,
          ),

        category:
          readOptionalString(
            body.category,
          ),

        timeMinutes:
          parseNumber(
            body.timeMinutes,
          ),

        difficulty:
          parseDifficulty(
            body.difficulty,
          ),

        servings:
          parseNumber(
            body.servings,
          ),

        description:
          readOptionalString(
            body.description,
          ),

        imageUrl:
          uploadedImageUrl,

        ingredients:
          parseStringArray(
            body.ingredients,
          ),

        steps:
          parseStringArray(
            body.steps,
          ),

        /*
         * ห้ามรับ ownerId หรือ authorName
         * จาก Frontend
         */
        ownerId:
          request.user.id,

        authorName:
          request.user.username,
      });

    response.status(201).json({
      success: true,
      message:
        "Recipe created successfully.",
      data: recipe,
    });
  } catch (error) {
    await removeUploadedFile(
      request.file?.path,
    );

    console.error(
      "Unable to create recipe:",
      error,
    );

    if (
      error instanceof
      mongoose.Error.ValidationError
    ) {
      response.status(400).json({
        success: false,
        message:
          "Invalid recipe data.",

        errors:
          getValidationErrors(
            error,
          ),
      });

      return;
    }

    response.status(500).json({
      success: false,
      message:
        "Unable to create recipe.",
    });
  }
}

export async function updateRecipe(
  request: Request<
    RecipeParams,
    unknown,
    RecipeBody
  >,
  response: Response,
): Promise<void> {
  try {
    const { id } =
      request.params;

    if (!request.user) {
      await removeUploadedFile(
        request.file?.path,
      );

      response.status(401).json({
        success: false,
        message:
          "You must login before editing a recipe.",
      });

      return;
    }

    if (
      !mongoose.isValidObjectId(id)
    ) {
      await removeUploadedFile(
        request.file?.path,
      );

      response.status(400).json({
        success: false,
        message:
          "Invalid recipe ID.",
      });

      return;
    }

    const recipe =
      await RecipeModel.findById(
        id,
      );

    if (!recipe) {
      await removeUploadedFile(
        request.file?.path,
      );

      response.status(404).json({
        success: false,
        message:
          "Recipe not found.",
      });

      return;
    }

    const recipeOwnerId =
      recipe.ownerId?.toString();

    if (
      !recipeOwnerId ||
      recipeOwnerId !==
        request.user.id
    ) {
      await removeUploadedFile(
        request.file?.path,
      );

      response.status(403).json({
        success: false,
        message:
          "You can only edit recipes created by your account.",
      });

      return;
    }

    const body =
      request.body;

    const updateData:
      Record<string, unknown> = {};

    if (
      body.title !== undefined
    ) {
      updateData.title =
        readOptionalString(
          body.title,
        );
    }

    if (
      body.category !== undefined
    ) {
      updateData.category =
        readOptionalString(
          body.category,
        );
    }

    if (
      body.timeMinutes !==
      undefined
    ) {
      const timeMinutes =
        parseNumber(
          body.timeMinutes,
        );

      if (
        timeMinutes === undefined
      ) {
        await removeUploadedFile(
          request.file?.path,
        );

        response.status(400).json({
          success: false,
          message:
            "Cooking time must be a valid number.",
        });

        return;
      }

      updateData.timeMinutes =
        timeMinutes;
    }

    if (
      body.difficulty !==
      undefined
    ) {
      const difficulty =
        parseDifficulty(
          body.difficulty,
        );

      if (!difficulty) {
        await removeUploadedFile(
          request.file?.path,
        );

        response.status(400).json({
          success: false,
          message:
            "Difficulty must be Easy, Medium or Hard.",
        });

        return;
      }

      updateData.difficulty =
        difficulty;
    }

    if (
      body.servings !== undefined
    ) {
      const servings =
        parseNumber(
          body.servings,
        );

      if (
        servings === undefined
      ) {
        await removeUploadedFile(
          request.file?.path,
        );

        response.status(400).json({
          success: false,
          message:
            "Servings must be a valid number.",
        });

        return;
      }

      updateData.servings =
        servings;
    }

    if (
      body.description !==
      undefined
    ) {
      updateData.description =
        readOptionalString(
          body.description,
        );
    }

    if (
      body.ingredients !==
      undefined
    ) {
      updateData.ingredients =
        parseStringArray(
          body.ingredients,
        );
    }

    if (
      body.steps !== undefined
    ) {
      updateData.steps =
        parseStringArray(
          body.steps,
        );
    }

    const previousImageUrl =
      recipe.imageUrl;

    if (request.file) {
      updateData.imageUrl =
        createUploadedImageUrl(
          request,
          request.file.filename,
        );
    }

    /*
     * ไม่อนุญาตให้ Frontend แก้:
     * ownerId
     * authorName
     */
    if (
      Object.keys(
        updateData,
      ).length === 0
    ) {
      response.status(400).json({
        success: false,
        message:
          "No recipe fields were provided.",
      });

      return;
    }

    recipe.set(updateData);

    await recipe.save();

    if (
      request.file &&
      previousImageUrl !==
        recipe.imageUrl
    ) {
      await removeLocalRecipeImage(
        previousImageUrl,
      );
    }

    response.status(200).json({
      success: true,
      message:
        "Recipe updated successfully.",
      data: recipe,
    });
  } catch (error) {
    await removeUploadedFile(
      request.file?.path,
    );

    console.error(
      "Unable to update recipe:",
      error,
    );

    if (
      error instanceof
      mongoose.Error.ValidationError
    ) {
      response.status(400).json({
        success: false,
        message:
          "Invalid recipe data.",

        errors:
          getValidationErrors(
            error,
          ),
      });

      return;
    }

    response.status(500).json({
      success: false,
      message:
        "Unable to update recipe.",
    });
  }
}

export async function deleteRecipe(
  request: Request<RecipeParams>,
  response: Response,
): Promise<void> {
  try {
    const { id } =
      request.params;

    if (!request.user) {
      response.status(401).json({
        success: false,
        message:
          "You must login before deleting a recipe.",
      });

      return;
    }

    if (
      !mongoose.isValidObjectId(id)
    ) {
      response.status(400).json({
        success: false,
        message:
          "Invalid recipe ID.",
      });

      return;
    }

    const recipe =
      await RecipeModel.findById(
        id,
      );

    if (!recipe) {
      response.status(404).json({
        success: false,
        message:
          "Recipe not found.",
      });

      return;
    }

    const recipeOwnerId =
      recipe.ownerId?.toString();

    if (
      !recipeOwnerId ||
      recipeOwnerId !==
        request.user.id
    ) {
      response.status(403).json({
        success: false,
        message:
          "You can only delete recipes created by your account.",
      });

      return;
    }

    await recipe.deleteOne();

    await removeLocalRecipeImage(
      recipe.imageUrl,
    );

    response.status(200).json({
      success: true,
      message:
        "Recipe deleted successfully.",
      data: recipe,
    });
  } catch (error) {
    console.error(
      "Unable to delete recipe:",
      error,
    );

    response.status(500).json({
      success: false,
      message:
        "Unable to delete recipe.",
    });
  }
}

function readOptionalString(
  value: unknown,
): string | undefined {
  if (
    typeof value !== "string"
  ) {
    return undefined;
  }

  return value.trim();
}

function cleanStringArray(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (
        item,
      ): item is string =>
        typeof item ===
        "string",
    )
    .map((item) =>
      item.trim(),
    )
    .filter(
      (item) =>
        item.length > 0,
    );
}

function parseStringArray(
  value: unknown,
): string[] {
  if (Array.isArray(value)) {
    return cleanStringArray(
      value,
    );
  }

  if (
    typeof value !== "string"
  ) {
    return [];
  }

  try {
    const parsedValue:
      unknown = JSON.parse(
      value,
    );

    return cleanStringArray(
      parsedValue,
    );
  } catch {
    return value
      .split(/\r?\n/)
      .map((item) =>
        item.trim(),
      )
      .filter(
        (item) =>
          item.length > 0,
      );
  }
}

function parseNumber(
  value: unknown,
): number | undefined {
  const parsedValue =
    Number(value);

  if (
    !Number.isFinite(
      parsedValue,
    )
  ) {
    return undefined;
  }

  return parsedValue;
}

function parseDifficulty(
  value: unknown,
): RecipeDifficulty | undefined {
  if (
    value === "Easy" ||
    value === "Medium" ||
    value === "Hard"
  ) {
    return value;
  }

  return undefined;
}

function createUploadedImageUrl(
  request: Request,
  filename: string,
): string {
  const host =
    request.get("host") ||
    "localhost:5000";

  return `${request.protocol}://${host}/uploads/recipes/${filename}`;
}

function getValidationErrors(
  error:
    mongoose.Error.ValidationError,
): string[] {
  return Object.values(
    error.errors,
  ).map(
    (validationError) =>
      validationError.message,
  );
}

async function removeUploadedFile(
  filePath:
    | string
    | undefined,
): Promise<void> {
  if (!filePath) {
    return;
  }

  try {
    await unlink(filePath);
  } catch (error) {
    console.error(
      "Unable to remove uploaded image:",
      error,
    );
  }
}

async function removeLocalRecipeImage(
  imageUrl: string,
): Promise<void> {
  const filename =
    getLocalRecipeImageFilename(
      imageUrl,
    );

  if (!filename) {
    return;
  }

  const filePath =
    path.resolve(
      recipeUploadDirectory,
      filename,
    );

  try {
    await unlink(filePath);
  } catch (error) {
    const fileError =
      error as NodeJS.ErrnoException;

    if (
      fileError.code !== "ENOENT"
    ) {
      console.error(
        "Unable to remove old recipe image:",
        error,
      );
    }
  }
}

function getLocalRecipeImageFilename(
  imageUrl: string,
): string | null {
  if (!imageUrl) {
    return null;
  }

  try {
    const pathname =
      imageUrl.startsWith(
        "http://",
      ) ||
      imageUrl.startsWith(
        "https://",
      )
        ? new URL(
            imageUrl,
          ).pathname
        : imageUrl;

    const prefix =
      "/uploads/recipes/";

    if (
      !pathname.startsWith(
        prefix,
      )
    ) {
      return null;
    }

    const filename =
      path.basename(
        pathname,
      );

    return filename || null;
  } catch {
    return null;
  }
}