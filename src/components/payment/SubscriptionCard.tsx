'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import PaymentButton from './PaymentButton';
import BillingHistory from '../billing/BillingHistory';

interface SubscriptionDetails {
  id: string;
  customerId: string;
  status: string;
  tier: string;
  interval: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  amount: number;
  currency: string;
}

export default function SubscriptionCard() {
  const { user } = useUser();
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  const fetchSubscription = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/payments/subscription?userId=${user.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch subscription');
      }

      if (data.success) {
        setSubscription(data.subscription);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionAction = async (action: string, options?: any) => {
    if (!user || !subscription) return;

    try {
      setActionLoading(action);
      setError(null);

      const response = await fetch('/api/payments/subscription', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          action,
          ...options,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update subscription');
      }

      if (data.success) {
        await fetchSubscription(); // Refresh subscription data
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const openBillingPortal = async () => {
    if (!user) return;

    try {
      setActionLoading('billing_portal');

      const response = await fetch('/api/payments/billing-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open billing portal');
      }

      if (data.success && data.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open billing portal');
    } finally {
      setActionLoading(null);
    }
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTierEmoji = (tier: string) => {
    switch (tier) {
      case 'mystic': return '🔮';
      case 'oracle': return '🌟';
      default: return '👤';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'trialing': return 'text-blue-400';
      case 'past_due': return 'text-yellow-400';
      case 'canceled': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (!user) {
    return (
      <div className="bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
        <h3 className="text-xl font-bold text-purple-300 mb-4">💳 Subscription</h3>
        <p className="text-gray-400">Please sign in to view your subscription</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
        <h3 className="text-xl font-bold text-purple-300 mb-4">💳 Subscription</h3>
        <div className="space-y-4">
          <div className="h-4 bg-purple-900/20 rounded animate-pulse" />
          <div className="h-8 bg-purple-900/20 rounded animate-pulse" />
          <div className="h-4 bg-purple-900/20 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
        <h3 className="text-xl font-bold text-purple-300 mb-4">💳 Subscription</h3>
        
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg"
          >
            <p className="text-red-300">❌ {error}</p>
          </motion.div>
        )}

        {subscription ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getTierEmoji(subscription.tier)}</span>
                  <span className="text-lg font-semibold text-white capitalize">
                    {subscription.tier} Plan
                  </span>
                  <span className={`text-sm font-medium ${getStatusColor(subscription.status)}`}>
                    {subscription.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-400">
                  {formatPrice(subscription.amount, subscription.currency)} / {subscription.interval}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Next billing:</span>
                <p className="text-white">{formatDate(subscription.currentPeriodEnd)}</p>
              </div>
              <div>
                <span className="text-gray-400">Auto-renewal:</span>
                <p className="text-white">
                  {subscription.cancelAtPeriodEnd ? 'Disabled (canceling)' : 'Enabled'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-700/50">
              <motion.button
                onClick={openBillingPortal}
                disabled={actionLoading !== null}
                className="px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-lg text-purple-300 hover:bg-purple-600/30 transition-colors disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {actionLoading === 'billing_portal' ? 'Opening...' : '🏦 Manage Billing'}
              </motion.button>

              {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
                <motion.button
                  onClick={() => handleSubscriptionAction('cancel')}
                  disabled={actionLoading !== null}
                  className="px-4 py-2 bg-red-600/20 border border-red-500/30 rounded-lg text-red-300 hover:bg-red-600/30 transition-colors disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {actionLoading === 'cancel' ? 'Canceling...' : '❌ Cancel Subscription'}
                </motion.button>
              )}

              {subscription.cancelAtPeriodEnd && (
                <motion.button
                  onClick={() => handleSubscriptionAction('reactivate')}
                  disabled={actionLoading !== null}
                  className="px-4 py-2 bg-green-600/20 border border-green-500/30 rounded-lg text-green-300 hover:bg-green-600/30 transition-colors disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {actionLoading === 'reactivate' ? 'Reactivating...' : '✅ Reactivate'}
                </motion.button>
              )}
            </div>

            {subscription.cancelAtPeriodEnd && (
              <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-300 text-sm">
                  ⚠️ Your subscription will end on {formatDate(subscription.currentPeriodEnd)}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="text-6xl mb-4">👤</div>
              <p className="text-gray-400 mb-2">Free Tier (Cosmic Seeker)</p>
              <p className="text-sm text-gray-500">Upgrade to unlock premium features</p>
            </div>

            <div className="space-y-3">
              <PaymentButton
                tier="mystic"
                interval="monthly"
                price={1900} // $19.00 in cents
                className="w-full"
              />
              
              <PaymentButton
                tier="oracle"
                interval="monthly"
                price={4900} // $49.00 in cents
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>

      {subscription && (
        <BillingHistory userId={user.id} />
      )}
    </div>
  );
}