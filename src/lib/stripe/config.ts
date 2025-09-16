// Stripe Configuration for Hans Oracle Premium Subscriptions
import Stripe from 'stripe';

// Initialize Stripe with secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
  appInfo: {
    name: 'Hans NFT Oracle',
    version: '1.0.0',
  },
});

// Premium subscription tiers configuration
export const SUBSCRIPTION_TIERS = {
  seeker: {
    id: 'seeker',
    name: 'Cosmic Seeker',
    description: 'Basic mystical insights for the curious explorer',
    price: {
      monthly: 0,
      yearly: 0,
    },
    stripePriceIds: {
      monthly: null,
      yearly: null,
    },
    features: [
      'Basic oracle readings',
      '2 sessions per day',
      'Standard insights',
      'Basic NFT analysis',
      'Community access',
    ],
    limits: {
      sessionsPerDay: 2,
      aiPredictions: false,
      voiceOracle: false,
      walletComparisons: 1,
      exportFormats: ['txt'],
      historicalData: false,
    },
  },
  mystic: {
    id: 'mystic',
    name: 'Digital Mystic',
    description: 'Enhanced mystical powers for the dedicated seeker',
    price: {
      monthly: 19,
      yearly: 190, // 2 months free
    },
    stripePriceIds: {
      monthly: process.env.STRIPE_MYSTIC_MONTHLY_PRICE_ID || 'price_mystic_monthly',
      yearly: process.env.STRIPE_MYSTIC_YEARLY_PRICE_ID || 'price_mystic_yearly',
    },
    features: [
      'Unlimited oracle readings',
      'Advanced AI predictions',
      'Voice oracle interaction',
      'Enhanced analytics dashboard',
      'PDF export capabilities',
      'Priority support',
    ],
    limits: {
      sessionsPerDay: -1, // unlimited
      aiPredictions: true,
      voiceOracle: true,
      walletComparisons: 3,
      exportFormats: ['txt', 'pdf', 'csv'],
      historicalData: '30-days',
    },
  },
  oracle: {
    id: 'oracle',
    name: 'Master Oracle',
    description: 'Ultimate mystical mastery for the enlightened',
    price: {
      monthly: 49,
      yearly: 490, // 2 months free
    },
    stripePriceIds: {
      monthly: process.env.STRIPE_ORACLE_MONTHLY_PRICE_ID || 'price_oracle_monthly',
      yearly: process.env.STRIPE_ORACLE_YEARLY_PRICE_ID || 'price_oracle_yearly',
    },
    features: [
      'Everything in Digital Mystic',
      'Unlimited AI predictions',
      '5-wallet comparison analysis',
      'Custom training on your collection',
      'Advanced historical analytics',
      'White-glove support',
      'API access',
      'Custom insights',
    ],
    limits: {
      sessionsPerDay: -1, // unlimited
      aiPredictions: true,
      voiceOracle: true,
      walletComparisons: 5,
      exportFormats: ['txt', 'pdf', 'csv', 'json', 'svg'],
      historicalData: 'unlimited',
      apiAccess: true,
      customTraining: true,
    },
  },
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;
export type BillingInterval = 'monthly' | 'yearly';

// Stripe product configuration for creating products/prices
export const STRIPE_PRODUCTS = {
  mystic: {
    name: 'Hans Oracle - Digital Mystic',
    description: 'Enhanced mystical powers for dedicated seekers of NFT wisdom',
    metadata: {
      tier: 'mystic',
      features: 'unlimited_readings,ai_predictions,voice_oracle,analytics',
    },
  },
  oracle: {
    name: 'Hans Oracle - Master Oracle',
    description: 'Ultimate mystical mastery for enlightened NFT analysis',
    metadata: {
      tier: 'oracle',
      features: 'everything_mystic,unlimited_ai,5_wallet_comparison,api_access',
    },
  },
};

// Helper functions
export function getTierById(tierId: string): typeof SUBSCRIPTION_TIERS[SubscriptionTier] | null {
  return SUBSCRIPTION_TIERS[tierId as SubscriptionTier] || null;
}

export function getPriceId(tier: SubscriptionTier, interval: BillingInterval): string | null {
  const tierConfig = SUBSCRIPTION_TIERS[tier];
  return tierConfig?.stripePriceIds[interval] || null;
}

export function calculateYearlySavings(tier: SubscriptionTier): number {
  const tierConfig = SUBSCRIPTION_TIERS[tier];
  if (!tierConfig) return 0;
  
  const monthlyYearly = tierConfig.price.monthly * 12;
  const yearly = tierConfig.price.yearly;
  return monthlyYearly - yearly;
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

// Subscription status helpers
export function isActiveSubscription(status: string): boolean {
  return ['active', 'trialing'].includes(status);
}

export function isPastDue(status: string): boolean {
  return status === 'past_due';
}

export function isCanceled(status: string): boolean {
  return ['canceled', 'unpaid'].includes(status);
}

// Feature access control
export function hasFeatureAccess(
  userTier: SubscriptionTier, 
  feature: keyof typeof SUBSCRIPTION_TIERS.oracle.limits
): boolean {
  const tierConfig = SUBSCRIPTION_TIERS[userTier];
  if (!tierConfig) return false;
  
  const featureValue = tierConfig.limits[feature];
  
  // Handle boolean features
  if (typeof featureValue === 'boolean') {
    return featureValue;
  }
  
  // Handle numeric limits (-1 means unlimited)
  if (typeof featureValue === 'number') {
    return featureValue > 0 || featureValue === -1;
  }
  
  // Handle string/array features
  return Boolean(featureValue);
}

export function getFeatureLimit(
  userTier: SubscriptionTier,
  feature: keyof typeof SUBSCRIPTION_TIERS.oracle.limits
): any {
  const tierConfig = SUBSCRIPTION_TIERS[userTier];
  return tierConfig?.limits[feature] || null;
}

// Usage tracking helpers
export function isWithinLimit(
  userTier: SubscriptionTier,
  feature: 'sessionsPerDay' | 'walletComparisons',
  currentUsage: number
): boolean {
  const limit = getFeatureLimit(userTier, feature);
  
  if (typeof limit !== 'number') return true;
  if (limit === -1) return true; // unlimited
  
  return currentUsage < limit;
}

// Webhook event types we handle
export const WEBHOOK_EVENTS = {
  CHECKOUT_COMPLETED: 'checkout.session.completed',
  SUBSCRIPTION_CREATED: 'customer.subscription.created',
  SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  INVOICE_PAID: 'invoice.payment_succeeded',
  INVOICE_FAILED: 'invoice.payment_failed',
  PAYMENT_METHOD_ATTACHED: 'payment_method.attached',
} as const;