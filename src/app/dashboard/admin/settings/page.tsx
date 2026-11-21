
"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
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
    Bell,
    ShieldCheck,
    Home,
    Building2,
    UserRound,
    LockKeyhole,
    Mail,
    Phone,
    SlidersHorizontal,
    MonitorCog,
    Save,
    Loader2,
    AlertTriangle,
    CheckCircle2,
    Eye,
    EyeOff,
} from "lucide-react";

const API_ROOT = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

const API_URL = API_ROOT.endsWith("/api") ? API_ROOT : `${API_ROOT}/api`;

type Section =
    | "general"
    | "profile"
    | "security"
    | "notifications"
    | "platform";

type AdminUser = {
    name?: string;
    email?: string;
    role?: string;
};

type ProfileData = {
    name: string;
    email: string;
    phone: string;
    bio: string;
    image: string;
};

type PlatformSettings = {
    platformName: string;
    contactEmail: string;
    supportEmail: string;
    supportPhone: string;
    maintenanceMode: boolean;
};

type NotificationSettings = {
    newUserRegistration: boolean;
    newTuitionSubmission: boolean;
    newApplication: boolean;
    paymentUpdates: boolean;
    adminAlerts: boolean;
};

type ApiResponse<T> = {
    success: boolean;
    message?: string;
    data?: T;
};

const initialPlatform: PlatformSettings = {
    platformName: "MentorLagbe",
    contactEmail: "",
    supportEmail: "",
    supportPhone: "",
    maintenanceMode: false,
};

const initialNotifications: NotificationSettings = {
    newUserRegistration: true,
    newTuitionSubmission: true,
    newApplication: true,
    paymentUpdates: true,
    adminAlerts: true,
};

const mainNavigation = [
    { label: "Overview", href: "/dashboard/admin", icon: LayoutDashboard, implemented: true },
    { label: "User Management", href: "/dashboard/admin/users", icon: Users, implemented: true },
    { label: "Tutors", href: "/dashboard/admin/tutors", icon: GraduationCap, implemented: true },
    { label: "Students", href: "/dashboard/admin/students", icon: UserRound, implemented: true },
    { label: "Tuition Management", href: "/dashboard/admin/tuitions", icon: BookOpen, implemented: true },
    { label: "Applications", href: "/dashboard/admin/applications", icon: ClipboardList, implemented: true },
    { label: "Payments", href: "/dashboard/admin/payments", icon: CreditCard, implemented: true },
];

const settingTabs: {
    id: Section;
    label: string;
    description: string;
    icon: typeof Settings;
}[] = [
        {
            id: "general",
            label: "General",
            description: "Platform information",
            icon: Building2,
        },
        {
            id: "profile",
            label: "Admin Profile",
            description: "Personal information",
            icon: UserRound,
        },
        {
            id: "security",
            label: "Security",
            description: "Password and access",
            icon: LockKeyhole,
        },
        {
            id: "notifications",
            label: "Notifications",
            description: "Notification preferences",
            icon: Bell,
        },
        {
            id: "platform",
            label: "Platform Controls",
            description: "Platform operations",
            icon: MonitorCog,
        },
    ];

function clearAuthentication() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("mentorlagbe_token");
    localStorage.removeItem("mentorlagbe_user");
}

export default function AdminSettingsPage() {
    const router = useRouter();

    const [admin, setAdmin] = useState<AdminUser | null>(null);
    const [token, setToken] = useState("");

    const [profile, setProfile] = useState<ProfileData>({
        name: "",
        email: "",
        phone: "",
        bio: "",
        image: "",
    });

    const [platform, setPlatform] =
        useState<PlatformSettings>(initialPlatform);

    const [notifications, setNotifications] =
        useState<NotificationSettings>(initialNotifications);

    const [activeSection, setActiveSection] =
        useState<Section>("general");

    const [loading, setLoading] = useState(true);
    const [profileSaving, setProfileSaving] = useState(false);
    const [settingsSaving, setSettingsSaving] = useState(false);
    const [passwordSaving, setPasswordSaving] = useState(false);

    const [settingsApiAvailable, setSettingsApiAvailable] = useState(true);
    const [settingsApiMessage, setSettingsApiMessage] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        let active = true;

        async function loadSettingsPage() {
            try {
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

                if (!active) return;

                setAdmin(parsedUser);
                setToken(storedToken);

                const headers = {
                    Authorization: `Bearer ${storedToken}`,
                };

                try {
                    const profileResponse = await fetch(`${API_URL}/profile`, {
                        method: "GET",
                        headers,
                        cache: "no-store",
                    });

                    const profileResult =
                        (await profileResponse.json().catch(() => null)) as
                        | ApiResponse<Partial<ProfileData>>
                        | null;

                    if (profileResponse.status === 401) {
                        clearAuthentication();
                        router.replace("/sign-in");
                        return;
                    }

                    if (
                        profileResponse.ok &&
                        profileResult?.success &&
                        profileResult.data
                    ) {
                        if (!active) return;

                        setProfile({
                            name: profileResult.data.name || "",
                            email: profileResult.data.email || "",
                            phone: profileResult.data.phone || "",
                            bio: profileResult.data.bio || "",
                            image: profileResult.data.image || "",
                        });

                        setAdmin({
                            name: profileResult.data.name || parsedUser.name,
                            email: profileResult.data.email || parsedUser.email,
                            role: "admin",
                        });
                    } else {
                        setProfile((previous) => ({
                            ...previous,
                            name: parsedUser.name || "",
                            email: parsedUser.email || "",
                        }));
                    }
                } catch {
                    if (active) {
                        setProfile((previous) => ({
                            ...previous,
                            name: parsedUser.name || "",
                            email: parsedUser.email || "",
                        }));
                    }
                }

                try {
                    const settingsResponse = await fetch(
                        `${API_URL}/admin/settings`,
                        {
                            method: "GET",
                            headers,
                            cache: "no-store",
                        }
                    );

                    const settingsResult =
                        (await settingsResponse.json().catch(() => null)) as
                        | ApiResponse<{
                            platform?: Partial<PlatformSettings>;
                            notifications?: Partial<NotificationSettings>;
                        }>
                        | null;

                    if (settingsResponse.status === 401) {
                        clearAuthentication();
                        router.replace("/sign-in");
                        return;
                    }

                    if (
                        settingsResponse.ok &&
                        settingsResult?.success &&
                        settingsResult.data
                    ) {
                        if (!active) return;

                        setSettingsApiAvailable(true);

                        setPlatform((previous) => ({
                            ...previous,
                            ...settingsResult.data?.platform,
                        }));

                        setNotifications((previous) => ({
                            ...previous,
                            ...settingsResult.data?.notifications,
                        }));
                    } else {
                        setSettingsApiAvailable(false);
                        setSettingsApiMessage(
                            "Platform settings API will be connected in the backend implementation."
                        );
                    }
                } catch {
                    setSettingsApiAvailable(false);
                    setSettingsApiMessage(
                        "Platform settings API will be connected in the backend implementation."
                    );
                }
            } catch (error) {
                console.error("Settings loading error:", error);

                if (active) {
                    toast.error("Unable to load administrator settings.");
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadSettingsPage();

        return () => {
            active = false;
        };
    }, [router]);

    const initials = (admin?.name || "Admin")
        .split(" ")
        .map((word) => word[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    const handleLogout = () => {
        clearAuthentication();
        router.replace("/sign-in");
    };

    const handleNavigation = (href: string) => {
        if (!href) return;

        router.push(href);
        setMobileOpen(false);
    };

    const updateProfile = (field: keyof ProfileData, value: string) => {
        setProfile((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const syncStoredUser = (updatedProfile: ProfileData) => {
        let existingUser: Record<string, unknown> = {};

        try {
            const storedUser =
                localStorage.getItem("user") ||
                localStorage.getItem("mentorlagbe_user");

            if (storedUser) {
                existingUser = JSON.parse(storedUser);
            }
        } catch {
            existingUser = {};
        }

        const updatedUser = {
            ...existingUser,
            name: updatedProfile.name,
            email: updatedProfile.email,
            phone: updatedProfile.phone,
            bio: updatedProfile.bio,
            image: updatedProfile.image,
            role: "admin",
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));
        localStorage.setItem("mentorlagbe_user", JSON.stringify(updatedUser));

        window.dispatchEvent(new Event("mentorlagbe-auth-change"));
    };

    const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (profile.name.trim().length < 2) {
            toast.error("Name must contain at least 2 characters.");
            return;
        }

        if (!token) {
            toast.error("Please sign in again.");
            router.replace("/sign-in");
            return;
        }

        setProfileSaving(true);

        try {
            const response = await fetch(`${API_URL}/profile`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: profile.name.trim(),
                    phone: profile.phone.trim(),
                    bio: profile.bio.trim(),
                    image: profile.image,
                }),
            });

            const result =
                (await response.json().catch(() => null)) as
                | ApiResponse<Partial<ProfileData>>
                | null;

            if (response.status === 401) {
                clearAuthentication();
                router.replace("/sign-in");
                return;
            }

            if (!response.ok || !result?.success) {
                throw new Error(
                    result?.message || "Failed to update administrator profile."
                );
            }

            const updatedProfile = {
                ...profile,
                ...(result.data || {}),
            };

            setProfile(updatedProfile);
            setAdmin({
                name: updatedProfile.name,
                email: updatedProfile.email,
                role: "admin",
            });

            syncStoredUser(updatedProfile);

            toast.success("Administrator profile updated successfully.");
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Unable to update administrator profile."
            );
        } finally {
            setProfileSaving(false);
        }
    };

    const persistSettings = async (
        payload: {
            platform?: Partial<PlatformSettings>;
            notifications?: Partial<NotificationSettings>;
        },
        successMessage: string
    ) => {
        if (!token) {
            toast.error("Please sign in again.");
            router.replace("/sign-in");
            return;
        }

        setSettingsSaving(true);

        try {
            const response = await fetch(`${API_URL}/admin/settings`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const result =
                (await response.json().catch(() => null)) as
                | ApiResponse<{
                    platform?: Partial<PlatformSettings>;
                    notifications?: Partial<NotificationSettings>;
                }>
                | null;

            if (response.status === 401) {
                clearAuthentication();
                router.replace("/sign-in");
                return;
            }

            if (!response.ok || !result?.success) {
                throw new Error(
                    result?.message || "Unable to save platform settings."
                );
            }

            if (result.data?.platform) {
                setPlatform((previous) => ({
                    ...previous,
                    ...result.data?.platform,
                }));
            }

            if (result.data?.notifications) {
                setNotifications((previous) => ({
                    ...previous,
                    ...result.data?.notifications,
                }));
            }

            setSettingsApiAvailable(true);
            setSettingsApiMessage("");

            toast.success(successMessage);
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Unable to save settings."
            );
        } finally {
            setSettingsSaving(false);
        }
    };

    const handleGeneralSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!platform.platformName.trim()) {
            toast.error("Platform name is required.");
            return;
        }

        await persistSettings(
            {
                platform: {
                    platformName: platform.platformName.trim(),
                    contactEmail: platform.contactEmail.trim(),
                    supportEmail: platform.supportEmail.trim(),
                    supportPhone: platform.supportPhone.trim(),
                },
            },
            "General settings saved successfully."
        );
    };

    const handleNotificationsSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        await persistSettings(
            { notifications },
            "Notification preferences updated successfully."
        );
    };

    const handlePlatformSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        await persistSettings(
            {
                platform: {
                    maintenanceMode: platform.maintenanceMode,
                },
            },
            "Platform controls updated successfully."
        );
    };

    const updateNotification = (
        field: keyof NotificationSettings,
        value: boolean
    ) => {
        setNotifications((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const handlePasswordSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("Please complete all password fields.");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("New password must contain at least 6 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("New password and confirmation do not match.");
            return;
        }

        setPasswordSaving(true);

        try {
            const response = await fetch(
                `${API_URL}/admin/settings/password`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        currentPassword,
                        newPassword,
                    }),
                }
            );

            const result =
                (await response.json().catch(() => null)) as
                | ApiResponse<unknown>
                | null;

            if (response.status === 401) {
                clearAuthentication();
                router.replace("/sign-in");
                return;
            }

            if (!response.ok || !result?.success) {
                throw new Error(
                    result?.message || "Unable to change password."
                );
            }

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            toast.success("Administrator password changed successfully.");
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Unable to change password."
            );
        } finally {
            setPasswordSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f7f8f6]">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#dcebe2] border-t-[#075c3d]" />
                    <p className="mt-4 text-sm text-gray-500">
                        Loading Administrator Settings...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f7f8f6] text-[#17221d]">
            {mobileOpen && (
                <button
                    type="button"
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
                        type="button"
                        onClick={() => setMobileOpen(false)}
                        className="text-gray-400 lg:hidden"
                        aria-label="Close menu"
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
                                    {admin?.name || "Administrator"}
                                </p>
                                <p className="truncate text-xs text-gray-500">
                                    {admin?.email}
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

                    {mainNavigation.map((item) => {
                        const Icon = item.icon;

                        return (
                            <button
                                key={item.label}
                                type="button"
                                title={collapsed ? item.label : ""}
                                disabled={!item.implemented}
                                onClick={() => handleNavigation(item.href)}
                                className={`
                  flex w-full items-center gap-3 rounded-xl px-3 py-3
                  text-left text-sm font-medium transition
                  text-gray-500 hover:bg-[#f5f7f5] hover:text-[#075c3d]
                  ${collapsed ? "justify-center" : ""}
                  ${item.implemented ? "cursor-pointer" : "cursor-not-allowed opacity-60"}
                `}
                            >
                                <Icon size={19} />

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
                            </button>
                        );
                    })}

                    <div className="my-5 border-t border-[#edf0ed]" />

                    <button
                        type="button"
                        title={collapsed ? "Settings" : ""}
                        onClick={() => setMobileOpen(false)}
                        className={`
              flex w-full items-center gap-3 rounded-xl px-3 py-3
              text-left text-sm font-semibold transition
              bg-[#eaf4ed] text-[#075c3d]
              ${collapsed ? "justify-center" : ""}
            `}
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
                        type="button"
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
                            type="button"
                            onClick={() => setMobileOpen(true)}
                            className="text-gray-500 lg:hidden"
                            aria-label="Open navigation"
                        >
                            <Menu size={23} />
                        </button>

                        <button
                            type="button"
                            onClick={() => setCollapsed(!collapsed)}
                            className="hidden rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 lg:block"
                            title="Toggle sidebar"
                        >
                            <Menu size={21} />
                        </button>

                        <div>
                            <p className="text-xs text-gray-400">
                                MentorLagbe / Administration / Settings
                            </p>
                            <h1 className="text-lg font-bold">Settings</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden items-center gap-2 rounded-xl border border-[#e9ede9] bg-[#fafbfa] px-3 py-2 md:flex">
                            <SlidersHorizontal size={16} className="text-gray-400" />
                            <span className="text-xs text-gray-400">
                                Platform Configuration
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
                    <section className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">
                        <div>
                            <div className="mb-3 flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                <p className="text-xs font-bold uppercase tracking-[2px] text-[#075c3d]">
                                    Administration
                                </p>
                            </div>

                            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
                                Settings & Configuration
                            </h2>

                            <p className="mt-3 text-sm text-gray-500 md:text-base">
                                Manage your administrator account and configure the MentorLagbe platform.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => router.push("/")}
                            className="flex items-center justify-center gap-2 rounded-xl border border-[#e1e8e2] bg-white px-5 py-3 text-sm font-semibold text-[#075c3d] shadow-sm transition hover:bg-[#f2f7f3]"
                        >
                            <Home size={17} />
                            Visit Website
                        </button>
                    </section>

                    {!settingsApiAvailable && (
                        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                            <AlertTriangle size={20} className="mt-0.5 shrink-0" />
                            <div>
                                <p className="font-semibold">Backend integration pending</p>
                                <p className="mt-1 text-xs leading-5">
                                    {settingsApiMessage}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="mb-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                        {settingTabs.map((tab) => {
                            const Icon = tab.icon;
                            const active = activeSection === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveSection(tab.id)}
                                    className={`
                    flex items-center gap-3 rounded-2xl border p-4 text-left transition
                    ${active
                                            ? "border-[#b9d7c2] bg-[#eaf4ed] shadow-sm"
                                            : "border-[#e8ece8] bg-white hover:border-[#c9ddce] hover:bg-[#fafcf9]"
                                        }
                  `}
                                >
                                    <div
                                        className={`
                      flex h-11 w-11 shrink-0 items-center justify-center rounded-xl
                      ${active ? "bg-[#075c3d] text-white" : "bg-[#f1f5f1] text-gray-500"}
                    `}
                                    >
                                        <Icon size={20} />
                                    </div>

                                    <div className="min-w-0">
                                        <p className={`text-sm font-bold ${active ? "text-[#075c3d]" : "text-gray-700"}`}>
                                            {tab.label}
                                        </p>
                                        <p className="mt-1 text-[11px] text-gray-400">
                                            {tab.description}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {activeSection === "general" && (
                        <SettingsCard
                            title="General Settings"
                            description="Configure the basic information of your platform."
                        >
                            <form onSubmit={handleGeneralSubmit}>
                                <div className="grid gap-6 md:grid-cols-2">
                                    <FormInput
                                        label="Platform Name"
                                        value={platform.platformName}
                                        onChange={(value) =>
                                            setPlatform((previous) => ({
                                                ...previous,
                                                platformName: value,
                                            }))
                                        }
                                        placeholder="MentorLagbe"
                                        required
                                    />

                                    <FormInput
                                        label="Contact Email"
                                        type="email"
                                        value={platform.contactEmail}
                                        onChange={(value) =>
                                            setPlatform((previous) => ({
                                                ...previous,
                                                contactEmail: value,
                                            }))
                                        }
                                        placeholder="contact@example.com"
                                    />

                                    <FormInput
                                        label="Support Email"
                                        type="email"
                                        value={platform.supportEmail}
                                        onChange={(value) =>
                                            setPlatform((previous) => ({
                                                ...previous,
                                                supportEmail: value,
                                            }))
                                        }
                                        placeholder="support@example.com"
                                    />

                                    <FormInput
                                        label="Support Phone"
                                        type="tel"
                                        value={platform.supportPhone}
                                        onChange={(value) =>
                                            setPlatform((previous) => ({
                                                ...previous,
                                                supportPhone: value,
                                            }))
                                        }
                                        placeholder="+8801XXXXXXXXX"
                                    />
                                </div>

                                <div className="mt-8 flex justify-end border-t border-[#edf0ed] pt-6">
                                    <SaveButton loading={settingsSaving}>
                                        Save General Settings
                                    </SaveButton>
                                </div>
                            </form>
                        </SettingsCard>
                    )}

                    {activeSection === "profile" && (
                        <SettingsCard
                            title="Administrator Profile"
                            description="Update your personal administrator information."
                        >
                            <div className="mb-8 flex flex-col gap-4 rounded-2xl bg-[#f7faf7] p-5 sm:flex-row sm:items-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#dceee3] text-xl font-extrabold text-[#075c3d]">
                                    {initials}
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold">
                                        {profile.name || "Administrator"}
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {profile.email}
                                    </p>
                                    <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#e5f2e8] px-3 py-1 text-[10px] font-bold uppercase text-[#075c3d]">
                                        <ShieldCheck size={12} />
                                        Administrator Account
                                    </span>
                                </div>
                            </div>

                            <form onSubmit={handleProfileSubmit}>
                                <div className="grid gap-6 md:grid-cols-2">
                                    <FormInput
                                        label="Full Name"
                                        value={profile.name}
                                        onChange={(value) => updateProfile("name", value)}
                                        placeholder="Your full name"
                                        required
                                    />

                                    <FormInput
                                        label="Email Address"
                                        type="email"
                                        value={profile.email}
                                        onChange={() => { }}
                                        readOnly
                                        helper="Email address cannot be changed here."
                                    />

                                    <FormInput
                                        label="Phone Number"
                                        type="tel"
                                        value={profile.phone}
                                        onChange={(value) => updateProfile("phone", value)}
                                        placeholder="+8801XXXXXXXXX"
                                    />
                                </div>

                                <div className="mt-6">
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        About Me
                                    </label>

                                    <textarea
                                        value={profile.bio}
                                        onChange={(event) =>
                                            updateProfile("bio", event.target.value)
                                        }
                                        rows={4}
                                        maxLength={500}
                                        placeholder="Write a short description about yourself..."
                                        className="w-full resize-y rounded-xl border border-[#e2e8e2] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#075c3d] focus:ring-2 focus:ring-[#075c3d]/10"
                                    />

                                    <p className="mt-2 text-right text-xs text-gray-400">
                                        {profile.bio.length}/500 characters
                                    </p>
                                </div>

                                <div className="mt-8 flex justify-end border-t border-[#edf0ed] pt-6">
                                    <SaveButton loading={profileSaving}>
                                        Save Profile
                                    </SaveButton>
                                </div>
                            </form>
                        </SettingsCard>
                    )}

                    {activeSection === "security" && (
                        <SettingsCard
                            title="Security Settings"
                            description="Change your administrator account password."
                        >
                            <div className="mb-6 flex items-start gap-3 rounded-xl bg-[#f3f7f4] p-4">
                                <ShieldCheck size={21} className="mt-0.5 text-[#075c3d]" />
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">
                                        Keep your account secure
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-gray-500">
                                        Use a strong password and never share your administrator credentials.
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handlePasswordSubmit}>
                                <div className="max-w-2xl space-y-6">
                                    <PasswordInput
                                        label="Current Password"
                                        value={currentPassword}
                                        visible={showCurrentPassword}
                                        onChange={setCurrentPassword}
                                        onToggle={() =>
                                            setShowCurrentPassword((previous) => !previous)
                                        }
                                    />

                                    <PasswordInput
                                        label="New Password"
                                        value={newPassword}
                                        visible={showNewPassword}
                                        onChange={setNewPassword}
                                        onToggle={() =>
                                            setShowNewPassword((previous) => !previous)
                                        }
                                        helper="Minimum 6 characters."
                                    />

                                    <PasswordInput
                                        label="Confirm New Password"
                                        value={confirmPassword}
                                        visible={showConfirmPassword}
                                        onChange={setConfirmPassword}
                                        onToggle={() =>
                                            setShowConfirmPassword((previous) => !previous)
                                        }
                                    />
                                </div>

                                <div className="mt-8 flex justify-end border-t border-[#edf0ed] pt-6">
                                    <SaveButton loading={passwordSaving}>
                                        Update Password
                                    </SaveButton>
                                </div>
                            </form>
                        </SettingsCard>
                    )}

                    {activeSection === "notifications" && (
                        <SettingsCard
                            title="Notification Preferences"
                            description="Choose which platform activities should generate administrator notifications."
                        >
                            <form onSubmit={handleNotificationsSubmit}>
                                <div className="space-y-3">
                                    <SettingToggle
                                        title="New User Registration"
                                        description="Receive notifications when a new student or tutor registers."
                                        enabled={notifications.newUserRegistration}
                                        onChange={(value) =>
                                            updateNotification("newUserRegistration", value)
                                        }
                                    />

                                    <SettingToggle
                                        title="New Tuition Submission"
                                        description="Get notified whenever a tutor submits a new tuition listing."
                                        enabled={notifications.newTuitionSubmission}
                                        onChange={(value) =>
                                            updateNotification("newTuitionSubmission", value)
                                        }
                                    />

                                    <SettingToggle
                                        title="New Applications"
                                        description="Receive updates when students submit tuition applications."
                                        enabled={notifications.newApplication}
                                        onChange={(value) =>
                                            updateNotification("newApplication", value)
                                        }
                                    />

                                    <SettingToggle
                                        title="Payment Updates"
                                        description="Get notifications about successful and failed payments."
                                        enabled={notifications.paymentUpdates}
                                        onChange={(value) =>
                                            updateNotification("paymentUpdates", value)
                                        }
                                    />

                                    <SettingToggle
                                        title="Important Admin Alerts"
                                        description="Receive important security and platform-related alerts."
                                        enabled={notifications.adminAlerts}
                                        onChange={(value) =>
                                            updateNotification("adminAlerts", value)
                                        }
                                    />
                                </div>

                                <div className="mt-8 flex justify-end border-t border-[#edf0ed] pt-6">
                                    <SaveButton loading={settingsSaving}>
                                        Save Notification Preferences
                                    </SaveButton>
                                </div>
                            </form>
                        </SettingsCard>
                    )}

                    {activeSection === "platform" && (
                        <SettingsCard
                            title="Platform Controls"
                            description="Manage important operational settings for MentorLagbe."
                        >
                            <form onSubmit={handlePlatformSubmit}>
                                <div className="rounded-2xl border border-[#e8ece8] p-5">
                                    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                                <MonitorCog size={23} />
                                            </div>

                                            <div>
                                                <h3 className="font-bold text-gray-800">
                                                    Maintenance Mode
                                                </h3>
                                                <p className="mt-2 max-w-xl text-xs leading-5 text-gray-500">
                                                    Temporarily restrict platform access while maintenance or major updates are being performed.
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            role="switch"
                                            aria-checked={platform.maintenanceMode}
                                            onClick={() =>
                                                setPlatform((previous) => ({
                                                    ...previous,
                                                    maintenanceMode: !previous.maintenanceMode,
                                                }))
                                            }
                                            className={`
                        relative h-7 w-12 shrink-0 rounded-full transition
                        ${platform.maintenanceMode ? "bg-[#075c3d]" : "bg-gray-300"}
                      `}
                                        >
                                            <span
                                                className={`
                          absolute top-1 h-5 w-5 rounded-full bg-white shadow transition
                          ${platform.maintenanceMode ? "left-6" : "left-1"}
                        `}
                                            />
                                        </button>
                                    </div>

                                    <div className="mt-5 border-t border-[#edf0ed] pt-4">
                                        <div className="flex items-center gap-2">
                                            {platform.maintenanceMode ? (
                                                <>
                                                    <AlertTriangle size={16} className="text-amber-600" />
                                                    <span className="text-xs font-semibold text-amber-700">
                                                        Maintenance mode is enabled.
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 size={16} className="text-emerald-600" />
                                                    <span className="text-xs font-semibold text-emerald-700">
                                                        Platform is operating normally.
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 rounded-xl bg-[#f7f9f7] p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle size={19} className="mt-0.5 text-gray-500" />
                                        <p className="text-xs leading-5 text-gray-500">
                                            Maintenance mode will only affect public platform access after the backend enforcement is implemented. Save your selection to update the platform configuration.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-end border-t border-[#edf0ed] pt-6">
                                    <SaveButton loading={settingsSaving}>
                                        Save Platform Controls
                                    </SaveButton>
                                </div>
                            </form>
                        </SettingsCard>
                    )}

                    <footer className="mt-12 border-t border-[#e7ebe7] py-6">
                        <div className="flex flex-col justify-between gap-3 text-center sm:flex-row sm:text-left">
                            <p className="text-xs text-gray-400">
                                © 2026 MentorLagbe. All rights reserved.
                            </p>
                            <p className="text-xs text-gray-400">
                                Administrator Settings
                            </p>
                        </div>
                    </footer>
                </main>
            </div>
        </div>
    );
}

function SettingsCard({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: ReactNode;
}) {
    return (
        <section className="rounded-2xl border border-[#e8ece8] bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-7 border-b border-[#edf0ed] pb-5">
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="mt-2 text-sm text-gray-500">{description}</p>
            </div>

            {children}
        </section>
    );
}

function FormInput({
    label,
    value,
    onChange,
    type = "text",
    placeholder,
    helper,
    readOnly = false,
    required = false,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    placeholder?: string;
    helper?: string;
    readOnly?: boolean;
    required?: boolean;
}) {
    return (
        <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
                {label}
            </label>

            <input
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                readOnly={readOnly}
                required={required}
                className={`
          w-full rounded-xl border px-4 py-3 text-sm outline-none transition
          ${readOnly
                        ? "cursor-not-allowed border-[#e8ece8] bg-[#f6f8f6] text-gray-500"
                        : "border-[#e2e8e2] bg-white focus:border-[#075c3d] focus:ring-2 focus:ring-[#075c3d]/10"
                    }
        `}
            />

            {helper && (
                <p className="mt-2 text-xs text-gray-400">{helper}</p>
            )}
        </div>
    );
}

function PasswordInput({
    label,
    value,
    visible,
    onChange,
    onToggle,
    helper,
}: {
    label: string;
    value: string;
    visible: boolean;
    onChange: (value: string) => void;
    onToggle: () => void;
    helper?: string;
}) {
    return (
        <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
                {label}
            </label>

            <div className="relative">
                <input
                    type={visible ? "text" : "password"}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    autoComplete="new-password"
                    required
                    className="w-full rounded-xl border border-[#e2e8e2] bg-white px-4 py-3 pr-12 text-sm outline-none transition focus:border-[#075c3d] focus:ring-2 focus:ring-[#075c3d]/10"
                />

                <button
                    type="button"
                    onClick={onToggle}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-[#075c3d]"
                    aria-label={visible ? "Hide password" : "Show password"}
                >
                    {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>

            {helper && (
                <p className="mt-2 text-xs text-gray-400">{helper}</p>
            )}
        </div>
    );
}

function SettingToggle({
    title,
    description,
    enabled,
    onChange,
}: {
    title: string;
    description: string;
    enabled: boolean;
    onChange: (value: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between gap-5 rounded-xl border border-[#e8ece8] p-4">
            <div>
                <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                    {description}
                </p>
            </div>

            <button
                type="button"
                role="switch"
                aria-checked={enabled}
                onClick={() => onChange(!enabled)}
                className={`
          relative h-7 w-12 shrink-0 rounded-full transition
          ${enabled ? "bg-[#075c3d]" : "bg-gray-300"}
        `}
            >
                <span
                    className={`
            absolute top-1 h-5 w-5 rounded-full bg-white shadow transition
            ${enabled ? "left-6" : "left-1"}
          `}
                />
            </button>
        </div>
    );
}

function SaveButton({
    children,
    loading,
}: {
    children: ReactNode;
    loading: boolean;
}) {
    return (
        <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#075c3d] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#064b32] disabled:cursor-not-allowed disabled:opacity-60"
        >
            {loading ? (
                <Loader2 size={17} className="animate-spin" />
            ) : (
                <Save size={17} />
            )}
            {loading ? "Saving..." : children}
        </button>
    );
}
