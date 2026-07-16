import {
  Router,
} from "express";

import {
  createRecipe,
  deleteRecipe,
  getMyRecipes,
  getRecipeById,
  getRecipes,
  updateRecipe,
} from "../controllers/recipeController";

import {
  authMiddleware,
} from "../middleware/authMiddleware";

import {
  uploadRecipeImage,
} from "../middleware/uploadRecipeImage";

const recipeRouter =
  Router();

/*
 * Public routes
 */
recipeRouter.get(
  "/",
  getRecipes,
);

/*
 * ต้องวาง /mine ก่อน /:id
 * ไม่อย่างนั้น Express จะมองคำว่า mine เป็น ID
 */
recipeRouter.get(
  "/mine",
  authMiddleware,
  getMyRecipes,
);

recipeRouter.post(
  "/",
  authMiddleware,
  uploadRecipeImage.single(
    "image",
  ),
  createRecipe,
);

recipeRouter.get(
  "/:id",
  getRecipeById,
);

/*
 * รองรับทั้ง PATCH และ PUT
 * เพราะหน้า Edit ปัจจุบันยังส่ง PUT
 */
recipeRouter.patch(
  "/:id",
  authMiddleware,
  uploadRecipeImage.single(
    "image",
  ),
  updateRecipe,
);

recipeRouter.put(
  "/:id",
  authMiddleware,
  uploadRecipeImage.single(
    "image",
  ),
  updateRecipe,
);

recipeRouter.delete(
  "/:id",
  authMiddleware,
  deleteRecipe,
);

export default recipeRouter;