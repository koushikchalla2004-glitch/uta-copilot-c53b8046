import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IngestionRequest {
  source: string;
  url: string;
  jobId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { source, url, jobId }: IngestionRequest = await req.json();
    
    console.log(`Starting data ingestion for source: ${source}, jobId: ${jobId}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let result;
    
    switch (source) {
      case 'events':
        result = await ingestEvents(supabase);
        break;
      case 'dining':
        result = await ingestDining(supabase);
        break;
      case 'faculty':
        result = await ingestFaculty(supabase);
        break;
      case 'courses':
        result = await ingestCourses(supabase);
        break;
      default:
        throw new Error(`Unknown source: ${source}`);
    }

    console.log(`Ingestion completed for ${source}:`, result);

    return new Response(JSON.stringify({
      success: true,
      jobId,
      source,
      result
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Ingestion error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function ingestEvents(supabase: any) {
  // Mock event data - in production, this would scrape from UTA calendar
  const mockEvents = [
    {
      title: 'Spring Semester Registration Opens',
      description: 'Online registration opens for spring semester courses',
      start_time: '2024-04-01T09:00:00Z',
      end_time: '2024-04-01T17:00:00Z',
      location: 'Online',
      tags: ['registration', 'academic'],
      source_url: 'https://calendar.uta.edu/event/spring-registration'
    },
    {
      title: 'Career Fair',
      description: 'Annual UTA career fair with 200+ employers',
      start_time: '2024-04-15T10:00:00Z',
      end_time: '2024-04-15T16:00:00Z',
      location: 'Maverick Activities Center',
      tags: ['career', 'networking'],
      source_url: 'https://calendar.uta.edu/event/career-fair'
    }
  ];

  for (const event of mockEvents) {
    const { error } = await supabase
      .from('events')
      .upsert(event, { onConflict: 'title,start_time' });
    
    if (error) {
      console.error('Error inserting event:', error);
    }
  }

  return { recordsProcessed: mockEvents.length };
}

async function ingestDining(supabase: any) {
  // Mock dining data
  const mockDiningLocations = [
    {
      name: 'Connection Cafe',
      campus_area: 'Central Campus',
      is_open: true,
      hours: [
        { day: 'Monday', open: '07:00', close: '22:00' },
        { day: 'Tuesday', open: '07:00', close: '22:00' },
        { day: 'Wednesday', open: '07:00', close: '22:00' },
        { day: 'Thursday', open: '07:00', close: '22:00' },
        { day: 'Friday', open: '07:00', close: '20:00' }
      ]
    },
    {
      name: 'Maverick Market',
      campus_area: 'East Campus',
      is_open: true,
      hours: [
        { day: 'Monday', open: '08:00', close: '20:00' },
        { day: 'Tuesday', open: '08:00', close: '20:00' },
        { day: 'Wednesday', open: '08:00', close: '20:00' },
        { day: 'Thursday', open: '08:00', close: '20:00' },
        { day: 'Friday', open: '08:00', close: '18:00' }
      ]
    }
  ];

  for (const location of mockDiningLocations) {
    const { error } = await supabase
      .from('dining_locations')
      .upsert(location, { onConflict: 'name' });
    
    if (error) {
      console.error('Error inserting dining location:', error);
    }
  }

  return { recordsProcessed: mockDiningLocations.length };
}

async function ingestFaculty(supabase: any) {
  // Mock faculty data
  const mockFaculty = [
    {
      name: 'Dr. Sarah Johnson',
      dept: 'Computer Science',
      email: 'sarah.johnson@uta.edu',
      office: 'ERB 550',
      phone: '817-272-3785',
      research_areas: ['Machine Learning', 'Data Science', 'AI Ethics'],
      office_hours: 'Tuesday/Thursday 2:00-4:00 PM',
      profile_url: 'https://www.uta.edu/academics/faculty/profile?username=sjohnson'
    },
    {
      name: 'Dr. Michael Chen',
      dept: 'Engineering',
      email: 'michael.chen@uta.edu',
      office: 'WH 301',
      phone: '817-272-2671',
      research_areas: ['Robotics', 'Control Systems', 'Automation'],
      office_hours: 'Monday/Wednesday 1:00-3:00 PM',
      profile_url: 'https://www.uta.edu/academics/faculty/profile?username=mchen'
    }
  ];

  for (const faculty of mockFaculty) {
    const { error } = await supabase
      .from('faculty')
      .upsert(faculty, { onConflict: 'email' });
    
    if (error) {
      console.error('Error inserting faculty:', error);
    }
  }

  return { recordsProcessed: mockFaculty.length };
}

async function ingestCourses(supabase: any) {
  // Mock course data
  const mockCourses = [
    {
      code: 'CSE 3320',
      title: 'Operating Systems',
      description: 'Introduction to operating system concepts including process management, memory management, file systems, and distributed systems.',
      credits: 3,
      prereqs: 'CSE 2312 and CSE 2315',
      catalog_url: 'https://catalog.uta.edu/coursedescriptions/cse/#CSE3320'
    },
    {
      code: 'CSE 4350',
      title: 'Software Engineering',
      description: 'Software development methodologies, project management, requirements analysis, design patterns, testing, and maintenance.',
      credits: 3,
      prereqs: 'CSE 3310',
      catalog_url: 'https://catalog.uta.edu/coursedescriptions/cse/#CSE4350'
    }
  ];

  for (const course of mockCourses) {
    const { error } = await supabase
      .from('courses')
      .upsert(course, { onConflict: 'code' });
    
    if (error) {
      console.error('Error inserting course:', error);
    }
  }

  return { recordsProcessed: mockCourses.length };
}