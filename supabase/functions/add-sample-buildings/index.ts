import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

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
    console.log('Adding sample UTA building data...');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Sample UTA buildings with real coordinates
    const utaBuildings = [
      {
        name: 'Engineering Research Building',
        code: 'ERB',
        category: 'Academic',
        lat: 32.7357,
        lng: -97.1131,
        hours: [
          { day: 'Monday', open: '06:00', close: '22:00' },
          { day: 'Tuesday', open: '06:00', close: '22:00' },
          { day: 'Wednesday', open: '06:00', close: '22:00' },
          { day: 'Thursday', open: '06:00', close: '22:00' },
          { day: 'Friday', open: '06:00', close: '20:00' }
        ]
      },
      {
        name: 'Central Library',
        code: 'LIB',
        category: 'Academic',
        lat: 32.7298,
        lng: -97.1137,
        hours: [
          { day: 'Monday', open: '07:00', close: '24:00' },
          { day: 'Tuesday', open: '07:00', close: '24:00' },
          { day: 'Wednesday', open: '07:00', close: '24:00' },
          { day: 'Thursday', open: '07:00', close: '24:00' },
          { day: 'Friday', open: '07:00', close: '22:00' }
        ]
      },
      {
        name: 'Maverick Activities Center',
        code: 'MAC',
        category: 'Recreation',
        lat: 32.7312,
        lng: -97.1089,
        hours: [
          { day: 'Monday', open: '05:30', close: '23:00' },
          { day: 'Tuesday', open: '05:30', close: '23:00' },
          { day: 'Wednesday', open: '05:30', close: '23:00' },
          { day: 'Thursday', open: '05:30', close: '23:00' },
          { day: 'Friday', open: '05:30', close: '22:00' }
        ]
      },
      {
        name: 'University Center',
        code: 'UC',
        category: 'Student Services',
        lat: 32.7289,
        lng: -97.1125,
        hours: [
          { day: 'Monday', open: '07:00', close: '22:00' },
          { day: 'Tuesday', open: '07:00', close: '22:00' },
          { day: 'Wednesday', open: '07:00', close: '22:00' },
          { day: 'Thursday', open: '07:00', close: '22:00' },
          { day: 'Friday', open: '07:00', close: '20:00' }
        ]
      },
      {
        name: 'Business Building',
        code: 'BUS',
        category: 'Academic',
        lat: 32.7334,
        lng: -97.1142,
        hours: [
          { day: 'Monday', open: '06:00', close: '22:00' },
          { day: 'Tuesday', open: '06:00', close: '22:00' },
          { day: 'Wednesday', open: '06:00', close: '22:00' },
          { day: 'Thursday', open: '06:00', close: '22:00' },
          { day: 'Friday', open: '06:00', close: '20:00' }
        ]
      },
      {
        name: 'Science Hall',
        code: 'SH',
        category: 'Academic',
        lat: 32.7321,
        lng: -97.1156,
        hours: [
          { day: 'Monday', open: '06:00', close: '22:00' },
          { day: 'Tuesday', open: '06:00', close: '22:00' },
          { day: 'Wednesday', open: '06:00', close: '22:00' },
          { day: 'Thursday', open: '06:00', close: '22:00' },
          { day: 'Friday', open: '06:00', close: '20:00' }
        ]
      },
      {
        name: 'Student Services Building',
        code: 'SSB',
        category: 'Student Services',
        lat: 32.7302,
        lng: -97.1118,
        hours: [
          { day: 'Monday', open: '08:00', close: '17:00' },
          { day: 'Tuesday', open: '08:00', close: '17:00' },
          { day: 'Wednesday', open: '08:00', close: '17:00' },
          { day: 'Thursday', open: '08:00', close: '17:00' },
          { day: 'Friday', open: '08:00', close: '17:00' }
        ]
      },
      {
        name: 'Arlington Hall',
        code: 'AH',
        category: 'Housing',
        lat: 32.7285,
        lng: -97.1098,
        hours: [
          { day: 'Monday', open: '00:00', close: '23:59' },
          { day: 'Tuesday', open: '00:00', close: '23:59' },
          { day: 'Wednesday', open: '00:00', close: '23:59' },
          { day: 'Thursday', open: '00:00', close: '23:59' },
          { day: 'Friday', open: '00:00', close: '23:59' }
        ]
      }
    ];

    let insertedCount = 0;
    
    for (const building of utaBuildings) {
      const { data, error } = await supabase
        .from('buildings')
        .upsert(building, { 
          onConflict: 'name',
          ignoreDuplicates: false 
        });
      
      if (error) {
        console.error('Error inserting building:', building.name, error);
      } else {
        insertedCount++;
        console.log('Inserted building:', building.name);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully added ${insertedCount} UTA buildings to the database`,
      buildingsAdded: insertedCount,
      totalBuildings: utaBuildings.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error adding sample data:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});