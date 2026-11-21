
"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
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
    RefreshCw,
    CheckCircle2,
    Clock,
    UserRound,
    ShieldCheck,
    Home,
    ArrowUpRight,
    Wallet,
    TrendingUp,
    AlertCircle,
    XCircle,
    RotateCcw,
    Copy,
    ChevronLeft,
    ChevronRight,
    Receipt,
} from "lucide-react";

const API_URL = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

type AdminUser = {
    name?: string;
    email?: string;
    role?: string;
};

type PaymentStats = {
    totalTransactions: number;
    paidPayments: number;
    pendingPayments: number;
    failedPayments: number;
    expiredPayments: number;
    refundedPayments: number;
    grossRevenue: number;
    refundedAmount: number;
    netRevenue: number;
};

type Payment = {
    paymentId: string;
    userId: string;
    userName: string;
    userEmail: string;
    role: string;
    plan: string;
    amount: number;
    currency: string;
    provider: string;
    status: string;
    checkoutSessionId?: string | null;
    paymentIntentId?: string | null;
    stripeEventId?: string | null;
    createdAt: string;
    updatedAt: string;
    paidAt?: string | null;
    refundStatus?: string | null;
    refundedAt?: string | null;
};

type Pagination = {
    currentPage: number;
    limit: number;
    totalPayments: number;
    totalPages: number;
};

const initialStats: PaymentStats = {
    totalTransactions: 0,
    paidPayments: 0,
    pendingPayments: 0,
    failedPayments: 0,
    expiredPayments: 0,
    refundedPayments: 0,
    grossRevenue: 0,
    refundedAmount: 0,
    netRevenue: 0,
};

const initialPagination: Pagination = {
    currentPage: 1,
    limit: 10,
    totalPayments: 0,
    totalPages: 0,
};

const navigation = [
    { label: "Overview", icon: LayoutDashboard, href: "/dashboard/admin" },
    { label: "User Management", icon: Users, href: "/dashboard/admin/users" },
    { label: "Tutors", icon: GraduationCap, href: "/dashboard/admin/tutors" },
    { label: "Students", icon: UserRound, href: "/dashboard/admin/students" },
    { label: "Tuition Management", icon: BookOpen, href: "/dashboard/admin/tuitions" },
    { label: "Applications", icon: ClipboardList, href: "/dashboard/admin/applications" },
    { label: "Payments", icon: CreditCard, href: "/dashboard/admin/payments" },
];

function formatAmount(amount: number, currency = "USD") {
    const value = Number(amount || 0) / 100;
    const currencyCode = (currency || "USD").toUpperCase();

    try {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currencyCode,
        }).format(value);
    } catch {
        return `${value.toFixed(2)} ${currencyCode}`;
    }
}

function formatDate(date?: string | null) {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(parsedDate);
}

function normalizeStatus(status: string) {
    const value = status?.toLowerCase();

    if (["paid", "succeeded", "success", "completed"].includes(value)) {
        return "paid";
    }

    return value || "unknown";
}

function getStatusMeta(status: string) {
    switch (normalizeStatus(status)) {
        case "paid":
            return {
                label: "Paid",
                icon: CheckCircle2,
                color: "bg-emerald-50 text-emerald-700 border-emerald-200",
            };

        case "pending":
            return {
                label: "Pending",
                icon: Clock,
                color: "bg-amber-50 text-amber-700 border-amber-200",
            };

        case "failed":
            return {
                label: "Failed",
                icon: XCircle,
                color: "bg-red-50 text-red-600 border-red-200",
            };

        case "expired":
            return {
                label: "Expired",
                icon: AlertCircle,
                color: "bg-gray-100 text-gray-600 border-gray-200",
            };

        default:
            return {
                label: status || "Unknown",
                icon: AlertCircle,
                color: "bg-gray-100 text-gray-600 border-gray-200",
            };
    }
}

function getRefundMeta(status?: string | null) {
    const value = status?.toLowerCase();

    if (value === "refunded") {
        return "Refunded";
    }

    if (value === "pending") {
        return "Refund Pending";
    }

    if (value === "failed") {
        return "Refund Failed";
    }

    return "Not Refunded";
}

export default function AdminPaymentsPage() {
    const router = useRouter();

    const [user, setUser] = useState<AdminUser | null>(null);
    const [token, setToken] = useState("");

    const [stats, setStats] = useState<PaymentStats>(initialStats);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [pagination, setPagination] = useState<Pagination>(initialPagination);

    const [authLoading, setAuthLoading] = useState(true);
    const [dataLoading, setDataLoading] = useState(false);
    const [error, setError] = useState("");

    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [roleFilter, setRoleFilter] = useState("all");

    const page = pagination.currentPage;
    const limit = 10;

    const logout = useCallback(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("mentorlagbe_token");
        localStorage.removeItem("mentorlagbe_user");

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
            setAuthLoading(false);
            return;
        }

        try {
            const parsedUser: AdminUser = JSON.parse(storedUser);

            if (String(parsedUser.role).toLowerCase() !== "admin") {
                router.replace("/");
                setAuthLoading(false);
                return;
            }

            setUser(parsedUser);
            setToken(storedToken);
        } catch {
            router.replace("/sign-in");
        } finally {
            setAuthLoading(false);
        }
    }, [router]);

    const fetchPayments = useCallback(async () => {
        if (!token) return;

        setDataLoading(true);
        setError("");

        try {
            const headers = {
                Authorization: `Bearer ${token}`,
            };

            const [statsResponse, paymentsResponse] = await Promise.all([
                fetch(`${API_URL}/admin/payments/stats`, {
                    method: "GET",
                    headers,
                    cache: "no-store",
                }),

                fetch(
                    `${API_URL}/admin/payments?page=${page}&limit=${limit}`,
                    {
                        method: "GET",
                        headers,
                        cache: "no-store",
                    }
                ),
            ]);

            const statsResult = await statsResponse.json();
            const paymentsResult = await paymentsResponse.json();

            if (
                statsResponse.status === 401 ||
                paymentsResponse.status === 401
            ) {
                logout();
                return;
            }

            if (!statsResponse.ok || !statsResult.success) {
                throw new Error(
                    statsResult.message || "Failed to load payment statistics"
                );
            }

            if (!paymentsResponse.ok || !paymentsResult.success) {
                throw new Error(
                    paymentsResult.message || "Failed to load transactions"
                );
            }

            const statsData = statsResult.data?.stats || {};

            setStats({
                totalTransactions: Number(statsData.totalTransactions || 0),
                paidPayments: Number(statsData.paidPayments || 0),
                pendingPayments: Number(statsData.pendingPayments || 0),
                failedPayments: Number(statsData.failedPayments || 0),
                expiredPayments: Number(statsData.expiredPayments || 0),
                refundedPayments: Number(statsData.refundedPayments || 0),
                grossRevenue: Number(statsData.grossRevenue || 0),
                refundedAmount: Number(statsData.refundedAmount || 0),
                netRevenue: Number(statsData.netRevenue || 0),
            });

            setPayments(
                Array.isArray(paymentsResult.data?.payments)
                    ? paymentsResult.data.payments
                    : []
            );

            setPagination(
                paymentsResult.data?.pagination || initialPagination
            );
        } catch (err) {
            console.error("Admin payments error:", err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to load payment transactions"
            );
        } finally {
            setDataLoading(false);
        }
    }, [token, page, logout]);

    useEffect(() => {
        if (token) {
            fetchPayments();
        }
    }, [token, fetchPayments]);

    const filteredPayments = useMemo(() => {
        const searchValue = search.trim().toLowerCase();

        return payments.filter((payment) => {
            const matchesSearch =
                !searchValue ||
                payment.userName?.toLowerCase().includes(searchValue) ||
                payment.userEmail?.toLowerCase().includes(searchValue) ||
                payment.paymentId?.toLowerCase().includes(searchValue) ||
                payment.paymentIntentId?.toLowerCase().includes(searchValue) ||
                payment.checkoutSessionId?.toLowerCase().includes(searchValue) ||
                payment.plan?.toLowerCase().includes(searchValue);

            const matchesStatus =
                statusFilter === "all" ||
                normalizeStatus(payment.status) === statusFilter;

            const matchesRole =
                roleFilter === "all" ||
                payment.role?.toLowerCase() === roleFilter;

            return matchesSearch && matchesStatus && matchesRole;
        });
    }, [payments, search, statusFilter, roleFilter]);

    async function copyReference(value?: string | null) {
        if (!value) return;

        try {
            await navigator.clipboard.writeText(value);
        } catch (err) {
            console.error("Copy failed:", err);
        }
    }

    function handleNavigation(href: string) {
        setMobileOpen(false);
        router.push(href);
    }

    const initials = (user?.name || "Admin")
        .split(" ")
        .map((word) => word[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f7f8f6]">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#dcebe2] border-t-[#075c3d]" />
                    <p className="mt-4 text-sm text-gray-500">
                        Verifying administrator...
                    </p>
                </div>
            </div>
        );
    }

    if (!token || !user) {
        return null;
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
                                    {user.name || "Administrator"}
                                </p>
                                <p className="truncate text-xs text-gray-500">
                                    {user.email}
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
                        const active = item.label === "Payments";

                        return (
                            <button
                                key={item.label}
                                type="button"
                                title={collapsed ? item.label : ""}
                                onClick={() => handleNavigation(item.href)}
                                className={`
                                    flex w-full items-center gap-3 rounded-xl px-3 py-3
                                    text-left text-sm font-medium transition
                                    ${
                                        active
                                            ? "bg-[#eaf4ed] text-[#075c3d]"
                                            : "text-gray-500 hover:bg-[#f5f7f5] hover:text-[#075c3d]"
                                    }
                                `}
                            >
                                <Icon size={19} />

                                {!collapsed && (
                                    <span>{item.label}</span>
                                )}

                                {collapsed && active && (
                                    <span className="ml-auto h-2 w-2 rounded-full bg-[#075c3d]" />
                                )}
                            </button>
                        );
                    })}

                    <div className="my-5 border-t border-[#edf0ed]" />

                    <div className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-500">
                        <Settings size={19} />
                        {!collapsed && <span>Settings</span>}
                    </div>
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
                        onClick={logout}
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
                                MentorLagbe / Administration
                            </p>
                            <h1 className="text-lg font-bold">
                                Payment Management
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push("/")}
                            className="hidden items-center gap-2 rounded-xl border border-[#e1e8e2] bg-white px-4 py-2.5 text-xs font-semibold text-[#075c3d] transition hover:bg-[#f2f7f3] sm:flex"
                        >
                            <Home size={16} />
                            Visit Website
                        </button>

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dceee3] text-sm font-bold text-[#075c3d]">
                            {initials}
                        </div>
                    </div>
                </header>

                <main className="mx-auto max-w-[1600px] px-5 py-8 md:px-8 lg:px-10">
                    <section className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">
                        <div>
                            <div className="mb-3 flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                <p className="text-xs font-bold uppercase tracking-[2px] text-[#075c3d]">
                                    Financial Overview
                                </p>
                            </div>

                            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
                                Payment Transactions
                            </h2>

                            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
                                Monitor transactions, subscription payments,
                                revenue and refunds across MentorLagbe.
                            </p>
                        </div>

                        <button
                            onClick={fetchPayments}
                            disabled={dataLoading}
                            className="flex items-center justify-center gap-2 rounded-xl border border-[#dfe8e0] bg-white px-5 py-3 text-sm font-bold text-[#53675c] shadow-sm transition hover:border-[#087448] hover:text-[#075c3d] disabled:opacity-50"
                        >
                            <RefreshCw
                                size={17}
                                className={dataLoading ? "animate-spin" : ""}
                            />
                            Refresh Data
                        </button>
                    </section>

                    {error && (
                        <div className="mb-6 flex flex-col justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 sm:flex-row sm:items-center">
                            <span>{error}</span>
                            <button
                                onClick={fetchPayments}
                                className="font-bold underline"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    <section className="mb-10">
                        <div className="mb-5">
                            <h3 className="text-lg font-bold">
                                Transaction Statistics
                            </h3>
                            <p className="mt-1 text-xs text-gray-500">
                                Overview of all recorded payment transactions
                            </p>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                            <MetricCard
                                title="Total Transactions"
                                value={stats.totalTransactions}
                                description="All recorded transactions"
                                icon={<Receipt size={22} />}
                                color="blue"
                            />

                            <MetricCard
                                title="Paid Payments"
                                value={stats.paidPayments}
                                description="Successfully completed payments"
                                icon={<CheckCircle2 size={22} />}
                                color="green"
                            />

                            <MetricCard
                                title="Pending Payments"
                                value={stats.pendingPayments}
                                description="Awaiting payment confirmation"
                                icon={<Clock size={22} />}
                                color="amber"
                            />

                            <MetricCard
                                title="Failed Payments"
                                value={stats.failedPayments}
                                description="Unsuccessful transactions"
                                icon={<XCircle size={22} />}
                                color="red"
                            />

                            <MetricCard
                                title="Expired Payments"
                                value={stats.expiredPayments}
                                description="Expired checkout sessions"
                                icon={<AlertCircle size={22} />}
                                color="gray"
                            />

                            <MetricCard
                                title="Refunded Payments"
                                value={stats.refundedPayments}
                                description="Transactions with completed refunds"
                                icon={<RotateCcw size={22} />}
                                color="purple"
                            />
                        </div>
                    </section>

                    <section className="mb-10">
                        <div className="mb-5">
                            <h3 className="text-lg font-bold">
                                Revenue Overview
                            </h3>
                            <p className="mt-1 text-xs text-gray-500">
                                Financial summary based on payment records
                            </p>
                        </div>

                        <div className="grid gap-5 md:grid-cols-3">
                            <RevenueCard
                                title="Gross Revenue"
                                value={formatAmount(stats.grossRevenue)}
                                description="Total recorded payment revenue"
                                icon={<Wallet size={22} />}
                                color="blue"
                            />

                            <RevenueCard
                                title="Refunded Amount"
                                value={formatAmount(stats.refundedAmount)}
                                description="Total refunded amount"
                                icon={<RotateCcw size={22} />}
                                color="amber"
                            />

                            <RevenueCard
                                title="Net Revenue"
                                value={formatAmount(stats.netRevenue)}
                                description="Revenue after refunds"
                                icon={<TrendingUp size={22} />}
                                color="green"
                            />
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-2xl border border-[#e8ece8] bg-white shadow-sm">
                        <div className="border-b border-[#edf0ed] p-5 md:p-6">
                            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                                <div>
                                    <h3 className="text-lg font-bold">
                                        Transaction History
                                    </h3>
                                    <p className="mt-1 text-xs text-gray-500">
                                        View and monitor customer payment records
                                    </p>
                                </div>

                                <span className="w-fit rounded-full bg-[#eaf4ed] px-3 py-1.5 text-xs font-bold text-[#075c3d]">
                                    {pagination.totalPayments} Transactions
                                </span>
                            </div>

                            <div className="grid gap-3 md:grid-cols-[1fr_190px_170px]">
                                <div className="relative">
                                    <Search
                                        size={18}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                                    />

                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search name, email, plan or payment ID..."
                                        className="h-11 w-full rounded-xl border border-[#e5ebe5] bg-[#fafbfa] pl-11 pr-4 text-sm outline-none transition focus:border-[#087448] focus:bg-white"
                                    />
                                </div>

                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="h-11 rounded-xl border border-[#e5ebe5] bg-[#fafbfa] px-3 text-sm outline-none focus:border-[#087448]"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="paid">Paid</option>
                                    <option value="pending">Pending</option>
                                    <option value="failed">Failed</option>
                                    <option value="expired">Expired</option>
                                </select>

                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    className="h-11 rounded-xl border border-[#e5ebe5] bg-[#fafbfa] px-3 text-sm outline-none focus:border-[#087448]"
                                >
                                    <option value="all">All Users</option>
                                    <option value="student">Students</option>
                                    <option value="tutor">Tutors</option>
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1150px] text-left">
                                <thead className="bg-[#f8faf8]">
                                    <tr className="border-b border-[#edf0ed]">
                                        <th className="px-5 py-4 text-[10px] font-extrabold uppercase tracking-wider text-gray-500">
                                            Customer
                                        </th>
                                        <th className="px-5 py-4 text-[10px] font-extrabold uppercase tracking-wider text-gray-500">
                                            Account
                                        </th>
                                        <th className="px-5 py-4 text-[10px] font-extrabold uppercase tracking-wider text-gray-500">
                                            Amount
                                        </th>
                                        <th className="px-5 py-4 text-[10px] font-extrabold uppercase tracking-wider text-gray-500">
                                            Provider
                                        </th>
                                        <th className="px-5 py-4 text-[10px] font-extrabold uppercase tracking-wider text-gray-500">
                                            Status
                                        </th>
                                        <th className="px-5 py-4 text-[10px] font-extrabold uppercase tracking-wider text-gray-500">
                                            Payment Reference
                                        </th>
                                        <th className="px-5 py-4 text-[10px] font-extrabold uppercase tracking-wider text-gray-500">
                                            Payment Date
                                        </th>
                                        <th className="px-5 py-4 text-[10px] font-extrabold uppercase tracking-wider text-gray-500">
                                            Refund
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-[#edf0ed]">
                                    {dataLoading ? (
                                        <tr>
                                            <td colSpan={8} className="px-5 py-16 text-center">
                                                <RefreshCw
                                                    size={25}
                                                    className="mx-auto animate-spin text-[#075c3d]"
                                                />
                                                <p className="mt-3 text-sm text-gray-500">
                                                    Loading payment transactions...
                                                </p>
                                            </td>
                                        </tr>
                                    ) : filteredPayments.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-5 py-16 text-center">
                                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f1f6f2] text-[#075c3d]">
                                                    <CreditCard size={25} />
                                                </div>

                                                <p className="mt-4 text-sm font-bold text-gray-700">
                                                    No transactions found
                                                </p>

                                                <p className="mt-1 text-xs text-gray-400">
                                                    Try changing your search or filters.
                                                </p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredPayments.map((payment) => {
                                            const status = getStatusMeta(payment.status);
                                            const StatusIcon = status.icon;

                                            const reference =
                                                payment.paymentIntentId ||
                                                payment.checkoutSessionId ||
                                                payment.paymentId;

                                            return (
                                                <tr
                                                    key={payment.paymentId}
                                                    className="transition hover:bg-[#fafcfa]"
                                                >
                                                    <td className="px-5 py-4">
                                                        <p className="text-sm font-bold text-[#26372d]">
                                                            {payment.userName || "Unknown User"}
                                                        </p>
                                                        <p className="mt-1 text-xs text-gray-400">
                                                            {payment.userEmail || "No email"}
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <span className="inline-flex rounded-full bg-[#eaf4ed] px-2.5 py-1 text-[10px] font-bold capitalize text-[#075c3d]">
                                                            {payment.role}
                                                        </span>
                                                        <p className="mt-2 text-xs font-semibold capitalize text-gray-500">
                                                            {payment.plan} Plan
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <p className="text-sm font-extrabold text-[#26372d]">
                                                            {formatAmount(payment.amount, payment.currency)}
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <span className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600">
                                                            <span className="h-2 w-2 rounded-full bg-[#635bff]" />
                                                            {payment.provider || "Unknown"}
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] font-bold ${status.color}`}>
                                                            <StatusIcon size={12} />
                                                            {status.label}
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="max-w-[135px] truncate text-xs font-semibold text-gray-600">
                                                                {reference || "—"}
                                                            </span>

                                                            {reference && (
                                                                <button
                                                                    onClick={() => copyReference(reference)}
                                                                    title="Copy payment reference"
                                                                    className="rounded-lg p-1.5 text-gray-400 transition hover:bg-[#eaf4ed] hover:text-[#075c3d]"
                                                                >
                                                                    <Copy size={14} />
                                                                </button>
                                                            )}
                                                        </div>

                                                        <details className="mt-2">
                                                            <summary className="cursor-pointer text-[10px] font-bold text-[#087448]">
                                                                View references
                                                            </summary>

                                                            <div className="mt-2 space-y-1 rounded-lg bg-[#f7faf7] p-2 text-[10px] text-gray-500">
                                                                <p className="break-all">
                                                                    Payment ID: {payment.paymentId || "—"}
                                                                </p>
                                                                <p className="break-all">
                                                                    Checkout: {payment.checkoutSessionId || "—"}
                                                                </p>
                                                                <p className="break-all">
                                                                    Intent: {payment.paymentIntentId || "—"}
                                                                </p>
                                                                <p className="break-all">
                                                                    Stripe Event: {payment.stripeEventId || "—"}
                                                                </p>
                                                                <p className="break-all">
                                                                    User ID: {payment.userId || "—"}
                                                                </p>
                                                            </div>
                                                        </details>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <p className="text-xs font-semibold text-gray-600">
                                                            {formatDate(payment.paidAt || payment.createdAt)}
                                                        </p>
                                                        <p className="mt-1 text-[10px] text-gray-400">
                                                            {payment.paidAt ? "Paid date" : "Created date"}
                                                        </p>
                                                        <p className="mt-2 text-[10px] text-gray-400">
                                                            Updated: {formatDate(payment.updatedAt)}
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <p className={`text-xs font-bold ${
                                                            payment.refundStatus?.toLowerCase() === "refunded"
                                                                ? "text-emerald-700"
                                                                : "text-gray-500"
                                                        }`}>
                                                            {getRefundMeta(payment.refundStatus)}
                                                        </p>

                                                        {payment.refundedAt && (
                                                            <p className="mt-1 text-[10px] text-gray-400">
                                                                {formatDate(payment.refundedAt)}
                                                            </p>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex flex-col justify-between gap-4 border-t border-[#edf0ed] px-5 py-5 sm:flex-row sm:items-center">
                            <p className="text-xs text-gray-500">
                                Showing {filteredPayments.length} of {payments.length} transactions on this page.
                                {" "}Total records: {pagination.totalPayments}
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() =>
                                        setPagination((prev) => ({
                                            ...prev,
                                            currentPage: Math.max(1, prev.currentPage - 1),
                                        }))
                                    }
                                    disabled={page <= 1 || dataLoading}
                                    className="flex items-center gap-1 rounded-lg border border-[#e5ebe5] px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-[#f3f7f3] disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ChevronLeft size={15} />
                                    Previous
                                </button>

                                <span className="rounded-lg bg-[#eaf4ed] px-4 py-2 text-xs font-extrabold text-[#075c3d]">
                                    {page} / {Math.max(1, pagination.totalPages)}
                                </span>

                                <button
                                    onClick={() =>
                                        setPagination((prev) => ({
                                            ...prev,
                                            currentPage: Math.min(
                                                Math.max(1, prev.totalPages),
                                                prev.currentPage + 1
                                            ),
                                        }))
                                    }
                                    disabled={
                                        page >= pagination.totalPages ||
                                        dataLoading ||
                                        pagination.totalPages === 0
                                    }
                                    className="flex items-center gap-1 rounded-lg border border-[#e5ebe5] px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-[#f3f7f3] disabled:cursor-not-allowed disabled:opacity-40"
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
                                Payment Administration
                            </p>
                        </div>
                    </footer>
                </main>
            </div>
        </div>
    );
}

function MetricCard({
    title,
    value,
    description,
    icon,
    color,
}: {
    title: string;
    value: number;
    description: string;
    icon: ReactNode;
    color: "green" | "blue" | "amber" | "red" | "gray" | "purple";
}) {
    const styles = {
        green: "bg-emerald-50 text-emerald-700",
        blue: "bg-blue-50 text-blue-700",
        amber: "bg-amber-50 text-amber-700",
        red: "bg-red-50 text-red-600",
        gray: "bg-gray-100 text-gray-600",
        purple: "bg-purple-50 text-purple-700",
    };

    return (
        <div className="group rounded-2xl border border-[#e8ece8] bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="mb-6 flex items-center justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${styles[color]}`}>
                    {icon}
                </div>

                <ArrowUpRight
                    size={18}
                    className="text-gray-300 transition group-hover:text-[#075c3d]"
                />
            </div>

            <p className="text-sm font-medium text-gray-500">
                {title}
            </p>

            <h3 className="mt-2 text-3xl font-extrabold tracking-tight text-[#17221d]">
                {value.toLocaleString()}
            </h3>

            <p className="mt-2 text-xs text-gray-400">
                {description}
            </p>
        </div>
    );
}

function RevenueCard({
    title,
    value,
    description,
    icon,
    color,
}: {
    title: string;
    value: string;
    description: string;
    icon: ReactNode;
    color: "green" | "blue" | "amber";
}) {
    const styles = {
        green: "bg-emerald-50 text-emerald-700",
        blue: "bg-blue-50 text-blue-700",
        amber: "bg-amber-50 text-amber-700",
    };

    return (
        <div className="rounded-2xl border border-[#e8ece8] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${styles[color]}`}>
                    {icon}
                </div>

                <ArrowUpRight size={18} className="text-gray-300" />
            </div>

            <p className="mt-6 text-sm font-medium text-gray-500">
                {title}
            </p>

            <h3 className="mt-2 break-words text-2xl font-extrabold tracking-tight text-[#17221d] md:text-3xl">
                {value}
            </h3>

            <p className="mt-2 text-xs text-gray-400">
                {description}
            </p>
        </div>
    );
}
