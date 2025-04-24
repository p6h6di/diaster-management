import BenefitsSection from "@/components/benefits-section";
import CaseStudySection from "@/components/case-study-section";
import CTASection from "@/components/cta-section";
import HeroSection from "@/components/hero-section";
import HowItWorks from "@/components/how-it-works";
import TeamSection from "@/components/team-section";

export default function Home() {
  return (
    <main className="space-y-8">
      <HeroSection />
      <HowItWorks />
      <BenefitsSection />
      <CaseStudySection />
      <TeamSection />
      <CTASection />
    </main>
  );
}
