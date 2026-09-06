import {
  ClosingCtaSection,
  FaqSection,
  HeroSection,
  HowItWorksSection,
  MirrorSection,
  MobileAppSection,
  PricingSection,
  SiteFooter,
  SiteHeader,
  TestimonialsSection,
} from "@/features/marketing";

export default function LandingPage() {
  return (
    <div className="min-h-dvh overflow-x-hidden bg-surface">
      <SiteHeader />
      <main>
        <HeroSection />
        <MobileAppSection />
        <HowItWorksSection />
        <MirrorSection />
        <TestimonialsSection />
        <PricingSection />
        <FaqSection />
        <ClosingCtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
