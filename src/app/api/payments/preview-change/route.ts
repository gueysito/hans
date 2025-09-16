import { NextRequest, NextResponse } from 'next/server';
import { subscriptionManager } from '@/src/lib/stripe/subscription-manager';
import { SUBSCRIPTION_TIERS, type SubscriptionTier, type BillingInterval } from '@/src/lib/stripe/config';

export async function POST(request: NextRequest) {
  try {
    const { userId, newTier, newInterval } = await request.json();

    if (!userId || !newTier || !newInterval) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, newTier, newInterval' },
        { status: 400 }
      );
    }

    // Validate new tier
    if (!SUBSCRIPTION_TIERS[newTier as SubscriptionTier]) {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 400 }
      );
    }

    // Validate interval
    if (!['monthly', 'yearly'].includes(newInterval)) {
      return NextResponse.json(
        { error: 'Invalid billing interval' },
        { status: 400 }
      );
    }

    // Get current subscription
    const subscription = await subscriptionManager.getSubscriptionByUserId(userId);
    
    if (!subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Can't preview change to free tier
    if (newTier === 'seeker') {
      return NextResponse.json(
        { error: 'Cannot change to free tier. Use cancellation instead.' },
        { status: 400 }
      );
    }

    // Check if this is actually a change
    if (subscription.tier === newTier && subscription.interval === newInterval) {
      return NextResponse.json(
        { error: 'New tier and interval must be different from current subscription' },
        { status: 400 }
      );
    }

    // Get preview of the change
    const preview = await subscriptionManager.previewSubscriptionChange(
      subscription.id,
      newTier as SubscriptionTier,
      newInterval as BillingInterval
    );

    const currentTierConfig = SUBSCRIPTION_TIERS[subscription.tier];
    const newTierConfig = SUBSCRIPTION_TIERS[newTier as SubscriptionTier];

    console.log(`💰 Preview change for user ${userId}: ${subscription.tier}/${subscription.interval} → ${newTier}/${newInterval}`);

    return NextResponse.json({
      success: true,
      preview: {
        currentTier: {
          name: currentTierConfig.name,
          tier: subscription.tier,
          interval: subscription.interval,
          amount: subscription.amount,
          currency: subscription.currency,
        },
        newTier: {
          name: newTierConfig.name,
          tier: newTier,
          interval: newInterval,
          amount: newTierConfig.price[newInterval as BillingInterval] * 100, // convert to cents
          currency: 'usd',
        },
        proration: {
          immediateCharge: preview.immediateTotal,
          nextInvoiceTotal: preview.nextInvoiceTotal,
          currency: preview.currency,
        },
        isUpgrade: newTierConfig.price[newInterval as BillingInterval] > currentTierConfig.price[subscription.interval],
        effectiveDate: subscription.currentPeriodEnd,
      }
    });
  } catch (error) {
    console.error('Subscription preview error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to preview subscription change',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}