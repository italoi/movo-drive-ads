import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export const LeadForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    type: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.type) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Interesse registrado!",
      description: "Entraremos em contato em breve.",
    });

    setFormData({ name: "", email: "", phone: "", type: "" });
  };

  return (
    <section id="lead-form" className="py-24 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            Faça parte da revolução da mídia em mobilidade
          </h2>
          <p className="text-xl text-muted-foreground">
            Deixe seu contato e seja o primeiro a saber do nosso lançamento.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              placeholder="Seu nome completo"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-12 text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="h-12 text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone (WhatsApp)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(00) 00000-0000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="h-12 text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Eu sou...</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger className="h-12 text-lg">
                <SelectValue placeholder="Selecione uma opção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="driver">Motorista de App</SelectItem>
                <SelectItem value="advertiser">Anunciante / Agência</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            type="submit" 
            variant="hero-primary" 
            className="w-full h-14 text-lg"
          >
            Enviar Interesse
          </Button>
        </form>
      </div>
    </section>
  );
};
