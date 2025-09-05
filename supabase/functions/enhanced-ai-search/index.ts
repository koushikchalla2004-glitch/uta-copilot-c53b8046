import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!openAIApiKey || !supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { query, conversation = [], context = '' } = await req.json();

    console.log('Enhanced AI search request:', { query, conversationLength: conversation.length });

    // Get enhanced context from database
    const utaContext = await getUTAContext(supabase, query);
    
    // Build enhanced prompt with UTA-specific knowledge
    const enhancedPrompt = buildEnhancedPrompt(query, conversation, context, utaContext);

    console.log('Enhanced prompt created with context:', { 
      utaContextItems: utaContext.split('\n').length,
      hasConversation: conversation.length > 0
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: enhancedPrompt
          },
          ...conversation,
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
        stream: false
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Validate response against database if possible
    const validatedResponse = await validateResponse(supabase, query, aiResponse);

    console.log('Enhanced AI search completed successfully');

    return new Response(JSON.stringify({
      response: validatedResponse,
      query,
      sources: utaContext ? ['UTA Database'] : [],
      timestamp: new Date().toISOString(),
      enhanced: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in enhanced AI search:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: "I'm having trouble processing your request right now. Please try again.",
      query,
      sources: [],
      timestamp: new Date().toISOString()
    }), {
      status: 200, // Return 200 to avoid error states in frontend
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function getUTAContext(supabase: any, query: string): Promise<string> {
  try {
    const queryLower = query.toLowerCase();
    let context = '';

    // Get relevant dining info
    if (queryLower.includes('dining') || queryLower.includes('food') || queryLower.includes('eat')) {
      const { data: dining } = await supabase
        .from('dining_locations')
        .select('name, campus_area, hours, is_open')
        .limit(5);
      
      if (dining?.length) {
        context += `\nDINING LOCATIONS:\n${dining.map(d => 
          `${d.name} (${d.campus_area}): ${d.is_open ? 'Open' : 'Closed'} - Hours: ${JSON.stringify(d.hours)}`
        ).join('\n')}`;
      }
    }

    // Get relevant events
    if (queryLower.includes('event') || queryLower.includes('activity')) {
      const { data: events } = await supabase
        .from('events')
        .select('title, start_time, end_time, location, description')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(5);
      
      if (events?.length) {
        context += `\nUPCOMING EVENTS:\n${events.map(e => 
          `${e.title} - ${new Date(e.start_time).toLocaleDateString()} at ${e.location}: ${e.description?.substring(0, 100)}...`
        ).join('\n')}`;
      }
    }

    // Get relevant buildings
    if (queryLower.includes('building') || queryLower.includes('hall') || queryLower.includes('center')) {
      const { data: buildings } = await supabase
        .from('buildings')
        .select('name, code, category, hours')
        .or(`name.ilike.%${queryLower}%,code.ilike.%${queryLower}%`)
        .limit(5);
      
      if (buildings?.length) {
        context += `\nBUILDINGS:\n${buildings.map(b => 
          `${b.name} (${b.code}) - ${b.category}: Hours: ${JSON.stringify(b.hours)}`
        ).join('\n')}`;
      }
    }

    // Get relevant courses
    if (queryLower.includes('course') || queryLower.includes('class')) {
      const { data: courses } = await supabase
        .from('courses')
        .select('code, title, description, credits, prereqs')
        .or(`title.ilike.%${queryLower}%,code.ilike.%${queryLower}%`)
        .limit(3);
      
      if (courses?.length) {
        context += `\nCOURSES:\n${courses.map(c => 
          `${c.code}: ${c.title} (${c.credits} credits) - Prerequisites: ${c.prereqs || 'None'}`
        ).join('\n')}`;
      }
    }

    // Get relevant faculty
    if (queryLower.includes('professor') || queryLower.includes('faculty') || queryLower.includes('instructor')) {
      const { data: faculty } = await supabase
        .from('faculty')
        .select('name, dept, office, email, research_areas')
        .or(`name.ilike.%${queryLower}%,dept.ilike.%${queryLower}%`)
        .limit(3);
      
      if (faculty?.length) {
        context += `\nFACULTY:\n${faculty.map(f => 
          `${f.name} (${f.dept}) - Office: ${f.office}, Email: ${f.email}, Research: ${f.research_areas?.join(', ')}`
        ).join('\n')}`;
      }
    }

    return context;
  } catch (error) {
    console.error('Error getting UTA context:', error);
    return '';
  }
}

function buildEnhancedPrompt(query: string, conversation: any[], context: string, utaContext: string): string {
  const basePrompt = `You are UTA Copilot, an intelligent assistant for the University of Texas at Arlington (UTA). 

CORE GUIDELINES:
- Provide helpful, accurate information about UTA campus life, academics, and services
- Be conversational and friendly while maintaining professionalism
- Use specific, actionable information when available
- If you don't have specific information, acknowledge this and suggest alternatives

CURRENT UTA DATA:
${utaContext}

CONVERSATION CONTEXT:
${context}

RESPONSE STYLE:
- Keep responses concise but informative (2-3 sentences for simple questions, more for complex ones)
- Use bullet points for lists or multiple items
- Include specific details like hours, locations, contact info when available
- End with helpful suggestions for follow-up questions when appropriate

Remember: You represent UTA and should be helpful, knowledgeable, and encouraging to students, faculty, and visitors.`;

  return basePrompt;
}

async function validateResponse(supabase: any, query: string, response: string): Promise<string> {
  try {
    // Simple validation - check if response mentions specific data that should be accurate
    const responseLower = response.toLowerCase();
    
    // Validate dining hours if mentioned
    if (responseLower.includes('dining') && (responseLower.includes('hour') || responseLower.includes('open'))) {
      const { data: dining } = await supabase
        .from('dining_locations')
        .select('name, is_open')
        .limit(3);
      
      if (dining?.length) {
        const openLocations = dining.filter(d => d.is_open).map(d => d.name);
        const closedLocations = dining.filter(d => !d.is_open).map(d => d.name);
        
        if (openLocations.length > 0 || closedLocations.length > 0) {
          const statusNote = `\n\n📍 Current status: ${openLocations.length > 0 ? `Open: ${openLocations.join(', ')}` : ''}${openLocations.length > 0 && closedLocations.length > 0 ? ' | ' : ''}${closedLocations.length > 0 ? `Closed: ${closedLocations.join(', ')}` : ''}`;
          return response + statusNote;
        }
      }
    }

    return response;
  } catch (error) {
    console.error('Error validating response:', error);
    return response;
  }
}