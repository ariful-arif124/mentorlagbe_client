
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  GraduationCap,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  MapPin,
  Wallet,
  CalendarDays,
  ShieldCheck,
  Loader2,
  ImagePlus,
  CheckCircle2,
  Clock3,
  Plus,
  Monitor,
  Search,
  Filter,
  RefreshCw,
  Pencil,
  Trash2,
  Power,
  X,
  AlertTriangle,
  LayoutList,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

// ==========================================
// TYPES
// ==========================================

interface Tuition {
  _id: string;
  title: string;
  subject: string;
  classLevel: string;
  monthlyFee: number;
  daysPerWeek: number;
  mode: string;
  location: string;
  description: string;
  bannerImage?: string;
  approvalStatus: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface TuitionForm {
  title: string;
  subject: string;
  classLevel: string;
  monthlyFee: string;
  daysPerWeek: string;
  mode: string;
  location: string;
  description: string;
  bannerImage: string;
}

const initialForm: TuitionForm = {
  title: "",
  subject: "",
  classLevel: "",
  monthlyFee: "",
  daysPerWeek: "",
  mode: "",
  location: "",
  description: "",
  bannerImage: "",
};

const inputClass =
  "w-full rounded-xl border border-[#dfe8e0] bg-[#fcfdfc] px-4 py-3 text-sm text-[#26372d] outline-none transition placeholder:text-[#b2bdb5] focus:border-[#087448] focus:ring-4 focus:ring-[#087448]/10";

const labelClass =
  "mb-2 block text-sm font-bold text-[#34473b]";

// ==========================================
// HELPER FUNCTIONS
// ==========================================

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

function getStatus(tuition: Tuition) {
  const status = String(
    tuition.approvalStatus || ""
  ).toLowerCase();

  if (status === "pending") {
    return {
      label: "Pending Review",
      className: "bg-amber-50 text-amber-700 border-amber-200",
      dotClass: "bg-amber-500",
    };
  }

  if (status === "rejected") {
    return {
      label: "Rejected",
      className: "bg-red-50 text-red-700 border-red-200",
      dotClass: "bg-red-500",
    };
  }

  if (status === "approved" && tuition.isActive) {
    return {
      label: "Active",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dotClass: "bg-emerald-500",
    };
  }

  if (status === "approved" && !tuition.isActive) {
    return {
      label: "Approved · Inactive",
      className: "bg-slate-100 text-slate-600 border-slate-200",
      dotClass: "bg-slate-400",
    };
  }

  return {
    label: "Inactive",
    className: "bg-slate-100 text-slate-600 border-slate-200",
    dotClass: "bg-slate-400",
  };
}

// ==========================================
// STATUS BADGE
// ==========================================

function StatusBadge({ tuition }: { tuition: Tuition }) {
  const status = getStatus(tuition);

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold ${status.className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${status.dotClass}`}
      />
      {status.label}
    </span>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function MyTuitionsPage() {
  const router = useRouter();

  const [token, setToken] = useState("");

  const [tuitions, setTuitions] = useState<Tuition[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [editing, setEditing] = useState<Tuition | null>(null);
  const [editForm, setEditForm] =
    useState<TuitionForm>(initialForm);

  const [savingEdit, setSavingEdit] = useState(false);

  const [deleteTarget, setDeleteTarget] =
    useState<Tuition | null>(null);

  const [busyId, setBusyId] = useState<string | null>(null);

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
  // GET TUTOR TUITION LISTINGS
  // GET /api/tutor/tuitions
  // ==========================================

  const fetchTuitions = useCallback(
    async (authToken: string): Promise<Tuition[]> => {
      const response = await fetch(
        `${API_URL}/tutor/tuitions`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (response.status === 401) {
        expireSession();
        throw new Error("SESSION_EXPIRED");
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to retrieve tuition listings."
        );
      }

      return Array.isArray(result.data)
        ? result.data
        : [];
    },
    [expireSession]
  );

  // ==========================================
  // INITIAL PAGE LOAD AND AUTHENTICATION
  // ==========================================

  useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
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
        const parsedUser = JSON.parse(storedUser);

        if (
          String(parsedUser.role || "").toLowerCase() !== "tutor"
        ) {
          router.replace("/");
          return;
        }

        if (cancelled) return;

        setToken(storedToken);

        const data = await fetchTuitions(storedToken);

        if (!cancelled) {
          setTuitions(data);
        }
      } catch (error) {
        if (
          !cancelled &&
          error instanceof Error &&
          error.message !== "SESSION_EXPIRED"
        ) {
          toast.error("Unable to load your tuitions", {
            description:
              error.message || "Please try again.",
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void initialize();

    return () => {
      cancelled = true;
    };
  }, [fetchTuitions, router]);

  // ==========================================
  // REFRESH LISTINGS
  // ==========================================

  const refreshList = async () => {
    if (!token) return;

    setRefreshing(true);

    try {
      const data = await fetchTuitions(token);

      setTuitions(data);

      toast.success("Listings refreshed", {
        description: "Your tuition information is up to date.",
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message !== "SESSION_EXPIRED"
      ) {
        toast.error("Refresh failed", {
          description: error.message,
        });
      }
    } finally {
      setRefreshing(false);
    }
  };

  // ==========================================
  // SEARCH AND FILTER
  // ==========================================

  const filteredTuitions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tuitions.filter((tuition) => {
      const matchesSearch =
        !query ||
        tuition.title?.toLowerCase().includes(query) ||
        tuition.subject?.toLowerCase().includes(query) ||
        tuition.location?.toLowerCase().includes(query) ||
        tuition.classLevel?.toLowerCase().includes(query);

      const approvalStatus = String(
        tuition.approvalStatus || ""
      ).toLowerCase();

      let matchesStatus = true;

      switch (statusFilter) {
        case "active":
          matchesStatus =
            approvalStatus === "approved" &&
            tuition.isActive === true;
          break;

        case "pending":
          matchesStatus = approvalStatus === "pending";
          break;

        case "rejected":
          matchesStatus = approvalStatus === "rejected";
          break;

        case "inactive":
          matchesStatus =
            approvalStatus === "approved" &&
            tuition.isActive === false;
          break;

        default:
          matchesStatus = true;
      }

      return matchesSearch && matchesStatus;
    });
  }, [tuitions, search, statusFilter]);

  // ==========================================
  // DASHBOARD STATISTICS
  // ==========================================

  const totalTuitions = tuitions.length;

  const activeTuitions = tuitions.filter(
    (tuition) =>
      tuition.approvalStatus === "approved" &&
      tuition.isActive === true
  ).length;

  const pendingTuitions = tuitions.filter(
    (tuition) => tuition.approvalStatus === "pending"
  ).length;

  const rejectedTuitions = tuitions.filter(
    (tuition) => tuition.approvalStatus === "rejected"
  ).length;

  // ==========================================
  // OPEN EDIT MODAL
  // ==========================================

  const openEditModal = (tuition: Tuition) => {
    setEditing(tuition);

    setEditForm({
      title: tuition.title || "",
      subject: tuition.subject || "",
      classLevel: tuition.classLevel || "",
      monthlyFee: String(tuition.monthlyFee || ""),
      daysPerWeek: String(tuition.daysPerWeek || ""),
      mode: tuition.mode || "",
      location: tuition.location || "",
      description: tuition.description || "",
      bannerImage: tuition.bannerImage || "",
    });
  };

  // ==========================================
  // EDIT FORM CHANGE
  // ==========================================

  const handleEditChange = (
    e: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // UPDATE TUITION
  // PUT /api/tutor/tuitions/:id
  // ==========================================

  const handleSaveEdit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!editing || !token) return;

    if (
      !editForm.title.trim() ||
      !editForm.subject.trim() ||
      !editForm.classLevel.trim() ||
      !editForm.monthlyFee ||
      !editForm.daysPerWeek ||
      !editForm.mode ||
      !editForm.location.trim() ||
      !editForm.description.trim()
    ) {
      toast.error("Incomplete information", {
        description: "Please complete all required fields.",
      });
      return;
    }

    const monthlyFee = Number(editForm.monthlyFee);
    const daysPerWeek = Number(editForm.daysPerWeek);

    if (!Number.isFinite(monthlyFee) || monthlyFee <= 0) {
      toast.error("Invalid monthly fee", {
        description: "Enter a valid monthly fee.",
      });
      return;
    }

    if (
      !Number.isInteger(daysPerWeek) ||
      daysPerWeek < 1 ||
      daysPerWeek > 7
    ) {
      toast.error("Invalid schedule", {
        description: "Days per week must be between 1 and 7.",
      });
      return;
    }

    if (editForm.bannerImage.trim()) {
      try {
        const imageUrl = new URL(editForm.bannerImage.trim());

        if (
          !["http:", "https:"].includes(imageUrl.protocol)
        ) {
          throw new Error("Invalid URL");
        }
      } catch {
        toast.error("Invalid image URL", {
          description: "Please provide a valid image URL.",
        });
        return;
      }
    }

    setSavingEdit(true);

    const toastId = toast.loading("Updating tuition...");

    try {
      const response = await fetch(
        `${API_URL}/tutor/tuitions/${encodeURIComponent(editing._id)}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: editForm.title.trim(),
            subject: editForm.subject.trim(),
            classLevel: editForm.classLevel.trim(),
            monthlyFee,
            daysPerWeek,
            mode: editForm.mode,
            location: editForm.location.trim(),
            description: editForm.description.trim(),
            bannerImage: editForm.bannerImage.trim(),
          }),
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

        toast.error("Update failed", {
          description:
            result.message || "Unable to update this tuition.",
        });

        return;
      }

      const updatedListings = await fetchTuitions(token);

      setTuitions(updatedListings);
      setEditing(null);

      toast.success("Tuition updated successfully!", {
        id: toastId,
        description:
          "Your updated listing has been sent for admin approval.",
        duration: 5000,
      });
    } catch (error) {
      toast.error("Something went wrong", {
        id: toastId,
        description:
          error instanceof Error &&
          error.message !== "SESSION_EXPIRED"
            ? error.message
            : "Unable to update your tuition.",
      });
    } finally {
      setSavingEdit(false);
    }
  };

  // ==========================================
  // ACTIVATE / DEACTIVATE TUITION
  // PATCH /api/tutor/tuitions/:id/active
  // ==========================================

  const handleToggleStatus = async (tuition: Tuition) => {
    if (!token) return;

    if (
      String(tuition.approvalStatus).toLowerCase() !== "approved"
    ) {
      toast.warning("Admin approval required", {
        description:
          tuition.approvalStatus === "rejected"
            ? "This listing was rejected. Edit it to submit it for review again."
            : "This tuition must be approved by an admin before activation.",
      });

      return;
    }

    const nextStatus = !tuition.isActive;

    setBusyId(tuition._id);

    const toastId = toast.loading(
      nextStatus
        ? "Activating tuition..."
        : "Deactivating tuition..."
    );

    try {
      const response = await fetch(
        `${API_URL}/tutor/tuitions/${encodeURIComponent(tuition._id)}/active`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isActive: nextStatus,
          }),
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

        toast.error("Status update failed", {
          description:
            result.message ||
            "Unable to change tuition status.",
        });

        return;
      }

      const updatedListings = await fetchTuitions(token);

      setTuitions(updatedListings);

      toast.success(
        nextStatus
          ? "Tuition activated!"
          : "Tuition deactivated!",
        {
          id: toastId,
          description: nextStatus
            ? "Your approved tuition is now visible to students."
            : "Your tuition is no longer visible to students.",
        }
      );
    } catch (error) {
      toast.error("Something went wrong", {
        id: toastId,
        description:
          error instanceof Error &&
          error.message !== "SESSION_EXPIRED"
            ? error.message
            : "Unable to update tuition status.",
      });
    } finally {
      setBusyId(null);
    }
  };

  // ==========================================
  // DELETE TUITION
  // DELETE /api/tutor/tuitions/:id
  // ==========================================

  const handleDelete = async () => {
    if (!deleteTarget || !token) return;

    const tuition = deleteTarget;

    setBusyId(tuition._id);

    const toastId = toast.loading("Deleting tuition...");

    try {
      const response = await fetch(
        `${API_URL}/tutor/tuitions/${encodeURIComponent(tuition._id)}`,
        {
          method: "DELETE",
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

        toast.error("Deletion failed", {
          description:
            result.message || "Unable to delete this tuition.",
        });

        return;
      }

      setTuitions((previous) =>
        previous.filter((item) => item._id !== tuition._id)
      );

      setDeleteTarget(null);

      toast.success("Tuition deleted successfully!", {
        id: toastId,
        description: "Your tuition listing has been removed.",
      });
    } catch (error) {
      toast.error("Something went wrong", {
        id: toastId,
        description:
          error instanceof Error &&
          error.message !== "SESSION_EXPIRED"
            ? error.message
            : "Unable to delete your tuition.",
      });
    } finally {
      setBusyId(null);
    }
  };

  // ==========================================
  // LOADING SCREEN
  // ==========================================

  if (loading) {
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
            Loading your tuition listings...
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
            onClick={() => router.push("/dashboard/tutor")}
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#075c3b] text-white shadow-sm">
              <GraduationCap size={26} />
            </div>

            <div className="text-left">
              <h1 className="text-xl font-extrabold tracking-tight text-[#172820]">
                Mentor<span className="text-[#087448]">Lagbe</span>
              </h1>

              <p className="text-[9px] font-bold uppercase tracking-[2px] text-[#9aa79e]">
                Tutor Portal
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => router.push("/dashboard/tutor")}
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

      {/* PAGE CONTENT */}

      <div className="mx-auto max-w-7xl px-5 py-9 md:px-8 md:py-12">

        {/* PAGE TITLE */}

        <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

          <div>
            <div className="mb-3 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[2.5px] text-[#087448]">
              <LayoutList size={15} />
              Tutor Workspace
              <span className="text-[#b1bdb4]">/</span>
              My Tuitions
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-[#172820] md:text-4xl">
              My Tuitions
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#839188] md:text-base">
              Manage your tuition listings, track approval
              status and control your active opportunities.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push("/dashboard/tutor/post-tuition")
            }
            className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#075c3b] px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-[#075c3b]/15 transition hover:bg-[#087448]"
          >
            <Plus size={18} />
            Post New Tuition
            <ArrowRight size={17} />
          </button>

        </div>

        {/* STATISTICS */}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* TOTAL */}

          <div className="rounded-2xl border border-[#e3ebe4] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e9f3ec] text-[#087448]">
                <BookOpen size={22} />
              </div>

              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9aa79e]">
                Total
              </span>
            </div>

            <p className="mt-5 text-3xl font-extrabold text-[#172820]">
              {totalTuitions}
            </p>

            <p className="mt-1 text-xs font-medium text-[#89978e]">
              Total tuition listings
            </p>
          </div>

          {/* ACTIVE */}

          <div className="rounded-2xl border border-[#e3ebe4] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <CheckCircle2 size={22} />
              </div>

              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Live
              </span>
            </div>

            <p className="mt-5 text-3xl font-extrabold text-[#172820]">
              {activeTuitions}
            </p>

            <p className="mt-1 text-xs font-medium text-[#89978e]">
              Active tuition listings
            </p>
          </div>

          {/* PENDING */}

          <div className="rounded-2xl border border-[#e3ebe4] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                <Clock3 size={22} />
              </div>

              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                Review
              </span>
            </div>

            <p className="mt-5 text-3xl font-extrabold text-[#172820]">
              {pendingTuitions}
            </p>

            <p className="mt-1 text-xs font-medium text-[#89978e]">
              Awaiting admin approval
            </p>
          </div>

          {/* REJECTED */}

          <div className="rounded-2xl border border-[#e3ebe4] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <AlertTriangle size={22} />
              </div>

              <span className="text-[10px] font-bold uppercase tracking-wider text-red-600">
                Attention
              </span>
            </div>

            <p className="mt-5 text-3xl font-extrabold text-[#172820]">
              {rejectedTuitions}
            </p>

            <p className="mt-1 text-xs font-medium text-[#89978e]">
              Rejected listings
            </p>
          </div>

        </div>

        {/* SEARCH AND FILTER TOOLBAR */}

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
                placeholder="Search by title, subject or location..."
                className="w-full rounded-xl border border-[#e3ebe4] bg-[#fafcf9] py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-[#aab5ad] focus:border-[#087448] focus:ring-4 focus:ring-[#087448]/10"
              />
            </div>

            {/* FILTER AND REFRESH */}

            <div className="flex flex-wrap items-center gap-3">

              <div className="relative flex-1 sm:flex-none">
                <Filter
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c9b91]"
                />

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value)
                  }
                  className="w-full appearance-none rounded-xl border border-[#e3ebe4] bg-white py-3 pl-9 pr-8 text-xs font-bold text-[#53675c] outline-none focus:border-[#087448] sm:min-w-[170px]"
                >
                  <option value="all">All Listings</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending Review</option>
                  <option value="inactive">Inactive</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <button
                type="button"
                onClick={refreshList}
                disabled={refreshing}
                className="flex items-center justify-center gap-2 rounded-xl border border-[#e3ebe4] px-4 py-3 text-xs font-bold text-[#53675c] transition hover:bg-[#f4f8f4] disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
                Refresh
              </button>

            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-[#edf1ed] pt-4">
            <p className="text-xs text-[#89978e]">
              Showing{" "}
              <span className="font-bold text-[#34473b]">
                {filteredTuitions.length}
              </span>{" "}
              of{" "}
              <span className="font-bold text-[#34473b]">
                {totalTuitions}
              </span>{" "}
              tuition listings
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

        {/* TUITION LISTINGS */}

        {filteredTuitions.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">

            {filteredTuitions.map((tuition) => {
              const status = getStatus(tuition);

              const isBusy = busyId === tuition._id;

              const isApproved =
                String(tuition.approvalStatus).toLowerCase() ===
                "approved";

              return (
                <article
                  key={tuition._id}
                  className="group overflow-hidden rounded-[24px] border border-[#e3ebe4] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#075c3b]/5"
                >

                  {/* CARD IMAGE */}

                  <div
                    className="relative flex h-40 items-center justify-center overflow-hidden bg-[#eaf3ec]"
                    style={
                      tuition.bannerImage
                        ? {
                            backgroundImage: `linear-gradient(90deg, rgba(7,47,30,0.50), rgba(7,47,30,0.08)), url("${tuition.bannerImage}")`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : undefined
                    }
                  >
                    {!tuition.bannerImage && (
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/80 text-[#087448] shadow-sm">
                        <GraduationCap size={36} />
                      </div>
                    )}

                    <div className="absolute left-5 top-5">
                      <StatusBadge tuition={tuition} />
                    </div>

                    <div className="absolute bottom-4 right-5 rounded-lg bg-white/95 px-3 py-2 text-sm font-extrabold text-[#075c3b] shadow-sm">
                      {formatCurrency(tuition.monthlyFee)}
                      <span className="ml-1 text-[10px] font-semibold text-[#8b9b90]">
                        / month
                      </span>
                    </div>
                  </div>

                  {/* CARD CONTENT */}

                  <div className="p-6">

                    <div className="mb-4">
                      <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[1.8px] text-[#087448]">
                        {tuition.subject || "General Subject"}
                      </p>

                      <h3 className="text-xl font-extrabold leading-snug text-[#172820] transition group-hover:text-[#075c3b]">
                        {tuition.title}
                      </h3>

                      <p className="mt-2 text-xs font-medium text-[#89978e]">
                        {tuition.classLevel}
                      </p>
                    </div>

                    {/* DETAILS */}

                    <div className="mb-5 grid grid-cols-2 gap-3">

                      <div className="flex items-center gap-2 rounded-xl bg-[#f6f9f6] p-3">
                        <MapPin
                          size={16}
                          className="shrink-0 text-[#087448]"
                        />

                        <span className="truncate text-xs font-semibold text-[#63736d]">
                          {tuition.location}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 rounded-xl bg-[#f6f9f6] p-3">
                        <CalendarDays
                          size={16}
                          className="shrink-0 text-[#087448]"
                        />

                        <span className="text-xs font-semibold text-[#63736d]">
                          {tuition.daysPerWeek} days/week
                        </span>
                      </div>

                      <div className="flex items-center gap-2 rounded-xl bg-[#f6f9f6] p-3">
                        <Monitor
                          size={16}
                          className="shrink-0 text-[#087448]"
                        />

                        <span className="text-xs font-semibold text-[#63736d]">
                          {tuition.mode}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 rounded-xl bg-[#f6f9f6] p-3">
                        <Wallet
                          size={16}
                          className="shrink-0 text-[#087448]"
                        />

                        <span className="truncate text-xs font-semibold text-[#63736d]">
                          {formatCurrency(tuition.monthlyFee)}
                        </span>
                      </div>

                    </div>

                    {/* DESCRIPTION */}

                    <p className="mb-5 line-clamp-2 min-h-10 text-xs leading-6 text-[#849188]">
                      {tuition.description}
                    </p>

                    {/* DATE */}

                    <div className="mb-5 flex items-center justify-between border-t border-[#edf1ed] pt-4">
                      <span className="text-[10px] font-semibold text-[#a0aca3]">
                        Posted {formatDate(tuition.createdAt)}
                      </span>

                      <span className="text-[10px] font-semibold text-[#a0aca3]">
                        ID: {tuition._id.slice(-8)}
                      </span>
                    </div>

                    {/* ACTION BUTTONS */}

                    <div className="grid grid-cols-2 gap-3">

                      {/* EDIT */}

                      <button
                        type="button"
                        onClick={() => openEditModal(tuition)}
                        disabled={isBusy}
                        className="flex items-center justify-center gap-2 rounded-xl border border-[#dfe8e0] py-3 text-xs font-extrabold text-[#53675c] transition hover:border-[#087448] hover:bg-[#f1f7f2] hover:text-[#075c3b] disabled:opacity-50"
                      >
                        <Pencil size={15} />
                        Edit
                      </button>

                      {/* ACTIVATE / DEACTIVATE */}

                      <button
                        type="button"
                        onClick={() => handleToggleStatus(tuition)}
                        disabled={isBusy || !isApproved}
                        title={
                          !isApproved
                            ? "Admin approval is required first"
                            : ""
                        }
                        className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-extrabold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          tuition.isActive
                            ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                            : "bg-[#075c3b] text-white hover:bg-[#087448]"
                        }`}
                      >
                        {isBusy ? (
                          <Loader2
                            size={15}
                            className="animate-spin"
                          />
                        ) : (
                          <Power size={15} />
                        )}

                        {isBusy
                          ? "Please wait"
                          : !isApproved
                            ? status.label
                            : tuition.isActive
                              ? "Deactivate"
                              : "Activate"}
                      </button>

                      {/* DELETE */}

                      <button
                        type="button"
                        onClick={() => setDeleteTarget(tuition)}
                        disabled={isBusy}
                        className="col-span-2 flex items-center justify-center gap-2 rounded-xl border border-red-100 py-3 text-xs font-extrabold text-red-600 transition hover:border-red-200 hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 size={15} />
                        Delete Tuition
                      </button>

                    </div>

                    {/* APPROVAL MESSAGE */}

                    {tuition.approvalStatus === "pending" && (
                      <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3">
                        <Clock3
                          size={16}
                          className="mt-0.5 shrink-0 text-amber-600"
                        />

                        <p className="text-[11px] leading-5 text-amber-800">
                          Your listing is waiting for admin approval.
                          It will become visible to students after approval.
                        </p>
                      </div>
                    )}

                    {tuition.approvalStatus === "rejected" && (
                      <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 p-3">
                        <AlertTriangle
                          size={16}
                          className="mt-0.5 shrink-0 text-red-600"
                        />

                        <p className="text-[11px] leading-5 text-red-700">
                          This listing was rejected. Edit the listing
                          to correct its information and submit it
                          for admin review again.
                        </p>
                      </div>
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
                <BookOpen size={36} />
              )}
            </div>

            <h3 className="text-xl font-extrabold text-[#172820]">
              {search || statusFilter !== "all"
                ? "No matching tuitions found"
                : "You haven't posted any tuition yet"}
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#89978e]">
              {search || statusFilter !== "all"
                ? "Try changing your search or filter to find your tuition listings."
                : "Start connecting with students by creating your first tuition listing."}
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
                onClick={() =>
                  router.push("/dashboard/tutor/post-tuition")
                }
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#075c3b] px-6 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#087448]"
              >
                <Plus size={17} />
                Post Your First Tuition
                <ArrowRight size={16} />
              </button>
            )}

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
      {/* EDIT TUITION MODAL */}
      {/* ====================================== */}

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#10251b]/55 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !savingEdit) {
              setEditing(null);
            }
          }}
        >
          <div className="my-auto w-full max-w-2xl overflow-hidden rounded-[26px] bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-[#edf1ed] px-6 py-5 md:px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e9f3ec] text-[#087448]">
                  <Pencil size={21} />
                </div>

                <div>
                  <h3 className="text-lg font-extrabold text-[#172820]">
                    Edit Tuition
                  </h3>

                  <p className="mt-1 text-xs text-[#89978e]">
                    Update your tuition information.
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={savingEdit}
                onClick={() => setEditing(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-[#89978e] transition hover:bg-[#f1f5f1] hover:text-[#075c3b] disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* EDIT FORM */}

            <form
              onSubmit={handleSaveEdit}
              className="max-h-[75vh] space-y-5 overflow-y-auto p-6 md:p-8"
            >

              {/* REAPPROVAL NOTICE */}

              <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <ShieldCheck
                  size={20}
                  className="mt-0.5 shrink-0 text-amber-700"
                />

                <p className="text-xs leading-6 text-amber-800">
                  Important: Updating a tuition will send it back
                  to the admin approval process. It will become
                  inactive until the updated listing is approved.
                </p>
              </div>

              {/* TITLE */}

              <div>
                <label htmlFor="edit-title" className={labelClass}>
                  Tuition Title *
                </label>

                <input
                  id="edit-title"
                  name="title"
                  value={editForm.title}
                  onChange={handleEditChange}
                  maxLength={120}
                  required
                  className={inputClass}
                />
              </div>

              {/* SUBJECT AND CLASS */}

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="edit-subject" className={labelClass}>
                    Subject *
                  </label>

                  <input
                    id="edit-subject"
                    name="subject"
                    value={editForm.subject}
                    onChange={handleEditChange}
                    maxLength={80}
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="edit-class" className={labelClass}>
                    Class Level *
                  </label>

                  <input
                    id="edit-class"
                    name="classLevel"
                    value={editForm.classLevel}
                    onChange={handleEditChange}
                    maxLength={80}
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              {/* FEE AND DAYS */}

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="edit-fee" className={labelClass}>
                    Monthly Fee (BDT) *
                  </label>

                  <input
                    id="edit-fee"
                    name="monthlyFee"
                    type="number"
                    min="1"
                    step="1"
                    value={editForm.monthlyFee}
                    onChange={handleEditChange}
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="edit-days" className={labelClass}>
                    Days Per Week *
                  </label>

                  <select
                    id="edit-days"
                    name="daysPerWeek"
                    value={editForm.daysPerWeek}
                    onChange={handleEditChange}
                    required
                    className={inputClass}
                  >
                    <option value="">Select days</option>

                    {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                      <option key={day} value={day}>
                        {day} {day === 1 ? "Day" : "Days"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* MODE */}

              <div>
                <label htmlFor="edit-mode" className={labelClass}>
                  Tuition Mode *
                </label>

                <select
                  id="edit-mode"
                  name="mode"
                  value={editForm.mode}
                  onChange={handleEditChange}
                  required
                  className={inputClass}
                >
                  <option value="">Select mode</option>
                  <option value="Offline">Offline</option>
                  <option value="Online">Online</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              {/* LOCATION */}

              <div>
                <label htmlFor="edit-location" className={labelClass}>
                  Location *
                </label>

                <input
                  id="edit-location"
                  name="location"
                  value={editForm.location}
                  onChange={handleEditChange}
                  maxLength={150}
                  required
                  className={inputClass}
                />
              </div>

              {/* DESCRIPTION */}

              <div>
                <label htmlFor="edit-description" className={labelClass}>
                  Description *
                </label>

                <textarea
                  id="edit-description"
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  maxLength={3000}
                  rows={5}
                  required
                  className={`${inputClass} resize-y leading-6`}
                />

                <p className="mt-1 text-right text-[10px] text-[#9aa79e]">
                  {editForm.description.length}/3000
                </p>
              </div>

              {/* IMAGE */}

              <div>
                <label
                  htmlFor="edit-banner"
                  className={labelClass}
                >
                  <span className="inline-flex items-center gap-2">
                    <ImagePlus size={16} className="text-[#087448]" />
                    Banner Image URL (Optional)
                  </span>
                </label>

                <input
                  id="edit-banner"
                  name="bannerImage"
                  type="url"
                  value={editForm.bannerImage}
                  onChange={handleEditChange}
                  maxLength={2000}
                  placeholder="https://example.com/image.jpg"
                  className={inputClass}
                />
              </div>

              {/* MODAL ACTIONS */}

              <div className="flex flex-col-reverse gap-3 border-t border-[#edf1ed] pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={savingEdit}
                  onClick={() => setEditing(null)}
                  className="rounded-xl border border-[#dfe8e0] px-6 py-3 text-sm font-bold text-[#62746a] transition hover:bg-[#f5f8f5]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#075c3b] px-6 py-3 text-sm font-extrabold text-white transition hover:bg-[#087448] disabled:opacity-50"
                >
                  {savingEdit ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={17} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ====================================== */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ====================================== */}

      {deleteTarget && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#10251b]/55 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget &&
              busyId !== deleteTarget._id
            ) {
              setDeleteTarget(null);
            }
          }}
        >
          <div className="w-full max-w-md rounded-[26px] bg-white p-7 shadow-2xl">

            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Trash2 size={27} />
            </div>

            <h3 className="text-center text-xl font-extrabold text-[#172820]">
              Delete Tuition?
            </h3>

            <p className="mt-3 text-center text-sm leading-7 text-[#849188]">
              Are you sure you want to delete{" "}
              <span className="font-bold text-[#34473b]">
                {deleteTarget.title}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-7 flex gap-3">
              <button
                type="button"
                disabled={busyId === deleteTarget._id}
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-xl border border-[#dfe8e0] py-3.5 text-sm font-bold text-[#62746a] transition hover:bg-[#f5f8f5]"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={busyId === deleteTarget._id}
                onClick={handleDelete}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-3.5 text-sm font-extrabold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {busyId === deleteTarget._id ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete
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
