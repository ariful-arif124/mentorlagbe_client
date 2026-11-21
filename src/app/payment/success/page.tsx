
"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Clock3,
  XCircle,
  LoaderCircle,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

const BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const API_URL = BASE_URL.endsWith("/api")
  ? BASE_URL
  : `${BASE_URL}/api`;

type PaymentStatus =
  | "checking"
  | "paid"
  | "pending"
  | "failed"
  | "error";

interface PaymentData {
  paymentId: string;
  role: string;
  plan: string;
  amount: number;
  currency: string;
  status: string;
  paidAt?: string | null;
}

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

function PaymentSuccessContent() {
  const searchParams = useSearchParams();

  const sessionId = searchParams.get("session_id");

  const [status, setStatus] =
    useState<PaymentStatus>("checking");

  const [payment, setPayment] =
    useState<PaymentData | null>(null);

  const [message, setMessage] = useState(
    "Verifying your payment with Stripe..."
  );

  const [dashboardHref, setDashboardHref] =
    useState("/");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      setMessage("No Stripe checkout session was provided.");
      return;
    }

    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("mentorlagbe_token");

    if (!token) {
      setStatus("error");
      setMessage(
        "Please sign in to verify your payment."
      );
      return;
    }

    const storedUser =
      localStorage.getItem("user") ||
      localStorage.getItem("mentorlagbe_user");

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setDashboardHref(getDashboardPath(user.role));
      } catch {
        setDashboardHref("/");
      }
    }

    let active = true;
    let attempts = 0;

    let timeout: ReturnType<typeof setTimeout> | undefined;

    const verifyPayment = async () => {
      try {
        const response = await fetch(
          `${API_URL}/payments/session/${encodeURIComponent(sessionId)}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Payment verification failed."
          );
        }

        if (!active) return;

        const paymentData: PaymentData = result.data;

        setPayment(paymentData);
        setDashboardHref(
          getDashboardPath(paymentData.role)
        );

        if (paymentData.status === "paid") {
          setStatus("paid");
          setMessage(
            "Your payment has been successfully verified."
          );

          const rawUser =
            localStorage.getItem("user") ||
            localStorage.getItem("mentorlagbe_user");

          if (rawUser) {
            try {
              const user = JSON.parse(rawUser);

              const updatedUser = {
                ...user,
                plan: "pro",
              };

              localStorage.setItem(
                "user",
                JSON.stringify(updatedUser)
              );

              localStorage.setItem(
                "mentorlagbe_user",
                JSON.stringify(updatedUser)
              );

              window.dispatchEvent(
                new Event("mentorlagbe-auth-change")
              );
            } catch {
              console.error(
                "Unable to update local user information."
              );
            }
          }

          return;
        }

        if (
          paymentData.status === "failed" ||
          paymentData.status === "expired"
        ) {
          setStatus("failed");
          setMessage(
            "Your payment was not completed. You can try again."
          );
          return;
        }

        attempts += 1;

        if (attempts < 12) {
          setStatus("checking");
          setMessage(
            "Your payment is being processed. Please wait while we confirm it."
          );

          timeout = setTimeout(verifyPayment, 2000);
        } else {
          setStatus("pending");
          setMessage(
            "Your payment is still awaiting confirmation. Please check again shortly."
          );
        }
      } catch (error) {
        if (!active) return;

        console.error("Payment verification error:", error);

        setStatus("error");

        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to verify your payment."
        );
      }
    };

    verifyPayment();

    return () => {
      active = false;

      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [sessionId]);

  return (
    <main className="flex min-h-[75vh] items-center justify-center bg-[#f5f7f4] px-4 py-16">
      <div className="w-full max-w-lg rounded-3xl border border-[#e5ebe5] bg-white p-8 text-center shadow-xl shadow-gray-200/40 sm:p-12">

        {status === "checking" && (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <LoaderCircle
                size={42}
                className="animate-spin"
              />
            </div>

            <h1 className="mt-7 text-3xl font-extrabold text-[#17231D]">
              Verifying Payment
            </h1>

            <p className="mt-4 text-sm leading-7 text-gray-500">
              {message}
            </p>
          </>
        )}

        {status === "paid" && (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={45} />
            </div>

            <p className="mt-7 text-xs font-bold uppercase tracking-[2px] text-emerald-600">
              Payment Successful
            </p>

            <h1 className="mt-3 text-3xl font-extrabold text-[#17231D]">
              Welcome to Pro!
            </h1>

            <p className="mt-4 text-sm leading-7 text-gray-500">
              {message} Your MentorLagbe Pro membership is now active.
            </p>

            {payment && (
              <div className="mt-8 rounded-2xl border border-[#e5ebe5] bg-[#fafcf9] p-5 text-left">
                <div className="flex justify-between gap-4 py-2">
                  <span className="text-sm text-gray-500">
                    Membership
                  </span>

                  <span className="text-sm font-bold text-[#17231D]">
                    {payment.role} Pro
                  </span>
                </div>

                <div className="flex justify-between gap-4 py-2">
                  <span className="text-sm text-gray-500">
                    Amount paid
                  </span>

                  <span className="text-sm font-bold text-[#075c3d]">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: payment.currency.toUpperCase(),
                    }).format(payment.amount / 100)}
                  </span>
                </div>

                <div className="flex justify-between gap-4 py-2">
                  <span className="text-sm text-gray-500">
                    Payment status
                  </span>

                  <span className="text-sm font-bold text-emerald-600">
                    Paid
                  </span>
                </div>
              </div>
            )}

            <Link
              href={dashboardHref}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#075c3d] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#064b32]"
            >
              Go to Dashboard
              <ArrowRight size={18} />
            </Link>
          </>
        )}

        {status === "pending" && (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <Clock3 size={42} />
            </div>

            <h1 className="mt-7 text-3xl font-extrabold text-[#17231D]">
              Payment Processing
            </h1>

            <p className="mt-4 text-sm leading-7 text-gray-500">
              {message}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#075c3d] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#064b32]"
            >
              <RefreshCw size={17} />
              Check Again
            </button>
          </>
        )}

        {(status === "failed" || status === "error") && (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-600">
              <XCircle size={43} />
            </div>

            <h1 className="mt-7 text-3xl font-extrabold text-[#17231D]">
              {status === "failed"
                ? "Payment Not Completed"
                : "Verification Issue"}
            </h1>

            <p className="mt-4 text-sm leading-7 text-gray-500">
              {message}
            </p>

            <div className="mt-8 flex flex-col gap-3">
              <Link
                href="/#pricing"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#075c3d] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#064b32]"
              >
                Return to Pricing
                <ArrowRight size={18} />
              </Link>

              <Link
                href={dashboardHref}
                className="rounded-xl border border-[#dfe7df] px-5 py-4 text-sm font-bold text-[#075c3d] transition hover:bg-[#f5f7f4]"
              >
                Go to Dashboard
              </Link>
            </div>
          </>
        )}

      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[75vh] items-center justify-center">
          <LoaderCircle
            size={36}
            className="animate-spin text-[#075c3d]"
          />
        </main>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
