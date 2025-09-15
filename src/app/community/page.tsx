"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth, authManager } from "@/src/lib/auth";
import SacredGeometry from "@/src/components/oracle/SacredGeometry";
import InsightGallery from "@/src/components/community/InsightGallery";
import ShareInsightModal from "@/src/components/community/ShareInsightModal";

export default function CommunityPage() {
  const { user, isAuthenticated } = useAuth();
  const [showShareModal, setShowShareModal] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({ show: false, message: "", type: "success" });

  const handleShareInsight = (insight: any) => {
    // In a real app, this would save to Convex database
    console.log("Sharing insight:", insight);
    
    setNotification({
      show: true,
      message: "Your wisdom has been shared with the cosmic community! ✨",
      type: "success"
    });

    // Hide notification after 3 seconds
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
    }, 3000);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        <SacredGeometry />
        
        <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
          <motion.div
            className="text-center max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-mystical-purple to-mystical-gold rounded-full flex items-center justify-center">
              <span className="text-3xl">🌌</span>
            </div>
            
            <h1 className="text-3xl font-bold text-mystical-gold mb-4">
              Join the Cosmic Community
            </h1>
            
            <p className="text-foreground/70 mb-6">
              Connect with fellow digital souls and discover the collective wisdom of the Web3 realm.
              Authentication required to access community features.
            </p>
            
            <div className="space-y-3">
              <Link
                href="/oracle"
                className="block px-6 py-3 bg-gradient-to-r from-mystical-purple to-mystical-gold
                         text-white font-medium rounded-lg hover:opacity-80 transition-opacity"
              >
                🔮 Enter Oracle Realm
              </Link>
              
              <Link
                href="/"
                className="block px-6 py-3 border border-mystical-purple/40 text-mystical-purple
                         rounded-lg hover:bg-mystical-purple/20 transition-colors"
              >
                ← Return to Portal
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Sacred geometry background */}
      <SacredGeometry variant="default" />
      
      {/* Notification */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-6 right-6 z-50 px-6 py-3 bg-mystical-gold/20 border border-mystical-gold/40 
                     rounded-lg backdrop-blur-sm"
          >
            <p className="text-mystical-gold font-medium">{notification.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
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
          <span>Portal</span>
        </Link>
        
        <Link
          href="/oracle"
          className="flex items-center gap-2 text-mystical-purple hover:text-mystical-gold transition-colors"
        >
          <span>🔮</span>
          <span>Oracle</span>
        </Link>
        
        <Link
          href="/profile"
          className="flex items-center gap-2 text-mystical-purple hover:text-mystical-gold transition-colors"
        >
          <span>👤</span>
          <span>Profile</span>
        </Link>
      </motion.div>

      {/* User Info */}
      <motion.div
        className="absolute top-6 right-6 z-20 text-right"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="text-sm text-foreground/60">
          <div className="text-mystical-gold font-medium">
            {user?.profile.mysticalName || authManager.generateMysticalName(user?.email || "")}
          </div>
          <div>{user?.email}</div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 pt-24 pb-12 px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          <InsightGallery 
            onShareInsight={() => setShowShareModal(true)}
          />
        </motion.div>
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <ShareInsightModal
            onClose={() => setShowShareModal(false)}
            onShare={handleShareInsight}
          />
        )}
      </AnimatePresence>

      {/* Community Stats Footer */}
      <motion.div
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="bg-background/50 backdrop-blur-sm border border-mystical-purple/30 rounded-lg px-6 py-3">
          <div className="flex items-center gap-6 text-xs text-foreground/60">
            <div className="flex items-center gap-1">
              <span>👥</span>
              <span>1,247 Cosmic Souls</span>
            </div>
            <div className="flex items-center gap-1">
              <span>✨</span>
              <span>3,891 Shared Insights</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🌌</span>
              <span>42 Active Oracles</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}