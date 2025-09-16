'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';

interface PaymentButtonProps {
  tier: 'mystic' | 'oracle';
  interval: 'monthly' | 'yearly';
  price: number;
  className?: string;
  children?: React.ReactNode;
}

export default function PaymentButton({ 
  tier, 
  interval, 
  price, 
  className = '',
  children 
}: PaymentButtonProps) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!user) {
      setError('Please sign in to continue');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.emailAddresses[0]?.emailAddress,
          tier,
          interval,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.success && data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const tierEmojis = {
    mystic: '🔮',
    oracle: '🌟',
  };

  const intervalLabels = {
    monthly: 'month',
    yearly: 'year',
  };

  return (
    <div className="space-y-2">
      <motion.button
        onClick={handleCheckout}
        disabled={loading || !user}
        className={`
          relative overflow-hidden px-6 py-3 rounded-xl font-semibold text-white
          bg-gradient-to-r from-purple-600 to-pink-600
          hover:from-purple-700 hover:to-pink-700
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-300 shadow-lg hover:shadow-xl
          ${className}
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {loading && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
        
        <div className="relative z-10 flex items-center justify-center space-x-2">
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>{tierEmojis[tier]}</span>
              <span>
                {children || `Upgrade to ${tier} - ${formatPrice(price)}/${intervalLabels[interval]}`}
              </span>
            </>
          )}
        </div>
      </motion.button>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg"
        >
          <p className="text-red-300 text-sm">❌ {error}</p>
        </motion.div>
      )}

      {!user && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg"
        >
          <p className="text-yellow-300 text-sm">⚠️ Please sign in to access premium features</p>
        </motion.div>
      )}
    </div>
  );
}