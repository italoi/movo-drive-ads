import { Hero } from "@/components/Hero";
import { ConceptSection } from "@/components/ConceptSection";
import { DriverBenefits } from "@/components/DriverBenefits";
import { AdvertiserBenefits } from "@/components/AdvertiserBenefits";
import { LeadForm } from "@/components/LeadForm";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <ConceptSection />
      <DriverBenefits />
      <AdvertiserBenefits />
      <LeadForm />
      <Footer />
    </div>
  );
};

export default Index;
