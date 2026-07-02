"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";

type WatchlistStatus = "Want to Watch" | "Watched" | "Favorite";

type WatchlistItem = {
  id: number;
  title: string;
  channel: string;
  thumbnail: string;
  status: WatchlistStatus;
};

export default function WatchlistPage() {
  const router = useRouter();

  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [toast, setToast] = useState("");
  const [isCheckingLogin, setIsCheckingLogin] = useState(true);

  const showToast = (message: string) => {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 2500);
  };

  useEffect(() => {
    const loginStatus = localStorage.getItem("isLoggedIn");

    if (loginStatus !== "true") {
      router.push("/login?redirect=/watchlist");
      return;
    }

    const savedWatchlist = localStorage.getItem("watchlist");
    const parsedWatchlist = savedWatchlist ? JSON.parse(savedWatchlist) : [];

    setWatchlistItems(parsedWatchlist);
    setIsCheckingLogin(false);
  }, [router]);

  const saveWatchlist = (updatedWatchlist: WatchlistItem[]) => {
    setWatchlistItems(updatedWatchlist);
    localStorage.setItem("watchlist", JSON.stringify(updatedWatchlist));
  };

  const handleStatusChange = (id: number, newStatus: WatchlistStatus) => {
    const updatedWatchlist = watchlistItems.map((item) =>
      item.id === id ? { ...item, status: newStatus } : item
    );

    saveWatchlist(updatedWatchlist);
    showToast(`Status updated to ${newStatus}.`);
  };

  const handleRemove = (id: number) => {
    const updatedWatchlist = watchlistItems.filter((item) => item.id !== id);

    saveWatchlist(updatedWatchlist);
    showToast("Removed from Watchlist.");
  };

  if (isCheckingLogin) {
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
            padding: "50px 60px",
          }}
        >
          <p style={{ color: "#cbd5e1" }}>Checking login status...</p>
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
            borderLeft: toast.includes("Removed")
              ? "5px solid #e11d48"
              : "5px solid #22c55e",
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
          padding: "50px 60px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: "20px",
            flexWrap: "wrap",
            marginBottom: "32px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "36px",
                fontWeight: "bold",
                marginBottom: "12px",
              }}
            >
              My Watchlist
            </h1>

            <p
              style={{
                color: "#cbd5e1",
                lineHeight: "1.6",
              }}
            >
              รายการ trailer ที่คุณบันทึกไว้จะแสดงในหน้านี้
            </p>
          </div>

          <a
            href="/search"
            style={{
              padding: "12px 18px",
              borderRadius: "999px",
              backgroundColor: "#e11d48",
              color: "white",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Browse Trailers
          </a>
        </div>

        {watchlistItems.length === 0 ? (
          <div
            style={{
              maxWidth: "760px",
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "20px",
              padding: "28px",
              color: "#cbd5e1",
            }}
          >
            <h2
              style={{
                color: "white",
                fontSize: "24px",
                marginBottom: "10px",
              }}
            >
              No trailers saved yet.
            </h2>

            <p
              style={{
                lineHeight: "1.6",
                marginBottom: "20px",
              }}
            >
              เริ่มค้นหา trailer ที่สนใจ แล้วกด Add to Watchlist จากหน้า Trailer Detail
              เพื่อเก็บไว้ดูภายหลัง
            </p>

            <a
              href="/search"
              style={{
                display: "inline-block",
                padding: "12px 18px",
                borderRadius: "999px",
                backgroundColor: "#e11d48",
                color: "white",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              Go to Search
            </a>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {watchlistItems.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  gap: "20px",
                  padding: "16px",
                  borderRadius: "18px",
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  maxWidth: "980px",
                  boxShadow: "0 0 15px rgba(255, 255, 255, 0.08)",
                  flexWrap: "wrap",
                }}
              >
                <a href={`/trailer/${item.id}`}>
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    style={{
                      width: "220px",
                      maxWidth: "100%",
                      height: "130px",
                      objectFit: "cover",
                      borderRadius: "12px",
                    }}
                  />
                </a>

                <div
                  style={{
                    flex: 1,
                    minWidth: "240px",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "22px",
                      marginBottom: "8px",
                    }}
                  >
                    {item.title}
                  </h2>

                  <p
                    style={{
                      color: "#94a3b8",
                      marginBottom: "8px",
                    }}
                  >
                    Channel: {item.channel}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      flexWrap: "wrap",
                      marginBottom: "16px",
                    }}
                  >
                    <span
                      style={{
                        color: "#cbd5e1",
                        fontWeight: "600",
                      }}
                    >
                      Status:
                    </span>

                    <select
                      value={item.status}
                      onChange={(event) =>
                        handleStatusChange(
                          item.id,
                          event.target.value as WatchlistStatus
                        )
                      }
                      style={{
                        padding: "10px 14px",
                        borderRadius: "999px",
                        border: "1px solid #475569",
                        backgroundColor: "#0f172a",
                        color: "white",
                        outline: "none",
                        cursor: "pointer",
                      }}
                    >
                      <option value="Want to Watch">Want to Watch</option>
                      <option value="Watched">Watched</option>
                      <option value="Favorite">Favorite</option>
                    </select>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      flexWrap: "wrap",
                    }}
                  >
                    <a
                      href={`/trailer/${item.id}`}
                      style={{
                        padding: "10px 16px",
                        borderRadius: "999px",
                        border: "1px solid white",
                        backgroundColor: "transparent",
                        color: "white",
                        textDecoration: "none",
                        fontWeight: "bold",
                      }}
                    >
                      View Detail →
                    </a>

                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      style={{
                        padding: "10px 16px",
                        borderRadius: "999px",
                        border: "none",
                        backgroundColor: "#e11d48",
                        color: "white",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <a
          href="/"
          style={{
            display: "inline-block",
            marginTop: "28px",
            color: "white",
            textDecoration: "none",
          }}
        >
          ← Back to Home
        </a>
      </section>
    </main>
  );
}