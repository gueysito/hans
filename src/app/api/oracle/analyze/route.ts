import { NextRequest, NextResponse } from "next/server";
import { fetchWalletNFTs } from "@/src/lib/api/opensea";
import { analyzeCulturalSignificance } from "@/src/lib/api/caesar";
import { transformToMystical } from "@/src/lib/api/claude";

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, sessionId, analysisDepth = "standard" } = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address required" },
        { status: 400 }
      );
    }

    // Step 1: Fetch NFT data from OpenSea
    console.log("Fetching NFTs from OpenSea for:", walletAddress);
    const nftData = await fetchWalletNFTs(walletAddress);
    
    if (!nftData.nfts || nftData.nfts.length === 0) {
      return NextResponse.json({
        success: true,
        nftData: {
          totalCount: 0,
          nfts: [],
          topCollections: [],
        },
        insights: [{
          type: "major",
          title: "The Empty Vessel",
          mysticalInsight: "Your wallet stands as an empty vessel, awaiting the digital artifacts that will define your journey through the blockchain cosmos. The void itself speaks of infinite potential...",
          confidence: 1.0,
          cosmicAlignment: "New moon in the digital realm"
        }],
      });
    }

    // Step 2: Analyze with Caesar LLM
    console.log(`Analyzing cultural significance with Caesar (${analysisDepth} depth)`);
    const caesarAnalysis = await analyzeCulturalSignificance({
      collections: nftData.topCollections,
      nftCount: nftData.totalCount,
      descriptions: nftData.nfts.map(n => n.description).filter(Boolean),
      traits: [], // Would extract from metadata
    }, analysisDepth as "quick" | "standard" | "deep");

    // Step 3: Transform with Claude for mystical insights
    console.log(`Transforming to mystical insights with Claude (${analysisDepth} depth)`);
    const mysticalInsights = await transformToMystical(caesarAnalysis, nftData, analysisDepth as "quick" | "standard" | "deep");

    return NextResponse.json({
      success: true,
      nftData: {
        totalCount: nftData.totalCount,
        topCollections: nftData.topCollections,
        collections: nftData.collections,
      },
      caesarAnalysis,
      insights: mysticalInsights,
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