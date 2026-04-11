import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/features/landing/HeroSection";
import { HowItWorksSection } from "@/components/features/landing/HowItWorksSection";
import { PricingSection } from "@/components/features/landing/PricingSection";
import { SectorsSection } from "@/components/features/landing/SectorsSection";
import { TestimonialsSection } from "@/components/features/landing/TestimonialsSection";
import { CtaSection } from "@/components/features/landing/CtaSection";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <PricingSection />
        <SectorsSection />
        <TestimonialsSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}