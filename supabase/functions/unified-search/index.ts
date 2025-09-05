import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchRequest {
  query: string;
  categories?: string[];
  limit?: number;
  offset?: number;
}

interface SearchResult {
  id: string;
  title: string;
  snippet: string;
  category: string;
  confidence: number;
  url: string;
  source: string;
  metadata?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, categories = [], limit = 20, offset = 0 }: SearchRequest = await req.json();
    
    console.log(`Search request: "${query}", categories: [${categories.join(', ')}]`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const searchResults: SearchResult[] = [];

    // Search events if no specific category or events category is selected
    if (categories.length === 0 || categories.includes('events')) {
      const eventResults = await searchEvents(supabase, query, limit);
      searchResults.push(...eventResults);
    }

    // Search faculty if no specific category or faculty category is selected
    if (categories.length === 0 || categories.includes('faculty')) {
      const facultyResults = await searchFaculty(supabase, query, limit);
      searchResults.push(...facultyResults);
    }

    // Search courses if no specific category or courses category is selected
    if (categories.length === 0 || categories.includes('courses')) {
      const courseResults = await searchCourses(supabase, query, limit);
      searchResults.push(...courseResults);
    }

    // Search buildings if no specific category or buildings category is selected
    if (categories.length === 0 || categories.includes('buildings')) {
      const buildingResults = await searchBuildings(supabase, query, limit);
      searchResults.push(...buildingResults);
    }

    // Sort by confidence score and apply pagination
    const sortedResults = searchResults
      .sort((a, b) => b.confidence - a.confidence)
      .slice(offset, offset + limit);

    console.log(`Found ${searchResults.length} total results, returning ${sortedResults.length}`);

    return new Response(JSON.stringify({
      success: true,
      query,
      results: sortedResults,
      total: searchResults.length,
      limit,
      offset
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Search error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function searchEvents(supabase: any, query: string, limit: number): Promise<SearchResult[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .or(`title.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%`)
    .limit(limit);

  if (error) {
    console.error('Error searching events:', error);
    return [];
  }

  return data.map((event: any) => ({
    id: `event-${event.id}`,
    title: event.title,
    snippet: event.description || 'No description available',
    category: 'Events',
    confidence: calculateConfidence(query, event.title + ' ' + (event.description || '')),
    url: event.source_url || `/events/${event.id}`,
    source: 'UTA Events',
    metadata: {
      start_time: event.start_time,
      end_time: event.end_time,
      location: event.location,
      tags: event.tags
    }
  }));
}

async function searchFaculty(supabase: any, query: string, limit: number): Promise<SearchResult[]> {
  const { data, error } = await supabase
    .from('faculty')
    .select('id,name,dept,office,office_hours,profile_url,research_areas')
    .or(`name.ilike.%${query}%,dept.ilike.%${query}%,research_areas::text.ilike.%${query}%`)
    .limit(limit);

  if (error) {
    console.error('Error searching faculty:', error);
    return [];
  }

  return data.map((faculty: any) => ({
    id: `faculty-${faculty.id}`,
    title: faculty.name,
    snippet: `${faculty.dept} - Research: ${faculty.research_areas?.join(', ') || 'N/A'}`,
    category: 'Faculty',
    confidence: calculateConfidence(query, faculty.name + ' ' + faculty.dept + ' ' + (faculty.research_areas?.join(' ') || '')),
    url: faculty.profile_url || `/faculty/${faculty.id}`,
    source: 'UTA Faculty Directory',
    metadata: {
      dept: faculty.dept,
      office: faculty.office,
      office_hours: faculty.office_hours,
      research_areas: faculty.research_areas,
      profile_url: faculty.profile_url
    }
  }));
}

async function searchCourses(supabase: any, query: string, limit: number): Promise<SearchResult[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .or(`title.ilike.%${query}%,code.ilike.%${query}%,description.ilike.%${query}%`)
    .limit(limit);

  if (error) {
    console.error('Error searching courses:', error);
    return [];
  }

  return data.map((course: any) => ({
    id: `course-${course.id}`,
    title: `${course.code} - ${course.title}`,
    snippet: course.description || 'No description available',
    category: 'Courses',
    confidence: calculateConfidence(query, course.code + ' ' + course.title + ' ' + (course.description || '')),
    url: course.catalog_url || `/courses/${course.id}`,
    source: 'UTA Course Catalog',
    metadata: {
      code: course.code,
      credits: course.credits,
      prereqs: course.prereqs
    }
  }));
}

async function searchBuildings(supabase: any, query: string, limit: number): Promise<SearchResult[]> {
  const { data, error } = await supabase
    .from('buildings')
    .select('*')
    .or(`name.ilike.%${query}%,code.ilike.%${query}%,category.ilike.%${query}%`)
    .limit(limit);

  if (error) {
    console.error('Error searching buildings:', error);
    return [];
  }

  return data.map((building: any) => ({
    id: `building-${building.id}`,
    title: `${building.code ? building.code + ' - ' : ''}${building.name}`,
    snippet: `${building.category || 'Building'} on campus`,
    category: 'Buildings',
    confidence: calculateConfidence(query, (building.code || '') + ' ' + building.name + ' ' + (building.category || '')),
    url: `/buildings/${building.id}`,
    source: 'UTA Campus Map',
    metadata: {
      code: building.code,
      category: building.category,
      lat: building.lat,
      lng: building.lng,
      hours: building.hours
    }
  }));
}

function calculateConfidence(query: string, text: string): number {
  if (!query || !text) return 0;
  
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  
  // Exact match gets highest score
  if (textLower.includes(queryLower)) {
    const index = textLower.indexOf(queryLower);
    // Earlier matches get higher scores
    return Math.max(95 - (index * 2), 70);
  }
  
  // Partial word matches
  const queryWords = queryLower.split(' ').filter(word => word.length > 2);
  const textWords = textLower.split(' ');
  
  let matches = 0;
  queryWords.forEach(queryWord => {
    textWords.forEach(textWord => {
      if (textWord.includes(queryWord) || queryWord.includes(textWord)) {
        matches++;
      }
    });
  });
  
  const matchRatio = matches / Math.max(queryWords.length, 1);
  return Math.round(matchRatio * 70);
}