import type {
  Request,
  Response,
} from "express";

import mongoose from "mongoose";

import RecipeModel from "../models/Recipe";
import ReviewModel from "../models/Review";

type RecipeReviewParams = {
  recipeId: string;
};

type ReviewParams = {
  id: string;
};

type ReviewBody = {
  text?: unknown;
  rating?: unknown;
};

/*
 * GET /api/reviews/recipe/:recipeId
 *
 * Public Route
 * โหลดรีวิวทั้งหมดของสูตร
 */
export async function getRecipeReviews(
  request: Request<RecipeReviewParams>,
  response: Response,
): Promise<void> {
  try {
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

    const recipeExists =
      await RecipeModel.exists({
        _id: recipeId,
      });

    if (!recipeExists) {
      response.status(404).json({
        success: false,

        message:
          "Recipe not found.",
      });

      return;
    }

    const reviews =
      await ReviewModel.find({
        recipeId,
      }).sort({
        createdAt: -1,
      });

    const reviewCount =
      reviews.length;

    const totalRating =
      reviews.reduce(
        (
          total,
          review,
        ) =>
          total + review.rating,
        0,
      );

    const averageRating =
      reviewCount > 0
        ? Number(
            (
              totalRating /
              reviewCount
            ).toFixed(1),
          )
        : 0;

    response.status(200).json({
      success: true,

      count:
        reviewCount,

      reviewCount,

      averageRating,

      data:
        reviews,
    });
  } catch (error) {
    console.error(
      "Unable to get recipe reviews:",
      error,
    );

    response.status(500).json({
      success: false,

      message:
        "Unable to load reviews.",
    });
  }
}

/*
 * POST /api/reviews/recipe/:recipeId
 *
 * Protected Route
 * สร้างรีวิวใหม่
 */
export async function createReview(
  request: Request<
    RecipeReviewParams,
    unknown,
    ReviewBody
  >,
  response: Response,
): Promise<void> {
  try {
    if (!request.user) {
      response.status(401).json({
        success: false,

        message:
          "You must login before reviewing a recipe.",
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

    const recipeOwnerId =
      recipe.ownerId?.toString();

    /*
     * เจ้าของสูตรไม่สามารถ
     * รีวิวสูตรของตัวเองได้
     */
    if (
      recipeOwnerId &&
      recipeOwnerId ===
        request.user.id
    ) {
      response.status(403).json({
        success: false,

        message:
          "You cannot review your own recipe.",
      });

      return;
    }

    const text =
      readReviewText(
        request.body.text,
      );

    if (!text) {
      response.status(400).json({
        success: false,

        message:
          "Please write your review before submitting.",
      });

      return;
    }

    if (text.length > 1000) {
      response.status(400).json({
        success: false,

        message:
          "Review cannot exceed 1000 characters.",
      });

      return;
    }

    const rating =
      parseRating(
        request.body.rating,
      );

    if (rating === undefined) {
      response.status(400).json({
        success: false,

        message:
          "Rating must be a whole number between 1 and 5.",
      });

      return;
    }

    /*
     * ตรวจสอบก่อนว่า Account นี้
     * เคยรีวิวสูตรนี้แล้วหรือยัง
     */
    const existingReview =
      await ReviewModel.findOne({
        recipeId,

        userId:
          request.user.id,
      });

    if (existingReview) {
      response.status(409).json({
        success: false,

        message:
          "You have already reviewed this recipe. You can edit your existing review.",

        data:
          existingReview,
      });

      return;
    }

    /*
     * userId และ username มาจาก
     * JWT ไม่รับค่าจาก Frontend
     */
    const review =
      await ReviewModel.create({
        recipeId,

        userId:
          request.user.id,

        username:
          request.user.username,

        text,

        rating,
      });

    response.status(201).json({
      success: true,

      message:
        "Review created successfully.",

      data:
        review,
    });
  } catch (error) {
    console.error(
      "Unable to create review:",
      error,
    );

    /*
     * รองรับกรณี Request เข้ามาพร้อมกัน
     * แล้วชน Unique Index ใน MongoDB
     */
    if (
      isDuplicateKeyError(
        error,
      )
    ) {
      response.status(409).json({
        success: false,

        message:
          "You have already reviewed this recipe.",
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
          "Invalid review data.",

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
        "Unable to create review.",
    });
  }
}

/*
 * PATCH /api/reviews/:id
 *
 * Protected Route
 * แก้ไขได้เฉพาะรีวิวของตัวเอง
 */
export async function updateReview(
  request: Request<
    ReviewParams,
    unknown,
    ReviewBody
  >,
  response: Response,
): Promise<void> {
  try {
    if (!request.user) {
      response.status(401).json({
        success: false,

        message:
          "You must login before editing a review.",
      });

      return;
    }

    const { id } =
      request.params;

    if (
      !mongoose.isValidObjectId(
        id,
      )
    ) {
      response.status(400).json({
        success: false,

        message:
          "Invalid review ID.",
      });

      return;
    }

    const review =
      await ReviewModel.findById(
        id,
      );

    if (!review) {
      response.status(404).json({
        success: false,

        message:
          "Review not found.",
      });

      return;
    }

    /*
     * ตรวจสอบว่าเป็นเจ้าของรีวิว
     */
    if (
      review.userId.toString() !==
      request.user.id
    ) {
      response.status(403).json({
        success: false,

        message:
          "You can only edit your own review.",
      });

      return;
    }

    let hasUpdate =
      false;

    if (
      request.body.text !==
      undefined
    ) {
      const text =
        readReviewText(
          request.body.text,
        );

      if (!text) {
        response.status(400).json({
          success: false,

          message:
            "Review text cannot be empty.",
        });

        return;
      }

      if (text.length > 1000) {
        response.status(400).json({
          success: false,

          message:
            "Review cannot exceed 1000 characters.",
        });

        return;
      }

      review.text =
        text;

      hasUpdate =
        true;
    }

    if (
      request.body.rating !==
      undefined
    ) {
      const rating =
        parseRating(
          request.body.rating,
        );

      if (rating === undefined) {
        response.status(400).json({
          success: false,

          message:
            "Rating must be a whole number between 1 and 5.",
        });

        return;
      }

      review.rating =
        rating;

      hasUpdate =
        true;
    }

    if (!hasUpdate) {
      response.status(400).json({
        success: false,

        message:
          "No review fields were provided.",
      });

      return;
    }

    /*
     * ไม่อนุญาตให้ Frontend แก้
     * recipeId, userId หรือ username
     */
    await review.save();

    response.status(200).json({
      success: true,

      message:
        "Review updated successfully.",

      data:
        review,
    });
  } catch (error) {
    console.error(
      "Unable to update review:",
      error,
    );

    if (
      error instanceof
      mongoose.Error.ValidationError
    ) {
      response.status(400).json({
        success: false,

        message:
          "Invalid review data.",

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
        "Unable to update review.",
    });
  }
}

/*
 * DELETE /api/reviews/:id
 *
 * Protected Route
 * ลบได้เฉพาะรีวิวของตัวเอง
 */
export async function deleteReview(
  request: Request<ReviewParams>,
  response: Response,
): Promise<void> {
  try {
    if (!request.user) {
      response.status(401).json({
        success: false,

        message:
          "You must login before deleting a review.",
      });

      return;
    }

    const { id } =
      request.params;

    if (
      !mongoose.isValidObjectId(
        id,
      )
    ) {
      response.status(400).json({
        success: false,

        message:
          "Invalid review ID.",
      });

      return;
    }

    const review =
      await ReviewModel.findById(
        id,
      );

    if (!review) {
      response.status(404).json({
        success: false,

        message:
          "Review not found.",
      });

      return;
    }

    /*
     * ตรวจสอบว่าเป็นเจ้าของรีวิว
     */
    if (
      review.userId.toString() !==
      request.user.id
    ) {
      response.status(403).json({
        success: false,

        message:
          "You can only delete your own review.",
      });

      return;
    }

    await review.deleteOne();

    response.status(200).json({
      success: true,

      message:
        "Review deleted successfully.",

      data:
        review,
    });
  } catch (error) {
    console.error(
      "Unable to delete review:",
      error,
    );

    response.status(500).json({
      success: false,

      message:
        "Unable to delete review.",
    });
  }
}

/*
 * อ่านและทำความสะอาดข้อความรีวิว
 */
function readReviewText(
  value: unknown,
): string | undefined {
  if (
    typeof value !== "string"
  ) {
    return undefined;
  }

  const text =
    value.trim();

  return text || undefined;
}

/*
 * Rating ต้องเป็นเลขจำนวนเต็ม
 * ตั้งแต่ 1 ถึง 5
 */
function parseRating(
  value: unknown,
): number | undefined {
  const rating =
    Number(value);

  if (
    !Number.isInteger(
      rating,
    ) ||
    rating < 1 ||
    rating > 5
  ) {
    return undefined;
  }

  return rating;
}

/*
 * แปลง Mongoose Validation Error
 * เป็น Array ของข้อความ
 */
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

/*
 * ตรวจ Duplicate Key Error
 * จาก MongoDB
 */
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