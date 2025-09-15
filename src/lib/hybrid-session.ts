// Hybrid Session Management - localStorage fallback + Convex when available
import { 
  isConvexAvailable, 
  createConvexSession, 
  getConvexSession, 
  addConvexMessage,
  storeConvexInsights,
  getConvexInsights,
  migrateLocalStorageSession,
  type ConvexSession,
  type ConvexInsight
} from "./convex-session";

import {
  loadSession,
  createSession,
  saveSession,
  addMessage,
  setInsights,
  clearSession,
  getCachedAnalysis,
  setCachedAnalysis,
  clearExpiredCache,
  formatTimeRemaining,
  getTimeUntilExpiry,
  type OracleSession,
} from "./session";

// Note: Id type will be string when Convex is not deployed

// Unified session interface
export interface UnifiedSession {
  id: string;
  walletAddress: string;
  messages: Array<{
    id: string;
    role: "user" | "hans";
    content: string;
    timestamp: number;
  }>;
  insights: Array<{
    id: string;
    title: string;
    insight: string;
    confidence: number;
    style: "major" | "minor" | "clarification";
  }>;
  nftData?: any;
  caesarAnalysis?: any;
  createdAt: number;
  expiresAt: number;
  isConvex: boolean;
}

// Initialize session management system
export async function initializeSessionSystem(): Promise<"convex" | "localStorage"> {
  if (isConvexAvailable()) {
    // Try to migrate existing localStorage data
    try {
      await migrateLocalStorageSession();
      clearExpiredCache();
      return "convex";
    } catch (error) {
      console.warn("Convex migration failed, falling back to localStorage:", error);
      return "localStorage";
    }
  }
  
  clearExpiredCache();
  return "localStorage";
}

// Create unified session
export async function createUnifiedSession(walletAddress: string, userId?: string): Promise<UnifiedSession> {
  if (isConvexAvailable() && userId) {
    try {
      const sessionId = await createConvexSession(walletAddress, userId);
      return {
        id: sessionId,
        walletAddress,
        messages: [],
        insights: [],
        createdAt: Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000),
        isConvex: true,
      };
    } catch (error) {
      console.warn("Convex session creation failed, falling back to localStorage:", error);
    }
  }
  
  // Fallback to localStorage
  const localSession = createSession(walletAddress);
  return {
    id: localSession.id,
    walletAddress: localSession.walletAddress,
    messages: [],
    insights: [],
    createdAt: localSession.createdAt,
    expiresAt: localSession.expiresAt,
    isConvex: false,
  };
}

// Load unified session
export async function loadUnifiedSession(): Promise<UnifiedSession | null> {
  // Try Convex first if available
  if (isConvexAvailable()) {
    // For now, we'll need to implement user session tracking in Convex
    // This would require user authentication to know which sessions to load
  }
  
  // Fallback to localStorage
  const localSession = loadSession();
  if (!localSession) return null;
  
  return {
    id: localSession.id,
    walletAddress: localSession.walletAddress,
    messages: localSession.messages.map(msg => ({
      id: `${msg.role}-${msg.timestamp}`,
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
    })),
    insights: localSession.insights,
    nftData: localSession.nftData,
    caesarAnalysis: localSession.caesarAnalysis,
    createdAt: localSession.createdAt,
    expiresAt: localSession.expiresAt,
    isConvex: false,
  };
}

// Add message to unified session
export async function addUnifiedMessage(
  session: UnifiedSession,
  message: {
    role: "user" | "hans";
    content: string;
    timestamp: number;
  }
): Promise<UnifiedSession> {
  if (session.isConvex) {
    try {
      await addConvexMessage(session.id, message);
      
      // Update local session object
      const messageWithId = {
        id: `${message.role}-${message.timestamp}`,
        ...message,
      };
      
      return {
        ...session,
        messages: [...session.messages, messageWithId],
      };
    } catch (error) {
      console.warn("Convex message add failed, falling back to localStorage:", error);
    }
  }
  
  // Fallback to localStorage
  const updatedLocalSession = addMessage(message);
  if (!updatedLocalSession) return session;
  
  return {
    ...session,
    messages: updatedLocalSession.messages.map(msg => ({
      id: `${msg.role}-${msg.timestamp}`,
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
    })),
  };
}

// Store insights in unified session
export async function storeUnifiedInsights(
  session: UnifiedSession,
  insights: Array<{
    title: string;
    insight: string;
    confidence: number;
    style: "major" | "minor" | "clarification";
  }>
): Promise<UnifiedSession> {
  if (session.isConvex) {
    try {
      const convexInsights = insights.map(insight => ({
        cardType: insight.style,
        title: insight.title,
        content: insight.insight,
        confidence: insight.confidence,
        basedOnNfts: [],
      }));
      
      await storeConvexInsights(session.id, convexInsights);
      
      // Update local session object
      const insightsWithIds = insights.map((insight, index) => ({
        id: `insight-${Date.now()}-${index}`,
        title: insight.title,
        insight: insight.insight,
        confidence: insight.confidence,
        style: insight.style,
      }));
      
      return {
        ...session,
        insights: insightsWithIds,
      };
    } catch (error) {
      console.warn("Convex insights storage failed, falling back to localStorage:", error);
    }
  }
  
  // Fallback to localStorage
  const insightsWithIds = insights.map((insight, index) => ({
    id: `insight-${Date.now()}-${index}`,
    title: insight.title,
    insight: insight.insight,
    confidence: insight.confidence,
    style: insight.style,
  }));
  
  setInsights(insightsWithIds);
  
  return {
    ...session,
    insights: insightsWithIds,
  };
}

// Clear unified session
export async function clearUnifiedSession(): Promise<void> {
  // Clear localStorage regardless
  clearSession();
  
  // TODO: In a full implementation, we'd also handle Convex session cleanup
  // This would require tracking the current session ID
}

// Get cached analysis with unified approach
export async function getUnifiedCachedAnalysis(walletAddress: string): Promise<any | null> {
  // Try localStorage cache first (faster)
  const localCached = getCachedAnalysis(walletAddress);
  if (localCached) return localCached;
  
  // TODO: Try Convex cache if available
  // This would require implementing Convex cache queries
  
  return null;
}

// Set cached analysis with unified approach
export async function setUnifiedCachedAnalysis(walletAddress: string, data: any): Promise<void> {
  // Always cache in localStorage (faster access)
  setCachedAnalysis(walletAddress, data);
  
  // TODO: Also cache in Convex if available
  // This would provide cross-device cache sharing
}

// Utility functions
export function getUnifiedTimeRemaining(session: UnifiedSession): string {
  const remaining = Math.max(0, session.expiresAt - Date.now());
  return formatTimeRemaining(remaining);
}

export function isUnifiedSessionExpired(session: UnifiedSession): boolean {
  return Date.now() > session.expiresAt;
}

// Save unified session (for localStorage mode)
export function saveUnifiedSession(session: UnifiedSession): void {
  if (session.isConvex) {
    // Convex sessions are automatically persisted
    return;
  }
  
  // Convert back to OracleSession format for localStorage
  const localSession: OracleSession = {
    id: session.id as string,
    walletAddress: session.walletAddress,
    messages: session.messages.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
    })),
    insights: session.insights,
    nftData: session.nftData,
    caesarAnalysis: session.caesarAnalysis,
    createdAt: session.createdAt,
    expiresAt: session.expiresAt,
  };
  
  saveSession(localSession);
}

export { initializeConvex } from "./convex-session";
export { clearExpiredCache } from "./session";