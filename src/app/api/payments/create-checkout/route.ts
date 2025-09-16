import { NextRequest, NextResponse } from 'next/server';
import { subscriptionManager } from '@/src/lib/stripe/subscription-manager';
import { SUBSCRIPTION_TIERS, type SubscriptionTier, type BillingInterval } from '@/src/lib/stripe/config';
import { paymentRateLimits, validateCheckoutInput, validatePaymentHeaders, logSecurityEvent, getClientIP } from '@/src/lib/payments/security';

export async function POST(request: NextRequest) {
  try {
    // Security validation
    if (!(await validatePaymentHeaders())) {
      await logSecurityEvent('suspicious_request', { 
        endpoint: '/api/payments/create-checkout',
        reason: 'Invalid headers'
      });
      return NextResponse.json(
        { error: 'Request not allowed' },
        { status: 403 }
      );
    }

    // Rate limiting
    const clientIP = await getClientIP();
    const rateLimitResult = paymentRateLimits.checkout.check(clientIP);
    
    if (!rateLimitResult.success) {
      await logSecurityEvent('rate_limit', {
        endpoint: '/api/payments/create-checkout',
        ip: clientIP,
        limit: rateLimitResult.limit,
      });
      
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          }
        }
      );
    }

    const body = await request.json();
    
    // Input validation
    const validatedInput = validateCheckoutInput(body);
    if (!validatedInput) {
      await logSecurityEvent('invalid_input', {
        endpoint: '/api/payments/create-checkout',
        body: JSON.stringify(body),
        ip: clientIP,
      });
      
      return NextResponse.json(
        { error: 'Invalid input parameters' },
        { status: 400 }
      );
    }

    const { userId, email, tier, interval } = validatedInput;

    // Additional tier validation (already validated in validateCheckoutInput)
    if (tier === 'seeker') {
      return NextResponse.json(
        { error: 'Free tier does not require payment' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
    
    // Create checkout session
    const session = await subscriptionManager.createCheckoutSession({
      userId,
      email,
      tier: tier as SubscriptionTier,
      interval: interval as BillingInterval,
      successUrl: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/premium?canceled=true`,
      metadata: {
        source: 'hans_oracle_premium',
      },
    });

    console.log(`💳 Created checkout session for user ${userId}: ${session.id}`);

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Checkout creation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}