import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the user making the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !roleData) {
      throw new Error('User is not an admin');
    }

    const { requestId, action } = await req.json();

    if (!requestId || !action || !['approve', 'reject'].includes(action)) {
      throw new Error('Invalid request parameters');
    }

    // Update the request
    const { data: request, error: updateError } = await supabase
      .from('admin_requests')
      .update({
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // If approved, create user account and grant admin role
    if (action === 'approve') {
      // Create user account with a temporary password
      const tempPassword = crypto.randomUUID();
      const { data: newUser, error: createUserError } = await supabase.auth.admin.createUser({
        email: request.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: request.full_name,
        },
      });

      if (createUserError) {
        throw new Error(`Failed to create user: ${createUserError.message}`);
      }

      // Grant admin role
      const { error: roleInsertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: newUser.user.id,
          role: 'admin',
          created_by: user.id,
        });

      if (roleInsertError) {
        throw new Error(`Failed to grant admin role: ${roleInsertError.message}`);
      }

      // Generate and send password reset link via Supabase's built-in email
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        request.email,
        { redirectTo: `${Deno.env.get('SUPABASE_URL')}/auth/admin` }
      );

      if (resetError) {
        console.error('Failed to send password reset email:', resetError);
      }

      // Log the action
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'admin_role_granted',
        resource_type: 'user_roles',
        resource_id: newUser.user.id,
        details: {
          granted_to: request.email,
          request_id: requestId,
        },
      });
    }

    return new Response(
      JSON.stringify({ success: true, request }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});