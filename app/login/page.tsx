"use client";

import { useState } from "react";
import Image from "next/image";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  signIn,
} from "next-auth/react";

import {
  Heart,
  LockKeyhole,
  Mail,
  Sparkles,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams =
    useSearchParams();

  const redirectPath =
    searchParams.get("redirect") ||
    "/";

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [
    isGoogleLoading,
    setIsGoogleLoading,
  ] = useState(false);

  const [
    isCredentialsLoading,
    setIsCredentialsLoading,
  ] = useState(false);

  const [errors, setErrors] =
    useState({
      email: false,
      password: false,
    });

  const isLoading =
    isGoogleLoading ||
    isCredentialsLoading;

  const handleLogin = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const trimmedEmail =
      email.trim().toLowerCase();

    const trimmedPassword =
      password;

    const newErrors = {
      email:
        trimmedEmail === "",

      password:
        trimmedPassword === "",
    };

    setErrors(newErrors);
    setMessage("");

    if (
      newErrors.email ||
      newErrors.password
    ) {
      setMessage(
        "Please fill in email and password.",
      );

      return;
    }

    try {
      setIsCredentialsLoading(true);

      const result = await signIn(
        "credentials",
        {
          email:
            trimmedEmail,

          password:
            trimmedPassword,

          redirect:
            false,
        },
      );

      if (
        !result ||
        result.error
      ) {
        throw new Error(
          "Email or password is incorrect.",
        );
      }

      setErrors({
        email: false,
        password: false,
      });

      setMessage(
        "Login successful! Welcome back to RecipePeeker.",
      );

      router.push(redirectPath);
      router.refresh();
    } catch (error) {
      console.error(
        "Credentials login error:",
        error,
      );

      setErrors({
        email: true,
        password: true,
      });

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to login.",
      );
    } finally {
      setIsCredentialsLoading(
        false,
      );
    }
  };

  const handleGoogleLogin =
    async () => {
      try {
        setIsGoogleLoading(true);
        setMessage("");

        await signIn(
          "google",
          {
            redirectTo:
              redirectPath,
          },
        );
      } catch (error) {
        console.error(
          "Google login error:",
          error,
        );

        setMessage(
          "Unable to login with Google. Please try again.",
        );

        setIsGoogleLoading(
          false,
        );
      }
    };

  const registerHref =
    redirectPath === "/"
      ? "/register"
      : `/register?redirect=${encodeURIComponent(
          redirectPath,
        )}`;

  const isSuccess =
    message.includes(
      "successful",
    );

  const logoImageStyle:
    React.CSSProperties = {
      width: "76px",
      height: "76px",
      objectFit: "contain",
    };

  return (
    <main className="page">
      <section className="authContainer">
        <div className="formSection">
          <div
            style={{
              marginBottom:
                "28px",
            }}
          >
            <span
              style={
                smallDecorationStyle
              }
            >
              ❦ Welcome back ❦
            </span>

            <h1
              style={headingStyle}
            >
              Login
            </h1>

            <p
              style={
                descriptionStyle
              }
            >
              Login to save your
              favorite recipes and
              continue your cozy
              cooking journey.
            </p>
          </div>

          <button
            type="button"
            onClick={
              handleGoogleLogin
            }
            disabled={isLoading}
            aria-busy={
              isGoogleLoading
            }
            style={{
              ...googleButtonStyle,

              cursor:
                isLoading
                  ? "not-allowed"
                  : "pointer",

              opacity:
                isLoading
                  ? 0.7
                  : 1,
            }}
          >
            <GoogleIcon />

            <span>
              {isGoogleLoading
                ? "Connecting to Google..."
                : "Continue with Google"}
            </span>
          </button>

          <div
            style={
              dividerContainerStyle
            }
          >
            <span
              style={
                dividerLineStyle
              }
            />

            <span
              style={
                dividerTextStyle
              }
            >
              or
            </span>

            <span
              style={
                dividerLineStyle
              }
            />
          </div>

          <form
            onSubmit={
              handleLogin
            }
          >
            <label
              htmlFor="email"
              style={labelStyle}
            >
              Email
            </label>

            <div
              style={
                inputWrapperStyle
              }
            >
              <Mail
                size={19}
                color={
                  errors.email
                    ? "#d92045"
                    : "#9a6b5f"
                }
                style={
                  inputIconStyle
                }
              />

              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                disabled={isLoading}
                onChange={(
                  event,
                ) => {
                  setEmail(
                    event.target
                      .value,
                  );

                  setMessage("");

                  setErrors(
                    (
                      previousErrors,
                    ) => ({
                      ...previousErrors,
                      email:
                        false,
                    }),
                  );
                }}
                style={{
                  ...inputStyle,

                  border:
                    errors.email
                      ? "1px solid #d92045"
                      : "1px solid #ead7c4",

                  opacity:
                    isLoading
                      ? 0.75
                      : 1,
                }}
              />
            </div>

            <label
              htmlFor="password"
              style={{
                ...labelStyle,
                marginTop:
                  "19px",
              }}
            >
              Password
            </label>

            <div
              style={
                inputWrapperStyle
              }
            >
              <LockKeyhole
                size={19}
                color={
                  errors.password
                    ? "#d92045"
                    : "#9a6b5f"
                }
                style={
                  inputIconStyle
                }
              />

              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                disabled={isLoading}
                onChange={(
                  event,
                ) => {
                  setPassword(
                    event.target
                      .value,
                  );

                  setMessage("");

                  setErrors(
                    (
                      previousErrors,
                    ) => ({
                      ...previousErrors,
                      password:
                        false,
                    }),
                  );
                }}
                style={{
                  ...inputStyle,

                  border:
                    errors.password
                      ? "1px solid #d92045"
                      : "1px solid #ead7c4",

                  opacity:
                    isLoading
                      ? 0.75
                      : 1,
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              aria-busy={
                isCredentialsLoading
              }
              style={{
                ...primaryButtonStyle,

                cursor:
                  isLoading
                    ? "not-allowed"
                    : "pointer",

                opacity:
                  isLoading
                    ? 0.7
                    : 1,
              }}
              onMouseEnter={(
                event,
              ) => {
                if (
                  event
                    .currentTarget
                    .disabled
                ) {
                  return;
                }

                event.currentTarget.style.backgroundColor =
                  "#8f0d25";

                event.currentTarget.style.transform =
                  "translateY(-1px)";
              }}
              onMouseLeave={(
                event,
              ) => {
                event.currentTarget.style.backgroundColor =
                  "#b90f2f";

                event.currentTarget.style.transform =
                  "translateY(0)";
              }}
            >
              {isCredentialsLoading
                ? "Logging in..."
                : "Login"}
            </button>

            {message && (
              <p
                role={
                  isSuccess
                    ? "status"
                    : "alert"
                }
                style={{
                  ...messageStyle,

                  color:
                    isSuccess
                      ? "#3f7b50"
                      : "#b90f2f",

                  backgroundColor:
                    isSuccess
                      ? "#edf7ee"
                      : "#fff0f2",

                  border:
                    isSuccess
                      ? "1px solid #cce6d1"
                      : "1px solid #f1c4cb",
                }}
              >
                {message}
              </p>
            )}
          </form>

          <p
            style={
              bottomTextStyle
            }
          >
            Don&apos;t have an
            account?{" "}

            <a
              href={registerHref}
              style={linkStyle}
            >
              Create Account
            </a>
          </p>
        </div>

        <div className="visualSection">
          <div
            style={
              topSymbolStyle
            }
          >
            ✧ ❦ ✧
          </div>

          <div
            style={
              largeIconContainerStyle
            }
          >
            <Image
              src="/cook2.png"
              alt="RecipePeeker logo"
              width={76}
              height={76}
              priority
              style={
                logoImageStyle
              }
            />
          </div>

          <h2
            style={
              visualHeadingStyle
            }
          >
            RecipePeeker
          </h2>

          <p
            style={
              visualTextStyle
            }
          >
            Discover recipes made
            for sweet mornings,
            cozy evenings and
            memorable meals.
          </p>

          <div
            style={
              featureListStyle
            }
          >
            <div
              style={
                featureItemStyle
              }
            >
              <Heart size={18} />
              Save your favorite
              recipes
            </div>

            <div
              style={
                featureItemStyle
              }
            >
              <Sparkles
                size={18}
              />
              Find inspiration for
              every meal
            </div>
          </div>

          <div
            style={
              bottomSymbolStyle
            }
          >
            ❧ ♡ ❦
          </div>
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
              rgba(
                255,
                255,
                255,
                0.95
              ),
              transparent 32%
            ),
            radial-gradient(
              circle at bottom right,
              rgba(
                217,
                32,
                69,
                0.08
              ),
              transparent 30%
            ),
            #fff7ed;
        }

        .authContainer {
          width: 100%;
          max-width: 1060px;
          min-height: 690px;
          display: grid;
          grid-template-columns:
            1fr 0.9fr;
          overflow: hidden;
          border: 1px solid
            #ead7c4;
          border-radius: 32px;
          background-color:
            #fffaf3;
          box-shadow:
            0 28px 80px
            rgba(
              95,
              31,
              35,
              0.14
            );
        }

        .formSection {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 48px 62px;
          background-color:
            #fffaf3;
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
              145deg,
              #8f0d25,
              #c71438
            );
        }

        .visualSection::before,
        .visualSection::after {
          content: "";
          position: absolute;
          width: 180px;
          height: 180px;
          border: 2px solid
            rgba(
              255,
              255,
              255,
              0.16
            );
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

        @media (
          max-width: 850px
        ) {
          .page {
            padding: 20px;
          }

          .authContainer {
            max-width: 620px;
            grid-template-columns:
              1fr;
          }

          .formSection {
            padding: 42px 32px;
          }

          .visualSection {
            min-height: 400px;
            padding: 48px 30px;
          }
        }

        @media (
          max-width: 480px
        ) {
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
            min-height: 360px;
          }
        }
      `}</style>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.91h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.4Z"
      />

      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.97-.9 6.62-2.43l-3.24-2.54c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z"
      />

      <path
        fill="#FBBC05"
        d="M6.39 13.86A6.02 6.02 0 0 1 6.08 12c0-.65.11-1.28.31-1.86V7.52H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.48l3.35-2.62Z"
      />

      <path
        fill="#EA4335"
        d="M12 6.01c1.47 0 2.78.5 3.82 1.49l2.86-2.86A9.59 9.59 0 0 0 12 2a10 10 0 0 0-8.96 5.52l3.35 2.62C7.18 7.77 9.39 6.01 12 6.01Z"
      />
    </svg>
  );
}

const smallDecorationStyle:
  React.CSSProperties = {
    display: "block",
    marginBottom: "10px",
    color: "#b90f2f",
    fontFamily:
      "Georgia, serif",
    fontSize: "14px",
    letterSpacing: "1.5px",
  };

const headingStyle:
  React.CSSProperties = {
    margin: "0 0 10px",
    color: "#8f0d25",
    fontFamily:
      "Georgia, serif",
    fontSize: "40px",
    lineHeight: "1.15",
  };

const descriptionStyle:
  React.CSSProperties = {
    maxWidth: "480px",
    margin: 0,
    color: "#8a5c52",
    fontSize: "15.5px",
    lineHeight: "1.75",
  };

const googleButtonStyle:
  React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "11px",
    padding: "14px 18px",
    border:
      "1px solid #ead7c4",
    borderRadius: "14px",
    color: "#5f1f23",
    backgroundColor:
      "#fffdf9",
    boxShadow:
      "0 7px 18px rgba(95, 31, 35, 0.07)",
    fontSize: "15px",
    fontWeight: "700",
    transition:
      "border-color 0.2s ease, transform 0.2s ease",
  };

const dividerContainerStyle:
  React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    margin: "20px 0",
  };

const dividerLineStyle:
  React.CSSProperties = {
    height: "1px",
    flex: 1,
    backgroundColor:
      "#ead7c4",
  };

const dividerTextStyle:
  React.CSSProperties = {
    color: "#9a6b5f",
    fontSize: "13px",
  };

const labelStyle:
  React.CSSProperties = {
    display: "block",
    marginBottom: "8px",
    color: "#5f1f23",
    fontSize: "14px",
    fontWeight: "700",
  };

const inputWrapperStyle:
  React.CSSProperties = {
    position: "relative",
  };

const inputIconStyle:
  React.CSSProperties = {
    position: "absolute",
    top: "50%",
    left: "16px",
    zIndex: 1,
    transform:
      "translateY(-50%)",
    pointerEvents: "none",
  };

const inputStyle:
  React.CSSProperties = {
    boxSizing: "border-box",
    width: "100%",
    padding:
      "14px 16px 14px 46px",
    borderRadius: "14px",
    backgroundColor:
      "#fffdf9",
    color: "#5f1f23",
    fontSize: "15px",
    outline: "none",
    transition:
      "border-color 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease",
  };

const primaryButtonStyle:
  React.CSSProperties = {
    width: "100%",
    marginTop: "26px",
    padding: "15px",
    border: "none",
    borderRadius: "14px",
    color: "white",
    backgroundColor:
      "#b90f2f",
    boxShadow:
      "0 12px 26px rgba(185, 15, 47, 0.22)",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "700",
    transition:
      "background-color 0.2s ease, transform 0.2s ease, opacity 0.2s ease",
  };

const messageStyle:
  React.CSSProperties = {
    marginTop: "16px",
    marginBottom: 0,
    padding: "12px 14px",
    borderRadius: "12px",
    textAlign: "center",
    fontSize: "14px",
    fontWeight: "600",
  };

const bottomTextStyle:
  React.CSSProperties = {
    marginTop: "22px",
    marginBottom: 0,
    color: "#8a5c52",
    textAlign: "center",
    fontSize: "14px",
  };

const linkStyle:
  React.CSSProperties = {
    color: "#b90f2f",
    textDecoration: "none",
    fontWeight: "700",
  };

const topSymbolStyle:
  React.CSSProperties = {
    position: "absolute",
    top: "28px",
    color:
      "rgba(255,255,255,0.72)",
    fontFamily:
      "Georgia, serif",
    fontSize: "20px",
    letterSpacing: "8px",
  };

const largeIconContainerStyle:
  React.CSSProperties = {
    width: "118px",
    height: "118px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "22px",
    border:
      "1px solid rgba(255,255,255,0.55)",
    borderRadius: "34px",
    backgroundColor:
      "rgba(255,255,255,0.12)",
    boxShadow:
      "0 22px 45px rgba(95,31,35,0.22)",
  };

const visualHeadingStyle:
  React.CSSProperties = {
    margin: "0 0 15px",
    fontFamily:
      "Georgia, serif",
    fontSize: "38px",
  };

const visualTextStyle:
  React.CSSProperties = {
    maxWidth: "380px",
    margin:
      "0 auto 25px",
    color:
      "rgba(255,255,255,0.86)",
    fontSize: "15px",
    lineHeight: "1.8",
  };

const featureListStyle:
  React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  };

const featureItemStyle:
  React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "9px",
    color:
      "rgba(255,255,255,0.95)",
    fontSize: "14px",
  };

const bottomSymbolStyle:
  React.CSSProperties = {
    position: "absolute",
    bottom: "26px",
    color:
      "rgba(255,255,255,0.64)",
    fontFamily:
      "Georgia, serif",
    fontSize: "18px",
    letterSpacing: "7px",
  };