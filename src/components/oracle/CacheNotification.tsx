"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface CacheNotificationProps {
  show: boolean;
  message: string;
  type: "cache" | "session" | "error";
}

export default function CacheNotification({ show, message, type }: CacheNotificationProps) {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  const getIcon = () => {
    switch (type) {
      case "cache":
        return "⚡";
      case "session":
        return "🔄";
      case "error":
        return "⚠️";
      default:
        return "ℹ️";
    }
  };

  const getColors = () => {
    switch (type) {
      case "cache":
        return "bg-mystical-gold/20 border-mystical-gold/40 text-mystical-gold";
      case "session":
        return "bg-mystical-purple/20 border-mystical-purple/40 text-mystical-purple";
      case "error":
        return "bg-red-500/20 border-red-500/40 text-red-400";
      default:
        return "bg-foreground/10 border-foreground/20 text-foreground";
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg border backdrop-blur-sm ${getColors()}`}
        >
          <div className="flex items-center gap-2 text-sm">
            <span>{getIcon()}</span>
            <span>{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}