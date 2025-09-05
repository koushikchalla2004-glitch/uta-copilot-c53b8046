-- Create response cache table for quick lookups
CREATE TABLE public.response_cache (
  id BIGSERIAL PRIMARY KEY,
  query_key TEXT NOT NULL UNIQUE,
  response_data JSONB NOT NULL,
  category TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  hit_count INTEGER DEFAULT 0
);

-- Create FAQ templates for instant responses
CREATE TABLE public.faq_templates (
  id BIGSERIAL PRIMARY KEY,
  keywords TEXT[] NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create conversation history for memory
CREATE TABLE public.conversation_history (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID,
  session_id TEXT NOT NULL,
  message_index INTEGER NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.response_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_history ENABLE ROW LEVEL SECURITY;

-- Public read policies for cache and FAQ
CREATE POLICY "Public can read response cache" 
ON public.response_cache FOR SELECT USING (true);

CREATE POLICY "Public can read FAQ templates" 
ON public.faq_templates FOR SELECT USING (true);

-- User-specific conversation history
CREATE POLICY "Users can read own conversation history" 
ON public.conversation_history FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own conversation history" 
ON public.conversation_history FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Indexes for performance
CREATE INDEX idx_response_cache_query_key ON public.response_cache(query_key);
CREATE INDEX idx_response_cache_expires ON public.response_cache(expires_at);
CREATE INDEX idx_faq_keywords ON public.faq_templates USING GIN(keywords);
CREATE INDEX idx_conversation_session ON public.conversation_history(session_id, message_index);
CREATE INDEX idx_conversation_user ON public.conversation_history(user_id, created_at DESC);

-- Insert some sample FAQ templates
INSERT INTO public.faq_templates (keywords, question, answer, category, priority) VALUES
  (ARRAY['dining', 'hours', 'food', 'eat', 'open'], 'What are the dining hours?', 'Campus dining locations have varying hours. Connection Cafe (Central): Mon-Sat 7AM-12AM, Sun 11AM-12AM. Maverick Cafe (South): Check current schedule for updates.', 'dining', 100),
  (ARRAY['library', 'hours', 'study'], 'What are the library hours?', 'The UTA Libraries have different hours by location and season. Visit the library website or check building hours for current schedules.', 'academic', 90),
  (ARRAY['parking', 'permits', 'cost'], 'How much does parking cost?', 'UTA parking permits vary by type and location. Visit the Parking Services website for current rates and permit options.', 'campus', 85),
  (ARRAY['wifi', 'internet', 'network'], 'How do I connect to WiFi?', 'Connect to "UTA-WiFi" network using your NetID credentials. For guest access, use "UTA-Guest" network.', 'technology', 80),
  (ARRAY['emergency', 'help', 'urgent', 'police'], 'Emergency contact information', 'UTA Police: 817-272-3003 (emergency), 817-272-3381 (non-emergency). Emergency blue phones are located throughout campus.', 'safety', 95);

-- Function to clean expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM public.response_cache WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;