import mongoose, {
  Schema,
  Types,
  type Model,
} from "mongoose";

export type SavedRecipeStatus =
  | "Want to Watch"
  | "Watched"
  | "Favorite";

export interface ISavedRecipe {
  userId: Types.ObjectId;
  recipeId: Types.ObjectId;
  status: SavedRecipeStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

const savedRecipeSchema =
  new Schema<ISavedRecipe>(
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",

        required: [
          true,
          "User ID is required.",
        ],

        immutable: true,
        index: true,
      },

      recipeId: {
        type: Schema.Types.ObjectId,
        ref: "Recipe",

        required: [
          true,
          "Recipe ID is required.",
        ],

        immutable: true,
        index: true,
      },

      status: {
        type: String,

        enum: {
          values: [
            "Want to Watch",
            "Watched",
            "Favorite",
          ],

          message:
            "Invalid saved recipe status.",
        },

        default:
          "Want to Watch",

        required: true,
      },
    },
    {
      timestamps: true,
      versionKey: false,
    },
  );

/*
 * ผู้ใช้หนึ่งบัญชีบันทึกสูตรเดิม
 * ซ้ำได้เพียงหนึ่งครั้ง
 */
savedRecipeSchema.index(
  {
    userId: 1,
    recipeId: 1,
  },
  {
    unique: true,

    name:
      "unique_saved_recipe_per_user",
  },
);

savedRecipeSchema.index({
  userId: 1,
  createdAt: -1,
});

const SavedRecipeModel:
  Model<ISavedRecipe> =
  (mongoose.models
    .SavedRecipe as
    | Model<ISavedRecipe>
    | undefined) ??
  mongoose.model<ISavedRecipe>(
    "SavedRecipe",
    savedRecipeSchema,
  );

export default SavedRecipeModel;