
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  GraduationCap,
  ArrowUpRight,
  Menu,
  X,
} from "lucide-react";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Browse Tuitions", href: "/tuitions" },
  { name: "Pricing", href: "/pricing" },
  { name: "How It Works", href: "/#how-it-works" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/tuitions") return pathname.startsWith("/tuitions");
    if (href === "/pricing") return pathname.startsWith("/pricing");
    return false;
  };

  const linkClass = (href: string) =>
    `text-sm font-semibold transition-colors duration-200 ${
      isActive(href)
        ? "text-[#0F5132] dark:text-emerald-400"
        : "text-[#64746C] hover:text-[#0F5132] dark:text-gray-300 dark:hover:text-emerald-400"
    }`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E9E4DB] bg-[#FBF8F3]/95 backdrop-blur-md dark:border-[#26352E] dark:bg-[#0B1210]/95">
      <div className="mx-auto flex h-[78px] max-w-7xl items-center justify-between px-5 sm:px-8">

        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F5132] text-white shadow-sm">
            <GraduationCap size={29} strokeWidth={2.2} />
          </div>

          <span className="text-[23px] font-extrabold tracking-tight text-[#17231D] dark:text-white">
            Mentor<span className="text-[#0F5132] dark:text-emerald-400">Lagbe</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-9 lg:flex">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={linkClass(item.href)}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-7 lg:flex">
          <Link
            href="/sign-in"
            className="text-sm font-semibold text-[#17231D] transition hover:text-[#0F5132] dark:text-white dark:hover:text-emerald-400"
          >
            Sign In
          </Link>

          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#0F5132] px-7 py-4 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0B4028] hover:shadow-md"
          >
            Get Started
            <ArrowUpRight size={18} />
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#E5E1D8] text-[#0F5132] transition hover:bg-[#EAF1EC] lg:hidden dark:border-[#35463D] dark:text-emerald-400 dark:hover:bg-[#1C2B25]"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
        >
          {mobileMenuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="border-t border-[#E9E4DB] bg-[#FBF8F3] px-5 pb-6 pt-4 shadow-lg lg:hidden dark:border-[#26352E] dark:bg-[#0B1210]"
        >
          <nav className="flex flex-col gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  isActive(item.href)
                    ? "bg-[#EAF1EC] text-[#0F5132] dark:bg-[#1C2B25] dark:text-emerald-400"
                    : "text-[#64746C] hover:bg-[#EAF1EC] hover:text-[#0F5132] dark:text-gray-300 dark:hover:bg-[#1C2B25]"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="mt-5 flex flex-col gap-3 border-t border-[#E9E4DB] pt-5 dark:border-[#26352E]">
            <Link
              href="/sign-in"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl border border-[#DADFD9] px-5 py-3 text-center text-sm font-semibold text-[#17231D] transition hover:bg-[#EAF1EC] dark:border-[#35463D] dark:text-white"
            >
              Sign In
            </Link>

            <Link
              href="/sign-up"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#0F5132] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#0B4028]"
            >
              Get Started
              <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
