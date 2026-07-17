import mongoose, {
  Schema,
  Types,
  type Model,
} from "mongoose";

export interface IReview {
  recipeId: Types.ObjectId;
  userId: Types.ObjectId;
  username: string;
  text: string;
  rating: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const reviewSchema =
  new Schema<IReview>(
    {
      recipeId: {
        type:
          Schema.Types.ObjectId,

        ref: "Recipe",

        required: [
          true,
          "Recipe ID is required.",
        ],

        immutable: true,
        index: true,
      },

      userId: {
        type:
          Schema.Types.ObjectId,

        ref: "User",

        required: [
          true,
          "User ID is required.",
        ],

        immutable: true,
        index: true,
      },

      username: {
        type: String,

        required: [
          true,
          "Username is required.",
        ],

        trim: true,

        maxlength: [
          30,
          "Username cannot exceed 30 characters.",
        ],
      },

      text: {
        type: String,

        required: [
          true,
          "Review text is required.",
        ],

        trim: true,

        minlength: [
          1,
          "Review text is required.",
        ],

        maxlength: [
          1000,
          "Review cannot exceed 1000 characters.",
        ],
      },

      rating: {
        type: Number,

        required: [
          true,
          "Rating is required.",
        ],

        min: [
          1,
          "Rating must be at least 1.",
        ],

        max: [
          5,
          "Rating cannot exceed 5.",
        ],

        validate: {
          validator(
            value: number,
          ): boolean {
            return Number.isInteger(
              value,
            );
          },

          message:
            "Rating must be a whole number.",
        },
      },
    },
    {
      timestamps: true,
      versionKey: false,

      toJSON: {
        virtuals: true,
      },
    },
  );

/*
 * ผู้ใช้หนึ่งบัญชีสามารถรีวิว
 * สูตรหนึ่งสูตรได้เพียงหนึ่งครั้ง
 */
reviewSchema.index(
  {
    recipeId: 1,
    userId: 1,
  },
  {
    unique: true,

    name:
      "unique_user_review_per_recipe",
  },
);

/*
 * ช่วยให้การค้นหารีวิวของสูตร
 * เรียงจากใหม่ไปเก่าได้เร็วขึ้น
 */
reviewSchema.index({
  recipeId: 1,
  createdAt: -1,
});

const ReviewModel:
  Model<IReview> =
  (mongoose.models.Review as
    | Model<IReview>
    | undefined) ??
  mongoose.model<IReview>(
    "Review",
    reviewSchema,
  );

export default ReviewModel;