// Authentication System for Hans Oracle
export interface SavedInsight {
  id: string;
  title: string;
  content: string;
  confidence: number;
  cardStyle: "major" | "minor" | "clarification";
  sessionId?: string;
  walletAddress?: string;
  savedAt: number;
  reaction?: "amazed" | "intrigued" | "neutral" | "confused";
  basedOnNfts?: string[];
}

export interface User {
  id: string;
  email: string;
  preferences: {
    theme: "dark";
    skipIntro: boolean;
    preferredAnalysisDepth: "quick" | "standard" | "deep";
  };
  profile: {
    mysticalName?: string;
    joinedAt: number;
    lastActiveAt: number;
    totalSessions: number;
    totalInsights: number;
    favoriteInsightTypes: string[];
    savedInsights: SavedInsight[];
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Simple localStorage-based auth for now (Convex integration when deployed)
const AUTH_KEY = 'hans-oracle-user';

export class AuthManager {
  private listeners: ((state: AuthState) => void)[] = [];
  private currentState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
  };

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      if (stored) {
        const user = JSON.parse(stored);
        this.currentState = {
          user,
          isAuthenticated: true,
          isLoading: false,
        };
      }
    } catch (error) {
      console.warn('Failed to load user from storage:', error);
      localStorage.removeItem(AUTH_KEY);
    }
  }

  private saveUser(user: User) {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    } catch (error) {
      console.warn('Failed to save user to storage:', error);
    }
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.currentState));
  }

  public subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    // Immediately call with current state
    listener(this.currentState);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public getState(): AuthState {
    return this.currentState;
  }

  public async authenticate(email: string): Promise<User> {
    this.currentState.isLoading = true;
    this.notify();

    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Invalid email format");
      }

      // Check for existing user or create new one
      const existingUser = this.currentState.user;
      
      if (existingUser && existingUser.email === email) {
        // Update last active
        existingUser.profile.lastActiveAt = Date.now();
        this.saveUser(existingUser);
        
        this.currentState = {
          user: existingUser,
          isAuthenticated: true,
          isLoading: false,
        };
      } else {
        // Create new user
        const newUser: User = {
          id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          email: email.toLowerCase().trim(),
          preferences: {
            theme: "dark",
            skipIntro: false,
            preferredAnalysisDepth: "standard",
          },
          profile: {
            joinedAt: Date.now(),
            lastActiveAt: Date.now(),
            totalSessions: 0,
            totalInsights: 0,
            favoriteInsightTypes: [],
            savedInsights: [],
          },
        };

        this.saveUser(newUser);
        
        this.currentState = {
          user: newUser,
          isAuthenticated: true,
          isLoading: false,
        };
      }

      this.notify();
      return this.currentState.user!;
    } catch (error) {
      this.currentState.isLoading = false;
      this.notify();
      throw error;
    }
  }

  public async updateProfile(updates: Partial<User['profile']>): Promise<User> {
    if (!this.currentState.user) {
      throw new Error("No authenticated user");
    }

    const updatedUser = {
      ...this.currentState.user,
      profile: {
        ...this.currentState.user.profile,
        ...updates,
      },
    };

    this.saveUser(updatedUser);
    
    this.currentState = {
      ...this.currentState,
      user: updatedUser,
    };
    
    this.notify();
    return updatedUser;
  }

  public async updatePreferences(updates: Partial<User['preferences']>): Promise<User> {
    if (!this.currentState.user) {
      throw new Error("No authenticated user");
    }

    const updatedUser = {
      ...this.currentState.user,
      preferences: {
        ...this.currentState.user.preferences,
        ...updates,
      },
    };

    this.saveUser(updatedUser);
    
    this.currentState = {
      ...this.currentState,
      user: updatedUser,
    };
    
    this.notify();
    return updatedUser;
  }

  public async incrementSessionCount(): Promise<void> {
    if (!this.currentState.user) return;

    await this.updateProfile({
      totalSessions: this.currentState.user.profile.totalSessions + 1,
      lastActiveAt: Date.now(),
    });
  }

  public async incrementInsightCount(insightTypes: string[]): Promise<void> {
    if (!this.currentState.user) return;

    const currentFavorites = this.currentState.user.profile.favoriteInsightTypes;
    const updatedFavorites = [...currentFavorites];

    // Track favorite insight types
    insightTypes.forEach(type => {
      if (!updatedFavorites.includes(type)) {
        updatedFavorites.push(type);
      }
    });

    await this.updateProfile({
      totalInsights: this.currentState.user.profile.totalInsights + insightTypes.length,
      favoriteInsightTypes: updatedFavorites,
      lastActiveAt: Date.now(),
    });
  }

  public logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_KEY);
    }
    
    this.currentState = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
    };
    
    this.notify();
  }

  public async saveInsight(insight: {
    title: string;
    content: string;
    confidence: number;
    cardStyle: "major" | "minor" | "clarification";
    sessionId?: string;
    walletAddress?: string;
    reaction?: "amazed" | "intrigued" | "neutral" | "confused";
    basedOnNfts?: string[];
  }): Promise<SavedInsight> {
    if (!this.currentState.user) {
      throw new Error("No authenticated user");
    }

    const savedInsight: SavedInsight = {
      id: `insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...insight,
      savedAt: Date.now(),
    };

    const updatedUser = {
      ...this.currentState.user,
      profile: {
        ...this.currentState.user.profile,
        savedInsights: [...this.currentState.user.profile.savedInsights, savedInsight],
      },
    };

    this.saveUser(updatedUser);
    this.currentState = {
      ...this.currentState,
      user: updatedUser,
    };
    this.notify();

    return savedInsight;
  }

  public async removeInsight(insightId: string): Promise<void> {
    if (!this.currentState.user) {
      throw new Error("No authenticated user");
    }

    const updatedUser = {
      ...this.currentState.user,
      profile: {
        ...this.currentState.user.profile,
        savedInsights: this.currentState.user.profile.savedInsights.filter(
          insight => insight.id !== insightId
        ),
      },
    };

    this.saveUser(updatedUser);
    this.currentState = {
      ...this.currentState,
      user: updatedUser,
    };
    this.notify();
  }

  public async updateInsightReaction(
    insightId: string, 
    reaction: "amazed" | "intrigued" | "neutral" | "confused"
  ): Promise<void> {
    if (!this.currentState.user) {
      throw new Error("No authenticated user");
    }

    const updatedUser = {
      ...this.currentState.user,
      profile: {
        ...this.currentState.user.profile,
        savedInsights: this.currentState.user.profile.savedInsights.map(insight =>
          insight.id === insightId ? { ...insight, reaction } : insight
        ),
      },
    };

    this.saveUser(updatedUser);
    this.currentState = {
      ...this.currentState,
      user: updatedUser,
    };
    this.notify();
  }

  public generateMysticalName(email: string): string {
    // Generate a mystical name based on email
    const prefixes = [
      "Seeker", "Oracle", "Mystic", "Sage", "Keeper", "Guardian", 
      "Wanderer", "Diviner", "Cosmic", "Ethereal", "Digital", "Quantum"
    ];
    
    const suffixes = [
      "of the Void", "of Insights", "of Dreams", "of Stars", "of Wisdom",
      "of Shadows", "of Light", "of the Blockchain", "of Mysteries", "of Truth"
    ];
    
    // Use email hash to consistently generate the same name
    const hash = email.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const prefixIndex = Math.abs(hash) % prefixes.length;
    const suffixIndex = Math.abs(hash >> 8) % suffixes.length;
    
    return `${prefixes[prefixIndex]} ${suffixes[suffixIndex]}`;
  }
}

// Global auth manager instance
export const authManager = new AuthManager();

// React hook for auth state
export function useAuth() {
  if (typeof window === 'undefined') {
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      authenticate: async () => { throw new Error("Not available on server"); },
      updateProfile: async () => { throw new Error("Not available on server"); },
      updatePreferences: async () => { throw new Error("Not available on server"); },
      logout: () => {},
    };
  }

  const [state, setState] = useState(authManager.getState());

  useEffect(() => {
    const unsubscribe = authManager.subscribe(setState);
    return unsubscribe;
  }, []);

  return {
    ...state,
    authenticate: authManager.authenticate.bind(authManager),
    updateProfile: authManager.updateProfile.bind(authManager),
    updatePreferences: authManager.updatePreferences.bind(authManager),
    saveInsight: authManager.saveInsight.bind(authManager),
    removeInsight: authManager.removeInsight.bind(authManager),
    updateInsightReaction: authManager.updateInsightReaction.bind(authManager),
    logout: authManager.logout.bind(authManager),
  };
}

// Add React import
import { useState, useEffect } from 'react';