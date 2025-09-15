import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Create a new oracle session
export const createSession = mutation({
  args: {
    userId: v.optional(v.id("users")),
    walletAddress: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const expiresAt = now + SESSION_DURATION;
    
    const sessionId = await ctx.db.insert("sessions", {
      userId: args.userId,
      walletAddress: args.walletAddress,
      status: "initializing",
      currentStep: "Creating mystical connection...",
      conversationHistory: [],
      expiresAt,
      createdAt: now,
    });
    
    // Log analytics
    await ctx.db.insert("analytics", {
      eventType: "session_started",
      sessionId: sessionId,
      userId: args.userId,
      data: {
        timestamp: now,
        success: true,
        metadata: {
          walletAddress: args.walletAddress,
        },
      },
      createdAt: now,
    });
    
    return sessionId;
  },
});

// Get session by ID with expiration check
export const getSession = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    
    if (!session) {
      return null;
    }
    
    // Check if expired
    if (Date.now() > session.expiresAt) {
      return null;
    }
    
    return session;
  },
});

// Get user's active sessions
export const getUserSessions = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    return await ctx.db
      .query("sessions")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.gt(q.field("expiresAt"), now)
        )
      )
      .order("desc")
      .take(10); // Last 10 sessions
  },
});

// Add message to session
export const addMessage = mutation({
  args: {
    sessionId: v.id("sessions"),
    message: v.object({
      role: v.union(v.literal("user"), v.literal("hans")),
      content: v.string(),
      timestamp: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    
    if (!session || Date.now() > session.expiresAt) {
      throw new Error("Session not found or expired");
    }
    
    const updatedHistory = [...session.conversationHistory, args.message];
    
    await ctx.db.patch(args.sessionId, {
      conversationHistory: updatedHistory,
    });
    
    return updatedHistory.length;
  },
});

// Update session status and step
export const updateSessionStatus = mutation({
  args: {
    sessionId: v.id("sessions"),
    status: v.union(
      v.literal("initializing"),
      v.literal("gathering_data"),
      v.literal("analyzing"),
      v.literal("generating_insights"),
      v.literal("completed"),
      v.literal("failed")
    ),
    currentStep: v.optional(v.string()),
    completedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const updateData: any = {
      status: args.status,
    };
    
    if (args.currentStep !== undefined) {
      updateData.currentStep = args.currentStep;
    }
    
    if (args.completedAt !== undefined) {
      updateData.completedAt = args.completedAt;
    }
    
    await ctx.db.patch(args.sessionId, updateData);
    
    return true;
  },
});

// Store NFT collection data
export const storeNftData = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const expiresAt = now + (60 * 60 * 1000); // 1 hour cache
    
    await ctx.db.insert("nftCollections", {
      sessionId: args.sessionId,
      walletAddress: args.walletAddress,
      nftData: args.nftData,
      filteredData: args.filteredData,
      expiresAt,
    });
    
    // Log analytics
    await ctx.db.insert("analytics", {
      eventType: "nft_data_fetched",
      sessionId: args.sessionId,
      data: {
        timestamp: now,
        success: true,
        metadata: {
          nftCount: args.nftData.length,
          walletAddress: args.walletAddress,
        },
      },
      createdAt: now,
    });
    
    return true;
  },
});

// Store insight cards
export const storeInsights = mutation({
  args: {
    sessionId: v.id("sessions"),
    insights: v.array(v.object({
      cardType: v.union(
        v.literal("major"),
        v.literal("minor"), 
        v.literal("clarification")
      ),
      title: v.string(),
      content: v.string(),
      confidence: v.number(),
      basedOnNfts: v.array(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    for (const insight of args.insights) {
      await ctx.db.insert("insightCards", {
        sessionId: args.sessionId,
        cardType: insight.cardType,
        title: insight.title,
        content: insight.content,
        confidence: insight.confidence,
        basedOnNfts: insight.basedOnNfts,
        deliveredAt: now,
      });
    }
    
    // Log analytics
    await ctx.db.insert("analytics", {
      eventType: "insight_generated",
      sessionId: args.sessionId,
      data: {
        timestamp: now,
        success: true,
        metadata: {
          insightCount: args.insights.length,
        },
      },
      createdAt: now,
    });
    
    return args.insights.length;
  },
});

// Get insights for session
export const getSessionInsights = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("insightCards")
      .filter((q) => q.eq(q.field("sessionId"), args.sessionId))
      .order("desc")
      .collect();
  },
});

// Cache API responses
export const cacheApiResponse = mutation({
  args: {
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
    ttlHours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const ttl = (args.ttlHours || 1) * 60 * 60 * 1000; // Default 1 hour
    const expiresAt = now + ttl;
    
    // Check if cache entry already exists
    const existing = await ctx.db
      .query("apiCache")
      .filter((q) => q.eq(q.field("cacheKey"), args.cacheKey))
      .first();
    
    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, {
        response: args.response,
        expiresAt,
        createdAt: now,
      });
    } else {
      // Create new
      await ctx.db.insert("apiCache", {
        cacheKey: args.cacheKey,
        provider: args.provider,
        request: args.request,
        response: args.response,
        expiresAt,
        createdAt: now,
      });
    }
    
    return true;
  },
});

// Get cached API response
export const getCachedResponse = query({
  args: { cacheKey: v.string() },
  handler: async (ctx, args) => {
    const cached = await ctx.db
      .query("apiCache")
      .filter((q) => q.eq(q.field("cacheKey"), args.cacheKey))
      .first();
    
    if (!cached) {
      return null;
    }
    
    // Check if expired
    if (Date.now() > cached.expiresAt) {
      return null;
    }
    
    return cached.response;
  },
});

// Clean up expired sessions and cache
export const cleanupExpired = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    let cleanedCount = 0;
    
    // Clean expired sessions
    const expiredSessions = await ctx.db
      .query("sessions")
      .filter((q) => q.lt(q.field("expiresAt"), now))
      .collect();
    
    for (const session of expiredSessions) {
      await ctx.db.delete(session._id);
      cleanedCount++;
    }
    
    // Clean expired cache
    const expiredCache = await ctx.db
      .query("apiCache")
      .filter((q) => q.lt(q.field("expiresAt"), now))
      .collect();
    
    for (const cache of expiredCache) {
      await ctx.db.delete(cache._id);
      cleanedCount++;
    }
    
    // Clean expired NFT collections
    const expiredNfts = await ctx.db
      .query("nftCollections")
      .filter((q) => q.lt(q.field("expiresAt"), now))
      .collect();
    
    for (const nft of expiredNfts) {
      await ctx.db.delete(nft._id);
      cleanedCount++;
    }
    
    return { cleaned: cleanedCount, timestamp: now };
  },
});