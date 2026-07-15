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
  Plus,
  RefreshCw,
  Sparkles,
  Star,
  Trash2,
  UsersRound,
} from "lucide-react";

type SavedRecipeStatus =
  | "Want to Watch"
  | "Watched"
  | "Favorite";

type SavedRecipeItem = {
  id: string | number;
  title: string;
  channel: string;
  thumbnail: string;
  status: SavedRecipeStatus;
};

type Recipe = {
  _id: string;
  title: string;
  category: string;
  timeMinutes: number;
  difficulty: "Easy" | "Medium" | "Hard";
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

type Review = {
  id: number;
  username: string;
  text: string;
  rating: number;
  createdAt: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000";

function readLocalStorageArray<T>(
  key: string,
): T[] {
  try {
    const storedValue =
      localStorage.getItem(key);

    if (!storedValue) {
      return [];
    }

    const parsedValue: unknown =
      JSON.parse(storedValue);

    return Array.isArray(parsedValue)
      ? (parsedValue as T[])
      : [];
  } catch (error) {
    console.error(
      `Unable to read ${key}:`,
      error,
    );

    localStorage.setItem(key, "[]");

    return [];
  }
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

  const recipeId = params.id;

  const [recipe, setRecipe] =
    useState<Recipe | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [isMockLoggedIn, setIsMockLoggedIn] =
    useState(false);

  const [isSaved, setIsSaved] =
    useState(false);

  const [reviewText, setReviewText] =
    useState("");

  const [reviewRating, setReviewRating] =
    useState(5);

  const [reviews, setReviews] =
    useState<Review[]>([]);

  const [reviewMessage, setReviewMessage] =
    useState("");

  const isGoogleLoggedIn =
    sessionStatus === "authenticated";

  const isLoggedIn =
    isMockLoggedIn || isGoogleLoggedIn;

  const reviewStorageKey =
    `reviews-${recipeId}`;

  const authorName = useMemo(() => {
    if (session?.user?.name) {
      return session.user.name;
    }

    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("mockUser") ||
        "RecipePeeker User"
      );
    }

    return "RecipePeeker User";
  }, [session]);

  useEffect(() => {
    const mockLoginStatus =
      localStorage.getItem("isLoggedIn") ===
      "true";

    setIsMockLoggedIn(mockLoginStatus);
  }, []);

  const loadRecipe =
    useCallback(async (): Promise<void> => {
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

        const response = await fetch(
          `${API_URL}/api/recipes/${recipeId}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const responseText =
          await response.text();

        let result: RecipeResponse;

        try {
          result = JSON.parse(
            responseText,
          ) as RecipeResponse;
        } catch {
          throw new Error(
            responseText ||
              "The server returned an invalid response.",
          );
        }

        if (!response.ok || !result.success) {
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

        const loadedRecipe = result.data;

        setRecipe(loadedRecipe);

        const savedRecipes =
          readLocalStorageArray<SavedRecipeItem>(
            "watchlist",
          );

        const recipeIsSaved =
          savedRecipes.some(
            (savedRecipe) =>
              String(savedRecipe.id) ===
              loadedRecipe._id,
          );

        setIsSaved(recipeIsSaved);

        const storedReviews =
          readLocalStorageArray<
            Partial<Review>
          >(reviewStorageKey);

        const normalizedReviews =
          storedReviews.map(
            (storedReview, index) => ({
              id:
                typeof storedReview.id ===
                "number"
                  ? storedReview.id
                  : Date.now() + index,

              username:
                typeof storedReview.username ===
                  "string" &&
                storedReview.username.trim()
                  ? storedReview.username
                  : "RecipePeeker User",

              text:
                typeof storedReview.text ===
                "string"
                  ? storedReview.text
                  : "",

              rating:
                typeof storedReview.rating ===
                "number"
                  ? Math.min(
                      5,
                      Math.max(
                        1,
                        storedReview.rating,
                      ),
                    )
                  : 5,

              createdAt:
                typeof storedReview.createdAt ===
                "string"
                  ? storedReview.createdAt
                  : "",
            }),
          );

        setReviews(normalizedReviews);
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
    }, [recipeId, reviewStorageKey]);

  useEffect(() => {
    void loadRecipe();
  }, [loadRecipe]);

  const saveRecipeToLocalStorage = (
    selectedRecipe: Recipe,
  ) => {
    const savedRecipes =
      readLocalStorageArray<SavedRecipeItem>(
        "watchlist",
      );

    const alreadySaved =
      savedRecipes.some(
        (savedRecipe) =>
          String(savedRecipe.id) ===
          selectedRecipe._id,
      );

    if (alreadySaved) {
      setIsSaved(true);
      return;
    }

    const newSavedRecipe: SavedRecipeItem = {
      id: selectedRecipe._id,
      title: selectedRecipe.title,
      channel: selectedRecipe.category,
      thumbnail: selectedRecipe.imageUrl,
      status: "Want to Watch",
    };

    const updatedSavedRecipes = [
      ...savedRecipes,
      newSavedRecipe,
    ];

    localStorage.setItem(
      "watchlist",
      JSON.stringify(updatedSavedRecipes),
    );

    setIsSaved(true);
  };

  const handleSaveRecipe = () => {
    if (!recipe) {
      return;
    }

    if (sessionStatus === "loading") {
      return;
    }

    if (!isLoggedIn) {
      const redirectPath =
        `/trailer/${recipe._id}`;

      router.push(
        `/login?redirect=${encodeURIComponent(
          redirectPath,
        )}`,
      );

      return;
    }

    saveRecipeToLocalStorage(recipe);
  };

  const handleRemoveRecipe = () => {
    if (!recipe) {
      return;
    }

    const savedRecipes =
      readLocalStorageArray<SavedRecipeItem>(
        "watchlist",
      );

    const updatedSavedRecipes =
      savedRecipes.filter(
        (savedRecipe) =>
          String(savedRecipe.id) !==
          recipe._id,
      );

    localStorage.setItem(
      "watchlist",
      JSON.stringify(updatedSavedRecipes),
    );

    setIsSaved(false);
  };

  const handleAddReview = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!recipe) {
      return;
    }

    if (sessionStatus === "loading") {
      return;
    }

    if (!isLoggedIn) {
      const redirectPath =
        `/trailer/${recipe._id}`;

      router.push(
        `/login?redirect=${encodeURIComponent(
          redirectPath,
        )}`,
      );

      return;
    }

    const trimmedReview =
      reviewText.trim();

    if (!trimmedReview) {
      setReviewMessage(
        "Please write your review before submitting.",
      );

      return;
    }

    const newReview: Review = {
      id: Date.now(),
      username: authorName,
      text: trimmedReview,
      rating: reviewRating,
      createdAt:
        new Date().toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "short",
            day: "numeric",
          },
        ),
    };

    const updatedReviews = [
      newReview,
      ...reviews,
    ];

    localStorage.setItem(
      reviewStorageKey,
      JSON.stringify(updatedReviews),
    );

    setReviews(updatedReviews);
    setReviewText("");
    setReviewRating(5);

    setReviewMessage(
      "Your review has been added.",
    );
  };

  const handleDeleteReview = (
    reviewId: number,
  ) => {
    const updatedReviews =
      reviews.filter(
        (review) =>
          review.id !== reviewId,
      );

    localStorage.setItem(
      reviewStorageKey,
      JSON.stringify(updatedReviews),
    );

    setReviews(updatedReviews);
    setReviewMessage("");
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
            animation: spin 0.9s linear
              infinite;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
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

          <p style={notFoundDescriptionStyle}>
            {errorMessage ||
              "This recipe may have been removed or the address may be incorrect."}
          </p>

          <div style={notFoundActionsStyle}>
            <button
              type="button"
              onClick={() => {
                void loadRecipe();
              }}
              style={retryButtonStyle}
            >
              <RefreshCw size={18} />
              Try Again
            </button>

            <button
              type="button"
              onClick={() =>
                router.push("/search")
              }
              style={backHomeButtonStyle}
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
                    {recipe.timeMinutes} mins
                  </strong>
                </div>
              </div>

              <div className="informationItem">
                <ChefHat size={20} />

                <div>
                  <span>Difficulty</span>
                  <strong>
                    {recipe.difficulty}
                  </strong>
                </div>
              </div>

              <div className="informationItem">
                <UsersRound size={20} />

                <div>
                  <span>Servings</span>
                  <strong>
                    {recipe.servings}{" "}
                    {recipe.servings === 1
                      ? "serving"
                      : "servings"}
                  </strong>
                </div>
              </div>
            </div>

            {isSaved ? (
              <button
                type="button"
                onClick={handleRemoveRecipe}
                className="removeRecipeButton"
              >
                <Heart
                  size={20}
                  fill="#b90f2f"
                />

                Remove Recipe
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveRecipe}
                className="saveRecipeButton"
              >
                <Heart size={20} />
                Save Recipe
              </button>
            )}
          </div>
        </section>

        <div className="contentGrid">
          <section className="contentCard">
            <div className="sectionHeading">
              <span className="sectionIcon">
                <Sparkles size={21} />
              </span>

              <div>
                <span>
                  What you&apos;ll need
                </span>

                <h2>Ingredients</h2>
              </div>
            </div>

            <ul className="ingredientsList">
              {recipe.ingredients.map(
                (ingredient, index) => (
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
                <CookingPot size={21} />
              </span>

              <div>
                <span>Follow along</span>
                <h2>Cooking Steps</h2>
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

              <h2>Recipe Reviews</h2>

              <p>
                Share your experience and
                helpful tips with other home
                cooks.
              </p>
            </div>

            <div className="reviewCount">
              <Star
                size={19}
                fill="#b90f2f"
              />

              {reviews.length}{" "}
              {reviews.length === 1
                ? "Review"
                : "Reviews"}
            </div>
          </div>

          <form
            onSubmit={handleAddReview}
            className="reviewForm"
          >
            <label>Your rating</label>

            <div className="ratingButtons">
              {[1, 2, 3, 4, 5].map(
                (rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() =>
                      setReviewRating(rating)
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
                  event.target.value,
                );

                setReviewMessage("");
              }}
              rows={5}
            />

            <button
              type="submit"
              className="submitReviewButton"
            >
              <Plus size={19} />
              Add Review
            </button>

            {reviewMessage && (
              <p className="reviewMessage">
                {reviewMessage}
              </p>
            )}
          </form>

          <div className="reviewsList">
            {reviews.length === 0 ? (
              <div className="emptyReview">
                <span>❦</span>

                <h3>No reviews yet</h3>

                <p>
                  Be the first person to review
                  this recipe.
                </p>
              </div>
            ) : (
              reviews.map((review) => (
                <article
                  key={review.id}
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
                        <h3>
                          {review.username}
                        </h3>

                        <span className="reviewDate">
                          {review.createdAt}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteReview(
                          review.id,
                        )
                      }
                      aria-label="Delete review"
                      className="deleteReviewButton"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                  <div className="reviewStars">
                    {[1, 2, 3, 4, 5].map(
                      (rating) => (
                        <Star
                          key={rating}
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
                </article>
              ))
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
              rgba(255, 255, 255, 0.96),
              transparent 28%
            ),
            radial-gradient(
              circle at bottom right,
              rgba(217, 32, 69, 0.06),
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
          border: 1px solid #ead7c4;
          border-radius: 999px;
          color: #8f0d25;
          background-color: #fffaf3;
          box-shadow: 0 8px 20px
            rgba(95, 31, 35, 0.08);
          cursor: pointer;
          font-weight: 700;
        }

        .heroCard {
          display: grid;
          grid-template-columns:
            minmax(300px, 1.05fr)
            minmax(320px, 0.95fr);
          overflow: hidden;
          border: 1px solid #ead7c4;
          border-radius: 32px;
          background-color: #fffaf3;
          box-shadow: 0 28px 70px
            rgba(95, 31, 35, 0.12);
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
          background: linear-gradient(
            180deg,
            transparent 58%,
            rgba(95, 31, 35, 0.18)
          );
        }

        .categoryBadge {
          position: absolute;
          top: 24px;
          left: 24px;
          z-index: 2;
          padding: 9px 16px;
          border: 1px solid
            rgba(255, 255, 255, 0.72);
          border-radius: 999px;
          color: #8f0d25;
          background-color: rgba(
            255,
            250,
            243,
            0.92
          );
          box-shadow: 0 8px 20px
            rgba(95, 31, 35, 0.15);
          backdrop-filter: blur(8px);
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
          font-family: Georgia, serif;
          font-size: 14px;
          letter-spacing: 1.2px;
        }

        .heroContent h1 {
          margin: 13px 0 8px;
          color: #8f0d25;
          font-family: Georgia, serif;
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
          grid-template-columns: repeat(
            auto-fit,
            minmax(125px, 1fr)
          );
          gap: 12px;
          margin-bottom: 30px;
        }

        .informationItem {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 13px;
          border: 1px solid #ead7c4;
          border-radius: 15px;
          background-color: #f9eadf;
        }

        .informationItem :global(svg) {
          flex-shrink: 0;
          color: #b90f2f;
        }

        .informationItem span {
          display: block;
          margin-bottom: 3px;
          color: #9a6b5f;
          font-size: 11px;
          text-transform: uppercase;
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
          font-size: 15px;
          font-weight: 700;
        }

        .saveRecipeButton {
          border: none;
          color: white;
          background-color: #b90f2f;
          box-shadow: 0 13px 28px
            rgba(185, 15, 47, 0.24);
        }

        .removeRecipeButton {
          border: 1px solid #b90f2f;
          color: #b90f2f;
          background-color: #fffaf3;
        }

        .contentGrid {
          display: grid;
          grid-template-columns: repeat(
            auto-fit,
            minmax(
              min(320px, 100%),
              1fr
            )
          );
          gap: 24px;
          margin-top: 28px;
        }

        .contentCard,
        .reviewSection {
          padding: 32px;
          border: 1px solid #ead7c4;
          border-radius: 26px;
          background-color: #fffaf3;
          box-shadow: 0 16px 42px
            rgba(95, 31, 35, 0.08);
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

        .sectionHeading span:not(
            .sectionIcon
          ) {
          display: block;
          margin-bottom: 3px;
          color: #b90f2f;
          font-family: Georgia, serif;
          font-size: 12px;
        }

        .sectionHeading h2 {
          margin: 0;
          color: #8f0d25;
          font-family: Georgia, serif;
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
          border-bottom: 1px dashed
            #ead7c4;
          color: #7c4a42;
          line-height: 1.6;
        }

        .ingredientDot {
          color: #b90f2f;
          flex-shrink: 0;
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
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
          margin-bottom: 28px;
        }

        .reviewHeadingArea h2 {
          margin: 4px 0 8px;
          color: #8f0d25;
          font-family: Georgia, serif;
          font-size: 32px;
        }

        .reviewHeadingArea p {
          margin: 0;
          color: #8a5c52;
        }

        .reviewCount {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 11px 16px;
          border: 1px solid #ead7c4;
          border-radius: 999px;
          color: #8f0d25;
          background-color: #f9eadf;
          font-size: 14px;
          font-weight: 700;
        }

        .reviewForm {
          margin-bottom: 30px;
          padding: 25px;
          border: 1px solid #ead7c4;
          border-radius: 22px;
          background-color: #fff7ed;
        }

        .reviewForm label {
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

        .reviewForm textarea {
          width: 100%;
          box-sizing: border-box;
          resize: vertical;
          padding: 15px;
          border: 1px solid #ead7c4;
          border-radius: 15px;
          outline: none;
          color: #5f1f23;
          background-color: #fffdf9;
          font-family: inherit;
          font-size: 15px;
          line-height: 1.6;
        }

        .submitReviewButton {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 17px;
          padding: 13px 20px;
          border: none;
          border-radius: 13px;
          color: white;
          background-color: #b90f2f;
          cursor: pointer;
          font-weight: 700;
        }

        .reviewMessage {
          margin: 15px 0 0;
          color: #b90f2f;
          font-size: 14px;
          font-weight: 600;
        }

        .reviewsList {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .emptyReview {
          padding: 42px 20px;
          border: 1px dashed #d8b9a6;
          border-radius: 20px;
          text-align: center;
          background-color: #fff7ed;
        }

        .emptyReview > span {
          color: #b90f2f;
          font-size: 30px;
        }

        .emptyReview h3 {
          margin: 10px 0 7px;
          color: #8f0d25;
          font-family: Georgia, serif;
        }

        .emptyReview p {
          margin: 0;
          color: #8a5c52;
        }

        .reviewCard {
          padding: 22px;
          border: 1px solid #ead7c4;
          border-radius: 20px;
          background-color: #fffdf9;
        }

        .reviewCardHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
        }

        .reviewUserArea {
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
          border-radius: 50%;
          color: white;
          background-color: #b90f2f;
          font-family: Georgia, serif;
          font-weight: 700;
        }

        .reviewUserArea h3 {
          margin: 0 0 3px;
          color: #5f1f23;
          font-size: 15px;
        }

        .reviewDate {
          color: #9a6b5f;
          font-size: 12px;
        }

        .deleteReviewButton {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #efd1cf;
          border-radius: 11px;
          color: #b90f2f;
          background-color: #fff0f2;
          cursor: pointer;
        }

        .reviewStars {
          display: flex;
          gap: 3px;
          margin: 14px 0 10px;
        }

        .reviewText {
          margin: 0;
          color: #7c4a42;
          line-height: 1.7;
        }

        @media (max-width: 820px) {
          .heroCard {
            grid-template-columns: 1fr;
          }

          .imageWrapper {
            min-height: 380px;
          }

          .heroContent {
            padding: 38px;
          }
        }

        @media (max-width: 520px) {
          .page {
            padding: 28px 14px 60px;
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
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}

const loadingPageStyle: CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "14px",
  backgroundColor: "#fff7ed",
};

const loadingTextStyle: CSSProperties = {
  margin: 0,
  color: "#8a5c52",
  fontFamily: "Georgia, serif",
  fontSize: "17px",
};

const notFoundPageStyle: CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  backgroundColor: "#fff7ed",
};

const notFoundCardStyle: CSSProperties = {
  width: "100%",
  maxWidth: "540px",
  padding: "45px 30px",
  border: "1px solid #ead7c4",
  borderRadius: "28px",
  textAlign: "center",
  backgroundColor: "#fffaf3",
  boxShadow:
    "0 24px 60px rgba(95,31,35,0.12)",
};

const notFoundIconStyle: CSSProperties = {
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

const decorationTextStyle: CSSProperties = {
  color: "#b90f2f",
  fontFamily: "Georgia, serif",
  letterSpacing: "1px",
};

const notFoundHeadingStyle: CSSProperties = {
  margin: "10px 0",
  color: "#8f0d25",
  fontFamily: "Georgia, serif",
  fontSize: "34px",
};

const notFoundDescriptionStyle: CSSProperties = {
  margin: "0 0 25px",
  color: "#8a5c52",
  lineHeight: "1.7",
};

const notFoundActionsStyle: CSSProperties = {
  display: "flex",
  justifyContent: "center",
  gap: "12px",
  flexWrap: "wrap",
};

const retryButtonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "13px 20px",
  border: "1px solid #b90f2f",
  borderRadius: "14px",
  color: "#b90f2f",
  backgroundColor: "#fffaf3",
  cursor: "pointer",
  fontWeight: "700",
};

const backHomeButtonStyle: CSSProperties = {
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