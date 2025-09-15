"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/src/lib/auth";

interface SharedInsight {
  id: string;
  title: string;
  content: string;
  cardStyle: "major" | "minor" | "clarification";
  confidence: number;
  authorName: string;
  authorWallet: string;
  sharedAt: number;
  reactions: {
    amazing: number;
    intriguing: number;
    neutral: number;
    confused: number;
  };
  tags: string[];
  cosmicAlignment: string;
}

interface InsightGalleryProps {
  onShareInsight: (insight: any) => void;
}

export default function InsightGallery({ onShareInsight }: InsightGalleryProps) {
  const { user } = useAuth();
  const [filter, setFilter] = useState<"all" | "major" | "minor" | "recent">("all");
  const [selectedInsight, setSelectedInsight] = useState<SharedInsight | null>(null);

  // Mock community insights - in real app this would come from Convex
  const mockInsights: SharedInsight[] = [
    {
      id: "1",
      title: "The Digital Alchemist's Awakening",
      content: "Your collection speaks of a soul in transformation, moving from the material realm into the ethereal frequencies of Web3. The CryptoPunks in your wallet are not mere images, but totems of rebellion against traditional art forms. Each NFT you hold vibrates with the energy of innovation, creating a harmonic resonance that attracts abundance from the blockchain cosmos.",
      cardStyle: "major",
      confidence: 0.92,
      authorName: "Cosmic Seeker of Truth",
      authorWallet: "0x742d35cc...3d0c",
      sharedAt: Date.now() - 3600000, // 1 hour ago
      reactions: { amazing: 42, intriguing: 23, neutral: 8, confused: 2 },
      tags: ["transformation", "cryptopunks", "rebellion", "innovation"],
      cosmicAlignment: "Jupiter ascending through digital realms"
    },
    {
      id: "2", 
      title: "Whispers from the Metaverse",
      content: "The universe reveals through your collection a deep connection to community-driven projects. Your Bored Apes and Doodles suggest a playful spirit that finds joy in collective creativity. The cosmic threads show you're drawn to projects that celebrate individuality while fostering belonging.",
      cardStyle: "minor",
      confidence: 0.78,
      authorName: "Digital Mystic of the Void",
      authorWallet: "0x9f8c163c...8d9",
      sharedAt: Date.now() - 7200000, // 2 hours ago  
      reactions: { amazing: 28, intriguing: 34, neutral: 12, confused: 5 },
      tags: ["community", "playful", "belonging", "creativity"],
      cosmicAlignment: "Mercury dancing through social chakras"
    },
    {
      id: "3",
      title: "The Collector's Karmic Pattern",
      content: "I perceive in your wallet a soul attracted to utility-driven projects. Your emphasis on functional NFTs suggests past-life experiences as a builder or creator. The blockchain recognizes your energy and draws you toward projects that serve a greater purpose beyond mere speculation.",
      cardStyle: "clarification", 
      confidence: 0.85,
      authorName: "Oracle of Ancient Algorithms",
      authorWallet: "0x1a2b3c4d...7e8f",
      sharedAt: Date.now() - 14400000, // 4 hours ago
      reactions: { amazing: 15, intriguing: 29, neutral: 18, confused: 8 },
      tags: ["utility", "builder", "purpose", "karma"],
      cosmicAlignment: "Saturn's wisdom illuminates practical paths"
    }
  ];

  const filteredInsights = mockInsights.filter(insight => {
    if (filter === "all") return true;
    if (filter === "recent") return Date.now() - insight.sharedAt < 86400000; // 24 hours
    return insight.cardStyle === filter;
  });

  const getCardIcon = (style: string) => {
    switch (style) {
      case "major": return "✨";
      case "minor": return "🔮";
      case "clarification": return "💫";
      default: return "🌟";
    }
  };

  const getCardColor = (style: string) => {
    switch (style) {
      case "major": return "border-mystical-gold/40";
      case "minor": return "border-mystical-purple/40";
      case "clarification": return "border-purple-400/40";
      default: return "border-mystical-purple/30";
    }
  };

  const handleReaction = (insightId: string, reaction: keyof SharedInsight['reactions']) => {
    // In real app, this would update the reaction in Convex
    console.log(`Reacting to ${insightId} with ${reaction}`);
  };

  const ShareInsightButton = () => (
    <motion.button
      onClick={() => onShareInsight({})}
      className="px-6 py-3 bg-gradient-to-r from-mystical-purple to-mystical-gold
               text-white font-medium rounded-lg hover:opacity-80 transition-opacity
               flex items-center gap-2"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <span>✨</span>
      Share Your Wisdom
    </motion.button>
  );

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.h2 
          className="text-3xl font-bold text-mystical-gold mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          🌌 Community Oracle Wisdom
        </motion.h2>
        <p className="text-foreground/70 mb-6">
          Discover mystical insights shared by fellow digital souls on their Web3 journey
        </p>
        
        {user && <ShareInsightButton />}
      </div>

      {/* Filters */}
      <div className="flex justify-center gap-2 mb-6">
        {[
          { key: "all", label: "All Insights", icon: "🌟" },
          { key: "major", label: "Major", icon: "✨" },
          { key: "minor", label: "Minor", icon: "🔮" }, 
          { key: "recent", label: "Recent", icon: "⏰" }
        ].map((filterOption) => (
          <button
            key={filterOption.key}
            onClick={() => setFilter(filterOption.key as any)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              filter === filterOption.key
                ? "bg-mystical-purple/20 text-mystical-gold border border-mystical-purple/40"
                : "text-foreground/70 hover:text-mystical-purple border border-transparent"
            }`}
          >
            <span>{filterOption.icon}</span>
            <span>{filterOption.label}</span>
          </button>
        ))}
      </div>

      {/* Insights Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredInsights.map((insight, index) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-background/50 backdrop-blur-sm border-2 ${getCardColor(insight.cardStyle)} rounded-xl p-6 cursor-pointer hover:scale-102 transition-transform`}
              onClick={() => setSelectedInsight(insight)}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getCardIcon(insight.cardStyle)}</span>
                  <div>
                    <h3 className="font-semibold text-mystical-gold text-sm">
                      {insight.title}
                    </h3>
                    <p className="text-xs text-foreground/50">
                      by {insight.authorName}
                    </p>
                  </div>
                </div>
                
                {/* Confidence */}
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 h-3 rounded-full ${
                        i < Math.round(insight.confidence * 5)
                          ? "bg-mystical-gold"
                          : "bg-gray-600"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Content Preview */}
              <p className="text-sm text-foreground/90 mb-4 line-clamp-3">
                {insight.content}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {insight.tags.slice(0, 3).map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-mystical-purple/20 text-mystical-purple rounded-md text-xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Reactions */}
              <div className="flex justify-between items-center text-xs">
                <div className="flex gap-3">
                  <span>🤩 {insight.reactions.amazing}</span>
                  <span>🤔 {insight.reactions.intriguing}</span>
                  <span>😐 {insight.reactions.neutral}</span>
                  <span>😕 {insight.reactions.confused}</span>
                </div>
                <span className="text-foreground/50">
                  {new Date(insight.sharedAt).toLocaleDateString()}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Detailed View Modal */}
      <AnimatePresence>
        {selectedInsight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-8"
            onClick={() => setSelectedInsight(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-2xl w-full bg-background/90 border border-mystical-purple/30 rounded-xl p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getCardIcon(selectedInsight.cardStyle)}</span>
                  <div>
                    <h2 className="text-xl font-bold text-mystical-gold">
                      {selectedInsight.title}
                    </h2>
                    <p className="text-sm text-foreground/60">
                      by {selectedInsight.authorName} • {selectedInsight.authorWallet}
                    </p>
                    <p className="text-xs text-mystical-purple italic">
                      {selectedInsight.cosmicAlignment}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedInsight(null)}
                  className="text-foreground/60 hover:text-mystical-gold text-xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="prose prose-sm max-w-none mb-6">
                <p className="text-foreground/90 leading-relaxed">
                  {selectedInsight.content}
                </p>
              </div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedInsight.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-mystical-purple/20 text-mystical-purple rounded-md text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              
              {/* Reaction Buttons */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { key: "amazing", emoji: "🤩", label: "Amazing" },
                  { key: "intriguing", emoji: "🤔", label: "Intriguing" },
                  { key: "neutral", emoji: "😐", label: "Neutral" },
                  { key: "confused", emoji: "😕", label: "Confused" }
                ].map((reaction) => (
                  <button
                    key={reaction.key}
                    onClick={() => handleReaction(selectedInsight.id, reaction.key as any)}
                    className="flex flex-col items-center p-3 rounded-lg border border-mystical-purple/30
                             hover:bg-mystical-purple/20 transition-colors"
                  >
                    <span className="text-xl mb-1">{reaction.emoji}</span>
                    <span className="text-xs text-foreground/70">{reaction.label}</span>
                    <span className="text-xs text-mystical-gold">
                      {selectedInsight.reactions[reaction.key as keyof SharedInsight['reactions']]}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}