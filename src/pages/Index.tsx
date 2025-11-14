import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ConceptSection } from "@/components/ConceptSection";
import { DriverBenefits } from "@/components/DriverBenefits";
import { AdvertiserBenefits } from "@/components/AdvertiserBenefits";
import { LeadForm } from "@/components/LeadForm";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <ConceptSection />
      <AdvertiserBenefits />
      <DriverBenefits />
      <LeadForm />
      <Footer />
    </div>
  );
};

export default Index;
