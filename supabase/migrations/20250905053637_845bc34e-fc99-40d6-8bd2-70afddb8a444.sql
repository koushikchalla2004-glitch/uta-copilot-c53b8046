-- Fix search path for the existing clean_expired_cache function
CREATE OR REPLACE FUNCTION public.clean_expired_cache()
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.response_cache WHERE expires_at < now();
END;
$$;