import { NextRequest, NextResponse } from 'next/server';
import { subscriptionManager } from '@/src/lib/stripe/subscription-manager';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId' },
        { status: 400 }
      );
    }

    // Get user's subscription to find customer ID
    const subscription = await subscriptionManager.getSubscriptionByUserId(userId);
    
    if (!subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
    
    // Create billing portal session
    const session = await subscriptionManager.createBillingPortalSession({
      customerId: subscription.customerId,
      returnUrl: `${baseUrl}/profile?tab=billing`,
    });

    console.log(`🏦 Created billing portal session for user ${userId}`);

    return NextResponse.json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.error('Billing portal creation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create billing portal session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}