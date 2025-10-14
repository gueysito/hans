// Transaction History Analysis Service
// Provides deep behavioral insights through transaction pattern analysis

import { alchemyAPI } from '../api/alchemy';
import { openSeaAPI } from '../api/opensea-v2';
import { CacheManager } from '../performance';

export interface Transaction {
  txHash: string;
  blockNumber: number;
  timestamp: number;
  type: 'mint' | 'sale' | 'transfer' | 'listing' | 'offer';
  fromAddress: string;
  toAddress: string;
  price?: number;
  priceUSD?: number;
  currency?: string;
  marketplace?: string;
  gasUsed?: number;
  gasPrice?: number;
}

export interface NFTTransactionHistory {
  contractAddress: string;
  tokenId: string;
  transactions: Transaction[];
  analysis: {
    totalTransactions: number;
    ownershipChanges: number;
    totalVolume: number;
    totalVolumeUSD: number;
    averageHoldingPeriod: number; // Days
    priceAppreciation: number; // Percentage
    marketplaceDistribution: Record<string, number>;
    velocityScore: number; // How often it trades (0-100)
  };
}

export interface WalletTransactionBehavior {
  walletAddress: string;
  totalTransactions: number;
  totalSpent: number;
  totalSpentUSD: number;
  totalReceived: number;
  totalReceivedUSD: number;
  netPosition: number;
  netPositionUSD: number;
  
  // Behavioral Patterns
  patterns: {
    averageHoldingPeriod: number; // Days
    preferredMarketplaces: Array<{ name: string; percentage: number }>;
    gasBehavior: {
      averageGasPrice: number;
      strategy: 'aggressive' | 'moderate' | 'conservative';
    };
    timingPatterns: {
      preferredHours: number[]; // Hours of day (0-23)
      preferredDaysOfWeek: number[]; // 0=Sunday, 6=Saturday
      marketTimingScore: number; // 0-100 (how good at timing markets)
    };
    tradingStyle: {
      type: 'flipper' | 'holder' | 'accumulator' | 'diamond_hands' | 'paper_hands';
      confidence: number; // 0-100
      reasoning: string;
    };
    profitability: {
      winRate: number; // Percentage of profitable sales
      averageProfit: number; // ETH
      averageProfitUSD: number;
      bestTrade: { profit: number; profitUSD: number; collection: string };
      worstTrade: { loss: number; lossUSD: number; collection: string };
    };
  };
}

class TransactionHistoryService {
  async getCollectionTransactionHistory(
    contractAddress: string,
    tokenId?: string,
    limit: number = 100
  ): Promise<NFTTransactionHistory[]> {
    const cacheKey = `tx_history_${contractAddress}_${tokenId || 'all'}_${limit}`;
    const cached = CacheManager.get<NFTTransactionHistory[]>(cacheKey);
    
    if (cached) {
      console.log('📦 Using cached transaction history');
      return cached;
    }

    console.log(`🔮 Fetching transaction history for ${contractAddress}`);
    
    try {
      const results: NFTTransactionHistory[] = [];

      // If specific tokenId, get its history
      if (tokenId) {
        const history = await this.getTokenHistory(contractAddress, tokenId);
        if (history) results.push(history);
      } else {
        // Get collection-wide transaction patterns
        const collectionTxs = await this.getCollectionHistory(contractAddress, limit);
        results.push(...collectionTxs);
      }

      // Cache for 10 minutes
      CacheManager.set(cacheKey, results, 10 * 60 * 1000);
      return results;

    } catch (error) {
      console.error('Transaction history fetch failed:', error);
      return [];
    }
  }

  async analyzeWalletBehavior(walletAddress: string): Promise<WalletTransactionBehavior> {
    const cacheKey = `wallet_behavior_${walletAddress}`;
    const cached = CacheManager.get<WalletTransactionBehavior>(cacheKey);
    
    if (cached) {
      console.log('📦 Using cached wallet behavior analysis');
      return cached;
    }

    console.log(`🔮 Analyzing transaction behavior for ${walletAddress}`);
    
    try {
      // Get all transactions for this wallet (last 6 months to avoid rate limits)
      const [alchemyTxs, ethPrice] = await Promise.all([
        alchemyAPI.getNFTTransactions(walletAddress),
        this.getETHPrice(),
      ]);

      if (!alchemyTxs?.length) {
        return this.createEmptyBehaviorAnalysis(walletAddress);
      }

      // Process transactions and calculate behavioral patterns
      const analysis = this.analyzeBehavioralPatterns(alchemyTxs, ethPrice);
      
      const behavior: WalletTransactionBehavior = {
        walletAddress,
        totalTransactions: alchemyTxs.length,
        totalSpent: analysis.totalSpent,
        totalSpentUSD: analysis.totalSpent * ethPrice,
        totalReceived: analysis.totalReceived,
        totalReceivedUSD: analysis.totalReceived * ethPrice,
        netPosition: analysis.totalReceived - analysis.totalSpent,
        netPositionUSD: (analysis.totalReceived - analysis.totalSpent) * ethPrice,
        patterns: analysis.patterns,
      };

      // Cache for 30 minutes
      CacheManager.set(cacheKey, behavior, 30 * 60 * 1000);
      return behavior;

    } catch (error) {
      console.error('Wallet behavior analysis failed:', error);
      return this.createEmptyBehaviorAnalysis(walletAddress);
    }
  }

  private async getTokenHistory(contractAddress: string, tokenId: string): Promise<NFTTransactionHistory | null> {
    try {
      // Use Alchemy to get NFT transfers
      const transfers = await alchemyAPI.getNFTTransfers({
        contractAddress,
        tokenId,
        category: ['erc721', 'erc1155'],
      });

      if (!transfers?.transfers?.length) {
        return null;
      }

      const transactions: Transaction[] = transfers.transfers.map((transfer: any) => ({
        txHash: transfer.hash,
        blockNumber: parseInt(transfer.blockNum, 16),
        timestamp: new Date(transfer.metadata.blockTimestamp).getTime(),
        type: this.determineTransactionType(transfer),
        fromAddress: transfer.from,
        toAddress: transfer.to,
        price: transfer.value ? parseFloat(transfer.value) : undefined,
        // Note: Would need additional API calls to get USD prices, marketplace info, etc.
      }));

      const analysis = this.calculateNFTAnalytics(transactions);

      return {
        contractAddress,
        tokenId,
        transactions: transactions.sort((a, b) => b.timestamp - a.timestamp),
        analysis,
      };

    } catch (error) {
      console.error(`Failed to get token history for ${contractAddress}:${tokenId}:`, error);
      return null;
    }
  }

  private async getCollectionHistory(contractAddress: string, limit: number): Promise<NFTTransactionHistory[]> {
    try {
      // For now, return empty - this would require more extensive API integration
      // In production, we'd use multiple data sources to build comprehensive collection history
      return [];
    } catch (error) {
      console.error(`Failed to get collection history for ${contractAddress}:`, error);
      return [];
    }
  }

  private analyzeBehavioralPatterns(transactions: any[], ethPrice: number) {
    let totalSpent = 0;
    let totalReceived = 0;
    const marketplaces: Record<string, number> = {};
    const hourlyActivity = Array(24).fill(0);
    const dailyActivity = Array(7).fill(0);
    const gasPrices: number[] = [];
    const holdingPeriods: number[] = [];
    const trades: Array<{ profit: number; collection: string }> = [];

    // Analyze each transaction
    transactions.forEach((tx: any) => {
      const timestamp = new Date(tx.timestamp).getTime();
      const hour = new Date(timestamp).getHours();
      const day = new Date(timestamp).getDay();
      
      hourlyActivity[hour]++;
      dailyActivity[day]++;

      if (tx.value) {
        const value = parseFloat(tx.value);
        if (tx.to === tx.walletAddress) {
          totalReceived += value;
        } else {
          totalSpent += value;
        }
      }

      if (tx.gasPrice) {
        gasPrices.push(parseFloat(tx.gasPrice));
      }

      // Track marketplace if available
      if (tx.marketplace) {
        marketplaces[tx.marketplace] = (marketplaces[tx.marketplace] || 0) + 1;
      }
    });

    // Calculate behavioral metrics
    const avgGasPrice = gasPrices.length > 0 ? gasPrices.reduce((a, b) => a + b, 0) / gasPrices.length : 0;
    const preferredHours = hourlyActivity
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(h => h.hour);

    const preferredDays = dailyActivity
      .map((count, day) => ({ day, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 2)
      .map(d => d.day);

    // Determine trading style
    const tradingStyle = this.determineTradingStyle({
      totalTransactions: transactions.length,
      holdingPeriods,
      netPosition: totalReceived - totalSpent,
      avgGasPrice,
    });

    // Calculate profitability (simplified - would need more complex logic in production)
    const winRate = trades.length > 0 ? trades.filter(t => t.profit > 0).length / trades.length * 100 : 0;
    const avgProfit = trades.length > 0 ? trades.reduce((sum, t) => sum + t.profit, 0) / trades.length : 0;

    return {
      totalSpent,
      totalReceived,
      patterns: {
        averageHoldingPeriod: holdingPeriods.length > 0 
          ? holdingPeriods.reduce((a, b) => a + b, 0) / holdingPeriods.length 
          : 0,
        preferredMarketplaces: Object.entries(marketplaces)
          .map(([name, count]) => ({
            name,
            percentage: (count / transactions.length) * 100,
          }))
          .sort((a, b) => b.percentage - a.percentage),
        gasBehavior: {
          averageGasPrice: avgGasPrice,
          strategy: avgGasPrice > 50 ? 'aggressive' : avgGasPrice > 20 ? 'moderate' : 'conservative',
        },
        timingPatterns: {
          preferredHours,
          preferredDaysOfWeek: preferredDays,
          marketTimingScore: this.calculateMarketTimingScore(transactions),
        },
        tradingStyle,
        profitability: {
          winRate,
          averageProfit: avgProfit,
          averageProfitUSD: avgProfit * ethPrice,
          bestTrade: trades.length > 0 
            ? { 
                profit: Math.max(...trades.map(t => t.profit)), 
                profitUSD: Math.max(...trades.map(t => t.profit)) * ethPrice, 
                collection: trades.find(t => t.profit === Math.max(...trades.map(t => t.profit)))?.collection || 'Unknown'
              }
            : { profit: 0, profitUSD: 0, collection: 'None' },
          worstTrade: trades.length > 0 
            ? { 
                loss: Math.min(...trades.map(t => t.profit)), 
                lossUSD: Math.min(...trades.map(t => t.profit)) * ethPrice, 
                collection: trades.find(t => t.profit === Math.min(...trades.map(t => t.profit)))?.collection || 'Unknown'
              }
            : { loss: 0, lossUSD: 0, collection: 'None' },
        },
      },
    };
  }

  private determineTradingStyle(data: any): { type: string; confidence: number; reasoning: string } {
    const { totalTransactions, holdingPeriods, netPosition, avgGasPrice } = data;
    
    if (totalTransactions < 5) {
      return {
        type: 'holder',
        confidence: 60,
        reasoning: 'Low transaction volume suggests holding strategy'
      };
    }

    const avgHoldingPeriod = holdingPeriods.length > 0 
      ? holdingPeriods.reduce((a, b) => a + b, 0) / holdingPeriods.length 
      : 0;

    if (avgHoldingPeriod > 180) {
      return {
        type: 'diamond_hands',
        confidence: 85,
        reasoning: 'Extended holding periods (6+ months) indicate diamond hands mentality'
      };
    }

    if (avgHoldingPeriod < 30) {
      return {
        type: 'flipper',
        confidence: 90,
        reasoning: 'Short holding periods (<30 days) indicate active flipping'
      };
    }

    if (netPosition > 0 && totalTransactions > 20) {
      return {
        type: 'accumulator',
        confidence: 80,
        reasoning: 'Positive net position with high activity suggests accumulation strategy'
      };
    }

    if (netPosition < -0.5) {
      return {
        type: 'paper_hands',
        confidence: 75,
        reasoning: 'Negative net position suggests selling during downturns'
      };
    }

    return {
      type: 'holder',
      confidence: 50,
      reasoning: 'Mixed signals suggest balanced holding and trading approach'
    };
  }

  private calculateMarketTimingScore(transactions: any[]): number {
    // Simplified market timing analysis
    // In production, this would correlate transaction timing with market movements
    
    if (transactions.length < 10) return 50; // Neutral for low data
    
    // For now, return a random-ish score based on transaction patterns
    // Real implementation would analyze buy/sell timing against market peaks/dips
    const score = Math.min(100, Math.max(0, 30 + (transactions.length * 2)));
    return Math.round(score);
  }

  private calculateNFTAnalytics(transactions: Transaction[]) {
    const ownershipChanges = transactions.filter(tx => 
      tx.type === 'sale' || tx.type === 'transfer'
    ).length;

    const sales = transactions.filter(tx => tx.type === 'sale' && tx.price);
    const totalVolume = sales.reduce((sum, tx) => sum + (tx.price || 0), 0);
    const totalVolumeUSD = sales.reduce((sum, tx) => sum + (tx.priceUSD || 0), 0);

    // Calculate holding periods between ownership changes
    const holdingPeriods: number[] = [];
    for (let i = 0; i < transactions.length - 1; i++) {
      if (transactions[i].type === 'sale' || transactions[i].type === 'transfer') {
        const nextOwnershipChange = transactions.slice(i + 1).find(tx => 
          tx.type === 'sale' || tx.type === 'transfer'
        );
        if (nextOwnershipChange) {
          const days = (transactions[i].timestamp - nextOwnershipChange.timestamp) / (1000 * 60 * 60 * 24);
          holdingPeriods.push(days);
        }
      }
    }

    const averageHoldingPeriod = holdingPeriods.length > 0 
      ? holdingPeriods.reduce((a, b) => a + b, 0) / holdingPeriods.length 
      : 0;

    // Calculate price appreciation
    const firstSale = sales[sales.length - 1];
    const lastSale = sales[0];
    const priceAppreciation = firstSale && lastSale && firstSale.price 
      ? ((lastSale.price || 0) - firstSale.price) / firstSale.price * 100
      : 0;

    // Marketplace distribution
    const marketplaces: Record<string, number> = {};
    transactions.forEach(tx => {
      if (tx.marketplace) {
        marketplaces[tx.marketplace] = (marketplaces[tx.marketplace] || 0) + 1;
      }
    });

    // Velocity score (how often it trades)
    const velocityScore = Math.min(100, ownershipChanges * 10);

    return {
      totalTransactions: transactions.length,
      ownershipChanges,
      totalVolume,
      totalVolumeUSD,
      averageHoldingPeriod,
      priceAppreciation,
      marketplaceDistribution: marketplaces,
      velocityScore,
    };
  }

  private determineTransactionType(transfer: any): Transaction['type'] {
    // Simple logic - in production would be more sophisticated
    if (transfer.from === '0x0000000000000000000000000000000000000000') {
      return 'mint';
    }
    if (transfer.value && parseFloat(transfer.value) > 0) {
      return 'sale';
    }
    return 'transfer';
  }

  private createEmptyBehaviorAnalysis(walletAddress: string): WalletTransactionBehavior {
    return {
      walletAddress,
      totalTransactions: 0,
      totalSpent: 0,
      totalSpentUSD: 0,
      totalReceived: 0,
      totalReceivedUSD: 0,
      netPosition: 0,
      netPositionUSD: 0,
      patterns: {
        averageHoldingPeriod: 0,
        preferredMarketplaces: [],
        gasBehavior: {
          averageGasPrice: 0,
          strategy: 'moderate',
        },
        timingPatterns: {
          preferredHours: [],
          preferredDaysOfWeek: [],
          marketTimingScore: 50,
        },
        tradingStyle: {
          type: 'holder',
          confidence: 50,
          reasoning: 'No transaction data available',
        },
        profitability: {
          winRate: 0,
          averageProfit: 0,
          averageProfitUSD: 0,
          bestTrade: { profit: 0, profitUSD: 0, collection: 'None' },
          worstTrade: { loss: 0, lossUSD: 0, collection: 'None' },
        },
      },
    };
  }

  private async getETHPrice(): Promise<number> {
    try {
      // Would integrate with price API - using fallback for now
      return 2500;
    } catch {
      return 2500;
    }
  }
}

// Export singleton instance
export const transactionHistoryService = new TransactionHistoryService();