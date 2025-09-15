"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import InsightCard from "./InsightCard";

interface WalletAnalysis {
  address: string;
  nftData: {
    totalCount: number;
    topCollections: string[];
  };
  caesarAnalysis: any;
  mysticalInsights: any[];
}

interface ComparisonData {
  summary: {
    totalWallets: number;
    totalNFTs: number;
    uniqueCollections: number;
    sharedCollections: number;
    averageCollectionSize: number;
  };
  sharedCollections: string[];
  cosmicConnections: Array<{
    wallet1: string;
    wallet2: string;
    sharedCollections: string[];
    connectionStrength: number;
    cosmicResonance: string;
  }>;
  diversityAnalysis: Array<{
    address: string;
    diversityScore: number;
    collectionCount: number;
    totalNFTs: number;
    diversityLevel: string;
  }>;
  spiritualAlignment: Array<{
    address: string;
    spiritualArchetype: string;
    consciousnessLevel: number;
    karmaScore: number;
    digitalChakraAlignment: Array<{
      name: string;
      alignment: number;
    }>;
  }>;
  comparativeInsights: Array<{
    type: string;
    title: string;
    insight: string;
    cosmicSignificance: string;
  }>;
}

interface WalletComparisonResultsProps {
  individualAnalyses: WalletAnalysis[];
  comparison: ComparisonData;
  onClose: () => void;
  onNewComparison: () => void;
}

export default function WalletComparisonResults({ 
  individualAnalyses, 
  comparison, 
  onClose, 
  onNewComparison 
}: WalletComparisonResultsProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "connections" | "individual" | "spiritual">("overview");

  const ScoreCard = ({ title, value, icon, description, color }: {
    title: string;
    value: string | number;
    icon: string;
    description: string;
    color: string;
  }) => (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`p-4 rounded-lg border ${color} bg-gradient-to-br from-background/80 to-background/60`}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <h4 className="font-semibold text-mystical-gold">{title}</h4>
      </div>
      <div className="text-2xl font-bold text-mystical-gold mb-1">{value}</div>
      <p className="text-xs text-foreground/60">{description}</p>
    </motion.div>
  );

  const ConnectionStrength = ({ strength }: { strength: number }) => {
    const getStrengthColor = (str: number) => {
      if (str > 0.7) return "text-green-400";
      if (str > 0.4) return "text-yellow-400";
      if (str > 0.2) return "text-orange-400";
      return "text-red-400";
    };

    return (
      <div className="flex items-center gap-2">
        <div className="w-16 bg-gray-700 rounded-full h-2">
          <motion.div
            className={`h-2 rounded-full bg-gradient-to-r from-mystical-purple to-mystical-gold`}
            initial={{ width: 0 }}
            animate={{ width: `${strength * 100}%` }}
            transition={{ duration: 1 }}
          />
        </div>
        <span className={`text-xs font-medium ${getStrengthColor(strength)}`}>
          {Math.round(strength * 100)}%
        </span>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full max-w-7xl mx-auto"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-mystical-gold mb-2">
            Cosmic Wallet Comparison
          </h2>
          <p className="text-foreground/70">
            Revealing the mystical connections between {comparison.summary.totalWallets} digital souls
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onNewComparison}
            className="px-4 py-2 bg-mystical-purple/20 border border-mystical-purple/40 
                     rounded-lg text-mystical-purple hover:bg-mystical-purple/30 transition-colors"
          >
            New Comparison
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-foreground/60 hover:text-mystical-gold transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 mb-6 border-b border-mystical-purple/20">
        {[
          { key: "overview", label: "Overview", icon: "📊" },
          { key: "connections", label: "Cosmic Connections", icon: "🌌" },
          { key: "individual", label: "Individual Analysis", icon: "👤" },
          { key: "spiritual", label: "Spiritual Alignment", icon: "🧘" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-4 py-3 rounded-t-lg transition-colors ${
              activeTab === tab.key
                ? "bg-mystical-purple/20 border-t border-l border-r border-mystical-purple/40 text-mystical-gold"
                : "text-foreground/70 hover:text-mystical-purple"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Summary Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <ScoreCard
                title="Total NFTs"
                value={comparison.summary.totalNFTs}
                icon="🎨"
                description="Combined collection size"
                color="border-mystical-gold/30"
              />
              <ScoreCard
                title="Unique Collections"
                value={comparison.summary.uniqueCollections}
                icon="🌟"
                description="Distinct projects represented"
                color="border-mystical-purple/30"
              />
              <ScoreCard
                title="Shared Collections"
                value={comparison.summary.sharedCollections}
                icon="🤝"
                description="Common ground found"
                color="border-green-500/30"
              />
              <ScoreCard
                title="Average Size"
                value={comparison.summary.averageCollectionSize}
                icon="📏"
                description="NFTs per wallet"
                color="border-blue-500/30"
              />
            </div>

            {/* Diversity Analysis */}
            <div className="bg-background/50 border border-mystical-purple/30 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-mystical-gold mb-4 flex items-center gap-2">
                🎯 Collector Diversity Spectrum
              </h3>
              <div className="grid gap-4">
                {comparison.diversityAnalysis.map((analysis, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-background/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-mystical-purple font-mono">{analysis.address}</span>
                      <span className="px-2 py-1 bg-mystical-gold/20 text-mystical-gold rounded-md text-xs">
                        {analysis.diversityLevel}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span>{analysis.collectionCount} collections</span>
                      <span>{analysis.totalNFTs} NFTs</span>
                      <div className="flex items-center gap-2">
                        <span>Diversity:</span>
                        <div className="w-16 bg-gray-700 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-gradient-to-r from-mystical-purple to-mystical-gold"
                            style={{ width: `${analysis.diversityScore}%` }}
                          />
                        </div>
                        <span className="text-mystical-gold">{analysis.diversityScore}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comparative Insights */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-mystical-gold flex items-center gap-2">
                🔮 Mystical Revelations
              </h3>
              {comparison.comparativeInsights.map((insight, index) => (
                <InsightCard
                  key={index}
                  title={insight.title}
                  insight={insight.insight}
                  confidence={0.85}
                  cardStyle={insight.type as "major" | "minor" | "clarification"}
                  delay={index * 0.1}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Connections Tab */}
        {activeTab === "connections" && (
          <motion.div
            key="connections"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-semibold text-mystical-gold mb-2">
                🌌 Cosmic Connections
              </h3>
              <p className="text-foreground/70">
                The universe reveals hidden bonds between these digital souls
              </p>
            </div>

            {comparison.cosmicConnections.length > 0 ? (
              <div className="space-y-6">
                {comparison.cosmicConnections.map((connection, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-background/50 border border-mystical-purple/30 rounded-lg p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-mystical-purple">{connection.wallet1}</span>
                        <span className="text-mystical-gold">↔</span>
                        <span className="font-mono text-mystical-purple">{connection.wallet2}</span>
                      </div>
                      <ConnectionStrength strength={connection.connectionStrength} />
                    </div>
                    
                    <div className="mb-3">
                      <h4 className="text-mystical-gold font-semibold mb-2">Shared Collections:</h4>
                      <div className="flex flex-wrap gap-2">
                        {connection.sharedCollections.map((collection, i) => (
                          <span 
                            key={i}
                            className="px-2 py-1 bg-mystical-gold/20 text-mystical-gold rounded-md text-xs"
                          >
                            {collection}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-sm text-foreground/80 italic">
                      {connection.cosmicResonance}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🌙</div>
                <h4 className="text-lg font-semibold text-mystical-gold mb-2">
                  Parallel Paths
                </h4>
                <p className="text-foreground/70">
                  These wallets walk separate digital paths, each following their unique cosmic calling. 
                  Sometimes the greatest wisdom lies in diversity.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Individual Analysis Tab */}
        {activeTab === "individual" && (
          <motion.div
            key="individual"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {individualAnalyses.map((analysis, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-background/50 border border-mystical-purple/30 rounded-lg p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-mystical-gold">
                      Wallet {index + 1}
                    </h3>
                    <p className="font-mono text-mystical-purple text-sm">
                      {analysis.address.slice(0, 6)}...{analysis.address.slice(-4)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-mystical-gold">
                      {analysis.nftData.totalCount}
                    </div>
                    <div className="text-xs text-foreground/60">NFTs</div>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-mystical-purple mb-2">Top Collections</h4>
                    <div className="space-y-1">
                      {analysis.nftData.topCollections.slice(0, 5).map((collection, i) => (
                        <div key={i} className="text-sm text-foreground/80">
                          • {collection}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-mystical-purple mb-2">Mystical Insights</h4>
                    <div className="space-y-2">
                      {analysis.mysticalInsights.slice(0, 2).map((insight, i) => (
                        <div key={i} className="text-xs text-foreground/80">
                          <span className="text-mystical-gold">• {insight.title}:</span>
                          <span className="ml-2">{insight.mysticalInsight.slice(0, 100)}...</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Spiritual Alignment Tab */}
        {activeTab === "spiritual" && (
          <motion.div
            key="spiritual"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-semibold text-mystical-gold mb-2">
                🧘 Spiritual Alignment Analysis
              </h3>
              <p className="text-foreground/70">
                Revealing the deeper consciousness patterns within each digital soul
              </p>
            </div>

            {comparison.spiritualAlignment.map((alignment, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
                className="bg-background/50 border border-mystical-purple/30 rounded-lg p-6"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-mystical-gold mb-3">
                      {alignment.address}
                    </h4>
                    
                    <div className="space-y-3">
                      <div>
                        <span className="text-mystical-purple text-sm">Spiritual Archetype:</span>
                        <div className="text-mystical-gold font-medium">{alignment.spiritualArchetype}</div>
                      </div>
                      
                      <div>
                        <span className="text-mystical-purple text-sm">Consciousness Level:</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-700 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full bg-gradient-to-r from-mystical-purple to-mystical-gold"
                              style={{ width: `${alignment.consciousnessLevel}%` }}
                            />
                          </div>
                          <span className="text-mystical-gold">{alignment.consciousnessLevel}%</span>
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-mystical-purple text-sm">Karma Score:</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-700 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full bg-gradient-to-r from-green-500 to-mystical-gold"
                              style={{ width: `${alignment.karmaScore}%` }}
                            />
                          </div>
                          <span className="text-mystical-gold">{alignment.karmaScore}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-mystical-purple text-sm mb-3">Digital Chakra Alignment:</h5>
                    <div className="space-y-2">
                      {alignment.digitalChakraAlignment.map((chakra, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-foreground/80">{chakra.name}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-700 rounded-full h-1">
                              <div 
                                className="h-1 rounded-full bg-gradient-to-r from-mystical-purple to-mystical-gold"
                                style={{ width: `${chakra.alignment}%` }}
                              />
                            </div>
                            <span className="text-mystical-gold w-8">{chakra.alignment}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}