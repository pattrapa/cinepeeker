import {
  Router,
} from "express";

import {
  checkSavedRecipe,
  getMySavedRecipes,
  removeSavedRecipe,
  saveRecipe,
  updateSavedRecipe,
} from "../controllers/savedRecipeController";

import {
  authMiddleware,
} from "../middleware/authMiddleware";

const savedRecipeRouter =
  Router();

/*
 * ทุก Route ต้อง Login
 */
savedRecipeRouter.use(
  authMiddleware,
);

/*
 * GET /api/saved-recipes
 */
savedRecipeRouter.get(
  "/",
  getMySavedRecipes,
);

/*
 * ต้องประกาศ /check ก่อน /:recipeId
 */
savedRecipeRouter.get(
  "/check/:recipeId",
  checkSavedRecipe,
);

/*
 * POST /api/saved-recipes/:recipeId
 */
savedRecipeRouter.post(
  "/:recipeId",
  saveRecipe,
);

/*
 * PATCH /api/saved-recipes/:recipeId
 */
savedRecipeRouter.patch(
  "/:recipeId",
  updateSavedRecipe,
);

/*
 * DELETE /api/saved-recipes/:recipeId
 */
savedRecipeRouter.delete(
  "/:recipeId",
  removeSavedRecipe,
);

export default savedRecipeRouter;