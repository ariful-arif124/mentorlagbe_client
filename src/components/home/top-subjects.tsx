
import Link from "next/link";
import {
  Atom,
  BookOpen,
  Calculator,
  Code2,
  FlaskConical,
  Languages,
} from "lucide-react";

const subjects = [
  {
    name: "Mathematics",
    value: "Math",
    icon: Calculator,
  },
  {
    name: "Physics",
    value: "Physics",
    icon: Atom,
  },
  {
    name: "Programming",
    value: "Programming",
    icon: Code2,
  },
  {
    name: "IELTS",
    value: "IELTS",
    icon: Languages,
  },
  {
    name: "Chemistry",
    value: "Chemistry",
    icon: FlaskConical,
  },
  {
    name: "English",
    value: "English",
    icon: BookOpen,
  },
];

export function TopSubjects() {
  return (
    <section className="border-y border-border/70 bg-card/50 py-12 md:py-16">
      <div className="site-container space-y-8">
        <div className="space-y-2 text-center">
          <p className="section-eyebrow">
            Explore Your Interests
          </p>

          <h2 className="section-title">
            Learn by Your Favorite Subject
          </h2>

          <p className="section-description mx-auto text-sm md:text-base">
            Discover qualified tutors and personalized learning
            opportunities across popular subjects.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {subjects.map((subject) => {
            const Icon = subject.icon;

            return (
              <Link
                key={subject.value}
                href={`/tuitions?subject=${encodeURIComponent(subject.value)}`}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-background p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/5"
              >
                <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon size={23} strokeWidth={1.8} />
                </span>

                <span className="text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                  {subject.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
