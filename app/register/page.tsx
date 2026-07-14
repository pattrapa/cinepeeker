"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  CookingPot,
  Heart,
  LockKeyhole,
  Mail,
  Sparkles,
  UserRound,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectPath = searchParams.get("redirect") || "/";

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");

  const [errors, setErrors] = useState({
    username: false,
    email: false,
    password: false,
  });

  const handleRegister = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    const newErrors = {
      username: trimmedUsername === "",
      email: trimmedEmail === "",
      password: trimmedPassword === "",
    };

    setErrors(newErrors);

    if (newErrors.username || newErrors.email || newErrors.password) {
      setMessage("Please fill in all fields.");
      return;
    }

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("mockUser", trimmedUsername);

    setErrors({
      username: false,
      email: false,
      password: false,
    });

    setMessage("Account created successfully! Welcome to RecipePeeker.");

    setTimeout(() => {
      router.push(redirectPath);
    }, 800);
  };

  const loginHref =
    redirectPath === "/"
      ? "/login"
      : `/login?redirect=${encodeURIComponent(redirectPath)}`;

  const isSuccess = message.includes("successfully");
  const logoImageStyle: React.CSSProperties = {
  width: "76px",
  height: "76px",
  objectFit: "contain",
};

  return (
    <main className="page">
      <section className="authContainer">
        {/* Decorative RecipePeeker panel */}
        <div className="visualSection">
          <div style={topSymbolStyle}>✧ ❦ ✧</div>
  
          <div style={largeIconContainerStyle}>
            <Image
              src="/cook2.png"
              alt="RecipePeeker logo"
              width={76}
              height={76}
              priority
              style={logoImageStyle}
            />
          </div>

          <h2 style={visualHeadingStyle}>RecipePeeker</h2>

          <p style={visualTextStyle}>
            Create your own collection of comforting recipes and delicious
            ideas for every occasion.
          </p>

          <div style={featureListStyle}>
            <div style={featureItemStyle}>
              <Heart size={18} fill="#b90f2f" />
              Build your saved recipe collection
            </div>

            <div style={featureItemStyle}>
              <Sparkles size={18} />
              Share reviews and cooking memories
            </div>
          </div>

          <div style={bottomSymbolStyle}>❧ ♡ ❦</div>
        </div>
  
        {/* Register form */}
        <div className="formSection">
          <div style={{ marginBottom: "28px" }}>
            <span style={smallDecorationStyle}>❦ Join our table ❦</span>

            <h1 style={headingStyle}>Create Account</h1>

            <p style={descriptionStyle}>
              Create an account to save recipes, organize your favorites and
              write reviews.
            </p>
          </div>

          <form onSubmit={handleRegister}>
            <label style={labelStyle}>Username</label>

            <div style={inputWrapperStyle}>
              <UserRound
                size={19}
                color={errors.username ? "#d92045" : "#9a6b5f"}
                style={inputIconStyle}
              />
  
              <input
                type="text"
                placeholder="Your username"
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value);

                  setErrors((previousErrors) => ({
                    ...previousErrors,
                    username: false,
                  }));
                }}
                style={{
                  ...inputStyle,
                  border: errors.username
                    ? "1px solid #d92045"
                    : "1px solid #ead7c4",
                }}
              />
            </div>

            <label
              style={{
                ...labelStyle,
                marginTop: "18px",
              }}
            >
              Email
            </label>

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
                marginTop: "18px",
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
                placeholder="Create a password"
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
              Create Account
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
            Already have an account?{" "}
            <a href={loginHref} style={linkStyle}>
              Login
            </a>
          </p>
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
              circle at top right,
              rgba(255, 255, 255, 0.95),
              transparent 32%
            ),
            radial-gradient(
              circle at bottom left,
              rgba(217, 32, 69, 0.08),
              transparent 30%
            ),
            #fff7ed;
        }

        .authContainer {
          width: 100%;
          max-width: 1060px;
          min-height: 680px;
          display: grid;
          grid-template-columns: 0.9fr 1fr;
          overflow: hidden;
          border: 1px solid #ead7c4;
          border-radius: 32px;
          background-color: #fffaf3;
          box-shadow: 0 28px 80px rgba(95, 31, 35, 0.14);
        }

        .formSection {
          padding: 50px 62px;
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
          left: -70px;
        }

        .visualSection::after {
          right: -70px;
          bottom: -80px;
        }

        @media (max-width: 850px) {
          .page {
            padding: 20px;
          }

          .authContainer {
            max-width: 620px;
            grid-template-columns: 1fr;
          }

          .visualSection {
            min-height: 420px;
            padding: 48px 30px;
            order: 2;
          }

          .formSection {
            padding: 42px 32px;
            order: 1;
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
  fontSize: "38px",
  lineHeight: "1.15",
};

const descriptionStyle: React.CSSProperties = {
  maxWidth: "480px",
  margin: 0,
  color: "#8a5c52",
  fontSize: "15.5px",
  lineHeight: "1.75",
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
  boxShadow: "0 22px 45px rgba(95,31,35,0.22)",
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