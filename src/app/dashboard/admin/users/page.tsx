
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
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
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Mail,
  CalendarDays,
  Loader2,
  RefreshCw,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

type User = {
  userId: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type UserStats = {
  total: number;
  students: number;
  tutors: number;
  admins: number;
};

type Pagination = {
  currentPage: number;
  limit: number;
  totalUsers: number;
  totalPages: number;
};

const initialStats: UserStats = {
  total: 0,
  students: 0,
  tutors: 0,
  admins: 0,
};

export default function AdminUsersPage() {
  const router = useRouter();

  const [token, setToken] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState(initialStats);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    limit: 10,
    totalUsers: 0,
    totalPages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState("");

  const [mobileOpen, setMobileOpen] = useState(false);
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
      const parsedUser = JSON.parse(storedUser);

      if (parsedUser.role !== "admin") {
        router.replace("/");
        return;
      }

      setToken(storedToken);
      setCurrentUser(parsedUser);
    } catch {
      router.replace("/sign-in");
    }
  }, [router]);
  useEffect(() => {
    if (!token) return;

    async function loadStats() {
      try {
        const response = await fetch(
          `${API_URL}/admin/stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        if (!response.ok) return;

        const result = await response.json();

        if (result.success) {
          setStats(result.data.users);
        }
      } catch (error) {
        console.error("Stats error:", error);
      }
    }

    loadStats();
  }, [token]);
  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    async function loadUsers() {
      setLoading(true);
      setError("");
      setNotice("");

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "10",
          role: roleFilter,
          status: statusFilter,
        });

        if (search.trim()) {
          params.set("search", search.trim());
        }

        const response = await fetch(
          `${API_URL}/admin/users?${params.toString()}`,
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

        if (!response.ok) {
          throw new Error(
            result.message || "Failed to load users"
          );
        }

        if (!cancelled) {
          setUsers(result.data.users);
          setPagination(result.data.pagination);
        }

      } catch (error) {
        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Unable to load users"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    const timeout = setTimeout(loadUsers, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };

  }, [
    token,
    page,
    search,
    roleFilter,
    statusFilter,
    refreshKey,
    router,
  ]);
  async function viewUser(userId: string) {
    setDetailsLoading(true);
    setSelectedUser(null);

    try {
      const response = await fetch(
        `${API_URL}/admin/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to retrieve user"
        );
      }

      setSelectedUser(result.data);

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to retrieve user"
      );
    } finally {
      setDetailsLoading(false);
    }
  }
  async function toggleUserStatus(user: User) {
    const nextStatus = !user.isActive;

    const confirmed = window.confirm(
      nextStatus
        ? `Activate ${user.name}'s account?`
        : `Deactivate ${user.name}'s account?`
    );

    if (!confirmed) return;

    setUpdatingId(user.userId);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `${API_URL}/admin/users/${user.userId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            isActive: nextStatus,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to update account"
        );
      }

      setNotice(result.message);

      if (selectedUser?.userId === user.userId) {
        setSelectedUser(result.data);
      }

      setRefreshKey((value) => value + 1);

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update account"
      );
    } finally {
      setUpdatingId("");
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("mentorlagbe_token");
    localStorage.removeItem("mentorlagbe_user");

    router.replace("/sign-in");
  }

  function formatDate(date?: string) {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const initials = (currentUser?.name || "Admin")
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const roleStyle: Record<string, string> = {
    student: "bg-blue-50 text-blue-700",
    tutor: "bg-purple-50 text-purple-700",
    admin: "bg-emerald-50 text-emerald-700",
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8f6]">
        <Loader2 className="animate-spin text-[#075c3d]" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8f6] text-[#17221d]">
{mobileOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        />
      )}
<aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-[265px] flex-col
          border-r border-[#e9ede9] bg-white
          transition-transform duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >

        <div className="flex h-[76px] items-center justify-between border-b border-[#edf0ed] px-5">

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#075c3d] text-white">
              <GraduationCap size={24} />
            </div>

            <div>
              <h2 className="text-lg font-extrabold">
                Mentor<span className="text-[#075c3d]">Lagbe</span>
              </h2>
              <p className="text-[10px] font-semibold uppercase tracking-[2px] text-gray-400">
                Administration
              </p>
            </div>
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

            <div className="min-w-0">
              <p className="truncate text-sm font-bold">
                {currentUser?.name || "Administrator"}
              </p>
              <p className="truncate text-xs text-gray-500">
                {currentUser?.email}
              </p>
              <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold uppercase text-[#075c3d]">
                <ShieldCheck size={12} />
                Administrator
              </span>
            </div>

          </div>
        </div>
<nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">

          <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[2px] text-gray-400">
            Main Menu
          </p>

          <button
            onClick={() => router.push("/dashboard/admin")}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-500 transition hover:bg-[#f5f7f5] hover:text-[#075c3d]"
          >
            <LayoutDashboard size={19} />
            Dashboard Overview
          </button>

          <button
            onClick={() => router.push("/dashboard/admin/users")}
            className="flex w-full items-center gap-3 rounded-xl bg-[#eaf4ed] px-3 py-3 text-sm font-semibold text-[#075c3d]"
          >
            <Users size={19} />
            User Management
          </button>

          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              router.push("/dashboard/admin/tutors");
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-500 transition hover:bg-[#f5f7f5] hover:text-[#075c3d]"
          >
            <GraduationCap size={19} />
            Tutors
          </button>
<button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              router.push("/dashboard/admin/students");
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-500 transition hover:bg-[#f5f7f5] hover:text-[#075c3d]"
          >
            <UserRound size={19} />
            Students
          </button>
<button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              router.push("/dashboard/admin/tuitions");
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-500 transition hover:bg-[#f5f7f5] hover:text-[#075c3d]"
          >
            <BookOpen size={19} />
            Tuition Management
          </button>
<button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              router.push("/dashboard/admin/applications");
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-500 transition hover:bg-[#f5f7f5] hover:text-[#075c3d]"
          >
            <ClipboardList size={19} />
            Applications
          </button>

          <Link
            href="/dashboard/admin/payments"
            onClick={() => setMobileOpen(false)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-500 transition hover:bg-[#f5f7f5] hover:text-[#075c3d]"
          >
            <CreditCard size={19} />
            <span>Payments</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              router.push("/dashboard/admin/settings");
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-500 transition hover:bg-[#f5f7f5] hover:text-[#075c3d]"
          >
            <Settings size={19} />
            <span>Settings</span>
          </button>

        </nav>
<div className="border-t border-[#edf0ed] p-4">

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

          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-500 hover:bg-red-50"
          >
            <LogOut size={19} />
            Logout
          </button>

        </div>
      </aside>
<div className="min-h-screen lg:pl-[265px]">
<header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[#e9ede9] bg-white/95 px-5 backdrop-blur md:px-8">

          <div className="flex items-center gap-4">

            <button
              onClick={() => setMobileOpen(true)}
              className="text-gray-500 lg:hidden"
            >
              <Menu size={23} />
            </button>

            <div>
              <p className="text-xs text-gray-400">
                MentorLagbe / Administration / Users
              </p>
              <h1 className="text-lg font-bold">
                User Management
              </h1>
            </div>

          </div>

          <div className="flex items-center gap-3">

            <button
              onClick={() => setRefreshKey((value) => value + 1)}
              title="Refresh users"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e9ede9] text-gray-500 hover:bg-gray-50"
            >
              <RefreshCw size={17} />
            </button>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e9ede9] text-gray-500">
              <Bell size={19} />
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dceee3] text-sm font-bold text-[#075c3d]">
              {initials}
            </div>

          </div>
        </header>
<main className="mx-auto max-w-[1600px] px-5 py-8 md:px-8 lg:px-10">
<section className="mb-8">

            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <p className="text-xs font-bold uppercase tracking-[2px] text-[#075c3d]">
                Platform Administration
              </p>
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              Manage Users
            </h2>

            <p className="mt-3 text-sm text-gray-500 md:text-base">
              View, search, monitor and manage all registered MentorLagbe users.
            </p>

          </section>
{error && (
            <div className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <span>{error}</span>
              <button onClick={() => setError("")}>
                <X size={17} />
              </button>
            </div>
          )}
{notice && (
            <div className="mb-6 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <span>{notice}</span>
              <button onClick={() => setNotice("")}>
                <X size={17} />
              </button>
            </div>
          )}
<section className="mb-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

            <StatCard
              title="Total Users"
              value={stats.total}
              icon={<Users size={22} />}
              color="green"
            />

            <StatCard
              title="Students"
              value={stats.students}
              icon={<UserRound size={22} />}
              color="blue"
            />

            <StatCard
              title="Tutors"
              value={stats.tutors}
              icon={<GraduationCap size={22} />}
              color="purple"
            />

            <StatCard
              title="Administrators"
              value={stats.admins}
              icon={<ShieldCheck size={22} />}
              color="amber"
            />

          </section>
<section className="overflow-hidden rounded-2xl border border-[#e8ece8] bg-white shadow-sm">
<div className="border-b border-[#edf0ed] p-5 md:p-6">

              <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">

                <div>
                  <h3 className="text-lg font-bold">
                    All Registered Users
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    {pagination.totalUsers} users found
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSearch("");
                    setRoleFilter("all");
                    setStatusFilter("all");
                    setPage(1);
                  }}
                  className="text-xs font-semibold text-[#075c3d] hover:underline"
                >
                  Clear all filters
                </button>

              </div>
<div className="grid gap-3 md:grid-cols-3">

                <div className="relative md:col-span-1">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    placeholder="Search name or email..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="h-11 w-full rounded-xl border border-[#e4e9e4] bg-[#fafbfa] pl-10 pr-4 text-sm outline-none transition focus:border-[#075c3d] focus:ring-4 focus:ring-[#075c3d]/10"
                  />
                </div>

                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setPage(1);
                  }}
                  className="h-11 rounded-xl border border-[#e4e9e4] bg-[#fafbfa] px-4 text-sm outline-none focus:border-[#075c3d]"
                >
                  <option value="all">All Roles</option>
                  <option value="student">Students</option>
                  <option value="tutor">Tutors</option>
                  <option value="admin">Administrators</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="h-11 rounded-xl border border-[#e4e9e4] bg-[#fafbfa] px-4 text-sm outline-none focus:border-[#075c3d]"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

              </div>
            </div>
<div className="overflow-x-auto">

              <table className="w-full min-w-[850px] text-left">

                <thead className="bg-[#f8faf8]">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                      User
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                      Role
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                      Plan
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                      Status
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                      Joined
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#edf0ed]">

                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <Loader2
                          size={27}
                          className="mx-auto animate-spin text-[#075c3d]"
                        />
                        <p className="mt-3 text-sm text-gray-400">
                          Loading users...
                        </p>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <Users
                          size={34}
                          className="mx-auto text-gray-300"
                        />
                        <p className="mt-3 font-semibold text-gray-600">
                          No users found
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          Try changing your search or filters.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => {
                      const isSelf =
                        user.userId === currentUser?.userId;

                      return (
                        <tr
                          key={user.userId}
                          className="transition hover:bg-[#fafcfa]"
                        >
<td className="px-6 py-5">
                            <div className="flex items-center gap-3">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eaf4ed] text-sm font-bold text-[#075c3d]">
                                {user.name
                                  .split(" ")
                                  .map((word) => word[0])
                                  .slice(0, 2)
                                  .join("")
                                  .toUpperCase()}
                              </div>

                              <div className="min-w-0">
                                <p className="font-semibold text-[#17221d]">
                                  {user.name}
                                  {isSelf && (
                                    <span className="ml-2 text-[10px] text-[#075c3d]">
                                      YOU
                                    </span>
                                  )}
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                  {user.email}
                                </p>
                              </div>

                            </div>
                          </td>
<td className="px-6 py-5">
                            <span
                              className={`rounded-full px-3 py-1.5 text-[11px] font-bold capitalize ${roleStyle[user.role] ||
                                "bg-gray-100 text-gray-600"
                                }`}
                            >
                              {user.role}
                            </span>
                          </td>
<td className="px-6 py-5">
                            <span className="text-sm font-medium capitalize text-gray-600">
                              {user.plan || "free"}
                            </span>
                          </td>
<td className="px-6 py-5">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold ${user.isActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-600"
                                }`}
                            >
                              {user.isActive ? (
                                <CheckCircle2 size={13} />
                              ) : (
                                <XCircle size={13} />
                              )}

                              {user.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
<td className="px-6 py-5 text-sm text-gray-500">
                            {formatDate(user.createdAt)}
                          </td>
<td className="px-6 py-5">
                            <div className="flex items-center justify-end gap-2">

                              <button
                                onClick={() => viewUser(user.userId)}
                                title="View Details"
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e4e9e4] text-gray-500 transition hover:border-[#075c3d] hover:bg-[#eaf4ed] hover:text-[#075c3d]"
                              >
                                <Eye size={17} />
                              </button>

                              <button
                                onClick={() => toggleUserStatus(user)}
                                disabled={updatingId === user.userId || isSelf}
                                title={
                                  isSelf
                                    ? "You cannot deactivate your own account"
                                    : user.isActive
                                      ? "Deactivate account"
                                      : "Activate account"
                                }
                                className={`rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${user.isActive
                                  ? "bg-red-50 text-red-600 hover:bg-red-100"
                                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                  }`}
                              >
                                {updatingId === user.userId ? (
                                  <Loader2
                                    size={15}
                                    className="animate-spin"
                                  />
                                ) : (
                                  user.isActive
                                    ? "Deactivate"
                                    : "Activate"
                                )}
                              </button>

                            </div>
                          </td>

                        </tr>
                      );
                    })
                  )}

                </tbody>
              </table>

            </div>
<div className="flex flex-col justify-between gap-4 border-t border-[#edf0ed] px-6 py-5 sm:flex-row sm:items-center">

              <p className="text-xs text-gray-500">
                Showing{" "}
                {pagination.totalUsers === 0
                  ? 0
                  : (page - 1) * pagination.limit + 1}
                {" "}to{" "}
                {Math.min(
                  page * pagination.limit,
                  pagination.totalUsers
                )}
                {" "}of {pagination.totalUsers} users
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
<footer className="mt-10 border-t border-[#e7ebe7] py-6">
            <div className="flex flex-col justify-between gap-3 text-center sm:flex-row sm:text-left">
              <p className="text-xs text-gray-400">
                © 2026 MentorLagbe. All rights reserved.
              </p>
              <p className="text-xs text-gray-400">
                User Management
              </p>
            </div>
          </footer>

        </main>
      </div>
{(detailsLoading || selectedUser) && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
          onClick={() => {
            if (!detailsLoading) setSelectedUser(null);
          }}
        >

          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >

            {detailsLoading ? (
              <div className="py-16 text-center">
                <Loader2
                  size={30}
                  className="mx-auto animate-spin text-[#075c3d]"
                />
                <p className="mt-4 text-sm text-gray-500">
                  Loading user details...
                </p>
              </div>
            ) : selectedUser ? (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">
                      User Details
                    </h3>
                    <p className="mt-1 text-xs text-gray-400">
                      Account information
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedUser(null)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200"
                  >
                    <X size={19} />
                  </button>
                </div>

                <div className="mb-6 flex items-center gap-4 rounded-xl bg-[#f5f8f5] p-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#dceee3] text-lg font-bold text-[#075c3d]">
                    {selectedUser.name
                      .split(" ")
                      .map((word) => word[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-bold">
                      {selectedUser.name}
                    </h4>
                    <p className="mt-1 truncate text-xs text-gray-500">
                      {selectedUser.email}
                    </p>
                    <span className="mt-2 inline-block rounded-full bg-white px-3 py-1 text-[10px] font-bold capitalize text-[#075c3d]">
                      {selectedUser.role}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">

                  <DetailRow
                    icon={<Mail size={17} />}
                    label="Email Address"
                    value={selectedUser.email}
                  />

                  <DetailRow
                    icon={<UserRound size={17} />}
                    label="Account Role"
                    value={selectedUser.role}
                  />

                  <DetailRow
                    icon={<CreditCard size={17} />}
                    label="Subscription Plan"
                    value={selectedUser.plan || "free"}
                  />

                  <DetailRow
                    icon={<CheckCircle2 size={17} />}
                    label="Account Status"
                    value={
                      selectedUser.isActive
                        ? "Active"
                        : "Inactive"
                    }
                  />

                  <DetailRow
                    icon={<CalendarDays size={17} />}
                    label="Registration Date"
                    value={formatDate(selectedUser.createdAt)}
                  />

                </div>

                <div className="mt-7 flex justify-end gap-3">

                  <button
                    onClick={() => setSelectedUser(null)}
                    className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Close
                  </button>

                  {selectedUser.userId !== currentUser?.userId && (
                    <button
                      onClick={() => {
                        const user = selectedUser;
                        setSelectedUser(null);
                        toggleUserStatus(user);
                      }}
                      className={`rounded-xl px-5 py-2.5 text-sm font-semibold ${selectedUser.isActive
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        }`}
                    >
                      {selectedUser.isActive
                        ? "Deactivate"
                        : "Activate"}
                    </button>
                  )}

                </div>
              </>
            ) : null}

          </div>
        </div>
      )}

    </div>
  );
}
function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "green" | "blue" | "purple" | "amber";
}) {
  const styles = {
    green: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    purple: "bg-purple-50 text-purple-700",
    amber: "bg-amber-50 text-amber-700",
  };

  return (
    <div className="rounded-2xl border border-[#e8ece8] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50">
        <span className={`flex h-full w-full items-center justify-center rounded-xl ${styles[color]}`}>
          {icon}
        </span>
      </div>

      <p className="text-sm font-medium text-gray-500">
        {title}
      </p>

      <h3 className="mt-2 text-3xl font-extrabold tracking-tight">
        {value.toLocaleString()}
      </h3>

    </div>
  );
}
function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f2f7f3] text-[#075c3d]">
        {icon}
      </div>

      <div className="min-w-0">
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
