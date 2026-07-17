import type {
  Request,
  Response,
} from "express";

import mongoose from "mongoose";

import RecipeModel from "../models/Recipe";

import SavedRecipeModel, {
  type SavedRecipeStatus,
} from "../models/SavedRecipe";

type RecipeParams = {
  recipeId: string;
};

type UpdateSavedRecipeBody = {
  status?: unknown;
};

/*
 * GET /api/saved-recipes
 *
 * โหลดสูตรที่ User ปัจจุบันบันทึกไว้
 */
export async function getMySavedRecipes(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    if (!request.user) {
      response.status(401).json({
        success: false,

        message:
          "You must login before viewing saved recipes.",
      });

      return;
    }

    const savedDocuments =
      await SavedRecipeModel.find({
        userId:
          request.user.id,
      })
        .sort({
          createdAt: -1,
        })
        .lean();

    if (
      savedDocuments.length === 0
    ) {
      response.status(200).json({
        success: true,
        count: 0,
        data: [],
      });

      return;
    }

    const recipeIds =
      savedDocuments.map(
        (savedDocument) =>
          savedDocument.recipeId,
      );

    const recipes =
      await RecipeModel.find({
        _id: {
          $in: recipeIds,
        },
      }).lean();

    const recipeMap =
      new Map(
        recipes.map((recipe) => [
          recipe._id.toString(),
          recipe,
        ]),
      );

    const orphanSavedRecipeIds:
      mongoose.Types.ObjectId[] = [];

    const data =
      savedDocuments.flatMap(
        (savedDocument) => {
          const recipe =
            recipeMap.get(
              savedDocument.recipeId.toString(),
            );

          /*
           * กรณี Recipe ถูกลบแล้ว
           * ไม่ส่ง Saved Recipe กำพร้ากลับไป
           */
          if (!recipe) {
            orphanSavedRecipeIds.push(
              savedDocument._id,
            );

            return [];
          }

          return [
            {
              _id:
                savedDocument._id,

              status:
                savedDocument.status,

              createdAt:
                savedDocument.createdAt,

              updatedAt:
                savedDocument.updatedAt,

              recipe,
            },
          ];
        },
      );

    /*
     * ล้าง Saved Recipe ที่สูตรจริง
     * ถูกลบไปแล้ว
     */
    if (
      orphanSavedRecipeIds.length >
      0
    ) {
      await SavedRecipeModel.deleteMany({
        _id: {
          $in:
            orphanSavedRecipeIds,
        },
      });
    }

    response.status(200).json({
      success: true,

      count:
        data.length,

      data,
    });
  } catch (error) {
    console.error(
      "Unable to get saved recipes:",
      error,
    );

    response.status(500).json({
      success: false,

      message:
        "Unable to load saved recipes.",
    });
  }
}

/*
 * GET /api/saved-recipes/check/:recipeId
 *
 * ตรวจว่าสูตรนี้ถูกบันทึกไว้หรือยัง
 */
export async function checkSavedRecipe(
  request: Request<RecipeParams>,
  response: Response,
): Promise<void> {
  try {
    if (!request.user) {
      response.status(401).json({
        success: false,

        message:
          "You must login before checking saved recipes.",
      });

      return;
    }

    const { recipeId } =
      request.params;

    if (
      !mongoose.isValidObjectId(
        recipeId,
      )
    ) {
      response.status(400).json({
        success: false,

        message:
          "Invalid recipe ID.",
      });

      return;
    }

    const savedRecipe =
      await SavedRecipeModel.findOne({
        userId:
          request.user.id,

        recipeId,
      });

    response.status(200).json({
      success: true,

      isSaved:
        Boolean(savedRecipe),

      data:
        savedRecipe,
    });
  } catch (error) {
    console.error(
      "Unable to check saved recipe:",
      error,
    );

    response.status(500).json({
      success: false,

      message:
        "Unable to check the saved recipe.",
    });
  }
}

/*
 * POST /api/saved-recipes/:recipeId
 *
 * บันทึก Recipe เข้า Collection
 */
export async function saveRecipe(
  request: Request<RecipeParams>,
  response: Response,
): Promise<void> {
  try {
    if (!request.user) {
      response.status(401).json({
        success: false,

        message:
          "You must login before saving a recipe.",
      });

      return;
    }

    const { recipeId } =
      request.params;

    if (
      !mongoose.isValidObjectId(
        recipeId,
      )
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
        recipeId,
      );

    if (!recipe) {
      response.status(404).json({
        success: false,

        message:
          "Recipe not found.",
      });

      return;
    }

    const existingSavedRecipe =
      await SavedRecipeModel.findOne({
        userId:
          request.user.id,

        recipeId,
      });

    if (existingSavedRecipe) {
      response.status(200).json({
        success: true,

        message:
          "Recipe is already saved.",

        data:
          existingSavedRecipe,
      });

      return;
    }

    const savedRecipe =
      await SavedRecipeModel.create({
        userId:
          request.user.id,

        recipeId,

        status:
          "Want to Watch",
      });

    response.status(201).json({
      success: true,

      message:
        "Recipe saved successfully.",

      data:
        savedRecipe,
    });
  } catch (error) {
    console.error(
      "Unable to save recipe:",
      error,
    );

    if (
      isDuplicateKeyError(
        error,
      )
    ) {
      response.status(409).json({
        success: false,

        message:
          "This recipe is already saved.",
      });

      return;
    }

    if (
      error instanceof
      mongoose.Error.ValidationError
    ) {
      response.status(400).json({
        success: false,

        message:
          "Invalid saved recipe data.",

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
        "Unable to save the recipe.",
    });
  }
}

/*
 * PATCH /api/saved-recipes/:recipeId
 *
 * เปลี่ยนสถานะการทำอาหาร
 */
export async function updateSavedRecipe(
  request: Request<
    RecipeParams,
    unknown,
    UpdateSavedRecipeBody
  >,
  response: Response,
): Promise<void> {
  try {
    if (!request.user) {
      response.status(401).json({
        success: false,

        message:
          "You must login before updating a saved recipe.",
      });

      return;
    }

    const { recipeId } =
      request.params;

    if (
      !mongoose.isValidObjectId(
        recipeId,
      )
    ) {
      response.status(400).json({
        success: false,

        message:
          "Invalid recipe ID.",
      });

      return;
    }

    const status =
      parseSavedRecipeStatus(
        request.body.status,
      );

    if (!status) {
      response.status(400).json({
        success: false,

        message:
          "Status must be Want to Watch, Watched or Favorite.",
      });

      return;
    }

    const savedRecipe =
      await SavedRecipeModel.findOne({
        userId:
          request.user.id,

        recipeId,
      });

    if (!savedRecipe) {
      response.status(404).json({
        success: false,

        message:
          "Saved recipe not found.",
      });

      return;
    }

    savedRecipe.status =
      status;

    await savedRecipe.save();

    response.status(200).json({
      success: true,

      message:
        "Saved recipe status updated successfully.",

      data:
        savedRecipe,
    });
  } catch (error) {
    console.error(
      "Unable to update saved recipe:",
      error,
    );

    if (
      error instanceof
      mongoose.Error.ValidationError
    ) {
      response.status(400).json({
        success: false,

        message:
          "Invalid saved recipe data.",

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
        "Unable to update the saved recipe.",
    });
  }
}

/*
 * DELETE /api/saved-recipes/:recipeId
 *
 * นำ Recipe ออกจาก Saved Recipes
 */
export async function removeSavedRecipe(
  request: Request<RecipeParams>,
  response: Response,
): Promise<void> {
  try {
    if (!request.user) {
      response.status(401).json({
        success: false,

        message:
          "You must login before removing a saved recipe.",
      });

      return;
    }

    const { recipeId } =
      request.params;

    if (
      !mongoose.isValidObjectId(
        recipeId,
      )
    ) {
      response.status(400).json({
        success: false,

        message:
          "Invalid recipe ID.",
      });

      return;
    }

    const savedRecipe =
      await SavedRecipeModel.findOneAndDelete(
        {
          userId:
            request.user.id,

          recipeId,
        },
      );

    if (!savedRecipe) {
      response.status(404).json({
        success: false,

        message:
          "Saved recipe not found.",
      });

      return;
    }

    response.status(200).json({
      success: true,

      message:
        "Recipe removed from saved recipes.",

      data:
        savedRecipe,
    });
  } catch (error) {
    console.error(
      "Unable to remove saved recipe:",
      error,
    );

    response.status(500).json({
      success: false,

      message:
        "Unable to remove the saved recipe.",
    });
  }
}

function parseSavedRecipeStatus(
  value: unknown,
): SavedRecipeStatus | undefined {
  if (
    value === "Want to Watch" ||
    value === "Watched" ||
    value === "Favorite"
  ) {
    return value;
  }

  return undefined;
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

function isDuplicateKeyError(
  error: unknown,
): error is {
  code: number;
} {
  if (
    typeof error !== "object" ||
    error === null ||
    !("code" in error)
  ) {
    return false;
  }

  return (
    (
      error as {
        code?: unknown;
      }
    ).code === 11000
  );
}