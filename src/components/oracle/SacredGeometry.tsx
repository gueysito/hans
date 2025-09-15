"use client";

import { motion } from "framer-motion";

interface SacredGeometryProps {
  variant?: "default" | "intense" | "subtle";
}

export default function SacredGeometry({ variant = "default" }: SacredGeometryProps) {
  const opacityMap = {
    default: 0.1,
    intense: 0.2,
    subtle: 0.05,
  };

  const opacity = opacityMap[variant];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Animated sacred geometry patterns */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="mysticalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={opacity} />
            <stop offset="50%" stopColor="#f59e0b" stopOpacity={opacity * 0.5} />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={opacity} />
          </linearGradient>
          
          <radialGradient id="centerGlow">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity={opacity * 2} />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Metatron's Cube */}
        <motion.g
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 120,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <circle cx="960" cy="540" r="200" fill="none" stroke="url(#mysticalGradient)" strokeWidth="0.5" />
          <circle cx="960" cy="340" r="100" fill="none" stroke="url(#mysticalGradient)" strokeWidth="0.5" />
          <circle cx="960" cy="740" r="100" fill="none" stroke="url(#mysticalGradient)" strokeWidth="0.5" />
          <circle cx="787" cy="440" r="100" fill="none" stroke="url(#mysticalGradient)" strokeWidth="0.5" />
          <circle cx="787" cy="640" r="100" fill="none" stroke="url(#mysticalGradient)" strokeWidth="0.5" />
          <circle cx="1133" cy="440" r="100" fill="none" stroke="url(#mysticalGradient)" strokeWidth="0.5" />
          <circle cx="1133" cy="640" r="100" fill="none" stroke="url(#mysticalGradient)" strokeWidth="0.5" />
          
          {/* Connecting lines */}
          <path
            d="M 960 340 L 787 440 L 787 640 L 960 740 L 1133 640 L 1133 440 Z"
            fill="none"
            stroke="url(#mysticalGradient)"
            strokeWidth="0.5"
          />
        </motion.g>

        {/* Flower of Life */}
        <motion.g
          opacity={opacity * 0.5}
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <circle
              key={angle}
              cx={960 + 150 * Math.cos((angle * Math.PI) / 180)}
              cy={540 + 150 * Math.sin((angle * Math.PI) / 180)}
              r="150"
              fill="none"
              stroke="url(#mysticalGradient)"
              strokeWidth="0.3"
            />
          ))}
        </motion.g>

        {/* Sri Yantra triangles */}
        <motion.g
          animate={{
            rotate: [0, -360],
          }}
          transition={{
            duration: 180,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <polygon
            points="960,240 760,640 1160,640"
            fill="none"
            stroke="url(#mysticalGradient)"
            strokeWidth="0.5"
          />
          <polygon
            points="960,840 760,440 1160,440"
            fill="none"
            stroke="url(#mysticalGradient)"
            strokeWidth="0.5"
          />
        </motion.g>

        {/* Animated energy lines */}
        {[...Array(12)].map((_, i) => {
          const startAngle = (i * 30 * Math.PI) / 180;
          const endAngle = ((i * 30 + 180) * Math.PI) / 180;
          const x1 = 960 + 500 * Math.cos(startAngle);
          const y1 = 540 + 500 * Math.sin(startAngle);
          const x2 = 960 + 500 * Math.cos(endAngle);
          const y2 = 540 + 500 * Math.sin(endAngle);

          return (
            <motion.line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="url(#mysticalGradient)"
              strokeWidth="0.2"
              initial={{ pathLength: 0 }}
              animate={{
                pathLength: [0, 1, 0],
                opacity: [0, opacity, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut",
              }}
            />
          );
        })}

        {/* Central pulsing glow */}
        <motion.circle
          cx="960"
          cy="540"
          r="50"
          fill="url(#centerGlow)"
          animate={{
            r: [50, 100, 50],
            opacity: [opacity * 2, opacity * 0.5, opacity * 2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </svg>

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-mystical-gold/20 rounded-full"
          initial={{
            x: Math.random() * 1920,
            y: 1100,
          }}
          animate={{
            y: -20,
            x: Math.random() * 1920,
          }}
          transition={{
            duration: 15 + Math.random() * 10,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "linear",
          }}
        />
      ))}

      {/* Corner ornaments */}
      {["top-left", "top-right", "bottom-left", "bottom-right"].map((corner) => (
        <motion.div
          key={corner}
          className={`absolute ${
            corner === "top-left" ? "top-0 left-0" :
            corner === "top-right" ? "top-0 right-0 rotate-90" :
            corner === "bottom-left" ? "bottom-0 left-0 -rotate-90" :
            "bottom-0 right-0 rotate-180"
          }`}
          animate={{
            opacity: [opacity * 0.5, opacity, opacity * 0.5],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <svg width="150" height="150" viewBox="0 0 150 150">
            <path
              d="M 0 0 L 150 0 L 150 20 L 20 20 L 20 150 L 0 150 Z"
              fill="url(#mysticalGradient)"
            />
            <circle cx="35" cy="35" r="10" fill="none" stroke="url(#mysticalGradient)" strokeWidth="1" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}