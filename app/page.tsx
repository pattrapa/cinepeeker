"use client";

import { useState } from "react";
import Navbar from "@/app/components/Navbar";
import { Search, Play } from "lucide-react";

const featuredTrailers = [
  {
    id: 1,
    title: "Avatar Official Trailer",
    category: "Sci-Fi",
    thumbnail: "https://img.youtube.com/vi/5PSNL1qE6VY/hqdefault.jpg",
  },
  {
    id: 2,
    title: "Wednesday Official Trailer",
    category: "Fantasy",
    thumbnail: "https://img.youtube.com/vi/Di310WS8zLk/hqdefault.jpg",
  },
  {
    id: 3,
    title: "Inside Out 2 Official Trailer",
    category: "Animation",
    thumbnail: "https://img.youtube.com/vi/LEjhY15eCx0/hqdefault.jpg",
  },
  {
    id: 4,
    title: "The Batman Official Trailer",
    category: "Action",
    thumbnail: "https://img.youtube.com/vi/mqqft2x_Aa4/hqdefault.jpg",
  },
  {
    id: 5,
    title: "Spider-Man: No Way Home Trailer",
    category: "Superhero",
    thumbnail: "https://img.youtube.com/vi/JfVOs4VSpmA/hqdefault.jpg",
  },
];

const categories = ["Action", "Sci-Fi", "Fantasy", "Animation", "Superhero"];

export default function Home() {
  const [searchText, setSearchText] = useState("");

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundImage:
          "linear-gradient(rgba(15, 23, 42, 0.55), rgba(15, 23, 42, 0.9)), url('/cinema.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        color: "white",
      }}
    >
      <Navbar />

      <section
        style={{
          textAlign: "center",
          padding: "100px 20px 90px",
        }}
      >
        <h1
          style={{
            fontSize: "56px",
            fontWeight: "bold",
            marginBottom: "16px",
            lineHeight: "1.1",
          }}
        >
          Peek the trailer before you watch.
        </h1>

        <p
          style={{
            fontSize: "18px",
            marginBottom: "32px",
            color: "#cbd5e1",
          }}
        >
          ค้นหาและดูตัวอย่างหนัง/ซีรีส์จาก YouTube ได้ในที่เดียว
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            marginTop: "20px",
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            placeholder="Search movie or series trailer..."
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            style={{
              width: "420px",
              maxWidth: "100%",
              padding: "14px 18px",
              fontSize: "16px",
              border: "1px solid #334155",
              borderRadius: "14px",
              backgroundColor: "#111827",
              color: "white",
              outline: "none",
              boxShadow: "0 0 15px rgba(255, 255, 255, 0.35)",
            }}
          />

          <a
            href={`/search?query=${encodeURIComponent(searchText)}`}
            style={{
              padding: "14px 24px",
              fontSize: "16px",
              borderRadius: "14px",
              backgroundColor: "#e11d48",
              color: "white",
              cursor: "pointer",
              textDecoration: "none",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Search size={18} />
            Search
          </a>
        </div>
      </section>

      <div
        style={{
          borderRadius: "64px 64px 0 0",
          backgroundColor: "#111827",
          borderTop: "1px solid #334155",
          paddingTop: "20px",
        }}
      >
        <section
          style={{
            margin: "0 60px",
            padding: "32px 0",
          }}
        >
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              marginBottom: "16px",
            }}
          >
            Categories
          </h2>

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            {categories.map((category) => (
              <a
                key={category}
                href={`/search?query=${encodeURIComponent(category)}`}
                style={{
                  padding: "10px 18px",
                  borderRadius: "999px",
                  border: "1px solid #475569",
                  backgroundColor: "#0f172a",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "600",
                  textDecoration: "none",
                }}
              >
                {category}
              </a>
            ))}
          </div>
        </section>

        <section
          style={{
            padding: "20px 60px 60px",
          }}
        >
          <h2
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              marginBottom: "24px",
            }}
          >
            Featured Trailers
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "24px",
            }}
          >
            {featuredTrailers.map((trailer) => (
              <a
                key={trailer.id}
                href={`/trailer/${trailer.id}`}
                style={{
                  backgroundColor: "#0f172a",
                  borderRadius: "22px",
                  overflow: "hidden",
                  border: "1px solid #334155",
                  boxShadow: "0 0 15px rgba(255, 255, 255, 0.18)",
                  textDecoration: "none",
                  color: "white",
                  display: "block",
                  cursor: "pointer",
                }}
              >
                <img
                  src={trailer.thumbnail}
                  alt={trailer.title}
                  style={{
                    width: "100%",
                    height: "180px",
                    objectFit: "cover",
                  }}
                />

                <div
                  style={{
                    padding: "18px",
                  }}
                >
                  <p
                    style={{
                      color: "#94a3b8",
                      fontSize: "14px",
                      marginBottom: "8px",
                    }}
                  >
                    {trailer.category}
                  </p>

                  <h3
                    style={{
                      fontSize: "20px",
                      marginBottom: "18px",
                      lineHeight: "1.4",
                    }}
                  >
                    {trailer.title}
                  </h3>

                  <span
                    style={{
                      padding: "10px 16px",
                      borderRadius: "999px",
                      border: "1px solid #475569",
                      fontSize: "16px",
                      color: "white",
                      display: "inline-flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "8px",
                      fontWeight: "bold",
                    }}
                  >
                    <Play size={16} />
                    View Trailer →
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>

      <footer
        style={{
          padding: "24px 60px",
          borderTop: "1px solid #1e293b",
          textAlign: "center",
          color: "#94a3b8",
          backgroundColor: "#0f172a",
        }}
      >
        <p>❀ 2026 CinePeeker. Peek the trailer before you watch. ❀</p>
      </footer>
    </main>
  );
}