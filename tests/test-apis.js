// API Testing Script for Hans Oracle
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

// Test CoinGecko API
async function testCoinGecko() {
  console.log('\n🔗 Testing CoinGecko API...');
  
  const apiKey = process.env.COINGECKO_API_KEY;
  const baseUrl = apiKey 
    ? 'https://pro-api.coingecko.com/api/v3'
    : 'https://api.coingecko.com/api/v3';
  
  const headers = {
    'Accept': 'application/json',
  };
  
  if (apiKey) {
    headers['x-cg-pro-api-key'] = apiKey;
  }
  
  try {
    // Test ETH price
    const priceResponse = await fetch(`${baseUrl}/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true`, {
      headers
    });
    
    if (!priceResponse.ok) {
      throw new Error(`CoinGecko API error: ${priceResponse.status}`);
    }
    
    const priceData = await priceResponse.json();
    console.log('✅ CoinGecko API working!');
    console.log(`   ETH Price: $${priceData.ethereum.usd}`);
    console.log(`   24h Change: ${priceData.ethereum.usd_24h_change?.toFixed(2)}%`);
    return true;
  } catch (error) {
    console.log('❌ CoinGecko API failed:', error.message);
    return false;
  }
}

// Test Alchemy API
async function testAlchemy() {
  console.log('\n🔗 Testing Alchemy API...');
  
  const apiKey = process.env.ALCHEMY_API_KEY;
  if (!apiKey) {
    console.log('❌ Alchemy API key not found');
    return false;
  }
  
  const baseUrl = `https://eth-mainnet.g.alchemy.com/nft/v3/${apiKey}`;
  
  try {
    // Test getting NFTs for a known wallet (Vitalik's)
    const testWallet = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
    const response = await fetch(`${baseUrl}/getNFTsForOwner?owner=${testWallet}&withMetadata=false&pageSize=1`, {
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Alchemy API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Alchemy API working!');
    console.log(`   Test wallet NFT count: ${data.totalCount}`);
    return true;
  } catch (error) {
    console.log('❌ Alchemy API failed:', error.message);
    return false;
  }
}

// Test OpenSea API
async function testOpenSea() {
  console.log('\n🔗 Testing OpenSea API...');
  
  const apiKey = process.env.OPENSEA_API_KEY;
  if (!apiKey) {
    console.log('❌ OpenSea API key not found');
    return false;
  }
  
  const baseUrl = 'https://api.opensea.io/api/v2';
  
  try {
    // Test getting collection stats for BAYC
    const response = await fetch(`${baseUrl}/collections/boredapeyachtclub/stats`, {
      headers: {
        'X-API-KEY': apiKey,
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`OpenSea API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ OpenSea API working!');
    console.log(`   BAYC Floor Price: ${data.stats?.floor_price || 'N/A'} ETH`);
    console.log(`   Total Volume: ${data.stats?.total_volume || 'N/A'} ETH`);
    return true;
  } catch (error) {
    console.log('❌ OpenSea API failed:', error.message);
    return false;
  }
}

// Test Unified Service
async function testUnifiedService() {
  console.log('\n🔗 Testing Unified NFT Service...');
  
  try {
    // Test with a known wallet that has NFTs
    const testWallet = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
    
    const response = await fetch('http://localhost:3001/api/oracle/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddress: testWallet,
        analysisDepth: 'quick'
      })
    });
    
    if (!response.ok) {
      throw new Error(`Oracle API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Unified Service working!');
    console.log(`   Portfolio Value: ${data.nftData?.portfolioValueUSD?.toFixed(2) || 'N/A'} USD`);
    console.log(`   Total NFTs: ${data.nftData?.totalCount || 0}`);
    console.log(`   Collections: ${data.nftData?.collections?.length || 0}`);
    
    if (data.marketContext) {
      console.log(`   ETH Price: $${data.marketContext.ethPrice}`);
      console.log(`   Global Market Cap: $${(data.marketContext.globalMarketCap / 1e12).toFixed(2)}T`);
    }
    
    return true;
  } catch (error) {
    console.log('❌ Unified Service failed:', error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🔮 Hans Oracle API Testing Suite\n');
  console.log('=' .repeat(50));
  
  const results = {
    coingecko: await testCoinGecko(),
    alchemy: await testAlchemy(), 
    opensea: await testOpenSea(),
    unified: await testUnifiedService(),
  };
  
  console.log('\n' + '=' .repeat(50));
  console.log('📊 Test Results Summary:');
  console.log(`   CoinGecko API: ${results.coingecko ? '✅' : '❌'}`);
  console.log(`   Alchemy API: ${results.alchemy ? '✅' : '❌'}`);
  console.log(`   OpenSea API: ${results.opensea ? '✅' : '❌'}`);
  console.log(`   Unified Service: ${results.unified ? '✅' : '❌'}`);
  
  const totalAPIs = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 Overall Status: ${totalAPIs}/${totalTests} APIs working`);
  
  if (totalAPIs === totalTests) {
    console.log('🚀 FULL API MODE CONFIRMED! All external APIs are operational.');
  } else if (totalAPIs > 0) {
    console.log('⚡ PARTIAL API MODE: Some APIs working, will use hybrid data.');
  } else {
    console.log('🎭 DEMO MODE: Using sophisticated mock data.');
  }
  
  process.exit(totalAPIs === totalTests ? 0 : 1);
}

runTests().catch(console.error);