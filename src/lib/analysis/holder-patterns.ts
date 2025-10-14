// Holder Pattern Analysis Service
// Analyzes NFT collection holder behavior, distribution, and community dynamics

import { alchemyAPI } from '../api/alchemy';
import { openSeaAPI } from '../api/opensea-v2';
import { CacheManager } from '../performance';

export interface HolderAnalysis {
  totalHolders: number;
  whaleHolders: number; // >1% supply
  dolphinHolders: number; // 0.1-1%
  fishHolders: number; // <0.1%
  diamondHands: number; // Hold >6 months
  paperHands: number; // Sell <1 month
  averageHoldingPeriod: number; // Days
  holderLoyalty: number; // 0-100 score
  concentrationRatio: number; // Top 10 holders percentage
  distributionGini: number; // Wealth distribution index (0=equal, 1=concentrated)
}

export interface TopHolder {
  address: string;
  tokenCount: number;
  percentage: number;
  averageHoldingPeriod: number;
  acquisitionPattern: 'accumulator' | 'flipper' | 'holder' | 'whale';
  ensName?: string;
  isKnownEntity?: boolean;
  entityType?: 'individual' | 'institution' | 'marketplace' | 'dao';
}

export interface HolderCommunityInsights {
  // Community Health
  communityStrength: number; // 0-100
  holderEngagement: number; // 0-100 
  loyaltyTrend: 'increasing' | 'decreasing' | 'stable';
  
  // Distribution Analysis
  wealthConcentration: 'highly_concentrated' | 'moderately_concentrated' | 'distributed' | 'highly_distributed';
  newHolderInflux: number; // New holders in last 30 days
  holderTurnover: number; // Percentage of holders who sold in last 30 days
  
  // Behavioral Patterns
  collectingPatterns: {
    sweepers: number; // Holders who buy multiple at once
    accumulators: number; // Steadily increasing holdings
    flippers: number; // Quick buy/sell
    hodlers: number; // Long-term holders
  };
  
  // Market Impact
  supplyDistribution: {
    availableSupply: number; // Not held by diamond hands
    lockedSupply: number; // Held by diamond hands
    liquidSupply: number; // Held by known flippers
  };
  
  // Social Signals
  influencerHolders: Array<{
    address: string;
    influence: number; // 0-100
    followerCount?: number;
    platform?: string;
  }>;
}

export interface CrossCollectionHolderOverlap {
  collectionA: string;
  collectionB: string;
  sharedHolders: number;
  overlapPercentage: number;
  correlationStrength: number; // 0-100
  sharedWhales: number;
  communityAlignment: 'high' | 'medium' | 'low';
  culturalSimilarity: number; // 0-100
}

class HolderPatternsService {
  async analyzeCollectionHolders(
    contractAddress: string,
    collectionSlug?: string
  ): Promise<{
    analysis: HolderAnalysis;
    topHolders: TopHolder[];
    insights: HolderCommunityInsights;
  }> {
    const cacheKey = `holder_analysis_${contractAddress}`;
    const cached = CacheManager.get<any>(cacheKey);
    
    if (cached) {
      console.log('📦 Using cached holder analysis');
      return cached;
    }

    console.log(`🔮 Analyzing holder patterns for ${contractAddress}`);
    
    try {
      // Get collection info and holder data
      const [collectionInfo, holderData, recentActivity] = await Promise.all([
        this.getCollectionInfo(contractAddress, collectionSlug),
        this.getHolderDistribution(contractAddress),
        this.getRecentHolderActivity(contractAddress),
      ]);

      if (!holderData) {
        return this.createEmptyAnalysis();
      }

      // Analyze holder patterns
      const analysis = this.calculateHolderAnalysis(holderData, collectionInfo);
      const topHolders = await this.analyzeTopHolders(holderData.topHolders, contractAddress);
      const insights = this.generateCommunityInsights(analysis, topHolders, recentActivity);

      const result = {
        analysis,
        topHolders,
        insights,
      };

      // Cache for 1 hour
      CacheManager.set(cacheKey, result, 60 * 60 * 1000);
      return result;

    } catch (error) {
      console.error('Holder analysis failed:', error);
      return this.createEmptyAnalysis();
    }
  }

  async findCrossCollectionOverlap(
    collections: Array<{ contractAddress: string; slug?: string }>
  ): Promise<CrossCollectionHolderOverlap[]> {
    if (collections.length < 2) return [];

    const cacheKey = `cross_collection_${collections.map(c => c.contractAddress).sort().join('_')}`;
    const cached = CacheManager.get<CrossCollectionHolderOverlap[]>(cacheKey);
    
    if (cached) {
      console.log('📦 Using cached cross-collection analysis');
      return cached;
    }

    console.log(`🔮 Analyzing cross-collection holder overlap for ${collections.length} collections`);
    
    try {
      const holderMaps = await Promise.all(
        collections.map(async (collection) => ({
          ...collection,
          holders: await this.getCollectionHolders(collection.contractAddress),
        }))
      );

      const overlaps: CrossCollectionHolderOverlap[] = [];

      // Compare each pair of collections
      for (let i = 0; i < holderMaps.length - 1; i++) {
        for (let j = i + 1; j < holderMaps.length; j++) {
          const collectionA = holderMaps[i];
          const collectionB = holderMaps[j];
          
          if (collectionA.holders && collectionB.holders) {
            const overlap = this.calculateHolderOverlap(
              collectionA,
              collectionB
            );
            if (overlap) {
              overlaps.push(overlap);
            }
          }
        }
      }

      // Cache for 2 hours
      CacheManager.set(cacheKey, overlaps, 2 * 60 * 60 * 1000);
      return overlaps;

    } catch (error) {
      console.error('Cross-collection analysis failed:', error);
      return [];
    }
  }

  async detectWhaleMovements(contractAddress: string): Promise<Array<{
    address: string;
    action: 'accumulating' | 'distributing' | 'entering' | 'exiting';
    tokensChanged: number;
    timeframe: string;
    impact: 'high' | 'medium' | 'low';
    confidence: number;
  }>> {
    const cacheKey = `whale_movements_${contractAddress}`;
    const cached = CacheManager.get<any[]>(cacheKey);
    
    if (cached) {
      console.log('📦 Using cached whale movement analysis');
      return cached;
    }

    console.log(`🔮 Detecting whale movements for ${contractAddress}`);
    
    try {
      // Get recent large transfers
      const recentTransfers = await alchemyAPI.getNFTTransfers({
        contractAddress,
        category: ['erc721', 'erc1155'],
        order: 'desc',
      });

      if (!recentTransfers?.transfers?.length) {
        return [];
      }

      // Group by address and analyze patterns
      const movements = this.analyzeWhaleMovements(recentTransfers.transfers);
      
      // Cache for 15 minutes
      CacheManager.set(cacheKey, movements, 15 * 60 * 1000);
      return movements;

    } catch (error) {
      console.error('Whale movement detection failed:', error);
      return [];
    }
  }

  private async getCollectionInfo(contractAddress: string, slug?: string) {
    if (slug) {
      try {
        const collection = await openSeaAPI.getCollection(slug);
        return {
          totalSupply: collection.stats?.total_supply || 0,
          name: collection.name,
          slug: collection.collection,
        };
      } catch (error) {
        console.error('Failed to get OpenSea collection info:', error);
      }
    }

    // Fallback to Alchemy
    try {
      const metadata = await alchemyAPI.getContractMetadata(contractAddress);
      return {
        totalSupply: metadata.totalSupply || 0,
        name: metadata.name || 'Unknown Collection',
        slug: metadata.symbol || contractAddress.slice(0, 8),
      };
    } catch (error) {
      console.error('Failed to get collection info:', error);
      return {
        totalSupply: 0,
        name: 'Unknown Collection',
        slug: contractAddress.slice(0, 8),
      };
    }
  }

  private async getHolderDistribution(contractAddress: string) {
    try {
      // Get all owners for the collection
      const owners = await alchemyAPI.getOwnersForContract(contractAddress);
      
      if (!owners?.owners?.length) {
        return null;
      }

      // Count tokens per holder
      const holderCounts = new Map<string, number>();
      owners.owners.forEach((owner: any) => {
        holderCounts.set(owner.ownerAddress, owner.tokenBalances.length);
      });

      const totalHolders = holderCounts.size;
      const sortedHolders = Array.from(holderCounts.entries())
        .sort(([, a], [, b]) => b - a);

      return {
        totalHolders,
        holderCounts,
        topHolders: sortedHolders.slice(0, 50), // Top 50 holders
        allHolders: sortedHolders,
      };

    } catch (error) {
      console.error('Failed to get holder distribution:', error);
      return null;
    }
  }

  private async getRecentHolderActivity(contractAddress: string) {
    try {
      // Get recent transfers to analyze holder activity
      const transfers = await alchemyAPI.getNFTTransfers({
        contractAddress,
        category: ['erc721', 'erc1155'],
        order: 'desc',
        maxCount: 1000,
      });

      if (!transfers?.transfers?.length) {
        return { newHolders: 0, exitingHolders: 0, totalActivity: 0 };
      }

      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const recentTransfers = transfers.transfers.filter((transfer: any) => {
        const transferTime = new Date(transfer.metadata.blockTimestamp).getTime();
        return transferTime > thirtyDaysAgo;
      });

      const newHolders = new Set<string>();
      const exitingHolders = new Set<string>();

      recentTransfers.forEach((transfer: any) => {
        // New holder (receiving from zero address or marketplace)
        if (transfer.from === '0x0000000000000000000000000000000000000000' || 
            this.isMarketplaceAddress(transfer.from)) {
          newHolders.add(transfer.to);
        }
        
        // Exiting holder (sending to zero address or marketplace)
        if (transfer.to === '0x0000000000000000000000000000000000000000' ||
            this.isMarketplaceAddress(transfer.to)) {
          exitingHolders.add(transfer.from);
        }
      });

      return {
        newHolders: newHolders.size,
        exitingHolders: exitingHolders.size,
        totalActivity: recentTransfers.length,
      };

    } catch (error) {
      console.error('Failed to get recent holder activity:', error);
      return { newHolders: 0, exitingHolders: 0, totalActivity: 0 };
    }
  }

  private calculateHolderAnalysis(holderData: any, collectionInfo: any): HolderAnalysis {
    const { totalHolders, allHolders } = holderData;
    const totalSupply = collectionInfo.totalSupply || 10000; // Fallback

    // Calculate distribution tiers
    let whaleHolders = 0;
    let dolphinHolders = 0;
    let fishHolders = 0;

    allHolders.forEach(([address, count]: [string, number]) => {
      const percentage = (count / totalSupply) * 100;
      if (percentage > 1) whaleHolders++;
      else if (percentage > 0.1) dolphinHolders++;
      else fishHolders++;
    });

    // Calculate concentration ratio (top 10 holders)
    const top10Holdings = allHolders.slice(0, 10).reduce((sum, [, count]) => sum + count, 0);
    const concentrationRatio = (top10Holdings / totalSupply) * 100;

    // Calculate Gini coefficient for wealth distribution
    const distributionGini = this.calculateGini(allHolders.map(([, count]) => count));

    // Estimate behavioral patterns (simplified - would need transaction history for accuracy)
    const diamondHands = Math.round(totalHolders * 0.3); // Assume 30% are long-term holders
    const paperHands = Math.round(totalHolders * 0.2); // Assume 20% are short-term

    // Calculate loyalty score based on distribution and concentration
    const holderLoyalty = Math.round(
      (100 - concentrationRatio) * 0.4 + // Less concentration = more loyalty
      (100 - distributionGini * 100) * 0.3 + // Better distribution = more loyalty
      Math.min(100, totalHolders / 100) * 0.3 // More holders = more community
    );

    return {
      totalHolders,
      whaleHolders,
      dolphinHolders,
      fishHolders,
      diamondHands,
      paperHands,
      averageHoldingPeriod: 120, // Would calculate from transaction history
      holderLoyalty: Math.max(0, Math.min(100, holderLoyalty)),
      concentrationRatio: Math.round(concentrationRatio * 100) / 100,
      distributionGini: Math.round(distributionGini * 1000) / 1000,
    };
  }

  private async analyzeTopHolders(topHolders: Array<[string, number]>, contractAddress: string): Promise<TopHolder[]> {
    const result: TopHolder[] = [];
    const totalSupply = 10000; // Would get from collection info

    for (const [address, tokenCount] of topHolders.slice(0, 20)) {
      const percentage = (tokenCount / totalSupply) * 100;
      
      // Determine acquisition pattern (simplified)
      let acquisitionPattern: TopHolder['acquisitionPattern'] = 'holder';
      if (percentage > 5) acquisitionPattern = 'whale';
      else if (tokenCount > 20) acquisitionPattern = 'accumulator';
      // Would analyze transaction history to determine flipper pattern

      const holder: TopHolder = {
        address,
        tokenCount,
        percentage: Math.round(percentage * 100) / 100,
        averageHoldingPeriod: 90, // Would calculate from transaction history
        acquisitionPattern,
        ensName: await this.getENSName(address),
        isKnownEntity: this.isKnownAddress(address),
        entityType: this.determineEntityType(address),
      };

      result.push(holder);
    }

    return result;
  }

  private generateCommunityInsights(
    analysis: HolderAnalysis,
    topHolders: TopHolder[],
    recentActivity: any
  ): HolderCommunityInsights {
    
    // Calculate community strength
    const communityStrength = Math.round(
      (analysis.holderLoyalty * 0.4) +
      (Math.min(100, analysis.totalHolders / 50) * 0.3) +
      ((100 - analysis.concentrationRatio) * 0.3)
    );

    // Calculate holder engagement based on recent activity
    const holderEngagement = Math.round(
      Math.min(100, (recentActivity.totalActivity / analysis.totalHolders) * 10)
    );

    // Determine wealth concentration level
    let wealthConcentration: HolderCommunityInsights['wealthConcentration'];
    if (analysis.concentrationRatio > 50) wealthConcentration = 'highly_concentrated';
    else if (analysis.concentrationRatio > 25) wealthConcentration = 'moderately_concentrated';
    else if (analysis.concentrationRatio > 10) wealthConcentration = 'distributed';
    else wealthConcentration = 'highly_distributed';

    // Calculate supply distribution
    const lockedSupply = Math.round((analysis.diamondHands / analysis.totalHolders) * 100);
    const liquidSupply = Math.round((analysis.paperHands / analysis.totalHolders) * 100);
    const availableSupply = 100 - lockedSupply;

    // Analyze collecting patterns from top holders
    const whales = topHolders.filter(h => h.acquisitionPattern === 'whale').length;
    const accumulators = topHolders.filter(h => h.acquisitionPattern === 'accumulator').length;
    const flippers = topHolders.filter(h => h.acquisitionPattern === 'flipper').length;
    const hodlers = topHolders.filter(h => h.acquisitionPattern === 'holder').length;

    return {
      communityStrength: Math.max(0, Math.min(100, communityStrength)),
      holderEngagement: Math.max(0, Math.min(100, holderEngagement)),
      loyaltyTrend: 'stable', // Would analyze historical data
      wealthConcentration,
      newHolderInflux: recentActivity.newHolders,
      holderTurnover: Math.round((recentActivity.exitingHolders / analysis.totalHolders) * 100),
      collectingPatterns: {
        sweepers: whales,
        accumulators,
        flippers,
        hodlers,
      },
      supplyDistribution: {
        availableSupply,
        lockedSupply,
        liquidSupply,
      },
      influencerHolders: [], // Would integrate with social media APIs
    };
  }

  private async getCollectionHolders(contractAddress: string) {
    try {
      const owners = await alchemyAPI.getOwnersForContract(contractAddress);
      return owners?.owners?.map((owner: any) => owner.ownerAddress) || [];
    } catch (error) {
      console.error(`Failed to get holders for ${contractAddress}:`, error);
      return [];
    }
  }

  private calculateHolderOverlap(collectionA: any, collectionB: any): CrossCollectionHolderOverlap | null {
    if (!collectionA.holders?.length || !collectionB.holders?.length) {
      return null;
    }

    const holdersA = new Set(collectionA.holders);
    const holdersB = new Set(collectionB.holders);
    
    const sharedHolders = new Set([...holdersA].filter(h => holdersB.has(h)));
    const sharedCount = sharedHolders.size;
    
    if (sharedCount === 0) return null;

    const overlapPercentage = (sharedCount / Math.min(holdersA.size, holdersB.size)) * 100;
    const correlationStrength = Math.min(100, overlapPercentage * 2);
    
    // Determine community alignment
    let communityAlignment: 'high' | 'medium' | 'low';
    if (overlapPercentage > 30) communityAlignment = 'high';
    else if (overlapPercentage > 10) communityAlignment = 'medium';
    else communityAlignment = 'low';

    return {
      collectionA: collectionA.contractAddress,
      collectionB: collectionB.contractAddress,
      sharedHolders: sharedCount,
      overlapPercentage: Math.round(overlapPercentage * 100) / 100,
      correlationStrength: Math.round(correlationStrength),
      sharedWhales: 0, // Would analyze holder token counts
      communityAlignment,
      culturalSimilarity: Math.round(correlationStrength * 0.8), // Simplified
    };
  }

  private analyzeWhaleMovements(transfers: any[]) {
    // Simplified whale movement detection
    const movements: any[] = [];
    const addressActivity = new Map<string, { in: number; out: number }>();

    transfers.forEach((transfer: any) => {
      const from = transfer.from;
      const to = transfer.to;
      
      if (from !== '0x0000000000000000000000000000000000000000') {
        const activity = addressActivity.get(from) || { in: 0, out: 0 };
        activity.out++;
        addressActivity.set(from, activity);
      }
      
      if (to !== '0x0000000000000000000000000000000000000000') {
        const activity = addressActivity.get(to) || { in: 0, out: 0 };
        activity.in++;
        addressActivity.set(to, activity);
      }
    });

    // Analyze patterns for significant addresses
    addressActivity.forEach((activity, address) => {
      const netChange = activity.in - activity.out;
      
      if (Math.abs(netChange) >= 3) { // Threshold for whale activity
        let action: 'accumulating' | 'distributing' | 'entering' | 'exiting';
        if (netChange > 0) action = activity.out === 0 ? 'entering' : 'accumulating';
        else action = activity.in === 0 ? 'exiting' : 'distributing';

        movements.push({
          address,
          action,
          tokensChanged: Math.abs(netChange),
          timeframe: 'last 7 days',
          impact: Math.abs(netChange) > 10 ? 'high' : Math.abs(netChange) > 5 ? 'medium' : 'low',
          confidence: 85,
        });
      }
    });

    return movements.sort((a, b) => b.tokensChanged - a.tokensChanged);
  }

  private calculateGini(values: number[]): number {
    if (values.length === 0) return 0;
    
    values.sort((a, b) => a - b);
    
    const n = values.length;
    let index = 0;
    let sum = 0;
    
    for (let i = 0; i < n; i++) {
      index += (i + 1) * values[i];
      sum += values[i];
    }
    
    return sum === 0 ? 0 : (2 * index / (n * sum)) - (n + 1) / n;
  }

  private async getENSName(address: string): Promise<string | undefined> {
    // Would integrate with ENS resolver
    return undefined;
  }

  private isKnownAddress(address: string): boolean {
    // Would check against database of known addresses
    const knownAddresses = [
      '0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503', // Binance
      '0x28C6c06298d514Db089934071355E5743bf21d60', // Binance 2
      // Add more known addresses
    ];
    return knownAddresses.includes(address);
  }

  private determineEntityType(address: string): 'individual' | 'institution' | 'marketplace' | 'dao' {
    if (this.isKnownAddress(address)) return 'institution';
    if (this.isMarketplaceAddress(address)) return 'marketplace';
    // Would have more sophisticated detection
    return 'individual';
  }

  private isMarketplaceAddress(address: string): boolean {
    const marketplaces = [
      '0x7f268357A8c2552623316e2562D90e642bB538E5', // OpenSea
      '0x74312363e45DCaBA76c59ec49a7Aa8A65a67EeD3', // X2Y2
      // Add more marketplace addresses
    ];
    return marketplaces.includes(address);
  }

  private createEmptyAnalysis() {
    return {
      analysis: {
        totalHolders: 0,
        whaleHolders: 0,
        dolphinHolders: 0,
        fishHolders: 0,
        diamondHands: 0,
        paperHands: 0,
        averageHoldingPeriod: 0,
        holderLoyalty: 0,
        concentrationRatio: 0,
        distributionGini: 0,
      },
      topHolders: [],
      insights: {
        communityStrength: 0,
        holderEngagement: 0,
        loyaltyTrend: 'stable' as const,
        wealthConcentration: 'distributed' as const,
        newHolderInflux: 0,
        holderTurnover: 0,
        collectingPatterns: {
          sweepers: 0,
          accumulators: 0,
          flippers: 0,
          hodlers: 0,
        },
        supplyDistribution: {
          availableSupply: 0,
          lockedSupply: 0,
          liquidSupply: 0,
        },
        influencerHolders: [],
      },
    };
  }
}

// Export singleton instance
export const holderPatternsService = new HolderPatternsService();