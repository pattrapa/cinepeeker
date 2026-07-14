import { Router } from "express";

import {
  createRecipe,
  deleteRecipe,
  getRecipeById,
  getRecipes,
  updateRecipe,
} from "../controllers/recipeController";

import { uploadRecipeImage } from "../middleware/uploadRecipeImage";

const recipeRouter = Router();

recipeRouter.get("/", getRecipes);

recipeRouter.post(
  "/",
  uploadRecipeImage.single("image"),
  createRecipe,
);

recipeRouter.get("/:id", getRecipeById);
recipeRouter.patch("/:id", updateRecipe);
recipeRouter.delete("/:id", deleteRecipe);

export default recipeRouter;