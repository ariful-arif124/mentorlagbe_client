
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  Mail,
  MapPin,
  Monitor,
  Users,
  Wallet,
} from "lucide-react";
import type { Tuition } from "@/types/tuition";

type TuitionDetailsPageProps = {
  params: Promise<{ id: string }>;
};

type TuitionApiResponse = {
  success: boolean;
  data?: Tuition;
  message?: string;
};

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
)
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/api$/i, "");

function TuitionLoading() {
  return (
    <main className="min-h-screen bg-[#FBF8F3] px-6 py-20 dark:bg-[#0B1210]">
      <div className="site-container animate-pulse space-y-8">
        <div className="h-8 w-48 rounded-lg bg-gray-200 dark:bg-gray-800" />
        <div className="h-80 rounded-3xl bg-gray-200 dark:bg-gray-800" />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="h-96 rounded-2xl bg-gray-200 dark:bg-gray-800 lg:col-span-2" />
          <div className="h-96 rounded-2xl bg-gray-200 dark:bg-gray-800" />
        </div>
      </div>
    </main>
  );
}

function TuitionError() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FBF8F3] px-6 dark:bg-[#0B1210]">
      <div className="max-w-md rounded-2xl border border-[#E5E1D8] bg-white p-8 text-center shadow-sm dark:border-[#2A3A32] dark:bg-[#131C19]">
        <h2 className="text-2xl font-bold text-[#14201B] dark:text-white">
          Unable to Load Tuition
        </h2>

        <p className="mt-3 text-[#5B6B64] dark:text-[#A2B1A9]">
          Something went wrong while connecting to the server.
          Please check your connection and try again.
        </p>

        <Link
          href="/tuitions"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0F5132] px-6 py-3 font-semibold text-white transition hover:bg-[#0B3F27]"
        >
          <ArrowLeft size={18} />
          Browse Tuitions
        </Link>
      </div>
    </main>
  );
}

async function getTuition(id: string): Promise<Tuition | null> {
  const url = `${API_URL}/api/tuitions/${encodeURIComponent(id)}`;

  const response = await fetch(url, {
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  let result: TuitionApiResponse;

  try {
    result = await response.json();
  } catch {
    throw new Error("Invalid response from tuition API");
  }

  if (!response.ok) {
    throw new Error(
      result.message || `Request failed with status ${response.status}`
    );
  }

  if (!result.success || !result.data) {
    return null;
  }

  return result.data;
}

export default function TuitionDetailsPage({
  params,
}: TuitionDetailsPageProps) {
  return (
    <Suspense fallback={<TuitionLoading />}>
      <TuitionDetails params={params} />
    </Suspense>
  );
}

async function TuitionDetails({
  params,
}: TuitionDetailsPageProps) {
  const { id } = await params;

  let tuition: Tuition | null;

  try {
    tuition = await getTuition(id);
  } catch (error) {
    console.error("Tuition details error:", error);
    return <TuitionError />;
  }

  if (!tuition) {
    notFound();
  }

  if (
    tuition.approvalStatus !== "approved" ||
    tuition.isActive !== true
  ) {
    notFound();
  }

  const formattedFee = Number(tuition.monthlyFee).toLocaleString("en-BD");

  const tutorInitials = tuition.tutorName
    .split(" ")
    .map((name) => name[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const signInHref = `/sign-in?redirect=${encodeURIComponent(
    `/tuitions/${tuition._id}`
  )}`;

  return (
    <main className="min-h-screen bg-[#FBF8F3] text-[#14201B] dark:bg-[#0B1210] dark:text-[#E6EFEA]">
      <div className="site-container py-8 md:py-12">
        <Link
          href="/tuitions"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0F5132] transition hover:gap-3 dark:text-[#34D399]"
        >
          <ArrowLeft size={18} />
          Back to Browse Tuitions
        </Link>

        <section
          className="relative flex min-h-[300px] flex-col justify-end overflow-hidden rounded-[2rem] bg-cover bg-center p-7 text-white shadow-xl md:min-h-[380px] md:p-12"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(11,18,16,0.92), rgba(11,18,16,0.35)), url("${tuition.bannerImage}")`,
          }}
        >
          <div className="absolute right-6 top-6 flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-[#0F5132]">
            <CheckCircle2 size={16} />
            Verified Listing
          </div>

          <div className="relative z-10 max-w-3xl">
            <span className="mb-4 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur-md">
              {tuition.subject}
            </span>

            <h1 className="mb-4 text-3xl font-extrabold leading-tight md:text-5xl">
              {tuition.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-white/85 md:text-base">
              <span className="flex items-center gap-2">
                <GraduationCap size={19} />
                {tuition.classLevel}
              </span>

              <span className="flex items-center gap-2">
                <Monitor size={18} />
                {tuition.mode}
              </span>

              <span className="flex items-center gap-2">
                <CalendarDays size={18} />
                {tuition.daysPerWeek} Days / Week
              </span>
            </div>
          </div>
        </section>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-8">
            <section className="rounded-2xl border border-[#E5E1D8] bg-white p-6 shadow-sm dark:border-[#2A3A32] dark:bg-[#131C19] md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-[#EAF1EC] p-3 text-[#0F5132] dark:bg-[#1C2B25] dark:text-[#34D399]">
                  <BookOpen size={22} />
                </div>

                <h2 className="text-2xl font-bold">
                  Tuition Overview
                </h2>
              </div>

              <p className="whitespace-pre-line leading-8 text-[#5B6B64] dark:text-[#A2B1A9]">
                {tuition.description}
              </p>
            </section>

            <section className="rounded-2xl border border-[#E5E1D8] bg-white p-6 shadow-sm dark:border-[#2A3A32] dark:bg-[#131C19] md:p-8">
              <h2 className="mb-6 text-2xl font-bold">
                Tuition Information
              </h2>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-[#EAF1EC] p-3 text-[#0F5132] dark:bg-[#1C2B25] dark:text-[#34D399]">
                    <GraduationCap size={22} />
                  </div>

                  <div>
                    <p className="text-sm text-[#5B6B64] dark:text-[#A2B1A9]">
                      Subject & Class
                    </p>

                    <p className="mt-1 font-bold">
                      {tuition.subject}
                    </p>

                    <p className="text-sm text-[#5B6B64] dark:text-[#A2B1A9]">
                      {tuition.classLevel}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-[#EAF1EC] p-3 text-[#0F5132] dark:bg-[#1C2B25] dark:text-[#34D399]">
                    <Monitor size={22} />
                  </div>

                  <div>
                    <p className="text-sm text-[#5B6B64] dark:text-[#A2B1A9]">
                      Learning Mode
                    </p>

                    <p className="mt-1 font-bold">
                      {tuition.mode}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-[#EAF1EC] p-3 text-[#0F5132] dark:bg-[#1C2B25] dark:text-[#34D399]">
                    <CalendarDays size={22} />
                  </div>

                  <div>
                    <p className="text-sm text-[#5B6B64] dark:text-[#A2B1A9]">
                      Weekly Schedule
                    </p>

                    <p className="mt-1 font-bold">
                      {tuition.daysPerWeek} Days / Week
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-[#EAF1EC] p-3 text-[#0F5132] dark:bg-[#1C2B25] dark:text-[#34D399]">
                    <MapPin size={22} />
                  </div>

                  <div>
                    <p className="text-sm text-[#5B6B64] dark:text-[#A2B1A9]">
                      Location
                    </p>

                    <p className="mt-1 font-bold">
                      {tuition.location || tuition.mode}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-[#E5E1D8] bg-white p-6 shadow-sm dark:border-[#2A3A32] dark:bg-[#131C19] md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-[#EAF1EC] p-3 text-[#0F5132] dark:bg-[#1C2B25] dark:text-[#34D399]">
                  <Users size={22} />
                </div>

                <h2 className="text-2xl font-bold">
                  About the Tutor
                </h2>
              </div>

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#EAF1EC] text-2xl font-bold text-[#0F5132] dark:bg-[#1C2B25] dark:text-[#34D399]">
                  {tutorInitials}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-bold">
                      {tuition.tutorName}
                    </h3>

                    <BadgeCheck
                      size={20}
                      className="text-[#0F5132] dark:text-[#34D399]"
                    />
                  </div>

                  <p className="mt-2 flex items-center gap-2 break-all text-sm text-[#5B6B64] dark:text-[#A2B1A9]">
                    <Mail size={17} />
                    {tuition.tutorEmail}
                  </p>

                  <p className="mt-2 text-sm text-[#5B6B64] dark:text-[#A2B1A9]">
                    Tuition Instructor
                  </p>
                </div>
              </div>
            </section>
          </div>

          <aside className="h-fit lg:sticky lg:top-28">
            <div className="rounded-2xl border border-[#E5E1D8] bg-white p-6 shadow-lg dark:border-[#2A3A32] dark:bg-[#131C19] md:p-8">
              <p className="text-sm font-semibold text-[#5B6B64] dark:text-[#A2B1A9]">
                Monthly Tuition Fee
              </p>

              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-[#0F5132] dark:text-[#34D399]">
                  ৳{formattedFee}
                </span>

                <span className="text-sm text-[#5B6B64] dark:text-[#A2B1A9]">
                  / month
                </span>
              </div>

              <div className="my-7 border-t border-[#E5E1D8] dark:border-[#2A3A32]" />

              <h3 className="mb-5 text-lg font-bold">
                Tuition Summary
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-[#5B6B64] dark:text-[#A2B1A9]">
                    Subject
                  </span>

                  <span className="font-semibold">
                    {tuition.subject}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-[#5B6B64] dark:text-[#A2B1A9]">
                    Class
                  </span>

                  <span className="font-semibold">
                    {tuition.classLevel}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-[#5B6B64] dark:text-[#A2B1A9]">
                    Mode
                  </span>

                  <span className="font-semibold">
                    {tuition.mode}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-[#5B6B64] dark:text-[#A2B1A9]">
                    Schedule
                  </span>

                  <span className="font-semibold">
                    {tuition.daysPerWeek} Days / Week
                  </span>
                </div>
              </div>

              <div className="my-7 border-t border-[#E5E1D8] dark:border-[#2A3A32]" />

              <div className="mb-6 flex items-center gap-3 rounded-xl bg-[#EAF1EC] p-4 dark:bg-[#1C2B25]">
                <Wallet
                  size={22}
                  className="shrink-0 text-[#0F5132] dark:text-[#34D399]"
                />

                <div>
                  <p className="text-sm font-bold">
                    No Hidden Charges
                  </p>

                  <p className="text-xs text-[#5B6B64] dark:text-[#A2B1A9]">
                    Transparent monthly tuition fee.
                  </p>
                </div>
              </div>

              <Link
                href={signInHref}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F5132] px-6 py-4 font-bold text-white shadow-md transition hover:bg-[#0B3F27] dark:bg-[#34D399] dark:text-[#0B1210] dark:hover:bg-[#6EE7B7]"
              >
                Apply for Tuition
                <ArrowRight size={19} />
              </Link>

              <p className="mt-4 text-center text-xs leading-6 text-[#5B6B64] dark:text-[#A2B1A9]">
                Sign in to continue. Tuition applications are
                available for student accounts only.
              </p>
            </div>

            <div className="mt-5 rounded-2xl border border-[#E5E1D8] bg-white p-5 dark:border-[#2A3A32] dark:bg-[#131C19]">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  size={21}
                  className="mt-0.5 shrink-0 text-[#0F5132] dark:text-[#34D399]"
                />

                <div>
                  <h3 className="font-bold">
                    Trusted Learning Opportunity
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-[#5B6B64] dark:text-[#A2B1A9]">
                    Explore tuition opportunities and connect
                    with qualified instructors through MentorLagbe.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/tuitions"
            className="inline-flex items-center gap-2 rounded-xl border border-[#0F5132]/20 bg-white px-6 py-3 font-semibold text-[#0F5132] transition hover:bg-[#EAF1EC] dark:border-[#34D399]/30 dark:bg-[#131C19] dark:text-[#34D399] dark:hover:bg-[#1C2B25]"
          >
            <ArrowLeft size={18} />
            Explore More Tuitions
          </Link>
        </div>
      </div>
    </main>
  );
}
