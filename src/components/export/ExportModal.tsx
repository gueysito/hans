"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/src/lib/auth";
import { 
  generateOracleReport, 
  exportSessionToCSV, 
  generateShareableInsightCard,
  type PDFReportOptions 
} from "@/src/lib/export/pdf-generator";

interface ExportModalProps {
  session: any;
  onClose: () => void;
}

export default function ExportModal({ session, onClose }: ExportModalProps) {
  const { user } = useAuth();
  const [exportType, setExportType] = useState<"pdf" | "csv" | "insight-cards">("pdf");
  const [pdfOptions, setPdfOptions] = useState<PDFReportOptions>({
    includeConversation: true,
    includeInsights: true,
    includeAnalytics: true,
    format: "detailed",
    theme: "mystical"
  });
  const [selectedInsight, setSelectedInsight] = useState<number>(0);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!user || !session) return;
    
    setIsExporting(true);
    
    try {
      let blob: Blob;
      let filename: string;
      
      switch (exportType) {
        case "pdf":
          blob = await generateOracleReport(session, user, pdfOptions);
          filename = `hans-oracle-report-${session.id.slice(-8)}.pdf`;
          break;
          
        case "csv":
          blob = await exportSessionToCSV(session, user);
          filename = `oracle-session-${session.id.slice(-8)}.csv`;
          break;
          
        case "insight-cards":
          const insight = session.insights[selectedInsight];
          blob = await generateShareableInsightCard(insight, session.walletAddress);
          filename = `insight-card-${insight.title.replace(/[^a-zA-Z0-9]/g, '-')}.svg`;
          break;
          
        default:
          throw new Error("Invalid export type");
      }
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Close modal after short delay
      setTimeout(() => {
        onClose();
      }, 1000);
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="max-w-2xl w-full bg-background/90 border border-mystical-purple/30 rounded-xl p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-mystical-gold flex items-center gap-2">
            <span>📊</span>
            Export Oracle Session
          </h2>
          <button
            onClick={onClose}
            className="text-foreground/60 hover:text-mystical-gold text-xl"
          >
            ✕
          </button>
        </div>

        {/* Export Type Selection */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg text-mystical-purple">Choose Export Format:</h3>
          
          <div className="grid md:grid-cols-3 gap-3">
            <button
              onClick={() => setExportType("pdf")}
              className={`p-4 rounded-lg border transition-all ${
                exportType === "pdf"
                  ? "border-mystical-gold/40 bg-mystical-gold/10 text-mystical-gold"
                  : "border-mystical-purple/30 hover:border-mystical-purple/50"
              }`}
            >
              <div className="text-2xl mb-2">📄</div>
              <div className="font-medium">PDF Report</div>
              <div className="text-xs text-foreground/60 mt-1">
                Complete mystical analysis
              </div>
            </button>
            
            <button
              onClick={() => setExportType("csv")}
              className={`p-4 rounded-lg border transition-all ${
                exportType === "csv"
                  ? "border-mystical-gold/40 bg-mystical-gold/10 text-mystical-gold"
                  : "border-mystical-purple/30 hover:border-mystical-purple/50"
              }`}
            >
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium">CSV Data</div>
              <div className="text-xs text-foreground/60 mt-1">
                Raw session data
              </div>
            </button>
            
            <button
              onClick={() => setExportType("insight-cards")}
              className={`p-4 rounded-lg border transition-all ${
                exportType === "insight-cards"
                  ? "border-mystical-gold/40 bg-mystical-gold/10 text-mystical-gold"
                  : "border-mystical-purple/30 hover:border-mystical-purple/50"
              }`}
            >
              <div className="text-2xl mb-2">🎨</div>
              <div className="font-medium">Insight Cards</div>
              <div className="text-xs text-foreground/60 mt-1">
                Shareable graphics
              </div>
            </button>
          </div>
        </div>

        {/* PDF Options */}
        {exportType === "pdf" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-4 mb-6"
          >
            <h4 className="text-mystical-purple">PDF Report Options:</h4>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-foreground/70 mb-2">Theme:</label>
                <select
                  value={pdfOptions.theme}
                  onChange={(e) => setPdfOptions({...pdfOptions, theme: e.target.value as any})}
                  className="w-full p-2 bg-background/50 border border-mystical-purple/30 rounded-lg text-foreground"
                >
                  <option value="mystical">🔮 Mystical</option>
                  <option value="professional">💼 Professional</option>
                  <option value="minimal">📄 Minimal</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-foreground/70 mb-2">Format:</label>
                <select
                  value={pdfOptions.format}
                  onChange={(e) => setPdfOptions({...pdfOptions, format: e.target.value as any})}
                  className="w-full p-2 bg-background/50 border border-mystical-purple/30 rounded-lg text-foreground"
                >
                  <option value="detailed">📋 Detailed</option>
                  <option value="summary">📝 Summary</option>
                  <option value="insights-only">✨ Insights Only</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <h5 className="text-sm text-foreground/70">Include Sections:</h5>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pdfOptions.includeInsights}
                  onChange={(e) => setPdfOptions({...pdfOptions, includeInsights: e.target.checked})}
                  className="w-4 h-4 accent-mystical-purple"
                />
                <span className="text-sm">Mystical Insights</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pdfOptions.includeConversation}
                  onChange={(e) => setPdfOptions({...pdfOptions, includeConversation: e.target.checked})}
                  className="w-4 h-4 accent-mystical-purple"
                />
                <span className="text-sm">Conversation History</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pdfOptions.includeAnalytics}
                  onChange={(e) => setPdfOptions({...pdfOptions, includeAnalytics: e.target.checked})}
                  className="w-4 h-4 accent-mystical-purple"
                />
                <span className="text-sm">Session Analytics</span>
              </label>
            </div>
          </motion.div>
        )}

        {/* Insight Card Selection */}
        {exportType === "insight-cards" && session.insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-4 mb-6"
          >
            <h4 className="text-mystical-purple">Select Insight to Export:</h4>
            
            <div className="space-y-2 max-h-40 overflow-auto">
              {session.insights.map((insight: any, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedInsight(index)}
                  className={`w-full p-3 text-left rounded-lg border transition-colors ${
                    selectedInsight === index
                      ? "border-mystical-gold/40 bg-mystical-gold/10"
                      : "border-mystical-purple/30 hover:border-mystical-purple/50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span>
                      {insight.style === "major" ? "✨" : 
                       insight.style === "minor" ? "🔮" : "💫"}
                    </span>
                    <span className="font-medium text-mystical-gold">{insight.title}</span>
                  </div>
                  <p className="text-sm text-foreground/70 line-clamp-2">
                    {insight.insight}
                  </p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Session Info */}
        <div className="bg-mystical-purple/10 border border-mystical-purple/30 rounded-lg p-4 mb-6">
          <h4 className="text-mystical-gold font-medium mb-2">Session Information:</h4>
          <div className="text-sm text-foreground/70 space-y-1">
            <div>Wallet: {session.walletAddress}</div>
            <div>Date: {new Date(session.createdAt).toLocaleDateString()}</div>
            <div>Messages: {session.messages?.length || 0}</div>
            <div>Insights: {session.insights?.length || 0}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <div className="text-xs text-foreground/60">
            <p>🔮 Export preserves your mystical journey</p>
            <p>📄 Files are generated locally and securely</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isExporting}
              className="px-4 py-2 text-foreground/60 hover:text-foreground transition-colors
                       disabled:opacity-50"
            >
              Cancel
            </button>
            <motion.button
              onClick={handleExport}
              disabled={isExporting}
              className="px-6 py-2 bg-gradient-to-r from-mystical-purple to-mystical-gold
                       text-white font-medium rounded-lg hover:opacity-80 
                       disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              whileHover={{ scale: !isExporting ? 1.02 : 1 }}
              whileTap={{ scale: !isExporting ? 0.98 : 1 }}
            >
              {isExporting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Generating...</span>
                </div>
              ) : (
                "📊 Export"
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}