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

    // Update the request with email and full_name
    const { data: request, error: updateError } = await supabase
      .from('admin_requests')
      .update({
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .select('*, profiles!admin_requests_user_id_fkey(email, full_name)')
      .single();

    if (updateError) {
      throw updateError;
    }

    // Extract profile data from the joined result
    const profileData = (request as any).profiles;
    const requestEmail = profileData?.email;
    const requestFullName = profileData?.full_name;

    // If approved, create user account and grant admin role
    if (action === 'approve') {
      if (!requestEmail || !requestFullName) {
        throw new Error('Could not retrieve user profile data');
      }

      // Check if user already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      let newUser: any;
      
      const existingUser = existingUsers?.users?.find((u: any) => u.email === requestEmail);
      
      if (existingUser) {
        console.log('User already exists, updating metadata');
        newUser = { user: existingUser };
        
        // Update user metadata
        await supabase.auth.admin.updateUserById(existingUser.id, {
          user_metadata: {
            full_name: requestFullName,
          },
          email_confirm: true,
        });
      } else {
        // Create user account with a temporary random password
        const tempPassword = crypto.randomUUID() + crypto.randomUUID();
        const { data: userData, error: createUserError } = await supabase.auth.admin.createUser({
          email: requestEmail,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            full_name: requestFullName,
          },
        });

        if (createUserError) {
          throw new Error(`Failed to create user: ${createUserError.message}`);
        }
        
        newUser = userData;
      }

      // Grant admin role (upsert to handle existing roles)
      const { error: roleInsertError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: newUser.user.id,
          role: 'admin',
          created_by: user.id,
        }, {
          onConflict: 'user_id,role'
        });

      if (roleInsertError) {
        throw new Error(`Failed to grant admin role: ${roleInsertError.message}`);
      }

      // Generate password reset link
      const appUrl = Deno.env.get('SUPABASE_URL')?.replace('/supabase', '') || '';
      const { data: resetData, error: resetError } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: requestEmail,
        options: {
          redirectTo: `${appUrl}/auth/admin`,
        },
      });

      if (resetError) {
        console.error('Failed to generate reset link:', resetError);
        throw new Error('Failed to generate password reset link');
      }

      console.log('Password reset link generated, sending email...');

      // Send email with password setup link using Resend
      try {
        const { error: emailError } = await supabase.functions.invoke('send-admin-approval-email', {
          body: {
            email: requestEmail,
            fullName: requestFullName,
            resetLink: resetData.properties.action_link,
          },
        });

        if (emailError) {
          console.error('Failed to send approval email:', emailError);
          // Don't throw - the user was created successfully, email is secondary
        } else {
          console.log('Approval email sent successfully');
        }
      } catch (emailError) {
        console.error('Error invoking email function:', emailError);
        // Don't throw - the user was created successfully
      }

      // Log the action
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'admin_role_granted',
        resource_type: 'user_roles',
        resource_id: newUser.user.id,
        details: {
          granted_to: requestEmail,
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