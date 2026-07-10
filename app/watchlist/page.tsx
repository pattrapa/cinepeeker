"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import { ChefHat, Heart, Trash2 } from "lucide-react";

type RecipeStatus = "Want to Watch" | "Watched" | "Favorite";

type SavedRecipeItem = {
  id: number;
  title: string;
  channel: string;
  thumbnail: string;
  status: RecipeStatus;
};

const statusOptions: RecipeStatus[] = [
  "Want to Watch",
  "Watched",
  "Favorite",
];

const statusLabels: Record<RecipeStatus, string> = {
  "Want to Watch": "Want to Cook",
  Watched: "Cooked",
  Favorite: "Favorite",
};

export default function WatchlistPage() {
  const router = useRouter();

  const [savedRecipes, setSavedRecipes] = useState<SavedRecipeItem[]>([]);
  const [toast, setToast] = useState("");
  const [isCheckingLogin, setIsCheckingLogin] = useState(true);

  const showToast = (message: string) => {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 2400);
  };

  useEffect(() => {
    const loginStatus = localStorage.getItem("isLoggedIn");

    if (loginStatus !== "true") {
      router.push("/login?redirect=/watchlist");
      return;
    }

    const savedData = localStorage.getItem("watchlist");
    const parsedRecipes = savedData ? JSON.parse(savedData) : [];

    setSavedRecipes(parsedRecipes);
    setIsCheckingLogin(false);
  }, [router]);

  const saveToLocalStorage = (updatedRecipes: SavedRecipeItem[]) => {
    localStorage.setItem("watchlist", JSON.stringify(updatedRecipes));
    setSavedRecipes(updatedRecipes);
  };

  const handleStatusChange = (recipeId: number, newStatus: RecipeStatus) => {
    const updatedRecipes = savedRecipes.map((recipe) =>
      recipe.id === recipeId
        ? {
            ...recipe,
            status: newStatus,
          }
        : recipe
    );

    saveToLocalStorage(updatedRecipes);
    showToast("Recipe status updated ✨");
  };

  const handleRemoveRecipe = (recipeId: number) => {
    const updatedRecipes = savedRecipes.filter(
      (recipe) => recipe.id !== recipeId
    );

    saveToLocalStorage(updatedRecipes);
    showToast("Recipe removed from Saved Recipes.");
  };

  if (isCheckingLogin) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(180deg, #fff7ed 0%, #fffaf3 45%, #f9eadf 100%)",
          color: "#5f1f23",
        }}
      >
        <Navbar />

        <section
          style={{
            padding: "48px 60px",
          }}
        >
          <p
            style={{
              color: "#8a5c52",
              fontSize: "18px",
            }}
          >
            Checking login status...
          </p>
        </section>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(255,255,255,0.95), transparent 28%), linear-gradient(180deg, #fff7ed 0%, #fffaf3 48%, #f9eadf 100%)",
        color: "#5f1f23",
      }}
    >
      <Navbar />

      {toast && (
        <div
          style={{
            position: "fixed",
            top: "96px",
            right: "32px",
            zIndex: 2000,
            backgroundColor: "#fffaf3",
            color: "#5f1f23",
            border: "1px solid #ead7c4",
            borderLeft: "5px solid #b90f2f",
            borderRadius: "18px",
            padding: "16px 20px",
            boxShadow: "0 20px 50px rgba(95, 31, 35, 0.18)",
            fontWeight: "600",
            maxWidth: "340px",
          }}
        >
          {toast}
        </div>
      )}

      <section
        style={{
          padding: "48px 60px 70px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "40px",
            fontSize: "110px",
            color: "rgba(255, 255, 255, 0.9)",
            pointerEvents: "none",
          }}
        >
          ❦
        </div>

        <div
          style={{
            position: "relative",
            zIndex: 1,
          }}
        >
          <p
            style={{
              color: "#b90f2f",
              fontWeight: "bold",
              letterSpacing: "0.08em",
              fontSize: "13px",
              marginBottom: "12px",
            }}
          >
            ❧ SAVED COLLECTION
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "18px",
              flexWrap: "wrap",
              marginBottom: "28px",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "44px",
                  fontFamily: "Georgia, serif",
                  color: "#8f0d25",
                  marginBottom: "10px",
                  fontWeight: 500,
                }}
              >
                Saved Recipes
              </h1>

              <p
                style={{
                  color: "#8a5c52",
                  lineHeight: "1.7",
                  maxWidth: "700px",
                }}
              >
                เก็บเมนูที่อยากลองทำ เปลี่ยนสถานะ และกลับมาดูสูตรได้ทุกเวลา
              </p>
            </div>

            <a
              href="/search"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "14px 22px",
                borderRadius: "999px",
                backgroundColor: "#b90f2f",
                color: "white",
                textDecoration: "none",
                fontWeight: "bold",
                boxShadow: "0 12px 26px rgba(185, 15, 47, 0.22)",
              }}
            >
              <ChefHat size={18} />
              Browse Recipes
            </a>
          </div>

          {savedRecipes.length === 0 ? (
            <div
              style={{
                padding: "36px",
                borderRadius: "28px",
                backgroundColor: "#fffaf3",
                border: "1px solid #ead7c4",
                boxShadow: "0 18px 42px rgba(95, 31, 35, 0.1)",
                maxWidth: "760px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "-18px",
                  right: "0",
                  fontSize: "86px",
                  color: "rgba(185, 15, 47, 0.08)",
                }}
              >
                ❦
              </div>

              <Heart
                size={42}
                style={{
                  color: "#b90f2f",
                  marginBottom: "14px",
                }}
              />

              <h2
                style={{
                  fontSize: "28px",
                  fontFamily: "Georgia, serif",
                  color: "#8f0d25",
                  marginBottom: "10px",
                  fontWeight: 500,
                }}
              >
                No saved recipes yet
              </h2>

              <p
                style={{
                  color: "#8a5c52",
                  lineHeight: "1.7",
                  marginBottom: "22px",
                }}
              >
                ยังไม่มีสูตรอาหารที่บันทึกไว้ ลองไปค้นหาเมนูน่าทำแล้วกด Save Recipe ได้เลย
              </p>

              <a
                href="/search"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "13px 20px",
                  borderRadius: "999px",
                  backgroundColor: "#b90f2f",
                  color: "white",
                  textDecoration: "none",
                  fontWeight: "bold",
                }}
              >
                <ChefHat size={18} />
                Go to Search
              </a>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "24px",
              }}
            >
              {savedRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  style={{
                    backgroundColor: "#fffaf3",
                    borderRadius: "24px",
                    overflow: "hidden",
                    border: "1px solid #ead7c4",
                    boxShadow: "0 16px 34px rgba(95, 31, 35, 0.11)",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "10px",
                      zIndex: 2,
                      color: "white",
                      fontSize: "34px",
                      textShadow: "0 2px 10px rgba(0,0,0,0.2)",
                      pointerEvents: "none",
                    }}
                  >
                    ❦
                  </div>

                  <img
                    src={recipe.thumbnail}
                    alt={recipe.title}
                    style={{
                      width: "100%",
                      height: "170px",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />

                  <div
                    style={{
                      padding: "18px",
                    }}
                  >
                    <p
                      style={{
                        color: "#b90f2f",
                        fontSize: "14px",
                        marginBottom: "8px",
                        fontWeight: "bold",
                      }}
                    >
                      {recipe.channel}
                    </p>

                    <h3
                      style={{
                        color: "#8f0d25",
                        fontSize: "21px",
                        lineHeight: "1.35",
                        fontFamily: "Georgia, serif",
                        fontWeight: 500,
                        marginBottom: "16px",
                      }}
                    >
                      {recipe.title}
                    </h3>

                    <label
                      style={{
                        display: "block",
                        color: "#8a5c52",
                        fontWeight: "bold",
                        marginBottom: "8px",
                        fontSize: "14px",
                      }}
                    >
                      Recipe Status
                    </label>

                    <select
                      value={recipe.status}
                      onChange={(event) =>
                        handleStatusChange(
                          recipe.id,
                          event.target.value as RecipeStatus
                        )
                      }
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: "16px",
                        border: "1px solid #ead7c4",
                        backgroundColor: "#fff7ed",
                        color: "#5f1f23",
                        outline: "none",
                        fontWeight: "600",
                        marginBottom: "16px",
                      }}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {statusLabels[status]}
                        </option>
                      ))}
                    </select>

                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        flexWrap: "wrap",
                      }}
                    >
                      <a
                        href={`/trailer/${recipe.id}`}
                        style={{
                          flex: 1,
                          minWidth: "130px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          padding: "12px 16px",
                          borderRadius: "999px",
                          backgroundColor: "#b90f2f",
                          color: "white",
                          textDecoration: "none",
                          fontWeight: "bold",
                        }}
                      >
                        <ChefHat size={17} />
                        View Recipe
                      </a>

                      <button
                        type="button"
                        onClick={() => handleRemoveRecipe(recipe.id)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          padding: "12px 16px",
                          borderRadius: "999px",
                          border: "1px solid #d8b9a6",
                          backgroundColor: "transparent",
                          color: "#b90f2f",
                          cursor: "pointer",
                          fontWeight: "bold",
                        }}
                      >
                        <Trash2 size={17} />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}