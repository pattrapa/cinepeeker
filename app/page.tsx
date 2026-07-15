"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Navbar from "@/app/components/Navbar";

import {
  ChefHat,
  Clock,
  Heart,
  LoaderCircle,
  PlusCircle,
  RefreshCw,
  Search,
  Sparkles,
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

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000";

const defaultCategories = [
  "Dessert",
  "Breakfast",
  "Pasta",
  "Thai Food",
  "Drinks",
];

export default function Home() {
  const [searchText, setSearchText] =
    useState("");

  const [recipes, setRecipes] =
    useState<Recipe[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const loadRecipes =
    useCallback(async (): Promise<void> => {
      try {
        setIsLoading(true);
        setErrorMessage("");

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
              "Unable to load recipes.",
          );
        }

        setRecipes(
          Array.isArray(result.data)
            ? result.data
            : [],
        );
      } catch (error) {
        console.error(
          "Unable to load home recipes:",
          error,
        );

        setRecipes([]);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load recipes.",
        );
      } finally {
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadRecipes();
  }, [loadRecipes]);

  const featuredRecipe =
    recipes.length > 0 ? recipes[0] : null;

  const featuredRecipes = recipes.slice(
    0,
    5,
  );

  const trendingRecipes = recipes
    .slice(0, 5)
    .reverse();

  const categories = useMemo(() => {
    const recipeCategories = recipes
      .map((recipe) =>
        recipe.category.trim(),
      )
      .filter(
        (category) =>
          category.length > 0,
      );

    return Array.from(
      new Set([
        ...defaultCategories,
        ...recipeCategories,
      ]),
    );
  }, [recipes]);

  const searchHref = searchText.trim()
    ? `/search?query=${encodeURIComponent(
        searchText.trim(),
      )}`
    : "/search";

  const heroBackground = featuredRecipe
    ? `linear-gradient(
        90deg,
        rgba(255, 250, 243, 0.98) 0%,
        rgba(255, 250, 243, 0.9) 42%,
        rgba(255, 250, 243, 0.3) 64%
      ),
      url("${featuredRecipe.imageUrl}")`
    : `linear-gradient(
        90deg,
        rgba(255, 250, 243, 0.98) 0%,
        rgba(255, 250, 243, 0.9) 42%,
        rgba(255, 250, 243, 0.3) 64%
      ),
      url("https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=1800&q=80")`;

  return (
    <main style={pageStyle}>
      <Navbar />

      <div style={leftDecorationStyle}>
        ❦
      </div>

      <div style={rightDecorationStyle}>
        ❦
      </div>

      <section className="heroSection">
        <div
          className="heroCard"
          style={{
            backgroundImage:
              heroBackground,
          }}
        >
          <div className="heroInnerBorder" />

          <div className="heroContent">
            <span className="featuredBadge">
              <Sparkles size={15} />
              FEATURED RECIPE
            </span>

            <h1>
              {featuredRecipe
                ? featuredRecipe.title
                : "Share Your Favorite Recipe"}
            </h1>

            <div className="heroDecoration">
              ✧ ───── ♡ ───── ✧
            </div>

            <p className="heroDescription">
              {featuredRecipe
                ? featuredRecipe.description
                : "Create your first homemade recipe and share it with the RecipePeeker community."}
            </p>

            {featuredRecipe && (
              <div className="heroMeta">
                <span>
                  <Clock size={16} />
                  {featuredRecipe.timeMinutes}{" "}
                  mins
                </span>

                <span>
                  <ChefHat size={16} />
                  {featuredRecipe.difficulty}
                </span>

                <span>
                  {featuredRecipe.category}
                </span>
              </div>
            )}

            <div className="heroActions">
              {featuredRecipe ? (
                <a
                  href={`/trailer/${featuredRecipe._id}`}
                  style={primaryButtonStyle}
                >
                  <ChefHat size={18} />
                  View Recipe
                </a>
              ) : (
                <a
                  href="/create_recipe"
                  style={primaryButtonStyle}
                >
                  <PlusCircle size={18} />
                  Add First Recipe
                </a>
              )}

              <a
                href="/watchlist"
                style={secondaryButtonStyle}
              >
                <Heart size={18} />
                Saved Recipes
              </a>
            </div>

            <div className="heroSearch">
              <input
                type="text"
                placeholder="Search recipes, desserts, drinks..."
                value={searchText}
                onChange={(event) =>
                  setSearchText(
                    event.target.value,
                  )
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    window.location.href =
                      searchHref;
                  }
                }}
              />

              <a
                href={searchHref}
                style={smallSearchButtonStyle}
              >
                <Search size={18} />
                Search
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="categorySection">
        <div className="categoryList">
          {categories.map((category) => (
            <a
              key={category}
              href={`/search?query=${encodeURIComponent(
                category,
              )}`}
              style={categoryStyle}
            >
              {category}
            </a>
          ))}
        </div>
      </section>

      {isLoading ? (
        <StatusCard type="loading" />
      ) : errorMessage ? (
        <StatusCard
          type="error"
          message={errorMessage}
          onRetry={() => {
            void loadRecipes();
          }}
        />
      ) : recipes.length === 0 ? (
        <StatusCard type="empty" />
      ) : (
        <>
          <section className="recipeSection">
            <SectionTitle title="Featured Recipes" />

            <div className="recipeGrid">
              {featuredRecipes.map(
                (recipe) => (
                  <RecipeCard
                    key={`featured-${recipe._id}`}
                    recipe={recipe}
                  />
                ),
              )}
            </div>
          </section>

          <section className="recipeSection trendingSection">
            <SectionTitle title="Trending Recipes" />

            <div className="recipeGrid">
              {trendingRecipes.map(
                (recipe) => (
                  <RecipeCard
                    key={`trending-${recipe._id}`}
                    recipe={recipe}
                  />
                ),
              )}
            </div>
          </section>
        </>
      )}

      <footer className="footer">
        <p>
          ❦ 2026 RecipePeeker. Find your
          next cozy recipe. ❦
        </p>
      </footer>

      <style jsx>{`
        .heroSection {
          position: relative;
          z-index: 1;
          padding: 30px 60px 18px;
        }

        .heroCard {
          position: relative;
          min-height: 430px;
          overflow: hidden;
          border: 1px solid #ead7c4;
          border-radius: 34px;
          background-position: center;
          background-size: cover;
          box-shadow: 0 24px 70px
            rgba(95, 31, 35, 0.16);
        }

        .heroInnerBorder {
          position: absolute;
          inset: 18px;
          border: 1px solid
            rgba(255, 255, 255, 0.9);
          border-radius: 26px;
          pointer-events: none;
        }

        .heroContent {
          position: relative;
          z-index: 2;
          max-width: 700px;
          box-sizing: border-box;
          padding: 58px 64px;
        }

        .featuredBadge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 20px;
          padding: 8px 14px;
          border: 1px solid #f1c9bd;
          border-radius: 999px;
          color: #b90f2f;
          background-color: rgba(
            255,
            250,
            243,
            0.78
          );
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.08em;
        }

        .heroContent h1 {
          margin: 0 0 18px;
          color: #8f0d25;
          font-family: Georgia, serif;
          font-size: clamp(
            42px,
            6vw,
            64px
          );
          font-weight: 500;
          line-height: 1.05;
        }

        .heroDecoration {
          margin-bottom: 18px;
          color: #c2344e;
          font-family: Georgia, serif;
          font-size: 24px;
        }

        .heroDescription {
          max-width: 560px;
          margin: 0 0 20px;
          color: #7c4a42;
          font-size: 17px;
          line-height: 1.8;
        }

        .heroMeta {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }

        .heroMeta span {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border: 1px solid #ead7c4;
          border-radius: 999px;
          color: #7c4a42;
          background-color: rgba(
            255,
            250,
            243,
            0.86
          );
          font-size: 13px;
          font-weight: 600;
        }

        .heroActions {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }

        .heroSearch {
          width: 100%;
          max-width: 620px;
          display: flex;
          gap: 10px;
          box-sizing: border-box;
          padding: 8px;
          border: 1px solid #ead7c4;
          border-radius: 22px;
          background-color: rgba(
            255,
            250,
            243,
            0.92
          );
          box-shadow: 0 14px 28px
            rgba(95, 31, 35, 0.12);
        }

        .heroSearch input {
          min-width: 0;
          flex: 1;
          padding: 12px 14px;
          border: none;
          outline: none;
          color: #5f1f23;
          background-color: transparent;
          font-family: inherit;
          font-size: 16px;
        }

        .categorySection {
          position: relative;
          z-index: 1;
          padding: 0 60px 22px;
        }

        .categoryList {
          display: flex;
          justify-content: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .recipeSection {
          position: relative;
          z-index: 1;
          padding: 8px 60px 34px;
        }

        .trendingSection {
          padding-top: 0;
          padding-bottom: 60px;
        }

        .recipeGrid {
          display: grid;
          grid-template-columns: repeat(
            auto-fit,
            minmax(
              min(220px, 100%),
              1fr
            )
          );
          gap: 24px;
        }

        .footer {
          padding: 24px 60px;
          border-top: 1px solid #ead7c4;
          color: #9a6b5f;
          background-color: rgba(
            255,
            250,
            243,
            0.8
          );
          text-align: center;
        }

        .footer p {
          margin: 0;
        }

        @media (max-width: 760px) {
          .heroSection {
            padding: 22px 18px 16px;
          }

          .heroCard {
            min-height: 520px;
            background-position: 65% center;
          }

          .heroContent {
            padding: 48px 30px;
          }

          .categorySection,
          .recipeSection {
            padding-right: 18px;
            padding-left: 18px;
          }

          .heroSearch {
            flex-direction: column;
          }

          .footer {
            padding-right: 20px;
            padding-left: 20px;
          }
        }

        @media (max-width: 480px) {
          .heroSection {
            padding-right: 12px;
            padding-left: 12px;
          }

          .heroContent {
            padding: 42px 22px;
          }

          .heroActions {
            flex-direction: column;
          }

          .heroActions :global(a) {
            justify-content: center;
          }

          .categorySection,
          .recipeSection {
            padding-right: 14px;
            padding-left: 14px;
          }
        }
      `}</style>
    </main>
  );
}

function SectionTitle({
  title,
}: {
  title: string;
}) {
  return (
    <div className="sectionTitle">
      <h2>❧ {title}</h2>

      <a href="/search">
        View all →
      </a>

      <style jsx>{`
        .sectionTitle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 18px;
        }

        .sectionTitle h2 {
          margin: 0;
          color: #8f0d25;
          font-family: Georgia, serif;
          font-size: 28px;
          font-weight: 500;
        }

        .sectionTitle a {
          color: #b90f2f;
          text-decoration: none;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}

function RecipeCard({
  recipe,
}: {
  recipe: Recipe;
}) {
  return (
    <a
      href={`/trailer/${recipe._id}`}
      className="recipeCard"
    >
      <div className="cardDecoration">
        ❦
      </div>

      <div className="imageWrapper">
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
        />

        <span className="chefIcon">
          <ChefHat size={18} />
        </span>

        <span className="categoryBadge">
          {recipe.category}
        </span>
      </div>

      <div className="cardContent">
        <p className="author">
          By{" "}
          {recipe.authorName ||
            "RecipePeeker User"}
        </p>

        <h3>{recipe.title}</h3>

        <p className="cardDescription">
          {recipe.description}
        </p>

        <div className="cardMeta">
          <span>
            <Clock size={14} />
            {recipe.timeMinutes} mins
          </span>

          <span>
            <ChefHat size={14} />
            {recipe.difficulty}
          </span>
        </div>
      </div>

      <style jsx>{`
        .recipeCard {
          position: relative;
          display: block;
          overflow: hidden;
          border: 1px solid #ead7c4;
          border-radius: 20px;
          color: #5f1f23;
          background-color: #fffaf3;
          box-shadow: 0 14px 30px
            rgba(95, 31, 35, 0.11);
          text-decoration: none;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .recipeCard:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 42px
            rgba(95, 31, 35, 0.17);
        }

        .cardDecoration {
          position: absolute;
          top: 8px;
          right: 10px;
          z-index: 3;
          color: white;
          font-size: 34px;
          text-shadow: 0 2px 10px
            rgba(0, 0, 0, 0.18);
          pointer-events: none;
        }

        .imageWrapper {
          position: relative;
          height: 180px;
          overflow: hidden;
          background-color: #f9eadf;
        }

        .imageWrapper img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .recipeCard:hover
          .imageWrapper img {
          transform: scale(1.04);
        }

        .chefIcon {
          position: absolute;
          left: 14px;
          bottom: 12px;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          color: #b90f2f;
          background-color: rgba(
            255,
            250,
            243,
            0.94
          );
          box-shadow: 0 8px 18px
            rgba(95, 31, 35, 0.18);
        }

        .categoryBadge {
          position: absolute;
          right: 14px;
          bottom: 14px;
          padding: 7px 12px;
          border: 1px solid
            rgba(255, 255, 255, 0.75);
          border-radius: 999px;
          color: #8f0d25;
          background-color: rgba(
            255,
            250,
            243,
            0.92
          );
          backdrop-filter: blur(7px);
          font-size: 12px;
          font-weight: 700;
        }

        .cardContent {
          padding: 17px 18px 19px;
        }

        .author {
          margin: 0 0 7px;
          color: #b90f2f;
          font-size: 12px;
          font-weight: 700;
        }

        .cardContent h3 {
          margin: 0 0 9px;
          color: #8f0d25;
          font-family: Georgia, serif;
          font-size: 19px;
          font-weight: 500;
          line-height: 1.35;
        }

        .cardDescription {
          display: -webkit-box;
          min-height: 44px;
          overflow: hidden;
          margin: 0 0 14px;
          color: #8a5c52;
          font-size: 14px;
          line-height: 1.55;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        .cardMeta {
          display: flex;
          align-items: center;
          gap: 11px;
          flex-wrap: wrap;
          padding-top: 13px;
          border-top: 1px dashed
            #ead7c4;
        }

        .cardMeta span {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #7c4a42;
          font-size: 13px;
          font-weight: 600;
        }
      `}</style>
    </a>
  );
}

function StatusCard({
  type,
  message,
  onRetry,
}: {
  type: "loading" | "error" | "empty";
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <section className="statusSection">
      <div className="statusCard">
        {type === "loading" && (
          <LoaderCircle
            size={42}
            className="loadingIcon"
          />
        )}

        {type === "error" && (
          <RefreshCw size={42} />
        )}

        {type === "empty" && (
          <ChefHat size={46} />
        )}

        <h2>
          {type === "loading" &&
            "Loading recipes..."}

          {type === "error" &&
            "Unable to load recipes"}

          {type === "empty" &&
            "No recipes yet"}
        </h2>

        <p>
          {type === "loading" &&
            "กำลังดึงข้อมูลสูตรอาหารจาก MongoDB"}

          {type === "error" &&
            (message ||
              "Please check the backend connection.")}

          {type === "empty" &&
            "เริ่มแบ่งปันสูตรอาหารแรกของคุณกับ RecipePeeker ได้เลย"}
        </p>

        {type === "error" && onRetry && (
          <button
            type="button"
            onClick={onRetry}
          >
            <RefreshCw size={17} />
            Try Again
          </button>
        )}

        {type === "empty" && (
          <a href="/create_recipe">
            <PlusCircle size={18} />
            Add Recipe
          </a>
        )}
      </div>

      <style jsx>{`
        .statusSection {
          position: relative;
          z-index: 1;
          padding: 20px 60px 60px;
        }

        .statusCard {
          max-width: 700px;
          box-sizing: border-box;
          margin: 0 auto;
          padding: 42px 28px;
          border: 1px solid #ead7c4;
          border-radius: 26px;
          color: #7c4a42;
          background-color: #fffaf3;
          box-shadow: 0 16px 38px
            rgba(95, 31, 35, 0.1);
          text-align: center;
        }

        .statusCard :global(svg) {
          color: #b90f2f;
        }

        .statusCard h2 {
          margin: 14px 0 8px;
          color: #8f0d25;
          font-family: Georgia, serif;
          font-size: 26px;
        }

        .statusCard p {
          margin: 0 0 20px;
          line-height: 1.7;
        }

        .statusCard button,
        .statusCard a {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 19px;
          border: none;
          border-radius: 999px;
          color: white;
          background-color: #b90f2f;
          text-decoration: none;
          cursor: pointer;
          font-family: inherit;
          font-weight: 700;
        }

        :global(.loadingIcon) {
          animation: spin 0.9s linear
            infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 760px) {
          .statusSection {
            padding-right: 18px;
            padding-left: 18px;
          }
        }
      `}</style>
    </section>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  overflow: "hidden",
  color: "#5f1f23",
  background:
    "radial-gradient(circle at top left, rgba(255,255,255,0.9), transparent 28%), linear-gradient(180deg, #fff7ed 0%, #fffaf3 45%, #f9eadf 100%)",
};

const leftDecorationStyle:
  React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  zIndex: 0,
  color: "rgba(255,255,255,0.96)",
  fontSize: "120px",
  lineHeight: 1,
  pointerEvents: "none",
};

const rightDecorationStyle:
  React.CSSProperties = {
  ...leftDecorationStyle,
  right: 0,
  left: "auto",
  transform: "scaleX(-1)",
};

const primaryButtonStyle:
  React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "10px",
  padding: "14px 24px",
  border: "none",
  borderRadius: "999px",
  color: "white",
  backgroundColor: "#b90f2f",
  boxShadow:
    "0 12px 26px rgba(185,15,47,0.25)",
  textDecoration: "none",
  fontWeight: "700",
};

const secondaryButtonStyle:
  React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "10px",
  padding: "14px 24px",
  border: "1px solid #d8b9a6",
  borderRadius: "999px",
  color: "#7a2d32",
  backgroundColor:
    "rgba(255,250,243,0.82)",
  textDecoration: "none",
  fontWeight: "700",
};

const smallSearchButtonStyle:
  React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  padding: "12px 20px",
  borderRadius: "16px",
  color: "white",
  backgroundColor: "#b90f2f",
  textDecoration: "none",
  fontWeight: "700",
};

const categoryStyle:
  React.CSSProperties = {
  padding: "12px 22px",
  border: "1px solid #ead7c4",
  borderRadius: "999px",
  color: "#8f0d25",
  backgroundColor:
    "rgba(255,250,243,0.88)",
  boxShadow:
    "0 10px 22px rgba(95,31,35,0.08)",
  textDecoration: "none",
  fontWeight: "600",
};