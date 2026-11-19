
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Users,
  PlusCircle,
  LogOut,
  UserRound,
  ArrowRight,
  TrendingUp,
  ClipboardList,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Crown,
  Menu,
  X,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

interface UserData {
  userId?: string;
  name: string;
  email: string;
  role: string;
  plan?: string;
}

interface TutorStats {
  totalTuitions: number;
  activeApprovedTuitions: number;
  totalApplicants: number;
  plan: string;
}

const initialStats: TutorStats = {
  totalTuitions: 0,
  activeApprovedTuitions: 0,
  totalApplicants: 0,
  plan: "free",
};

export default function TutorDashboard() {
  const router = useRouter();

  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState("");
  const [stats, setStats] = useState<TutorStats>(initialStats);

  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  // ==========================================
  // AUTHENTICATION
  // ==========================================

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("mentorlagbe_token");
    localStorage.removeItem("mentorlagbe_user");

    toast.success("Logged out successfully");

    router.replace("/sign-in");
  }, [router]);

  useEffect(() => {
    const storedToken =
      localStorage.getItem("token") ||
      localStorage.getItem("mentorlagbe_token");

    const storedUser =
      localStorage.getItem("user") ||
      localStorage.getItem("mentorlagbe_user");

    if (!storedToken || !storedUser) {
      router.replace("/sign-in");
      return;
    }

    try {
      const parsedUser: UserData = JSON.parse(storedUser);

      if (
        String(parsedUser.role).toLowerCase() !== "tutor"
      ) {
        router.replace("/");
        return;
      }

      setUser(parsedUser);
      setToken(storedToken);
      setLoading(false);
    } catch {
      logout();
    }
  }, [router, logout]);

  // ==========================================
  // FETCH TUTOR STATISTICS
  // ==========================================

  const fetchStats = useCallback(async () => {
    if (!token) return;

    setStatsLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/tutor/stats`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load statistics"
        );
      }

      setStats({
        totalTuitions: result.data.totalTuitions || 0,
        activeApprovedTuitions:
          result.data.activeApprovedTuitions || 0,
        totalApplicants: result.data.totalApplicants || 0,
        plan: result.data.plan || "free",
      });
    } catch (error) {
      toast.error("Failed to load dashboard statistics", {
        description:
          error instanceof Error
            ? error.message
            : "Please try again.",
      });
    } finally {
      setStatsLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    if (token) {
      fetchStats();
    }
  }, [token, fetchStats]);

  // ==========================================
  // NAVIGATION
  // ==========================================

  const navigate = (path: string) => {
    setMobileMenu(false);
    router.push(path);
  };

  // ==========================================
  // LOADING SCREEN
  // ==========================================

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f8f5]">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#075c3b] text-white">
            <GraduationCap size={30} />
          </div>

          <Loader2
            size={25}
            className="animate-spin text-[#075c3b]"
          />

          <p className="text-sm font-medium text-[#718078]">
            Preparing your dashboard...
          </p>
        </div>
      </main>
    );
  }

  // ==========================================
  // MAIN DASHBOARD
  // ==========================================

  return (
    <main className="min-h-screen bg-[#f5f8f5]">

      {/* ====================================== */}
      {/* TOP NAVBAR */}
      {/* ====================================== */}

      <header className="sticky top-0 z-40 border-b border-[#e4ebe4] bg-white/95 backdrop-blur-xl">

        <div className="mx-auto flex h-[76px] max-w-[1500px] items-center justify-between px-5 md:px-8">

          {/* LOGO */}

          <button
            onClick={() => navigate("/dashboard/tutor")}
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#075c3b] text-white shadow-sm">
              <GraduationCap size={26} />
            </div>

            <div className="text-left">
              <h1 className="text-xl font-extrabold tracking-tight text-[#172820]">
                Mentor<span className="text-[#087448]">Lagbe</span>
              </h1>

              <p className="text-[9px] font-bold uppercase tracking-[2px] text-[#9aa79e]">
                Tutor Workspace
              </p>
            </div>
          </button>

          {/* DESKTOP NAV */}

          <div className="hidden items-center gap-5 md:flex">

            <span className="flex items-center gap-2 rounded-full bg-[#eaf4ed] px-4 py-2 text-xs font-bold text-[#075c3b]">
              <span className="h-2 w-2 rounded-full bg-[#168653]" />
              Tutor Account
            </span>

            <div className="h-9 w-px bg-[#e7ece7]" />

            <div className="text-right">
              <p className="text-sm font-extrabold text-[#26372d]">
                {user.name}
              </p>

              <p className="text-[10px] text-[#9aa79e]">
                {user.email}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf3ec] text-[#075c3b]">
              <UserRound size={21} />
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-xl border border-[#e5ebe5] px-4 py-2.5 text-xs font-bold text-[#65766b] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={16} />
              Logout
            </button>

          </div>

          {/* MOBILE MENU BUTTON */}

          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e5ebe5] text-[#34473b] md:hidden"
          >
            {mobileMenu ? <X size={21} /> : <Menu size={21} />}
          </button>

        </div>

        {/* MOBILE MENU */}

        {mobileMenu && (
          <div className="border-t border-[#e5ebe5] bg-white p-5 md:hidden">

            <div className="mb-4">
              <p className="font-bold text-[#26372d]">
                {user.name}
              </p>

              <p className="text-xs text-[#89978e]">
                {user.email}
              </p>
            </div>

            <button
              onClick={() => navigate("/dashboard/tutor/applicants")}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-[#34473b] hover:bg-[#f2f7f2]"
            >
              <Users size={18} />
              Manage Applicants
            </button>

            <button
              onClick={logout}
              className="mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50"
            >
              <LogOut size={18} />
              Logout
            </button>

          </div>
        )}

      </header>

      <div className="mx-auto flex max-w-[1500px]">

        {/* ====================================== */}
        {/* SIDEBAR */}
        {/* ====================================== */}

        <aside className="hidden min-h-[calc(100vh-76px)] w-[255px] shrink-0 border-r border-[#e5ebe5] bg-white p-6 lg:block">

          <p className="mb-5 px-3 text-[10px] font-extrabold uppercase tracking-[2px] text-[#a1ada4]">
            Workspace
          </p>

          <nav className="space-y-2">

            <button
              onClick={() => navigate("/dashboard/tutor")}
              className="flex w-full items-center gap-3 rounded-xl bg-[#eaf3ec] px-4 py-3.5 text-sm font-extrabold text-[#075c3b]"
            >
              <LayoutDashboard size={19} />
              Dashboard
            </button>

            <button
              onClick={() => navigate("/tutor/dashboard")}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold text-[#718078] transition hover:bg-[#f3f7f3] hover:text-[#075c3b]"
            >
              <PlusCircle size={19} />
              Post a Tuition
            </button>

            <button
              onClick={() => navigate("/dashboard/tutor/tuitions")}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold text-[#718078] transition hover:bg-[#f3f7f3] hover:text-[#075c3b]"
            >
              <BookOpen size={19} />
              My Tuitions
            </button>

            <button
              onClick={() => navigate("/dashboard/tutor/applicants")}
              className="flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-sm font-semibold text-[#718078] transition hover:bg-[#f3f7f3] hover:text-[#075c3b]"
            >
              <span className="flex items-center gap-3">
                <Users size={19} />
                Applicants
              </span>

              {stats.totalApplicants > 0 && (
                <span className="rounded-full bg-[#eaf3ec] px-2.5 py-1 text-[10px] font-extrabold text-[#075c3b]">
                  {stats.totalApplicants}
                </span>
              )}
            </button>

          </nav>

          {/* SIDEBAR PLAN CARD */}

          <div className="mt-12 rounded-2xl border border-[#e4ebe4] bg-[#f7faf7] p-5">

            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f1e9] text-[#087448]">
              <Crown size={20} />
            </div>

            <p className="text-xs font-extrabold text-[#26372d]">
              Your Current Plan
            </p>

            <p className="mt-2 text-lg font-extrabold capitalize text-[#075c3b]">
              {stats.plan}
            </p>

            <p className="mt-2 text-[11px] leading-5 text-[#89978e]">
              Manage your tutoring activities and grow your student network.
            </p>

          </div>

          {/* SIDEBAR FOOTER */}

          <div className="mt-12 border-t border-[#e9eee9] pt-5">
            <p className="text-[10px] font-medium leading-6 text-[#a1ada4]">
              © 2026 MentorLagbe.
              <br />
              Empowering education through connections.
            </p>
          </div>

        </aside>

        {/* ====================================== */}
        {/* MAIN CONTENT */}
        {/* ====================================== */}

        <section className="min-w-0 flex-1 px-5 py-8 md:px-8 md:py-10">

          {/* WELCOME SECTION */}

          <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

            <div>

              <div className="mb-3 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[2.5px] text-[#087448]">
                <LayoutDashboard size={15} />
                Tutor Dashboard
              </div>

              <h2 className="text-3xl font-extrabold tracking-tight text-[#172820] md:text-4xl">
                Welcome back, {user.name.split(" ")[0]}!
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-7 text-[#89978e]">
                Manage your tuition listings, track student
                applications and build your teaching journey.
              </p>

            </div>

            <button
              onClick={fetchStats}
              disabled={statsLoading}
              className="flex items-center justify-center gap-2 rounded-xl border border-[#dfe8e0] bg-white px-5 py-3 text-xs font-bold text-[#53675c] shadow-sm transition hover:border-[#087448] hover:text-[#075c3b] disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={statsLoading ? "animate-spin" : ""}
              />
              Refresh Statistics
            </button>

          </div>

          {/* ================================== */}
          {/* STATISTICS */}
          {/* ================================== */}

          <div className="mb-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">

            {/* TOTAL TUITION */}

            <div className="rounded-[22px] border border-[#e3ebe4] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

              <div className="flex items-center justify-between">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eaf3ec] text-[#087448]">
                  <BookOpen size={24} />
                </div>

                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#9aa79e]">
                  All Listings
                </span>

              </div>

              <p className="mt-6 text-4xl font-extrabold text-[#172820]">
                {stats.totalTuitions}
              </p>

              <p className="mt-2 text-xs font-semibold text-[#89978e]">
                Total Tuition Posts
              </p>

              <button
                onClick={() => navigate("/dashboard/tutor/tuitions")}
                className="mt-5 flex items-center gap-2 text-xs font-bold text-[#087448] hover:underline"
              >
                View My Tuitions
                <ArrowRight size={15} />
              </button>

            </div>

            {/* ACTIVE TUITION */}

            <div className="rounded-[22px] border border-[#e3ebe4] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

              <div className="flex items-center justify-between">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <CheckCircle2 size={24} />
                </div>

                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                  Approved
                </span>

              </div>

              <p className="mt-6 text-4xl font-extrabold text-[#172820]">
                {stats.activeApprovedTuitions}
              </p>

              <p className="mt-2 text-xs font-semibold text-[#89978e]">
                Active Tuition Listings
              </p>

              <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                <TrendingUp size={15} />
                Approved and accepting applications
              </div>

            </div>

            {/* APPLICANTS */}

            <div className="rounded-[22px] border border-[#e3ebe4] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

              <div className="flex items-center justify-between">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                  <Users size={24} />
                </div>

                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">
                  Students
                </span>

              </div>

              <p className="mt-6 text-4xl font-extrabold text-[#172820]">
                {stats.totalApplicants}
              </p>

              <p className="mt-2 text-xs font-semibold text-[#89978e]">
                Total Applications Received
              </p>

              <button
                onClick={() => navigate("/dashboard/tutor/applicants")}
                className="mt-5 flex items-center gap-2 text-xs font-bold text-[#087448] hover:underline"
              >
                View Applicants
                <ArrowRight size={15} />
              </button>

            </div>

          </div>

          {/* ================================== */}
          {/* QUICK ACTIONS */}
          {/* ================================== */}

          <div className="mb-7">

            <div className="mb-5">

              <h3 className="text-xl font-extrabold text-[#172820]">
                Quick Actions
              </h3>

              <p className="mt-1 text-xs text-[#89978e]">
                Everything you need to manage your tutoring activities.
              </p>

            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

              {/* POST TUITION */}

              <button
                onClick={() => navigate("/tutor/dashboard")}
                className="group rounded-[22px] border border-[#e3ebe4] bg-white p-6 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#b8d7c1] hover:shadow-lg"
              >

                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#eaf3ec] text-[#087448] transition group-hover:bg-[#075c3b] group-hover:text-white">
                  <PlusCircle size={24} />
                </div>

                <h4 className="text-base font-extrabold text-[#26372d]">
                  Post New Tuition
                </h4>

                <p className="mt-2 text-xs leading-6 text-[#89978e]">
                  Create a new tuition listing and connect with students looking for tutors.
                </p>

                <span className="mt-5 flex items-center gap-2 text-xs font-extrabold text-[#087448]">
                  Create Listing
                  <ArrowRight
                    size={16}
                    className="transition group-hover:translate-x-1"
                  />
                </span>

              </button>

              {/* MY TUITIONS */}

              <button
                onClick={() => navigate("/dashboard/tutor/tuitions")}
                className="group rounded-[22px] border border-[#e3ebe4] bg-white p-6 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#b8d7c1] hover:shadow-lg"
              >

                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#eaf3ec] text-[#087448] transition group-hover:bg-[#075c3b] group-hover:text-white">
                  <BookOpen size={24} />
                </div>

                <h4 className="text-base font-extrabold text-[#26372d]">
                  My Tuitions
                </h4>

                <p className="mt-2 text-xs leading-6 text-[#89978e]">
                  View, manage and track all your submitted tuition listings.
                </p>

                <span className="mt-5 flex items-center gap-2 text-xs font-extrabold text-[#087448]">
                  Manage Tuitions
                  <ArrowRight
                    size={16}
                    className="transition group-hover:translate-x-1"
                  />
                </span>

              </button>

              {/* APPLICANTS */}

              <button
                onClick={() => navigate("/dashboard/tutor/applicants")}
                className="group rounded-[22px] border border-[#e3ebe4] bg-white p-6 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#b8d7c1] hover:shadow-lg"
              >

                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-700 transition group-hover:bg-amber-600 group-hover:text-white">
                  <Users size={24} />
                </div>

                <h4 className="text-base font-extrabold text-[#26372d]">
                  Manage Applicants
                </h4>

                <p className="mt-2 text-xs leading-6 text-[#89978e]">
                  Review student applications and accept or reject requests.
                </p>

                <span className="mt-5 flex items-center gap-2 text-xs font-extrabold text-[#087448]">
                  View Applications
                  <ArrowRight
                    size={16}
                    className="transition group-hover:translate-x-1"
                  />
                </span>

              </button>

            </div>

          </div>

          {/* ================================== */}
          {/* BOTTOM INFORMATION */}
          {/* ================================== */}

          <div className="mt-10 overflow-hidden rounded-[24px] bg-[#075c3b] p-7 text-white md:p-9">

            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

              <div className="max-w-xl">

                <div className="mb-3 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[2px] text-[#b8e0c5]">
                  <GraduationCap size={17} />
                  Grow with MentorLagbe
                </div>

                <h3 className="text-2xl font-extrabold leading-tight">
                  Make a Difference Through Teaching.
                </h3>

                <p className="mt-3 text-sm leading-7 text-white/70">
                  Create meaningful learning opportunities,
                  connect with students and grow your tutoring career.
                </p>

              </div>

              <button
                onClick={() => navigate("/tutor/dashboard")}
                className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-xs font-extrabold text-[#075c3b] transition hover:bg-[#eaf3ec]"
              >
                Post a Tuition
                <ArrowRight size={17} />
              </button>

            </div>

          </div>

          {/* FOOTER */}

          <footer className="mt-10 border-t border-[#e3ebe4] py-6 text-center">
            <p className="text-[11px] font-medium text-[#9aa79e]">
              © 2026 MentorLagbe. All rights reserved.
            </p>
          </footer>

        </section>

      </div>

    </main>
  );
}
