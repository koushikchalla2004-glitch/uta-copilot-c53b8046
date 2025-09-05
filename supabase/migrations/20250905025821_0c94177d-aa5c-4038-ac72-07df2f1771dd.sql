-- Enable realtime for dining and events tables
ALTER TABLE public.dining_locations REPLICA IDENTITY FULL;
ALTER TABLE public.events REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.dining_locations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;