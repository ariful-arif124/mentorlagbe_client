
"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  GraduationCap,
  UserRound,
  Mail,
  Phone,
  Camera,
  Upload,
  Save,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Crown,
  BookOpen,
  ImageIcon,
  Trash2,
  X,
} from "lucide-react";

// ==========================================
// TYPES
// ==========================================

interface ProfileData {
  userId: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  image: string;
  phone: string;
  bio: string;
  createdAt: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// ==========================================
// API CONFIGURATION
// ==========================================

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api"
).replace(/\/+$/, "");

const API_BASE_URL = API_URL.endsWith("/api")
  ? API_URL
  : `${API_URL}/api`;

const PROFILE_URL = `${API_BASE_URL}/profile`;

const IMAGE_UPLOAD_URL =
  `${API_BASE_URL}/upload/profile-image`;

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

// ==========================================
// HELPER FUNCTIONS
// ==========================================

const getAuthToken = () => {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("mentorlagbe_token")
  );
};

const getDashboardHref = (role: string) => {
  switch (role.toLowerCase()) {
    case "admin":
      return "/admin/dashboard";

    case "tutor":
      return "/tutor/dashboard";

    default:
      return "/student/dashboard";
  }
};

const normalizeProfile = (
  data: Partial<ProfileData>
): ProfileData => ({
  userId: data.userId || "",
  name: data.name || "",
  email: data.email || "",
  role: data.role || "student",
  plan: data.plan || "free",
  image: data.image || "",
  phone: data.phone || "",
  bio: data.bio || "",
  createdAt: data.createdAt || null,
});

// Synchronize profile information with Navbar

const syncStoredUser = (updatedProfile: ProfileData) => {
  let existingUser: Record<string, unknown> = {};

  try {
    const storedUser =
      localStorage.getItem("user") ||
      localStorage.getItem("mentorlagbe_user");

    if (storedUser) {
      const parsed: unknown = JSON.parse(storedUser);

      if (
        parsed &&
        typeof parsed === "object" &&
        !Array.isArray(parsed)
      ) {
        existingUser = parsed as Record<string, unknown>;
      }
    }
  } catch {
    existingUser = {};
  }

  const synchronizedUser = {
    ...existingUser,
    userId: updatedProfile.userId,
    name: updatedProfile.name,
    email: updatedProfile.email,
    role: updatedProfile.role,
    plan: updatedProfile.plan,
    image: updatedProfile.image,
    phone: updatedProfile.phone,
    bio: updatedProfile.bio,
  };

  localStorage.setItem(
    "user",
    JSON.stringify(synchronizedUser)
  );

  localStorage.setItem(
    "mentorlagbe_user",
    JSON.stringify(synchronizedUser)
  );

  window.dispatchEvent(
    new Event("mentorlagbe-auth-change")
  );
};

// ==========================================
// PROFILE PAGE
// ==========================================

export default function ProfilePage() {
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] =
    useState<ProfileData | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [removingImage, setRemovingImage] = useState(false);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);

  const dashboardHref = profile
    ? getDashboardHref(profile.role)
    : "/";

  const displayImage =
    previewUrl || profile?.image || "";

  // ==========================================
  // FETCH PROFILE
  // ==========================================

  useEffect(() => {
    let active = true;

    const fetchProfile = async () => {
      const token = getAuthToken();

      if (!token) {
        router.replace("/sign-in");
        return;
      }

      try {
        const response = await fetch(PROFILE_URL, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const result =
          (await response.json().catch(() => null)) as
            | ApiResponse<ProfileData>
            | null;

        if (response.status === 401) {
          toast.error(
            "Your session has expired. Please sign in again."
          );

          router.replace("/sign-in");
          return;
        }

        if (!response.ok || !result?.success || !result.data) {
          throw new Error(
            result?.message || "Failed to load your profile."
          );
        }

        if (active) {
          setProfile(normalizeProfile(result.data));
        }
      } catch (error) {
        console.error("Profile loading error:", error);

        if (active) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Unable to load profile."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      active = false;
    };
  }, [router]);

  // Release temporary preview URLs

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // ==========================================
  // UPDATE FORM VALUES
  // ==========================================

  const updateField = (
    field: keyof ProfileData,
    value: string
  ) => {
    setProfile((previous) =>
      previous
        ? { ...previous, [field]: value }
        : previous
    );
  };

  // ==========================================
  // SELECT PROFILE IMAGE
  // ==========================================

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error(
        "Only JPG, PNG and WebP images are allowed."
      );

      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image size must not exceed 5 MB.");

      event.target.value = "";
      return;
    }

    const temporaryPreview = URL.createObjectURL(file);

    setSelectedFile(file);
    setPreviewUrl(temporaryPreview);

    toast.success("Image selected successfully.", {
      description: "Preview your image before uploading.",
    });
  };

  // ==========================================
  // CANCEL IMAGE SELECTION
  // ==========================================

  const handleCancelSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ==========================================
  // UPLOAD PROFILE IMAGE
  // POST /api/upload/profile-image
  // ==========================================

  const handleUploadImage = async () => {
    if (!selectedFile || !profile) {
      toast.error("Please select an image first.");
      return;
    }

    const token = getAuthToken();

    if (!token) {
      toast.error("Please sign in again.");
      router.replace("/sign-in");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();

      formData.append("image", selectedFile);

      const response = await fetch(IMAGE_UPLOAD_URL, {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`,
        },

        body: formData,
      });

      const result =
        (await response.json().catch(() => null)) as
          | ApiResponse<{ image: string }>
          | null;

      if (response.status === 401) {
        toast.error(
          "Your session has expired. Please sign in again."
        );

        router.replace("/sign-in");
        return;
      }

      if (
        !response.ok ||
        !result?.success ||
        !result.data?.image
      ) {
        throw new Error(
          result?.message || "Failed to upload profile picture."
        );
      }

      // Update frontend profile

      const updatedProfile: ProfileData = {
        ...profile,
        image: result.data.image,
      };

      setProfile(updatedProfile);

      // Synchronize Navbar

      syncStoredUser(updatedProfile);

      // Clear temporary preview

      setSelectedFile(null);
      setPreviewUrl(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast.success(
        "Profile picture uploaded successfully!",
        {
          description:
            "Your new picture is now saved to your account.",
        }
      );
    } catch (error) {
      console.error("Image upload error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to upload profile picture."
      );
    } finally {
      setUploading(false);
    }
  };

  // ==========================================
  // REMOVE PROFILE IMAGE
  // PATCH /api/profile
  // ==========================================

  const handleRemoveImage = async () => {
    if (!profile?.image) return;

    const token = getAuthToken();

    if (!token) {
      toast.error("Please sign in again.");
      router.replace("/sign-in");
      return;
    }

    setRemovingImage(true);

    try {
      const response = await fetch(PROFILE_URL, {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          bio: profile.bio,
          image: "",
        }),
      });

      const result =
        (await response.json().catch(() => null)) as
          | ApiResponse<Partial<ProfileData>>
          | null;

      if (response.status === 401) {
        toast.error(
          "Your session has expired. Please sign in again."
        );

        router.replace("/sign-in");
        return;
      }

      if (!response.ok || !result?.success) {
        throw new Error(
          result?.message || "Failed to remove profile picture."
        );
      }

      const updatedProfile = normalizeProfile({
        ...profile,
        ...(result.data || {}),
        image: result.data?.image || "",
      });

      setProfile(updatedProfile);

      syncStoredUser(updatedProfile);

      toast.success("Profile picture removed successfully.");
    } catch (error) {
      console.error("Remove image error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to remove profile picture."
      );
    } finally {
      setRemovingImage(false);
    }
  };

  // ==========================================
  // SAVE PROFILE
  // PATCH /api/profile
  // ==========================================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!profile) return;

    if (selectedFile) {
      toast.error(
        "Please upload or cancel your selected picture first."
      );
      return;
    }

    const token = getAuthToken();

    if (!token) {
      toast.error("Please sign in again.");
      router.replace("/sign-in");
      return;
    }

    if (profile.name.trim().length < 2) {
      toast.error(
        "Name must contain at least 2 characters."
      );
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(PROFILE_URL, {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          bio: profile.bio,
          image: profile.image,
        }),
      });

      const result =
        (await response.json().catch(() => null)) as
          | ApiResponse<Partial<ProfileData>>
          | null;

      if (response.status === 401) {
        toast.error(
          "Your session has expired. Please sign in again."
        );

        router.replace("/sign-in");
        return;
      }

      if (!response.ok || !result?.success) {
        throw new Error(
          result?.message || "Failed to update profile."
        );
      }

      const updatedProfile = normalizeProfile({
        ...profile,
        ...(result.data || {}),
      });

      setProfile(updatedProfile);

      // Synchronize Navbar and localStorage

      syncStoredUser(updatedProfile);

      toast.success("Profile updated successfully!", {
        description:
          "Your account information has been saved.",
      });

      // Redirect to the appropriate dashboard

      router.replace(dashboardHref);
      router.refresh();
    } catch (error) {
      console.error("Profile update error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // LOADING SCREEN
  // ==========================================

  if (loading || !profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8F8F4] dark:bg-[#0B1210]">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            size={34}
            className="animate-spin text-[#0F5132]"
          />

          <p className="text-sm font-medium text-[#64746C]">
            Loading your profile...
          </p>
        </div>
      </main>
    );
  }

  // ==========================================
  // PROFILE INFORMATION
  // ==========================================

  const initials = profile.name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const role = profile.role.toLowerCase();

  const roleLabel =
    role === "admin"
      ? "ADMIN"
      : role === "tutor"
        ? "TUTOR"
        : "STUDENT";

  return (
    <main className="min-h-screen bg-[#F8F8F4] px-4 py-10 dark:bg-[#0B1210] sm:px-6 lg:px-8">

      <div className="mx-auto max-w-6xl">

        {/* TOP NAVIGATION */}

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">

          <Link
            href={dashboardHref}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#64746C] transition hover:text-[#0F5132] dark:text-gray-300 dark:hover:text-emerald-400"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-[#17231D] dark:text-white"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F5132] text-white">
              <GraduationCap size={22} />
            </div>

            Mentor
            <span className="text-[#0F5132] dark:text-emerald-400">
              Lagbe
            </span>
          </Link>

        </div>

        {/* PAGE HEADING */}

        <div className="mb-9">

          <p className="mb-2 text-xs font-bold uppercase tracking-[2px] text-[#0F5132] dark:text-emerald-400">
            Account Management
          </p>

          <h1 className="text-3xl font-extrabold tracking-tight text-[#17231D] dark:text-white sm:text-4xl">
            My Profile
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-7 text-[#64746C] dark:text-gray-400">
            Manage your personal information and keep your
            MentorLagbe account up to date.
          </p>

        </div>

        {/* MAIN CONTENT */}

        <div className="grid items-start gap-7 lg:grid-cols-[340px_1fr]">

          {/* LEFT PROFILE CARD */}

          <aside className="space-y-6">

            <div className="overflow-hidden rounded-3xl border border-[#E7E7DF] bg-white shadow-sm dark:border-[#26352E] dark:bg-[#142019]">

              <div className="h-28 bg-gradient-to-r from-[#075C3B] to-[#26754C]" />

              <div className="px-6 pb-7">

                {/* PROFILE IMAGE */}

                <div className="-mt-14 mb-5 flex items-end justify-between">

                  <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl border-4 border-white bg-[#EAF1EC] text-3xl font-extrabold text-[#0F5132] shadow-md dark:border-[#142019] dark:bg-[#263D30] dark:text-emerald-300">

                    {displayImage ? (
                      <img
                        src={displayImage}
                        alt={profile.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initials || <UserRound size={38} />
                    )}

                  </div>

                  <span className="mb-2 rounded-full bg-[#EAF1EC] px-3 py-1.5 text-[10px] font-extrabold tracking-wider text-[#0F5132] dark:bg-[#263D30] dark:text-emerald-300">
                    {roleLabel}
                  </span>

                </div>

                <h2 className="break-words text-xl font-extrabold text-[#17231D] dark:text-white">
                  {profile.name}
                </h2>

                <p className="mt-1 break-all text-sm text-[#819087]">
                  {profile.email}
                </p>

                <div className="my-6 border-t border-[#ECEDE7] dark:border-[#26352E]" />

                {/* ACCOUNT DETAILS */}

                <div className="space-y-5">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF1EC] text-[#0F5132] dark:bg-[#263D30] dark:text-emerald-300">
                      <ShieldCheck size={19} />
                    </div>

                    <div>
                      <p className="text-xs text-[#819087]">
                        Account Type
                      </p>

                      <p className="text-sm font-bold capitalize text-[#26372D] dark:text-white">
                        {profile.role}
                      </p>
                    </div>

                  </div>

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F6F0E4] text-[#A4772B] dark:bg-[#3A3020] dark:text-amber-300">
                      <Crown size={19} />
                    </div>

                    <div>
                      <p className="text-xs text-[#819087]">
                        Membership Plan
                      </p>

                      <p className="text-sm font-bold capitalize text-[#26372D] dark:text-white">
                        {profile.plan || "Free"}
                      </p>
                    </div>

                  </div>

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDF1F8] text-[#526E9C] dark:bg-[#25334A] dark:text-blue-300">
                      <Mail size={19} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-[#819087]">
                        Registered Email
                      </p>

                      <p className="break-all text-sm font-semibold text-[#26372D] dark:text-white">
                        {profile.email}
                      </p>
                    </div>

                  </div>

                </div>

              </div>
            </div>

            {/* INFORMATION CARD */}

            <div className="rounded-2xl border border-[#E7E7DF] bg-white p-5 dark:border-[#26352E] dark:bg-[#142019]">

              <div className="mb-3 flex items-center gap-2">

                <BookOpen
                  size={18}
                  className="text-[#0F5132] dark:text-emerald-400"
                />

                <h3 className="font-bold text-[#17231D] dark:text-white">
                  Profile Tip
                </h3>

              </div>

              <p className="text-sm leading-6 text-[#64746C] dark:text-gray-400">
                Keep your information accurate and your profile
                picture professional. This helps other members
                recognize and connect with you.
              </p>

            </div>

          </aside>

          {/* RIGHT EDIT FORM */}

          <section className="rounded-3xl border border-[#E7E7DF] bg-white p-6 shadow-sm dark:border-[#26352E] dark:bg-[#142019] sm:p-8">

            <div className="mb-8 flex items-center justify-between gap-4">

              <div>
                <h2 className="text-xl font-extrabold text-[#17231D] dark:text-white">
                  Personal Information
                </h2>

                <p className="mt-2 text-sm text-[#819087]">
                  Update your profile details below.
                </p>
              </div>

              <div className="hidden h-11 w-11 items-center justify-center rounded-xl bg-[#EAF1EC] text-[#0F5132] sm:flex dark:bg-[#263D30] dark:text-emerald-300">
                <UserRound size={22} />
              </div>

            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >

              {/* PROFILE IMAGE UPLOAD */}

              <div>

                <label className="mb-3 flex items-center gap-2 text-sm font-bold text-[#26372D] dark:text-gray-200">
                  <Camera size={17} />
                  Profile Picture
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="rounded-2xl border border-[#E3E7E0] bg-[#FAFBF8] p-5 dark:border-[#35463D] dark:bg-[#1A2920]">

                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

                    {/* IMAGE PREVIEW */}

                    <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-[#DCE8DF] bg-[#EAF1EC] text-[#0F5132] dark:border-[#35463D] dark:bg-[#263D30] dark:text-emerald-300">

                      {displayImage ? (
                        <img
                          src={displayImage}
                          alt="Profile preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageIcon size={34} />
                      )}

                    </div>

                    {/* UPLOAD ACTIONS */}

                    <div className="min-w-0 flex-1">

                      <h3 className="font-bold text-[#26372D] dark:text-white">
                        Upload your profile photo
                      </h3>

                      <p className="mt-1 text-xs leading-6 text-[#819087]">
                        JPG, PNG or WebP. Maximum file size: 5 MB.
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">

                        {/* CHOOSE IMAGE */}

                        <button
                          type="button"
                          onClick={() =>
                            fileInputRef.current?.click()
                          }
                          disabled={
                            uploading ||
                            removingImage ||
                            saving
                          }
                          className="inline-flex items-center gap-2 rounded-xl border border-[#DCE2DA] bg-white px-4 py-2.5 text-sm font-bold text-[#0F5132] transition hover:bg-[#EAF1EC] disabled:opacity-50 dark:border-[#35463D] dark:bg-[#202B24] dark:text-emerald-400 dark:hover:bg-[#26352E]"
                        >
                          <Camera size={16} />
                          Choose Image
                        </button>

                        {/* UPLOAD IMAGE */}

                        {selectedFile && (
                          <button
                            type="button"
                            onClick={handleUploadImage}
                            disabled={
                              uploading ||
                              saving ||
                              removingImage
                            }
                            className="inline-flex items-center gap-2 rounded-xl bg-[#0F5132] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0B4028] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {uploading ? (
                              <>
                                <Loader2
                                  size={16}
                                  className="animate-spin"
                                />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload size={16} />
                                Upload Picture
                              </>
                            )}
                          </button>
                        )}

                        {/* CANCEL SELECTION */}

                        {selectedFile && (
                          <button
                            type="button"
                            onClick={handleCancelSelection}
                            disabled={uploading}
                            className="inline-flex items-center gap-2 rounded-xl border border-[#DCE2DA] px-4 py-2.5 text-sm font-semibold text-[#64746C] transition hover:bg-[#F0F2ED] disabled:opacity-50 dark:border-[#35463D] dark:text-gray-300 dark:hover:bg-[#26352E]"
                          >
                            <X size={16} />
                            Cancel
                          </button>
                        )}

                        {/* REMOVE EXISTING IMAGE */}

                        {!selectedFile && profile.image && (
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            disabled={
                              removingImage ||
                              uploading ||
                              saving
                            }
                            className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:hover:bg-red-950"
                          >
                            {removingImage ? (
                              <Loader2
                                size={16}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2 size={16} />
                            )}

                            {removingImage
                              ? "Removing..."
                              : "Remove Picture"}
                          </button>
                        )}

                      </div>

                      {selectedFile && (
                        <p className="mt-3 break-all text-xs text-[#0F5132] dark:text-emerald-400">
                          Selected: {selectedFile.name}
                        </p>
                      )}

                    </div>

                  </div>

                </div>

              </div>

              {/* FULL NAME */}

              <div>

                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-bold text-[#26372D] dark:text-gray-200"
                >
                  Full Name
                </label>

                <input
                  id="name"
                  type="text"
                  required
                  minLength={2}
                  maxLength={60}
                  value={profile.name}
                  onChange={(e) =>
                    updateField("name", e.target.value)
                  }
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-[#E3E7E0] bg-[#FAFBF8] px-4 py-3.5 text-sm text-[#26372D] outline-none transition focus:border-[#0F5132] focus:ring-4 focus:ring-[#0F5132]/10 dark:border-[#35463D] dark:bg-[#1A2920] dark:text-white"
                />

              </div>

              {/* EMAIL */}

              <div>

                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-bold text-[#26372D] dark:text-gray-200"
                >
                  Email Address
                </label>

                <div className="relative">

                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#819087]"
                  />

                  <input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full cursor-not-allowed rounded-xl border border-[#E3E7E0] bg-[#F0F2ED] py-3.5 pl-11 pr-4 text-sm text-[#819087] outline-none dark:border-[#35463D] dark:bg-[#202B24]"
                  />

                </div>

                <p className="mt-2 text-xs text-[#819087]">
                  Your registered email address cannot be changed here.
                </p>

              </div>

              {/* PHONE */}

              <div>

                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-bold text-[#26372D] dark:text-gray-200"
                >
                  Phone Number
                </label>

                <div className="relative">

                  <Phone
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#819087]"
                  />

                  <input
                    id="phone"
                    type="tel"
                    maxLength={25}
                    value={profile.phone}
                    onChange={(e) =>
                      updateField("phone", e.target.value)
                    }
                    placeholder="Enter your phone number"
                    className="w-full rounded-xl border border-[#E3E7E0] bg-[#FAFBF8] py-3.5 pl-11 pr-4 text-sm text-[#26372D] outline-none transition focus:border-[#0F5132] focus:ring-4 focus:ring-[#0F5132]/10 dark:border-[#35463D] dark:bg-[#1A2920] dark:text-white"
                  />

                </div>

              </div>

              {/* ACCOUNT ROLE */}

              <div>

                <label
                  htmlFor="role"
                  className="mb-2 block text-sm font-bold text-[#26372D] dark:text-gray-200"
                >
                  Account Type
                </label>

                <input
                  id="role"
                  type="text"
                  value={profile.role.toUpperCase()}
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-[#E3E7E0] bg-[#F0F2ED] px-4 py-3.5 text-sm font-bold tracking-wide text-[#64746C] outline-none dark:border-[#35463D] dark:bg-[#202B24] dark:text-gray-400"
                />

              </div>

              {/* BIO */}

              <div>

                <div className="mb-2 flex items-center justify-between">

                  <label
                    htmlFor="bio"
                    className="text-sm font-bold text-[#26372D] dark:text-gray-200"
                  >
                    About Me
                  </label>

                  <span className="text-xs text-[#819087]">
                    {profile.bio.length}/500
                  </span>

                </div>

                <textarea
                  id="bio"
                  rows={5}
                  maxLength={500}
                  value={profile.bio}
                  onChange={(e) =>
                    updateField("bio", e.target.value)
                  }
                  placeholder="Tell us a little about yourself..."
                  className="w-full resize-y rounded-xl border border-[#E3E7E0] bg-[#FAFBF8] px-4 py-3.5 text-sm leading-6 text-[#26372D] outline-none transition focus:border-[#0F5132] focus:ring-4 focus:ring-[#0F5132]/10 dark:border-[#35463D] dark:bg-[#1A2920] dark:text-white"
                />

              </div>

              {/* BUTTONS */}

              <div className="flex flex-col-reverse gap-3 border-t border-[#ECEDE7] pt-6 dark:border-[#26352E] sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() => router.push(dashboardHref)}
                  disabled={
                    saving ||
                    uploading ||
                    removingImage
                  }
                  className="rounded-xl border border-[#DCE2DA] px-6 py-3.5 text-sm font-bold text-[#64746C] transition hover:bg-[#F2F4EF] disabled:opacity-50 dark:border-[#35463D] dark:text-gray-300 dark:hover:bg-[#26352E]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving ||
                    uploading ||
                    removingImage ||
                    !!selectedFile
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F5132] px-7 py-3.5 text-sm font-bold text-white shadow-md shadow-[#0F5132]/15 transition duration-200 hover:-translate-y-0.5 hover:bg-[#0B4028] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Changes
                    </>
                  )}
                </button>

              </div>

            </form>

          </section>

        </div>

      </div>

    </main>
  );
}
