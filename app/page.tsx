"use client";

import { useState } from "react";
import Navbar from "@/app/components/Navbar";
import { Search, Heart, Sparkles, Clock, ChefHat } from "lucide-react";

const featuredRecipes = [
  {
    id: 1,
    title: "Cherry Cream Cake",
    category: "Dessert",
    time: "45 mins",
    difficulty: "Medium",
    thumbnail:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    title: "Strawberry Pancakes",
    category: "Breakfast",
    time: "25 mins",
    difficulty: "Easy",
    thumbnail:
      "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    title: "Creamy Tomato Pasta",
    category: "Pasta",
    time: "30 mins",
    difficulty: "Easy",
    thumbnail:
      "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 4,
    title: "Thai Basil Chicken",
    category: "Thai Food",
    time: "35 mins",
    difficulty: "Medium",
    thumbnail:
      "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 5,
    title: "Cherry Lemon Soda",
    category: "Drinks",
    time: "10 mins",
    difficulty: "Easy",
    thumbnail:
      "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80",
  },
];

const categories = ["Dessert", "Breakfast", "Pasta", "Thai Food", "Drinks"];

export default function Home() {
  const [searchText, setSearchText] = useState("");

  const searchHref = searchText.trim()
    ? `/search?query=${encodeURIComponent(searchText.trim())}`
    : "/search";

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(255, 255, 255, 0.9), transparent 28%), linear-gradient(180deg, #fff7ed 0%, #fffaf3 45%, #f9eadf 100%)",
        color: "#5f1f23",
        overflow: "hidden",
      }}
    >
      <Navbar />

      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          fontSize: "120px",
          color: "rgba(255, 255, 255, 0.96)",
          zIndex: 0,
          pointerEvents: "none",
          lineHeight: 1,
        }}
      >
        ❦
      </div>

      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          fontSize: "120px",
          color: "rgba(255, 255, 255, 0.96)",
          zIndex: 0,
          pointerEvents: "none",
          lineHeight: 1,
          transform: "scaleX(-1)",
        }}
      >
        ❦
      </div>

      <section
        style={{
          position: "relative",
          zIndex: 1,
          padding: "30px 60px 18px",
        }}
      >
        <div
          style={{
            minHeight: "430px",
            borderRadius: "34px",
            border: "1px solid #ead7c4",
            overflow: "hidden",
            background:
              "linear-gradient(90deg, rgba(255, 250, 243, 0.98) 0%, rgba(255, 250, 243, 0.9) 42%, rgba(255, 250, 243, 0.3) 64%), url('https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=1800&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            boxShadow: "0 24px 70px rgba(95, 31, 35, 0.16)",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "18px",
              border: "1px solid rgba(255, 255, 255, 0.9)",
              borderRadius: "26px",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "absolute",
              top: "18px",
              left: "22px",
              fontSize: "74px",
              color: "rgba(255, 255, 255, 0.92)",
              pointerEvents: "none",
            }}
          >
          </div>

          <div
            style={{
              maxWidth: "700px",
              padding: "58px 64px",
              position: "relative",
              zIndex: 2,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "px",
                padding: "8px 14px",
                borderRadius: "999px",
                border: "1px solid #f1c9bd",
                backgroundColor: "rgba(255, 250, 243, 0.78)",
                color: "#b90f2f",
                fontSize: "13px",
                fontWeight: "bold",
                letterSpacing: "0.08em",
                marginBottom: "20px",
              }}
            >
              <Sparkles size={15} />
              FEATURED RECIPE
            </span>

            <h1
              style={{
                fontSize: "64px",
                lineHeight: "1.05",
                marginBottom: "18px",
                fontFamily: "Georgia, serif",
                color: "#8f0d25",
                fontWeight: 500,
              }}
            >
              Cherry Cream Cake
            </h1>

            <div
              style={{
                color: "#c2344e",
                fontFamily: "Georgia, serif",
                fontSize: "24px",
                marginBottom: "18px",
              }}
            >
              ✧ ───── ♡ ───── ✧
            </div>

            <p
              style={{
                maxWidth: "560px",
                color: "#7c4a42",
                lineHeight: "1.8",
                fontSize: "17px",
                marginBottom: "26px",
              }}
            >
              Discover cozy recipes, save your favorites, and collect sweet
              ideas for your next homemade meal.
            </p>

            <div
              style={{
                display: "flex",
                gap: "14px",
                flexWrap: "wrap",
                marginBottom: "24px",
              }}
            >
              <a href="/trailer/1" style={primaryButtonStyle}>
                <ChefHat size={18} />
                View Recipe
              </a>

              <a href="/watchlist" style={secondaryButtonStyle}>
                <Heart size={18} />
                Saved Recipes
              </a>
            </div>

            <div
              style={{
                width: "100%",
                maxWidth: "620px",
                display: "flex",
                gap: "10px",
                padding: "8px",
                borderRadius: "22px",
                backgroundColor: "rgba(255, 250, 243, 0.92)",
                border: "1px solid #ead7c4",
                boxShadow: "0 14px 28px rgba(95, 31, 35, 0.12)",
              }}
            >
              <input
                type="text"
                placeholder="Search recipes, desserts, drinks..."
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                style={{
                  flex: 1,
                  minWidth: "180px",
                  border: "none",
                  outline: "none",
                  backgroundColor: "transparent",
                  color: "#5f1f23",
                  fontSize: "16px",
                  padding: "12px 14px",
                }}
              />

              <a href={searchHref} style={smallSearchButtonStyle}>
                <Search size={18} />
                Search
              </a>
            </div>
          </div>
        </div>
      </section>

      <section
        style={{
          position: "relative",
          zIndex: 1,
          padding: "0 60px 22px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "14px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {categories.map((category) => (
            <a
              key={category}
              href={`/search?query=${encodeURIComponent(category)}`}
              style={categoryStyle}
            >
              {category}
            </a>
          ))}
        </div>
      </section>

      <section
        style={{
          position: "relative",
          zIndex: 1,
          padding: "8px 60px 34px",
        }}
      >
        <SectionTitle title="Featured Recipes" />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "24px",
          }}
        >
          {featuredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </section>

      <section
        style={{
          position: "relative",
          zIndex: 1,
          padding: "0 60px 60px",
        }}
      >
        <SectionTitle title="Trending Recipes" />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "24px",
          }}
        >
          {[...featuredRecipes].reverse().map((recipe) => (
            <RecipeCard key={`trending-${recipe.id}`} recipe={recipe} />
          ))}
        </div>
      </section>

      <footer
        style={{
          padding: "24px 60px",
          borderTop: "1px solid #ead7c4",
          textAlign: "center",
          color: "#9a6b5f",
          backgroundColor: "rgba(255, 250, 243, 0.8)",
        }}
      >
        <p>❦ 2026 RecipePeeker. Find your next cozy recipe. ❦</p>
      </footer>
    </main>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "16px",
        marginBottom: "18px",
      }}
    >
      <h2
        style={{
          fontSize: "28px",
          fontFamily: "Georgia, serif",
          color: "#8f0d25",
          fontWeight: 500,
        }}
      >
        ❧ {title}
      </h2>

      <a
        href="/search"
        style={{
          color: "#b90f2f",
          textDecoration: "none",
          fontWeight: "bold",
        }}
      >
        View all →
      </a>
    </div>
  );
}

function RecipeCard({
  recipe,
}: {
  recipe: {
    id: number;
    title: string;
    category: string;
    time: string;
    difficulty: string;
    thumbnail: string;
  };
}) {
  return (
    <a
      href={`/trailer/${recipe.id}`}
      style={{
        backgroundColor: "#fffaf3",
        borderRadius: "20px",
        overflow: "hidden",
        border: "1px solid #ead7c4",
        boxShadow: "0 14px 30px rgba(95, 31, 35, 0.11)",
        textDecoration: "none",
        color: "#5f1f23",
        display: "block",
        cursor: "pointer",
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
          textShadow: "0 2px 10px rgba(0,0,0,0.18)",
          pointerEvents: "none",
        }}
      >
        ❦
      </div>

      <div style={{ position: "relative" }}>
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

        <span
          style={{
            position: "absolute",
            left: "14px",
            bottom: "12px",
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            backgroundColor: "rgba(255, 250, 243, 0.94)",
            color: "#b90f2f",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 18px rgba(95, 31, 35, 0.18)",
          }}
        >
          <ChefHat size={18} />
        </span>
      </div>

      <div
        style={{
          padding: "16px 18px 18px",
          textAlign: "center",
        }}
      >
        <h3
          style={{
            fontSize: "18px",
            marginBottom: "8px",
            color: "#8f0d25",
            fontFamily: "Georgia, serif",
            lineHeight: "1.35",
          }}
        >
          {recipe.title}
        </h3>

        <p
          style={{
            color: "#9a6b5f",
            fontSize: "14px",
            marginBottom: "10px",
          }}
        >
          {recipe.category}
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            flexWrap: "wrap",
            color: "#7c4a42",
            fontSize: "13px",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <Clock size={14} />
            {recipe.time}
          </span>

          <span>• {recipe.difficulty}</span>
        </div>
      </div>
    </a>
  );
}

const primaryButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "10px",
  padding: "14px 24px",
  borderRadius: "999px",
  border: "none",
  backgroundColor: "#b90f2f",
  color: "white",
  cursor: "pointer",
  textDecoration: "none",
  fontWeight: "bold",
  boxShadow: "0 12px 26px rgba(185, 15, 47, 0.25)",
};

const secondaryButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "10px",
  padding: "14px 24px",
  borderRadius: "999px",
  border: "1px solid #d8b9a6",
  backgroundColor: "rgba(255, 250, 243, 0.82)",
  color: "#7a2d32",
  cursor: "pointer",
  textDecoration: "none",
  fontWeight: "bold",
};

const smallSearchButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "12px 20px",
  borderRadius: "16px",
  backgroundColor: "#b90f2f",
  color: "white",
  textDecoration: "none",
  fontWeight: "bold",
};

const categoryStyle: React.CSSProperties = {
  padding: "12px 22px",
  borderRadius: "999px",
  border: "1px solid #ead7c4",
  backgroundColor: "rgba(255, 250, 243, 0.88)",
  color: "#8f0d25",
  cursor: "pointer",
  fontWeight: "600",
  textDecoration: "none",
  boxShadow: "0 10px 22px rgba(95, 31, 35, 0.08)",
};