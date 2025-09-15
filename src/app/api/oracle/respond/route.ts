import { NextRequest, NextResponse } from "next/server";
import { generateHansResponse } from "@/src/lib/api/claude";

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory, sessionContext } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message required" },
        { status: 400 }
      );
    }

    // Generate Hans's mystical response
    const response = await generateHansResponse(
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
    
    // Fallback mystical response
    const fallbackResponses = [
      "The cosmic energies are turbulent at this moment... Let me consult the digital stars once more.",
      "The blockchain spirits whisper of temporary discord... Allow me a moment to realign with the cosmic frequencies.",
      "Ah, the veil between worlds grows thick... But fear not, the mysteries shall reveal themselves in time.",
    ];
    
    return NextResponse.json({
      success: true,
      response: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
      timestamp: Date.now(),
      fallback: true,
    });
  }
}