"use client";

import { motion } from "framer-motion";

interface AnalyticsData {
  walletAddress: string;
  totalValue?: number;
  riskScore?: number;
  diversificationScore?: number;
  trendScore?: number;
  communityStrength?: number;
  timeAnalysis?: {
    averageHoldingTime: string;
    recentActivity: "high" | "medium" | "low";
    collectionGrowth: string;
  };
  marketTiming?: {
    buyTiming: "excellent" | "good" | "average" | "poor";
    sellOpportunities: string[];
    marketCycle: "accumulation" | "growth" | "distribution" | "decline";
  };
}

interface EnhancedAnalyticsProps {
  data: AnalyticsData;
  onExportAnalysis?: () => void;
}

export default function EnhancedAnalytics({ data, onExportAnalysis }: EnhancedAnalyticsProps) {
  const ScoreCard = ({ 
    title, 
    score, 
    icon, 
    description, 
    color 
  }: { 
    title: string; 
    score: number; 
    icon: string; 
    description: string; 
    color: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-4 bg-background/50 border border-mystical-purple/30 rounded-lg"
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <h4 className="text-sm font-medium text-mystical-gold">{title}</h4>
          <p className="text-xs text-foreground/60">{description}</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-foreground/50">Score</span>
          <span className="text-sm font-medium text-mystical-gold">{score}/100</span>
        </div>
        
        <div className="w-full bg-gray-700 rounded-full h-2">
          <motion.div
            className={`h-2 rounded-full ${color}`}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
      </div>
    </motion.div>
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-mystical-gold mb-1">
            Enhanced Collection Analytics
          </h3>
          <p className="text-sm text-foreground/60">
            {data.walletAddress.slice(0, 6)}...{data.walletAddress.slice(-4)}
          </p>
        </div>
        
        {onExportAnalysis && (
          <div className="flex gap-2">
            <button
              onClick={onExportAnalysis}
              className="px-4 py-2 text-mystical-purple border border-mystical-purple/30 rounded-lg
                       hover:bg-mystical-purple/20 transition-colors text-sm"
            >
              📊 Full Export
            </button>
            <button
              onClick={() => {/* Quick CSV export */}}
              className="px-3 py-2 text-mystical-gold border border-mystical-gold/30 rounded-lg
                       hover:bg-mystical-gold/20 transition-colors text-sm"
              title="Quick CSV export"
            >
              📄
            </button>
          </div>
        )}
      </div>

      {/* Key Metrics Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ScoreCard
          title="Risk Assessment"
          score={data.riskScore || 65}
          icon="⚖️"
          description="Collection volatility analysis"
          color="bg-gradient-to-r from-red-500 to-yellow-500"
        />
        
        <ScoreCard
          title="Diversification"
          score={data.diversificationScore || 78}
          icon="🎯"
          description="Portfolio spread analysis"
          color="bg-gradient-to-r from-mystical-purple to-mystical-gold"
        />
        
        <ScoreCard
          title="Trend Alignment"
          score={data.trendScore || 82}
          icon="📈"
          description="Market trend positioning"
          color="bg-gradient-to-r from-green-500 to-blue-500"
        />
        
        <ScoreCard
          title="Community Strength"
          score={data.communityStrength || 71}
          icon="🤝"
          description="Collection community health"
          color="bg-gradient-to-r from-purple-500 to-pink-500"
        />
      </div>

      {/* Time-based Analysis */}
      {data.timeAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-background/50 border border-mystical-purple/30 rounded-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">⏰</span>
            <h4 className="text-lg font-semibold text-mystical-gold">Temporal Patterns</h4>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <h5 className="text-sm text-mystical-purple mb-1">Average Holding Time</h5>
              <p className="text-foreground">{data.timeAnalysis.averageHoldingTime}</p>
            </div>
            
            <div>
              <h5 className="text-sm text-mystical-purple mb-1">Recent Activity</h5>
              <p className="text-foreground capitalize">
                {data.timeAnalysis.recentActivity}
                <span className="ml-2">
                  {data.timeAnalysis.recentActivity === "high" ? "🔥" :
                   data.timeAnalysis.recentActivity === "medium" ? "⚡" : "😴"}
                </span>
              </p>
            </div>
            
            <div>
              <h5 className="text-sm text-mystical-purple mb-1">Collection Growth</h5>
              <p className="text-foreground">{data.timeAnalysis.collectionGrowth}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Market Timing Analysis */}
      {data.marketTiming && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-background/50 border border-mystical-purple/30 rounded-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">📊</span>
            <h4 className="text-lg font-semibold text-mystical-gold">Market Timing Intelligence</h4>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-mystical-purple">Buy Timing Assessment:</span>
              <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                data.marketTiming.buyTiming === "excellent" ? "bg-green-500/20 text-green-300" :
                data.marketTiming.buyTiming === "good" ? "bg-blue-500/20 text-blue-300" :
                data.marketTiming.buyTiming === "average" ? "bg-yellow-500/20 text-yellow-300" :
                "bg-red-500/20 text-red-300"
              }`}>
                {data.marketTiming.buyTiming}
              </span>
            </div>
            
            <div>
              <h5 className="text-sm text-mystical-purple mb-2">Current Market Cycle:</h5>
              <div className="flex items-center gap-2">
                <span className="capitalize text-foreground">{data.marketTiming.marketCycle}</span>
                <span className="text-lg">
                  {data.marketTiming.marketCycle === "accumulation" ? "🌱" :
                   data.marketTiming.marketCycle === "growth" ? "🚀" :
                   data.marketTiming.marketCycle === "distribution" ? "⚖️" : "📉"}
                </span>
              </div>
            </div>
            
            {data.marketTiming.sellOpportunities.length > 0 && (
              <div>
                <h5 className="text-sm text-mystical-purple mb-2">Sell Opportunities:</h5>
                <div className="space-y-1">
                  {data.marketTiming.sellOpportunities.map((opportunity, index) => (
                    <div key={index} className="text-xs text-foreground/80 flex items-center gap-2">
                      <span className="text-mystical-gold">•</span>
                      {opportunity}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Total Portfolio Value */}
      {data.totalValue && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 bg-gradient-to-r from-mystical-purple/20 to-mystical-gold/20 
                     border border-mystical-gold/30 rounded-lg text-center"
        >
          <div className="mb-2">
            <span className="text-sm text-mystical-gold">Estimated Portfolio Value</span>
          </div>
          <div className="text-3xl font-bold text-mystical-gold mb-1">
            {formatCurrency(data.totalValue)}
          </div>
          <div className="text-xs text-foreground/60">
            Based on floor prices and recent sales
          </div>
        </motion.div>
      )}
    </div>
  );
}