# Caesar API Implementation Guide

> **Note**: This document provides detailed Caesar API implementation guidance. 
> For system-wide integration overview, see `docs/oracle-flow-documentation.md`.

## Overview

Caesar (https://docs.caesar.xyz) is a **research API** that performs in-depth analysis by scraping, retrieving, reasoning, and synthesizing information from multiple sources. Unlike typical LLMs that respond in seconds, Caesar research requests take **30-180 seconds** to complete quality analysis.

## Key Characteristics

### ⏱️ **Research Timeline**
- **Quick Analysis**: 30-60 seconds
- **Standard Analysis**: 60-120 seconds  
- **Deep Analysis**: 120-180 seconds
- **Complex Queries**: Up to 300 seconds (5 minutes)

### 🔄 **Async Workflow**
Caesar uses an asynchronous research workflow:

1. **Submit Request** → Receive research ID
2. **Polling Phase** → Check status periodically
3. **Completion** → Retrieve final results

## Implementation Details

### Request Flow

```typescript
// 1. Submit research request
POST /v1/research
{
  "query": "Analyze NFT collection cultural significance...",
  "format": "detailed",
  "max_tokens": 1000
}

// 2. Get research ID and status
Response: {
  "id": "research_123",
  "status": "processing"
}

// 3. Poll for completion
GET /v1/research/research_123

// 4. Final result
Response: {
  "status": "completed",
  "result": {
    "answer": "Comprehensive analysis...",
    "sources": [...],
    "confidence": 0.85
  }
}
```

### Polling Strategy

Our implementation uses **exponential backoff** with intelligent timeouts:

- **Initial Delay**: 10 seconds
- **Max Delay**: 30 seconds between polls
- **Max Attempts**: 20 polling attempts
- **Total Timeout**: 5 minutes maximum
- **Backoff Factor**: 1.5x delay increase

### Error Handling

- **Authentication Errors**: Clear API key guidance
- **Rate Limiting**: Respect Caesar's research queue
- **Timeout Handling**: Graceful fallback after 5 minutes
- **Network Issues**: Retry with exponential backoff

## Fallback Strategy

When Caesar API is unavailable or times out, the system uses **Enhanced Fallback Analysis**:

### Collection Intelligence
- **Blue Chip Detection**: BAYC, CryptoPunks, Azuki, etc.
- **Art Collection Recognition**: Art Blocks, SuperRare, Foundation
- **Gaming Assets**: Axie, Sandbox, Metaverse projects
- **Diversity Analysis**: Focused vs. diverse collector patterns

### Dynamic Analysis
- **Thematic Pattern Recognition**
- **Cultural Positioning Assessment**
- **Market Dynamics Understanding**
- **Psychological Profiling**
- **Confidence Scoring**

## User Experience Considerations

### Loading States
```typescript
// Inform users about expected wait times
console.log('⏳ Research APIs typically take 30-180 seconds for quality analysis...');

// Show progress updates
console.log(`⏳ Research still processing after ${elapsedTime}s, checking again in ${delay/1000}s...`);

// Completion notification
console.log(`✅ Caesar research completed after ${elapsedTime} seconds`);
```

### Graceful Degradation
- Always provide immediate enhanced fallback analysis
- Never leave users waiting without feedback
- Clearly communicate when using fallback vs. real research

## Performance Optimization

### Caching Strategy
- Cache completed research results for 24 hours
- Use collection fingerprints to avoid duplicate research
- Implement intelligent cache invalidation

### Queue Management
- Batch similar requests when possible
- Prioritize quick analyses for immediate feedback
- Use deep analysis for premium features

### Resource Management
- Limit concurrent research requests
- Implement request queuing for high traffic
- Monitor API usage and costs

## Configuration

### Environment Variables
```env
CAESAR_API_KEY=your_caesar_api_key
CAESAR_TIMEOUT_MS=300000  # 5 minutes
CAESAR_POLLING_INTERVAL_MS=10000  # 10 seconds
CAESAR_MAX_ATTEMPTS=20
```

### Usage Recommendations

1. **Quick Analysis**: Use for immediate user feedback
2. **Standard Analysis**: Default for most oracle readings
3. **Deep Analysis**: Premium feature for comprehensive insights
4. **Always Fallback**: Ensure users get results even if Caesar fails

## Monitoring

### Key Metrics
- Research completion time
- Success/failure rates
- Fallback usage percentage
- User wait time tolerance

### Alerting
- API authentication issues
- Unusual timeout patterns
- High fallback usage rates
- Research quality degradation

## Best Practices

✅ **Do:**
- Set realistic user expectations (30-180 seconds)
- Provide progress feedback during polling
- Use enhanced fallback for immediate results
- Cache successful research results
- Monitor API usage and performance

❌ **Don't:**
- Use short timeouts (< 30 seconds)
- Block UI during research without feedback  
- Retry failed requests too aggressively
- Ignore rate limiting responses
- Skip fallback implementation

## Testing

Use the provided test script to validate implementation:

```bash
node test-caesar-api.js
```

This will test the fallback analysis without requiring actual API keys, demonstrating the enhanced collection intelligence system.