import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { latitude, longitude, tipo_servico } = await req.json();

    console.log('Received request:', { latitude, longitude, tipo_servico });

    if (!latitude || !longitude || !tipo_servico) {
      throw new Error('Missing required parameters: latitude, longitude, tipo_servico');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current time
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // Format: HH:MM
    
    console.log('Current time:', currentTime);

    // Fetch all campaigns
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select('*');

    if (error) {
      console.error('Error fetching campaigns:', error);
      throw error;
    }

    console.log(`Found ${campaigns?.length || 0} campaigns`);

    // Filter campaigns based on criteria
    const matchingCampaign = campaigns?.find((campaign) => {
      // Check if tipo_servico matches
      const tipoServicoMatch = campaign.tipos_servico_segmentados.includes(tipo_servico);
      
      if (!tipoServicoMatch) {
        console.log(`Campaign ${campaign.id} - tipo_servico mismatch`);
        return false;
      }

      // Check if current time is within campaign hours
      const startTime = campaign.horario_inicio;
      const endTime = campaign.horario_fim;
      const timeMatch = currentTime >= startTime && currentTime <= endTime;
      
      if (!timeMatch) {
        console.log(`Campaign ${campaign.id} - time mismatch: ${currentTime} not between ${startTime} and ${endTime}`);
        return false;
      }

      // Calculate distance using Haversine formula
      const campaignLat = campaign.localizacao.lat;
      const campaignLng = campaign.localizacao.lng;
      const distance = calculateDistance(latitude, longitude, campaignLat, campaignLng);
      
      console.log(`Campaign ${campaign.id} - distance: ${distance.toFixed(2)} km, radius: ${campaign.raio_km} km`);
      
      const distanceMatch = distance <= campaign.raio_km;

      if (!distanceMatch) {
        console.log(`Campaign ${campaign.id} - distance mismatch`);
        return false;
      }

      console.log(`Campaign ${campaign.id} - MATCHED!`);
      return true;
    });

    if (!matchingCampaign) {
      console.log('No matching campaign found');
      return new Response(
        JSON.stringify({ 
          audio_url: null,
          message: 'Nenhuma campanha disponível para sua localização e horário atual' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    console.log('Returning campaign:', matchingCampaign.id);

    return new Response(
      JSON.stringify({
        campaign_id: matchingCampaign.id,
        audio_url: matchingCampaign.audio_url,
        titulo: matchingCampaign.titulo,
        cliente: matchingCampaign.cliente,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in get_ad_for_driver:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
