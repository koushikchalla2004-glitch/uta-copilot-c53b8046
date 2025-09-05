import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text, voice = 'alloy' } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    console.log('Generating speech for:', text.substring(0, 100) + '...');

    // Check if ElevenLabs API key is available
    const elevenLabsKey = Deno.env.get('ELEVEN_LABS_API_KEY');
    
    if (elevenLabsKey) {
      // Use ElevenLabs for better quality
      console.log('Using ElevenLabs TTS');
      
      // Map voice names to ElevenLabs voice IDs
      const voiceMap: Record<string, string> = {
        'alloy': '9BWtsMINqrJLrRacOk9x', // Aria
        'echo': 'TX3LPaxmHKxFdv7VOQHJ', // Liam  
        'fable': 'XB0fDUnXU5powFXDhCwa', // Charlotte
        'onyx': 'bIHbv24MWmeRgasZH58o', // Will
        'nova': 'EXAVITQu4vr4xnSDxMaL', // Sarah
        'shimmer': 'cgSgspJ2msm6clMCkdW9' // Jessica
      };

      const elevenLabsVoiceId = voiceMap[voice] || '9BWtsMINqrJLrRacOk9x'; // Default to Aria

      const elevenResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${elevenLabsVoiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsKey
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
            style: 0.0,
            use_speaker_boost: true
          }
        })
      });

      if (elevenResponse.ok) {
        const arrayBuffer = await elevenResponse.arrayBuffer();
        const base64Audio = btoa(
          String.fromCharCode(...new Uint8Array(arrayBuffer))
        );

        return new Response(
          JSON.stringify({ audioContent: base64Audio, provider: 'elevenlabs' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      } else {
        console.warn('ElevenLabs failed, falling back to OpenAI');
      }
    }

    // Fallback to OpenAI TTS
    console.log('Using OpenAI TTS');
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: voice,
        response_format: 'mp3',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate speech');
    }

    // Convert audio buffer to base64
    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(arrayBuffer))
    );

    return new Response(
      JSON.stringify({ audioContent: base64Audio, provider: 'openai' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('TTS error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});