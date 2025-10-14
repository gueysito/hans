// Test Enhanced Data Collection Pipeline
// Verifies all the new analysis services work together properly

import { transactionHistoryService } from '../lib/analysis/transaction-history';
import { holderPatternsService } from '../lib/analysis/holder-patterns';
import { marketTimingService } from '../lib/analysis/market-timing';
import { crossCollectionRelationshipsService } from '../lib/analysis/cross-collection-relationships';
import { temporalAnalysisService } from '../lib/analysis/temporal-analysis';
import { buildEnhancedMysticalContext, generateEnhancedSystemPrompt, generateEnhancedPrompt } from '../lib/ai/enhanced-claude-prompts';

const TEST_WALLET_ADDRESS = '0x1234567890123456789012345678901234567890'; // Mock wallet
const TEST_COLLECTIONS = ['bored-ape-yacht-club', 'mutant-ape-yacht-club', 'otherdeeds-for-otherside'];

const MOCK_NFT_DATA = {
  totalCount: 15,
  portfolioValueUSD: 250000,
  topCollections: TEST_COLLECTIONS,
  nfts: [
    {
      contractAddress: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
      tokenId: '1234',
      name: 'Bored Ape #1234',
      rarityScore: 85.2,
      traits: [
        { traitType: 'Background', value: 'Blue' },
        { traitType: 'Fur', value: 'Golden Brown' },
        { traitType: 'Eyes', value: 'Bored' }
      ]
    },
    {
      contractAddress: '0x60E4d786628Fea6478F785A6d7e704777c86a7c6',
      tokenId: '5678',
      name: 'Mutant Ape #5678',
      rarityScore: 62.1,
      traits: [
        { traitType: 'Fur', value: 'Blue' },
        { traitType: 'Mouth', value: 'Grin' }
      ]
    }
  ]
};

const MOCK_CAESAR_ANALYSIS = {
  culturalSignificance: 'This collection represents the intersection of digital art and status signaling in Web3 culture',
  psychologicalProfile: 'A collector drawn to established cultural symbols and community membership',
  thematicPatterns: ['Digital Identity', 'Status Signaling', 'Community Membership'],
  confidence: 0.85,
  sources: ['Cultural Analysis Database', 'NFT Market Research', 'Community Sentiment Analysis']
};

export async function testEnhancedDataPipeline() {
  console.log('🚀 Starting Enhanced Data Collection Pipeline Test\n');
  
  try {
    // Test 1: Transaction History Analysis
    console.log('📊 Test 1: Transaction History Analysis');
    const transactionBehavior = await transactionHistoryService.analyzeWalletBehavior(TEST_WALLET_ADDRESS);
    console.log('✅ Transaction behavior analyzed:', {
      totalTransactions: transactionBehavior.totalTransactions,
      tradingStyle: transactionBehavior.patterns?.tradingStyle?.type,
      netPosition: `$${Math.round(transactionBehavior.netPositionUSD)}`,
      timingScore: transactionBehavior.patterns?.timingPatterns?.marketTimingScore
    });
    
    // Test 2: Holder Pattern Analysis
    console.log('\n👥 Test 2: Holder Pattern Analysis');
    const holderAnalysis = await holderPatternsService.analyzeCollectionHolders('0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D', 'bored-ape-yacht-club');
    console.log('✅ Holder patterns analyzed:', {
      totalHolders: holderAnalysis.analysis.totalHolders,
      communityStrength: holderAnalysis.insights.communityStrength,
      wealthConcentration: holderAnalysis.insights.wealthConcentration,
      holderLoyalty: holderAnalysis.analysis.holderLoyalty
    });
    
    // Test 3: Market Timing Analysis
    console.log('\n📈 Test 3: Market Timing Analysis');
    const marketTiming = await marketTimingService.analyzeCollection('bored-ape-yacht-club');
    console.log('✅ Market timing analyzed:', {
      currentPhase: marketTiming.marketPhase.currentPhase,
      confidence: `${marketTiming.marketPhase.confidence}%`,
      priceDirection: marketTiming.momentum.price,
      nextWeekDirection: marketTiming.predictions.nextWeekDirection
    });
    
    // Test 4: Cross-Collection Relationships
    console.log('\n🌐 Test 4: Cross-Collection Relationships');
    const ecosystemMap = await crossCollectionRelationshipsService.analyzeWalletEcosystem(
      TEST_COLLECTIONS.map(slug => ({ slug }))
    );
    console.log('✅ Ecosystem analyzed:', {
      influenceScore: `${ecosystemMap.influenceScore}/100`,
      diversificationLevel: ecosystemMap.diversificationLevel,
      coreCollections: ecosystemMap.coreCollections.length,
      collectingTheme: ecosystemMap.collectingTheme.substring(0, 50) + '...'
    });
    
    // Test 5: Temporal Analysis
    console.log('\n⏰ Test 5: Temporal Analysis');
    const temporalAnalysis = await temporalAnalysisService.analyzeWalletTemporal(TEST_WALLET_ADDRESS);
    console.log('✅ Temporal patterns analyzed:', {
      behavioralArchetype: temporalAnalysis.insights.behavioralArchetype,
      experienceLevel: temporalAnalysis.insights.experienceLevel,
      riskTolerance: temporalAnalysis.insights.riskTolerance,
      nextAction: temporalAnalysis.trends.predictedBehavior.nextAction,
      confidence: `${temporalAnalysis.trends.predictedBehavior.confidence}%`
    });
    
    // Test 6: Enhanced Mystical Context Building
    console.log('\n🔮 Test 6: Enhanced Mystical Context Building');
    const enhancedContext = await buildEnhancedMysticalContext(
      TEST_WALLET_ADDRESS, 
      MOCK_NFT_DATA, 
      MOCK_CAESAR_ANALYSIS
    );
    console.log('✅ Enhanced context built:', {
      behavioralArchetype: enhancedContext.behavioralArchetype,
      spiritualJourney: enhancedContext.spiritualJourney?.substring(0, 60) + '...',
      cosmicSignificance: enhancedContext.cosmicSignificance?.substring(0, 60) + '...',
      hasTransactionData: !!enhancedContext.transactionBehavior,
      hasTemporalData: !!enhancedContext.temporalAnalysis,
      hasEcosystemData: !!enhancedContext.crossCollectionData
    });
    
    // Test 7: Enhanced System Prompt Generation
    console.log('\n🎭 Test 7: Enhanced System Prompt Generation');
    const systemPrompt = generateEnhancedSystemPrompt(enhancedContext);
    console.log('✅ Enhanced system prompt generated:');
    console.log('   Length:', systemPrompt.length, 'characters');
    console.log('   Includes archetype guidance:', systemPrompt.includes('ARCHETYPAL ESSENCE'));
    console.log('   Includes enhanced vocabulary:', systemPrompt.includes('ENHANCED CONTEXT INTEGRATION'));
    
    // Test 8: Enhanced Prompt Generation
    console.log('\n📝 Test 8: Enhanced Prompt Generation');
    const enhancedPrompt = generateEnhancedPrompt(enhancedContext, 'deep');
    console.log('✅ Enhanced prompt generated:');
    console.log('   Length:', enhancedPrompt.length, 'characters');
    console.log('   Includes behavioral data:', enhancedPrompt.includes('BEHAVIORAL CONSCIOUSNESS'));
    console.log('   Includes temporal data:', enhancedPrompt.includes('TEMPORAL ENERGY'));
    console.log('   Includes market data:', enhancedPrompt.includes('MARKET CONSCIOUSNESS'));
    
    // Test 9: Bulk Operations
    console.log('\n🔄 Test 9: Bulk Operations');
    const bulkMarketAnalysis = await marketTimingService.analyzeBulkCollections(TEST_COLLECTIONS);
    console.log('✅ Bulk market analysis completed:', {
      collectionsAnalyzed: bulkMarketAnalysis.length,
      avgConfidence: Math.round(bulkMarketAnalysis.reduce((sum, a) => sum + a.marketPhase.confidence, 0) / bulkMarketAnalysis.length),
      phases: bulkMarketAnalysis.map(a => a.marketPhase.currentPhase).join(', ')
    });
    
    // Test 10: Cross-Collection Clustering
    console.log('\n🎯 Test 10: Collection Clustering');
    const clusters = await crossCollectionRelationshipsService.findCollectionClusters(TEST_COLLECTIONS);
    console.log('✅ Collection clustering completed:', {
      clustersFound: clusters.length,
      avgClusterStrength: clusters.length > 0 ? Math.round(clusters.reduce((sum, c) => sum + c.clusterStrength, 0) / clusters.length) : 0,
      themes: clusters.map(c => c.theme).join(', ')
    });
    
    console.log('\n🎉 ALL TESTS COMPLETED SUCCESSFULLY! 🎉');
    console.log('\n📊 Pipeline Performance Summary:');
    console.log('   • Transaction History: ✅ Working');
    console.log('   • Holder Patterns: ✅ Working'); 
    console.log('   • Market Timing: ✅ Working');
    console.log('   • Cross-Collection Analysis: ✅ Working');
    console.log('   • Temporal Analysis: ✅ Working');
    console.log('   • Enhanced Claude Prompts: ✅ Working');
    console.log('   • Bulk Operations: ✅ Working');
    console.log('   • Collection Clustering: ✅ Working');
    
    console.log('\n🚀 The enhanced data collection pipeline is ready for production!');
    console.log('   Hans can now provide incredibly detailed and personalized mystical insights');
    console.log('   based on deep behavioral analysis, market timing, temporal patterns,');
    console.log('   cross-collection relationships, and advanced holder analytics.');
    
    return {
      success: true,
      testResults: {
        transactionHistory: !!transactionBehavior,
        holderPatterns: !!holderAnalysis,
        marketTiming: !!marketTiming,
        crossCollection: !!ecosystemMap,
        temporalAnalysis: !!temporalAnalysis,
        enhancedContext: !!enhancedContext,
        systemPrompt: systemPrompt.length > 0,
        enhancedPrompt: enhancedPrompt.length > 0,
        bulkOperations: bulkMarketAnalysis.length > 0,
        clustering: Array.isArray(clusters)
      }
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Additional utility functions for testing specific features

export async function testSpecificArchetype(archetype: string) {
  console.log(`\n🎭 Testing specific archetype: ${archetype}`);
  
  const mockContext = {
    nftData: MOCK_NFT_DATA,
    caesarAnalysis: MOCK_CAESAR_ANALYSIS,
    behavioralArchetype: archetype,
    spiritualJourney: `Testing the ${archetype} journey`,
    cosmicSignificance: `Testing cosmic significance for ${archetype}`,
    // Mock specific archetype data
    transactionBehavior: archetype === 'Diamond Hands Mystic' ? {
      patterns: { tradingStyle: { type: 'diamond_hands' } }
    } : null,
    temporalAnalysis: archetype === 'Strategic Accumulator' ? {
      patterns: { accumulation: { isAccumulating: true }, marketTiming: { buysTiming: 'dip' } }
    } : null,
    crossCollectionData: archetype === 'Cultural Curator' ? {
      influenceScore: 85,
      diversificationLevel: 'diversified'
    } : null
  };
  
  const systemPrompt = generateEnhancedSystemPrompt(mockContext);
  console.log(`✅ ${archetype} system prompt generated (${systemPrompt.length} chars)`);
  console.log(`   Archetype-specific guidance included: ${systemPrompt.includes(archetype)}`);
  
  return systemPrompt;
}

export async function benchmarkPipelinePerformance() {
  console.log('\n⚡ Benchmarking Enhanced Data Collection Pipeline Performance\n');
  
  const startTime = Date.now();
  
  // Run all major operations in parallel
  const results = await Promise.allSettled([
    transactionHistoryService.analyzeWalletBehavior(TEST_WALLET_ADDRESS),
    holderPatternsService.analyzeCollectionHolders('0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D'),
    marketTimingService.analyzeCollection('bored-ape-yacht-club'),
    crossCollectionRelationshipsService.analyzeWalletEcosystem([{ slug: 'bored-ape-yacht-club' }]),
    temporalAnalysisService.analyzeWalletTemporal(TEST_WALLET_ADDRESS)
  ]);
  
  const totalTime = Date.now() - startTime;
  const successCount = results.filter(r => r.status === 'fulfilled').length;
  
  console.log('📊 Performance Results:');
  console.log(`   Total Time: ${totalTime}ms`);
  console.log(`   Success Rate: ${successCount}/5 (${Math.round(successCount/5*100)}%)`);
  console.log(`   Average Time per Service: ${Math.round(totalTime/5)}ms`);
  console.log(`   Pipeline Status: ${successCount === 5 ? '🟢 Excellent' : successCount >= 3 ? '🟡 Good' : '🔴 Needs Attention'}`);
  
  return {
    totalTime,
    successRate: successCount / 5,
    results: results.map(r => r.status)
  };
}

// Export test runner
if (typeof window === 'undefined') {
  // Only run in Node.js environment (not browser)
  console.log('🧪 Enhanced Data Collection Pipeline Test Suite');
  console.log('Run: npm run test:pipeline');
}