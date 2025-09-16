'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  pdfUrl: string | null;
  number: string | null;
}

interface BillingHistoryProps {
  userId: string;
}

export default function BillingHistory({ userId }: BillingHistoryProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBillingHistory();
  }, [userId]);

  const fetchBillingHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/payments/subscription?userId=${userId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch billing history');
      }

      if (data.success && data.invoices) {
        setInvoices(data.invoices);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load billing history');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return '✅';
      case 'pending':
        return '⏳';
      case 'failed':
        return '❌';
      default:
        return '📄';
    }
  };

  if (loading) {
    return (
      <div className="bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
        <h3 className="text-xl font-bold text-purple-300 mb-4">💸 Billing History</h3>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="h-16 bg-purple-900/20 rounded-lg animate-pulse"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-black/40 backdrop-blur-sm border border-red-500/30 rounded-xl p-6">
        <h3 className="text-xl font-bold text-red-300 mb-4">💸 Billing History</h3>
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-300">❌ {error}</p>
          <button
            onClick={fetchBillingHistory}
            className="mt-2 px-4 py-2 bg-red-600/20 border border-red-500/30 rounded-lg text-red-300 hover:bg-red-600/30 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
      <h3 className="text-xl font-bold text-purple-300 mb-4">💸 Billing History</h3>
      
      {invoices.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-gray-400">No billing history available</p>
          <p className="text-sm text-gray-500 mt-2">
            Invoices will appear here after your first payment
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {invoices.map((invoice, index) => (
              <motion.div
                key={invoice.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4 hover:border-purple-500/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getStatusIcon(invoice.status)}</span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold text-white">
                          {formatAmount(invoice.amount, invoice.currency)}
                        </p>
                        <span className={`text-sm font-medium ${getStatusColor(invoice.status)}`}>
                          {invoice.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        {invoice.number && (
                          <span>Invoice {invoice.number}</span>
                        )}
                        <span>•</span>
                        <span>
                          {formatDistanceToNow(new Date(invoice.created * 1000), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {invoice.pdfUrl && (
                      <motion.a
                        href={invoice.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-purple-600/20 border border-purple-500/30 rounded-lg text-purple-300 hover:bg-purple-600/30 transition-colors text-sm"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        📄 Download
                      </motion.a>
                    )}
                  </div>
                </div>

                {invoice.status === 'failed' && (
                  <div className="mt-3 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-300 text-sm">
                      ⚠️ Payment failed. Please update your payment method or contact support.
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {invoices.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-700/50">
          <p className="text-sm text-gray-500 text-center">
            💡 Invoices are automatically generated for all subscription payments
          </p>
        </div>
      )}
    </div>
  );
}