import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Play, Pause, LogOut } from "lucide-react";
import movoLogo from "@/assets/movo-logo-corrected.png";

export default function MotoristaDashboard() {
  const [userEmail, setUserEmail] = useState("");
  const [currentCampaign, setCurrentCampaign] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [totalPlays, setTotalPlays] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    getCurrentUser();
    getTotalPlays();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserEmail(user.email || "");
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

  const getRandomCampaign = async () => {
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .limit(10);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar campanhas",
        variant: "destructive",
      });
      return null;
    }

    if (data && data.length > 0) {
      return data[Math.floor(Math.random() * data.length)];
    }
    return null;
  };

  const handlePlayAd = async () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    const campaign = await getRandomCampaign();
    if (!campaign) {
      toast({
        title: "Sem campanhas",
        description: "Não há campanhas disponíveis no momento",
      });
      return;
    }

    setCurrentCampaign(campaign);
    setIsPlaying(true);

    // Log the play
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("ad_play_logs").insert({
        campaign_id: campaign.id,
        driver_email: user.email,
      });
      
      getTotalPlays();
    }

    // Simulate audio playing for 5 seconds
    setTimeout(() => {
      setIsPlaying(false);
      toast({
        title: "Anúncio tocado!",
        description: "Você ganhou crédito por este anúncio",
      });
    }, 5000);
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
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>

        {/* User Info */}
        <Card className="p-6 mb-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Bem-vindo, Motorista!</h2>
            <p className="text-muted-foreground mb-4">{userEmail}</p>
            <div className="bg-secondary/30 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total de anúncios tocados</p>
              <p className="text-4xl font-bold text-primary">{totalPlays}</p>
            </div>
          </div>
        </Card>

        {/* Play Button */}
        <Card className="p-8">
          <div className="text-center space-y-6">
            <h3 className="text-xl font-semibold">
              {isPlaying ? "Tocando anúncio..." : "Pronto para tocar um anúncio?"}
            </h3>
            
            {currentCampaign && isPlaying && (
              <div className="bg-secondary/30 rounded-lg p-4">
                <p className="font-semibold">{currentCampaign.titulo}</p>
                <p className="text-sm text-muted-foreground">{currentCampaign.cliente}</p>
              </div>
            )}

            <Button
              size="lg"
              className="w-full h-24 text-lg"
              onClick={handlePlayAd}
              disabled={isPlaying}
            >
              {isPlaying ? (
                <>
                  <Pause className="mr-2 h-6 w-6" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="mr-2 h-6 w-6" />
                  Tocar Anúncio
                </>
              )}
            </Button>

            <p className="text-sm text-muted-foreground">
              Toque anúncios durante suas corridas e ganhe renda extra!
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
