import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Play, Pause, LogOut, Car, MapPin, UserCircle } from "lucide-react";
import { Geolocation } from '@capacitor/geolocation';
import movoLogo from "@/assets/movo-logo-corrected.png";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function MotoristaDashboard() {
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [tipoServico, setTipoServico] = useState("");
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [currentCampaign, setCurrentCampaign] = useState<any>(null);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRideActive, setIsRideActive] = useState(false);
  const [totalPlays, setTotalPlays] = useState(0);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    getCurrentUser();
    getTotalPlays();
    loadCampaigns();
    
    // Cleanup audio on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (playTimeoutRef.current) {
        clearTimeout(playTimeoutRef.current);
      }
    };
  }, []);

  const loadCampaigns = async () => {
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading campaigns:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as campanhas",
        variant: "destructive",
      });
      return;
    }

    setCampaigns(data || []);
  };

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserEmail(user.email || "");
      
      // Get profile data
      const { data: profile } = await supabase
        .from("profiles")
        .select("nome, tipo_servico")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (profile) {
        setUserName(profile.nome);
        setTipoServico(profile.tipo_servico);
      }
    }
  };

  const getTotalPlays = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { count } = await supabase
      .from("ad_play_logs")
      .select("*", { count: "exact", head: true })
      .eq("driver_email", user.email);

    setTotalPlays(count || 0);
  };

  const getCurrentLocation = async () => {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      const location = {
        lat: coordinates.coords.latitude,
        lng: coordinates.coords.longitude,
      };
      setCurrentLocation(location);
      console.log('Current location:', location);
      return location;
    } catch (error) {
      console.error('Error getting location:', error);
      toast({
        title: "Erro de localização",
        description: "Não foi possível obter sua localização. Usando localização de teste.",
        variant: "destructive",
      });
      // Fallback location (São Paulo center)
      const fallbackLocation = { lat: -23.5505, lng: -46.6333 };
      setCurrentLocation(fallbackLocation);
      return fallbackLocation;
    }
  };

  const getAdForDriver = async (location: { lat: number; lng: number }) => {
    try {
      console.log('Calling get_ad_for_driver with:', { location, tipoServico });
      
      const { data, error } = await supabase.functions.invoke('get_ad_for_driver', {
        body: {
          latitude: location.lat,
          longitude: location.lng,
          tipo_servico: tipoServico,
        },
      });

      if (error) {
        console.error('Error calling get_ad_for_driver:', error);
        throw error;
      }

      console.log('Response from get_ad_for_driver:', data);

      if (!data.audio_url) {
        toast({
          title: "Sem campanhas",
          description: data.message || "Nenhuma campanha disponível para sua localização",
        });
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getAdForDriver:', error);
      toast({
        title: "Erro",
        description: "Não foi possível buscar campanha",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleStartRide = async () => {
    if (!isRideActive) {
      if (!selectedCampaignId) {
        toast({
          title: "Selecione uma campanha",
          description: "Escolha uma campanha antes de iniciar a corrida",
          variant: "destructive",
        });
        return;
      }

      const location = await getCurrentLocation();
      
      if (!tipoServico) {
        toast({
          title: "Perfil incompleto",
          description: "Configure seu tipo de serviço no perfil",
          variant: "destructive",
        });
        return;
      }

      setIsRideActive(true);
      setCurrentAudioIndex(0); // Reset to first audio
      toast({
        title: "Corrida iniciada!",
        description: "Os anúncios serão tocados em sequência...",
      });
      
      // Start playing the first audio immediately
      playSelectedCampaignAudio(0);
    } else {
      setIsRideActive(false);
      setIsPlaying(false);
      
      // Stop audio if playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      
      // Clear timeout
      if (playTimeoutRef.current) {
        clearTimeout(playTimeoutRef.current);
        playTimeoutRef.current = null;
      }
      
      toast({
        title: "Corrida finalizada",
        description: "Você pode iniciar uma nova corrida quando quiser",
      });
    }
  };

  const playSelectedCampaignAudio = async (audioIndex: number) => {
    const campaign = campaigns.find(c => c.id === selectedCampaignId);
    
    if (!campaign || !campaign.audio_urls || campaign.audio_urls.length === 0) {
      toast({
        title: "Erro",
        description: "Campanha não possui áudios",
        variant: "destructive",
      });
      return;
    }

    // Get current audio URL from the array
    const audioUrl = campaign.audio_urls[audioIndex];
    
    if (!audioUrl) {
      console.error('Audio URL not found at index:', audioIndex);
      return;
    }

    console.log(`Playing audio ${audioIndex + 1} of ${campaign.audio_urls.length}`);
    setCurrentCampaign(campaign);
    setIsPlaying(true);

    // Create audio element and play
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onloadeddata = () => {
      console.log('Audio loaded, starting playback');
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        toast({
          title: "Erro ao tocar áudio",
          description: "Não foi possível reproduzir o anúncio",
          variant: "destructive",
        });
        setIsPlaying(false);
      });
    };

    audio.onplay = async () => {
      console.log('Audio started playing, logging to database');
      
      // Log the play immediately when audio starts
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.from("ad_play_logs").insert({
          campaign_id: campaign.id,
          driver_email: user.email,
        });
        
        if (error) {
          console.error('Error logging ad play:', error);
        } else {
          console.log('Ad play logged successfully');
          getTotalPlays();
        }
      }
    };

    audio.onended = () => {
      console.log('Audio ended');
      setIsPlaying(false);
      
      if (!isRideActive) {
        console.log('Ride is not active, stopping playback');
        return;
      }
      
      // Calculate next index
      const nextIndex = (audioIndex + 1) % campaign.audio_urls.length;
      setCurrentAudioIndex(nextIndex);
      
      console.log(`Scheduling next audio (index ${nextIndex}) in 45 seconds`);
      
      // Wait 45 seconds before playing next audio
      playTimeoutRef.current = setTimeout(() => {
        playSelectedCampaignAudio(nextIndex);
      }, 45000);
    };

    audio.onerror = (error) => {
      console.error('Audio error:', error);
      setIsPlaying(false);
      toast({
        title: "Erro no áudio",
        description: "Houve um problema ao tocar o anúncio",
        variant: "destructive",
      });
    };
  };

  const handlePauseAd = () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      toast({
        title: "Anúncio pausado",
        description: "O anúncio foi pausado temporariamente",
      });
    }
  };

  const handlePlayAd = async (location?: { lat: number; lng: number }) => {
    if (!isRideActive) {
      toast({
        title: "Inicie uma corrida primeiro",
        description: "Você precisa iniciar uma corrida para tocar anúncios",
      });
      return;
    }

    const locationToUse = location || currentLocation;
    if (!locationToUse) {
      toast({
        title: "Localização não disponível",
        description: "Aguarde enquanto obtemos sua localização",
      });
      return;
    }

    // Get ad based on location and tipo_servico
    const campaignData = await getAdForDriver(locationToUse);
    
    if (!campaignData || !campaignData.audio_url) {
      // Wait and try again if ride is still active
      if (isRideActive) {
        setTimeout(() => handlePlayAd(), 5000);
      }
      return;
    }

    setCurrentCampaign(campaignData);
    setIsPlaying(true);

    // Create audio element and play
    const audio = new Audio(campaignData.audio_url);
    audioRef.current = audio;

    audio.onloadeddata = () => {
      console.log('Audio loaded, starting playback');
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        toast({
          title: "Erro ao tocar áudio",
          description: "Não foi possível reproduzir o anúncio",
          variant: "destructive",
        });
        setIsPlaying(false);
      });
    };

    audio.onplay = async () => {
      console.log('Audio started playing, logging to database');
      
      // Log the play immediately when audio starts
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.from("ad_play_logs").insert({
          campaign_id: campaignData.campaign_id,
          driver_email: user.email,
        });
        
        if (error) {
          console.error('Error logging ad play:', error);
        } else {
          console.log('Ad play logged successfully');
          getTotalPlays();
        }
      }
    };

    audio.onended = () => {
      console.log('Audio ended');
      setIsPlaying(false);
      toast({
        title: "Anúncio tocado!",
        description: "Você ganhou crédito por este anúncio",
      });
      
      // Auto-play next ad if ride is still active
      if (isRideActive) {
        setTimeout(() => handlePlayAd(), 3000);
      }
    };

    audio.onerror = (error) => {
      console.error('Audio error:', error);
      setIsPlaying(false);
      toast({
        title: "Erro no áudio",
        description: "Houve um problema ao tocar o anúncio",
        variant: "destructive",
      });
      
      // Try next ad if ride is still active
      if (isRideActive) {
        setTimeout(() => handlePlayAd(), 3000);
      }
    };
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/motorista-login");
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <img src={movoLogo} alt="Movo" className="h-12" />
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/perfil-motorista")}>
              <UserCircle className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* User Info */}
        <Card className="p-6 mb-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">
              {userName || "Motorista"}
            </h2>
            <p className="text-lg text-muted-foreground mb-1">
              {tipoServico || "Tipo de serviço não informado"}
            </p>
            <p className="text-sm text-muted-foreground mb-2">{userEmail}</p>
            
            {currentLocation && (
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-4">
                <MapPin className="h-3 w-3" />
                <span>
                  {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                </span>
              </div>
            )}
            
            <div className="bg-secondary/30 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total de anúncios tocados</p>
              <p className="text-4xl font-bold text-primary">{totalPlays}</p>
            </div>
          </div>
        </Card>

        {/* Campaign Selection */}
        <Card className="p-6 mb-4">
          <div className="space-y-4">
            <label className="text-sm font-medium">Campanhas próximas de você</label>
            <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId} disabled={isRideActive}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma campanha" />
              </SelectTrigger>
              <SelectContent>
                {campaigns.map((campaign) => (
                  <SelectItem key={campaign.id} value={campaign.id}>
                    {campaign.titulo} - {campaign.cliente}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Ride Control */}
        <Card className="p-8 mb-4">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-2">
              <Car className="h-6 w-6" />
              <h3 className="text-xl font-semibold">
                {isRideActive ? "Corrida em andamento" : "Iniciar nova corrida"}
              </h3>
            </div>
            
            {currentCampaign && isPlaying && (
              <div className="bg-secondary/30 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Tocando agora:</p>
                <p className="font-semibold">{currentCampaign.titulo}</p>
                <p className="text-sm text-muted-foreground">{currentCampaign.cliente}</p>
              </div>
            )}

            <Button
              size="lg"
              className="w-full h-24 text-lg bg-green-600 hover:bg-green-700 text-white"
              onClick={handleStartRide}
            >
              {isRideActive ? (
                <>
                  <Pause className="mr-2 h-6 w-6" />
                  Finalizar Corrida
                </>
              ) : (
                <>
                  <Car className="mr-2 h-6 w-6" />
                  Iniciar Corrida
                </>
              )}
            </Button>

            {isRideActive && (
              <>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={handlePauseAd}
                  disabled={!isPlaying}
                >
                  <Pause className="mr-2 h-5 w-5" />
                  Pausar Anúncio
                </Button>

                {/* Lista de anúncios que serão tocados */}
                {currentCampaign && currentCampaign.audio_urls && (
                  <div className="bg-secondary/20 rounded-lg p-4 mt-4">
                    <h4 className="text-sm font-semibold mb-3 text-center">
                      Lista de Anúncios ({currentCampaign.audio_urls.length} total)
                    </h4>
                    <div className="space-y-2">
                      {currentCampaign.audio_urls.map((audioUrl: string, index: number) => (
                        <div
                          key={index}
                          className={`flex items-center gap-3 p-3 rounded-md transition-colors ${
                            index === currentAudioIndex && isPlaying
                              ? 'bg-primary/20 border-2 border-primary'
                              : 'bg-background/50'
                          }`}
                        >
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                            index === currentAudioIndex && isPlaying
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {index === currentAudioIndex && isPlaying ? (
                              <Play className="h-4 w-4" />
                            ) : (
                              <span className="text-sm font-semibold">{index + 1}</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              Anúncio {index + 1}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {index === currentAudioIndex && isPlaying
                                ? '🔊 Tocando agora'
                                : index < currentAudioIndex
                                ? '✓ Já tocado'
                                : `Aguardando (${(index - currentAudioIndex) * 45}s)`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <p className="text-sm text-muted-foreground">
              {isRideActive 
                ? "Os anúncios serão tocados em sequência com 45 segundos de intervalo"
                : "Selecione uma campanha e inicie a corrida para começar a ganhar"}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
