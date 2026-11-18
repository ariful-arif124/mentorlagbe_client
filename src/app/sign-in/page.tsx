
"use client";

import { toast } from "sonner";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Eye,
    EyeOff,
    GraduationCap,
    ArrowRight,
    Loader2,
    ShieldCheck,
    BookOpen,
    Users,
} from "lucide-react";

const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000/api";

type User = {
    userId?: string;
    name: string;
    email: string;
    role: string;
    plan?: string;
};

export default function SignInPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setError("");

        if (!email.trim() || !password) {
            setError("Please enter your email and password.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    password,
                }),
            });

            const result = await response.json();

            // Handle unsuccessful login

            if (!response.ok || !result.success) {
                if (result.code === "ACCOUNT_DEACTIVATED") {
                    toast.error("Account Deactivated", {
                        description: result.message,
                        duration: 5000,
                    });
                } else {
                    setError(
                        result.message || "Invalid email or password."
                    );
                }

                return;
            }

            const token: string | undefined = result.data?.token;
            const loggedInUser: User | undefined = result.data?.user;

            if (!token || !loggedInUser) {
                throw new Error(
                    "Invalid login response from server. Please try again."
                );
            }

            const role = loggedInUser.role?.toLowerCase();

            // Determine dashboard according to user role
            let dashboard = "";

            switch (role) {
                case "admin":
                    dashboard = "/dashboard/admin";
                    break;

                case "tutor":
                    dashboard = "/dashboard/tutor";
                    break;

                case "student":
                    dashboard = "/student/dashboard";
                    break;

                default:
                    throw new Error(
                        "Your account has an unrecognized role. Please contact support."
                    );
            }

            // Save authentication data
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(loggedInUser));

            localStorage.setItem("mentorlagbe_token", token);
            localStorage.setItem(
                "mentorlagbe_user",
                JSON.stringify(loggedInUser)
            );

            // Redirect to the correct dashboard
            router.replace(dashboard);

        } catch (err) {
            console.error("Login error:", err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong. Please try again."
            );

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
                                Welcome Back
                            </p>

                            <h1 className="max-w-md text-5xl font-extrabold leading-tight tracking-tight">
                                Your journey to better education starts here.
                            </h1>

                            <p className="mt-6 max-w-md text-base leading-8 text-emerald-100">
                                Connect with talented tutors, discover learning
                                opportunities, and make education more accessible
                                with MentorLagbe.
                            </p>

                        </div>

                    </div>

                    {/* Features */}
                    <div className="relative z-10 mt-16 space-y-5">

                        <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                                <BookOpen size={21} />
                            </div>

                            <div>
                                <p className="font-semibold">
                                    Quality Learning
                                </p>

                                <p className="text-sm text-emerald-200">
                                    Find the right learning opportunities.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                                <Users size={21} />
                            </div>

                            <div>
                                <p className="font-semibold">
                                    Trusted Community
                                </p>

                                <p className="text-sm text-emerald-200">
                                    Connect with students and tutors.
                                </p>
                            </div>
                        </div>

                        <p className="pt-8 text-xs text-emerald-200">
                            © 2026 MentorLagbe. All rights reserved.
                        </p>

                    </div>

                </section>

                {/* RIGHT LOGIN SECTION */}
                <section className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-14">

                    {/* Mobile Logo */}
                    <Link href="/" className="mb-10 flex items-center gap-3 lg:hidden">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#075c3d] text-white">
                            <GraduationCap size={25} />
                        </div>

                        <span className="text-xl font-extrabold text-[#075c3d]">
                            MentorLagbe
                        </span>

                    </Link>

                    <div className="mx-auto w-full max-w-md">

                        {/* Heading */}
                        <div className="mb-9">

                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#eaf4ed] text-[#075c3d]">
                                <ShieldCheck size={25} />
                            </div>

                            <h2 className="text-3xl font-extrabold tracking-tight text-[#14251c]">
                                Welcome Back!
                            </h2>

                            <p className="mt-3 text-sm leading-6 text-gray-500">
                                Sign in to your MentorLagbe account and continue
                                your learning journey.
                            </p>

                        </div>

                        {/* Error Message */}
                        {error && (
                            <div
                                role="alert"
                                className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                            >
                                {error}
                            </div>
                        )}

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Email */}
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

                            {/* Password */}
                            <div>

                                <div className="mb-2 flex items-center justify-between">

                                    <label
                                        htmlFor="password"
                                        className="text-sm font-semibold text-[#26372d]"
                                    >
                                        Password
                                    </label>

                                </div>

                                <div className="relative">

                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
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

                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#075c3d] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#075c3d]/15 transition hover:bg-[#064b32] disabled:cursor-not-allowed disabled:opacity-70"
                            >

                                {loading ? (
                                    <>
                                        <Loader2 size={19} className="animate-spin" />
                                        Signing In...
                                    </>
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight size={18} />
                                    </>
                                )}

                            </button>

                        </form>

                        {/* Register */}
                        <div className="mt-8 text-center">

                            <p className="text-sm text-gray-500">
                                Don't have an account?{" "}

                                <Link
                                    href="/sign-up"
                                    className="font-bold text-[#075c3d] transition hover:text-[#06452e]"
                                >
                                    Create Account
                                </Link>
                            </p>

                        </div>

                        {/* Footer */}
                        <div className="mt-10 border-t border-[#edf0ed] pt-6 text-center">

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
