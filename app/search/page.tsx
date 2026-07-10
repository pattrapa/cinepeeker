"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import { Search, Clock, ChefHat } from "lucide-react";

type Recipe = {
  id: number;
  title: string;
  category: string;
  time: string;
  difficulty: string;
  description: string;
  thumbnail: string;
};

const recipes: Recipe[] = [
  {
    id: 1,
    title: "Cherry Cream Cake",
    category: "Dessert",
    time: "45 mins",
    difficulty: "Medium",
    description: "A soft cream cake with sweet cherry topping.",
    thumbnail:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    title: "Strawberry Pancakes",
    category: "Breakfast",
    time: "25 mins",
    difficulty: "Easy",
    description: "Fluffy pancakes topped with strawberry and cream.",
    thumbnail:
      "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    title: "Creamy Tomato Pasta",
    category: "Pasta",
    time: "30 mins",
    difficulty: "Easy",
    description: "Creamy pasta with tomato sauce and herbs.",
    thumbnail:
      "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 4,
    title: "Thai Basil Chicken",
    category: "Thai Food",
    time: "35 mins",
    difficulty: "Medium",
    description: "A tasty Thai stir-fry recipe with basil and chicken.",
    thumbnail:
      "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 5,
    title: "Cherry Lemon Soda",
    category: "Drinks",
    time: "10 mins",
    difficulty: "Easy",
    description: "A refreshing cherry lemon soda for a cozy afternoon.",
    thumbnail:
      "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80",
  },
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";

  const [searchText, setSearchText] = useState(query);

  const normalizedSearchText = searchText.toLowerCase().trim();

  const filteredRecipes = recipes.filter((recipe) => {
    const searchableText =
      `${recipe.title} ${recipe.category} ${recipe.time} ${recipe.difficulty} ${recipe.description}`.toLowerCase();

    return searchableText.includes(normalizedSearchText);
  });

  const searchHref = searchText.trim()
    ? `/search?query=${encodeURIComponent(searchText.trim())}`
    : "/search";

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(255,255,255,0.95), transparent 26%), linear-gradient(180deg, #fff7ed 0%, #fffaf3 48%, #f9eadf 100%)",
        color: "#5f1f23",
      }}
    >
      <Navbar />

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
            top: "18px",
            right: "40px",
            fontSize: "110px",
            color: "rgba(255, 255, 255, 0.86)",
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
            ❧ RECIPE SEARCH
          </p>

          <h1
            style={{
              fontSize: "44px",
              fontFamily: "Georgia, serif",
              color: "#8f0d25",
              marginBottom: "10px",
              fontWeight: 500,
            }}
          >
            Search Recipes
          </h1>

          <p
            style={{
              color: "#8a5c52",
              marginBottom: "28px",
              lineHeight: "1.7",
              maxWidth: "720px",
            }}
          >
            ค้นหาเมนูอาหาร ขนม เครื่องดื่ม หรือไอเดียทำอาหารที่อยากลองทำ
          </p>

          <div
            style={{
              display: "flex",
              gap: "12px",
              marginBottom: "34px",
              flexWrap: "wrap",
              padding: "10px",
              borderRadius: "24px",
              backgroundColor: "rgba(255, 250, 243, 0.9)",
              border: "1px solid #ead7c4",
              boxShadow: "0 16px 32px rgba(95, 31, 35, 0.1)",
              maxWidth: "720px",
            }}
          >
            <input
              type="text"
              placeholder="Type recipe name or category..."
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              style={{
                flex: 1,
                minWidth: "230px",
                padding: "14px 16px",
                fontSize: "16px",
                border: "none",
                borderRadius: "16px",
                outline: "none",
                backgroundColor: "transparent",
                color: "#5f1f23",
              }}
            />

            <a
              href={searchHref}
              style={{
                padding: "14px 24px",
                fontSize: "16px",
                borderRadius: "16px",
                backgroundColor: "#b90f2f",
                color: "white",
                cursor: "pointer",
                textDecoration: "none",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 12px 26px rgba(185, 15, 47, 0.22)",
              }}
            >
              <Search size={18} />
              Search
            </a>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
              marginBottom: "22px",
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
              ❧ Recipe Results
            </h2>

            {searchText.trim() && (
              <p
                style={{
                  color: "#8a5c52",
                }}
              >
                Showing results for:{" "}
                <span
                  style={{
                    color: "#b90f2f",
                    fontWeight: "bold",
                  }}
                >
                  {searchText}
                </span>
              </p>
            )}
          </div>

          {filteredRecipes.length === 0 ? (
            <div
              style={{
                padding: "32px",
                borderRadius: "24px",
                backgroundColor: "#fffaf3",
                border: "1px solid #ead7c4",
                color: "#7c4a42",
                maxWidth: "720px",
                boxShadow: "0 16px 34px rgba(95, 31, 35, 0.1)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "-18px",
                  right: "0",
                  fontSize: "80px",
                  color: "rgba(185, 15, 47, 0.08)",
                }}
              >
                ❦
              </div>

              <h3
                style={{
                  color: "#8f0d25",
                  fontSize: "24px",
                  marginBottom: "8px",
                  fontFamily: "Georgia, serif",
                }}
              >
                No recipes found
              </h3>

              <p
                style={{
                  lineHeight: "1.7",
                  marginBottom: "18px",
                }}
              >
                ไม่พบสูตรอาหารที่ตรงกับคำค้นนี้ ลองค้นหาด้วยชื่อเมนูหรือหมวดหมู่อีกครั้ง
              </p>

              <button
                type="button"
                onClick={() => setSearchText("")}
                style={{
                  padding: "12px 18px",
                  borderRadius: "999px",
                  border: "none",
                  backgroundColor: "#b90f2f",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "24px",
              }}
            >
              {filteredRecipes.map((recipe) => (
                <a
                  key={recipe.id}
                  href={`/trailer/${recipe.id}`}
                  style={{
                    backgroundColor: "#fffaf3",
                    borderRadius: "22px",
                    overflow: "hidden",
                    border: "1px solid #ead7c4",
                    textDecoration: "none",
                    color: "#5f1f23",
                    cursor: "pointer",
                    boxShadow: "0 16px 34px rgba(95, 31, 35, 0.11)",
                    display: "block",
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

                  <div
                    style={{
                      position: "relative",
                    }}
                  >
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
                      {recipe.category}
                    </p>

                    <h3
                      style={{
                        fontSize: "20px",
                        marginBottom: "10px",
                        lineHeight: "1.35",
                        color: "#8f0d25",
                        fontFamily: "Georgia, serif",
                        fontWeight: 500,
                      }}
                    >
                      {recipe.title}
                    </h3>

                    <p
                      style={{
                        color: "#8a5c52",
                        lineHeight: "1.6",
                        marginBottom: "14px",
                        fontSize: "14px",
                      }}
                    >
                      {recipe.description}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        color: "#7c4a42",
                        fontSize: "14px",
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <Clock size={15} />
                        {recipe.time}
                      </span>

                      <span>• {recipe.difficulty}</span>
                    </div>

                    <p
                      style={{
                        color: "#b90f2f",
                        fontWeight: "bold",
                        marginTop: "16px",
                      }}
                    >
                      View recipe →
                    </p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}