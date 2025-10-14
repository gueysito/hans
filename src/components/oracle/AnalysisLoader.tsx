"use client";

import { motion } from "framer-motion";

interface AnalysisLoaderProps {
  message?: string;
  size?: "small" | "medium" | "large";
}

const sizeConfig = {
  small: { container: "w-16 h-16", orb: "w-3 h-3", text: "text-xs" },
  medium: { container: "w-32 h-32", orb: "w-4 h-4", text: "text-sm" },
  large: { container: "w-48 h-48", orb: "w-6 h-6", text: "text-base" },
};

export default function AnalysisLoader({ 
  message = "Processing analytical data...", 
  size = "medium" 
}: AnalysisLoaderProps) {
  const config = sizeConfig[size];

  return (
    <div className="flex flex-col items-center gap-6">
      <div className={`relative ${config.container}`}>
        {/* Outer rotating ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-mystical-purple/30"
          animate={{ rotate: 360 }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-mystical-gold rounded-full" />
        </motion.div>

        {/* Inner counter-rotating ring */}
        <motion.div
          className="absolute inset-4 rounded-full border-2 border-mystical-gold/30"
          animate={{ rotate: -360 }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-mystical-purple rounded-full" />
        </motion.div>

        {/* Central analysis symbol */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="relative"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Sacred geometry pattern */}
            <svg
              width={size === "small" ? 24 : size === "medium" ? 48 : 72}
              height={size === "small" ? 24 : size === "medium" ? 48 : 72}
              viewBox="0 0 100 100"
              className="text-mystical-purple"
            >
              <motion.polygon
                points="50,10 90,35 75,75 25,75 10,35"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                animate={{
                  strokeDasharray: ["0, 250", "250, 0"],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              <motion.circle
                cx="50"
                cy="50"
                r="30"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="1"
                animate={{
                  r: [30, 35, 30],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <defs>
                <linearGradient id="gradient">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
        </div>

        {/* Orbiting analysis indicators */}
        {[0, 120, 240].map((rotation, index) => (
          <motion.div
            key={index}
            className="absolute inset-0"
            animate={{ rotate: rotation + 360 }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
              delay: index * 0.3,
            }}
          >
            <motion.div
              className={`absolute top-0 left-1/2 -translate-x-1/2 ${config.orb} rounded-full`}
              style={{
                background: `radial-gradient(circle, ${
                  index === 0 
                    ? "rgba(139, 92, 246, 0.8)" 
                    : index === 1 
                    ? "rgba(245, 158, 11, 0.8)"
                    : "rgba(167, 139, 250, 0.8)"
                }, transparent)`,
              }}
              animate={{
                scale: [0.5, 1.5, 0.5],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.5,
              }}
            />
          </motion.div>
        ))}

        {/* Energy particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-mystical-gold/60 rounded-full"
            initial={{
              x: 50 + Math.cos((i * 60 * Math.PI) / 180) * 40,
              y: 50 + Math.sin((i * 60 * Math.PI) / 180) * 40,
            }}
            animate={{
              x: 50 + Math.cos((i * 60 * Math.PI) / 180) * 60,
              y: 50 + Math.sin((i * 60 * Math.PI) / 180) * 60,
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* Loading message */}
      <motion.p
        className={`${config.text} text-foreground/70 text-center max-w-xs`}
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {message}
      </motion.p>

      {/* Analysis loading phases */}
      <motion.div
        className="flex gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {["Connecting", "Processing", "Analyzing"].map((phase, index) => (
          <motion.span
            key={phase}
            className="text-xs text-foreground/40"
            animate={{
              color: ["rgba(255,255,255,0.4)", "rgba(139,92,246,0.8)", "rgba(255,255,255,0.4)"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: index * 1,
              ease: "easeInOut",
            }}
          >
            {phase}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}