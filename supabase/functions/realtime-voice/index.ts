import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Supabase client for server-side data access
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SERVICE_ROLE_KEY');
const db = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    return new Response("OpenAI API key not configured", { status: 500, headers: corsHeaders });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  let openAISocket: WebSocket | null = null;
  let sessionStarted = false;

  console.log("WebSocket connection established");

  socket.onopen = () => {
    console.log("Client WebSocket opened");
    
    // Connect to OpenAI Realtime API
    openAISocket = new WebSocket(
      "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01",
      [],
      {
        headers: {
          "Authorization": `Bearer ${openAIApiKey}`,
          "OpenAI-Beta": "realtime=v1"
        }
      }
    );

    openAISocket.onopen = () => {
      console.log("Connected to OpenAI Realtime API");
    };

    openAISocket.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      console.log("OpenAI message:", data.type);

      // Send session update after receiving session.created
      if (data.type === 'session.created' && !sessionStarted) {
        sessionStarted = true;
        const sessionUpdate = {
          type: "session.update",
          session: {
            modalities: ["text", "audio"],
            instructions: `You are UTA Copilot, an intelligent assistant for the University of Texas at Arlington students. 

Your role is to help students with:
- Campus navigation and building locations
- Dining options, hours, and menus
- Parking information and availability  
- Academic services and resources
- Library hours and services
- Class registration and enrollment
- Student services and support
- Campus events and activities
- Emergency information and contacts

Be friendly, helpful, and concise. Provide specific, actionable information about UTA. If you don't have exact information, guide students to the appropriate campus resources or websites. Always maintain a warm, encouraging tone that makes students feel supported.

Keep responses conversational and not too long since this is voice interaction.`,
            voice: "alloy",
            input_audio_format: "pcm16",
            output_audio_format: "pcm16",
            input_audio_transcription: {
              model: "whisper-1"
            },
            turn_detection: {
              type: "server_vad",
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 1000
            },
            tools: [
              {
                type: "function",
                name: "get_campus_info",
                description: "Get specific information about UTA campus services, locations, or resources",
                parameters: {
                  type: "object",
                  properties: {
                    query: { type: "string", description: "The campus information being requested" },
                    category: { 
                      type: "string", 
                      enum: ["dining", "parking", "library", "academics", "buildings", "events", "emergency"],
                      description: "Category of information requested"
                    }
                  },
                  required: ["query", "category"]
                }
              }
            ],
            tool_choice: "auto",
            temperature: 0.7,
            max_response_output_tokens: "inf"
          }
        };
        
        openAISocket?.send(JSON.stringify(sessionUpdate));
        console.log("Session update sent");
      }

      // Handle tool calls
      if (data.type === 'response.function_call_arguments.done') {
        console.log("Function call:", data);
        const args = JSON.parse(data.arguments);
        
        // Provide campus information based on the function call
        let campusInfo = "";
        switch (args.category) {
          case "dining":
            campusInfo = `For UTA dining, you have several options: The Maverick Activities Center (MAC) has multiple restaurants and a food court. The University Center features various dining venues including Starbucks, Chick-fil-A, and Panda Express. Most locations are open Monday-Friday 7 AM to 8 PM, with limited weekend hours. Check the UTA Dining website or call (817) 272-2665 for current menus and hours.`;
            break;
          case "parking":
            campusInfo = `UTA parking requires a permit for most campus lots. You can purchase permits at the Parking Services office in University Hall or online. Visitor parking is available in designated areas with hourly rates. Parking garages are located throughout campus. For current rates and availability, contact Parking Services at (817) 272-2282.`;
            break;
          case "library":
            campusInfo = `The UTA Central Library is your main resource hub, open with extended hours during finals. They offer study spaces, computer labs, printing services, and research assistance. The Architecture & Fine Arts Library and Science & Engineering Library provide specialized resources. Contact the Central Library at (817) 272-3000 or visit library.uta.edu for current hours.`;
            break;
          case "academics":
            campusInfo = `For academic support, use the MyMav student portal for registration and course information. Academic advisors are available to help plan your schedule. The Registrar's Office at (817) 272-2681 can assist with enrollment, transcripts, and academic records. Visit registrar.uta.edu for policies and deadlines.`;
            break;
          case "buildings":
            campusInfo = `UTA's campus features major buildings including the Engineering Research Building, Business Building, Science Hall, and University Hall. An interactive campus map is available on the UTA website. The Visitor Information Center at University Hall can provide directions and campus tours. Call (817) 272-2011 for general campus information.`;
            break;
          case "events":
            try {
              if (!db) {
                campusInfo = `I'm unable to access campus events right now.`;
                break;
              }
              const q: string = (args.query || '').toString();

              // Determine date range from query
              const now = new Date();
              const start = new Date();
              const end = new Date();
              const lower = q.toLowerCase();

              const toStartOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
              const toEndOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

              if (lower.includes('tomorrow')) {
                const t = new Date(now);
                t.setDate(t.getDate() + 1);
                Object.assign(start, toStartOfDay(t));
                Object.assign(end, toEndOfDay(t));
              } else if (lower.includes('today')) {
                Object.assign(start, toStartOfDay(now));
                Object.assign(end, toEndOfDay(now));
              } else if (lower.includes('next week')) {
                const day = now.getDay();
                const daysUntilNextMon = ((8 - day) % 7) || 7;
                const nextMon = new Date(now);
                nextMon.setDate(now.getDate() + daysUntilNextMon);
                const nextSun = new Date(nextMon);
                nextSun.setDate(nextMon.getDate() + 6);
                Object.assign(start, toStartOfDay(nextMon));
                Object.assign(end, toEndOfDay(nextSun));
              } else if (lower.includes('this week')) {
                const day = now.getDay();
                const monday = new Date(now);
                monday.setDate(now.getDate() - ((day + 6) % 7));
                const sunday = new Date(monday);
                sunday.setDate(monday.getDate() + 6);
                Object.assign(start, toStartOfDay(monday));
                Object.assign(end, toEndOfDay(sunday));
              } else {
                // Default: upcoming 7 days
                Object.assign(start, now);
                const in7 = new Date(now);
                in7.setDate(now.getDate() + 7);
                Object.assign(end, in7);
              }

              // Extract a simple keyword
              const cleaned = q.replace(/\b(events?|today|tomorrow|this week|next week|happening|at|in|on)\b/gi, '').trim();
              const keyword = cleaned.split(/\s+/).filter(Boolean)[0];

              let queryBuilder = db
                .from('events')
                .select('id,title,description,location,start_time,end_time,source_url,tags')
                .gte('start_time', start.toISOString())
                .lte('start_time', end.toISOString())
                .order('start_time', { ascending: true })
                .limit(8);

              if (keyword) {
                queryBuilder = queryBuilder.or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%,location.ilike.%${keyword}%`);
              }

              const { data: eventsData, error: eventsError } = await queryBuilder;
              if (eventsError) {
                console.error('Events query error:', eventsError);
                campusInfo = `I couldn't fetch events due to a server issue.`;
                break;
              }

              if (!eventsData || eventsData.length === 0) {
                campusInfo = `No campus events found for that time range. Try asking for events today, tomorrow, or this week.`;
                break;
              }

              const fmt = (iso?: string | null) => iso ? new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '';

              const lines = eventsData.map(e => `• ${e.title} — ${fmt(e.start_time)}${e.location ? ' @ ' + e.location : ''}`);
              campusInfo = `Here are campus events:
${lines.join('\n')}
${eventsData[0].source_url ? `\nFor details, open the event link in the app.` : ''}`;
            } catch (err) {
              console.error('Error building events response:', err);
              campusInfo = `Sorry, I had trouble retrieving events just now.`;
            }
            break;
          case "emergency":
            campusInfo = `For emergencies, call UTA Police at (817) 272-3003. Emergency call boxes are located throughout campus. The UTA Emergency Management website has safety procedures and alert information. Non-emergency campus services can be reached at (817) 272-2011.`;
            break;
          default:
            campusInfo = `I'd be happy to help you with UTA information. For general questions, visit uta.edu or call the main information line at (817) 272-2011. Specific departments have their own contact information available on the UTA website.`;
        }

        // Send function result back to OpenAI
        const functionResult = {
          type: "conversation.item.create",
          item: {
            type: "function_call_output",
            call_id: data.call_id,
            output: campusInfo
          }
        };
        
        openAISocket?.send(JSON.stringify(functionResult));
        openAISocket?.send(JSON.stringify({type: 'response.create'}));
      }

      // Forward all messages to client
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(event.data);
      }
    };

    openAISocket.onerror = (error) => {
      console.error("OpenAI WebSocket error:", error);
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: "error",
          message: "Connection to AI service failed"
        }));
      }
    };

    openAISocket.onclose = () => {
      console.log("OpenAI WebSocket closed");
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  };

  socket.onmessage = (event) => {
    console.log("Client message received");
    if (openAISocket && openAISocket.readyState === WebSocket.OPEN) {
      openAISocket.send(event.data);
    }
  };

  socket.onclose = () => {
    console.log("Client WebSocket closed");
    if (openAISocket) {
      openAISocket.close();
    }
  };

  socket.onerror = (error) => {
    console.error("Client WebSocket error:", error);
    if (openAISocket) {
      openAISocket.close();
    }
  };

  return response;
});