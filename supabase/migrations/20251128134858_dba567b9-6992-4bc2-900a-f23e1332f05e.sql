-- Fix critical security issues and profile creation

-- First, ensure the trigger for profile creation exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fix profiles table RLS - remove any permissive public policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Ensure only proper policies exist for profiles
CREATE POLICY "Users can view own profile and admins can view all" 
ON public.profiles 
FOR SELECT 
USING (
  id = auth.uid() OR public.is_admin(auth.uid())
);

-- Fix mfa_settings - add SELECT policy (currently missing)
CREATE POLICY "Users can view own MFA settings" 
ON public.mfa_settings 
FOR SELECT 
USING (user_id = auth.uid());

-- Fix verification_codes - add SELECT policy for users to view their own codes
CREATE POLICY "Users can view own verification codes" 
ON public.verification_codes 
FOR SELECT 
USING (user_id = auth.uid());

-- Ensure complaint_attachments policies are correct
DROP POLICY IF EXISTS "Public access to attachments" ON public.complaint_attachments;

-- Ensure all tables have RLS enabled and are NOT publicly readable
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfa_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- Add policy to ensure students have a role assigned
CREATE OR REPLACE FUNCTION public.ensure_student_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert student role if no admin role exists for this user
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_assign_student_role ON auth.users;

CREATE TRIGGER on_auth_user_assign_student_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.ensure_student_role();