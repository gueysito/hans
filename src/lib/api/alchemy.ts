// Alchemy API Integration for Blockchain Data
import { CacheManager } from '../performance';

export interface AlchemyNFT {
  contract: {
    address: string;
    name: string;
    symbol: string;
    tokenType: string;
    contractDeployer: string;
    deployedBlockNumber: number;
  };
  tokenId: string;
  tokenType: string;
  name: string;
  description: string;
  tokenUri: string;
  image: {
    cachedUrl: string;
    thumbnailUrl: string;
    pngUrl: string;
    contentType: string;
    size: number;
  };
  raw: {
    tokenUri: string;
    metadata: any;
    error?: string;
  };
  collection: {
    name: string;
    slug: string;
    externalUrl: string;
    bannerImageUrl: string;
  };
  mint: {
    mintAddress: string;
    blockNumber: number;
    timestamp: string;
    transactionHash: string;
  };
  owners: Array<{
    ownerAddress: string;
    tokenBalances: Array<{
      balance: string;
    }>;
  }>;
  timeLastUpdated: string;
  balance: string;
  acquiredAt: {
    blockTimestamp: string;
    blockNumber: number;
  };
}

export interface AlchemyTokenBalance {
  contractAddress: string;
  tokenId: string;
  balance: string;
}

export interface AlchemyTransactionHistory {
  transfers: Array<{
    blockNum: string;
    hash: string;
    from: string;
    to: string;
    value: number;
    erc721TokenId?: string;
    erc1155Metadata?: Array<{
      tokenId: string;
      value: string;
    }>;
    tokenId?: string;
    asset: string;
    category: string;
    rawContract: {
      address: string;
      decimal: string;
      value: string;
    };
  }>;
}

export interface AlchemyFloorPrice {
  openSea: {
    floorPrice: number;
    priceCurrency: string;
    collectionUrl: string;
    retrievedAt: string;
  };
  looksRare?: {
    floorPrice: number;
    priceCurrency: string;
    collectionUrl: string;
    retrievedAt: string;
  };
}

class AlchemyAPIClient {
  private apiKey: string;
  private baseUrl: string;
  private network: string = 'eth-mainnet';

  constructor() {
    this.apiKey = process.env.ALCHEMY_API_KEY || '';
    this.baseUrl = `https://${this.network}.g.alchemy.com/nft/v3/${this.apiKey}`;
    
    if (!this.apiKey) {
      console.warn('⚠️ Alchemy API key not configured - using fallback mode');
    }
  }

  private async fetchWithRetry(url: string, options: RequestInit = {}, retries = 3): Promise<any> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });

        if (response.status === 429) {
          // Rate limited
          const retryAfter = parseInt(response.headers.get('Retry-After') || '1');
          console.log(`⏳ Alchemy rate limited, waiting ${retryAfter} seconds...`);
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          continue;
        }

        if (!response.ok) {
          throw new Error(`Alchemy API error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        console.error(`Alchemy API attempt ${i + 1} failed:`, error);
        
        if (i === retries - 1) {
          throw error;
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }

  async getNFTsForOwner(walletAddress: string, options: {
    pageSize?: number;
    contractAddresses?: string[];
    excludeFilters?: string[];
    includeFilters?: string[];
    orderBy?: 'transferTime';
  } = {}): Promise<{nfts: AlchemyNFT[]; totalCount: number}> {
    const cacheKey = `alchemy_nfts_${walletAddress}`;
    const cached = CacheManager.get<{nfts: AlchemyNFT[]; totalCount: number}>(cacheKey);
    
    if (cached) {
      console.log('📦 Using cached Alchemy NFT data');
      return cached;
    }

    try {
      console.log(`🔍 Fetching NFTs via Alchemy for: ${walletAddress}`);
      
      const params = new URLSearchParams({
        owner: walletAddress,
        withMetadata: 'true',
        pageSize: (options.pageSize || 100).toString(),
      });

      if (options.contractAddresses?.length) {
        params.append('contractAddresses', options.contractAddresses.join(','));
      }

      const response = await this.fetchWithRetry(
        `${this.baseUrl}/getNFTsForOwner?${params}`
      );

      const result = {
        nfts: response.ownedNfts || [],
        totalCount: response.totalCount || 0,
      };

      // Cache for 5 minutes
      CacheManager.set(cacheKey, result, 5 * 60 * 1000);
      
      return result;
    } catch (error) {
      console.error('Failed to fetch NFTs from Alchemy:', error);
      return this.getMockNFTsForOwner(walletAddress);
    }
  }

  async getNFTMetadata(contractAddress: string, tokenId: string): Promise<AlchemyNFT | null> {
    const cacheKey = `alchemy_metadata_${contractAddress}_${tokenId}`;
    const cached = CacheManager.get<AlchemyNFT>(cacheKey);
    
    if (cached) {
      console.log(`📦 Using cached metadata for ${contractAddress}:${tokenId}`);
      return cached;
    }

    try {
      console.log(`🔍 Fetching NFT metadata: ${contractAddress}:${tokenId}`);
      
      const response = await this.fetchWithRetry(
        `${this.baseUrl}/getNFTMetadata?contractAddress=${contractAddress}&tokenId=${tokenId}&refreshCache=false`
      );

      // Cache for 1 hour
      CacheManager.set(cacheKey, response, 60 * 60 * 1000);
      
      return response;
    } catch (error) {
      console.error(`Failed to fetch NFT metadata for ${contractAddress}:${tokenId}:`, error);
      return null;
    }
  }

  async getFloorPrice(contractAddress: string): Promise<AlchemyFloorPrice | null> {
    const cacheKey = `alchemy_floor_${contractAddress}`;
    const cached = CacheManager.get<AlchemyFloorPrice>(cacheKey);
    
    if (cached) {
      console.log(`📦 Using cached floor price for ${contractAddress}`);
      return cached;
    }

    try {
      console.log(`💰 Fetching floor price: ${contractAddress}`);
      
      const response = await this.fetchWithRetry(
        `${this.baseUrl}/getFloorPrice?contractAddress=${contractAddress}`
      );

      // Cache for 15 minutes
      CacheManager.set(cacheKey, response, 15 * 60 * 1000);
      
      return response;
    } catch (error) {
      console.error(`Failed to fetch floor price for ${contractAddress}:`, error);
      return null;
    }
  }

  async getOwnersForContract(contractAddress: string): Promise<string[]> {
    const cacheKey = `alchemy_owners_${contractAddress}`;
    const cached = CacheManager.get<string[]>(cacheKey);
    
    if (cached) {
      console.log(`📦 Using cached owners for ${contractAddress}`);
      return cached;
    }

    try {
      console.log(`👥 Fetching owners for contract: ${contractAddress}`);
      
      const response = await this.fetchWithRetry(
        `${this.baseUrl}/getOwnersForContract?contractAddress=${contractAddress}&withTokenBalances=false`
      );

      const owners = response.owners || [];
      
      // Cache for 30 minutes
      CacheManager.set(cacheKey, owners, 30 * 60 * 1000);
      
      return owners;
    } catch (error) {
      console.error(`Failed to fetch owners for ${contractAddress}:`, error);
      return [];
    }
  }

  async getTransfersForOwner(walletAddress: string, options: {
    fromBlock?: string;
    toBlock?: string;
    contractAddresses?: string[];
    category?: string[];
    orderBy?: 'asc' | 'desc';
  } = {}): Promise<AlchemyTransactionHistory> {
    const cacheKey = `alchemy_transfers_${walletAddress}`;
    const cached = CacheManager.get<AlchemyTransactionHistory>(cacheKey);
    
    if (cached) {
      console.log('📦 Using cached transfer history');
      return cached;
    }

    try {
      console.log(`📜 Fetching transfer history for: ${walletAddress}`);
      
      const params = new URLSearchParams({
        fromAddress: walletAddress,
        orderBy: options.orderBy || 'desc',
      });

      if (options.fromBlock) params.append('fromBlock', options.fromBlock);
      if (options.toBlock) params.append('toBlock', options.toBlock);
      if (options.contractAddresses?.length) {
        params.append('contractAddresses', options.contractAddresses.join(','));
      }

      const response = await this.fetchWithRetry(
        `${this.baseUrl}/getAssetTransfers?${params}`
      );

      const result = {
        transfers: response.transfers || [],
      };

      // Cache for 10 minutes
      CacheManager.set(cacheKey, result, 10 * 60 * 1000);
      
      return result;
    } catch (error) {
      console.error('Failed to fetch transfer history:', error);
      return { transfers: [] };
    }
  }

  async getSpamContracts(): Promise<string[]> {
    const cacheKey = 'alchemy_spam_contracts';
    const cached = CacheManager.get<string[]>(cacheKey);
    
    if (cached) {
      console.log('📦 Using cached spam contracts list');
      return cached;
    }

    try {
      console.log('🚫 Fetching spam contracts list');
      
      const response = await this.fetchWithRetry(
        `${this.baseUrl}/getSpamContracts`
      );

      const spamContracts = response.contractAddresses || [];
      
      // Cache for 24 hours
      CacheManager.set(cacheKey, spamContracts, 24 * 60 * 60 * 1000);
      
      return spamContracts;
    } catch (error) {
      console.error('Failed to fetch spam contracts:', error);
      return [];
    }
  }

  async isSpamContract(contractAddress: string): Promise<boolean> {
    const cacheKey = `alchemy_is_spam_${contractAddress}`;
    const cached = CacheManager.get<boolean>(cacheKey);
    
    if (cached !== null) {
      return cached;
    }

    try {
      const response = await this.fetchWithRetry(
        `${this.baseUrl}/isSpamContract?contractAddress=${contractAddress}`
      );

      const isSpam = response.isSpam || false;
      
      // Cache for 24 hours
      CacheManager.set(cacheKey, isSpam, 24 * 60 * 60 * 1000);
      
      return isSpam;
    } catch (error) {
      console.error(`Failed to check if ${contractAddress} is spam:`, error);
      return false;
    }
  }

  async computeRarity(contractAddress: string, tokenId: string): Promise<{
    rarityScore: number;
    rank: number;
    totalSupply: number;
  } | null> {
    const cacheKey = `alchemy_rarity_${contractAddress}_${tokenId}`;
    const cached = CacheManager.get<any>(cacheKey);
    
    if (cached) {
      console.log(`📦 Using cached rarity for ${contractAddress}:${tokenId}`);
      return cached;
    }

    try {
      console.log(`✨ Computing rarity: ${contractAddress}:${tokenId}`);
      
      const response = await this.fetchWithRetry(
        `${this.baseUrl}/computeRarity?contractAddress=${contractAddress}&tokenId=${tokenId}`
      );

      const rarity = {
        rarityScore: response.rarityScore || 0,
        rank: response.rank || 0,
        totalSupply: response.totalSupply || 0,
      };

      // Cache for 24 hours
      CacheManager.set(cacheKey, rarity, 24 * 60 * 60 * 1000);
      
      return rarity;
    } catch (error) {
      console.error(`Failed to compute rarity for ${contractAddress}:${tokenId}:`, error);
      return null;
    }
  }

  // Mock data fallback
  private getMockNFTsForOwner(walletAddress: string): {nfts: AlchemyNFT[]; totalCount: number} {
    console.log('🎭 Using mock Alchemy data (API key not configured or request failed)');
    
    const mockNFTs: AlchemyNFT[] = [
      {
        contract: {
          address: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
          name: 'Bored Ape Yacht Club',
          symbol: 'BAYC',
          tokenType: 'ERC721',
          contractDeployer: '0x' + 'a'.repeat(40),
          deployedBlockNumber: 12287507,
        },
        tokenId: '1234',
        tokenType: 'ERC721',
        name: 'Bored Ape #1234',
        description: 'A mystical bored ape',
        tokenUri: 'ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9xccariGt3kxsKTPS/1234',
        image: {
          cachedUrl: 'https://via.placeholder.com/400x400?text=BAYC+1234',
          thumbnailUrl: 'https://via.placeholder.com/200x200?text=BAYC+1234',
          pngUrl: 'https://via.placeholder.com/400x400?text=BAYC+1234',
          contentType: 'image/png',
          size: 123456,
        },
        raw: {
          tokenUri: 'ipfs://...',
          metadata: {},
        },
        collection: {
          name: 'Bored Ape Yacht Club',
          slug: 'boredapeyachtclub',
          externalUrl: 'https://boredapeyachtclub.com',
          bannerImageUrl: 'https://via.placeholder.com/1920x480?text=BAYC',
        },
        mint: {
          mintAddress: walletAddress,
          blockNumber: 12287507,
          timestamp: new Date().toISOString(),
          transactionHash: '0x' + 'b'.repeat(64),
        },
        owners: [{
          ownerAddress: walletAddress,
          tokenBalances: [{ balance: '1' }],
        }],
        timeLastUpdated: new Date().toISOString(),
        balance: '1',
        acquiredAt: {
          blockTimestamp: new Date().toISOString(),
          blockNumber: 15000000,
        },
      },
      // Add more mock NFTs...
    ];

    return {
      nfts: mockNFTs,
      totalCount: mockNFTs.length,
    };
  }
}

// Export singleton instance
export const alchemyAPI = new AlchemyAPIClient();