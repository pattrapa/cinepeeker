import mongoose, { Schema, type HydratedDocument, type Model } from "mongoose";

export type AuthProvider = "credentials" | "google";

export interface IUser {
  username: string;
  usernameKey: string;
  email: string;
  passwordHash?: string;
  image?: string;
  providers: AuthProvider[];
  legacyRecipesClaimed: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, "Username is required."],
      trim: true,
      minlength: [3, "Username must contain at least 3 characters."],
      maxlength: [30, "Username cannot exceed 30 characters."],
    },

    usernameKey: {
      type: String,
      required: true,
      unique: true,
      select: false,
      trim: true,
      lowercase: true,
    },

    email: {
  type: String,
  required: [
    true,
    "Email is required.",
  ],
  unique: true,
  trim: true,
  lowercase: true,
},

    passwordHash: {
      type: String,
      select: false,
    },

    image: {
      type: String,
      trim: true,
      default: "",
    },

    providers: {
      type: [String],
      enum: ["credentials", "google"],
      default: [],
    },

    legacyRecipesClaimed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,

    toJSON: {
      transform(_document, returnedObject) {
        const safeObject = returnedObject as Record<string, unknown>;

        delete safeObject.passwordHash;
        delete safeObject.usernameKey;

        return safeObject;
      },
    },
  },
);

const UserModel: Model<IUser> =
  (mongoose.models.User as Model<IUser> | undefined) ??
  mongoose.model<IUser>("User", userSchema);

export type UserDocument = HydratedDocument<IUser>;

export default UserModel;
