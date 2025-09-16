// Payment Security and Validation Utilities for Hans Oracle
import { rateLimit } from '@/src/lib/utils/rate-limit';
import { headers } from 'next/headers';

// Rate limiting configurations for payment endpoints
export const paymentRateLimits = {
  checkout: rateLimit({
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 10, // 10 checkout attempts per minute per IP
  }),
  subscription: rateLimit({
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 20, // 20 subscription API calls per minute per IP
  }),
  webhook: rateLimit({
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 100, // 100 webhook calls per minute (Stripe can send many)
  }),
  billingPortal: rateLimit({
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 5, // 5 billing portal sessions per minute per IP
  }),
};

// Input validation schemas
export interface CheckoutValidation {
  userId: string;
  email: string;
  tier: string;
  interval: string;
}

export interface SubscriptionUpdateValidation {
  userId: string;
  action: 'cancel' | 'reactivate' | 'change_tier';
  tier?: string;
  interval?: string;
  cancelImmediately?: boolean;
}

// Validation functions
export function validateCheckoutInput(data: any): CheckoutValidation | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const { userId, email, tier, interval } = data;

  // Validate userId
  if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
    return null;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email)) {
    return null;
  }

  // Validate tier
  const validTiers = ['mystic', 'oracle'];
  if (!tier || !validTiers.includes(tier)) {
    return null;
  }

  // Validate interval
  const validIntervals = ['monthly', 'yearly'];
  if (!interval || !validIntervals.includes(interval)) {
    return null;
  }

  return { userId: userId.trim(), email: email.trim().toLowerCase(), tier, interval };
}

export function validateSubscriptionUpdate(data: any): SubscriptionUpdateValidation | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const { userId, action, tier, interval, cancelImmediately } = data;

  // Validate userId
  if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
    return null;
  }

  // Validate action
  const validActions = ['cancel', 'reactivate', 'change_tier'];
  if (!action || !validActions.includes(action)) {
    return null;
  }

  const result: SubscriptionUpdateValidation = {
    userId: userId.trim(),
    action,
  };

  // For tier changes, validate tier and interval
  if (action === 'change_tier') {
    const validTiers = ['mystic', 'oracle'];
    const validIntervals = ['monthly', 'yearly'];

    if (!tier || !validTiers.includes(tier)) {
      return null;
    }
    if (!interval || !validIntervals.includes(interval)) {
      return null;
    }

    result.tier = tier;
    result.interval = interval;
  }

  // For cancellations, validate cancelImmediately flag
  if (action === 'cancel' && cancelImmediately !== undefined) {
    if (typeof cancelImmediately !== 'boolean') {
      return null;
    }
    result.cancelImmediately = cancelImmediately;
  }

  return result;
}

// Security headers and CORS validation
export async function validatePaymentHeaders(): Promise<boolean> {
  try {
    const headersList = await headers();
    const contentType = headersList.get('content-type');
    const origin = headersList.get('origin');
    const userAgent = headersList.get('user-agent');

    // Validate content type for POST requests
    if (contentType && !contentType.includes('application/json')) {
      return false;
    }

    // Basic bot detection
    if (userAgent) {
      const suspiciousAgents = ['bot', 'crawler', 'spider', 'scraper'];
      const lowerAgent = userAgent.toLowerCase();
      if (suspiciousAgents.some(agent => lowerAgent.includes(agent))) {
        return false;
      }
    }

    // Validate origin in production
    if (process.env.NODE_ENV === 'production' && origin) {
      const allowedOrigins = [
        process.env.NEXT_PUBLIC_SITE_URL,
        'https://checkout.stripe.com',
        'https://js.stripe.com',
      ].filter(Boolean);

      if (!allowedOrigins.some(allowed => origin.startsWith(allowed!))) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Header validation error:', error);
    return false;
  }
}

// Webhook security validation
export function validateWebhookSecurity(signature: string | null, body: string): boolean {
  if (!signature) {
    return false;
  }

  // Basic signature format validation
  if (!signature.startsWith('t=') || !signature.includes('v1=')) {
    return false;
  }

  // Validate timestamp to prevent replay attacks (within 5 minutes)
  try {
    const timestamp = signature.split(',')[0].replace('t=', '');
    const webhookTime = parseInt(timestamp) * 1000;
    const currentTime = Date.now();
    const timeDiff = Math.abs(currentTime - webhookTime);
    
    // Reject webhooks older than 5 minutes
    if (timeDiff > 5 * 60 * 1000) {
      return false;
    }
  } catch (error) {
    return false;
  }

  return true;
}

// IP allowlist for sensitive operations
export function isAllowedIP(ip: string): boolean {
  // In production, you might want to allowlist specific IPs
  // For now, we'll allow all but could add Stripe's webhook IPs here
  const allowedIPs = [
    // Stripe webhook IPs would go here
    // '54.187.174.169',
    // '54.187.205.235',
    // etc.
  ];

  if (process.env.NODE_ENV === 'production' && allowedIPs.length > 0) {
    return allowedIPs.includes(ip);
  }

  return true;
}

// Request fingerprinting for fraud detection
export async function generateRequestFingerprint(): Promise<string> {
  try {
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const acceptLanguage = headersList.get('accept-language') || '';
    const acceptEncoding = headersList.get('accept-encoding') || '';
    
    const fingerprint = Buffer.from(
      `${userAgent}:${acceptLanguage}:${acceptEncoding}`
    ).toString('base64');
    
    return fingerprint;
  } catch (error) {
    return 'unknown';
  }
}

// Log security events
export async function logSecurityEvent(
  event: 'rate_limit' | 'invalid_input' | 'suspicious_request' | 'webhook_failure',
  details: Record<string, any>
) {
  const timestamp = new Date().toISOString();
  const fingerprint = await generateRequestFingerprint();
  
  console.warn(`🚨 Security Event [${event}] at ${timestamp}:`, {
    ...details,
    fingerprint,
    environment: process.env.NODE_ENV,
  });

  // In production, you might want to send this to a security monitoring service
  // Example: await sendToSecurityService({ event, details, fingerprint, timestamp });
}

// Helper to get client IP address
export async function getClientIP(): Promise<string> {
  try {
    const headersList = await headers();
    const forwarded = headersList.get('x-forwarded-for');
    const realIP = headersList.get('x-real-ip');
    const remoteAddr = headersList.get('x-remote-addr');

    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    if (realIP) {
      return realIP;
    }
    if (remoteAddr) {
      return remoteAddr;
    }

    return 'unknown';
  } catch (error) {
    return 'unknown';
  }
}