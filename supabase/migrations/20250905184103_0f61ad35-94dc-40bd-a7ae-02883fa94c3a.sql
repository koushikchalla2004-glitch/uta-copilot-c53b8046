-- Tighten RLS on faculty to prevent public scraping of contact details
ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;

-- Remove overly permissive public read policies if they exist
DROP POLICY IF EXISTS "public read" ON public.faculty;
DROP POLICY IF EXISTS "public read faculty" ON public.faculty;

-- Allow only authenticated users to read faculty directly
CREATE POLICY "authenticated read faculty"
ON public.faculty
FOR SELECT
TO authenticated
USING (true);
