-- Secure faculty personal contact info by restricting reads to authenticated users only
-- Ensure RLS is enabled
ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;

-- Drop overly permissive policy if it exists
DROP POLICY IF EXISTS "authenticated read faculty" ON public.faculty;

-- Allow only authenticated users to read faculty
CREATE POLICY "Authenticated users can read faculty"
ON public.faculty
FOR SELECT
TO authenticated
USING (true);
