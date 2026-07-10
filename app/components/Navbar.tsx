"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Home as HomeIcon,
  Search,
  Heart,
  User,
  LogOut,
  CookingPot,
  Menu,
  X,
} from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const { data: session, status } = useSession();

  const [isMockLoggedIn, setIsMockLoggedIn] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
  const loginStatus = localStorage.getItem("isLoggedIn");
  setIsMockLoggedIn(loginStatus === "true");
}, []);

  const isLoggedIn =
  isMockLoggedIn || status === "authenticated";

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleConfirmLogout = async () => {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("loginMethod");
  localStorage.removeItem("mockUser");

  setIsMockLoggedIn(false);
  setShowLogoutPopup(false);
  setIsMobileMenuOpen(false);

  if (session) {
    await signOut({
      redirect: false,
    });
  }

  router.push("/");
  router.refresh();
};

  const handleLogoutClick = () => {
    setIsMobileMenuOpen(false);
    setShowLogoutPopup(true);
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(path);
  };

  return (
    <>
      <nav className="navbar">
        <a href="/" className="brand">
          <span className="brandIcon">
            <CookingPot size={25} />
          </span>

          <span className="brandText">
            Recipe<span>Peeker</span>
          </span>
        </a>

        {/* เมนูสำหรับจอคอม */}
        <div className="desktopMenu">
          <a
            href="/"
            className={`navLink ${isActive("/") ? "activeLink" : ""}`}
          >
            <HomeIcon size={18} />
            Home
          </a>

          <a
            href="/search"
            className={`navLink ${
              isActive("/search") ? "activeLink" : ""
            }`}
          >
            <Search size={18} />
            Search
          </a>

          <a
            href="/watchlist"
            className={`navLink ${
              isActive("/watchlist") ? "activeLink" : ""
            }`}
          >
            <Heart size={18} />
            Saved Recipes
          </a>

          {isLoggedIn ? (
            <button
              type="button"
              onClick={handleLogoutClick}
              className="navLink accountButton"
            >
              <LogOut size={18} />
              {session?.user?.name || "Logout"}
            </button>
          ) : (
            <a href="/login" className="navLink accountButton">
              <User size={18} />
              Login
            </a>
          )}
        </div>

        {/* ปุ่มสามขีดสำหรับมือถือ */}
        <button
          type="button"
          className="menuButton"
          onClick={() => setIsMobileMenuOpen((previousValue) => !previousValue)}
          aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X size={25} /> : <Menu size={27} />}
        </button>

        {/* เมนูมือถือ */}
        {isMobileMenuOpen && (
          <div className="mobileMenu">
            <a
              href="/"
              className={`mobileNavLink ${
                isActive("/") ? "activeMobileLink" : ""
              }`}
            >
              <HomeIcon size={19} />
              Home
            </a>

            <a
              href="/search"
              className={`mobileNavLink ${
                isActive("/search") ? "activeMobileLink" : ""
              }`}
            >
              <Search size={19} />
              Search
            </a>

            <a
              href="/watchlist"
              className={`mobileNavLink ${
                isActive("/watchlist") ? "activeMobileLink" : ""
              }`}
            >
              <Heart size={19} />
              Saved Recipes
            </a>

            <div className="mobileDivider" />

            {isLoggedIn ? (
              <button
                type="button"
                onClick={handleLogoutClick}
                className="mobileNavLink mobileAccountButton"
              >
                <LogOut size={19} />
                {session?.user?.name || "Logout"}
              </button>
            ) : (
              <a
                href="/login"
                className={`mobileNavLink mobileAccountButton ${
                  isActive("/login") ? "activeMobileLink" : ""
                }`}
              >
                <User size={19} />
                Login
              </a>
            )}
          </div>
        )}
      </nav>

      {showLogoutPopup && (
        <div className="popupOverlay">
          <div className="popupCard">
            <div className="popupDecoration">❦</div>

            <h2 className="popupTitle">Confirm Logout</h2>

            <p className="popupDescription">
              Are you sure you want to logout from RecipePeeker?
            </p>

            <div className="popupActions">
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

      <style jsx>{`
        .navbar {
          position: sticky;
          top: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 20px 64px;
          border-bottom: 1px solid #ead7c4;
          background: linear-gradient(
            180deg,
            rgba(255, 250, 243, 0.98),
            rgba(255, 247, 237, 0.94)
          );
          box-shadow: 0 8px 30px rgba(185, 15, 47, 0.08);
        }

        .brand {
          display: flex;
          align-items: center;
          flex-shrink: 0;
          gap: 12px;
          color: #5f1f23;
          text-decoration: none;
        }

        .brandIcon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          color: white;
          background: linear-gradient(135deg, #b90f2f, #d92045);
          box-shadow: 0 10px 24px rgba(185, 15, 47, 0.25);
        }

        .brandText {
          font-family: Georgia, serif;
          font-size: 30px;
          font-weight: 700;
        }

        .brandText span {
          color: #b90f2f;
        }

        .desktopMenu {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .navLink {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 20px;
          border: 1px solid transparent;
          border-radius: 18px;
          color: #5f1f23;
          background: transparent;
          text-decoration: none;
          font-family: inherit;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition:
            color 0.2s ease,
            background-color 0.2s ease,
            border-color 0.2s ease,
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .navLink:hover {
          color: #b90f2f;
          background-color: #fffaf3;
          transform: translateY(-1px);
        }

        .activeLink {
          color: #b90f2f;
          background-color: #fffaf3;
          box-shadow: 0 8px 24px rgba(185, 15, 47, 0.12);
        }

        .accountButton {
          border-color: #b90f2f;
          color: #b90f2f;
        }

        .menuButton {
          width: 46px;
          height: 46px;
          display: none;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 1px solid #ead7c4;
          border-radius: 15px;
          color: #b90f2f;
          background-color: #fffaf3;
          box-shadow: 0 8px 20px rgba(185, 15, 47, 0.1);
          cursor: pointer;
        }

        .mobileMenu {
          position: absolute;
          top: calc(100% + 10px);
          right: 20px;
          width: min(280px, calc(100vw - 40px));
          display: none;
          flex-direction: column;
          gap: 6px;
          padding: 14px;
          border: 1px solid #ead7c4;
          border-radius: 22px;
          background-color: #fffaf3;
          box-shadow: 0 24px 55px rgba(95, 31, 35, 0.2);
          animation: openMenu 0.2s ease;
        }

        .mobileNavLink {
          width: 100%;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 13px 15px;
          border: 1px solid transparent;
          border-radius: 14px;
          color: #5f1f23;
          background-color: transparent;
          text-decoration: none;
          font-family: inherit;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition:
            color 0.2s ease,
            background-color 0.2s ease;
        }

        .mobileNavLink:hover {
          color: #b90f2f;
          background-color: #f9eadf;
        }

        .activeMobileLink {
          color: #b90f2f;
          background-color: #f9eadf;
        }

        .mobileAccountButton {
          border-color: #b90f2f;
          color: #b90f2f;
        }

        .mobileDivider {
          height: 1px;
          margin: 5px 3px;
          background-color: #ead7c4;
        }

        .popupOverlay {
          position: fixed;
          inset: 0;
          z-index: 3000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background-color: rgba(95, 31, 35, 0.45);
        }

        .popupCard {
          position: relative;
          width: 100%;
          max-width: 420px;
          overflow: hidden;
          box-sizing: border-box;
          padding: 30px;
          border: 1px solid #ead7c4;
          border-radius: 28px;
          color: #5f1f23;
          background-color: #fffaf3;
          box-shadow: 0 25px 70px rgba(95, 31, 35, 0.25);
        }

        .popupDecoration {
          position: absolute;
          top: -18px;
          right: -10px;
          color: rgba(185, 15, 47, 0.08);
          font-family: Georgia, serif;
          font-size: 74px;
        }

        .popupTitle {
          margin: 0 0 12px;
          font-family: Georgia, serif;
          font-size: 26px;
        }

        .popupDescription {
          margin: 0 0 24px;
          color: #8a5c52;
          line-height: 1.6;
        }

        .popupActions {
          display: flex;
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 12px;
        }

        @keyframes openMenu {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 850px) {
          .navbar {
            padding: 15px 20px;
          }

          .desktopMenu {
            display: none;
          }

          .menuButton {
            display: flex;
          }

          .mobileMenu {
            display: flex;
          }

          .brandText {
            font-size: 25px;
          }

          .brandIcon {
            width: 44px;
            height: 44px;
          }
        }

        @media (max-width: 480px) {
          .navbar {
            padding: 13px 15px;
          }

          .brand {
            gap: 9px;
          }

          .brandText {
            font-size: 21px;
          }

          .brandIcon {
            width: 41px;
            height: 41px;
          }

          .menuButton {
            width: 42px;
            height: 42px;
          }

          .mobileMenu {
            right: 12px;
            width: calc(100vw - 24px);
          }

          .popupCard {
            padding: 25px 20px;
            border-radius: 22px;
          }

          .popupActions {
            flex-direction: column-reverse;
          }
        }
      `}</style>
    </>
  );
}

const primaryButtonStyle: React.CSSProperties = {
  padding: "12px 18px",
  border: "none",
  borderRadius: "999px",
  color: "white",
  backgroundColor: "#b90f2f",
  cursor: "pointer",
  fontWeight: "bold",
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: "12px 18px",
  border: "1px solid #d8b9a6",
  borderRadius: "999px",
  color: "#5f1f23",
  backgroundColor: "transparent",
  cursor: "pointer",
  fontWeight: "bold",
};