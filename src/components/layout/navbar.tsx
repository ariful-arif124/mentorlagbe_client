
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  GraduationCap,
  ArrowUpRight,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  UserRound,
  LogOut,
  ShieldCheck,
} from "lucide-react";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Browse Tuitions", href: "/tuitions" },
  { name: "Pricing", href: "/#pricing" },
  { name: "How It Works", href: "/#how-it-works" },
];

type User = {
  name?: string;
  email?: string;
  role?: string;
  profileImage?: string;
  profileImageUrl?: string;
  avatar?: string;
  image?: string;
  photoURL?: string;
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [activeHash, setActiveHash] = useState("");

  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncAuth = () => {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("mentorlagbe_token");

      const storedUser =
        localStorage.getItem("user") ||
        localStorage.getItem("mentorlagbe_user");

      if (!token || !storedUser) {
        setUser(null);
        return;
      }

      try {
        const parsedUser = JSON.parse(storedUser) as User;

        if (!parsedUser.role) {
          setUser(null);
          return;
        }

        setUser(parsedUser);
      } catch {
        setUser(null);
      }
    };

    syncAuth();

    window.addEventListener("storage", syncAuth);
    window.addEventListener("mentorlagbe-auth-change", syncAuth);

    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("mentorlagbe-auth-change", syncAuth);
    };
  }, [pathname]);

  useEffect(() => {
    const syncHash = () => {
      setActiveHash(window.location.hash);
    };

    syncHash();

    window.addEventListener("hashchange", syncHash);

    return () => {
      window.removeEventListener("hashchange", syncHash);
    };
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setAccountMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAccountMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" && activeHash === "";
    }

    if (href === "/tuitions") {
      return pathname.startsWith("/tuitions");
    }

    if (href.startsWith("/#")) {
      return pathname === "/" && activeHash === href.slice(1);
    }

    return false;
  };

  const role = user?.role?.toLowerCase();

  const dashboardHref =
    role === "admin"
      ? "/dashboard/admin"
      : role === "tutor"
        ? "/dashboard/tutor"
        : role === "student"
          ? "/student/dashboard"
          : "/";

  const displayName =
    user?.name?.trim() ||
    user?.email?.split("@")[0] ||
    "User";

  const displayEmail = user?.email || "Account";

  const roleLabel = role ? role.toUpperCase() : "MEMBER";

  const avatarUrl =
    user?.profileImage ||
    user?.profileImageUrl ||
    user?.avatar ||
    user?.image ||
    user?.photoURL;

  const initials = displayName
    .split(/\s+/)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const roleBadgeClass =
    role === "admin"
      ? "bg-amber-50 text-amber-800 ring-amber-200"
      : role === "tutor"
        ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
        : "bg-blue-50 text-blue-800 ring-blue-200";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("mentorlagbe_token");
    localStorage.removeItem("mentorlagbe_user");

    setUser(null);
    setAccountMenuOpen(false);
    setMobileMenuOpen(false);

    router.replace("/");
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E9E4DB]/80 bg-[#FBF8F3]/90 shadow-[0_4px_24px_rgba(20,50,35,0.035)] backdrop-blur-2xl transition-colors dark:border-[#26352E] dark:bg-[#0B1210]/95">
      <div className="mx-auto flex h-[82px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          onClick={closeMobileMenu}
          className="group flex shrink-0 items-center gap-3"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-gradient-to-br from-[#12623E] to-[#083E28] text-white shadow-[0_4px_12px_rgba(15,81,50,0.20)] ring-1 ring-[#0F5132]/10 transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-lg">
            <GraduationCap size={27} strokeWidth={2.1} />
          </div>

          <span className="text-[22px] font-extrabold tracking-[-1.1px] text-[#17231D] dark:text-white sm:text-[24px]">
            Mentor<span className="text-[#0F5132] dark:text-emerald-400">Lagbe</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-[#EAE6DE]/80 bg-white/50 p-1.5 lg:flex dark:border-[#26352E] dark:bg-[#151F1A]">
          {navigation.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative rounded-full px-4 py-2.5 text-[13px] font-semibold transition-all duration-300 ${
                  active
                    ? "bg-[#EAF1EC] text-[#0F5132] shadow-sm dark:bg-[#21372B] dark:text-emerald-400"
                    : "text-[#64746C] hover:bg-[#F1F3EF] hover:text-[#0F5132] dark:text-gray-300 dark:hover:bg-[#21372B] dark:hover:text-emerald-400"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          {!user ? (
            <>
              <Link
                href="/sign-in"
                className="text-sm font-semibold text-[#26372D] transition-colors duration-200 hover:text-[#0F5132] dark:text-white dark:hover:text-emerald-400"
              >
                Sign In
              </Link>

              <Link
                href="/sign-up"
                className="group inline-flex items-center gap-2 rounded-[15px] bg-[#0F5132] px-6 py-3.5 text-sm font-bold text-white shadow-[0_4px_12px_rgba(15,81,50,0.14)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0B4028] hover:shadow-lg"
              >
                Get Started
                <ArrowUpRight
                  size={17}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </>
          ) : (
            <div className="relative" ref={accountMenuRef}>
              <button
                type="button"
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                aria-expanded={accountMenuOpen}
                aria-haspopup="menu"
                className="group flex items-center gap-2.5 rounded-2xl border border-[#E7E7DE] bg-white/80 py-2 pl-2 pr-3 shadow-[0_2px_10px_rgba(20,50,35,0.04)] transition-all duration-300 hover:border-[#B9D0C0] hover:shadow-md dark:border-[#35463D] dark:bg-[#17231D]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EAF1EC] text-sm font-bold text-[#0F5132] ring-2 ring-[#0F5132]/10 dark:bg-[#263D30] dark:text-emerald-300">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>

                <div className="hidden min-w-0 text-left xl:block">
                  <p className="max-w-[145px] truncate text-[13px] font-bold text-[#1B2B21] dark:text-white">
                    {displayName}
                  </p>

                  <p className="max-w-[145px] truncate text-[11px] text-[#819087]">
                    {displayEmail}
                  </p>
                </div>

                <span
                  className={`hidden rounded-full px-2 py-1 text-[9px] font-extrabold tracking-wide ring-1 xl:inline-flex ${roleBadgeClass}`}
                >
                  {roleLabel}
                </span>

                <ChevronDown
                  size={16}
                  className={`text-[#849087] transition-transform duration-300 ${
                    accountMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {accountMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-3 w-[290px] origin-top-right overflow-hidden rounded-[20px] border border-[#E8E8DF] bg-white p-2 shadow-[0_16px_50px_rgba(20,50,35,0.13)] animate-in fade-in slide-in-from-top-2 duration-200 dark:border-[#35463D] dark:bg-[#142019]"
                >
                  <div className="flex items-center gap-3 rounded-2xl bg-[#F5F8F4] p-4 dark:bg-[#1D2D23]">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#DCEBE0] text-base font-bold text-[#0F5132] dark:bg-[#294634] dark:text-emerald-300">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={displayName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        initials
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-[#1B2B21] dark:text-white">
                        {displayName}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-[#819087]">
                        {displayEmail}
                      </p>

                      <span
                        className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[9px] font-extrabold tracking-wider ring-1 ${roleBadgeClass}`}
                      >
                        {roleLabel} ACCOUNT
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 p-2">
                    <Link
                      href={dashboardHref}
                      onClick={() => setAccountMenuOpen(false)}
                      role="menuitem"
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#34453A] transition hover:bg-[#EEF4EF] hover:text-[#0F5132] dark:text-gray-200 dark:hover:bg-[#26382D] dark:hover:text-emerald-400"
                    >
                      <LayoutDashboard size={18} />
                      My Dashboard
                    </Link>

                    <Link
                      href="/dashboard/profile"
                      onClick={() => setAccountMenuOpen(false)}
                      role="menuitem"
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#34453A] transition hover:bg-[#EEF4EF] hover:text-[#0F5132] dark:text-gray-200 dark:hover:bg-[#26382D] dark:hover:text-emerald-400"
                    >
                      <UserRound size={18} />
                      Update Profile
                    </Link>
                  </div>

                  <div className="mx-2 border-t border-[#EEEFEA] dark:border-[#35463D]" />

                  <div className="p-2">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      <LogOut size={18} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#E6E5DC] bg-white/70 text-[#0F5132] shadow-sm transition hover:bg-[#EAF1EC] lg:hidden dark:border-[#35463D] dark:bg-[#17231D] dark:text-emerald-400"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="border-t border-[#E9E4DB] bg-[#FBF8F3] px-5 pb-6 pt-4 shadow-xl lg:hidden dark:border-[#26352E] dark:bg-[#0B1210]"
        >
          <nav className="flex flex-col gap-1">
            {navigation.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={`rounded-xl px-4 py-3.5 text-sm font-semibold transition ${
                    active
                      ? "bg-[#EAF1EC] text-[#0F5132] dark:bg-[#21372B] dark:text-emerald-400"
                      : "text-[#64746C] hover:bg-[#EAF1EC] hover:text-[#0F5132] dark:text-gray-300 dark:hover:bg-[#21372B]"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="mt-5 border-t border-[#E9E4DB] pt-5 dark:border-[#26352E]">
            {!user ? (
              <div className="flex flex-col gap-3">
                <Link
                  href="/sign-in"
                  onClick={closeMobileMenu}
                  className="rounded-xl border border-[#DADFD9] bg-white px-5 py-3.5 text-center text-sm font-semibold text-[#17231D] transition hover:bg-[#EAF1EC] dark:border-[#35463D] dark:bg-[#17231D] dark:text-white"
                >
                  Sign In
                </Link>

                <Link
                  href="/sign-up"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#0F5132] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#0B4028]"
                >
                  Get Started
                  <ArrowUpRight size={18} />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-2xl border border-[#E7E7DE] bg-white p-4 dark:border-[#35463D] dark:bg-[#17231D]">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EAF1EC] font-bold text-[#0F5132] dark:bg-[#263D30] dark:text-emerald-300">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[#17231D] dark:text-white">
                      {displayName}
                    </p>

                    <p className="truncate text-xs text-[#819087]">
                      {displayEmail}
                    </p>

                    <span
                      className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[9px] font-extrabold tracking-wider ring-1 ${roleBadgeClass}`}
                    >
                      {roleLabel} ACCOUNT
                    </span>
                  </div>
                </div>

                <Link
                  href={dashboardHref}
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 rounded-xl bg-[#EAF1EC] px-4 py-3.5 text-sm font-bold text-[#0F5132] transition hover:bg-[#DCEBE0] dark:bg-[#21372B] dark:text-emerald-400"
                >
                  <LayoutDashboard size={18} />
                  My Dashboard
                  <ArrowUpRight size={16} className="ml-auto" />
                </Link>

                <Link
                  href="/dashboard/profile"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#34453A] transition hover:bg-[#EAF1EC] dark:text-gray-200 dark:hover:bg-[#21372B]"
                >
                  <UserRound size={18} />
                  Update Profile
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
