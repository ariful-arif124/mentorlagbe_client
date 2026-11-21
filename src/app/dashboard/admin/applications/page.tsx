
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";

import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserRound,
  BookOpen,
  ClipboardList,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  Eye,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Loader2,
  Mail,
  Phone,
  CalendarDays,
  Clock,
  Wallet,
  FileText,
  Hash,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

// ==========================================
// CONFIGURATION
// ==========================================

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

// ==========================================
// TYPES
// ==========================================

type AdminUser = {
  name?: string;
  email?: string;
  role?: string;
};

type Application = {
  _id: string;
  tuitionId?: string;
  tuitionTitle?: string;
  subject?: string;
  monthlyFee?: number;

  tutorName?: string;
  tutorEmail?: string;

  studentName?: string;
  studentEmail?: string;
  studentPhone?: string;

  preferredSchedule?: string;
  studentNote?: string;

  status?: string;

  appliedAt?: string;
  reviewedAt?: string;
  updatedAt?: string;
  cancelledAt?: string;
};

type ApplicationStats = {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  cancelled: number;
};

type Pagination = {
  currentPage: number;
  limit: number;
  totalApplications: number;
  totalPages: number;
};

// ==========================================
// INITIAL DATA
// ==========================================

const initialStats: ApplicationStats = {
  total: 0,
  pending: 0,
  accepted: 0,
  rejected: 0,
  cancelled: 0,
};

const initialPagination: Pagination = {
  currentPage: 1,
  limit: 10,
  totalApplications: 0,
  totalPages: 0,
};

// ==========================================
// NAVIGATION
// ==========================================

const navigation: {
  label: string;
  href: string;
  icon: LucideIcon;
  implemented: boolean;
}[] = [
    {
      label: "Overview",
      href: "/dashboard/admin",
      icon: LayoutDashboard,
      implemented: true,
    },
    {
      label: "User Management",
      href: "/dashboard/admin/users",
      icon: Users,
      implemented: true,
    },
    {
      label: "Tutors",
      href: "/dashboard/admin/tutors",
      icon: GraduationCap,
      implemented: true,
    },
    {
      label: "Students",
      href: "/dashboard/admin/students",
      icon: UserRound,
      implemented: true,
    },
    {
      label: "Tuition Management",
      href: "/dashboard/admin/tuitions",
      icon: BookOpen,
      implemented: true,
    },
    {
      label: "Applications",
      href: "/dashboard/admin/applications",
      icon: ClipboardList,
      implemented: true,
    },
    {
      label: "Payments",
      href: "/dashboard/admin/payments",
      icon: CreditCard,
      implemented: true,
    },];

// ==========================================
// AUTHENTICATION HELPERS
// ==========================================

function clearAuthentication() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("mentorlagbe_token");
  localStorage.removeItem("mentorlagbe_user");
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function AdminApplicationsPage() {
  const router = useRouter();

  // AUTHENTICATION
  const [token, setToken] = useState("");
  const [currentUser, setCurrentUser] =
    useState<AdminUser | null>(null);

  // APPLICATION DATA
  const [applications, setApplications] =
    useState<Application[]>([]);

  const [stats, setStats] =
    useState<ApplicationStats>(initialStats);

  const [pagination, setPagination] =
    useState<Pagination>(initialPagination);

  // SEARCH AND FILTERS
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // PAGINATION
  const [page, setPage] = useState(1);

  // LOADING AND NOTIFICATIONS
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [refreshKey, setRefreshKey] = useState(0);

  // SELECTED APPLICATION
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);

  // SIDEBAR
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
      const parsedUser: AdminUser = JSON.parse(storedUser);

      if (parsedUser.role !== "admin") {
        router.replace("/");
        return;
      }

      setCurrentUser(parsedUser);
      setToken(storedToken);
    } catch {
      clearAuthentication();
      router.replace("/sign-in");
    }
  }, [router]);

  // ==========================================
  // LOAD APPLICATIONS
  // ==========================================

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    async function loadApplications() {
      setLoading(true);
      setError("");
      setNotice("");

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "10",
          status: statusFilter,
          search: search.trim(),
        });

        const response = await fetch(
          `${API_URL}/admin/applications?${params.toString()}`,
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
          clearAuthentication();
          router.replace("/sign-in");
          return;
        }

        if (!response.ok) {
          throw new Error(
            result.message || "Failed to load applications"
          );
        }

        if (!result.success) {
          throw new Error(
            result.message || "Unable to retrieve applications"
          );
        }

        if (!cancelled) {
          const data = result.data || {};

          setApplications(data.applications || []);

          setStats({
            ...initialStats,
            ...(data.stats || {}),
          });

          setPagination({
            ...initialPagination,
            ...(data.pagination || {}),
          });
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Unable to load applications"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    const timeout = setTimeout(loadApplications, 350);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [
    token,
    page,
    search,
    statusFilter,
    refreshKey,
    router,
  ]);

  // ==========================================
  // VIEW APPLICATION DETAILS
  // ==========================================

  async function viewApplication(applicationId: string) {
    setDetailsLoading(true);
    setSelectedApplication(null);

    try {
      const response = await fetch(
        `${API_URL}/admin/applications/${applicationId}`,
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
        clearAuthentication();
        router.replace("/sign-in");
        return;
      }

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to retrieve application"
        );
      }

      if (!result.success) {
        throw new Error(
          result.message || "Unable to retrieve application"
        );
      }

      setSelectedApplication(result.data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to retrieve application details"
      );
    } finally {
      setDetailsLoading(false);
    }
  }

  // ==========================================
  // LOGOUT
  // ==========================================

  function logout() {
    clearAuthentication();
    router.replace("/sign-in");
  }

  // ==========================================
  // RESET FILTERS
  // ==========================================

  function resetFilters() {
    setSearch("");
    setStatusFilter("all");
    setPage(1);
  }

  // ==========================================
  // FORMATTERS
  // ==========================================

  function formatDate(date?: string) {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatDateTime(date?: string) {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatCurrency(amount?: number) {
    if (amount === undefined || amount === null) {
      return "Not specified";
    }

    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  function getInitials(name?: string) {
    return (name || "Admin")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  }

  const initials = getInitials(currentUser?.name);

  // ==========================================
  // DASHBOARD UI
  // ==========================================

  return (
    <div className="min-h-screen bg-[#f7f9f7]">

      {/* MOBILE OVERLAY */}

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ====================================== */}
      {/* SIDEBAR */}
      {/* ====================================== */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          border-r border-[#edf0ed] bg-white
          transition-all duration-300
          w-[280px]
          ${collapsed ? "lg:w-[88px]" : "lg:w-[280px]"}
          ${mobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
          }
        `}
      >

        {/* BRAND */}

        <div className="flex h-[82px] shrink-0 items-center justify-between border-b border-[#edf0ed] px-5">

          <div className="flex min-w-0 items-center gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#075c3d] text-white">
              <GraduationCap size={23} />
            </div>

            {!collapsed && (
              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-[#17251d]">
                  Mentor<span className="text-[#075c3d]">Lagbe</span>
                </h2>

                <p className="text-[9px] font-bold uppercase tracking-[2px] text-gray-400">
                  Admin Portal
                </p>
              </div>
            )}

          </div>

          <button
            onClick={() => {
              setCollapsed((value) => !value);
            }}
            className="hidden rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 lg:block"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen size={19} />
            ) : (
              <PanelLeftClose size={19} />
            )}
          </button>

          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 lg:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>

        </div>

        {/* ADMIN PROFILE */}

        <div className="border-b border-[#edf0ed] p-4">

          <div className="flex items-center gap-3 rounded-2xl bg-[#f3f7f3] p-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#dceee3] text-sm font-extrabold text-[#075c3d]">
              {initials}
            </div>

            {!collapsed && (
              <div className="min-w-0 flex-1">

                <p className="truncate text-sm font-bold text-[#17251d]">
                  {currentUser?.name || "Administrator"}
                </p>

                <p className="truncate text-[10px] text-gray-500">
                  {currentUser?.email}
                </p>

                <span className="mt-1 inline-flex items-center gap-1 text-[9px] font-bold uppercase text-[#075c3d]">
                  <CheckCircle2 size={11} />
                  Administrator
                </span>

              </div>
            )}

          </div>

        </div>

        {/* NAVIGATION */}

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">

          {!collapsed && (
            <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[2px] text-gray-400">
              Main Menu
            </p>
          )}

          {navigation.map((item) => {
            const Icon = item.icon;
            const active = item.label === "Applications";

            return (
              <button
                key={item.label}
                type="button"
                title={collapsed ? item.label : ""}
                disabled={!item.implemented}
                onClick={() => {
                  if (!item.implemented) return;

                  router.push(item.href);
                  setMobileOpen(false);
                }}
                className={`
                  flex w-full items-center gap-3 rounded-xl px-3 py-3
                  text-left text-sm font-medium transition
                  ${active
                    ? "bg-[#eaf4ed] font-semibold text-[#075c3d]"
                    : "text-gray-500 hover:bg-[#f5f7f5] hover:text-[#075c3d]"
                  }
                  ${item.implemented
                    ? "cursor-pointer"
                    : "cursor-not-allowed opacity-60"
                  }
                `}
              >

                <Icon size={19} className="shrink-0" />

                {!collapsed && (
                  <>
                    <span>{item.label}</span>

                    {!item.implemented && (
                      <span className="ml-auto text-[9px] font-semibold uppercase text-gray-400">
                        Soon
                      </span>
                    )}
                  </>
                )}

                {collapsed && active && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-[#075c3d]" />
                )}

              </button>
            );
          })}

          <div className="my-5 border-t border-[#edf0ed]" />

          <button
            type="button"
            title={collapsed ? "Settings" : ""}
            onClick={() => {
              router.push("/dashboard/admin/settings");
              setMobileOpen(false);
            }}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-500 transition hover:bg-[#f5f7f5] hover:text-[#075c3d] ${collapsed ? "justify-center" : ""
              }`}
          >
            <Settings size={19} />
            {!collapsed && <span>Settings</span>}
          </button>

        </nav>

        {/* LOGOUT */}

        <div className="border-t border-[#edf0ed] p-4">

          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-50"
          >
            <LogOut size={19} />
            {!collapsed && "Logout"}
          </button>

          {!collapsed && (
            <p className="mt-4 text-center text-[10px] text-gray-400">
              © 2026 MentorLagbe
            </p>
          )}

        </div>

      </aside>

      {/* ====================================== */}
      {/* MAIN CONTENT */}
      {/* ====================================== */}

      <div
        className={`
          min-h-screen transition-all duration-300
          ${collapsed ? "lg:ml-[88px]" : "lg:ml-[280px]"}
        `}
      >

        {/* HEADER */}

        <header className="sticky top-0 z-30 flex h-[82px] items-center justify-between border-b border-[#edf0ed] bg-white/95 px-5 backdrop-blur md:px-8">

          <div className="flex items-center gap-4">

            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-xl border border-[#e9ede9] p-2 text-gray-500 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>

            <div>

              <p className="text-[10px] font-bold uppercase tracking-[1.8px] text-gray-400">
                Student Portal / Administration
              </p>

              <h1 className="mt-0.5 text-lg font-extrabold tracking-tight text-[#17251d]">
                Applications Management
              </h1>

            </div>

          </div>

          <div className="flex items-center gap-3">

            <button
              onClick={() => setRefreshKey((value) => value + 1)}
              title="Refresh applications"
              disabled={loading}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e9ede9] text-gray-500 transition hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
            </button>

            <div className="hidden h-10 w-10 items-center justify-center rounded-xl border border-[#e9ede9] text-gray-500 sm:flex">
              <Bell size={19} />
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dceee3] text-xs font-extrabold text-[#075c3d]">
              {initials}
            </div>

          </div>

        </header>

        {/* PAGE CONTENT */}

        <main className="mx-auto max-w-[1600px] px-5 py-8 md:px-8 lg:px-10">

          {/* INTRODUCTION */}

          <section className="mb-8">

            <div className="mb-3 flex items-center gap-2">

              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              <p className="text-xs font-bold uppercase tracking-[2px] text-[#075c3d]">
                Platform Administration
              </p>

            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-[#17251d] md:text-4xl">
              Manage Applications
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-500 md:text-base">
              Monitor student applications across the platform,
              review applicant information and track tutor decisions.
            </p>

          </section>

          {/* ERROR MESSAGE */}

          {error && (
            <div className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">

              <div className="flex items-center gap-2">
                <AlertCircle size={17} />
                {error}
              </div>

              <button
                onClick={() => setError("")}
                aria-label="Dismiss error"
              >
                <X size={17} />
              </button>

            </div>
          )}

          {/* SUCCESS MESSAGE */}

          {notice && (
            <div className="mb-6 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">

              <span>{notice}</span>

              <button
                onClick={() => setNotice("")}
                aria-label="Dismiss notification"
              >
                <X size={17} />
              </button>

            </div>
          )}

          {/* ====================================== */}
          {/* STATISTICS */}
          {/* ====================================== */}

          <section className="mb-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-5">

            <StatCard
              title="Total Applications"
              value={stats.total}
              loading={loading}
              icon={<ClipboardList size={22} />}
              color="green"
            />

            <StatCard
              title="Pending Applications"
              value={stats.pending}
              loading={loading}
              icon={<Clock size={22} />}
              color="amber"
            />

            <StatCard
              title="Accepted Applications"
              value={stats.accepted}
              loading={loading}
              icon={<CheckCircle2 size={22} />}
              color="blue"
            />

            <StatCard
              title="Rejected Applications"
              value={stats.rejected}
              loading={loading}
              icon={<XCircle size={22} />}
              color="red"
            />

            <StatCard
              title="Cancelled Applications"
              value={stats.cancelled}
              loading={loading}
              icon={<AlertCircle size={22} />}
              color="purple"
            />

          </section>

          {/* ====================================== */}
          {/* APPLICATION TABLE */}
          {/* ====================================== */}

          <section className="overflow-hidden rounded-2xl border border-[#e8ece8] bg-white shadow-sm">

            {/* TABLE HEADER */}

            <div className="border-b border-[#edf0ed] p-5 md:p-6">

              <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">

                <div>

                  <h3 className="text-lg font-bold text-[#17251d]">
                    All Applications
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    {pagination.totalApplications} matching applications found
                  </p>

                </div>

                <button
                  onClick={resetFilters}
                  className="text-xs font-semibold text-[#075c3d] hover:underline"
                >
                  Clear filters
                </button>

              </div>

              {/* SEARCH AND FILTER */}

              <div className="grid gap-3 md:grid-cols-2">

                <div className="relative">

                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    placeholder="Search student, tutor or tuition..."
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(1);
                    }}
                    className="h-11 w-full rounded-xl border border-[#e4e9e4] bg-[#fafbfa] pl-10 pr-4 text-sm outline-none transition focus:border-[#075c3d] focus:ring-4 focus:ring-[#075c3d]/10"
                  />

                </div>

                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value);
                    setPage(1);
                  }}
                  className="h-11 rounded-xl border border-[#e4e9e4] bg-[#fafbfa] px-4 text-sm outline-none transition focus:border-[#075c3d]"
                >
                  <option value="all">All Application Status</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>

              </div>

            </div>

            {/* TABLE */}

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1150px] text-left">

                <thead className="bg-[#f8faf8]">

                  <tr>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                      Student
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                      Tutor
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                      Tuition
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                      Status
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                      Applied Date
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-400">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-[#edf0ed]">

                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">

                        <Loader2
                          size={30}
                          className="mx-auto animate-spin text-[#075c3d]"
                        />

                        <p className="mt-3 text-sm text-gray-400">
                          Loading applications...
                        </p>

                      </td>
                    </tr>
                  ) : applications.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">

                        <ClipboardList
                          size={42}
                          className="mx-auto text-gray-300"
                        />

                        <p className="mt-3 font-semibold text-gray-600">
                          No applications found
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          Try changing your search or status filter.
                        </p>

                      </td>
                    </tr>
                  ) : (
                    applications.map((application) => (
                      <tr
                        key={application._id}
                        className="transition hover:bg-[#fafcfa]"
                      >

                        {/* STUDENT */}

                        <td className="px-5 py-5">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eaf4ed] text-xs font-bold text-[#075c3d]">
                              {getInitials(application.studentName)}
                            </div>

                            <div className="min-w-0">

                              <p className="font-semibold text-[#17251d]">
                                {application.studentName || "Unknown student"}
                              </p>

                              <p className="mt-1 max-w-[190px] truncate text-xs text-gray-500">
                                {application.studentEmail || "No email"}
                              </p>

                              <p className="mt-1 text-[11px] text-gray-400">
                                {application.studentPhone || "No phone"}
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* TUTOR */}

                        <td className="px-5 py-5">

                          <p className="font-semibold text-[#17251d]">
                            {application.tutorName || "Unknown tutor"}
                          </p>

                          <p className="mt-1 max-w-[190px] truncate text-xs text-gray-500">
                            {application.tutorEmail || "No email"}
                          </p>

                        </td>

                        {/* TUITION */}

                        <td className="px-5 py-5">

                          <p className="max-w-[200px] font-semibold text-[#17251d]">
                            {application.tuitionTitle || "Untitled tuition"}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {application.subject || "Subject not specified"}
                          </p>

                          <p className="mt-1 text-xs font-semibold text-[#075c3d]">
                            {formatCurrency(application.monthlyFee)}
                          </p>

                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-5">

                          <StatusBadge
                            status={application.status || "pending"}
                          />

                        </td>

                        {/* DATE */}

                        <td className="px-5 py-5 text-sm text-gray-500">
                          {formatDate(application.appliedAt)}
                        </td>

                        {/* ACTIONS */}

                        <td className="px-5 py-5">

                          <div className="flex justify-end">

                            <button
                              onClick={() =>
                                viewApplication(application._id)
                              }
                              title="View application details"
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e4e9e4] text-gray-500 transition hover:border-[#075c3d] hover:bg-[#eaf4ed] hover:text-[#075c3d]"
                            >
                              <Eye size={17} />
                            </button>

                          </div>

                        </td>

                      </tr>
                    ))
                  )}

                </tbody>

              </table>

            </div>

            {/* PAGINATION */}

            <div className="flex flex-col justify-between gap-4 border-t border-[#edf0ed] px-6 py-5 sm:flex-row sm:items-center">

              <p className="text-xs text-gray-500">

                Showing{" "}

                {pagination.totalApplications === 0
                  ? 0
                  : (page - 1) * pagination.limit + 1}

                {" "}to{" "}

                {Math.min(
                  page * pagination.limit,
                  pagination.totalApplications
                )}

                {" "}of {pagination.totalApplications} applications

              </p>

              <div className="flex items-center gap-2">

                <button
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((value) => value - 1)}
                  className="flex h-9 items-center gap-1 rounded-lg border border-[#e4e9e4] px-3 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
                >
                  <ChevronLeft size={15} />
                  Previous
                </button>

                <span className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-[#075c3d] px-3 text-xs font-bold text-white">
                  {page}
                </span>

                <button
                  disabled={
                    page >= pagination.totalPages || loading
                  }
                  onClick={() => setPage((value) => value + 1)}
                  className="flex h-9 items-center gap-1 rounded-lg border border-[#e4e9e4] px-3 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={15} />
                </button>

              </div>

            </div>

          </section>

          {/* FOOTER */}

          <footer className="mt-10 border-t border-[#e7ebe7] py-6">

            <div className="flex flex-col justify-between gap-3 text-center sm:flex-row sm:text-left">

              <p className="text-xs text-gray-400">
                © 2026 MentorLagbe. All rights reserved.
              </p>

              <p className="text-xs text-gray-400">
                Applications Management
              </p>

            </div>

          </footer>

        </main>

      </div>

      {/* ====================================== */}
      {/* APPLICATION DETAILS MODAL */}
      {/* ====================================== */}

      {(detailsLoading || selectedApplication) && (

        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
          onClick={() => {
            if (!detailsLoading) {
              setSelectedApplication(null);
            }
          }}
        >

          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >

            {detailsLoading ? (

              <div className="py-16 text-center">

                <Loader2
                  size={32}
                  className="mx-auto animate-spin text-[#075c3d]"
                />

                <p className="mt-4 text-sm text-gray-500">
                  Loading application details...
                </p>

              </div>

            ) : selectedApplication ? (

              <>

                {/* MODAL HEADER */}

                <div className="mb-6 flex items-center justify-between">

                  <div>

                    <h3 className="text-xl font-bold text-[#17251d]">
                      Application Details
                    </h3>

                    <p className="mt-1 text-xs text-gray-400">
                      Complete application information
                    </p>

                  </div>

                  <button
                    onClick={() => setSelectedApplication(null)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition hover:bg-gray-200"
                    aria-label="Close details"
                  >
                    <X size={19} />
                  </button>

                </div>

                {/* APPLICATION STATUS */}

                <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#f5f8f5] p-4">

                  <div>

                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Application Status
                    </p>

                    <div className="mt-2">
                      <StatusBadge
                        status={selectedApplication.status || "pending"}
                      />
                    </div>

                  </div>

                  <div className="text-right">

                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Application ID
                    </p>

                    <p className="mt-2 max-w-[190px] break-all text-xs font-semibold text-gray-600">
                      {selectedApplication._id}
                    </p>

                  </div>

                </div>

                {/* STUDENT INFORMATION */}

                <DetailSection title="Student Information">

                  <DetailRow
                    icon={<UserRound size={17} />}
                    label="Student Name"
                    value={selectedApplication.studentName || "Not available"}
                  />

                  <DetailRow
                    icon={<Mail size={17} />}
                    label="Email Address"
                    value={selectedApplication.studentEmail || "Not available"}
                  />

                  <DetailRow
                    icon={<Phone size={17} />}
                    label="Phone Number"
                    value={selectedApplication.studentPhone || "Not available"}
                  />

                </DetailSection>

                {/* TUTOR INFORMATION */}

                <DetailSection title="Tutor Information">

                  <DetailRow
                    icon={<GraduationCap size={17} />}
                    label="Tutor Name"
                    value={selectedApplication.tutorName || "Not available"}
                  />

                  <DetailRow
                    icon={<Mail size={17} />}
                    label="Tutor Email"
                    value={selectedApplication.tutorEmail || "Not available"}
                  />

                </DetailSection>

                {/* TUITION INFORMATION */}

                <DetailSection title="Tuition Information">

                  <DetailRow
                    icon={<BookOpen size={17} />}
                    label="Tuition Title"
                    value={selectedApplication.tuitionTitle || "Not available"}
                  />

                  <DetailRow
                    icon={<FileText size={17} />}
                    label="Subject"
                    value={selectedApplication.subject || "Not available"}
                  />

                  <DetailRow
                    icon={<Hash size={17} />}
                    label="Tuition ID"
                    value={selectedApplication.tuitionId || "Not available"}
                  />

                  <DetailRow
                    icon={<Wallet size={17} />}
                    label="Monthly Fee"
                    value={formatCurrency(selectedApplication.monthlyFee)}
                  />

                </DetailSection>

                {/* APPLICATION INFORMATION */}

                <DetailSection title="Application Information">

                  <DetailRow
                    icon={<CalendarDays size={17} />}
                    label="Application Date"
                    value={formatDateTime(selectedApplication.appliedAt)}
                  />

                  <DetailRow
                    icon={<Clock size={17} />}
                    label="Preferred Schedule"
                    value={selectedApplication.preferredSchedule || "Not specified"}
                  />

                  {selectedApplication.reviewedAt && (
                    <DetailRow
                      icon={<CheckCircle2 size={17} />}
                      label="Reviewed Date"
                      value={formatDateTime(selectedApplication.reviewedAt)}
                    />
                  )}

                  {selectedApplication.cancelledAt && (
                    <DetailRow
                      icon={<XCircle size={17} />}
                      label="Cancellation Date"
                      value={formatDateTime(selectedApplication.cancelledAt)}
                    />
                  )}

                </DetailSection>

                {/* STUDENT NOTE */}

                <div className="mt-6">

                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                    Student Note
                  </p>

                  <div className="rounded-xl bg-[#f7f9f7] p-4">

                    <p className="whitespace-pre-wrap break-words text-sm leading-7 text-gray-600">
                      {selectedApplication.studentNote?.trim()
                        || "No additional note provided."}
                    </p>

                  </div>

                </div>

                {/* ADMIN NOTICE */}

                <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">

                  <p className="text-xs leading-6 text-blue-700">
                    This is a read-only administrative view.
                    Application acceptance and rejection remain
                    under the tutor's control.
                  </p>

                </div>

                {/* MODAL FOOTER */}

                <div className="mt-7 flex justify-end">

                  <button
                    onClick={() => setSelectedApplication(null)}
                    className="rounded-xl bg-[#075c3d] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#064a31]"
                  >
                    Close
                  </button>

                </div>

              </>

            ) : null}

          </div>

        </div>

      )}

    </div>
  );
}

// ==========================================
// STATISTICS CARD
// ==========================================

function StatCard({
  title,
  value,
  icon,
  color,
  loading,
}: {
  title: string;
  value: number;
  icon: ReactNode;
  color: "green" | "blue" | "amber" | "red" | "purple";
  loading: boolean;
}) {
  const styles = {
    green: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
    purple: "bg-purple-50 text-purple-700",
  };

  return (
    <div className="rounded-2xl border border-[#e8ece8] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gray-50">

        <span
          className={`flex h-full w-full items-center justify-center rounded-xl ${styles[color]}`}
        >
          {icon}
        </span>

      </div>

      <p className="text-xs font-medium leading-5 text-gray-500">
        {title}
      </p>

      <h3 className="mt-2 text-3xl font-extrabold tracking-tight text-[#17251d]">

        {loading ? (
          <Loader2
            size={23}
            className="animate-spin text-[#075c3d]"
          />
        ) : (
          value.toLocaleString()
        )}

      </h3>

    </div>
  );
}

// ==========================================
// STATUS BADGE
// ==========================================

function StatusBadge({ status }: { status: string }) {
  const normalizedStatus = status.toLowerCase();

  const styles: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-100",
    accepted: "bg-emerald-50 text-emerald-700 border-emerald-100",
    rejected: "bg-red-50 text-red-600 border-red-100",
    cancelled: "bg-gray-100 text-gray-600 border-gray-200",
  };

  const icons: Record<string, ReactNode> = {
    pending: <Clock size={12} />,
    accepted: <CheckCircle2 size={12} />,
    rejected: <XCircle size={12} />,
    cancelled: <AlertCircle size={12} />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold capitalize ${styles[normalizedStatus] || styles.pending
        }`}
    >
      {icons[normalizedStatus] || icons.pending}
      {normalizedStatus}
    </span>
  );
}

// ==========================================
// DETAIL SECTION
// ==========================================

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-6">

      <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#075c3d]">
        {title}
      </h4>

      <div className="space-y-4">
        {children}
      </div>

    </div>
  );
}

// ==========================================
// DETAIL ROW
// ==========================================

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-gray-100 pb-3">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f2f7f3] text-[#075c3d]">
        {icon}
      </div>

      <div className="min-w-0 flex-1">

        <p className="text-[11px] text-gray-400">
          {label}
        </p>

        <p className="mt-1 break-all text-sm font-semibold capitalize text-gray-700">
          {value}
        </p>

      </div>

    </div>
  );
}
