# 🔮 Hans NFT Oracle

## Security maintenance, 2026-10-30

Hans is currently offline. This maintenance update repairs the dependency/runtime security baseline; it does not deploy the app or certify it for public use.

Use Node **22.23.4** (`nvm use`) and npm **11.12.1**. Install with `npm ci`; `.npmrc` blocks dependency lifecycle scripts, enforces the runtime requirements and applies a seven-day release-age gate. Docker uses the same Node release and npm for its frozen dependency install.

Next.js stays on version 15 with React 19 and Convex. The scoped `next → postcss` override keeps its pinned CSS parser on a patched 8.x release; revisit the override when a compatible Next release includes a patched parser itself.

| Maintenance item | Status | Verification / next action |
| --- | --- | --- |
| Patched Node, Next/React, Zod and affected transitive dependencies | Verified for this offline maintenance scope | Frozen install and installed dependency tree pass; audit reports zero vulnerabilities. Seventeen focused checks pass on macOS and Linux; local-container HTTP and server-rendering smoke checks pass. |
| Existing build restoration | Deferred by owner | Original baseline: 140 lint errors, 84 type errors, production build fails. Missing Convex generated files and other source issues require a separate repair. Keep existing checks enabled. |
| Public-release security review | Deferred until public-use work resumes | Review authentication, Convex ownership checks, paid-API rate limits and error exposure before deployment. Standards adoption remains deferred. |

The production image depends on a successful application build. Its deployment remains blocked by the existing source failures; a successful dependency-image check does not mean the full production image builds.

> *A mystical AI-powered NFT collection analysis platform that reveals the hidden meanings and cosmic connections within your digital treasures.*

[![Next.js](https://img.shields.io/badge/Next.js-15.5.28-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Convex](https://img.shields.io/badge/Convex-Backend-orange?style=flat-square)](https://convex.dev/)

## ✨ Features

### 🧠 **AI-Powered Analysis**
- **Advanced Trend Prediction**: Multi-factor algorithms analyzing volume, liquidity, social sentiment, and market momentum
- **Personalized Recommendations**: Smart collection suggestions based on your portfolio patterns
- **Market Sentiment Analysis**: Real-time mood tracking across social platforms and trading data
- **Risk Assessment**: Automated volatility and risk scoring

### 🎤 **Voice Oracle Interface**
- **Natural Speech Recognition**: Speak directly with Hans using mystical voice commands
- **Customizable Oracle Voice**: Adjustable voice settings with mystical pronunciation effects
- **Interactive Commands**: "Analyze my wallet", "What are the latest trends?", "Give me recommendations"
- **Accessibility Features**: Full keyboard navigation and screen reader support

### 💎 **Premium Subscription System**
- **Cosmic Seeker** (Free): Basic oracle readings, 2 sessions/day, standard insights
- **Digital Mystic** ($19/month): Unlimited readings, AI predictions, voice oracle, premium insights
- **Master Oracle** ($49/month): Everything + unlimited AI predictions, 5-wallet comparison, custom training

### 🔮 **Mystical Experience**
- **Sacred Geometry Backgrounds**: Dynamic mystical visuals that respond to oracle states
- **Crystal Ball Interface**: Interactive crystal ball with mystical animations
- **Conversation Flow**: Natural dialogue with Hans, your mystical guide
- **Insight Cards**: Beautiful card-based insights with confidence scoring

### 📊 **Advanced Analytics**
- **Multi-Wallet Comparison**: Compare up to 5 wallets with detailed analysis
- **Enhanced Analytics Dashboard**: Portfolio value, risk scores, diversification metrics
- **Export Capabilities**: PDF, CSV, SVG formats with professional reporting
- **Performance Tracking**: Real-time metrics and optimization recommendations

## 🚀 Quick Start

### Prerequisites
- Node.js 22.23.4
- npm 11.12.1
- Git

After selecting Node, install the pinned npm version if needed:
```bash
npm install --global npm@11.12.1 --ignore-scripts
```

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/gueysito/hans.git
   cd hans
   ```

2. **Install dependencies**
   ```bash
   npm ci
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your API keys (see [Environment Setup](#environment-setup))

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Setup

### Required Environment Variables

Create a `.env.local` file with the following variables:

```env
# Basic Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Convex Backend (optional for development)
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
CONVEX_DEPLOY_KEY=your_convex_deploy_key

# Authentication (optional)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# External APIs (for real data - optional for demo)
OPENSEA_API_KEY=your_opensea_api_key
ALCHEMY_API_KEY=your_alchemy_api_key
MORALIS_API_KEY=your_moralis_api_key

# AI Services (for enhanced predictions)
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

**Note**: The application works with mock data if external APIs are not configured.

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Convex (with localStorage fallback for development)
- **Authentication**: Clerk (optional)
- **AI/ML**: Custom prediction engines with external API integration
- **Voice**: Web Speech API with custom mystical effects
- **Deployment**: Docker containerization with production optimizations

### Project Structure
```
hans/
├── src/
│   ├── app/                 # Next.js 15 app router
│   ├── components/          # React components
│   │   ├── ai/             # AI prediction components
│   │   ├── auth/           # Authentication components
│   │   ├── community/      # Community features
│   │   ├── export/         # Export functionality
│   │   ├── oracle/         # Core oracle interface
│   │   └── premium/        # Premium subscription UI
│   └── lib/                # Utilities and business logic
│       ├── ai/             # AI prediction engines
│       ├── auth.ts         # Authentication logic
│       ├── session.ts      # Session management
│       └── performance.ts  # Performance monitoring
├── convex/                 # Convex backend functions
├── docs/                   # Documentation and guides
└── public/                 # Static assets
```

## 🎭 Usage Guide

### 1. **Enter the Oracle Chamber**
- Navigate to `/oracle` to begin your mystical journey
- Optional: Authenticate for enhanced features and session persistence

### 2. **Connect Your Wallet**
- Enter any Ethereum wallet address
- Hans will analyze your NFT collection and provide mystical insights

### 3. **Explore Advanced Features**
- **🤖 AI Predictions**: Access market intelligence and trend analysis
- **🎤 Voice Oracle**: Speak with Hans using natural voice commands
- **⚖️ Compare Wallets**: Analyze multiple wallets for cosmic connections
- **📊 Enhanced Analytics**: Deep dive into portfolio metrics
- **💎 Premium Tiers**: Upgrade for unlimited access and advanced features

### 4. **Voice Commands**
Try saying:
- "Analyze my wallet"
- "What are the latest trends?"
- "Give me recommendations"
- "Compare my collections"
- "Share your wisdom, Oracle"

## 🎨 Stories Development

Hans Oracle was built through a series of development stories:

- **Stories 001-003**: Core mystical oracle with wallet analysis
- **Stories 004-006**: Authentication, community features, session management
- **Stories 007-009**: Multi-wallet comparison, analytics, export system
- **Story 010**: AI predictions, voice oracle, premium tiers, production infrastructure

Each story builds upon the previous, creating a comprehensive NFT analysis platform.

## 🔮 API Integration

### Supported APIs
- **OpenSea API**: NFT collection data and market information
- **Alchemy API**: Blockchain data and wallet analysis
- **Moralis API**: NFT metadata and ownership data
- **CoinGecko API**: Price data and market metrics
- **OpenAI/Anthropic**: Enhanced AI predictions and insights

### Mock Data
When APIs are not configured, Hans Oracle uses sophisticated mock data that demonstrates all features while maintaining the mystical experience.

## 🚢 Deployment

### Docker Deployment
```bash
# Build and run with Docker
docker build -t hans-oracle .
docker run -p 3000:3000 hans-oracle
```

### Docker Compose (Production)
```bash
# Full production stack with Redis and Nginx
docker-compose up -d
```

### Convex Deployment
1. Set up a Convex project at [convex.dev](https://convex.dev)
2. Configure your environment variables
3. Deploy backend functions:
   ```bash
   npx convex deploy
   ```

### Vercel Deployment
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/gueysito/hans)

## 🎯 Performance

Hans Oracle is optimized for production with:
- **Bundle Splitting**: Optimized chunk loading for faster initial page loads
- **Image Optimization**: WebP/AVIF format support with intelligent caching
- **Performance Monitoring**: Real-time metrics with automatic recommendations
- **Caching Strategy**: Intelligent cache management with TTL-based expiration
- **Responsive Design**: Optimized for all devices and screen sizes

## 🔒 Security

- **Environment Variables**: All sensitive data properly configured in environment files
- **Security Headers**: Comprehensive CSP, XSS protection, and CSRF prevention
- **Authentication**: Optional Clerk integration for user management
- **API Protection**: Rate limiting and request validation
- **Public release**: Deferred; the security maintenance section above records verification limits and required follow-up.

## 🤝 Contributing

We welcome contributions to Hans Oracle! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/mystical-enhancement`)
3. Commit your changes (`git commit -m 'Add mystical enhancement'`)
4. Push to the branch (`git push origin feature/mystical-enhancement`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Maintain the mystical theme and user experience
- Add tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team**: For the incredible React framework
- **Convex**: For the seamless backend-as-a-service platform
- **Clerk**: For authentication and user management
- **Framer Motion**: For beautiful animations and interactions
- **Tailwind CSS**: For the utility-first CSS framework

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/gueysito/hans/issues)
- **Discussions**: [GitHub Discussions](https://github.com/gueysito/hans/discussions)
- **Documentation**: [Project Wiki](https://github.com/gueysito/hans/wiki)

---

<div align="center">

**🔮 May your digital treasures reveal their cosmic secrets 🔮**

*Built with mystical energy and modern technology*

[Live Demo](https://hansoracle.vercel.app) • [Documentation](https://github.com/gueysito/hans/wiki) • [Discord Community](https://discord.gg/hansoracle)

</div>
