import { NextRequest, NextResponse } from 'next/server';
import { subscriptionManager } from '@/src/lib/stripe/subscription-manager';

// Get subscription details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required parameter: userId' },
        { status: 400 }
      );
    }

    const subscription = await subscriptionManager.getSubscriptionByUserId(userId);

    if (!subscription) {
      return NextResponse.json({
        success: true,
        subscription: null,
        tier: 'seeker', // Default to free tier
      });
    }

    // Get recent invoices
    const invoices = await subscriptionManager.getCustomerInvoices(subscription.customerId, 5);

    return NextResponse.json({
      success: true,
      subscription,
      invoices: invoices.map(invoice => ({
        id: invoice.id,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        status: invoice.status,
        created: invoice.created,
        pdfUrl: invoice.hosted_invoice_url,
        number: invoice.number,
      })),
    });
  } catch (error) {
    console.error('Subscription retrieval error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to retrieve subscription',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Update subscription (change tier, cancel, reactivate)
export async function PATCH(request: NextRequest) {
  try {
    const { userId, action, tier, interval, cancelImmediately } = await request.json();

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, action' },
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

    let result;

    switch (action) {
      case 'cancel':
        result = await subscriptionManager.cancelSubscription(
          subscription.id, 
          cancelImmediately || false
        );
        console.log(`❌ User ${userId} canceled subscription: ${subscription.id}`);
        break;

      case 'reactivate':
        result = await subscriptionManager.reactivateSubscription(subscription.id);
        console.log(`✅ User ${userId} reactivated subscription: ${subscription.id}`);
        break;

      case 'change_tier':
        if (!tier || !interval) {
          return NextResponse.json(
            { error: 'Missing tier and interval for tier change' },
            { status: 400 }
          );
        }
        
        result = await subscriptionManager.changeSubscriptionTier(
          subscription.id,
          tier,
          interval,
          true // Enable proration
        );
        console.log(`🔄 User ${userId} changed subscription to: ${tier}/${interval}`);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported: cancel, reactivate, change_tier' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      subscription: result,
      message: `Subscription ${action} completed successfully`,
    });
  } catch (error) {
    console.error('Subscription update error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to update subscription',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}