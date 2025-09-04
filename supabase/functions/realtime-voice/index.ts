import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    return new Response("OpenAI API key not configured", { status: 500 });
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

    openAISocket.onmessage = (event) => {
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
            campusInfo = `Campus events are posted on the UTA website and MyMav portal. The University Center and Maverick Activities Center host many student activities. Follow UTA social media for updates on lectures, sports, and cultural events. Student organizations also host regular events throughout the semester.`;
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