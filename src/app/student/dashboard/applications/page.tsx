
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  GraduationCap,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  Wallet,
  Phone,
  Mail,
  Eye,
  X,
  AlertTriangle,
  Ban,
  ClipboardList,
  UserRound,
} from "lucide-react";

// ==========================================
// CONFIGURATION
// ==========================================

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

const LIMIT = 10;

// ==========================================
// TYPES
// ==========================================

type ApplicationStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled";

interface Application {
  _id: string;
  tuitionId: string;
  tuitionTitle: string;
  subject: string;
  monthlyFee: number;

  tutorEmail: string;
  tutorName: string;

  studentName: string;
  studentEmail: string;
  studentPhone: string;

  preferredSchedule: string;
  studentNote?: string;

  status: ApplicationStatus;
  appliedAt: string;
  cancelledAt?: string;
}

interface Pagination {
  currentPage: number;
  limit: number;
  totalApplications: number;
  totalPages: number;
}

interface ApplicationResponse {
  success: boolean;
  message: string;
  data: {
    applications: Application[];
    pagination: Pagination;
  };
}

// ==========================================
// HELPERS
// ==========================================

const initialPagination: Pagination = {
  currentPage: 1,
  limit: LIMIT,
  totalApplications: 0,
  totalPages: 0,
};

function formatCurrency(amount: number) {
  return `৳${Number(amount || 0).toLocaleString("en-BD")}`;
}

function formatDate(date?: string) {
  if (!date) return "Date unavailable";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Date unavailable";
  }

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(date?: string) {
  if (!date) return "Date unavailable";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Date unavailable";
  }

  return parsed.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusStyle(status: ApplicationStatus) {
  switch (status) {
    case "accepted":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "rejected":
      return "border-red-200 bg-red-50 text-red-700";

    case "cancelled":
      return "border-slate-200 bg-slate-100 text-slate-600";

    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

function getStatusDot(status: ApplicationStatus) {
  switch (status) {
    case "accepted":
      return "bg-emerald-500";

    case "rejected":
      return "bg-red-500";

    case "cancelled":
      return "bg-slate-400";

    default:
      return "bg-amber-500";
  }
}

// ==========================================
// STATUS BADGE
// ==========================================

function StatusBadge({
  status,
}: {
  status: ApplicationStatus;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-extrabold capitalize ${getStatusStyle(status)}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${getStatusDot(status)}`}
      />

      {status}
    </span>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function StudentApplicationsPage() {
  const router = useRouter();

  const [token, setToken] = useState("");

  const [applications, setApplications] =
    useState<Application[]>([]);

  const [pagination, setPagination] =
    useState<Pagination>(initialPagination);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [cancellingId, setCancellingId] =
    useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [page, setPage] = useState(1);

  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);

  const [cancelTarget, setCancelTarget] =
    useState<Application | null>(null);

  // ==========================================
  // SESSION EXPIRY
  // ==========================================

  const expireSession = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("mentorlagbe_token");
    localStorage.removeItem("mentorlagbe_user");

    toast.error("Session expired", {
      description: "Please sign in again.",
    });

    router.replace("/sign-in");
  }, [router]);

  // ==========================================
  // AUTHENTICATION
  // ==========================================

  useEffect(() => {
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

    try {
      const user = JSON.parse(storedUser);

      if (
        String(user.role || "").toLowerCase() !== "student"
      ) {
        router.replace("/");
        return;
      }

      setToken(storedToken);
    } catch {
      expireSession();
    }
  }, [router, expireSession]);

  // ==========================================
  // GET STUDENT APPLICATIONS
  // GET /api/applications
  // ==========================================

  const loadApplications = useCallback(
    async (
      authToken: string,
      pageNumber: number,
      showLoader = true
    ): Promise<boolean> => {
      if (showLoader) {
        setLoading(true);
      }

      try {
        const params = new URLSearchParams({
          page: String(pageNumber),
          limit: String(LIMIT),
        });

        const response = await fetch(
          `${API_URL}/applications?${params.toString()}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
            cache: "no-store",
          }
        );

        const result: ApplicationResponse =
          await response.json();

        if (response.status === 401) {
          expireSession();
          return false;
        }

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to retrieve applications."
          );
        }

        setApplications(
          Array.isArray(result.data?.applications)
            ? result.data.applications
            : []
        );

        setPagination(
          result.data?.pagination || initialPagination
        );

        return true;
      } catch (error) {
        toast.error("Unable to load applications", {
          description:
            error instanceof Error
              ? error.message
              : "Please try again.",
        });

        return false;
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    },
    [expireSession]
  );

  // ==========================================
  // FETCH APPLICATIONS
  // ==========================================

  useEffect(() => {
    if (!token) return;

    void loadApplications(token, page);
  }, [token, page, loadApplications]);

  // ==========================================
  // REFRESH APPLICATIONS
  // ==========================================

  const handleRefresh = async () => {
    if (!token) return;

    setRefreshing(true);

    try {
      const success = await loadApplications(
        token,
        page,
        false
      );

      if (success) {
        toast.success("Applications refreshed", {
          description: "Your application information is up to date.",
        });
      }
    } finally {
      setRefreshing(false);
    }
  };

  // ==========================================
  // SEARCH AND FILTER
  // ==========================================

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return applications.filter((application) => {
      const matchesSearch =
        !query ||
        application.tuitionTitle?.toLowerCase().includes(query) ||
        application.subject?.toLowerCase().includes(query) ||
        application.tutorName?.toLowerCase().includes(query) ||
        application.tutorEmail?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        application.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, search, statusFilter]);

  // ==========================================
  // PAGE STATISTICS
  // These counts refer to the current page.
  // ==========================================

  const pendingCount = applications.filter(
    (item) => item.status === "pending"
  ).length;

  const acceptedCount = applications.filter(
    (item) => item.status === "accepted"
  ).length;

  const rejectedCount = applications.filter(
    (item) => item.status === "rejected"
  ).length;

  // ==========================================
  // CANCEL APPLICATION
  // PATCH /api/applications/:id/cancel
  // ==========================================

  const handleCancelApplication = async () => {
    if (!cancelTarget || !token) return;

    const application = cancelTarget;

    if (application.status !== "pending") {
      toast.warning("Cancellation unavailable", {
        description: "Only pending applications can be cancelled.",
      });

      setCancelTarget(null);
      return;
    }

    setCancellingId(application._id);

    const toastId = toast.loading(
      "Cancelling application..."
    );

    try {
      const response = await fetch(
        `${API_URL}/applications/${encodeURIComponent(application._id)}/cancel`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (response.status === 401) {
        toast.dismiss(toastId);
        expireSession();
        return;
      }

      if (!response.ok || !result.success) {
        toast.dismiss(toastId);

        toast.error("Cancellation failed", {
          description:
            result.message || "Unable to cancel this application.",
        });

        return;
      }

      setCancelTarget(null);
      setSelectedApplication(null);

      toast.success("Application cancelled", {
        id: toastId,
        description:
          "Your application has been successfully cancelled.",
      });

      await loadApplications(token, page, false);
    } catch (error) {
      toast.error("Something went wrong", {
        id: toastId,
        description:
          error instanceof Error
            ? error.message
            : "Unable to cancel your application.",
      });
    } finally {
      setCancellingId(null);
    }
  };

  // ==========================================
  // LOADING SCREEN
  // ==========================================

  if (!token || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f8f5]">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#075c3b] text-white">
            <GraduationCap size={30} />
          </div>

          <Loader2
            size={25}
            className="animate-spin text-[#075c3b]"
          />

          <p className="text-sm font-medium text-[#718078]">
            Loading your applications...
          </p>
        </div>
      </main>
    );
  }

  // ==========================================
  // MAIN PAGE
  // ==========================================

  return (
    <main className="min-h-screen bg-[#f5f8f5]">

      {/* HEADER */}

      <header className="sticky top-0 z-30 border-b border-[#e5ece6] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[78px] max-w-7xl items-center justify-between px-5 md:px-8">

          <button
            type="button"
            onClick={() => router.push("/student/dashboard")}
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#075c3b] text-white">
              <GraduationCap size={26} />
            </div>

            <div className="text-left">
              <h1 className="text-xl font-extrabold tracking-tight text-[#172820]">
                Mentor<span className="text-[#087448]">Lagbe</span>
              </h1>

              <p className="text-[9px] font-bold uppercase tracking-[2px] text-[#9aa79e]">
                Student Portal
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => router.push("/student/dashboard")}
            className="flex items-center gap-2 rounded-xl border border-[#e1e9e2] px-4 py-2.5 text-xs font-bold text-[#53675c] transition hover:border-[#075c3b] hover:text-[#075c3b]"
          >
            <ArrowLeft size={16} />

            <span className="hidden sm:inline">
              Back to Dashboard
            </span>

            <span className="sm:hidden">
              Dashboard
            </span>
          </button>

        </div>
      </header>

      {/* CONTENT */}

      <div className="mx-auto max-w-7xl px-5 py-9 md:px-8 md:py-12">

        {/* PAGE TITLE */}

        <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

          <div>
            <div className="mb-3 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[2.5px] text-[#087448]">
              <ClipboardList size={15} />
              Student Workspace
              <span className="text-[#b1bdb4]">/</span>
              My Applications
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-[#172820] md:text-4xl">
              My Applications
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#839188] md:text-base">
              Track your tuition applications, check tutor
              responses and manage your learning opportunities.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 rounded-xl border border-[#dfe8e0] bg-white px-5 py-3.5 text-sm font-bold text-[#53675c] shadow-sm transition hover:border-[#087448] hover:text-[#075c3b] disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>

        </div>

        {/* STATISTICS */}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* TOTAL */}

          <div className="rounded-2xl border border-[#e3ebe4] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e9f3ec] text-[#087448]">
                <ClipboardList size={22} />
              </div>

              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9aa79e]">
                Overall
              </span>
            </div>

            <p className="mt-5 text-3xl font-extrabold text-[#172820]">
              {pagination.totalApplications}
            </p>

            <p className="mt-1 text-xs font-medium text-[#89978e]">
              Total applications
            </p>
          </div>

          {/* PENDING */}

          <div className="rounded-2xl border border-[#e3ebe4] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                <Clock3 size={22} />
              </div>

              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                Waiting
              </span>
            </div>

            <p className="mt-5 text-3xl font-extrabold text-[#172820]">
              {pendingCount}
            </p>

            <p className="mt-1 text-xs font-medium text-[#89978e]">
              Pending on this page
            </p>
          </div>

          {/* ACCEPTED */}

          <div className="rounded-2xl border border-[#e3ebe4] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <CheckCircle2 size={22} />
              </div>

              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Successful
              </span>
            </div>

            <p className="mt-5 text-3xl font-extrabold text-[#172820]">
              {acceptedCount}
            </p>

            <p className="mt-1 text-xs font-medium text-[#89978e]">
              Accepted on this page
            </p>
          </div>

          {/* REJECTED */}

          <div className="rounded-2xl border border-[#e3ebe4] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <XCircle size={22} />
              </div>

              <span className="text-[10px] font-bold uppercase tracking-wider text-red-600">
                Rejected
              </span>
            </div>

            <p className="mt-5 text-3xl font-extrabold text-[#172820]">
              {rejectedCount}
            </p>

            <p className="mt-1 text-xs font-medium text-[#89978e]">
              Rejected on this page
            </p>
          </div>

        </div>

        {/* SEARCH AND FILTER */}

        <section className="mb-7 rounded-2xl border border-[#e3ebe4] bg-white p-4 shadow-sm">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            {/* SEARCH */}

            <div className="relative w-full lg:max-w-md">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98a59c]"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by tuition, subject or tutor..."
                className="w-full rounded-xl border border-[#e3ebe4] bg-[#fafcf9] py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-[#aab5ad] focus:border-[#087448] focus:ring-4 focus:ring-[#087448]/10"
              />
            </div>

            {/* STATUS FILTER */}

            <div className="relative flex-1 sm:flex-none">
              <Filter
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c9b91]"
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none rounded-xl border border-[#e3ebe4] bg-white py-3 pl-9 pr-8 text-xs font-bold text-[#53675c] outline-none focus:border-[#087448] sm:min-w-[180px]"
              >
                <option value="all">All Applications</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#edf1ed] pt-4">

            <p className="text-xs text-[#89978e]">
              Showing{" "}
              <span className="font-bold text-[#34473b]">
                {filteredApplications.length}
              </span>{" "}
              applications on this page
            </p>

            {(search || statusFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
                className="text-xs font-bold text-[#087448] hover:underline"
              >
                Clear filters
              </button>
            )}

          </div>

        </section>

        {/* APPLICATION CARDS */}

        {filteredApplications.length > 0 ? (

          <div className="grid gap-5 md:grid-cols-2">

            {filteredApplications.map((application) => {

              const isPending =
                application.status === "pending";

              return (
                <article
                  key={application._id}
                  className="overflow-hidden rounded-[24px] border border-[#e3ebe4] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#075c3b]/5"
                >

                  {/* CARD HEADER */}

                  <div className="border-b border-[#edf1ed] p-6">

                    <div className="flex items-start justify-between gap-3">

                      <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e9f3ec] text-[#087448]">
                          <GraduationCap size={25} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-[10px] font-extrabold uppercase tracking-[1.5px] text-[#087448]">
                            Applied Tuition
                          </p>

                          <h3 className="mt-1 line-clamp-2 text-base font-extrabold leading-snug text-[#172820]">
                            {application.tuitionTitle}
                          </h3>
                        </div>

                      </div>

                      <StatusBadge status={application.status} />

                    </div>

                  </div>

                  {/* CARD BODY */}

                  <div className="p-6">

                    {/* SUBJECT AND FEE */}

                    <div className="mb-5 grid grid-cols-2 gap-3">

                      <div className="rounded-xl bg-[#f6f9f6] p-3">
                        <div className="mb-2 flex items-center gap-2 text-[#087448]">
                          <BookOpen size={15} />

                          <span className="text-[10px] font-bold uppercase tracking-wider">
                            Subject
                          </span>
                        </div>

                        <p className="text-sm font-extrabold text-[#34473b]">
                          {application.subject}
                        </p>
                      </div>

                      <div className="rounded-xl bg-[#f6f9f6] p-3">
                        <div className="mb-2 flex items-center gap-2 text-[#087448]">
                          <Wallet size={15} />

                          <span className="text-[10px] font-bold uppercase tracking-wider">
                            Monthly Fee
                          </span>
                        </div>

                        <p className="text-sm font-extrabold text-[#34473b]">
                          {formatCurrency(application.monthlyFee)}
                        </p>
                      </div>

                    </div>

                    {/* TUTOR DETAILS */}

                    <div className="space-y-3">

                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f3f7f3] text-[#087448]">
                          <UserRound size={16} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#a0aca3]">
                            Tutor Name
                          </p>

                          <p className="truncate text-sm font-semibold text-[#34473b]">
                            {application.tutorName || "Not available"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f3f7f3] text-[#087448]">
                          <CalendarDays size={16} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#a0aca3]">
                            Preferred Schedule
                          </p>

                          <p className="text-sm font-semibold text-[#34473b]">
                            {application.preferredSchedule}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f3f7f3] text-[#087448]">
                          <CalendarDays size={16} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#a0aca3]">
                            Application Date
                          </p>

                          <p className="text-sm font-semibold text-[#34473b]">
                            {formatDate(application.appliedAt)}
                          </p>
                        </div>
                      </div>

                    </div>

                    {/* STATUS MESSAGE */}

                    <div
                      className={`mt-5 rounded-xl p-4 ${
                        application.status === "accepted"
                          ? "bg-emerald-50"
                          : application.status === "rejected"
                            ? "bg-red-50"
                            : application.status === "cancelled"
                              ? "bg-slate-100"
                              : "bg-amber-50"
                      }`}
                    >

                      <div className="flex items-start gap-2">

                        {application.status === "accepted" ? (
                          <CheckCircle2
                            size={17}
                            className="mt-0.5 shrink-0 text-emerald-700"
                          />
                        ) : application.status === "rejected" ? (
                          <XCircle
                            size={17}
                            className="mt-0.5 shrink-0 text-red-600"
                          />
                        ) : application.status === "cancelled" ? (
                          <Ban
                            size={17}
                            className="mt-0.5 shrink-0 text-slate-600"
                          />
                        ) : (
                          <Clock3
                            size={17}
                            className="mt-0.5 shrink-0 text-amber-700"
                          />
                        )}

                        <p
                          className={`text-xs leading-6 ${
                            application.status === "accepted"
                              ? "text-emerald-800"
                              : application.status === "rejected"
                                ? "text-red-700"
                                : application.status === "cancelled"
                                  ? "text-slate-700"
                                  : "text-amber-800"
                          }`}
                        >
                          {application.status === "accepted"
                            ? "Your application has been accepted by the tutor. You can contact the tutor using the available contact information."
                            : application.status === "rejected"
                              ? "Unfortunately, the tutor has rejected this application. You can explore other tuition opportunities."
                              : application.status === "cancelled"
                                ? "You cancelled this application."
                                : "Your application has been submitted successfully and is waiting for the tutor's response."}
                        </p>

                      </div>

                    </div>

                    {/* CARD FOOTER */}

                    <div className="mt-5 flex items-center justify-between border-t border-[#edf1ed] pt-4">

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedApplication(application)
                        }
                        className="flex items-center gap-2 text-xs font-bold text-[#087448] transition hover:text-[#075c3b]"
                      >
                        <Eye size={16} />
                        View Details
                      </button>

                      <span className="text-[10px] font-semibold text-[#a0aca3]">
                        ID: {application._id.slice(-8)}
                      </span>

                    </div>

                    {/* CANCEL BUTTON */}

                    {isPending && (
                      <button
                        type="button"
                        onClick={() =>
                          setCancelTarget(application)
                        }
                        disabled={cancellingId === application._id}
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 py-3 text-xs font-extrabold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                      >
                        <XCircle size={16} />
                        Cancel Application
                      </button>
                    )}

                  </div>

                </article>
              );
            })}

          </div>

        ) : (

          /* EMPTY STATE */

          <div className="rounded-[26px] border border-dashed border-[#cfded1] bg-white px-6 py-16 text-center shadow-sm">

            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#eaf3ec] text-[#087448]">
              {search || statusFilter !== "all" ? (
                <Search size={34} />
              ) : (
                <ClipboardList size={36} />
              )}
            </div>

            <h3 className="text-xl font-extrabold text-[#172820]">
              {search || statusFilter !== "all"
                ? "No matching applications found"
                : "You haven't applied for any tuition yet"}
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#89978e]">
              {search || statusFilter !== "all"
                ? "Try changing your search or status filter to find your applications."
                : "Explore available tuition opportunities and submit your first application to connect with a tutor."}
            </p>

            {search || statusFilter !== "all" ? (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
                className="mt-6 rounded-xl border border-[#dfe8e0] px-6 py-3 text-sm font-bold text-[#075c3b] transition hover:bg-[#f1f7f2]"
              >
                Clear Filters
              </button>
            ) : (
              <button
                type="button"
                onClick={() => router.push("/tuitions")}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#075c3b] px-6 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#087448]"
              >
                <BookOpen size={17} />
                Browse Tuitions
                <ArrowRight size={16} />
              </button>
            )}

          </div>

        )}

        {/* PAGINATION */}

        {pagination.totalPages > 1 && (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e3ebe4] bg-white p-4">

            <p className="text-xs font-medium text-[#89978e]">
              Page{" "}
              <span className="font-extrabold text-[#34473b]">
                {pagination.currentPage}
              </span>{" "}
              of{" "}
              <span className="font-extrabold text-[#34473b]">
                {pagination.totalPages}
              </span>
            </p>

            <div className="flex items-center gap-3">

              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((previous) => previous - 1)}
                className="flex items-center gap-2 rounded-xl border border-[#e3ebe4] px-4 py-2.5 text-xs font-bold text-[#53675c] transition hover:bg-[#f4f8f4] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft size={15} />
                Previous
              </button>

              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((previous) => previous + 1)}
                className="flex items-center gap-2 rounded-xl bg-[#075c3b] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#087448] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ArrowRight size={15} />
              </button>

            </div>

          </div>
        )}

        {/* FOOTER */}

        <footer className="mt-12 border-t border-[#e3ebe4] py-7 text-center">
          <p className="text-xs font-medium text-[#9aa79e]">
            © 2026 MentorLagbe. Empowering education through meaningful connections.
          </p>
        </footer>

      </div>

      {/* ====================================== */}
      {/* APPLICATION DETAILS MODAL */}
      {/* ====================================== */}

      {selectedApplication && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#10251b]/55 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedApplication(null);
            }
          }}
        >

          <div className="my-auto w-full max-w-lg overflow-hidden rounded-[26px] bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-[#edf1ed] px-6 py-5">

              <div>
                <h3 className="text-lg font-extrabold text-[#172820]">
                  Application Details
                </h3>

                <p className="mt-1 text-xs text-[#89978e]">
                  Your submitted tuition application
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedApplication(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-[#89978e] transition hover:bg-[#f1f5f1]"
              >
                <X size={20} />
              </button>

            </div>

            {/* MODAL BODY */}

            <div className="max-h-[70vh] space-y-5 overflow-y-auto p-6">

              <div>
                <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-[#087448]">
                  Tuition
                </p>

                <h4 className="text-lg font-extrabold text-[#172820]">
                  {selectedApplication.tuitionTitle}
                </h4>

                <p className="mt-2 text-sm font-semibold text-[#819087]">
                  {selectedApplication.subject}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#819087]">
                  Application Status
                </span>

                <StatusBadge status={selectedApplication.status} />
              </div>

              <div className="rounded-xl bg-[#f6f9f6] p-4">
                <p className="mb-3 text-[10px] font-extrabold uppercase tracking-wider text-[#087448]">
                  Tutor Information
                </p>

                <p className="font-extrabold text-[#26372d]">
                  {selectedApplication.tutorName}
                </p>

                <a
                  href={`mailto:${selectedApplication.tutorEmail}`}
                  className="mt-2 flex items-center gap-2 break-all text-xs font-semibold text-[#087448] hover:underline"
                >
                  <Mail size={14} />
                  {selectedApplication.tutorEmail}
                </a>

              </div>

              <div className="space-y-4">

                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#a0aca3]">
                    Monthly Fee
                  </p>

                  <p className="text-sm font-extrabold text-[#075c3b]">
                    {formatCurrency(selectedApplication.monthlyFee)}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#a0aca3]">
                    Your Phone Number
                  </p>

                  <p className="flex items-center gap-2 text-sm font-semibold text-[#34473b]">
                    <Phone size={15} />
                    {selectedApplication.studentPhone}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#a0aca3]">
                    Preferred Schedule
                  </p>

                  <p className="flex items-center gap-2 text-sm font-semibold text-[#34473b]">
                    <CalendarDays size={15} />
                    {selectedApplication.preferredSchedule}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#a0aca3]">
                    Application Submitted
                  </p>

                  <p className="text-sm font-semibold text-[#34473b]">
                    {formatDateTime(selectedApplication.appliedAt)}
                  </p>
                </div>

                {selectedApplication.studentNote && (
                  <div>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#a0aca3]">
                      Your Message
                    </p>

                    <div className="rounded-xl border border-[#e6ede6] bg-white p-4">
                      <p className="text-sm leading-7 text-[#718078]">
                        {selectedApplication.studentNote}
                      </p>
                    </div>
                  </div>
                )}

              </div>

              {selectedApplication.status === "pending" && (
                <button
                  type="button"
                  onClick={() => {
                    setCancelTarget(selectedApplication);
                    setSelectedApplication(null);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 py-3.5 text-xs font-extrabold text-red-600 transition hover:bg-red-100"
                >
                  <XCircle size={16} />
                  Cancel This Application
                </button>
              )}

            </div>

          </div>

        </div>
      )}

      {/* ====================================== */}
      {/* CANCEL CONFIRMATION MODAL */}
      {/* ====================================== */}

      {cancelTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#10251b]/55 p-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-[26px] bg-white p-7 shadow-2xl">

            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertTriangle size={27} />
            </div>

            <h3 className="text-center text-xl font-extrabold text-[#172820]">
              Cancel Application?
            </h3>

            <p className="mt-3 text-center text-sm leading-7 text-[#849188]">
              Are you sure you want to cancel your application
              for{" "}
              <span className="font-bold text-[#34473b]">
                {cancelTarget.tuitionTitle}
              </span>
              ?
            </p>

            <p className="mt-3 rounded-xl bg-[#f6f9f6] p-3 text-center text-xs font-semibold text-[#718078]">
              This action cannot be undone.
            </p>

            <div className="mt-7 flex gap-3">

              <button
                type="button"
                disabled={cancellingId === cancelTarget._id}
                onClick={() => setCancelTarget(null)}
                className="flex-1 rounded-xl border border-[#dfe8e0] py-3.5 text-sm font-bold text-[#62746a] transition hover:bg-[#f5f8f5]"
              >
                Keep Application
              </button>

              <button
                type="button"
                disabled={cancellingId === cancelTarget._id}
                onClick={handleCancelApplication}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-3.5 text-sm font-extrabold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {cancellingId === cancelTarget._id ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <X size={17} />
                    Confirm Cancel
                  </>
                )}
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}
