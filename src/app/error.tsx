
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    toast.error("Something went wrong", {
      description: "An unexpected error occurred. Please try again.",
    });
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f8f5] px-5 py-12">
      <div className="w-full max-w-xl rounded-3xl border border-[#e5ebe5] bg-white p-8 text-center shadow-sm md:p-12">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <AlertTriangle size={38} />
        </div>

        <p className="mt-7 text-sm font-extrabold uppercase tracking-[3px] text-red-600">
          Application Error
        </p>

        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#17251d]">
          Something Went Wrong
        </h1>

        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-gray-500">
          We encountered an unexpected problem while loading
          this page. Please try again or return to the homepage.
        </p>

        {error.digest && (
          <p className="mt-4 text-xs text-gray-400">
            Error reference: {error.digest}
          </p>
        )}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#075c3d] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#064b32]"
          >
            <RefreshCw size={17} />
            Try Again
          </button>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-xl border border-[#dfe7df] px-6 py-3.5 text-sm font-bold text-[#075c3d] transition hover:bg-[#f4f8f4]"
          >
            <Home size={17} />
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
