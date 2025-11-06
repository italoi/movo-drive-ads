import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, MapPin, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

type Campaign = {
  id: string;
  titulo: string;
  cliente: string;
  horario_inicio: string;
  horario_fim: string;
  raio_km: number;
  tipos_servico_segmentados: string[];
  localizacao: { lat: number; lng: number };
  audio_url: string | null;
  created_at: string;
};

const Campanhas = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  const [mapboxToken, setMapboxToken] = useState("");
  const [showTokenInput, setShowTokenInput] = useState(true);
  const [loading, setLoading] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  
  const [formData, setFormData] = useState({
    titulo: "",
    cliente: "",
    horario_inicio: "",
    horario_fim: "",
    raio_km: "",
    tipos_servico_segmentados: [] as string[],
    localizacao: { lat: -23.5505, lng: -46.6333 }, // São Paulo default
    audio_url: "",
  });

  const servicoOptions = ["X", "Comfort", "Black"];

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const mappedCampaigns = (data || []).map(campaign => ({
        ...campaign,
        localizacao: campaign.localizacao as { lat: number; lng: number }
      }));
      
      setCampaigns(mappedCampaigns);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar campanhas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingCampaigns(false);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta campanha?")) return;

    try {
      const { error } = await supabase
        .from("campaigns")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Campanha excluída",
        description: "A campanha foi excluída com sucesso",
      });

      fetchCampaigns();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir campanha",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const initializeMap = (token: string) => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = token;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [formData.localizacao.lng, formData.localizacao.lat],
      zoom: 12,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add initial marker
    marker.current = new mapboxgl.Marker({ draggable: true })
      .setLngLat([formData.localizacao.lng, formData.localizacao.lat])
      .addTo(map.current);

    // Update location on drag
    marker.current.on("dragend", () => {
      const lngLat = marker.current?.getLngLat();
      if (lngLat) {
        setFormData(prev => ({
          ...prev,
          localizacao: { lat: lngLat.lat, lng: lngLat.lng }
        }));
      }
    });

    // Add marker on click
    map.current.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      setFormData(prev => ({
        ...prev,
        localizacao: { lat, lng }
      }));
      marker.current?.setLngLat([lng, lat]);
    });
  };

  const handleTokenSubmit = () => {
    if (!mapboxToken.trim()) {
      toast({
        title: "Token necessário",
        description: "Por favor, insira seu token do Mapbox",
        variant: "destructive",
      });
      return;
    }
    setShowTokenInput(false);
    initializeMap(mapboxToken);
  };

  const handleServicoToggle = (servico: string) => {
    setFormData(prev => ({
      ...prev,
      tipos_servico_segmentados: prev.tipos_servico_segmentados.includes(servico)
        ? prev.tipos_servico_segmentados.filter(s => s !== servico)
        : [...prev.tipos_servico_segmentados, servico]
    }));
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("audio/")) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo de áudio",
        variant: "destructive",
      });
      return;
    }

    setUploadingAudio(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("audios")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("audios")
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, audio_url: publicUrl }));

      toast({
        title: "Áudio enviado",
        description: "Arquivo de áudio carregado com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro no upload",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingAudio(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titulo || !formData.cliente || !formData.horario_inicio || 
        !formData.horario_fim || !formData.raio_km || 
        formData.tipos_servico_segmentados.length === 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos do formulário",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("campaigns").insert({
        titulo: formData.titulo,
        cliente: formData.cliente,
        horario_inicio: formData.horario_inicio,
        horario_fim: formData.horario_fim,
        raio_km: parseFloat(formData.raio_km),
        tipos_servico_segmentados: formData.tipos_servico_segmentados,
        localizacao: formData.localizacao,
        audio_url: formData.audio_url || null,
        created_by: user!.id,
      });

      if (error) throw error;

      toast({
        title: "Campanha criada",
        description: "A campanha foi criada com sucesso",
      });

      fetchCampaigns();
      
      // Reset form
      setFormData({
        titulo: "",
        cliente: "",
        horario_inicio: "",
        horario_fim: "",
        raio_km: "",
        tipos_servico_segmentados: [],
        localizacao: { lat: -23.5505, lng: -46.6333 },
        audio_url: "",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao criar campanha",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Nova Campanha</h1>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Voltar
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                placeholder="Nome da campanha"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cliente">Cliente</Label>
              <Input
                id="cliente"
                value={formData.cliente}
                onChange={(e) => setFormData(prev => ({ ...prev, cliente: e.target.value }))}
                placeholder="Nome do cliente"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="horario_inicio">Horário Início</Label>
              <Input
                id="horario_inicio"
                type="time"
                value={formData.horario_inicio}
                onChange={(e) => setFormData(prev => ({ ...prev, horario_inicio: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="horario_fim">Horário Fim</Label>
              <Input
                id="horario_fim"
                type="time"
                value={formData.horario_fim}
                onChange={(e) => setFormData(prev => ({ ...prev, horario_fim: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="raio_km">Raio (km)</Label>
              <Input
                id="raio_km"
                type="number"
                step="0.1"
                value={formData.raio_km}
                onChange={(e) => setFormData(prev => ({ ...prev, raio_km: e.target.value }))}
                placeholder="5.0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tipos de Serviço</Label>
            <div className="flex gap-4">
              {servicoOptions.map((servico) => (
                <div key={servico} className="flex items-center space-x-2">
                  <Checkbox
                    id={servico}
                    checked={formData.tipos_servico_segmentados.includes(servico)}
                    onCheckedChange={() => handleServicoToggle(servico)}
                  />
                  <Label htmlFor={servico} className="cursor-pointer">{servico}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Localização</Label>
            {showTokenInput ? (
              <div className="border border-border rounded-lg p-6 bg-card">
                <p className="text-sm text-muted-foreground mb-4">
                  Para usar o mapa, insira seu token do Mapbox. Obtenha em:{" "}
                  <a 
                    href="https://account.mapbox.com/access-tokens/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    mapbox.com/tokens
                  </a>
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="pk.eyJ1..."
                    value={mapboxToken}
                    onChange={(e) => setMapboxToken(e.target.value)}
                  />
                  <Button type="button" onClick={handleTokenSubmit}>
                    <MapPin className="w-4 h-4 mr-2" />
                    Ativar Mapa
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div ref={mapContainer} className="h-96 rounded-lg border border-border" />
                <p className="text-sm text-muted-foreground mt-2">
                  Lat: {formData.localizacao.lat.toFixed(6)}, Lng: {formData.localizacao.lng.toFixed(6)}
                </p>
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="audio">Áudio (opcional)</Label>
            <div className="flex items-center gap-4">
              <Input
                id="audio"
                type="file"
                accept="audio/*"
                onChange={handleAudioUpload}
                disabled={uploadingAudio}
                className="flex-1"
              />
              {uploadingAudio && <Loader2 className="w-4 h-4 animate-spin" />}
              {formData.audio_url && (
                <span className="text-sm text-green-600">✓ Enviado</span>
              )}
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Criando campanha...
              </>
            ) : (
              "Criar Campanha"
            )}
          </Button>
        </form>

        <div className="max-w-4xl mx-auto mt-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Campanhas Cadastradas</h2>
          
          {loadingCampaigns ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma campanha cadastrada ainda
            </div>
          ) : (
            <div className="border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Horário</TableHead>
                    <TableHead>Raio (km)</TableHead>
                    <TableHead>Serviços</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">{campaign.titulo}</TableCell>
                      <TableCell>{campaign.cliente}</TableCell>
                      <TableCell>
                        {campaign.horario_inicio} - {campaign.horario_fim}
                      </TableCell>
                      <TableCell>{campaign.raio_km}</TableCell>
                      <TableCell>{campaign.tipos_servico_segmentados.join(", ")}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCampaign(campaign.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Campanhas;