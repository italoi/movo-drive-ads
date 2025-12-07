import { DollarSign, Smartphone, Shield, Settings } from "lucide-react";

export const DriverBenefits = () => {
  const benefits = [
    {
      icon: DollarSign,
      title: "Renda Passiva",
      description: "Receba um valor extra por cada anúncio tocado em suas corridas.",
    },
    {
      icon: Smartphone,
      title: "Zero Custo",
      description: "O aplicativo é 100% gratuito para motoristas parceiros.",
    },
    {
      icon: Shield,
      title: "Não Invasivo",
      description: "Anúncios curtos e relevantes que não atrapalham a experiência do passageiro.",
    },
    {
      icon: Settings,
      title: "Controle Total",
      description: "Botão de pausa fácil caso precise interromper um áudio.",
    },
  ];

  return (
    <section className="py-14 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Para Motoristas: Ganhe mais sem fazer nada
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="flex gap-6 p-6 rounded-lg hover:bg-secondary/30 transition-colors duration-300"
            >
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
                  <benefit.icon className="w-7 h-7 text-accent" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
