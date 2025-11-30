import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerifyEmailRequest {
  userId: string;
  code: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { userId, code }: VerifyEmailRequest = await req.json();

    // Verify userId matches authenticated user
    if (userId !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Forbidden' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Rate limiting: 5 attempts per 15 minutes per user
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const identifier = `${userId}_${clientIp}`;
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    
    const { data: rateData, error: rateCheckError } = await supabaseClient
      .from("rate_limits")
      .select("request_count")
      .eq("identifier", identifier)
      .eq("endpoint", "verify-email")
      .gte("window_start", fifteenMinutesAgo)
      .order("window_start", { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (!rateCheckError && rateData && rateData.request_count >= 5) {
      return new Response(
        JSON.stringify({ error: "Too many verification attempts. Please wait 15 minutes and try again." }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Update or create rate limit record
    if (rateData) {
      await supabaseClient
        .from("rate_limits")
        .update({ request_count: rateData.request_count + 1 })
        .eq("identifier", identifier)
        .eq("endpoint", "verify-email")
        .gte("window_start", fifteenMinutesAgo);
    } else {
      await supabaseClient
        .from("rate_limits")
        .insert({
          identifier: identifier,
          endpoint: "verify-email",
          request_count: 1,
          window_start: new Date().toISOString(),
        });
    }

    // Find valid verification code
    const { data: verificationData, error: fetchError } = await supabaseClient
      .from("verification_codes")
      .select("*")
      .eq("user_id", userId)
      .eq("code", code)
      .eq("type", "email_verification")
      .eq("used", false)
      .single();

    if (fetchError || !verificationData) {
      console.error("Verification code not found:", fetchError);
      return new Response(
        JSON.stringify({ error: "Invalid verification code" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if code is expired
    const expiresAt = new Date(verificationData.expires_at);
    if (expiresAt < new Date()) {
      return new Response(
        JSON.stringify({ error: "Verification code has expired" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Mark code as used
    const { error: updateCodeError } = await supabaseClient
      .from("verification_codes")
      .update({ used: true })
      .eq("id", verificationData.id);

    if (updateCodeError) {
      console.error("Error updating code:", updateCodeError);
      throw updateCodeError;
    }

    // Update profile to mark email as verified
    const { error: updateProfileError } = await supabaseClient
      .from("profiles")
      .update({ email_verified: true })
      .eq("id", userId);

    if (updateProfileError) {
      console.error("Error updating profile:", updateProfileError);
      throw updateProfileError;
    }

    console.log(`Email verified for user ${userId}`);

    return new Response(
      JSON.stringify({ success: true, message: "Email verified successfully" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in verify-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
