// Moralis API Integration for Web3 Data
// Based on Moralis Web3 API v2 documentation: https://docs.moralis.io/web3-data-api

import { CacheManager } from '../performance';

export interface MoralisNFT {
  token_address: string;
  token_id: string;
  owner_of: string;
  token_hash: string;
  block_number: string;
  block_number_minted: string;
  token_uri: string;
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes: Array<{
      trait_type: string;
      value: string | number;
      display_type?: string;
    }>;
  } | null;
  contract_type: string;
  name: string;
  symbol: string;
  amount: string;
  last_token_uri_sync: string;
  last_metadata_sync: string;
  minter_address: string;
  verified_collection: boolean;
  possible_spam: boolean;
}

export interface MoralisCollection {
  token_address: string;
  name: string;
  symbol: string;
  contract_type: string;
  synced_at: string;
  possible_spam: boolean;
  verified_collection: boolean;
}

export interface MoralisNFTTransfers {
  total: number;
  page: number;
  page_size: number;
  result: Array<{
    transaction_hash: string;
    transaction_index: string;
    token_address: string;
    token_id: string;
    from_address: string;
    to_address: string;
    value: string;
    amount: string;
    block_timestamp: string;
    block_number: string;
    block_hash: string;
    log_index: number;
    operator?: string;
    possible_spam: boolean;
    verified_collection: boolean;
  }>;
}

export interface MoralisNFTPrice {
  token_address: string;
  token_id: string;
  marketplace_id: string;
  marketplace_name: string;
  price: {
    value: string;
    value_decimal: string;
    value_usd: string;
    currency_symbol: string;
    currency_name: string;
    currency_logo: string;
    currency_decimals: number;
    usd_price: string;
  };
  block_timestamp: string;
  block_number: string;
  block_hash: string;
  transaction_hash: string;
  transaction_index: string;
  log_index: number;
  seller_address: string;
  buyer_address: string;
  token_ids: string[];
}

export interface MoralisCollectionStats {
  total_tokens: string;
  total_owners: string;
  total_transfers: string;
  floor_price_usd: string;
  floor_price_native: string;
  floor_price_24hr_percent_change: string;
  market_cap_usd: string;
  market_cap_native: string;
  volume_usd: {
    '24hr': string;
    '7d': string;
    '30d': string;
  };
  volume_native: {
    '24hr': string;
    '7d': string;
    '30d': string;
  };
  volume_24hr_percent_change: string;
  average_sale_price_usd: string;
  average_sale_price_native: string;
}

class MoralisAPIClient {
  private apiKey: string;
  private baseUrl: string = 'https://deep-index.moralis.io/api/v2.2';
  private rateLimitDelay: number = 200; // 200ms between requests (5 requests/second)
  private lastRequestTime: number = 0;

  constructor() {
    this.apiKey = process.env.MORALIS_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('⚠️ Moralis API key not configured - using fallback mode');
    }
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      const waitTime = this.rateLimitDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  private async fetchWithRetry(url: string, options: RequestInit = {}, retries = 3): Promise<any> {
    await this.enforceRateLimit();

    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'X-API-Key': this.apiKey,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });

        if (response.status === 429) {
          // Rate limited
          const retryAfter = parseInt(response.headers.get('Retry-After') || '2');
          console.log(`⏳ Moralis rate limited, waiting ${retryAfter} seconds...`);
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          continue;
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Moralis API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        return await response.json();
      } catch (error) {
        console.error(`Moralis API attempt ${i + 1} failed:`, error);
        
        if (i === retries - 1) {
          throw error;
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }

  /**
   * Get all NFTs owned by a wallet address
   */
  async getWalletNFTs(
    walletAddress: string, 
    options: {
      chain?: string;
      format?: 'decimal' | 'hex';
      limit?: number;
      cursor?: string;
      normalizeMetadata?: boolean;
      excludeSpam?: boolean;
    } = {}
  ): Promise<{ result: MoralisNFT[]; cursor: string | null; total: number }> {
    const cacheKey = `moralis_wallet_nfts_${walletAddress}`;
    const cached = CacheManager.get<{ result: MoralisNFT[]; cursor: string | null; total: number }>(cacheKey);
    
    if (cached) {
      console.log('📦 Using cached Moralis wallet NFTs');
      return cached;
    }

    try {
      console.log(`🔍 Fetching wallet NFTs via Moralis: ${walletAddress}`);
      
      const params = new URLSearchParams({
        chain: options.chain || 'eth',
        format: options.format || 'decimal',
        limit: (options.limit || 100).toString(),
        normalize_metadata: (options.normalizeMetadata !== false).toString(),
        exclude_spam: (options.excludeSpam !== false).toString(),
      });

      if (options.cursor) {
        params.append('cursor', options.cursor);
      }

      const response = await this.fetchWithRetry(
        `${this.baseUrl}/${walletAddress}/nft?${params}`
      );

      const result = {
        result: response.result || [],
        cursor: response.cursor || null,
        total: response.total || 0,
      };

      // Cache for 5 minutes
      CacheManager.set(cacheKey, result, 5 * 60 * 1000);
      
      return result;
    } catch (error) {
      console.error('Failed to fetch wallet NFTs from Moralis:', error);
      return this.getMockWalletNFTs(walletAddress);
    }
  }

  /**
   * Get detailed metadata for a specific NFT
   */
  async getNFTMetadata(
    tokenAddress: string, 
    tokenId: string, 
    options: {
      chain?: string;
      format?: 'decimal' | 'hex';
      normalizeMetadata?: boolean;
    } = {}
  ): Promise<MoralisNFT | null> {
    const cacheKey = `moralis_nft_metadata_${tokenAddress}_${tokenId}`;
    const cached = CacheManager.get<MoralisNFT>(cacheKey);
    
    if (cached) {
      console.log('📦 Using cached Moralis NFT metadata');
      return cached;
    }

    try {
      console.log(`🔍 Fetching NFT metadata: ${tokenAddress}/${tokenId}`);
      
      const params = new URLSearchParams({
        chain: options.chain || 'eth',
        format: options.format || 'decimal',
        normalize_metadata: (options.normalizeMetadata !== false).toString(),
      });

      const response = await this.fetchWithRetry(
        `${this.baseUrl}/nft/${tokenAddress}/${tokenId}?${params}`
      );

      // Cache for 15 minutes (metadata is relatively stable)
      CacheManager.set(cacheKey, response, 15 * 60 * 1000);
      
      return response;
    } catch (error) {
      console.error(`Failed to fetch NFT metadata from Moralis: ${tokenAddress}/${tokenId}`, error);
      return null;
    }
  }

  /**
   * Get NFT transfer history for a wallet
   */
  async getWalletNFTTransfers(
    walletAddress: string, 
    options: {
      chain?: string;
      format?: 'decimal' | 'hex';
      direction?: 'both' | 'to' | 'from';
      limit?: number;
      cursor?: string;
      fromBlock?: number;
      toBlock?: number;
    } = {}
  ): Promise<MoralisNFTTransfers> {
    const cacheKey = `moralis_wallet_transfers_${walletAddress}`;
    const cached = CacheManager.get<MoralisNFTTransfers>(cacheKey);
    
    if (cached) {
      console.log('📦 Using cached Moralis NFT transfers');
      return cached;
    }

    try {
      console.log(`🔍 Fetching NFT transfers via Moralis: ${walletAddress}`);
      
      const params = new URLSearchParams({
        chain: options.chain || 'eth',
        format: options.format || 'decimal',
        direction: options.direction || 'both',
        limit: (options.limit || 100).toString(),
      });

      if (options.cursor) params.append('cursor', options.cursor);
      if (options.fromBlock) params.append('from_block', options.fromBlock.toString());
      if (options.toBlock) params.append('to_block', options.toBlock.toString());

      const response = await this.fetchWithRetry(
        `${this.baseUrl}/${walletAddress}/nft/transfers?${params}`
      );

      // Cache for 3 minutes (transfers are more dynamic)
      CacheManager.set(cacheKey, response, 3 * 60 * 1000);
      
      return response;
    } catch (error) {
      console.error('Failed to fetch NFT transfers from Moralis:', error);
      return this.getMockNFTTransfers(walletAddress);
    }
  }

  /**
   * Get collection statistics
   */
  async getCollectionStats(
    tokenAddress: string, 
    options: {
      chain?: string;
    } = {}
  ): Promise<MoralisCollectionStats | null> {
    const cacheKey = `moralis_collection_stats_${tokenAddress}`;
    const cached = CacheManager.get<MoralisCollectionStats>(cacheKey);
    
    if (cached) {
      console.log('📦 Using cached Moralis collection stats');
      return cached;
    }

    try {
      console.log(`🔍 Fetching collection stats via Moralis: ${tokenAddress}`);
      
      const params = new URLSearchParams({
        chain: options.chain || 'eth',
      });

      const response = await this.fetchWithRetry(
        `${this.baseUrl}/nft/${tokenAddress}/stats?${params}`
      );

      // Cache for 10 minutes (stats are relatively stable)
      CacheManager.set(cacheKey, response, 10 * 60 * 1000);
      
      return response;
    } catch (error) {
      console.error(`Failed to fetch collection stats from Moralis: ${tokenAddress}`, error);
      return null;
    }
  }

  /**
   * Search NFTs by metadata
   */
  async searchNFTs(
    query: {
      q: string;
      chain?: string;
      format?: 'decimal' | 'hex';
      filter?: 'name' | 'description' | 'attributes';
      limit?: number;
      cursor?: string;
    }
  ): Promise<{ result: MoralisNFT[]; cursor: string | null }> {
    try {
      console.log(`🔍 Searching NFTs via Moralis: ${query.q}`);
      
      const params = new URLSearchParams({
        q: query.q,
        chain: query.chain || 'eth',
        format: query.format || 'decimal',
        filter: query.filter || 'name',
        limit: (query.limit || 20).toString(),
      });

      if (query.cursor) {
        params.append('cursor', query.cursor);
      }

      const response = await this.fetchWithRetry(
        `${this.baseUrl}/nft/search?${params}`
      );

      return {
        result: response.result || [],
        cursor: response.cursor || null,
      };
    } catch (error) {
      console.error('Failed to search NFTs via Moralis:', error);
      return { result: [], cursor: null };
    }
  }

  /**
   * Get NFT lowest price (floor price) from multiple marketplaces
   */
  async getNFTLowestPrice(
    tokenAddress: string,
    options: {
      chain?: string;
      marketplace?: string;
    } = {}
  ): Promise<MoralisNFTPrice | null> {
    const cacheKey = `moralis_nft_lowest_price_${tokenAddress}`;
    const cached = CacheManager.get<MoralisNFTPrice>(cacheKey);
    
    if (cached) {
      console.log('📦 Using cached Moralis NFT lowest price');
      return cached;
    }

    try {
      console.log(`🔍 Fetching lowest price via Moralis: ${tokenAddress}`);
      
      const params = new URLSearchParams({
        chain: options.chain || 'eth',
      });

      if (options.marketplace) {
        params.append('marketplace', options.marketplace);
      }

      const response = await this.fetchWithRetry(
        `${this.baseUrl}/nft/${tokenAddress}/lowestprice?${params}`
      );

      // Cache for 5 minutes (prices change frequently)
      CacheManager.set(cacheKey, response, 5 * 60 * 1000);
      
      return response;
    } catch (error) {
      console.error(`Failed to fetch lowest price from Moralis: ${tokenAddress}`, error);
      return null;
    }
  }

  /**
   * Get NFT owners for a contract
   */
  async getNFTOwners(
    tokenAddress: string, 
    options: {
      chain?: string;
      format?: 'decimal' | 'hex';
      limit?: number;
      cursor?: string;
      normalizeMetadata?: boolean;
    } = {}
  ): Promise<{ result: Array<{ token_address: string; token_id: string; owner_of: string; amount: string; }>; cursor: string | null }> {
    const cacheKey = `moralis_nft_owners_${tokenAddress}`;
    const cached = CacheManager.get<any>(cacheKey);
    
    if (cached) {
      console.log('📦 Using cached Moralis NFT owners');
      return cached;
    }

    try {
      console.log(`🔍 Fetching NFT owners via Moralis: ${tokenAddress}`);
      
      const params = new URLSearchParams({
        chain: options.chain || 'eth',
        format: options.format || 'decimal',
        limit: (options.limit || 100).toString(),
        normalize_metadata: (options.normalizeMetadata !== false).toString(),
      });

      if (options.cursor) {
        params.append('cursor', options.cursor);
      }

      const response = await this.fetchWithRetry(
        `${this.baseUrl}/nft/${tokenAddress}/owners?${params}`
      );

      const result = {
        result: response.result || [],
        cursor: response.cursor || null,
      };

      // Cache for 10 minutes (ownership is relatively stable)
      CacheManager.set(cacheKey, result, 10 * 60 * 1000);
      
      return result;
    } catch (error) {
      console.error(`Failed to fetch NFT owners from Moralis: ${tokenAddress}`, error);
      return { result: [], cursor: null };
    }
  }

  // Mock data methods for fallback scenarios
  private getMockWalletNFTs(walletAddress: string): { result: MoralisNFT[]; cursor: string | null; total: number } {
    console.log('🎭 Using mock Moralis wallet NFT data');
    return {
      result: [
        {
          token_address: '0x1234567890123456789012345678901234567890',
          token_id: '1',
          owner_of: walletAddress,
          token_hash: 'mock_hash',
          block_number: '18000000',
          block_number_minted: '17000000',
          token_uri: 'https://mock-api.com/metadata/1',
          metadata: {
            name: 'Mock NFT #1',
            description: 'A sophisticated mock NFT for demonstration',
            image: 'https://mock-api.com/images/1.png',
            attributes: [
              { trait_type: 'Rarity', value: 'Legendary' },
              { trait_type: 'Type', value: 'Digital Art' }
            ]
          },
          contract_type: 'ERC721',
          name: 'Mock Collection',
          symbol: 'MOCK',
          amount: '1',
          last_token_uri_sync: new Date().toISOString(),
          last_metadata_sync: new Date().toISOString(),
          minter_address: '0x0000000000000000000000000000000000000000',
          verified_collection: true,
          possible_spam: false,
        }
      ],
      cursor: null,
      total: 1
    };
  }

  private getMockNFTTransfers(walletAddress: string): MoralisNFTTransfers {
    console.log('🎭 Using mock Moralis NFT transfers data');
    return {
      total: 1,
      page: 0,
      page_size: 100,
      result: [
        {
          transaction_hash: '0x1234567890123456789012345678901234567890123456789012345678901234',
          transaction_index: '0',
          token_address: '0x1234567890123456789012345678901234567890',
          token_id: '1',
          from_address: '0x0000000000000000000000000000000000000000',
          to_address: walletAddress,
          value: '1',
          amount: '1',
          block_timestamp: new Date().toISOString(),
          block_number: '18000000',
          block_hash: '0x1234567890123456789012345678901234567890123456789012345678901234',
          log_index: 0,
          possible_spam: false,
          verified_collection: true,
        }
      ]
    };
  }
}

// Export singleton instance
export const moralisAPI = new MoralisAPIClient();