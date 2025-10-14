// Market Timing Analysis Service
// Analyzes market cycles, momentum indicators, and optimal buying/selling timing for NFT collections

import { openSeaAPI } from '../api/opensea-v2';
import { coinGeckoAPI } from '../api/coingecko';
import { CacheManager } from '../performance';

export interface MarketPhase {
  currentPhase: 'accumulation' | 'markup' | 'distribution' | 'markdown';
  confidence: number; // 0-100
  duration: number; // Days in current phase
  nextPhaseEstimate: number; // Days until next phase
}

export interface MomentumIndicators {
  price: 'bullish' | 'bearish' | 'neutral';
  volume: 'increasing' | 'decreasing' | 'stable';
  sentiment: 'positive' | 'negative' | 'neutral';
  rsi: number; // Relative Strength Index (0-100)
  momentum: number; // Price momentum (-100 to 100)
  volatility: number; // Price volatility (0-100)
}

export interface TechnicalAnalysis {
  support: number; // Support price level in ETH
  resistance: number; // Resistance price level in ETH
  trendDirection: 'up' | 'down' | 'sideways';
  trendStrength: number; // 0-100
  breakoutProbability: number; // 0-100
  liquidityScore: number; // 0-100
}

export interface CyclicalPatterns {
  dayOfWeekPattern: number[]; // Volume by day (Sunday=0)
  hourlyPattern: number[]; // Activity by hour (0-23)
  monthlyTrend: number; // -1 to 1 (bearish to bullish)
  seasonalityScore: number; // 0-100
  cyclicalStrength: number; // How predictable patterns are (0-100)
}

export interface MarketPredictions {
  nextWeekDirection: 'up' | 'down' | 'sideways';
  confidence: number; // 0-100
  priceTarget: {
    low: number;
    high: number;
    expected: number;
  };
  optimalBuyTiming: {
    immediate: boolean;
    waitForDip: boolean;
    dipTarget: number;
    reasoning: string;
  };
  optimalSellTiming: {
    holdRecommendation: boolean;
    sellTarget: number;
    timeframe: 'days' | 'weeks' | 'months';
    reasoning: string;
  };
}

export interface MarketTimingAnalysis {
  collectionSlug: string;
  contractAddress?: string;
  lastUpdated: number;
  marketPhase: MarketPhase;
  momentum: MomentumIndicators;
  technicals: TechnicalAnalysis;
  cycles: CyclicalPatterns;
  predictions: MarketPredictions;
  marketContext: {
    ethPrice: number;
    globalNFTMarketCap: number;
    globalNFTVolume24h: number;
    marketSentiment: 'fear' | 'greed' | 'neutral';
  };
}

class MarketTimingService {
  async analyzeCollection(
    collectionSlug: string,
    contractAddress?: string
  ): Promise<MarketTimingAnalysis> {
    const cacheKey = `market_timing_${collectionSlug}`;
    const cached = CacheManager.get<MarketTimingAnalysis>(cacheKey);
    
    if (cached && Date.now() - cached.lastUpdated < 15 * 60 * 1000) {
      console.log('📦 Using cached market timing analysis');
      return cached;
    }

    console.log(`🔮 Performing market timing analysis for ${collectionSlug}`);
    
    try {
      // Gather market data
      const [collectionStats, historicalData, globalContext] = await Promise.all([
        this.getCollectionStats(collectionSlug),
        this.getHistoricalPriceData(collectionSlug),
        this.getGlobalMarketContext(),
      ]);

      if (!collectionStats) {
        throw new Error('Failed to get collection statistics');
      }

      // Analyze market phase
      const marketPhase = this.determineMarketPhase(historicalData, collectionStats);
      
      // Calculate momentum indicators
      const momentum = this.calculateMomentumIndicators(historicalData, collectionStats);
      
      // Technical analysis
      const technicals = this.performTechnicalAnalysis(historicalData, collectionStats);
      
      // Cyclical pattern analysis
      const cycles = this.analyzeCyclicalPatterns(historicalData);
      
      // Generate predictions
      const predictions = this.generateMarketPredictions(
        marketPhase,
        momentum,
        technicals,
        cycles,
        globalContext
      );

      const analysis: MarketTimingAnalysis = {
        collectionSlug,
        contractAddress,
        lastUpdated: Date.now(),
        marketPhase,
        momentum,
        technicals,
        cycles,
        predictions,
        marketContext: globalContext,
      };

      // Cache for 15 minutes
      CacheManager.set(cacheKey, analysis, 15 * 60 * 1000);
      return analysis;

    } catch (error) {
      console.error('Market timing analysis failed:', error);
      return this.createEmptyAnalysis(collectionSlug, contractAddress);
    }
  }

  async analyzeBulkCollections(collectionSlugs: string[]): Promise<MarketTimingAnalysis[]> {
    console.log(`🔮 Performing bulk market timing analysis for ${collectionSlugs.length} collections`);
    
    // Process in parallel but with rate limiting
    const results: MarketTimingAnalysis[] = [];
    const batchSize = 5;
    
    for (let i = 0; i < collectionSlugs.length; i += batchSize) {
      const batch = collectionSlugs.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(
        batch.map(slug => this.analyzeCollection(slug))
      );
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.error(`Failed to analyze ${batch[index]}:`, result.reason);
          results.push(this.createEmptyAnalysis(batch[index]));
        }
      });
      
      // Small delay to respect rate limits
      if (i + batchSize < collectionSlugs.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  async detectOptimalEntryPoints(
    collections: Array<{ slug: string; contractAddress?: string }>
  ): Promise<Array<{
    collection: string;
    opportunity: 'buy' | 'wait' | 'avoid';
    score: number; // 0-100
    reasoning: string;
    timeframe: string;
    riskLevel: 'low' | 'medium' | 'high';
  }>> {
    console.log(`🔮 Detecting optimal entry points for ${collections.length} collections`);
    
    const analyses = await Promise.all(
      collections.map(c => this.analyzeCollection(c.slug, c.contractAddress))
    );

    return analyses.map(analysis => {
      const { marketPhase, momentum, technicals, predictions } = analysis;
      
      // Calculate opportunity score
      let score = 50; // Base score
      
      // Phase-based scoring
      if (marketPhase.currentPhase === 'accumulation') score += 30;
      else if (marketPhase.currentPhase === 'markdown') score += 20;
      else if (marketPhase.currentPhase === 'distribution') score -= 20;
      else if (marketPhase.currentPhase === 'markup') score -= 10;
      
      // Momentum-based scoring
      if (momentum.price === 'bullish' && momentum.volume === 'increasing') score += 20;
      else if (momentum.price === 'bearish' && momentum.volume === 'decreasing') score -= 20;
      
      // Technical analysis scoring
      if (technicals.trendDirection === 'up' && technicals.trendStrength > 70) score += 15;
      else if (technicals.trendDirection === 'down' && technicals.trendStrength > 70) score -= 15;
      
      // RSI scoring
      if (momentum.rsi < 30) score += 25; // Oversold
      else if (momentum.rsi > 70) score -= 25; // Overbought
      
      score = Math.max(0, Math.min(100, score));
      
      // Determine opportunity type
      let opportunity: 'buy' | 'wait' | 'avoid';
      if (score >= 70) opportunity = 'buy';
      else if (score >= 40) opportunity = 'wait';
      else opportunity = 'avoid';
      
      // Generate reasoning
      const reasoning = this.generateOpportunityReasoning(analysis, score, opportunity);
      
      // Determine risk level
      const riskLevel = this.calculateRiskLevel(analysis);
      
      return {
        collection: analysis.collectionSlug,
        opportunity,
        score: Math.round(score),
        reasoning,
        timeframe: predictions.optimalBuyTiming.immediate ? 'immediate' : 'next 1-2 weeks',
        riskLevel,
      };
    });
  }

  private async getCollectionStats(collectionSlug: string) {
    try {
      const collection = await openSeaAPI.getCollection(collectionSlug);
      return {
        floorPrice: collection.stats?.floor_price || 0,
        totalVolume: collection.stats?.total_volume || 0,
        oneDayVolume: collection.stats?.one_day_volume || 0,
        sevenDayVolume: collection.stats?.seven_day_volume || 0,
        thirtyDayVolume: collection.stats?.thirty_day_volume || 0,
        oneDayChange: collection.stats?.one_day_change || 0,
        sevenDayChange: collection.stats?.seven_day_change || 0,
        thirtyDayChange: collection.stats?.thirty_day_change || 0,
        marketCap: collection.stats?.market_cap || 0,
        totalSales: collection.stats?.total_sales || 0,
        averagePrice: collection.stats?.average_price || 0,
      };
    } catch (error) {
      console.error(`Failed to get collection stats for ${collectionSlug}:`, error);
      return null;
    }
  }

  private async getHistoricalPriceData(collectionSlug: string) {
    try {
      // In production, would use a more comprehensive data source
      // For now, simulate historical data based on current stats
      const collection = await openSeaAPI.getCollection(collectionSlug);
      const currentPrice = collection.stats?.floor_price || 0;
      
      // Generate mock historical data for the last 30 days
      const historicalData = [];
      for (let i = 30; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const noise = (Math.random() - 0.5) * 0.2; // ±10% random variation
        const trend = i / 30 * 0.1; // Slight upward trend
        const price = currentPrice * (1 + noise + trend);
        const volume = Math.random() * 100; // Random volume
        
        historicalData.push({
          date: date.toISOString().split('T')[0],
          floorPrice: Math.max(0.001, price),
          volume,
          sales: Math.floor(Math.random() * 50),
        });
      }
      
      return historicalData;
    } catch (error) {
      console.error(`Failed to get historical data for ${collectionSlug}:`, error);
      return [];
    }
  }

  private async getGlobalMarketContext() {
    try {
      const [ethPrice, globalData] = await Promise.all([
        coinGeckoAPI.getSimplePrice(['ethereum']),
        coinGeckoAPI.getGlobalData(),
      ]);
      
      return {
        ethPrice: ethPrice?.ethereum?.usd || 2500,
        globalNFTMarketCap: 1000000000, // Would get from NFT-specific data source
        globalNFTVolume24h: 50000000, // Would get from NFT-specific data source
        marketSentiment: 'neutral' as const, // Would calculate from various indicators
      };
    } catch (error) {
      console.error('Failed to get global market context:', error);
      return {
        ethPrice: 2500,
        globalNFTMarketCap: 1000000000,
        globalNFTVolume24h: 50000000,
        marketSentiment: 'neutral' as const,
      };
    }
  }

  private determineMarketPhase(historicalData: any[], stats: any): MarketPhase {
    if (!historicalData.length || !stats) {
      return {
        currentPhase: 'accumulation',
        confidence: 50,
        duration: 0,
        nextPhaseEstimate: 30,
      };
    }

    // Analyze price and volume trends
    const recentData = historicalData.slice(-14); // Last 2 weeks
    const prices = recentData.map(d => d.floorPrice);
    const volumes = recentData.map(d => d.volume);
    
    const priceChange = ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100;
    const volumeAvg = volumes.reduce((sum, v) => sum + v, 0) / volumes.length;
    const recentVolumeAvg = volumes.slice(-7).reduce((sum, v) => sum + v, 0) / 7;
    const volumeChange = ((recentVolumeAvg - volumeAvg) / volumeAvg) * 100;

    let phase: MarketPhase['currentPhase'];
    let confidence = 75;

    // Phase determination logic
    if (priceChange < -15 && volumeChange > 20) {
      phase = 'markdown';
    } else if (priceChange < -5 && volumeChange < -10) {
      phase = 'accumulation';
    } else if (priceChange > 15 && volumeChange > 30) {
      phase = 'markup';
    } else if (priceChange > 5 && volumeChange < -15) {
      phase = 'distribution';
    } else {
      phase = 'accumulation';
      confidence = 50;
    }

    return {
      currentPhase: phase,
      confidence,
      duration: Math.floor(Math.random() * 20) + 5, // Would calculate actual duration
      nextPhaseEstimate: Math.floor(Math.random() * 40) + 10,
    };
  }

  private calculateMomentumIndicators(historicalData: any[], stats: any): MomentumIndicators {
    if (!historicalData.length || !stats) {
      return {
        price: 'neutral',
        volume: 'stable',
        sentiment: 'neutral',
        rsi: 50,
        momentum: 0,
        volatility: 50,
      };
    }

    const prices = historicalData.map(d => d.floorPrice);
    const volumes = historicalData.map(d => d.volume);
    
    // Calculate RSI
    const rsi = this.calculateRSI(prices);
    
    // Calculate momentum
    const recentPrices = prices.slice(-7);
    const olderPrices = prices.slice(-14, -7);
    const recentAvg = recentPrices.reduce((sum, p) => sum + p, 0) / recentPrices.length;
    const olderAvg = olderPrices.reduce((sum, p) => sum + p, 0) / olderPrices.length;
    const momentum = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    // Calculate volatility
    const priceAvg = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const variance = prices.reduce((sum, p) => sum + Math.pow(p - priceAvg, 2), 0) / prices.length;
    const volatility = Math.sqrt(variance) / priceAvg * 100;

    return {
      price: momentum > 5 ? 'bullish' : momentum < -5 ? 'bearish' : 'neutral',
      volume: stats.sevenDayChange > 10 ? 'increasing' : stats.sevenDayChange < -10 ? 'decreasing' : 'stable',
      sentiment: rsi > 60 ? 'positive' : rsi < 40 ? 'negative' : 'neutral',
      rsi: Math.round(rsi),
      momentum: Math.max(-100, Math.min(100, Math.round(momentum))),
      volatility: Math.max(0, Math.min(100, Math.round(volatility))),
    };
  }

  private performTechnicalAnalysis(historicalData: any[], stats: any): TechnicalAnalysis {
    if (!historicalData.length || !stats) {
      return {
        support: 0,
        resistance: 0,
        trendDirection: 'sideways',
        trendStrength: 0,
        breakoutProbability: 50,
        liquidityScore: 0,
      };
    }

    const prices = historicalData.map(d => d.floorPrice);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const currentPrice = prices[prices.length - 1];
    
    // Calculate support and resistance levels
    const support = minPrice * 1.05; // 5% above recent low
    const resistance = maxPrice * 0.95; // 5% below recent high
    
    // Trend analysis
    const firstHalf = prices.slice(0, Math.floor(prices.length / 2));
    const secondHalf = prices.slice(Math.floor(prices.length / 2));
    const firstAvg = firstHalf.reduce((sum, p) => sum + p, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, p) => sum + p, 0) / secondHalf.length;
    
    const trendChange = ((secondAvg - firstAvg) / firstAvg) * 100;
    const trendDirection: TechnicalAnalysis['trendDirection'] = 
      trendChange > 5 ? 'up' : trendChange < -5 ? 'down' : 'sideways';
    const trendStrength = Math.min(100, Math.abs(trendChange) * 5);
    
    // Breakout probability
    const pricePosition = (currentPrice - support) / (resistance - support);
    const breakoutProbability = Math.abs(pricePosition - 0.5) > 0.4 ? 75 : 25;
    
    // Liquidity score based on volume and market cap
    const liquidityScore = Math.min(100, (stats.totalVolume / 1000) + (stats.oneDayVolume * 10));

    return {
      support: Math.round(support * 1000) / 1000,
      resistance: Math.round(resistance * 1000) / 1000,
      trendDirection,
      trendStrength: Math.round(trendStrength),
      breakoutProbability: Math.round(breakoutProbability),
      liquidityScore: Math.round(liquidityScore),
    };
  }

  private analyzeCyclicalPatterns(historicalData: any[]): CyclicalPatterns {
    if (!historicalData.length) {
      return {
        dayOfWeekPattern: Array(7).fill(0),
        hourlyPattern: Array(24).fill(0),
        monthlyTrend: 0,
        seasonalityScore: 0,
        cyclicalStrength: 0,
      };
    }

    // For now, generate representative patterns
    // In production, would analyze actual timestamp data
    const dayOfWeekPattern = [
      0.8, 0.6, 0.9, 1.1, 1.3, 1.5, 1.2  // Sun-Sat, weekend spike
    ];
    
    const hourlyPattern = Array(24).fill(0).map((_, hour) => {
      // Simulate activity patterns (lower at night, peak in afternoon)
      if (hour >= 0 && hour <= 6) return 0.3;
      if (hour >= 7 && hour <= 11) return 0.8;
      if (hour >= 12 && hour <= 18) return 1.3;
      if (hour >= 19 && hour <= 23) return 1.0;
      return 0.5;
    });

    return {
      dayOfWeekPattern,
      hourlyPattern,
      monthlyTrend: (Math.random() - 0.5) * 2, // -1 to 1
      seasonalityScore: Math.floor(Math.random() * 40) + 30, // 30-70
      cyclicalStrength: Math.floor(Math.random() * 30) + 40, // 40-70
    };
  }

  private generateMarketPredictions(
    phase: MarketPhase,
    momentum: MomentumIndicators,
    technicals: TechnicalAnalysis,
    cycles: CyclicalPatterns,
    context: any
  ): MarketPredictions {
    
    // Predict next week direction
    let nextWeekDirection: MarketPredictions['nextWeekDirection'];
    let confidence = 50;
    
    if (momentum.price === 'bullish' && phase.currentPhase === 'accumulation') {
      nextWeekDirection = 'up';
      confidence = 75;
    } else if (momentum.price === 'bearish' && phase.currentPhase === 'distribution') {
      nextWeekDirection = 'down';
      confidence = 75;
    } else {
      nextWeekDirection = 'sideways';
      confidence = 60;
    }

    // Generate price targets (simplified)
    const currentEstimate = technicals.support + (technicals.resistance - technicals.support) * 0.5;
    const priceTarget = {
      low: Math.round((currentEstimate * 0.9) * 1000) / 1000,
      high: Math.round((currentEstimate * 1.1) * 1000) / 1000,
      expected: Math.round(currentEstimate * 1000) / 1000,
    };

    // Optimal buy timing
    const optimalBuyTiming = {
      immediate: momentum.rsi < 40 && phase.currentPhase === 'accumulation',
      waitForDip: momentum.rsi > 60 || phase.currentPhase === 'markup',
      dipTarget: technicals.support,
      reasoning: this.getBuyTimingReasoning(phase, momentum, technicals),
    };

    // Optimal sell timing
    const optimalSellTiming = {
      holdRecommendation: phase.currentPhase === 'accumulation' || phase.currentPhase === 'markup',
      sellTarget: technicals.resistance,
      timeframe: phase.currentPhase === 'distribution' ? 'days' : 'weeks' as const,
      reasoning: this.getSellTimingReasoning(phase, momentum, technicals),
    };

    return {
      nextWeekDirection,
      confidence,
      priceTarget,
      optimalBuyTiming,
      optimalSellTiming,
    };
  }

  private calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50;

    let gains = 0;
    let losses = 0;

    for (let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }

    if (losses === 0) return 100;
    if (gains === 0) return 0;

    const avgGain = gains / period;
    const avgLoss = losses / period;
    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));

    return Math.max(0, Math.min(100, rsi));
  }

  private getBuyTimingReasoning(phase: MarketPhase, momentum: MomentumIndicators, technicals: TechnicalAnalysis): string {
    if (momentum.rsi < 30) {
      return "Oversold conditions present excellent buying opportunity";
    }
    if (phase.currentPhase === 'accumulation') {
      return "Accumulation phase suggests institutional buying, good entry point";
    }
    if (technicals.trendDirection === 'up' && technicals.trendStrength > 70) {
      return "Strong upward trend with momentum, consider buying on dips";
    }
    if (momentum.rsi > 70) {
      return "Overbought conditions, wait for pullback before buying";
    }
    return "Mixed signals, dollar-cost averaging recommended";
  }

  private getSellTimingReasoning(phase: MarketPhase, momentum: MomentumIndicators, technicals: TechnicalAnalysis): string {
    if (phase.currentPhase === 'distribution') {
      return "Distribution phase indicates smart money selling, consider taking profits";
    }
    if (momentum.rsi > 70) {
      return "Overbought conditions, good time to take profits";
    }
    if (phase.currentPhase === 'markup') {
      return "Markup phase continues, hold for further gains but watch for reversal signals";
    }
    return "Hold position, market conditions favor continued growth";
  }

  private generateOpportunityReasoning(analysis: MarketTimingAnalysis, score: number, opportunity: string): string {
    const { marketPhase, momentum, technicals } = analysis;
    
    if (opportunity === 'buy') {
      return `Strong buy signal (${score}/100): ${marketPhase.currentPhase} phase with ${momentum.price} momentum and RSI at ${momentum.rsi}`;
    } else if (opportunity === 'wait') {
      return `Wait for better entry (${score}/100): ${marketPhase.currentPhase} phase, mixed signals suggest patience`;
    } else {
      return `Avoid for now (${score}/100): ${marketPhase.currentPhase} phase with unfavorable momentum and technical indicators`;
    }
  }

  private calculateRiskLevel(analysis: MarketTimingAnalysis): 'low' | 'medium' | 'high' {
    const { momentum, technicals, marketPhase } = analysis;
    
    let riskScore = 0;
    
    // Volatility risk
    if (momentum.volatility > 75) riskScore += 2;
    else if (momentum.volatility > 50) riskScore += 1;
    
    // Liquidity risk
    if (technicals.liquidityScore < 30) riskScore += 2;
    else if (technicals.liquidityScore < 60) riskScore += 1;
    
    // Phase risk
    if (marketPhase.currentPhase === 'distribution') riskScore += 2;
    else if (marketPhase.currentPhase === 'markdown') riskScore += 1;
    
    if (riskScore >= 4) return 'high';
    if (riskScore >= 2) return 'medium';
    return 'low';
  }

  private createEmptyAnalysis(collectionSlug: string, contractAddress?: string): MarketTimingAnalysis {
    return {
      collectionSlug,
      contractAddress,
      lastUpdated: Date.now(),
      marketPhase: {
        currentPhase: 'accumulation',
        confidence: 50,
        duration: 0,
        nextPhaseEstimate: 30,
      },
      momentum: {
        price: 'neutral',
        volume: 'stable',
        sentiment: 'neutral',
        rsi: 50,
        momentum: 0,
        volatility: 50,
      },
      technicals: {
        support: 0,
        resistance: 0,
        trendDirection: 'sideways',
        trendStrength: 0,
        breakoutProbability: 50,
        liquidityScore: 0,
      },
      cycles: {
        dayOfWeekPattern: Array(7).fill(0),
        hourlyPattern: Array(24).fill(0),
        monthlyTrend: 0,
        seasonalityScore: 0,
        cyclicalStrength: 0,
      },
      predictions: {
        nextWeekDirection: 'sideways',
        confidence: 50,
        priceTarget: { low: 0, high: 0, expected: 0 },
        optimalBuyTiming: {
          immediate: false,
          waitForDip: true,
          dipTarget: 0,
          reasoning: 'Insufficient data for analysis',
        },
        optimalSellTiming: {
          holdRecommendation: true,
          sellTarget: 0,
          timeframe: 'weeks',
          reasoning: 'Insufficient data for analysis',
        },
      },
      marketContext: {
        ethPrice: 2500,
        globalNFTMarketCap: 1000000000,
        globalNFTVolume24h: 50000000,
        marketSentiment: 'neutral',
      },
    };
  }
}

// Export singleton instance
export const marketTimingService = new MarketTimingService();