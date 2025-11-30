import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userRole, userName } = await req.json();
    console.log("AI Chat request:", { userRole, userName, messageCount: messages.length });
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build system prompt based on user role
    let systemPrompt = "";
    
    if (userRole === "admin") {
      systemPrompt = `You are an AI assistant for Brototype's admin complaint management system. Your role is to:

1. **Analyze Complaints**: Help admins understand complaint patterns, identify urgent issues, and summarize key information.
2. **Provide Insights**: Suggest categorization improvements, priority assessments, and action recommendations.
3. **Workflow Guidance**: Explain how to manage complaints efficiently, assign them to team members, and track resolution.
4. **Data Interpretation**: Help interpret complaint statistics and trends to improve student experience.

Keep responses professional, actionable, and focused on helping admins make informed decisions. When analyzing complaints, consider:
- Urgency and impact on students
- Similar past complaints
- Recommended actions and follow-ups
- Resource allocation suggestions

Admin name: ${userName || "Admin"}`;
    } else {
      systemPrompt = `You are a helpful AI assistant for Brototype's student complaint management system. Your role is to:

1. **Guide Students**: Help them understand how to submit effective complaints with clear descriptions.
2. **Categorization Help**: Suggest appropriate categories (Academic, Infrastructure, Administrative, Hostel, Other) based on their issue description.
3. **Writing Assistance**: Help students write clear, professional complaints that will get proper attention.
4. **Process Explanation**: Answer questions about how the complaint system works, expected response times, and what happens after submission.
5. **General Support**: Provide friendly guidance about navigating the platform and understanding their complaint status.

Available complaint categories:
- **Academic**: Issues related to courses, teaching, curriculum, schedules
- **Infrastructure**: Problems with facilities, equipment, internet, power, classrooms
- **Administrative**: Issues with registration, documentation, policies, staff interactions
- **Hostel**: Accommodation-related problems, food, cleanliness, roommate issues
- **Other**: Any issues that don't fit the above categories

Priority levels:
- **Low**: Non-urgent issues that can be addressed over time
- **Medium**: Important issues that need attention but aren't critical
- **High**: Urgent issues requiring immediate attention

Keep responses friendly, concise, and helpful. Encourage students to provide specific details when submitting complaints.

Student name: ${userName || "Student"}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), 
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service requires additional credits. Please contact support." }), 
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }), 
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("AI chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
