import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Car } from "lucide-react";
import { z } from "zod";

const profileSchema = z.object({
  nome: z.string().trim().min(3, "Nome deve ter no mínimo 3 caracteres").max(100, "Nome muito longo"),
  tipo_servico: z.enum(["taxi", "uber", "99", "outro"], {
    errorMap: () => ({ message: "Selecione um tipo de serviço" })
  })
});

const PerfilMotorista = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [nome, setNome] = useState("");
  const [tipoServico, setTipoServico] = useState("");
  const [errors, setErrors] = useState<{ nome?: string; tipo_servico?: string }>({});

  useEffect(() => {
    if (!user) {
      navigate("/motorista-login");
      return;
    }

    // Verificar se já existe perfil
    const checkProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') throw error;

        if (data) {
          // Se já tem perfil, preencher os campos
          setNome(data.nome);
          setTipoServico(data.tipo_servico);
        }
      } catch (error) {
        console.error("Erro ao verificar perfil:", error);
      } finally {
        setCheckingProfile(false);
      }
    };

    checkProfile();
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    setErrors({});
    setLoading(true);

    try {
      // Validar dados
      const validated = profileSchema.parse({
        nome: nome,
        tipo_servico: tipoServico
      });

      // Verificar se já existe perfil
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingProfile) {
        // Atualizar perfil existente
        const { error } = await supabase
          .from("profiles")
          .update({
            nome: validated.nome,
            tipo_servico: validated.tipo_servico,
            updated_at: new Date().toISOString()
          })
          .eq("user_id", user.id);

        if (error) throw error;

        toast({
          title: "Perfil atualizado!",
          description: "Suas informações foram atualizadas com sucesso.",
        });
      } else {
        // Criar novo perfil
        const { error } = await supabase
          .from("profiles")
          .insert({
            user_id: user.id,
            nome: validated.nome,
            tipo_servico: validated.tipo_servico
          });

        if (error) throw error;

        toast({
          title: "Perfil criado!",
          description: "Seu perfil foi configurado com sucesso.",
        });
      }

      // Redirecionar para o dashboard
      navigate("/motorista");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { nome?: string; tipo_servico?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof typeof fieldErrors] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        console.error("Erro ao salvar perfil:", error);
        toast({
          title: "Erro",
          description: "Não foi possível salvar o perfil. Tente novamente.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <User className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Configurar Perfil</CardTitle>
          <CardDescription className="text-center">
            Complete suas informações para liberar as funcionalidades do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                type="text"
                placeholder="Digite seu nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                disabled={loading}
              />
              {errors.nome && (
                <p className="text-sm text-destructive">{errors.nome}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_servico">Tipo de Serviço</Label>
              <Select
                value={tipoServico}
                onValueChange={setTipoServico}
                disabled={loading}
              >
                <SelectTrigger id="tipo_servico">
                  <SelectValue placeholder="Selecione o tipo de serviço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="taxi">
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      Táxi
                    </div>
                  </SelectItem>
                  <SelectItem value="uber">
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      Uber
                    </div>
                  </SelectItem>
                  <SelectItem value="99">
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      99
                    </div>
                  </SelectItem>
                  <SelectItem value="outro">
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      Outro
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.tipo_servico && (
                <p className="text-sm text-destructive">{errors.tipo_servico}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Perfil"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerfilMotorista;
