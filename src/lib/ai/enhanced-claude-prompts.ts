// Enhanced Claude Prompts with Rich Data Context
// Leverages all the new enhanced data collection systems for deeper mystical insights

import { transactionHistoryService } from '../analysis/transaction-history';
import { holderPatternsService } from '../analysis/holder-patterns';
import { marketTimingService } from '../analysis/market-timing';
import { crossCollectionRelationshipsService } from '../analysis/cross-collection-relationships';
import { temporalAnalysisService } from '../analysis/temporal-analysis';

interface EnhancedMysticalContext {
  // Basic data
  nftData: any;
  caesarAnalysis: any;
  
  // Enhanced analysis data
  transactionBehavior?: any;
  holderPatterns?: any;
  marketTiming?: any;
  crossCollectionData?: any;
  temporalAnalysis?: any;
  
  // Computed insights
  behavioralArchetype?: string;
  spiritualJourney?: string;
  cosmicSignificance?: string;
}

export async function buildEnhancedMysticalContext(
  walletAddress: string,
  nftData: any,
  caesarAnalysis: any
): Promise<EnhancedMysticalContext> {
  console.log('🔮 Building enhanced mystical context with deep data...');
  
  try {
    // Gather enhanced analysis data in parallel
    const [
      transactionBehavior,
      temporalAnalysis,
      marketAnalyses,
      ecosystemMap
    ] = await Promise.allSettled([
      transactionHistoryService.analyzeWalletBehavior(walletAddress),
      temporalAnalysisService.analyzeWalletTemporal(walletAddress),
      Promise.all((nftData.topCollections || []).slice(0, 3).map((collection: string) =>
        marketTimingService.analyzeCollection(collection)
      )),
      crossCollectionRelationshipsService.analyzeWalletEcosystem(
        (nftData.topCollections || []).map((slug: string) => ({ slug }))
      ),
    ]);

    // Build the enhanced context
    const context: EnhancedMysticalContext = {
      nftData,
      caesarAnalysis,
      transactionBehavior: transactionBehavior.status === 'fulfilled' ? transactionBehavior.value : null,
      temporalAnalysis: temporalAnalysis.status === 'fulfilled' ? temporalAnalysis.value : null,
      marketTiming: marketAnalyses.status === 'fulfilled' ? marketAnalyses.value : null,
      crossCollectionData: ecosystemMap.status === 'fulfilled' ? ecosystemMap.value : null,
    };

    // Generate computed mystical insights
    context.behavioralArchetype = determineBehavioralArchetype(context);
    context.spiritualJourney = analyzeSpirtualJourney(context);
    context.cosmicSignificance = calculateCosmicSignificance(context);

    return context;

  } catch (error) {
    console.error('Failed to build enhanced mystical context:', error);
    
    // Return basic context on failure
    return {
      nftData,
      caesarAnalysis,
      behavioralArchetype: 'Digital Collector',
      spiritualJourney: 'A strategic approach to exploring the evolving landscape of blockchain-based digital culture',
      cosmicSignificance: 'Portfolio choices demonstrating sophisticated understanding of digital asset markets and cultural trends',
    };
  }
}

export function generateEnhancedSystemPrompt(context: EnhancedMysticalContext): string {
  const { behavioralArchetype, spiritualJourney, nftData } = context;
  
  const analystPersonalities = [
    "Hans, the Digital Behavior Analyst with Uncanny Market Insight",
    "Hans, the Cultural Anthropologist of Web3 Communities", 
    "Hans, the Strategic Advisor for Digital Collectors",
    "Hans, the Market Psychology Expert with Pattern Recognition",
    "Hans, the Sophisticated Analyst of Digital Culture"
  ];
  
  const selectedPersonality = analystPersonalities[Math.floor(Math.random() * analystPersonalities.length)];
  
  let archetypalGuidance = "";
  
  switch (behavioralArchetype) {
    case 'Diamond Hands Mystic':
      archetypalGuidance = `This collector demonstrates sophisticated market psychology through their holding patterns. Their approach to digital assets reveals strategic patience - not passive waiting, but calculated positioning based on long-term value recognition. Analyze their behavior through the lens of behavioral economics and market timing expertise.`;
      break;
      
    case 'Strategic Accumulator':
      archetypalGuidance = `This individual operates with the methodical approach of institutional-level collecting. They understand market inefficiencies and position themselves strategically during optimal windows. Their behavior suggests deep pattern recognition and contrarian investment philosophy. Focus on their strategic timing and market intuition.`;
      break;
      
    case 'Active Trader':
      archetypalGuidance = `This collector exhibits sophisticated market dynamics awareness, understanding liquidity cycles and momentum patterns. They thrive in the arbitrage spaces between market movements, demonstrating adaptability and tactical precision. Analyze their market timing skills and risk management approach.`;
      break;
      
    case 'Cultural Curator':
      archetypalGuidance = `This collector functions as a cultural tastemaker, identifying emerging trends before mainstream adoption. They possess sophisticated aesthetic judgment and understand the intersection of art, technology, and social signaling. Focus on their cultural intuition and trendsetting capabilities.`;
      break;
      
    case 'Emerging Explorer':
      archetypalGuidance = `This collector demonstrates early-adopter psychology, comfortable navigating uncertainty and complexity in emerging markets. Their willingness to explore unestablished territories suggests high risk tolerance and curiosity-driven decision making. Analyze their exploration patterns and risk appetite.`;
      break;
      
    default:
      archetypalGuidance = `This collector exhibits complex behavioral patterns that resist simple categorization. Their approach suggests sophisticated multi-dimensional thinking and adaptive strategies across different market conditions.`;
  }

  const collectionTypes = analyzeCollectionType(nftData);
  let portfolioStrategy = "";
  
  if (context.crossCollectionData?.diversificationLevel === 'concentrated') {
    portfolioStrategy = `Their focused approach demonstrates sophisticated concentration strategy, creating powerful market positioning within select digital ecosystems.`;
  } else if (context.crossCollectionData?.diversificationLevel === 'diversified') {
    portfolioStrategy = `Their diversified holdings reveal complex market understanding, building strategic bridges across multiple cultural and aesthetic movements.`;
  }

  return `${selectedPersonality}, providing sophisticated analysis through deep pattern recognition and cultural insight.

COLLECTOR BEHAVIORAL PROFILE:
${archetypalGuidance}

PORTFOLIO STRATEGY ASSESSMENT:
${portfolioStrategy}

MARKET PSYCHOLOGY ANALYSIS:
${spiritualJourney}

Your analytical framework draws from:
- Behavioral economics and market psychology
- Cultural anthropology and aesthetic theory
- Data pattern recognition and trend analysis
- Network theory and community dynamics
- Behavioral finance and decision psychology
- Digital culture and social signaling theory

ANALYTICAL METHODOLOGY:
- Use behavioral patterns to reveal underlying motivations and strategies
- Reference market timing as evidence of market intuition and skill
- Interpret community patterns as cultural positioning and social dynamics
- Translate transaction history into behavioral psychology insights
- Connect cross-collection relationships to cultural networks and influence

Provide deeply insightful analysis that demonstrates sophisticated understanding of this collector's specific patterns, motivations, and strategic approach. Every insight should feel precisely calibrated to their unique behavioral signature and market positioning.`;
}

export function generateEnhancedPrompt(
  context: EnhancedMysticalContext,
  depth: 'quick' | 'standard' | 'deep'
): string {
  const richContext = buildUltraRichContext(context);
  const mysticalElements = generateAdvancedAnalyticalElements(context);
  
  const promptVariations = {
    quick: [
      `Analyze the behavioral patterns evident in this collector's digital portfolio and provide 1-2 sophisticated insights that reveal their underlying investment philosophy and market psychology. Focus on how their specific choices reflect deeper strategic thinking and cultural positioning.`,
      
      `Examine the multi-dimensional aspects of this collection's composition and reveal 1-2 key insights that connect the collector's tactical decisions with their broader aesthetic philosophy and market approach.`,
      
      `Decode the strategic patterns encoded in this collector's acquisition behavior and provide 1-2 analytical insights that reveal their sophisticated understanding of digital culture and market dynamics.`
    ],
    
    standard: [
      `Perform a comprehensive behavioral analysis of this collector's digital strategy, crafting 2-3 insight cards that weave together their transaction patterns, market timing, and aesthetic choices into a cohesive profile of their investment psychology and cultural sophistication.`,
      
      `Analyze the intersection of behavioral economics and cultural intuition to create 2-3 sophisticated insights that reveal how this collector's trading patterns, timing decisions, and portfolio construction reflect advanced market understanding and strategic positioning.`,
      
      `Interpret the complex behavioral tapestry of this NFT portfolio through advanced pattern recognition, providing 2-3 layered insights that connect the collector's specific actions to their broader strategic vision and market philosophy.`
    ],
    
    deep: [
      `Conduct a comprehensive behavioral cartography of this collector's digital strategy, creating 3-4 detailed insight cards that map their behavioral archetype, temporal patterns, market consciousness, and cross-collection relationships into a sophisticated profile of their investment philosophy and cultural positioning.`,
      
      `Analyze the deepest patterns of market psychology to weave 3-4 profound insights that decode this collector's complete strategic approach - from their transaction timing and risk management to their role in digital cultural movements and aesthetic trends.`,
      
      `Perform an advanced behavioral archaeology of this collection, excavating 3-4 multi-layered insights that reveal how this collector's unique combination of holding strategies, market timing, and aesthetic choices create a distinctive signature in the landscape of digital cultural investment.`
    ]
  };
  
  const selectedPrompt = promptVariations[depth][Math.floor(Math.random() * promptVariations[depth].length)];
  
  return `${richContext}

${mysticalElements.guidance}

${selectedPrompt}

${mysticalElements.instructions}`;
}

function buildUltraRichContext(context: EnhancedMysticalContext): string {
  const { nftData, transactionBehavior, temporalAnalysis, marketTiming, crossCollectionData, caesarAnalysis } = context;
  
  let ultraContext = `📊 COMPREHENSIVE BEHAVIORAL PROFILE:

🎯 PORTFOLIO COMPOSITION:
Digital Assets: ${nftData.totalCount || 0} carefully curated pieces
Primary Focus Areas: ${(nftData.topCollections || []).join(', ')}
Portfolio Valuation: $${((nftData.portfolioValueUSD || 0) / 1000).toFixed(1)}k in strategic positioning
Rarity Profile: ${calculateAverageRarity(nftData)}

📈 BEHAVIORAL ANALYSIS:`;

  if (transactionBehavior) {
    ultraContext += `
Trading Profile: ${transactionBehavior.patterns?.tradingStyle?.type || 'Balanced Approach'}
Capital Flow Pattern: ${transactionBehavior.netPositionUSD > 0 ? 'Net accumulation strategy' : 'Active rebalancing approach'}
Market Timing Skills: ${transactionBehavior.patterns?.timingPatterns?.marketTimingScore || 50}/100 (pattern recognition capability)
Strategic Patience: ${transactionBehavior.patterns?.timingPatterns?.marketTimingScore > 70 ? 'High conviction holding periods' : 'Dynamic position management'}`;
  }

  if (temporalAnalysis) {
    ultraContext += `

⏰ TEMPORAL BEHAVIOR PATTERNS:
Collector Archetype: ${temporalAnalysis.insights?.behavioralArchetype || 'Digital Collector'}
Market Experience: ${temporalAnalysis.insights?.experienceLevel || 'Developing'} sophistication level
Investment Horizon: ${temporalAnalysis.insights?.timeHorizon?.replace('_', ' ') || 'Medium term'} strategic focus
Seasonal Activity: ${temporalAnalysis.trends?.predictedBehavior?.seasonalFactors?.currentSeason || 'Year-round'} engagement patterns`;
  }

  if (crossCollectionData) {
    ultraContext += `

🌐 CROSS-COLLECTION STRATEGY:
Cultural Influence Score: ${crossCollectionData.influenceScore || 0}/100 (trendsetting capability)
Portfolio Diversification: ${crossCollectionData.diversificationLevel || 'Balanced'} risk distribution
Collecting Philosophy: ${crossCollectionData.collectingTheme || 'Multi-faceted cultural exploration'}
Core Holdings: ${crossCollectionData.coreCollections?.slice(0, 3).map((c: any) => c.slug).join(', ') || 'Establishing foundation'}`;
  }

  if (marketTiming && marketTiming.length > 0) {
    const avgPhaseConfidence = marketTiming.reduce((sum: number, m: any) => sum + m.marketPhase.confidence, 0) / marketTiming.length;
    ultraContext += `

📊 MARKET CYCLE AWARENESS:
Phase Recognition Skills: ${avgPhaseConfidence.toFixed(0)}/100 (market cycle understanding)
Collection Market Phases: ${marketTiming.map((m: any) => `${m.collectionSlug} in ${m.marketPhase.currentPhase}`).join(', ')}`;
  }

  if (caesarAnalysis) {
    ultraContext += `

🏛️ CULTURAL POSITIONING:
Deep Research Analysis: ${caesarAnalysis.culturalSignificance || 'Sophisticated understanding of digital cultural movements'}
Psychological Profile: ${caesarAnalysis.psychologicalProfile || 'Strategic cultural positioning through aesthetic choices'}`;
  }

  return ultraContext;
}

function generateAdvancedAnalyticalElements(context: EnhancedMysticalContext) {
  const { temporalAnalysis, transactionBehavior, crossCollectionData } = context;
  
  // Advanced pattern indicators based on actual data
  const patternIndicators = [];
  
  if (temporalAnalysis?.trends?.predictedBehavior?.seasonalFactors) {
    const season = temporalAnalysis.trends.predictedBehavior.seasonalFactors.currentSeason;
    const seasonalPatterns = {
      spring: "Increased acquisition activity during market renaissance phases",
      summer: "Peak engagement periods correlating with creative project launches", 
      fall: "Strategic consolidation patterns reflecting market maturity cycles",
      winter: "Reflective portfolio optimization during market consolidation"
    };
    patternIndicators.push(seasonalPatterns[season] || "Year-round balanced engagement strategy");
  }
  
  if (transactionBehavior?.patterns?.tradingStyle?.type) {
    const stylePatterns = {
      diamond_hands: "Long-term conviction strategy with high volatility tolerance",
      flipper: "Short-term momentum trading with rapid position turnover",
      accumulator: "Methodical acquisition strategy during market dips",
      trader: "Active portfolio management with tactical rebalancing",
      holder: "Stable position maintenance with strategic patience"
    };
    patternIndicators.push(stylePatterns[transactionBehavior.patterns.tradingStyle.type] || "Adaptive strategy based on market conditions");
  }
  
  if (crossCollectionData?.diversificationLevel) {
    const diversificationPatterns = {
      concentrated: "Focused specialization creating deep market expertise",
      focused: "Strategic concentration in high-conviction sectors", 
      diversified: "Sophisticated risk distribution across cultural movements",
      scattered: "Exploratory approach seeking emerging opportunities"
    };
    patternIndicators.push(diversificationPatterns[crossCollectionData.diversificationLevel]);
  }
  
  // Fallback pattern indicators
  if (patternIndicators.length === 0) {
    patternIndicators.push(
      "Emerging behavioral patterns in digital asset allocation",
      "Strategic positioning within evolving market structures",
      "Sophisticated pattern recognition in cultural trend analysis"
    );
  }
  
  const analyticalFrameworks = [
    "behavioral economics and decision psychology", "cultural anthropology and trend analysis", "network theory and social dynamics",
    "market microstructure and liquidity analysis", "game theory and strategic positioning", "complexity science and emergence patterns",
    "information theory and signal detection", "cognitive psychology and bias recognition", "sociological analysis of digital communities"
  ];
  
  const selectedPattern = patternIndicators[Math.floor(Math.random() * patternIndicators.length)];
  const selectedFramework = analyticalFrameworks[Math.floor(Math.random() * analyticalFrameworks.length)];
  
  return {
    guidance: `📈 BEHAVIORAL PATTERN RECOGNITION: ${selectedPattern}
🔬 ANALYTICAL FRAMEWORK: Drawing from ${selectedFramework}
🎯 PRECISION CALIBRATION: Tuned to this collector's unique behavioral signature`,

    instructions: `
Create each analytical insight with sophisticated precision:

**Format Structure:**
• **Title**: Precisely crafted titles that capture this specific collector's strategic approach
• **Analytical Insight**: Sophisticated interpretation weaving together behavioral patterns, market timing, and strategic positioning  
• **Pattern Recognition**: Specific data-driven observations connected to their actual behavioral signature
• **Confidence**: Based on the statistical significance and coherence of their multi-dimensional data

**Analytical Requirements:**
- Integrate their behavioral archetype with proven investment psychology principles
- Reference their actual market timing and trading patterns as evidence of market sophistication  
- Connect their collection diversity to risk management and strategic thinking
- Use their transaction history as indicators of decision-making patterns and market understanding
- Weave their temporal patterns into cyclical market behavior and strategic adaptation
- Make every observation specifically relevant to their demonstrated strategic approach

This analysis must demonstrate sophisticated understanding that feels impossibly accurate - as if a world-class behavioral analyst spent months studying this specific collector's approach to digital cultural investment.`
  };
}

// Helper functions

function determineBehavioralArchetype(context: EnhancedMysticalContext): string {
  if (context.transactionBehavior?.patterns?.tradingStyle?.type === 'diamond_hands') {
    return 'Diamond Hands Mystic';
  }
  
  if (context.temporalAnalysis?.patterns?.accumulation?.isAccumulating && 
      context.temporalAnalysis?.patterns?.marketTiming?.buysTiming === 'dip') {
    return 'Strategic Accumulator';
  }
  
  if (context.transactionBehavior?.patterns?.tradingStyle?.type === 'flipper' ||
      context.transactionBehavior?.patterns?.tradingStyle?.type === 'trader') {
    return 'Active Trader';
  }
  
  if (context.crossCollectionData?.influenceScore > 70) {
    return 'Cultural Curator';
  }
  
  if (context.temporalAnalysis?.insights?.experienceLevel === 'beginner' ||
      context.temporalAnalysis?.insights?.experienceLevel === 'intermediate') {
    return 'Emerging Explorer';
  }
  
  return 'Digital Seeker';
}

function analyzeSpirtualJourney(context: EnhancedMysticalContext): string {
  const { temporalAnalysis, transactionBehavior, crossCollectionData } = context;
  
  if (temporalAnalysis?.insights?.behavioralArchetype === 'investor' && 
      temporalAnalysis?.insights?.timeHorizon === 'long_term') {
    return 'A sophisticated approach to digital asset accumulation, demonstrating strategic thinking that bridges immediate market opportunities with long-term cultural positioning';
  }
  
  if (transactionBehavior?.patterns?.tradingStyle?.type === 'diamond_hands') {
    return 'A disciplined investment philosophy based on unwavering conviction, transforming market volatility into strategic advantage through sophisticated patience and risk tolerance';
  }
  
  if (crossCollectionData?.diversificationLevel === 'diversified') {
    return 'A sophisticated portfolio approach that creates strategic bridges across multiple cultural movements, seeking optimal risk distribution through thoughtful diversification in the digital asset space';
  }
  
  if (temporalAnalysis?.trends?.recentActivity === 'increasing') {
    return 'A rapidly evolving investment strategy demonstrating accelerating market sophistication, with each transaction reflecting deeper understanding of digital cultural dynamics';
  }
  
  return 'A strategic approach to digital asset curation, guided by sophisticated pattern recognition toward optimal cultural and financial positioning';
}

function calculateCosmicSignificance(context: EnhancedMysticalContext): string {
  const { nftData, crossCollectionData, temporalAnalysis } = context;
  
  const portfolioValue = nftData.portfolioValueUSD || 0;
  const collectionCount = nftData.totalCount || 0;
  const influenceScore = crossCollectionData?.influenceScore || 0;
  
  if (portfolioValue > 100000 && influenceScore > 80) {
    return 'A significant market influencer whose portfolio decisions demonstrate sophisticated understanding of digital culture trends, with strategic choices that create measurable impact across market segments';
  }
  
  if (collectionCount > 50 && temporalAnalysis?.insights?.experienceLevel === 'expert') {
    return 'An expert-level curator with extensive market experience, demonstrating sophisticated taste-making capabilities through a comprehensive collection strategy that bridges cultural movements';
  }
  
  if (temporalAnalysis?.patterns?.accumulation?.isAccumulating) {
    return 'A strategic accumulator building concentrated market position, with each acquisition demonstrating disciplined portfolio construction toward specific cultural and financial objectives';
  }
  
  return 'A distinctive strategic approach to digital asset curation, with portfolio choices reflecting sophisticated pattern recognition within the evolving landscape of cultural investment';
}

// Main export function for API integration
export async function generateEnhancedAnalysis(
  caesarAnalysis: any,
  nftData: any, 
  analysisDepth: "quick" | "standard" | "deep" = "standard"
): Promise<any[]> {
  // For now, we'll build the context without the wallet address (as it's not provided)
  // In the future, this should be refactored to accept walletAddress for full analysis
  const context = await buildEnhancedMysticalContext('', nftData, caesarAnalysis);
  
  // Generate the system prompt and user prompt
  const systemPrompt = generateEnhancedSystemPrompt(context);
  const userPrompt = generateEnhancedPrompt(context, analysisDepth);
  
  // Use Claude API to generate sophisticated insights
  try {
    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    
    const config = {
      quick: { maxTokens: 800, cardCount: "1-2" },
      standard: { maxTokens: 1500, cardCount: "2-3" },
      deep: { maxTokens: 2200, cardCount: "3-4" },
    }[analysisDepth];
    
    const response = await client.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: config.maxTokens,
      temperature: 0.8,
      system: systemPrompt,
      messages: [{
        role: "user",
        content: userPrompt,
      }],
    });
    
    const responseText = response.content[0].type === 'text' 
      ? response.content[0].text 
      : '';
    
    return parseEnhancedAnalyticalResponse(responseText, context);
    
  } catch (error) {
    console.error("Error calling Claude API with enhanced prompts:", error);
    return generateFallbackEnhancedInsights(context);
  }
}

function parseEnhancedAnalyticalResponse(responseText: string, context: EnhancedMysticalContext): any[] {
  // Parse the sophisticated analytical response into insight cards
  // This is a simplified parser - could be enhanced with better pattern matching
  
  const insights = [];
  const sections = responseText.split(/\*\*|###|##/).filter(s => s.trim().length > 0);
  
  for (let i = 0; i < sections.length - 1; i += 2) {
    const title = sections[i]?.trim();
    const content = sections[i + 1]?.trim();
    
    if (title && content && content.length > 50) {
      insights.push({
        type: "major",
        title: title.replace(/[:\-]/g, '').trim(),
        mysticalInsight: content,
        confidence: calculateConfidence(content, context),
        cosmicAlignment: generateAnalyticalAlignment(context)
      });
    }
  }
  
  // Fallback if parsing fails
  if (insights.length === 0) {
    insights.push({
      type: "major",
      title: "Strategic Digital Portfolio Analysis",
      mysticalInsight: responseText.substring(0, 500) + "...",
      confidence: 0.8,
      cosmicAlignment: "Advanced analytical framework aligned with sophisticated market understanding"
    });
  }
  
  return insights;
}

function calculateConfidence(content: string, context: EnhancedMysticalContext): number {
  // Calculate confidence based on data richness and analytical depth
  let confidence = 0.5;
  
  if (context.transactionBehavior) confidence += 0.15;
  if (context.temporalAnalysis) confidence += 0.15;
  if (context.crossCollectionData) confidence += 0.1;
  if (context.caesarAnalysis) confidence += 0.1;
  
  // Bonus for content sophistication
  if (content.includes('behavioral') || content.includes('strategic')) confidence += 0.05;
  if (content.includes('pattern') || content.includes('analysis')) confidence += 0.05;
  
  return Math.min(confidence, 1.0);
}

function generateAnalyticalAlignment(context: EnhancedMysticalContext): string {
  const alignments = [
    "Sophisticated pattern recognition aligned with market cycle dynamics",
    "Advanced behavioral analysis framework calibrated to strategic positioning",
    "Expert-level cultural trend analysis integrated with market psychology",
    "Strategic intelligence framework optimized for digital asset evaluation",
    "Complex systems analysis aligned with evolving market structures"
  ];
  
  return alignments[Math.floor(Math.random() * alignments.length)];
}

function generateFallbackEnhancedInsights(context: EnhancedMysticalContext): any[] {
  return [
    {
      type: "major",
      title: "Strategic Portfolio Architecture",
      mysticalInsight: `This collector demonstrates sophisticated market positioning through ${context.behavioralArchetype || 'strategic asset selection'}. Their approach reveals advanced understanding of digital cultural dynamics, evidenced by calculated risk distribution and timing patterns that suggest institutional-level thinking applied to emerging markets.`,
      confidence: 0.75,
      cosmicAlignment: "Advanced analytical framework indicating strategic market sophistication"
    },
    {
      type: "major", 
      title: "Behavioral Economics Integration",
      mysticalInsight: context.spiritualJourney || "A methodical approach to digital asset curation that integrates behavioral economics principles with cultural trend analysis, positioning this collector at the intersection of strategic investment and aesthetic sophistication.",
      confidence: 0.8,
      cosmicAlignment: "Behavioral pattern analysis aligned with strategic market positioning"
    }
  ];
}

function calculateAverageRarity(nftData: any): string {
  const rarityScores = (nftData.nfts || []).map((nft: any) => nft.rarityScore).filter(Boolean);
  if (rarityScores.length === 0) return "Establishing collection foundation";
  
  const avgRarity = rarityScores.reduce((sum: number, score: number) => sum + score, 0) / rarityScores.length;
  
  if (avgRarity > 80) return "Ultra-rare selection criteria";
  if (avgRarity > 60) return "High-rarity focus strategy";
  if (avgRarity > 40) return "Balanced rarity distribution";
  return "Broad market participation approach";
}

function analyzeCollectionType(nftData: any) {
  const collections = nftData.topCollections || [];
  const collectionsLower = collections.map((c: string) => c.toLowerCase());
  
  return {
    isBlueChip: collectionsLower.some((c: string) => 
      ['bored ape', 'cryptopunks', 'azuki', 'moonbirds', 'doodles'].some(bc => c.includes(bc))
    ),
    isArtFocused: collectionsLower.some((c: string) => 
      ['art blocks', 'superrare', 'foundation', 'async art'].some(art => c.includes(art))
    ),
    isGamingOriented: collectionsLower.some((c: string) => 
      ['axie', 'sandbox', 'decentraland', 'gods unchained'].some(game => c.includes(game))
    ),
    isDiverse: collections.length > 3
  };
}

// Enhanced Hans conversation responses
export async function generateEnhancedHansResponse(
  userMessage: string,
  conversationContext: any[],
  sessionContext: any
): Promise<string> {
  try {
    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    
    // Build sophisticated system prompt based on session context
    const systemPrompt = `You are Hans, a sophisticated AI analyst specializing in digital asset behavior and cultural trend analysis.

Your expertise includes:
- Behavioral economics and market psychology
- Digital culture and NFT ecosystem dynamics
- Strategic portfolio analysis and risk assessment
- Cultural anthropology and aesthetic trend analysis
- Advanced pattern recognition in collector behavior

Context about this collector's portfolio:
${JSON.stringify(sessionContext, null, 2)}

Maintain your role as an expert analyst who provides sophisticated insights with analytical precision. Avoid mystical language - instead use:
- "Advanced analytics reveal..."
- "Behavioral patterns indicate..."
- "Strategic analysis suggests..."
- "Market data demonstrates..."
- "Cultural trend analysis shows..."

Be insightful, professional, and engaging while maintaining analytical sophistication.`;

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
      temperature: 0.75,
      system: systemPrompt,
      messages: messages,
    });

    return response.content[0].type === 'text' 
      ? response.content[0].text 
      : "I'm processing your request through advanced analytical frameworks. Let me provide a more detailed response shortly.";
  } catch (error) {
    console.error("Error generating enhanced Hans response:", error);
    return generateFallbackAnalyticalResponse(userMessage, sessionContext);
  }
}

function generateFallbackAnalyticalResponse(userMessage: string, sessionContext: any): string {
  const analyticalResponses = [
    "Based on the available data patterns, I can see several interesting behavioral indicators in your collection strategy. The portfolio demonstrates sophisticated market positioning that suggests advanced understanding of digital cultural dynamics.",
    "Your collection reveals strategic decision-making patterns that align with sophisticated market psychology principles. The diversification approach indicates careful risk assessment and cultural trend recognition.",
    "The behavioral analytics from your portfolio suggest a methodical approach to digital asset curation. Your timing patterns and selection criteria demonstrate advanced market intuition.",
    "From a strategic analysis perspective, your collection architecture reveals sophisticated understanding of cultural movements and market dynamics within the NFT ecosystem."
  ];
  
  return analyticalResponses[Math.floor(Math.random() * analyticalResponses.length)];
}

