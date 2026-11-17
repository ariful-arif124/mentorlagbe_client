
"use client";

import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useTransform,
} from "framer-motion";

import {
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Star,
  Quote,
  BadgeCheck,
} from "lucide-react";

// Demo platform statistics
const statistics = [
  {
    label: "Verified Tutors",
    value: 500,
    suffix: "+",
    icon: GraduationCap,
  },
  {
    label: "Active Students",
    value: 2000,
    suffix: "+",
    icon: Users,
  },
  {
    label: "Tuition Opportunities",
    value: 1200,
    suffix: "+",
    icon: BookOpen,
  },
  {
    label: "Learner Satisfaction",
    value: 98,
    suffix: "%",
    icon: TrendingUp,
  },
];

// Demo testimonials - replace with real reviews later
const testimonials = [
  {
    name: "Ayesha Rahman",
    role: "HSC Student",
    location: "Dhaka",
    initials: "AR",
    rating: 5,
    message:
      "Finding the right mathematics tutor became much easier with MentorLagbe. I love how simple the platform is to use and explore different tuition opportunities.",
  },
  {
    name: "Nafis Ahmed",
    role: "University Student",
    location: "Chattogram",
    initials: "NA",
    rating: 5,
    message:
      "The platform helped me discover a tutor who understands my learning needs. The tuition details and application process are very convenient.",
  },
  {
    name: "Samira Islam",
    role: "English Tutor",
    location: "Dhaka",
    initials: "SI",
    rating: 5,
    message:
      "MentorLagbe provides a simple way for tutors to showcase their teaching opportunities and connect with students who need academic support.",
  },
];

// Animated counter component
function AnimatedCounter({
  value,
  suffix,
}: {
  value: number;
  suffix: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  const isInView = useInView(ref, {
    once: true,
    amount: 0.5,
  });

  const count = useMotionValue(0);

  const rounded = useTransform(count, (latest) =>
    Math.round(latest).toLocaleString("en-BD")
  );

  useEffect(() => {
    if (!isInView) return;

    const controls = animate(count, value, {
      duration: 1.8,
      ease: "easeOut",
    });

    return () => controls.stop();
  }, [isInView, count, value]);

  return (
    <span ref={ref}>
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

export function StatsTestimonials() {
  return (
    <section className="overflow-hidden bg-background py-20 md:py-24">
      <div className="site-container space-y-20">

        {/* Statistics Section */}
        <div className="space-y-10">

          <div className="mx-auto max-w-2xl space-y-3 text-center">
            <p className="section-eyebrow">
              Our Growing Community
            </p>

            <h2 className="section-title">
              Making Learning More Accessible
            </h2>

            <p className="section-description mx-auto">
              Bringing students and qualified tutors together
              through a smarter and more convenient learning
              experience.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {statistics.map((stat, index) => {
              const Icon = stat.icon;

              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                  }}
                  className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon size={24} />
                  </span>

                  <h3 className="mt-4 text-3xl font-bold tracking-tight text-primary md:text-4xl">
                    <AnimatedCounter
                      value={stat.value}
                      suffix={stat.suffix}
                    />
                  </h3>

                  <p className="mt-2 text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="space-y-10">

          <div className="mx-auto max-w-2xl space-y-3 text-center">
            <p className="section-eyebrow">
              Voices of Our Community
            </p>

            <h2 className="section-title">
              What Our Learners Say
            </h2>

            <p className="section-description mx-auto">
              Discover how students and tutors can benefit
              from a better-connected learning community.
            </p>
          </div>

          {/* Three Testimonial Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.article
                key={testimonial.name}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.12,
                }}
                className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 text-accent">
                    {Array.from({ length: testimonial.rating }).map(
                      (_, i) => (
                        <Star
                          key={i}
                          size={17}
                          fill="currentColor"
                        />
                      )
                    )}
                  </div>

                  <Quote
                    size={30}
                    className="text-primary/15"
                  />
                </div>

                {/* Testimonial Message */}
                <p className="mt-6 flex-1 text-sm leading-7 text-muted-foreground">
                  "{testimonial.message}"
                </p>

                {/* User Information */}
                <div className="mt-7 flex items-center gap-3 border-t border-border pt-5">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                    {testimonial.initials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <h3 className="truncate text-sm font-bold text-foreground">
                        {testimonial.name}
                      </h3>

                      <BadgeCheck
                        size={15}
                        className="shrink-0 text-primary"
                      />
                    </div>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {testimonial.role} · {testimonial.location}
                    </p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Demo statistics and sample testimonials for development.
            Replace with verified platform data and genuine user feedback
            before launch.
          </p>
        </div>
      </div>
    </section>
  );
}
