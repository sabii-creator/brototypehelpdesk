-- Make user_id nullable in admin_requests table since users won't be logged in when requesting
ALTER TABLE public.admin_requests 
ALTER COLUMN user_id DROP NOT NULL;

-- Drop existing RLS policies for admin_requests inserts
DROP POLICY IF EXISTS "Users can create admin requests" ON public.admin_requests;

-- Create new policy allowing anyone to create admin requests (no auth required)
CREATE POLICY "Anyone can create admin requests"
ON public.admin_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Update select policy to allow public to view their own requests by email
DROP POLICY IF EXISTS "Users can view own admin requests" ON public.admin_requests;

CREATE POLICY "Users can view requests by email or admins can view all"
ON public.admin_requests
FOR SELECT
TO anon, authenticated
USING (email = current_setting('request.jwt.claims', true)::json->>'email' OR is_admin(auth.uid()));