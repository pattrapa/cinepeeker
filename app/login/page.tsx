"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Film } from "lucide-react";

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

    setMessage("Login successful! Welcome back to CinePeeker.");

    setTimeout(() => {
      router.push(redirectPath);
    }, 800);
  };

  const registerHref =
    redirectPath === "/"
      ? "/register"
      : `/register?redirect=${encodeURIComponent(redirectPath)}`;

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
          maxWidth: "420px",
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
          Login
        </h1>

        <p
          style={{
            color: "#94a3b8",
            marginBottom: "20px",
            lineHeight: "1.6",
          }}
        >
          เข้าสู่ระบบเพื่อบันทึก trailer ที่คุณสนใจ
        </p>

        <div
          style={{
            backgroundColor: "#0f172a",
            border: "1px solid #334155",
            borderRadius: "14px",
            padding: "12px 14px",
            marginBottom: "22px",
            color: "#cbd5e1",
            fontSize: "14px",
            lineHeight: "1.6",
          }}
        >
          Demo account: <strong>user@example.com</strong> /{" "}
          <strong>123456</strong>
        </div>

        <form onSubmit={handleLogin}>
          <label style={labelStyle}>Email</label>
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
            placeholder="Enter your password"
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
            Login
          </button>

          {message && (
            <p
              style={{
                marginTop: "16px",
                color: message.includes("successful") ? "#86efac" : "#fb7185",
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
          Don&apos;t have an account?{" "}
          <a
            href={registerHref}
            style={{
              color: "#fb7185",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Register
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