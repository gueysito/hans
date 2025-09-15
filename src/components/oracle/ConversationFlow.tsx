"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "hans";
  content: string;
  timestamp: number;
}

interface ConversationFlowProps {
  messages: Message[];
  onSendMessage?: (message: string) => void;
  isHansTyping?: boolean;
  disabled?: boolean;
}

export default function ConversationFlow({
  messages,
  onSendMessage,
  isHansTyping = false,
  disabled = false,
}: ConversationFlowProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isHansTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled && onSendMessage) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[600px] w-full max-w-2xl mx-auto">
      {/* Mystical header */}
      <motion.div
        className="text-center py-4 border-b border-border/30"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-lg font-semibold bg-gradient-to-r from-mystical-purple to-mystical-gold bg-clip-text text-transparent">
          Oracle Communion
        </h3>
        <p className="text-xs text-foreground/50 mt-1">
          Speak your truth, receive ancient wisdom
        </p>
      </motion.div>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ 
                duration: 0.3,
                delay: index * 0.05
              }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`relative max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                  message.role === "user"
                    ? "bg-gradient-to-r from-mystical-purple/20 to-mystical-purple/10 border border-mystical-purple/30 text-foreground"
                    : "bg-gradient-to-r from-card to-card/80 border border-mystical-gold/30 text-foreground/90"
                }`}
              >
                {/* Message role indicator */}
                <div className={`absolute -top-2 ${message.role === "user" ? "right-3" : "left-3"}`}>
                  <span className="text-xs text-foreground/50 bg-background px-2 rounded">
                    {message.role === "user" ? "Seeker" : "Hans"}
                  </span>
                </div>

                {/* Message content */}
                <p className="text-sm leading-relaxed mt-1">
                  {message.content}
                </p>

                {/* Mystical effect for Hans messages */}
                {message.role === "hans" && (
                  <motion.div
                    className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-mystical-gold/20 to-transparent blur-lg -z-10"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}
              </div>
            </motion.div>
          ))}

          {/* Hans typing indicator */}
          {isHansTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex justify-start"
            >
              <div className="relative max-w-xs px-4 py-3 rounded-2xl bg-gradient-to-r from-card to-card/80 border border-mystical-gold/30">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-mystical-gold/60 rounded-full"
                      animate={{
                        y: [0, -8, 0],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </div>
                <motion.div
                  className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-mystical-gold/20 to-transparent blur-lg -z-10"
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <motion.form
        onSubmit={handleSubmit}
        className="border-t border-border/30 p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="relative flex gap-2">
          <div className="relative flex-1">
            {/* Mystical input glow */}
            <motion.div
              className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-mystical-purple/20 to-mystical-gold/20 blur"
              animate={{
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={disabled || isHansTyping}
              placeholder={isHansTyping ? "Hans is divining..." : "Ask the oracle..."}
              className="relative w-full px-4 py-2 bg-background/90 border border-border/50 rounded-lg text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-mystical-purple/50 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <motion.button
            type="submit"
            disabled={disabled || isHansTyping || !input.trim()}
            className="px-6 py-2 bg-gradient-to-r from-mystical-purple to-mystical-gold text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="flex items-center gap-2">
              Divine
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                ✨
              </motion.span>
            </span>
          </motion.button>
        </div>
      </motion.form>
    </div>
  );
}