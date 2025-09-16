// CoinGecko API Integration for Cryptocurrency Market Data
import { CacheManager } from '../performance';

export interface CoinGeckoPrice {
  usd: number;
  usd_24h_change: number;
  usd_24h_vol: number;
  usd_market_cap: number;
  last_updated_at: number;
}

export interface CoinGeckoMarketData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d: number;
  price_change_percentage_30d: number;
  circulating_supply: number;
  total_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi?: {
    times: number;
    currency: string;
    percentage: number;
  };
  sparkline_in_7d?: {
    price: number[];
  };
}

export interface CoinGeckoGlobalData {
  total_market_cap: { [key: string]: number };
  total_volume: { [key: string]: number };
  market_cap_percentage: { [key: string]: number };
  market_cap_change_percentage_24h_usd: number;
  updated_at: number;
}

export interface CoinGeckoTrendingCollection {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
  floor_price_in_native_currency: number;
  floor_price_24h_percentage_change: number;
  market_cap_usd: number;
  volume_24h: number;
  average_price_24h: number;
  one_day_sales: number;
  one_day_average_sale_price: number;
}

class CoinGeckoAPIClient {
  private apiKey: string;
  private baseUrl: string;
  private rateLimitDelay: number = 1000; // 1 second between requests for free tier

  constructor() {
    this.apiKey = process.env.COINGECKO_API_KEY || '';
    
    // Check if it's a demo key (starts with CG-) or pro key
    const isDemoKey = this.apiKey.startsWith('CG-');
    this.baseUrl = isDemoKey || !this.apiKey
      ? 'https://api.coingecko.com/api/v3'
      : 'https://pro-api.coingecko.com/api/v3';
    
    if (!this.apiKey) {
      console.warn('⚠️ CoinGecko API key not configured - using free tier with rate limits');
      this.rateLimitDelay = 6000; // 10 requests per minute for free tier
    } else if (isDemoKey) {
      console.log('🔑 Using CoinGecko Demo API key');
      this.rateLimitDelay = 1000; // Demo keys have better rate limits than free
    }
  }

  private async enforceRateLimit() {
    await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
  }

  private async fetchWithRetry(url: string, retries = 3): Promise<any> {
    await this.enforceRateLimit();

    const headers: any = {
      'Accept': 'application/json',
    };

    if (this.apiKey) {
      const isDemoKey = this.apiKey.startsWith('CG-');
      headers[isDemoKey ? 'x-cg-demo-api-key' : 'x-cg-pro-api-key'] = this.apiKey;
    }

    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, { headers });

        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
          console.log(`⏳ CoinGecko rate limited, waiting ${retryAfter} seconds...`);
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          continue;
        }

        if (!response.ok) {
          throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        console.error(`CoinGecko API attempt ${i + 1} failed:`, error);
        
        if (i === retries - 1) {
          throw error;
        }
        
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }

  async getSimplePrice(ids: string[], vsCurrencies: string[] = ['usd']): Promise<{[key: string]: CoinGeckoPrice}> {
    const cacheKey = `coingecko_price_${ids.join(',')}_${vsCurrencies.join(',')}`;
    const cached = CacheManager.get<{[key: string]: CoinGeckoPrice}>(cacheKey);
    
    if (cached) {
      console.log('📦 Using cached CoinGecko price data');
      return cached;
    }

    try {
      console.log(`💰 Fetching prices for: ${ids.join(', ')}`);
      
      const params = new URLSearchParams({
        ids: ids.join(','),
        vs_currencies: vsCurrencies.join(','),
        include_24hr_change: 'true',
        include_24hr_vol: 'true',
        include_market_cap: 'true',
        include_last_updated_at: 'true',
      });

      const response = await this.fetchWithRetry(
        `${this.baseUrl}/simple/price?${params}`
      );

      // Cache for 1 minute (prices change frequently)
      CacheManager.set(cacheKey, response, 60 * 1000);
      
      return response;
    } catch (error) {
      console.error('Failed to fetch prices from CoinGecko:', error);
      return this.getMockPrices(ids);
    }
  }

  async getMarketData(
    vsCurrency: string = 'usd',
    options: {
      order?: string;
      perPage?: number;
      page?: number;
      sparkline?: boolean;
      priceChangePercentage?: string;
      category?: string;
    } = {}
  ): Promise<CoinGeckoMarketData[]> {
    const cacheKey = `coingecko_market_${vsCurrency}_${JSON.stringify(options)}`;
    const cached = CacheManager.get<CoinGeckoMarketData[]>(cacheKey);
    
    if (cached) {
      console.log('📦 Using cached market data');
      return cached;
    }

    try {
      console.log('📊 Fetching market data from CoinGecko');
      
      const params = new URLSearchParams({
        vs_currency: vsCurrency,
        order: options.order || 'market_cap_desc',
        per_page: (options.perPage || 100).toString(),
        page: (options.page || 1).toString(),
        sparkline: (options.sparkline || false).toString(),
      });

      if (options.priceChangePercentage) {
        params.append('price_change_percentage', options.priceChangePercentage);
      }
      if (options.category) {
        params.append('category', options.category);
      }

      const response = await this.fetchWithRetry(
        `${this.baseUrl}/coins/markets?${params}`
      );

      // Cache for 5 minutes
      CacheManager.set(cacheKey, response, 5 * 60 * 1000);
      
      return response;
    } catch (error) {
      console.error('Failed to fetch market data:', error);
      return [];
    }
  }

  async getGlobalData(): Promise<CoinGeckoGlobalData | null> {
    const cacheKey = 'coingecko_global';
    const cached = CacheManager.get<CoinGeckoGlobalData>(cacheKey);
    
    if (cached) {
      console.log('📦 Using cached global market data');
      return cached;
    }

    try {
      console.log('🌍 Fetching global market data');
      
      const response = await this.fetchWithRetry(
        `${this.baseUrl}/global`
      );

      const globalData = response.data;
      
      // Cache for 10 minutes
      CacheManager.set(cacheKey, globalData, 10 * 60 * 1000);
      
      return globalData;
    } catch (error) {
      console.error('Failed to fetch global data:', error);
      return null;
    }
  }

  async getTrendingNFTs(): Promise<CoinGeckoTrendingCollection[]> {
    const cacheKey = 'coingecko_trending_nfts';
    const cached = CacheManager.get<CoinGeckoTrendingCollection[]>(cacheKey);
    
    if (cached) {
      console.log('📦 Using cached trending NFT data');
      return cached;
    }

    try {
      console.log('🔥 Fetching trending NFT collections');
      
      const response = await this.fetchWithRetry(
        `${this.baseUrl}/nfts/list?order=h24_volume_native_desc&per_page=20&page=1`
      );

      // Cache for 30 minutes
      CacheManager.set(cacheKey, response, 30 * 60 * 1000);
      
      return response;
    } catch (error) {
      console.error('Failed to fetch trending NFTs:', error);
      return this.getMockTrendingNFTs();
    }
  }

  async getHistoricalPrice(
    id: string,
    days: number = 30,
    interval: 'daily' | 'hourly' = 'daily'
  ): Promise<{prices: Array<[number, number]>; market_caps: Array<[number, number]>; volumes: Array<[number, number]>}> {
    const cacheKey = `coingecko_history_${id}_${days}_${interval}`;
    const cached = CacheManager.get<any>(cacheKey);
    
    if (cached) {
      console.log(`📦 Using cached historical data for ${id}`);
      return cached;
    }

    try {
      console.log(`📈 Fetching ${days} days of history for ${id}`);
      
      const params = new URLSearchParams({
        vs_currency: 'usd',
        days: days.toString(),
        interval: interval,
      });

      const response = await this.fetchWithRetry(
        `${this.baseUrl}/coins/${id}/market_chart?${params}`
      );

      // Cache for 1 hour
      CacheManager.set(cacheKey, response, 60 * 60 * 1000);
      
      return response;
    } catch (error) {
      console.error(`Failed to fetch historical data for ${id}:`, error);
      return {
        prices: [],
        market_caps: [],
        volumes: [],
      };
    }
  }

  async getExchangeRates(): Promise<{[key: string]: {value: number}}> {
    const cacheKey = 'coingecko_exchange_rates';
    const cached = CacheManager.get<any>(cacheKey);
    
    if (cached) {
      console.log('📦 Using cached exchange rates');
      return cached;
    }

    try {
      console.log('💱 Fetching exchange rates');
      
      const response = await this.fetchWithRetry(
        `${this.baseUrl}/exchange_rates`
      );

      const rates = response.rates;
      
      // Cache for 5 minutes
      CacheManager.set(cacheKey, rates, 5 * 60 * 1000);
      
      return rates;
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      return {};
    }
  }

  // Mock data generators
  private getMockPrices(ids: string[]): {[key: string]: CoinGeckoPrice} {
    console.log('🎭 Using mock CoinGecko price data');
    
    const mockPrices: {[key: string]: CoinGeckoPrice} = {};
    
    ids.forEach(id => {
      mockPrices[id] = {
        usd: Math.random() * 50000 + 1000,
        usd_24h_change: (Math.random() - 0.5) * 20,
        usd_24h_vol: Math.random() * 1000000000,
        usd_market_cap: Math.random() * 100000000000,
        last_updated_at: Date.now() / 1000,
      };
    });
    
    return mockPrices;
  }

  private getMockTrendingNFTs(): CoinGeckoTrendingCollection[] {
    console.log('🎭 Using mock trending NFT data');
    
    return [
      {
        id: 'bored-ape-yacht-club',
        name: 'Bored Ape Yacht Club',
        symbol: 'BAYC',
        thumb: 'https://via.placeholder.com/100x100?text=BAYC',
        floor_price_in_native_currency: 35.5,
        floor_price_24h_percentage_change: 2.5,
        market_cap_usd: 700000000,
        volume_24h: 5000000,
        average_price_24h: 38.2,
        one_day_sales: 125,
        one_day_average_sale_price: 40.1,
      },
      {
        id: 'cryptopunks',
        name: 'CryptoPunks',
        symbol: 'PUNKS',
        thumb: 'https://via.placeholder.com/100x100?text=PUNKS',
        floor_price_in_native_currency: 45.8,
        floor_price_24h_percentage_change: -1.2,
        market_cap_usd: 900000000,
        volume_24h: 3500000,
        average_price_24h: 48.5,
        one_day_sales: 73,
        one_day_average_sale_price: 47.9,
      },
      {
        id: 'azuki',
        name: 'Azuki',
        symbol: 'AZUKI',
        thumb: 'https://via.placeholder.com/100x100?text=AZUKI',
        floor_price_in_native_currency: 12.3,
        floor_price_24h_percentage_change: 5.8,
        market_cap_usd: 250000000,
        volume_24h: 1800000,
        average_price_24h: 13.1,
        one_day_sales: 142,
        one_day_average_sale_price: 12.7,
      },
    ];
  }
}

// Export singleton instance
export const coinGeckoAPI = new CoinGeckoAPIClient();