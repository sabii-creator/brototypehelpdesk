import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('Starting orphaned admin cleanup...');

    // Get all admin roles
    const { data: adminRoles, error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');

    if (rolesError) {
      console.error('Error fetching admin roles:', rolesError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch admin roles' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!adminRoles || adminRoles.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No admin roles found', cleaned: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${adminRoles.length} admin role(s)`);

    // Check each admin role to see if the user exists
    const orphanedRoles = [];
    for (const role of adminRoles) {
      const { data: user, error: userError } = await supabaseAdmin.auth.admin.getUserById(role.user_id);
      
      if (userError || !user) {
        console.log(`Orphaned admin role found for user_id: ${role.user_id}`);
        orphanedRoles.push(role.user_id);
      }
    }

    if (orphanedRoles.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No orphaned admin roles found. All admin roles have valid users.',
          cleaned: 0 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Cleaning up ${orphanedRoles.length} orphaned admin role(s)...`);

    // Delete orphaned admin roles
    const { error: deleteError } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .in('user_id', orphanedRoles);

    if (deleteError) {
      console.error('Error deleting orphaned roles:', deleteError);
      return new Response(
        JSON.stringify({ error: 'Failed to delete orphaned roles' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Cleanup completed successfully');

    return new Response(
      JSON.stringify({ 
        message: 'Orphaned admin roles cleaned up successfully',
        cleaned: orphanedRoles.length,
        orphanedUserIds: orphanedRoles
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred during cleanup' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
