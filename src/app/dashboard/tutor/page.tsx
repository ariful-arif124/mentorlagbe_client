"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

type User = {
  userId?: string;
  name?: string;
  email?: string;
  role?: string;
  plan?: string;
};

type TutorStats = {
  totalTuitions: number;
  activeApprovedTuitions: number;
  totalApplicants: number;
  plan: string;
};

export default function TutorDashboard() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);

  const [stats, setStats] = useState<TutorStats>({
    totalTuitions: 0,
    activeApprovedTuitions: 0,
    totalApplicants: 0,
    plan: "free",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        /*
          Your project has used both:
          token/user
          and
          mentorlagbe_token/mentorlagbe_user

          So we support both.
        */

        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("mentorlagbe_token");

        const storedUser =
          localStorage.getItem("user") ||
          localStorage.getItem("mentorlagbe_user");

        if (!token || !storedUser) {
          router.replace("/sign-in");
          return;
        }

        let parsedUser: User;

        try {
          parsedUser = JSON.parse(storedUser);
        } catch {
          localStorage.removeItem("user");
          localStorage.removeItem("mentorlagbe_user");

          router.replace("/sign-in");
          return;
        }

        if (parsedUser.role !== "tutor") {
          router.replace("/");
          return;
        }

        setUser(parsedUser);

        const response = await fetch(
          `${API_URL}/tutor/stats`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("mentorlagbe_token");
            localStorage.removeItem("mentorlagbe_user");

            router.replace("/sign-in");
            return;
          }

          throw new Error(
            result?.message ||
              "Failed to load tutor dashboard"
          );
        }

        setStats({
          totalTuitions:
            result?.data?.totalTuitions ?? 0,

          activeApprovedTuitions:
            result?.data?.activeApprovedTuitions ?? 0,

          totalApplicants:
            result?.data?.totalApplicants ?? 0,

          plan:
            result?.data?.plan ||
            parsedUser.plan ||
            "free",
        });
      } catch (error) {
        console.error(
          "Tutor dashboard error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    localStorage.removeItem("mentorlagbe_token");
    localStorage.removeItem("mentorlagbe_user");

    router.replace("/sign-in");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fbf8f3] px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-48 rounded bg-gray-200" />
            <div className="h-14 w-96 rounded bg-gray-200" />

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-40 rounded-2xl bg-gray-200"
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fbf8f3]">
      {/* Dashboard Header */}
      <header className="border-b border-[#e5e0d8] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0f5132] text-2xl text-white shadow-sm">
              🎓
            </div>

            <span className="text-2xl font-bold tracking-tight text-[#14201b]">
              Mentor<span className="text-[#0f5132]">Lagbe</span>
            </span>
          </button>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-[#14201b]">
                {user?.name || "Tutor"}
              </p>

              <p className="text-xs capitalize text-[#5b6b64]">
                {user?.role || "tutor"}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-xl border border-[#d9ddd9] px-4 py-2 text-sm font-semibold text-[#5b6b64] transition hover:border-[#0f5132] hover:text-[#0f5132]"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        {/* Welcome */}
        <div className="mb-10">
          <p className="mb-3 text-sm font-bold uppercase tracking-wide text-[#0f5132]">
            Tutor Dashboard
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-[#14201b] md:text-5xl">
            Welcome, {user?.name || "Tutor"} 👋
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-[#5b6b64]">
            Manage your tuition posts, review applicants,
            and grow your tutoring journey with MentorLagbe.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {/* Total Tuitions */}
          <div className="rounded-2xl border border-[#e4dfd7] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8f2ed] text-2xl">
              📚
            </div>

            <p className="text-sm font-semibold text-[#5b6b64]">
              Total Tuitions Posted
            </p>

            <p className="mt-2 text-4xl font-bold text-[#14201b]">
              {stats.totalTuitions}
            </p>

            <p className="mt-2 text-sm text-[#7a8781]">
              All tuition listings created by you
            </p>
          </div>

          {/* Active / Approved */}
          <div className="rounded-2xl border border-[#e4dfd7] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8f2ed] text-2xl">
              ✅
            </div>

            <p className="text-sm font-semibold text-[#5b6b64]">
              Active / Approved
            </p>

            <p className="mt-2 text-4xl font-bold text-[#14201b]">
              {stats.activeApprovedTuitions}
            </p>

            <p className="mt-2 text-sm text-[#7a8781]">
              Approved and currently active
            </p>
          </div>

          {/* Applicants */}
          <div className="rounded-2xl border border-[#e4dfd7] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8f2ed] text-2xl">
              👥
            </div>

            <p className="text-sm font-semibold text-[#5b6b64]">
              Applicants Received
            </p>

            <p className="mt-2 text-4xl font-bold text-[#14201b]">
              {stats.totalApplicants}
            </p>

            <p className="mt-2 text-sm text-[#7a8781]">
              Students who applied to your tuitions
            </p>
          </div>

          {/* Plan */}
          <div className="rounded-2xl border border-[#e4dfd7] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#fff3d8] text-2xl">
              ⭐
            </div>

            <p className="text-sm font-semibold text-[#5b6b64]">
              Current Plan
            </p>

            <p className="mt-2 text-4xl font-bold capitalize text-[#14201b]">
              {stats.plan}
            </p>

            <p className="mt-2 text-sm text-[#7a8781]">
              {stats.plan.toLowerCase() === "pro"
                ? "Unlimited tuition posting"
                : "Up to 2 tuition posts"}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <button
            onClick={() =>
              router.push("/dashboard/tutor/post-tuition")
            }
            className="rounded-2xl border border-[#e4dfd7] bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-[#0f5132] hover:shadow-md"
          >
            <div className="mb-4 text-2xl">➕</div>

            <h2 className="text-xl font-bold text-[#14201b]">
              Post a Tuition
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#5b6b64]">
              Create a new tuition listing and reach
              potential students.
            </p>

            <span className="mt-5 inline-block font-semibold text-[#0f5132]">
              Post Tuition →
            </span>
          </button>

          <button
            onClick={() =>
              router.push("/dashboard/tutor/my-tuitions")
            }
            className="rounded-2xl border border-[#e4dfd7] bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-[#0f5132] hover:shadow-md"
          >
            <div className="mb-4 text-2xl">📋</div>

            <h2 className="text-xl font-bold text-[#14201b]">
              My Tuitions
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#5b6b64]">
              View, edit, manage, and monitor your
              tuition listings.
            </p>

            <span className="mt-5 inline-block font-semibold text-[#0f5132]">
              View Tuitions →
            </span>
          </button>

          <button
            onClick={() =>
              router.push("/dashboard/tutor/applicants")
            }
            className="rounded-2xl border border-[#e4dfd7] bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-[#0f5132] hover:shadow-md"
          >
            <div className="mb-4 text-2xl">👥</div>

            <h2 className="text-xl font-bold text-[#14201b]">
              Applicants
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#5b6b64]">
              Review students who applied to your
              tuition posts.
            </p>

            <span className="mt-5 inline-block font-semibold text-[#0f5132]">
              View Applicants →
            </span>
          </button>
        </div>
      </section>
    </main>
  );
}