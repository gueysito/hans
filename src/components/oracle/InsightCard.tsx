"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useAuth } from "@/src/lib/auth";

export type InsightCardStyle = "major" | "minor" | "clarification";

interface InsightCardProps {
  insight: string;
  title?: string;
  confidence: number;
  cardStyle: InsightCardStyle;
  delay?: number;
  sessionId?: string;
  walletAddress?: string;
  basedOnNfts?: string[];
  onReaction?: (reaction: "amazed" | "intrigued" | "neutral" | "confused") => void;
  onSave?: () => void;
}

const cardStyleConfig = {
  major: {
    borderColor: "border-mystical-gold",
    glowColor: "rgba(245, 158, 11, 0.3)",
    icon: "✨",
    size: "w-80",
  },
  minor: {
    borderColor: "border-mystical-purple",
    glowColor: "rgba(139, 92, 246, 0.3)",
    icon: "🔮",
    size: "w-72",
  },
  clarification: {
    borderColor: "border-purple-400",
    glowColor: "rgba(167, 139, 250, 0.3)",
    icon: "💫",
    size: "w-64",
  },
};

export default function InsightCard({
  insight,
  title,
  confidence,
  cardStyle,
  delay = 0,
  sessionId,
  walletAddress,
  basedOnNfts,
  onReaction,
  onSave,
}: InsightCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [reaction, setReaction] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const config = cardStyleConfig[cardStyle];
  const { isAuthenticated, saveInsight, updateInsightReaction } = useAuth();

  const handleReaction = async (selectedReaction: "amazed" | "intrigued" | "neutral" | "confused") => {
    setReaction(selectedReaction);
    onReaction?.(selectedReaction);
    
    // Auto-save insight with reaction if user is authenticated
    if (isAuthenticated && !isSaved) {
      await handleSave(selectedReaction);
    } else if (isAuthenticated && isSaved) {
      // Update reaction for existing saved insight
      const savedInsightId = `insight-${insight.slice(0, 20)}-${Date.now()}`;
      await updateInsightReaction(savedInsightId, selectedReaction);
    }
  };

  const handleSave = async (currentReaction?: "amazed" | "intrigued" | "neutral" | "confused") => {
    if (!isAuthenticated) return;

    try {
      await saveInsight({
        title: title || "Oracle Insight",
        content: insight,
        confidence,
        cardStyle,
        sessionId,
        walletAddress,
        basedOnNfts,
        reaction: currentReaction || reaction as any,
      });
      setIsSaved(true);
      onSave?.();
    } catch (error) {
      console.error("Failed to save insight:", error);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className={`relative ${config.size} perspective-1000`}
        initial={{ opacity: 0, y: 50, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.8 }}
        transition={{ 
          delay, 
          duration: 0.6,
          ease: "easeOut"
        }}
      >
        <motion.div
          className="relative w-full h-full preserve-3d"
          animate={{ 
            rotateY: isFlipped ? 180 : 0,
            y: [0, -10, 0],
          }}
          transition={{
            rotateY: { duration: 0.6 },
            y: { 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Front of card */}
          <motion.div
            className={`absolute w-full backface-hidden rounded-xl bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-md border-2 ${config.borderColor} p-6 cursor-pointer`}
            onClick={() => setIsFlipped(!isFlipped)}
            whileHover={{ 
              scale: 1.02,
              boxShadow: `0 10px 40px ${config.glowColor}`,
            }}
            style={{
              boxShadow: `0 5px 20px ${config.glowColor}`,
            }}
          >
            {/* Card header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{config.icon}</span>
                {title && (
                  <h3 className="text-lg font-semibold text-mystical-gold">
                    {title}
                  </h3>
                )}
              </div>
              
              <div className="flex flex-col items-end gap-2">
                {/* Save button */}
                {isAuthenticated && (
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSave();
                    }}
                    className={`text-sm px-2 py-1 rounded-md transition-all ${
                      isSaved
                        ? "bg-mystical-gold/20 text-mystical-gold"
                        : "hover:bg-mystical-purple/20 text-foreground/60 hover:text-mystical-purple"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isSaved ? "💎 Saved" : "💾 Save"}
                  </motion.button>
                )}
                
                {/* Confidence indicator */}
                <div className="flex flex-col items-end">
                  <span className="text-xs text-foreground/50 mb-1">Confidence</span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className={`w-1.5 h-3 rounded-full ${
                          i < Math.round(confidence * 5)
                            ? "bg-mystical-gold"
                            : "bg-gray-600"
                        }`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: delay + 0.1 * i }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Insight text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.3 }}
              className="space-y-2"
            >
              <motion.p 
                className={`text-sm leading-relaxed text-foreground/90 ${
                  !isExpanded && insight.length > 200 ? "line-clamp-4" : ""
                }`}
              >
                {insight}
              </motion.p>
              
              {insight.length > 200 && (
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  className="text-xs text-mystical-purple hover:text-mystical-gold transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  {isExpanded ? "Show less ↑" : "Read more ↓"}
                </motion.button>
              )}
            </motion.div>

            {/* Floating orbs animation */}
            <motion.div
              className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-mystical-gold/30"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Tap hint */}
            <motion.div
              className="absolute bottom-2 right-2 text-xs text-foreground/30"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Tap to react
            </motion.div>
          </motion.div>

          {/* Back of card - Reactions */}
          <motion.div
            className={`absolute w-full h-full backface-hidden rounded-xl bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-md border-2 ${config.borderColor} p-6`}
            style={{
              transform: "rotateY(180deg)",
              boxShadow: `0 5px 20px ${config.glowColor}`,
            }}
          >
            <div className="h-full flex flex-col">
              <h4 className="text-center text-mystical-gold mb-6">
                How does this insight resonate?
              </h4>
              
              <div className="grid grid-cols-2 gap-3 flex-grow">
                {[
                  { emoji: "🤩", label: "Amazed", value: "amazed" },
                  { emoji: "🤔", label: "Intrigued", value: "intrigued" },
                  { emoji: "😐", label: "Neutral", value: "neutral" },
                  { emoji: "😕", label: "Confused", value: "confused" },
                ].map((item) => (
                  <motion.button
                    key={item.value}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border ${
                      reaction === item.value
                        ? "border-mystical-gold bg-mystical-gold/20"
                        : "border-border hover:border-mystical-purple"
                    } transition-colors`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleReaction(item.value as "amazed" | "intrigued" | "neutral" | "confused")}
                  >
                    <span className="text-2xl mb-1">{item.emoji}</span>
                    <span className="text-xs">{item.label}</span>
                  </motion.button>
                ))}
              </div>

              <motion.button
                className="mt-4 text-xs text-foreground/50 hover:text-foreground/70"
                onClick={() => setIsFlipped(false)}
              >
                ← Back to insight
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}