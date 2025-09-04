-- Fix security linter: set search_path for events_tsv_trg function
CREATE OR REPLACE FUNCTION public.events_tsv_trg()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
begin
  new.search_tsv := to_tsvector('english',
    coalesce(new.title,'')||' '||coalesce(new.description,'')||' '||coalesce(new.location,''));
  return new;
end
$$;