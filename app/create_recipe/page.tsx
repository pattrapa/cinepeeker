"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import Navbar from "@/app/components/Navbar";

import {
  ArrowLeft,
  ChefHat,
  Clock3,
  Eye,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";

type Recipe = {
  _id: string;
  ownerId?: string;
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

  const [recipeToDelete, setRecipeToDelete] =
    useState<Recipe | null>(null);

  const [
    deleteErrorMessage,
    setDeleteErrorMessage,
  ] = useState("");

  const accessToken = session?.accessToken;

  const displayName =
    session?.user?.username?.trim() ||
    session?.user?.name?.trim() ||
    "RecipePeeker User";

  useEffect(() => {
    if (sessionStatus === "loading") {
      return;
    }

    if (sessionStatus !== "authenticated") {
      router.replace(
        `/login?redirect=${encodeURIComponent(
          "/my_recipe",
        )}`,
      );
    }
  }, [router, sessionStatus]);

  const loadMyRecipes =
    useCallback(async (): Promise<void> => {
      if (!accessToken) {
        setRecipes([]);
        setIsLoading(false);
        setErrorMessage(
          "Authentication token was not found. Please log in again.",
        );
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        const response = await fetch(
          `${API_URL}/api/recipes/mine`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
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

        if (
          !response.ok ||
          !result.success
        ) {
          if (response.status === 401) {
            throw new Error(
              result.message ||
                "Your login session is invalid or has expired. Please log in again.",
            );
          }

          if (response.status === 403) {
            throw new Error(
              result.message ||
                "You do not have permission to view these recipes.",
            );
          }

          throw new Error(
            result.message ||
              "Unable to load your recipes.",
          );
        }

        setRecipes(
          Array.isArray(result.data)
            ? result.data
            : [],
        );
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
    }, [accessToken]);

  useEffect(() => {
    if (sessionStatus === "loading") {
      return;
    }

    if (sessionStatus !== "authenticated") {
      setIsLoading(false);
      return;
    }

    if (!accessToken) {
      setIsLoading(false);
      setErrorMessage(
        "Authentication token was not found. Please log in again.",
      );
      return;
    }

    void loadMyRecipes();
  }, [
    accessToken,
    loadMyRecipes,
    sessionStatus,
  ]);

  const openDeleteModal = (
    recipe: Recipe,
  ) => {
    setDeleteErrorMessage("");
    setRecipeToDelete(recipe);
  };

  const closeDeleteModal = () => {
    if (deletingRecipeId) {
      return;
    }

    setDeleteErrorMessage("");
    setRecipeToDelete(null);
  };

  useEffect(() => {
    if (!recipeToDelete) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (
        event.key === "Escape" &&
        !deletingRecipeId
      ) {
        setDeleteErrorMessage("");
        setRecipeToDelete(null);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    deletingRecipeId,
    recipeToDelete,
  ]);

  const handleDeleteRecipe = async (
    recipe: Recipe,
  ): Promise<void> => {
    if (!accessToken) {
      const message =
        "Authentication token was not found. Please log in again.";

      setDeleteErrorMessage(message);
      setErrorMessage(message);
      return;
    }

    try {
      setDeletingRecipeId(recipe._id);
      setDeleteErrorMessage("");
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(
        `${API_URL}/api/recipes/${recipe._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
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

      if (
        !response.ok ||
        !result.success
      ) {
        if (response.status === 401) {
          throw new Error(
            result.message ||
              "Your login session is invalid or has expired. Please log in again.",
          );
        }

        if (response.status === 403) {
          throw new Error(
            result.message ||
              "You do not have permission to delete this recipe.",
          );
        }

        if (response.status === 404) {
          throw new Error(
            result.message ||
              "This recipe could not be found.",
          );
        }

        throw new Error(
          result.message ||
            "Unable to delete this recipe.",
        );
      }

      setRecipes(
        (currentRecipes) =>
          currentRecipes.filter(
            (currentRecipe) =>
              currentRecipe._id !==
              recipe._id,
          ),
      );

      removeRecipeFromWatchlist(
        recipe._id,
      );

      setRecipeToDelete(null);

      setSuccessMessage(
        `Recipe "${recipe.title}" was deleted successfully.`,
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error(
        "Unable to delete recipe:",
        error,
      );

      const message =
        error instanceof Error
          ? error.message
          : "Unable to delete this recipe.";

      setDeleteErrorMessage(message);
      setErrorMessage(message);
    } finally {
      setDeletingRecipeId(null);
    }
  };

  if (sessionStatus === "loading") {
    return <LoadingPage />;
  }

  if (sessionStatus !== "authenticated") {
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
          onClick={() =>
            router.push("/")
          }
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
              View and manage recipes
              created by{" "}
              <strong>
                {displayName}
              </strong>
              .
            </p>
          </div>
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

            <h2>
              Loading your recipes...
            </h2>

            <p>
              กำลังดึงสูตรอาหารของคุณจาก
              MongoDB
            </p>
          </section>
        ) : errorMessage &&
          recipes.length === 0 ? (
          <section className="statusCard">
            <RefreshCw size={42} />

            <h2>
              Unable to load recipes
            </h2>

            <p>
              ตรวจสอบว่า Backend
              เปิดอยู่ที่ {API_URL}
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
              You have not published any
              recipes yet. Share your first
              recipe with RecipePeeker.
            </p>
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

                      <h2>
                        {recipe.title}
                      </h2>

                      <p className="description">
                        {recipe.description}
                      </p>

                      <div className="recipeMeta">
                        <span>
                          <Clock3
                            size={16}
                          />
                          {
                            recipe.timeMinutes
                          }{" "}
                          mins
                        </span>

                        <span>
                          <ChefHat
                            size={16}
                          />
                          {
                            recipe.servings
                          }{" "}
                          {recipe.servings ===
                          1
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
                          <Pencil
                            size={18}
                          />
                          Edit
                        </button>

                        <button
                          type="button"
                          disabled={
                            isDeleting
                          }
                          onClick={() =>
                            openDeleteModal(
                              recipe,
                            )
                          }
                          className="deleteButton"
                          aria-label={`Delete ${recipe.title}`}
                        >
                          {isDeleting ? (
                            <LoaderCircle
                              size={18}
                              className="buttonLoadingIcon"
                            />
                          ) : (
                            <Trash2
                              size={20}
                              strokeWidth={2.2}
                            />
                          )}

                          <span>
                            {isDeleting
                              ? "Deleting..."
                              : "Delete"}
                          </span>
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

      <button
        type="button"
        onClick={() =>
          router.push(
            "/create_recipe",
          )
        }
        className="floatingAddRecipeButton"
        aria-label="Add Recipe"
      >
        <Plus
          size={30}
          strokeWidth={2.4}
        />

        <span className="addRecipeTooltip">
          Add Recipe
        </span>
      </button>

      {recipeToDelete && (
        <div
          className="deleteModalOverlay"
          role="presentation"
          onMouseDown={closeDeleteModal}
        >
          <section
            className="deleteModal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            aria-describedby="delete-modal-description"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="deleteModalIcon">
              <Trash2
                size={30}
                strokeWidth={2.2}
              />
            </div>

            <span className="deleteModalEyebrow">
              Delete recipe
            </span>

            <h2 id="delete-modal-title">
              Are you sure?
            </h2>

            <p id="delete-modal-description">
              You are about to delete{" "}
              <strong>
                {recipeToDelete.title}
              </strong>
              . This action cannot be
              undone.
            </p>

            {deleteErrorMessage && (
              <div
                className="deleteModalError"
                role="alert"
              >
                {deleteErrorMessage}
              </div>
            )}

            <div className="deleteModalActions">
              <button
                type="button"
                disabled={Boolean(
                  deletingRecipeId,
                )}
                onClick={
                  closeDeleteModal
                }
                className="cancelDeleteButton"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={Boolean(
                  deletingRecipeId,
                )}
                onClick={() => {
                  void handleDeleteRecipe(
                    recipeToDelete,
                  );
                }}
                className="confirmDeleteButton"
              >
                {deletingRecipeId ? (
                  <LoaderCircle
                    size={18}
                    className="buttonLoadingIcon"
                  />
                ) : (
                  <Trash2
                    size={20}
                    strokeWidth={2.2}
                  />
                )}

                {deletingRecipeId
                  ? "Deleting..."
                  : "Delete Recipe"}
              </button>
            </div>
          </section>
        </div>
      )}

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
          font-family: inherit;
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

        .floatingAddRecipeButton {
          position: fixed;
          right: 28px;
          bottom: 28px;
          z-index: 1000;
          display: flex;
          width: 60px;
          height: 60px;
          align-items: center;
          justify-content: center;
          padding: 0;
          border: none;
          border-radius: 50%;
          color: white;
          background-color: #b90f2f;
          box-shadow: 0 14px 30px
            rgba(185, 15, 47, 0.3);
          cursor: pointer;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            background-color 0.2s ease;
        }

        .floatingAddRecipeButton:hover {
          transform: translateY(-3px)
            scale(1.04);
          background-color: #9f0c28;
          box-shadow: 0 18px 36px
            rgba(185, 15, 47, 0.38);
        }

        .floatingAddRecipeButton:focus-visible {
          outline: 3px solid
            rgba(185, 15, 47, 0.25);
          outline-offset: 4px;
        }

        .addRecipeTooltip {
          position: absolute;
          top: 50%;
          right: calc(100% + 12px);
          padding: 8px 13px;
          border-radius: 999px;
          color: white;
          background-color: #5f1f23;
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transform: translate(
            8px,
            -50%
          );
          transition:
            opacity 0.18s ease,
            transform 0.18s ease,
            visibility 0.18s ease;
        }

        .floatingAddRecipeButton:hover
          .addRecipeTooltip,
        .floatingAddRecipeButton:focus-visible
          .addRecipeTooltip {
          opacity: 1;
          visibility: visible;
          transform: translate(
            0,
            -50%
          );
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
          grid-template-columns:
            repeat(
              auto-fit,
              minmax(
                min(285px, 100%),
                1fr
              )
            );
          gap: 24px;
        }

        .recipeCard {
          display: flex;
          overflow: hidden;
          flex-direction: column;
          border: 1px solid #ead7c4;
          border-radius: 24px;
          background-color: #fffaf3;
          box-shadow: 0 17px 40px
            rgba(95, 31, 35, 0.1);
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .recipeCard:hover {
          transform: translateY(-3px);
          box-shadow: 0 22px 48px
            rgba(95, 31, 35, 0.14);
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
          background-color:
            rgba(255, 250, 243, 0.93);
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
          display: flex;
          flex: 1;
          flex-direction: column;
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
          border-top: 1px dashed #ead7c4;
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
            repeat(
              3,
              minmax(0, 1fr)
            );
          gap: 10px;
          margin-top: auto;
          padding-top: 18px;
        }

        .viewButton,
        .editButton,
        .deleteButton,
        .retryButton {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          min-width: 0;
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

        .viewButton:hover:not(
            :disabled
          ) {
          background-color: #9f0c28;
          box-shadow: 0 9px 20px
            rgba(185, 15, 47, 0.2);
          transform: translateY(-1px);
        }

        .editButton {
          border: 1px solid #b90f2f;
          color: #b90f2f;
          background-color: #fffaf3;
        }

        .editButton:hover:not(
            :disabled
          ) {
          color: white;
          background-color: #b90f2f;
          box-shadow: 0 9px 20px
            rgba(185, 15, 47, 0.18);
          transform: translateY(-1px);
        }

        .deleteButton {
          border: 1px solid #e6aeb4;
          color: #a70d28;
          background-color: #fff3f4;
        }

        .deleteButton:hover:not(
            :disabled
          ) {
          border-color: #b90f2f;
          color: white;
          background-color: #b90f2f;
          box-shadow: 0 9px 20px
            rgba(185, 15, 47, 0.2);
          transform: translateY(-1px);
        }

        .viewButton,
        .editButton,
        .deleteButton {
          transition:
            color 0.2s ease,
            border-color 0.2s ease,
            background-color 0.2s ease,
            box-shadow 0.2s ease,
            transform 0.2s ease;
        }

        .viewButton:disabled,
        .editButton:disabled,
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

        .deleteModalOverlay {
          position: fixed;
          inset: 0;
          z-index: 3000;
          display: grid;
          place-items: center;
          box-sizing: border-box;
          padding: 20px;
          background-color:
            rgba(55, 20, 24, 0.5);
          backdrop-filter: blur(5px);
          animation: modalFadeIn
            0.18s ease;
        }

        .deleteModal {
          width: 100%;
          max-width: 430px;
          box-sizing: border-box;
          padding: 34px;
          border: 1px solid #ead7c4;
          border-radius: 26px;
          color: #5f1f23;
          background-color: #fffaf3;
          box-shadow: 0 28px 70px
            rgba(55, 20, 24, 0.28);
          text-align: center;
          animation: modalScaleIn
            0.2s ease;
        }

        .deleteModalIcon {
          width: 66px;
          height: 66px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 17px;
          border-radius: 50%;
          color: #b90f2f;
          background-color: #ffe7e9;
        }

        .deleteModalEyebrow {
          display: block;
          margin-bottom: 7px;
          color: #b90f2f;
          font-family: Georgia, serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .deleteModal h2 {
          margin: 0 0 12px;
          color: #8f0d25;
          font-family: Georgia, serif;
          font-size: 31px;
          font-weight: 500;
        }

        .deleteModal p {
          margin: 0;
          color: #8a5c52;
          line-height: 1.7;
        }

        .deleteModal p strong {
          color: #8f0d25;
        }

        .deleteModalError {
          margin-top: 16px;
          padding: 11px 13px;
          border: 1px solid #f1c4cb;
          border-radius: 12px;
          color: #b90f2f;
          background-color: #fff0f2;
          font-size: 13px;
          font-weight: 600;
          line-height: 1.5;
        }

        .deleteModalActions {
          display: grid;
          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );
          gap: 12px;
          margin-top: 27px;
        }

        .cancelDeleteButton,
        .confirmDeleteButton {
          min-height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 17px;
          border-radius: 14px;
          cursor: pointer;
          font-family: inherit;
          font-weight: 800;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            background-color 0.2s ease;
        }

        .cancelDeleteButton {
          border: 1px solid #d8c4b3;
          color: #7c4a42;
          background-color: #fffdf9;
        }

        .cancelDeleteButton:hover:not(
            :disabled
          ) {
          background-color: #f8ede3;
        }

        .confirmDeleteButton {
          border: none;
          color: white;
          background-color: #b90f2f;
          box-shadow: 0 11px 24px
            rgba(185, 15, 47, 0.24);
        }

        .confirmDeleteButton:hover:not(
            :disabled
          ) {
          transform: translateY(-1px);
          background-color: #9f0c28;
          box-shadow: 0 15px 29px
            rgba(185, 15, 47, 0.3);
        }

        .cancelDeleteButton:disabled,
        .confirmDeleteButton:disabled {
          cursor: not-allowed;
          opacity: 0.65;
        }

        @keyframes modalFadeIn {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes modalScaleIn {
          from {
            opacity: 0;
            transform:
              translateY(10px)
              scale(0.97);
          }

          to {
            opacity: 1;
            transform:
              translateY(0)
              scale(1);
          }
        }

        :global(.loadingIcon),
        :global(.buttonLoadingIcon) {
          animation: spin 0.9s
            linear infinite;
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
        }

        @media (max-width: 560px) {
          .pageContainer {
            padding: 30px 14px 86px;
          }

          .cardActions {
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );
          }

          .deleteButton {
            grid-column: 1 / -1;
          }

          .floatingAddRecipeButton {
            right: 16px;
            bottom: max(
              16px,
              env(
                safe-area-inset-bottom
              )
            );
            width: 54px;
            height: 54px;
          }

          .addRecipeTooltip {
            display: none;
          }

          .deleteModal {
            padding: 28px 20px;
            border-radius: 22px;
          }

          .deleteModalActions {
            grid-template-columns: 1fr;
          }

          .confirmDeleteButton {
            grid-row: 1;
          }

          .cancelDeleteButton {
            grid-row: 2;
          }
        }

        @media (
          prefers-reduced-motion:
            reduce
        ) {
          .recipeCard,
          .floatingAddRecipeButton,
          .viewButton,
          .editButton,
          .deleteButton,
          .deleteModalOverlay,
          .deleteModal {
            animation: none;
            transition: none;
          }

          :global(.loadingIcon),
          :global(
            .buttonLoadingIcon
          ) {
            animation-duration: 1.8s;
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
      localStorage.getItem(
        "watchlist",
      );

    if (!storedWatchlist) {
      return;
    }

    const parsedWatchlist: unknown =
      JSON.parse(storedWatchlist);

    if (
      !Array.isArray(
        parsedWatchlist,
      )
    ) {
      return;
    }

    const updatedWatchlist =
      parsedWatchlist.filter(
        (item) => {
          if (
            typeof item !==
              "object" ||
            item === null
          ) {
            return true;
          }

          const savedItem =
            item as {
              id?: unknown;
            };

          return (
            String(savedItem.id) !==
            String(recipeId)
          );
        },
      );

    localStorage.setItem(
      "watchlist",
      JSON.stringify(
        updatedWatchlist,
      ),
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
          animation: spin 0.9s
            linear infinite;
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