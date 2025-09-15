// OpenSea API v2 Integration
const OPENSEA_API_BASE = "https://api.opensea.io/api/v2";

interface OpenSeaNFT {
  identifier: string;
  collection: string;
  contract: string;
  token_standard: string;
  name: string | null;
  description: string | null;
  image_url: string | null;
  metadata_url: string | null;
  opensea_url: string;
  updated_at: string;
  is_disabled: boolean;
  is_nsfw: boolean;
}

interface OpenSeaCollection {
  collection: string;
  name: string;
  description: string;
  image_url: string;
  owner: string;
  safelist_status: string;
  category: string;
  contracts: Array<{
    address: string;
    chain: string;
  }>;
}

export async function fetchWalletNFTs(walletAddress: string) {
  const apiKey = process.env.OPENSEA_API_KEY;
  
  if (!apiKey) {
    throw new Error("OpenSea API key not configured");
  }

  try {
    // Fetch NFTs owned by wallet address
    const response = await fetch(
      `${OPENSEA_API_BASE}/chain/ethereum/account/${walletAddress}/nfts?limit=50`,
      {
        headers: {
          "X-API-KEY": apiKey,
          "Accept": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("OpenSea API error:", response.status, response.statusText);
      throw new Error(`OpenSea API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Filter out spam/airdrop NFTs
    const filteredNFTs = data.nfts.filter((nft: OpenSeaNFT) => {
      // Filter criteria:
      // - Not disabled
      // - Not NSFW
      // - Has a valid collection
      return !nft.is_disabled && !nft.is_nsfw && nft.collection;
    });

    // Transform to our format
    const transformedNFTs = filteredNFTs.map((nft: OpenSeaNFT) => ({
      contractAddress: nft.contract,
      tokenId: nft.identifier,
      name: nft.name || `Token #${nft.identifier}`,
      description: nft.description,
      imageUrl: nft.image_url,
      collectionName: nft.collection,
      openseaUrl: nft.opensea_url,
      lastUpdate: nft.updated_at,
    }));

    // Get unique collections for analysis
    const collections = [...new Set(filteredNFTs.map((nft: OpenSeaNFT) => nft.collection))];
    
    // Fetch collection details for floor prices
    const collectionDetails = await Promise.all(
      collections.slice(0, 10).map(async (slug) => {
        try {
          const collResponse = await fetch(
            `${OPENSEA_API_BASE}/collections/${slug}`,
            {
              headers: {
                "X-API-KEY": apiKey,
                "Accept": "application/json",
              },
            }
          );
          
          if (collResponse.ok) {
            return await collResponse.json();
          }
        } catch (err) {
          console.error(`Error fetching collection ${slug}:`, err);
        }
        return null;
      })
    );

    return {
      nfts: transformedNFTs,
      collections: collectionDetails.filter(Boolean),
      totalCount: transformedNFTs.length,
      topCollections: collections.slice(0, 5),
    };
  } catch (error) {
    console.error("Error fetching NFTs from OpenSea:", error);
    throw error;
  }
}

export async function getCollectionStats(collectionSlug: string) {
  const apiKey = process.env.OPENSEA_API_KEY;
  
  if (!apiKey) {
    throw new Error("OpenSea API key not configured");
  }

  try {
    const response = await fetch(
      `${OPENSEA_API_BASE}/collections/${collectionSlug}/stats`,
      {
        headers: {
          "X-API-KEY": apiKey,
          "Accept": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`OpenSea API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      floorPrice: data.total?.floor_price || 0,
      totalVolume: data.total?.volume || 0,
      numOwners: data.total?.num_owners || 0,
      marketCap: data.total?.market_cap || 0,
    };
  } catch (error) {
    console.error("Error fetching collection stats:", error);
    return null;
  }
}