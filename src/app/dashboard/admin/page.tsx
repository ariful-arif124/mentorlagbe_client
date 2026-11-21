
"use client";

import { useEffect, useState } from "react";
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
    Bell,
    ArrowUpRight,
    CheckCircle2,
    Clock,
    UserRound,
    ShieldCheck,
    Home,
} from "lucide-react";

const API_URL = (() => {
    const baseUrl = (
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
    ).replace(/\/+$/, "");

    return baseUrl.endsWith("/api")
        ? baseUrl
        : `${baseUrl}/api`;
})();

type AdminUser = {
    name?: string;
    email?: string;
    role?: string;
};

type AdminStats = {
    users: {
        total: number;
        students: number;
        tutors: number;
        admins: number;
    };
    tuitions: {
        total: number;
        pending: number;
        approved: number;
        active: number;
    };
    totalApplications: number;
};

const navigation = [
    { label: "Overview", icon: LayoutDashboard, active: true },
    { label: "User Management", icon: Users, active: false },
    { label: "Tutors", icon: GraduationCap, active: false },
    { label: "Students", icon: UserRound, active: false },
    { label: "Tuition Management", icon: BookOpen, active: false },
    { label: "Applications", icon: ClipboardList, active: false },
    { label: "Payments", icon: CreditCard, active: false },
];

export default function AdminDashboard() {
    const router = useRouter();

    const [user, setUser] = useState<AdminUser | null>(null);

    const [stats, setStats] = useState<AdminStats>({
        users: {
            total: 0,
            students: 0,
            tutors: 0,
            admins: 0,
        },
        tuitions: {
            total: 0,
            pending: 0,
            approved: 0,
            active: 0,
        },
        totalApplications: 0,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        async function loadDashboard() {
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

                let parsedUser: AdminUser;

                try {
                    parsedUser = JSON.parse(storedUser);
                } catch {
                    router.replace("/sign-in");
                    return;
                }

                if (parsedUser.role !== "admin") {
                    router.replace("/");
                    return;
                }

                setUser(parsedUser);

                const response = await fetch(
                    `${API_URL}/admin/stats`,
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
                        result.message || "Failed to load dashboard"
                    );
                }

                setStats(result.data);
            } catch (err) {
                console.error("Admin dashboard error:", err);

                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load dashboard"
                );
            } finally {
                setLoading(false);
            }
        }

        loadDashboard();
    }, [router]);

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("mentorlagbe_token");
        localStorage.removeItem("mentorlagbe_user");

        router.replace("/sign-in");
    }

    function handleNavigation(label: string) {
        setMobileOpen(false);

        if (label === "Overview") {
            router.push("/dashboard/admin");
        } else if (label === "User Management") {
            router.push("/dashboard/admin/users");
        } else if (label === "Tutors") {
            router.push("/dashboard/admin/tutors");
        } else if (label === "Students") {
            router.push("/dashboard/admin/students");
        } else if (label === "Tuition Management") {
            router.push("/dashboard/admin/tuitions");
        } else if (label === "Applications") {
            router.push("/dashboard/admin/applications");
        } else if (label === "Payments") {
            router.push("/dashboard/admin/payments");
        }
    }

    const initials = (user?.name || "Admin")
        .split(" ")
        .map((word) => word[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f7f8f6]">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#dcebe2] border-t-[#075c3d]" />
                    <p className="mt-4 text-sm text-gray-500">
                        Loading Admin Dashboard...
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

                        const isImplemented =
                            item.label === "Overview" ||
                            item.label === "User Management" ||
                            item.label === "Tutors" ||
                            item.label === "Students" ||
                            item.label === "Tuition Management" ||
                            item.label === "Applications" ||
                            item.label === "Payments";

                        return (
                            <button
                                key={item.label}
                                type="button"
                                title={collapsed ? item.label : ""}
                                disabled={!isImplemented}
                                onClick={() => handleNavigation(item.label)}
                                className={`
                                    flex w-full items-center gap-3 rounded-xl px-3 py-3
                                    text-left text-sm font-medium transition
                                    ${item.active
                                        ? "bg-[#eaf4ed] text-[#075c3d]"
                                        : "text-gray-500 hover:bg-[#f5f7f5] hover:text-[#075c3d]"
                                    }
                                    ${isImplemented
                                        ? "cursor-pointer"
                                        : "cursor-not-allowed opacity-70"
                                    }
                                `}
                            >
                                <Icon size={19} />

                                {!collapsed && (
                                    <>
                                        <span>{item.label}</span>

                                        {!isImplemented && (
                                            <span className="ml-auto text-[9px] font-semibold uppercase text-gray-400">
                                                Soon
                                            </span>
                                        )}
                                    </>
                                )}

                                {collapsed && item.active && (
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
                                MentorLagbe / Administration
                            </p>

                            <h1 className="text-lg font-bold">
                                Dashboard Overview
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">

                        <div className="hidden items-center gap-2 rounded-xl border border-[#e9ede9] bg-[#fafbfa] px-3 py-2 md:flex">
                            <Search size={17} className="text-gray-400" />
                            <span className="text-xs text-gray-400">
                                Search coming soon
                            </span>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e9ede9] text-gray-500">
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
                                Welcome back, {user?.name?.split(" ")[0] || "Admin"}!
                            </h2>

                            <p className="mt-3 text-sm text-gray-500 md:text-base">
                                Here&apos;s what&apos;s happening across your MentorLagbe platform.
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

                    {error && (
                        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <section className="mb-9">

                        <div className="mb-5">
                            <h3 className="text-lg font-bold">
                                User Overview
                            </h3>

                            <p className="mt-1 text-xs text-gray-500">
                                Registered users across the platform
                            </p>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

                            <StatCard
                                title="Total Users"
                                value={stats.users.total}
                                description="All registered accounts"
                                icon={<Users size={22} />}
                                color="green"
                            />

                            <StatCard
                                title="Students"
                                value={stats.users.students}
                                description="Registered students"
                                icon={<UserRound size={22} />}
                                color="blue"
                            />

                            <StatCard
                                title="Tutors"
                                value={stats.users.tutors}
                                description="Registered tutors"
                                icon={<GraduationCap size={22} />}
                                color="purple"
                            />

                            <StatCard
                                title="Administrators"
                                value={stats.users.admins}
                                description="Admin accounts"
                                icon={<ShieldCheck size={22} />}
                                color="amber"
                            />

                        </div>
                    </section>

                    <section className="mb-9">

                        <div className="mb-5">
                            <h3 className="text-lg font-bold">
                                Tuition Overview
                            </h3>

                            <p className="mt-1 text-xs text-gray-500">
                                Tuition listings and approval statistics
                            </p>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

                            <StatCard
                                title="Total Tuitions"
                                value={stats.tuitions.total}
                                description="All tuition listings"
                                icon={<BookOpen size={22} />}
                                color="blue"
                            />

                            <StatCard
                                title="Pending Approval"
                                value={stats.tuitions.pending}
                                description="Waiting for admin review"
                                icon={<Clock size={22} />}
                                color="amber"
                            />

                            <StatCard
                                title="Approved Tuitions"
                                value={stats.tuitions.approved}
                                description="Successfully approved"
                                icon={<CheckCircle2 size={22} />}
                                color="green"
                            />

                            <StatCard
                                title="Active Tuitions"
                                value={stats.tuitions.active}
                                description="Currently active listings"
                                icon={<BookOpen size={22} />}
                                color="purple"
                            />

                        </div>
                    </section>

                    <section className="grid gap-6 xl:grid-cols-3">

                        <div className="rounded-2xl border border-[#e8ece8] bg-white p-6 shadow-sm xl:col-span-2">

                            <div className="mb-7">
                                <h3 className="text-lg font-bold">
                                    Platform Summary
                                </h3>

                                <p className="mt-1 text-xs text-gray-500">
                                    Current platform distribution
                                </p>
                            </div>

                            <div className="space-y-7">

                                <DistributionBar
                                    label="Students"
                                    value={stats.users.students}
                                    total={stats.users.total}
                                    color="bg-blue-500"
                                />

                                <DistributionBar
                                    label="Tutors"
                                    value={stats.users.tutors}
                                    total={stats.users.total}
                                    color="bg-emerald-600"
                                />

                                <DistributionBar
                                    label="Administrators"
                                    value={stats.users.admins}
                                    total={stats.users.total}
                                    color="bg-amber-500"
                                />

                            </div>

                            <div className="mt-8 grid gap-4 border-t border-[#edf0ed] pt-6 sm:grid-cols-2">

                                <div className="rounded-xl bg-[#f7f9f7] p-4">
                                    <div className="flex items-center gap-2 text-[#075c3d]">
                                        <ClipboardList size={19} />
                                        <span className="text-sm font-semibold">
                                            Total Applications
                                        </span>
                                    </div>

                                    <p className="mt-3 text-3xl font-bold">
                                        {stats.totalApplications}
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Student applications received
                                    </p>
                                </div>

                                <div className="rounded-xl bg-[#f7f9f7] p-4">
                                    <div className="flex items-center gap-2 text-[#075c3d]">
                                        <CheckCircle2 size={19} />
                                        <span className="text-sm font-semibold">
                                            Tuition Approval Rate
                                        </span>
                                    </div>

                                    <p className="mt-3 text-3xl font-bold">
                                        {stats.tuitions.total > 0
                                            ? Math.round(
                                                (stats.tuitions.approved /
                                                    stats.tuitions.total) * 100
                                            )
                                            : 0}%
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Approved listings / total listings
                                    </p>
                                </div>

                            </div>
                        </div>

                        <div className="rounded-2xl border border-[#e8ece8] bg-white p-6 shadow-sm">

                            <h3 className="text-lg font-bold">
                                Administration
                            </h3>

                            <p className="mt-1 text-xs text-gray-500">
                                Your platform control center
                            </p>

                            <div className="mt-7 space-y-5">

                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf4ed] text-[#075c3d]">
                                        <ShieldCheck size={20} />
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold">
                                            Admin Authentication
                                        </p>

                                        <p className="text-xs text-emerald-600">
                                            Verified
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                        <Users size={20} />
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold">
                                            User Database
                                        </p>

                                        <p className="text-xs text-gray-500">
                                            {stats.users.total} accounts registered
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                        <BookOpen size={20} />
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold">
                                            Tuition Moderation
                                        </p>

                                        <p className="text-xs text-gray-500">
                                            {stats.tuitions.pending} awaiting approval
                                        </p>
                                    </div>
                                </div>

                            </div>

                            <div className="mt-8 rounded-xl bg-[#075c3d] p-5 text-white">
                                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-200">
                                    MentorLagbe
                                </p>

                                <h4 className="mt-2 text-xl font-bold">
                                    Admin Control Center
                                </h4>

                                <p className="mt-2 text-xs leading-5 text-emerald-100">
                                    Monitor users, manage tuition listings, and maintain platform quality.
                                </p>
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
        </div>
    );
}

function StatCard({
    title,
    value,
    description,
    icon,
    color,
}: {
    title: string;
    value: number;
    description: string;
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

            <h3 className="mt-2 text-3xl font-extrabold tracking-tight">
                {value.toLocaleString()}
            </h3>

            <p className="mt-2 text-xs text-gray-400">
                {description}
            </p>

        </div>
    );
}

function DistributionBar({
    label,
    value,
    total,
    color,
}: {
    label: string;
    value: number;
    total: number;
    color: string;
}) {
    const percentage =
        total > 0 ? (value / total) * 100 : 0;

    return (
        <div>
            <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold">
                    {label}
                </span>

                <span className="text-sm font-bold">
                    {value}

                    <span className="ml-2 text-xs font-normal text-gray-400">
                        {percentage.toFixed(0)}%
                    </span>
                </span>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                <div
                    className={`h-full rounded-full transition-all duration-700 ${color}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
