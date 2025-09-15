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
      v.literal("caesar"),
      v.literal("claude")
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
});