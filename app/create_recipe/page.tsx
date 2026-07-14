"use client";

import type {
  ChangeEvent,
  CSSProperties,
  FormEvent,
} from "react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import Navbar from "@/app/components/Navbar";

import {
  ArrowLeft,
  ChefHat,
  Clock3,
  ImagePlus,
  Minus,
  Plus,
  Save,
  Sparkles,
  UsersRound,
} from "lucide-react";

type Difficulty = "Easy" | "Medium" | "Hard";

type CreateRecipeResponse = {
  success: boolean;
  message: string;
  errors?: string[];
  data?: {
    _id: string;
    title: string;
    imageUrl: string;
  };
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000";

const categories = [
  "Dessert",
  "Breakfast",
  "Pasta",
  "Thai Food",
  "Drinks",
  "Main Course",
  "Appetizer",
  "Soup",
  "Salad",
  "Other",
];

export default function CreateRecipePage() {
  const router = useRouter();

  const {
    data: session,
    status: sessionStatus,
  } = useSession();

  const [isMockLoggedIn, setIsMockLoggedIn] =
    useState(false);

  const [isAuthChecked, setIsAuthChecked] =
    useState(false);

  const [title, setTitle] = useState("");

  const [category, setCategory] =
    useState("Dessert");

  const [timeMinutes, setTimeMinutes] =
    useState("");

  const [difficulty, setDifficulty] =
    useState<Difficulty>("Easy");

  const [servings, setServings] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [ingredients, setIngredients] =
    useState<string[]>([""]);

  const [steps, setSteps] =
    useState<string[]>([""]);

  const [imageFile, setImageFile] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [isSuccess, setIsSuccess] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const isGoogleLoggedIn =
    sessionStatus === "authenticated";

  const isLoggedIn =
    isMockLoggedIn || isGoogleLoggedIn;

  useEffect(() => {
    const mockLoginStatus =
      localStorage.getItem("isLoggedIn") ===
      "true";

    setIsMockLoggedIn(mockLoginStatus);
    setIsAuthChecked(true);
  }, []);

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
          "/create-recipe",
        )}`,
      );
    }
  }, [
    isAuthChecked,
    isLoggedIn,
    router,
    sessionStatus,
  ]);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const authorName = useMemo(() => {
    if (session?.user?.name) {
      return session.user.name;
    }

    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("mockUser") ||
        "RecipePeeker User"
      );
    }

    return "RecipePeeker User";
  }, [session]);

  const handleImageChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    setMessage("");
    setIsSuccess(false);

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setMessage(
        "Please choose a JPG, PNG or WEBP image.",
      );

      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage(
        "The recipe image must be smaller than 5 MB.",
      );

      event.target.value = "";
      return;
    }

    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl =
      URL.createObjectURL(file);

    setImageFile(file);
    setImagePreview(previewUrl);
  };

  const updateIngredient = (
    index: number,
    value: string,
  ) => {
    setIngredients((currentIngredients) =>
      currentIngredients.map(
        (ingredient, ingredientIndex) =>
          ingredientIndex === index
            ? value
            : ingredient,
      ),
    );
  };

  const addIngredient = () => {
    setIngredients((currentIngredients) => [
      ...currentIngredients,
      "",
    ]);
  };

  const removeIngredient = (
    index: number,
  ) => {
    setIngredients((currentIngredients) => {
      if (currentIngredients.length === 1) {
        return [""];
      }

      return currentIngredients.filter(
        (_ingredient, ingredientIndex) =>
          ingredientIndex !== index,
      );
    });
  };

  const updateStep = (
    index: number,
    value: string,
  ) => {
    setSteps((currentSteps) =>
      currentSteps.map((step, stepIndex) =>
        stepIndex === index ? value : step,
      ),
    );
  };

  const addStep = () => {
    setSteps((currentSteps) => [
      ...currentSteps,
      "",
    ]);
  };

  const removeStep = (index: number) => {
    setSteps((currentSteps) => {
      if (currentSteps.length === 1) {
        return [""];
      }

      return currentSteps.filter(
        (_step, stepIndex) =>
          stepIndex !== index,
      );
    });
  };

  const resetForm = () => {
    setTitle("");
    setCategory("Dessert");
    setTimeMinutes("");
    setDifficulty("Easy");
    setServings("");
    setDescription("");
    setIngredients([""]);
    setSteps([""]);
    setImageFile(null);

    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImagePreview("");
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setMessage("");
    setIsSuccess(false);

    const cleanedIngredients =
      ingredients
        .map((ingredient) =>
          ingredient.trim(),
        )
        .filter(
          (ingredient) =>
            ingredient.length > 0,
        );

    const cleanedSteps = steps
      .map((step) => step.trim())
      .filter((step) => step.length > 0);

    if (!title.trim()) {
      setMessage(
        "Please enter the recipe title.",
      );

      return;
    }

    if (!imageFile) {
      setMessage(
        "Please choose a recipe image.",
      );

      return;
    }

    if (
      !timeMinutes ||
      Number(timeMinutes) < 1
    ) {
      setMessage(
        "Cooking time must be at least 1 minute.",
      );

      return;
    }

    if (!servings || Number(servings) < 1) {
      setMessage(
        "Servings must be at least 1.",
      );

      return;
    }

    if (!description.trim()) {
      setMessage(
        "Please enter a recipe description.",
      );

      return;
    }

    if (cleanedIngredients.length === 0) {
      setMessage(
        "Please add at least one ingredient.",
      );

      return;
    }

    if (cleanedSteps.length === 0) {
      setMessage(
        "Please add at least one cooking step.",
      );

      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();

      formData.append(
        "title",
        title.trim(),
      );

      formData.append(
        "category",
        category,
      );

      formData.append(
        "timeMinutes",
        timeMinutes,
      );

      formData.append(
        "difficulty",
        difficulty,
      );

      formData.append(
        "servings",
        servings,
      );

      formData.append(
        "description",
        description.trim(),
      );

      formData.append(
        "ingredients",
        JSON.stringify(cleanedIngredients),
      );

      formData.append(
        "steps",
        JSON.stringify(cleanedSteps),
      );

      formData.append(
        "authorName",
        authorName,
      );

      formData.append(
        "image",
        imageFile,
      );

      const response = await fetch(
        `${API_URL}/api/recipes`,
        {
          method: "POST",
          body: formData,
        },
      );

      const responseText =
        await response.text();

      let result: CreateRecipeResponse;

      try {
        result = JSON.parse(
          responseText,
        ) as CreateRecipeResponse;
      } catch {
        result = {
          success: false,
          message:
            responseText ||
            "The server returned an invalid response.",
        };
      }

      if (!response.ok || !result.success) {
        const errorDetails =
          result.errors?.join(" ") ?? "";

        throw new Error(
          `${result.message} ${errorDetails}`.trim(),
        );
      }

      setIsSuccess(true);

      setMessage(
        `Recipe "${
          result.data?.title || title
        }" was published successfully.`,
      );

      resetForm();
    } catch (error) {
      console.error(
        "Unable to publish recipe:",
        error,
      );

      setIsSuccess(false);

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to publish recipe.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (
    !isAuthChecked ||
    sessionStatus === "loading"
  ) {
    return (
      <main style={loadingPageStyle}>
        <ChefHat
          size={44}
          color="#b90f2f"
        />

        <p style={loadingTextStyle}>
          Preparing your recipe form...
        </p>
      </main>
    );
  }

  if (!isLoggedIn) {
    return (
      <main style={loadingPageStyle}>
        <ChefHat
          size={44}
          color="#b90f2f"
        />

        <p style={loadingTextStyle}>
          Redirecting to login...
        </p>
      </main>
    );
  }

  return (
    <main className="page">
      <Navbar />

      <div className="pageContainer">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="backButton"
        >
          <ArrowLeft size={18} />
          Back to Home
        </button>

        <header className="pageHeader">
          <span className="eyebrow">
            ✧ SHARE YOUR RECIPE ✧
          </span>

          <h1>Create a New Recipe</h1>

          <p>
            Add your favorite homemade recipe,
            ingredients and cooking steps to
            RecipePeeker.
          </p>
        </header>

        {message && (
          <div
            className={
              isSuccess
                ? "message successMessage"
                : "message errorMessage"
            }
          >
            {isSuccess ? "❦ " : ""}
            {message}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="recipeForm"
        >
          <section className="formCard imageCard">
            <div className="sectionHeading">
              <span className="sectionIcon">
                <ImagePlus size={21} />
              </span>

              <div>
                <span>Recipe presentation</span>
                <h2>Food Image</h2>
              </div>
            </div>

            <label
              className="imageUploader"
              htmlFor="recipe-image"
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Recipe preview"
                  className="imagePreview"
                />
              ) : (
                <div className="imagePlaceholder">
                  <ImagePlus size={42} />

                  <strong>
                    Choose a food image
                  </strong>

                  <span>
                    JPG, PNG or WEBP — maximum
                    5 MB
                  </span>
                </div>
              )}

              <input
                id="recipe-image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="hiddenInput"
              />
            </label>

            {imageFile && (
              <p className="selectedFile">
                Selected: {imageFile.name}
              </p>
            )}
          </section>

          <section className="formCard detailsCard">
            <div className="sectionHeading">
              <span className="sectionIcon">
                <Sparkles size={21} />
              </span>

              <div>
                <span>Recipe information</span>
                <h2>Basic Details</h2>
              </div>
            </div>

            <div className="fieldGroup fullField">
              <label htmlFor="title">
                Recipe title
              </label>

              <input
                id="title"
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="e.g. Cherry Cream Cake"
                maxLength={120}
              />
            </div>

            <div className="twoColumnGrid">
              <div className="fieldGroup">
                <label htmlFor="category">
                  Category
                </label>

                <select
                  id="category"
                  value={category}
                  onChange={(event) =>
                    setCategory(
                      event.target.value,
                    )
                  }
                >
                  {categories.map(
                    (categoryItem) => (
                      <option
                        key={categoryItem}
                        value={categoryItem}
                      >
                        {categoryItem}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div className="fieldGroup">
                <label htmlFor="difficulty">
                  Difficulty
                </label>

                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={(event) =>
                    setDifficulty(
                      event.target
                        .value as Difficulty,
                    )
                  }
                >
                  <option value="Easy">
                    Easy
                  </option>

                  <option value="Medium">
                    Medium
                  </option>

                  <option value="Hard">
                    Hard
                  </option>
                </select>
              </div>
            </div>

            <div className="twoColumnGrid">
              <div className="fieldGroup">
                <label htmlFor="time">
                  <Clock3 size={16} />
                  Cooking time
                </label>

                <div className="numberInputWrapper">
                  <input
                    id="time"
                    type="number"
                    min="1"
                    value={timeMinutes}
                    onChange={(event) =>
                      setTimeMinutes(
                        event.target.value,
                      )
                    }
                    placeholder="45"
                  />

                  <span>minutes</span>
                </div>
              </div>

              <div className="fieldGroup">
                <label htmlFor="servings">
                  <UsersRound size={16} />
                  Servings
                </label>

                <div className="numberInputWrapper">
                  <input
                    id="servings"
                    type="number"
                    min="1"
                    value={servings}
                    onChange={(event) =>
                      setServings(
                        event.target.value,
                      )
                    }
                    placeholder="4"
                  />

                  <span>servings</span>
                </div>
              </div>
            </div>

            <div className="fieldGroup fullField">
              <label htmlFor="description">
                Description
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value,
                  )
                }
                placeholder="Tell everyone what makes this recipe special..."
                rows={5}
                maxLength={2000}
              />
            </div>
          </section>

          <section className="formCard ingredientsCard">
            <div className="sectionHeading">
              <span className="sectionIcon">
                <ChefHat size={21} />
              </span>

              <div>
                <span>
                  What you&apos;ll need
                </span>

                <h2>Ingredients</h2>
              </div>
            </div>

            <div className="dynamicList">
              {ingredients.map(
                (ingredient, index) => (
                  <div
                    key={`ingredient-${index}`}
                    className="dynamicRow"
                  >
                    <span className="rowNumber">
                      {index + 1}
                    </span>

                    <input
                      type="text"
                      value={ingredient}
                      onChange={(event) =>
                        updateIngredient(
                          index,
                          event.target.value,
                        )
                      }
                      placeholder="e.g. 2 cups all-purpose flour"
                    />

                    <button
                      type="button"
                      className="removeButton"
                      onClick={() =>
                        removeIngredient(index)
                      }
                      aria-label={`Remove ingredient ${
                        index + 1
                      }`}
                    >
                      <Minus size={18} />
                    </button>
                  </div>
                ),
              )}
            </div>

            <button
              type="button"
              onClick={addIngredient}
              className="addItemButton"
            >
              <Plus size={18} />
              Add Ingredient
            </button>
          </section>

          <section className="formCard stepsCard">
            <div className="sectionHeading">
              <span className="sectionIcon">
                <Sparkles size={21} />
              </span>

              <div>
                <span>Follow along</span>
                <h2>Cooking Steps</h2>
              </div>
            </div>

            <div className="dynamicList">
              {steps.map((step, index) => (
                <div
                  key={`step-${index}`}
                  className="dynamicRow stepRow"
                >
                  <span className="rowNumber">
                    {index + 1}
                  </span>

                  <textarea
                    value={step}
                    onChange={(event) =>
                      updateStep(
                        index,
                        event.target.value,
                      )
                    }
                    placeholder={`Describe cooking step ${
                      index + 1
                    }`}
                    rows={3}
                  />

                  <button
                    type="button"
                    className="removeButton"
                    onClick={() =>
                      removeStep(index)
                    }
                    aria-label={`Remove step ${
                      index + 1
                    }`}
                  >
                    <Minus size={18} />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addStep}
              className="addItemButton"
            >
              <Plus size={18} />
              Add Cooking Step
            </button>
          </section>

          <section className="publishCard">
            <div>
              <span className="publishDecoration">
                ❦ Ready to share? ❦
              </span>

              <h2>Publish Your Recipe</h2>

              <p>
                Your recipe will be saved to
                MongoDB under the name{" "}
                <strong>{authorName}</strong>.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="publishButton"
            >
              <Save size={19} />

              {isSubmitting
                ? "Publishing..."
                : "Publish Recipe"}
            </button>
          </section>
        </form>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          color: #5f1f23;
          background:
            radial-gradient(
              circle at top left,
              rgba(255, 255, 255, 0.95),
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
          margin-bottom: 26px;
          padding: 11px 17px;
          border: 1px solid #ead7c4;
          border-radius: 999px;
          color: #8f0d25;
          background-color: #fffaf3;
          box-shadow: 0 8px 20px
            rgba(95, 31, 35, 0.08);
          cursor: pointer;
          font-weight: 700;
        }

        .pageHeader {
          margin-bottom: 30px;
          text-align: center;
        }

        .eyebrow {
          display: block;
          margin-bottom: 10px;
          color: #b90f2f;
          font-family: Georgia, serif;
          font-size: 13px;
          letter-spacing: 1.4px;
        }

        .pageHeader h1 {
          margin: 0 0 12px;
          color: #8f0d25;
          font-family: Georgia, serif;
          font-size: clamp(
            38px,
            6vw,
            58px
          );
          font-weight: 500;
        }

        .pageHeader p {
          max-width: 680px;
          margin: 0 auto;
          color: #8a5c52;
          line-height: 1.75;
        }

        .message {
          margin-bottom: 24px;
          padding: 16px 20px;
          border-radius: 16px;
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

        .recipeForm {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 24px;
        }

        .formCard {
          box-sizing: border-box;
          padding: 30px;
          border: 1px solid #ead7c4;
          border-radius: 26px;
          background-color: #fffaf3;
          box-shadow: 0 16px 42px
            rgba(95, 31, 35, 0.09);
        }

        .ingredientsCard,
        .stepsCard,
        .publishCard {
          grid-column: 1 / -1;
        }

        .sectionHeading {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 24px;
        }

        .sectionIcon {
          width: 46px;
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 15px;
          color: white;
          background-color: #b90f2f;
        }

        .sectionHeading
          span:not(.sectionIcon) {
          display: block;
          margin-bottom: 3px;
          color: #b90f2f;
          font-family: Georgia, serif;
          font-size: 12px;
          letter-spacing: 0.7px;
        }

        .sectionHeading h2 {
          margin: 0;
          color: #8f0d25;
          font-family: Georgia, serif;
          font-size: 27px;
        }

        .imageUploader {
          min-height: 360px;
          display: flex;
          overflow: hidden;
          border: 2px dashed #d8b9a6;
          border-radius: 22px;
          background-color: #fff7ed;
          cursor: pointer;
        }

        .imagePlaceholder {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 30px;
          color: #b90f2f;
          text-align: center;
        }

        .imagePlaceholder strong {
          color: #8f0d25;
          font-family: Georgia, serif;
          font-size: 21px;
        }

        .imagePlaceholder span {
          color: #9a6b5f;
          font-size: 13px;
        }

        .imagePreview {
          width: 100%;
          height: 360px;
          display: block;
          object-fit: cover;
        }

        .hiddenInput {
          display: none;
        }

        .selectedFile {
          margin: 13px 0 0;
          color: #8a5c52;
          font-size: 13px;
          word-break: break-word;
        }

        .fieldGroup {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .fullField {
          margin-bottom: 20px;
        }

        .fieldGroup label {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #5f1f23;
          font-size: 14px;
          font-weight: 700;
        }

        .fieldGroup input,
        .fieldGroup select,
        .fieldGroup textarea,
        .dynamicRow input,
        .dynamicRow textarea {
          width: 100%;
          box-sizing: border-box;
          padding: 14px 15px;
          border: 1px solid #ead7c4;
          border-radius: 14px;
          outline: none;
          color: #5f1f23;
          background-color: #fffdf9;
          font-family: inherit;
          font-size: 15px;
        }

        .fieldGroup textarea,
        .dynamicRow textarea {
          resize: vertical;
          line-height: 1.6;
        }

        .fieldGroup input:focus,
        .fieldGroup select:focus,
        .fieldGroup textarea:focus,
        .dynamicRow input:focus,
        .dynamicRow textarea:focus {
          border-color: #b90f2f;
          box-shadow: 0 0 0 3px
            rgba(185, 15, 47, 0.08);
        }

        .twoColumnGrid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }

        .numberInputWrapper {
          display: flex;
          align-items: center;
          overflow: hidden;
          border: 1px solid #ead7c4;
          border-radius: 14px;
          background-color: #fffdf9;
        }

        .numberInputWrapper input {
          border: none;
          box-shadow: none;
        }

        .numberInputWrapper span {
          padding-right: 14px;
          color: #9a6b5f;
          font-size: 12px;
          white-space: nowrap;
        }

        .dynamicList {
          display: flex;
          flex-direction: column;
          gap: 13px;
        }

        .dynamicRow {
          display: grid;
          grid-template-columns:
            38px minmax(0, 1fr) 42px;
          align-items: center;
          gap: 11px;
        }

        .stepRow {
          align-items: flex-start;
        }

        .rowNumber {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          color: white;
          background-color: #b90f2f;
          font-weight: 700;
        }

        .removeButton {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #efd1cf;
          border-radius: 12px;
          color: #b90f2f;
          background-color: #fff0f2;
          cursor: pointer;
        }

        .addItemButton {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 18px;
          padding: 12px 18px;
          border: 1px solid #b90f2f;
          border-radius: 13px;
          color: #b90f2f;
          background-color: #fffaf3;
          cursor: pointer;
          font-weight: 700;
        }

        .publishCard {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          padding: 30px;
          border: 1px solid #ead7c4;
          border-radius: 26px;
          color: white;
          background: linear-gradient(
            135deg,
            #8f0d25,
            #c71438
          );
          box-shadow: 0 22px 50px
            rgba(143, 13, 37, 0.2);
        }

        .publishDecoration {
          display: block;
          margin-bottom: 6px;
          font-family: Georgia, serif;
          letter-spacing: 1px;
        }

        .publishCard h2 {
          margin: 0 0 7px;
          font-family: Georgia, serif;
          font-size: 29px;
        }

        .publishCard p {
          margin: 0;
          color: rgba(
            255,
            255,
            255,
            0.84
          );
          line-height: 1.6;
        }

        .publishButton {
          min-width: 190px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 15px 22px;
          border: none;
          border-radius: 15px;
          color: #8f0d25;
          background-color: #fffaf3;
          box-shadow: 0 14px 30px
            rgba(95, 31, 35, 0.22);
          cursor: pointer;
          font-weight: 800;
        }

        .publishButton:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }

        @media (max-width: 860px) {
          .recipeForm {
            grid-template-columns: 1fr;
          }

          .imageCard,
          .detailsCard,
          .ingredientsCard,
          .stepsCard,
          .publishCard {
            grid-column: 1;
          }

          .publishCard {
            align-items: flex-start;
            flex-direction: column;
          }

          .publishButton {
            width: 100%;
          }
        }

        @media (max-width: 560px) {
          .pageContainer {
            padding: 30px 14px 60px;
          }

          .formCard {
            padding: 22px 17px;
            border-radius: 22px;
          }

          .twoColumnGrid {
            grid-template-columns: 1fr;
          }

          .dynamicRow {
            grid-template-columns:
              32px minmax(0, 1fr) 38px;
            gap: 7px;
          }

          .rowNumber {
            width: 31px;
            height: 31px;
            font-size: 13px;
          }

          .removeButton {
            width: 36px;
            height: 36px;
          }

          .imageUploader,
          .imagePreview {
            min-height: 260px;
            height: 260px;
          }
        }
      `}</style>
    </main>
  );
}

const loadingPageStyle: CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "14px",
  color: "#8a5c52",
  backgroundColor: "#fff7ed",
};

const loadingTextStyle: CSSProperties = {
  margin: 0,
  color: "#8a5c52",
  fontFamily: "Georgia, serif",
  fontSize: "17px",
};