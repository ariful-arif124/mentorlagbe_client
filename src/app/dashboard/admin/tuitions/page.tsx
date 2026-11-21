
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  UserRound,
  ShieldCheck,
  Home,
  Eye,
  Check,
  XCircle,
  Power,
  ChevronLeft,
  ChevronRight,
  MapPin,
  CalendarDays,
  RefreshCw,
  Filter,
  Monitor,
  Wallet,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

type AdminUser = {
  name?: string;
  email?: string;
  role?: string;
};

type ApprovalStatus = "pending" | "approved" | "rejected";

type Tuition = {
  _id: string;
  title?: string;
  subject?: string;
  classLevel?: string;
  mode?: string;
  location?: string;
  monthlyFee?: number;
  daysPerWeek?: number;
  bannerImage?: string;
  description?: string;
  tutorName?: string;
  tutorEmail?: string;
  approvalStatus?: ApprovalStatus;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
};

type TuitionStats = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  active: number;
};

type Pagination = {
  currentPage: number;
  limit: number;
  totalTuitions: number;
  totalPages: number;
};

const navigation = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "User Management", icon: Users },
  { label: "Tutors", icon: GraduationCap },
  { label: "Students", icon: UserRound },
  { label: "Tuition Management", icon: BookOpen },
  { label: "Applications", icon: ClipboardList },
  { label: "Payments", icon: CreditCard },
];

export default function AdminTuitionManagement() {
  const router = useRouter();

  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState("");

  const [tuitions, setTuitions] = useState<Tuition[]>([]);

  const [stats, setStats] = useState<TuitionStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    active: 0,
  });

  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    limit: 10,
    totalTuitions: 0,
    totalPages: 0,
  });

  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [approvalFilter, setApprovalFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("");

  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const [selectedTuition, setSelectedTuition] =
    useState<Tuition | null>(null);

  const [actionLoadingId, setActionLoadingId] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);

  const clearAuthentication = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("mentorlagbe_token");
    localStorage.removeItem("mentorlagbe_user");

    router.replace("/sign-in");
  };

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

      setUser(parsedUser);
      setToken(storedToken);
      setAuthReady(true);
    } catch {
      clearAuthentication();
    }
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput.trim());
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    async function loadStats() {
      setStatsLoading(true);

      try {
        const response = await fetch(`${API_URL}/admin/stats`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const result = await response.json();

        if (response.status === 401) {
          clearAuthentication();
          return;
        }

        if (!response.ok) {
          throw new Error(
            result.message || "Failed to load tuition statistics"
          );
        }

        if (!cancelled) {
          const tuitionStats = result.data?.tuitions || {};

          setStats({
            total: tuitionStats.total || 0,
            pending: tuitionStats.pending || 0,
            approved: tuitionStats.approved || 0,
            rejected: tuitionStats.rejected || 0,
            active: tuitionStats.active || 0,
          });
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Tuition statistics error:", error);
          setPageError(
            error instanceof Error
              ? error.message
              : "Failed to load statistics"
          );
        }
      } finally {
        if (!cancelled) {
          setStatsLoading(false);
        }
      }
    }

    loadStats();

    return () => {
      cancelled = true;
    };
  }, [token, refreshKey]);

  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();

    async function loadTuitions() {
      setLoading(true);
      setPageError("");

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "10",
          approvalStatus: approvalFilter,
          status: statusFilter,
        });

        if (searchQuery) {
          params.set("search", searchQuery);
        }

        if (subjectFilter.trim()) {
          params.set("subject", subjectFilter.trim());
        }

        const response = await fetch(
          `${API_URL}/admin/tuitions?${params.toString()}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const result = await response.json();

        if (response.status === 401) {
          clearAuthentication();
          return;
        }

        if (!response.ok) {
          throw new Error(
            result.message || "Failed to load tuition posts"
          );
        }

        setTuitions(result.data?.tuitions || []);

        setPagination(
          result.data?.pagination || {
            currentPage: 1,
            limit: 10,
            totalTuitions: 0,
            totalPages: 0,
          }
        );
      } catch (error) {
        if (
          error instanceof Error &&
          error.name !== "AbortError"
        ) {
          console.error("Load tuitions error:", error);
          setPageError(
            error.message || "Unable to load tuition posts"
          );
          setTuitions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadTuitions();

    return () => {
      controller.abort();
    };
  }, [
    token,
    page,
    searchQuery,
    approvalFilter,
    statusFilter,
    subjectFilter,
    refreshKey,
  ]);

  function handleLogout() {
    clearAuthentication();
  }

  async function viewTuition(tuition: Tuition) {
    setSelectedTuition(tuition);
    setDetailLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/admin/tuitions/${encodeURIComponent(tuition._id)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (response.status === 401) {
        clearAuthentication();
        return;
      }

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to load tuition details"
        );
      }

      setSelectedTuition(result.data);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load tuition details"
      );
    } finally {
      setDetailLoading(false);
    }
  }

  async function updateApproval(
    tuition: Tuition,
    approvalStatus: "approved" | "rejected"
  ) {
    const action =
      approvalStatus === "approved" ? "approve" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this tuition?`
    );

    if (!confirmed) return;

    setActionLoadingId(tuition._id);

    try {
      const response = await fetch(
        `${API_URL}/admin/tuitions/${encodeURIComponent(tuition._id)}/approval`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ approvalStatus }),
        }
      );

      const result = await response.json();

      if (response.status === 401) {
        clearAuthentication();
        return;
      }

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to update approval status"
        );
      }

      toast.success(result.message || "Tuition status updated");

      setSelectedTuition((current) =>
        current?._id === tuition._id ? result.data : current
      );

      setRefreshKey((current) => current + 1);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update tuition"
      );
    } finally {
      setActionLoadingId("");
    }
  }

  async function updateTuitionStatus(tuition: Tuition) {
    const nextStatus = !tuition.isActive;

    if (
      nextStatus &&
      tuition.approvalStatus !== "approved"
    ) {
      toast.error("Only approved tuitions can be activated");
      return;
    }

    const confirmed = window.confirm(
      nextStatus
        ? "Are you sure you want to activate this tuition?"
        : "Are you sure you want to deactivate this tuition?"
    );

    if (!confirmed) return;

    setActionLoadingId(tuition._id);

    try {
      const response = await fetch(
        `${API_URL}/admin/tuitions/${encodeURIComponent(tuition._id)}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isActive: nextStatus }),
        }
      );

      const result = await response.json();

      if (response.status === 401) {
        clearAuthentication();
        return;
      }

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to update tuition status"
        );
      }

      toast.success(result.message || "Tuition status updated");

      setSelectedTuition((current) =>
        current?._id === tuition._id ? result.data : current
      );

      setRefreshKey((current) => current + 1);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update tuition status"
      );
    } finally {
      setActionLoadingId("");
    }
  }

  function resetFilters() {
    setSearchInput("");
    setSearchQuery("");
    setApprovalFilter("all");
    setStatusFilter("all");
    setSubjectFilter("");
    setPage(1);
  }

  const initials = (user?.name || "Admin")
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8f6]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#dcebe2] border-t-[#075c3d]" />
          <p className="mt-4 text-sm text-gray-500">
            Loading Tuition Management...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8f6] text-[#17221d]">
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          border-r border-[#e9ede9] bg-white
          transition-all duration-300
          ${collapsed ? "lg:w-[85px]" : "lg:w-[265px]"}
          w-[265px]
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex h-[76px] items-center justify-between border-b border-[#edf0ed] px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#075c3d] text-white">
              <GraduationCap size={24} />
            </div>

            {!collapsed && (
              <div>
                <h2 className="text-lg font-extrabold tracking-tight">
                  Mentor<span className="text-[#075c3d]">Lagbe</span>
                </h2>
                <p className="text-[10px] font-semibold uppercase tracking-[2px] text-gray-400">
                  Administration
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="text-gray-400 lg:hidden"
          >
            <X size={21} />
          </button>
        </div>

        <div className="border-b border-[#edf0ed] p-4">
          <div className="flex items-center gap-3 rounded-xl bg-[#f6f8f6] p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#dceee3] font-bold text-[#075c3d]">
              {initials}
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">
                  {user?.name || "Administrator"}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {user?.email}
                </p>
                <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold uppercase text-[#075c3d]">
                  <ShieldCheck size={12} />
                  Administrator
                </span>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
          {!collapsed && (
            <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[2px] text-gray-400">
              Main Menu
            </p>
          )}

          {navigation.map((item) => {
            const Icon = item.icon;

            const implemented =
              item.label === "Overview" ||
              item.label === "User Management" ||
              item.label === "Tutors" ||
              item.label === "Students" ||
              item.label === "Tuition Management" ||
              item.label === "Applications" ||
              item.label === "Payments";

            const active = item.label === "Tuition Management";

            return (
              <button
                key={item.label}
                type="button"
                title={collapsed ? item.label : ""}
                disabled={!implemented}
                onClick={() => {
                  if (item.label === "Overview") {
                    router.push("/dashboard/admin");
                  } else if (item.label === "User Management") {
                    router.push("/dashboard/admin/users");
                  } else if (item.label === "Tutors") {
                    router.push("/dashboard/admin/tutors");
                  } else if (item.label === "Students") {
                    router.push("/dashboard/admin/students");
                  } else if (item.label === "Tuition Management") {
                    router.push("/dashboard/admin/tuitions");
                  }
                  else if (item.label === "Applications") {
                    router.push("/dashboard/admin/applications");
                  }
                  else if (item.label === "Payments") {
                    router.push("/dashboard/admin/payments");
                  }

                  setMobileOpen(false);
                }}
                className={`
                  flex w-full items-center gap-3 rounded-xl px-3 py-3
                  text-left text-sm font-medium transition
                  ${active
                    ? "bg-[#eaf4ed] text-[#075c3d]"
                    : "text-gray-500 hover:bg-[#f5f7f5] hover:text-[#075c3d]"
                  }
                  ${implemented
                    ? "cursor-pointer"
                    : "cursor-not-allowed opacity-60"
                  }
                `}
              >
                <Icon size={19} />

                {!collapsed && (
                  <>
                    <span>{item.label}</span>
                    {!implemented && (
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

        <div className="border-t border-[#edf0ed] p-4">
          {!collapsed && (
            <div className="mb-4 rounded-xl bg-[#f2f7f3] p-4">
              <div className="flex items-center gap-2 text-[#075c3d]">
                <ShieldCheck size={18} />
                <span className="text-xs font-bold">
                  Admin Control Center
                </span>
              </div>

              <p className="mt-2 text-xs leading-5 text-gray-500">
                Manage and monitor the MentorLagbe platform.
              </p>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-50"
          >
            <LogOut size={19} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div
        className={`
          min-h-screen transition-all duration-300
          ${collapsed ? "lg:pl-[85px]" : "lg:pl-[265px]"}
        `}
      >
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[#e9ede9] bg-white/95 px-5 backdrop-blur md:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="text-gray-500 lg:hidden"
            >
              <Menu size={23} />
            </button>

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 lg:block"
              title="Toggle sidebar"
            >
              <Menu size={21} />
            </button>

            <div>
              <p className="text-xs text-gray-400">
                MentorLagbe / Administration / Tuitions
              </p>
              <h1 className="text-lg font-bold">
                Tuition Management
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setRefreshKey((current) => current + 1)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e9ede9] text-gray-500 transition hover:bg-[#f5f7f5]"
              title="Refresh data"
            >
              <RefreshCw size={17} />
            </button>

            <div className="hidden h-10 w-10 items-center justify-center rounded-xl border border-[#e9ede9] text-gray-500 md:flex">
              <Bell size={19} />
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dceee3] text-sm font-bold text-[#075c3d]">
              {initials}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] px-5 py-8 md:px-8 lg:px-10">
          <section className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <p className="text-xs font-bold uppercase tracking-[2px] text-[#075c3d]">
                  Administration
                </p>
              </div>

              <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
                Tuition Management
              </h2>

              <p className="mt-3 text-sm text-gray-500 md:text-base">
                Review, approve and manage tuition listings across MentorLagbe.
              </p>
            </div>

            <button
              onClick={() => router.push("/")}
              className="flex items-center justify-center gap-2 rounded-xl border border-[#e1e8e2] bg-white px-5 py-3 text-sm font-semibold text-[#075c3d] shadow-sm transition hover:bg-[#f2f7f3]"
            >
              <Home size={17} />
              Visit Website
              <ArrowUpRight size={16} />
            </button>
          </section>

          {pageError && (
            <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              <span>{pageError}</span>
              <button
                onClick={() => setRefreshKey((current) => current + 1)}
                className="font-semibold underline"
              >
                Retry
              </button>
            </div>
          )}

          <section className="mb-9">
            <div className="mb-5">
              <h3 className="text-lg font-bold">
                Tuition Overview
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Total listings and approval statistics
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
              <StatCard
                title="Total Tuitions"
                value={stats.total}
                description="All tuition listings"
                icon={<BookOpen size={22} />}
                color="blue"
                loading={statsLoading}
              />

              <StatCard
                title="Pending Approval"
                value={stats.pending}
                description="Waiting for review"
                icon={<Clock size={22} />}
                color="amber"
                loading={statsLoading}
              />

              <StatCard
                title="Approved"
                value={stats.approved}
                description="Approved listings"
                icon={<CheckCircle2 size={22} />}
                color="green"
                loading={statsLoading}
              />

              <StatCard
                title="Rejected"
                value={stats.rejected}
                description="Rejected listings"
                icon={<XCircle size={22} />}
                color="purple"
                loading={statsLoading}
              />

              <StatCard
                title="Active Tuitions"
                value={stats.active}
                description="Currently visible listings"
                icon={<Power size={22} />}
                color="green"
                loading={statsLoading}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-[#e8ece8] bg-white p-5 shadow-sm md:p-6">
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h3 className="text-lg font-bold">
                  All Tuition Listings
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Search, review and manage tuition posts
                </p>
              </div>

              <div className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-bold text-[#075c3d]">
                  {tuitions.length}
                </span>{" "}
                of{" "}
                <span className="font-bold text-gray-800">
                  {pagination.totalTuitions}
                </span>{" "}
                listings
              </div>
            </div>

            <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="relative sm:col-span-2">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search title, tutor, email or location..."
                  className="h-11 w-full rounded-xl border border-[#e5eae5] bg-[#fafbfa] pl-10 pr-4 text-sm outline-none transition focus:border-[#075c3d] focus:ring-2 focus:ring-[#075c3d]/10"
                />
              </div>

              <select
                value={approvalFilter}
                onChange={(event) => {
                  setApprovalFilter(event.target.value);
                  setPage(1);
                }}
                className="h-11 rounded-xl border border-[#e5eae5] bg-[#fafbfa] px-3 text-sm text-gray-600 outline-none focus:border-[#075c3d]"
              >
                <option value="all">All Approval Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setPage(1);
                }}
                className="h-11 rounded-xl border border-[#e5eae5] bg-[#fafbfa] px-3 text-sm text-gray-600 outline-none focus:border-[#075c3d]"
              >
                <option value="all">All Listing Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <input
                type="text"
                value={subjectFilter}
                onChange={(event) => {
                  setSubjectFilter(event.target.value);
                  setPage(1);
                }}
                placeholder="Filter by subject..."
                className="h-11 rounded-xl border border-[#e5eae5] bg-[#fafbfa] px-4 text-sm outline-none focus:border-[#075c3d]"
              />

              <button
                onClick={resetFilters}
                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#e5eae5] px-4 text-sm font-semibold text-gray-500 transition hover:bg-gray-50"
              >
                <Filter size={16} />
                Clear Filters
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left">
                <thead>
                  <tr className="border-y border-[#edf0ed] bg-[#fafbfa] text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    <th className="px-4 py-4">Tuition</th>
                    <th className="px-4 py-4">Tutor</th>
                    <th className="px-4 py-4">Subject / Class</th>
                    <th className="px-4 py-4">Mode / Location</th>
                    <th className="px-4 py-4">Monthly Fee</th>
                    <th className="px-4 py-4">Approval</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#edf0ed]">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center">
                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#dcebe2] border-t-[#075c3d]" />
                        <p className="mt-3 text-sm text-gray-500">
                          Loading tuition listings...
                        </p>
                      </td>
                    </tr>
                  ) : tuitions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f1f6f2] text-[#075c3d]">
                          <BookOpen size={25} />
                        </div>
                        <h4 className="mt-4 font-bold text-gray-700">
                          No tuition listings found
                        </h4>
                        <p className="mt-2 text-sm text-gray-400">
                          Try changing your search or filters.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    tuitions.map((tuition) => (
                      <tr
                        key={tuition._id}
                        className="transition hover:bg-[#fafcfa]"
                      >
                        <td className="max-w-[220px] px-4 py-4">
                          <div className="flex items-center gap-3">
                            {tuition.bannerImage ? (
                              <img
                                src={tuition.bannerImage}
                                alt={tuition.title || "Tuition"}
                                className="h-12 w-12 shrink-0 rounded-xl object-cover"
                              />
                            ) : (
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#eaf4ed] text-[#075c3d]">
                                <BookOpen size={20} />
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-gray-800">
                                {tuition.title || "Untitled Tuition"}
                              </p>
                              <p className="mt-1 text-[11px] text-gray-400">
                                {formatDate(tuition.createdAt)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <p className="text-sm font-semibold text-gray-700">
                            {tuition.tutorName || "Unknown Tutor"}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {tuition.tutorEmail || "No email"}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <p className="text-sm font-semibold text-gray-700">
                            {tuition.subject || "N/A"}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {tuition.classLevel || "N/A"}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <p className="flex items-center gap-1.5 text-sm text-gray-700">
                            <Monitor size={14} className="text-gray-400" />
                            {tuition.mode || "N/A"}
                          </p>
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
                            <MapPin size={13} />
                            {tuition.location || "N/A"}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <p className="text-sm font-bold text-gray-700">
                            {formatCurrency(tuition.monthlyFee)}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {tuition.daysPerWeek || 0} days/week
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <ApprovalBadge
                            status={tuition.approvalStatus || "pending"}
                          />
                        </td>

                        <td className="px-4 py-4">
                          <StatusBadge active={!!tuition.isActive} />
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <ActionButton
                              title="View details"
                              onClick={() => viewTuition(tuition)}
                              icon={<Eye size={16} />}
                              color="blue"
                            />

                            {tuition.approvalStatus !== "approved" && (
                              <ActionButton
                                title="Approve tuition"
                                onClick={() =>
                                  updateApproval(tuition, "approved")
                                }
                                icon={<Check size={16} />}
                                color="green"
                                disabled={actionLoadingId === tuition._id}
                              />
                            )}

                            {tuition.approvalStatus !== "rejected" && (
                              <ActionButton
                                title="Reject tuition"
                                onClick={() =>
                                  updateApproval(tuition, "rejected")
                                }
                                icon={<XCircle size={16} />}
                                color="red"
                                disabled={actionLoadingId === tuition._id}
                              />
                            )}

                            <ActionButton
                              title={
                                tuition.isActive
                                  ? "Deactivate tuition"
                                  : "Activate tuition"
                              }
                              onClick={() => updateTuitionStatus(tuition)}
                              icon={<Power size={16} />}
                              color={tuition.isActive ? "amber" : "green"}
                              disabled={
                                actionLoadingId === tuition._id ||
                                (!tuition.isActive &&
                                  tuition.approvalStatus !== "approved")
                              }
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-[#edf0ed] pt-5 sm:flex-row">
              <p className="text-xs text-gray-500">
                Page{" "}
                <span className="font-bold text-gray-800">
                  {pagination.totalPages > 0 ? page : 0}
                </span>{" "}
                of{" "}
                <span className="font-bold text-gray-800">
                  {pagination.totalPages}
                </span>
                {" "}({pagination.totalTuitions} results)
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page <= 1 || loading}
                  className="flex h-9 items-center gap-1 rounded-lg border border-[#e5eae5] px-3 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={15} />
                  Previous
                </button>

                <button
                  onClick={() =>
                    setPage((current) =>
                      Math.min(pagination.totalPages, current + 1)
                    )
                  }
                  disabled={
                    page >= pagination.totalPages || loading
                  }
                  className="flex h-9 items-center gap-1 rounded-lg border border-[#e5eae5] px-3 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </section>

          <footer className="mt-12 border-t border-[#e7ebe7] py-6">
            <div className="flex flex-col justify-between gap-3 text-center sm:flex-row sm:text-left">
              <p className="text-xs text-gray-400">
                © 2026 MentorLagbe. All rights reserved.
              </p>
              <p className="text-xs text-gray-400">
                Administration Dashboard
              </p>
            </div>
          </footer>
        </main>
      </div>

      {selectedTuition && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
          onClick={() => setSelectedTuition(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="tuition-details-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#edf0ed] bg-white px-6 py-5">
              <div>
                <h3
                  id="tuition-details-title"
                  className="text-lg font-bold"
                >
                  Tuition Details
                </h3>
                <p className="mt-1 text-xs text-gray-400">
                  Complete tuition listing information
                </p>
              </div>

              <button
                onClick={() => setSelectedTuition(null)}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            {detailLoading ? (
              <div className="flex justify-center py-16">
                <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#dcebe2] border-t-[#075c3d]" />
              </div>
            ) : (
              <div className="p-6">
                {selectedTuition.bannerImage && (
                  <img
                    src={selectedTuition.bannerImage}
                    alt={selectedTuition.title || "Tuition"}
                    className="mb-6 h-48 w-full rounded-xl object-cover"
                  />
                )}

                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <h4 className="text-xl font-extrabold text-gray-800">
                      {selectedTuition.title}
                    </h4>
                    <p className="mt-2 text-sm text-gray-500">
                      {selectedTuition.subject} · {selectedTuition.classLevel}
                    </p>
                  </div>

                  <ApprovalBadge
                    status={selectedTuition.approvalStatus || "pending"}
                  />
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <DetailItem
                    label="Tutor Name"
                    value={selectedTuition.tutorName}
                    icon={<UserRound size={17} />}
                  />

                  <DetailItem
                    label="Tutor Email"
                    value={selectedTuition.tutorEmail}
                    icon={<Users size={17} />}
                  />

                  <DetailItem
                    label="Teaching Mode"
                    value={selectedTuition.mode}
                    icon={<Monitor size={17} />}
                  />

                  <DetailItem
                    label="Location"
                    value={selectedTuition.location}
                    icon={<MapPin size={17} />}
                  />

                  <DetailItem
                    label="Monthly Fee"
                    value={formatCurrency(selectedTuition.monthlyFee)}
                    icon={<Wallet size={17} />}
                  />

                  <DetailItem
                    label="Days Per Week"
                    value={`${selectedTuition.daysPerWeek || 0} days`}
                    icon={<CalendarDays size={17} />}
                  />

                  <DetailItem
                    label="Created At"
                    value={formatDate(selectedTuition.createdAt)}
                    icon={<CalendarDays size={17} />}
                  />

                  <DetailItem
                    label="Listing Status"
                    value={selectedTuition.isActive ? "Active" : "Inactive"}
                    icon={<Power size={17} />}
                  />
                </div>

                <div className="mt-6 rounded-xl bg-[#f7f9f7] p-4">
                  <h5 className="text-sm font-bold text-gray-700">
                    Description
                  </h5>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-gray-500">
                    {selectedTuition.description || "No description provided."}
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap justify-end gap-3">
                  {selectedTuition.approvalStatus !== "approved" && (
                    <button
                      disabled={actionLoadingId === selectedTuition._id}
                      onClick={() =>
                        updateApproval(selectedTuition, "approved")
                      }
                      className="flex items-center gap-2 rounded-xl bg-[#075c3d] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#064a32] disabled:opacity-50"
                    >
                      <Check size={16} />
                      Approve
                    </button>
                  )}

                  {selectedTuition.approvalStatus !== "rejected" && (
                    <button
                      disabled={actionLoadingId === selectedTuition._id}
                      onClick={() =>
                        updateApproval(selectedTuition, "rejected")
                      }
                      className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                    >
                      <XCircle size={16} />
                      Reject
                    </button>
                  )}

                  <button
                    disabled={
                      actionLoadingId === selectedTuition._id ||
                      (!selectedTuition.isActive &&
                        selectedTuition.approvalStatus !== "approved")
                    }
                    onClick={() => updateTuitionStatus(selectedTuition)}
                    className="flex items-center gap-2 rounded-xl border border-[#e5eae5] px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Power size={16} />
                    {selectedTuition.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


function StatCard({
  title,
  value,
  description,
  icon,
  color,
  loading,
}: {
  title: string;
  value: number;
  description: string;
  icon: ReactNode;
  color: "green" | "blue" | "purple" | "amber";
  loading: boolean;
}) {
  const styles = {
    green: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    purple: "bg-purple-50 text-purple-700",
    amber: "bg-amber-50 text-amber-700",
  };

  return (
    <div className="group rounded-2xl border border-[#e8ece8] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="mb-5 flex items-center justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${styles[color]}`}
        >
          {icon}
        </div>

        <ArrowUpRight
          size={18}
          className="text-gray-300 transition group-hover:text-[#075c3d]"
        />
      </div>

      <p className="text-sm font-medium text-gray-500">{title}</p>

      <h3 className="mt-2 text-3xl font-extrabold tracking-tight">
        {loading ? "..." : value.toLocaleString()}
      </h3>

      <p className="mt-2 text-xs text-gray-400">{description}</p>
    </div>
  );
}


function ApprovalBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-100",
    approved: "bg-emerald-50 text-emerald-700 border-emerald-100",
    rejected: "bg-red-50 text-red-600 border-red-100",
  };

  const icons: Record<string, ReactNode> = {
    pending: <Clock size={12} />,
    approved: <CheckCircle2 size={12} />,
    rejected: <XCircle size={12} />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold capitalize ${styles[status] || styles.pending
        }`}
    >
      {icons[status] || icons.pending}
      {status}
    </span>
  );
}


function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${active
        ? "bg-emerald-50 text-emerald-700"
        : "bg-gray-100 text-gray-500"
        }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-gray-400"
          }`}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}


function ActionButton({
  title,
  onClick,
  icon,
  color,
  disabled = false,
}: {
  title: string;
  onClick: () => void;
  icon: ReactNode;
  color: "blue" | "green" | "red" | "amber";
  disabled?: boolean;
}) {
  const styles = {
    blue: "bg-blue-50 text-blue-600 hover:bg-blue-100",
    green: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    red: "bg-red-50 text-red-600 hover:bg-red-100",
    amber: "bg-amber-50 text-amber-700 hover:bg-amber-100",
  };

  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-8 w-8 items-center justify-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-40 ${styles[color]}`}
    >
      {icon}
    </button>
  );
}


function DetailItem({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[#edf0ed] p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eaf4ed] text-[#075c3d]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
          {label}
        </p>
        <p className="mt-1 break-words text-sm font-semibold text-gray-700">
          {value || "N/A"}
        </p>
      </div>
    </div>
  );
}


function formatDate(date?: string) {
  if (!date) return "N/A";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "N/A";

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}


function formatCurrency(amount?: number) {
  const value = Number(amount || 0);

  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(value);
}
