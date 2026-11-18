"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function SignUpPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
        }),
      });

      const responseText = await response.text();

      console.log("REGISTER URL:", `${API_URL}/auth/register`);
      console.log("REGISTER STATUS:", response.status);
      console.log("REGISTER RAW RESPONSE:", responseText);

      let result;

      try {
        result = JSON.parse(responseText);
      } catch {
        throw new Error(
          "Server returned an invalid response. Please check the API URL."
        );
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
            result?.error ||
            `Registration failed (${response.status})`
        );
      }

      console.log("REGISTER SUCCESS:", result);

      setSuccess("Account created successfully! Redirecting to sign in...");

      setName("");
      setEmail("");
      setPassword("");
      setRole("student");

      setTimeout(() => {
        router.push("/sign-in");
      }, 1200);
    } catch (err) {
      console.error("REGISTER ERROR:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "calc(100vh - 94px)",
        background: "#faf8f3",
        padding: "60px 20px 80px",
      }}
    >
      <div
        style={{
          maxWidth: "560px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        {/* Logo */}
        <div
          style={{
            width: "64px",
            height: "64px",
            margin: "0 auto 24px",
            borderRadius: "20px",
            background: "#075c3d",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            boxShadow: "0 8px 20px rgba(0,0,0,0.10)",
          }}
        >
          <svg
            width="34"
            height="34"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 7l9-4 9 4-9 4-9-4Z" />
            <path d="M5 9v5c0 2 3.1 4 7 4s7-2 7-4V9" />
            <path d="M21 7v6" />
          </svg>
        </div>

        {/* Heading */}
        <h1
          style={{
            margin: "0",
            fontSize: "40px",
            lineHeight: "1.15",
            fontWeight: 700,
            color: "#071d24",
          }}
        >
          Create Your Account
        </h1>

        <p
          style={{
            marginTop: "12px",
            marginBottom: "32px",
            fontSize: "18px",
            color: "#58717a",
          }}
        >
          Join MentorLagbe and start your learning journey
        </p>

        {/* Card */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e1d9",
            borderRadius: "24px",
            padding: "38px",
            textAlign: "left",
            boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
          }}
        >
          {/* Error */}
          {error && (
            <div
              style={{
                background: "#fff1f1",
                border: "1px solid #ffbcbc",
                color: "#c90000",
                borderRadius: "18px",
                padding: "15px 18px",
                marginBottom: "24px",
                fontSize: "15px",
                lineHeight: "1.5",
              }}
            >
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div
              style={{
                background: "#eefaf3",
                border: "1px solid #a9dec0",
                color: "#075c3d",
                borderRadius: "18px",
                padding: "15px 18px",
                marginBottom: "24px",
                fontSize: "15px",
                lineHeight: "1.5",
              }}
            >
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div style={{ marginBottom: "20px" }}>
              <label
                htmlFor="name"
                style={{
                  display: "block",
                  marginBottom: "9px",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#071d24",
                }}
              >
                Full Name
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
                minLength={2}
                autoComplete="name"
                style={inputStyle}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: "20px" }}>
              <label
                htmlFor="email"
                style={{
                  display: "block",
                  marginBottom: "9px",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#071d24",
                }}
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                autoComplete="email"
                style={inputStyle}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: "20px" }}>
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  marginBottom: "9px",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#071d24",
                }}
              >
                Password
              </label>

              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  style={{
                    ...inputStyle,
                    paddingRight: "55px",
                  }}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  style={{
                    position: "absolute",
                    right: "15px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    color: "#60736f",
                    fontSize: "20px",
                  }}
                >
                  {showPassword ? "◉" : "◌"}
                </button>
              </div>

              <p
                style={{
                  marginTop: "7px",
                  fontSize: "13px",
                  color: "#718187",
                }}
              >
                Password must be at least 6 characters.
              </p>
            </div>

            {/* Role */}
            <div style={{ marginBottom: "28px" }}>
              <label
                htmlFor="role"
                style={{
                  display: "block",
                  marginBottom: "9px",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#071d24",
                }}
              >
                I want to join as
              </label>

              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                style={{
                  ...inputStyle,
                  cursor: "pointer",
                  appearance: "auto",
                }}
              >
                <option value="student">Student</option>
                <option value="tutor">Tutor</option>
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                height: "58px",
                border: "none",
                borderRadius: "16px",
                background: loading ? "#6b9a87" : "#075c3d",
                color: "#ffffff",
                fontSize: "17px",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "0.2s",
              }}
            >
              {loading ? "Creating Account..." : "Create Account  →"}
            </button>
          </form>

          {/* Divider */}
          <div
            style={{
              height: "1px",
              background: "#e4dfd7",
              margin: "30px 0 24px",
            }}
          />

          {/* Sign in */}
          <div
            style={{
              textAlign: "center",
              fontSize: "16px",
              color: "#58717a",
            }}
          >
            Already have an account?
            <br />

            <Link
              href="/sign-in"
              style={{
                display: "inline-block",
                marginTop: "7px",
                color: "#075c3d",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: "56px",
  boxSizing: "border-box",
  border: "1px solid #ded9d1",
  borderRadius: "16px",
  background: "#fbfaf7",
  padding: "0 17px",
  fontSize: "16px",
  color: "#071d24",
  outline: "none",
};