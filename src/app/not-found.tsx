
import Link from "next/link";
import { ArrowLeft, Home, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f8f5] px-5 py-12">
      <div className="w-full max-w-xl rounded-3xl border border-[#e5ebe5] bg-white p-8 text-center shadow-sm md:p-12">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-[#eaf4ed] text-[#075c3d]">
          <SearchX size={38} />
        </div>

        <p className="mt-7 text-sm font-extrabold uppercase tracking-[3px] text-[#075c3d]">
          Error 404
        </p>

        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#17251d] md:text-4xl">
          Page Not Found
        </h1>

        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-gray-500">
          Sorry, the page you are looking for does not exist,
          has been moved, or is temporarily unavailable.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#075c3d] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#064b32]"
          >
            <Home size={17} />
            Back to Home
          </Link>

          <Link
            href="/tuitions"
            className="flex items-center justify-center gap-2 rounded-xl border border-[#dfe7df] px-6 py-3.5 text-sm font-bold text-[#075c3d] transition hover:bg-[#f4f8f4]"
          >
            <ArrowLeft size={17} />
            Browse Tuitions
          </Link>
        </div>

        <p className="mt-9 text-xs text-gray-400">
          © 2026 MentorLagbe
        </p>
      </div>
    </main>
  );
}
