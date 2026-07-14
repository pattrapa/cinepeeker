import mongoose, {
  Schema,
  type Model,
} from "mongoose";

export type RecipeDifficulty =
  | "Easy"
  | "Medium"
  | "Hard";

export interface IRecipe {
  title: string;
  category: string;
  timeMinutes: number;
  difficulty: RecipeDifficulty;
  servings: number;
  description: string;
  imageUrl: string;
  ingredients: string[];
  steps: string[];
  authorName: string;
}

const recipeSchema = new Schema<IRecipe>(
  {
    title: {
      type: String,
      required: [true, "Recipe title is required."],
      trim: true,
      maxlength: [120, "Recipe title is too long."],
    },

    category: {
      type: String,
      required: [true, "Category is required."],
      trim: true,
    },

    timeMinutes: {
      type: Number,
      required: [true, "Cooking time is required."],
      min: [1, "Cooking time must be at least 1 minute."],
    },

    difficulty: {
      type: String,
      required: [true, "Difficulty is required."],
      enum: {
        values: ["Easy", "Medium", "Hard"],
        message: "Difficulty must be Easy, Medium or Hard.",
      },
    },

    servings: {
      type: Number,
      required: [true, "Servings are required."],
      min: [1, "Servings must be at least 1."],
    },

    description: {
      type: String,
      required: [true, "Description is required."],
      trim: true,
      maxlength: [2000, "Description is too long."],
    },

    imageUrl: {
      type: String,
      required: [true, "Recipe image is required."],
      trim: true,
    },

    ingredients: {
      type: [String],
      required: true,
      validate: {
        validator(values: string[]) {
          return values.length > 0;
        },
        message: "At least one ingredient is required.",
      },
    },

    steps: {
      type: [String],
      required: true,
      validate: {
        validator(values: string[]) {
          return values.length > 0;
        },
        message: "At least one cooking step is required.",
      },
    },

    authorName: {
      type: String,
      trim: true,
      default: "RecipePeeker User",
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

const RecipeModel: Model<IRecipe> =
  (mongoose.models.Recipe as
    | Model<IRecipe>
    | undefined) ??
  mongoose.model<IRecipe>("Recipe", recipeSchema);

export default RecipeModel;