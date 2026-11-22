
"use client";
import {
  useEffect,
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
  ShieldCheck,
  Sparkles,
  Loader2,
  ImagePlus,
  CheckCircle2,
  Clock3,
  Plus,
  Monitor,
} from "lucide-react";

const BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const API_URL = BASE_URL.endsWith("/api")
  ? BASE_URL
  : `${BASE_URL}/api`;

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

export default function PostTuitionPage() {
  const router = useRouter();
  const [form, setForm] = useState<TuitionForm>(initialForm);
  const [token, setToken] = useState("");
  const [userName, setUserName] = useState("Tutor");
  const [plan, setPlan] = useState("free");
  const [totalTuitions, setTotalTuitions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadPage = async () => {
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
        setUserName(parsedUser.name || "Tutor");
        const response = await fetch(
          `${API_URL}/tutor/stats`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
            cache: "no-store",
          }
        );
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("mentorlagbe_token");
          localStorage.removeItem("mentorlagbe_user");
          router.replace("/sign-in");
          return;
        }
        const result = await response.json();
        if (response.ok && result.success && !cancelled) {
          setPlan(
            String(result.data?.plan || "free").toLowerCase()
          );
          setTotalTuitions(
            Number(result.data?.totalTuitions) || 0
          );
        }
      } catch (error) {
        console.error("Tutor page loading error:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    void loadPage();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleChange = (
    e: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (!token) {
      toast.error("Session expired", {
        description: "Please sign in again.",
      });
      return;
    }
    if (!canPost) {
      toast.warning("Free plan limit reached", {
        description:
          "Upgrade to Pro to post unlimited tuitions.",
        action: {
          label: "Upgrade",
          onClick: () => router.push("/?role=tutor#pricing"),
        },
      });
      return;
    }
    if (
      !form.title.trim() ||
      !form.subject.trim() ||
      !form.classLevel.trim() ||
      !form.monthlyFee ||
      !form.daysPerWeek ||
      !form.mode ||
      !form.location.trim() ||
      !form.description.trim()
    ) {
      toast.error("Incomplete information", {
        description: "Please complete all required fields.",
      });
      return;
    }
    const monthlyFee = Number(form.monthlyFee);
    const daysPerWeek = Number(form.daysPerWeek);
    if (
      !Number.isFinite(monthlyFee) ||
      monthlyFee <= 0
    ) {
      toast.error("Invalid monthly fee", {
        description: "Please enter a valid tuition fee.",
      });
      return;
    }
    if (
      !Number.isInteger(daysPerWeek) ||
      daysPerWeek < 1 ||
      daysPerWeek > 7
    ) {
      toast.error("Invalid schedule", {
        description:
          "Days per week must be between 1 and 7.",
      });
      return;
    }
    if (form.bannerImage.trim()) {
      try {
        const imageUrl = new URL(form.bannerImage.trim());
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
    setSubmitting(true);
    const toastId = toast.loading(
      "Submitting your tuition..."
    );
    try {
      const response = await fetch(
        `${API_URL}/tutor/tuitions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            title: form.title.trim(),
            subject: form.subject.trim(),
            classLevel: form.classLevel.trim(),
            monthlyFee,
            daysPerWeek,
            location: form.location.trim(),
            description: form.description.trim(),
            bannerImage: form.bannerImage.trim(),
          }),
        }
      );
      const result = await response.json();
      if (response.status === 401) {
        toast.dismiss(toastId);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("mentorlagbe_token");
        localStorage.removeItem("mentorlagbe_user");
        toast.error("Session expired", {
          description: "Please sign in again.",
        });
        router.replace("/sign-in");
        return;
      }
      if (!response.ok || !result.success) {
        toast.dismiss(toastId);
        if (result.code === "TUITION_LIMIT_REACHED") {
          toast.warning("Posting limit reached", {
            description:
              "Upgrade to Pro for unlimited tuition posts.",
            action: {
              label: "Upgrade",
              onClick: () => router.push("/?role=tutor#pricing"),
            },
            duration: 6000,
          });
        } else {
          toast.error("Submission failed", {
            description:
              result.message ||
              "Unable to submit your tuition.",
          });
        }
        return;
      }
      toast.success("Tuition submitted successfully!", {
        id: toastId,
        description:
          "Your listing is now waiting for admin approval.",
        duration: 5000,
      });
      setTotalTuitions((previous) => previous + 1);
      setForm(initialForm);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("Tuition submission error:", error);
      toast.error("Something went wrong", {
        id: toastId,
        description:
          "Unable to connect to the server. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isPro = plan === "pro";
  const freeLimit = 2;
  const remainingPosts = Math.max(
    freeLimit - totalTuitions,
    0
  );
  const canPost = isPro || remainingPosts > 0;

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
            Preparing your workspace...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f8f5]">
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
      <div className="mx-auto max-w-7xl px-5 py-9 md:px-8 md:py-12">
        <div className="mb-9">
          <div className="mb-3 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[2.5px] text-[#087448]">
            <Plus size={15} />
            Tutor Workspace
            <span className="text-[#b1bdb4]">/</span>
            Create Listing
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#172820] md:text-4xl">
            Post a New Tuition
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#839188] md:text-base">
            Welcome, {userName}. Create a tuition listing and
            connect with students looking for your teaching
            expertise.
          </p>
        </div>
        <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_330px]">
          <section className="overflow-hidden rounded-[26px] border border-[#e3ebe4] bg-white shadow-sm">
            <div className="border-b border-[#edf1ed] px-6 py-6 md:px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e9f3ec] text-[#087448]">
                  <BookOpen size={23} />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-[#172820]">
                    Tuition Information
                  </h3>
                  <p className="mt-1 text-xs text-[#96a39a]">
                    Fill in the details of your tuition opportunity.
                  </p>
                </div>
              </div>
            </div>
            <form
              onSubmit={handleSubmit}
              className="p-6 md:p-8"
            >
              <div className="mb-7">
                <h4 className="mb-5 text-xs font-extrabold uppercase tracking-[1.8px] text-[#087448]">
                  Basic Information
                </h4>
                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="title"
                      className="mb-2 block text-sm font-bold text-[#34473b]"
                    >
                      Tuition Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      value={form.title}
                      onChange={handleChange}
                      maxLength={120}
                      required
                      placeholder="e.g. HSC Mathematics Private Tuition"
                      className="w-full rounded-xl border border-[#dfe8e0] bg-[#fcfdfc] px-4 py-3.5 text-sm text-[#26372d] outline-none transition placeholder:text-[#b2bdb5] focus:border-[#087448] focus:ring-4 focus:ring-[#087448]/10"
                    />
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="subject"
                        className="mb-2 block text-sm font-bold text-[#34473b]"
                      >
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="subject"
                        name="subject"
                        type="text"
                        value={form.subject}
                        onChange={handleChange}
                        maxLength={80}
                        required
                        placeholder="e.g. Mathematics"
                        className="w-full rounded-xl border border-[#dfe8e0] bg-[#fcfdfc] px-4 py-3.5 text-sm outline-none transition placeholder:text-[#b2bdb5] focus:border-[#087448] focus:ring-4 focus:ring-[#087448]/10"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="classLevel"
                        className="mb-2 block text-sm font-bold text-[#34473b]"
                      >
                        Class Level <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="classLevel"
                        name="classLevel"
                        type="text"
                        value={form.classLevel}
                        onChange={handleChange}
                        maxLength={80}
                        required
                        placeholder="e.g. Class 11-12"
                        className="w-full rounded-xl border border-[#dfe8e0] bg-[#fcfdfc] px-4 py-3.5 text-sm outline-none transition placeholder:text-[#b2bdb5] focus:border-[#087448] focus:ring-4 focus:ring-[#087448]/10"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mb-7 border-t border-[#edf1ed]" />
              <div className="mb-7">
                <h4 className="mb-5 text-xs font-extrabold uppercase tracking-[1.8px] text-[#087448]">
                  Schedule & Payment
                </h4>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="monthlyFee"
                      className="mb-2 block text-sm font-bold text-[#34473b]"
                    >
                      Monthly Fee (BDT) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#8c9b91]">
                        ৳
                      </span>
                      <input
                        id="monthlyFee"
                        name="monthlyFee"
                        type="number"
                        min="1"
                        step="1"
                        value={form.monthlyFee}
                        onChange={handleChange}
                        required
                        placeholder="4000"
                        className="w-full rounded-xl border border-[#dfe8e0] bg-[#fcfdfc] py-3.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-[#b2bdb5] focus:border-[#087448] focus:ring-4 focus:ring-[#087448]/10"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="daysPerWeek"
                      className="mb-2 block text-sm font-bold text-[#34473b]"
                    >
                      Days Per Week <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="daysPerWeek"
                      name="daysPerWeek"
                      value={form.daysPerWeek}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-[#dfe8e0] bg-[#fcfdfc] px-4 py-3.5 text-sm outline-none transition focus:border-[#087448] focus:ring-4 focus:ring-[#087448]/10"
                    >
                      <option value="">Select days</option>
                      {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                        <option key={day} value={day}>
                          {day} {day === 1 ? "Day" : "Days"} per week
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="mode"
                      className="mb-2 block text-sm font-bold text-[#34473b]"
                    >
                      Tuition Mode <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="mode"
                      name="mode"
                      value={form.mode}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-[#dfe8e0] bg-[#fcfdfc] px-4 py-3.5 text-sm outline-none transition focus:border-[#087448] focus:ring-4 focus:ring-[#087448]/10"
                    >
                      <option value="">Select tuition mode</option>
                      <option value="Offline">Offline</option>
                      <option value="Online">Online</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="location"
                      className="mb-2 block text-sm font-bold text-[#34473b]"
                    >
                      Location / Area <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#93a198]"
                      />
                      <input
                        id="location"
                        name="location"
                        type="text"
                        value={form.location}
                        onChange={handleChange}
                        maxLength={150}
                        required
                        placeholder="e.g. Dhanmondi, Dhaka"
                        className="w-full rounded-xl border border-[#dfe8e0] bg-[#fcfdfc] py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-[#b2bdb5] focus:border-[#087448] focus:ring-4 focus:ring-[#087448]/10"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mb-7 border-t border-[#edf1ed]" />
              <div className="mb-8">
                <h4 className="mb-5 text-xs font-extrabold uppercase tracking-[1.8px] text-[#087448]">
                  Additional Details
                </h4>
                <div className="mb-5">
                  <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-bold text-[#34473b]"
                  >
                    Tuition Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    maxLength={3000}
                    required
                    rows={6}
                    placeholder="Describe your teaching experience, learning objectives, subjects covered, and what students can expect..."
                    className="w-full resize-y rounded-xl border border-[#dfe8e0] bg-[#fcfdfc] px-4 py-3.5 text-sm leading-6 outline-none transition placeholder:text-[#b2bdb5] focus:border-[#087448] focus:ring-4 focus:ring-[#087448]/10"
                  />
                  <p className="mt-2 text-right text-[11px] text-[#9ba89f]">
                    {form.description.length}/3000 characters
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="bannerImage"
                    className="mb-2 flex items-center gap-2 text-sm font-bold text-[#34473b]"
                  >
                    <ImagePlus
                      size={17}
                      className="text-[#087448]"
                    />
                    Banner Image URL
                    <span className="text-xs font-normal text-[#a1aea5]">
                      (Optional)
                    </span>
                  </label>
                  <input
                    id="bannerImage"
                    name="bannerImage"
                    type="url"
                    value={form.bannerImage}
                    onChange={handleChange}
                    maxLength={2000}
                    placeholder="https://example.com/image.jpg"
                    className="w-full rounded-xl border border-[#dfe8e0] bg-[#fcfdfc] px-4 py-3.5 text-sm outline-none transition placeholder:text-[#b2bdb5] focus:border-[#087448] focus:ring-4 focus:ring-[#087448]/10"
                  />
                  <p className="mt-2 text-xs leading-5 text-[#9ba89f]">
                    Provide a publicly accessible image URL for your tuition listing.
                  </p>
                </div>
              </div>
              <div className="mb-7 flex gap-3 rounded-2xl border border-[#e7e9d4] bg-[#fbfaef] p-4">
                <Clock3
                  size={21}
                  className="mt-0.5 shrink-0 text-[#ad8b36]"
                />
                <div>
                  <h4 className="text-sm font-bold text-[#75612b]">
                    Admin Approval Required
                  </h4>
                  <p className="mt-1 text-xs leading-6 text-[#928252]">
                    Your tuition will be submitted for admin review.
                    It will become visible to students only after approval.
                  </p>
                </div>
              </div>
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => router.push("/dashboard/tutor")}
                  className="rounded-xl border border-[#dfe8e0] px-6 py-3.5 text-sm font-bold text-[#62746a] transition hover:bg-[#f5f8f5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#075c3b] px-7 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-[#075c3b]/15 transition hover:bg-[#087448] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      Submit Tuition
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
          <aside className="space-y-6">
            <div className="overflow-hidden rounded-[24px] border border-[#e3ebe4] bg-white shadow-sm">
              <div className="bg-[#0a4932] p-6 text-white">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                    <ShieldCheck size={24} />
                  </div>
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider">
                    {isPro ? "Premium" : "Basic"}
                  </span>
                </div>
                <p className="text-xs font-bold uppercase tracking-[2px] text-[#b4d8c1]">
                  Your Membership
                </p>
                <h3 className="mt-2 text-3xl font-extrabold">
                  {isPro ? "Pro Plan" : "Free Plan"}
                </h3>
                <p className="mt-2 text-xs leading-6 text-[#c5dfcf]">
                  {isPro
                    ? "Enjoy unlimited tuition posting and grow your teaching opportunities."
                    : "Your free membership includes up to 2 tuition posts."}
                </p>
              </div>
              <div className="p-6">
                {isPro ? (
                  <div className="flex items-center gap-3 rounded-xl bg-[#eff8f1] p-4">
                    <CheckCircle2
                      size={23}
                      className="text-[#087448]"
                    />
                    <p className="text-sm font-bold text-[#075c3b]">
                      Unlimited posting enabled
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-semibold text-[#68796e]">
                        Posting usage
                      </span>
                      <span className="text-sm font-extrabold text-[#075c3b]">
                        {totalTuitions}/{freeLimit}
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-[#edf2ed]">
                      <div
                        className="h-full rounded-full bg-[#087448] transition-all"
                        style={{
                          width: `${Math.min(
                            (totalTuitions / freeLimit) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    <p className="mt-3 text-xs text-[#89978e]">
                      {remainingPosts} posting{" "}
                      {remainingPosts === 1 ? "slot" : "slots"} remaining
                    </p>
                    <button
                      type="button"
                      onClick={() => router.push("/?role=tutor#pricing")}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#f1f7f2] py-3 text-sm font-extrabold text-[#075c3b] transition hover:bg-[#e4f0e7]"
                    >
                      <Sparkles size={17} />
                      Upgrade to Pro
                      <ArrowRight size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="rounded-[24px] border border-[#e3ebe4] bg-white p-6 shadow-sm">
              <h3 className="mb-5 text-base font-extrabold text-[#172820]">
                Posting Guidelines
              </h3>
              <div className="space-y-5">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e9f3ec] text-[#087448]">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#34473b]">
                      Accurate Information
                    </h4>
                    <p className="mt-1 text-xs leading-5 text-[#8d9b92]">
                      Provide clear and accurate tuition details.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e9f3ec] text-[#087448]">
                    <Wallet size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#34473b]">
                      Transparent Pricing
                    </h4>
                    <p className="mt-1 text-xs leading-5 text-[#8d9b92]">
                      Specify your expected monthly tuition fee.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e9f3ec] text-[#087448]">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#34473b]">
                      Clear Location
                    </h4>
                    <p className="mt-1 text-xs leading-5 text-[#8d9b92]">
                      Mention the preferred teaching area.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e9f3ec] text-[#087448]">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#34473b]">
                      Admin Verification
                    </h4>
                    <p className="mt-1 text-xs leading-5 text-[#8d9b92]">
                      Every new listing requires admin approval.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-[24px] bg-[#eaf3ec] p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#087448]">
                <Monitor size={21} />
              </div>
              <h3 className="font-extrabold text-[#075c3b]">
                Need Help?
              </h3>
              <p className="mt-2 text-xs leading-6 text-[#71877a]">
                Make sure your tuition details are complete before
                submitting. Your listing will be reviewed by the
                admin team.
              </p>
            </div>
          </aside>
        </div>
        <footer className="mt-12 border-t border-[#e3ebe4] py-7 text-center">
          <p className="text-xs font-medium text-[#9aa79e]">
            © 2026 MentorLagbe. Empowering education through meaningful connections.
          </p>
        </footer>
      </div>
    </main>
  );
}
