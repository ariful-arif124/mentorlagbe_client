
"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, GraduationCap, Menu, X } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Browse Tuitions", href: "/tuitions" },
  { label: "Pricing", href: "/pricing" },
  { label: "How It Works", href: "/#how-it-works" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="site-container flex h-20 items-center justify-between gap-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5"
          onClick={() => setIsOpen(false)}
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <GraduationCap size={25} strokeWidth={2.2} />
          </span>

          <span className="font-heading text-xl font-extrabold tracking-tight text-foreground">
            Mentor<span className="text-primary">Lagbe</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/sign-in"
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            Sign In
          </Link>

          <Link
            href="/sign-up"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Get Started
            <ArrowUpRight size={16} />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex size-10 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-secondary md:hidden"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border bg-background md:hidden"
          >
            <nav className="site-container flex flex-col gap-1 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}

              <div className="mt-2 flex gap-3 border-t border-border pt-4">
                <Link
                  href="/sign-in"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 rounded-xl border border-border px-4 py-3 text-center text-sm font-semibold"
                >
                  Sign In
                </Link>

                <Link
                  href="/sign-up"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground"
                >
                  Get Started
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
