-- Drop the old constraint
ALTER TABLE public.verification_codes 
DROP CONSTRAINT IF EXISTS verification_codes_type_check;

-- Add the new constraint with password_reset included
ALTER TABLE public.verification_codes 
ADD CONSTRAINT verification_codes_type_check 
CHECK (type = ANY (ARRAY['email_verification'::text, 'mfa'::text, 'password_reset'::text]));