import type {
  Request,
  Response,
} from "express";
import mongoose from "mongoose";

import RecipeModel, {
  type IRecipe,
} from "../models/Recipe";

type CreateRecipeBody = Partial<IRecipe>;
type RecipeParams = {
  id: string;
};

type UpdateRecipeBody = Partial<IRecipe>;

export async function getRecipeById(
  request: Request<RecipeParams>,
  response: Response,
): Promise<void> {
  try {
    const { id } = request.params;

    if (!mongoose.isValidObjectId(id)) {
      response.status(400).json({
        success: false,
        message: "Invalid recipe ID.",
      });

      return;
    }

    const recipe = await RecipeModel.findById(id);

    if (!recipe) {
      response.status(404).json({
        success: false,
        message: "Recipe not found.",
      });

      return;
    }

    response.status(200).json({
      success: true,
      data: recipe,
    });
  } catch (error) {
    console.error("Unable to get recipe:", error);

    response.status(500).json({
      success: false,
      message: "Unable to load recipe.",
    });
  }
}

export async function updateRecipe(
  request: Request<
    RecipeParams,
    unknown,
    UpdateRecipeBody
  >,
  response: Response,
): Promise<void> {
  try {
    const { id } = request.params;
    const body = request.body;

    if (!mongoose.isValidObjectId(id)) {
      response.status(400).json({
        success: false,
        message: "Invalid recipe ID.",
      });

      return;
    }

    const updateData: Record<string, unknown> = {};

    if (typeof body.title === "string") {
      updateData.title = body.title.trim();
    }

    if (typeof body.category === "string") {
      updateData.category = body.category.trim();
    }

    if (body.timeMinutes !== undefined) {
      updateData.timeMinutes = body.timeMinutes;
    }

    if (body.difficulty !== undefined) {
      updateData.difficulty = body.difficulty;
    }

    if (body.servings !== undefined) {
      updateData.servings = body.servings;
    }

    if (typeof body.description === "string") {
      updateData.description =
        body.description.trim();
    }

    if (typeof body.imageUrl === "string") {
      updateData.imageUrl = body.imageUrl.trim();
    }

    if (body.ingredients !== undefined) {
      updateData.ingredients = cleanStringArray(
        body.ingredients,
      );
    }

    if (body.steps !== undefined) {
      updateData.steps = cleanStringArray(
        body.steps,
      );
    }

    if (typeof body.authorName === "string") {
      updateData.authorName =
        body.authorName.trim();
    }

    if (Object.keys(updateData).length === 0) {
      response.status(400).json({
        success: false,
        message: "No recipe fields were provided.",
      });

      return;
    }

    const updatedRecipe =
      await RecipeModel.findByIdAndUpdate(
        id,
        updateData,
        {
          returnDocument: "after",
          runValidators: true,
        },
      );

    if (!updatedRecipe) {
      response.status(404).json({
        success: false,
        message: "Recipe not found.",
      });

      return;
    }

    response.status(200).json({
      success: true,
      message: "Recipe updated successfully.",
      data: updatedRecipe,
    });
  } catch (error) {
    console.error("Unable to update recipe:", error);

    if (
      error instanceof
      mongoose.Error.ValidationError
    ) {
      const validationErrors = Object.values(
        error.errors,
      ).map((validationError) => {
        return validationError.message;
      });

      response.status(400).json({
        success: false,
        message: "Invalid recipe data.",
        errors: validationErrors,
      });

      return;
    }

    response.status(500).json({
      success: false,
      message: "Unable to update recipe.",
    });
  }
}

export async function deleteRecipe(
  request: Request<RecipeParams>,
  response: Response,
): Promise<void> {
  try {
    const { id } = request.params;

    if (!mongoose.isValidObjectId(id)) {
      response.status(400).json({
        success: false,
        message: "Invalid recipe ID.",
      });

      return;
    }

    const deletedRecipe =
      await RecipeModel.findByIdAndDelete(id);

    if (!deletedRecipe) {
      response.status(404).json({
        success: false,
        message: "Recipe not found.",
      });

      return;
    }

    response.status(200).json({
      success: true,
      message: "Recipe deleted successfully.",
      data: deletedRecipe,
    });
  } catch (error) {
    console.error("Unable to delete recipe:", error);

    response.status(500).json({
      success: false,
      message: "Unable to delete recipe.",
    });
  }
}

function cleanStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item): item is string =>
        typeof item === "string",
    )
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export async function getRecipes(
  _request: Request,
  response: Response,
): Promise<void> {
  try {
    const recipes = await RecipeModel.find()
      .sort({ createdAt: -1 });

    response.status(200).json({
      success: true,
      count: recipes.length,
      data: recipes,
    });
  } catch (error) {
    console.error("Unable to get recipes:", error);

    response.status(500).json({
      success: false,
      message: "Unable to load recipes.",
    });
  }
}

export async function createRecipe(
  request: Request<
    Record<string, never>,
    unknown,
    CreateRecipeBody
  >,
  response: Response,
): Promise<void> {
  try {
    const body = request.body;

    const recipe = await RecipeModel.create({
      title: body.title?.trim(),
      category: body.category?.trim(),
      timeMinutes: body.timeMinutes,
      difficulty: body.difficulty,
      servings: body.servings,
      description: body.description?.trim(),
      imageUrl: body.imageUrl?.trim(),

      ingredients: cleanStringArray(
        body.ingredients,
      ),

      steps: cleanStringArray(body.steps),

      authorName:
        body.authorName?.trim() ||
        "RecipePeeker User",
    });

    response.status(201).json({
      success: true,
      message: "Recipe created successfully.",
      data: recipe,
    });
  } catch (error) {
    console.error("Unable to create recipe:", error);

    if (
      error instanceof
      mongoose.Error.ValidationError
    ) {
      const validationErrors = Object.values(
        error.errors,
      ).map((validationError) => {
        return validationError.message;
      });

      response.status(400).json({
        success: false,
        message: "Invalid recipe data.",
        errors: validationErrors,
      });

      return;
    }

    response.status(500).json({
      success: false,
      message: "Unable to create recipe.",
    });
  }
}