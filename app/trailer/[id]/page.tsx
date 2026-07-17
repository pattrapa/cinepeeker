"use client";

import type {
  CSSProperties,
  FormEvent,
} from "react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import { useSession } from "next-auth/react";

import {
  ArrowLeft,
  ChefHat,
  Clock3,
  CookingPot,
  Heart,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Star,
  Trash2,
  UsersRound,
  X,
} from "lucide-react";

type Recipe = {
  _id: string;
  ownerId?: string;
  title: string;
  category: string;
  timeMinutes: number;
  difficulty:
  | "Easy"
  | "Medium"
  | "Hard";
  servings: number;
  description: string;
  imageUrl: string;
  ingredients: string[];
  steps: string[];
  authorName: string;
  createdAt?: string;
  updatedAt?: string;
};

type RecipeResponse = {
  success: boolean;
  message?: string;
  data?: Recipe;
};

type SavedRecipeApiResponse = {
  success: boolean;
  message?: string;
  isSaved?: boolean;

  data?: {
    _id: string;
    userId: string;
    recipeId: string;

    status:
    | "Want to Watch"
    | "Watched"
    | "Favorite";

    createdAt?: string;
    updatedAt?: string;
  } | null;
};

type Review = {
  _id: string;
  recipeId: string;
  userId: string;
  username: string;
  text: string;
  rating: number;
  createdAt?: string;
  updatedAt?: string;
};

type ReviewsResponse = {
  success: boolean;
  message?: string;
  count?: number;
  reviewCount?: number;
  averageRating?: number;
  data?: Review[];
};

type ReviewMutationResponse = {
  success: boolean;
  message?: string;
  errors?: string[];
  data?: Review;
};

type MessageType =
  | "success"
  | "error"
  | "";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000";

async function readSavedRecipeResponse(
  response: Response,
): Promise<SavedRecipeApiResponse> {
  const responseText =
    await response.text();

  try {
    return JSON.parse(
      responseText,
    ) as SavedRecipeApiResponse;
  } catch {
    throw new Error(
      responseText ||
      "The server returned an invalid response.",
    );
  }
}

async function parseJsonResponse<T>(
  response: Response,
): Promise<T> {
  const responseText =
    await response.text();

  try {
    return JSON.parse(
      responseText,
    ) as T;
  } catch {
    throw new Error(
      responseText ||
      "The server returned an invalid response.",
    );
  }
}

function formatReviewDate(
  dateValue?: string,
): string {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  return date.toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );
}

export default function RecipeDetailPage() {
  const params = useParams<{
    id: string;
  }>();

  const router = useRouter();

  const {
    data: session,
    status: sessionStatus,
  } = useSession();

  const accessToken =
    session?.accessToken;

  const isLoggedIn =
    sessionStatus ===
    "authenticated";

  const recipeId = params.id;
  const currentUserId =
    session?.user?.id;

  const [recipe, setRecipe] =
    useState<Recipe | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [isSaved, setIsSaved] =
    useState(false);

  const [
    isCheckingSaved,
    setIsCheckingSaved,
  ] = useState(false);

  const [
    isChangingSaved,
    setIsChangingSaved,
  ] = useState(false);

  const [
    savedRecipeMessage,
    setSavedRecipeMessage,
  ] = useState("");

  const [reviews, setReviews] =
    useState<Review[]>([]);

  const [
    isLoadingReviews,
    setIsLoadingReviews,
  ] = useState(true);

  const [
    reviewsError,
    setReviewsError,
  ] = useState("");

  const [
    reviewCount,
    setReviewCount,
  ] = useState(0);

  const [
    averageRating,
    setAverageRating,
  ] = useState(0);

  const [
    reviewText,
    setReviewText,
  ] = useState("");

  const [
    reviewRating,
    setReviewRating,
  ] = useState(5);

  const [
    reviewMessage,
    setReviewMessage,
  ] = useState("");

  const [
    reviewMessageType,
    setReviewMessageType,
  ] = useState<MessageType>("");

  const [
    isSubmittingReview,
    setIsSubmittingReview,
  ] = useState(false);

  const [
    editingReviewId,
    setEditingReviewId,
  ] = useState<string | null>(
    null,
  );

  const [
    editReviewText,
    setEditReviewText,
  ] = useState("");

  const [
    editReviewRating,
    setEditReviewRating,
  ] = useState(5);

  const [
    isUpdatingReview,
    setIsUpdatingReview,
  ] = useState(false);

  const [
    deletingReviewId,
    setDeletingReviewId,
  ] = useState<string | null>(
    null,
  );

  const isRecipeOwner =
    Boolean(
      recipe?.ownerId &&
      currentUserId &&
      String(recipe.ownerId) ===
      String(currentUserId),
    );

  const myReview =
    useMemo(
      () =>
        reviews.find(
          (review) =>
            currentUserId &&
            String(review.userId) ===
            String(currentUserId),
        ) ?? null,
      [
        currentUserId,
        reviews,
      ],
    );

  const loadRecipe =
    useCallback(
      async (): Promise<void> => {
        if (!recipeId) {
          setErrorMessage(
            "Recipe ID is missing.",
          );

          setIsLoading(false);
          return;
        }

        try {
          setIsLoading(true);
          setErrorMessage("");
          setRecipe(null);

          const response =
            await fetch(
              `${API_URL}/api/recipes/${recipeId}`,
              {
                method: "GET",
                cache: "no-store",
              },
            );

          const result =
            await parseJsonResponse<
              RecipeResponse
            >(response);

          if (
            !response.ok ||
            !result.success
          ) {
            throw new Error(
              result.message ||
              "Unable to load this recipe.",
            );
          }

          if (!result.data) {
            throw new Error(
              "Recipe data was not found.",
            );
          }

          const loadedRecipe =
            result.data;

          setRecipe(loadedRecipe,);

        } catch (error) {
          console.error(
            "Unable to load recipe:",
            error,
          );

          setRecipe(null);

          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load this recipe.",
          );
        } finally {
          setIsLoading(false);
        }
      },
      [recipeId],
    );

  const loadReviews =
    useCallback(
      async (): Promise<void> => {
        if (!recipeId) {
          setReviews([]);
          setReviewCount(0);
          setAverageRating(0);
          setIsLoadingReviews(false);
          return;
        }

        try {
          setIsLoadingReviews(true);
          setReviewsError("");

          const response =
            await fetch(
              `${API_URL}/api/reviews/recipe/${recipeId}`,
              {
                method: "GET",
                cache: "no-store",
              },
            );

          const result =
            await parseJsonResponse<
              ReviewsResponse
            >(response);

          if (
            !response.ok ||
            !result.success
          ) {
            throw new Error(
              result.message ||
              "Unable to load reviews.",
            );
          }

          const loadedReviews =
            Array.isArray(
              result.data,
            )
              ? result.data
              : [];

          setReviews(
            loadedReviews,
          );

          setReviewCount(
            typeof result.reviewCount ===
              "number"
              ? result.reviewCount
              : loadedReviews.length,
          );

          setAverageRating(
            typeof result.averageRating ===
              "number"
              ? result.averageRating
              : 0,
          );
        } catch (error) {
          console.error(
            "Unable to load reviews:",
            error,
          );

          setReviews([]);
          setReviewCount(0);
          setAverageRating(0);

          setReviewsError(
            error instanceof Error
              ? error.message
              : "Unable to load reviews.",
          );
        } finally {
          setIsLoadingReviews(false);
        }
      },
      [recipeId],
    );

  useEffect(() => {
    void loadRecipe();
  }, [loadRecipe]);

  const loadSavedRecipeStatus =
    useCallback(
      async (): Promise<void> => {
        if (!recipeId) {
          setIsSaved(false);
          return;
        }

        if (
          sessionStatus ===
          "loading"
        ) {
          return;
        }

        if (
          sessionStatus !==
          "authenticated" ||
          !accessToken
        ) {
          setIsSaved(false);
          setIsCheckingSaved(false);
          return;
        }

        try {
          setIsCheckingSaved(true);
          setSavedRecipeMessage("");

          const response =
            await fetch(
              `${API_URL}/api/saved-recipes/check/${encodeURIComponent(
                recipeId,
              )}`,
              {
                method: "GET",

                headers: {
                  Authorization:
                    `Bearer ${accessToken}`,
                },

                cache: "no-store",
              },
            );

          const result =
            await readSavedRecipeResponse(
              response,
            );

          if (
            !response.ok ||
            !result.success
          ) {
            throw new Error(
              result.message ||
              "Unable to check saved recipe status.",
            );
          }

          setIsSaved(
            result.isSaved === true,
          );
        } catch (error) {
          setIsSaved(false);

          setSavedRecipeMessage(
            error instanceof Error
              ? error.message
              : "Unable to check saved recipe status.",
          );
        } finally {
          setIsCheckingSaved(false);
        }
      },
      [
        accessToken,
        recipeId,
        sessionStatus,
      ],
    );

  useEffect(() => {
    void loadSavedRecipeStatus();
  }, [loadSavedRecipeStatus]);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  const redirectToLogin = () => {
    router.push(
      `/login?redirect=${encodeURIComponent(
        `/trailer/${recipeId}`,
      )}`,
    );
  };

  const handleSaveRecipe =
    async (): Promise<void> => {
      if (!recipe) {
        return;
      }

      if (
        sessionStatus ===
        "loading"
      ) {
        return;
      }

      if (!isLoggedIn) {
        redirectToLogin();
        return;
      }

      if (!accessToken) {
        setSavedRecipeMessage(
          "Authentication token was not found. Please log in again.",
        );

        return;
      }

      try {
        setIsChangingSaved(true);
        setSavedRecipeMessage("");

        const response =
          await fetch(
            `${API_URL}/api/saved-recipes/${encodeURIComponent(
              recipe._id,
            )}`,
            {
              method: "POST",

              headers: {
                Authorization:
                  `Bearer ${accessToken}`,
              },
            },
          );

        const result =
          await readSavedRecipeResponse(
            response,
          );

        if (
          response.status === 401
        ) {
          redirectToLogin();
          return;
        }

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
            "Unable to save the recipe.",
          );
        }

        setIsSaved(true);

        setSavedRecipeMessage(
          result.message ||
          "Recipe saved successfully.",
        );
      } catch (error) {
        setSavedRecipeMessage(
          error instanceof Error
            ? error.message
            : "Unable to save the recipe.",
        );
      } finally {
        setIsChangingSaved(false);
      }
    };

  const handleRemoveRecipe =
    async (): Promise<void> => {
      if (!recipe) {
        return;
      }

      if (!isLoggedIn) {
        redirectToLogin();
        return;
      }

      if (!accessToken) {
        setSavedRecipeMessage(
          "Authentication token was not found. Please log in again.",
        );

        return;
      }

      try {
        setIsChangingSaved(true);
        setSavedRecipeMessage("");

        const response =
          await fetch(
            `${API_URL}/api/saved-recipes/${encodeURIComponent(
              recipe._id,
            )}`,
            {
              method: "DELETE",

              headers: {
                Authorization:
                  `Bearer ${accessToken}`,
              },
            },
          );

        const result =
          await readSavedRecipeResponse(
            response,
          );

        if (
          response.status === 401
        ) {
          redirectToLogin();
          return;
        }

        if (
          response.status !== 404 &&
          (
            !response.ok ||
            !result.success
          )
        ) {
          throw new Error(
            result.message ||
            "Unable to remove the recipe.",
          );
        }

        setIsSaved(false);

        setSavedRecipeMessage(
          result.message ||
          "Recipe removed from saved recipes.",
        );
      } catch (error) {
        setSavedRecipeMessage(
          error instanceof Error
            ? error.message
            : "Unable to remove the recipe.",
        );
      } finally {
        setIsChangingSaved(false);
      }
    };

  const handleAddReview = async (
    event:
      FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    setReviewMessage("");
    setReviewMessageType("");

    if (!recipe) {
      return;
    }

    if (
      sessionStatus ===
      "loading"
    ) {
      return;
    }

    if (!isLoggedIn) {
      redirectToLogin();
      return;
    }

    if (!accessToken) {
      setReviewMessage(
        "Authentication token was not found. Please log in again.",
      );

      setReviewMessageType(
        "error",
      );

      return;
    }

    if (isRecipeOwner) {
      setReviewMessage(
        "You cannot review your own recipe.",
      );

      setReviewMessageType(
        "error",
      );

      return;
    }

    if (myReview) {
      setReviewMessage(
        "You have already reviewed this recipe. Use Edit on your review to update it.",
      );

      setReviewMessageType(
        "error",
      );

      return;
    }

    const trimmedReview =
      reviewText.trim();

    if (!trimmedReview) {
      setReviewMessage(
        "Please write your review before submitting.",
      );

      setReviewMessageType(
        "error",
      );

      return;
    }

    if (
      trimmedReview.length >
      1000
    ) {
      setReviewMessage(
        "Review cannot exceed 1000 characters.",
      );

      setReviewMessageType(
        "error",
      );

      return;
    }

    try {
      setIsSubmittingReview(
        true,
      );

      const response =
        await fetch(
          `${API_URL}/api/reviews/recipe/${recipe._id}`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${accessToken}`,
            },

            body: JSON.stringify({
              text:
                trimmedReview,

              rating:
                reviewRating,
            }),
          },
        );

      const result =
        await parseJsonResponse<
          ReviewMutationResponse
        >(response);

      if (
        !response.ok ||
        !result.success
      ) {
        const errorDetails =
          result.errors?.join(
            " ",
          ) ?? "";

        let fallbackMessage =
          "Unable to add review.";

        if (
          response.status === 401
        ) {
          fallbackMessage =
            "Your login session is invalid or has expired.";
        } else if (
          response.status === 403
        ) {
          fallbackMessage =
            "You cannot review your own recipe.";
        } else if (
          response.status === 409
        ) {
          fallbackMessage =
            "You have already reviewed this recipe.";
        }

        throw new Error(
          `${result.message ||
            fallbackMessage
            } ${errorDetails}`.trim(),
        );
      }

      setReviewText("");
      setReviewRating(5);

      await loadReviews();

      setReviewMessage(
        result.message ||
        "Your review has been added.",
      );

      setReviewMessageType(
        "success",
      );
    } catch (error) {
      console.error(
        "Unable to add review:",
        error,
      );

      setReviewMessage(
        error instanceof Error
          ? error.message
          : "Unable to add review.",
      );

      setReviewMessageType(
        "error",
      );
    } finally {
      setIsSubmittingReview(
        false,
      );
    }
  };

  const startEditingReview = (
    review: Review,
  ) => {
    setEditingReviewId(
      review._id,
    );

    setEditReviewText(
      review.text,
    );

    setEditReviewRating(
      review.rating,
    );

    setReviewMessage("");
    setReviewMessageType("");
  };

  const cancelEditingReview =
    () => {
      if (isUpdatingReview) {
        return;
      }

      setEditingReviewId(null);
      setEditReviewText("");
      setEditReviewRating(5);
    };

  const handleUpdateReview =
    async (
      review: Review,
    ): Promise<void> => {
      setReviewMessage("");
      setReviewMessageType("");

      if (!accessToken) {
        setReviewMessage(
          "Authentication token was not found. Please log in again.",
        );

        setReviewMessageType(
          "error",
        );

        return;
      }

      if (
        !currentUserId ||
        String(review.userId) !==
        String(currentUserId)
      ) {
        setReviewMessage(
          "You can only edit your own review.",
        );

        setReviewMessageType(
          "error",
        );

        return;
      }

      const trimmedReview =
        editReviewText.trim();

      if (!trimmedReview) {
        setReviewMessage(
          "Review text cannot be empty.",
        );

        setReviewMessageType(
          "error",
        );

        return;
      }

      if (
        trimmedReview.length >
        1000
      ) {
        setReviewMessage(
          "Review cannot exceed 1000 characters.",
        );

        setReviewMessageType(
          "error",
        );

        return;
      }

      try {
        setIsUpdatingReview(
          true,
        );

        const response =
          await fetch(
            `${API_URL}/api/reviews/${review._id}`,
            {
              method: "PATCH",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${accessToken}`,
              },

              body: JSON.stringify({
                text:
                  trimmedReview,

                rating:
                  editReviewRating,
              }),
            },
          );

        const result =
          await parseJsonResponse<
            ReviewMutationResponse
          >(response);

        if (
          !response.ok ||
          !result.success
        ) {
          const errorDetails =
            result.errors?.join(
              " ",
            ) ?? "";

          let fallbackMessage =
            "Unable to update review.";

          if (
            response.status === 401
          ) {
            fallbackMessage =
              "Your login session is invalid or has expired.";
          } else if (
            response.status === 403
          ) {
            fallbackMessage =
              "You can only edit your own review.";
          } else if (
            response.status === 404
          ) {
            fallbackMessage =
              "Review not found.";
          }

          throw new Error(
            `${result.message ||
              fallbackMessage
              } ${errorDetails}`.trim(),
          );
        }

        setEditingReviewId(null);
        setEditReviewText("");
        setEditReviewRating(5);

        await loadReviews();

        setReviewMessage(
          result.message ||
          "Review updated successfully.",
        );

        setReviewMessageType(
          "success",
        );
      } catch (error) {
        console.error(
          "Unable to update review:",
          error,
        );

        setReviewMessage(
          error instanceof Error
            ? error.message
            : "Unable to update review.",
        );

        setReviewMessageType(
          "error",
        );
      } finally {
        setIsUpdatingReview(
          false,
        );
      }
    };

  const handleDeleteReview =
  async (
    review: Review,
  ): Promise<void> => {
    setReviewMessage("");
    setReviewMessageType("");

    if (!accessToken) {
      setReviewMessage(
        "Authentication token was not found. Please log in again.",
      );

      setReviewMessageType(
        "error",
      );

      return;
    }

    if (
      !currentUserId ||
      String(review.userId) !==
        String(currentUserId)
    ) {
      setReviewMessage(
        "You can only delete your own review.",
      );

      setReviewMessageType(
        "error",
      );

      return;
    }

    try {
      setDeletingReviewId(
        review._id,
      );

      const response =
        await fetch(
          `${API_URL}/api/reviews/${review._id}`,
          {
            method: "DELETE",

            headers: {
              Authorization:
                `Bearer ${accessToken}`,
            },
          },
        );

      const result =
        await parseJsonResponse<
          ReviewMutationResponse
        >(response);

      if (
        !response.ok ||
        !result.success
      ) {
        let fallbackMessage =
          "Unable to delete review.";

        if (
          response.status === 401
        ) {
          fallbackMessage =
            "Your login session is invalid or has expired.";
        } else if (
          response.status === 403
        ) {
          fallbackMessage =
            "You can only delete your own review.";
        } else if (
          response.status === 404
        ) {
          fallbackMessage =
            "Review not found.";
        }

        throw new Error(
          result.message ||
            fallbackMessage,
        );
      }

      if (
        editingReviewId ===
        review._id
      ) {
        setEditingReviewId(null);
      }

      await loadReviews();

      setReviewMessage(
        result.message ||
          "Review deleted successfully.",
      );

      setReviewMessageType(
        "success",
      );
    } catch (error) {
      setReviewMessage(
        error instanceof Error
          ? error.message
          : "Unable to delete review.",
      );

      setReviewMessageType(
        "error",
      );
    } finally {
      setDeletingReviewId(null);
    }
  };

  if (isLoading) {
    return (
      <main style={loadingPageStyle}>
        <LoaderCircle
          size={44}
          className="loadingIcon"
        />

        <p style={loadingTextStyle}>
          Preparing your recipe...
        </p>

        <style jsx>{`
          :global(.loadingIcon) {
            color: #b90f2f;
            animation: spin
              0.9s linear infinite;
          }

          @keyframes spin {
            to {
              transform: rotate(
                360deg
              );
            }
          }
        `}</style>
      </main>
    );
  }

  if (!recipe) {
    return (
      <main style={notFoundPageStyle}>
        <div style={notFoundCardStyle}>
          <div style={notFoundIconStyle}>
            <CookingPot size={42} />
          </div>

          <span style={decorationTextStyle}>
            ❦ RecipePeeker ❦
          </span>

          <h1 style={notFoundHeadingStyle}>
            Recipe not found
          </h1>

          <p
            style={
              notFoundDescriptionStyle
            }
          >
            {errorMessage ||
              "This recipe may have been removed or the address may be incorrect."}
          </p>

          <div
            style={
              notFoundActionsStyle
            }
          >
            <button
              type="button"
              onClick={() => {
                void loadRecipe();
              }}
              style={
                retryButtonStyle
              }
            >
              <RefreshCw size={18} />
              Try Again
            </button>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/search",
                )
              }
              style={
                backHomeButtonStyle
              }
            >
              <ArrowLeft size={18} />
              Back to Recipes
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="pageContainer">
        <button
          type="button"
          onClick={() =>
            router.push("/search")
          }
          className="backButton"
        >
          <ArrowLeft size={18} />
          Back to Recipes
        </button>

        <section className="heroCard">
          <div className="imageWrapper">
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="heroImage"
            />

            <span className="categoryBadge">
              {recipe.category}
            </span>

            <div className="imageOverlay" />
          </div>

          <div className="heroContent">
            <span className="eyebrow">
              ✧ Community Recipe ✧
            </span>

            <h1>{recipe.title}</h1>

            <p className="authorText">
              Recipe by{" "}
              <strong>
                {recipe.authorName ||
                  "RecipePeeker User"}
              </strong>
            </p>

            <p className="description">
              {recipe.description}
            </p>

            <div className="recipeInformation">
              <div className="informationItem">
                <Clock3 size={20} />

                <div>
                  <span>Time</span>

                  <strong>
                    {
                      recipe.timeMinutes
                    }{" "}
                    mins
                  </strong>
                </div>
              </div>

              <div className="informationItem">
                <ChefHat size={20} />

                <div>
                  <span>
                    Difficulty
                  </span>

                  <strong>
                    {
                      recipe.difficulty
                    }
                  </strong>
                </div>
              </div>

              <div className="informationItem">
                <UsersRound
                  size={20}
                />

                <div>
                  <span>
                    Servings
                  </span>

                  <strong>
                    {
                      recipe.servings
                    }{" "}
                    {recipe.servings ===
                      1
                      ? "serving"
                      : "servings"}
                  </strong>
                </div>
              </div>
            </div>

            {isSaved ? (
              <button
                type="button"
                onClick={() => {
                  void handleRemoveRecipe();
                }}
                disabled={
                  isCheckingSaved ||
                  isChangingSaved
                }
                className="removeRecipeButton"
              >
                {isChangingSaved ? (
                  <LoaderCircle
                    size={20}
                    className="buttonLoadingIcon"
                  />
                ) : (
                  <Heart
                    size={20}
                    fill="#b90f2f"
                  />
                )}

                {isChangingSaved
                  ? "Removing..."
                  : "Remove Recipe"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  void handleSaveRecipe();
                }}
                disabled={
                  isCheckingSaved ||
                  isChangingSaved
                }
                className="saveRecipeButton"
              >
                {isCheckingSaved ||
                  isChangingSaved ? (
                  <LoaderCircle
                    size={20}
                    className="buttonLoadingIcon"
                  />
                ) : (
                  <Heart size={20} />
                )}

                {isCheckingSaved
                  ? "Checking..."
                  : isChangingSaved
                    ? "Saving..."
                    : "Save Recipe"}
              </button>
            )}

            {savedRecipeMessage && (
              <p
                style={{
                  margin:
                    "12px 0 0",
                  color:
                    savedRecipeMessage
                      .toLowerCase()
                      .includes("unable") ||
                      savedRecipeMessage
                        .toLowerCase()
                        .includes("not found")
                      ? "#b90f2f"
                      : "#3f7b50",
                  fontSize: "14px",
                  fontWeight: "600",
                  lineHeight: "1.5",
                }}
              >
                {savedRecipeMessage}
              </p>
            )}
          </div>
        </section>

        <div className="contentGrid">
          <section className="contentCard">
            <div className="sectionHeading">
              <span className="sectionIcon">
                <Sparkles
                  size={21}
                />
              </span>

              <div>
                <span>
                  What you&apos;ll
                  need
                </span>

                <h2>Ingredients</h2>
              </div>
            </div>

            <ul className="ingredientsList">
              {recipe.ingredients.map(
                (
                  ingredient,
                  index,
                ) => (
                  <li
                    key={`${ingredient}-${index}`}
                  >
                    <span className="ingredientDot">
                      ❦
                    </span>

                    <span>
                      {ingredient}
                    </span>
                  </li>
                ),
              )}
            </ul>
          </section>

          <section className="contentCard">
            <div className="sectionHeading">
              <span className="sectionIcon">
                <CookingPot
                  size={21}
                />
              </span>

              <div>
                <span>
                  Follow along
                </span>

                <h2>
                  Cooking Steps
                </h2>
              </div>
            </div>

            <div className="stepsList">
              {recipe.steps.map(
                (step, index) => (
                  <div
                    key={`${step}-${index}`}
                    className="stepItem"
                  >
                    <span className="stepNumber">
                      {index + 1}
                    </span>

                    <p>{step}</p>
                  </div>
                ),
              )}
            </div>
          </section>
        </div>

        <section className="reviewSection">
          <div className="reviewHeadingArea">
            <div>
              <span className="sectionDecoration">
                ♡ Cooking memories ♡
              </span>

              <h2>
                Recipe Reviews
              </h2>

              <p>
                Share your experience
                and helpful tips with
                other home cooks.
              </p>
            </div>

            <div className="reviewSummary">
              <div className="averageRating">
                <Star
                  size={19}
                  fill="#b90f2f"
                />

                <strong>
                  {reviewCount > 0
                    ? averageRating.toFixed(
                      1,
                    )
                    : "0.0"}
                </strong>
              </div>

              <span className="summaryDivider">
                ·
              </span>

              <span>
                {reviewCount}{" "}
                {reviewCount === 1
                  ? "Review"
                  : "Reviews"}
              </span>
            </div>
          </div>

          {reviewMessage && (
            <div
              className={`reviewAlert ${reviewMessageType ===
                "success"
                ? "reviewSuccess"
                : "reviewError"
                }`}
              role="alert"
            >
              {reviewMessage}
            </div>
          )}

          {isRecipeOwner ? (
            <div className="reviewNotice">
              <ChefHat size={22} />

              <div>
                <strong>
                  This is your recipe
                </strong>

                <p>
                  Recipe owners cannot
                  review their own
                  recipes.
                </p>
              </div>
            </div>
          ) : myReview ? (
            <div className="reviewNotice">
              <Star
                size={22}
                fill="#b90f2f"
              />

              <div>
                <strong>
                  You already reviewed
                  this recipe
                </strong>

                <p>
                  Each account can add
                  one review per recipe.
                  Use Edit on your
                  review below to make
                  changes.
                </p>
              </div>
            </div>
          ) : (
            <form
              onSubmit={
                handleAddReview
              }
              className="reviewForm"
            >
              <label>
                Your rating
              </label>

              <div className="ratingButtons">
                {[1, 2, 3, 4, 5].map(
                  (rating) => (
                    <button
                      key={rating}
                      type="button"
                      disabled={
                        isSubmittingReview
                      }
                      onClick={() =>
                        setReviewRating(
                          rating,
                        )
                      }
                      aria-label={`Give ${rating} star rating`}
                    >
                      <Star
                        size={25}
                        fill={
                          rating <=
                            reviewRating
                            ? "#b90f2f"
                            : "transparent"
                        }
                        color={
                          rating <=
                            reviewRating
                            ? "#b90f2f"
                            : "#cda99a"
                        }
                      />
                    </button>
                  ),
                )}
              </div>

              <label htmlFor="review">
                Your review
              </label>

              <textarea
                id="review"
                value={reviewText}
                placeholder="What did you enjoy about this recipe?"
                onChange={(event) => {
                  setReviewText(
                    event.target
                      .value,
                  );

                  setReviewMessage(
                    "",
                  );

                  setReviewMessageType(
                    "",
                  );
                }}
                rows={5}
                maxLength={1000}
                disabled={
                  isSubmittingReview
                }
              />

              <div className="reviewFormFooter">
                <span className="characterCount">
                  {reviewText.length}
                  /1000
                </span>

                <button
                  type="submit"
                  className="submitReviewButton"
                  disabled={
                    isSubmittingReview ||
                    sessionStatus ===
                    "loading"
                  }
                >
                  {isSubmittingReview ? (
                    <LoaderCircle
                      size={19}
                      className="buttonLoadingIcon"
                    />
                  ) : (
                    <Plus size={19} />
                  )}

                  {isSubmittingReview
                    ? "Submitting..."
                    : isLoggedIn
                      ? "Add Review"
                      : "Login to Review"}
                </button>
              </div>
            </form>
          )}

          <div className="reviewsList">
            {isLoadingReviews ? (
              <div className="reviewsLoading">
                <LoaderCircle
                  size={30}
                  className="loadingIcon"
                />

                <p>
                  Loading reviews...
                </p>
              </div>
            ) : reviewsError ? (
              <div className="emptyReview">
                <RefreshCw
                  size={30}
                />

                <h3>
                  Unable to load reviews
                </h3>

                <p>
                  {reviewsError}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    void loadReviews();
                  }}
                  className="retryReviewsButton"
                >
                  <RefreshCw
                    size={17}
                  />

                  Try Again
                </button>
              </div>
            ) : reviews.length === 0 ? (
              <div className="emptyReview">
                <span>❦</span>

                <h3>
                  No reviews yet
                </h3>

                <p>
                  Be the first person
                  to review this recipe.
                </p>
              </div>
            ) : (
              reviews.map((review) => {
                const isOwnReview =
                  Boolean(
                    currentUserId &&
                    String(
                      review.userId,
                    ) ===
                    String(
                      currentUserId,
                    ),
                  );

                const isEditing =
                  editingReviewId ===
                  review._id;

                const isDeleting =
                  deletingReviewId ===
                  review._id;

                return (
                  <article
                    key={review._id}
                    className="reviewCard"
                  >
                    <div className="reviewCardHeader">
                      <div className="reviewUserArea">
                        <span className="reviewAvatar">
                          {review.username
                            .charAt(0)
                            .toUpperCase()}
                        </span>

                        <div>
                          <div className="reviewNameRow">
                            <h3>
                              {
                                review.username
                              }
                            </h3>

                            {isOwnReview && (
                              <span className="yourReviewBadge">
                                Your review
                              </span>
                            )}
                          </div>

                          <span className="reviewDate">
                            {formatReviewDate(
                              review.createdAt,
                            )}
                          </span>
                        </div>
                      </div>

                      {isOwnReview &&
                        !isEditing && (
                          <div className="reviewActions">
                            <button
                              type="button"
                              onClick={() =>
                                startEditingReview(
                                  review,
                                )
                              }
                              disabled={
                                Boolean(
                                  deletingReviewId,
                                ) ||
                                isUpdatingReview
                              }
                              aria-label="Edit review"
                              className="editReviewButton"
                            >
                              <Pencil
                                size={17}
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                void handleDeleteReview(
                                  review,
                                );
                              }}
                              disabled={
                                Boolean(
                                  deletingReviewId,
                                ) ||
                                isUpdatingReview
                              }
                              aria-label="Delete review"
                              className="deleteReviewButton"
                            >
                              {isDeleting ? (
                                <LoaderCircle
                                  size={17}
                                  className="buttonLoadingIcon"
                                />
                              ) : (
                                <Trash2
                                  size={17}
                                />
                              )}
                            </button>
                          </div>
                        )}
                    </div>

                    {isEditing ? (
                      <div className="editReviewForm">
                        <label>
                          Edit rating
                        </label>

                        <div className="ratingButtons">
                          {[
                            1,
                            2,
                            3,
                            4,
                            5,
                          ].map(
                            (rating) => (
                              <button
                                key={
                                  rating
                                }
                                type="button"
                                disabled={
                                  isUpdatingReview
                                }
                                onClick={() =>
                                  setEditReviewRating(
                                    rating,
                                  )
                                }
                                aria-label={`Give ${rating} star rating`}
                              >
                                <Star
                                  size={23}
                                  fill={
                                    rating <=
                                      editReviewRating
                                      ? "#b90f2f"
                                      : "transparent"
                                  }
                                  color={
                                    rating <=
                                      editReviewRating
                                      ? "#b90f2f"
                                      : "#cda99a"
                                  }
                                />
                              </button>
                            ),
                          )}
                        </div>

                        <textarea
                          value={
                            editReviewText
                          }
                          onChange={(
                            event,
                          ) =>
                            setEditReviewText(
                              event.target
                                .value,
                            )
                          }
                          rows={4}
                          maxLength={1000}
                          disabled={
                            isUpdatingReview
                          }
                        />

                        <div className="editReviewFooter">
                          <span className="characterCount">
                            {
                              editReviewText.length
                            }
                            /1000
                          </span>

                          <div className="editReviewActions">
                            <button
                              type="button"
                              onClick={
                                cancelEditingReview
                              }
                              disabled={
                                isUpdatingReview
                              }
                              className="cancelEditButton"
                            >
                              <X
                                size={17}
                              />

                              Cancel
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                void handleUpdateReview(
                                  review,
                                );
                              }}
                              disabled={
                                isUpdatingReview
                              }
                              className="saveEditButton"
                            >
                              {isUpdatingReview ? (
                                <LoaderCircle
                                  size={17}
                                  className="buttonLoadingIcon"
                                />
                              ) : (
                                <Save
                                  size={17}
                                />
                              )}

                              {isUpdatingReview
                                ? "Saving..."
                                : "Save Changes"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="reviewStars">
                          {[
                            1,
                            2,
                            3,
                            4,
                            5,
                          ].map(
                            (rating) => (
                              <Star
                                key={
                                  rating
                                }
                                size={17}
                                fill={
                                  rating <=
                                    review.rating
                                    ? "#b90f2f"
                                    : "transparent"
                                }
                                color={
                                  rating <=
                                    review.rating
                                    ? "#b90f2f"
                                    : "#cda99a"
                                }
                              />
                            ),
                          )}
                        </div>

                        <p className="reviewText">
                          {review.text}
                        </p>
                      </>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          padding: 42px 24px 80px;
          color: #5f1f23;
          background:
            radial-gradient(
              circle at top left,
              rgba(
                255,
                255,
                255,
                0.96
              ),
              transparent 28%
            ),
            radial-gradient(
              circle at bottom right,
              rgba(
                217,
                32,
                69,
                0.06
              ),
              transparent 32%
            ),
            #fff7ed;
        }

        .pageContainer {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
        }

        .backButton {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 22px;
          padding: 11px 17px;
          border: 1px solid
            #ead7c4;
          border-radius: 999px;
          color: #8f0d25;
          background-color: #fffaf3;
          box-shadow: 0 8px 20px
            rgba(
              95,
              31,
              35,
              0.08
            );
          cursor: pointer;
          font-family: inherit;
          font-weight: 700;
        }

        .heroCard {
          display: grid;
          grid-template-columns:
            minmax(
              300px,
              1.05fr
            )
            minmax(
              320px,
              0.95fr
            );
          overflow: hidden;
          border: 1px solid
            #ead7c4;
          border-radius: 32px;
          background-color: #fffaf3;
          box-shadow: 0 22px 55px
            rgba(
              95,
              31,
              35,
              0.11
            );
        }

        .imageWrapper {
          position: relative;
          min-height: 500px;
          overflow: hidden;
        }

        .heroImage {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .imageOverlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            linear-gradient(
              180deg,
              transparent 58%,
              rgba(
                95,
                31,
                35,
                0.18
              )
            );
        }

        .categoryBadge {
          position: absolute;
          top: 24px;
          left: 24px;
          z-index: 2;
          padding: 9px 16px;
          border: 1px solid
            rgba(
              255,
              255,
              255,
              0.72
            );
          border-radius: 999px;
          color: #8f0d25;
          background-color: rgba(
            255,
            250,
            243,
            0.92
          );
          box-shadow: 0 8px 20px
            rgba(
              95,
              31,
              35,
              0.15
            );
          backdrop-filter: blur(
            8px
          );
          font-size: 14px;
          font-weight: 700;
        }

        .heroContent {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 52px;
        }

        .eyebrow,
        .sectionDecoration {
          color: #b90f2f;
          font-family: Georgia,
            serif;
          font-size: 14px;
          letter-spacing: 1.2px;
        }

        .heroContent h1 {
          margin: 13px 0 8px;
          color: #8f0d25;
          font-family: Georgia,
            serif;
          font-size: clamp(
            38px,
            5vw,
            60px
          );
          font-weight: 500;
          line-height: 1.05;
        }

        .authorText {
          margin: 0 0 20px;
          color: #b90f2f;
          font-size: 14px;
        }

        .description {
          margin: 0 0 30px;
          color: #8a5c52;
          font-size: 16px;
          line-height: 1.8;
        }

        .recipeInformation {
          display: grid;
          grid-template-columns:
            repeat(
              auto-fit,
              minmax(
                125px,
                1fr
              )
            );
          gap: 12px;
          margin-bottom: 30px;
        }

        .informationItem {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 13px;
          border: 1px solid
            #ead7c4;
          border-radius: 15px;
          background-color: #f9eadf;
        }

        .informationItem
          :global(svg) {
          flex-shrink: 0;
          color: #b90f2f;
        }

        .informationItem span {
          display: block;
          margin-bottom: 3px;
          color: #9a6b5f;
          font-size: 11px;
          text-transform:
            uppercase;
          letter-spacing: 0.7px;
        }

        .informationItem strong {
          display: block;
          color: #5f1f23;
          font-size: 13px;
        }

        .saveRecipeButton,
        .removeRecipeButton {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 15px 20px;
          border-radius: 15px;
          cursor: pointer;
          font-family: inherit;
          font-size: 15px;
          font-weight: 700;
        }

        .saveRecipeButton:disabled,
.removeRecipeButton:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

        .saveRecipeButton {
          border: none;
          color: white;
          background-color: #b90f2f;
          box-shadow: 0 13px 28px
            rgba(
              185,
              15,
              47,
              0.24
            );
        }

        .removeRecipeButton {
          border: 1px solid
            #b90f2f;
          color: #b90f2f;
          background-color: #fffaf3;
        }

        .contentGrid {
          display: grid;
          grid-template-columns:
            repeat(
              auto-fit,
              minmax(
                min(
                  320px,
                  100%
                ),
                1fr
              )
            );
          gap: 24px;
          margin-top: 28px;
        }

        .contentCard,
        .reviewSection {
          padding: 32px;
          border: 1px solid
            #ead7c4;
          border-radius: 26px;
          background-color: #fffaf3;
          box-shadow: 0 16px 42px
            rgba(
              95,
              31,
              35,
              0.08
            );
        }

        .sectionHeading {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 26px;
        }

        .sectionIcon {
          width: 46px;
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 15px;
          color: white;
          background-color: #b90f2f;
        }

        .sectionHeading
          span:not(
            .sectionIcon
          ) {
          display: block;
          margin-bottom: 3px;
          color: #b90f2f;
          font-family: Georgia,
            serif;
          font-size: 12px;
        }

        .sectionHeading h2 {
          margin: 0;
          color: #8f0d25;
          font-family: Georgia,
            serif;
          font-size: 28px;
        }

        .ingredientsList {
          display: flex;
          flex-direction: column;
          gap: 13px;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .ingredientsList li {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          padding-bottom: 12px;
          border-bottom: 1px
            dashed #ead7c4;
          color: #7c4a42;
          line-height: 1.6;
        }

        .ingredientDot {
          flex-shrink: 0;
          color: #b90f2f;
        }

        .stepsList {
          display: flex;
          flex-direction: column;
          gap: 17px;
        }

        .stepItem {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .stepNumber {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 50%;
          color: white;
          background-color: #b90f2f;
          font-weight: 700;
        }

        .stepItem p {
          margin: 0;
          padding-top: 4px;
          color: #7c4a42;
          line-height: 1.7;
        }

        .reviewSection {
          margin-top: 28px;
          padding: 36px;
          border-radius: 28px;
        }

        .reviewHeadingArea {
          display: flex;
          align-items: flex-start;
          justify-content:
            space-between;
          gap: 20px;
          flex-wrap: wrap;
          margin-bottom: 28px;
        }

        .reviewHeadingArea h2 {
          margin: 4px 0 8px;
          color: #8f0d25;
          font-family: Georgia,
            serif;
          font-size: 32px;
        }

        .reviewHeadingArea p {
          margin: 0;
          color: #8a5c52;
          line-height: 1.6;
        }

        .reviewSummary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 11px 16px;
          border: 1px solid
            #ead7c4;
          border-radius: 999px;
          color: #8f0d25;
          background-color: #f9eadf;
          font-size: 14px;
          font-weight: 700;
        }

        .averageRating {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .summaryDivider {
          color: #c79a8b;
        }

        .reviewAlert {
          margin-bottom: 20px;
          padding: 14px 17px;
          border-radius: 14px;
          font-size: 14px;
          font-weight: 600;
          line-height: 1.6;
        }

        .reviewSuccess {
          border: 1px solid
            #cce6d1;
          color: #3f7b50;
          background-color: #edf7ee;
        }

        .reviewError {
          border: 1px solid
            #f1c4cb;
          color: #b90f2f;
          background-color: #fff0f2;
        }

        .reviewNotice {
          display: flex;
          align-items: flex-start;
          gap: 13px;
          margin-bottom: 30px;
          padding: 19px;
          border: 1px solid
            #ead7c4;
          border-radius: 18px;
          color: #7c4a42;
          background-color: #fff7ed;
        }

        .reviewNotice
          :global(svg) {
          flex-shrink: 0;
          color: #b90f2f;
        }

        .reviewNotice strong {
          display: block;
          margin-bottom: 4px;
          color: #8f0d25;
        }

        .reviewNotice p {
          margin: 0;
          line-height: 1.6;
        }

        .reviewForm {
          margin-bottom: 30px;
          padding: 25px;
          border: 1px solid
            #ead7c4;
          border-radius: 22px;
          background-color: #fff7ed;
        }

        .reviewForm label,
        .editReviewForm label {
          display: block;
          margin: 0 0 9px;
          color: #5f1f23;
          font-size: 14px;
          font-weight: 700;
        }

        .ratingButtons {
          display: flex;
          gap: 4px;
          margin-bottom: 20px;
        }

        .ratingButtons button {
          display: flex;
          padding: 3px;
          border: none;
          background: transparent;
          cursor: pointer;
        }

        .ratingButtons
          button:disabled {
          cursor: not-allowed;
          opacity: 0.65;
        }

        .reviewForm textarea,
        .editReviewForm textarea {
          width: 100%;
          box-sizing: border-box;
          resize: vertical;
          padding: 15px;
          border: 1px solid
            #ead7c4;
          border-radius: 15px;
          outline: none;
          color: #5f1f23;
          background-color: #fffdf9;
          font-family: inherit;
          font-size: 15px;
          line-height: 1.6;
        }

        .reviewForm
          textarea:focus,
        .editReviewForm
          textarea:focus {
          border-color: #b90f2f;
          box-shadow: 0 0 0 3px
            rgba(
              185,
              15,
              47,
              0.08
            );
        }

        .reviewFormFooter,
        .editReviewFooter {
          display: flex;
          align-items: center;
          justify-content:
            space-between;
          gap: 15px;
          margin-top: 15px;
        }

        .characterCount {
          color: #9a6b5f;
          font-size: 12px;
        }

        .submitReviewButton,
        .retryReviewsButton,
        .saveEditButton,
        .cancelEditButton {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 13px 20px;
          border-radius: 13px;
          cursor: pointer;
          font-family: inherit;
          font-weight: 700;
        }

        .submitReviewButton,
        .saveEditButton {
          border: none;
          color: white;
          background-color: #b90f2f;
        }

        .cancelEditButton {
          border: 1px solid
            #d8b9a6;
          color: #7c4a42;
          background-color: #fffdf9;
        }

        .retryReviewsButton {
          margin-top: 18px;
          border: 1px solid
            #b90f2f;
          color: #b90f2f;
          background-color: #fffaf3;
        }

        .submitReviewButton:disabled,
        .saveEditButton:disabled,
        .cancelEditButton:disabled,
        .retryReviewsButton:disabled {
          cursor: not-allowed;
          opacity: 0.65;
        }

        .reviewsList {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .reviewsLoading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 42px 20px;
          color: #8a5c52;
        }

        .reviewsLoading p {
          margin: 0;
        }

        .emptyReview {
          padding: 42px 20px;
          border: 1px dashed
            #d8b9a6;
          border-radius: 20px;
          color: #8a5c52;
          text-align: center;
          background-color: #fff7ed;
        }

        .emptyReview
          > span {
          color: #b90f2f;
          font-size: 30px;
        }

        .emptyReview
          :global(svg) {
          color: #b90f2f;
        }

        .emptyReview h3 {
          margin: 10px 0 7px;
          color: #8f0d25;
          font-family: Georgia,
            serif;
        }

        .emptyReview p {
          margin: 0;
          line-height: 1.6;
        }

        .reviewCard {
          padding: 22px;
          border: 1px solid
            #ead7c4;
          border-radius: 20px;
          background-color: #fffdf9;
        }

        .reviewCardHeader {
          display: flex;
          align-items: center;
          justify-content:
            space-between;
          gap: 14px;
        }

        .reviewUserArea {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .reviewAvatar {
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 50%;
          color: white;
          background-color: #b90f2f;
          font-family: Georgia,
            serif;
          font-weight: 700;
        }

        .reviewNameRow {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .reviewUserArea h3 {
          margin: 0 0 3px;
          color: #5f1f23;
          font-size: 15px;
        }

        .yourReviewBadge {
          padding: 3px 8px;
          border-radius: 999px;
          color: #b90f2f;
          background-color: #ffe7e9;
          font-size: 10px;
          font-weight: 700;
        }

        .reviewDate {
          color: #9a6b5f;
          font-size: 12px;
        }

        .reviewActions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .editReviewButton,
        .deleteReviewButton {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          cursor: pointer;
        }

        .editReviewButton {
          border: 1px solid
            #d8b9a6;
          color: #8f0d25;
          background-color: #fff7ed;
        }

        .deleteReviewButton {
          border: 1px solid
            #efd1cf;
          color: #b90f2f;
          background-color: #fff0f2;
        }

        .editReviewButton:disabled,
        .deleteReviewButton:disabled {
          cursor: not-allowed;
          opacity: 0.65;
        }

        .reviewStars {
          display: flex;
          gap: 3px;
          margin: 14px 0 10px;
        }

        .reviewText {
          margin: 0;
          color: #7c4a42;
          white-space: pre-wrap;
          overflow-wrap:
            anywhere;
          line-height: 1.7;
        }

        .editReviewForm {
          margin-top: 18px;
          padding-top: 18px;
          border-top: 1px dashed
            #ead7c4;
        }

        .editReviewActions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        :global(.loadingIcon),
        :global(
          .buttonLoadingIcon
        ) {
          animation: spin
            0.9s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(
              360deg
            );
          }
        }

        @media (
          max-width: 820px
        ) {
          .heroCard {
            grid-template-columns:
              1fr;
          }

          .imageWrapper {
            min-height: 380px;
          }

          .heroContent {
            padding: 38px;
          }
        }

        @media (
          max-width: 600px
        ) {
          .reviewFormFooter,
          .editReviewFooter {
            align-items:
              flex-start;
            flex-direction:
              column;
          }

          .submitReviewButton,
          .editReviewActions,
          .saveEditButton,
          .cancelEditButton {
            width: 100%;
          }

          .editReviewActions {
            display: grid;
            grid-template-columns:
              1fr;
          }

          .reviewCardHeader {
            align-items:
              flex-start;
          }
        }

        @media (
          max-width: 520px
        ) {
          .page {
            padding: 28px 14px
              60px;
          }

          .imageWrapper {
            min-height: 300px;
          }

          .heroContent,
          .contentCard,
          .reviewSection {
            padding: 24px 18px;
          }

          .recipeInformation {
            grid-template-columns:
              1fr;
          }

          .reviewSummary {
            width: 100%;
            justify-content:
              center;
          }
        }
      `}</style>
    </main>
  );
}

const loadingPageStyle:
  CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "14px",
  backgroundColor: "#fff7ed",
};

const loadingTextStyle:
  CSSProperties = {
  margin: 0,
  color: "#8a5c52",
  fontFamily: "Georgia, serif",
  fontSize: "17px",
};

const notFoundPageStyle:
  CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  backgroundColor: "#fff7ed",
};

const notFoundCardStyle:
  CSSProperties = {
  width: "100%",
  maxWidth: "540px",
  padding: "45px 30px",
  border:
    "1px solid #ead7c4",
  borderRadius: "28px",
  textAlign: "center",
  backgroundColor: "#fffaf3",
  boxShadow:
    "0 24px 60px rgba(95,31,35,0.12)",
};

const notFoundIconStyle:
  CSSProperties = {
  width: "82px",
  height: "82px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 20px",
  borderRadius: "24px",
  color: "white",
  backgroundColor: "#b90f2f",
};

const decorationTextStyle:
  CSSProperties = {
  color: "#b90f2f",
  fontFamily: "Georgia, serif",
  letterSpacing: "1px",
};

const notFoundHeadingStyle:
  CSSProperties = {
  margin: "10px 0",
  color: "#8f0d25",
  fontFamily: "Georgia, serif",
  fontSize: "34px",
};

const notFoundDescriptionStyle:
  CSSProperties = {
  margin: "0 0 25px",
  color: "#8a5c52",
  lineHeight: "1.7",
};

const notFoundActionsStyle:
  CSSProperties = {
  display: "flex",
  justifyContent: "center",
  gap: "12px",
  flexWrap: "wrap",
};

const retryButtonStyle:
  CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "13px 20px",
  border:
    "1px solid #b90f2f",
  borderRadius: "14px",
  color: "#b90f2f",
  backgroundColor: "#fffaf3",
  cursor: "pointer",
  fontWeight: "700",
};

const backHomeButtonStyle:
  CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "13px 20px",
  border: "none",
  borderRadius: "14px",
  color: "white",
  backgroundColor: "#b90f2f",
  cursor: "pointer",
  fontWeight: "700",
};