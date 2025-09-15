"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth, authManager } from "@/src/lib/auth";
import { loadUnifiedSession, type UnifiedSession } from "@/src/lib/hybrid-session";

interface SessionHistoryItem {
  id: string;
  walletAddress: string;
  createdAt: number;
  messageCount: number;
  insightCount: number;
  isExpired: boolean;
}

export default function ProfilePage() {
  const { user, isAuthenticated, updateProfile, updatePreferences, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "preferences" | "insights" | "history">("overview");
  const [sessionHistory, setSessionHistory] = useState<SessionHistoryItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    mysticalName: "",
    preferredAnalysisDepth: "standard" as "quick" | "standard" | "deep",
    skipIntro: false,
  });

  useEffect(() => {
    if (!isAuthenticated) return;

    // Initialize edit form with user data
    setEditForm({
      mysticalName: user?.profile.mysticalName || authManager.generateMysticalName(user?.email || ""),
      preferredAnalysisDepth: user?.preferences.preferredAnalysisDepth || "standard",
      skipIntro: user?.preferences.skipIntro || false,
    });

    // Load session history (simplified for localStorage mode)
    loadSessionHistory();
  }, [user, isAuthenticated]);

  const loadSessionHistory = () => {
    // For now, we'll create mock session history
    // In a full Convex implementation, this would query the sessions table
    const mockSessions: SessionHistoryItem[] = [
      {
        id: "session-1",
        walletAddress: "0x742d35cc4bf4543c7f2e0a7d8e1e9e7c5b8f3d0c",
        createdAt: Date.now() - (2 * 24 * 60 * 60 * 1000), // 2 days ago
        messageCount: 8,
        insightCount: 3,
        isExpired: false,
      },
      {
        id: "session-2",
        walletAddress: "0x9f8c163cBA728b529d4C8Aa8d7A1D4f5E6B7C8D9",
        createdAt: Date.now() - (5 * 24 * 60 * 60 * 1000), // 5 days ago
        messageCount: 12,
        insightCount: 2,
        isExpired: false,
      },
    ];

    setSessionHistory(mockSessions);
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        mysticalName: editForm.mysticalName || authManager.generateMysticalName(user?.email || ""),
      });

      await updatePreferences({
        preferredAnalysisDepth: editForm.preferredAnalysisDepth,
        skipIntro: editForm.skipIntro,
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-mystical-gold mb-4">
            Authentication Required
          </h1>
          <p className="text-foreground/70 mb-6">
            Please authenticate to access your mystical profile
          </p>
          <Link
            href="/oracle"
            className="px-6 py-3 bg-mystical-purple/20 border border-mystical-purple/40 
                     rounded-lg text-mystical-purple hover:bg-mystical-purple/30 transition-colors"
          >
            Return to Oracle
          </Link>
        </motion.div>
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysActive = () => {
    if (!user) return 0;
    const days = Math.floor((Date.now() - user.profile.joinedAt) / (1000 * 60 * 60 * 24));
    return Math.max(1, days); // At least 1 day
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <motion.h1
              className="text-4xl font-bold text-mystical-gold mb-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {user?.profile.mysticalName || authManager.generateMysticalName(user?.email || "")}
            </motion.h1>
            <p className="text-foreground/70">
              Oracle Seeker • {user?.email}
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/oracle"
              className="px-4 py-2 bg-mystical-purple/20 border border-mystical-purple/40 
                       rounded-lg text-mystical-purple hover:bg-mystical-purple/30 transition-colors"
            >
              ← Oracle Chamber
            </Link>
            
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500/20 border border-red-500/40 
                       rounded-lg text-red-400 hover:bg-red-500/30 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-mystical-purple/20">
          {[
            { key: "overview", label: "Overview", icon: "🔮" },
            { key: "preferences", label: "Preferences", icon: "⚙️" },
            { key: "insights", label: "Saved Insights", icon: "💎" },
            { key: "history", label: "Session History", icon: "📜" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-3 rounded-t-lg transition-colors ${
                activeTab === tab.key
                  ? "bg-mystical-purple/20 border-t border-l border-r border-mystical-purple/40 text-mystical-gold"
                  : "text-foreground/70 hover:text-mystical-purple"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-3 gap-6"
            >
              {/* Stats Cards */}
              <div className="space-y-4">
                <div className="p-6 bg-background/50 border border-mystical-purple/30 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🌟</span>
                    <h3 className="text-lg font-semibold text-mystical-gold">Mystical Journey</h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-foreground/70">Oracle Sessions</span>
                      <span className="text-mystical-purple font-medium">{user?.profile.totalSessions || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/70">Insights Received</span>
                      <span className="text-mystical-purple font-medium">{user?.profile.totalInsights || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/70">Days Active</span>
                      <span className="text-mystical-purple font-medium">{getDaysActive()}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-background/50 border border-mystical-purple/30 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">✨</span>
                    <h3 className="text-lg font-semibold text-mystical-gold">Insight Affinities</h3>
                  </div>
                  <div className="space-y-2">
                    {user?.profile.favoriteInsightTypes.length === 0 ? (
                      <p className="text-foreground/50 text-sm">
                        Your insight preferences will appear here as you explore
                      </p>
                    ) : (
                      user?.profile.favoriteInsightTypes.map((type, index) => (
                        <div key={index} className="px-3 py-1 bg-mystical-purple/20 rounded-full text-xs text-mystical-purple">
                          {type}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Card */}
              <div className="md:col-span-2">
                <div className="p-6 bg-background/50 border border-mystical-purple/30 rounded-lg">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🧙‍♀️</span>
                      <h3 className="text-xl font-semibold text-mystical-gold">Mystical Identity</h3>
                    </div>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="px-3 py-1 text-sm bg-mystical-purple/20 border border-mystical-purple/40 
                               rounded-lg text-mystical-purple hover:bg-mystical-purple/30 transition-colors"
                    >
                      {isEditing ? "Cancel" : "Edit"}
                    </button>
                  </div>

                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-mystical-purple mb-2">Mystical Name</label>
                        <input
                          type="text"
                          value={editForm.mysticalName}
                          onChange={(e) => setEditForm(prev => ({ ...prev, mysticalName: e.target.value }))}
                          placeholder={authManager.generateMysticalName(user?.email || "")}
                          className="w-full p-3 bg-background/50 border border-mystical-purple/30 rounded-lg 
                                   text-foreground placeholder:text-foreground/40
                                   focus:border-mystical-gold focus:outline-none focus:ring-1 focus:ring-mystical-gold/30"
                        />
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button
                          onClick={handleSaveProfile}
                          className="px-4 py-2 bg-gradient-to-r from-mystical-purple to-mystical-gold
                                   text-white font-medium rounded-lg hover:opacity-80 transition-opacity"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 bg-foreground/10 text-foreground rounded-lg hover:bg-foreground/20 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm text-foreground/70 mb-1">Mystical Name</h4>
                        <p className="text-mystical-gold font-medium">
                          {user?.profile.mysticalName || authManager.generateMysticalName(user?.email || "")}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm text-foreground/70 mb-1">Joined the Oracle</h4>
                        <p className="text-foreground">
                          {formatDate(user?.profile.joinedAt || Date.now())}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm text-foreground/70 mb-1">Last Active</h4>
                        <p className="text-foreground">
                          {formatDate(user?.profile.lastActiveAt || Date.now())}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Preferences Tab */}
          {activeTab === "preferences" && (
            <motion.div
              key="preferences"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl"
            >
              <div className="p-6 bg-background/50 border border-mystical-purple/30 rounded-lg">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">⚙️</span>
                  <h3 className="text-xl font-semibold text-mystical-gold">Oracle Preferences</h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm text-mystical-purple mb-3">Analysis Depth</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: "quick", label: "Quick", desc: "Swift insights" },
                        { value: "standard", label: "Standard", desc: "Balanced reading" },
                        { value: "deep", label: "Deep", desc: "Profound analysis" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setEditForm(prev => ({ ...prev, preferredAnalysisDepth: option.value as any }))}
                          className={`p-3 text-sm rounded-lg border transition-colors ${
                            editForm.preferredAnalysisDepth === option.value
                              ? "bg-mystical-purple/20 border-mystical-purple/40 text-mystical-gold"
                              : "bg-background/30 border-foreground/20 text-foreground/70 hover:border-mystical-purple/30"
                          }`}
                        >
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs opacity-70">{option.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.skipIntro}
                        onChange={(e) => setEditForm(prev => ({ ...prev, skipIntro: e.target.checked }))}
                        className="w-4 h-4 accent-mystical-purple"
                      />
                      <div>
                        <div className="text-sm text-mystical-purple">Skip Introduction</div>
                        <div className="text-xs text-foreground/50">Jump directly to wallet input</div>
                      </div>
                    </label>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={handleSaveProfile}
                      className="px-6 py-3 bg-gradient-to-r from-mystical-purple to-mystical-gold
                               text-white font-medium rounded-lg hover:opacity-80 transition-opacity"
                    >
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Insights Tab */}
          {activeTab === "insights" && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">💎</span>
                <h3 className="text-xl font-semibold text-mystical-gold">Saved Insights</h3>
              </div>

              {!user?.profile.savedInsights || user.profile.savedInsights.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔮</div>
                  <h4 className="text-lg font-semibold text-mystical-gold mb-2">
                    No Saved Insights Yet
                  </h4>
                  <p className="text-foreground/70 mb-6">
                    Visit the Oracle to receive mystical insights and save your favorites
                  </p>
                  <Link
                    href="/oracle"
                    className="px-6 py-3 bg-mystical-purple/20 border border-mystical-purple/40 
                             rounded-lg text-mystical-purple hover:bg-mystical-purple/30 transition-colors"
                  >
                    Consult the Oracle
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4">
                  {user.profile.savedInsights.map((insight) => (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 bg-background/50 border border-mystical-purple/30 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {insight.cardStyle === "major" ? "✨" : 
                             insight.cardStyle === "minor" ? "🔮" : "💫"}
                          </span>
                          <div>
                            <h4 className="text-lg font-semibold text-mystical-gold">
                              {insight.title}
                            </h4>
                            <p className="text-xs text-foreground/50">
                              Saved {new Date(insight.savedAt).toLocaleDateString()}
                              {insight.walletAddress && ` • ${insight.walletAddress.slice(0, 6)}...${insight.walletAddress.slice(-4)}`}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {insight.reaction && (
                            <span className="text-sm px-2 py-1 bg-mystical-gold/20 rounded-md">
                              {insight.reaction === "amazed" ? "🤩" :
                               insight.reaction === "intrigued" ? "🤔" :
                               insight.reaction === "neutral" ? "😐" : "😕"}
                            </span>
                          )}
                          
                          {/* Confidence indicator */}
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className={`w-1.5 h-3 rounded-full ${
                                  i < Math.round(insight.confidence * 5)
                                    ? "bg-mystical-gold"
                                    : "bg-gray-600"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm leading-relaxed text-foreground/90 mb-4">
                        {insight.content}
                      </p>
                      
                      {insight.basedOnNfts && insight.basedOnNfts.length > 0 && (
                        <div className="text-xs text-foreground/50">
                          Based on {insight.basedOnNfts.length} NFT{insight.basedOnNfts.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">📜</span>
                <h3 className="text-xl font-semibold text-mystical-gold">Session History</h3>
              </div>

              {sessionHistory.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-foreground/50 mb-4">No oracle sessions yet</p>
                  <Link
                    href="/oracle"
                    className="px-4 py-2 bg-mystical-purple/20 border border-mystical-purple/40 
                             rounded-lg text-mystical-purple hover:bg-mystical-purple/30 transition-colors"
                  >
                    Begin Your First Reading
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessionHistory.map((session) => (
                    <div
                      key={session.id}
                      className="p-4 bg-background/50 border border-mystical-purple/30 rounded-lg
                               hover:border-mystical-purple/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-mystical-gold font-mono text-sm">
                            {session.walletAddress.slice(0, 6)}...{session.walletAddress.slice(-4)}
                          </span>
                          <span className="text-xs px-2 py-1 bg-mystical-purple/20 rounded-full text-mystical-purple">
                            {session.insightCount} insights
                          </span>
                        </div>
                        <span className="text-foreground/50 text-sm">
                          {formatDate(session.createdAt)}
                        </span>
                      </div>
                      <div className="text-sm text-foreground/70">
                        {session.messageCount} messages exchanged
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}