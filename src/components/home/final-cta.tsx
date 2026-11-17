
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  GraduationCap,
  Sparkles,
} from "lucide-react";

export function FinalCta() {
  return (
    <section className="bg-background px-4 py-16 md:py-20">
      <div className="site-container">

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground shadow-xl md:px-16 md:py-20"
        >
          {/* Decorative Elements */}
          <div className="absolute -right-20 -top-20 size-64 rounded-full border border-current/10" />
          <div className="absolute -bottom-28 -left-20 size-72 rounded-full border border-current/10" />

          <div className="relative z-10 mx-auto max-w-3xl">

            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-white/15">
              <GraduationCap size={30} />
            </div>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-current/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider">
              <Sparkles size={14} />
              Start Your Journey Today
            </div>

            <h2 className="mt-6 text-3xl font-bold leading-tight tracking-tight md:text-5xl">
              Your Future Starts With the Right Mentor.
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 opacity-85 md:text-base">
              Join MentorLagbe to discover qualified tutors,
              explore learning opportunities and take the
              next step towards your academic goals.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">

              <Link
                href="/tuitions"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-4 text-sm font-bold text-[#0F5132] shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                Explore Tuitions
                <ArrowRight size={18} />
              </Link>

              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-current/40 px-7 py-4 text-sm font-bold transition-all hover:bg-white/10"
              >
                Join MentorLagbe
                <ArrowRight size={18} />
              </Link>

            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
