"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  ChefHat,
  CookingPot,
  Eye,
  Heart,
  Sparkles,
  Trash2,
} from "lucide-react";

type SavedRecipeStatus =
  | "Want to Watch"
  | "Watched"
  | "Favorite";

type SavedRecipeItem = {
  id: number;
  title: string;
  channel: string;
  thumbnail: string;
  status: SavedRecipeStatus;
};

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

export default function WatchlistPage() {
  const router = useRouter();

  const { status: sessionStatus } = useSession();

  const [isMockLoggedIn, setIsMockLoggedIn] =
    useState(false);

  const [isAuthChecked, setIsAuthChecked] =
    useState(false);

  const [isLoadingRecipes, setIsLoadingRecipes] =
    useState(true);

  const [savedRecipes, setSavedRecipes] = useState<
    SavedRecipeItem[]
  >([]);

  const isGoogleLoggedIn =
    sessionStatus === "authenticated";

  const isLoggedIn =
    isMockLoggedIn || isGoogleLoggedIn;

  /*
    ตรวจ Mock Login จาก localStorage
    ทำครั้งเดียวหลัง Component โหลดใน Browser
  */
  useEffect(() => {
    const mockLoginStatus =
      localStorage.getItem("isLoggedIn") === "true";

    setIsMockLoggedIn(mockLoginStatus);
    setIsAuthChecked(true);
  }, []);

  /*
    Redirect หลังตรวจครบทั้ง:
    1. Mock Login
    2. Google Session

    ห้าม redirect ตอน sessionStatus === "loading"
    เพราะ Google Session อาจกำลังโหลดอยู่
  */
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
          "/watchlist",
        )}`,
      );
    }
  }, [
    isAuthChecked,
    sessionStatus,
    isLoggedIn,
    router,
  ]);

  /*
    โหลด Saved Recipes หลังจากยืนยันแล้วว่า Login อยู่
  */
  useEffect(() => {
    if (!isAuthChecked) {
      return;
    }

    if (sessionStatus === "loading") {
      return;
    }

    if (!isLoggedIn) {
      setIsLoadingRecipes(false);
      return;
    }

    try {
      const storedWatchlist = localStorage.getItem(
        "watchlist",
      );

      if (!storedWatchlist) {
        setSavedRecipes([]);
        setIsLoadingRecipes(false);
        return;
      }

      const parsedWatchlist: unknown =
        JSON.parse(storedWatchlist);

      if (!Array.isArray(parsedWatchlist)) {
        localStorage.setItem("watchlist", "[]");
        setSavedRecipes([]);
        setIsLoadingRecipes(false);
        return;
      }

      setSavedRecipes(
        parsedWatchlist as SavedRecipeItem[],
      );
    } catch (error) {
      console.error(
        "Unable to read saved recipes:",
        error,
      );

      localStorage.setItem("watchlist", "[]");
      setSavedRecipes([]);
    } finally {
      setIsLoadingRecipes(false);
    }
  }, [
    isAuthChecked,
    sessionStatus,
    isLoggedIn,
  ]);

  const saveRecipesToLocalStorage = (
    recipes: SavedRecipeItem[],
  ) => {
    localStorage.setItem(
      "watchlist",
      JSON.stringify(recipes),
    );

    setSavedRecipes(recipes);
  };

  const handleStatusChange = (
    recipeId: number,
    newStatus: SavedRecipeStatus,
  ) => {
    const updatedRecipes = savedRecipes.map(
      (recipe) =>
        Number(recipe.id) === Number(recipeId)
          ? {
            ...recipe,
            status: newStatus,
          }
          : recipe,
    );

    saveRecipesToLocalStorage(updatedRecipes);
  };

  const handleRemoveRecipe = (recipeId: number) => {
    const updatedRecipes = savedRecipes.filter(
      (recipe) =>
        Number(recipe.id) !== Number(recipeId),
    );

    saveRecipesToLocalStorage(updatedRecipes);
  };

  const handleViewRecipe = (recipeId: number) => {
    router.push(`/trailer/${recipeId}`);
  };

  const getStatusLabel = (
    status: SavedRecipeStatus,
  ) => {
    const matchedStatus = statusOptions.find(
      (option) => option.value === status,
    );

    return matchedStatus?.label || status;
  };

  /*
    แสดง Loading ระหว่างตรวจ session
    เพื่อป้องกันหน้าเด้งไป Login ก่อน Google Session โหลดเสร็จ
  */
  if (
    !isAuthChecked ||
    sessionStatus === "loading" ||
    isLoadingRecipes
  ) {
    return (
      <main style={loadingPageStyle}>
        <div style={loadingIconStyle}>
          <CookingPot
            size={39}
            strokeWidth={1.7}
          />
        </div>

        <p style={loadingTextStyle}>
          Preparing your saved recipes...
        </p>
      </main>
    );
  }

  /*
    ระหว่าง router.replace กำลังส่งไปหน้า Login
    ไม่แสดงเนื้อหา Saved Recipes
  */
  if (!isLoggedIn) {
    return (
      <main style={loadingPageStyle}>
        <div style={loadingIconStyle}>
          <CookingPot
            size={39}
            strokeWidth={1.7}
          />
        </div>

        <p style={loadingTextStyle}>
          Redirecting to login...
        </p>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={pageContainerStyle}>
        <button
          type="button"
          onClick={() => router.push("/")}
          style={backButtonStyle}
        >
          <ArrowLeft size={18} />
          Back to Home
        </button>

        <section style={headingSectionStyle}>
          <div style={headingDecorationStyle}>
            ❦ Your personal collection ❦
          </div>

          <div
            className="saved-heading-row"
            style={headingRowStyle}
          >
            <div>
              <h1 style={pageHeadingStyle}>
                Saved Recipes
              </h1>

              <p style={pageDescriptionStyle}>
                Keep your favorite recipes together and
                organize what you would love to cook next.
              </p>
            </div>

            <div style={recipeCountStyle}>
              <Heart
                size={19}
                color="#b90f2f"
                fill="#b90f2f"
              />

              <span>
                {savedRecipes.length}{" "}
                {savedRecipes.length === 1
                  ? "Recipe"
                  : "Recipes"}
              </span>
            </div>
          </div>
        </section>

        {savedRecipes.length === 0 ? (
          <section style={emptyStateStyle}>
            <div style={emptyDecorationTopStyle}>
              ✧ ❦ ✧
            </div>

            <div style={emptyIconStyle}>
              <ChefHat
                size={50}
                strokeWidth={1.5}
              />
            </div>

            <h2 style={emptyHeadingStyle}>
              Your recipe collection is empty
            </h2>

            <p style={emptyDescriptionStyle}>
              Explore RecipePeeker and save recipes that
              inspire your next cozy meal.
            </p>

            <button
              type="button"
              onClick={() => router.push("/search")}
              style={exploreButtonStyle}
            >
              <Sparkles size={19} />
              Explore Recipes
            </button>

            <div style={emptyDecorationBottomStyle}>
              ❧ ♡ ❦
            </div>
          </section>
        ) : (
          <section style={recipeGridStyle}>
            {savedRecipes.map((recipe) => (
              <article
                key={recipe.id}
                style={recipeCardStyle}
              >
                <div style={imageWrapperStyle}>
                  <img
                    src={recipe.thumbnail}
                    alt={recipe.title}
                    style={recipeImageStyle}
                  />

                  <div style={imageOverlayStyle} />

                  <span style={categoryBadgeStyle}>
                    {recipe.channel}
                  </span>

                  <span style={statusBadgeStyle}>
                    {getStatusLabel(recipe.status)}
                  </span>
                </div>

                <div style={recipeContentStyle}>
                  <div style={cardDecorationStyle}>
                    ❦ Saved Recipe
                  </div>

                  <h2 style={recipeTitleStyle}>
                    {recipe.title}
                  </h2>

                  <p style={categoryTextStyle}>
                    Category:{" "}
                    <strong>{recipe.channel}</strong>
                  </p>

                  <label
                    htmlFor={`status-${recipe.id}`}
                    style={statusLabelStyle}
                  >
                    Cooking status
                  </label>

                  <div style={selectWrapperStyle}>
                    <select
                      id={`status-${recipe.id}`}
                      value={recipe.status}
                      onChange={(event) =>
                        handleStatusChange(
                          recipe.id,
                          event.target
                            .value as SavedRecipeStatus,
                        )
                      }
                      style={statusSelectStyle}
                    >
                      {statusOptions.map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={cardActionsStyle}>
                    <button
                      type="button"
                      onClick={() =>
                        handleViewRecipe(recipe.id)
                      }
                      style={viewButtonStyle}
                    >
                      <Eye size={18} />
                      View Recipe
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveRecipe(recipe.id)
                      }
                      style={removeButtonStyle}
                      aria-label={`Remove ${recipe.title}`}
                      title="Remove Recipe"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>

      <style jsx>{`
        @media (max-width: 760px) {
          .saved-heading-row {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  padding: "42px 24px 80px",
  color: "#5f1f23",
  background:
    "radial-gradient(circle at top left, rgba(255,255,255,0.96), transparent 28%), radial-gradient(circle at bottom right, rgba(217,32,69,0.07), transparent 32%), #fff7ed",
};

const pageContainerStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "1180px",
  margin: "0 auto",
};

const backButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  marginBottom: "26px",
  padding: "11px 17px",
  border: "1px solid #ead7c4",
  borderRadius: "999px",
  color: "#8f0d25",
  backgroundColor: "#fffaf3",
  boxShadow: "0 8px 20px rgba(95,31,35,0.08)",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "700",
};

const headingSectionStyle: React.CSSProperties = {
  marginBottom: "32px",
  padding: "30px 34px",
  border: "1px solid #ead7c4",
  borderRadius: "28px",
  backgroundColor: "#fffaf3",
  boxShadow: "0 18px 46px rgba(95,31,35,0.09)",
};

const headingDecorationStyle: React.CSSProperties = {
  marginBottom: "10px",
  color: "#b90f2f",
  fontFamily: "Georgia, serif",
  fontSize: "14px",
  letterSpacing: "1.3px",
};

const headingRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: "22px",
};

const pageHeadingStyle: React.CSSProperties = {
  margin: "0 0 10px",
  color: "#8f0d25",
  fontFamily: "Georgia, serif",
  fontSize: "clamp(38px, 5vw, 56px)",
  lineHeight: "1.1",
};

const pageDescriptionStyle: React.CSSProperties = {
  maxWidth: "650px",
  margin: 0,
  color: "#8a5c52",
  fontSize: "16px",
  lineHeight: "1.75",
};

const recipeCountStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "9px",
  padding: "12px 18px",
  border: "1px solid #ead7c4",
  borderRadius: "999px",
  color: "#8f0d25",
  backgroundColor: "#f9eadf",
  fontSize: "14px",
  fontWeight: "700",
};

const recipeGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(min(280px, 100%), 1fr))",
  gap: "25px",
};

const recipeCardStyle: React.CSSProperties = {
  overflow: "hidden",
  border: "1px solid #ead7c4",
  borderRadius: "26px",
  backgroundColor: "#fffaf3",
  boxShadow: "0 17px 44px rgba(95,31,35,0.1)",
};

const imageWrapperStyle: React.CSSProperties = {
  position: "relative",
  height: "245px",
  overflow: "hidden",
};

const recipeImageStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  display: "block",
  objectFit: "cover",
};

const imageOverlayStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  background:
    "linear-gradient(180deg, rgba(95,31,35,0.04), rgba(95,31,35,0.34))",
};

const categoryBadgeStyle: React.CSSProperties = {
  position: "absolute",
  top: "17px",
  left: "17px",
  padding: "8px 13px",
  border: "1px solid rgba(255,255,255,0.76)",
  borderRadius: "999px",
  color: "#8f0d25",
  backgroundColor: "rgba(255,250,243,0.94)",
  boxShadow: "0 7px 18px rgba(95,31,35,0.14)",
  fontSize: "12px",
  fontWeight: "700",
};

const statusBadgeStyle: React.CSSProperties = {
  position: "absolute",
  right: "17px",
  bottom: "17px",
  padding: "8px 13px",
  border: "1px solid rgba(255,255,255,0.68)",
  borderRadius: "999px",
  color: "white",
  backgroundColor: "rgba(185,15,47,0.9)",
  boxShadow: "0 7px 18px rgba(95,31,35,0.2)",
  fontSize: "12px",
  fontWeight: "700",
};

const recipeContentStyle: React.CSSProperties = {
  padding: "24px",
};

const cardDecorationStyle: React.CSSProperties = {
  marginBottom: "7px",
  color: "#b90f2f",
  fontFamily: "Georgia, serif",
  fontSize: "12px",
  letterSpacing: "0.7px",
};

const recipeTitleStyle: React.CSSProperties = {
  margin: "0 0 10px",
  color: "#8f0d25",
  fontFamily: "Georgia, serif",
  fontSize: "25px",
  lineHeight: "1.25",
};

const categoryTextStyle: React.CSSProperties = {
  margin: "0 0 21px",
  color: "#8a5c52",
  fontSize: "14px",
};

const statusLabelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "8px",
  color: "#5f1f23",
  fontSize: "13px",
  fontWeight: "700",
};

const selectWrapperStyle: React.CSSProperties = {
  position: "relative",
};

const statusSelectStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px 14px",
  border: "1px solid #ead7c4",
  borderRadius: "13px",
  color: "#5f1f23",
  backgroundColor: "#fffdf9",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: "14px",
  outline: "none",
};

const cardActionsStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gap: "10px",
  marginTop: "20px",
};

const viewButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  padding: "13px 17px",
  border: "none",
  borderRadius: "13px",
  color: "white",
  backgroundColor: "#b90f2f",
  boxShadow: "0 10px 22px rgba(185,15,47,0.2)",
  cursor: "pointer",
  fontWeight: "700",
};

const removeButtonStyle: React.CSSProperties = {
  width: "46px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid #efc6ca",
  borderRadius: "13px",
  color: "#b90f2f",
  backgroundColor: "#fff0f2",
  cursor: "pointer",
};

const emptyStateStyle: React.CSSProperties = {
  position: "relative",
  overflow: "hidden",
  padding: "75px 25px",
  border: "1px solid #ead7c4",
  borderRadius: "30px",
  textAlign: "center",
  backgroundColor: "#fffaf3",
  boxShadow: "0 18px 48px rgba(95,31,35,0.09)",
};

const emptyDecorationTopStyle: React.CSSProperties = {
  position: "absolute",
  top: "25px",
  left: 0,
  right: 0,
  color: "#d92045",
  fontFamily: "Georgia, serif",
  fontSize: "18px",
  letterSpacing: "8px",
};

const emptyIconStyle: React.CSSProperties = {
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
  boxShadow: "0 18px 35px rgba(185,15,47,0.22)",
};

const emptyHeadingStyle: React.CSSProperties = {
  margin: "0 0 12px",
  color: "#8f0d25",
  fontFamily: "Georgia, serif",
  fontSize: "31px",
};

const emptyDescriptionStyle: React.CSSProperties = {
  maxWidth: "510px",
  margin: "0 auto 27px",
  color: "#8a5c52",
  lineHeight: "1.75",
};

const exploreButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "9px",
  padding: "14px 21px",
  border: "none",
  borderRadius: "14px",
  color: "white",
  backgroundColor: "#b90f2f",
  boxShadow: "0 12px 26px rgba(185,15,47,0.22)",
  cursor: "pointer",
  fontWeight: "700",
};

const emptyDecorationBottomStyle: React.CSSProperties = {
  position: "absolute",
  right: 0,
  bottom: "23px",
  left: 0,
  color: "rgba(185,15,47,0.38)",
  fontFamily: "Georgia, serif",
  letterSpacing: "7px",
};

const loadingPageStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "15px",
  color: "#8f0d25",
  backgroundColor: "#fff7ed",
};

const loadingIconStyle: React.CSSProperties = {
  width: "82px",
  height: "82px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid #ead7c4",
  borderRadius: "25px",
  color: "white",
  backgroundColor: "#b90f2f",
  boxShadow: "0 15px 32px rgba(185,15,47,0.2)",
};

const loadingTextStyle: React.CSSProperties = {
  margin: 0,
  color: "#8a5c52",
  fontFamily: "Georgia, serif",
  fontSize: "17px",
};