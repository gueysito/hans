"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface CrystalBallProps {
  isActive: boolean;
  onActivate: () => void;
  children?: React.ReactNode;
}

export default function CrystalBall({ isActive, onActivate, children }: CrystalBallProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative w-80 h-80 mx-auto"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      {/* Outer glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-mystical-purple to-mystical-gold opacity-30 blur-xl"
        animate={{
          scale: isActive ? [1, 1.2, 1] : 1,
        }}
        transition={{
          duration: 3,
          repeat: isActive ? Infinity : 0,
          ease: "easeInOut",
        }}
      />

      {/* Crystal ball sphere */}
      <motion.div
        className="relative w-full h-full rounded-full bg-gradient-to-br from-purple-900/50 to-purple-600/30 backdrop-blur-lg border-2 border-mystical-purple/30 cursor-pointer overflow-hidden"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={onActivate}
        animate={{
          boxShadow: isActive
            ? "0 0 50px rgba(139, 92, 246, 0.5), inset 0 0 50px rgba(139, 92, 246, 0.2)"
            : "0 0 20px rgba(139, 92, 246, 0.3), inset 0 0 20px rgba(139, 92, 246, 0.1)",
        }}
      >
        {/* Mystical mist effect */}
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              "radial-gradient(circle at 20% 20%, rgba(139, 92, 246, 0.3), transparent)",
              "radial-gradient(circle at 80% 80%, rgba(245, 158, 11, 0.3), transparent)",
              "radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.3), transparent)",
            ],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
          animate={{
            x: [-300, 300],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
            repeatDelay: 3,
          }}
        />

        {/* Content inside crystal ball */}
        <div className="relative z-10 flex items-center justify-center h-full">
          {children || (
            <motion.div
              className="text-center px-8"
              animate={{
                opacity: isHovered ? 1 : 0.7,
              }}
            >
              <h3 className="text-2xl font-bold text-mystical-gold mb-2">
                {isActive ? "Divining..." : "Peer Within"}
              </h3>
              <p className="text-sm text-foreground/70">
                {isActive 
                  ? "Ancient energies swirl and dance..."
                  : "Touch the crystal to begin your oracle reading"}
              </p>
            </motion.div>
          )}
        </div>

        {/* Floating particles */}
        {isActive && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-mystical-gold rounded-full"
                initial={{
                  x: Math.random() * 320,
                  y: 320,
                }}
                animate={{
                  y: -20,
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeOut",
                }}
              />
            ))}
          </>
        )}
      </motion.div>

      {/* Base stand */}
      <motion.div
        className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-48 h-8 bg-gradient-to-r from-purple-900 to-purple-700 rounded-full blur-lg opacity-50"
        animate={{
          scaleX: isActive ? [1, 1.1, 1] : 1,
        }}
        transition={{
          duration: 3,
          repeat: isActive ? Infinity : 0,
        }}
      />
    </motion.div>
  );
}