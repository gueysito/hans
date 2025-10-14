import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    lastActiveAt: v.number(),
    preferences: v.object({
      theme: v.literal("dark"),
      skipIntro: v.boolean(),
      preferredAnalysisDepth: v.union(
        v.literal("quick"),
        v.literal("standard"), 
        v.literal("deep")
      ),
    }),
  })
  .index("by_email", ["email"]),

  sessions: defineTable({
    userId: v.id("users"),
    walletAddress: v.string(),
    status: v.union(
      v.literal("initializing"),
      v.literal("gathering_data"),
      v.literal("analyzing"),
      v.literal("generating_insights"),
      v.literal("completed"),
      v.literal("failed")
    ),
    currentStep: v.string(),
    conversationHistory: v.array(v.object({
      role: v.union(v.literal("user"), v.literal("hans")),
      content: v.string(),
      timestamp: v.number(),
    })),
    expiresAt: v.number(),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
  .index("by_user", ["userId"])
  .index("by_expires", ["expiresAt"])
  .index("by_wallet", ["walletAddress"]),

  nftCollections: defineTable({
    sessionId: v.id("sessions"),
    walletAddress: v.string(),
    nftData: v.array(v.object({
      contractAddress: v.string(),
      tokenId: v.string(),
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      imageUrl: v.optional(v.string()),
      collectionName: v.optional(v.string()),
      floorPrice: v.optional(v.number()),
      lastSale: v.optional(v.object({
        price: v.number(),
        currency: v.string(),
        date: v.number(),
      })),
    })),
    filteredData: v.array(v.object({
      contractAddress: v.string(),
      tokenId: v.string(),
      significance: v.number(),
      patterns: v.array(v.string()),
    })),
    expiresAt: v.number(),
  })
  .index("by_session", ["sessionId"])
  .index("by_wallet", ["walletAddress"])
  .index("by_expires", ["expiresAt"]),

  insightCards: defineTable({
    sessionId: v.id("sessions"),
    cardType: v.union(
      v.literal("major"),
      v.literal("minor"), 
      v.literal("clarification")
    ),
    title: v.string(),
    content: v.string(),
    confidence: v.number(),
    basedOnNfts: v.array(v.string()),
    deliveredAt: v.number(),
    userReaction: v.optional(v.union(
      v.literal("amazed"),
      v.literal("intrigued"),
      v.literal("neutral"),
      v.literal("confused")
    )),
  })
  .index("by_session", ["sessionId"])
  .index("by_type", ["cardType"])
  .index("by_delivered", ["deliveredAt"]),

  apiCache: defineTable({
    cacheKey: v.string(),
    provider: v.union(
      v.literal("opensea"),
      v.literal("alchemy"),
      v.literal("moralis"),
      v.literal("caesar"),
      v.literal("claude"),
      v.literal("coingecko")
    ),
    request: v.object({
      url: v.string(),
      params: v.record(v.string(), v.any()),
    }),
    response: v.any(),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
  .index("by_key", ["cacheKey"])
  .index("by_provider", ["provider"])
  .index("by_expires", ["expiresAt"]),

  analytics: defineTable({
    eventType: v.union(
      v.literal("session_started"),
      v.literal("nft_data_fetched"),
      v.literal("insight_generated"),
      v.literal("session_completed"),
      v.literal("user_reaction"),
      v.literal("error_occurred"),
      v.literal("query_performance")
    ),
    sessionId: v.optional(v.id("sessions")),
    userId: v.optional(v.id("users")),
    data: v.object({
      timestamp: v.number(),
      duration: v.optional(v.number()),
      success: v.optional(v.boolean()),
      errorMessage: v.optional(v.string()),
      metadata: v.optional(v.record(v.string(), v.any())),
    }),
    createdAt: v.number(),
  })
  .index("by_event_type", ["eventType"])
  .index("by_session", ["sessionId"])
  .index("by_user", ["userId"])
  .index("by_created", ["createdAt"]),

  // Enhanced data collection for deep analysis
  transactionHistory: defineTable({
    sessionId: v.id("sessions"),
    walletAddress: v.string(),
    contractAddress: v.string(),
    tokenId: v.string(),
    transactions: v.array(v.object({
      txHash: v.string(),
      blockNumber: v.number(),
      timestamp: v.number(),
      type: v.union(
        v.literal("mint"),
        v.literal("sale"),
        v.literal("transfer"),
        v.literal("listing"),
        v.literal("offer")
      ),
      fromAddress: v.string(),
      toAddress: v.string(),
      price: v.optional(v.number()),
      priceUSD: v.optional(v.number()),
      currency: v.optional(v.string()),
      marketplace: v.optional(v.string()),
      gasUsed: v.optional(v.number()),
      gasPrice: v.optional(v.number()),
    })),
    expiresAt: v.number(),
  })
  .index("by_session", ["sessionId"])
  .index("by_wallet", ["walletAddress"])
  .index("by_contract", ["contractAddress"])
  .index("by_expires", ["expiresAt"]),

  holderPatterns: defineTable({
    sessionId: v.id("sessions"),
    collectionSlug: v.string(),
    contractAddress: v.string(),
    analysis: v.object({
      totalHolders: v.number(),
      whaleHolders: v.number(), // >1% supply
      dolphinHolders: v.number(), // 0.1-1%
      fishHolders: v.number(), // <0.1%
      diamondHands: v.number(), // Hold >6 months
      paperHands: v.number(), // Sell <1 month
      averageHoldingPeriod: v.number(), // Days
      holderLoyalty: v.number(), // 0-100 score
      concentrationRatio: v.number(), // Top 10 holders percentage
      distributionGini: v.number(), // Wealth distribution index
    }),
    topHolders: v.array(v.object({
      address: v.string(),
      tokenCount: v.number(),
      percentage: v.number(),
      averageHoldingPeriod: v.number(),
      acquisitionPattern: v.union(
        v.literal("accumulator"),
        v.literal("flipper"), 
        v.literal("holder"),
        v.literal("whale")
      ),
    })),
    expiresAt: v.number(),
  })
  .index("by_session", ["sessionId"])
  .index("by_collection", ["collectionSlug"])
  .index("by_contract", ["contractAddress"])
  .index("by_expires", ["expiresAt"]),

  marketTiming: defineTable({
    sessionId: v.id("sessions"),
    collectionSlug: v.string(),
    analysis: v.object({
      currentPhase: v.union(
        v.literal("accumulation"),
        v.literal("markup"),
        v.literal("distribution"),
        v.literal("markdown")
      ),
      momentum: v.object({
        price: v.union(v.literal("bullish"), v.literal("bearish"), v.literal("neutral")),
        volume: v.union(v.literal("increasing"), v.literal("decreasing"), v.literal("stable")),
        sentiment: v.union(v.literal("positive"), v.literal("negative"), v.literal("neutral")),
      }),
      technicals: v.object({
        support: v.number(),
        resistance: v.number(),
        rsi: v.number(), // Relative Strength Index
        volatility: v.number(),
        liquidityScore: v.number(),
      }),
      cycles: v.object({
        dayOfWeekPattern: v.array(v.number()), // Volume by day
        hourlyPattern: v.array(v.number()), // Activity by hour
        monthlyTrend: v.number(), // -1 to 1
        seasonalityScore: v.number(), // 0-100
      }),
      predictions: v.object({
        nextWeekDirection: v.union(v.literal("up"), v.literal("down"), v.literal("sideways")),
        confidence: v.number(), // 0-100
        optimalBuyTiming: v.string(),
        optimalSellTiming: v.string(),
      }),
    }),
    expiresAt: v.number(),
  })
  .index("by_session", ["sessionId"])
  .index("by_collection", ["collectionSlug"])
  .index("by_expires", ["expiresAt"]),

  crossCollectionRelationships: defineTable({
    sessionId: v.id("sessions"),
    walletAddress: v.string(),
    relationships: v.array(v.object({
      collectionA: v.string(),
      collectionB: v.string(),
      relationshipType: v.union(
        v.literal("ecosystem"), // Same creator/theme
        v.literal("community"), // Shared holders
        v.literal("derivative"), // Related art/concept
        v.literal("competitor"), // Similar market position
        v.literal("correlated") // Price correlation
      ),
      strength: v.number(), // 0-100
      sharedHolderCount: v.number(),
      priceCorrelation: v.number(), // -1 to 1
      volumeCorrelation: v.number(),
      culturalConnection: v.optional(v.string()),
    })),
    ecosystemMap: v.object({
      coreCollections: v.array(v.string()), // Blue chips
      satelliteCollections: v.array(v.string()), // Derivatives
      emergingCollections: v.array(v.string()), // New but related
      influenceScore: v.number(), // How influential is this wallet's taste
    }),
    expiresAt: v.number(),
  })
  .index("by_session", ["sessionId"])
  .index("by_wallet", ["walletAddress"])
  .index("by_expires", ["expiresAt"]),

  temporalAnalysis: defineTable({
    sessionId: v.id("sessions"),
    walletAddress: v.string(),
    patterns: v.object({
      mintingBehavior: v.object({
        prefersMints: v.boolean(),
        avgTimeToMint: v.number(), // Minutes after drop
        mintSuccess: v.number(), // Percentage
        gasBidStrategy: v.union(
          v.literal("aggressive"),
          v.literal("moderate"),
          v.literal("conservative")
        ),
      }),
      tradingCycles: v.object({
        avgHoldingPeriod: v.number(), // Days
        sellPressurePoints: v.array(v.number()), // Price multiples
        buyOpportunityPatterns: v.array(v.string()),
        seasonalPreferences: v.record(v.string(), v.number()),
      }),
      accumulation: v.object({
        isAccumulating: v.boolean(),
        accumationRate: v.number(), // NFTs per month
        focusedCollections: v.array(v.string()),
        diversificationTrend: v.union(
          v.literal("focusing"), 
          v.literal("diversifying"),
          v.literal("maintaining")
        ),
      }),
      marketTiming: v.object({
        buysTiming: v.union(
          v.literal("early"), 
          v.literal("peak"),
          v.literal("dip"),
          v.literal("random")
        ),
        sellsTiming: v.union(
          v.literal("early"),
          v.literal("peak"),
          v.literal("late"),
          v.literal("holds")
        ),
        fomoBehavior: v.number(), // 0-100 score
        patienceScore: v.number(), // 0-100
      }),
    }),
    trends: v.object({
      recentActivity: v.union(
        v.literal("increasing"),
        v.literal("decreasing"),
        v.literal("stable")
      ),
      portfolioEvolution: v.array(v.object({
        month: v.string(),
        totalValue: v.number(),
        collectionCount: v.number(),
        nftCount: v.number(),
      })),
      predictedBehavior: v.object({
        nextAction: v.union(
          v.literal("buy"),
          v.literal("sell"),
          v.literal("hold"),
          v.literal("mint")
        ),
        confidence: v.number(),
        reasoning: v.string(),
      }),
    }),
    expiresAt: v.number(),
  })
  .index("by_session", ["sessionId"])
  .index("by_wallet", ["walletAddress"])
  .index("by_expires", ["expiresAt"]),
});
