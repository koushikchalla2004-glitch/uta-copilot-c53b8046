import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SERVICE_ROLE_KEY');
const db = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fallback responses for common UTA queries
function generateFallbackResponse(query: string): string {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('dining') || lowerQuery.includes('food') || lowerQuery.includes('eat')) {
    return "🍽️ **UTA Dining Options:**\n\n• **Maverick Activities Center (MAC)** - Multiple restaurants and food court\n• **University Center** - Various dining venues and convenience stores\n• **Starbucks** locations across campus\n• **Chick-fil-A** in the University Center\n• **Panda Express** and other chain restaurants\n• **Residential dining halls** for students with meal plans\n\nFor current hours and menus, visit the UTA Dining Services website or call (817) 272-2665.";
  }
  
  if (lowerQuery.includes('parking') || lowerQuery.includes('park')) {
    return "🚗 **UTA Parking Information:**\n\n• **Student parking permits** required for most campus lots\n• **Visitor parking** available in designated areas\n• **Parking services office** in University Hall for permits\n• **Multiple parking garages** throughout campus\n• **Metered parking** available on some streets\n• **Shuttle services** connect remote lots to campus\n\nContact Parking Services at (817) 272-2282 or visit their office for detailed information.";
  }
  
  if (lowerQuery.includes('library') || lowerQuery.includes('book') || lowerQuery.includes('study')) {
    return "📚 **UTA Library Services:**\n\n• **Central Library** - Main campus library with extensive resources\n• **Architecture & Fine Arts Library** - Specialized collections\n• **Science & Engineering Library** - Technical resources\n• **24/7 study spaces** available during finals\n• **Computer labs** and printing services\n• **Research assistance** and tutoring support\n\nContact the Central Library at (817) 272-3000 or visit library.uta.edu for hours and services.";
  }
  
  if (lowerQuery.includes('registration') || lowerQuery.includes('enroll') || lowerQuery.includes('class')) {
    return "📝 **UTA Registration & Enrollment:**\n\n• **MyMav** student portal for registration\n• **Academic advisors** help plan your schedule\n• **Course catalogs** available online\n• **Registration dates** vary by student level\n• **Add/drop deadlines** important for refunds\n• **Waitlist options** for popular courses\n\nContact the Registrar's Office at (817) 272-2681 or visit registrar.uta.edu for detailed information.";
  }
  
  if (lowerQuery.includes('location') || lowerQuery.includes('building') || lowerQuery.includes('map')) {
    return "🗺️ **UTA Campus Information:**\n\n• **Interactive campus map** available on UTA website\n• **Visitor information center** at University Hall\n• **Campus tours** available for prospective students\n• **Major buildings** include Engineering Research Building, Business Building, Science Hall\n• **Emergency call boxes** located throughout campus\n• **Campus shuttles** connect different areas\n\nFor detailed maps and directions, visit uta.edu/maps or call (817) 272-2011.";
  }
  
  // Default response for general queries
  return `🎓 **UTA Campus Information:**\n\nI'd be happy to help you with information about the University of Texas at Arlington! Here are some key resources:\n\n• **Main website:** uta.edu\n• **Student services:** (817) 272-2011\n• **Campus tours and information:** admissions.uta.edu\n• **Emergency services:** (817) 272-3003\n\nFor specific questions about "${query}", I recommend:\n• Visiting the UTA website\n• Calling the main information line\n• Stopping by the Visitor Information Center\n\nIs there something specific about UTA you'd like to know more about?`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    if (!query || typeof query !== 'string') {
      return new Response(JSON.stringify({ error: 'Query is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('AI Search query:', query);

    // If the user asks about events, answer directly from Supabase
    if (/\bevents?\b/i.test(query)) {
      try {
        if (!db) throw new Error('Database not configured');

        const now = new Date();
        const lower = query.toLowerCase();

        // Determine if it's a "just events" request (no extra keywords/timeframes)
        const cleaned = lower.replace(/\b(events?|today|tomorrow|this week|next week|happening|at|in|on)\b/gi, '').trim();
        const keyword = cleaned.split(/\s+/).filter(Boolean)[0];
        const justEvents = /\bevents?\b/i.test(lower) && !keyword && !/(today|tomorrow|this week|next week)/i.test(lower);

        // Compute time window
        const start = new Date(now);
        let end: Date | null = new Date(now);

        const toStartOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const toEndOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

        if (lower.includes('tomorrow')) {
          const t = new Date(now); t.setDate(t.getDate() + 1);
          Object.assign(start, toStartOfDay(t));
          end = toEndOfDay(t);
        } else if (lower.includes('today')) {
          // Next 24 hours from now
          Object.assign(start, now);
          end = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        } else if (lower.includes('next week')) {
          const day = now.getDay();
          const daysUntilNextMon = ((8 - day) % 7) || 7;
          const nextMon = new Date(now); nextMon.setDate(now.getDate() + daysUntilNextMon);
          const nextSun = new Date(nextMon); nextSun.setDate(nextMon.getDate() + 6);
          Object.assign(start, toStartOfDay(nextMon));
          end = toEndOfDay(nextSun);
        } else if (lower.includes('this week')) {
          const day = now.getDay();
          const monday = new Date(now); monday.setDate(now.getDate() - ((day + 6) % 7));
          const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6);
          Object.assign(start, toStartOfDay(monday));
          end = toEndOfDay(sunday);
        } else if (justEvents) {
          // "Just events" → next 15 upcoming, no upper bound
          Object.assign(start, now);
          end = null;
        } else {
          Object.assign(start, now);
          const in7 = new Date(now); in7.setDate(now.getDate() + 7);
          end = in7;
        }

        // Build query
        let q = db
          .from('events')
          .select('id,title,description,location,start_time,end_time,source_url,tags')
          .gte('start_time', start.toISOString())
          .order('start_time', { ascending: true })
          .limit(justEvents ? 15 : 10);

        if (end) {
          q = q.lte('start_time', end.toISOString());
        }

        if (keyword) {
          q = q.or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%,location.ilike.%${keyword}%`);
        }

        const { data: events, error: eventsError } = await q;
        if (eventsError) throw eventsError;

        if (!events || events.length === 0) {
          return new Response(JSON.stringify({
            response: `No campus events found for that time range. Try asking for events today, tomorrow, or this week.`,
            query,
            timestamp: new Date().toISOString()
          }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const fmt = (iso?: string | null) => iso ? new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '';
        const lines = events.map(e => `• ${e.title} — ${fmt(e.start_time)}${e.location ? ' @ ' + e.location : ''}`);
        const heading = lower.includes('today')
          ? 'Here are events in the next 24 hours:'
          : (justEvents ? 'Here are the next 15 upcoming events:' : 'Here are campus events:');
        const text = `${heading}\n${lines.join('\n')}`;

        return new Response(JSON.stringify({
          response: text,
          query,
          timestamp: new Date().toISOString()
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      } catch (err) {
        console.error('Events fetch failed:', err);
        // Fall through to OpenAI fallback below
      }
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: `You are UTA Copilot, an intelligent campus assistant for the University of Texas at Arlington (UTA). 
            
            Your role is to help students, faculty, and visitors with campus-related questions. Provide helpful, accurate, and friendly responses about:
            - Campus locations and buildings
            - Academic programs and courses  
            - Student services and resources
            - Campus events and activities
            - Dining options and hours
            - Transportation and parking
            - Library services
            - Recreation and athletics
            - Academic support services
            - Registration and enrollment

            Keep responses concise but informative. If you don't have specific current information about UTA, provide general guidance and suggest where to find more details (like the UTA website or specific departments).
            
            Always maintain a helpful, encouraging tone that reflects the university's commitment to student success.`
          },
          {
            role: 'user',
            content: query
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      
      // If quota exceeded or API issue, provide helpful fallback response
      if (response.status === 429 || response.status >= 500) {
        const fallbackResponse = generateFallbackResponse(query);
        return new Response(JSON.stringify({ 
          response: fallbackResponse,
          query: query,
          timestamp: new Date().toISOString(),
          fallback: true
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI response generated successfully');

    return new Response(JSON.stringify({ 
      response: aiResponse,
      query: query,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-search function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to process search query',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});