
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen">
        <section className="site-container py-24 md:py-32">
          <div className="max-w-3xl space-y-6">
            <p className="section-eyebrow">
              A Smarter Way to Learn
            </p>

            <h1 className="section-title text-4xl md:text-6xl">
              Find Your Ideal Tutor or Mentorship Batch Today.
            </h1>

            <p className="section-description text-lg">
              Connect with qualified tutors, discover personalized
              learning opportunities, and achieve your academic goals
              with MentorLagbe.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/tuitions"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Explore Tuitions
                <ArrowUpRight size={18} />
              </Link>

              <Link
                href="/pricing"
                className="inline-flex h-12 items-center rounded-xl border border-border bg-card px-6 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                View Plans
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
