"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import { Search } from "lucide-react";

type Trailer = {
  id: number;
  title: string;
  channel: string;
  category: string;
  publishedAt: string;
  thumbnail: string;
};

const searchResults: Trailer[] = [
  {
    id: 1,
    title: "Avatar Official Trailer",
    category: "Sci-Fi",
    channel: "20th Century Studios",
    publishedAt: "2009",
    thumbnail: "https://img.youtube.com/vi/5PSNL1qE6VY/hqdefault.jpg",
  },
  {
    id: 2,
    title: "Wednesday Official Trailer",
    category: "Fantasy",
    channel: "Netflix",
    publishedAt: "2022",
    thumbnail: "https://img.youtube.com/vi/Di310WS8zLk/hqdefault.jpg",
  },
  {
    id: 3,
    title: "Inside Out 2 Official Trailer",
    category: "Animation",
    channel: "Pixar",
    publishedAt: "2024",
    thumbnail: "https://img.youtube.com/vi/LEjhY15eCx0/hqdefault.jpg",
  },
  {
    id: 4,
    title: "The Batman Official Trailer",
    category: "Action",
    channel: "Warner Bros. Pictures",
    publishedAt: "2022",
    thumbnail: "https://img.youtube.com/vi/mqqft2x_Aa4/hqdefault.jpg",
  },
  {
    id: 5,
    title: "Spider-Man: No Way Home Official Trailer",
    category: "Superhero",
    channel: "Sony Pictures Entertainment",
    publishedAt: "2021",
    thumbnail: "https://img.youtube.com/vi/JfVOs4VSpmA/hqdefault.jpg",
  },
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";

  const [searchText, setSearchText] = useState(query);

  const normalizedSearchText = searchText.toLowerCase().trim();

  const filteredResults = searchResults.filter((trailer) => {
    const searchableText = `${trailer.title} ${trailer.category} ${trailer.channel} ${trailer.publishedAt}`.toLowerCase();

    return searchableText.includes(normalizedSearchText);
  });

  const searchHref = searchText.trim()
    ? `/search?query=${encodeURIComponent(searchText.trim())}`
    : "/search";

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
        <h1
          style={{
            fontSize: "36px",
            fontWeight: "bold",
            marginBottom: "12px",
          }}
        >
          Search Trailer
        </h1>

        <p
          style={{
            color: "#cbd5e1",
            marginBottom: "24px",
          }}
        >
          ค้นหาตัวอย่างหนังหรือซีรีส์ที่คุณสนใจ
        </p>

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "32px",
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            placeholder="Type movie or series name..."
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            style={{
              width: "360px",
              maxWidth: "100%",
              padding: "12px 16px",
              fontSize: "16px",
              border: "1px solid #334155",
              borderRadius: "14px",
              outline: "none",
              backgroundColor: "#111827",
              color: "white",
              boxShadow: "0 0 15px rgba(255, 255, 255, 0.18)",
            }}
          />

          <a
            href={searchHref}
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

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "20px",
          }}
        >
          <h2
            style={{
              fontSize: "24px",
            }}
          >
            Search Results
          </h2>

          {searchText.trim() && (
            <p
              style={{
                color: "#94a3b8",
              }}
            >
              Showing results for:{" "}
              <span
                style={{
                  color: "#fb7185",
                  fontWeight: "bold",
                }}
              >
                {searchText}
              </span>
            </p>
          )}
        </div>

        {filteredResults.length === 0 ? (
          <div
            style={{
              padding: "28px",
              borderRadius: "18px",
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              color: "#cbd5e1",
              maxWidth: "720px",
            }}
          >
            <h3
              style={{
                color: "white",
                fontSize: "22px",
                marginBottom: "8px",
              }}
            >
              No results found
            </h3>

            <p
              style={{
                lineHeight: "1.6",
                marginBottom: "18px",
              }}
            >
              ไม่พบ trailer ที่ตรงกับคำค้นนี้ ลองค้นหาด้วยชื่อหนัง ซีรีส์ หรือชื่อช่องอีกครั้ง
            </p>

            <button
              type="button"
              onClick={() => setSearchText("")}
              style={{
                padding: "12px 18px",
                borderRadius: "999px",
                border: "none",
                backgroundColor: "#e11d48",
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
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {filteredResults.map((trailer) => (
              <a
                key={trailer.id}
                href={`/trailer/${trailer.id}`}
                style={{
                  display: "flex",
                  gap: "20px",
                  padding: "16px",
                  borderRadius: "16px",
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  textDecoration: "none",
                  color: "white",
                  cursor: "pointer",
                  boxShadow: "0 0 15px rgba(255, 255, 255, 0.08)",
                  flexWrap: "wrap",
                }}
              >
                <img
                  src={trailer.thumbnail}
                  alt={trailer.title}
                  style={{
                    width: "220px",
                    maxWidth: "100%",
                    height: "130px",
                    objectFit: "cover",
                    borderRadius: "12px",
                  }}
                />

                <div
                  style={{
                    flex: 1,
                    minWidth: "220px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "20px",
                      marginBottom: "8px",
                    }}
                  >
                    {trailer.title}
                  </h3>

                  <p
                    style={{
                      color: "#94a3b8",
                      marginBottom: "6px",
                    }}
                  >
                    Channel: {trailer.channel}
                  </p>

                  <p
                    style={{
                      color: "#94a3b8",
                      marginBottom: "16px",
                    }}
                  >
                    Published: {trailer.publishedAt}
                  </p>

                  <p
                    style={{
                      color: "#fb7185",
                      fontWeight: "bold",
                    }}
                  >
                    Click to view trailer →
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}