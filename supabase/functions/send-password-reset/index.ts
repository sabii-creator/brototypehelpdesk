import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") as string;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendPasswordResetRequest {
  email: string;
}

const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const createEmailHTML = (code: string, fullName: string): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .code-box { background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
          .code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello ${fullName},</p>
            <p>We received a request to reset your password. Use the verification code below to proceed:</p>
            <div class="code-box">
              <div class="code">${code}</div>
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <p>Best regards,<br>The Brototype Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message, please do not reply.</p>
          </div>
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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { email }: SendPasswordResetRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user exists
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    const user = users?.find(u => u.email === email);

    if (!user) {
      // For security, don't reveal if email exists
      return new Response(
        JSON.stringify({ message: "If the email exists, a reset code has been sent" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limiting check
    const { data: rateLimitData } = await supabase
      .from("rate_limits")
      .select("request_count, window_start")
      .eq("endpoint", "password_reset")
      .eq("identifier", email)
      .gte("window_start", new Date(Date.now() - 60 * 60 * 1000).toISOString())
      .single();

    if (rateLimitData && rateLimitData.request_count >= 3) {
      return new Response(
        JSON.stringify({ error: "Too many reset attempts. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update or insert rate limit
    if (rateLimitData) {
      await supabase
        .from("rate_limits")
        .update({ request_count: rateLimitData.request_count + 1 })
        .eq("endpoint", "password_reset")
        .eq("identifier", email);
    } else {
      await supabase
        .from("rate_limits")
        .insert({
          endpoint: "password_reset",
          identifier: email,
          request_count: 1,
          window_start: new Date().toISOString(),
        });
    }

    // Generate and store verification code
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const { error: codeError } = await supabase
      .from("verification_codes")
      .insert({
        user_id: user.id,
        code,
        type: "password_reset",
        expires_at: expiresAt.toISOString(),
        used: false,
      });

    if (codeError) throw codeError;

    // Get user profile for full name
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const fullName = profile?.full_name || "User";

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
        subject: "Password Reset Request",
        html: createEmailHTML(code, fullName),
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error("Email error:", errorData);
      throw new Error(`Failed to send email: ${JSON.stringify(errorData)}`);
    }

    console.log("Password reset email sent:", email);

    return new Response(
      JSON.stringify({ message: "Reset code sent successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-password-reset:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
