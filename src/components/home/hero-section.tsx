
"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Search,
  Star,
  Users,
} from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden py-16 md:py-20 lg:py-24">
      <div className="absolute -left-40 top-0 -z-10 size-96 rounded-full bg-primary/5 blur-3xl" />

      <div className="site-container grid items-center gap-14 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-2xl space-y-7"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary">
            <GraduationCap size={18} />
            Your Learning Journey Starts Here
          </div>

          <div className="space-y-5">
            <h1 className="text-4xl font-bold leading-[1.12] tracking-tight text-foreground sm:text-5xl lg:text-[3.65rem]">
              Find Your Ideal{" "}
              <span className="text-primary">Tutor</span> or Mentorship Batch
              Today.
            </h1>

            <p className="max-w-xl text-base leading-8 text-muted-foreground md:text-lg">
              Connect with qualified tutors, discover personalized learning
              opportunities, and achieve your academic goals with
              MentorLagbe.
            </p>
          </div>

          <form
            action="/tuitions"
            method="GET"
            className="grid gap-3 rounded-2xl border border-border bg-card p-3 shadow-lg shadow-foreground/5 sm:grid-cols-[1fr_1fr_auto]"
          >
            <div className="flex flex-col justify-center gap-1 px-2">
              <label
                htmlFor="hero-subject"
                className="text-xs font-semibold text-muted-foreground"
              >
                Select Subject
              </label>

              <select
                id="hero-subject"
                name="subject"
                defaultValue=""
                className="h-9 w-full bg-transparent text-sm font-medium text-foreground outline-none"
              >
                <option value="">All Subjects</option>
                <option value="Math">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="English">English</option>
                <option value="Programming">Programming</option>
                <option value="IELTS">IELTS</option>
              </select>
            </div>

            <div className="flex flex-col justify-center gap-1 border-border px-2 sm:border-l">
              <label
                htmlFor="hero-mode"
                className="text-xs font-semibold text-muted-foreground"
              >
                Learning Mode
              </label>

              <select
                id="hero-mode"
                name="mode"
                defaultValue=""
                className="h-9 w-full bg-transparent text-sm font-medium text-foreground outline-none"
              >
                <option value="">Any Mode</option>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
              </select>
            </div>

            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
            >
              <Search size={17} />
              Search
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-x-7 gap-y-4 pt-2">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Users size={20} />
              </span>
              <div>
                <p className="text-sm font-bold text-foreground">500+</p>
                <p className="text-xs text-muted-foreground">
                  Verified Tutors
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-accent/15 text-accent">
                <Star size={20} fill="currentColor" />
              </span>
              <div>
                <p className="text-sm font-bold text-foreground">4.8 / 5</p>
                <p className="text-xs text-muted-foreground">
                  Student Rating
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, x: 25 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative mx-auto w-full max-w-[34rem] px-3 pb-8 pt-5 sm:px-6"
        >
          <div
            role="img"
            aria-label="Students studying together in an educational environment"
            className="relative aspect-[4/4.5] overflow-hidden rounded-[2.5rem] rounded-tl-[7rem] bg-cover bg-center shadow-2xl shadow-primary/10"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=85')",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1210]/40 via-transparent to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 flex items-center gap-3 rounded-2xl border border-white/20 bg-white/90 p-4 shadow-xl backdrop-blur-md">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
                <GraduationCap size={23} />
              </span>
              <div>
                <p className="text-sm font-bold text-[#14201B]">
                  Learn from the Best
                </p>
                <p className="text-xs text-[#5B6B64]">
                  Your goals, our priority.
                </p>
              </div>
            </div>
          </div>

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -left-1 top-16 z-10 hidden rounded-2xl border border-border bg-card p-4 shadow-xl sm:block md:-left-4"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <GraduationCap size={22} />
              </span>
              <div>
                <p className="text-xs text-muted-foreground">
                  Popular Tuition
                </p>
                <p className="text-sm font-bold text-foreground">
                  Math · Class 10
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm font-bold text-primary">
              ৳3,000 / month
            </p>
          </motion.div>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 4.5, repeat: Infinity }}
            className="absolute -right-1 top-1/2 z-10 hidden -translate-y-1/2 items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-xl sm:flex md:-right-4"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CheckCircle2 size={23} />
            </span>
            <div>
              <p className="text-sm font-bold text-foreground">
                New Batch Approved
              </p>
              <p className="text-xs text-muted-foreground">
                Ready for enrollment
              </p>
            </div>
          </motion.div>

          <div className="absolute -bottom-2 -right-2 -z-10 size-32 rounded-full bg-accent/20 blur-2xl" />
        </motion.div>
      </div>
    </section>
  );
}
