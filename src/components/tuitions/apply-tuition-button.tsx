
"use client";

import {
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";

import { useRouter } from "next/navigation";

import { ArrowRight, Loader2, X } from "lucide-react";

import { toast } from "sonner";

interface Props {
  tuitionId: string;
}

interface StoredUser {
  userId?: string;
  name?: string;
  email?: string;
  role: string;
}

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
)
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/api$/i, "");

const AUTH_LOADING = "__auth_loading__";
const AUTH_SIGNED_OUT = "__auth_signed_out__";

// ==========================================
// GET AUTHENTICATION FROM LOCAL STORAGE
// ==========================================

function getStoredAuth(): {
  token: string;
  user: StoredUser;
} | null {
  try {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("mentorlagbe_token");

    const storedUser =
      localStorage.getItem("user") ||
      localStorage.getItem("mentorlagbe_user");

    if (!token || !storedUser) return null;

    const user: StoredUser = JSON.parse(storedUser);

    if (!user.role) return null;

    return { token, user };
  } catch {
    return null;
  }
}

// ==========================================
// AUTHENTICATION STORE SUBSCRIPTION
// ==========================================

function subscribeToAuth(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", onStoreChange);

  window.addEventListener(
    "mentorlagbe-auth-change",
    onStoreChange
  );

  return () => {
    window.removeEventListener("storage", onStoreChange);

    window.removeEventListener(
      "mentorlagbe-auth-change",
      onStoreChange
    );
  };
}

function getAuthSnapshot() {
  if (typeof window === "undefined") {
    return AUTH_LOADING;
  }

  const auth = getStoredAuth();

  if (!auth) return AUTH_SIGNED_OUT;

  return JSON.stringify({
    token: auth.token,
    role: auth.user.role.toLowerCase(),
  });
}

function getServerAuthSnapshot() {
  return AUTH_LOADING;
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function ApplyTuitionButton({ tuitionId }: Props) {
  const router = useRouter();

  // ==========================================
  // AUTHENTICATION STATE
  // ==========================================

  const authSnapshot = useSyncExternalStore(
    subscribeToAuth,
    getAuthSnapshot,
    getServerAuthSnapshot
  );

  const auth =
    authSnapshot.startsWith("{")
      ? (JSON.parse(authSnapshot) as {
          token: string;
          role: string;
        })
      : null;

  const token = auth?.token ?? null;
  const role = auth?.role ?? null;

  const authChecked = authSnapshot !== AUTH_LOADING;

  // ==========================================
  // APPLICATION STATE
  // ==========================================

  const [isOpen, setIsOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isApplied, setIsApplied] = useState(false);

  // ==========================================
  // FORM STATE
  // ==========================================

  const [phone, setPhone] = useState("");

  const [preferredSchedule, setPreferredSchedule] = useState("");

  const [studentNote, setStudentNote] = useState("");

  // ==========================================
  // HANDLE APPLY BUTTON
  // ==========================================

  const handleApply = () => {
    if (!token || !role) {
      const redirectUrl = `/tuitions/${tuitionId}`;

      router.push(
        `/sign-in?redirect=${encodeURIComponent(redirectUrl)}`
      );

      return;
    }

    if (role !== "student") {
      toast.error("Only student accounts can apply for tuition.");
      return;
    }

    setIsOpen(true);
  };

  // ==========================================
  // HANDLE APPLICATION SUBMISSION
  // ==========================================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!token || role !== "student") {
      toast.error("Please sign in with a student account.");
      return;
    }

    const normalizedPhone = phone.trim();

    const normalizedSchedule = preferredSchedule.trim();

    const normalizedNote = studentNote.trim();

    if (!normalizedPhone || !normalizedSchedule) {
      toast.error(
        "Phone and preferred schedule are required."
      );
      return;
    }

    const phoneDigits = normalizedPhone.replace(/\D/g, "");

    if (phoneDigits.length < 7 || phoneDigits.length > 15) {
      toast.error("Please provide a valid phone number.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${API_URL}/api/applications`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            tuitionId,
            studentPhone: normalizedPhone,
            preferredSchedule: normalizedSchedule,
            studentNote: normalizedNote,
          }),
        }
      );

      const result = await response.json();

      // ==========================================
      // SESSION EXPIRED
      // ==========================================

      if (response.status === 401) {
        toast.error(
          "Your session has expired. Please sign in again."
        );

        setIsOpen(false);

        router.push(
          `/sign-in?redirect=${encodeURIComponent(
            `/tuitions/${tuitionId}`
          )}`
        );

        return;
      }

      // ==========================================
      // DUPLICATE APPLICATION
      // ==========================================

      if (response.status === 409) {
        toast.error(
          result.message ||
            "You have already applied for this tuition."
        );

        setIsApplied(true);

        setIsOpen(false);

        return;
      }

      // ==========================================
      // HANDLE OTHER ERRORS
      // ==========================================

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to submit your application."
        );
      }

      // ==========================================
      // APPLICATION SUCCESS
      // ==========================================

      toast.success(
        "Your tuition application was submitted successfully!"
      );

      setIsApplied(true);

      setIsOpen(false);

      setPhone("");

      setPreferredSchedule("");

      setStudentNote("");

    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );

    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // COMPONENT UI
  // ==========================================

  return (
    <>
      {/* APPLY BUTTON */}

      <button
        type="button"
        onClick={handleApply}
        disabled={
          !authChecked ||
          isApplied ||
          (role !== null && role !== "student")
        }
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F5132] px-6 py-4 font-bold text-white shadow-md transition hover:bg-[#0B3F27] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#34D399] dark:text-[#0B1210] dark:hover:bg-[#6EE7B7]"
      >
        {!authChecked ? (
          <>
            <Loader2 size={19} className="animate-spin" />
            Checking Account...
          </>
        ) : isApplied ? (
          "Application Submitted"
        ) : role && role !== "student" ? (
          "Students Only"
        ) : (
          <>
            {role === "student"
              ? "Apply for Tuition"
              : "Sign In to Apply"}

            <ArrowRight size={19} />
          </>
        )}
      </button>

      {/* ROLE RESTRICTION MESSAGE */}

      {authChecked && role && role !== "student" && (
        <p className="mt-3 text-center text-xs text-[#B45309]">
          Only student accounts are allowed to apply.
        </p>
      )}

      {/* APPLICATION MODAL */}

      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => !isSubmitting && setIsOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="application-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#E5E1D8] bg-white p-6 shadow-2xl dark:border-[#2A3A32] dark:bg-[#131C19] md:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            {/* MODAL HEADER */}

            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-[#0F5132] dark:text-[#34D399]">
                  Tuition Application
                </p>

                <h2
                  id="application-title"
                  className="mt-2 text-2xl font-bold text-[#14201B] dark:text-white"
                >
                  Apply for Tuition
                </h2>

                <p className="mt-2 text-sm text-[#5B6B64] dark:text-[#A2B1A9]">
                  Provide your details to apply for this opportunity.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
                aria-label="Close application form"
                className="rounded-full p-2 text-[#5B6B64] transition hover:bg-[#EAF1EC] dark:text-white dark:hover:bg-[#1C2B25]"
              >
                <X size={22} />
              </button>
            </div>

            {/* APPLICATION FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* PHONE NUMBER */}

              <div>
                <label
                  htmlFor="studentPhone"
                  className="mb-2 block text-sm font-semibold text-[#14201B] dark:text-white"
                >
                  Phone Number *
                </label>

                <input
                  id="studentPhone"
                  type="tel"
                  required
                  minLength={7}
                  maxLength={20}
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  placeholder="Enter your contact number"
                  className="w-full rounded-xl border border-[#E5E1D8] bg-[#FBF8F3] px-4 py-3 text-[#14201B] outline-none transition focus:border-[#0F5132] focus:ring-2 focus:ring-[#0F5132]/10 dark:border-[#2A3A32] dark:bg-[#0B1210] dark:text-white"
                />
              </div>

              {/* PREFERRED SCHEDULE */}

              <div>
                <label
                  htmlFor="preferredSchedule"
                  className="mb-2 block text-sm font-semibold text-[#14201B] dark:text-white"
                >
                  Preferred Schedule *
                </label>

                <input
                  id="preferredSchedule"
                  type="text"
                  required
                  maxLength={200}
                  value={preferredSchedule}
                  onChange={(event) =>
                    setPreferredSchedule(event.target.value)
                  }
                  placeholder="e.g. Sunday, Tuesday, Thursday - 6 PM"
                  className="w-full rounded-xl border border-[#E5E1D8] bg-[#FBF8F3] px-4 py-3 text-[#14201B] outline-none transition focus:border-[#0F5132] focus:ring-2 focus:ring-[#0F5132]/10 dark:border-[#2A3A32] dark:bg-[#0B1210] dark:text-white"
                />
              </div>

              {/* LEARNING NOTE */}

              <div>
                <label
                  htmlFor="studentNote"
                  className="mb-2 block text-sm font-semibold text-[#14201B] dark:text-white"
                >
                  Learning Note

                  <span className="ml-1 font-normal text-[#8A9891]">
                    (Optional)
                  </span>
                </label>

                <textarea
                  id="studentNote"
                  rows={4}
                  maxLength={1000}
                  value={studentNote}
                  onChange={(event) =>
                    setStudentNote(event.target.value)
                  }
                  placeholder="Tell the tutor about your learning goals..."
                  className="w-full resize-none rounded-xl border border-[#E5E1D8] bg-[#FBF8F3] px-4 py-3 text-[#14201B] outline-none transition focus:border-[#0F5132] focus:ring-2 focus:ring-[#0F5132]/10 dark:border-[#2A3A32] dark:bg-[#0B1210] dark:text-white"
                />

                <p className="mt-1 text-right text-xs text-[#8A9891]">
                  {studentNote.length}/1000
                </p>
              </div>

              {/* FORM ACTIONS */}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl border border-[#E5E1D8] px-5 py-3 font-semibold text-[#5B6B64] transition hover:bg-[#F5F3EE] dark:border-[#2A3A32] dark:text-white dark:hover:bg-[#1C2B25]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0F5132] px-5 py-3 font-semibold text-white transition hover:bg-[#0B3F27] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#34D399] dark:text-[#0B1210]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />

                      Submitting...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
