import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") as string;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendVerificationRequest {
  userId: string;
  email: string;
  fullName: string;
}

const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const createEmailHTML = (fullName: string, verificationCode: string): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;">
        <div style="padding: 12px; margin: 0 auto; max-width: 600px;">
          <h1 style="color: #333; font-size: 24px; font-weight: bold; margin: 40px 0; padding: 0;">
            Email Verification
          </h1>
          <p style="color: #333; font-size: 14px; margin: 24px 0;">
            Hello ${fullName},
          </p>
          <p style="color: #333; font-size: 14px; margin: 24px 0;">
            Thank you for signing up with Brototype Complaint Management System.
            Please use the verification code below to verify your email address:
          </p>
          <div style="display: inline-block; padding: 16px 4.5%; width: 90.5%; background-color: #f4f4f4; border-radius: 5px; border: 1px solid #eee; color: #333; font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 8px;">
            ${verificationCode}
          </div>
          <p style="color: #333; font-size: 14px; margin: 24px 0;">
            This code will expire in 15 minutes. If you didn't create an account,
            you can safely ignore this email.
          </p>
          <p style="color: #898989; font-size: 12px; line-height: 22px; margin-top: 12px; margin-bottom: 24px;">
            Best regards,<br>
            Brototype Team
          </p>
        </div>
      </body>
    </html>
  `;
};

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

    const { userId, email, fullName }: SendVerificationRequest = await req.json();

    // Verify userId matches authenticated user
    if (userId !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Forbidden' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Rate limiting: 3 emails per 15 minutes per user
    
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    
    const { data: rateData, error: rateCheckError } = await supabaseClient
      .from("rate_limits")
      .select("request_count")
      .eq("identifier", userId)
      .eq("endpoint", "send-verification-email")
      .gte("window_start", fifteenMinutesAgo)
      .order("window_start", { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (!rateCheckError && rateData && rateData.request_count >= 3) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please wait 15 minutes before requesting another verification email." }),
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
        .eq("identifier", userId)
        .eq("endpoint", "send-verification-email")
        .gte("window_start", fifteenMinutesAgo);
    } else {
      await supabaseClient
        .from("rate_limits")
        .insert({
          identifier: userId,
          endpoint: "send-verification-email",
          request_count: 1,
          window_start: new Date().toISOString(),
        });
    }


    // Generate 6-digit verification code
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 minutes expiry

    // Store verification code in database
    const { error: dbError } = await supabaseClient
      .from("verification_codes")
      .insert({
        user_id: userId,
        code: verificationCode,
        type: "email_verification",
        expires_at: expiresAt.toISOString(),
        used: false,
      });

    if (dbError) {
      console.error("Database error:", dbError);
      throw dbError;
    }

    // Create email HTML
    const html = createEmailHTML(fullName, verificationCode);

    // Send email using Resend API
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Brototype <noreply@help.brototype.com>",
        to: [email],
        subject: "Verify your Brototype account",
        html,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error("Email error:", errorData);
      throw new Error(`Failed to send email: ${JSON.stringify(errorData)}`);
    }

    console.log(`Verification email sent to ${email}`);

    return new Response(
      JSON.stringify({ success: true, message: "Verification email sent" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-verification-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
