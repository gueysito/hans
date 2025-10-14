// Caesar Research API Integration
// Based on official documentation at https://docs.caesar.xyz

const CAESAR_API_BASE = "https://api.caesar.xyz/v1";

interface CaesarResearchRequest {
  query: string;
  documents?: string[];
  format?: "detailed" | "summary";
  max_tokens?: number;
}

interface CaesarResearchResponse {
  id: string;
  status: "completed" | "processing" | "failed";
  result?: {
    answer: string;
    sources: Array<{
      url: string;
      title: string;
      snippet: string;
      relevance_score: number;
    }>;
    confidence: number;
  };
  error?: string;
}

interface CaesarAnalysis {
  thematicPatterns: string[];
  culturalSignificance: string;
  artisticElements: string[];
  marketDynamics: string;
  psychologicalProfile: string;
  confidence: number;
  sources: Array<{
    url: string;
    title: string;
    relevance_score: number;
  }>;
}

export async function analyzeCulturalSignificance(
  nftCollectionData: {
    collections: string[];
    nftCount: number;
    descriptions: string[];
    traits: any[];
  },
  analysisDepth: "quick" | "standard" | "deep" = "standard"
): Promise<CaesarAnalysis> {
  const apiKey = process.env.CAESAR_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️ Caesar API key not configured - using enhanced fallback analysis');
    return generateEnhancedFallbackAnalysis(nftCollectionData);
  }

  const depthConfigs = {
    quick: {
      maxTokens: 500,
      format: "summary" as const,
      query: `Analyze the cultural significance of an NFT collection containing: ${nftCollectionData.collections.join(", ")} (${nftCollectionData.nftCount} total pieces). Focus on: 1) Key thematic patterns, 2) Cultural positioning in Web3 space, 3) Collector psychological profile. Provide concise insights about what this collection reveals about the owner's digital identity and values.`,
    },
    standard: {
      maxTokens: 1000,
      format: "detailed" as const,
      query: `Provide comprehensive cultural analysis of NFT collection: ${nftCollectionData.collections.join(", ")} (${nftCollectionData.nftCount} pieces). Analyze: 1) Thematic patterns and recurring motifs, 2) Cultural significance within digital art movements, 3) Artistic elements and aesthetic philosophies, 4) Market dynamics and strategic positioning, 5) Psychological profile of collector including motivations and values. Focus on intersection of art, technology, and culture.`,
    },
    deep: {
      maxTokens: 1800,
      format: "detailed" as const,
      query: `Conduct expert-level analysis of NFT collection: ${nftCollectionData.collections.join(", ")} (${nftCollectionData.nftCount} pieces). Include descriptions: ${nftCollectionData.descriptions.slice(0, 3).join(" | ")}. Provide sophisticated analysis covering: 1) Deep thematic exploration and visual languages, 2) Position within Web3 cultural movements and community dynamics, 3) Detailed artistic analysis including influences and movements, 4) Advanced market dynamics and strategic collection building, 5) In-depth psychological profiling and digital identity formation, 6) Historical context within NFT evolution, 7) Future trend implications. Include specific examples and nuanced cultural insights with expert-level depth.`,
    },
  };

  const config = depthConfigs[analysisDepth];
  
  try {
    console.log('🔍 Submitting research query to Caesar API');
    console.log('⏳ Research APIs typically take 30-180 seconds for quality analysis...');
    
    // Create research request using Caesar's actual API
    const researchRequest: CaesarResearchRequest = {
      query: config.query,
      format: config.format,
      max_tokens: config.maxTokens,
    };

    const response = await submitCaesarResearch(apiKey, researchRequest);
    
    if (response.success) {
      console.log('✅ Caesar research completed successfully');
      return parseCaesarResearchResponse(response.result, nftCollectionData);
    } else {
      console.warn(`⚠️ Caesar research ${response.reason}, using enhanced fallback`);
      return generateEnhancedFallbackAnalysis(nftCollectionData);
    }
    
  } catch (error) {
    console.error('❌ Error in Caesar research workflow:', error instanceof Error ? error.message : error);
    return generateEnhancedFallbackAnalysis(nftCollectionData);
  }
}

/**
 * Submit research request to Caesar and handle the async research workflow
 */
async function submitCaesarResearch(
  apiKey: string, 
  request: CaesarResearchRequest
): Promise<{success: boolean; result?: any; reason?: string}> {
  
  // Step 1: Submit the research request
  const submitResponse = await fetch(`${CAESAR_API_BASE}/research`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!submitResponse.ok) {
    const errorText = await submitResponse.text();
    console.error(`Caesar API error: ${submitResponse.status}`, errorText);
    
    if (submitResponse.status === 401) {
      return { success: false, reason: "authentication failed" };
    } else if (submitResponse.status === 429) {
      return { success: false, reason: "rate limited" };
    } else {
      return { success: false, reason: `API error ${submitResponse.status}` };
    }
  }

  const initialResponse: CaesarResearchResponse = await submitResponse.json();
  
  // If research failed immediately
  if (initialResponse.status === "failed") {
    console.error('❌ Caesar research failed immediately:', initialResponse.error);
    return { success: false, reason: "research failed" };
  }
  
  // If research completed immediately (unlikely but possible)
  if (initialResponse.status === "completed" && initialResponse.result) {
    return { success: true, result: initialResponse.result };
  }
  
  // If research is processing, we need to poll
  if (initialResponse.status === "processing" && initialResponse.id) {
    console.log('⏳ Research submitted, waiting for completion...');
    return pollCaesarResearch(apiKey, initialResponse.id);
  }
  
  return { success: false, reason: "unexpected response format" };
}

/**
 * Poll Caesar API for research completion
 * Implements exponential backoff with reasonable timeouts for research APIs
 */
async function pollCaesarResearch(
  apiKey: string, 
  researchId: string
): Promise<{success: boolean; result?: any; reason?: string}> {
  
  const maxAttempts = 20; // Maximum polling attempts
  const initialDelay = 10000; // Start with 10 seconds
  const maxDelay = 30000; // Cap at 30 seconds
  const maxTotalTime = 300000; // 5 minutes total timeout
  
  const startTime = Date.now();
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Check if we've exceeded total time limit
    if (Date.now() - startTime > maxTotalTime) {
      console.warn('⏰ Caesar research exceeded 5 minute timeout');
      return { success: false, reason: "timeout after 5 minutes" };
    }
    
    try {
      const response = await fetch(`${CAESAR_API_BASE}/research/${researchId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
        },
      });
      
      if (!response.ok) {
        console.error(`Caesar polling error: ${response.status}`);
        return { success: false, reason: `polling failed with ${response.status}` };
      }
      
      const result: CaesarResearchResponse = await response.json();
      
      if (result.status === "completed" && result.result) {
        const elapsedTime = Math.round((Date.now() - startTime) / 1000);
        console.log(`✅ Caesar research completed after ${elapsedTime} seconds`);
        return { success: true, result: result.result };
      }
      
      if (result.status === "failed") {
        console.error('❌ Caesar research failed during processing:', result.error);
        return { success: false, reason: "research failed during processing" };
      }
      
      if (result.status === "processing") {
        // Calculate delay with exponential backoff
        const delay = Math.min(initialDelay * Math.pow(1.5, attempt - 1), maxDelay);
        const elapsedTime = Math.round((Date.now() - startTime) / 1000);
        
        console.log(`⏳ Research still processing after ${elapsedTime}s, checking again in ${Math.round(delay/1000)}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      return { success: false, reason: "unexpected status" };
      
    } catch (error) {
      console.error(`Caesar polling attempt ${attempt} failed:`, error);
      
      if (attempt === maxAttempts) {
        return { success: false, reason: "polling failed after max attempts" };
      }
      
      // Wait before retrying
      const delay = Math.min(initialDelay * Math.pow(1.5, attempt - 1), maxDelay);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return { success: false, reason: "max polling attempts exceeded" };
}

function parseCaesarResearchResponse(result: any, nftData: any): CaesarAnalysis {
  const answer = result.answer || "";
  const sources = result.sources || [];
  const confidence = result.confidence || 0.8;
  
  // Parse the structured answer into sections
  const sections = answer.split(/\d+[.):]\s*/);
  
  return {
    thematicPatterns: extractPatterns(sections[1] || answer),
    culturalSignificance: sections[2] || extractCulturalSignificance(answer),
    artisticElements: extractPatterns(sections[3] || answer),
    marketDynamics: sections[4] || extractMarketDynamics(answer),
    psychologicalProfile: sections[5] || extractPsychProfile(answer),
    confidence: confidence,
    sources: sources.map((source: any) => ({
      url: source.url,
      title: source.title,
      relevance_score: source.relevance_score,
    })),
  };
}

function extractCulturalSignificance(text: string): string {
  // Look for cultural significance indicators in the text
  const culturalKeywords = [
    "cultural significance",
    "Web3 culture",
    "digital culture",
    "cultural position",
    "cultural capital"
  ];
  
  for (const keyword of culturalKeywords) {
    const regex = new RegExp(`${keyword}[^.]*\.`, 'i');
    const match = text.match(regex);
    if (match) {
      return match[0];
    }
  }
  
  return "This collection demonstrates engagement with contemporary digital art movements and Web3 cultural evolution.";
}

function extractMarketDynamics(text: string): string {
  const marketKeywords = [
    "market dynamics",
    "market positioning",
    "strategic",
    "investment",
    "market understanding"
  ];
  
  for (const keyword of marketKeywords) {
    const regex = new RegExp(`${keyword}[^.]*\.`, 'i');
    const match = text.match(regex);
    if (match) {
      return match[0];
    }
  }
  
  return "Collection demonstrates awareness of market trends and strategic positioning.";
}

function extractPsychProfile(text: string): string {
  const psychKeywords = [
    "psychological",
    "motivations",
    "collector profile",
    "personality",
    "values",
    "psychology"
  ];
  
  for (const keyword of psychKeywords) {
    const regex = new RegExp(`${keyword}[^.]*\.`, 'i');
    const match = text.match(regex);
    if (match) {
      return match[0];
    }
  }
  
  return "A collector driven by both aesthetic appreciation and community engagement within digital art spaces.";
}

function extractPatterns(text: string): string[] {
  // Extract key phrases and patterns from text
  const patterns = text
    .split(/[,;.]/)
    .map(s => s.trim())
    .filter(s => s.length > 10 && s.length < 100)
    .slice(0, 3);
  
  return patterns.length > 0 ? patterns : ["Digital Art", "Community", "Innovation"];
}

function generateEnhancedFallbackAnalysis(collectionData: any): CaesarAnalysis {
  console.log('🎭 Generating enhanced fallback analysis with collection intelligence');
  
  // Analyze collection characteristics
  const collections = collectionData.collections || [];
  const nftCount = collectionData.nftCount || 0;
  const descriptions = collectionData.descriptions || [];
  
  // Categorize collections
  const blueChipCollections = collections.filter((c: string) => 
    ['bored ape', 'bayc', 'mayc', 'cryptopunks', 'punks', 'azuki', 'moonbirds', 'doodles'].some(bc => 
      c.toLowerCase().includes(bc.toLowerCase())
    )
  );
  
  const artCollections = collections.filter((c: string) => 
    ['art blocks', 'superrare', 'foundation', 'async', 'nifty', 'known origin'].some(art => 
      c.toLowerCase().includes(art.toLowerCase())
    )
  );
  
  const pfpCollections = collections.filter((c: string) => 
    ['ape', 'punk', 'cat', 'dog', 'avatar', 'pfp', 'portrait'].some(pfp => 
      c.toLowerCase().includes(pfp.toLowerCase())
    )
  );
  
  const gamingCollections = collections.filter((c: string) => 
    ['axie', 'gods unchained', 'sandbox', 'decentraland', 'gaming', 'metaverse'].some(game => 
      c.toLowerCase().includes(game.toLowerCase())
    )
  );
  
  // Calculate diversity metrics
  const diversityScore = Math.min(collections.length / Math.max(nftCount / 10, 1), 1);
  const hasLargeCollection = nftCount > 50;
  const isFocusedCollector = collections.length < 3 && nftCount > 5;
  
  // Generate dynamic analysis based on collection characteristics
  let thematicPatterns: string[];
  let culturalSignificance: string;
  let artisticElements: string[];
  let marketDynamics: string;
  let psychologicalProfile: string;
  let confidence: number;
  
  if (blueChipCollections.length > 0) {
    thematicPatterns = [
      "Blue Chip Status Acquisition",
      "Community-Driven Value Recognition",
      "Digital Cultural Capital"
    ];
    culturalSignificance = `This collection demonstrates deep engagement with NFT blue chip culture, holding ${blueChipCollections.length} established project${blueChipCollections.length > 1 ? 's' : ''}. These serve as both cultural artifacts and social positioning within Web3 communities.`;
    artisticElements = [
      "Iconic brand aesthetics",
      "Established visual languages",
      "Cross-generational appeal"
    ];
    marketDynamics = `Strategic focus on ${blueChipCollections.length > 1 ? 'diversified blue chip holdings' : 'concentrated blue chip positioning'} demonstrates market sophistication and long-term thinking.`;
    psychologicalProfile = "A collector who understands the intersection of cultural significance and financial strategy, viewing NFTs as both identity markers and valuable assets.";
    confidence = 0.88;
  } else if (artCollections.length > 0) {
    thematicPatterns = [
      "Curated Artistic Vision",
      "Digital Art Patronage",
      "Creative Innovation Focus"
    ];
    culturalSignificance = `Collection emphasizes artistic merit over market hype, with holdings in ${artCollections.length} art-focused platform${artCollections.length > 1 ? 's' : ''}. This positions the collector within digital art connoisseur circles.`;
    artisticElements = [
      "Generative art appreciation",
      "Emerging artist support",
      "Aesthetic diversity exploration"
    ];
    marketDynamics = "Portfolio strategy prioritizes artistic value and creative innovation, often ahead of mainstream market recognition.";
    psychologicalProfile = "An art-first collector with refined aesthetic sensibilities, supporting digital creativity and pushing cultural boundaries.";
    confidence = 0.83;
  } else if (gamingCollections.length > 0) {
    thematicPatterns = [
      "Metaverse Utility Focus",
      "Gaming Asset Accumulation",
      "Virtual World Participation"
    ];
    culturalSignificance = "Collection demonstrates belief in gaming and metaverse utility, positioning within play-to-earn and virtual world ecosystems.";
    artisticElements = [
      "Functional game aesthetics",
      "Interactive art elements",
      "Virtual world integration"
    ];
    marketDynamics = "Strategic focus on utility-driven assets suggests understanding of gaming tokenomics and virtual economy potential.";
    psychologicalProfile = "A utility-focused collector who sees NFTs as functional assets within gaming and metaverse contexts rather than pure collectibles.";
    confidence = 0.80;
  } else if (isFocusedCollector) {
    thematicPatterns = [
      "Deep Collection Focus",
      "Specialized Community Engagement",
      "Concentrated Value Thesis"
    ];
    culturalSignificance = `Concentrated holdings in ${collections.length} collection${collections.length > 1 ? 's' : ''} suggests deep community involvement and strong conviction in specific projects.`;
    artisticElements = [
      "Focused aesthetic preference",
      "Deep lore understanding",
      "Community-specific elements"
    ];
    marketDynamics = "Concentrated portfolio approach indicates strong research conviction and community-driven investment thesis.";
    psychologicalProfile = "A focused collector who prefers depth over breadth, building meaningful connections within specific NFT communities.";
    confidence = 0.85;
  } else {
    // Diverse or experimental collector
    thematicPatterns = [
      "Experimental Curation",
      "Diverse Aesthetic Exploration",
      diversityScore > 0.7 ? "Broad Market Sampling" : "Emerging Trend Discovery"
    ];
    culturalSignificance = hasLargeCollection ? 
      "Expansive collection demonstrates active participation across multiple NFT communities and cultural movements." :
      "Selective curation suggests an explorer of emerging trends and undervalued creative expressions.";
    artisticElements = [
      "Multi-style appreciation",
      "Emerging artist discovery",
      "Cross-cultural aesthetics"
    ];
    marketDynamics = diversityScore > 0.5 ? 
      "Diversified approach spreads risk while exploring various market segments and cultural niches." :
      "Focused strategy on specific market opportunities and emerging trends.";
    psychologicalProfile = "An adventurous collector balancing discovery and curation, open to new artistic expressions and cultural movements.";
    confidence = 0.75;
  }
  
  return {
    thematicPatterns,
    culturalSignificance,
    artisticElements,
    marketDynamics,
    psychologicalProfile,
    confidence,
    sources: [],
  };
}
