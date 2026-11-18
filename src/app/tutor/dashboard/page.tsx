"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  GraduationCap,
  LogOut,
  User,
} from "lucide-react";

interface UserData {
  userId: string;
  name: string;
  email: string;
  role: string;
  plan: string;
}

export default function TutorDashboard() {
  const router = useRouter();

  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      router.replace("/sign-in");
      return;
    }

    try {
      const parsedUser: UserData = JSON.parse(storedUser);

      if (parsedUser.role !== "tutor") {
        router.replace("/");
        return;
      }

      setUser(parsedUser);
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.replace("/sign-in");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    router.push("/sign-in");
    router.refresh();
  };

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf8f3]">
        <p className="text-[#63736d]">Loading dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf8f3]">
      {/* Header */}
      <header className="border-b border-[#e5e0d7] bg-white">
        <div className="mx-auto flex h-[80px] max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#075c3b]">
              <GraduationCap
                size={25}
                className="text-white"
              />
            </div>

            <span className="text-2xl font-bold text-[#10201b]">
              Mentor<span className="text-[#075c3b]">Lagbe</span>
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 font-semibold text-[#63736d] transition hover:bg-[#f3f1ec] hover:text-[#075c3b]"
          >
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </header>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-10">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#075c3b]">
            Tutor Dashboard
          </p>

          <h1 className="text-4xl font-bold text-[#10201b]">
            Welcome, {user.name} 👋
          </h1>

          <p className="mt-3 text-lg text-[#63736d]">
            Manage your tuition listings, applications, and tutor profile.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-[#e5e0d7] bg-white p-6 shadow-sm">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8f1ec]">
              <BookOpen
                size={25}
                className="text-[#075c3b]"
              />
            </div>

            <h2 className="text-xl font-bold text-[#10201b]">
              My Tuitions
            </h2>

            <p className="mt-2 text-[#63736d]">
              Create and manage your tuition listings.
            </p>

            <button className="mt-5 font-semibold text-[#075c3b]">
              Manage Tuitions →
            </button>
          </div>

          <div className="rounded-2xl border border-[#e5e0d7] bg-white p-6 shadow-sm">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8f1ec]">
              <User
                size={25}
                className="text-[#075c3b]"
              />
            </div>

            <h2 className="text-xl font-bold text-[#10201b]">
              Applications
            </h2>

            <p className="mt-2 text-[#63736d]">
              Review applications from students.
            </p>

            <button className="mt-5 font-semibold text-[#075c3b]">
              View Applications →
            </button>
          </div>

          <div className="rounded-2xl border border-[#e5e0d7] bg-white p-6 shadow-sm">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8f1ec]">
              <GraduationCap
                size={25}
                className="text-[#075c3b]"
              />
            </div>

            <h2 className="text-xl font-bold text-[#10201b]">
              Tutor Profile
            </h2>

            <p className="mt-2 text-[#63736d]">
              Manage your tutor information and profile.
            </p>

            <button className="mt-5 font-semibold text-[#075c3b]">
              Edit Profile →
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}