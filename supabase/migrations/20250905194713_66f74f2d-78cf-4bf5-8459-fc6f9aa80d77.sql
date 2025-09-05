-- Fix RLS policies for response_cache table to allow edge functions to insert/update
-- Allow service role to manage cache entries
CREATE POLICY "Service role can manage response cache"
ON public.response_cache
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow authenticated users to insert cache entries (needed for edge functions)
CREATE POLICY "Authenticated users can insert response cache"
ON public.response_cache
FOR INSERT
TO authenticated
WITH CHECK (true);