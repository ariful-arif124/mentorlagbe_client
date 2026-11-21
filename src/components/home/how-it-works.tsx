
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  FileText,
  CheckCircle2,
  BookOpen,
  UserRound,
  PlusCircle,
  ShieldCheck,
  Users,
} from "lucide-react";

const studentSteps = [
  {
    number: "01",
    title: "Search",
    description:
      "Explore approved tuition listings and find the perfect tutor based on your subject, class and budget.",
    icon: Search,
  },
  {
    number: "02",
    title: "Apply",
    description:
      "Choose your preferred tuition and submit an application with your contact information and schedule.",
    icon: FileText,
  },
  {
    number: "03",
    title: "Get Accepted",
    description:
      "Wait for the tutor to review your application and confirm your enrollment.",
    icon: CheckCircle2,
  },
  {
    number: "04",
    title: "Start Learning",
    description:
      "Connect with your tutor and begin your personalized learning journey.",
    icon: BookOpen,
  },
];

const tutorSteps = [
  {
    number: "01",
    title: "Create Profile",
    description:
      "Register as a tutor and build your professional teaching profile.",
    icon: UserRound,
  },
  {
    number: "02",
    title: "Post Tuition",
    description:
      "Create tuition listings with your subject, class, schedule and monthly fee.",
    icon: PlusCircle,
  },
  {
    number: "03",
    title: "Get Approved",
    description:
      "Submit your tuition listing and wait for the admin approval process.",
    icon: ShieldCheck,
  },
  {
    number: "04",
    title: "Teach Students",
    description:
      "Receive student applications, manage applicants and start teaching.",
    icon: Users,
  },
];

export function HowItWorks() {
  const [activeRole, setActiveRole] = useState<
    "student" | "tutor"
  >("student");

  const steps =
    activeRole === "student"
      ? studentSteps
      : tutorSteps;

  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 overflow-hidden bg-secondary/40 py-20 md:py-24"
    >
      <div className="site-container space-y-12">
        <div className="space-y-4 text-center">
          <p className="section-eyebrow">
            Simple Steps, Better Learning
          </p>

          <h2 className="section-title">
            How MentorLagbe Works
          </h2>

          <p className="section-description mx-auto">
            Whether you are looking for the right tutor or
            sharing your teaching expertise, getting started
            with MentorLagbe is simple.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="inline-flex rounded-xl border border-border bg-card p-1.5 shadow-sm">
            <button
              type="button"
              onClick={() => setActiveRole("student")}
              aria-pressed={activeRole === "student"}
              className={`rounded-lg px-5 py-3 text-sm font-semibold transition-all ${
                activeRole === "student"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              I&apos;m a Student
            </button>

            <button
              type="button"
              onClick={() => setActiveRole("tutor")}
              aria-pressed={activeRole === "tutor"}
              className={`rounded-lg px-5 py-3 text-sm font-semibold transition-all ${
                activeRole === "tutor"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              I&apos;m a Tutor
            </button>
          </div>
        </div>

        <div className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="absolute left-[12.5%] right-[12.5%] top-8 hidden border-t-2 border-dashed border-primary/20 lg:block" />

          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.article
                key={`${activeRole}-${step.number}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.1,
                }}
                className="relative z-10 flex flex-col items-center text-center"
              >
                <div className="relative flex size-16 items-center justify-center rounded-2xl border border-primary/15 bg-card text-primary shadow-md shadow-primary/5">
                  <Icon size={27} strokeWidth={1.8} />

                  <span className="absolute -right-2 -top-2 flex size-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                    {step.number}
                  </span>
                </div>

                <div className="mt-6 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary">
                    Step {step.number}
                  </p>

                  <h3 className="text-xl font-bold text-foreground">
                    {step.title}
                  </h3>

                  <p className="text-sm leading-7 text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </motion.article>
            );
          })}
        </div>

        <div className="rounded-2xl border border-primary/10 bg-card px-6 py-5 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Your learning journey starts with one simple step.
            <span className="ml-1 font-bold text-primary">
              Join MentorLagbe today!
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
