import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Hans Oracle - Basic user management functions

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

export const getUser = query({
  args: { email: v.string() },
  
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
  },
});

export const healthCheck = query({
  args: {},
  
  handler: async (ctx) => {
    const userCount = await ctx.db.query("users").collect();
    const sessionCount = await ctx.db.query("sessions").collect();
    
    return {
      status: "Hans Oracle is ready",
      timestamp: Date.now(),
      counts: {
        users: userCount.length,
        sessions: sessionCount.length,
      },
    };
  },
});