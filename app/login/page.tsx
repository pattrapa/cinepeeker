"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CookingPot,
  Heart,
  LockKeyhole,
  Mail,
  Sparkles,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectPath = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");

  const [errors, setErrors] = useState({
    email: false,
    password: false,
  });

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    const newErrors = {
      email: trimmedEmail === "",
      password: trimmedPassword === "",
    };

    setErrors(newErrors);

    if (newErrors.email || newErrors.password) {
      setMessage("Please fill in email and password.");
      return;
    }

    const correctEmail = "user@example.com";
    const correctPassword = "123456";

    if (trimmedEmail !== correctEmail || trimmedPassword !== correctPassword) {
      setErrors({
        email: true,
        password: true,
      });

      setMessage("Email or password is incorrect.");
      return;
    }

    setErrors({
      email: false,
      password: false,
    });

    localStorage.setItem("isLoggedIn", "true");

    setMessage("Login successful! Welcome back to RecipePeeker.");

    setTimeout(() => {
      router.push(redirectPath);
    }, 800);
  };

  const registerHref =
    redirectPath === "/"
      ? "/register"
      : `/register?redirect=${encodeURIComponent(redirectPath)}`;

  const isSuccess = message.includes("successful");

  return (
    <main className="page">
      <section className="authContainer">
        {/* Login form */}
        <div className="formSection">
          <div style={{ marginBottom: "30px" }}>
            <span style={smallDecorationStyle}>❦ Welcome back ❦</span>

            <h1 style={headingStyle}>Login</h1>

            <p style={descriptionStyle}>
              Login to save your favorite recipes and continue your cozy
              cooking journey.
            </p>
          </div>

          <div style={demoAccountStyle}>
            <Sparkles size={18} color="#b90f2f" />

            <div>
              <div
                style={{
                  color: "#8f0d25",
                  fontWeight: "700",
                  marginBottom: "3px",
                }}
              >
                Demo account
              </div>

              <div style={{ color: "#8a5c52" }}>
                <strong>user@example.com</strong> / <strong>123456</strong>
              </div>
            </div>
          </div>

          <form onSubmit={handleLogin}>
            <label style={labelStyle}>Email</label>

            <div style={inputWrapperStyle}>
              <Mail
                size={19}
                color={errors.email ? "#d92045" : "#9a6b5f"}
                style={inputIconStyle}
              />

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);

                  setErrors((previousErrors) => ({
                    ...previousErrors,
                    email: false,
                  }));
                }}
                style={{
                  ...inputStyle,
                  border: errors.email
                    ? "1px solid #d92045"
                    : "1px solid #ead7c4",
                }}
              />
            </div>

            <label
              style={{
                ...labelStyle,
                marginTop: "19px",
              }}
            >
              Password
            </label>

            <div style={inputWrapperStyle}>
              <LockKeyhole
                size={19}
                color={errors.password ? "#d92045" : "#9a6b5f"}
                style={inputIconStyle}
              />

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);

                  setErrors((previousErrors) => ({
                    ...previousErrors,
                    password: false,
                  }));
                }}
                style={{
                  ...inputStyle,
                  border: errors.password
                    ? "1px solid #d92045"
                    : "1px solid #ead7c4",
                }}
              />
            </div>

            <button
              type="submit"
              style={primaryButtonStyle}
              onMouseEnter={(event) => {
                event.currentTarget.style.backgroundColor = "#8f0d25";
                event.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.backgroundColor = "#b90f2f";
                event.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Login
            </button>

            {message && (
              <p
                style={{
                  ...messageStyle,
                  color: isSuccess ? "#3f7b50" : "#b90f2f",
                  backgroundColor: isSuccess ? "#edf7ee" : "#fff0f2",
                  border: isSuccess
                    ? "1px solid #cce6d1"
                    : "1px solid #f1c4cb",
                }}
              >
                {message}
              </p>
            )}
          </form>

          <p style={bottomTextStyle}>
            Don&apos;t have an account?{" "}
            <a href={registerHref} style={linkStyle}>
              Create Account
            </a>
          </p>
        </div>

        {/* Decorative RecipePeeker panel */}
        <div className="visualSection">
          <div style={topSymbolStyle}>✧ ❦ ✧</div>

          <div style={largeIconContainerStyle}>
            <CookingPot size={62} strokeWidth={1.5} />
          </div>

          <h2 style={visualHeadingStyle}>RecipePeeker</h2>

          <p style={visualTextStyle}>
            Discover recipes made for sweet mornings, cozy evenings and
            memorable meals.
          </p>

          <div style={featureListStyle}>
            <div style={featureItemStyle}>
              <Heart size={18} fill="#b90f2f" />
              Save your favorite recipes
            </div>

            <div style={featureItemStyle}>
              <Sparkles size={18} />
              Find inspiration for every meal
            </div>
          </div>

          <div style={bottomSymbolStyle}>❧ ♡ ❦</div>
        </div>
      </section>

      <style jsx>{`
        .page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px;
          color: #5f1f23;
          background:
            radial-gradient(
              circle at top left,
              rgba(255, 255, 255, 0.95),
              transparent 32%
            ),
            radial-gradient(
              circle at bottom right,
              rgba(217, 32, 69, 0.08),
              transparent 30%
            ),
            #fff7ed;
        }

        .authContainer {
          width: 100%;
          max-width: 1060px;
          min-height: 650px;
          display: grid;
          grid-template-columns: 1fr 0.9fr;
          overflow: hidden;
          border: 1px solid #ead7c4;
          border-radius: 32px;
          background-color: #fffaf3;
          box-shadow: 0 28px 80px rgba(95, 31, 35, 0.14);
        }

        .formSection {
          padding: 54px 62px;
          background-color: #fffaf3;
        }

        .visualSection {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 50px;
          color: white;
          text-align: center;
          background:
            linear-gradient(
              rgba(143, 13, 37, 0.94),
              rgba(185, 15, 47, 0.92)
            ),
            radial-gradient(
              circle at top,
              rgba(255, 255, 255, 0.3),
              transparent 35%
            );
        }

        .visualSection::before,
        .visualSection::after {
          content: "";
          position: absolute;
          width: 180px;
          height: 180px;
          border: 2px solid rgba(255, 255, 255, 0.16);
          border-radius: 50%;
        }

        .visualSection::before {
          top: -80px;
          right: -70px;
        }

        .visualSection::after {
          bottom: -80px;
          left: -70px;
        }

        @media (max-width: 850px) {
          .page {
            padding: 20px;
          }

          .authContainer {
            max-width: 620px;
            grid-template-columns: 1fr;
          }

          .formSection {
            padding: 42px 32px;
          }

          .visualSection {
            min-height: 420px;
            padding: 48px 30px;
          }
        }

        @media (max-width: 480px) {
          .page {
            padding: 12px;
          }

          .authContainer {
            border-radius: 24px;
          }

          .formSection {
            padding: 35px 22px;
          }

          .visualSection {
            min-height: 390px;
          }
        }
      `}</style>
    </main>
  );
}

const smallDecorationStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "10px",
  color: "#b90f2f",
  fontFamily: "Georgia, serif",
  fontSize: "14px",
  letterSpacing: "1.5px",
};

const headingStyle: React.CSSProperties = {
  margin: "0 0 10px",
  color: "#8f0d25",
  fontFamily: "Georgia, serif",
  fontSize: "40px",
  lineHeight: "1.15",
};

const descriptionStyle: React.CSSProperties = {
  maxWidth: "480px",
  margin: 0,
  color: "#8a5c52",
  fontSize: "15.5px",
  lineHeight: "1.75",
};

const demoAccountStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: "11px",
  marginBottom: "26px",
  padding: "14px 16px",
  border: "1px solid #ead7c4",
  borderRadius: "15px",
  backgroundColor: "#f9eadf",
  fontSize: "14px",
  lineHeight: "1.5",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "8px",
  color: "#5f1f23",
  fontSize: "14px",
  fontWeight: "700",
};

const inputWrapperStyle: React.CSSProperties = {
  position: "relative",
};

const inputIconStyle: React.CSSProperties = {
  position: "absolute",
  top: "50%",
  left: "16px",
  zIndex: 1,
  transform: "translateY(-50%)",
  pointerEvents: "none",
};

const inputStyle: React.CSSProperties = {
  boxSizing: "border-box",
  width: "100%",
  padding: "14px 16px 14px 46px",
  borderRadius: "14px",
  backgroundColor: "#fffdf9",
  color: "#5f1f23",
  fontSize: "15px",
  outline: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const primaryButtonStyle: React.CSSProperties = {
  width: "100%",
  marginTop: "26px",
  padding: "15px",
  border: "none",
  borderRadius: "14px",
  color: "white",
  backgroundColor: "#b90f2f",
  boxShadow: "0 12px 26px rgba(185, 15, 47, 0.22)",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "700",
  transition: "background-color 0.2s ease, transform 0.2s ease",
};

const messageStyle: React.CSSProperties = {
  marginTop: "16px",
  marginBottom: 0,
  padding: "12px 14px",
  borderRadius: "12px",
  textAlign: "center",
  fontSize: "14px",
  fontWeight: "600",
};

const bottomTextStyle: React.CSSProperties = {
  marginTop: "24px",
  marginBottom: 0,
  color: "#8a5c52",
  textAlign: "center",
  fontSize: "14px",
};

const linkStyle: React.CSSProperties = {
  color: "#b90f2f",
  textDecoration: "none",
  fontWeight: "700",
};

const topSymbolStyle: React.CSSProperties = {
  position: "absolute",
  top: "28px",
  color: "rgba(255,255,255,0.72)",
  fontFamily: "Georgia, serif",
  fontSize: "20px",
  letterSpacing: "8px",
};

const largeIconContainerStyle: React.CSSProperties = {
  width: "118px",
  height: "118px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "22px",
  border: "1px solid rgba(255,255,255,0.55)",
  borderRadius: "34px",
  backgroundColor: "rgba(255,255,255,0.12)",
  boxShadow: "0 22px 45px rgba(95, 31, 35, 0.22)",
  backdropFilter: "blur(8px)",
};

const visualHeadingStyle: React.CSSProperties = {
  margin: "0 0 15px",
  fontFamily: "Georgia, serif",
  fontSize: "38px",
};

const visualTextStyle: React.CSSProperties = {
  maxWidth: "380px",
  margin: "0 auto 25px",
  color: "rgba(255,255,255,0.86)",
  fontSize: "15px",
  lineHeight: "1.8",
};

const featureListStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  marginBottom: "30px",
};

const featureItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "9px",
  color: "rgba(255,255,255,0.95)",
  fontSize: "14px",
};

const bottomSymbolStyle: React.CSSProperties = {
  position: "absolute",
  bottom: "26px",
  color: "rgba(255,255,255,0.64)",
  fontFamily: "Georgia, serif",
  fontSize: "18px",
  letterSpacing: "7px",
};