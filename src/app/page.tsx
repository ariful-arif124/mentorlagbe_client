
import { Navbar } from "@/components/layout/navbar";
import { HeroSection } from "@/components/home/hero-section";
import { TopSubjects } from "@/components/home/top-subjects";
import { FeaturedTuitions } from "@/components/home/featured-tuitions";

export default function Home() {
  return (
    <>
      <Navbar />

      <main>
        <HeroSection />
        <TopSubjects />
        <FeaturedTuitions />
      </main>
    </>
  );
}
