"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { walletAddressSchema } from "@/src/lib/validations";

interface WalletInputProps {
  onSubmit: (walletAddress: string) => void;
  isLoading?: boolean;
}

interface FormData {
  walletAddress: string;
}

export default function WalletInput({ onSubmit, isLoading = false }: WalletInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<FormData>({
    mode: "onChange",
  });

  const walletValue = watch("walletAddress");
  const isValidAddress = walletValue && walletAddressSchema.safeParse(walletValue).success;

  const onFormSubmit = (data: FormData) => {
    if (isValidAddress) {
      onSubmit(data.walletAddress);
    }
  };

  return (
    <motion.div
      className="w-full max-w-xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Mystical input container */}
        <div className="relative">
          {/* Animated border glow */}
          <motion.div
            className="absolute -inset-1 rounded-xl bg-gradient-to-r from-mystical-purple to-mystical-gold opacity-0 blur-lg"
            animate={{
              opacity: isFocused ? 0.6 : 0,
            }}
            transition={{ duration: 0.3 }}
          />

          {/* Input field */}
          <div className="relative">
            <label className="block text-sm font-medium text-mystical-gold mb-2">
              Ethereum Wallet Address
            </label>
            
            <div className="relative">
              {/* Wallet icon */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-mystical-purple">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                  <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                </svg>
              </div>

              <input
                {...register("walletAddress", {
                  required: "Wallet address is required",
                  pattern: {
                    value: /^0x[a-fA-F0-9]{40}$/,
                    message: "Invalid Ethereum wallet address",
                  },
                })}
                type="text"
                placeholder="0x..."
                disabled={isLoading}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="w-full pl-12 pr-12 py-3 bg-background/90 border-2 border-border/50 rounded-xl text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-mystical-purple/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              />

              {/* Validation indicator */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {walletValue && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    {isValidAddress ? (
                      <motion.div
                        className="text-green-500"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        ✓
                      </motion.div>
                    ) : (
                      <div className="text-red-500">✗</div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Error message */}
            {errors.walletAddress && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-xs text-red-400"
              >
                {errors.walletAddress.message}
              </motion.p>
            )}

            {/* Helper text */}
            {!errors.walletAddress && (
              <p className="mt-2 text-xs text-foreground/50">
                Enter your Ethereum wallet address to receive mystical insights
              </p>
            )}
          </div>
        </div>

        {/* Submit button */}
        <motion.button
          type="submit"
          disabled={!isValid || isLoading}
          className="w-full relative overflow-hidden"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Button background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-mystical-purple to-mystical-gold rounded-xl"
            animate={{
              backgroundPosition: isLoading ? ["0% 50%", "100% 50%"] : "0% 50%",
            }}
            transition={{
              duration: 2,
              repeat: isLoading ? Infinity : 0,
              ease: "linear",
            }}
            style={{
              backgroundSize: "200% 100%",
            }}
          />

          {/* Button content */}
          <div className="relative px-6 py-3 flex items-center justify-center gap-3">
            <span className="text-white font-medium">
              {isLoading ? "Preparing Oracle Chamber..." : "Begin Oracle Reading"}
            </span>
            
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-white"
                >
                  <circle cx="12" cy="12" r="10" strokeDasharray="4 2" />
                </svg>
              </motion.div>
            ) : (
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            )}
          </div>
        </motion.button>

        {/* Mystical decoration */}
        <div className="flex justify-center mt-6">
          <motion.div
            className="flex gap-2"
            animate={{
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {["🔮", "✨", "🌙", "✨", "🔮"].map((emoji, index) => (
              <motion.span
                key={index}
                className="text-lg"
                animate={{
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.2,
                  ease: "easeInOut",
                }}
              >
                {emoji}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </form>
    </motion.div>
  );
}