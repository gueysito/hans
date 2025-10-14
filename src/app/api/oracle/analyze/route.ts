import { NextRequest, NextResponse } from "next/server";
import { unifiedNFTService } from "@/src/lib/api/unified-nft-service";
import { analyzeCulturalSignificance } from "@/src/lib/api/caesar";
import { generateEnhancedAnalysis } from "@/src/lib/ai/enhanced-claude-prompts";

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, analysisDepth = "standard" } = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address required" },
        { status: 400 }
      );
    }

    // Step 1: Fetch NFT data using unified service (OpenSea + Alchemy + CoinGecko)
    console.log("Performing unified NFT analysis for:", walletAddress);
    const walletAnalysis = await unifiedNFTService.analyzeWallet(walletAddress);
    
    if (!walletAnalysis.nfts || walletAnalysis.nfts.length === 0) {
      return NextResponse.json({
        success: true,
        nftData: {
          totalCount: 0,
          nfts: [],
          topCollections: [],
          portfolioValue: 0,
          portfolioValueUSD: 0,
        },
        insights: [{
          type: "major",
          title: "Portfolio Analysis - No Assets Detected",
          mysticalInsight: "No digital assets detected in this wallet address. This represents a clean slate for strategic portfolio construction, with unlimited potential for sophisticated curation across various NFT market segments and cultural movements.",
          confidence: 1.0,
          cosmicAlignment: "Ready for strategic asset allocation and cultural positioning"
        }],
        marketContext: {
          ethPrice: walletAnalysis.ethPrice,
          globalMarketCap: walletAnalysis.globalMarketCap,
          globalVolume24h: walletAnalysis.globalVolume24h,
        }
      });
    }
    
    // Transform unified data to legacy format for compatibility
    const nftData = {
      totalCount: walletAnalysis.totalNFTs,
      nfts: walletAnalysis.nfts.map(nft => ({
        name: nft.name,
        description: nft.description,
        imageUrl: nft.imageUrl,
        collection: nft.collectionName,
        traits: nft.traits,
        rarityScore: nft.rarityScore,
        lastSalePrice: nft.lastSalePriceUSD,
      })),
      topCollections: walletAnalysis.topCollectionsByValue.map(c => c.name),
      collections: Array.from(walletAnalysis.collections.values()).map(h => ({
        name: h.collection.name,
        floorPrice: h.collection.floorPriceUSD,
        holdings: h.holdings,
        value: h.valueUSD,
        oneDayChange: h.collection.oneDayChange,
        sevenDayChange: h.collection.sevenDayChange,
      })),
    };

    // Step 2: Analyze with Caesar LLM
    console.log(`Analyzing cultural significance with Caesar (${analysisDepth} depth)`);
    const caesarAnalysis = await analyzeCulturalSignificance({
      collections: nftData.topCollections,
      nftCount: nftData.totalCount,
      descriptions: nftData.nfts.map(n => n.description).filter(Boolean),
      traits: [], // Would extract from metadata
    }, analysisDepth as "quick" | "standard" | "deep");

    // Step 3: Generate enhanced analysis with sophisticated prompts
    console.log(`Generating enhanced analysis with sophisticated Claude prompts (${analysisDepth} depth)`);
    const mysticalInsights = await generateEnhancedAnalysis(caesarAnalysis, nftData, analysisDepth as "quick" | "standard" | "deep");

    return NextResponse.json({
      success: true,
      nftData: {
        totalCount: nftData.totalCount,
        topCollections: nftData.topCollections,
        collections: nftData.collections,
        portfolioValue: walletAnalysis.portfolioValue,
        portfolioValueUSD: walletAnalysis.portfolioValueUSD,
      },
      caesarAnalysis,
      insights: mysticalInsights,
      analytics: {
        diversificationScore: walletAnalysis.diversificationScore,
        volatilityScore: walletAnalysis.volatilityScore,
        liquidityScore: walletAnalysis.liquidityScore,
        topCollectionsByValue: walletAnalysis.topCollectionsByValue,
        topCollectionsByCount: walletAnalysis.topCollectionsByCount,
      },
      marketContext: {
        ethPrice: walletAnalysis.ethPrice,
        gasPrice: walletAnalysis.gasPrice,
        globalMarketCap: walletAnalysis.globalMarketCap,
        globalVolume24h: walletAnalysis.globalVolume24h,
      },
    });
  } catch (error) {
    console.error("Oracle analysis error:", error);
    return NextResponse.json(
      { 
        error: "Failed to complete oracle reading",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}