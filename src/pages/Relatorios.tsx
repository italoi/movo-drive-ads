import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type AdPlayLog = {
  id: string;
  campaign_id: string;
  driver_id: string;
  played_at: string;
  campaign_titulo: string;
  driver_nome: string;
};

const Relatorios = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [logs, setLogs] = useState<AdPlayLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("ad_play_logs")
        .select(`
          id,
          campaign_id,
          driver_id,
          played_at,
          campaigns (titulo),
          profiles (nome)
        `)
        .order("played_at", { ascending: false });

      if (error) throw error;

      const formattedLogs = (data || []).map((log: any) => ({
        id: log.id,
        campaign_id: log.campaign_id,
        driver_id: log.driver_id,
        played_at: log.played_at,
        campaign_titulo: log.campaigns?.titulo || "Campanha não encontrada",
        driver_nome: log.profiles?.nome || "Motorista não encontrado",
      }));

      setLogs(formattedLogs);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar relatórios",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Relatórios de Reprodução</h1>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Voltar
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Nenhum registro de reprodução encontrado
          </div>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título da Campanha</TableHead>
                  <TableHead>Nome do Motorista</TableHead>
                  <TableHead>Data/Hora da Reprodução</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.campaign_titulo}</TableCell>
                    <TableCell>{log.driver_nome}</TableCell>
                    <TableCell>{formatDateTime(log.played_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  );
};

export default Relatorios;
