-- Enable realtime for news (alerts)
ALTER TABLE public.news REPLICA IDENTITY FULL;

-- Add news to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.news;