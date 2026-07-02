"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Film } from "lucide-react";

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

    setMessage("Account created successfully!");

    setTimeout(() => {
      router.push(redirectPath);
    }, 800);
  };

  const loginHref =
    redirectPath === "/"
      ? "/login"
      : `/login?redirect=${encodeURIComponent(redirectPath)}`;

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f172a",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          backgroundColor: "#1e293b",
          border: "1px solid #334155",
          borderRadius: "24px",
          padding: "32px",
          boxShadow: "0 25px 70px rgba(0, 0, 0, 0.35)",
        }}
      >
        <a
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            color: "white",
            textDecoration: "none",
            marginBottom: "24px",
          }}
        >
          <span
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "14px",
              backgroundColor: "#e11d48",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Film size={24} />
          </span>

          <span
            style={{
              fontSize: "26px",
              fontWeight: "bold",
            }}
          >
            CinePeeker
          </span>
        </a>

        <h1
          style={{
            fontSize: "28px",
            marginBottom: "8px",
          }}
        >
          Create Account
        </h1>

        <p
          style={{
            color: "#94a3b8",
            marginBottom: "24px",
            lineHeight: "1.6",
          }}
        >
          สมัครสมาชิกเพื่อเก็บ Watchlist และรีวิว trailer
        </p>

        <form onSubmit={handleRegister}>
          <label style={labelStyle}>Username</label>
          <input
            type="text"
            placeholder="Your username"
            value={username}
            onChange={(event) => {
              setUsername(event.target.value);
              setErrors((prevErrors) => ({
                ...prevErrors,
                username: false,
              }));
            }}
            style={{
              ...inputStyle,
              border: errors.username
                ? "1px solid #ef4444"
                : "1px solid #475569",
            }}
          />

          <label
            style={{
              ...labelStyle,
              marginTop: "18px",
            }}
          >
            Email
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setErrors((prevErrors) => ({
                ...prevErrors,
                email: false,
              }));
            }}
            style={{
              ...inputStyle,
              border: errors.email
                ? "1px solid #ef4444"
                : "1px solid #475569",
            }}
          />

          <label
            style={{
              ...labelStyle,
              marginTop: "18px",
            }}
          >
            Password
          </label>
          <input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setErrors((prevErrors) => ({
                ...prevErrors,
                password: false,
              }));
            }}
            style={{
              ...inputStyle,
              border: errors.password
                ? "1px solid #ef4444"
                : "1px solid #475569",
            }}
          />

          <button
            type="submit"
            style={{
              width: "100%",
              marginTop: "24px",
              padding: "14px",
              borderRadius: "14px",
              border: "none",
              backgroundColor: "#e11d48",
              color: "white",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Create Account
          </button>

          {message && (
            <p
              style={{
                marginTop: "16px",
                color: message.includes("successfully")
                  ? "#86efac"
                  : "#fb7185",
                textAlign: "center",
                fontWeight: "600",
              }}
            >
              {message}
            </p>
          )}
        </form>

        <p
          style={{
            marginTop: "20px",
            color: "#cbd5e1",
            textAlign: "center",
          }}
        >
          Already have an account?{" "}
          <a
            href={loginHref}
            style={{
              color: "#fb7185",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Login
          </a>
        </p>
      </div>
    </main>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "8px",
  fontWeight: "600",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "14px",
  border: "1px solid #475569", 
  backgroundColor: "#0f172a",
  color: "white",
  fontSize: "16px",
  outline: "none",
};