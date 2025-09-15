// Session Management for Hans Oracle
export interface OracleSession {
  id: string;
  walletAddress: string;
  createdAt: number;
  expiresAt: number;
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
  nftData?: {
    totalCount: number;
    topCollections: string[];
    collections: any[];
  };
  caesarAnalysis?: any;
}

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const STORAGE_KEY = 'hans-oracle-session';

export function generateSessionId(): string {
  return `hans-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function createSession(walletAddress: string): OracleSession {
  const now = Date.now();
  return {
    id: generateSessionId(),
    walletAddress,
    createdAt: now,
    expiresAt: now + SESSION_DURATION,
    messages: [],
    insights: [],
  };
}

export function saveSession(session: OracleSession): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch (error) {
    console.warn('Failed to save session to localStorage:', error);
  }
}

export function loadSession(): OracleSession | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const session: OracleSession = JSON.parse(stored);
    
    // Check if session is expired
    if (Date.now() > session.expiresAt) {
      clearSession();
      return null;
    }
    
    return session;
  } catch (error) {
    console.warn('Failed to load session from localStorage:', error);
    return null;
  }
}

export function updateSession(updates: Partial<OracleSession>): OracleSession | null {
  const current = loadSession();
  if (!current) return null;
  
  const updated = { ...current, ...updates };
  saveSession(updated);
  return updated;
}

export function addMessage(message: {
  id: string;
  role: "user" | "hans";
  content: string;
  timestamp: number;
}): OracleSession | null {
  const current = loadSession();
  if (!current) return null;
  
  const updated = {
    ...current,
    messages: [...current.messages, message]
  };
  
  saveSession(updated);
  return updated;
}

export function setInsights(insights: OracleSession['insights']): OracleSession | null {
  return updateSession({ insights });
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear session from localStorage:', error);
  }
}

export function isSessionExpired(session: OracleSession): boolean {
  return Date.now() > session.expiresAt;
}

export function getTimeUntilExpiry(session: OracleSession): number {
  return Math.max(0, session.expiresAt - Date.now());
}

export function formatTimeRemaining(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

// Cache management for API responses
interface ApiCache {
  [walletAddress: string]: {
    data: any;
    timestamp: number;
    expiresAt: number;
  };
}

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const CACHE_KEY = 'hans-oracle-cache';

export function getCachedAnalysis(walletAddress: string): any | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    if (!stored) return null;
    
    const cache: ApiCache = JSON.parse(stored);
    const entry = cache[walletAddress.toLowerCase()];
    
    if (!entry || Date.now() > entry.expiresAt) {
      return null;
    }
    
    return entry.data;
  } catch (error) {
    console.warn('Failed to load cache:', error);
    return null;
  }
}

export function setCachedAnalysis(walletAddress: string, data: any): void {
  if (typeof window === 'undefined') return;
  
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    const cache: ApiCache = stored ? JSON.parse(stored) : {};
    
    const now = Date.now();
    cache[walletAddress.toLowerCase()] = {
      data,
      timestamp: now,
      expiresAt: now + CACHE_DURATION,
    };
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.warn('Failed to save cache:', error);
  }
}

export function clearExpiredCache(): void {
  if (typeof window === 'undefined') return;
  
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    if (!stored) return;
    
    const cache: ApiCache = JSON.parse(stored);
    const now = Date.now();
    const cleaned: ApiCache = {};
    
    for (const [address, entry] of Object.entries(cache)) {
      if (now <= entry.expiresAt) {
        cleaned[address] = entry;
      }
    }
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(cleaned));
  } catch (error) {
    console.warn('Failed to clean cache:', error);
  }
}