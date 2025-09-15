"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendPredictionEngine, SentimentAnalyzer } from "@/src/lib/ai/trend-prediction";

interface TrendPredictionsProps {
  userCollections: string[];
  walletAddress: string;
}

export default function TrendPredictions({ userCollections, walletAddress }: TrendPredictionsProps) {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [sentiment, setSentiment] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<"trends" | "recommendations" | "sentiment">("trends");

  useEffect(() => {
    if (userCollections.length > 0) {
      analyzeMarket();
    }
  }, [userCollections]);

  const analyzeMarket = async () => {
    setIsAnalyzing(true);
    
    try {
      const engine = TrendPredictionEngine.getInstance();
      const sentimentAnalyzer = new SentimentAnalyzer();
      
      // Mock NFT collection data - in production would fetch from APIs
      const mockCollections = userCollections.map(name => ({
        name,
        floorPrice: Math.random() * 10 + 0.1,
        volume24h: Math.random() * 1000,
        holders: Math.floor(Math.random() * 10000) + 100,
        listedCount: Math.floor(Math.random() * 500) + 10,
        traits: {},
        socialMetrics: {
          twitterFollowers: Math.floor(Math.random() * 100000),
          discordMembers: Math.floor(Math.random() * 50000),
          mentions24h: Math.floor(Math.random() * 1000)
        }
      }));

      // Analyze trends
      const trendResults = await engine.analyzeTrends(mockCollections);
      setPredictions(trendResults);

      // Generate recommendations
      const recResults = await engine.generatePersonalizedRecommendations(
        userCollections,
        [
          ...mockCollections,
          // Add some additional collections for recommendations
          {
            name: "Azuki",
            floorPrice: 8.5,
            volume24h: 450,
            holders: 5500,
            listedCount: 45,
            traits: {},
            socialMetrics: { twitterFollowers: 89000, discordMembers: 42000, mentions24h: 234 }
          },
          {
            name: "CloneX",
            floorPrice: 12.2,
            volume24h: 320,
            holders: 4200,
            listedCount: 38,
            traits: {},
            socialMetrics: { twitterFollowers: 156000, discordMembers: 67000, mentions24h: 189 }
          }
        ]
      );
      setRecommendations(recResults);

      // Analyze sentiment
      const sentimentResult = await sentimentAnalyzer.analyzeMarketSentiment(userCollections);
      setSentiment(sentimentResult);

    } catch (error) {
      console.error("Market analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getPredictionIcon = (prediction: string) => {
    switch (prediction) {
      case "bullish": return "📈";
      case "bearish": return "📉"; 
      case "neutral": return "➖";
      default: return "🔮";
    }
  };

  const getPredictionColor = (prediction: string) => {
    switch (prediction) {
      case "bullish": return "text-green-400";
      case "bearish": return "text-red-400";
      case "neutral": return "text-yellow-400";
      default: return "text-mystical-gold";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low": return "text-green-400";
      case "medium": return "text-yellow-400";
      case "high": return "text-red-400";
      default: return "text-foreground";
    }
  };

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <motion.div
          className="w-16 h-16 border-4 border-mystical-purple/30 border-t-mystical-gold rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <motion.p 
          className="text-mystical-gold mt-4"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🤖 AI analyzing market trends and patterns...
        </motion.p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-mystical-gold mb-2 flex items-center justify-center gap-2">
          🤖 AI Market Intelligence
        </h3>
        <p className="text-foreground/70">
          Advanced predictions and recommendations powered by machine learning
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-2">
        {[
          { key: "trends", label: "Trend Analysis", icon: "📊" },
          { key: "recommendations", label: "Recommendations", icon: "💎" },
          { key: "sentiment", label: "Market Sentiment", icon: "🌡️" }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              activeTab === tab.key
                ? "bg-mystical-purple/20 text-mystical-gold border border-mystical-purple/40"
                : "text-foreground/70 hover:text-mystical-purple border border-transparent"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Trend Analysis Tab */}
        {activeTab === "trends" && (
          <motion.div
            key="trends"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {predictions.map((prediction, index) => (
              <motion.div
                key={prediction.collection}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-background/50 border border-mystical-purple/30 rounded-lg p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getPredictionIcon(prediction.prediction)}</span>
                    <div>
                      <h4 className="text-lg font-semibold text-mystical-gold">
                        {prediction.collection}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${getPredictionColor(prediction.prediction)}`}>
                          {prediction.prediction.toUpperCase()}
                        </span>
                        <span className="text-foreground/60">•</span>
                        <span className="text-sm text-foreground/60">
                          {prediction.timeframe} outlook
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-mystical-gold font-semibold">
                      {Math.round(prediction.confidence * 100)}%
                    </div>
                    <div className="text-xs text-foreground/60">Confidence</div>
                  </div>
                </div>

                {prediction.priceTarget && (
                  <div className="mb-4 p-3 bg-mystical-purple/10 rounded-lg">
                    <h5 className="text-mystical-purple font-medium mb-2">Price Target</h5>
                    <div className="flex justify-between text-sm">
                      <span>Low: {prediction.priceTarget.low.toFixed(3)} ETH</span>
                      <span className="font-medium">Target: {prediction.priceTarget.target.toFixed(3)} ETH</span>
                      <span>High: {prediction.priceTarget.high.toFixed(3)} ETH</span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <h5 className="text-mystical-purple font-medium">Key Factors:</h5>
                  {prediction.factors.map((factor: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-foreground/80">{factor.factor}</span>
                      <div className="flex items-center gap-2">
                        <div className={`w-12 h-2 bg-gray-700 rounded-full overflow-hidden`}>
                          <div 
                            className={`h-full ${factor.impact > 0 ? 'bg-green-400' : 'bg-red-400'}`}
                            style={{ width: `${Math.abs(factor.impact) * 100}%` }}
                          />
                        </div>
                        <span className={factor.impact > 0 ? 'text-green-400' : 'text-red-400'}>
                          {factor.impact > 0 ? '+' : ''}{(factor.impact * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Recommendations Tab */}
        {activeTab === "recommendations" && (
          <motion.div
            key="recommendations"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {recommendations.length > 0 ? (
              recommendations.map((rec, index) => (
                <motion.div
                  key={rec.collection}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-background/50 border border-mystical-purple/30 rounded-lg p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-mystical-gold flex items-center gap-2">
                        💎 {rec.collection}
                        <span className={`px-2 py-1 rounded-md text-xs ${getRiskColor(rec.riskLevel)}`}>
                          {rec.riskLevel} risk
                        </span>
                      </h4>
                      <div className="text-sm text-mystical-purple">
                        Match Score: {Math.round(rec.score * 100)}%
                      </div>
                    </div>
                    
                    <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-mystical-purple to-mystical-gold"
                        style={{ width: `${rec.score * 100}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-sm text-foreground/80 mb-4 italic">
                    "{rec.investmentThesis}"
                  </p>

                  <div className="space-y-2">
                    <h5 className="text-mystical-purple font-medium">Why this fits your portfolio:</h5>
                    {rec.reasoning.map((reason: string, i: number) => (
                      <div key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                        <span className="text-mystical-gold">•</span>
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>

                  {rec.similarTo.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-mystical-purple/20">
                      <span className="text-xs text-foreground/60">
                        Similar to your: {rec.similarTo.join(", ")}
                      </span>
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🤖</div>
                <p className="text-foreground/70">
                  AI is analyzing your collection to generate personalized recommendations...
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Sentiment Tab */}
        {activeTab === "sentiment" && sentiment && (
          <motion.div
            key="sentiment"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Overall Sentiment */}
            <div className="text-center">
              <div className="text-6xl mb-4">
                {sentiment.overall === "bullish" ? "🚀" :
                 sentiment.overall === "bearish" ? "🐻" : "😐"}
              </div>
              <h4 className={`text-2xl font-bold mb-2 ${getPredictionColor(sentiment.overall)}`}>
                Market Sentiment: {sentiment.overall.toUpperCase()}
              </h4>
              <p className="text-foreground/70">
                Confidence: {Math.round(sentiment.confidence * 100)}%
              </p>
            </div>

            {/* Sentiment Factors */}
            <div className="bg-background/50 border border-mystical-purple/30 rounded-lg p-6">
              <h5 className="text-mystical-gold font-semibold mb-4">Sentiment Analysis Breakdown:</h5>
              <div className="space-y-3">
                {sentiment.factors.map((factor: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{factor.source}</span>
                      <span className="text-xs text-foreground/60">
                        Weight: {Math.round(factor.weight * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${factor.sentiment > 0 ? 'bg-green-400' : 'bg-red-400'}`}
                          style={{ width: `${Math.abs(factor.sentiment) * 100}%` }}
                        />
                      </div>
                      <span className={`text-sm font-medium ${factor.sentiment > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {factor.sentiment > 0 ? '+' : ''}{(factor.sentiment * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}