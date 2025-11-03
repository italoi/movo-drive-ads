import { Button } from "@/components/ui/button";
import movoLogo from "@/assets/movo-logo.png";

export const Hero = () => {
  const scrollToForm = () => {
    document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="min-h-[90vh] flex flex-col items-center justify-center px-6 py-20">
      <div className="max-w-5xl mx-auto text-center space-y-8">
        <div className="mb-12">
          <img 
            src={movoLogo} 
            alt="Movo Logo" 
            className="h-24 w-24 mx-auto mb-8 object-contain"
          />
        </div>
        
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
          Uma nova fonte de renda para motoristas de aplicativos
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          O Movo transforma o tempo ocioso das corridas em ganhos. Nosso sistema inteligente reproduz anúncios curtos em áudio para o passageiro, baseados 100% na localização do veículo.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Button 
            variant="hero-primary" 
            size="lg"
            className="text-lg px-10 py-6 h-auto"
            onClick={scrollToForm}
          >
            Quero ser Motorista Parceiro
          </Button>
          <Button 
            variant="hero-secondary" 
            size="lg"
            className="text-lg px-10 py-6 h-auto"
            onClick={scrollToForm}
          >
            Quero Anunciar no Movo
          </Button>
        </div>
      </div>
    </section>
  );
};
