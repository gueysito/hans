// Advanced AI Trend Prediction System for Hans Oracle
interface NFTCollection {
  name: string;
  floorPrice: number;
  volume24h: number;
  holders: number;
  listedCount: number;
  traits: Record<string, any>;
  socialMetrics: {
    twitterFollowers?: number;
    discordMembers?: number;
    mentions24h?: number;
  };
}

interface MarketTrend {
  collection: string;
  prediction: "bullish" | "bearish" | "neutral";
  confidence: number;
  timeframe: "1h" | "24h" | "7d" | "30d";
  factors: Array<{
    factor: string;
    impact: number; // -1 to 1
    description: string;
  }>;
  priceTarget?: {
    low: number;
    high: number;
    target: number;
  };
}

interface PersonalizedRecommendation {
  collection: string;
  score: number;
  reasoning: string[];
  riskLevel: "low" | "medium" | "high";
  investmentThesis: string;
  similarTo: string[]; // Collections user already owns
}

export class TrendPredictionEngine {
  private static instance: TrendPredictionEngine;
  
  private constructor() {}
  
  static getInstance(): TrendPredictionEngine {
    if (!TrendPredictionEngine.instance) {
      TrendPredictionEngine.instance = new TrendPredictionEngine();
    }
    return TrendPredictionEngine.instance;
  }

  async analyzeTrends(collections: NFTCollection[]): Promise<MarketTrend[]> {
    console.log("🤖 Analyzing market trends with AI...");
    
    const trends: MarketTrend[] = [];
    
    for (const collection of collections) {
      const trend = await this.predictCollectionTrend(collection);
      trends.push(trend);
    }
    
    return trends.sort((a, b) => b.confidence - a.confidence);
  }

  private async predictCollectionTrend(collection: NFTCollection): Promise<MarketTrend> {
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
    
    const factors = this.analyzeMarketFactors(collection);
    const prediction = this.calculateTrendPrediction(factors);
    const confidence = this.calculateConfidence(factors);
    
    return {
      collection: collection.name,
      prediction,
      confidence,
      timeframe: "24h",
      factors,
      priceTarget: this.calculatePriceTarget(collection, prediction, confidence)
    };
  }

  private analyzeMarketFactors(collection: NFTCollection): MarketTrend['factors'] {
    const factors = [];
    
    // Volume analysis
    const volumeScore = this.normalizeScore(collection.volume24h, 0, 10000);
    factors.push({
      factor: "Trading Volume",
      impact: volumeScore * 0.3,
      description: `24h volume: ${collection.volume24h} ETH ${volumeScore > 0.5 ? '(High)' : '(Low)'}`
    });
    
    // Liquidity analysis
    const liquidityRatio = collection.listedCount / collection.holders;
    const liquidityScore = 1 - Math.min(liquidityRatio / 0.2, 1); // Lower listing ratio is better
    factors.push({
      factor: "Market Liquidity",
      impact: liquidityScore * 0.2,
      description: `${(liquidityRatio * 100).toFixed(1)}% listed ${liquidityScore > 0.5 ? '(Strong hands)' : '(Weak hands)'}`
    });
    
    // Social sentiment
    const socialScore = this.analyzeSocialMetrics(collection.socialMetrics);
    factors.push({
      factor: "Social Sentiment",
      impact: socialScore * 0.25,
      description: `Community engagement ${socialScore > 0.5 ? 'growing' : 'declining'}`
    });
    
    // Market momentum
    const momentumScore = Math.random() * 2 - 1; // Mock momentum calculation
    factors.push({
      factor: "Market Momentum",
      impact: momentumScore * 0.25,
      description: `Technical indicators show ${momentumScore > 0 ? 'bullish' : 'bearish'} momentum`
    });
    
    return factors;
  }

  private analyzeSocialMetrics(metrics: NFTCollection['socialMetrics']): number {
    if (!metrics.twitterFollowers && !metrics.discordMembers) return 0;
    
    const twitterScore = this.normalizeScore(metrics.twitterFollowers || 0, 0, 100000);
    const discordScore = this.normalizeScore(metrics.discordMembers || 0, 0, 50000);
    const mentionsScore = this.normalizeScore(metrics.mentions24h || 0, 0, 1000);
    
    return (twitterScore + discordScore + mentionsScore) / 3;
  }

  private normalizeScore(value: number, min: number, max: number): number {
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
  }

  private calculateTrendPrediction(factors: MarketTrend['factors']): MarketTrend['prediction'] {
    const averageImpact = factors.reduce((sum, f) => sum + f.impact, 0) / factors.length;
    
    if (averageImpact > 0.2) return "bullish";
    if (averageImpact < -0.2) return "bearish";
    return "neutral";
  }

  private calculateConfidence(factors: MarketTrend['factors']): number {
    // Confidence based on factor consensus and strength
    const impacts = factors.map(f => f.impact);
    const avgImpact = impacts.reduce((sum, i) => sum + Math.abs(i), 0) / impacts.length;
    const consensus = 1 - (Math.max(...impacts) - Math.min(...impacts)) / 2;
    
    return Math.min(0.95, Math.max(0.1, (avgImpact + consensus) / 2));
  }

  private calculatePriceTarget(
    collection: NFTCollection, 
    prediction: MarketTrend['prediction'], 
    confidence: number
  ): MarketTrend['priceTarget'] {
    const currentPrice = collection.floorPrice;
    let multiplier = 1;
    
    switch (prediction) {
      case "bullish":
        multiplier = 1 + (0.1 + confidence * 0.3); // 10-40% increase
        break;
      case "bearish":
        multiplier = 1 - (0.05 + confidence * 0.2); // 5-25% decrease
        break;
      default:
        multiplier = 1 + (Math.random() * 0.1 - 0.05); // ±5%
    }
    
    const target = currentPrice * multiplier;
    
    return {
      low: target * 0.9,
      high: target * 1.1,
      target
    };
  }

  async generatePersonalizedRecommendations(
    userCollections: string[],
    marketData: NFTCollection[]
  ): Promise<PersonalizedRecommendation[]> {
    console.log("🧠 Generating personalized recommendations...");
    
    const recommendations: PersonalizedRecommendation[] = [];
    
    // Analyze user's collection style
    const userStyle = this.analyzeCollectionStyle(userCollections);
    
    for (const collection of marketData) {
      if (userCollections.includes(collection.name)) continue;
      
      const score = this.calculateRecommendationScore(collection, userStyle, userCollections);
      
      if (score > 0.5) {
        recommendations.push({
          collection: collection.name,
          score,
          reasoning: this.generateRecommendationReasoning(collection, userStyle),
          riskLevel: this.assessRiskLevel(collection),
          investmentThesis: this.generateInvestmentThesis(collection, userStyle),
          similarTo: this.findSimilarCollections(collection.name, userCollections)
        });
      }
    }
    
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Top 5 recommendations
  }

  private analyzeCollectionStyle(collections: string[]) {
    // Mock style analysis - in reality would use ML to categorize
    const styles = {
      pfp: 0,
      art: 0,
      gaming: 0,
      utility: 0,
      experimental: 0
    };
    
    collections.forEach(collection => {
      const lower = collection.toLowerCase();
      if (lower.includes('punk') || lower.includes('ape') || lower.includes('doodle')) {
        styles.pfp += 1;
      } else if (lower.includes('art') || lower.includes('canvas')) {
        styles.art += 1;
      } else if (lower.includes('game') || lower.includes('land')) {
        styles.gaming += 1;
      } else {
        styles.experimental += 1;
      }
    });
    
    return styles;
  }

  private calculateRecommendationScore(
    collection: NFTCollection,
    userStyle: Record<string, number>,
    userCollections: string[]
  ): number {
    // Multi-factor scoring algorithm
    const factors = [];
    
    // Style compatibility
    const styleScore = this.calculateStyleCompatibility(collection.name, userStyle);
    factors.push(styleScore * 0.3);
    
    // Market health
    const healthScore = this.calculateMarketHealth(collection);
    factors.push(healthScore * 0.25);
    
    // Growth potential
    const growthScore = Math.random(); // Mock - would use real growth metrics
    factors.push(growthScore * 0.25);
    
    // Diversification benefit
    const diversificationScore = this.calculateDiversificationBenefit(collection.name, userCollections);
    factors.push(diversificationScore * 0.2);
    
    return factors.reduce((sum, factor) => sum + factor, 0) / factors.length;
  }

  private calculateStyleCompatibility(collectionName: string, userStyle: Record<string, number>): number {
    // Simple keyword matching - in production would use embeddings
    const lower = collectionName.toLowerCase();
    let compatibility = 0;
    
    if ((lower.includes('punk') || lower.includes('ape')) && userStyle.pfp > 0) {
      compatibility += 0.8;
    }
    if (lower.includes('art') && userStyle.art > 0) {
      compatibility += 0.9;
    }
    if (lower.includes('game') && userStyle.gaming > 0) {
      compatibility += 0.7;
    }
    
    return Math.min(1, compatibility);
  }

  private calculateMarketHealth(collection: NFTCollection): number {
    const volumeScore = this.normalizeScore(collection.volume24h, 0, 1000);
    const holderScore = this.normalizeScore(collection.holders, 100, 10000);
    const liquidityScore = 1 - (collection.listedCount / collection.holders);
    
    return (volumeScore + holderScore + liquidityScore) / 3;
  }

  private calculateDiversificationBenefit(newCollection: string, existing: string[]): number {
    // Simple diversity calculation - more different = higher score
    const similarity = existing.reduce((sum, collection) => {
      return sum + this.calculateCollectionSimilarity(newCollection, collection);
    }, 0) / existing.length;
    
    return 1 - similarity;
  }

  private calculateCollectionSimilarity(collection1: string, collection2: string): number {
    // Mock similarity calculation
    const words1 = collection1.toLowerCase().split(/\s+/);
    const words2 = collection2.toLowerCase().split(/\s+/);
    
    const commonWords = words1.filter(word => words2.includes(word));
    return commonWords.length / Math.max(words1.length, words2.length);
  }

  private generateRecommendationReasoning(collection: NFTCollection, userStyle: Record<string, number>): string[] {
    const reasons = [];
    
    if (collection.volume24h > 100) {
      reasons.push("Strong trading volume indicates healthy market activity");
    }
    
    if (collection.holders > 1000) {
      reasons.push("Large holder base provides stability and liquidity");
    }
    
    const listingRatio = collection.listedCount / collection.holders;
    if (listingRatio < 0.1) {
      reasons.push("Low listing ratio suggests strong holder conviction");
    }
    
    if (userStyle.pfp > userStyle.art && collection.name.toLowerCase().includes('punk')) {
      reasons.push("Aligns with your preference for profile picture projects");
    }
    
    return reasons.slice(0, 3);
  }

  private assessRiskLevel(collection: NFTCollection): PersonalizedRecommendation['riskLevel'] {
    const volatilityScore = Math.random(); // Mock volatility calculation
    
    if (volatilityScore < 0.3) return "low";
    if (volatilityScore < 0.7) return "medium";
    return "high";
  }

  private generateInvestmentThesis(collection: NFTCollection, userStyle: Record<string, number>): string {
    const theses = [
      "Strong fundamentals with growing community support and consistent trading volume",
      "Emerging project with unique utility and strong development roadmap",
      "Established collection with proven track record and stable floor price",
      "High-growth potential project in trending category with institutional backing",
      "Undervalued asset with strong technical indicators and social momentum"
    ];
    
    return theses[Math.floor(Math.random() * theses.length)];
  }

  private findSimilarCollections(collection: string, userCollections: string[]): string[] {
    // Mock similarity matching
    return userCollections
      .filter(existing => this.calculateCollectionSimilarity(collection, existing) > 0.3)
      .slice(0, 2);
  }
}

// Market Sentiment Analysis
export class SentimentAnalyzer {
  async analyzeMarketSentiment(collections: string[]): Promise<{
    overall: "bullish" | "bearish" | "neutral";
    confidence: number;
    factors: Array<{
      source: string;
      sentiment: number; // -1 to 1
      weight: number;
    }>;
  }> {
    console.log("📊 Analyzing market sentiment...");
    
    // Mock sentiment analysis - in production would integrate with social APIs
    const factors = [
      {
        source: "Twitter Mentions",
        sentiment: Math.random() * 2 - 1,
        weight: 0.3
      },
      {
        source: "Discord Activity", 
        sentiment: Math.random() * 2 - 1,
        weight: 0.25
      },
      {
        source: "Trading Volume",
        sentiment: Math.random() * 2 - 1,
        weight: 0.2
      },
      {
        source: "News Articles",
        sentiment: Math.random() * 2 - 1,
        weight: 0.15
      },
      {
        source: "Influencer Posts",
        sentiment: Math.random() * 2 - 1,
        weight: 0.1
      }
    ];
    
    const weightedSentiment = factors.reduce((sum, factor) => {
      return sum + (factor.sentiment * factor.weight);
    }, 0);
    
    const overall = weightedSentiment > 0.1 ? "bullish" : 
                   weightedSentiment < -0.1 ? "bearish" : "neutral";
    
    const confidence = Math.abs(weightedSentiment);
    
    return { overall, confidence, factors };
  }
}