"use client";

import type {
  CSSProperties,
} from "react";

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

import {
  ArrowLeft,
  ChefHat,
  CookingPot,
  Eye,
  Heart,
  LoaderCircle,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";

type SavedRecipeStatus =
  | "Want to Watch"
  | "Watched"
  | "Favorite";

type RecipeSummary = {
  _id: string;
  title: string;
  category: string;
  imageUrl: string;
};

type SavedRecipeItem = {
  _id: string;
  status: SavedRecipeStatus;
  createdAt?: string;
  updatedAt?: string;
  recipe: RecipeSummary;
};

type SavedRecipesResponse = {
  success: boolean;
  message?: string;
  count?: number;
  data?: SavedRecipeItem[];
};

type SavedRecipeMutationResponse = {
  success: boolean;
  message?: string;
  errors?: string[];

  data?: {
    _id: string;
    userId: string;
    recipeId: string;
    status: SavedRecipeStatus;
    createdAt?: string;
    updatedAt?: string;
  };
};

type MessageType =
  | "success"
  | "error"
  | "";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000";

const statusOptions: {
  value: SavedRecipeStatus;
  label: string;
}[] = [
  {
    value: "Want to Watch",
    label: "Want to Cook",
  },
  {
    value: "Watched",
    label: "Cooked",
  },
  {
    value: "Favorite",
    label: "Favorite",
  },
];

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

export default function WatchlistPage() {
  const router =
    useRouter();

  const {
    data: session,
    status: sessionStatus,
  } = useSession();

  const accessToken =
    session?.accessToken;

  const [
    savedRecipes,
    setSavedRecipes,
  ] = useState<SavedRecipeItem[]>(
    [],
  );

  const [
    isLoadingRecipes,
    setIsLoadingRecipes,
  ] = useState(true);

  const [
    pageError,
    setPageError,
  ] = useState("");

  const [
    pageMessage,
    setPageMessage,
  ] = useState("");

  const [
    messageType,
    setMessageType,
  ] = useState<MessageType>("");

  const [
    updatingRecipeId,
    setUpdatingRecipeId,
  ] = useState<string | null>(
    null,
  );

  const [
    removingRecipeId,
    setRemovingRecipeId,
  ] = useState<string | null>(
    null,
  );

  const isLoggedIn =
    sessionStatus ===
    "authenticated";

  useEffect(() => {
    if (
      sessionStatus === "loading"
    ) {
      return;
    }

    if (!isLoggedIn) {
      router.replace(
        `/login?redirect=${encodeURIComponent(
          "/watchlist",
        )}`,
      );
    }
  }, [
    isLoggedIn,
    router,
    sessionStatus,
  ]);

  const loadSavedRecipes =
    useCallback(
      async (): Promise<void> => {
        if (
          sessionStatus ===
          "loading"
        ) {
          return;
        }

        if (!isLoggedIn) {
          setIsLoadingRecipes(
            false,
          );

          return;
        }

        if (!accessToken) {
          setSavedRecipes([]);

          setPageError(
            "Authentication token was not found. Please log in again.",
          );

          setIsLoadingRecipes(
            false,
          );

          return;
        }

        try {
          setIsLoadingRecipes(
            true,
          );

          setPageError("");

          const response =
            await fetch(
              `${API_URL}/api/saved-recipes`,
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
            await parseJsonResponse<
              SavedRecipesResponse
            >(response);

          if (
            response.status === 401
          ) {
            router.replace(
              `/login?redirect=${encodeURIComponent(
                "/watchlist",
              )}`,
            );

            return;
          }

          if (
            !response.ok ||
            !result.success
          ) {
            throw new Error(
              result.message ||
                "Unable to load saved recipes.",
            );
          }

          setSavedRecipes(
            Array.isArray(result.data)
              ? result.data
              : [],
          );
        } catch (error) {
          setSavedRecipes([]);

          setPageError(
            error instanceof Error
              ? error.message
              : "Unable to load saved recipes.",
          );
        } finally {
          setIsLoadingRecipes(
            false,
          );
        }
      },
      [
        accessToken,
        isLoggedIn,
        router,
        sessionStatus,
      ],
    );

  useEffect(() => {
    void loadSavedRecipes();
  }, [loadSavedRecipes]);

  const clearPageMessage =
    () => {
      setPageMessage("");
      setMessageType("");
    };

  const handleStatusChange =
    async (
      recipeId: string,
      newStatus:
        SavedRecipeStatus,
    ): Promise<void> => {
      clearPageMessage();

      if (!accessToken) {
        setPageMessage(
          "Authentication token was not found. Please log in again.",
        );

        setMessageType("error");
        return;
      }

      const currentRecipe =
        savedRecipes.find(
          (savedRecipe) =>
            savedRecipe.recipe
              ._id === recipeId,
        );

      if (
        !currentRecipe ||
        currentRecipe.status ===
          newStatus
      ) {
        return;
      }

      try {
        setUpdatingRecipeId(
          recipeId,
        );

        const response =
          await fetch(
            `${API_URL}/api/saved-recipes/${encodeURIComponent(
              recipeId,
            )}`,
            {
              method: "PATCH",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${accessToken}`,
              },

              body: JSON.stringify({
                status: newStatus,
              }),
            },
          );

        const result =
          await parseJsonResponse<
            SavedRecipeMutationResponse
          >(response);

        if (
          response.status === 401
        ) {
          router.replace(
            `/login?redirect=${encodeURIComponent(
              "/watchlist",
            )}`,
          );

          return;
        }

        if (
          !response.ok ||
          !result.success
        ) {
          const validationErrors =
            result.errors?.join(
              " ",
            ) ?? "";

          throw new Error(
            `${
              result.message ||
              "Unable to update the saved recipe."
            } ${validationErrors}`.trim(),
          );
        }

        setSavedRecipes(
          (previousRecipes) =>
            previousRecipes.map(
              (savedRecipe) =>
                savedRecipe.recipe
                  ._id === recipeId
                  ? {
                      ...savedRecipe,
                      status:
                        result.data
                          ?.status ??
                        newStatus,
                    }
                  : savedRecipe,
            ),
        );

        setPageMessage(
          result.message ||
            "Cooking status updated successfully.",
        );

        setMessageType(
          "success",
        );
      } catch (error) {
        setPageMessage(
          error instanceof Error
            ? error.message
            : "Unable to update the saved recipe.",
        );

        setMessageType("error");
      } finally {
        setUpdatingRecipeId(
          null,
        );
      }
    };

  const handleRemoveRecipe =
    async (
      recipeId: string,
    ): Promise<void> => {
      clearPageMessage();

      if (!accessToken) {
        setPageMessage(
          "Authentication token was not found. Please log in again.",
        );

        setMessageType("error");
        return;
      }

      try {
        setRemovingRecipeId(
          recipeId,
        );

        const response =
          await fetch(
            `${API_URL}/api/saved-recipes/${encodeURIComponent(
              recipeId,
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
          await parseJsonResponse<
            SavedRecipeMutationResponse
          >(response);

        if (
          response.status === 401
        ) {
          router.replace(
            `/login?redirect=${encodeURIComponent(
              "/watchlist",
            )}`,
          );

          return;
        }

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              "Unable to remove the saved recipe.",
          );
        }

        setSavedRecipes(
          (previousRecipes) =>
            previousRecipes.filter(
              (savedRecipe) =>
                savedRecipe.recipe
                  ._id !== recipeId,
            ),
        );

        setPageMessage(
          result.message ||
            "Recipe removed from saved recipes.",
        );

        setMessageType(
          "success",
        );
      } catch (error) {
        setPageMessage(
          error instanceof Error
            ? error.message
            : "Unable to remove the saved recipe.",
        );

        setMessageType("error");
      } finally {
        setRemovingRecipeId(
          null,
        );
      }
    };

  const handleViewRecipe = (
    recipeId: string,
  ) => {
    router.push(
      `/trailer/${encodeURIComponent(
        recipeId,
      )}`,
    );
  };

  const getStatusLabel = (
    status: SavedRecipeStatus,
  ) => {
    const matchedStatus =
      statusOptions.find(
        (option) =>
          option.value === status,
      );

    return (
      matchedStatus?.label ||
      status
    );
  };

  if (
    sessionStatus ===
      "loading" ||
    isLoadingRecipes
  ) {
    return (
      <main
        style={
          loadingPageStyle
        }
      >
        <div
          style={
            loadingIconStyle
          }
        >
          <CookingPot
            size={39}
            strokeWidth={1.7}
          />
        </div>

        <p
          style={
            loadingTextStyle
          }
        >
          Preparing your saved
          recipes...
        </p>
      </main>
    );
  }

  if (!isLoggedIn) {
    return (
      <main
        style={
          loadingPageStyle
        }
      >
        <div
          style={
            loadingIconStyle
          }
        >
          <CookingPot
            size={39}
            strokeWidth={1.7}
          />
        </div>

        <p
          style={
            loadingTextStyle
          }
        >
          Redirecting to login...
        </p>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div
        style={
          pageContainerStyle
        }
      >
        <button
          type="button"
          onClick={() =>
            router.push("/")
          }
          style={
            backButtonStyle
          }
        >
          <ArrowLeft size={18} />
          Back to Home
        </button>

        <section
          style={
            headingSectionStyle
          }
        >
          <div
            style={
              headingDecorationStyle
            }
          >
            ❦ Your personal
            collection ❦
          </div>

          <div
            className="saved-heading-row"
            style={
              headingRowStyle
            }
          >
            <div>
              <h1
                style={
                  pageHeadingStyle
                }
              >
                Saved Recipes
              </h1>

              <p
                style={
                  pageDescriptionStyle
                }
              >
                Keep your favorite
                recipes together and
                organize what you
                would love to cook
                next.
              </p>
            </div>

            <div
              style={
                recipeCountStyle
              }
            >
              <Heart
                size={19}
                color="#b90f2f"
                fill="#b90f2f"
              />

              <span>
                {
                  savedRecipes.length
                }{" "}
                {savedRecipes.length ===
                1
                  ? "Recipe"
                  : "Recipes"}
              </span>
            </div>
          </div>
        </section>

        {pageMessage && (
          <div
            role={
              messageType ===
              "success"
                ? "status"
                : "alert"
            }
            style={{
              ...pageMessageStyle,

              ...(messageType ===
              "success"
                ? successMessageStyle
                : errorMessageStyle),
            }}
          >
            {pageMessage}
          </div>
        )}

        {pageError ? (
          <section
            style={
              emptyStateStyle
            }
          >
            <div
              style={
                emptyDecorationTopStyle
              }
            >
              ✧ ❦ ✧
            </div>

            <div
              style={
                emptyIconStyle
              }
            >
              <RefreshCw
                size={45}
                strokeWidth={1.6}
              />
            </div>

            <h2
              style={
                emptyHeadingStyle
              }
            >
              Unable to load saved
              recipes
            </h2>

            <p
              style={
                emptyDescriptionStyle
              }
            >
              {pageError}
            </p>

            <button
              type="button"
              onClick={() => {
                void loadSavedRecipes();
              }}
              style={
                exploreButtonStyle
              }
            >
              <RefreshCw
                size={19}
              />

              Try Again
            </button>

            <div
              style={
                emptyDecorationBottomStyle
              }
            >
              ❧ ♡ ❦
            </div>
          </section>
        ) : savedRecipes.length ===
          0 ? (
          <section
            style={
              emptyStateStyle
            }
          >
            <div
              style={
                emptyDecorationTopStyle
              }
            >
              ✧ ❦ ✧
            </div>

            <div
              style={
                emptyIconStyle
              }
            >
              <ChefHat
                size={50}
                strokeWidth={1.5}
              />
            </div>

            <h2
              style={
                emptyHeadingStyle
              }
            >
              Your recipe collection
              is empty
            </h2>

            <p
              style={
                emptyDescriptionStyle
              }
            >
              Explore RecipePeeker
              and save recipes that
              inspire your next cozy
              meal.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/search",
                )
              }
              style={
                exploreButtonStyle
              }
            >
              <Sparkles
                size={19}
              />

              Explore Recipes
            </button>

            <div
              style={
                emptyDecorationBottomStyle
              }
            >
              ❧ ♡ ❦
            </div>
          </section>
        ) : (
          <section
            style={
              recipeGridStyle
            }
          >
            {savedRecipes.map(
              (savedRecipe) => {
                const recipe =
                  savedRecipe.recipe;

                const isUpdating =
                  updatingRecipeId ===
                  recipe._id;

                const isRemoving =
                  removingRecipeId ===
                  recipe._id;

                const isBusy =
                  isUpdating ||
                  isRemoving;

                return (
                  <article
                    key={
                      savedRecipe._id
                    }
                    style={
                      recipeCardStyle
                    }
                  >
                    <div
                      style={
                        imageWrapperStyle
                      }
                    >
                      <img
                        src={
                          recipe.imageUrl
                        }
                        alt={
                          recipe.title
                        }
                        style={
                          recipeImageStyle
                        }
                      />

                      <div
                        style={
                          imageOverlayStyle
                        }
                      />

                      <span
                        style={
                          categoryBadgeStyle
                        }
                      >
                        {
                          recipe.category
                        }
                      </span>

                      <span
                        style={
                          statusBadgeStyle
                        }
                      >
                        {getStatusLabel(
                          savedRecipe.status,
                        )}
                      </span>
                    </div>

                    <div
                      style={
                        recipeContentStyle
                      }
                    >
                      <div
                        style={
                          cardDecorationStyle
                        }
                      >
                        ❦ Saved Recipe
                      </div>

                      <h2
                        style={
                          recipeTitleStyle
                        }
                      >
                        {
                          recipe.title
                        }
                      </h2>

                      <p
                        style={
                          categoryTextStyle
                        }
                      >
                        Category:{" "}

                        <strong>
                          {
                            recipe.category
                          }
                        </strong>
                      </p>

                      <label
                        htmlFor={`status-${recipe._id}`}
                        style={
                          statusLabelStyle
                        }
                      >
                        Cooking status
                      </label>

                      <div
                        style={
                          selectWrapperStyle
                        }
                      >
                        <select
                          id={`status-${recipe._id}`}
                          value={
                            savedRecipe.status
                          }
                          disabled={
                            isBusy
                          }
                          onChange={(
                            event,
                          ) => {
                            void handleStatusChange(
                              recipe._id,
                              event.target
                                .value as SavedRecipeStatus,
                            );
                          }}
                          style={{
                            ...statusSelectStyle,

                            cursor: isBusy
                              ? "not-allowed"
                              : "pointer",

                            opacity: isBusy
                              ? 0.65
                              : 1,
                          }}
                        >
                          {statusOptions.map(
                            (
                              option,
                            ) => (
                              <option
                                key={
                                  option.value
                                }
                                value={
                                  option.value
                                }
                              >
                                {
                                  option.label
                                }
                              </option>
                            ),
                          )}
                        </select>

                        {isUpdating && (
                          <LoaderCircle
                            size={18}
                            className="selectLoader"
                          />
                        )}
                      </div>

                      <div
                        style={
                          cardActionsStyle
                        }
                      >
                        <button
                          type="button"
                          onClick={() =>
                            handleViewRecipe(
                              recipe._id,
                            )
                          }
                          disabled={
                            isBusy
                          }
                          style={{
                            ...viewButtonStyle,

                            cursor: isBusy
                              ? "not-allowed"
                              : "pointer",

                            opacity: isBusy
                              ? 0.65
                              : 1,
                          }}
                        >
                          <Eye
                            size={18}
                          />

                          View Recipe
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            void handleRemoveRecipe(
                              recipe._id,
                            );
                          }}
                          disabled={
                            isBusy
                          }
                          style={{
                            ...removeButtonStyle,

                            cursor: isBusy
                              ? "not-allowed"
                              : "pointer",

                            opacity: isBusy
                              ? 0.65
                              : 1,
                          }}
                          aria-label={`Remove ${recipe.title}`}
                          title="Remove Recipe"
                        >
                          {isRemoving ? (
                            <LoaderCircle
                              size={18}
                              className="buttonLoader"
                            />
                          ) : (
                            <Trash2
                              size={18}
                            />
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              },
            )}
          </section>
        )}
      </div>

      <style jsx>{`
        :global(.selectLoader) {
          position: absolute;
          top: 50%;
          right: 14px;
          color: #b90f2f;
          pointer-events: none;
          animation: spin 0.9s
            linear infinite;
          transform: translateY(
            -50%
          );
        }

        :global(.buttonLoader) {
          animation: spin 0.9s
            linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(
              360deg
            );
          }
        }

        @media (
          max-width: 760px
        ) {
          .saved-heading-row {
            flex-direction: column;
            align-items:
              flex-start;
          }
        }
      `}</style>
    </main>
  );
}

const pageStyle:
  CSSProperties = {
  minHeight: "100vh",
  padding:
    "42px 24px 80px",
  color: "#5f1f23",

  background:
    "radial-gradient(circle at top left, rgba(255,255,255,0.96), transparent 28%), radial-gradient(circle at bottom right, rgba(217,32,69,0.07), transparent 32%), #fff7ed",
};

const pageContainerStyle:
  CSSProperties = {
  width: "100%",
  maxWidth: "1180px",
  margin: "0 auto",
};

const backButtonStyle:
  CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  marginBottom: "26px",
  padding: "11px 17px",
  border:
    "1px solid #ead7c4",
  borderRadius: "999px",
  color: "#8f0d25",
  backgroundColor: "#fffaf3",

  boxShadow:
    "0 8px 20px rgba(95,31,35,0.08)",

  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "700",
};

const headingSectionStyle:
  CSSProperties = {
  marginBottom: "32px",
  padding: "30px 34px",
  border:
    "1px solid #ead7c4",
  borderRadius: "28px",
  backgroundColor: "#fffaf3",

  boxShadow:
    "0 18px 46px rgba(95,31,35,0.09)",
};

const headingDecorationStyle:
  CSSProperties = {
  marginBottom: "10px",
  color: "#b90f2f",
  fontFamily:
    "Georgia, serif",
  fontSize: "14px",
  letterSpacing: "1.3px",
};

const headingRowStyle:
  CSSProperties = {
  display: "flex",
  alignItems: "flex-end",
  justifyContent:
    "space-between",
  flexWrap: "wrap",
  gap: "22px",
};

const pageHeadingStyle:
  CSSProperties = {
  margin: "0 0 10px",
  color: "#8f0d25",
  fontFamily:
    "Georgia, serif",
  fontSize:
    "clamp(38px, 5vw, 56px)",
  lineHeight: "1.1",
};

const pageDescriptionStyle:
  CSSProperties = {
  maxWidth: "650px",
  margin: 0,
  color: "#8a5c52",
  fontSize: "16px",
  lineHeight: "1.75",
};

const recipeCountStyle:
  CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "9px",
  padding: "12px 18px",
  border:
    "1px solid #ead7c4",
  borderRadius: "999px",
  color: "#8f0d25",
  backgroundColor: "#f9eadf",
  fontSize: "14px",
  fontWeight: "700",
};

const pageMessageStyle:
  CSSProperties = {
  marginBottom: "24px",
  padding: "14px 17px",
  borderRadius: "14px",
  fontSize: "14px",
  fontWeight: "600",
  lineHeight: "1.6",
};

const successMessageStyle:
  CSSProperties = {
  border:
    "1px solid #cce6d1",
  color: "#3f7b50",
  backgroundColor: "#edf7ee",
};

const errorMessageStyle:
  CSSProperties = {
  border:
    "1px solid #f1c4cb",
  color: "#b90f2f",
  backgroundColor: "#fff0f2",
};

const recipeGridStyle:
  CSSProperties = {
  display: "grid",

  gridTemplateColumns:
    "repeat(auto-fit, minmax(min(280px, 100%), 1fr))",

  gap: "25px",
};

const recipeCardStyle:
  CSSProperties = {
  overflow: "hidden",
  border:
    "1px solid #ead7c4",
  borderRadius: "26px",
  backgroundColor: "#fffaf3",

  boxShadow:
    "0 17px 44px rgba(95,31,35,0.1)",
};

const imageWrapperStyle:
  CSSProperties = {
  position: "relative",
  height: "245px",
  overflow: "hidden",
};

const recipeImageStyle:
  CSSProperties = {
  width: "100%",
  height: "100%",
  display: "block",
  objectFit: "cover",
};

const imageOverlayStyle:
  CSSProperties = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",

  background:
    "linear-gradient(180deg, rgba(95,31,35,0.04), rgba(95,31,35,0.34))",
};

const categoryBadgeStyle:
  CSSProperties = {
  position: "absolute",
  top: "17px",
  left: "17px",
  padding: "8px 13px",

  border:
    "1px solid rgba(255,255,255,0.76)",

  borderRadius: "999px",
  color: "#8f0d25",

  backgroundColor:
    "rgba(255,250,243,0.94)",

  boxShadow:
    "0 7px 18px rgba(95,31,35,0.14)",

  fontSize: "12px",
  fontWeight: "700",
};

const statusBadgeStyle:
  CSSProperties = {
  position: "absolute",
  right: "17px",
  bottom: "17px",
  padding: "8px 13px",

  border:
    "1px solid rgba(255,255,255,0.68)",

  borderRadius: "999px",
  color: "white",

  backgroundColor:
    "rgba(185,15,47,0.9)",

  boxShadow:
    "0 7px 18px rgba(95,31,35,0.2)",

  fontSize: "12px",
  fontWeight: "700",
};

const recipeContentStyle:
  CSSProperties = {
  padding: "24px",
};

const cardDecorationStyle:
  CSSProperties = {
  marginBottom: "7px",
  color: "#b90f2f",
  fontFamily:
    "Georgia, serif",
  fontSize: "12px",
  letterSpacing: "0.7px",
};

const recipeTitleStyle:
  CSSProperties = {
  margin: "0 0 10px",
  color: "#8f0d25",
  fontFamily:
    "Georgia, serif",
  fontSize: "25px",
  lineHeight: "1.25",
};

const categoryTextStyle:
  CSSProperties = {
  margin: "0 0 21px",
  color: "#8a5c52",
  fontSize: "14px",
};

const statusLabelStyle:
  CSSProperties = {
  display: "block",
  marginBottom: "8px",
  color: "#5f1f23",
  fontSize: "13px",
  fontWeight: "700",
};

const selectWrapperStyle:
  CSSProperties = {
  position: "relative",
};

const statusSelectStyle:
  CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px 42px 13px 14px",

  border:
    "1px solid #ead7c4",

  borderRadius: "13px",
  color: "#5f1f23",
  backgroundColor: "#fffdf9",
  fontFamily: "inherit",
  fontSize: "14px",
  outline: "none",
};

const cardActionsStyle:
  CSSProperties = {
  display: "grid",

  gridTemplateColumns:
    "1fr auto",

  gap: "10px",
  marginTop: "20px",
};

const viewButtonStyle:
  CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  padding: "13px 17px",
  border: "none",
  borderRadius: "13px",
  color: "white",
  backgroundColor: "#b90f2f",

  boxShadow:
    "0 10px 22px rgba(185,15,47,0.2)",

  fontWeight: "700",
};

const removeButtonStyle:
  CSSProperties = {
  width: "46px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  border:
    "1px solid #efc6ca",

  borderRadius: "13px",
  color: "#b90f2f",
  backgroundColor: "#fff0f2",
};

const emptyStateStyle:
  CSSProperties = {
  position: "relative",
  overflow: "hidden",
  padding: "75px 25px",

  border:
    "1px solid #ead7c4",

  borderRadius: "30px",
  textAlign: "center",
  backgroundColor: "#fffaf3",

  boxShadow:
    "0 18px 48px rgba(95,31,35,0.09)",
};

const emptyDecorationTopStyle:
  CSSProperties = {
  position: "absolute",
  top: "25px",
  right: 0,
  left: 0,
  color: "#d92045",
  fontFamily:
    "Georgia, serif",
  fontSize: "18px",
  letterSpacing: "8px",
};

const emptyIconStyle:
  CSSProperties = {
  width: "100px",
  height: "100px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 23px",
  borderRadius: "30px",
  color: "white",

  background:
    "linear-gradient(135deg, #b90f2f, #d92045)",

  boxShadow:
    "0 18px 35px rgba(185,15,47,0.22)",
};

const emptyHeadingStyle:
  CSSProperties = {
  margin: "0 0 12px",
  color: "#8f0d25",
  fontFamily:
    "Georgia, serif",
  fontSize: "31px",
};

const emptyDescriptionStyle:
  CSSProperties = {
  maxWidth: "510px",
  margin:
    "0 auto 27px",
  color: "#8a5c52",
  lineHeight: "1.75",
};

const exploreButtonStyle:
  CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "9px",
  padding: "14px 21px",
  border: "none",
  borderRadius: "14px",
  color: "white",
  backgroundColor: "#b90f2f",

  boxShadow:
    "0 12px 26px rgba(185,15,47,0.22)",

  cursor: "pointer",
  fontWeight: "700",
};

const emptyDecorationBottomStyle:
  CSSProperties = {
  position: "absolute",
  right: 0,
  bottom: "23px",
  left: 0,

  color:
    "rgba(185,15,47,0.38)",

  fontFamily:
    "Georgia, serif",

  letterSpacing: "7px",
};

const loadingPageStyle:
  CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "15px",
  color: "#8f0d25",
  backgroundColor: "#fff7ed",
};

const loadingIconStyle:
  CSSProperties = {
  width: "82px",
  height: "82px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  border:
    "1px solid #ead7c4",

  borderRadius: "25px",
  color: "white",
  backgroundColor: "#b90f2f",

  boxShadow:
    "0 15px 32px rgba(185,15,47,0.2)",
};

const loadingTextStyle:
  CSSProperties = {
  margin: 0,
  color: "#8a5c52",
  fontFamily:
    "Georgia, serif",
  fontSize: "17px",
};