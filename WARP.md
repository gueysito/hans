# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Hans NFT Oracle is a mystical AI-powered NFT collection analysis platform built with Next.js 15, TypeScript, and Convex backend. It provides users with mystical insights about their NFT collections through an oracle-themed interface with voice interaction, premium subscriptions, and advanced analytics.

## Development Commands

### Core Development
```bash
# Start development server (frontend only)
npm run dev

# Start full development stack (frontend + backend)
npm run dev:full

# Start frontend only
npm run dev:frontend

# Start Convex backend only
npm run dev:backend

# Build for production
npm run build

# Start production server
npm start

# Lint the codebase
npm run lint
```

### Testing
```bash
# The project uses mock data by default for development
# External APIs are optional and fallback to sophisticated mock data
```

### Docker Development
```bash
# Build and run with Docker
docker build -t hans-oracle .
docker run -p 3000:3000 hans-oracle

# Full production stack with Redis and Nginx
docker-compose up -d
```

### Convex Backend
```bash
# Deploy Convex functions
npx convex deploy

# Run Convex development server
npx convex dev
```

## Architecture Overview

### Frontend Architecture
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS 4 with mystical theme system
- **State Management**: Convex for real-time data, localStorage fallback
- **Animation**: Framer Motion for mystical effects
- **Voice**: Web Speech API with custom mystical voice effects

### Backend Architecture (Convex)
- **Database**: Convex with comprehensive schema for users, sessions, NFT data, insights, analytics
- **Session Management**: Hybrid system supporting both authenticated and anonymous sessions
- **Caching**: Built-in API response caching with TTL expiration
- **Real-time**: Live session updates and conversation history

### Key Data Models
- `users`: User profiles with preferences and subscription tiers
- `sessions`: Oracle sessions with conversation history and status tracking
- `nftCollections`: NFT data storage with filtering and significance scoring
- `insightCards`: Generated mystical insights with confidence ratings
- `analytics`: Comprehensive event tracking for performance monitoring
- `apiCache`: Smart caching for external API responses

## Project Structure

```
src/
├── app/                    # Next.js 15 App Router
│   ├── api/health/         # Health check endpoint
│   ├── oracle/             # Main oracle chamber interface
│   ├── community/          # Community features
│   └── profile/            # User profile management
├── components/
│   ├── oracle/             # Core oracle UI components
│   │   ├── CrystalBall.tsx         # Main mystical interface
│   │   ├── ConversationFlow.tsx    # Chat-like conversation
│   │   ├── VoiceOracle.tsx         # Voice interaction
│   │   └── WalletComparison.tsx    # Multi-wallet analysis
│   ├── ai/                 # AI prediction components
│   ├── premium/            # Subscription and premium features
│   └── export/             # Data export functionality
└── lib/                    # Core business logic
    ├── session.ts          # Session management
    ├── hybrid-session.ts   # Convex + localStorage session handling
    └── performance.ts      # Performance monitoring
```

### Development Practices

### Convex Guidelines
Follow the comprehensive Convex rules defined in `.cursor/rules/convex_rules.mdc`:
- Always use new function syntax with explicit args and returns validators
- Use proper TypeScript types for document IDs (`Id<'tableName'>`)
- Implement proper error handling and validation
- Use internal functions for sensitive operations
- Follow file-based routing conventions

### Caesar Research API Guidelines
Caesar is a research API that requires special handling:
- **Long Response Times**: Research typically takes 30-180 seconds
- **Polling Required**: Submit request, then poll for completion using research ID
- **Proper Timeouts**: 5-minute total timeout with exponential backoff polling
- **Graceful Fallbacks**: Enhanced analysis when research fails or times out
- **Status Handling**: Handle "processing", "completed", and "failed" states properly

### Session Management
The app uses a hybrid session system:
- Anonymous sessions via localStorage for demo/trial users
- Authenticated sessions via Convex for premium users
- Sessions expire after 24 hours with automatic cleanup
- Conversation history preserved across sessions

### Claude AI Integration Guidelines
The Claude/Anthropic integration uses advanced prompt engineering:
- **Dynamic System Prompts**: Adapts persona based on collection characteristics
- **Rich Context Injection**: Includes rarity scores, trait analysis, portfolio value
- **Variation Mechanisms**: Prevents repetitive responses with rotating elements
- **Collection-Specific Guidance**: Different mystical approaches for Blue Chip vs Art vs Gaming
- **Dynamic Cosmic Alignments**: Never-repeating astrological and energetic references
- **Confidence Scoring**: Based on data richness and analysis quality

### Mystical Theme System
- Consistent mystical terminology in UI copy
- Sacred geometry and crystal ball visual elements
- Mystical color palette: purple gradients and gold accents
- Voice oracle with customizable mystical pronunciation effects

## External Integrations

### Optional APIs (Fallback to Mock Data)
- **OpenSea API**: NFT collection and market data
- **Alchemy API**: Blockchain and wallet analysis  
- **Moralis API**: NFT metadata and ownership
- **Caesar Research API**: Expert-level cultural analysis and research (https://docs.caesar.xyz)
- **Anthropic/OpenAI**: Enhanced AI predictions and voice responses
- **Stripe**: Premium subscription billing

### Environment Configuration
The application works fully with mock data when external APIs are not configured. For production:
```env
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
CONVEX_DEPLOY_KEY=your_convex_deploy_key
OPENSEA_API_KEY=your_opensea_api_key
ALCHEMY_API_KEY=your_alchemy_api_key
MORALIS_API_KEY=your_moralis_api_key
CAESAR_API_KEY=your_caesar_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
COINGECKO_API_KEY=your_coingecko_api_key
```

## Premium Subscription Tiers

- **Cosmic Seeker** (Free): Basic oracle readings, 2 sessions/day
- **Digital Mystic** ($19/month): Unlimited readings, AI predictions, voice oracle
- **Master Oracle** ($49/month): Everything + multi-wallet comparison, custom training

## Performance Features

- Bundle splitting for optimized loading
- Image optimization with WebP/AVIF support
- Real-time performance monitoring with automatic recommendations
- Intelligent caching with TTL-based expiration
- Responsive design optimized for all devices

## Deployment

- **Development**: `npm run dev` for local development with mock data
- **Production**: Docker-based deployment with Nginx reverse proxy
- **Convex**: Separate backend deployment via `npx convex deploy`
- **Vercel**: Single-click deployment supported

## Key Features to Understand

1. **Oracle Chamber**: Main interface where users input wallet addresses for mystical analysis
2. **Voice Oracle**: Speech recognition and synthesis with mystical effects
3. **Multi-Wallet Comparison**: Advanced analytics comparing multiple wallets
4. **Session Persistence**: Conversations saved across sessions with expiration handling
5. **Premium Gating**: Tiered access to features based on subscription status
6. **Real-time Analytics**: Performance monitoring and user behavior tracking

The application maintains a mystical theme throughout while providing sophisticated NFT analysis capabilities with both authenticated and anonymous usage patterns.

## Recent Improvements (October 2025)

### Enhanced Moralis Integration
- **Convex Schema Updated**: Added support for Moralis, Alchemy, and CoinGecko in API caching
- **Enhanced Claude Prompts**: Sophisticated Moralis-specific analysis integration
- **Multi-Chain Intelligence**: Advanced cross-chain portfolio analysis capabilities
- **Persona Refinement**: Maintained sophisticated mystical analyst voice (not tarot-like)

### Comprehensive Documentation
- **Oracle Flow Documentation**: Complete system architecture guide (`docs/oracle-flow-documentation.md`)
- **Error Recovery Proposal**: 8-week implementation plan for robust error handling (`docs/error-recovery-ux-proposal.md`)
- **Session Documentation**: Detailed change log for future reference (`docs/session-2025-10-14-improvements.md`)

### Key Technical Improvements
- **Parallel Processing**: Optimized API call efficiency with priority-based processing
- **Intelligent Caching**: TTL-based caching system with provider-specific strategies
- **Progressive Enhancement**: Tiered fallback system for API failures
- **Real-time Analytics**: Performance monitoring and optimization metrics

### Hans Persona Guidelines
**IMPORTANT**: Hans should sound like a sophisticated AI analyst with mystical insights, NOT a generic fortune teller.
- ✅ Use: "Advanced analytics", "strategic intelligence", "behavioral economics"
- ❌ Avoid: "Cosmic energies", "sacred alignments", "mystical vibrations"

### Development Status
- **Local Development**: Ready for testing with enhanced Moralis integration
- **Convex Deployment**: Local setup complete, remote deployment pending
- **API Integrations**: All major APIs implemented (OpenSea, Alchemy, Moralis, Caesar, Claude, CoinGecko)
- **Error Recovery**: Designed but not yet implemented (see proposal document)
