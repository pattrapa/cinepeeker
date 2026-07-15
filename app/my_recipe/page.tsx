"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  useSession,
} from "next-auth/react";

import Navbar from "@/app/components/Navbar";

import {
  ArrowLeft,
  ChefHat,
  Clock3,
  Eye,
  LoaderCircle,
  Pencil,
  PlusCircle,
  RefreshCw,
  Trash2,
} from "lucide-react";

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

type RecipesResponse = {
  success: boolean;
  count?: number;
  data?: Recipe[];
  message?: string;
};

type DeleteRecipeResponse = {
  success: boolean;
  message?: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000";

export default function MyRecipesPage() {
  const router = useRouter();

  const {
    data: session,
    status: sessionStatus,
  } = useSession();

  const [isMockLoggedIn, setIsMockLoggedIn] =
    useState(false);

  const [mockUserName, setMockUserName] =
    useState("RecipePeeker User");

  const [isAuthChecked, setIsAuthChecked] =
    useState(false);

  const [recipes, setRecipes] =
    useState<Recipe[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [deletingRecipeId, setDeletingRecipeId] =
    useState<string | null>(null);

  const isGoogleLoggedIn =
    sessionStatus === "authenticated";

  const isLoggedIn =
    isMockLoggedIn || isGoogleLoggedIn;

  const authorName =
    session?.user?.name?.trim() ||
    mockUserName ||
    "RecipePeeker User";

  useEffect(() => {
    const mockLoginStatus =
      localStorage.getItem("isLoggedIn") ===
      "true";

    const storedMockUser =
      localStorage.getItem("mockUser")?.trim();

    setIsMockLoggedIn(mockLoginStatus);

    setMockUserName(
      storedMockUser ||
        "RecipePeeker User",
    );

    setIsAuthChecked(true);
  }, []);

  useEffect(() => {
    if (!isAuthChecked) {
      return;
    }

    if (sessionStatus === "loading") {
      return;
    }

    if (!isLoggedIn) {
      router.replace(
        `/login?redirect=${encodeURIComponent(
          "/my_recipes",
        )}`,
      );
    }
  }, [
    isAuthChecked,
    isLoggedIn,
    router,
    sessionStatus,
  ]);

  const loadMyRecipes =
    useCallback(async (): Promise<void> => {
      try {
        setIsLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        const response = await fetch(
          `${API_URL}/api/recipes`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const responseText =
          await response.text();

        let result: RecipesResponse;

        try {
          result = JSON.parse(
            responseText,
          ) as RecipesResponse;
        } catch {
          throw new Error(
            responseText ||
              "The server returned an invalid response.",
          );
        }

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ||
              "Unable to load your recipes.",
          );
        }

        const allRecipes = Array.isArray(
          result.data,
        )
          ? result.data
          : [];

        const normalizedAuthorName =
          authorName.toLowerCase().trim();

        const myRecipes = allRecipes.filter(
          (recipe) =>
            (
              recipe.authorName ||
              "RecipePeeker User"
            )
              .toLowerCase()
              .trim() ===
            normalizedAuthorName,
        );

        setRecipes(myRecipes);
      } catch (error) {
        console.error(
          "Unable to load my recipes:",
          error,
        );

        setRecipes([]);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load your recipes.",
        );
      } finally {
        setIsLoading(false);
      }
    }, [authorName]);

  useEffect(() => {
    if (!isAuthChecked) {
      return;
    }

    if (sessionStatus === "loading") {
      return;
    }

    if (!isLoggedIn) {
      setIsLoading(false);
      return;
    }

    void loadMyRecipes();
  }, [
    isAuthChecked,
    isLoggedIn,
    loadMyRecipes,
    sessionStatus,
  ]);

  const handleDeleteRecipe = async (
    recipe: Recipe,
  ): Promise<void> => {
    const confirmed = window.confirm(
      `Delete "${recipe.title}"?\n\nThis action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingRecipeId(recipe._id);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(
        `${API_URL}/api/recipes/${recipe._id}`,
        {
          method: "DELETE",
        },
      );

      const responseText =
        await response.text();

      let result: DeleteRecipeResponse;

      try {
        result = JSON.parse(
          responseText,
        ) as DeleteRecipeResponse;
      } catch {
        throw new Error(
          responseText ||
            "The server returned an invalid response.",
        );
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to delete this recipe.",
        );
      }

      setRecipes((currentRecipes) =>
        currentRecipes.filter(
          (currentRecipe) =>
            currentRecipe._id !== recipe._id,
        ),
      );

      removeRecipeFromWatchlist(
        recipe._id,
      );

      setSuccessMessage(
        `Recipe "${recipe.title}" was deleted successfully.`,
      );
    } catch (error) {
      console.error(
        "Unable to delete recipe:",
        error,
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to delete this recipe.",
      );
    } finally {
      setDeletingRecipeId(null);
    }
  };

  if (
    !isAuthChecked ||
    sessionStatus === "loading"
  ) {
    return <LoadingPage />;
  }

  if (!isLoggedIn) {
    return (
      <LoadingPage message="Redirecting to login..." />
    );
  }

  return (
    <main className="page">
      <Navbar />

      <div className="pageContainer">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="backButton"
        >
          <ArrowLeft size={18} />
          Back to Home
        </button>

        <header className="pageHeader">
          <div>
            <span className="eyebrow">
              ❦ YOUR RECIPE COLLECTION ❦
            </span>

            <h1>My Recipes</h1>

            <p>
              View and manage recipes created by{" "}
              <strong>{authorName}</strong>.
            </p>
          </div>

          <a
            href="/create_recipe"
            className="addRecipeButton"
          >
            <PlusCircle size={19} />
            Add Recipe
          </a>
        </header>

        {successMessage && (
          <div className="message successMessage">
            ❦ {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="message errorMessage">
            {errorMessage}
          </div>
        )}

        {isLoading ? (
          <section className="statusCard">
            <LoaderCircle
              size={42}
              className="loadingIcon"
            />

            <h2>Loading your recipes...</h2>

            <p>
              กำลังดึงสูตรอาหารของคุณจาก
              MongoDB
            </p>
          </section>
        ) : errorMessage &&
          recipes.length === 0 ? (
          <section className="statusCard">
            <RefreshCw size={42} />

            <h2>Unable to load recipes</h2>

            <p>
              ตรวจสอบว่า Backend เปิดอยู่ที่{" "}
              {API_URL}
            </p>

            <button
              type="button"
              onClick={() => {
                void loadMyRecipes();
              }}
              className="retryButton"
            >
              <RefreshCw size={18} />
              Try Again
            </button>
          </section>
        ) : recipes.length === 0 ? (
          <section className="statusCard">
            <ChefHat size={48} />

            <h2>No recipes yet</h2>

            <p>
              You have not published any recipes
              yet. Share your first recipe with
              RecipePeeker.
            </p>

            <a
              href="/create_recipe"
              className="emptyAddButton"
            >
              <PlusCircle size={18} />
              Create My First Recipe
            </a>
          </section>
        ) : (
          <>
            <div className="recipeCount">
              {recipes.length}{" "}
              {recipes.length === 1
                ? "Recipe"
                : "Recipes"}
            </div>

            <section className="recipeGrid">
              {recipes.map((recipe) => {
                const isDeleting =
                  deletingRecipeId ===
                  recipe._id;

                return (
                  <article
                    key={recipe._id}
                    className="recipeCard"
                  >
                    <div className="imageWrapper">
                      <img
                        src={recipe.imageUrl}
                        alt={recipe.title}
                      />

                      <span className="categoryBadge">
                        {recipe.category}
                      </span>

                      <span className="difficultyBadge">
                        {recipe.difficulty}
                      </span>
                    </div>

                    <div className="cardContent">
                      <span className="cardDecoration">
                        ❦ My Recipe
                      </span>

                      <h2>{recipe.title}</h2>

                      <p className="description">
                        {recipe.description}
                      </p>

                      <div className="recipeMeta">
                        <span>
                          <Clock3 size={16} />
                          {recipe.timeMinutes} mins
                        </span>

                        <span>
                          <ChefHat size={16} />
                          {recipe.servings}{" "}
                          {recipe.servings === 1
                            ? "serving"
                            : "servings"}
                        </span>
                      </div>

                      <div className="cardActions">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/trailer/${recipe._id}`,
                            )
                          }
                          className="viewButton"
                        >
                          <Eye size={18} />
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/edit_recipe/${recipe._id}`,
                            )
                          }
                          className="editButton"
                        >
                          <Pencil size={18} />
                          Edit
                        </button>

                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => {
                            void handleDeleteRecipe(
                              recipe,
                            );
                          }}
                          className="deleteButton"
                          aria-label={`Delete ${recipe.title}`}
                        >
                          {isDeleting ? (
                            <LoaderCircle
                              size={18}
                              className="buttonLoadingIcon"
                            />
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          </>
        )}
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          color: #5f1f23;
          background:
            radial-gradient(
              circle at top left,
              rgba(255, 255, 255, 0.96),
              transparent 28%
            ),
            radial-gradient(
              circle at bottom right,
              rgba(217, 32, 69, 0.07),
              transparent 32%
            ),
            #fff7ed;
        }

        .pageContainer {
          width: 100%;
          max-width: 1180px;
          box-sizing: border-box;
          margin: 0 auto;
          padding: 42px 24px 80px;
        }

        .backButton {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 25px;
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

        .pageHeader {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 30px;
        }

        .eyebrow {
          display: block;
          margin-bottom: 8px;
          color: #b90f2f;
          font-family: Georgia, serif;
          font-size: 13px;
          letter-spacing: 1.2px;
        }

        .pageHeader h1 {
          margin: 0 0 9px;
          color: #8f0d25;
          font-family: Georgia, serif;
          font-size: clamp(
            40px,
            6vw,
            58px
          );
          font-weight: 500;
        }

        .pageHeader p {
          margin: 0;
          color: #8a5c52;
          line-height: 1.7;
        }

        .pageHeader strong {
          color: #b90f2f;
        }

        .addRecipeButton,
        .emptyAddButton {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 14px 21px;
          border-radius: 15px;
          color: white;
          background-color: #b90f2f;
          box-shadow: 0 12px 27px
            rgba(185, 15, 47, 0.22);
          text-decoration: none;
          font-weight: 700;
        }

        .message {
          margin-bottom: 24px;
          padding: 15px 19px;
          border-radius: 15px;
          font-weight: 600;
          line-height: 1.6;
        }

        .successMessage {
          border: 1px solid #cce6d1;
          color: #3f7b50;
          background-color: #edf7ee;
        }

        .errorMessage {
          border: 1px solid #f1c4cb;
          color: #b90f2f;
          background-color: #fff0f2;
        }

        .recipeCount {
          margin-bottom: 18px;
          color: #8a5c52;
          font-size: 14px;
          font-weight: 700;
        }

        .recipeGrid {
          display: grid;
          grid-template-columns: repeat(
            auto-fit,
            minmax(
              min(285px, 100%),
              1fr
            )
          );
          gap: 24px;
        }

        .recipeCard {
          overflow: hidden;
          border: 1px solid #ead7c4;
          border-radius: 24px;
          background-color: #fffaf3;
          box-shadow: 0 17px 40px
            rgba(95, 31, 35, 0.1);
        }

        .imageWrapper {
          position: relative;
          height: 220px;
          overflow: hidden;
          background-color: #f9eadf;
        }

        .imageWrapper img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .categoryBadge,
        .difficultyBadge {
          position: absolute;
          padding: 7px 12px;
          border: 1px solid
            rgba(255, 255, 255, 0.75);
          border-radius: 999px;
          color: #8f0d25;
          background-color: rgba(
            255,
            250,
            243,
            0.93
          );
          backdrop-filter: blur(7px);
          font-size: 12px;
          font-weight: 700;
        }

        .categoryBadge {
          bottom: 14px;
          left: 14px;
        }

        .difficultyBadge {
          right: 14px;
          bottom: 14px;
        }

        .cardContent {
          padding: 22px;
        }

        .cardDecoration {
          color: #b90f2f;
          font-family: Georgia, serif;
          font-size: 12px;
          letter-spacing: 0.7px;
        }

        .cardContent h2 {
          margin: 8px 0 10px;
          color: #8f0d25;
          font-family: Georgia, serif;
          font-size: 24px;
          font-weight: 500;
          line-height: 1.35;
        }

        .description {
          display: -webkit-box;
          min-height: 49px;
          overflow: hidden;
          margin: 0 0 16px;
          color: #8a5c52;
          line-height: 1.6;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        .recipeMeta {
          display: flex;
          align-items: center;
          gap: 13px;
          flex-wrap: wrap;
          padding: 14px 0;
          border-top: 1px dashed
            #ead7c4;
          border-bottom: 1px dashed
            #ead7c4;
        }

        .recipeMeta span {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #7c4a42;
          font-size: 13px;
          font-weight: 600;
        }

        .cardActions {
          display: grid;
          grid-template-columns:
            1fr 1fr 44px;
          gap: 10px;
          margin-top: 18px;
        }

        .viewButton,
        .editButton,
        .deleteButton,
        .retryButton {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 12px 13px;
          border-radius: 13px;
          cursor: pointer;
          font-family: inherit;
          font-weight: 700;
        }

        .viewButton {
          border: none;
          color: white;
          background-color: #b90f2f;
        }

        .editButton {
          border: 1px solid #b90f2f;
          color: #b90f2f;
          background-color: #fffaf3;
        }

        .deleteButton {
          border: 1px solid #efd1cf;
          color: #b90f2f;
          background-color: #fff0f2;
        }

        .deleteButton:disabled {
          cursor: not-allowed;
          opacity: 0.65;
        }

        .statusCard {
          max-width: 680px;
          box-sizing: border-box;
          margin: 30px auto 0;
          padding: 45px 28px;
          border: 1px solid #ead7c4;
          border-radius: 27px;
          color: #8a5c52;
          background-color: #fffaf3;
          box-shadow: 0 18px 45px
            rgba(95, 31, 35, 0.1);
          text-align: center;
        }

        .statusCard :global(svg) {
          color: #b90f2f;
        }

        .statusCard h2 {
          margin: 15px 0 8px;
          color: #8f0d25;
          font-family: Georgia, serif;
          font-size: 27px;
        }

        .statusCard p {
          margin: 0 0 22px;
          line-height: 1.7;
        }

        .retryButton {
          margin: 0 auto;
          border: none;
          color: white;
          background-color: #b90f2f;
        }

        :global(.loadingIcon),
        :global(.buttonLoadingIcon) {
          animation: spin 0.9s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 720px) {
          .pageHeader {
            align-items: flex-start;
            flex-direction: column;
          }

          .addRecipeButton {
            width: 100%;
            box-sizing: border-box;
          }
        }

        @media (max-width: 480px) {
          .pageContainer {
            padding: 30px 14px 60px;
          }

          .cardActions {
            grid-template-columns: 1fr;
          }

          .deleteButton {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}

function removeRecipeFromWatchlist(
  recipeId: string,
): void {
  try {
    const storedWatchlist =
      localStorage.getItem("watchlist");

    if (!storedWatchlist) {
      return;
    }

    const parsedWatchlist: unknown =
      JSON.parse(storedWatchlist);

    if (!Array.isArray(parsedWatchlist)) {
      return;
    }

    const updatedWatchlist =
      parsedWatchlist.filter((item) => {
        if (
          typeof item !== "object" ||
          item === null
        ) {
          return true;
        }

        const savedItem = item as {
          id?: unknown;
        };

        return (
          String(savedItem.id) !==
          String(recipeId)
        );
      });

    localStorage.setItem(
      "watchlist",
      JSON.stringify(updatedWatchlist),
    );

    localStorage.removeItem(
      `reviews-${recipeId}`,
    );
  } catch (error) {
    console.error(
      "Unable to clean saved recipe data:",
      error,
    );
  }
}

function LoadingPage({
  message = "Preparing your recipes...",
}: {
  message?: string;
}) {
  return (
    <main className="loadingPage">
      <LoaderCircle
        size={44}
        className="loadingIcon"
      />

      <p>{message}</p>

      <style jsx>{`
        .loadingPage {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          color: #8a5c52;
          background-color: #fff7ed;
        }

        .loadingPage p {
          margin: 0;
          font-family: Georgia, serif;
          font-size: 17px;
        }

        :global(.loadingIcon) {
          color: #b90f2f;
          animation: spin 0.9s linear infinite;
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