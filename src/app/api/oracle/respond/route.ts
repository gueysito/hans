import { NextRequest, NextResponse } from "next/server";
import { generateEnhancedHansResponse } from "@/src/lib/ai/enhanced-claude-prompts";

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory, sessionContext } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message required" },
        { status: 400 }
      );
    }

    // Generate Hans's sophisticated analytical response
    const response = await generateEnhancedHansResponse(
      message,
      conversationHistory || [],
      sessionContext || {}
    );

    return NextResponse.json({
      success: true,
      response,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Hans response error:", error);
    
    // Fallback analytical responses
    const fallbackResponses = [
      "I'm experiencing some technical difficulties processing your request. Let me recalibrate my analytical framework.",
      "There seems to be a temporary disruption in my data processing systems. Allow me a moment to restore full analytical capability.",
      "I'm encountering some computational constraints at the moment. The analysis will resume shortly with enhanced precision.",
    ];
    
    return NextResponse.json({
      success: true,
      response: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
      timestamp: Date.now(),
      fallback: true,
    });
  }
}