import { Button } from "@/components/ui/button";
import heroIllustration from "@/assets/hero-illustration.png";

export const Hero = () => {
  const scrollToLearnMore = () => {
    document.getElementById("concept-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="min-h-screen pt-24 px-6 py-20 relative overflow-hidden">
      {/* Subtle city map pattern background */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left Column - Text Content */}
        <div className="space-y-6 text-left">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
              Uma nova fonte de renda para motoristas de aplicativos
            </h1>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-accent">
              Uma nova mídia no ar. Direto no target.
            </h2>
          </div>
          
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
            O Movo transforma o tempo das corridas em ganhos. Nosso sistema inteligente reproduz anúncios curtos em áudio para o passageiro, baseados 100% na localização do veículo.
          </p>
          
          <div className="pt-4">
            <Button 
              variant="hero-primary" 
              size="lg"
              className="text-lg px-10 py-6 h-auto"
              onClick={scrollToLearnMore}
            >
              Saiba Mais
            </Button>
          </div>
        </div>
        
        {/* Right Column - Illustration */}
        <div className="flex items-center justify-center">
          <img 
            src={heroIllustration} 
            alt="Movo App Concept" 
            className="w-full max-w-lg h-auto object-contain animate-in fade-in duration-1000"
          />
        </div>
      </div>
    </section>
  );
};
