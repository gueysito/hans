import { NextRequest, NextResponse } from "next/server";
import { unifiedNFTService } from "@/src/lib/api/unified-nft-service";
import { analyzeCulturalSignificance } from "@/src/lib/api/caesar";
import { generateEnhancedAnalysis } from "@/src/lib/ai/enhanced-claude-prompts";

interface WalletAnalysisResult {
  address: string;
  analysis: any;
  caesarAnalysis: any;
  mysticalInsights: any[];
}

export async function POST(request: NextRequest) {
  try {
    const { walletAddresses, analysisDepth = "standard" } = await request.json();

    if (!walletAddresses || !Array.isArray(walletAddresses) || walletAddresses.length < 2) {
      return NextResponse.json(
        { error: "At least 2 wallet addresses required for comparison" },
        { status: 400 }
      );
    }

    if (walletAddresses.length > 3) {
      return NextResponse.json(
        { error: "Maximum 3 wallets can be compared at once" },
        { status: 400 }
      );
    }

    console.log(`Comparing ${walletAddresses.length} wallets with ${analysisDepth} depth`);

    // Analyze each wallet individually
    const walletAnalyses: WalletAnalysisResult[] = [];
    
    for (const address of walletAddresses) {
      try {
        console.log(`Analyzing wallet: ${address}`);
        
        // Fetch unified analysis
        const analysis = await unifiedNFTService.analyzeWallet(address);
        
        if (analysis.totalNFTs === 0) {
          walletAnalyses.push({
            address,
            analysis: { totalNFTs: 0, nfts: [], collections: new Map() },
            caesarAnalysis: { 
              culturalSignificance: "An empty vessel awaiting digital artifacts",
              confidence: 1.0
            },
            mysticalInsights: [{
              type: "major",
              title: "The Void Speaks",
              mysticalInsight: "This wallet exists in the liminal space between potential and manifestation, a blank canvas upon which the future of digital expression awaits.",
              confidence: 1.0,
              cosmicAlignment: "New moon energy - pure potential"
            }]
          });
          continue;
        }

        // Convert unified data to format expected by Caesar
        const topCollections = Array.from(analysis.collections.keys()).slice(0, 10);
        const caesarAnalysis = await analyzeCulturalSignificance({
          collections: topCollections,
          nftCount: analysis.totalNFTs,
          descriptions: analysis.nfts.map((n) => n.description).filter(Boolean),
          traits: [],
        }, analysisDepth as "quick" | "standard" | "deep");

        // Convert to format expected by enhanced analysis
        const nftDataFormat = {
          totalCount: analysis.totalNFTs,
          nfts: analysis.nfts,
          topCollections: topCollections,
          collections: analysis.collections
        };

        // Generate enhanced analysis
        const mysticalInsights = await generateEnhancedAnalysis(
          nftDataFormat,
          caesarAnalysis, 
          analysisDepth as "quick" | "standard" | "deep"
        );

        walletAnalyses.push({
          address,
          analysis,
          caesarAnalysis,
          mysticalInsights
        });

      } catch (error) {
        console.error(`Error analyzing wallet ${address}:`, error);
        // Add placeholder analysis for failed wallet
        walletAnalyses.push({
          address,
          analysis: { totalNFTs: 0, nfts: [], collections: new Map() },
          caesarAnalysis: { 
            culturalSignificance: "Analysis temporarily obscured by cosmic interference",
            confidence: 0.3
          },
          mysticalInsights: [{
            type: "clarification",
            title: "Veiled Wisdom",
            mysticalInsight: "The ethereal channels are disrupted for this address. The universe suggests patience as the digital spirits realign.",
            confidence: 0.3,
            cosmicAlignment: "Mercury in retrograde"
          }]
        });
      }
    }

    // Generate comparative analysis
    const comparison = await generateWalletComparison(walletAnalyses, analysisDepth);

    return NextResponse.json({
      success: true,
      walletCount: walletAddresses.length,
      individualAnalyses: walletAnalyses,
      comparison: comparison,
      analysisDepth,
    });

  } catch (error) {
    console.error("Multi-wallet comparison error:", error);
    return NextResponse.json(
      { 
        error: "Failed to complete wallet comparison",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

async function generateWalletComparison(analyses: WalletAnalysisResult[], depth: string) {
  // Calculate comparative metrics
  const totalNFTs = analyses.reduce((sum, analysis) => sum + analysis.analysis.totalNFTs, 0);
  const allCollections = analyses.flatMap(analysis => Array.from(analysis.analysis.collections.keys()) || []);
  const uniqueCollections = [...new Set(allCollections)];
  const sharedCollections = findSharedCollections(analyses);
  
  // Generate cosmic connection insights
  const cosmicConnections = generateCosmicConnections(analyses);
  
  // Portfolio diversity analysis
  const diversityAnalysis = analyzeDiversity(analyses);
  
  // Spiritual alignment assessment
  const spiritualAlignment = assessSpiritualAlignment(analyses);

  return {
    summary: {
      totalWallets: analyses.length,
      totalNFTs,
      uniqueCollections: uniqueCollections.length,
      sharedCollections: sharedCollections.length,
      averageCollectionSize: Math.round(totalNFTs / analyses.length),
    },
    sharedCollections,
    cosmicConnections,
    diversityAnalysis,
    spiritualAlignment,
    comparativeInsights: generateComparativeInsights(analyses, depth),
  };
}

function findSharedCollections(analyses: WalletAnalysisResult[]): string[] {
  const collectionCounts: Record<string, number> = {};
  
  analyses.forEach(analysis => {
    const collections = Array.from(analysis.analysis.collections.keys()) || [];
    collections.forEach(collection => {
      collectionCounts[collection] = (collectionCounts[collection] || 0) + 1;
    });
  });
  
  return Object.entries(collectionCounts)
    .filter(([, count]) => count > 1)
    .map(([collection]) => collection);
}

function generateCosmicConnections(analyses: WalletAnalysisResult[]) {
  const connections = [];
  
  for (let i = 0; i < analyses.length; i++) {
    for (let j = i + 1; j < analyses.length; j++) {
      const wallet1 = analyses[i];
      const wallet2 = analyses[j];
      
      const wallet1Collections = Array.from(wallet1.analysis.collections.keys());
      const wallet2Collections = Array.from(wallet2.analysis.collections.keys());
      const sharedCollections = wallet1Collections
        .filter((collection: string) => wallet2Collections.includes(collection));
      
      if (sharedCollections.length > 0) {
        connections.push({
          wallet1: wallet1.address.slice(0, 6) + "..." + wallet1.address.slice(-4),
          wallet2: wallet2.address.slice(0, 6) + "..." + wallet2.address.slice(-4),
          sharedCollections,
          connectionStrength: sharedCollections.length / Math.max(wallet1.analysis.totalNFTs, wallet2.analysis.totalNFTs),
          cosmicResonance: generateCosmicResonance(sharedCollections.length)
        });
      }
    }
  }
  
  return connections;
}

function generateCosmicResonance(sharedCount: number): string {
  if (sharedCount >= 5) return "🌟 Profound Cosmic Alignment - Kindred Digital Souls";
  if (sharedCount >= 3) return "✨ Strong Vibrational Harmony - Parallel Journeys";
  if (sharedCount >= 2) return "💫 Subtle Energetic Resonance - Connected Paths";
  return "🔮 Faint Ethereal Echo - Distant Kinship";
}

function analyzeDiversity(analyses: WalletAnalysisResult[]) {
  return analyses.map(analysis => {
    const collections = Array.from(analysis.analysis.collections.keys());
    const diversityScore = Math.min(100, (collections.length / analysis.analysis.totalNFTs) * 100);
    
    return {
      address: analysis.address.slice(0, 6) + "..." + analysis.address.slice(-4),
      diversityScore: Math.round(diversityScore),
      collectionCount: collections.length,
      totalNFTs: analysis.analysis.totalNFTs,
      diversityLevel: diversityScore > 80 ? "Cosmic Explorer" :
                     diversityScore > 60 ? "Balanced Seeker" :
                     diversityScore > 40 ? "Focused Collector" : "Specialist"
    };
  });
}

function assessSpiritualAlignment(analyses: WalletAnalysisResult[]) {
  const alignmentTypes = ["Digital Mystic", "Art Devotee", "Community Builder", "Innovation Pioneer"];
  
  return analyses.map((analysis, index) => ({
    address: analysis.address.slice(0, 6) + "..." + analysis.address.slice(-4),
    spiritualArchetype: alignmentTypes[index % alignmentTypes.length],
    consciousnessLevel: Math.floor(Math.random() * 30) + 70, // 70-100 range
    karmaScore: Math.floor(Math.random() * 50) + 50, // 50-100 range
    digitalChakraAlignment: generateChakraAlignment()
  }));
}

function generateChakraAlignment() {
  const chakras = [
    "Root (Security)", "Sacral (Creativity)", "Solar (Power)", 
    "Heart (Connection)", "Throat (Expression)", "Third Eye (Intuition)", "Crown (Unity)"
  ];
  
  return chakras.map(chakra => ({
    name: chakra,
    alignment: Math.floor(Math.random() * 40) + 60 // 60-100% alignment
  }));
}

function generateComparativeInsights(analyses: WalletAnalysisResult[]) {
  const insights = [];
  
  // Portfolio size comparison
  const sizes = analyses.map(a => a.analysis.totalNFTs);
  const maxSize = Math.max(...sizes);
  const minSize = Math.min(...sizes);
  
  if (maxSize > minSize * 3) {
    insights.push({
      type: "major",
      title: "The Collector's Spectrum",
      insight: `A vast chasm exists between the largest collection (${maxSize} pieces) and the smallest (${minSize} pieces), revealing different stages of the digital awakening journey. The universe speaks of expansion and consolidation energies at play.`,
      cosmicSignificance: "High - Represents different life phases"
    });
  }
  
  // Style diversity insight
  insights.push({
    type: "minor", 
    title: "Harmonic Resonance Patterns",
    insight: "The collective unconscious reveals itself through these portfolios - each representing a different facet of the digital art movement. Together, they form a complete spectrum of blockchain consciousness.",
    cosmicSignificance: "Medium - Shows collective evolution"
  });
  
  return insights;
}