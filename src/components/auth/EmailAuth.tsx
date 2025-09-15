"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth, authManager, type User } from "@/src/lib/auth";

interface EmailAuthProps {
  onAuthenticated: (user: User) => void;
  onSkip: () => void;
}

export default function EmailAuth({ onAuthenticated, onSkip }: EmailAuthProps) {
  const [email, setEmail] = useState("");
  const { isLoading } = useAuth();
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setError("");

    try {
      const user = await authManager.authenticate(email.trim());
      onAuthenticated(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto p-8 bg-background/80 backdrop-blur-sm border border-mystical-purple/30 rounded-xl"
    >
      <div className="text-center mb-6">
        <motion.div
          className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-mystical-purple to-mystical-gold rounded-full flex items-center justify-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-2xl">🔮</span>
        </motion.div>
        
        <h2 className="text-2xl font-bold text-mystical-gold mb-2">
          Enter the Oracle Realm
        </h2>
        
        <p className="text-foreground/70 text-sm">
          Save your mystical journey and insights across sessions
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm text-mystical-purple mb-2">
            Your Ethereal Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seeker@cosmos.ethereal"
            className="w-full p-3 bg-background/50 border border-mystical-purple/30 rounded-lg 
                     text-foreground placeholder:text-foreground/40
                     focus:border-mystical-gold focus:outline-none focus:ring-1 focus:ring-mystical-gold/30
                     transition-colors"
            disabled={isLoading}
          />
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 text-sm"
          >
            {error}
          </motion.p>
        )}

        <div className="space-y-3">
          <motion.button
            type="submit"
            disabled={isLoading || !email.trim()}
            className="w-full p-3 bg-gradient-to-r from-mystical-purple to-mystical-gold
                     text-white font-medium rounded-lg
                     hover:from-mystical-purple/80 hover:to-mystical-gold/80
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Connecting to the Cosmos...</span>
              </div>
            ) : (
              "Begin Sacred Journey"
            )}
          </motion.button>

          <motion.button
            type="button"
            onClick={onSkip}
            className="w-full p-2 text-mystical-purple hover:text-mystical-gold text-sm
                     border border-mystical-purple/30 rounded-lg
                     hover:border-mystical-gold/30 transition-colors"
            whileHover={{ scale: 1.02 }}
          >
            Continue without saving (temporary session)
          </motion.button>
        </div>
      </form>

      <div className="mt-6 pt-4 border-t border-mystical-purple/20">
        <p className="text-xs text-foreground/50 text-center">
          ✨ Your email allows us to preserve your mystical insights across the digital realms ✨
        </p>
      </div>
    </motion.div>
  );
}