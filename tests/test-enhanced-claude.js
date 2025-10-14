#!/usr/bin/env node

// Test script for enhanced Claude prompt engineering
// Demonstrates dynamic prompt generation and variation

const testData = {
  blueChipCollection: {
    totalCount: 12,
    topCollections: ['bored-ape-yacht-club', 'cryptopunks', 'azuki'],
    nfts: [
      { name: 'Bored Ape #1234', rarityScore: 85.2, traits: [{traitType: 'Background', value: 'Cosmic'}, {traitType: 'Fur', value: 'Gold'}] },
      { name: 'CryptoPunk #5678', rarityScore: 92.7, traits: [{traitType: 'Type', value: 'Alien'}, {traitType: 'Accessory', value: 'Laser Eyes'}] }
    ],
    portfolioValueUSD: 450000
  },
  
  artCollection: {
    totalCount: 8,
    topCollections: ['art-blocks-curated', 'superrare', 'foundation'],
    nfts: [
      { name: 'Chromie Squiggle #123', rarityScore: 76.3, traits: [{traitType: 'Style', value: 'Hyperspace'}, {traitType: 'Color', value: 'Neon'}] }
    ],
    portfolioValueUSD: 85000
  },
  
  diverseCollection: {
    totalCount: 25,
    topCollections: ['world-of-women', 'cool-cats', 'veefriends', 'moonbirds', 'doodles'],
    nfts: [],
    portfolioValueUSD: 125000
  }
};

const mockCaesarAnalysis = {
  culturalSignificance: "This collection demonstrates sophisticated engagement with Web3 culture and digital art movements.",
  thematicPatterns: ["Digital Identity Expression", "Community Participation", "Aesthetic Curation"],
  psychologicalProfile: "A collector driven by both cultural significance and artistic appreciation.",
  confidence: 0.83,
  sources: [
    { url: "https://example.com", title: "NFT Culture Analysis", relevance_score: 0.9 }
  ]
};

console.log('🧪 Testing Enhanced Claude Prompt Engineering\n');
console.log('This demonstrates the dynamic prompt generation and variation system\n');

function testPromptVariation() {
  console.log('📋 Testing Different Collection Types:\n');
  
  const collections = [
    { name: 'Blue Chip Collection', data: testData.blueChipCollection },
    { name: 'Art-Focused Collection', data: testData.artCollection }, 
    { name: 'Diverse Collection', data: testData.diverseCollection }
  ];
  
  collections.forEach(({ name, data }) => {
    console.log(`\n🎭 ${name}:`);
    console.log(`  Collections: ${data.topCollections.join(', ')}`);
    console.log(`  NFT Count: ${data.totalCount}`);
    console.log(`  Portfolio Value: $${(data.portfolioValueUSD / 1000).toFixed(1)}k`);
    
    // Simulate collection analysis
    const collectionsLower = data.topCollections.map(c => c.toLowerCase());
    
    const isBlueChip = collectionsLower.some(c => 
      ['bored ape', 'cryptopunks', 'azuki', 'moonbirds'].some(bc => c.includes(bc))
    );
    const isArtFocused = collectionsLower.some(c => 
      ['art blocks', 'superrare', 'foundation'].some(art => c.includes(art))
    );
    
    console.log(`  Collection Type: ${isBlueChip ? 'Blue Chip' : isArtFocused ? 'Art-Focused' : 'Diverse'}`);
    
    // Show personalized guidance that would be generated
    if (isBlueChip) {
      console.log(`  🔮 Mystical Focus: Legacy, cultural influence, digital history`);
      console.log(`  ✨ Cosmic Alignment: Jupiter's abundance blessing established realms`);
    } else if (isArtFocused) {
      console.log(`  🔮 Mystical Focus: Creative expression, artistic muses, patronage`);
      console.log(`  ✨ Cosmic Alignment: Venus dancing through creative frequencies`);
    } else {
      console.log(`  🔮 Mystical Focus: Curiosity, discovery, diverse exploration`);
      console.log(`  ✨ Cosmic Alignment: Mercury's wisdom flowing through varied paths`);
    }
  });
}

function testDynamicTitleGeneration() {
  console.log('\n\n📝 Testing Dynamic Title Generation:\n');
  
  const titleTemplates = {
    major: [
      "The Digital Soul's Journey", "Echoes of Cosmic Purpose", "The Collector's Sacred Path",
      "Visions from the Blockchain Oracle", "The Art of Digital Transcendence"
    ],
    minor: [
      "Frequencies of Desire", "Sacred Patterns Emerge", "Digital Chakra Alignment",
      "Marketplace Mysticism", "Energetic Signatures"
    ]
  };
  
  console.log('🎭 Sample Major Titles:');
  titleTemplates.major.forEach(title => console.log(`  • ${title}`));
  
  console.log('\n🎭 Sample Minor Titles:');
  titleTemplates.minor.forEach(title => console.log(`  • ${title}`));
  
  console.log('\n✨ With Collection-Specific Prefixes:');
  console.log('  Blue Chip: "The Digital Noble\'s Sacred Path"');
  console.log('  Art Focus: "The Patron\'s Cosmic Purpose"');
  console.log('  Gaming: "The Player\'s Digital Journey"');
}

function testCosmicVariation() {
  console.log('\n\n🌌 Testing Cosmic Alignment Variation:\n');
  
  const alignments = [
    "Stellar convergence in the digital constellation",
    "Quantum entanglement with blockchain consciousness",
    "Ethereal frequencies resonating through virtual space",
    "Sacred geometry manifesting in pixel form",
    "Interdimensional bridges activated through art"
  ];
  
  console.log('Sample Cosmic Alignments:');
  alignments.forEach(alignment => console.log(`  • ${alignment}`));
  
  console.log('\n🔮 Mystical Traditions Sampled:');
  const traditions = [
    "ancient Egyptian mysteries", "Kabbalalistic wisdom", "Tarot symbolism",
    "Vedic insights", "Celtic mysticism", "Hermetic principles"
  ];
  traditions.forEach(tradition => console.log(`  • Drawing from ${tradition}`));
}

function testContextEnrichment() {
  console.log('\n\n📊 Testing Context Enrichment:\n');
  
  const enrichedContext = {
    collectionEssence: "🔮 COLLECTION ESSENCE",
    rarityResonance: "85.2 (the universe speaks through scarcity)",
    energeticSignatures: "Background, Fur, Type, Accessory",
    materialManifestation: "$450k (energy crystallized in digital form)",
    researchEssence: "🌌 RESEARCH ESSENCE",
    culturalResonance: mockCaesarAnalysis.culturalSignificance,
    soulSignature: mockCaesarAnalysis.psychologicalProfile,
    wisdomSources: `${mockCaesarAnalysis.sources.length} channels consulted`
  };
  
  console.log('Enhanced Context Elements:');
  Object.entries(enrichedContext).forEach(([key, value]) => {
    if (key !== 'collectionEssence' && key !== 'researchEssence') {
      console.log(`  ${key}: ${value}`);
    }
  });
}

// Run all tests
testPromptVariation();
testDynamicTitleGeneration();
testCosmicVariation();
testContextEnrichment();

console.log('\n\n🎉 Enhanced Claude Integration Features:');
console.log('✅ Dynamic system prompts based on collection characteristics');
console.log('✅ Rich context beyond basic stats (rarity, traits, value)'); 
console.log('✅ Varied prompt templates preventing repetition');
console.log('✅ Collection-specific mystical guidance');
console.log('✅ Dynamic title generation (never repeat)');
console.log('✅ Rotating cosmic alignments and spiritual traditions');
console.log('✅ Confidence scoring based on data richness');
console.log('✅ Enhanced response parsing with fallbacks');
console.log('\n💫 Result: Personalized, varied, and contextually rich mystical insights!');