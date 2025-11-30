-- Fix remaining security issues with verification codes and MFA settings

-- Remove SELECT policy from verification_codes - users should not be able to read codes
DROP POLICY IF EXISTS "Users can view own verification codes" ON public.verification_codes;

-- Remove SELECT policy from mfa_settings - users should not be able to read secrets
DROP POLICY IF EXISTS "Users can view own MFA settings" ON public.mfa_settings;

-- Verification codes should only be validated server-side
-- Users can only mark codes as used, not read them
-- The verification process should happen in edge functions

-- For MFA, if you need to implement MFA in the future, use Supabase's built-in auth.mfa_factors
-- instead of storing secrets in a custom table