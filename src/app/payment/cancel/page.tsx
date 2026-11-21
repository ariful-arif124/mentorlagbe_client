
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  XCircle,
  ArrowRight,
  CreditCard,
  LayoutDashboard,
} from "lucide-react";

function getDashboardPath(role?: string) {
  switch (role?.toLowerCase()) {
    case "admin":
      return "/dashboard/admin";
    case "tutor":
      return "/tutor/dashboard";
    case "student":
      return "/student/dashboard";
    default:
      return "/";
  }
}

export default function PaymentCancelPage() {
  const [dashboardHref, setDashboardHref] = useState("/");

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user") ||
      localStorage.getItem("mentorlagbe_user");

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);

        setDashboardHref(
          getDashboardPath(user.role)
        );
      } catch {
        setDashboardHref("/");
      }
    }
  }, []);

  return (
    <main className="flex min-h-[75vh] items-center justify-center bg-[#f5f7f4] px-4 py-16">
      <div className="w-full max-w-lg rounded-3xl border border-[#e5ebe5] bg-white p-8 text-center shadow-xl shadow-gray-200/40 sm:p-12">

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <XCircle size={44} />
        </div>

        <p className="mt-7 text-xs font-bold uppercase tracking-[2px] text-amber-600">
          Payment Cancelled
        </p>

        <h1 className="mt-3 text-3xl font-extrabold text-[#17231D]">
          No Worries!
        </h1>

        <p className="mt-4 text-sm leading-7 text-gray-500">
          Your Stripe checkout was cancelled. No Pro membership
          has been activated from this checkout. You can return
          to pricing and try again whenever you are ready.
        </p>

        <div className="mt-8 rounded-2xl border border-[#e5ebe5] bg-[#fafcf9] p-5 text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf4ed] text-[#075c3d]">
              <CreditCard size={20} />
            </div>

            <div>
              <p className="text-sm font-bold text-[#17231D]">
                Payment not completed
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Your account remains available on its current plan.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/#pricing"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#075c3d] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#064b32]"
          >
            Try Again
            <ArrowRight size={18} />
          </Link>

          <Link
            href={dashboardHref}
            className="flex items-center justify-center gap-2 rounded-xl border border-[#dfe7df] px-5 py-4 text-sm font-bold text-[#075c3d] transition hover:bg-[#f5f7f4]"
          >
            <LayoutDashboard size={17} />
            Go to Dashboard
          </Link>
        </div>

      </div>
    </main>
  );
}
