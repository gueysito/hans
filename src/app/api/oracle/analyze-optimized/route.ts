import { NextRequest, NextResponse } from "next/server";
import { unifiedNFTService } from "@/src/lib/api/unified-nft-service";
import { analyzeCulturalSignificance } from "@/src/lib/api/caesar";
import { generateEnhancedAnalysis, buildEnhancedMysticalContext } from "@/src/lib/ai/enhanced-claude-prompts";
import { CacheManager } from "@/src/lib/performance";
// Using local generateUUID function

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, analysisDepth = "standard" } = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address required" },
        { status: 400 }
      );
    }

    // Perform optimized analysis with simplified monitoring
    console.log(`⚡ Starting optimized analysis for: ${walletAddress}`);
    const startTime = Date.now();
    
    const result = await performOptimizedAnalysis(walletAddress, analysisDepth as "quick" | "standard" | "deep");
    
    const totalTime = Date.now() - startTime;
    console.log(`✅ Optimized analysis completed in ${totalTime}ms`);

    return NextResponse.json({
      ...result,
      performance: {
        totalTime,
        optimized: true
      }
    });

  } catch (error) {
    console.error("Optimized oracle analysis error:", error);
    return NextResponse.json(
      { 
        error: "Failed to complete optimized oracle reading",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

async function performOptimizedAnalysis(
  walletAddress: string, 
  analysisDepth: "quick" | "standard" | "deep"
) {
  console.log(`🔮 Building enhanced analysis context...`);
  
  // Step 1: Fetch wallet data
  const stepStartTime = Date.now();
  const walletAnalysis = await unifiedNFTService.analyzeWallet(walletAddress);
  console.log(`✅ Wallet analysis completed in ${Date.now() - stepStartTime}ms`);
  
  // Handle empty wallet case
  if (!walletAnalysis.nfts || walletAnalysis.nfts.length === 0) {
    return {
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
        title: "The Empty Portfolio",
        analyticalInsight: "Your wallet represents untapped potential in the digital asset space. This blank canvas awaits strategic curation and cultural positioning...",
        confidence: 1.0,
        patternRecognition: "No current holdings detected"
      }],
      marketContext: {
        ethPrice: walletAnalysis.ethPrice,
        globalMarketCap: walletAnalysis.globalMarketCap,
        globalVolume24h: walletAnalysis.globalVolume24h,
      }
    };
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
    portfolioValueUSD: walletAnalysis.portfolioValueUSD
  };

  // Step 2: Caesar cultural significance analysis
  const stepStartTime2 = Date.now();
  let caesarAnalysis = null;
  
  try {
    caesarAnalysis = await analyzeCulturalSignificance({
      collections: nftData.topCollections,
      nftCount: nftData.totalCount,
      descriptions: nftData.nfts.map(n => n.description).filter(Boolean),
      traits: [],
    }, analysisDepth);
    console.log(`✅ Caesar analysis completed in ${Date.now() - stepStartTime2}ms`);
  } catch (error) {
    console.error('Caesar analysis failed:', error);
  }

  // Step 3: Build enhanced analysis context
  const contextStartTime = Date.now();
  const analysisContext = await buildEnhancedMysticalContext(
    walletAddress,
    nftData,
    caesarAnalysis
  );
  console.log(`✅ Analysis context built in ${Date.now() - contextStartTime}ms`);

  // Step 4: Generate analytical insights
  const insightsStartTime = Date.now();
  const analyticalInsights = await generateEnhancedAnalysis(
    caesarAnalysis,
    nftData,
    analysisDepth
  );
  console.log(`✅ Analytical insights generated in ${Date.now() - insightsStartTime}ms`);

  // Step 5: Cache results  
  const cacheKey = `optimized_analysis_${walletAddress}_${analysisDepth}`;
  const cacheData = {
    nftData,
    caesarAnalysis,
    analysisContext,
    analyticalInsights,
    timestamp: Date.now()
  };
  const cacheTTL = analysisDepth === 'quick' ? 300000 : analysisDepth === 'standard' ? 600000 : 900000; // ms
  CacheManager.set(cacheKey, cacheData, cacheTTL);

  return {
    success: true,
    nftData: {
      totalCount: nftData.totalCount,
      topCollections: nftData.topCollections,
      collections: nftData.collections,
      portfolioValue: walletAnalysis.portfolioValue,
      portfolioValueUSD: walletAnalysis.portfolioValueUSD,
    },
    caesarAnalysis,
    insights: analyticalInsights,
    analytics: {
      diversificationScore: walletAnalysis.diversificationScore,
      volatilityScore: walletAnalysis.volatilityScore,
      liquidityScore: walletAnalysis.liquidityScore,
      topCollectionsByValue: walletAnalysis.topCollectionsByValue,
      topCollectionsByCount: walletAnalysis.topCollectionsByCount,
      // Enhanced analytics from context
      behavioralArchetype: analysisContext.behavioralArchetype,
      strategicProfile: analysisContext.spiritualJourney,
      marketPositioning: analysisContext.cosmicSignificance,
      processingMetrics: {
        contextBuildTime: Date.now() - contextStartTime,
        dataSourcesUsed: [
          analysisContext.transactionBehavior ? 'transaction' : null,
          analysisContext.temporalAnalysis ? 'temporal' : null,
          analysisContext.marketTiming ? 'market' : null,
          analysisContext.crossCollectionData ? 'cross-collection' : null
        ].filter(Boolean).length
      }
    },
    marketContext: {
      ethPrice: walletAnalysis.ethPrice,
      gasPrice: walletAnalysis.gasPrice,
      globalMarketCap: walletAnalysis.globalMarketCap,
      globalVolume24h: walletAnalysis.globalVolume24h,
    }
  };
}

