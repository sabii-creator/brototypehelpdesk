-- Add email_verified to profiles table
ALTER TABLE public.profiles ADD COLUMN email_verified BOOLEAN DEFAULT FALSE NOT NULL;

-- Add file_path and file_size to complaint_attachments
ALTER TABLE public.complaint_attachments ADD COLUMN file_path TEXT;
ALTER TABLE public.complaint_attachments ADD COLUMN file_size INTEGER;