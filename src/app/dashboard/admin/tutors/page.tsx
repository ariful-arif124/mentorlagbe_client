
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

type Tutor = {
    userId: string;
    name: string;
    email: string;
    role: string;
    plan?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
};

type Pagination = {
    currentPage: number;
    limit: number;
    totalUsers: number;
    totalPages: number;
};

type AdminUser = {
    userId?: string;
    name?: string;
    email?: string;
    role?: string;
};

const initialPagination: Pagination = {
    currentPage: 1,
    limit: 10,
    totalUsers: 0,
    totalPages: 0,
};

function getInitials(name?: string) {
    return (name || "Tutor")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase();
}

function clearAuthentication() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("mentorlagbe_token");
    localStorage.removeItem("mentorlagbe_user");
}

export default function AdminTutorsPage() {
    const router = useRouter();

    // ==========================================
    // AUTHENTICATION
    // ==========================================

    const [token, setToken] = useState("");
    const [currentUser, setCurrentUser] =
        useState<AdminUser | null>(null);

    // ==========================================
    // TUTOR DATA
    // ==========================================

    const [tutors, setTutors] = useState<Tutor[]>([]);
    const [totalTutors, setTotalTutors] = useState(0);

    // ==========================================
    // FILTERS
    // ==========================================

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // ==========================================
    // PAGINATION
    // ==========================================

    const [page, setPage] = useState(1);

    const [pagination, setPagination] =
        useState<Pagination>(initialPagination);

    // ==========================================
    // UI STATES
    // ==========================================

    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    const [selectedTutor, setSelectedTutor] =
        useState<Tutor | null>(null);

    const [detailsLoading, setDetailsLoading] = useState(false);
    const [updatingId, setUpdatingId] = useState("");

    const [mobileOpen, setMobileOpen] = useState(false);

    // ==========================================
    // ADMIN AUTHENTICATION
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
            const parsedUser = JSON.parse(storedUser);

            if (parsedUser.role?.toLowerCase() !== "admin") {
                router.replace("/");
                return;
            }

            setToken(storedToken);
            setCurrentUser(parsedUser);
        } catch {
            router.replace("/sign-in");
        }
    }, [router]);

    // ==========================================
    // LOAD TOTAL TUTOR STATISTICS
    // ==========================================

    useEffect(() => {
        if (!token) return;

        let cancelled = false;

        async function loadStats() {
            setStatsLoading(true);

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

                if (!cancelled && result.success) {
                    setTotalTutors(
                        Number(result.data?.users?.tutors ?? 0)
                    );
                }
            } catch (error) {
                console.error("Tutor statistics error:", error);
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

    // ==========================================
    // LOAD TUTORS
    // ==========================================

    useEffect(() => {
        if (!token) return;

        let cancelled = false;

        async function loadTutors() {
            setLoading(true);
            setError("");

            try {
                const params = new URLSearchParams({
                    page: String(page),
                    limit: "10",
                    role: "tutor",
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
                    clearAuthentication();
                    router.replace("/sign-in");
                    return;
                }

                if (!response.ok) {
                    throw new Error(
                        result.message || "Failed to load tutors"
                    );
                }

                if (!cancelled) {
                    setTutors(result.data?.users || []);
                    setPagination(
                        result.data?.pagination || initialPagination
                    );
                }
            } catch (error) {
                if (!cancelled) {
                    setError(
                        error instanceof Error
                            ? error.message
                            : "Unable to load tutors"
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        const timeout = setTimeout(loadTutors, 300);

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
    // VIEW TUTOR DETAILS
    // ==========================================

    async function viewTutor(tutorId: string) {
        setDetailsLoading(true);
        setSelectedTutor(null);
        setError("");

        try {
            const response = await fetch(
                `${API_URL}/admin/users/${tutorId}`,
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
                router.replace("/sign-in");
                return;
            }

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to retrieve tutor"
                );
            }

            setSelectedTutor(result.data);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Unable to retrieve tutor"
            );
        } finally {
            setDetailsLoading(false);
        }
    }

    // ==========================================
    // ACTIVATE / DEACTIVATE TUTOR
    // ==========================================

    async function toggleTutorStatus(tutor: Tutor) {
        const nextStatus = !tutor.isActive;

        const confirmed = window.confirm(
            nextStatus
                ? `Activate ${tutor.name}'s account?`
                : `Deactivate ${tutor.name}'s account?`
        );

        if (!confirmed) return;

        setUpdatingId(tutor.userId);
        setError("");
        setNotice("");

        try {
            const response = await fetch(
                `${API_URL}/admin/users/${tutor.userId}/status`,
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

            if (response.status === 401) {
                clearAuthentication();
                router.replace("/sign-in");
                return;
            }

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to update tutor account"
                );
            }

            setNotice(
                result.message ||
                "Tutor account status updated successfully."
            );

            if (selectedTutor?.userId === tutor.userId) {
                setSelectedTutor(result.data);
            }

            setRefreshKey((value) => value + 1);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Unable to update tutor account"
            );
        } finally {
            setUpdatingId("");
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
    // DATE FORMATTING
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

    const initials = getInitials(currentUser?.name);

    const activeOnPage = tutors.filter(
        (tutor) => tutor.isActive
    ).length;

    const inactiveOnPage = tutors.filter(
        (tutor) => !tutor.isActive
    ).length;

    // ==========================================
    // LOADING SCREEN
    // ==========================================

    if (!token) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f7f8f6]">
                <Loader2
                    className="animate-spin text-[#075c3d]"
                    size={32}
                />
            </div>
        );
    }

    // ==========================================
    // MAIN DASHBOARD
    // ==========================================

    return (
        <div className="min-h-screen bg-[#f7f8f6] text-[#17221d]">

            {/* MOBILE OVERLAY */}

            {mobileOpen && (
                <button
                    aria-label="Close sidebar"
                    onClick={() => setMobileOpen(false)}
                    className="fixed inset-0 z-40 bg-black/30 lg:hidden"
                />
            )}

            {/* ======================================
          SIDEBAR
      ====================================== */}

            <aside
                className={`
          fixed inset-y-0 left-0 z-50 flex w-[265px] flex-col
          border-r border-[#e9ede9] bg-white
          transition-transform duration-300
          ${mobileOpen
                        ? "translate-x-0"
                        : "-translate-x-full lg:translate-x-0"
                    }
        `}
            >
                {/* LOGO */}

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
                        aria-label="Close sidebar"
                    >
                        <X size={21} />
                    </button>
                </div>

                {/* ADMIN PROFILE */}

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

                {/* NAVIGATION */}

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
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-500 transition hover:bg-[#f5f7f5] hover:text-[#075c3d]"
                    >
                        <Users size={19} />
                        User Management
                    </button>

                    <button
                        onClick={() => {
                            setMobileOpen(false);
                            router.push("/dashboard/admin/tutors");
                        }}
                        className="flex w-full items-center gap-3 rounded-xl bg-[#eaf4ed] px-3 py-3 text-sm font-semibold text-[#075c3d]"
                    >
                        <GraduationCap size={19} />
                        Tutors
                    </button>


                    {/* STUDENTS */}
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

                    {/* TUITION MANAGEMENT */}
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

                    {/* APPLICATIONS */}

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

                    {/* PAYMENTS - COMING SOON */}

                    <div className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-400">
                        <CreditCard size={19} />
                        <span>Payments</span>
                        <span className="ml-auto text-[9px] font-semibold uppercase">
                            Soon
                        </span>
                    </div>

                    <div className="my-5 border-t border-[#edf0ed]" />

                    <div className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-400">
                        <Settings size={19} />
                        Settings
                    </div>
                </nav>

                {/* LOGOUT */}

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

            {/* ======================================
          MAIN CONTENT
      ====================================== */}

            <div className="min-h-screen lg:pl-[265px]">

                {/* HEADER */}

                <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[#e9ede9] bg-white/95 px-5 backdrop-blur md:px-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="text-gray-500 lg:hidden"
                            aria-label="Open sidebar"
                        >
                            <Menu size={23} />
                        </button>

                        <div>
                            <p className="text-xs text-gray-400">
                                MentorLagbe / Administration / Tutors
                            </p>

                            <h1 className="text-lg font-bold">
                                Tutors Management
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() =>
                                setRefreshKey((value) => value + 1)
                            }
                            title="Refresh tutors"
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

                {/* PAGE BODY */}

                <main className="mx-auto max-w-[1600px] px-5 py-8 md:px-8 lg:px-10">

                    {/* INTRO */}

                    <section className="mb-8">
                        <div className="mb-3 flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />

                            <p className="text-xs font-bold uppercase tracking-[2px] text-[#075c3d]">
                                Platform Administration
                            </p>
                        </div>

                        <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
                            Manage Tutors
                        </h2>

                        <p className="mt-3 text-sm text-gray-500 md:text-base">
                            Monitor registered tutors, review their accounts
                            and manage their platform access.
                        </p>
                    </section>

                    {/* ERROR */}

                    {error && (
                        <div className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            <span>{error}</span>

                            <button
                                onClick={() => setError("")}
                                aria-label="Dismiss error"
                            >
                                <X size={17} />
                            </button>
                        </div>
                    )}

                    {/* SUCCESS */}

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

                    {/* STATISTICS */}

                    <section className="mb-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">

                        <StatCard
                            title="Total Registered Tutors"
                            value={totalTutors}
                            loading={statsLoading}
                            icon={<GraduationCap size={22} />}
                            color="green"
                        />

                        <StatCard
                            title="Active Tutors (Current Page)"
                            value={activeOnPage}
                            loading={loading}
                            icon={<CheckCircle2 size={22} />}
                            color="blue"
                        />

                        <StatCard
                            title="Inactive Tutors (Current Page)"
                            value={inactiveOnPage}
                            loading={loading}
                            icon={<XCircle size={22} />}
                            color="amber"
                        />

                    </section>

                    {/* TUTOR TABLE */}

                    <section className="overflow-hidden rounded-2xl border border-[#e8ece8] bg-white shadow-sm">

                        {/* TABLE HEADER */}

                        <div className="border-b border-[#edf0ed] p-5 md:p-6">
                            <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
                                <div>
                                    <h3 className="text-lg font-bold">
                                        Registered Tutors
                                    </h3>

                                    <p className="mt-1 text-xs text-gray-500">
                                        {pagination.totalUsers} matching tutors found
                                    </p>
                                </div>

                                <button
                                    onClick={() => {
                                        setSearch("");
                                        setStatusFilter("all");
                                        setPage(1);
                                    }}
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
                                        placeholder="Search tutor name or email..."
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
                                    className="h-11 rounded-xl border border-[#e4e9e4] bg-[#fafbfa] px-4 text-sm outline-none focus:border-[#075c3d]"
                                >
                                    <option value="all">All Tutor Status</option>
                                    <option value="active">Active Tutors</option>
                                    <option value="inactive">Inactive Tutors</option>
                                </select>
                            </div>
                        </div>

                        {/* TABLE */}

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[850px] text-left">

                                <thead className="bg-[#f8faf8]">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                                            Tutor
                                        </th>

                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                                            Membership
                                        </th>

                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                                            Account Status
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
                                            <td colSpan={5} className="py-16 text-center">
                                                <Loader2
                                                    size={27}
                                                    className="mx-auto animate-spin text-[#075c3d]"
                                                />

                                                <p className="mt-3 text-sm text-gray-400">
                                                    Loading tutors...
                                                </p>
                                            </td>
                                        </tr>
                                    ) : tutors.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-16 text-center">
                                                <GraduationCap
                                                    size={38}
                                                    className="mx-auto text-gray-300"
                                                />

                                                <p className="mt-3 font-semibold text-gray-600">
                                                    No tutors found
                                                </p>

                                                <p className="mt-1 text-xs text-gray-400">
                                                    Try changing your search or status filter.
                                                </p>
                                            </td>
                                        </tr>
                                    ) : (
                                        tutors.map((tutor) => (
                                            <tr
                                                key={tutor.userId}
                                                className="transition hover:bg-[#fafcfa]"
                                            >

                                                {/* TUTOR INFORMATION */}

                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eaf4ed] text-sm font-bold text-[#075c3d]">
                                                            {getInitials(tutor.name)}
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="font-semibold text-[#17221d]">
                                                                {tutor.name}
                                                            </p>

                                                            <p className="mt-1 text-xs text-gray-500">
                                                                {tutor.email}
                                                            </p>

                                                            <span className="mt-1 inline-block rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold capitalize text-purple-700">
                                                                {tutor.role}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* MEMBERSHIP */}

                                                <td className="px-6 py-5">
                                                    <span className="rounded-full bg-[#f4f6f4] px-3 py-1.5 text-xs font-semibold capitalize text-gray-600">
                                                        {tutor.plan || "free"}
                                                    </span>
                                                </td>

                                                {/* STATUS */}

                                                <td className="px-6 py-5">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold ${tutor.isActive
                                                            ? "bg-emerald-50 text-emerald-700"
                                                            : "bg-red-50 text-red-600"
                                                            }`}
                                                    >
                                                        {tutor.isActive ? (
                                                            <CheckCircle2 size={13} />
                                                        ) : (
                                                            <XCircle size={13} />
                                                        )}

                                                        {tutor.isActive ? "Active" : "Inactive"}
                                                    </span>
                                                </td>

                                                {/* REGISTRATION DATE */}

                                                <td className="px-6 py-5 text-sm text-gray-500">
                                                    {formatDate(tutor.createdAt)}
                                                </td>

                                                {/* ACTIONS */}

                                                <td className="px-6 py-5">
                                                    <div className="flex items-center justify-end gap-2">

                                                        <button
                                                            onClick={() => viewTutor(tutor.userId)}
                                                            title="View Tutor Details"
                                                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e4e9e4] text-gray-500 transition hover:border-[#075c3d] hover:bg-[#eaf4ed] hover:text-[#075c3d]"
                                                        >
                                                            <Eye size={17} />
                                                        </button>

                                                        <button
                                                            onClick={() => toggleTutorStatus(tutor)}
                                                            disabled={updatingId === tutor.userId}
                                                            title={
                                                                tutor.isActive
                                                                    ? "Deactivate tutor"
                                                                    : "Activate tutor"
                                                            }
                                                            className={`flex min-w-[95px] items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${tutor.isActive
                                                                ? "bg-red-50 text-red-600 hover:bg-red-100"
                                                                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                                                }`}
                                                        >
                                                            {updatingId === tutor.userId ? (
                                                                <Loader2
                                                                    size={15}
                                                                    className="animate-spin"
                                                                />
                                                            ) : tutor.isActive ? (
                                                                "Deactivate"
                                                            ) : (
                                                                "Activate"
                                                            )}
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
                                {pagination.totalUsers === 0
                                    ? 0
                                    : (page - 1) * pagination.limit + 1}
                                {" "}to{" "}
                                {Math.min(
                                    page * pagination.limit,
                                    pagination.totalUsers
                                )}
                                {" "}of {pagination.totalUsers} tutors
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    disabled={page <= 1 || loading}
                                    onClick={() =>
                                        setPage((value) => value - 1)
                                    }
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
                                    onClick={() =>
                                        setPage((value) => value + 1)
                                    }
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
                                Tutor Management
                            </p>
                        </div>
                    </footer>

                </main>
            </div>

            {/* ======================================
          TUTOR DETAILS MODAL
      ====================================== */}

            {(detailsLoading || selectedTutor) && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
                    onClick={() => {
                        if (!detailsLoading) {
                            setSelectedTutor(null);
                        }
                    }}
                >
                    <div
                        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        {detailsLoading ? (
                            <div className="py-16 text-center">
                                <Loader2
                                    size={30}
                                    className="mx-auto animate-spin text-[#075c3d]"
                                />

                                <p className="mt-4 text-sm text-gray-500">
                                    Loading tutor details...
                                </p>
                            </div>
                        ) : selectedTutor ? (
                            <>
                                <div className="mb-6 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold">
                                            Tutor Details
                                        </h3>

                                        <p className="mt-1 text-xs text-gray-400">
                                            Tutor account information
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => setSelectedTutor(null)}
                                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200"
                                        aria-label="Close details"
                                    >
                                        <X size={19} />
                                    </button>
                                </div>

                                {/* PROFILE */}

                                <div className="mb-6 flex items-center gap-4 rounded-xl bg-[#f5f8f5] p-4">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#dceee3] text-lg font-bold text-[#075c3d]">
                                        {getInitials(selectedTutor.name)}
                                    </div>

                                    <div className="min-w-0">
                                        <h4 className="font-bold">
                                            {selectedTutor.name}
                                        </h4>

                                        <p className="mt-1 truncate text-xs text-gray-500">
                                            {selectedTutor.email}
                                        </p>

                                        <span className="mt-2 inline-block rounded-full bg-white px-3 py-1 text-[10px] font-bold capitalize text-purple-700">
                                            {selectedTutor.role}
                                        </span>
                                    </div>
                                </div>

                                {/* DETAILS */}

                                <div className="space-y-4">
                                    <DetailRow
                                        icon={<Mail size={17} />}
                                        label="Email Address"
                                        value={selectedTutor.email}
                                    />

                                    <DetailRow
                                        icon={<GraduationCap size={17} />}
                                        label="Account Role"
                                        value={selectedTutor.role}
                                    />

                                    <DetailRow
                                        icon={<CreditCard size={17} />}
                                        label="Membership Plan"
                                        value={selectedTutor.plan || "free"}
                                    />

                                    <DetailRow
                                        icon={<CheckCircle2 size={17} />}
                                        label="Account Status"
                                        value={
                                            selectedTutor.isActive
                                                ? "Active"
                                                : "Inactive"
                                        }
                                    />

                                    <DetailRow
                                        icon={<CalendarDays size={17} />}
                                        label="Registration Date"
                                        value={formatDate(selectedTutor.createdAt)}
                                    />
                                </div>

                                {/* ACTIONS */}

                                <div className="mt-7 flex justify-end gap-3">
                                    <button
                                        onClick={() => setSelectedTutor(null)}
                                        className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                                    >
                                        Close
                                    </button>

                                    <button
                                        onClick={() => toggleTutorStatus(selectedTutor)}
                                        disabled={updatingId === selectedTutor.userId}
                                        className={`rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-50 ${selectedTutor.isActive
                                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                            }`}
                                    >
                                        {updatingId === selectedTutor.userId ? (
                                            <Loader2
                                                size={16}
                                                className="animate-spin"
                                            />
                                        ) : selectedTutor.isActive ? (
                                            "Deactivate"
                                        ) : (
                                            "Activate"
                                        )}
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
    icon: React.ReactNode;
    color: "green" | "blue" | "amber";
    loading: boolean;
}) {
    const styles = {
        green: "bg-emerald-50 text-emerald-700",
        blue: "bg-blue-50 text-blue-700",
        amber: "bg-amber-50 text-amber-700",
    };

    return (
        <div className="rounded-2xl border border-[#e8ece8] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50">
                <span
                    className={`flex h-full w-full items-center justify-center rounded-xl ${styles[color]}`}
                >
                    {icon}
                </span>
            </div>

            <p className="text-sm font-medium text-gray-500">
                {title}
            </p>

            <h3 className="mt-2 text-3xl font-extrabold tracking-tight">
                {loading ? (
                    <Loader2
                        size={24}
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
// TUTOR DETAIL ROW
// ==========================================

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
