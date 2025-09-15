// Convex Session Management for Hans Oracle
import { ConvexReactClient } from "convex/react";

// Conditional imports - only available when Convex is deployed
let api: any = null;

// Note: This will be initialized when Convex is properly deployed
let convexClient: ConvexReactClient | null = null;

export function initializeConvex(url: string) {
  if (!convexClient) {
    convexClient = new ConvexReactClient(url);
    
    // Try to dynamically load Convex API
    try {
      if (typeof require !== 'undefined') {
        const convexApi = require("../../../convex/_generated/api");
        api = convexApi.api;
        console.info("Convex API loaded successfully");
      }
    } catch (error) {
      console.info("Convex API not available, using localStorage fallback");
    }
  }
  return convexClient;
}

export interface ConvexSession {
  _id: string; // Id<"sessions"> when Convex is available
  userId?: string; // Id<"users"> when Convex is available
  walletAddress: string;
  status: "initializing" | "gathering_data" | "analyzing" | "generating_insights" | "completed" | "failed";
  currentStep: string;
  conversationHistory: Array<{
    role: "user" | "hans";
    content: string;
    timestamp: number;
  }>;
  expiresAt: number;
  createdAt: number;
  completedAt?: number;
}

export interface ConvexInsight {
  _id: string; // Id<"insightCards"> when Convex is available
  sessionId: string; // Id<"sessions"> when Convex is available
  cardType: "major" | "minor" | "clarification";
  title: string;
  content: string;
  confidence: number;
  basedOnNfts: string[];
  deliveredAt: number;
}

// Create a new oracle session
export async function createConvexSession(
  walletAddress: string,
  userId?: string
): Promise<string> {
  if (!convexClient || !api) {
    throw new Error("Convex client not initialized or not deployed");
  }
  
  return await convexClient.mutation(api.sessions.createSession, {
    walletAddress,
    userId,
  });
}

// Get session by ID
export async function getConvexSession(sessionId: string): Promise<ConvexSession | null> {
  if (!convexClient || !api) {
    throw new Error("Convex client not initialized or not deployed");
  }
  
  return await convexClient.query(api.sessions.getSession, { sessionId });
}

// Add message to session
export async function addConvexMessage(
  sessionId: string,
  message: {
    role: "user" | "hans";
    content: string;
    timestamp: number;
  }
): Promise<number> {
  if (!convexClient || !api) {
    throw new Error("Convex client not initialized or not deployed");
  }
  
  return await convexClient.mutation(api.sessions.addMessage, {
    sessionId,
    message,
  });
}

// Update session status
export async function updateConvexSessionStatus(
  sessionId: string,
  status: ConvexSession["status"],
  currentStep?: string,
  completedAt?: number
): Promise<boolean> {
  if (!convexClient || !api) {
    throw new Error("Convex client not initialized or not deployed");
  }
  
  return await convexClient.mutation(api.sessions.updateSessionStatus, {
    sessionId,
    status,
    currentStep,
    completedAt,
  });
}

// Store insights
export async function storeConvexInsights(
  sessionId: string,
  insights: Array<{
    cardType: "major" | "minor" | "clarification";
    title: string;
    content: string;
    confidence: number;
    basedOnNfts: string[];
  }>
): Promise<number> {
  if (!convexClient || !api) {
    throw new Error("Convex client not initialized or not deployed");
  }
  
  return await convexClient.mutation(api.sessions.storeInsights, {
    sessionId,
    insights,
  });
}

// Get insights for session
export async function getConvexInsights(sessionId: string): Promise<ConvexInsight[]> {
  if (!convexClient || !api) {
    throw new Error("Convex client not initialized or not deployed");
  }
  
  return await convexClient.query(api.sessions.getSessionInsights, { sessionId });
}

// Cache API response
export async function cacheConvexApiResponse(
  cacheKey: string,
  provider: "opensea" | "caesar" | "claude",
  request: {
    url: string;
    params: Record<string, any>;
  },
  response: any,
  ttlHours?: number
): Promise<boolean> {
  if (!convexClient) {
    throw new Error("Convex client not initialized");
  }
  
  return await convexClient.mutation(api.sessions.cacheApiResponse, {
    cacheKey,
    provider,
    request,
    response,
    ttlHours,
  });
}

// Get cached response
export async function getCachedConvexResponse(cacheKey: string): Promise<any> {
  if (!convexClient) {
    throw new Error("Convex client not initialized");
  }
  
  return await convexClient.query(api.sessions.getCachedResponse, { cacheKey });
}

// Generate cache key for wallet analysis
export function generateCacheKey(walletAddress: string, type: "analysis" | "nft-data"): string {
  return `${type}-${walletAddress.toLowerCase()}-${Math.floor(Date.now() / (1000 * 60 * 60))}`; // Hour-based key
}

// Cleanup expired data
export async function cleanupExpiredData(): Promise<{ cleaned: number; timestamp: number }> {
  if (!convexClient) {
    throw new Error("Convex client not initialized");
  }
  
  return await convexClient.mutation(api.sessions.cleanupExpired, {});
}

// Utility function to migrate from localStorage to Convex
export async function migrateLocalStorageSession(): Promise<Id<"sessions"> | null> {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem('hans-oracle-session');
    if (!stored) return null;
    
    const localSession = JSON.parse(stored);
    
    // Check if session is still valid
    if (Date.now() > localSession.expiresAt) {
      localStorage.removeItem('hans-oracle-session');
      return null;
    }
    
    // Create new Convex session with local data
    const sessionId = await createConvexSession(localSession.walletAddress);
    
    // Migrate conversation history
    for (const message of localSession.messages) {
      await addConvexMessage(sessionId, message);
    }
    
    // Store insights if any
    if (localSession.insights && localSession.insights.length > 0) {
      const convexInsights = localSession.insights.map((insight: any) => ({
        cardType: insight.style,
        title: insight.title,
        content: insight.insight,
        confidence: insight.confidence,
        basedOnNfts: [],
      }));
      
      await storeConvexInsights(sessionId, convexInsights);
    }
    
    // Clear localStorage
    localStorage.removeItem('hans-oracle-session');
    
    return sessionId;
  } catch (error) {
    console.error('Failed to migrate localStorage session:', error);
    return null;
  }
}

// Check if Convex is available
export function isConvexAvailable(): boolean {
  return convexClient !== null && api !== null && process.env.NEXT_PUBLIC_CONVEX_URL !== '';
}