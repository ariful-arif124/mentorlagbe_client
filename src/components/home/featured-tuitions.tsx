"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  MapPin,
  Monitor,
  GraduationCap,
  BookOpen,
} from "lucide-react";

import { getFeaturedTuitions } from "@/services/tuition-service";
import type { Tuition } from "@/types/tuition";

export function FeaturedTuitions() {
  const [featuredTuitions, setFeaturedTuitions] = useState<Tuition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTuitions = async () => {
      try {
        const result = await getFeaturedTuitions();
        setFeaturedTuitions(result.data || []);
      } catch (error) {
        console.error("Failed to load featured tuitions:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTuitions();
  }, []);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <section className="bg-background py-20 md:py-24">
      <div className="site-container space-y-12">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="section-eyebrow">
              Find Your Perfect Match
            </p>

            <h2 className="section-title">
              Featured Tuitions
            </h2>

            <p className="section-description">
              Explore quality tuition opportunities and connect
              with experienced tutors who can help you achieve
              your academic goals.
            </p>
          </div>

          <Link
            href="/tuitions"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition-all hover:border-primary hover:text-primary"
          >
            Browse All Tuitions
            <ArrowUpRight size={17} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[560px] animate-pulse rounded-2xl border border-border bg-card"
              />
            ))}
          </div>
        ) : featuredTuitions.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredTuitions.slice(0, 6).map((tuition, index) => {
              const ModeIcon =
                tuition.mode === "Online" ? Monitor : MapPin;

              return (
                <motion.article
                  key={tuition._id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{
                    duration: 0.45,
                    delay: index * 0.08,
                  }}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
                >
                  <div
                    role="img"
                    aria-label={tuition.title}
                    className="relative aspect-video overflow-hidden bg-muted bg-cover bg-center"
                    style={{
                      backgroundImage: `url("${tuition.bannerImage}")`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />

                    <span className="absolute bottom-4 left-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-primary shadow-sm">
                      {tuition.subject}
                    </span>

                    <span
                      className={`absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold shadow-sm ${
                        tuition.mode === "Online"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-amber-50 text-amber-800"
                      }`}
                    >
                      <ModeIcon size={13} />
                      {tuition.mode}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="space-y-3">
                      <h3 className="line-clamp-2 min-h-[3.5rem] text-lg font-bold leading-7 text-foreground transition-colors group-hover:text-primary">
                        {tuition.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <GraduationCap size={15} />
                          {tuition.classLevel}
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays size={14} />
                          {tuition.daysPerWeek} Days / Week
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin size={15} className="shrink-0" />
                        <span className="truncate">
                          {tuition.location}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 rounded-xl bg-secondary/70 p-3">
                      <p className="text-xs font-medium text-muted-foreground">
                        Monthly Tuition Fee
                      </p>

                      <p className="mt-1 text-xl font-bold text-primary">
                        ৳{tuition.monthlyFee.toLocaleString("en-BD")}
                        <span className="ml-1 text-xs font-medium text-muted-foreground">
                          / month
                        </span>
                      </p>
                    </div>

                    <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {getInitials(tuition.tutorName)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium text-muted-foreground">
                          Tuition Instructor
                        </p>

                        <p className="truncate text-sm font-bold text-foreground">
                          {tuition.tutorName}
                        </p>
                      </div>

                      <BookOpen
                        size={19}
                        className="shrink-0 text-muted-foreground"
                      />
                    </div>

                    <Link
                      href={`/tuitions/${tuition._id}`}
                      className="mt-auto flex h-11 items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground"
                    >
                      View Details
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </motion.article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center">
            <GraduationCap
              size={36}
              className="mx-auto text-muted-foreground"
            />

            <h3 className="mt-4 text-lg font-bold text-foreground">
              No Featured Tuitions Available
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              Please check back later for new tuition opportunities.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}