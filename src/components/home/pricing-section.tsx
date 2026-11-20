
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Check,
  ArrowRight,
  GraduationCap,
  Users,
  Crown,
  BadgeCheck,
  Sparkles,
} from "lucide-react";

type Role = "student" | "tutor";

const pricingData = {
  student: {
    label: "Student",
    icon: GraduationCap,
    description: "Find the right tutor for your learning journey.",
    plans: [
      {
        name: "Free",
        price: "$0",
        description: "Everything you need to get started.",
        features: [
          "Browse approved tuition listings",
          "Apply for available tuitions",
          "Track application status",
        ],
        popular: false,
        button: "Get Started",
        href: "/sign-up?role=student&plan=free",
      },
      {
        name: "Pro",
        price: "$10",
        description: "Get more opportunities for better learning.",
        features: [
          "Everything in Free",
          "Priority booking for tuitions",
          "Pro student membership",
        ],
        popular: true,
        button: "Subscribe with Stripe",
        href: "/sign-up?role=student&plan=pro",
      },
    ],
  },

  tutor: {
    label: "Tutor",
    icon: Users,
    description: "Grow your teaching career with MentorLagbe.",
    plans: [
      {
        name: "Free",
        price: "$0",
        description: "Start sharing your teaching expertise.",
        features: [
          "Create up to 2 tuition posts",
          "Manage student applications",
          "Edit and manage your listings",
        ],
        popular: false,
        button: "Get Started",
        href: "/sign-up?role=tutor&plan=free",
      },
      {
        name: "Pro",
        price: "$15",
        description: "Unlock more opportunities as a tutor.",
        features: [
          "Everything in Free",
          "Unlimited tuition posts",
          "Verified tutor badge",
        ],
        popular: true,
        button: "Subscribe with Stripe",
        href: "/sign-up?role=tutor&plan=pro",
      },
    ],
  },
};

export function PricingSection() {
  const [activeRole, setActiveRole] = useState<Role>("student");

  const currentData = pricingData[activeRole];
  const RoleIcon = currentData.icon;

  return (
    <section
      id="pricing"
      className="bg-background py-20 md:py-24"
    >
      <div className="site-container">

        {/* Heading */}
        <div className="mx-auto max-w-2xl space-y-4 text-center">

          <p className="section-eyebrow">
            Simple & Transparent Pricing
          </p>

          <h2 className="section-title">
            Choose the Right Plan for You
          </h2>

          <p className="section-description mx-auto">
            Whether you are looking for the perfect tutor
            or growing your teaching career, we have a
            plan that fits your needs.
          </p>
        </div>

        {/* Student / Tutor Toggle */}
        <div className="mt-10 flex justify-center">

          <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm">

            <button
              onClick={() => setActiveRole("student")}
              className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all ${activeRole === "student"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:bg-secondary"
                }`}
            >
              <GraduationCap size={18} />
              Student
            </button>

            <button
              onClick={() => setActiveRole("tutor")}
              className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all ${activeRole === "tutor"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:bg-secondary"
                }`}
            >
              <Users size={18} />
              Tutor
            </button>

          </div>
        </div>

        {/* Description */}
        <motion.div
          key={activeRole}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground"
        >
          <RoleIcon size={18} className="text-primary" />
          {currentData.description}
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          key={`plans-${activeRole}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-7 md:grid-cols-2"
        >
          {currentData.plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex h-full flex-col rounded-3xl border p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${plan.popular
                ? "border-primary bg-card ring-1 ring-primary/20"
                : "border-border bg-card"
                }`}
            >

              {/* Most Popular Ribbon */}
              {plan.popular && (
                <div className="absolute -top-4 right-6 flex items-center gap-1 rounded-full bg-accent px-4 py-2 text-xs font-bold text-accent-foreground shadow-md">
                  <Sparkles size={14} />
                  Most Popular
                </div>
              )}

              {/* Plan Heading */}
              <div className="flex items-center gap-3">

                <div
                  className={`flex size-12 items-center justify-center rounded-xl ${plan.popular
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-primary"
                    }`}
                >
                  {plan.popular ? (
                    <Crown size={23} />
                  ) : (
                    <RoleIcon size={23} />
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    {plan.name} Plan
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </div>
              </div>

              {/* Price */}
              <div className="mt-8 border-b border-border pb-7">

                <div className="flex items-baseline gap-2">

                  <span className="text-5xl font-bold tracking-tight text-primary">
                    {plan.price}
                  </span>

                  {plan.name === "Pro" && (
                    <span className="text-sm text-muted-foreground">
                      Pro membership
                    </span>
                  )}

                </div>

              </div>

              {/* Features */}
              <div className="mt-7 flex-1">

                <p className="mb-5 text-sm font-bold text-foreground">
                  What&apos;s included:
                </p>

                <ul className="space-y-4">

                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm text-muted-foreground"
                    >
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Check size={13} strokeWidth={3} />
                      </span>

                      {feature}
                    </li>
                  ))}

                </ul>
              </div>

              {/* CTA */}
              <Link
                href={plan.href}
                className={`mt-9 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-4 text-sm font-bold transition-all ${plan.popular
                  ? "bg-primary text-primary-foreground hover:opacity-90"
                  : "border border-border bg-secondary text-foreground hover:border-primary hover:text-primary"
                  }`}
              >
                {plan.button}
                <ArrowRight size={17} />
              </Link>

              {plan.popular && (
                <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <BadgeCheck size={15} className="text-primary" />
                  Upgrade to unlock Pro benefits
                </p>
              )}

            </div>
          ))}
        </motion.div>

        {/* Bottom Note */}
        <p className="mt-10 text-center text-sm text-muted-foreground">
          Start for free and upgrade whenever you are ready.
        </p>

      </div>
    </section>
  );
}
