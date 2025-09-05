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

// Get live campus status for real-time context
async function getLiveCampusContext(): Promise<string> {
  try {
    if (!db) return '';

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const [diningRes, todayEventsRes, nextEventsRes] = await Promise.all([
      db.from('dining_locations').select('name,is_open,campus_area').order('name'),
      db.from('events').select('title,start_time,location').gte('start_time', todayStart.toISOString()).lte('start_time', todayEnd.toISOString()).order('start_time').limit(3),
      db.from('events').select('title,start_time,location').gt('start_time', now.toISOString()).order('start_time').limit(3)
    ]);

    let liveContext = '';

    // Current dining status
    if (diningRes.data && diningRes.data.length > 0) {
      const open = diningRes.data.filter((d: any) => d.is_open);
      const closed = diningRes.data.filter((d: any) => !d.is_open);
      
      if (open.length > 0) {
        liveContext += `Currently open dining: ${open.map((d: any) => d.name).join(', ')}\n`;
      }
      if (closed.length > 0) {
        liveContext += `Currently closed dining: ${closed.map((d: any) => d.name).join(', ')}\n`;
      }
    }

    // Today's remaining events
    if (todayEventsRes.data && todayEventsRes.data.length > 0) {
      const fmt = (iso: string) => new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      liveContext += `Today's events: ${todayEventsRes.data.map((e: any) => `${e.title} at ${fmt(e.start_time)}`).join(', ')}\n`;
    }

    // Next upcoming events
    if (nextEventsRes.data && nextEventsRes.data.length > 0) {
      const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
      liveContext += `Next events: ${nextEventsRes.data.map((e: any) => `${e.title} — ${fmt(e.start_time)}`).join(', ')}\n`;
    }

    return liveContext.trim();
  } catch (err) {
    console.error('Live context fetch failed:', err);
    return '';
  }
}


// Build lightweight retrieval-augmented context from Supabase tables
async function getRagContext(query: string): Promise<{ contextText: string; sources: Array<{ category: string; title: string; snippet?: string; url?: string }> }> {
  try {
    if (!db) return { contextText: '', sources: [] };

    const qWeb = query.length > 200 ? query.slice(0, 200) : query;
    const limitPer = 3;

    const [buildingsRes, coursesRes, facultyRes, programsRes, eventsRes] = await Promise.all([
      db.from('buildings').select('id,name,code,category').textSearch('search_tsv', qWeb, { type: 'websearch' }).limit(limitPer),
      db.from('courses').select('id,code,title,description,catalog_url').textSearch('search_tsv', qWeb, { type: 'websearch' }).limit(limitPer),
      db.from('faculty').select('id,name,dept,office,profile_url').textSearch('search_tsv', qWeb, { type: 'websearch' }).limit(limitPer),
      db.from('programs').select('id,name,dept,level,catalog_url,overview').textSearch('search_tsv', qWeb, { type: 'websearch' }).limit(limitPer),
      db.from('events').select('id,title,description,location,start_time,source_url').textSearch('search_tsv', qWeb, { type: 'websearch' }).limit(limitPer),
    ]);

    const clamp = (s?: string | null, n = 180) => (s || '').replace(/\s+/g, ' ').trim().slice(0, n);

    const sources: Array<{ category: string; title: string; snippet?: string; url?: string }> = [];

    if (buildingsRes.data) {
      buildingsRes.data.forEach((b: any) => {
        sources.push({
          category: 'Building',
          title: b.name + (b.code ? ` (${b.code})` : ''),
          snippet: clamp(b.category),
        });
      });
    }

    if (coursesRes.data) {
      coursesRes.data.forEach((c: any) => {
        sources.push({
          category: 'Course',
          title: (c.code ? `${c.code}: ` : '') + (c.title || 'Course'),
          snippet: clamp(c.description),
          url: c.catalog_url || undefined,
        });
      });
    }

    if (facultyRes.data) {
      facultyRes.data.forEach((f: any) => {
        sources.push({
          category: 'Faculty',
          title: f.name + (f.dept ? ` — ${f.dept}` : ''),
          snippet: clamp(f.office),
          url: f.profile_url || undefined,
        });
      });
    }

    if (programsRes.data) {
      programsRes.data.forEach((p: any) => {
        sources.push({
          category: 'Program',
          title: p.name + (p.level ? ` (${p.level})` : ''),
          snippet: clamp(p.overview),
          url: p.catalog_url || undefined,
        });
      });
    }

    if (eventsRes.data) {
      const fmt = (iso?: string | null) => (iso ? new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric' }) : '');
      eventsRes.data.forEach((e: any) => {
        sources.push({
          category: 'Event',
          title: e.title + (e.start_time ? ` — ${fmt(e.start_time)}` : ''),
          snippet: clamp(e.location || e.description),
          url: e.source_url || undefined,
        });
      });
    }

    // Limit overall size and build compact context text
    const top = sources.slice(0, 12);
    const contextText = top.map((s) => `- [${s.category}] ${s.title}${s.snippet ? `: ${s.snippet}` : ''}`).join('\n');
    return { contextText, sources: top };
  } catch (err) {
    console.error('RAG context build failed:', err);
    return { contextText: '', sources: [] };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, conversation } = await req.json();
    
    if (!query || typeof query !== 'string') {
      return new Response(JSON.stringify({ error: 'Query is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const history = Array.isArray(conversation)
      ? conversation
          .filter((m: any) => m && typeof m.content === 'string' && (m.role === 'user' || m.role === 'assistant'))
          .slice(-10)
      : [];

    console.log('AI Search query:', query, 'history items:', history.length);

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

    // Get live campus data for enhanced context
    const liveContext = await getLiveCampusContext();
    
    // Build retrieval context from Supabase
    const rag = await getRagContext(query);
    console.log('RAG context ready', { items: rag.sources.length, len: rag.contextText.length });

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
            content: `You are UTA Copilot, a professional virtual assistant for the University of Texas at Arlington (UTA).

            Objectives:
            - Provide accurate, concise, and context-aware answers using prior conversation when helpful.
            - Be straightforward and human-like; avoid filler, apologies, emojis, and marketing fluff.
            - If the request is ambiguous, ask one brief clarifying question instead of guessing.
            - Do not reveal internal reasoning; provide only the final answer.

            Style:
            - Prefer 1–3 short sentences. Use brief bullet points only when listing items.
            - Use professional tone and precise wording.
            - Include links to official UTA resources when useful.`
          },
          ...(rag.contextText ? [{ role: 'system', content: `Campus context (use if relevant):\n${rag.contextText}` }] : []),
          ...(liveContext ? [{ role: 'system', content: `Live campus status:\n${liveContext}` }] : []),
          ...history,
          { role: 'user', content: query }
        ],
        max_tokens: 400,
        temperature: 0.3,
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
      query,
      sources: rag?.sources || [],
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