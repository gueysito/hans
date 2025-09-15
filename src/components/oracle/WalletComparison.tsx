"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WalletData {
  address: string;
  totalCount: number;
  topCollections: string[];
  analysis?: any;
}

interface WalletComparisonProps {
  onComparisonRequest: (wallets: string[]) => void;
  onResults?: (results: any) => void;
  isLoading?: boolean;
}

export default function WalletComparison({ onComparisonRequest, onResults, isLoading }: WalletComparisonProps) {
  const [walletAddresses, setWalletAddresses] = useState<string[]>([""]);
  const [showComparison, setShowComparison] = useState(false);
  const [comparing, setComparing] = useState(false);

  const addWalletInput = () => {
    if (walletAddresses.length < 3) {
      setWalletAddresses([...walletAddresses, ""]);
    }
  };

  const removeWalletInput = (index: number) => {
    setWalletAddresses(walletAddresses.filter((_, i) => i !== index));
  };

  const updateWallet = (index: number, value: string) => {
    const updated = [...walletAddresses];
    updated[index] = value;
    setWalletAddresses(updated);
  };

  const handleCompare = async () => {
    const validWallets = walletAddresses.filter(addr => addr.trim().length > 0);
    if (validWallets.length < 2) return;
    
    setComparing(true);
    onComparisonRequest(validWallets);
    
    try {
      const response = await fetch('/api/oracle/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddresses: validWallets,
          analysisDepth: 'standard',
        }),
      });

      if (!response.ok) {
        throw new Error(`Comparison failed: ${response.status}`);
      }

      const results = await response.json();
      
      if (onResults) {
        onResults(results);
      }
    } catch (error) {
      console.error('Wallet comparison failed:', error);
      // Show error state
    } finally {
      setComparing(false);
    }
  };

  const validWallets = walletAddresses.filter(addr => addr.trim().length > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="p-6 bg-background/80 backdrop-blur-sm border border-mystical-purple/30 rounded-xl">
        <div className="text-center mb-6">
          <motion.div
            className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-mystical-purple to-mystical-gold rounded-full flex items-center justify-center"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          >
            <span className="text-2xl">⚖️</span>
          </motion.div>
          
          <h3 className="text-2xl font-bold text-mystical-gold mb-2">
            Cosmic Wallet Comparison
          </h3>
          
          <p className="text-foreground/70 text-sm">
            Compare the spiritual energies of multiple wallets to reveal hidden connections
          </p>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {walletAddresses.map((address, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex gap-3 items-center"
              >
                <div className="flex-1">
                  <label className="block text-sm text-mystical-purple mb-2">
                    Wallet {index + 1}
                    {index === 0 && <span className="text-mystical-gold"> (Primary)</span>}
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => updateWallet(index, e.target.value)}
                    placeholder={`0x${Math.random().toString(16).substring(2, 10)}...`}
                    className="w-full p-3 bg-background/50 border border-mystical-purple/30 rounded-lg 
                             text-foreground placeholder:text-foreground/40
                             focus:border-mystical-gold focus:outline-none focus:ring-1 focus:ring-mystical-gold/30
                             transition-colors"
                    disabled={isLoading}
                  />
                </div>
                
                {walletAddresses.length > 1 && (
                  <button
                    onClick={() => removeWalletInput(index)}
                    className="mt-7 p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                    disabled={isLoading}
                  >
                    ✕
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="flex justify-between items-center mt-6">
          <button
            onClick={addWalletInput}
            disabled={walletAddresses.length >= 3 || isLoading}
            className="px-4 py-2 text-mystical-purple border border-mystical-purple/30 rounded-lg
                     hover:bg-mystical-purple/20 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors"
          >
            + Add Wallet
          </button>
          
          <div className="text-xs text-foreground/50">
            Compare 2-3 wallets to reveal cosmic connections
          </div>
        </div>

        <motion.button
          onClick={handleCompare}
          disabled={validWallets.length < 2 || isLoading || comparing}
          className="w-full mt-6 p-3 bg-gradient-to-r from-mystical-purple to-mystical-gold
                   text-white font-medium rounded-lg
                   hover:from-mystical-purple/80 hover:to-mystical-gold/80
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-200"
          whileHover={{ scale: validWallets.length >= 2 && !comparing ? 1.02 : 1 }}
          whileTap={{ scale: validWallets.length >= 2 && !comparing ? 0.98 : 1 }}
        >
          {comparing ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Comparing Cosmic Energies...</span>
            </div>
          ) : (
            `Compare ${validWallets.length} Wallets (${validWallets.length < 2 ? 'Need 2+' : 'Ready'})`
          )}
        </motion.button>

        <div className="mt-6 pt-4 border-t border-mystical-purple/20">
          <p className="text-xs text-foreground/50 text-center">
            ✨ Wallet comparison reveals the spiritual connections between collectors ✨
          </p>
        </div>
      </div>
    </motion.div>
  );
}