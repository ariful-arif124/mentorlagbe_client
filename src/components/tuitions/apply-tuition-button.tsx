
"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";

import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Loader2,
  Phone,
  ShieldCheck,
  X,
} from "lucide-react";

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

interface ApplicationResponse {
  success?: boolean;
  message?: string;
}

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
)
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/api$/i, "");

const APPLICATIONS_URL = `${API_BASE_URL}/api/applications`;

function getStoredAuth() {
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

    return {
      token,
      user,
    };
  } catch {
    return null;
  }
}

export default function ApplyTuitionButton({ tuitionId }: Props) {
  const router = useRouter();

  const phoneInputRef = useRef<HTMLInputElement>(null);
  const isSubmittingRef = useRef(false);

  const [authChecked, setAuthChecked] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApplied, setIsApplied] = useState(false);

  const [phone, setPhone] = useState("");
  const [preferredSchedule, setPreferredSchedule] = useState("");
  const [studentNote, setStudentNote] = useState("");

  // ==========================================
  // AUTHENTICATION
  // ==========================================

  useEffect(() => {
    const auth = getStoredAuth();

    if (auth) {
      setToken(auth.token);
      setRole(auth.user.role.toLowerCase());
    }

    setAuthChecked(true);
  }, []);

  // ==========================================
  // KEEP SUBMISSION STATE UPDATED
  // ==========================================

  useEffect(() => {
    isSubmittingRef.current = isSubmitting;
  }, [isSubmitting]);

  // ==========================================
  // MODAL CONTROLS
  // ==========================================

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "Escape" &&
        !isSubmittingRef.current
      ) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    phoneInputRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // ==========================================
  // APPLY BUTTON
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
      toast.error(
        "Only student accounts can apply for tuition."
      );

      return;
    }

    setIsOpen(true);
  };

  // ==========================================
  // SUBMIT APPLICATION
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
        "Phone number and preferred schedule are required."
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
      const response = await fetch(APPLICATIONS_URL, {
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
      });

      const result: ApplicationResponse = await response
        .json()
        .catch(() => ({}));

      // EXPIRED SESSION

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

      // DUPLICATE APPLICATION

      if (response.status === 409) {
        toast.error(
          result.message ||
            "You have already applied for this tuition."
        );

        setIsApplied(true);
        setIsOpen(false);

        return;
      }

      // OTHER ERRORS

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to submit your application."
        );
      }

      // SUCCESS

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
  // APPLICATION MODAL
  // ==========================================

  const applicationModal = isOpen ? (
    <div
      className="
        fixed inset-0 z-[99999]
        flex items-center justify-center
        overflow-y-auto
        bg-[#07130E]/70
        p-3 backdrop-blur-[6px]
        sm:p-6
      "
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !isSubmitting
        ) {
          setIsOpen(false);
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="application-title"
        aria-describedby="application-description"
        className="
          relative flex
          max-h-[92dvh]
          w-full max-w-[560px]
          flex-col overflow-hidden
          rounded-[26px]
          border border-[#E9EDE8]
          bg-white
          shadow-[0_30px_100px_rgba(0,0,0,0.30)]
          dark:border-[#30443A]
          dark:bg-[#111B16]
        "
      >
        {/* ================================= */}
        {/* MODAL HEADER */}
        {/* ================================= */}

        <div
          className="
            flex shrink-0 items-start justify-between
            border-b border-[#EDF0EB]
            px-6 py-6
            sm:px-8 sm:py-7
            dark:border-[#293A30]
          "
        >
          <div>
            <div className="mb-3 flex items-center gap-2">

              <span className="h-2 w-2 rounded-full bg-[#0F6844]" />

              <p className="
                text-[11px] font-bold uppercase
                tracking-[0.18em]
                text-[#0F6844]
                dark:text-[#34D399]
              ">
                Tuition Application
              </p>

            </div>

            <h2
              id="application-title"
              className="
                text-[26px] font-extrabold
                tracking-tight text-[#14201B]
                sm:text-[30px]
                dark:text-white
              "
            >
              Apply for Tuition
            </h2>

            <p
              id="application-description"
              className="
                mt-2 max-w-[380px]
                text-sm leading-6
                text-[#718078]
                dark:text-[#A2B1A9]
              "
            >
              Complete the information below to connect
              with your preferred tutor.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
            aria-label="Close application form"
            className="
              flex h-10 w-10 shrink-0
              items-center justify-center
              rounded-full
              border border-[#E9EDE8]
              text-[#68766E]
              transition
              hover:border-[#B8D7C6]
              hover:bg-[#EDF6F0]
              hover:text-[#075C3B]
              disabled:opacity-40
              dark:border-[#30443A]
              dark:text-white
              dark:hover:bg-[#1C2B25]
            "
          >
            <X size={20} />
          </button>
        </div>

        {/* ================================= */}
        {/* FORM BODY */}
        {/* ================================= */}

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div
            className="
              min-h-0 flex-1 space-y-6
              overflow-y-auto
              px-6 py-6
              sm:px-8 sm:py-7
            "
          >

            {/* PHONE NUMBER */}

            <div>
              <label
                htmlFor="studentPhone"
                className="
                  mb-2.5 block
                  text-sm font-bold
                  text-[#24352C]
                  dark:text-white
                "
              >
                Phone Number
                <span className="ml-1 text-red-500">*</span>
              </label>

              <div className="relative">

                <Phone
                  size={19}
                  className="
                    pointer-events-none absolute
                    left-4 top-1/2 -translate-y-1/2
                    text-[#89988F]
                  "
                />

                <input
                  ref={phoneInputRef}
                  id="studentPhone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  minLength={7}
                  maxLength={20}
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  placeholder="Enter your contact number"
                  className="
                    h-[58px] w-full
                    rounded-2xl
                    border border-[#E7E8DF]
                    bg-[#FAF9F5]
                    pl-12 pr-4
                    text-[15px] text-[#14201B]
                    outline-none
                    transition-all duration-200
                    placeholder:text-[#A1A59D]
                    focus:border-[#0F6844]
                    focus:bg-white
                    focus:ring-4
                    focus:ring-[#0F6844]/10
                    dark:border-[#30443A]
                    dark:bg-[#0B1210]
                    dark:text-white
                    dark:focus:bg-[#131C19]
                  "
                />

              </div>
            </div>

            {/* PREFERRED SCHEDULE */}

            <div>
              <label
                htmlFor="preferredSchedule"
                className="
                  mb-2.5 block
                  text-sm font-bold
                  text-[#24352C]
                  dark:text-white
                "
              >
                Preferred Schedule
                <span className="ml-1 text-red-500">*</span>
              </label>

              <div className="relative">

                <CalendarDays
                  size={19}
                  className="
                    pointer-events-none absolute
                    left-4 top-1/2 -translate-y-1/2
                    text-[#89988F]
                  "
                />

                <input
                  id="preferredSchedule"
                  type="text"
                  required
                  maxLength={200}
                  value={preferredSchedule}
                  onChange={(event) =>
                    setPreferredSchedule(event.target.value)
                  }
                  placeholder="e.g. Sunday, Tuesday - 6 PM"
                  className="
                    h-[58px] w-full
                    rounded-2xl
                    border border-[#E7E8DF]
                    bg-[#FAF9F5]
                    pl-12 pr-4
                    text-[15px] text-[#14201B]
                    outline-none
                    transition-all duration-200
                    placeholder:text-[#A1A59D]
                    focus:border-[#0F6844]
                    focus:bg-white
                    focus:ring-4
                    focus:ring-[#0F6844]/10
                    dark:border-[#30443A]
                    dark:bg-[#0B1210]
                    dark:text-white
                    dark:focus:bg-[#131C19]
                  "
                />

              </div>

              <p className="mt-2 text-xs text-[#8A9891]">
                Mention your preferred days and available time.
              </p>
            </div>

            {/* LEARNING NOTE */}

            <div>
              <div className="mb-2.5 flex items-center justify-between">

                <label
                  htmlFor="studentNote"
                  className="
                    text-sm font-bold
                    text-[#24352C]
                    dark:text-white
                  "
                >
                  Learning Note
                  <span className="
                    ml-2 font-normal
                    text-[#98A49D]
                  ">
                    Optional
                  </span>
                </label>

              </div>

              <div className="relative">

                <BookOpen
                  size={19}
                  className="
                    pointer-events-none absolute
                    left-4 top-4
                    text-[#89988F]
                  "
                />

                <textarea
                  id="studentNote"
                  rows={4}
                  maxLength={1000}
                  value={studentNote}
                  onChange={(event) =>
                    setStudentNote(event.target.value)
                  }
                  placeholder="Tell the tutor about your learning goals, current difficulties or expectations..."
                  className="
                    min-h-[130px] w-full
                    resize-none rounded-2xl
                    border border-[#E7E8DF]
                    bg-[#FAF9F5]
                    py-4 pl-12 pr-4
                    text-[15px] leading-6
                    text-[#14201B]
                    outline-none
                    transition-all duration-200
                    placeholder:text-[#A1A59D]
                    focus:border-[#0F6844]
                    focus:bg-white
                    focus:ring-4
                    focus:ring-[#0F6844]/10
                    dark:border-[#30443A]
                    dark:bg-[#0B1210]
                    dark:text-white
                    dark:focus:bg-[#131C19]
                  "
                />

              </div>

              <p className="
                mt-2 text-right
                text-xs font-medium
                tabular-nums text-[#98A49D]
              ">
                {studentNote.length}/1000
              </p>
            </div>

            {/* PRIVACY NOTICE */}

            <div className="
              flex items-start gap-3
              rounded-2xl
              border border-[#E3EEE6]
              bg-[#F1F7F2]
              p-4
              dark:border-[#30443A]
              dark:bg-[#192820]
            ">

              <ShieldCheck
                size={21}
                className="
                  mt-0.5 shrink-0
                  text-[#0F6844]
                  dark:text-[#34D399]
                "
              />

              <div>
                <p className="
                  text-sm font-bold
                  text-[#214832]
                  dark:text-[#D1FAE5]
                ">
                  Your information is secure
                </p>

                <p className="
                  mt-1 text-xs leading-5
                  text-[#718078]
                  dark:text-[#A2B1A9]
                ">
                  Your contact information and learning
                  preferences will be shared with the
                  relevant tutor for this application.
                </p>
              </div>

            </div>

          </div>

          {/* ================================= */}
          {/* FIXED MODAL FOOTER */}
          {/* ================================= */}

          <div className="
            grid shrink-0
            grid-cols-1 gap-3
            border-t border-[#EDF0EB]
            bg-white px-6 py-5
            sm:grid-cols-[0.8fr_1.2fr]
            sm:px-8
            dark:border-[#293A30]
            dark:bg-[#111B16]
          ">

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
              className="
                flex min-h-[54px]
                items-center justify-center
                rounded-2xl
                border border-[#E2E6E0]
                bg-white px-5
                font-bold text-[#52635A]
                transition-all
                hover:border-[#B8D7C6]
                hover:bg-[#F3F7F3]
                disabled:opacity-50
                dark:border-[#30443A]
                dark:bg-[#131C19]
                dark:text-white
                dark:hover:bg-[#1C2B25]
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="
                flex min-h-[54px]
                items-center justify-center gap-2
                rounded-2xl
                bg-[#0F5132]
                px-5
                font-bold text-white
                shadow-[0_5px_15px_rgba(15,81,50,0.18)]
                transition-all duration-200
                hover:-translate-y-0.5
                hover:bg-[#0B3F27]
                hover:shadow-lg
                disabled:cursor-not-allowed
                disabled:opacity-60
                disabled:hover:translate-y-0
                dark:bg-[#167A50]
                dark:hover:bg-[#0F6844]
              "
            >
              {isSubmitting ? (
                <>
                  <Loader2
                    size={19}
                    className="animate-spin"
                  />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Application
                  <ArrowRight size={19} />
                </>
              )}
            </button>

          </div>
        </form>

      </div>
    </div>
  ) : null;

  // ==========================================
  // MAIN BUTTON
  // ==========================================

  return (
    <>
      <button
        type="button"
        onClick={handleApply}
        disabled={
          !authChecked ||
          isApplied ||
          (role !== null && role !== "student")
        }
        className="
          flex w-full items-center justify-center gap-2
          rounded-xl bg-[#0F5132]
          px-6 py-4
          font-bold text-white
          shadow-md
          transition-all duration-200
          hover:-translate-y-0.5
          hover:bg-[#0B3F27]
          hover:shadow-lg
          disabled:cursor-not-allowed
          disabled:opacity-60
          dark:bg-[#34D399]
          dark:text-[#0B1210]
          dark:hover:bg-[#6EE7B7]
        "
      >
        {!authChecked ? (
          <>
            <Loader2 size={19} className="animate-spin" />
            Checking Account...
          </>
        ) : isApplied ? (
          <>
            <CheckCircle2 size={19} />
            Application Submitted
          </>
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

      {authChecked && role && role !== "student" && (
        <p className="mt-3 text-center text-xs text-[#B45309]">
          Only student accounts are allowed to apply.
        </p>
      )}

      {/* PORTAL: RENDERS MODAL DIRECTLY UNDER BODY */}

      {typeof document !== "undefined" &&
        applicationModal &&
        createPortal(applicationModal, document.body)}
    </>
  );
}
