"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import { ChefHat, Clock, Heart, Trash2 } from "lucide-react";

type Recipe = {
  id: string;
  title: string;
  category: string;
  time: string;
  difficulty: string;
  servings: string;
  thumbnail: string;
  description: string;
  ingredients: string[];
  steps: string[];
};

type RecipeDetailProps = {
  params: Promise<{
    id: string;
  }>;
};

type SavedRecipeItem = {
  id: number;
  title: string;
  channel: string;
  thumbnail: string;
  status: "Want to Watch" | "Watched" | "Favorite";
};

type Review = {
  id: number;
  rating: number;
  comment: string;
};

const recipes: Recipe[] = [
  {
    id: "1",
    title: "Cherry Cream Cake",
    category: "Dessert",
    time: "45 mins",
    difficulty: "Medium",
    servings: "4 servings",
    thumbnail:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80",
    description:
      "A soft cream cake with sweet cherry topping, perfect for a cozy afternoon dessert.",
    ingredients: [
      "2 cups cake flour",
      "1 cup whipped cream",
      "1/2 cup cherry jam",
      "2 eggs",
      "1/2 cup sugar",
      "1 tsp vanilla extract",
    ],
    steps: [
      "Prepare the cake batter with flour, eggs, sugar, and vanilla.",
      "Bake until soft and golden.",
      "Let the cake cool before adding whipped cream.",
      "Spread cherry jam on top and decorate with cherries.",
    ],
  },
  {
    id: "2",
    title: "Strawberry Pancakes",
    category: "Breakfast",
    time: "25 mins",
    difficulty: "Easy",
    servings: "2 servings",
    thumbnail:
      "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=1200&q=80",
    description:
      "Fluffy pancakes topped with strawberries and cream for a sweet breakfast.",
    ingredients: [
      "1 cup pancake mix",
      "1 egg",
      "3/4 cup milk",
      "Fresh strawberries",
      "Whipped cream",
      "Maple syrup",
    ],
    steps: [
      "Mix pancake batter until smooth.",
      "Cook pancakes on a warm pan until golden.",
      "Top with strawberries and whipped cream.",
      "Drizzle maple syrup before serving.",
    ],
  },
  {
    id: "3",
    title: "Creamy Tomato Pasta",
    category: "Pasta",
    time: "30 mins",
    difficulty: "Easy",
    servings: "2 servings",
    thumbnail:
      "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=1200&q=80",
    description:
      "Creamy tomato pasta with herbs, cheese, and a warm homemade flavor.",
    ingredients: [
      "200g pasta",
      "1 cup tomato sauce",
      "1/2 cup cooking cream",
      "Garlic",
      "Parmesan cheese",
      "Basil leaves",
    ],
    steps: [
      "Boil pasta until al dente.",
      "Cook garlic with tomato sauce.",
      "Add cream and stir until smooth.",
      "Mix pasta with sauce and top with cheese.",
    ],
  },
  {
    id: "4",
    title: "Thai Basil Chicken",
    category: "Thai Food",
    time: "35 mins",
    difficulty: "Medium",
    servings: "2 servings",
    thumbnail:
      "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?auto=format&fit=crop&w=1200&q=80",
    description:
      "A tasty Thai stir-fry recipe with basil, chicken, and a savory sauce.",
    ingredients: [
      "Chicken pieces",
      "Thai basil leaves",
      "Garlic",
      "Chili",
      "Soy sauce",
      "Rice",
    ],
    steps: [
      "Stir-fry garlic and chili until fragrant.",
      "Add chicken and cook until done.",
      "Season with soy sauce and stir well.",
      "Add basil leaves and serve with rice.",
    ],
  },
  {
    id: "5",
    title: "Cherry Lemon Soda",
    category: "Drinks",
    time: "10 mins",
    difficulty: "Easy",
    servings: "1 glass",
    thumbnail:
      "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=1200&q=80",
    description:
      "A refreshing cherry lemon soda with a sweet and sparkling taste.",
    ingredients: [
      "Cherry syrup",
      "Lemon juice",
      "Soda water",
      "Ice cubes",
      "Fresh cherry",
      "Mint leaves",
    ],
    steps: [
      "Add cherry syrup and lemon juice into a glass.",
      "Fill the glass with ice cubes.",
      "Pour soda water and stir gently.",
      "Decorate with cherry and mint leaves.",
    ],
  },
];

export default function RecipeDetailPage({ params }: RecipeDetailProps) {
  const router = useRouter();
  const { id } = use(params);

  const recipe = recipes.find((item) => item.id === id);

  const [toast, setToast] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);

  const showToast = (message: string) => {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 2500);
  };

  const getSavedRecipes = (): SavedRecipeItem[] => {
    const savedRecipes = localStorage.getItem("watchlist");
    return savedRecipes ? JSON.parse(savedRecipes) : [];
  };

  const saveRecipes = (updatedRecipes: SavedRecipeItem[]) => {
    localStorage.setItem("watchlist", JSON.stringify(updatedRecipes));
  };

  const getReviewKey = () => `reviews-${id}`;

  const saveReviews = (updatedReviews: Review[]) => {
    localStorage.setItem(getReviewKey(), JSON.stringify(updatedReviews));
  };

  useEffect(() => {
    if (!recipe) return;

    const savedRecipes = getSavedRecipes();

    const alreadySaved = savedRecipes.some(
      (item) => item.id === Number(recipe.id)
    );

    setIsSaved(alreadySaved);
  }, [recipe]);

  useEffect(() => {
    const savedReviews = localStorage.getItem(getReviewKey());
    const parsedReviews = savedReviews ? JSON.parse(savedReviews) : [];

    setReviews(parsedReviews);
  }, [id]);

  const handleSaveRecipe = () => {
    if (!recipe) return;

    const loginStatus = localStorage.getItem("isLoggedIn");

    if (loginStatus !== "true") {
      showToast("Please login before saving this recipe.");

      setTimeout(() => {
        router.push(`/login?redirect=/trailer/${id}`);
      }, 1200);

      return;
    }

    const savedRecipes = getSavedRecipes();

    const alreadySaved = savedRecipes.some(
      (item) => item.id === Number(recipe.id)
    );

    if (alreadySaved) {
      setIsSaved(true);
      showToast("This recipe is already saved.");
      return;
    }

    const newItem: SavedRecipeItem = {
      id: Number(recipe.id),
      title: recipe.title,
      channel: recipe.category,
      thumbnail: recipe.thumbnail,
      status: "Want to Watch",
    };

    const updatedRecipes = [...savedRecipes, newItem];

    saveRecipes(updatedRecipes);
    setIsSaved(true);

    showToast("Saved to your recipes ✨");
  };

  const handleRemoveRecipe = () => {
    if (!recipe) return;

    const updatedRecipes = getSavedRecipes().filter(
      (item) => item.id !== Number(recipe.id)
    );

    saveRecipes(updatedRecipes);
    setIsSaved(false);

    showToast("Removed from saved recipes.");
  };

  const handleSubmitReview = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const loginStatus = localStorage.getItem("isLoggedIn");

    if (loginStatus !== "true") {
      showToast("Please login before writing a review.");

      setTimeout(() => {
        router.push(`/login?redirect=/trailer/${id}`);
      }, 1200);

      return;
    }

    if (!rating || !comment.trim()) {
      showToast("Please fill in rating and comment.");
      return;
    }

    const ratingNumber = Number(rating);

    if (ratingNumber < 1 || ratingNumber > 10) {
      showToast("Rating must be between 1 and 10.");
      return;
    }

    const newReview: Review = {
      id: Date.now(),
      rating: ratingNumber,
      comment: comment.trim(),
    };

    const updatedReviews = [newReview, ...reviews];

    setReviews(updatedReviews);
    saveReviews(updatedReviews);

    setRating("");
    setComment("");

    showToast("Review added successfully ✨");
  };

  const handleDeleteReview = (reviewId: number) => {
    const updatedReviews = reviews.filter((review) => review.id !== reviewId);

    setReviews(updatedReviews);
    saveReviews(updatedReviews);

    showToast("Review deleted.");
  };

  if (!recipe) {
    return (
      <main
        style={{
          minHeight: "100vh",
          backgroundColor: "#fff7ed",
          color: "#5f1f23",
        }}
      >
        <Navbar />

        <section
          style={{
            padding: "48px 60px",
          }}
        >
          <h1
            style={{
              fontFamily: "Georgia, serif",
              color: "#8f0d25",
            }}
          >
            Recipe not found
          </h1>

          <a
            href="/search"
            style={{
              color: "#b90f2f",
              display: "inline-block",
              marginTop: "20px",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            ← Back to Search
          </a>
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
            borderLeft:
              toast.includes("Saved") || toast.includes("successfully")
                ? "5px solid #22c55e"
                : "5px solid #b90f2f",
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
          padding: "44px 60px 70px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "24px",
            right: "40px",
            fontSize: "110px",
            color: "rgba(255,255,255,0.9)",
            pointerEvents: "none",
          }}
        >
          ❦
        </div>

        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "grid",
            gridTemplateColumns: "minmax(280px, 1.05fr) minmax(280px, 0.95fr)",
            gap: "32px",
            alignItems: "stretch",
          }}
        >
          <div
            style={{
              backgroundColor: "#fffaf3",
              border: "1px solid #ead7c4",
              borderRadius: "30px",
              padding: "34px",
              boxShadow: "0 20px 50px rgba(95, 31, 35, 0.12)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-18px",
                right: "-6px",
                fontSize: "86px",
                color: "rgba(185, 15, 47, 0.08)",
              }}
            >
              ❦
            </div>

            <p
              style={{
                color: "#b90f2f",
                fontWeight: "bold",
                letterSpacing: "0.08em",
                fontSize: "13px",
                marginBottom: "12px",
              }}
            >
              ❧ RECIPE DETAIL
            </p>

            <h1
              style={{
                fontSize: "48px",
                lineHeight: "1.08",
                marginBottom: "16px",
                fontFamily: "Georgia, serif",
                color: "#8f0d25",
                fontWeight: 500,
              }}
            >
              {recipe.title}
            </h1>

            <p
              style={{
                color: "#7c4a42",
                lineHeight: "1.8",
                fontSize: "16px",
                marginBottom: "22px",
              }}
            >
              {recipe.description}
            </p>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginBottom: "26px",
              }}
            >
              <InfoBadge text={recipe.category} />
              <InfoBadge text={recipe.time} />
              <InfoBadge text={recipe.difficulty} />
              <InfoBadge text={recipe.servings} />
            </div>

            <button
              type="button"
              onClick={isSaved ? handleRemoveRecipe : handleSaveRecipe}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "14px 24px",
                borderRadius: "999px",
                border: "none",
                backgroundColor: isSaved ? "#7c4a42" : "#b90f2f",
                color: "white",
                cursor: "pointer",
                fontWeight: "bold",
                boxShadow: "0 12px 26px rgba(185, 15, 47, 0.22)",
                marginRight: "12px",
              }}
            >
              <Heart size={18} />
              {isSaved ? "Remove Recipe" : "Save Recipe"}
            </button>

            <a
              href="/search"
              style={{
                display: "inline-flex",
                padding: "14px 22px",
                borderRadius: "999px",
                border: "1px solid #d8b9a6",
                color: "#7a2d32",
                textDecoration: "none",
                fontWeight: "bold",
                backgroundColor: "rgba(255, 250, 243, 0.82)",
                marginTop: "12px",
              }}
            >
              ← Back to Search
            </a>
          </div>

          <div
            style={{
              borderRadius: "30px",
              overflow: "hidden",
              border: "1px solid #ead7c4",
              boxShadow: "0 20px 50px rgba(95, 31, 35, 0.14)",
              backgroundColor: "#fffaf3",
              position: "relative",
              minHeight: "360px",
            }}
          >
            <img
              src={recipe.thumbnail}
              alt={recipe.title}
              style={{
                width: "100%",
                height: "100%",
                minHeight: "360px",
                objectFit: "cover",
                display: "block",
              }}
            />

            <div
              style={{
                position: "absolute",
                inset: "18px",
                border: "1px solid rgba(255,255,255,0.9)",
                borderRadius: "22px",
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                position: "absolute",
                left: "22px",
                bottom: "22px",
                padding: "10px 16px",
                borderRadius: "999px",
                backgroundColor: "rgba(255, 250, 243, 0.92)",
                color: "#b90f2f",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: "bold",
              }}
            >
              <ChefHat size={18} />
              Cozy recipe
            </div>
          </div>
        </div>

        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
            marginTop: "28px",
          }}
        >
          <RecipePanel title="Ingredients">
            <ul
              style={{
                margin: 0,
                paddingLeft: "20px",
                color: "#7c4a42",
                lineHeight: "1.9",
              }}
            >
              {recipe.ingredients.map((ingredient) => (
                <li key={ingredient}>{ingredient}</li>
              ))}
            </ul>
          </RecipePanel>

          <RecipePanel title="Cooking Steps">
            <ol
              style={{
                margin: 0,
                paddingLeft: "20px",
                color: "#7c4a42",
                lineHeight: "1.9",
              }}
            >
              {recipe.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </RecipePanel>
        </div>

        <RecipePanel title="Reviews" extraStyle={{ marginTop: "28px" }}>
          <form onSubmit={handleSubmitReview}>
            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                marginBottom: "12px",
              }}
            >
              <input
                type="number"
                placeholder="Rating 1-10"
                value={rating}
                onChange={(event) => setRating(event.target.value)}
                style={inputStyle}
              />

              <input
                type="text"
                placeholder="Write your review..."
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                style={{
                  ...inputStyle,
                  flex: 1,
                  minWidth: "240px",
                }}
              />

              <button
                type="submit"
                style={{
                  padding: "13px 20px",
                  borderRadius: "16px",
                  border: "none",
                  backgroundColor: "#b90f2f",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Add Review
              </button>
            </div>
          </form>

          {reviews.length === 0 ? (
            <p
              style={{
                color: "#8a5c52",
                marginTop: "14px",
              }}
            >
              No reviews yet. Be the first to review this recipe.
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginTop: "18px",
              }}
            >
              {reviews.map((review) => (
                <div
                  key={review.id}
                  style={{
                    padding: "16px",
                    borderRadius: "18px",
                    backgroundColor: "#fff7ed",
                    border: "1px solid #ead7c4",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "14px",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <p
                      style={{
                        color: "#b90f2f",
                        fontWeight: "bold",
                        marginBottom: "6px",
                      }}
                    >
                      Rating: {review.rating}/10
                    </p>

                    <p
                      style={{
                        color: "#7c4a42",
                        lineHeight: "1.6",
                      }}
                    >
                      {review.comment}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteReview(review.id)}
                    style={{
                      border: "none",
                      backgroundColor: "transparent",
                      color: "#b90f2f",
                      cursor: "pointer",
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </RecipePanel>
      </section>
    </main>
  );
}

function InfoBadge({ text }: { text: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "9px 14px",
        borderRadius: "999px",
        backgroundColor: "#fff7ed",
        border: "1px solid #ead7c4",
        color: "#8f0d25",
        fontWeight: "600",
      }}
    >
      <Clock size={14} />
      {text}
    </span>
  );
}

function RecipePanel({
  title,
  children,
  extraStyle,
}: {
  title: string;
  children: React.ReactNode;
  extraStyle?: React.CSSProperties;
}) {
  return (
    <section
      style={{
        backgroundColor: "#fffaf3",
        border: "1px solid #ead7c4",
        borderRadius: "26px",
        padding: "26px",
        boxShadow: "0 16px 34px rgba(95, 31, 35, 0.1)",
        position: "relative",
        overflow: "hidden",
        ...extraStyle,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-18px",
          right: "0",
          fontSize: "76px",
          color: "rgba(185, 15, 47, 0.07)",
          pointerEvents: "none",
        }}
      >
        ❦
      </div>

      <h2
        style={{
          fontSize: "26px",
          fontFamily: "Georgia, serif",
          color: "#8f0d25",
          marginBottom: "16px",
          fontWeight: 500,
        }}
      >
        ❧ {title}
      </h2>

      {children}
    </section>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "13px 16px",
  borderRadius: "16px",
  border: "1px solid #ead7c4",
  backgroundColor: "#fff7ed",
  color: "#5f1f23",
  fontSize: "15px",
  outline: "none",
};