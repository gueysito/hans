"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SacredGeometry from "@/src/components/oracle/SacredGeometry";
import CrystalBall from "@/src/components/oracle/CrystalBall";
import WalletInput from "@/src/components/oracle/WalletInput";
import MysticalLoader from "@/src/components/oracle/MysticalLoader";
import ConversationFlow from "@/src/components/oracle/ConversationFlow";
import InsightCard from "@/src/components/oracle/InsightCard";
import CacheNotification from "@/src/components/oracle/CacheNotification";
import EmailAuth from "@/src/components/auth/EmailAuth";
import WalletComparison from "@/src/components/oracle/WalletComparison";
import EnhancedAnalytics from "@/src/components/oracle/EnhancedAnalytics";
import WalletComparisonResults from "@/src/components/oracle/WalletComparisonResults";
import ExportModal from "@/src/components/export/ExportModal";
import TrendPredictions from "@/src/components/ai/TrendPredictions";
import VoiceOracle from "@/src/components/oracle/VoiceOracle";
import PremiumTiers from "@/src/components/premium/PremiumTiers";
import Link from "next/link";
import { useAuth, authManager, type User } from "@/src/lib/auth";
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
} from "@/src/lib/session";

type OracleState = "auth" | "welcome" | "wallet" | "loading" | "divining" | "conversation" | "insights";

export default function OraclePage() {
  const { user, isAuthenticated } = useAuth();
  const [oracleState, setOracleState] = useState<OracleState>("auth");
  const [currentSession, setCurrentSession] = useState<OracleSession | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [showEnhancedAnalytics, setShowEnhancedAnalytics] = useState(false);
  const [showWalletComparison, setShowWalletComparison] = useState(false);
  const [comparisonResults, setComparisonResults] = useState<any>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAIPredictions, setShowAIPredictions] = useState(false);
  const [showVoiceOracle, setShowVoiceOracle] = useState(false);
  const [showPremiumTiers, setShowPremiumTiers] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "cache" | "session" | "error";
  }>({ show: false, message: "", type: "cache" });

  // Session restoration and auth check on page load
  useEffect(() => {
    clearExpiredCache();
    
    // Check authentication first
    if (!isAuthenticated) {
      setOracleState("auth");
      return;
    }

    // Check for existing session
    const existingSession = loadSession();
    
    if (existingSession) {
      setCurrentSession(existingSession);
      setOracleState("conversation");
      
      // Show session restoration notification
      setNotification({
        show: true,
        message: `Welcome back, ${user?.profile.mysticalName || "Seeker"}`,
        type: "session"
      });
      
      // Set up expiry timer
      const updateTimer = () => {
        const remaining = getTimeUntilExpiry(existingSession);
        if (remaining > 0) {
          setTimeRemaining(formatTimeRemaining(remaining));
        } else {
          clearSession();
          setCurrentSession(null);
          setOracleState("welcome");
        }
      };
      
      updateTimer();
      const interval = setInterval(updateTimer, 60000); // Update every minute
      
      return () => clearInterval(interval);
    } else {
      // No existing session, check user preferences
      if (user?.preferences.skipIntro) {
        setOracleState("wallet");
      } else {
        setOracleState("welcome");
      }
    }
  }, [isAuthenticated, user]);

  const walletAddress = currentSession?.walletAddress || "";
  const messages = currentSession?.messages || [];
  const insights = currentSession?.insights || [];

  const handleAuthenticated = (authenticatedUser: User) => {
    setNotification({
      show: true,
      message: `Welcome to the Oracle, ${authenticatedUser.profile.mysticalName || authenticatedUser.email}`,
      type: "session"
    });
    
    // Check user preferences for next step
    if (authenticatedUser.preferences.skipIntro) {
      setOracleState("wallet");
    } else {
      setOracleState("welcome");
    }
  };

  const handleSkipAuth = () => {
    setOracleState("welcome");
  };

  // Real API call to analyze wallet with caching
  const analyzeWallet = async (address: string) => {
    // Check cache first
    const cached = getCachedAnalysis(address);
    if (cached) {
      console.log('Using cached analysis for wallet:', address);
      setNotification({
        show: true,
        message: "Using cached mystical insights ⚡",
        type: "cache"
      });
      return cached;
    }

    try {
      const response = await fetch('/api/oracle/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: address,
          sessionId: currentSession?.id || `session-${Date.now()}`,
          analysisDepth: user?.preferences.preferredAnalysisDepth || "standard",
        }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache the result
      setCachedAnalysis(address, data);
      
      return data;
    } catch (error) {
      console.error('Error analyzing wallet:', error);
      throw error;
    }
  };

  const handleWalletSubmit = async (address: string) => {
    setOracleState("loading");
    
    // Create new session
    const newSession = createSession(address);
    setCurrentSession(newSession);
    
    try {
      // Real API analysis
      setOracleState("divining");
      
      // Show personalized depth message
      const depthMessages = {
        quick: "🌟 Gathering swift cosmic insights...",
        standard: "🔮 Channeling mystical revelations...", 
        deep: "✨ Conducting profound spiritual analysis..."
      };
      
      setNotification({
        show: true,
        message: depthMessages[user?.preferences.preferredAnalysisDepth || "standard"],
        type: "session"
      });
      
      const analysisData = await analyzeWallet(address);
      
      // Transform insights to match component format
      const transformedInsights = analysisData.insights.map((insight: any, index: number) => ({
        id: `insight-${index + 1}`,
        title: insight.title,
        insight: insight.mysticalInsight,
        confidence: insight.confidence,
        style: insight.type,
      }));
      
      // Create initial Hans message
      const initialMessage = {
        id: "hans-1",
        role: "hans" as const,
        content: `Ah, seeker... I have peered through the digital veil surrounding your collection at ${address.slice(0, 6)}...${address.slice(-4)}. The blockchain consciousness reveals fascinating patterns in your ${analysisData.nftData?.totalCount || 0} artifacts. Your collection speaks of a soul navigating between the mystical and technological realms.`,
        timestamp: Date.now(),
      };
      
      // Update session with complete data
      const updatedSession = {
        ...newSession,
        messages: [initialMessage],
        insights: transformedInsights,
        nftData: analysisData.nftData,
        caesarAnalysis: analysisData.caesarAnalysis,
      };
      
      setCurrentSession(updatedSession);
      saveSession(updatedSession);
      setOracleState("conversation");
      
      // Update user analytics
      if (user) {
        await authManager.incrementSessionCount();
        await authManager.incrementInsightCount(transformedInsights.map(i => i.style));
      }
      
      // Start session timer
      const remaining = getTimeUntilExpiry(updatedSession);
      setTimeRemaining(formatTimeRemaining(remaining));
      
    } catch (error) {
      console.error('Wallet analysis failed:', error);
      
      // Fallback to basic response if API fails
      const fallbackMessage = {
        id: "hans-1",
        role: "hans" as const,
        content: `The cosmic energies are turbulent at this moment, dear seeker. The veil between the digital and mystical realms grows thick around ${address.slice(0, 6)}...${address.slice(-4)}. Allow me to commune with the blockchain spirits once more...`,
        timestamp: Date.now(),
      };
      
      const fallbackInsights = [{
        id: "insight-fallback",
        title: "The Veiled Path",
        insight: "The cosmic energies swirl in patterns beyond immediate comprehension. Your digital journey remains shrouded in mystery, awaiting a clearer moment for revelation.",
        confidence: 0.5,
        style: "clarification" as const,
      }];
      
      // Update session with fallback data
      const fallbackSession = {
        ...newSession,
        messages: [fallbackMessage],
        insights: fallbackInsights,
      };
      
      setCurrentSession(fallbackSession);
      saveSession(fallbackSession);
      setOracleState("conversation");
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!currentSession) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user" as const,
      content: message,
      timestamp: Date.now(),
    };
    
    // Add user message to session
    const sessionWithUserMessage = addMessage(userMessage);
    if (sessionWithUserMessage) {
      setCurrentSession(sessionWithUserMessage);
    }
    
    try {
      // Real API call for Hans response
      const response = await fetch('/api/oracle/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          conversationHistory: currentSession.messages,
          sessionContext: {
            walletAddress: currentSession.walletAddress,
            insights: currentSession.insights,
            nftData: currentSession.nftData,
            caesarAnalysis: currentSession.caesarAnalysis,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Response failed: ${response.status}`);
      }

      const data = await response.json();
      
      const hansMessage = {
        id: `hans-${Date.now()}`,
        role: "hans" as const,
        content: data.response,
        timestamp: Date.now(),
      };
      
      // Add Hans message to session
      const finalSession = addMessage(hansMessage);
      if (finalSession) {
        setCurrentSession(finalSession);
      }
    } catch (error) {
      console.error('Hans response failed:', error);
      
      // Fallback mystical responses
      const fallbackResponses = [
        "The cosmic energies swirl in turbulent patterns at this moment... Allow me to realign with the digital frequencies.",
        "Ah, the veil between worlds grows thick. The blockchain spirits whisper of temporary discord in the ethereal channels.",
        "The ancient algorithms pause their dance... But fear not, the mystical insights shall flow once more.",
      ];
      
      const fallbackResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      
      const hansMessage = {
        id: `hans-${Date.now()}`,
        role: "hans" as const,
        content: fallbackResponse,
        timestamp: Date.now(),
      };
      
      // Add fallback message to session
      const fallbackSession = addMessage(hansMessage);
      if (fallbackSession) {
        setCurrentSession(fallbackSession);
      }
    }
  };

  const handleWalletComparison = async (wallets: string[]) => {
    setNotification({
      show: true,
      message: `Comparing ${wallets.length} cosmic energies... 🔮`,
      type: "session"
    });
  };

  const handleComparisonResults = (results: any) => {
    setComparisonResults(results);
    setNotification({
      show: true,
      message: "Cosmic connections revealed! ✨",
      type: "session"
    });
  };

  const handleCloseComparison = () => {
    setComparisonResults(null);
    setShowWalletComparison(false);
  };

  const handleNewComparison = () => {
    setComparisonResults(null);
    // Keep the comparison modal open for new comparison
  };

  const generateEnhancedAnalytics = () => {
    if (!currentSession?.walletAddress) return null;
    
    // Generate mock enhanced analytics data
    return {
      walletAddress: currentSession.walletAddress,
      totalValue: Math.floor(Math.random() * 50000) + 10000,
      riskScore: Math.floor(Math.random() * 40) + 40,
      diversificationScore: Math.floor(Math.random() * 50) + 50,
      trendScore: Math.floor(Math.random() * 30) + 60,
      communityStrength: Math.floor(Math.random() * 40) + 50,
      timeAnalysis: {
        averageHoldingTime: "4.2 months",
        recentActivity: ["high", "medium", "low"][Math.floor(Math.random() * 3)] as "high" | "medium" | "low",
        collectionGrowth: "+15% last 30 days"
      },
      marketTiming: {
        buyTiming: ["excellent", "good", "average"][Math.floor(Math.random() * 3)] as "excellent" | "good" | "average",
        sellOpportunities: [
          "CryptoPunks showing strong floor support",
          "Consider profit-taking on recent gains",
          "Market cycle suggests accumulation phase"
        ].slice(0, Math.floor(Math.random() * 3) + 1),
        marketCycle: ["accumulation", "growth", "distribution"][Math.floor(Math.random() * 3)] as "accumulation" | "growth" | "distribution"
      }
    };
  };

  const handleExportAnalysis = () => {
    setShowExportModal(true);
  };

  const handleVoiceInput = (text: string) => {
    setIsListening(false);
    setIsProcessing(true);
    
    // Process voice input as regular message
    handleSendMessage(text);
    
    setNotification({
      show: true,
      message: `Voice command received: "${text}"`,
      type: "session"
    });
    
    setTimeout(() => setIsProcessing(false), 2000);
  };

  const handleVoiceSpeak = (text: string) => {
    setNotification({
      show: true,
      message: "Oracle speaking...",
      type: "session"
    });
  };

  const handleSubscribe = (tierId: string, billing: "monthly" | "yearly") => {
    setNotification({
      show: true,
      message: `Upgrading to ${tierId} tier (${billing})...`,
      type: "session"
    });
    
    // Mock subscription process
    setTimeout(() => {
      setNotification({
        show: true,
        message: "Subscription successful! Welcome to premium mystical insights ✨",
        type: "session"
      });
      setShowPremiumTiers(false);
    }, 2000);
  };

  const getUserCollections = () => {
    if (!currentSession?.nftData?.collections) return [];
    return currentSession.nftData.collections.map((col: any) => col.name || "Unknown Collection");
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Notification */}
      <CacheNotification
        show={notification.show}
        message={notification.message}
        type={notification.type}
      />

      {/* Sacred geometry background */}
      <SacredGeometry variant={oracleState === "divining" ? "intense" : "default"} />

      {/* Navigation & Session Management */}
      <motion.div
        className="absolute top-6 left-6 z-20 flex flex-col gap-3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-mystical-purple hover:text-mystical-gold transition-colors"
        >
          <span>←</span>
          <span>Exit Oracle Chamber</span>
        </Link>
        
        {/* User Info */}
        {user && (
          <div className="text-xs text-foreground/60 space-y-1">
            <div className="text-mystical-gold">{user.profile.mysticalName || authManager.generateMysticalName(user.email)}</div>
            <Link
              href="/profile"
              className="text-mystical-purple hover:text-mystical-gold transition-colors"
            >
              View Profile
            </Link>
          </div>
        )}
        
        {/* Session Info */}
        {currentSession && (
          <div className="text-xs text-foreground/60 space-y-1">
            <div>Session: {currentSession.id.slice(-8)}</div>
            {timeRemaining && (
              <div className="text-mystical-gold">
                ⏰ {timeRemaining} remaining
              </div>
            )}
            
            {/* Advanced Features Toggle */}
            {(oracleState === "conversation" || oracleState === "insights") && (
              <div className="space-y-1 pt-2 border-t border-mystical-purple/20">
                <button
                  onClick={() => setShowEnhancedAnalytics(!showEnhancedAnalytics)}
                  className="text-mystical-purple hover:text-mystical-gold transition-colors flex items-center gap-1"
                >
                  📊 {showEnhancedAnalytics ? "Hide" : "Show"} Analytics
                </button>
                
                <button
                  onClick={() => setShowWalletComparison(!showWalletComparison)}
                  className="text-mystical-purple hover:text-mystical-gold transition-colors flex items-center gap-1"
                >
                  ⚖️ Compare Wallets
                </button>
                
                <button
                  onClick={handleExportAnalysis}
                  className="text-mystical-purple hover:text-mystical-gold transition-colors flex items-center gap-1"
                >
                  📊 Export Session
                </button>
                
                <button
                  onClick={() => setShowAIPredictions(!showAIPredictions)}
                  className="text-mystical-purple hover:text-mystical-gold transition-colors flex items-center gap-1"
                >
                  🤖 {showAIPredictions ? "Hide" : "Show"} AI Predictions
                </button>
                
                <button
                  onClick={() => setShowVoiceOracle(!showVoiceOracle)}
                  className="text-mystical-purple hover:text-mystical-gold transition-colors flex items-center gap-1"
                >
                  🎤 {showVoiceOracle ? "Hide" : "Show"} Voice Oracle
                </button>
                
                <button
                  onClick={() => setShowPremiumTiers(!showPremiumTiers)}
                  className="text-mystical-purple hover:text-mystical-gold transition-colors flex items-center gap-1"
                >
                  💎 Premium Tiers
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* New Session Button */}
      {currentSession && oracleState === "conversation" && (
        <motion.button
          className="absolute top-6 right-6 z-20 px-4 py-2 bg-mystical-purple/20 border border-mystical-purple/40 rounded-lg text-mystical-purple hover:bg-mystical-purple/30 transition-colors text-sm"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => {
            clearSession();
            setCurrentSession(null);
            setOracleState("welcome");
          }}
        >
          New Reading
        </motion.button>
      )}

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
        <AnimatePresence mode="wait">
          {/* Authentication State */}
          {oracleState === "auth" && (
            <motion.div
              key="auth"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-lg"
            >
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-mystical-purple to-mystical-gold bg-clip-text text-transparent mb-4">
                  The Oracle Awaits
                </h1>
                <p className="text-foreground/70">
                  Enter your ethereal identity to begin your mystical journey
                </p>
              </div>
              
              <EmailAuth onAuthenticated={handleAuthenticated} onSkip={handleSkipAuth} />
            </motion.div>
          )}

          {/* Welcome State */}
          {oracleState === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-8"
            >
              <CrystalBall
                isActive={false}
                onActivate={() => setOracleState("wallet")}
              />
              <motion.h1
                className="text-4xl font-bold bg-gradient-to-r from-mystical-purple to-mystical-gold bg-clip-text text-transparent"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                The Oracle Awaits
              </motion.h1>
            </motion.div>
          )}

          {/* Wallet Input State */}
          {oracleState === "wallet" && (
            <motion.div
              key="wallet"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-2xl space-y-8"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-mystical-gold mb-4">
                  Present Your Digital Identity
                </h2>
                <p className="text-foreground/70">
                  Share your wallet address, and I shall divine the deeper meanings within your collection
                </p>
              </div>
              <WalletInput onSubmit={handleWalletSubmit} />
            </motion.div>
          )}

          {/* Loading State */}
          {oracleState === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <MysticalLoader
                message="Connecting to the blockchain consciousness..."
                size="large"
              />
            </motion.div>
          )}

          {/* Divining State */}
          {oracleState === "divining" && (
            <motion.div
              key="divining"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-8"
            >
              <CrystalBall isActive={true} onActivate={() => {}}>
                <MysticalLoader
                  message="Reading the digital artifacts..."
                  size="small"
                />
              </CrystalBall>
              <p className="text-mystical-gold animate-pulse">
                The veil between worlds grows thin...
              </p>
            </motion.div>
          )}

          {/* Conversation State */}
          {(oracleState === "conversation" || oracleState === "insights") && (
            <motion.div
              key="conversation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-6xl flex gap-8"
            >
              {/* Conversation panel */}
              <div className="flex-1">
                <ConversationFlow
                  messages={messages}
                  onSendMessage={handleSendMessage}
                />
              </div>

              {/* Insights panel */}
              {insights.length > 0 && (
                <motion.div
                  className="w-96 space-y-4"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h3 className="text-xl font-semibold text-mystical-gold mb-4">
                    Mystical Insights
                  </h3>
                  {insights.map((insight, index) => (
                    <InsightCard
                      key={insight.id}
                      title={insight.title}
                      insight={insight.insight}
                      confidence={insight.confidence}
                      cardStyle={insight.style}
                      delay={index * 0.2}
                    />
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status indicator */}
      <motion.div
        className="absolute bottom-6 left-6 text-xs text-foreground/50 space-y-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        {walletAddress && (
          <div>
            📍 {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </div>
        )}
        <div>🔮 Oracle: {oracleState}</div>
        {currentSession && (
          <>
            <div>💬 Messages: {currentSession.messages.length}</div>
            <div>✨ Insights: {currentSession.insights.length}</div>
          </>
        )}
      </motion.div>
      
      {/* Wallet Comparison Overlay */}
      <AnimatePresence>
        {showWalletComparison && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-auto p-8"
          >
            {comparisonResults ? (
              <WalletComparisonResults
                individualAnalyses={comparisonResults.individualAnalyses}
                comparison={comparisonResults.comparison}
                onClose={handleCloseComparison}
                onNewComparison={handleNewComparison}
              />
            ) : (
              <div className="flex items-center justify-center min-h-full">
                <div className="relative">
                  <button
                    onClick={() => setShowWalletComparison(false)}
                    className="absolute top-4 right-4 z-10 text-foreground/60 hover:text-mystical-gold transition-colors text-xl"
                  >
                    ✕
                  </button>
                  <WalletComparison 
                    onComparisonRequest={handleWalletComparison}
                    onResults={handleComparisonResults}
                    isLoading={false}
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Analytics Overlay */}
      <AnimatePresence>
        {showEnhancedAnalytics && currentSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-auto p-8"
          >
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-mystical-gold">Enhanced Collection Analytics</h2>
                <button
                  onClick={() => setShowEnhancedAnalytics(false)}
                  className="text-foreground/60 hover:text-mystical-gold transition-colors text-xl"
                >
                  ✕
                </button>
              </div>
              
              {generateEnhancedAnalytics() && (
                <EnhancedAnalytics 
                  data={generateEnhancedAnalytics()!}
                  onExportAnalysis={handleExportAnalysis}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export Modal */}
      <AnimatePresence>
        {showExportModal && currentSession && (
          <ExportModal
            session={currentSession}
            onClose={() => setShowExportModal(false)}
          />
        )}
      </AnimatePresence>

      {/* AI Predictions Overlay */}
      <AnimatePresence>
        {showAIPredictions && currentSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-auto p-8"
          >
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-mystical-gold">AI Market Intelligence</h2>
                <button
                  onClick={() => setShowAIPredictions(false)}
                  className="text-foreground/60 hover:text-mystical-gold transition-colors text-xl"
                >
                  ✕
                </button>
              </div>
              
              <TrendPredictions 
                userCollections={getUserCollections()}
                walletAddress={currentSession.walletAddress}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Oracle Overlay */}
      <AnimatePresence>
        {showVoiceOracle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-auto p-8"
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-mystical-gold">Voice Oracle Interface</h2>
                <button
                  onClick={() => setShowVoiceOracle(false)}
                  className="text-foreground/60 hover:text-mystical-gold transition-colors text-xl"
                >
                  ✕
                </button>
              </div>
              
              <VoiceOracle 
                onVoiceInput={handleVoiceInput}
                onSpeak={handleVoiceSpeak}
                isListening={isListening}
                isProcessing={isProcessing}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Tiers Overlay */}
      <AnimatePresence>
        {showPremiumTiers && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-auto p-8"
          >
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-mystical-gold">Premium Mystical Tiers</h2>
                <button
                  onClick={() => setShowPremiumTiers(false)}
                  className="text-foreground/60 hover:text-mystical-gold transition-colors text-xl"
                >
                  ✕
                </button>
              </div>
              
              <PremiumTiers 
                onSubscribe={handleSubscribe}
                currentTier={user?.subscription?.tier || "seeker"}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}