import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Create or get user by email (simple email auth)
export const createUser = mutation({
  args: {
    email: v.string(),
    preferences: v.optional(v.object({
      theme: v.literal("dark"),
      skipIntro: v.boolean(),
      preferredAnalysisDepth: v.union(
        v.literal("quick"),
        v.literal("standard"), 
        v.literal("deep")
      ),
    })),
  },
  
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
    
    if (existingUser) {
      // Update last active
      await ctx.db.patch(existingUser._id, {
        lastActiveAt: Date.now(),
      });
      return existingUser._id;
    }
    
    // Create new user
    const userId = await ctx.db.insert("users", {
      email: args.email,
      lastActiveAt: Date.now(),
      preferences: args.preferences || {
        theme: "dark",
        skipIntro: false,
        preferredAnalysisDepth: "standard",
      },
    });
    
    return userId;
  },
});

// Get user by email
export const getUserByEmail = query({
  args: { email: v.string() },
  
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
  },
});

// Get user by ID
export const getUser = query({
  args: { userId: v.id("users") },
  
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Update user preferences
export const updateUserPreferences = mutation({
  args: {
    userId: v.id("users"),
    preferences: v.object({
      theme: v.literal("dark"),
      skipIntro: v.boolean(),
      preferredAnalysisDepth: v.union(
        v.literal("quick"),
        v.literal("standard"), 
        v.literal("deep")
      ),
    }),
  },
  
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      preferences: args.preferences,
      lastActiveAt: Date.now(),
    });
    
    return true;
  },
});

// Get user's session history
export const getUserSessionHistory = query({
  args: { 
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const now = Date.now();
    
    const sessions = await ctx.db
      .query("sessions")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.gt(q.field("expiresAt"), now) // Only non-expired sessions
        )
      )
      .order("desc")
      .take(limit);
    
    // Get insights for each session
    const sessionsWithInsights = await Promise.all(
      sessions.map(async (session) => {
        const insights = await ctx.db
          .query("insightCards")
          .filter((q) => q.eq(q.field("sessionId"), session._id))
          .collect();
        
        return {
          ...session,
          insightCount: insights.length,
          lastMessageAt: session.conversationHistory.length > 0 
            ? session.conversationHistory[session.conversationHistory.length - 1].timestamp
            : session.createdAt,
        };
      })
    );
    
    return sessionsWithInsights;
  },
});

// Get user analytics
export const getUserAnalytics = query({
  args: { userId: v.id("users") },
  
  handler: async (ctx, args) => {
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    
    // Get sessions in last 30 days
    const recentSessions = await ctx.db
      .query("sessions")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.gt(q.field("createdAt"), thirtyDaysAgo)
        )
      )
      .collect();
    
    // Get total insights generated
    const totalInsights = await ctx.db
      .query("insightCards")
      .filter((q) => 
        q.and(
          q.in(q.field("sessionId"), recentSessions.map(s => s._id)),
          q.gt(q.field("deliveredAt"), thirtyDaysAgo)
        )
      )
      .collect();
    
    // Calculate stats
    const completedSessions = recentSessions.filter(s => s.status === "completed");
    const totalMessages = recentSessions.reduce((sum, s) => sum + s.conversationHistory.length, 0);
    
    // Group insights by type
    const insightsByType = totalInsights.reduce((acc, insight) => {
      acc[insight.cardType] = (acc[insight.cardType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      period: "30 days",
      sessions: {
        total: recentSessions.length,
        completed: completedSessions.length,
        completionRate: recentSessions.length > 0 ? completedSessions.length / recentSessions.length : 0,
      },
      insights: {
        total: totalInsights.length,
        byType: insightsByType,
        averageConfidence: totalInsights.length > 0 
          ? totalInsights.reduce((sum, i) => sum + i.confidence, 0) / totalInsights.length 
          : 0,
      },
      engagement: {
        totalMessages: totalMessages,
        averageMessagesPerSession: recentSessions.length > 0 ? totalMessages / recentSessions.length : 0,
      },
    };
  },
});

// Simple email validation and "login" (really just user creation/retrieval)
export const authenticateUser = mutation({
  args: { email: v.string() },
  
  handler: async (ctx, args) => {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.email)) {
      throw new Error("Invalid email format");
    }
    
    // Create or get user
    const userId = await createUser(ctx, { email: args.email });
    
    const user = await ctx.db.get(userId);
    
    return {
      userId,
      email: user?.email,
      preferences: user?.preferences,
      lastActiveAt: user?.lastActiveAt,
    };
  },
});

// Health check for users system
export const healthCheck = query({
  args: {},
  
  handler: async (ctx) => {
    const now = Date.now();
    const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);
    
    const totalUsers = await ctx.db.query("users").collect();
    const activeUsers = await ctx.db
      .query("users")
      .filter((q) => q.gt(q.field("lastActiveAt"), twentyFourHoursAgo))
      .collect();
    
    const totalSessions = await ctx.db.query("sessions").collect();
    const activeSessions = await ctx.db
      .query("sessions")
      .filter((q) => q.gt(q.field("expiresAt"), now))
      .collect();
    
    return {
      status: "Hans Oracle User System Active",
      timestamp: now,
      stats: {
        users: {
          total: totalUsers.length,
          active24h: activeUsers.length,
        },
        sessions: {
          total: totalSessions.length,
          active: activeSessions.length,
        },
      },
    };
  },
});