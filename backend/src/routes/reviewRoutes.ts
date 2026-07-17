import {
  Router,
} from "express";

import {
  createReview,
  deleteReview,
  getRecipeReviews,
  updateReview,
} from "../controllers/reviewController";

import {
  authMiddleware,
} from "../middleware/authMiddleware";

const reviewRouter =
  Router();

/*
 * Public Route
 *
 * GET /api/reviews/recipe/:recipeId
 * ดูรีวิวทั้งหมดของสูตร
 */
reviewRouter.get(
  "/recipe/:recipeId",
  getRecipeReviews,
);

/*
 * Protected Route
 *
 * POST /api/reviews/recipe/:recipeId
 * เพิ่มรีวิวใหม่
 */
reviewRouter.post(
  "/recipe/:recipeId",
  authMiddleware,
  createReview,
);

/*
 * Protected Route
 *
 * PATCH /api/reviews/:id
 * แก้ไขรีวิวของตัวเอง
 */
reviewRouter.patch(
  "/:id",
  authMiddleware,
  updateReview,
);

/*
 * Protected Route
 *
 * DELETE /api/reviews/:id
 * ลบรีวิวของตัวเอง
 */
reviewRouter.delete(
  "/:id",
  authMiddleware,
  deleteReview,
);

export default reviewRouter;