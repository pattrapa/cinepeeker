"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Home as HomeIcon,
  Search,
  Heart,
  User,
  LogOut,
  CookingPot,
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
          padding: "20px 64px",
          background:
            "linear-gradient(180deg, rgba(255, 250, 243, 0.98), rgba(255, 247, 237, 0.94))",
          borderBottom: "1px solid #ead7c4",
          boxShadow: "0 8px 30px rgba(185, 15, 47, 0.08)",
          flexWrap: "wrap",
        }}
      >
        <a
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "#5f1f23",
            textDecoration: "none",
            fontSize: "30px",
            fontWeight: "bold",
            fontFamily: "Georgia, serif",
          }}
        >
          <span
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #b90f2f, #d92045)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              boxShadow: "0 10px 24px rgba(185, 15, 47, 0.25)",
            }}
          >
            <CookingPot size={25} />
          </span>

          <span>
            Recipe<span style={{ color: "#b90f2f" }}>Peeker</span>
          </span>
        </a>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            flexWrap: "wrap",
          }}
        >
          <a href="/" style={{ ...navLinkStyle, ...activeNavStyle }}>
            <HomeIcon size={18} />
            Home
          </a>

          <a href="/search" style={navLinkStyle}>
            <Search size={18} />
            Search
          </a>

          <a href="/watchlist" style={navLinkStyle}>
            <Heart size={18} />
            Saved Recipes
          </a>

          {isLoggedIn ? (
            <button
              type="button"
              onClick={() => setShowLogoutPopup(true)}
              style={{
                ...navLinkStyle,
                border: "1px solid #b90f2f",
                backgroundColor: "transparent",
                color: "#b90f2f",
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
                border: "1px solid #b90f2f",
                color: "#b90f2f",
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
            backgroundColor: "rgba(95, 31, 35, 0.45)",
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
              backgroundColor: "#fffaf3",
              border: "1px solid #ead7c4",
              borderRadius: "28px",
              padding: "30px",
              color: "#5f1f23",
              boxShadow: "0 25px 70px rgba(95, 31, 35, 0.25)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-18px",
                right: "-10px",
                fontSize: "74px",
                color: "rgba(185, 15, 47, 0.08)",
                fontFamily: "Georgia, serif",
              }}
            >
              ❦
            </div>

            <h2
              style={{
                fontSize: "26px",
                marginBottom: "12px",
                fontFamily: "Georgia, serif",
              }}
            >
              Confirm Logout
            </h2>

            <p
              style={{
                color: "#8a5c52",
                marginBottom: "24px",
                lineHeight: "1.6",
              }}
            >
              Are you sure you want to logout from RecipePeeker?
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
                style={secondaryButtonStyle}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmLogout}
                style={primaryButtonStyle}
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
  padding: "12px 20px",
  borderRadius: "18px",
  color: "#5f1f23",
  textDecoration: "none",
  fontWeight: "600",
};

const activeNavStyle: React.CSSProperties = {
  backgroundColor: "#fffaf3",
  color: "#b90f2f",
  boxShadow: "0 8px 24px rgba(185, 15, 47, 0.12)",
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "12px 18px",
  borderRadius: "999px",
  border: "none",
  backgroundColor: "#b90f2f",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: "12px 18px",
  borderRadius: "999px",
  border: "1px solid #d8b9a6",
  backgroundColor: "transparent",
  color: "#5f1f23",
  cursor: "pointer",
  fontWeight: "bold",
};