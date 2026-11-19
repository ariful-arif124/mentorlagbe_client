
"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Plus,
  Users,
  UserRound,
  Home,
  Wallet,
  Menu,
  X,
  LogOut,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  BarChart3,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  CreditCard,
} from "lucide-react";

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

const navItems = [
  {
    label: "Overview",
    href: "/dashboard/tutor",
    icon: LayoutDashboard,
  },
  {
    label: "Post a Tuition",
    href: "/dashboard/tutor/post-tuition",
    icon: Plus,
  },
  {
    label: "My Tuitions",
    href: "/dashboard/tutor/my-tuitions",
    icon: BookOpen,
  },
  {
    label: "Applicants",
    href: "/dashboard/tutor/applicants",
    icon: Users,
  },
  {
    label: "My Profile",
    href: "/dashboard/profile",
    icon: UserRound,
  },
];

export default function TutorDashboard() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);

  const [stats, setStats] = useState<TutorStats>({
    totalTuitions: 0,
    activeApprovedTuitions: 0,
    totalApplicants: 0,
    plan: "free",
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ------------------------------------------
  // LOAD TUTOR DASHBOARD
  // ------------------------------------------

  const loadDashboard = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      }

      try {
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
          const parsed = JSON.parse(storedUser);

          if (!parsed || typeof parsed !== "object") {
            throw new Error("Invalid user information");
          }

          parsedUser = parsed;
        } catch {
          router.replace("/sign-in");
          return;
        }

        if (
          String(parsedUser.role || "").toLowerCase() !== "tutor"
        ) {
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
          totalTuitions: Math.max(
            0,
            Number(result?.data?.totalTuitions) || 0
          ),

          activeApprovedTuitions: Math.max(
            0,
            Number(result?.data?.activeApprovedTuitions) || 0
          ),

          totalApplicants: Math.max(
            0,
            Number(result?.data?.totalApplicants) || 0
          ),

          plan:
            result?.data?.plan ||
            parsedUser.plan ||
            "free",
        });

        setError("");
      } catch (err) {
        console.error("Tutor dashboard error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load dashboard"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [router]
  );

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  // ------------------------------------------
  // LOGOUT
  // ------------------------------------------

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("mentorlagbe_token");
    localStorage.removeItem("mentorlagbe_user");

    router.replace("/sign-in");
  };

  // ------------------------------------------
  // DERIVED DATA
  // ------------------------------------------

  const isPro = stats.plan.toLowerCase() === "pro";

  const freePlanLimit = 2;

  const postsUsed = Math.min(
    stats.totalTuitions,
    freePlanLimit
  );

  const usagePercentage = Math.min(
    (stats.totalTuitions / freePlanLimit) * 100,
    100
  );

  const initials = (user?.name || "Tutor")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const firstName =
    user?.name?.trim().split(/\s+/)[0] || "Tutor";

  const planName =
    stats.plan.charAt(0).toUpperCase() +
    stats.plan.slice(1);

  // ------------------------------------------
  // LOADING SCREEN
  // ------------------------------------------

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f8f5] p-6">
        <div className="w-full max-w-5xl animate-pulse space-y-7">
          <div className="h-16 rounded-2xl bg-white shadow-sm" />

          <div className="h-80 rounded-[28px] bg-[#e2ece5]" />

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-40 rounded-2xl bg-white shadow-sm"
              />
            ))}
          </div>

          <div className="h-64 rounded-2xl bg-white shadow-sm" />
        </div>
      </main>
    );
  }

  // ------------------------------------------
  // MAIN DASHBOARD
  // ------------------------------------------

  return (
    <div className="min-h-screen bg-[#f5f8f5] text-[#172820]">

      {/* MOBILE OVERLAY */}

      {mobileMenuOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-[#10271d]/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ================================== */}
      {/* SIDEBAR */}
      {/* ================================== */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex flex-col
          border-r border-[#e6ede7]
          bg-white
          transition-all duration-300
          ${collapsed ? "w-[88px]" : "w-[272px]"}
          ${
            mobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >

        {/* LOGO */}

        <div className="flex h-[86px] shrink-0 items-center justify-between border-b border-[#edf1ed] px-5">

          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-3"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#075c3b] text-white shadow-md shadow-emerald-900/10">
              <GraduationCap size={28} strokeWidth={2.2} />
            </div>

            {!collapsed && (
              <div className="text-left">
                <h2 className="text-[21px] font-extrabold tracking-tight text-[#172820]">
                  Mentor<span className="text-[#087448]">Lagbe</span>
                </h2>

                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[2.5px] text-[#91a39a]">
                  Tutor Portal
                </p>
              </div>
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-lg p-2 text-[#64766d] hover:bg-[#f0f5f1] lg:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* PROFILE */}

        <div className="border-b border-[#edf1ed] p-4">

          <div
            className={`
              flex items-center gap-3 rounded-2xl
              bg-[#f0f6f2] p-3
              ${collapsed ? "justify-center" : ""}
            `}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#dceee3] text-sm font-extrabold text-[#075c3b]">
              {initials}
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[#172820]">
                  {user?.name || "Tutor"}
                </p>

                <p className="truncate text-xs text-[#899991]">
                  {user?.email || "Tutor Account"}
                </p>

                <div className="mt-1.5 flex items-center gap-2">
                  <span className="rounded-full bg-[#dceee3] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#087448]">
                    Tutor
                  </span>

                  <span className="text-[9px] font-bold uppercase text-[#75867c]">
                    {stats.plan}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* NAVIGATION */}

        <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-6">

          {!collapsed && (
            <p className="mb-4 px-3 text-[10px] font-extrabold uppercase tracking-[2.5px] text-[#a0afa6]">
              Workspace
            </p>
          )}

          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (
                item.href !== "/dashboard/tutor" &&
                pathname.startsWith(item.href)
              );

            const ItemIcon = item.icon;

            return (
              <button
                key={item.href}
                title={collapsed ? item.label : ""}
                onClick={() => {
                  router.push(item.href);
                  setMobileMenuOpen(false);
                }}
                aria-current={active ? "page" : undefined}
                className={`
                  group flex w-full items-center gap-3
                  rounded-xl px-3 py-3.5
                  text-sm font-semibold
                  transition-all duration-200
                  ${
                    active
                      ? "bg-[#e9f3ec] text-[#075c3b] shadow-sm"
                      : "text-[#718078] hover:bg-[#f5f8f5] hover:text-[#075c3b]"
                  }
                  ${collapsed ? "justify-center" : ""}
                `}
              >
                <ItemIcon
                  size={21}
                  strokeWidth={active ? 2.4 : 1.8}
                  className="shrink-0"
                />

                {!collapsed && (
                  <>
                    <span>{item.label}</span>

                    {active && (
                      <span className="ml-auto h-2 w-2 rounded-full bg-[#087448]" />
                    )}
                  </>
                )}
              </button>
            );
          })}

          {!collapsed && (
            <>
              <div className="my-6 border-t border-[#edf1ed]" />

              <p className="mb-3 px-3 text-[10px] font-extrabold uppercase tracking-[2.5px] text-[#a0afa6]">
                Explore
              </p>
            </>
          )}

          <button
            onClick={() => router.push("/")}
            title={collapsed ? "Visit Website" : ""}
            className={`
              flex w-full items-center gap-3 rounded-xl
              px-3 py-3.5 text-sm font-semibold
              text-[#718078] transition
              hover:bg-[#f5f8f5] hover:text-[#075c3b]
              ${collapsed ? "justify-center" : ""}
            `}
          >
            <Home size={21} />

            {!collapsed && <span>Visit Website</span>}

            {!collapsed && (
              <ArrowUpRight size={15} className="ml-auto" />
            )}
          </button>

          <button
            onClick={() => router.push("/pricing")}
            title={collapsed ? "Upgrade Plan" : ""}
            className={`
              flex w-full items-center gap-3 rounded-xl
              px-3 py-3.5 text-sm font-semibold
              text-[#718078] transition
              hover:bg-[#f5f8f5] hover:text-[#075c3b]
              ${collapsed ? "justify-center" : ""}
            `}
          >
            <CreditCard size={21} />

            {!collapsed && <span>Upgrade Plan</span>}
          </button>

        </nav>

        {/* SIDEBAR BOTTOM */}

        <div className="shrink-0 border-t border-[#edf1ed] p-4">

          {!collapsed && (
            <div className="mb-4 rounded-2xl bg-[#eff6f1] p-4">

              <div className="mb-3 flex items-center gap-2 text-[#075c3b]">
                <ShieldCheck size={19} />

                <span className="text-xs font-bold">
                  {isPro ? "Pro Membership" : "Free Membership"}
                </span>
              </div>

              <p className="text-xs leading-5 text-[#75867c]">
                {isPro
                  ? "Enjoy unlimited tuition posting with your Pro membership."
                  : "Upgrade your membership to unlock unlimited tuition posts."}
              </p>

              <button
                onClick={() => router.push("/pricing")}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#075c3b] py-2.5 text-xs font-bold text-white transition hover:bg-[#087448]"
              >
                Explore Plans
                <ArrowUpRight size={14} />
              </button>
            </div>
          )}

          <button
            onClick={handleLogout}
            title={collapsed ? "Logout" : ""}
            className={`
              flex w-full items-center gap-3 rounded-xl
              px-3 py-3 text-sm font-bold
              text-red-500 transition
              hover:bg-red-50
              ${collapsed ? "justify-center" : ""}
            `}
          >
            <LogOut size={20} />

            {!collapsed && <span>Logout</span>}
          </button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="mt-3 hidden w-full items-center justify-center gap-2 rounded-lg py-2 text-xs font-medium text-[#93a199] transition hover:bg-[#f5f8f5] hover:text-[#075c3b] lg:flex"
          >
            <Menu size={17} />

            {!collapsed && <span>Collapse Sidebar</span>}
          </button>

        </div>
      </aside>

      {/* ================================== */}
      {/* MAIN CONTENT */}
      {/* ================================== */}

      <div
        className={`
          min-h-screen transition-all duration-300
          ${collapsed ? "lg:pl-[88px]" : "lg:pl-[272px]"}
        `}
      >

        {/* TOP HEADER */}

        <header className="sticky top-0 z-30 flex h-[86px] items-center justify-between border-b border-[#e7ede8] bg-white/95 px-5 backdrop-blur-xl md:px-8">

          <div className="flex items-center gap-4">

            {/* MOBILE MENU */}

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-xl p-2 text-[#53675c] transition hover:bg-[#f0f5f1] lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu size={23} />
            </button>

            {/* DESKTOP COLLAPSE */}

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden rounded-xl p-2 text-[#53675c] transition hover:bg-[#f0f5f1] lg:block"
              aria-label="Toggle sidebar"
            >
              <Menu size={22} />
            </button>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[2px] text-[#9aa99f]">
                Tutor Portal / Overview
              </p>

              <h1 className="mt-1 text-xl font-extrabold tracking-tight text-[#172820]">
                Dashboard
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">

            <button
              onClick={() => router.push("/")}
              className="hidden items-center gap-2 rounded-full border border-[#e2eae3] px-4 py-2.5 text-xs font-bold text-[#596c60] transition hover:border-[#075c3b] hover:text-[#075c3b] sm:flex"
            >
              Visit Website
              <ArrowUpRight size={15} />
            </button>

            <div className="hidden h-9 w-px bg-[#e7ede8] sm:block" />

            <button
              onClick={() => router.push("/dashboard/profile")}
              className="flex items-center gap-3 rounded-xl p-1.5 transition hover:bg-[#f5f8f5]"
            >
              <div className="hidden text-right sm:block">
                <p className="text-xs font-bold text-[#26372d]">
                  {user?.name || "Tutor"}
                </p>

                <p className="mt-0.5 text-[10px] text-[#96a49b]">
                  Tutor Account
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dceee3] text-xs font-extrabold text-[#075c3b]">
                {initials}
              </div>
            </button>
          </div>
        </header>

        {/* ================================== */}
        {/* PAGE CONTENT */}
        {/* ================================== */}

        <main className="mx-auto max-w-[1700px] px-5 py-7 md:px-8 md:py-9 lg:px-10">

          {/* WELCOME HERO */}

          <section className="relative mb-9 overflow-hidden rounded-[28px] bg-[#0a4932] p-7 text-white shadow-xl shadow-[#0a4932]/10 md:p-10 xl:p-12">

            {/* Decorative circles */}

            <div className="pointer-events-none absolute -right-20 -top-40 h-[420px] w-[420px] rounded-full border border-white/10" />

            <div className="pointer-events-none absolute -right-5 -top-28 h-[300px] w-[300px] rounded-full border border-white/10" />

            <div className="pointer-events-none absolute bottom-[-150px] left-[40%] h-[300px] w-[300px] rounded-full bg-[#1c7851]/20 blur-3xl" />

            <div className="relative z-10 flex flex-col justify-between gap-10 xl:flex-row xl:items-center">

              {/* Welcome Text */}

              <div className="max-w-2xl">

                <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2">
                  <Sparkles size={15} className="text-[#f6cc70]" />

                  <span className="text-[10px] font-extrabold uppercase tracking-[2px] text-[#d6eee0]">
                    Your Teaching Workspace
                  </span>
                </div>

                <h2 className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
                  Welcome back,
                  <br />

                  <span className="text-[#a5d7b9]">
                    {firstName}!
                  </span>
                </h2>

                <p className="mt-5 max-w-xl text-sm leading-7 text-[#c3ded0] md:text-base">
                  Your teaching journey starts here. Manage your
                  tuition listings, connect with students, and
                  build meaningful learning experiences with
                  MentorLagbe.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">

                  <button
                    onClick={() =>
                      router.push("/dashboard/tutor/post-tuition")
                    }
                    className="flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-extrabold text-[#075c3b] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#eff7f1]"
                  >
                    <Plus size={18} />
                    Post a Tuition
                    <ArrowUpRight size={16} />
                  </button>

                  <button
                    onClick={() =>
                      router.push("/dashboard/tutor/applicants")
                    }
                    className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/20"
                  >
                    <Users size={18} />
                    View Applicants
                  </button>

                </div>
              </div>

              {/* Membership Card */}

              <div className="w-full max-w-[310px] shrink-0 rounded-[24px] border border-white/15 bg-white/10 p-6 backdrop-blur-md">

                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-[#c6e8d3]">
                  <GraduationCap size={35} />
                </div>

                <p className="text-[10px] font-bold uppercase tracking-[2px] text-[#a5d7b9]">
                  Membership
                </p>

                <h3 className="mt-2 text-3xl font-extrabold">
                  {planName} Plan
                </h3>

                <div className="mt-4 flex items-center gap-2 text-xs font-medium text-[#c4dfd0]">
                  <ShieldCheck size={17} />
                  Your account is active
                </div>

                <button
                  onClick={() => router.push("/pricing")}
                  className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#f5ca70] py-3.5 text-sm font-extrabold text-[#443515] transition hover:bg-[#ffda8d]"
                >
                  {isPro ? "View Membership" : "Explore Pro Plan"}
                  <ArrowUpRight size={16} />
                </button>
              </div>

            </div>
          </section>

          {/* ERROR MESSAGE */}

          {error && (
            <div className="mb-7 flex flex-col justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center">
              <p className="text-sm font-medium text-red-700">
                {error}
              </p>

              <button
                onClick={() => void loadDashboard(true)}
                className="text-sm font-bold text-red-700 underline"
              >
                Try Again
              </button>
            </div>
          )}

          {/* STATISTICS */}

          <section className="mb-9">

            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">

              <div>
                <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[2.5px] text-[#087448]">
                  Your Overview
                </p>

                <h3 className="text-2xl font-extrabold tracking-tight text-[#172820]">
                  Teaching at a glance
                </h3>

                <p className="mt-1.5 text-sm text-[#87968d]">
                  Monitor your tutoring performance and activity.
                </p>
              </div>

              <button
                onClick={() => void loadDashboard(true)}
                disabled={refreshing}
                className="flex items-center gap-2 rounded-full border border-[#dfe8e0] bg-white px-4 py-2.5 text-xs font-bold text-[#53675c] shadow-sm transition hover:border-[#087448] hover:text-[#087448] disabled:opacity-60"
              >
                <RefreshCw
                  size={15}
                  className={refreshing ? "animate-spin" : ""}
                />

                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

              {/* TOTAL TUITION */}

              <div className="group rounded-[22px] border border-[#e3ebe4] bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#075c3b]/5">

                <div className="mb-6 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f3ec] text-[#087448]">
                    <BookOpen size={23} />
                  </div>

                  <span className="rounded-full bg-[#f1f6f2] px-3 py-1 text-[9px] font-bold uppercase tracking-wide text-[#809087]">
                    All Posts
                  </span>
                </div>

                <p className="text-sm font-semibold text-[#819087]">
                  Total Tuitions
                </p>

                <h3 className="mt-2 text-4xl font-extrabold tracking-tight text-[#172820]">
                  {stats.totalTuitions}
                </h3>

                <p className="mt-3 text-xs text-[#a0ada4]">
                  All listings created by you
                </p>
              </div>

              {/* APPROVED TUITION */}

              <div className="group rounded-[22px] border border-[#e3ebe4] bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#075c3b]/5">

                <div className="mb-6 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f3ec] text-[#087448]">
                    <CheckCircle2 size={23} />
                  </div>

                  <span className="rounded-full bg-[#e9f7ee] px-3 py-1 text-[9px] font-bold uppercase tracking-wide text-[#07965b]">
                    Approved
                  </span>
                </div>

                <p className="text-sm font-semibold text-[#819087]">
                  Active / Approved
                </p>

                <h3 className="mt-2 text-4xl font-extrabold tracking-tight text-[#172820]">
                  {stats.activeApprovedTuitions}
                </h3>

                <p className="mt-3 text-xs text-[#a0ada4]">
                  Approved and currently active
                </p>
              </div>

              {/* APPLICANTS */}

              <div className="group rounded-[22px] border border-[#e3ebe4] bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#075c3b]/5">

                <div className="mb-6 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf0ff] text-[#6276c9]">
                    <Users size={23} />
                  </div>

                  <span className="rounded-full bg-[#f0f1ff] px-3 py-1 text-[9px] font-bold uppercase tracking-wide text-[#6879c7]">
                    Students
                  </span>
                </div>

                <p className="text-sm font-semibold text-[#819087]">
                  Applicants Received
                </p>

                <h3 className="mt-2 text-4xl font-extrabold tracking-tight text-[#172820]">
                  {stats.totalApplicants}
                </h3>

                <p className="mt-3 text-xs text-[#a0ada4]">
                  Students interested in your tuitions
                </p>
              </div>

              {/* MEMBERSHIP */}

              <div className="group rounded-[22px] border border-[#e3ebe4] bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#075c3b]/5">

                <div className="mb-6 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff4df] text-[#c28a25]">
                    <Wallet size={23} />
                  </div>

                  <span className="rounded-full bg-[#fff6e7] px-3 py-1 text-[9px] font-bold uppercase tracking-wide text-[#b78630]">
                    {isPro ? "Premium" : "Basic"}
                  </span>
                </div>

                <p className="text-sm font-semibold text-[#819087]">
                  Current Subscription
                </p>

                <h3 className="mt-2 text-4xl font-extrabold tracking-tight text-[#172820]">
                  {planName}
                </h3>

                <p className="mt-3 text-xs text-[#a0ada4]">
                  {isPro
                    ? "Unlimited tuition posting"
                    : "Up to 2 tuition posts"}
                </p>
              </div>

            </div>
          </section>

          {/* ================================== */}
          {/* POSTING CAPACITY + ACCOUNT */}
          {/* ================================== */}

          <section className="mb-9 grid gap-6 xl:grid-cols-3">

            {/* POSTING CAPACITY */}

            <div className="rounded-[24px] border border-[#e3ebe4] bg-white p-7 shadow-sm xl:col-span-2">

              <div className="mb-7 flex items-center justify-between">

                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[2px] text-[#087448]">
                    Membership Usage
                  </p>

                  <h3 className="mt-2 text-xl font-extrabold text-[#172820]">
                    Posting Capacity
                  </h3>

                  <p className="mt-1 text-sm text-[#8c9a91]">
                    Keep track of your tuition posting limit.
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e9f3ec] text-[#087448]">
                  <BarChart3 size={24} />
                </div>
              </div>

              {isPro ? (

                <div className="rounded-2xl border border-[#d8eddf] bg-[#f0f8f2] p-6">

                  <div className="flex items-start gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-[#087448] shadow-sm">
                      <CheckCircle2 size={25} />
                    </div>

                    <div>
                      <h4 className="font-extrabold text-[#075c3b]">
                        Unlimited Posting Enabled
                      </h4>

                      <p className="mt-2 text-sm leading-6 text-[#70877a]">
                        Your Pro membership allows you to
                        publish unlimited tuition listings.
                        Keep growing your teaching opportunities.
                      </p>
                    </div>

                  </div>
                </div>

              ) : (

                <>
                  <div className="mb-5 flex items-end justify-between">

                    <div>
                      <h4 className="text-4xl font-extrabold tracking-tight text-[#172820]">
                        {postsUsed}
                        <span className="ml-1 text-lg font-semibold text-[#9aa79e]">
                          / {freePlanLimit}
                        </span>
                      </h4>

                      <p className="mt-2 text-xs text-[#89978e]">
                        Tuition posts used
                      </p>
                    </div>

                    <span className="rounded-full bg-[#eaf6ee] px-4 py-2 text-xs font-bold text-[#087448]">
                      {Math.max(
                        freePlanLimit - stats.totalTuitions,
                        0
                      )}{" "}
                      remaining
                    </span>
                  </div>

                  {/* Progress Bar */}

                  <div className="h-3 overflow-hidden rounded-full bg-[#edf2ed]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#075c3b] to-[#36a36f] transition-all duration-700"
                      style={{
                        width: `${usagePercentage}%`,
                      }}
                    />
                  </div>

                  <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                    <p className="text-xs text-[#94a198]">
                      Free plan allows up to 2 tuition posts.
                    </p>

                    <button
                      onClick={() => router.push("/pricing")}
                      className="flex items-center gap-2 text-sm font-extrabold text-[#087448] transition hover:text-[#075c3b]"
                    >
                      Upgrade to Pro
                      <ArrowUpRight size={17} />
                    </button>
                  </div>
                </>
              )}

            </div>

            {/* ACCOUNT SUMMARY */}

            <div className="rounded-[24px] border border-[#e3ebe4] bg-white p-7 shadow-sm">

              <div className="mb-7 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e9f3ec] text-[#087448]">
                  <UserRound size={22} />
                </div>

                <div>
                  <h3 className="text-lg font-extrabold text-[#172820]">
                    Account Summary
                  </h3>

                  <p className="text-xs text-[#95a198]">
                    Your account information
                  </p>
                </div>
              </div>

              <div className="space-y-5">

                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-[#8b9990]">
                    Account Role
                  </span>

                  <span className="rounded-full bg-[#eaf4ed] px-3 py-1 text-xs font-bold capitalize text-[#087448]">
                    {user?.role || "Tutor"}
                  </span>
                </div>

                <div className="border-t border-[#edf1ed]" />

                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-[#8b9990]">
                    Subscription
                  </span>

                  <span className="text-sm font-bold text-[#26372d]">
                    {planName}
                  </span>
                </div>

                <div className="border-t border-[#edf1ed]" />

                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-[#8b9990]">
                    Total Applicants
                  </span>

                  <span className="text-sm font-bold text-[#26372d]">
                    {stats.totalApplicants}
                  </span>
                </div>

                <div className="border-t border-[#edf1ed]" />

                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-[#8b9990]">
                    Account Status
                  </span>

                  <span className="flex items-center gap-2 text-xs font-bold text-[#07965b]">
                    <span className="h-2 w-2 rounded-full bg-[#07965b]" />
                    Active
                  </span>
                </div>

              </div>

              <button
                onClick={() => router.push("/dashboard/profile")}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-[#dfe8e0] py-3 text-sm font-bold text-[#53675c] transition hover:border-[#087448] hover:text-[#087448]"
              >
                Manage Profile
                <ArrowUpRight size={16} />
              </button>

            </div>

          </section>

          {/* ================================== */}
          {/* QUICK ACTIONS */}
          {/* ================================== */}

          <section className="mb-10">

            <div className="mb-6">
              <p className="text-[10px] font-extrabold uppercase tracking-[2px] text-[#087448]">
                Get Things Done
              </p>

              <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-[#172820]">
                Quick Actions
              </h3>

              <p className="mt-1.5 text-sm text-[#8b9990]">
                Everything you need to manage your teaching activities.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

              {/* POST TUITION */}

              <button
                onClick={() =>
                  router.push("/dashboard/tutor/post-tuition")
                }
                className="group rounded-[22px] border border-[#e3ebe4] bg-white p-6 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#b8d9c2] hover:shadow-xl hover:shadow-[#075c3b]/5"
              >

                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e9f3ec] text-[#087448] transition group-hover:bg-[#075c3b] group-hover:text-white">
                  <Plus size={26} />
                </div>

                <h4 className="text-lg font-extrabold text-[#172820]">
                  Post a Tuition
                </h4>

                <p className="mt-2 text-sm leading-6 text-[#89978e]">
                  Create a new tuition listing and connect
                  with students looking for qualified tutors.
                </p>

                <span className="mt-6 flex items-center gap-2 text-sm font-extrabold text-[#087448]">
                  Create Listing
                  <ChevronRight
                    size={17}
                    className="transition group-hover:translate-x-1"
                  />
                </span>
              </button>

              {/* MY TUITIONS */}

              <button
                onClick={() =>
                  router.push("/dashboard/tutor/my-tuitions")
                }
                className="group rounded-[22px] border border-[#e3ebe4] bg-white p-6 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#c5d6ef] hover:shadow-xl hover:shadow-blue-900/5"
              >

                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf2fc] text-[#5579bf] transition group-hover:bg-[#5579bf] group-hover:text-white">
                  <BookOpen size={26} />
                </div>

                <h4 className="text-lg font-extrabold text-[#172820]">
                  My Tuitions
                </h4>

                <p className="mt-2 text-sm leading-6 text-[#89978e]">
                  View, edit, manage, and monitor all your
                  tuition listings from one place.
                </p>

                <span className="mt-6 flex items-center gap-2 text-sm font-extrabold text-[#5579bf]">
                  Manage Tuitions
                  <ChevronRight
                    size={17}
                    className="transition group-hover:translate-x-1"
                  />
                </span>
              </button>

              {/* APPLICANTS */}

              <button
                onClick={() =>
                  router.push("/dashboard/tutor/applicants")
                }
                className="group rounded-[22px] border border-[#e3ebe4] bg-white p-6 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#e2d0f2] hover:shadow-xl hover:shadow-purple-900/5"
              >

                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f3edfb] text-[#9264bd] transition group-hover:bg-[#9264bd] group-hover:text-white">
                  <Users size={26} />
                </div>

                <h4 className="text-lg font-extrabold text-[#172820]">
                  Manage Applicants
                </h4>

                <p className="mt-2 text-sm leading-6 text-[#89978e]">
                  Review student applications and manage
                  their application status.
                </p>

                <span className="mt-6 flex items-center gap-2 text-sm font-extrabold text-[#9264bd]">
                  View Applicants
                  <ChevronRight
                    size={17}
                    className="transition group-hover:translate-x-1"
                  />
                </span>
              </button>

            </div>
          </section>

          {/* ================================== */}
          {/* FOOTER */}
          {/* ================================== */}

          <footer className="mt-12 border-t border-[#e3ebe4] py-7">

            <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">

              <div className="flex items-center gap-2">
                <GraduationCap
                  size={19}
                  className="text-[#087448]"
                />

                <p className="text-xs font-bold text-[#65766c]">
                  © 2026 MentorLagbe. All rights reserved.
                </p>
              </div>

              <p className="text-xs text-[#9aa79e]">
                Empowering education through meaningful connections.
              </p>

            </div>
          </footer>

        </main>
      </div>
    </div>
  );
}
