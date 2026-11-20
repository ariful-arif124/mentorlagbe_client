"use client";

import { useEffect, useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import { toast } from "sonner";

import {

  GraduationCap,

  LayoutDashboard,

  BookOpen,

  ClipboardList,

  UserRound,

  LogOut,

  Menu,

  X,

  ArrowRight,

  ArrowUpRight,

  Bell,

  RefreshCw,

  Loader2,

  CalendarDays,

  Clock,

  Wallet,

  Phone,

  Mail,

  CheckCircle2,

  XCircle,

  AlertCircle,

  ChevronLeft,

  ChevronRight,

  ShieldCheck,

  SlidersHorizontal,

  Home,

  Sparkles,

  MapPin,

} from "lucide-react";

// ==========================================

// CONFIGURATION

// ==========================================

const API_BASE_URL = (

  process.env.NEXT_PUBLIC_API_URL ||

  "http://localhost:5000/api"

)

  .trim()

  .replace(/\/+$/, "")

  .replace(/\/api$/i, "");

const APPLICATIONS_PER_PAGE = 10;

// ==========================================

// TYPES

// ==========================================

interface UserData {

  userId?: string;

  name: string;

  email: string;

  role: string;

  plan?: string;
  image?: string | null;
}

interface Application {

  _id: string;

  tuitionId: string;

  tuitionTitle: string;

  subject: string;

  monthlyFee: number;

  tutorName: string;

  tutorEmail: string;

  studentPhone: string;

  preferredSchedule: string;

  studentNote: string;

  status: string;

  appliedAt: string;

}

interface Pagination {

  currentPage: number;

  limit: number;

  totalApplications: number;

  totalPages: number;

}

type FilterStatus =

  | "all"

  | "pending"

  | "accepted"

  | "rejected"

  | "cancelled";

// ==========================================

// HELPERS

// ==========================================

function getInitials(name?: string) {

  return (name || "Student")

    .split(" ")

    .filter(Boolean)

    .slice(0, 2)

    .map((word) => word[0])

    .join("")

    .toUpperCase();

}

function formatDate(date?: string) {

  if (!date) return "Date unavailable";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {

    return "Date unavailable";

  }

  return new Intl.DateTimeFormat("en-GB", {

    day: "2-digit",

    month: "short",

    year: "numeric",

  }).format(parsed);

}

function formatCurrency(amount?: number) {

  return `BDT ${Number(amount || 0).toLocaleString("en-BD")}`;

}

function normalizeStatus(status: string) {

  const value = status?.toLowerCase();

  if (value === "approved") return "accepted";

  return value || "pending";

}

function getStatusMeta(status: string) {

  const normalized = normalizeStatus(status);

  switch (normalized) {

    case "accepted":

      return {

        label: "Accepted",

        icon: CheckCircle2,

        color: "border-emerald-200 bg-emerald-50 text-emerald-700",

        dot: "bg-emerald-500",

      };

    case "rejected":

      return {

        label: "Rejected",

        icon: XCircle,

        color: "border-red-200 bg-red-50 text-red-600",

        dot: "bg-red-500",

      };

    case "cancelled":

      return {

        label: "Cancelled",

        icon: XCircle,

        color: "border-gray-200 bg-gray-100 text-gray-600",

        dot: "bg-gray-400",

      };

    default:

      return {

        label: "Pending",

        icon: Clock,

        color: "border-amber-200 bg-amber-50 text-amber-700",

        dot: "bg-amber-500",

      };

  }

}

// ==========================================

// MAIN COMPONENT

// ==========================================

export default function StudentDashboard() {

  const router = useRouter();

  const [user, setUser] = useState<UserData | null>(null);

  const [token, setToken] = useState("");

  const [authLoading, setAuthLoading] = useState(true);

  const [applicationsLoading, setApplicationsLoading] = useState(true);

  const [applications, setApplications] = useState<Application[]>([]);

  const [pagination, setPagination] = useState<Pagination>({

    currentPage: 1,

    limit: APPLICATIONS_PER_PAGE,

    totalApplications: 0,

    totalPages: 0,

  });

  const [error, setError] = useState("");

  const [page, setPage] = useState(1);

  const [refreshKey, setRefreshKey] = useState(0);

  const [filter, setFilter] = useState<FilterStatus>("all");

  const [cancelLoading, setCancelLoading] = useState<string | null>(null);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // ==========================================

  // AUTHENTICATION

  // ==========================================

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

      if (parsedUser.role?.toLowerCase() !== "student") {

        router.replace("/");

        return;

      }

      setUser(parsedUser);

      setToken(storedToken);

      setAuthLoading(false);

    } catch {

      localStorage.removeItem("token");

      localStorage.removeItem("user");

      localStorage.removeItem("mentorlagbe_token");

      localStorage.removeItem("mentorlagbe_user");

      router.replace("/sign-in");

    }

  }, [router]);

  // ==========================================
  // SYNC PROFILE UPDATES
  // ==========================================

  useEffect(() => {
    const syncUserFromStorage = () => {
      const storedUser =
        localStorage.getItem("user") ||
        localStorage.getItem("mentorlagbe_user");

      if (!storedUser) return;

      try {
        const parsedUser: UserData = JSON.parse(storedUser);

        if (parsedUser.role?.toLowerCase() === "student") {
          setUser(parsedUser);
        }
      } catch (syncError) {
        console.error("Unable to sync student profile:", syncError);
      }
    };

    window.addEventListener("mentorlagbe-auth-change", syncUserFromStorage);
    window.addEventListener("storage", syncUserFromStorage);

    return () => {
      window.removeEventListener("mentorlagbe-auth-change", syncUserFromStorage);
      window.removeEventListener("storage", syncUserFromStorage);
    };
  }, []);

  // ==========================================

  // FETCH APPLICATIONS

  // ==========================================

  useEffect(() => {

    if (!token) return;

    let active = true;

    const fetchApplications = async () => {

      setApplicationsLoading(true);

      setError("");

      try {

        const response = await fetch(

          `${API_BASE_URL}/api/applications?page=${page}&limit=${APPLICATIONS_PER_PAGE}`,

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

          localStorage.removeItem("token");

          localStorage.removeItem("user");

          localStorage.removeItem("mentorlagbe_token");

          localStorage.removeItem("mentorlagbe_user");

          router.replace("/sign-in");

          return;

        }

        if (!response.ok || !result.success) {

          throw new Error(

            result.message || "Unable to retrieve applications"

          );

        }

        if (!active) return;

        setApplications(result.data?.applications || []);

        setPagination(

          result.data?.pagination || {

            currentPage: 1,

            limit: APPLICATIONS_PER_PAGE,

            totalApplications: 0,

            totalPages: 0,

          }

        );

      } catch (err) {

        if (!active) return;

        setError(

          err instanceof Error

            ? err.message

            : "Something went wrong"

        );

      } finally {

        if (active) {

          setApplicationsLoading(false);

        }

      }

    };

    fetchApplications();

    return () => {

      active = false;

    };

  }, [token, page, refreshKey, router]);

  // ==========================================

  // FILTER APPLICATIONS

  // ==========================================

  const filteredApplications = useMemo(() => {

    if (filter === "all") return applications;

    return applications.filter(

      (application) =>

        normalizeStatus(application.status) === filter

    );

  }, [applications, filter]);

  // ==========================================

  // STATISTICS

  // ==========================================

  const pendingCount = applications.filter(

    (item) => normalizeStatus(item.status) === "pending"

  ).length;

  const acceptedCount = applications.filter(

    (item) => normalizeStatus(item.status) === "accepted"

  ).length;

  const rejectedCount = applications.filter(

    (item) => normalizeStatus(item.status) === "rejected"

  ).length;

  // ==========================================

  // CANCEL APPLICATION

  // ==========================================

  const handleCancelApplication = async (id: string) => {

    const confirmed = window.confirm(

      "Are you sure you want to cancel this application?"

    );

    if (!confirmed) return;

    setCancelLoading(id);

    try {

      const response = await fetch(

        `${API_BASE_URL}/api/applications/${id}/cancel`,

        {

          method: "PATCH",

          headers: {

            Authorization: `Bearer ${token}`,

          },

        }

      );

      const result = await response.json();

      if (response.status === 401) {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        localStorage.removeItem("mentorlagbe_token");

        localStorage.removeItem("mentorlagbe_user");

        router.replace("/sign-in");

        return;

      }

      if (!response.ok || !result.success) {

        throw new Error(

          result.message || "Failed to cancel application"

        );

      }

      setApplications((previous) =>

        previous.map((item) =>

          item._id === id

            ? { ...item, status: "cancelled" }

            : item

        )

      );

      toast.success("Application cancelled successfully");

    } catch (err) {

      toast.error(

        err instanceof Error

          ? err.message

          : "Unable to cancel application"

      );

    } finally {

      setCancelLoading(null);

    }

  };

  // ==========================================

  // REFRESH

  // ==========================================

  const handleRefresh = () => {

    setRefreshKey((previous) => previous + 1);

  };

  // ==========================================

  // LOGOUT

  // ==========================================

  const handleLogout = () => {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    localStorage.removeItem("mentorlagbe_token");

    localStorage.removeItem("mentorlagbe_user");

    router.replace("/sign-in");

  };

  // ==========================================

  // NAVIGATION

  // ==========================================

  const navigate = (destination: string) => {

    setMobileSidebarOpen(false);

    if (destination === "applications") {

      document.getElementById("applications")?.scrollIntoView({

        behavior: "smooth",

      });

      return;

    }

    if (destination === "top") {

      window.scrollTo({ top: 0, behavior: "smooth" });

      return;

    }

    router.push(destination);

  };

  // ==========================================

  // LOADING SCREEN

  // ==========================================

  if (authLoading || !user) {

    return (

      <main className="flex min-h-screen items-center justify-center bg-[#F7F8F5]">

        <div className="text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F2EB]">

            <GraduationCap

              size={30}

              className="text-[#0F5132]"

            />

          </div>

          <Loader2

            size={24}

            className="mx-auto mt-5 animate-spin text-[#0F5132]"

          />

          <p className="mt-3 text-sm font-medium text-[#68776E]">

            Preparing your dashboard...

          </p>

        </div>

      </main>

    );

  }

  const initials = getInitials(user.name);

  const isPro = user.plan?.toLowerCase() === "pro";

  // ==========================================

  // DASHBOARD UI

  // ==========================================

  return (

    <div className="min-h-screen bg-[#F7F8F5] text-[#17251D]">

      {/* MOBILE OVERLAY */}

      {mobileSidebarOpen && (

        <button

          type="button"

          aria-label="Close sidebar"

          onClick={() => setMobileSidebarOpen(false)}

          className="fixed inset-0 z-40 bg-[#07130E]/50 backdrop-blur-sm lg:hidden"

        />

      )}

      {/* ====================================== */}

      {/* SIDEBAR */}

      {/* ====================================== */}

      <aside

        className={`

          fixed inset-y-0 left-0 z-50

          flex flex-col

          border-r border-[#E7ECE7]

          bg-white

          transition-all duration-300

          ${sidebarCollapsed ? "lg:w-[88px]" : "lg:w-[270px]"}

          w-[270px]

          ${

            mobileSidebarOpen

              ? "translate-x-0"

              : "-translate-x-full lg:translate-x-0"

          }

        `}

      >

        {/* BRAND */}

        <div className="flex h-[78px] shrink-0 items-center justify-between border-b border-[#EDF0EB] px-5">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0F5132] text-white shadow-sm">

              <GraduationCap size={26} />

            </div>

            {!sidebarCollapsed && (

              <div>

                <h2 className="text-xl font-extrabold tracking-tight">

                  Mentor<span className="text-[#0F6844]">Lagbe</span>

                </h2>

                <p className="text-[10px] font-bold uppercase tracking-[2px] text-[#9AA69E]">

                  Student Portal

                </p>

              </div>

            )}

          </div>

          <button

            onClick={() => setMobileSidebarOpen(false)}

            className="text-[#829087] lg:hidden"

            aria-label="Close menu"

          >

            <X size={21} />

          </button>

        </div>

        {/* STUDENT PROFILE */}

        <div className="border-b border-[#EDF0EB] p-4">

          <div className="flex items-center gap-3 rounded-2xl bg-[#F3F7F3] p-3">

            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#DCECE1] text-sm font-extrabold text-[#0F5132]">
              <span>{initials}</span>

              {user.image && (
                <img
                  key={user.image}
                  src={user.image}
                  alt={`${user.name}'s profile`}
                  className="absolute inset-0 h-full w-full rounded-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              )}
            </div>

            {!sidebarCollapsed && (

              <div className="min-w-0 flex-1">

                <p className="truncate text-sm font-bold text-[#1A2A21]">

                  {user.name}

                </p>

                <p className="truncate text-xs text-[#849188]">

                  {user.email}

                </p>

                <div className="mt-2 flex flex-wrap items-center gap-1.5">

                  <span className="rounded-md bg-[#DDEEE3] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#0F6844]">

                    Student

                  </span>

                  <span className={`

                    rounded-md px-2 py-0.5 text-[9px] font-bold uppercase

                    ${isPro

                      ? "bg-amber-100 text-amber-700"

                      : "bg-gray-100 text-gray-600"

                    }

                  `}>

                    {user.plan || "Free"}

                  </span>

                </div>

              </div>

            )}

          </div>

        </div>

        {/* NAVIGATION */}

        <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-6">

          {!sidebarCollapsed && (

            <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[2px] text-[#A0AAA3]">

              Workspace

            </p>

          )}

          <SidebarItem

            icon={<LayoutDashboard size={19} />}

            label="Overview"

            active

            collapsed={sidebarCollapsed}

            onClick={() => navigate("top")}

          />

          <SidebarItem

            icon={<BookOpen size={19} />}

            label="Browse Tuitions"

            collapsed={sidebarCollapsed}

            onClick={() => navigate("/tuitions")}

          />

          <SidebarItem

            icon={<ClipboardList size={19} />}

            label="My Applications"

            collapsed={sidebarCollapsed}

            onClick={() => navigate("applications")}

          />

          <SidebarItem

            icon={<Wallet size={19} />}

            label="Upgrade Plan"

            collapsed={sidebarCollapsed}

            onClick={() => navigate("/pricing")}

          />

          <div className="my-6 border-t border-[#EDF0EB]" />

          {!sidebarCollapsed && (

            <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[2px] text-[#A0AAA3]">

              Account

            </p>

          )}

          <SidebarItem

            icon={<UserRound size={19} />}

            label="My Account"

            collapsed={sidebarCollapsed}

            onClick={() => navigate("/dashboard/profile")}

          />

          <SidebarItem

            icon={<Home size={19} />}

            label="Visit Website"

            collapsed={sidebarCollapsed}

            onClick={() => navigate("/")}

          />

        </nav>

        {/* SIDEBAR BOTTOM */}

        <div className="shrink-0 border-t border-[#EDF0EB] p-4">

          {!sidebarCollapsed && (

            <div className="mb-4 rounded-2xl bg-[#F0F6F1] p-4">

              <div className="flex items-center gap-2 text-[#0F6844]">

                <ShieldCheck size={18} />

                <span className="text-xs font-bold">

                  Learning with confidence

                </span>

              </div>

              <p className="mt-2 text-xs leading-5 text-[#75847A]">

                Track your applications and stay connected with your tutors.

              </p>

            </div>

          )}

          <button

            onClick={handleLogout}

            className="

              flex w-full items-center gap-3 rounded-xl

              px-3 py-3 text-sm font-bold

              text-red-500 transition

              hover:bg-red-50

            "

          >

            <LogOut size={19} />

            {!sidebarCollapsed && <span>Logout</span>}

          </button>

          <button

            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}

            className="mt-2 hidden w-full items-center justify-center rounded-xl py-2 text-xs font-semibold text-[#94A198] transition hover:bg-[#F4F6F3] lg:flex"

          >

            {sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}

          </button>

        </div>

      </aside>

      {/* ====================================== */}

      {/* MAIN AREA */}

      {/* ====================================== */}

      <div

        className={`

          min-h-screen transition-all duration-300

          ${sidebarCollapsed ? "lg:pl-[88px]" : "lg:pl-[270px]"}

        `}

      >

        {/* TOPBAR */}

        <header className="

          sticky top-0 z-30 flex h-[76px]

          items-center justify-between

          border-b border-[#E8ECE7]

          bg-white/95 px-5 backdrop-blur-xl

          sm:px-8

        ">

          <div className="flex items-center gap-4">

            <button

              onClick={() => setMobileSidebarOpen(true)}

              className="rounded-xl p-2 text-[#65756B] transition hover:bg-[#F1F5F1] lg:hidden"

              aria-label="Open sidebar"

            >

              <Menu size={22} />

            </button>

            <button

              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}

              className="hidden rounded-xl p-2 text-[#65756B] transition hover:bg-[#F1F5F1] lg:block"

              aria-label="Toggle sidebar"

            >

              <Menu size={21} />

            </button>

            <div>

              <p className="text-[10px] font-bold uppercase tracking-[1.8px] text-[#9AA69E]">

                Student Portal / Overview

              </p>

              <h1 className="mt-0.5 text-lg font-extrabold tracking-tight text-[#17251D]">

                Dashboard

              </h1>

            </div>

          </div>

          <div className="flex items-center gap-3">

            <button

              onClick={() => router.push("/")}

              className="hidden items-center gap-2 rounded-xl border border-[#E6EBE5] px-4 py-2.5 text-xs font-bold text-[#52645A] transition hover:bg-[#F3F7F3] sm:flex"

            >

              Visit Website

              <ArrowUpRight size={15} />

            </button>

            <div className="hidden h-8 w-px bg-[#E8ECE7] sm:block" />

            <div className="flex items-center gap-2.5">

              <div className="hidden text-right sm:block">

                <p className="text-xs font-bold text-[#233329]">

                  {user.name}

                </p>

                <p className="text-[10px] text-[#9AA69E]">

                  Student Account

                </p>

              </div>

              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#DCECE1] text-xs font-extrabold text-[#0F5132]">
                <span>{initials}</span>

                {user.image && (
                  <img
                    key={user.image}
                    src={user.image}
                    alt={`${user.name}'s profile`}
                    className="absolute inset-0 h-full w-full rounded-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                )}
              </div>

            </div>

          </div>

        </header>

        {/* ====================================== */}

        {/* DASHBOARD CONTENT */}

        {/* ====================================== */}

        <main className="mx-auto max-w-[1550px] px-5 py-7 sm:px-8 sm:py-9 lg:px-10">

          {/* WELCOME HERO */}

          <section className="

            relative mb-8 overflow-hidden

            rounded-[26px] bg-[#0B452D]

            p-7 text-white shadow-lg

            shadow-[#0B452D]/10

            sm:p-10

          ">

            {/* Decorative background */}

            <div className="pointer-events-none absolute -right-16 -top-32 h-80 w-80 rounded-full border border-white/10" />

            <div className="pointer-events-none absolute -right-4 -top-20 h-60 w-60 rounded-full border border-white/10" />

            <div className="pointer-events-none absolute -bottom-36 right-40 h-80 w-80 rounded-full bg-[#2C8055]/20 blur-3xl" />

            <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-center">

              <div className="max-w-2xl">

                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 backdrop-blur-sm">

                  <Sparkles size={15} className="text-[#F4C66A]" />

                  <span className="text-[10px] font-bold uppercase tracking-[1.8px] text-emerald-50">

                    Your Learning Space

                  </span>

                </div>

                <h2 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-[42px]">

                  Welcome back,

                  <br />

                  <span className="text-[#A9D9B9]">

                    {user.name.split(" ")[0]}!

                  </span>

                </h2>

                <p className="mt-4 max-w-xl text-sm leading-7 text-emerald-100/80 sm:text-base">

                  Your learning journey deserves the right guidance.

                  Discover great tutors, manage your applications,

                  and take your next step with MentorLagbe.

                </p>

                <div className="mt-7 flex flex-wrap gap-3">

                  <button

                    onClick={() => router.push("/tuitions")}

                    className="

                      inline-flex items-center gap-2

                      rounded-xl bg-white px-5 py-3

                      text-sm font-extrabold text-[#0F5132]

                      shadow-sm transition

                      hover:-translate-y-0.5 hover:bg-[#F1F7F2]

                    "

                  >

                    Explore Tuitions

                    <ArrowRight size={17} />

                  </button>

                  <button

                    onClick={() => navigate("applications")}

                    className="

                      inline-flex items-center gap-2

                      rounded-xl border border-white/20

                      bg-white/10 px-5 py-3

                      text-sm font-bold text-white

                      transition hover:bg-white/15

                    "

                  >

                    My Applications

                  </button>

                </div>

              </div>

              {/* HERO SIDE PANEL */}

              <div className="

                relative hidden min-w-[230px]

                rounded-2xl border border-white/15

                bg-white/10 p-6 backdrop-blur-md

                lg:block

              ">

                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-[#C6E9D1]">

                  <GraduationCap size={32} />

                </div>

                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-100/70">

                  Membership

                </p>

                <h3 className="mt-2 text-2xl font-extrabold capitalize">

                  {user.plan || "Free"} Plan

                </h3>

                <div className="mt-5 flex items-center gap-2 text-xs text-emerald-100/80">

                  <ShieldCheck size={16} />

                  Your account is active

                </div>

                {!isPro && (

                  <button

                    onClick={() => router.push("/pricing")}

                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#F0C66A] px-4 py-3 text-xs font-extrabold text-[#3C3017] transition hover:bg-[#F7D98F]"

                  >

                    Explore Pro Plan

                    <ArrowUpRight size={15} />

                  </button>

                )}

              </div>

            </div>

          </section>

          {/* STATISTICS */}

          <section className="mb-10">

            <div className="mb-5 flex items-center justify-between">

              <div>

                <p className="text-[10px] font-bold uppercase tracking-[1.8px] text-[#0F6844]">

                  Your Overview

                </p>

                <h2 className="mt-1 text-xl font-extrabold text-[#1B2B21]">

                  Learning at a glance

                </h2>

              </div>

              <button

                onClick={handleRefresh}

                disabled={applicationsLoading}

                className="flex items-center gap-2 rounded-xl border border-[#E5EAE4] bg-white px-4 py-2.5 text-xs font-bold text-[#63736A] transition hover:border-[#0F6844] hover:text-[#0F6844] disabled:opacity-50"

              >

                <RefreshCw

                  size={15}

                  className={applicationsLoading ? "animate-spin" : ""}

                />

                Refresh

              </button>

            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

              <StatCard

                label="Total Applications"

                value={pagination.totalApplications}

                description="All submitted requests"

                icon={<ClipboardList size={22} />}

                theme="green"

              />

              <StatCard

                label="Pending"

                value={pendingCount}

                description="On this page"

                icon={<Clock size={22} />}

                theme="amber"

              />

              <StatCard

                label="Accepted"

                value={acceptedCount}

                description="On this page"

                icon={<CheckCircle2 size={22} />}

                theme="blue"

              />

              <StatCard

                label="Current Plan"

                value={isPro ? "Pro" : "Free"}

                description="Your membership"

                icon={<Wallet size={22} />}

                theme="purple"

                isText

              />

            </div>

            {rejectedCount > 0 && (

              <p className="mt-3 text-xs text-[#8A9690]">

                {rejectedCount} rejected application(s) on the current page.

              </p>

            )}

          </section>

          {/* APPLICATION MANAGEMENT */}

          <section id="applications" className="scroll-mt-28">

            {/* SECTION HEADER */}

            <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">

              <div>

                <p className="text-[10px] font-bold uppercase tracking-[1.8px] text-[#0F6844]">

                  Manage Your Requests

                </p>

                <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#17251D]">

                  My Applications

                </h2>

                <p className="mt-2 text-sm text-[#839087]">

                  Keep track of your tuition applications and their progress.

                </p>

              </div>

              <div className="flex items-center gap-2 text-xs text-[#849188]">

                <ClipboardList size={16} />

                {pagination.totalApplications} total applications

              </div>

            </div>

            {/* APPLICATION PANEL */}

            <div className="overflow-hidden rounded-[22px] border border-[#E5EAE4] bg-white shadow-sm">

              {/* FILTER BAR */}

              <div className="flex flex-col justify-between gap-4 border-b border-[#EDF0EB] p-5 sm:p-6 xl:flex-row xl:items-center">

                <div className="flex items-center gap-2">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF3EC] text-[#0F6844]">

                    <SlidersHorizontal size={19} />

                  </div>

                  <div>

                    <p className="text-sm font-bold text-[#26362B]">

                      Application Status

                    </p>

                    <p className="text-[11px] text-[#9AA69E]">

                      Filter your requests

                    </p>

                  </div>

                </div>

                <div className="flex flex-wrap gap-2">

                  {(

                    [

                      "all",

                      "pending",

                      "accepted",

                      "rejected",

                      "cancelled",

                    ] as FilterStatus[]

                  ).map((item) => {

                    const labels: Record<FilterStatus, string> = {

                      all: "All",

                      pending: "Pending",

                      accepted: "Accepted",

                      rejected: "Rejected",

                      cancelled: "Cancelled",

                    };

                    return (

                      <button

                        key={item}

                        onClick={() => setFilter(item)}

                        className={`

                          rounded-lg px-3.5 py-2

                          text-xs font-bold transition

                          ${

                            filter === item

                              ? "bg-[#0F5132] text-white shadow-sm"

                              : "bg-[#F5F7F4] text-[#738078] hover:bg-[#EAF2EB] hover:text-[#0F6844]"

                          }

                        `}

                      >

                        {labels[item]}

                      </button>

                    );

                  })}

                </div>

              </div>

              {/* APPLICATION CONTENT */}

              <div className="p-5 sm:p-6">

                {/* LOADING */}

                {applicationsLoading ? (

                  <div className="space-y-4">

                    {[1, 2].map((item) => (

                      <div

                        key={item}

                        className="animate-pulse rounded-2xl border border-[#EDF0EB] p-6"

                      >

                        <div className="h-5 w-2/5 rounded bg-[#EEF1ED]" />

                        <div className="mt-4 h-3 w-1/3 rounded bg-[#F1F3F0]" />

                        <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-4">

                          {[1, 2, 3, 4].map((i) => (

                            <div

                              key={i}

                              className="h-12 rounded-xl bg-[#F1F3F0]"

                            />

                          ))}

                        </div>

                      </div>

                    ))}

                    <p className="py-3 text-center text-xs text-[#8B9990]">

                      Loading your applications...

                    </p>

                  </div>

                ) : error ? (

                  /* ERROR */

                  <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-12 text-center">

                    <AlertCircle

                      size={34}

                      className="mx-auto text-red-500"

                    />

                    <h3 className="mt-4 font-bold text-red-800">

                      Unable to Load Applications

                    </h3>

                    <p className="mt-2 text-sm text-red-600">

                      {error}

                    </p>

                    <button

                      onClick={handleRefresh}

                      className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"

                    >

                      Try Again

                    </button>

                  </div>

                ) : filteredApplications.length === 0 ? (

                  /* EMPTY STATE */

                  <div className="px-5 py-16 text-center">

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EDF4EE] text-[#0F6844]">

                      <BookOpen size={29} />

                    </div>

                    <h3 className="mt-5 text-lg font-extrabold text-[#26362B]">

                      {applications.length === 0

                        ? "No Applications Yet"

                        : "No Applications Found"}

                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#8A9790]">

                      {applications.length === 0

                        ? "You haven't applied for any tuition yet. Explore available opportunities and find your ideal tutor."

                        : "There are no applications matching this status on the current page."}

                    </p>

                    {applications.length === 0 && (

                      <button

                        onClick={() => router.push("/tuitions")}

                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0F5132] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#0B3F27]"

                      >

                        Browse Tuitions

                        <ArrowRight size={17} />

                      </button>

                    )}

                  </div>

                ) : (

                  /* APPLICATION LIST */

                  <div className="space-y-4">

                    {filteredApplications.map((application) => {

                      const status = getStatusMeta(application.status);

                      const StatusIcon = status.icon;

                      return (

                        <article

                          key={application._id}

                          className="

                            group overflow-hidden rounded-2xl

                            border border-[#E8EDE7]

                            bg-white transition-all duration-200

                            hover:border-[#C9DCCB]

                            hover:shadow-[0_8px_28px_rgba(24,55,35,0.06)]

                          "

                        >

                          {/* CARD TOP */}

                          <div className="flex flex-col justify-between gap-4 border-b border-[#F0F2EE] p-5 sm:flex-row sm:items-center sm:p-6">

                            <div className="flex min-w-0 items-center gap-4">

                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EAF3EC] text-[#0F6844]">

                                <BookOpen size={23} />

                              </div>

                              <div className="min-w-0">

                                <div className="mb-1.5 flex flex-wrap items-center gap-2">

                                  <span className="rounded-md bg-[#EFF5EF] px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[#0F6844]">

                                    {application.subject || "Tuition"}

                                  </span>

                                  <span className="text-[10px] text-[#9AA69E]">

                                    Applied {formatDate(application.appliedAt)}

                                  </span>

                                </div>

                                <h3 className="truncate text-base font-extrabold text-[#1B2B21] sm:text-lg">

                                  {application.tuitionTitle}

                                </h3>

                                <p className="mt-1 text-xs text-[#839087]">

                                  Tutor: {application.tutorName}

                                </p>

                              </div>

                            </div>

                            <div className="flex items-center justify-between gap-3 sm:justify-end">

                              <span className={`

                                inline-flex items-center gap-2

                                rounded-full border px-3 py-2

                                text-[11px] font-bold

                                ${status.color}

                              `}>

                                <StatusIcon size={14} />

                                {status.label}

                              </span>

                              <span className="text-sm font-extrabold text-[#20362A] sm:hidden">

                                {formatCurrency(application.monthlyFee)}

                              </span>

                            </div>

                          </div>

                          {/* CARD DETAILS */}

                          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-4">

                            <DetailItem

                              icon={<Wallet size={18} />}

                              label="Monthly Fee"

                              value={formatCurrency(application.monthlyFee)}

                            />

                            <DetailItem

                              icon={<CalendarDays size={18} />}

                              label="Preferred Schedule"

                              value={application.preferredSchedule}

                            />

                            <DetailItem

                              icon={<Phone size={18} />}

                              label="Contact Number"

                              value={application.studentPhone}

                            />

                            <DetailItem

                              icon={<Mail size={18} />}

                              label="Tutor Email"

                              value={application.tutorEmail}

                            />

                          </div>

                          {/* STUDENT NOTE */}

                          {application.studentNote && (

                            <div className="mx-5 mb-5 rounded-xl bg-[#F8F9F6] p-4 sm:mx-6">

                              <p className="text-[10px] font-extrabold uppercase tracking-[1.3px] text-[#99A49C]">

                                Your Learning Note

                              </p>

                              <p className="mt-2 text-sm leading-6 text-[#68766D]">

                                {application.studentNote}

                              </p>

                            </div>

                          )}

                          {/* CARD FOOTER */}

                          <div className="flex flex-col justify-between gap-3 border-t border-[#EDF0EB] bg-[#FBFCFA] px-5 py-4 sm:flex-row sm:items-center sm:px-6">

                            <div>

                              <p className="text-[9px] font-bold uppercase tracking-[1.5px] text-[#A1AAA3]">

                                Application Reference

                              </p>

                              <p className="mt-1 break-all font-mono text-[10px] text-[#7F8C83]">

                                {application._id}

                              </p>

                            </div>

                            {normalizeStatus(application.status) === "pending" && (

                              <button

                                onClick={() =>

                                  handleCancelApplication(application._id)

                                }

                                disabled={cancelLoading === application._id}

                                className="

                                  inline-flex items-center justify-center

                                  gap-2 rounded-xl border

                                  border-red-200 bg-white

                                  px-4 py-2.5 text-xs font-bold

                                  text-red-600 transition

                                  hover:bg-red-50

                                  disabled:cursor-not-allowed disabled:opacity-50

                                "

                              >

                                {cancelLoading === application._id ? (

                                  <>

                                    <Loader2

                                      size={15}

                                      className="animate-spin"

                                    />

                                    Cancelling...

                                  </>

                                ) : (

                                  <>

                                    <XCircle size={15} />

                                    Cancel Application

                                  </>

                                )}

                              </button>

                            )}

                          </div>

                        </article>

                      );

                    })}

                  </div>

                )}

                {/* PAGINATION */}

                {!applicationsLoading &&

                  !error &&

                  pagination.totalPages > 1 && (

                    <div className="mt-6 flex flex-col justify-between gap-4 border-t border-[#EDF0EB] pt-5 sm:flex-row sm:items-center">

                      <p className="text-xs text-[#8A9790]">

                        Page {pagination.currentPage} of {pagination.totalPages}

                        {" · "}

                        {pagination.totalApplications} applications

                      </p>

                      <div className="flex items-center gap-2">

                        <button

                          onClick={() => setPage((previous) => previous - 1)}

                          disabled={page <= 1}

                          className="flex items-center gap-2 rounded-lg border border-[#E5EAE4] px-4 py-2.5 text-xs font-bold text-[#63736A] transition hover:bg-[#F4F7F3] disabled:cursor-not-allowed disabled:opacity-40"

                        >

                          <ChevronLeft size={15} />

                          Previous

                        </button>

                        <button

                          onClick={() => setPage((previous) => previous + 1)}

                          disabled={page >= pagination.totalPages}

                          className="flex items-center gap-2 rounded-lg bg-[#0F5132] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#0B3F27] disabled:cursor-not-allowed disabled:opacity-40"

                        >

                          Next

                          <ChevronRight size={15} />

                        </button>

                      </div>

                    </div>

                  )}

              </div>

            </div>

          </section>

          {/* FOOTER */}

          <footer className="mt-12 border-t border-[#E5EAE4] py-6">

            <div className="flex flex-col justify-between gap-3 text-center sm:flex-row sm:text-left">

              <p className="text-xs font-bold text-[#53645A]">

                Mentor<span className="text-[#0F6844]">Lagbe</span>

              </p>

              <p className="text-xs text-[#A0AAA3]">

                Empowering education through meaningful connections.

              </p>

              <p className="text-xs text-[#A0AAA3]">

                © {new Date().getFullYear()} MentorLagbe

              </p>

            </div>

          </footer>

        </main>

      </div>

    </div>

  );

}

// ==========================================

// SIDEBAR ITEM

// ==========================================

function SidebarItem({

  icon,

  label,

  active = false,

  collapsed = false,

  onClick,

}: {

  icon: React.ReactNode;

  label: string;

  active?: boolean;

  collapsed?: boolean;

  onClick: () => void;

}) {

  return (

    <button

      type="button"

      onClick={onClick}

      title={collapsed ? label : undefined}

      className={`

        flex w-full items-center gap-3

        rounded-xl px-3.5 py-3.5

        text-left text-sm font-semibold

        transition-all duration-200

        ${

          active

            ? "bg-[#EAF3EC] text-[#0F6844] shadow-sm"

            : "text-[#78867D] hover:bg-[#F4F7F3] hover:text-[#0F6844]"

        }

      `}

    >

      {icon}

      {!collapsed && <span>{label}</span>}

      {active && !collapsed && (

        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#0F6844]" />

      )}

    </button>

  );

}

// ==========================================

// STATISTICS CARD

// ==========================================

function StatCard({

  label,

  value,

  description,

  icon,

  theme,

  isText = false,

}: {

  label: string;

  value: number | string;

  description: string;

  icon: React.ReactNode;

  theme: "green" | "amber" | "blue" | "purple";

  isText?: boolean;

}) {

  const themes = {

    green: {

      icon: "bg-[#E8F3EB] text-[#0F6844]",

      accent: "bg-[#0F6844]",

    },

    amber: {

      icon: "bg-[#FFF4DD] text-[#B47A18]",

      accent: "bg-[#D99A2B]",

    },

    blue: {

      icon: "bg-[#EAF1FB] text-[#4775B8]",

      accent: "bg-[#4775B8]",

    },

    purple: {

      icon: "bg-[#F1ECF8] text-[#8057AD]",

      accent: "bg-[#8057AD]",

    },

  };

  const style = themes[theme];

  return (

    <div className="

      group relative overflow-hidden

      rounded-2xl border border-[#E6EBE5]

      bg-white p-5 shadow-sm

      transition-all duration-200

      hover:-translate-y-1 hover:shadow-md

    ">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-xs font-semibold text-[#8B978E]">

            {label}

          </p>

          <h3 className={`

            mt-3 font-extrabold tracking-tight text-[#1A2B20]

            ${isText ? "text-2xl capitalize" : "text-3xl"}

          `}>

            {value}

          </h3>

          <p className="mt-2 text-[10px] text-[#A0AAA3]">

            {description}

          </p>

        </div>

        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${style.icon}`}>

          {icon}

        </div>

      </div>

      <div className={`absolute bottom-0 left-0 h-[3px] w-0 ${style.accent} transition-all duration-300 group-hover:w-full`} />

    </div>

  );

}

// ==========================================

// APPLICATION DETAIL ITEM

// ==========================================

function DetailItem({

  icon,

  label,

  value,

}: {

  icon: React.ReactNode;

  label: string;

  value?: string;

}) {

  return (

    <div className="flex min-w-0 items-start gap-3">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F0F5F0] text-[#0F6844]">

        {icon}

      </div>

      <div className="min-w-0">

        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#A0AAA3]">

          {label}

        </p>

        <p className="mt-1 break-words text-xs font-bold leading-5 text-[#425349]">

          {value || "Not provided"}

        </p>

      </div>

    </div>

  );

}
