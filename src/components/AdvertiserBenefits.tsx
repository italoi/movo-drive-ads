import { Target, Megaphone, BarChart3 } from "lucide-react";

export const AdvertiserBenefits = () => {
  const benefits = [
    {
      icon: Target,
      title: "Hiper-Segmentação",
      description: "Mostre seu anúncio por localização, raio (ex: 2km do seu restaurante), horário ou tipo de corrida (X, Comfort, Black).",
    },
    {
      icon: Megaphone,
      title: "Mídia de Impacto",
      description: "Capture a atenção total do passageiro em um ambiente sem distrações.",
    },
    {
      icon: BarChart3,
      title: "Métricas Reais",
      description: "Saiba exatamente quantas vezes seu áudio foi tocado e onde.",
    },
  ];

  return (
    <section className="py-24 px-6 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Para Anunciantes: Fale com seu cliente no momento da decisão
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="text-center p-8 rounded-lg hover:bg-background transition-colors duration-300"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-6">
                <benefit.icon className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{benefit.title}</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
