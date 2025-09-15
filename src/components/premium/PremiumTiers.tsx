"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/src/lib/auth";

interface PremiumTier {
  id: string;
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  limits: {
    sessionsPerDay: number;
    walletsPerComparison: number;
    aiPredictions: number;
    exportFormats: string[];
  };
  badge: string;
  color: string;
  popular?: boolean;
}

const PREMIUM_TIERS: PremiumTier[] = [
  {
    id: "seeker",
    name: "Cosmic Seeker",
    price: { monthly: 0, yearly: 0 },
    features: [
      "Basic oracle readings",
      "2 sessions per day",
      "Standard insights",
      "Community access",
      "Basic export (PDF)"
    ],
    limits: {
      sessionsPerDay: 2,
      walletsPerComparison: 2,
      aiPredictions: 0,
      exportFormats: ["pdf"]
    },
    badge: "🌱",
    color: "border-mystical-purple/30"
  },
  {
    id: "mystic",
    name: "Digital Mystic",
    price: { monthly: 19, yearly: 190 },
    features: [
      "Unlimited oracle readings",
      "Advanced AI predictions",
      "Multi-wallet comparison (3 wallets)",
      "Premium insights",
      "All export formats",
      "Voice oracle interaction",
      "Priority support"
    ],
    limits: {
      sessionsPerDay: -1, // unlimited
      walletsPerComparison: 3,
      aiPredictions: 10,
      exportFormats: ["pdf", "csv", "svg"]
    },
    badge: "🔮",
    color: "border-mystical-gold/40",
    popular: true
  },
  {
    id: "oracle",
    name: "Master Oracle",
    price: { monthly: 49, yearly: 490 },
    features: [
      "Everything in Digital Mystic",
      "Unlimited AI predictions",
      "Multi-wallet comparison (5 wallets)",
      "Real-time market alerts",
      "Custom oracle training",
      "Advanced analytics dashboard",
      "White-label oracle API",
      "1-on-1 mystical consultations"
    ],
    limits: {
      sessionsPerDay: -1,
      walletsPerComparison: 5,
      aiPredictions: -1, // unlimited
      exportFormats: ["pdf", "csv", "svg", "json", "api"]
    },
    badge: "✨",
    color: "border-mystical-gold/60"
  }
];

interface PremiumTiersProps {
  onSubscribe: (tierId: string, billing: "monthly" | "yearly") => void;
  currentTier?: string;
}

export default function PremiumTiers({ onSubscribe, currentTier = "seeker" }: PremiumTiersProps) {
  const { user } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const handleSubscribe = (tierId: string) => {
    setSelectedTier(tierId);
    onSubscribe(tierId, billingPeriod);
  };

  const getSavings = (monthly: number, yearly: number) => {
    if (yearly === 0) return 0;
    const monthlyCost = monthly * 12;
    return Math.round(((monthlyCost - yearly) / monthlyCost) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <motion.h2 
          className="text-3xl font-bold text-mystical-gold mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ✨ Unlock Your Mystical Potential
        </motion.h2>
        <p className="text-foreground/70 max-w-2xl mx-auto">
          Choose your path through the digital cosmos. Each tier unlocks deeper mysteries and more powerful oracle capabilities.
        </p>
      </div>

      {/* Billing Period Toggle */}
      <div className="flex justify-center">
        <div className="bg-background/50 border border-mystical-purple/30 rounded-lg p-1">
          <div className="flex">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-4 py-2 rounded-md transition-colors ${
                billingPeriod === "monthly"
                  ? "bg-mystical-purple/20 text-mystical-gold"
                  : "text-foreground/70 hover:text-mystical-purple"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
                billingPeriod === "yearly"
                  ? "bg-mystical-purple/20 text-mystical-gold"
                  : "text-foreground/70 hover:text-mystical-purple"
              }`}
            >
              Yearly
              <span className="px-2 py-1 bg-mystical-gold/20 text-mystical-gold rounded-md text-xs">
                Save up to 20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Tier Cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {PREMIUM_TIERS.map((tier, index) => (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative bg-background/50 backdrop-blur-sm border-2 ${tier.color} rounded-xl p-6 ${
              tier.popular ? 'ring-2 ring-mystical-gold/20' : ''
            } ${currentTier === tier.id ? 'bg-mystical-gold/10' : ''}`}
          >
            {/* Popular Badge */}
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-mystical-gold text-background px-3 py-1 rounded-full text-xs font-semibold">
                  🌟 Most Popular
                </div>
              </div>
            )}

            {/* Current Tier Badge */}
            {currentTier === tier.id && (
              <div className="absolute -top-3 right-4">
                <div className="bg-mystical-purple text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Current Plan
                </div>
              </div>
            )}

            {/* Tier Header */}
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">{tier.badge}</div>
              <h3 className="text-xl font-bold text-mystical-gold mb-2">{tier.name}</h3>
              
              <div className="space-y-1">
                {tier.price.monthly === 0 ? (
                  <div className="text-3xl font-bold text-mystical-purple">Free</div>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-mystical-gold">
                      ${billingPeriod === "monthly" ? tier.price.monthly : Math.floor(tier.price.yearly / 12)}
                      <span className="text-lg font-normal text-foreground/70">/month</span>
                    </div>
                    {billingPeriod === "yearly" && getSavings(tier.price.monthly, tier.price.yearly) > 0 && (
                      <div className="text-sm text-mystical-gold">
                        Save {getSavings(tier.price.monthly, tier.price.yearly)}% with yearly billing
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-3 mb-6">
              {tier.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-mystical-gold mt-1">✓</span>
                  <span className="text-sm text-foreground/80">{feature}</span>
                </div>
              ))}
            </div>

            {/* Limits Display */}
            <div className="bg-mystical-purple/10 rounded-lg p-3 mb-6">
              <h4 className="text-mystical-purple font-medium mb-2 text-sm">Plan Limits:</h4>
              <div className="space-y-1 text-xs text-foreground/70">
                <div>
                  Sessions: {tier.limits.sessionsPerDay === -1 ? "Unlimited" : `${tier.limits.sessionsPerDay}/day`}
                </div>
                <div>
                  Wallet Comparisons: {tier.limits.walletsPerComparison} wallets max
                </div>
                <div>
                  AI Predictions: {tier.limits.aiPredictions === -1 ? "Unlimited" : `${tier.limits.aiPredictions}/month`}
                </div>
                <div>
                  Export Formats: {tier.limits.exportFormats.join(", ").toUpperCase()}
                </div>
              </div>
            </div>

            {/* Action Button */}
            <motion.button
              onClick={() => handleSubscribe(tier.id)}
              disabled={currentTier === tier.id || selectedTier === tier.id}
              className={`w-full py-3 rounded-lg font-semibold transition-all ${
                currentTier === tier.id
                  ? "bg-mystical-purple/20 text-mystical-purple cursor-default"
                  : tier.price.monthly === 0
                  ? "bg-mystical-purple/20 border border-mystical-purple/40 text-mystical-purple hover:bg-mystical-purple/30"
                  : "bg-gradient-to-r from-mystical-purple to-mystical-gold text-white hover:opacity-80"
              } disabled:opacity-50`}
              whileHover={{ scale: currentTier === tier.id ? 1 : 1.02 }}
              whileTap={{ scale: currentTier === tier.id ? 1 : 0.98 }}
            >
              {selectedTier === tier.id ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </div>
              ) : currentTier === tier.id ? (
                "Current Plan"
              ) : tier.price.monthly === 0 ? (
                "Continue Free"
              ) : (
                `Upgrade to ${tier.name}`
              )}
            </motion.button>

            {/* Pricing Period Note */}
            {tier.price.monthly > 0 && (
              <div className="text-center mt-3">
                <div className="text-xs text-foreground/50">
                  {billingPeriod === "yearly" 
                    ? `Billed yearly: $${tier.price.yearly}`
                    : "Billed monthly, cancel anytime"
                  }
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Features Comparison */}
      <div className="mt-12">
        <h3 className="text-xl font-semibold text-mystical-gold mb-6 text-center">
          🔍 Feature Comparison
        </h3>
        
        <div className="bg-background/50 border border-mystical-purple/30 rounded-lg p-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-mystical-purple/20">
                <th className="text-left py-3 text-mystical-purple">Feature</th>
                {PREMIUM_TIERS.map(tier => (
                  <th key={tier.id} className="text-center py-3 text-mystical-gold">
                    {tier.badge} {tier.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { feature: "Oracle Sessions", values: ["2/day", "Unlimited", "Unlimited"] },
                { feature: "AI Predictions", values: ["❌", "10/month", "Unlimited"] },
                { feature: "Wallet Comparison", values: ["2 wallets", "3 wallets", "5 wallets"] },
                { feature: "Voice Oracle", values: ["❌", "✅", "✅"] },
                { feature: "Export Formats", values: ["PDF", "PDF, CSV, SVG", "All + API"] },
                { feature: "Real-time Alerts", values: ["❌", "❌", "✅"] },
                { feature: "Custom Training", values: ["❌", "❌", "✅"] },
                { feature: "1-on-1 Consultations", values: ["❌", "❌", "✅"] }
              ].map((row, index) => (
                <tr key={index} className="border-b border-mystical-purple/10">
                  <td className="py-3 text-foreground/80">{row.feature}</td>
                  {row.values.map((value, i) => (
                    <td key={i} className="text-center py-3 text-foreground/70">
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-12 max-w-3xl mx-auto">
        <h3 className="text-xl font-semibold text-mystical-gold mb-6 text-center">
          ❓ Frequently Asked Questions
        </h3>
        
        <div className="space-y-4">
          {[
            {
              q: "Can I upgrade or downgrade my plan anytime?",
              a: "Yes! You can change your subscription tier at any time. Upgrades take effect immediately, while downgrades take effect at the end of your current billing period."
            },
            {
              q: "What happens to my data if I cancel?",
              a: "Your oracle sessions and insights remain accessible for 30 days after cancellation. You can always resubscribe to regain full access to your mystical journey."
            },
            {
              q: "Is there a free trial for premium tiers?",
              a: "We offer a 7-day free trial for all premium tiers. Experience the full power of advanced oracle features before committing to a subscription."
            },
            {
              q: "How accurate are the AI predictions?",
              a: "Our AI predictions are for educational and entertainment purposes. While based on real market data, they should not be considered financial advice. Always do your own research."
            }
          ].map((faq, index) => (
            <div key={index} className="bg-mystical-purple/10 rounded-lg p-4">
              <h4 className="text-mystical-purple font-medium mb-2">{faq.q}</h4>
              <p className="text-foreground/70 text-sm">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}