import { MapPin, Radio, Volume2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export const ConceptSection = () => {
  const concepts = [
    {
      icon: Radio,
      title: "GPS Ativo",
      description: "O motorista dirige normalmente com o app Movo ativo.",
    },
    {
      icon: MapPin,
      title: "Zona de Anúncio",
      description: "Ao entrar em uma área de campanha (ex: perto de um shopping), o app identifica a zona.",
    },
    {
      icon: Volume2,
      title: "Áudio Relevante",
      description: "Um anúncio curto é reproduzido para o passageiro. Simples assim.",
    },
  ];

  return (
    <section id="concept-section" className="py-24 px-6 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            Publicidade que se move com a cidade
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            O Movo usa o GPS do seu celular para tocar o anúncio certo, no lugar certo.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {concepts.map((concept, index) => (
            <Card 
              key={index}
              className="p-8 text-center hover:shadow-lg transition-shadow duration-300 border-2"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-6">
                <concept.icon className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{concept.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {concept.description}
              </p>
            </Card>
          ))}
        </div>

        <div className="max-w-3xl mx-auto">
          <Card className="p-8 border-2 border-accent/20 bg-accent/5">
            <p className="text-lg leading-relaxed">
              <strong className="font-bold">Atenção:</strong> O Movo <strong>NÃO</strong> é uma rádio. Ele não toca música e não interrompe sua navegação. Ele apenas reproduz anúncios de áudio curtos (10-15 segundos) em locais específicos.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
};
