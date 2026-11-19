
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
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

import ApplyTuitionButton from "@/components/tuitions/apply-tuition-button";

const configuredApiUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const API_BASE_URL = configuredApiUrl
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/api$/i, "");

const API_URL = `${API_BASE_URL}/api`;

interface Tuition {
  _id: string;
  title: string;
  subject: string;
  classLevel: string;
  mode: string;
  location?: string;
  monthlyFee: number;
  daysPerWeek: number;
  bannerImage?: string;
  description: string;
  tutorName?: string;
  tutorEmail?: string;
  approvalStatus: string;
  isActive: boolean;
  createdAt?: string;
}

interface TuitionApiResponse {
  success: boolean;
  message?: string;
  data?: Tuition;
}

interface TuitionDetailsPageProps {
  params: Promise<{ id: string }>;
}

// ============================================
// LOADING COMPONENT
// ============================================

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

// ============================================
// FETCH TUITION FROM BACKEND
// ============================================

async function getTuitionById(id: string): Promise<Tuition | null> {
  try {
    const response = await fetch(
      `${API_URL}/tuitions/${encodeURIComponent(id)}`,
      {
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(
        `Failed to fetch tuition. Status: ${response.status}`
      );
    }

    const result: TuitionApiResponse = await response.json();

    if (!result.success || !result.data) {
      throw new Error(
        result.message || "Unable to retrieve tuition details"
      );
    }

    const tuition = result.data;

    // Only approved and active tuition posts are publicly visible.
    if (
      tuition.approvalStatus !== "approved" ||
      tuition.isActive !== true
    ) {
      return null;
    }

    return tuition;

  } catch (error) {
    console.error("Tuition details fetch error:", error);
    throw error;
  }
}

// ============================================
// MAIN PAGE
// ============================================

export default function TuitionDetailsPage({
  params,
}: TuitionDetailsPageProps) {
  return (
    <Suspense fallback={<TuitionLoading />}>
      <TuitionDetails params={params} />
    </Suspense>
  );
}

// ============================================
// TUITION DETAILS
// ============================================

async function TuitionDetails({
  params,
}: TuitionDetailsPageProps) {

  const { id } = await params;

  const tuition = await getTuitionById(id);

  if (!tuition) {
    notFound();
  }

  const formattedFee = Number(tuition.monthlyFee).toLocaleString("en-BD");

  const tutorName = tuition.tutorName || "MentorLagbe Tutor";

  const tutorInitials = tutorName
    .split(" ")
    .filter(Boolean)
    .map((name) => name[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <main className="min-h-screen bg-[#FBF8F3] text-[#14201B] dark:bg-[#0B1210] dark:text-[#E6EFEA]">

      <div className="site-container py-8 md:py-12">

        {/* BACK BUTTON */}

        <Link
          href="/tuitions"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0F5132] transition hover:gap-3 dark:text-[#34D399]"
        >
          <ArrowLeft size={18} />
          Back to Browse Tuitions
        </Link>

        {/* ================================= */}
        {/* HERO SECTION */}
        {/* ================================= */}

        <section
          className="relative flex min-h-[300px] flex-col justify-end overflow-hidden rounded-[2rem] bg-cover bg-center p-7 text-white shadow-xl md:min-h-[380px] md:p-12"
          style={{
            backgroundImage: tuition.bannerImage
              ? `linear-gradient(90deg, rgba(11,18,16,0.92), rgba(11,18,16,0.35)), url("${tuition.bannerImage}")`
              : "linear-gradient(120deg, #0B3F27, #075c3b)",
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

        {/* ================================= */}
        {/* MAIN CONTENT */}
        {/* ================================= */}

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">

          {/* LEFT CONTENT */}

          <div className="space-y-8">

            {/* TUITION OVERVIEW */}

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

            {/* TUITION INFORMATION */}

            <section className="rounded-2xl border border-[#E5E1D8] bg-white p-6 shadow-sm dark:border-[#2A3A32] dark:bg-[#131C19] md:p-8">

              <h2 className="mb-6 text-2xl font-bold">
                Tuition Information
              </h2>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

                {/* SUBJECT */}

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

                {/* MODE */}

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

                {/* SCHEDULE */}

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

                {/* LOCATION */}

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

            {/* ABOUT THE TUTOR */}

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
                  {tutorInitials || "T"}
                </div>

                <div className="min-w-0">

                  <div className="flex flex-wrap items-center gap-2">

                    <h3 className="text-xl font-bold">
                      {tutorName}
                    </h3>

                    <BadgeCheck
                      size={20}
                      className="text-[#0F5132] dark:text-[#34D399]"
                    />

                  </div>

                  {tuition.tutorEmail && (
                    <p className="mt-2 flex items-center gap-2 break-all text-sm text-[#5B6B64] dark:text-[#A2B1A9]">

                      <Mail size={17} />

                      {tuition.tutorEmail}

                    </p>
                  )}

                  <p className="mt-2 text-sm text-[#5B6B64] dark:text-[#A2B1A9]">
                    Tuition Instructor
                  </p>

                </div>

              </div>

            </section>

          </div>

          {/* ================================= */}
          {/* RIGHT SIDEBAR */}
          {/* ================================= */}

          <aside className="h-fit lg:sticky lg:top-28">

            <div className="rounded-2xl border border-[#E5E1D8] bg-white p-6 shadow-lg dark:border-[#2A3A32] dark:bg-[#131C19] md:p-8">

              {/* MONTHLY FEE */}

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

              {/* SUMMARY */}

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

              {/* PAYMENT NOTICE */}

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

              {/* APPLY FOR TUITION */}

              <ApplyTuitionButton tuitionId={tuition._id} />

              <p className="mt-4 text-center text-xs leading-6 text-[#5B6B64] dark:text-[#A2B1A9]">
                Tuition applications are available for student accounts only.
              </p>

            </div>

            {/* TRUST CARD */}

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

        {/* ================================= */}
        {/* BOTTOM NAVIGATION */}
        {/* ================================= */}

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
