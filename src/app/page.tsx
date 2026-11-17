
import { Navbar } from "@/components/layout/navbar";
import { HeroSection } from "@/components/home/hero-section";
import { TopSubjects } from "@/components/home/top-subjects";

export default function Home() {
  return (
    <>
      <Navbar />

      <main>
        <HeroSection />
        <TopSubjects />
      </main>
    </>
  );
}
