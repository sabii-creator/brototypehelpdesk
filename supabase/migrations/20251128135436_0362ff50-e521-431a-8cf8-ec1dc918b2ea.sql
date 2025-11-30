-- Fix: Move pg_net extension from public to extensions schema
-- pg_net doesn't support ALTER EXTENSION SET SCHEMA, so we need to drop and recreate

-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- Drop pg_net from public schema
DROP EXTENSION IF EXISTS pg_net CASCADE;

-- Recreate pg_net in extensions schema
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;