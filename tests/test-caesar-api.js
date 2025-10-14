#!/usr/bin/env node

// Test script for Caesar API integration
// This tests the enhanced fallback analysis without requiring actual API keys

const { analyzeCulturalSignificance } = require('./src/lib/api/caesar.ts');

async function testCaesarAPI() {
  console.log('🧪 Testing Caesar API integration...\n');
  console.log('🕰️ Note: Caesar is a research API - real requests take 30-180 seconds');
  console.log('🔍 This test uses enhanced fallback analysis (no API key required)\n');

  const testCollectionData = {
    collections: ['bored-ape-yacht-club', 'cryptopunks', 'azuki'],
    nftCount: 15,
    descriptions: [
      'A unique digital ape with rare traits',
      'Iconic pixel art punk with mohawk',
      'Anime-inspired character with mystical elements'
    ],
    traits: []
  };

  try {
    console.log('📊 Test Data:');
    console.log(`  Collections: ${testCollectionData.collections.join(', ')}`);
    console.log(`  NFT Count: ${testCollectionData.nftCount}`);
    console.log(`  Descriptions: ${testCollectionData.descriptions.length} items\n`);

    const startTime = Date.now();
    const result = await analyzeCulturalSignificance(testCollectionData, 'standard');
    const duration = Math.round((Date.now() - startTime) / 1000);
    
    console.log('✅ Analysis Results:');
    console.log(`  Duration: ${duration} seconds`);
    console.log(`  Confidence: ${result.confidence}`);
    console.log(`  Thematic Patterns: ${result.thematicPatterns.join(', ')}`);
    console.log(`  Cultural Significance: ${result.culturalSignificance}`);
    console.log(`  Market Dynamics: ${result.marketDynamics}`);
    console.log(`  Sources: ${result.sources.length} references\n`);

    console.log('🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Test different collection types
async function testVariousCollectionTypes() {
  const testCases = [
    {
      name: 'Blue Chip Collection',
      data: { collections: ['bored-ape-yacht-club', 'cryptopunks'], nftCount: 8, descriptions: [], traits: [] }
    },
    {
      name: 'Art Collection',
      data: { collections: ['art-blocks', 'superrare'], nftCount: 12, descriptions: [], traits: [] }
    },
    {
      name: 'Gaming Collection',
      data: { collections: ['axie-infinity', 'sandbox'], nftCount: 25, descriptions: [], traits: [] }
    },
    {
      name: 'Diverse Collection',
      data: { collections: ['cool-cats', 'world-of-women', 'veefriends'], nftCount: 18, descriptions: [], traits: [] }
    }
  ];

  console.log('🔬 Testing different collection types...\n');

  for (const testCase of testCases) {
    console.log(`\n📋 ${testCase.name}:`);
    try {
      const result = await analyzeCulturalSignificance(testCase.data, 'quick');
      console.log(`  Type detected: ${result.thematicPatterns[0]}`);
      console.log(`  Confidence: ${result.confidence}`);
      console.log(`  Cultural insight: ${result.culturalSignificance.substring(0, 100)}...`);
    } catch (error) {
      console.error(`  ❌ Failed: ${error.message}`);
    }
  }
}

if (require.main === module) {
  testCaesarAPI()
    .then(() => testVariousCollectionTypes())
    .catch(console.error);
}

module.exports = { testCaesarAPI };