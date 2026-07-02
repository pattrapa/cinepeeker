"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Home as HomeIcon,
  Search,
  Bookmark,
  User,
  LogOut,
  Film,
} from "lucide-react";

export default function Navbar() {
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  useEffect(() => {
    const loginStatus = localStorage.getItem("isLoggedIn");
    setIsLoggedIn(loginStatus === "true");
  }, []);

  const handleConfirmLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    setShowLogoutPopup(false);
    router.push("/");
  };

  return (
    <>
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          padding: "18px 48px",
          backgroundColor: "#0f172a",
          borderBottom: "1px solid #233047",
          flexWrap: "wrap",
        }}
      >
        <a
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "white",
            textDecoration: "none",
            fontSize: "24px",
            fontWeight: "bold",
          }}
        >
          <span
            
          >
            <Film size={24} />
          </span>
          CinePeeker
        </a>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px",
            borderRadius: "999px",
            backgroundColor: "#182235",
            border: "1px solid #334155",
            flexWrap: "wrap",
          }}
        >
          <a href="/" style={navLinkStyle}>
            <HomeIcon size={18} />
            Home
          </a>

          <a href="/search" style={navLinkStyle}>
            <Search size={18} />
            Search
          </a>

          <a href="/watchlist" style={navLinkStyle}>
            <Bookmark size={18} />
            Watchlist
          </a>

          {isLoggedIn ? (
            <button
              type="button"
              onClick={() => setShowLogoutPopup(true)}
              style={{
                ...navLinkStyle,
                backgroundColor: "#e11d48",
                fontWeight: "700",
                border: "none",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              <LogOut size={18} />
              Logout
            </button>
          ) : (
            <a
              href="/login"
              style={{
                ...navLinkStyle,
                backgroundColor: "#e11d48",
                fontWeight: "700",
              }}
            >
              <User size={18} />
              Login
            </a>
          )}
        </div>
      </nav>

      {showLogoutPopup && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 3000,
            backgroundColor: "rgba(0, 0, 0, 0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "420px",
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "24px",
              padding: "28px",
              color: "white",
              boxShadow: "0 25px 70px rgba(0, 0, 0, 0.45)",
            }}
          >
            <h2
              style={{
                fontSize: "24px",
                marginBottom: "12px",
              }}
            >
              Confirm Logout
            </h2>

            <p
              style={{
                color: "#cbd5e1",
                marginBottom: "24px",
                lineHeight: "1.6",
              }}
            >
              Are you sure you want to logout from CinePeeker?
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={() => setShowLogoutPopup(false)}
                style={{
                  padding: "12px 18px",
                  borderRadius: "999px",
                  border: "1px solid #475569",
                  backgroundColor: "transparent",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmLogout}
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
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const navLinkStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "10px 16px",
  borderRadius: "999px",
  color: "white",
  textDecoration: "none",
  fontWeight: "600",
};