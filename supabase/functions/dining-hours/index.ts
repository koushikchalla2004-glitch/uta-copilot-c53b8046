import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DiningLocation {
  id: number;
  name: string;
  campus_area: string;
  hours: any[];
  is_open: boolean;
  updated_at: string;
}

interface DiningHours {
  day: string;
  open: string;
  close: string;
  isSpecialDay?: boolean;
  specialNote?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { location, includeMenus } = await req.json().catch(() => ({}));
    
    console.log(`Dining hours request: ${JSON.stringify({ location, includeMenus })}`);

    // Get all dining locations
    const { data: locations, error } = await supabaseClient
      .from('dining_locations')
      .select('*')
      .order('name');

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    // Get current time in Central Time (UTA timezone)
    const now = new Date();
    const centralTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Chicago"}));
    const currentHour = centralTime.getHours();
    const currentMinute = centralTime.getMinutes();
    const currentTime = currentHour * 60 + currentMinute; // minutes since midnight
    const dayOfWeek = centralTime.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Enhanced dining location processing
    const enhancedLocations = await Promise.all(
      (locations || []).map(async (loc: DiningLocation) => {
        const isCurrentlyOpen = await determineIfOpen(loc, currentTime, dayOfWeek);
        const nextStatusChange = await getNextStatusChange(loc, centralTime);
        const parsedHours = await parseHours(loc.hours);

        // Get today's menu if requested
        let todaysMenu = null;
        if (includeMenus) {
          const { data: menuData } = await supabaseClient
            .from('menus')
            .select('*')
            .eq('location_id', loc.id)
            .eq('menu_date', centralTime.toISOString().split('T')[0])
            .single();
          
          todaysMenu = menuData?.items || null;
        }

        return {
          ...loc,
          isCurrentlyOpen,
          nextStatusChange,
          parsedHours,
          todaysMenu,
          lastUpdated: new Date().toISOString()
        };
      })
    );

    // Filter by specific location if requested
    const filteredLocations = location 
      ? enhancedLocations.filter(loc => 
          loc.name.toLowerCase().includes(location.toLowerCase()) ||
          loc.campus_area.toLowerCase().includes(location.toLowerCase())
        )
      : enhancedLocations;

    // Update database with current status
    for (const loc of enhancedLocations) {
      if (loc.is_open !== loc.isCurrentlyOpen) {
        await supabaseClient
          .from('dining_locations')
          .update({ 
            is_open: loc.isCurrentlyOpen,
            updated_at: new Date().toISOString()
          })
          .eq('id', loc.id);
        
        console.log(`Updated ${loc.name} status: ${loc.isCurrentlyOpen ? 'Open' : 'Closed'}`);
      }
    }

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      centralTime: centralTime.toISOString(),
      locations: filteredLocations,
      summary: {
        total: enhancedLocations.length,
        open: enhancedLocations.filter(l => l.isCurrentlyOpen).length,
        closed: enhancedLocations.filter(l => !l.isCurrentlyOpen).length
      }
    };

    console.log(`Dining hours response: ${enhancedLocations.length} locations processed`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in dining-hours function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function determineIfOpen(location: DiningLocation, currentTime: number, dayOfWeek: number): Promise<boolean> {
  if (!location.hours || !Array.isArray(location.hours) || location.hours.length === 0) {
    return false;
  }

  // Parse hours from the location data
  const hoursText = location.hours[0]?.text || '';
  
  // Handle special cases first
  if (hoursText.includes('Closed') || hoursText.includes('closed')) {
    return false;
  }

  // Parse regular hours (looking for patterns like "7:00 AM - 12:00 AM")
  const timeRangeMatch = hoursText.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  
  if (timeRangeMatch) {
    const [, openHour, openMin, openPeriod, closeHour, closeMin, closePeriod] = timeRangeMatch;
    
    const openTime = convertToMinutes(parseInt(openHour), parseInt(openMin), openPeriod);
    const closeTime = convertToMinutes(parseInt(closeHour), parseInt(closeMin), closePeriod);
    
    // Handle overnight hours (e.g., 7:00 AM - 12:00 AM)
    if (closeTime < openTime) {
      return currentTime >= openTime || currentTime <= closeTime;
    } else {
      return currentTime >= openTime && currentTime <= closeTime;
    }
  }

  // Default to using the is_open field from database
  return location.is_open;
}

async function getNextStatusChange(location: DiningLocation, currentTime: Date): Promise<string | null> {
  if (!location.hours || !Array.isArray(location.hours)) {
    return null;
  }

  const hoursText = location.hours[0]?.text || '';
  const timeRangeMatch = hoursText.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  
  if (timeRangeMatch) {
    const [, openHour, openMin, openPeriod, closeHour, closeMin, closePeriod] = timeRangeMatch;
    
    const openTime = new Date(currentTime);
    openTime.setHours(
      convertTo24Hour(parseInt(openHour), openPeriod),
      parseInt(openMin),
      0,
      0
    );
    
    const closeTime = new Date(currentTime);
    closeTime.setHours(
      convertTo24Hour(parseInt(closeHour), closePeriod),
      parseInt(closeMin),
      0,
      0
    );

    // Handle overnight closing
    if (closeTime < openTime) {
      closeTime.setDate(closeTime.getDate() + 1);
    }

    const isCurrentlyOpen = await determineIfOpen(
      location, 
      currentTime.getHours() * 60 + currentTime.getMinutes(),
      currentTime.getDay()
    );

    if (isCurrentlyOpen) {
      return `Closes at ${formatTime(closeTime)}`;
    } else {
      // Check if opening today or tomorrow
      const tomorrow = new Date(openTime);
      if (currentTime > closeTime) {
        tomorrow.setDate(tomorrow.getDate() + 1);
      }
      return `Opens at ${formatTime(currentTime > closeTime ? tomorrow : openTime)}`;
    }
  }

  return null;
}

async function parseHours(hoursData: any[]): Promise<DiningHours[]> {
  if (!Array.isArray(hoursData) || hoursData.length === 0) {
    return [];
  }

  const hoursText = hoursData[0]?.text || '';
  
  // Handle different hour formats
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const parsedHours: DiningHours[] = [];

  // Look for specific day patterns
  for (const day of days) {
    const dayPattern = new RegExp(`${day}[:\\s]*([^\\n\\r]*?)(?=${days.join('|')}|$)`, 'i');
    const match = hoursText.match(dayPattern);
    
    if (match) {
      const timeText = match[1].trim();
      const timeMatch = timeText.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      
      if (timeMatch) {
        parsedHours.push({
          day,
          open: `${timeMatch[1]}:${timeMatch[2]} ${timeMatch[3]}`,
          close: `${timeMatch[4]}:${timeMatch[5]} ${timeMatch[6]}`
        });
      }
    }
  }

  // If no specific days found, use general hours
  if (parsedHours.length === 0) {
    const generalMatch = hoursText.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (generalMatch) {
      parsedHours.push({
        day: 'General',
        open: `${generalMatch[1]}:${generalMatch[2]} ${generalMatch[3]}`,
        close: `${generalMatch[4]}:${generalMatch[5]} ${generalMatch[6]}`
      });
    }
  }

  return parsedHours;
}

function convertToMinutes(hour: number, minute: number, period: string): number {
  let adjustedHour = hour;
  if (period.toUpperCase() === 'PM' && hour !== 12) {
    adjustedHour += 12;
  } else if (period.toUpperCase() === 'AM' && hour === 12) {
    adjustedHour = 0;
  }
  return adjustedHour * 60 + minute;
}

function convertTo24Hour(hour: number, period: string): number {
  if (period.toUpperCase() === 'PM' && hour !== 12) {
    return hour + 12;
  } else if (period.toUpperCase() === 'AM' && hour === 12) {
    return 0;
  }
  return hour;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}