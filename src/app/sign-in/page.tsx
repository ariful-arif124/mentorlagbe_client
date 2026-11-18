"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ArrowRight,
    Eye,
    EyeOff,
    GraduationCap,
    LockKeyhole,
    Mail,
} from "lucide-react";

interface LoginResponse {
    success: boolean;
    message: string;
    data?: {
        token: string;
        user: {
            userId: string;
            name: string;
            email: string;
            role: string;
            plan: string;
        };
    };
}

export default function SignInPage() {
    const router = useRouter();

    const [email, setEmail] = useState("student@test.com");
    const [password, setPassword] = useState("123456");

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    /*
     * Backend:
     * http://localhost:5000/api/auth/login
     *
     * This logic works whether .env.local contains:
     *
     * NEXT_PUBLIC_API_URL=http://localhost:5000
     *
     * OR:
     *
     * NEXT_PUBLIC_API_URL=http://localhost:5000/api
     */

    const getApiBaseUrl = () => {
        const configuredUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

        return configuredUrl
            .replace(/\/+$/, "")
            .replace(/\/api$/, "");
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const apiBaseUrl = getApiBaseUrl();

            const loginUrl = `${apiBaseUrl}/api/auth/login`;

            console.log("LOGIN URL:", loginUrl);

            const response = await fetch(loginUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    password,
                }),
            });

            console.log("LOGIN STATUS:", response.status);
            console.log(
                "LOGIN CONTENT TYPE:",
                response.headers.get("content-type")
            );

            const responseText = await response.text();

            console.log("LOGIN RAW RESPONSE:", responseText);

            let result: LoginResponse;

            try {
                result = JSON.parse(responseText);
            } catch {
                console.error("LOGIN RAW RESPONSE:", responseText);

                if (responseText.includes("Cannot POST")) {
                    throw new Error(
                        "Login API route was not found. Make sure the backend is running and the URL is /api/auth/login."
                    );
                }

                throw new Error(
                    "Server returned an invalid response. Please check the API URL."
                );
            }

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || `Login failed with status ${response.status}`
                );
            }

            if (!result.data?.token || !result.data?.user) {
                throw new Error("Login succeeded but user data was missing.");
            }

            console.log("LOGIN SUCCESS:", result);

            /*
             * Save authentication information.
             */
            localStorage.setItem("token", result.data.token);
            localStorage.setItem(
                "user",
                JSON.stringify(result.data.user)
            );

            /*
             * Redirect after successful login.
             *
             * Change this later if you create a dedicated dashboard route.
             */
            const userRole = result.data.user.role;

            if (userRole === "student") {
                router.push("/student/dashboard");
            } else if (userRole === "tutor") {
                router.push("/tutor/dashboard");
            } else {
                router.push("/");
            }

            router.refresh();
        } catch (err) {
            console.error("LOGIN ERROR:", err);

            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Something went wrong during login.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#faf8f3] px-6 py-10">
            <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-6xl items-center justify-center">
                <div className="w-full max-w-[560px]">
                    {/* Logo */}
                    <div className="mb-7 flex justify-center">
                        <Link
                            href="/"
                            className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-[#075c3b] shadow-lg transition hover:scale-105"
                        >
                            <GraduationCap
                                size={34}
                                strokeWidth={2.2}
                                className="text-white"
                            />
                        </Link>
                    </div>

                    {/* Heading */}
                    <div className="mb-10 text-center">
                        <h1 className="text-[38px] font-bold tracking-tight text-[#071b16]">
                            Welcome Back
                        </h1>

                        <p className="mt-2 text-[18px] text-[#63736d]">
                            Sign in to your MentorLagbe account
                        </p>
                    </div>

                    {/* Card */}
                    <div className="rounded-[28px] border border-[#e5e0d7] bg-white p-10 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
                        {/* Error */}
                        {error && (
                            <div className="mb-7 rounded-[18px] border border-red-200 bg-red-50 px-5 py-4">
                                <p className="text-[16px] font-medium leading-6 text-red-600">
                                    {error}
                                </p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-7">
                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-3 block text-[17px] font-semibold text-[#10201b]"
                                >
                                    Email Address
                                </label>

                                <div className="relative">
                                    <Mail
                                        size={23}
                                        strokeWidth={1.8}
                                        className="absolute left-5 top-1/2 -translate-y-1/2 text-[#6c7c75]"
                                    />

                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        value={email}
                                        onChange={(event) =>
                                            setEmail(event.target.value)
                                        }
                                        placeholder="Enter your email"
                                        required
                                        className="h-[58px] w-full rounded-[18px] border border-[#e1ddd5] bg-[#fbfaf7] pl-[58px] pr-5 text-[17px] text-[#10201b] outline-none transition placeholder:text-[#9b9f9b] focus:border-[#126744] focus:ring-2 focus:ring-[#126744]/10"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label
                                    htmlFor="password"
                                    className="mb-3 block text-[17px] font-semibold text-[#10201b]"
                                >
                                    Password
                                </label>

                                <div className="relative">
                                    <LockKeyhole
                                        size={23}
                                        strokeWidth={1.8}
                                        className="absolute left-5 top-1/2 -translate-y-1/2 text-[#6c7c75]"
                                    />

                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={(event) =>
                                            setPassword(event.target.value)
                                        }
                                        placeholder="Enter your password"
                                        required
                                        className="h-[58px] w-full rounded-[18px] border border-[#e1ddd5] bg-[#fbfaf7] pl-[58px] pr-[58px] text-[17px] text-[#10201b] outline-none transition placeholder:text-[#9b9f9b] focus:border-[#126744] focus:ring-2 focus:ring-[#126744]/10"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword((previous) => !previous)
                                        }
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-[#66766f] transition hover:text-[#075c3b]"
                                    >
                                        {showPassword ? (
                                            <EyeOff size={23} />
                                        ) : (
                                            <Eye size={23} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex h-[60px] w-full items-center justify-center gap-3 rounded-[18px] bg-[#075c3b] text-[18px] font-bold text-white transition hover:bg-[#064d32] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? (
                                    <>
                                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                        Signing In...
                                    </>
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight size={23} />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="my-7 h-px bg-[#e5e0d7]" />

                        {/* Register */}
                        <div className="text-center">
                            <p className="text-[17px] text-[#63736d]">
                                New to MentorLagbe?
                            </p>

                            <Link
                                href="/sign-up"
                                className="mt-2 inline-block text-[17px] font-semibold text-[#075c3b] transition hover:text-[#043f29]"
                            >
                                Explore MentorLagbe
                            </Link>
                        </div>
                    </div>

                    {/* Back to home */}
                    <div className="mt-7 text-center">
                        <Link
                            href="/"
                            className="text-[15px] text-[#63736d] transition hover:text-[#075c3b]"
                        >
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}