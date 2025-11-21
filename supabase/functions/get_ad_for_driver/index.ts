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
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with the user's JWT
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Verify the user has motorista role
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'motorista')
      .maybeSingle();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: motorista role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { latitude, longitude, tipo_servico, is_start_of_ride } = await req.json();

    if (!latitude || !longitude || !tipo_servico) {
      throw new Error('Missing required parameters: latitude, longitude, tipo_servico');
    }

    console.log('[get_ad_for_driver] Request params:', { latitude, longitude, tipo_servico, is_start_of_ride });

    // Use the authenticated client to fetch campaigns (respects RLS)
    // Get current time
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // Format: HH:MM

    // Fetch all campaigns using authenticated client (RLS applies)
    const { data: campaigns, error } = await supabaseClient
      .from('campaigns')
      .select('*');

    if (error) {
      console.error('[get_ad_for_driver] Error fetching campaigns:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch campaigns' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[get_ad_for_driver] Found ${campaigns?.length || 0} total campaigns`);

    let matchingCampaign = null;

    // PRIORITY 1: If it's the start of ride, look for a generic campaign
    if (is_start_of_ride) {
      console.log('[get_ad_for_driver] Looking for generic campaign (start of ride)');
      matchingCampaign = campaigns?.find((campaign) => {
        if (campaign.tipo_campanha !== 'generica') return false;
        
        // Check if tipo_servico matches
        const tipoServicoMatch = campaign.tipos_servico_segmentados.includes(tipo_servico);
        if (!tipoServicoMatch) return false;

        // Check if current time is within campaign hours
        const startTime = campaign.horario_inicio;
        const endTime = campaign.horario_fim;
        const timeMatch = currentTime >= startTime && currentTime <= endTime;
        
        return timeMatch;
      });

      if (matchingCampaign) {
        console.log('[get_ad_for_driver] Found generic campaign:', matchingCampaign.titulo);
      }
    }

    // PRIORITY 2: If no generic campaign found or not start of ride, look for georeferenced campaigns
    if (!matchingCampaign) {
      console.log('[get_ad_for_driver] Looking for georeferenced campaign');
      matchingCampaign = campaigns?.find((campaign) => {
        if (campaign.tipo_campanha !== 'georreferenciada') return false;
        if (!campaign.localizacao || !campaign.raio_km) return false;

        // Check if tipo_servico matches
        const tipoServicoMatch = campaign.tipos_servico_segmentados.includes(tipo_servico);
        if (!tipoServicoMatch) return false;

        // Check if current time is within campaign hours
        const startTime = campaign.horario_inicio;
        const endTime = campaign.horario_fim;
        const timeMatch = currentTime >= startTime && currentTime <= endTime;
        if (!timeMatch) return false;

        // Calculate distance using Haversine formula
        const campaignLat = campaign.localizacao.lat;
        const campaignLng = campaign.localizacao.lng;
        const distance = calculateDistance(latitude, longitude, campaignLat, campaignLng);
        
        console.log(`[get_ad_for_driver] Campaign ${campaign.titulo}: distance=${distance.toFixed(2)}km, raio=${campaign.raio_km}km`);
        
        return distance <= campaign.raio_km;
      });

      if (matchingCampaign) {
        console.log('[get_ad_for_driver] Found georeferenced campaign:', matchingCampaign.titulo);
      }
    }

    // PRIORITY 3: For demo - if start of ride and no match, find any campaign respecting time and service type
    if (!matchingCampaign && is_start_of_ride) {
      console.log('[get_ad_for_driver] Demo fallback: looking for any campaign (ignoring distance)');
      matchingCampaign = campaigns?.find((campaign) => {
        const tipoServicoMatch = campaign.tipos_servico_segmentados.includes(tipo_servico);
        if (!tipoServicoMatch) return false;

        const startTime = campaign.horario_inicio;
        const endTime = campaign.horario_fim;
        const timeMatch = currentTime >= startTime && currentTime <= endTime;
        
        return timeMatch;
      });

      if (matchingCampaign) {
        console.log('[get_ad_for_driver] Found campaign with relaxed filters:', matchingCampaign.titulo);
      }
    }

    // PRIORITY 4: Ultimate fallback for demo - return first available campaign
    if (!matchingCampaign && is_start_of_ride && campaigns && campaigns.length > 0) {
      console.log('[get_ad_for_driver] Ultimate demo fallback: returning first campaign');
      matchingCampaign = campaigns[0];
    }

    if (!matchingCampaign) {
      console.log('[get_ad_for_driver] No matching campaign found');
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

    console.log('[get_ad_for_driver] Returning campaign:', {
      id: matchingCampaign.id,
      titulo: matchingCampaign.titulo,
      tipo: matchingCampaign.tipo_campanha
    });

    return new Response(
      JSON.stringify({
        campaign_id: matchingCampaign.id,
        audio_urls: matchingCampaign.audio_urls,
        titulo: matchingCampaign.titulo,
        cliente: matchingCampaign.cliente,
        tipo_campanha: matchingCampaign.tipo_campanha,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
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
