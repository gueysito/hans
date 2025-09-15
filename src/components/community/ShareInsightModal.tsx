"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, type SavedInsight } from "@/src/lib/auth";

interface ShareInsightModalProps {
  onClose: () => void;
  onShare: (sharedInsight: any) => void;
}

export default function ShareInsightModal({ onClose, onShare }: ShareInsightModalProps) {
  const { user } = useAuth();
  const [selectedInsight, setSelectedInsight] = useState<SavedInsight | null>(null);
  const [customTitle, setCustomTitle] = useState("");
  const [customContent, setCustomContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [shareMode, setShareMode] = useState<"saved" | "custom">("saved");

  const savedInsights = user?.profile.savedInsights || [];

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim().toLowerCase())) {
      setTags([...tags, newTag.trim().toLowerCase()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleShare = () => {
    let insightToShare;
    
    if (shareMode === "saved" && selectedInsight) {
      insightToShare = {
        title: selectedInsight.title,
        content: selectedInsight.content,
        cardStyle: selectedInsight.cardStyle,
        confidence: selectedInsight.confidence,
        tags: tags.length > 0 ? tags : ["nft", "mystical", "oracle"],
        originalSessionId: selectedInsight.sessionId,
        originalWallet: selectedInsight.walletAddress,
      };
    } else {
      insightToShare = {
        title: customTitle || "Community Wisdom",
        content: customContent,
        cardStyle: "minor" as const,
        confidence: 0.75,
        tags: tags.length > 0 ? tags : ["community", "wisdom"],
        isCustom: true,
      };
    }

    onShare(insightToShare);
    onClose();
  };

  const canShare = shareMode === "saved" 
    ? selectedInsight 
    : customTitle.trim() && customContent.trim();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="max-w-2xl w-full bg-background/90 border border-mystical-purple/30 rounded-xl p-8 max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-mystical-gold flex items-center gap-2">
            <span>✨</span>
            Share Your Mystical Wisdom
          </h2>
          <button
            onClick={onClose}
            className="text-foreground/60 hover:text-mystical-gold text-xl"
          >
            ✕
          </button>
        </div>

        {/* Share Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setShareMode("saved")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              shareMode === "saved"
                ? "bg-mystical-purple/20 text-mystical-gold border border-mystical-purple/40"
                : "text-foreground/70 hover:text-mystical-purple border border-transparent"
            }`}
          >
            💎 Share Saved Insight
          </button>
          <button
            onClick={() => setShareMode("custom")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              shareMode === "custom"
                ? "bg-mystical-purple/20 text-mystical-gold border border-mystical-purple/40"
                : "text-foreground/70 hover:text-mystical-purple border border-transparent"
            }`}
          >
            ✍️ Create New Wisdom
          </button>
        </div>

        {/* Saved Insights Mode */}
        {shareMode === "saved" && (
          <div className="space-y-4">
            {savedInsights.length > 0 ? (
              <>
                <h3 className="text-lg text-mystical-purple mb-4">
                  Choose an insight to share with the community:
                </h3>
                <div className="space-y-3 max-h-60 overflow-auto">
                  {savedInsights.map((insight) => (
                    <motion.div
                      key={insight.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedInsight?.id === insight.id
                          ? "border-mystical-gold/40 bg-mystical-gold/10"
                          : "border-mystical-purple/30 hover:border-mystical-purple/50"
                      }`}
                      onClick={() => setSelectedInsight(insight)}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">
                          {insight.cardStyle === "major" ? "✨" : 
                           insight.cardStyle === "minor" ? "🔮" : "💫"}
                        </span>
                        <h4 className="font-semibold text-mystical-gold">{insight.title}</h4>
                      </div>
                      <p className="text-sm text-foreground/80 line-clamp-2">
                        {insight.content}
                      </p>
                      <div className="flex justify-between items-center mt-2 text-xs text-foreground/50">
                        <span>
                          {insight.walletAddress && 
                            `${insight.walletAddress.slice(0, 6)}...${insight.walletAddress.slice(-4)}`}
                        </span>
                        <span>
                          {new Date(insight.savedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🔮</div>
                <p className="text-foreground/70">
                  You don't have any saved insights yet. Visit the Oracle to receive wisdom first!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Custom Wisdom Mode */}
        {shareMode === "custom" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-mystical-purple mb-2">
                Insight Title
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="The Digital Soul's Journey..."
                className="w-full p-3 bg-background/50 border border-mystical-purple/30 rounded-lg 
                         text-foreground placeholder:text-foreground/40
                         focus:border-mystical-gold focus:outline-none focus:ring-1 focus:ring-mystical-gold/30"
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm text-mystical-purple mb-2">
                Share Your Wisdom
              </label>
              <textarea
                value={customContent}
                onChange={(e) => setCustomContent(e.target.value)}
                placeholder="Share the mystical insights you've discovered on your Web3 journey. What wisdom would you offer to fellow digital souls?"
                rows={6}
                className="w-full p-3 bg-background/50 border border-mystical-purple/30 rounded-lg 
                         text-foreground placeholder:text-foreground/40
                         focus:border-mystical-gold focus:outline-none focus:ring-1 focus:ring-mystical-gold/30
                         resize-none"
                maxLength={500}
              />
              <div className="text-right text-xs text-foreground/50 mt-1">
                {customContent.length}/500
              </div>
            </div>
          </div>
        )}

        {/* Tags Section */}
        <div className="mt-6">
          <label className="block text-sm text-mystical-purple mb-2">
            Tags (help others discover your wisdom)
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addTag()}
              placeholder="Add a tag..."
              className="flex-1 p-2 bg-background/50 border border-mystical-purple/30 rounded-lg 
                       text-foreground placeholder:text-foreground/40 text-sm
                       focus:border-mystical-gold focus:outline-none"
              maxLength={20}
            />
            <button
              onClick={addTag}
              disabled={!newTag.trim()}
              className="px-4 py-2 bg-mystical-purple/20 text-mystical-purple rounded-lg
                       hover:bg-mystical-purple/30 disabled:opacity-50 text-sm"
            >
              Add
            </button>
          </div>
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-mystical-gold/20 text-mystical-gold rounded-md text-sm
                           flex items-center gap-1"
                >
                  #{tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="text-mystical-gold/70 hover:text-mystical-gold ml-1"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-8">
          <div className="text-xs text-foreground/60">
            <p>💫 Your wisdom will be shared anonymously with your mystical name</p>
            <p className="mt-1">🔮 Help fellow seekers on their digital journey</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-foreground/60 hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <motion.button
              onClick={handleShare}
              disabled={!canShare}
              className="px-6 py-2 bg-gradient-to-r from-mystical-purple to-mystical-gold
                       text-white font-medium rounded-lg hover:opacity-80 
                       disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              whileHover={{ scale: canShare ? 1.02 : 1 }}
              whileTap={{ scale: canShare ? 0.98 : 1 }}
            >
              ✨ Share Wisdom
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}