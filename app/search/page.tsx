"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useSearchParams } from "next/navigation";

import Navbar from "@/app/components/Navbar";

import {
  ChefHat,
  Clock,
  LoaderCircle,
  PlusCircle,
  RefreshCw,
  Search,
} from "lucide-react";

type Recipe = {
  _id: string;
  title: string;
  category: string;
  timeMinutes: number;
  difficulty: string;
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

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoadingPage />}>
      <SearchPageContent />
    </Suspense>
  );
}

function SearchPageContent() {
  const searchParams = useSearchParams();

  const query =
    searchParams.get("query") ?? "";

  const [searchText, setSearchText] =
    useState(query);

  const [recipes, setRecipes] =
    useState<Recipe[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    setSearchText(query);
  }, [query]);

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
          "Unable to load recipes:",
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

  const normalizedSearchText =
    searchText.toLowerCase().trim();

  const filteredRecipes = useMemo(() => {
    if (!normalizedSearchText) {
      return recipes;
    }

    return recipes.filter((recipe) => {
      const searchableText = [
        recipe.title,
        recipe.category,
        recipe.timeMinutes,
        `${recipe.timeMinutes} mins`,
        recipe.difficulty,
        recipe.description,
        recipe.authorName,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(
        normalizedSearchText,
      );
    });
  }, [
    normalizedSearchText,
    recipes,
  ]);

  const searchHref = searchText.trim()
    ? `/search?query=${encodeURIComponent(
        searchText.trim(),
      )}`
    : "/search";

  return (
    <main className="page">
      <Navbar />

      <section className="contentSection">
        <div className="topDecoration">
          ❦
        </div>

        <div className="contentContainer">
          <header className="pageHeader">
            <p className="eyebrow">
              ❧ RECIPE SEARCH
            </p>

            <h1>Search Recipes</h1>

            <p className="description">
              ค้นหาเมนูอาหาร ขนม เครื่องดื่ม
              หรือสูตรอาหารที่ผู้ใช้แบ่งปันไว้ใน
              RecipePeeker
            </p>
          </header>

          <div className="searchBox">
            <input
              type="text"
              placeholder="Type recipe name, category or difficulty..."
              value={searchText}
              onChange={(event) =>
                setSearchText(
                  event.target.value,
                )
              }
            />

            <a
              href={searchHref}
              className="searchButton"
            >
              <Search size={18} />
              Search
            </a>
          </div>

          <div className="resultHeading">
            <div>
              <h2>❧ Recipe Results</h2>

              {!isLoading &&
                !errorMessage && (
                  <p className="recipeCount">
                    {filteredRecipes.length}{" "}
                    {filteredRecipes.length === 1
                      ? "recipe"
                      : "recipes"}
                  </p>
                )}
            </div>

            {searchText.trim() && (
              <p className="searchSummary">
                Showing results for:{" "}
                <strong>
                  {searchText}
                </strong>
              </p>
            )}
          </div>

          {isLoading ? (
            <LoadingCard />
          ) : errorMessage ? (
            <ErrorCard
              message={errorMessage}
              onRetry={() => {
                void loadRecipes();
              }}
            />
          ) : filteredRecipes.length ===
            0 ? (
            <EmptyCard
              hasRecipes={recipes.length > 0}
              onClear={() =>
                setSearchText("")
              }
            />
          ) : (
            <div className="recipeGrid">
              {filteredRecipes.map(
                (recipe) => (
                  <RecipeCard
                    key={recipe._id}
                    recipe={recipe}
                  />
                ),
              )}
            </div>
          )}
        </div>
      </section>

      <style jsx>{`
        .page {
          min-height: 100vh;
          color: #5f1f23;
          background:
            radial-gradient(
              circle at top left,
              rgba(255, 255, 255, 0.95),
              transparent 26%
            ),
            linear-gradient(
              180deg,
              #fff7ed 0%,
              #fffaf3 48%,
              #f9eadf 100%
            );
        }

        .contentSection {
          position: relative;
          overflow: hidden;
          padding: 48px 60px 70px;
        }

        .contentContainer {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
        }

        .topDecoration {
          position: absolute;
          top: 18px;
          right: 40px;
          color: rgba(
            255,
            255,
            255,
            0.86
          );
          font-family: Georgia, serif;
          font-size: 110px;
          line-height: 1;
          pointer-events: none;
        }

        .pageHeader {
          margin-bottom: 28px;
        }

        .eyebrow {
          margin: 0 0 12px;
          color: #b90f2f;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.08em;
        }

        .pageHeader h1 {
          margin: 0 0 10px;
          color: #8f0d25;
          font-family: Georgia, serif;
          font-size: clamp(
            38px,
            6vw,
            48px
          );
          font-weight: 500;
        }

        .description {
          max-width: 720px;
          margin: 0;
          color: #8a5c52;
          line-height: 1.7;
        }

        .searchBox {
          width: 100%;
          max-width: 720px;
          display: flex;
          gap: 12px;
          box-sizing: border-box;
          margin-bottom: 34px;
          padding: 10px;
          border: 1px solid #ead7c4;
          border-radius: 24px;
          background-color: rgba(
            255,
            250,
            243,
            0.9
          );
          box-shadow: 0 16px 32px
            rgba(95, 31, 35, 0.1);
        }

        .searchBox input {
          min-width: 0;
          flex: 1;
          padding: 14px 16px;
          border: none;
          border-radius: 16px;
          outline: none;
          color: #5f1f23;
          background-color: transparent;
          font-family: inherit;
          font-size: 16px;
        }

        .searchButton {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 24px;
          border-radius: 16px;
          color: white;
          background-color: #b90f2f;
          box-shadow: 0 12px 26px
            rgba(185, 15, 47, 0.22);
          text-decoration: none;
          font-size: 16px;
          font-weight: 700;
        }

        .resultHeading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 22px;
        }

        .resultHeading h2 {
          margin: 0;
          color: #8f0d25;
          font-family: Georgia, serif;
          font-size: 28px;
          font-weight: 500;
        }

        .recipeCount {
          margin: 7px 0 0;
          color: #9a6b5f;
          font-size: 14px;
        }

        .searchSummary {
          margin: 0;
          color: #8a5c52;
        }

        .searchSummary strong {
          color: #b90f2f;
        }

        .recipeGrid {
          display: grid;
          grid-template-columns: repeat(
            auto-fit,
            minmax(
              min(250px, 100%),
              1fr
            )
          );
          gap: 24px;
        }

        @media (max-width: 720px) {
          .contentSection {
            padding: 36px 20px 60px;
          }

          .topDecoration {
            right: 5px;
            font-size: 80px;
          }

          .searchBox {
            flex-direction: column;
          }

          .searchButton {
            width: 100%;
            box-sizing: border-box;
          }
        }

        @media (max-width: 420px) {
          .contentSection {
            padding-right: 14px;
            padding-left: 14px;
          }
        }
      `}</style>
    </main>
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

        <div className="recipeMeta">
          <span>
            <Clock size={16} />
            {recipe.timeMinutes} mins
          </span>

          <span>
            <ChefHat size={16} />
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
          border-radius: 22px;
          color: #5f1f23;
          background-color: #fffaf3;
          box-shadow: 0 16px 34px
            rgba(95, 31, 35, 0.11);
          text-decoration: none;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .recipeCard:hover {
          transform: translateY(-5px);
          box-shadow: 0 22px 45px
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
            rgba(0, 0, 0, 0.2);
          pointer-events: none;
        }

        .imageWrapper {
          position: relative;
          height: 190px;
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
          padding: 19px;
        }

        .author {
          margin: 0 0 7px;
          color: #b90f2f;
          font-size: 12px;
          font-weight: 700;
        }

        .cardContent h3 {
          margin: 0 0 10px;
          color: #8f0d25;
          font-family: Georgia, serif;
          font-size: 21px;
          font-weight: 500;
          line-height: 1.35;
        }

        .cardDescription {
          display: -webkit-box;
          min-height: 48px;
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
          gap: 14px;
          flex-wrap: wrap;
          padding-top: 14px;
          border-top: 1px dashed
            #ead7c4;
        }

        .recipeMeta span {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #7c4a42;
          font-size: 13px;
          font-weight: 600;
        }
      `}</style>
    </a>
  );
}

function LoadingCard() {
  return (
    <div className="statusCard">
      <LoaderCircle
        size={38}
        className="loadingIcon"
      />

      <h3>Loading recipes...</h3>

      <p>
        กำลังดึงข้อมูลสูตรอาหารจาก
        MongoDB
      </p>

      <style jsx>{statusCardStyles}</style>

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
    </div>
  );
}

function ErrorCard({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="statusCard">
      <RefreshCw size={38} />

      <h3>Unable to load recipes</h3>

      <p>{message}</p>

      <button
        type="button"
        onClick={onRetry}
      >
        <RefreshCw size={17} />
        Try Again
      </button>

      <style jsx>{statusCardStyles}</style>
    </div>
  );
}

function EmptyCard({
  hasRecipes,
  onClear,
}: {
  hasRecipes: boolean;
  onClear: () => void;
}) {
  return (
    <div className="statusCard">
      <ChefHat size={42} />

      <h3>
        {hasRecipes
          ? "No matching recipes"
          : "No recipes yet"}
      </h3>

      <p>
        {hasRecipes
          ? "ไม่พบสูตรอาหารที่ตรงกับคำค้นนี้ ลองค้นหาด้วยชื่อเมนูหรือหมวดหมู่อีกครั้ง"
          : "ยังไม่มีสูตรอาหารในฐานข้อมูล ลองเพิ่มสูตรแรกของคุณได้เลย"}
      </p>

      {hasRecipes ? (
        <button
          type="button"
          onClick={onClear}
        >
          Clear Search
        </button>
      ) : (
        <a href="/create_recipe">
          <PlusCircle size={18} />
          Add Recipe
        </a>
      )}

      <style jsx>{statusCardStyles}</style>
    </div>
  );
}

function SearchLoadingPage() {
  return (
    <main className="loadingPage">
      <LoaderCircle
        size={42}
        className="loadingIcon"
      />

      <p>Preparing recipe search...</p>

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

const statusCardStyles = `
  .statusCard {
    position: relative;
    max-width: 720px;
    box-sizing: border-box;
    padding: 38px 32px;
    overflow: hidden;
    border: 1px solid #ead7c4;
    border-radius: 24px;
    color: #7c4a42;
    background-color: #fffaf3;
    box-shadow: 0 16px 34px
      rgba(95, 31, 35, 0.1);
    text-align: center;
  }

  .statusCard :global(svg) {
    color: #b90f2f;
  }

  .statusCard h3 {
    margin: 14px 0 8px;
    color: #8f0d25;
    font-family: Georgia, serif;
    font-size: 24px;
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
    padding: 12px 18px;
    border: none;
    border-radius: 999px;
    color: white;
    background-color: #b90f2f;
    text-decoration: none;
    cursor: pointer;
    font-family: inherit;
    font-weight: 700;
  }
`;