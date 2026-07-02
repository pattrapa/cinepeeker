"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";

type Trailer = {
  id: string;
  title: string;
  category: string;
  channel: string;
  publishedAt: string;
  videoId: string;
  description: string;
};

type TrailerDetailProps = {
  params: Promise<{
    id: string;
  }>;
};

type WatchlistItem = {
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

const trailers: Trailer[] = [
  {
    id: "1",
    title: "Avatar Official Trailer",
    category: "Sci-Fi",
    channel: "20th Century Studios",
    publishedAt: "2009",
    videoId: "5PSNL1qE6VY",
    description: "ตัวอย่างภาพยนตร์ Avatar แนว Sci-Fi ผจญภัยในโลกแพนดอร่า",
  },
  {
    id: "2",
    title: "Wednesday Official Trailer",
    category: "Fantasy",
    channel: "Netflix",
    publishedAt: "2022",
    videoId: "Di310WS8zLk",
    description: "ตัวอย่างซีรีส์ Wednesday แนวแฟนตาซี ลึกลับ และคอมเมดี้",
  },
  {
    id: "3",
    title: "Inside Out 2 Official Trailer",
    category: "Animation",
    channel: "Pixar",
    publishedAt: "2024",
    videoId: "LEjhY15eCx0",
    description: "ตัวอย่างภาพยนตร์แอนิเมชัน Inside Out 2 จาก Pixar",
  },
  {
    id: "4",
    title: "The Batman Official Trailer",
    category: "Action",
    channel: "Warner Bros. Pictures",
    publishedAt: "2022",
    videoId: "mqqft2x_Aa4",
    description: "ตัวอย่างภาพยนตร์ The Batman แนวแอคชั่น ดาร์ก และสืบสวน",
  },
  {
    id: "5",
    title: "Spider-Man: No Way Home Official Trailer",
    category: "Superhero",
    channel: "Sony Pictures Entertainment",
    publishedAt: "2021",
    videoId: "JfVOs4VSpmA",
    description: "ตัวอย่างภาพยนตร์ Spider-Man: No Way Home แนวซูเปอร์ฮีโร่และผจญภัย",
  },
];

export default function TrailerDetailPage({ params }: TrailerDetailProps) {
  const router = useRouter();
  const { id } = use(params);

  const trailer = trailers.find((item) => item.id === id);

  const [toast, setToast] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);

  const showToast = (message: string) => {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 2500);
  };

  const getWatchlist = (): WatchlistItem[] => {
    const savedWatchlist = localStorage.getItem("watchlist");
    return savedWatchlist ? JSON.parse(savedWatchlist) : [];
  };

  const saveWatchlist = (updatedWatchlist: WatchlistItem[]) => {
    localStorage.setItem("watchlist", JSON.stringify(updatedWatchlist));
  };

  const getReviewKey = () => `reviews-${id}`;

  const saveReviews = (updatedReviews: Review[]) => {
    localStorage.setItem(getReviewKey(), JSON.stringify(updatedReviews));
  };

  useEffect(() => {
    const loginStatus = localStorage.getItem("isLoggedIn");
    const loggedIn = loginStatus === "true";

    setIsLoggedIn(loggedIn);

    if (!loggedIn || !trailer) {
      setIsSaved(false);
      return;
    }

    const watchlist = getWatchlist();

    const alreadySaved = watchlist.some(
      (item) => item.id === Number(trailer.id)
    );

    setIsSaved(alreadySaved);
  }, [trailer]);

  useEffect(() => {
    const savedReviews = localStorage.getItem(getReviewKey());
    const parsedReviews = savedReviews ? JSON.parse(savedReviews) : [];

    setReviews(parsedReviews);
  }, [id]);

  const handleAddToWatchlist = () => {
    if (!trailer) return;

    const loginStatus = localStorage.getItem("isLoggedIn");

    if (loginStatus !== "true") {
      showToast("Please login before adding to Watchlist.");

      setTimeout(() => {
        router.push(`/login?redirect=/trailer/${id}`);
      }, 1200);

      return;
    }

    const watchlist = getWatchlist();

    const alreadyAdded = watchlist.some(
      (item) => item.id === Number(trailer.id)
    );

    if (alreadyAdded) {
      setIsSaved(true);
      showToast("This trailer is already saved.");
      return;
    }

    const newItem: WatchlistItem = {
      id: Number(trailer.id),
      title: trailer.title,
      channel: trailer.channel,
      thumbnail: `https://img.youtube.com/vi/${trailer.videoId}/hqdefault.jpg`,
      status: "Want to Watch",
    };

    const updatedWatchlist = [...watchlist, newItem];

    saveWatchlist(updatedWatchlist);
    setIsSaved(true);

    showToast("Added to your Watchlist ✨");
  };

  const handleRemoveFromWatchlist = () => {
    if (!trailer) return;

    const updatedWatchlist = getWatchlist().filter(
      (item) => item.id !== Number(trailer.id)
    );

    saveWatchlist(updatedWatchlist);
    setIsSaved(false);

    showToast("Removed from Watchlist.");
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

  if (!trailer) {
    return (
      <main
        style={{
          minHeight: "100vh",
          backgroundColor: "#0f172a",
          color: "white",
        }}
      >
        <Navbar />

        <section
          style={{
            padding: "40px",
          }}
        >
          <h1>Trailer not found</h1>

          <a
            href="/search"
            style={{
              color: "white",
              display: "inline-block",
              marginTop: "20px",
              textDecoration: "none",
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
        backgroundColor: "#0f172a",
        color: "white",
      }}
    >
      <Navbar />

      {toast && (
        <div
          style={{
            position: "fixed",
            top: "90px",
            right: "32px",
            zIndex: 2000,
            backgroundColor: "#1e293b",
            color: "white",
            border: "1px solid #334155",
            borderLeft:
              toast.includes("Added") || toast.includes("successfully")
                ? "5px solid #22c55e"
                : "5px solid #e11d48",
            borderRadius: "16px",
            padding: "16px 20px",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35)",
            fontWeight: "600",
            maxWidth: "340px",
          }}
        >
          {toast}
        </div>
      )}

      <section
        style={{
          padding: "40px",
        }}
      >
        <h1
          style={{
            fontSize: "36px",
            marginBottom: "12px",
          }}
        >
          {trailer.title}
        </h1>

        <p
          style={{
            color: "#cbd5e1",
            marginBottom: "8px",
          }}
        >
          Channel: {trailer.channel}
        </p>

        <p
          style={{
            color: "#94a3b8",
            marginBottom: "32px",
          }}
        >
          Category: {trailer.category} | Published: {trailer.publishedAt}
        </p>

        <div
          style={{
            width: "100%",
            maxWidth: "900px",
            aspectRatio: "16 / 9",
            backgroundColor: "#000",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 0 30px rgba(255, 255, 255, 0.12)",
          }}
        >
          <iframe
            src={`https://www.youtube.com/embed/${trailer.videoId}`}
            title={trailer.title}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
            allowFullScreen
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "20px",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={isSaved ? handleRemoveFromWatchlist : handleAddToWatchlist}
            style={{
              padding: "12px 20px",
              borderRadius: "999px",
              border: "none",
              backgroundColor: isSaved ? "#334155" : "#e11d48",
              color: "white",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {isSaved ? "Remove from Watchlist" : "Add to Watchlist"}
          </button>

          <a
            href="/search"
            style={{
              padding: "12px 20px",
              borderRadius: "999px",
              border: "1px solid white",
              color: "white",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            ← Back to Search
          </a>
        </div>

        <section
          style={{
            marginTop: "32px",
            maxWidth: "900px",
          }}
        >
          <h2
            style={{
              fontSize: "24px",
              marginBottom: "12px",
            }}
          >
            Description
          </h2>

          <p
            style={{
              color: "#cbd5e1",
              lineHeight: "1.6",
            }}
          >
            {trailer.description}
          </p>
        </section>

        <section
          style={{
            marginTop: "32px",
            maxWidth: "900px",
          }}
        >
          <h2
            style={{
              fontSize: "24px",
              marginBottom: "16px",
            }}
          >
            Reviews
          </h2>

          <form
            onSubmit={handleSubmitReview}
            style={{
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "16px",
              padding: "20px",
              marginBottom: "20px",
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                marginBottom: "14px",
              }}
            >
              Write a Review
            </h3>

            <input
              type="number"
              min="1"
              max="10"
              placeholder="Rating 1-10"
              value={rating}
              onChange={(event) => setRating(event.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "12px",
                border: "1px solid #475569",
                backgroundColor: "#0f172a",
                color: "white",
                fontSize: "16px",
                outline: "none",
                marginBottom: "12px",
              }}
            />

            <textarea
              placeholder="Write your comment..."
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={4}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "12px",
                border: "1px solid #475569",
                backgroundColor: "#0f172a",
                color: "white",
                fontSize: "16px",
                outline: "none",
                resize: "vertical",
                marginBottom: "14px",
              }}
            />

            <button
              type="submit"
              style={{
                padding: "12px 20px",
                borderRadius: "999px",
                border: "none",
                backgroundColor: "#e11d48",
                color: "white",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Submit Review
            </button>

            {!isLoggedIn && (
              <p
                style={{
                  color: "#94a3b8",
                  fontSize: "14px",
                  marginTop: "12px",
                }}
              >
                You need to login before submitting a review.
              </p>
            )}
          </form>

          {reviews.length === 0 ? (
            <div
              style={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "16px",
                padding: "20px",
                color: "#cbd5e1",
              }}
            >
              No reviews yet. Be the first to review this trailer.
            </div>
          ) : (
            reviews.map((review) => (
              <div
                key={review.id}
                style={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "16px",
                  padding: "20px",
                  marginBottom: "16px",
                }}
              >
                <p
                  style={{
                    fontWeight: "bold",
                    marginBottom: "8px",
                  }}
                >
                  Rating: {review.rating}/10
                </p>

                <p
                  style={{
                    color: "#cbd5e1",
                    lineHeight: "1.6",
                    marginBottom: "14px",
                  }}
                >
                  {review.comment}
                </p>

                <button
                  type="button"
                  onClick={() => handleDeleteReview(review.id)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "999px",
                    border: "1px solid #475569",
                    backgroundColor: "transparent",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Delete Review
                </button>
              </div>
            ))
          )}
        </section>
      </section>
    </main>
  );
}