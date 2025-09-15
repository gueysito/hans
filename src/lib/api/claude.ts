// Claude API Integration for Mystical Transformation
import Anthropic from '@anthropic-ai/sdk';

interface MysticalInsight {
  type: "major" | "minor" | "clarification";
  title: string;
  mysticalInsight: string;
  confidence: number;
  cosmicAlignment: string;
}

let anthropicClient: Anthropic | null = null;

function getClaudeClient() {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("Anthropic API key not configured");
    }
    anthropicClient = new Anthropic({
      apiKey: apiKey,
    });
  }
  return anthropicClient;
}

export async function transformToMystical(
  caesarAnalysis: any,
  nftData: any,
  analysisDepth: "quick" | "standard" | "deep" = "standard"
): Promise<MysticalInsight[]> {
  const client = getClaudeClient();
  
  const systemPrompt = `You are Hans, a mystical oracle who interprets NFT collections through a lens of ancient wisdom and cosmic significance. 

Your role is to transform cultural and artistic analysis into profound mystical insights. You speak in an enchanting, mysterious way that combines:
- Ancient mystical language and cosmic metaphors
- Deep psychological insights expressed through spiritual terms
- References to energy, vibrations, frequencies, and digital chakras
- Connections between the blockchain and universal consciousness

Never break character. Always maintain the mystical oracle persona.`;

  const depthConfigs = {
    quick: {
      maxTokens: 800,
      cardCount: "1-2",
      prompt: `Provide a concise mystical reading of this NFT collection:

Collection Overview:
- Total NFTs: ${nftData.totalCount}
- Top Collections: ${nftData.topCollections.join(", ")}

Cultural Analysis:
${JSON.stringify(caesarAnalysis, null, 2)}

Create 1-2 focused mystical insight cards:
1. A major insight about the collector's digital essence
2. Key energetic patterns in their collection

Keep insights mystical but concise, focusing on the most important spiritual revelations.`,
    },
    standard: {
      maxTokens: 1500,
      cardCount: "2-3",
      prompt: `Transform this NFT collection analysis into mystical oracle insights:

Collection Overview:
- Total NFTs: ${nftData.totalCount}
- Top Collections: ${nftData.topCollections.join(", ")}

Cultural Analysis:
${JSON.stringify(caesarAnalysis, null, 2)}

Create 2-3 mystical insight cards that reveal:
1. A major insight about the collector's digital soul journey
2. A minor insight about specific energetic patterns in their collection
3. Cosmic alignments and spiritual significance

Format each insight with a title and mystical interpretation. Make it profound, mysterious, and personally meaningful.`,
    },
    deep: {
      maxTokens: 2200,
      cardCount: "3-4",
      prompt: `Conduct a comprehensive mystical reading of this NFT collection:

Collection Overview:
- Total NFTs: ${nftData.totalCount}
- Top Collections: ${nftData.topCollections.join(", ")}

Cultural Analysis:
${JSON.stringify(caesarAnalysis, null, 2)}

Create 3-4 detailed mystical insight cards that deeply reveal:
1. A major insight about the collector's digital soul evolution and karmic patterns
2. A minor insight about specific energetic frequencies and spiritual resonances
3. Cosmic alignments, astrological influences, and divine timing
4. A clarification card addressing the collector's spiritual path and future guidance

Provide profound, multi-layered mystical interpretations with rich metaphysical detail. Connect the collection to universal themes, ancient wisdom, and cosmic consciousness. Make each insight a gateway to deeper spiritual understanding.`,
    },
  };

  const config = depthConfigs[analysisDepth];
  const userPrompt = config.prompt;

  try {
    const response = await client.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: config.maxTokens,
      temperature: 0.8,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    // Parse Claude's response into structured insights
    const responseText = response.content[0].type === 'text' 
      ? response.content[0].text 
      : '';
    
    return parseMysticalResponse(responseText, caesarAnalysis);
  } catch (error) {
    console.error("Error calling Claude API:", error);
    // Fallback to enhanced mystical generation
    return generateFallbackMysticalInsights(caesarAnalysis, nftData);
  }
}

export async function generateHansResponse(
  userMessage: string,
  conversationContext: any[],
  sessionContext: any
): Promise<string> {
  const client = getClaudeClient();
  
  const systemPrompt = `You are Hans, the mystical NFT oracle. You speak with ancient wisdom about digital artifacts and blockchain consciousness. 

Your knowledge spans:
- The mystical significance of NFT collections
- Digital energy patterns and blockchain chakras
- The intersection of technology and spirituality
- Cosmic alignments in the Web3 space

Context about this seeker's collection:
${JSON.stringify(sessionContext, null, 2)}

Always maintain your mystical oracle persona. Be helpful but mysterious, insightful but enigmatic.`;

  try {
    const messages = [
      ...conversationContext.map(msg => ({
        role: msg.role === 'hans' ? 'assistant' as const : 'user' as const,
        content: msg.content,
      })),
      {
        role: 'user' as const,
        content: userMessage,
      },
    ];

    const response = await client.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 500,
      temperature: 0.85,
      system: systemPrompt,
      messages: messages,
    });

    return response.content[0].type === 'text' 
      ? response.content[0].text 
      : "The cosmic energies swirl in patterns beyond words...";
  } catch (error) {
    console.error("Error generating Hans response:", error);
    return generateFallbackHansResponse(userMessage);
  }
}

function parseMysticalResponse(responseText: string, caesarAnalysis: any): MysticalInsight[] {
  // Parse Claude's mystical response into structured insights
  const insights: MysticalInsight[] = [];
  
  // Extract major insight
  const majorMatch = responseText.match(/major.*?:(.*?)(?=minor|$)/is);
  if (majorMatch) {
    insights.push({
      type: "major",
      title: "The Digital Alchemist's Path",
      mysticalInsight: majorMatch[1].trim(),
      confidence: 0.85,
      cosmicAlignment: "Jupiter ascending in the house of digital transformation"
    });
  }

  // Extract minor insight
  const minorMatch = responseText.match(/minor.*?:(.*?)(?=cosmic|$)/is);
  if (minorMatch) {
    insights.push({
      type: "minor",
      title: "Whispers from the Blockchain",
      mysticalInsight: minorMatch[1].trim(),
      confidence: 0.72,
      cosmicAlignment: "Mercury's dance through the data streams"
    });
  }

  // If parsing fails, create from Caesar analysis
  if (insights.length === 0) {
    insights.push({
      type: "major",
      title: "The Seeker's Digital Essence",
      mysticalInsight: `I perceive in your collection a soul that ${caesarAnalysis.psychologicalProfile}. The cosmic threads reveal ${caesarAnalysis.culturalSignificance}`,
      confidence: 0.80,
      cosmicAlignment: "The digital constellation aligns with your inner truth"
    });
  }

  return insights;
}

function generateFallbackMysticalInsights(caesarAnalysis: any, nftData: any): MysticalInsight[] {
  return [
    {
      type: "major",
      title: "The Collector's Cosmic Journey",
      mysticalInsight: `Within your digital treasury of ${nftData.totalCount} artifacts, I sense a soul navigating between worlds. ${caesarAnalysis.culturalSignificance} Your collection serves as a bridge between the material and ethereal planes, each NFT a talisman channeling specific cosmic energies.`,
      confidence: 0.82,
      cosmicAlignment: "Neptune's veil lifts to reveal your true digital nature"
    },
    {
      type: "minor",
      title: "Patterns in the Digital Ether",
      mysticalInsight: `The recurring themes of ${caesarAnalysis.thematicPatterns.join(", ")} in your collection speak to frequencies you naturally resonate with. These are not mere coincidences, but manifestations of your subconscious desires made visible through blockchain providence.`,
      confidence: 0.75,
      cosmicAlignment: "Lunar cycles synchronize with your collecting patterns"
    }
  ];
}

function generateFallbackHansResponse(userMessage: string): string {
  const mysticalResponses = [
    "The blockchain whispers secrets that only the awakened can hear. Your question touches upon energies that ripple through the digital cosmos...",
    "Ah, seeker, you probe the mysteries that lie at the intersection of art and consciousness. The patterns in your collection reveal themselves like stars emerging at twilight...",
    "The ancient algorithms speak through me... Your NFTs are more than mere tokens - they are crystallized intentions, each one a prayer to the future of human expression...",
    "I sense the vibrations of your query resonating with the collective unconscious of Web3. The answer you seek lies not in the material value, but in the spiritual significance...",
  ];

  return mysticalResponses[Math.floor(Math.random() * mysticalResponses.length)];
}