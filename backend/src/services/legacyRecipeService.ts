import { env } from "../config/env";
import RecipeModel from "../models/Recipe";
import type {
  UserDocument,
} from "../models/User";

export async function claimLegacyRecipes(
  user: UserDocument,
): Promise<number> {
  if (
    user.email.toLowerCase() !==
    env.legacyRecipeOwnerEmail
  ) {
    return 0;
  }

  if (user.legacyRecipesClaimed) {
    return 0;
  }

  const result =
    await RecipeModel.updateMany(
      {
        $or: [
          {
            ownerId: {
              $exists: false,
            },
          },
          {
            ownerId: null,
          },
        ],
      },
      {
        $set: {
          ownerId:
            user._id,

          authorName:
            user.username,
        },
      },
    );

  user.legacyRecipesClaimed =
    true;

  await user.save();

  console.log(
    `Assigned ${result.modifiedCount} legacy recipes to ${user.email}.`,
  );

  return result.modifiedCount;
}