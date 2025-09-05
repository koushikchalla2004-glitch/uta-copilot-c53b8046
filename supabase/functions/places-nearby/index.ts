import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lng, category, limit = 5 } = await req.json();
    
    if (!lat || !lng) {
      return new Response(JSON.stringify({
        error: 'Latitude and longitude are required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Finding places near ${lat}, ${lng} with category: ${category || 'all'}`);

    // Get nearby buildings from the database
    let buildingsQuery = supabase
      .from('buildings')
      .select('*');

    if (category) {
      buildingsQuery = buildingsQuery.ilike('category', `%${category}%`);
    }

    const { data: buildings, error: buildingsError } = await buildingsQuery;

    if (buildingsError) {
      console.error('Error fetching buildings:', buildingsError);
      return new Response(JSON.stringify({
        error: 'Failed to fetch buildings'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate distances and sort by proximity
    const buildingsWithDistance = buildings?.map(building => {
      if (!building.lat || !building.lng) return null;
      
      const distance = calculateDistance(lat, lng, building.lat, building.lng);
      return {
        ...building,
        distance_km: distance,
        distance_miles: distance * 0.621371
      };
    }).filter(Boolean) || [];

    // Sort by distance and limit results
    const nearbyBuildings = buildingsWithDistance
      .sort((a, b) => a.distance_km - b.distance_km)
      .slice(0, limit);

    // Get nearby dining locations
    const { data: dining, error: diningError } = await supabase
      .from('dining_locations')
      .select('*')
      .limit(limit);

    if (diningError) {
      console.error('Error fetching dining:', diningError);
    }

    // Get nearby events (within next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .gte('start_time', new Date().toISOString())
      .lte('start_time', nextWeek.toISOString())
      .limit(limit);

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
    }

    const response = {
      success: true,
      location: { lat, lng },
      results: {
        buildings: nearbyBuildings.map(building => ({
          ...building,
          type: 'building',
          distance: `${building.distance_miles.toFixed(1)} mi`
        })),
        dining: dining?.map(location => ({
          ...location,
          type: 'dining'
        })) || [],
        events: events?.map(event => ({
          ...event,
          type: 'event'
        })) || []
      },
      total_results: nearbyBuildings.length + (dining?.length || 0) + (events?.length || 0)
    };

    console.log(`Found ${response.total_results} nearby places`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in places-nearby function:', error);
    
    return new Response(JSON.stringify({
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper function to calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}