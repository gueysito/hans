"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import EmailAuth from "@/src/components/auth/EmailAuth";
import { 
  initializeSessionSystem, 
  createUnifiedSession, 
  loadUnifiedSession,
  addUnifiedMessage,
  storeUnifiedInsights,
  clearUnifiedSession,
  type UnifiedSession
} from "@/src/lib/hybrid-session";

export default function ConvexTestPage() {
  const [sessionSystem, setSessionSystem] = useState<"convex" | "localStorage" | "initializing">("initializing");
  const [user, setUser] = useState<{ userId: string; email: string } | null>(null);
  const [currentSession, setCurrentSession] = useState<UnifiedSession | null>(null);
  const [testResults, setTestResults] = useState<Array<{
    test: string;
    status: "success" | "error" | "pending";
    message: string;
  }>>([]);

  useEffect(() => {
    initializeSystem();
  }, []);

  const initializeSystem = async () => {
    try {
      const system = await initializeSessionSystem();
      setSessionSystem(system);
      
      // Try to load existing session
      const existingSession = await loadUnifiedSession();
      if (existingSession) {
        setCurrentSession(existingSession);
      }
      
      addTestResult("System Initialization", "success", `Using ${system} for session management`);
    } catch (error) {
      addTestResult("System Initialization", "error", `Failed: ${error}`);
      setSessionSystem("localStorage"); // Fallback
    }
  };

  const addTestResult = (test: string, status: "success" | "error" | "pending", message: string) => {
    setTestResults(prev => [
      ...prev.filter(r => r.test !== test),
      { test, status, message }
    ]);
  };

  const runSessionTests = async () => {
    if (!user) {
      addTestResult("Session Tests", "error", "Please authenticate first");
      return;
    }

    try {
      // Test 1: Create session
      addTestResult("Create Session", "pending", "Creating new session...");
      const newSession = await createUnifiedSession("0x742d35cc4bf4543c7f2e0a7d8e1e9e7c5b8f3d0c", user.userId as any);
      setCurrentSession(newSession);
      addTestResult("Create Session", "success", `Created ${newSession.isConvex ? 'Convex' : 'localStorage'} session`);

      // Test 2: Add message
      addTestResult("Add Message", "pending", "Adding test message...");
      const messageSession = await addUnifiedMessage(newSession, {
        role: "user",
        content: "This is a test message from the Convex integration test!",
        timestamp: Date.now(),
      });
      setCurrentSession(messageSession);
      addTestResult("Add Message", "success", `Message added. Total: ${messageSession.messages.length}`);

      // Test 3: Store insights
      addTestResult("Store Insights", "pending", "Storing test insights...");
      const insightSession = await storeUnifiedInsights(messageSession, [
        {
          title: "Test Insight",
          insight: "This is a test insight generated during Convex integration testing. The hybrid system is working correctly!",
          confidence: 0.95,
          style: "major",
        },
        {
          title: "Secondary Test",
          insight: "A minor insight to verify multiple insights can be stored properly.",
          confidence: 0.73,
          style: "minor",
        }
      ]);
      setCurrentSession(insightSession);
      addTestResult("Store Insights", "success", `Insights stored. Total: ${insightSession.insights.length}`);

      addTestResult("All Tests", "success", "All session management tests passed!");

    } catch (error) {
      addTestResult("Session Tests", "error", `Tests failed: ${error}`);
    }
  };

  const clearTests = async () => {
    await clearUnifiedSession();
    setCurrentSession(null);
    setTestResults([]);
    addTestResult("System Reset", "success", "Session cleared and tests reset");
  };

  const handleAuthenticated = (userData: { userId: string; email: string }) => {
    setUser(userData);
    addTestResult("User Authentication", "success", `Authenticated as ${userData.email}`);
  };

  const handleSkip = () => {
    setUser({ userId: "anonymous", email: "anonymous@local.test" });
    addTestResult("Anonymous Mode", "success", "Continuing without persistent user account");
  };

  if (user === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-mystical-gold mb-4">
              Story 006: Convex Integration Test
            </h1>
            <p className="text-foreground/70">
              Testing the hybrid session management system
            </p>
          </div>
          
          <EmailAuth onAuthenticated={handleAuthenticated} onSkip={handleSkip} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-mystical-gold mb-2">
              Story 006: Convex Integration
            </h1>
            <p className="text-foreground/70">
              Production Backend & Database Testing
            </p>
          </div>
          <Link
            href="/oracle"
            className="px-4 py-2 bg-mystical-purple/20 border border-mystical-purple/40 
                     rounded-lg text-mystical-purple hover:bg-mystical-purple/30 transition-colors"
          >
            ← Back to Oracle
          </Link>
        </div>

        {/* System Status */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <motion.div
            className="p-4 bg-background/50 border border-mystical-purple/30 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="font-semibold text-mystical-purple mb-2">Session System</h3>
            <p className="text-sm text-foreground/70">
              {sessionSystem === "initializing" ? "Initializing..." : 
               sessionSystem === "convex" ? "✅ Convex Active" : "⚠️ localStorage Fallback"}
            </p>
          </motion.div>

          <motion.div
            className="p-4 bg-background/50 border border-mystical-purple/30 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="font-semibold text-mystical-purple mb-2">User</h3>
            <p className="text-sm text-foreground/70">
              {user.email}
            </p>
          </motion.div>

          <motion.div
            className="p-4 bg-background/50 border border-mystical-purple/30 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="font-semibold text-mystical-purple mb-2">Current Session</h3>
            <p className="text-sm text-foreground/70">
              {currentSession ? 
                `${currentSession.isConvex ? "Convex" : "localStorage"} - ${currentSession.messages.length} msgs, ${currentSession.insights.length} insights` :
                "No active session"
              }
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
        {/* Test Controls */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="p-6 bg-background/50 border border-mystical-purple/30 rounded-lg">
            <h2 className="text-xl font-semibold text-mystical-gold mb-4">Test Controls</h2>
            
            <div className="space-y-3">
              <button
                onClick={runSessionTests}
                disabled={sessionSystem === "initializing"}
                className="w-full p-3 bg-mystical-purple/20 border border-mystical-purple/40 
                         rounded-lg text-mystical-purple hover:bg-mystical-purple/30 
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Run Session Management Tests
              </button>

              <button
                onClick={clearTests}
                className="w-full p-3 bg-red-500/20 border border-red-500/40 
                         rounded-lg text-red-400 hover:bg-red-500/30 transition-colors"
              >
                Clear Session & Reset Tests
              </button>
            </div>

            {/* Story 006 Features */}
            <div className="mt-6 pt-4 border-t border-mystical-purple/20">
              <h3 className="font-semibold text-mystical-purple mb-3">Story 006 Features</h3>
              <ul className="text-sm text-foreground/70 space-y-1">
                <li>✅ Convex database schema & functions</li>
                <li>✅ User authentication system</li>
                <li>✅ Hybrid session management</li>
                <li>✅ API response caching</li>
                <li>✅ localStorage ↔ Convex migration</li>
                <li>✅ Session persistence & expiration</li>
                <li>✅ Analytics & usage tracking</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Test Results */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="p-6 bg-background/50 border border-mystical-purple/30 rounded-lg">
            <h2 className="text-xl font-semibold text-mystical-gold mb-4">Test Results</h2>
            
            <div className="space-y-3">
              {testResults.length === 0 ? (
                <p className="text-foreground/50 text-sm">No tests run yet</p>
              ) : (
                testResults.map((result, index) => (
                  <motion.div
                    key={`${result.test}-${index}`}
                    className={`p-3 rounded-lg border ${
                      result.status === "success" ? "bg-green-500/10 border-green-500/30 text-green-400" :
                      result.status === "error" ? "bg-red-500/10 border-red-500/30 text-red-400" :
                      "bg-mystical-gold/10 border-mystical-gold/30 text-mystical-gold"
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{result.test}</span>
                      <span className="text-xs">
                        {result.status === "success" ? "✅" : 
                         result.status === "error" ? "❌" : "⏳"}
                      </span>
                    </div>
                    <p className="text-sm opacity-80">{result.message}</p>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}