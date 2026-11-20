
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import GoogleAuthButton from "@/components/auth/google-auth-button";

import {
  Eye,
  EyeOff,
  GraduationCap,
  ArrowRight,
  Loader2,
  BookOpen,
  Users,
  ShieldCheck,
  UserRound,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

type UserRole = "student" | "tutor";

export default function SignUpPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [role, setRole] = useState<UserRole>("student");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setError("");

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedName.length < 2) {
      setError("Name must contain at least 2 characters.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      setError("Please provide a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!["student", "tutor"].includes(role)) {
      setError("Please select a valid account type.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: normalizedName,
            email: normalizedEmail,
            password,
            role,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Registration failed."
        );
      }

      toast.success("Account created successfully!", {
        description:
          "Your MentorLagbe account is ready. Please sign in to continue.",
      });

      // The existing register endpoint creates the account
      // but does not issue a JWT. Therefore, send the user
      // to the normal sign-in page.

      router.replace("/sign-in");

    } catch (err) {
      console.error("Registration error:", err);

      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";

      setError(message);

      toast.error("Registration failed", {
        description: message,
      });

    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7f4] px-4 py-10">

      <div className="grid w-full max-w-6xl overflow-hidden rounded-3xl border border-[#e5ebe5] bg-white shadow-xl shadow-gray-200/50 lg:grid-cols-2">

        {/* LEFT BRANDING SECTION */}

        <section className="relative hidden flex-col justify-between overflow-hidden bg-[#075c3d] p-12 text-white lg:flex">

          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/10" />

          <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full border border-white/10" />

          <div className="relative z-10">

            <Link href="/" className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#075c3d]">
                <GraduationCap size={29} />
              </div>

              <span className="text-2xl font-extrabold tracking-tight">
                MentorLagbe
              </span>

            </Link>

            <div className="mt-24">

              <p className="mb-4 text-xs font-bold uppercase tracking-[3px] text-emerald-200">
                Join Our Community
              </p>

              <h1 className="max-w-md text-5xl font-extrabold leading-tight tracking-tight">
                Build your future with the right guidance.
              </h1>

              <p className="mt-6 max-w-md text-base leading-8 text-emerald-100">
                Whether you want to learn or teach, MentorLagbe
                helps you connect with the right people and
                discover new opportunities.
              </p>

            </div>

          </div>

          {/* FEATURES */}

          <div className="relative z-10 mt-16 space-y-5">

            <div className="flex items-center gap-4">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                <BookOpen size={21} />
              </div>

              <div>
                <p className="font-semibold">
                  Discover Opportunities
                </p>

                <p className="text-sm text-emerald-200">
                  Explore quality tuition opportunities.
                </p>
              </div>

            </div>

            <div className="flex items-center gap-4">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                <Users size={21} />
              </div>

              <div>
                <p className="font-semibold">
                  Grow Together
                </p>

                <p className="text-sm text-emerald-200">
                  Become part of a trusted learning community.
                </p>
              </div>

            </div>

            <p className="pt-8 text-xs text-emerald-200">
              © 2026 MentorLagbe. All rights reserved.
            </p>

          </div>

        </section>

        {/* RIGHT REGISTRATION SECTION */}

        <section className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-14">

          {/* MOBILE LOGO */}

          <Link
            href="/"
            className="mb-8 flex items-center gap-3 lg:hidden"
          >

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#075c3d] text-white">
              <GraduationCap size={25} />
            </div>

            <span className="text-xl font-extrabold text-[#075c3d]">
              MentorLagbe
            </span>

          </Link>

          <div className="mx-auto w-full max-w-md">

            {/* HEADING */}

            <div className="mb-7">

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#eaf4ed] text-[#075c3d]">
                <ShieldCheck size={25} />
              </div>

              <h2 className="text-3xl font-extrabold tracking-tight text-[#14251c]">
                Create Your Account
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                Join MentorLagbe and start your learning or
                teaching journey today.
              </p>

            </div>

            {/* ERROR */}

            {error && (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
              >
                {error}
              </div>
            )}

            {/* ROLE SELECTION */}

            <div className="mb-6">

              <p className="mb-3 text-sm font-semibold text-[#26372d]">
                I want to join as
              </p>

              <div className="grid grid-cols-2 gap-3">

                {/* STUDENT */}

                <button
                  type="button"
                  onClick={() => setRole("student")}
                  disabled={loading}
                  aria-pressed={role === "student"}
                  className={`rounded-xl border-2 p-4 text-left transition ${
                    role === "student"
                      ? "border-[#075c3d] bg-[#eaf4ed]"
                      : "border-[#e5ebe5] bg-white hover:border-[#a9cbb6]"
                  }`}
                >

                  <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${
                    role === "student"
                      ? "bg-[#075c3d] text-white"
                      : "bg-[#f1f5f1] text-[#63736d]"
                  }`}>
                    <GraduationCap size={22} />
                  </div>

                  <p className="font-bold text-[#14251c]">
                    Student
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Find qualified tutors
                  </p>

                </button>

                {/* TUTOR */}

                <button
                  type="button"
                  onClick={() => setRole("tutor")}
                  disabled={loading}
                  aria-pressed={role === "tutor"}
                  className={`rounded-xl border-2 p-4 text-left transition ${
                    role === "tutor"
                      ? "border-[#075c3d] bg-[#eaf4ed]"
                      : "border-[#e5ebe5] bg-white hover:border-[#a9cbb6]"
                  }`}
                >

                  <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${
                    role === "tutor"
                      ? "bg-[#075c3d] text-white"
                      : "bg-[#f1f5f1] text-[#63736d]"
                  }`}>
                    <UserRound size={22} />
                  </div>

                  <p className="font-bold text-[#14251c]">
                    Tutor
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Teach and connect
                  </p>

                </button>

              </div>

            </div>

            {/* REGISTRATION FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* FULL NAME */}

              <div>

                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-[#26372d]"
                >
                  Full Name
                </label>

                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  disabled={loading}
                  className="h-13 w-full rounded-xl border border-[#dfe7df] bg-[#fafcf9] px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#075c3d] focus:ring-4 focus:ring-[#075c3d]/10 disabled:opacity-60"
                />

              </div>

              {/* EMAIL */}

              <div>

                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-[#26372d]"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="h-13 w-full rounded-xl border border-[#dfe7df] bg-[#fafcf9] px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#075c3d] focus:ring-4 focus:ring-[#075c3d]/10 disabled:opacity-60"
                />

              </div>

              {/* PASSWORD */}

              <div>

                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-[#26372d]"
                >
                  Password
                </label>

                <div className="relative">

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={loading}
                    className="h-13 w-full rounded-xl border border-[#dfe7df] bg-[#fafcf9] px-4 py-3 pr-12 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#075c3d] focus:ring-4 focus:ring-[#075c3d]/10 disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-[#075c3d]"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>

                </div>

                <p className="mt-2 text-xs text-gray-400">
                  Password must contain at least 6 characters.
                </p>

              </div>

              {/* SUBMIT BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#075c3d] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#075c3d]/15 transition hover:bg-[#064b32] disabled:cursor-not-allowed disabled:opacity-70"
              >

                {loading ? (
                  <>
                    <Loader2
                      size={19}
                      className="animate-spin"
                    />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={18} />
                  </>
                )}

              </button>

            </form>

            {/* DIVIDER */}

            <div className="my-6 flex items-center gap-4">

              <div className="h-px flex-1 bg-[#e5e0d7]" />

              <span className="text-xs font-semibold tracking-wider text-gray-400">
                OR SIGN UP WITH
              </span>

              <div className="h-px flex-1 bg-[#e5e0d7]" />

            </div>

            {/* GOOGLE SIGN UP */}

            <GoogleAuthButton
              role={role}
              text="signup_with"
            />

            {/* SIGN IN LINK */}

            <div className="mt-8 text-center">

              <p className="text-sm text-gray-500">
                Already have an account?{" "}

                <Link
                  href="/sign-in"
                  className="font-bold text-[#075c3d] transition hover:text-[#06452e]"
                >
                  Sign In
                </Link>
              </p>

            </div>

            {/* FOOTER */}

            <div className="mt-8 border-t border-[#edf0ed] pt-6 text-center">

              <Link
                href="/"
                className="text-xs font-medium text-gray-400 transition hover:text-[#075c3d]"
              >
                ← Back to Homepage
              </Link>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}
