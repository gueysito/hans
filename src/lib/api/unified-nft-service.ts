// Unified NFT Service - Combines multiple API sources for comprehensive analysis
import { openSeaAPI } from './opensea-v2';
import { alchemyAPI } from './alchemy';
import { moralisAPI } from './moralis';
import { coinGeckoAPI } from './coingecko';
import { CacheManager } from '../performance';

export interface UnifiedNFTCollection {
  // Basic Info
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  bannerUrl?: string;
  externalUrl?: string;
  
  // Social Links
  discordUrl?: string;
  twitterUsername?: string;
  
  // Market Stats
  floorPrice: number;
  floorPriceUSD: number;
  totalVolume: number;
  totalSales: number;
  totalSupply: number;
  numOwners: number;
  averagePrice: number;
  marketCap: number;
  
  // Price Changes
  oneDayChange: number;
  sevenDayChange: number;
  thirtyDayChange: number;
  
  // Volume Stats
  oneDayVolume: number;
  sevenDayVolume: number;
  thirtyDayVolume: number;
  
  // Additional Metrics
  holderDistribution?: {
    whales: number; // Holders with >1% of supply
    dolphins: number; // Holders with 0.1-1%
    fish: number; // Holders with <0.1%
  };
  
  // Data Sources
  sources: {
    opensea: boolean;
    alchemy: boolean;
    moralis: boolean;
    coingecko: boolean;
  };
}

export interface UnifiedNFT {
  // Basic Info
  contractAddress: string;
  tokenId: string;
  name: string;
  description: string;
  imageUrl: string;
  
  // Collection Info
  collectionSlug: string;
  collectionName: string;
  
  // Metadata
  traits: Array<{
    traitType: string;
    value: string | number;
    rarity?: number;
  }>;
  
  // Rarity
  rarityScore?: number;
  rarityRank?: number;
  
  // Sales Data
  lastSalePrice?: number;
  lastSalePriceUSD?: number;
  lastSaleDate?: string;
  
  // Ownership
  owner: string;
  acquiredDate?: string;
  
  // Valuation
  estimatedValue: number;
  estimatedValueUSD: number;
}

export interface UnifiedWalletAnalysis {
  // Wallet Info
  address: string;
  ens?: string;
  
  // Portfolio Stats
  totalNFTs: number;
  totalCollections: number;
  portfolioValue: number;
  portfolioValueUSD: number;
  
  // Collections
  collections: Map<string, {
    collection: UnifiedNFTCollection;
    holdings: number;
    value: number;
    valueUSD: number;
    percentage: number;
  }>;
  
  // NFTs
  nfts: UnifiedNFT[];
  
  // Analytics
  topCollectionsByValue: Array<{name: string; value: number; percentage: number}>;
  topCollectionsByCount: Array<{name: string; count: number; percentage: number}>;
  
  // Risk Metrics
  diversificationScore: number; // 0-100
  volatilityScore: number; // 0-100
  liquidityScore: number; // 0-100
  
  // Activity
  recentActivity: Array<{
    type: 'buy' | 'sell' | 'transfer';
    collection: string;
    tokenId: string;
    price?: number;
    date: string;
  }>;
  
  // Market Context
  ethPrice: number;
  gasPrice: number;
  globalMarketCap: number;
  globalVolume24h: number;
}

class UnifiedNFTService {
  private ethPriceCache: number | null = null;
  private lastEthPriceUpdate: number = 0;

  async analyzeWallet(walletAddress: string): Promise<UnifiedWalletAnalysis> {
    const cacheKey = `unified_wallet_${walletAddress}`;
    const cached = CacheManager.get<UnifiedWalletAnalysis>(cacheKey);
    
    if (cached) {
      console.log('📦 Using cached unified wallet analysis');
      return cached;
    }

    console.log(`🔮 Performing unified analysis for wallet: ${walletAddress}`);
    
    try {
      // Fetch data from multiple sources in parallel
      const [openSeaData, alchemyData, moralisData, ethPrice, globalData] = await Promise.all([
        openSeaAPI.getWalletNFTs(walletAddress).catch(err => {
          console.error('OpenSea fetch failed:', err);
          return null;
        }),
        alchemyAPI.getNFTsForOwner(walletAddress).catch(err => {
          console.error('Alchemy fetch failed:', err);
          return null;
        }),
        moralisAPI.getWalletNFTs(walletAddress).catch(err => {
          console.error('Moralis fetch failed:', err);
          return null;
        }),
        this.getETHPrice(),
        coinGeckoAPI.getGlobalData().catch(() => null),
      ]);

      // Combine and deduplicate NFT data
      const nftMap = new Map<string, UnifiedNFT>();
      const collectionMap = new Map<string, UnifiedNFTCollection>();

      // Process OpenSea data
      if (openSeaData) {
        for (const nft of openSeaData.assets) {
          const key = `${nft.contract_address}_${nft.token_id}`;
          const collection = openSeaData.collections.get(nft.collection);
          
          if (collection) {
            collectionMap.set(nft.collection, await this.unifyCollection(collection, null));
          }
          
          nftMap.set(key, await this.unifyNFT(nft, null, null, ethPrice));
        }
      }

      // Process Alchemy data (merge with existing)
      if (alchemyData) {
        for (const nft of alchemyData.nfts) {
          const key = `${nft.contract.address}_${nft.tokenId}`;
          const existing = nftMap.get(key);
          
          if (existing) {
            // Merge data
            existing.rarityScore = nft.raw?.metadata?.rarity?.score || existing.rarityScore;
            existing.rarityRank = nft.raw?.metadata?.rarity?.rank || existing.rarityRank;
          } else {
            nftMap.set(key, await this.unifyNFT(null, nft, null, ethPrice));
          }
          
          // Get collection data if not already present
          if (!collectionMap.has(nft.collection.slug)) {
            const floorPrice = await alchemyAPI.getFloorPrice(nft.contract.address);
            if (floorPrice) {
              collectionMap.set(nft.collection.slug, {
                slug: nft.collection.slug,
                name: nft.collection.name,
                description: '',
                imageUrl: nft.collection.bannerImageUrl || '',
                floorPrice: floorPrice.openSea?.floorPrice || 0,
                floorPriceUSD: (floorPrice.openSea?.floorPrice || 0) * ethPrice,
                totalVolume: 0,
                totalSales: 0,
                totalSupply: 0,
                numOwners: 0,
                averagePrice: 0,
                marketCap: 0,
                oneDayChange: 0,
                sevenDayChange: 0,
                thirtyDayChange: 0,
                oneDayVolume: 0,
                sevenDayVolume: 0,
                thirtyDayVolume: 0,
                sources: {
                  opensea: false,
                  alchemy: true,
                  moralis: false,
                  coingecko: false,
                },
              });
            }
          }
        }
      }

      // Process Moralis data (merge with existing)
      if (moralisData && moralisData.result) {
        console.log(`🔗 Processing ${moralisData.result.length} NFTs from Moralis`);
        
        for (const nft of moralisData.result) {
          const key = `${nft.token_address}_${nft.token_id}`;
          const existing = nftMap.get(key);
          
          if (existing) {
            // Merge additional data from Moralis
            if (nft.metadata && !existing.description) {
              existing.description = nft.metadata.description || existing.description;
            }
            if (nft.metadata?.attributes && (!existing.traits || existing.traits.length === 0)) {
              existing.traits = nft.metadata.attributes.map(attr => ({
                traitType: attr.trait_type,
                value: attr.value,
                rarity: undefined
              }));
            }
            // Add verification status
            existing.estimatedValue = existing.estimatedValue || 0;
          } else {
            // Create new NFT entry from Moralis data
            const unifiedNFT = await this.unifyNFT(null, null, nft, ethPrice);
            nftMap.set(key, unifiedNFT);
          }
          
          // Try to get additional collection stats from Moralis if not present
          if (!collectionMap.has(nft.name)) {
            try {
              const collectionStats = await moralisAPI.getCollectionStats(nft.token_address);
              if (collectionStats) {
                collectionMap.set(nft.name, {
                  slug: nft.name.toLowerCase().replace(/\s+/g, '-'),
                  name: nft.name,
                  description: '',
                  imageUrl: nft.metadata?.image || '',
                  floorPrice: parseFloat(collectionStats.floor_price_native || '0'),
                  floorPriceUSD: parseFloat(collectionStats.floor_price_usd || '0'),
                  totalVolume: parseFloat(collectionStats.volume_native?.['24hr'] || '0'),
                  totalSales: 0,
                  totalSupply: parseInt(collectionStats.total_tokens || '0'),
                  numOwners: parseInt(collectionStats.total_owners || '0'),
                  averagePrice: parseFloat(collectionStats.average_sale_price_native || '0'),
                  marketCap: parseFloat(collectionStats.market_cap_native || '0'),
                  oneDayChange: parseFloat(collectionStats.floor_price_24hr_percent_change || '0'),
                  sevenDayChange: 0,
                  thirtyDayChange: 0,
                  oneDayVolume: parseFloat(collectionStats.volume_native?.['24hr'] || '0'),
                  sevenDayVolume: parseFloat(collectionStats.volume_native?.['7d'] || '0'),
                  thirtyDayVolume: parseFloat(collectionStats.volume_native?.['30d'] || '0'),
                  sources: {
                    opensea: false,
                    alchemy: false,
                    moralis: true,
                    coingecko: false,
                  },
                });
              }
            } catch (error) {
              console.error(`Failed to get Moralis collection stats for ${nft.token_address}:`, error);
            }
          }
        }
      }

      // Calculate portfolio metrics
      const nfts = Array.from(nftMap.values());
      const collections = collectionMap;
      
      // Group NFTs by collection
      const collectionHoldings = new Map<string, {
        collection: UnifiedNFTCollection;
        holdings: number;
        value: number;
        valueUSD: number;
        percentage: number;
      }>();

      nfts.forEach(nft => {
        const collection = collections.get(nft.collectionSlug);
        if (collection) {
          const existing = collectionHoldings.get(nft.collectionSlug);
          if (existing) {
            existing.holdings++;
            existing.value += collection.floorPrice;
            existing.valueUSD += collection.floorPriceUSD;
          } else {
            collectionHoldings.set(nft.collectionSlug, {
              collection,
              holdings: 1,
              value: collection.floorPrice,
              valueUSD: collection.floorPriceUSD,
              percentage: 0, // Will calculate after
            });
          }
        }
      });

      // Calculate total portfolio value
      const totalValue = Array.from(collectionHoldings.values()).reduce(
        (sum, holding) => sum + holding.value,
        0
      );
      const totalValueUSD = totalValue * ethPrice;

      // Calculate percentages
      collectionHoldings.forEach(holding => {
        holding.percentage = (holding.value / totalValue) * 100;
      });

      // Calculate analytics
      const topByValue = Array.from(collectionHoldings.values())
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)
        .map(h => ({
          name: h.collection.name,
          value: h.valueUSD,
          percentage: h.percentage,
        }));

      const topByCount = Array.from(collectionHoldings.values())
        .sort((a, b) => b.holdings - a.holdings)
        .slice(0, 5)
        .map(h => ({
          name: h.collection.name,
          count: h.holdings,
          percentage: (h.holdings / nfts.length) * 100,
        }));

      // Calculate risk scores
      const diversificationScore = this.calculateDiversification(collectionHoldings);
      const volatilityScore = this.calculateVolatility(collections);
      const liquidityScore = this.calculateLiquidity(collections);

      const analysis: UnifiedWalletAnalysis = {
        address: walletAddress,
        totalNFTs: nfts.length,
        totalCollections: collections.size,
        portfolioValue: totalValue,
        portfolioValueUSD: totalValueUSD,
        collections: collectionHoldings,
        nfts,
        topCollectionsByValue: topByValue,
        topCollectionsByCount: topByCount,
        diversificationScore,
        volatilityScore,
        liquidityScore,
        recentActivity: [], // Would need transaction history API
        ethPrice,
        gasPrice: 30, // Would fetch from gas oracle
        globalMarketCap: globalData?.total_market_cap?.usd || 0,
        globalVolume24h: globalData?.total_volume?.usd || 0,
      };

      // Cache for 5 minutes
      CacheManager.set(cacheKey, analysis, 5 * 60 * 1000);
      
      return analysis;
    } catch (error) {
      console.error('Unified analysis failed:', error);
      throw error;
    }
  }

  private async unifyCollection(
    openSeaCollection: any | null,
    alchemyData: any | null
  ): Promise<UnifiedNFTCollection> {
    const ethPrice = await this.getETHPrice();
    
    return {
      slug: openSeaCollection?.collection || alchemyData?.slug || '',
      name: openSeaCollection?.name || alchemyData?.name || '',
      description: openSeaCollection?.description || '',
      imageUrl: openSeaCollection?.image_url || alchemyData?.imageUrl || '',
      bannerUrl: openSeaCollection?.banner_image_url,
      externalUrl: openSeaCollection?.external_url,
      discordUrl: openSeaCollection?.discord_url,
      twitterUsername: openSeaCollection?.twitter_username,
      floorPrice: openSeaCollection?.stats?.floor_price || 0,
      floorPriceUSD: (openSeaCollection?.stats?.floor_price || 0) * ethPrice,
      totalVolume: openSeaCollection?.stats?.total_volume || 0,
      totalSales: openSeaCollection?.stats?.total_sales || 0,
      totalSupply: openSeaCollection?.stats?.total_supply || 0,
      numOwners: openSeaCollection?.stats?.num_owners || 0,
      averagePrice: openSeaCollection?.stats?.average_price || 0,
      marketCap: openSeaCollection?.stats?.market_cap || 0,
      oneDayChange: openSeaCollection?.stats?.one_day_change || 0,
      sevenDayChange: openSeaCollection?.stats?.seven_day_change || 0,
      thirtyDayChange: openSeaCollection?.stats?.thirty_day_change || 0,
      oneDayVolume: openSeaCollection?.stats?.one_day_volume || 0,
      sevenDayVolume: openSeaCollection?.stats?.seven_day_volume || 0,
      thirtyDayVolume: openSeaCollection?.stats?.thirty_day_volume || 0,
      sources: {
        opensea: !!openSeaCollection,
        alchemy: !!alchemyData,
        moralis: false,
        coingecko: false,
      },
    };
  }

  private async unifyNFT(
    openSeaNFT: any | null,
    alchemyNFT: any | null,
    moralisNFT: any | null,
    ethPrice: number
  ): Promise<UnifiedNFT> {
    const nft = openSeaNFT || alchemyNFT || moralisNFT;
    
    return {
      contractAddress: openSeaNFT?.contract_address || alchemyNFT?.contract?.address || moralisNFT?.token_address || '',
      tokenId: openSeaNFT?.token_id || alchemyNFT?.tokenId || moralisNFT?.token_id || '',
      name: openSeaNFT?.name || alchemyNFT?.name || moralisNFT?.name || moralisNFT?.metadata?.name || '',
      description: openSeaNFT?.description || alchemyNFT?.description || moralisNFT?.metadata?.description || '',
      imageUrl: openSeaNFT?.image_url || alchemyNFT?.image?.cachedUrl || moralisNFT?.metadata?.image || '',
      collectionSlug: openSeaNFT?.collection || alchemyNFT?.collection?.slug || moralisNFT?.name?.toLowerCase().replace(/\s+/g, '-') || '',
      collectionName: openSeaNFT?.collection || alchemyNFT?.collection?.name || moralisNFT?.name || '',
      traits: (openSeaNFT?.traits || alchemyNFT?.raw?.metadata?.attributes || moralisNFT?.metadata?.attributes || []).map((t: any) => ({
        traitType: t.trait_type || t.trait,
        value: t.value,
        rarity: t.trait_count ? (1 / t.trait_count) * 100 : undefined,
      })),
      rarityScore: openSeaNFT?.rarity?.score || alchemyNFT?.raw?.metadata?.rarity?.score,
      rarityRank: openSeaNFT?.rarity?.rank || alchemyNFT?.raw?.metadata?.rarity?.rank,
      lastSalePrice: openSeaNFT?.last_sale?.total_price ? parseFloat(openSeaNFT.last_sale.total_price) : undefined,
      lastSalePriceUSD: openSeaNFT?.last_sale?.total_price ? parseFloat(openSeaNFT.last_sale.total_price) * ethPrice : undefined,
      lastSaleDate: openSeaNFT?.last_sale?.transaction?.timestamp,
      owner: alchemyNFT?.owners?.[0]?.ownerAddress || moralisNFT?.owner_of || '',
      acquiredDate: alchemyNFT?.acquiredAt?.blockTimestamp,
      estimatedValue: 0, // Would calculate based on collection floor
      estimatedValueUSD: 0,
    };
  }

  private async getETHPrice(): Promise<number> {
    // Cache ETH price for 1 minute
    if (this.ethPriceCache && Date.now() - this.lastEthPriceUpdate < 60000) {
      return this.ethPriceCache;
    }

    try {
      const prices = await coinGeckoAPI.getSimplePrice(['ethereum']);
      this.ethPriceCache = prices.ethereum?.usd || 2500;
      this.lastEthPriceUpdate = Date.now();
      return this.ethPriceCache;
    } catch (error) {
      console.error('Failed to fetch ETH price:', error);
      return 2500; // Fallback price
    }
  }

  private calculateDiversification(holdings: Map<string, any>): number {
    if (holdings.size === 0) return 0;
    if (holdings.size === 1) return 10;
    
    // Calculate Herfindahl-Hirschman Index (HHI)
    const percentages = Array.from(holdings.values()).map(h => h.percentage);
    const hhi = percentages.reduce((sum, p) => sum + Math.pow(p, 2), 0);
    
    // Convert HHI to 0-100 score (lower HHI = better diversification)
    const score = Math.max(0, Math.min(100, (1 - hhi / 10000) * 100));
    return Math.round(score);
  }

  private calculateVolatility(collections: Map<string, UnifiedNFTCollection>): number {
    const changes = Array.from(collections.values()).map(c => 
      Math.abs(c.oneDayChange) + Math.abs(c.sevenDayChange) + Math.abs(c.thirtyDayChange)
    );
    
    if (changes.length === 0) return 50;
    
    const avgVolatility = changes.reduce((sum, c) => sum + c, 0) / changes.length;
    
    // Convert to 0-100 score (higher volatility = higher score)
    const score = Math.min(100, avgVolatility * 10);
    return Math.round(score);
  }

  private calculateLiquidity(collections: Map<string, UnifiedNFTCollection>): number {
    const volumes = Array.from(collections.values()).map(c => c.oneDayVolume);
    
    if (volumes.length === 0) return 0;
    
    const avgVolume = volumes.reduce((sum, v) => sum + v, 0) / volumes.length;
    
    // Score based on average daily volume (higher = better liquidity)
    let score = 0;
    if (avgVolume > 100) score = 90;
    else if (avgVolume > 50) score = 75;
    else if (avgVolume > 20) score = 60;
    else if (avgVolume > 10) score = 45;
    else if (avgVolume > 5) score = 30;
    else if (avgVolume > 1) score = 15;
    else score = 5;
    
    return score;
  }

  async getTrendingCollections(): Promise<UnifiedNFTCollection[]> {
    try {
      const [openSeaTrending, coinGeckoTrending] = await Promise.all([
        openSeaAPI.getTrendingCollections(10),
        coinGeckoAPI.getTrendingNFTs(),
      ]);

      // Merge and deduplicate trending collections
      const trendingMap = new Map<string, UnifiedNFTCollection>();
      
      for (const collection of openSeaTrending) {
        trendingMap.set(collection.collection, await this.unifyCollection(collection, null));
      }

      return Array.from(trendingMap.values());
    } catch (error) {
      console.error('Failed to fetch trending collections:', error);
      return [];
    }
  }
}

// Export singleton instance
export const unifiedNFTService = new UnifiedNFTService();