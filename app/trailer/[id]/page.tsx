"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  ChefHat,
  Clock3,
  CookingPot,
  Heart,
  Minus,
  Plus,
  Sparkles,
  Star,
  Trash2,
  UsersRound,
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

type Recipe = {
  id: number;
  title: string;
  category: string;
  time: string;
  difficulty: string;
  servings: string;
  description: string;
  thumbnail: string;
  ingredients: string[];
  steps: string[];
};

type Review = {
  id: number;
  username: string;
  text: string;
  rating: number;
  createdAt: string;
};

const recipes: Recipe[] = [
  {
    id: 1,
    title: "Cherry Cream Cake",
    category: "Dessert",
    time: "45 mins",
    difficulty: "Medium",
    servings: "4 servings",
    description:
      "A soft and elegant cherry cream cake layered with smooth cream and sweet cherries. Perfect for cozy afternoons and special occasions.",
    thumbnail:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80",
    ingredients: [
      "1½ cups all-purpose flour",
      "1 teaspoon baking powder",
      "½ cup unsalted butter",
      "¾ cup granulated sugar",
      "2 large eggs",
      "½ cup whole milk",
      "1 teaspoon vanilla extract",
      "1 cup whipped cream",
      "1 cup fresh or preserved cherries",
    ],
    steps: [
      "Preheat the oven to 175°C and prepare a round cake pan.",
      "Mix the flour and baking powder together in a bowl.",
      "Beat the butter and sugar until light and fluffy.",
      "Add the eggs one at a time, followed by the vanilla extract.",
      "Gradually mix in the dry ingredients and milk.",
      "Pour the mixture into the cake pan and bake for 25–30 minutes.",
      "Allow the cake to cool completely.",
      "Decorate with whipped cream and cherries before serving.",
    ],
  },
  {
    id: 2,
    title: "Strawberry Pancakes",
    category: "Breakfast",
    time: "25 mins",
    difficulty: "Easy",
    servings: "2 servings",
    description:
      "Fluffy homemade pancakes served with fresh strawberries and a gentle drizzle of syrup.",
    thumbnail:
      "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=1200&q=80",
    ingredients: [
      "1 cup all-purpose flour",
      "1 tablespoon sugar",
      "1 teaspoon baking powder",
      "1 large egg",
      "¾ cup milk",
      "1 tablespoon melted butter",
      "1 cup sliced strawberries",
      "Maple syrup for serving",
    ],
    steps: [
      "Combine the flour, sugar and baking powder.",
      "Whisk the egg, milk and melted butter in another bowl.",
      "Pour the wet mixture into the dry ingredients and mix gently.",
      "Heat a lightly greased pan over medium heat.",
      "Pour a small amount of batter into the pan.",
      "Cook until bubbles appear, then flip the pancake.",
      "Serve with strawberries and maple syrup.",
    ],
  },
  {
    id: 3,
    title: "Creamy Tomato Pasta",
    category: "Pasta",
    time: "30 mins",
    difficulty: "Easy",
    servings: "2 servings",
    description:
      "Comforting pasta coated in a smooth tomato cream sauce with herbs and parmesan.",
    thumbnail:
      "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=1200&q=80",
    ingredients: [
      "200 grams pasta",
      "1 tablespoon olive oil",
      "2 cloves garlic, minced",
      "1 cup tomato sauce",
      "½ cup cooking cream",
      "¼ cup grated parmesan",
      "Salt and black pepper",
      "Fresh basil for serving",
    ],
    steps: [
      "Cook the pasta according to its package instructions.",
      "Heat olive oil in a pan and sauté the garlic.",
      "Add the tomato sauce and simmer for 5 minutes.",
      "Stir in the cooking cream.",
      "Season with salt and black pepper.",
      "Add the cooked pasta and toss until evenly coated.",
      "Serve with parmesan and fresh basil.",
    ],
  },
  {
    id: 4,
    title: "Thai Basil Chicken",
    category: "Thai Food",
    time: "35 mins",
    difficulty: "Medium",
    servings: "2 servings",
    description:
      "A fragrant Thai-style stir-fry with chicken, garlic and fresh basil, served with warm rice.",
    thumbnail:
      "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?auto=format&fit=crop&w=1200&q=80",
    ingredients: [
      "300 grams minced chicken",
      "3 cloves garlic, minced",
      "1 small chili, sliced",
      "1 tablespoon cooking oil",
      "1 tablespoon oyster sauce",
      "1 teaspoon soy sauce",
      "1 teaspoon fish sauce",
      "½ teaspoon sugar",
      "1 cup fresh basil leaves",
      "Cooked rice for serving",
    ],
    steps: [
      "Heat the oil in a pan over medium-high heat.",
      "Add the garlic and chili, then stir until fragrant.",
      "Add the chicken and cook until no longer pink.",
      "Add oyster sauce, soy sauce, fish sauce and sugar.",
      "Stir until the chicken is fully coated.",
      "Add the basil leaves and cook briefly until wilted.",
      "Serve immediately with warm rice.",
    ],
  },
  {
    id: 5,
    title: "Cherry Lemon Soda",
    category: "Drinks",
    time: "10 mins",
    difficulty: "Easy",
    servings: "1 glass",
    description:
      "A bright and refreshing cherry lemon soda with a sweet-tart flavor and sparkling finish.",
    thumbnail:
      "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=1200&q=80",
    ingredients: [
      "½ cup cherry juice",
      "1 tablespoon lemon juice",
      "½ cup sparkling water",
      "1 teaspoon honey or syrup",
      "Ice cubes",
      "Fresh cherries and lemon slices",
    ],
    steps: [
      "Fill a serving glass with ice cubes.",
      "Pour in the cherry juice and lemon juice.",
      "Add honey or syrup and stir gently.",
      "Top with sparkling water.",
      "Decorate with cherries and a lemon slice.",
      "Serve immediately.",
    ],
  },
];

export default function RecipeDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const { data: session, status: sessionStatus } = useSession();

  const recipeId = Number(params.id);

  const recipe = useMemo(
    () => recipes.find((item) => item.id === recipeId),
    [recipeId],
  );

  const [isMockLoggedIn, setIsMockLoggedIn] =
    useState(false);

  const [isSaved, setIsSaved] = useState(false);
  const [isPageReady, setIsPageReady] = useState(false);

  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewMessage, setReviewMessage] = useState("");

  const isGoogleLoggedIn =
    sessionStatus === "authenticated";

  const isLoggedIn =
    isMockLoggedIn || isGoogleLoggedIn;


  useEffect(() => {
    const mockLoginStatus =
      localStorage.getItem("isLoggedIn") === "true";

    setIsMockLoggedIn(mockLoginStatus);

    if (!recipe) {
      setIsPageReady(true);
      return;
    }

    try {
      const savedRecipes: SavedRecipeItem[] = JSON.parse(
        localStorage.getItem("watchlist") || "[]",
      );

      const recipeIsSaved = savedRecipes.some(
        (item) => Number(item.id) === recipe.id,
      );

      setIsSaved(recipeIsSaved);
    } catch (error) {
      console.error("Unable to read saved recipes:", error);
      localStorage.setItem("watchlist", "[]");
      setIsSaved(false);
    }

    try {
      const storedReviews: Review[] = JSON.parse(
        localStorage.getItem(`reviews-${recipe.id}`) ||
        "[]",
      );

      const normalizedReviews = Array.isArray(storedReviews)
        ? storedReviews.map((review) => ({
          ...review,
          username:
            typeof review.username === "string" &&
              review.username.trim() !== ""
              ? review.username
              : "RecipePeeker User",
          text:
            typeof review.text === "string"
              ? review.text
              : "",
          rating:
            typeof review.rating === "number"
              ? review.rating
              : 5,
          createdAt:
            typeof review.createdAt === "string"
              ? review.createdAt
              : "",
        }))
        : [];

      setReviews(normalizedReviews);
    } catch (error) {
      console.error("Unable to read reviews:", error);
      localStorage.setItem(
        `reviews-${recipe.id}`,
        "[]",
      );
      setReviews([]);
    }

    setIsPageReady(true);
  }, [recipe]);


  const saveRecipeToLocalStorage = (
    selectedRecipe: Recipe,
  ) => {
    try {
      const savedRecipes: SavedRecipeItem[] = JSON.parse(
        localStorage.getItem("watchlist") || "[]",
      );

      const alreadySaved = savedRecipes.some(
        (item) => Number(item.id) === selectedRecipe.id,
      );

      if (alreadySaved) {
        setIsSaved(true);
        return;
      }

      const newSavedRecipe: SavedRecipeItem = {
        id: selectedRecipe.id,
        title: selectedRecipe.title,
        channel: selectedRecipe.category,
        thumbnail: selectedRecipe.thumbnail,
        status: "Want to Watch",
      };

      const updatedSavedRecipes = [
        ...savedRecipes,
        newSavedRecipe,
      ];

      localStorage.setItem(
        "watchlist",
        JSON.stringify(updatedSavedRecipes),
      );

      setIsSaved(true);
    } catch (error) {
      console.error("Unable to save recipe:", error);
    }
  };

  const handleSaveRecipe = () => {
    if (!recipe) {
      return;
    }

    if (sessionStatus === "loading") {
      return;
    }

    if (!isLoggedIn) {
      router.push(
        `/login?redirect=/trailer/${recipe.id}`,
      );

      return;
    }

    saveRecipeToLocalStorage(recipe);
  };

  const handleRemoveRecipe = () => {
    if (!recipe) {
      return;
    }

    try {
      const savedRecipes: SavedRecipeItem[] = JSON.parse(
        localStorage.getItem("watchlist") || "[]",
      );

      const updatedSavedRecipes = savedRecipes.filter(
        (item) => Number(item.id) !== recipe.id,
      );

      localStorage.setItem(
        "watchlist",
        JSON.stringify(updatedSavedRecipes),
      );

      setIsSaved(false);
    } catch (error) {
      console.error("Unable to remove recipe:", error);
    }
  };

  const handleAddReview = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!recipe) {
      return;
    }

    if (sessionStatus === "loading") {
      return;
    }

    if (!isLoggedIn) {
      router.push(
        `/login?redirect=/trailer/${recipe.id}`,
      );

      return;
    }

    const trimmedReview = reviewText.trim();

    if (!trimmedReview) {
      setReviewMessage(
        "Please write your review before submitting.",
      );

      return;
    }

    const mockUsername =
      localStorage.getItem("mockUser") || "";

    const username =
      session?.user?.name ||
      mockUsername ||
      "RecipePeeker User";

    const newReview: Review = {
      id: Date.now(),
      username,
      text: trimmedReview,
      rating: reviewRating,
      createdAt: new Date().toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "short",
          day: "numeric",
        },
      ),
    };

    const updatedReviews = [newReview, ...reviews];

    localStorage.setItem(
      `reviews-${recipe.id}`,
      JSON.stringify(updatedReviews),
    );

    setReviews(updatedReviews);
    setReviewText("");
    setReviewRating(5);
    setReviewMessage("Your review has been added.");
  };

  const handleDeleteReview = (reviewId: number) => {
    if (!recipe) {
      return;
    }

    const updatedReviews = reviews.filter(
      (review) => review.id !== reviewId,
    );

    localStorage.setItem(
      `reviews-${recipe.id}`,
      JSON.stringify(updatedReviews),
    );

    setReviews(updatedReviews);
    setReviewMessage("");
  };

  if (!isPageReady || sessionStatus === "loading") {
    return (
      <main style={loadingPageStyle}>
        <CookingPot
          size={42}
          color="#b90f2f"
          strokeWidth={1.7}
        />

        <p style={loadingTextStyle}>
          Preparing your recipe...
        </p>
      </main>
    );
  }

  if (!recipe) {
    return (
      <main style={notFoundPageStyle}>
        <div style={notFoundCardStyle}>
          <div style={notFoundIconStyle}>
            <CookingPot size={42} />
          </div>

          <span style={decorationTextStyle}>
            ❦ RecipePeeker ❦
          </span>

          <h1 style={notFoundHeadingStyle}>
            Recipe not found
          </h1>

          <p style={notFoundDescriptionStyle}>
            This recipe may have been removed or the address
            may be incorrect.
          </p>

          <a href="/" style={backHomeButtonStyle}>
            <ArrowLeft size={18} />
            Return Home
          </a>
        </div>
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
          Back to Recipes
        </button>

        <section style={heroCardStyle}>
          <div style={imageWrapperStyle}>
            <img
              src={recipe.thumbnail}
              alt={recipe.title}
              style={heroImageStyle}
            />

            <span style={categoryBadgeStyle}>
              {recipe.category}
            </span>

            <div style={imageOverlayStyle} />
          </div>

          <div style={heroContentStyle}>
            <span style={eyebrowStyle}>
              ✧ Featured Recipe ✧
            </span>

            <h1 style={recipeTitleStyle}>
              {recipe.title}
            </h1>

            <p style={recipeDescriptionStyle}>
              {recipe.description}
            </p>

            <div style={recipeInformationStyle}>
              <div style={informationItemStyle}>
                <Clock3 size={20} color="#b90f2f" />

                <div>
                  <span style={informationLabelStyle}>
                    Time
                  </span>

                  <strong style={informationValueStyle}>
                    {recipe.time}
                  </strong>
                </div>
              </div>

              <div style={informationItemStyle}>
                <ChefHat size={20} color="#b90f2f" />

                <div>
                  <span style={informationLabelStyle}>
                    Difficulty
                  </span>

                  <strong style={informationValueStyle}>
                    {recipe.difficulty}
                  </strong>
                </div>
              </div>

              <div style={informationItemStyle}>
                <UsersRound
                  size={20}
                  color="#b90f2f"
                />

                <div>
                  <span style={informationLabelStyle}>
                    Servings
                  </span>

                  <strong style={informationValueStyle}>
                    {recipe.servings}
                  </strong>
                </div>
              </div>
            </div>

            {isSaved ? (
              <button
                type="button"
                onClick={handleRemoveRecipe}
                style={removeRecipeButtonStyle}
              >
                <Heart
                  size={20}
                  fill="#b90f2f"
                  color="#b90f2f"
                />

                Remove Recipe
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveRecipe}
                style={saveRecipeButtonStyle}
              >
                <Heart size={20} />
                Save Recipe
              </button>
            )}
          </div>
        </section>

        <div style={contentGridStyle}>
          <section style={contentCardStyle}>
            <div style={sectionHeadingWrapperStyle}>
              <span style={sectionIconStyle}>
                <Sparkles size={21} />
              </span>

              <div>
                <span style={sectionDecorationStyle}>
                  What you&apos;ll need
                </span>

                <h2 style={sectionHeadingStyle}>
                  Ingredients
                </h2>
              </div>
            </div>

            <ul style={ingredientsListStyle}>
              {recipe.ingredients.map(
                (ingredient, index) => (
                  <li
                    key={`${ingredient}-${index}`}
                    style={ingredientItemStyle}
                  >
                    <span style={ingredientDotStyle}>
                      ❦
                    </span>

                    <span>{ingredient}</span>
                  </li>
                ),
              )}
            </ul>
          </section>

          <section style={contentCardStyle}>
            <div style={sectionHeadingWrapperStyle}>
              <span style={sectionIconStyle}>
                <CookingPot size={21} />
              </span>

              <div>
                <span style={sectionDecorationStyle}>
                  Follow along
                </span>

                <h2 style={sectionHeadingStyle}>
                  Cooking Steps
                </h2>
              </div>
            </div>

            <div style={stepsListStyle}>
              {recipe.steps.map((step, index) => (
                <div
                  key={`${step}-${index}`}
                  style={stepItemStyle}
                >
                  <span style={stepNumberStyle}>
                    {index + 1}
                  </span>

                  <p style={stepTextStyle}>{step}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section style={reviewSectionStyle}>
          <div style={reviewHeadingAreaStyle}>
            <div>
              <span style={sectionDecorationStyle}>
                ♡ Cooking memories ♡
              </span>

              <h2 style={reviewHeadingStyle}>
                Recipe Reviews
              </h2>

              <p style={reviewDescriptionStyle}>
                Share your experience and helpful tips with
                other home cooks.
              </p>
            </div>

            <div style={reviewCountStyle}>
              <Star
                size={19}
                fill="#b90f2f"
                color="#b90f2f"
              />

              {reviews.length}{" "}
              {reviews.length === 1
                ? "Review"
                : "Reviews"}
            </div>
          </div>

          <form
            onSubmit={handleAddReview}
            style={reviewFormStyle}
          >
            <label style={formLabelStyle}>
              Your rating
            </label>

            <div style={ratingButtonsStyle}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() =>
                    setReviewRating(rating)
                  }
                  aria-label={`Give ${rating} star rating`}
                  style={starButtonStyle}
                >
                  <Star
                    size={25}
                    fill={
                      rating <= reviewRating
                        ? "#b90f2f"
                        : "transparent"
                    }
                    color={
                      rating <= reviewRating
                        ? "#b90f2f"
                        : "#cda99a"
                    }
                  />
                </button>
              ))}
            </div>

            <label
              htmlFor="review"
              style={{
                ...formLabelStyle,
                marginTop: "20px",
              }}
            >
              Your review
            </label>

            <textarea
              id="review"
              value={reviewText}
              placeholder="What did you enjoy about this recipe?"
              onChange={(event) => {
                setReviewText(event.target.value);
                setReviewMessage("");
              }}
              rows={5}
              style={reviewTextareaStyle}
            />

            <button
              type="submit"
              style={submitReviewButtonStyle}
            >
              <Plus size={19} />
              Add Review
            </button>

            {reviewMessage && (
              <p style={reviewMessageStyle}>
                {reviewMessage}
              </p>
            )}
          </form>

          <div style={reviewsListStyle}>
            {reviews.length === 0 ? (
              <div style={emptyReviewStyle}>
                <span style={emptyReviewSymbolStyle}>
                  ❦
                </span>

                <h3 style={emptyReviewHeadingStyle}>
                  No reviews yet
                </h3>

                <p style={emptyReviewDescriptionStyle}>
                  Be the first person to review this recipe.
                </p>
              </div>
            ) : (
              reviews.map((review) => (
                <article
                  key={review.id}
                  style={reviewCardStyle}
                >
                  <div style={reviewCardHeaderStyle}>
                    <div style={reviewUserAreaStyle}>
                      <span style={reviewAvatarStyle}>
                        {(review.username || "RecipePeeker User")
                          .charAt(0)
                          .toUpperCase()}
                      </span>

                      <div>
                        <h3 style={reviewUsernameStyle}>
                          {review.username || "RecipePeeker User"}
                        </h3>

                        <span style={reviewDateStyle}>
                          {review.createdAt}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteReview(review.id)
                      }
                      aria-label="Delete review"
                      style={deleteReviewButtonStyle}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                  <div style={reviewStarsStyle}>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Star
                        key={rating}
                        size={17}
                        fill={
                          rating <= review.rating
                            ? "#b90f2f"
                            : "transparent"
                        }
                        color={
                          rating <= review.rating
                            ? "#b90f2f"
                            : "#cda99a"
                        }
                      />
                    ))}
                  </div>

                  <p style={reviewTextStyle}>
                    {review.text}
                  </p>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  padding: "42px 24px 80px",
  color: "#5f1f23",
  background:
    "radial-gradient(circle at top left, rgba(255,255,255,0.96), transparent 28%), radial-gradient(circle at bottom right, rgba(217,32,69,0.06), transparent 32%), #fff7ed",
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
  marginBottom: "22px",
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

const heroCardStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "minmax(300px, 1.05fr) minmax(320px, 0.95fr)",
  overflow: "hidden",
  border: "1px solid #ead7c4",
  borderRadius: "32px",
  backgroundColor: "#fffaf3",
  boxShadow: "0 28px 70px rgba(95,31,35,0.12)",
};

const imageWrapperStyle: React.CSSProperties = {
  position: "relative",
  minHeight: "500px",
  overflow: "hidden",
};

const heroImageStyle: React.CSSProperties = {
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
    "linear-gradient(180deg, transparent 58%, rgba(95,31,35,0.18))",
};

const categoryBadgeStyle: React.CSSProperties = {
  position: "absolute",
  top: "24px",
  left: "24px",
  zIndex: 2,
  padding: "9px 16px",
  border: "1px solid rgba(255,255,255,0.72)",
  borderRadius: "999px",
  color: "#8f0d25",
  backgroundColor: "rgba(255,250,243,0.92)",
  boxShadow: "0 8px 20px rgba(95,31,35,0.15)",
  backdropFilter: "blur(8px)",
  fontSize: "14px",
  fontWeight: "700",
};

const heroContentStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  padding: "52px",
};

const eyebrowStyle: React.CSSProperties = {
  marginBottom: "13px",
  color: "#b90f2f",
  fontFamily: "Georgia, serif",
  fontSize: "14px",
  letterSpacing: "1.4px",
};

const recipeTitleStyle: React.CSSProperties = {
  margin: "0 0 18px",
  color: "#8f0d25",
  fontFamily: "Georgia, serif",
  fontSize: "clamp(38px, 5vw, 60px)",
  lineHeight: "1.05",
};

const recipeDescriptionStyle: React.CSSProperties = {
  margin: "0 0 30px",
  color: "#8a5c52",
  fontSize: "16px",
  lineHeight: "1.8",
};

const recipeInformationStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(125px, 1fr))",
  gap: "12px",
  marginBottom: "30px",
};

const informationItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "13px",
  border: "1px solid #ead7c4",
  borderRadius: "15px",
  backgroundColor: "#f9eadf",
};

const informationLabelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "3px",
  color: "#9a6b5f",
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.7px",
};

const informationValueStyle: React.CSSProperties = {
  display: "block",
  color: "#5f1f23",
  fontSize: "13px",
};

const saveRecipeButtonStyle: React.CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  padding: "15px 20px",
  border: "none",
  borderRadius: "15px",
  color: "white",
  backgroundColor: "#b90f2f",
  boxShadow: "0 13px 28px rgba(185,15,47,0.24)",
  cursor: "pointer",
  fontSize: "15px",
  fontWeight: "700",
};

const removeRecipeButtonStyle: React.CSSProperties = {
  ...saveRecipeButtonStyle,
  border: "1px solid #b90f2f",
  color: "#b90f2f",
  backgroundColor: "#fffaf3",
  boxShadow: "none",
};

const contentGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "24px",
  marginTop: "28px",
};

const contentCardStyle: React.CSSProperties = {
  padding: "32px",
  border: "1px solid #ead7c4",
  borderRadius: "26px",
  backgroundColor: "#fffaf3",
  boxShadow: "0 16px 42px rgba(95,31,35,0.08)",
};

const sectionHeadingWrapperStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  marginBottom: "26px",
};

const sectionIconStyle: React.CSSProperties = {
  width: "46px",
  height: "46px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  borderRadius: "15px",
  color: "white",
  backgroundColor: "#b90f2f",
};

const sectionDecorationStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "3px",
  color: "#b90f2f",
  fontFamily: "Georgia, serif",
  fontSize: "12px",
  letterSpacing: "0.7px",
};

const sectionHeadingStyle: React.CSSProperties = {
  margin: 0,
  color: "#8f0d25",
  fontFamily: "Georgia, serif",
  fontSize: "28px",
};

const ingredientsListStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "13px",
  margin: 0,
  padding: 0,
  listStyle: "none",
};

const ingredientItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: "11px",
  paddingBottom: "12px",
  borderBottom: "1px dashed #ead7c4",
  color: "#7c4a42",
  lineHeight: "1.6",
};

const ingredientDotStyle: React.CSSProperties = {
  flexShrink: 0,
  color: "#b90f2f",
  fontFamily: "Georgia, serif",
};

const stepsListStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "17px",
};

const stepItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: "14px",
};

const stepNumberStyle: React.CSSProperties = {
  width: "34px",
  height: "34px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  borderRadius: "50%",
  color: "white",
  backgroundColor: "#b90f2f",
  fontFamily: "Georgia, serif",
  fontSize: "14px",
  fontWeight: "700",
};

const stepTextStyle: React.CSSProperties = {
  margin: 0,
  paddingTop: "4px",
  color: "#7c4a42",
  lineHeight: "1.7",
};

const reviewSectionStyle: React.CSSProperties = {
  marginTop: "28px",
  padding: "36px",
  border: "1px solid #ead7c4",
  borderRadius: "28px",
  backgroundColor: "#fffaf3",
  boxShadow: "0 16px 42px rgba(95,31,35,0.08)",
};

const reviewHeadingAreaStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: "20px",
  marginBottom: "28px",
};

const reviewHeadingStyle: React.CSSProperties = {
  margin: "4px 0 8px",
  color: "#8f0d25",
  fontFamily: "Georgia, serif",
  fontSize: "32px",
};

const reviewDescriptionStyle: React.CSSProperties = {
  margin: 0,
  color: "#8a5c52",
  lineHeight: "1.6",
};

const reviewCountStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "11px 16px",
  border: "1px solid #ead7c4",
  borderRadius: "999px",
  color: "#8f0d25",
  backgroundColor: "#f9eadf",
  fontSize: "14px",
  fontWeight: "700",
};

const reviewFormStyle: React.CSSProperties = {
  marginBottom: "30px",
  padding: "25px",
  border: "1px solid #ead7c4",
  borderRadius: "22px",
  backgroundColor: "#fff7ed",
};

const formLabelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "9px",
  color: "#5f1f23",
  fontSize: "14px",
  fontWeight: "700",
};

const ratingButtonsStyle: React.CSSProperties = {
  display: "flex",
  gap: "4px",
};

const starButtonStyle: React.CSSProperties = {
  display: "flex",
  padding: "3px",
  border: "none",
  backgroundColor: "transparent",
  cursor: "pointer",
};

const reviewTextareaStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  resize: "vertical",
  padding: "15px",
  border: "1px solid #ead7c4",
  borderRadius: "15px",
  color: "#5f1f23",
  backgroundColor: "#fffdf9",
  fontFamily: "inherit",
  fontSize: "15px",
  lineHeight: "1.6",
  outline: "none",
};

const submitReviewButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  marginTop: "17px",
  padding: "13px 20px",
  border: "none",
  borderRadius: "13px",
  color: "white",
  backgroundColor: "#b90f2f",
  cursor: "pointer",
  fontWeight: "700",
};

const reviewMessageStyle: React.CSSProperties = {
  margin: "15px 0 0",
  color: "#b90f2f",
  fontSize: "14px",
  fontWeight: "600",
};

const reviewsListStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};

const reviewCardStyle: React.CSSProperties = {
  padding: "22px",
  border: "1px solid #ead7c4",
  borderRadius: "20px",
  backgroundColor: "#fffdf9",
};

const reviewCardHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "14px",
};

const reviewUserAreaStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const reviewAvatarStyle: React.CSSProperties = {
  width: "42px",
  height: "42px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  color: "white",
  backgroundColor: "#b90f2f",
  fontFamily: "Georgia, serif",
  fontWeight: "700",
};

const reviewUsernameStyle: React.CSSProperties = {
  margin: "0 0 3px",
  color: "#5f1f23",
  fontSize: "15px",
};

const reviewDateStyle: React.CSSProperties = {
  color: "#9a6b5f",
  fontSize: "12px",
};

const deleteReviewButtonStyle: React.CSSProperties = {
  width: "36px",
  height: "36px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid #efd1cf",
  borderRadius: "11px",
  color: "#b90f2f",
  backgroundColor: "#fff0f2",
  cursor: "pointer",
};

const reviewStarsStyle: React.CSSProperties = {
  display: "flex",
  gap: "3px",
  margin: "14px 0 10px",
};

const reviewTextStyle: React.CSSProperties = {
  margin: 0,
  color: "#7c4a42",
  lineHeight: "1.7",
};

const emptyReviewStyle: React.CSSProperties = {
  padding: "42px 20px",
  border: "1px dashed #d8b9a6",
  borderRadius: "20px",
  textAlign: "center",
  backgroundColor: "#fff7ed",
};

const emptyReviewSymbolStyle: React.CSSProperties = {
  color: "#b90f2f",
  fontFamily: "Georgia, serif",
  fontSize: "30px",
};

const emptyReviewHeadingStyle: React.CSSProperties = {
  margin: "10px 0 7px",
  color: "#8f0d25",
  fontFamily: "Georgia, serif",
  fontSize: "22px",
};

const emptyReviewDescriptionStyle: React.CSSProperties = {
  margin: 0,
  color: "#8a5c52",
};

const loadingPageStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "14px",
  backgroundColor: "#fff7ed",
};

const loadingTextStyle: React.CSSProperties = {
  color: "#8a5c52",
  fontFamily: "Georgia, serif",
  fontSize: "17px",
};

const notFoundPageStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  backgroundColor: "#fff7ed",
};

const notFoundCardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "520px",
  padding: "45px 30px",
  border: "1px solid #ead7c4",
  borderRadius: "28px",
  textAlign: "center",
  backgroundColor: "#fffaf3",
  boxShadow: "0 24px 60px rgba(95,31,35,0.12)",
};

const notFoundIconStyle: React.CSSProperties = {
  width: "82px",
  height: "82px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 20px",
  borderRadius: "24px",
  color: "white",
  backgroundColor: "#b90f2f",
};

const decorationTextStyle: React.CSSProperties = {
  color: "#b90f2f",
  fontFamily: "Georgia, serif",
  letterSpacing: "1px",
};

const notFoundHeadingStyle: React.CSSProperties = {
  margin: "10px 0",
  color: "#8f0d25",
  fontFamily: "Georgia, serif",
  fontSize: "34px",
};

const notFoundDescriptionStyle: React.CSSProperties = {
  margin: "0 0 25px",
  color: "#8a5c52",
  lineHeight: "1.7",
};

const backHomeButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "13px 20px",
  borderRadius: "14px",
  color: "white",
  backgroundColor: "#b90f2f",
  textDecoration: "none",
  fontWeight: "700",
};