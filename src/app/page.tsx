
import { Navbar } from "@/components/layout/navbar";
import { HeroSection } from "@/components/home/hero-section";
import { TopSubjects } from "@/components/home/top-subjects";
import { FeaturedTuitions } from "@/components/home/featured-tuitions";
import { HowItWorks } from "@/components/home/how-it-works";
import { StatsTestimonials } from "@/components/home/stats-testimonials";
import { PricingSection } from "@/components/home/pricing-section";

export default function Home() {
  return (
    <>
      <Navbar />

      <main>
        <HeroSection />
        <TopSubjects />
        <FeaturedTuitions />
        <HowItWorks />
        <StatsTestimonials />
        <PricingSection />
      </main>
    </>
  );
}
