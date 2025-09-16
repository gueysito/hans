import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe, WEBHOOK_EVENTS } from '@/src/lib/stripe/config';
import { subscriptionManager } from '@/src/lib/stripe/subscription-manager';
import { paymentRateLimits, validateWebhookSecurity, logSecurityEvent, getClientIP } from '@/src/lib/payments/security';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting for webhook endpoint
    const clientIP = await getClientIP();
    const rateLimitResult = paymentRateLimits.webhook.check(clientIP);
    
    if (!rateLimitResult.success) {
      await logSecurityEvent('rate_limit', {
        endpoint: '/api/payments/webhooks',
        ip: clientIP,
        limit: rateLimitResult.limit,
      });
      
      return NextResponse.json(
        { error: 'Too many webhook requests' },
        { status: 429 }
      );
    }

    const body = await request.text();
    const signature = headers().get('stripe-signature');
    
    if (!signature) {
      await logSecurityEvent('webhook_failure', {
        reason: 'Missing signature',
        ip: clientIP,
      });
      
      return NextResponse.json(
        { error: 'Missing stripe signature' },
        { status: 400 }
      );
    }

    // Additional webhook security validation
    if (!validateWebhookSecurity(signature, body)) {
      await logSecurityEvent('webhook_failure', {
        reason: 'Invalid webhook security',
        ip: clientIP,
        signature: signature.substring(0, 50), // Log partial signature for debugging
      });
      
      return NextResponse.json(
        { error: 'Invalid webhook request' },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('Missing STRIPE_WEBHOOK_SECRET environment variable');
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log(`🎣 Received webhook: ${event.type}`);

    switch (event.type) {
      case WEBHOOK_EVENTS.CHECKOUT_COMPLETED:
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case WEBHOOK_EVENTS.SUBSCRIPTION_CREATED:
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case WEBHOOK_EVENTS.SUBSCRIPTION_UPDATED:
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case WEBHOOK_EVENTS.SUBSCRIPTION_DELETED:
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case WEBHOOK_EVENTS.INVOICE_PAID:
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case WEBHOOK_EVENTS.INVOICE_FAILED:
        await handleInvoiceFailed(event.data.object as Stripe.Invoice);
        break;

      case WEBHOOK_EVENTS.PAYMENT_METHOD_ATTACHED:
        await handlePaymentMethodAttached(event.data.object as Stripe.PaymentMethod);
        break;

      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { 
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    const userId = session.metadata?.userId;
    
    if (!userId) {
      console.error('No userId in checkout session metadata');
      return;
    }

    console.log(`✅ Checkout completed for user ${userId}: ${session.id}`);
    
    if (session.mode === 'subscription' && session.subscription) {
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      await handleSubscriptionCreated(subscription);
    }
  } catch (error) {
    console.error('Failed to handle checkout completed:', error);
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata.userId;
    const tier = subscription.metadata.tier;
    const interval = subscription.metadata.interval;
    
    if (!userId) {
      console.error('No userId in subscription metadata');
      return;
    }

    console.log(`🚀 Subscription created for user ${userId}: ${subscription.id} (${tier}/${interval})`);
    
    // Update user subscription status in your database here
    // Example: await updateUserSubscription(userId, subscription.id, tier, interval);
    
    // Send welcome email or notifications here
    // Example: await sendWelcomeEmail(userId, tier);
    
  } catch (error) {
    console.error('Failed to handle subscription created:', error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata.userId;
    const tier = subscription.metadata.tier;
    
    if (!userId) {
      console.error('No userId in subscription metadata');
      return;
    }

    console.log(`🔄 Subscription updated for user ${userId}: ${subscription.id}`);
    
    // Handle subscription changes (tier upgrades/downgrades, status changes)
    if (subscription.status === 'active') {
      console.log(`✅ Subscription reactivated: ${subscription.id}`);
    } else if (subscription.cancel_at_period_end) {
      console.log(`⏰ Subscription scheduled for cancellation: ${subscription.id}`);
    }
    
    // Update user subscription in database
    // Example: await updateUserSubscriptionStatus(userId, subscription.status, tier);
    
  } catch (error) {
    console.error('Failed to handle subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata.userId;
    
    if (!userId) {
      console.error('No userId in subscription metadata');
      return;
    }

    console.log(`❌ Subscription deleted for user ${userId}: ${subscription.id}`);
    
    // Downgrade user to free tier
    // Example: await downgradeUserToFreeTier(userId);
    
    // Send cancellation email
    // Example: await sendCancellationEmail(userId);
    
  } catch (error) {
    console.error('Failed to handle subscription deleted:', error);
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  try {
    const customerId = invoice.customer as string;
    
    console.log(`💰 Invoice paid for customer ${customerId}: ${invoice.id}`);
    
    // Update payment history
    // Example: await recordPayment(customerId, invoice);
    
    // Send receipt email
    // Example: await sendReceiptEmail(customerId, invoice);
    
  } catch (error) {
    console.error('Failed to handle invoice paid:', error);
  }
}

async function handleInvoiceFailed(invoice: Stripe.Invoice) {
  try {
    const customerId = invoice.customer as string;
    
    console.log(`💸 Invoice payment failed for customer ${customerId}: ${invoice.id}`);
    
    // Send payment failure notification
    // Example: await sendPaymentFailureEmail(customerId, invoice);
    
    // Potentially suspend service after multiple failures
    if (invoice.attempt_count >= 3) {
      console.log(`🚫 Suspending service for customer ${customerId} after ${invoice.attempt_count} failed attempts`);
      // Example: await suspendUserService(customerId);
    }
    
  } catch (error) {
    console.error('Failed to handle invoice failed:', error);
  }
}

async function handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod) {
  try {
    const customerId = paymentMethod.customer as string;
    
    console.log(`💳 Payment method attached for customer ${customerId}: ${paymentMethod.id}`);
    
    // Update customer payment method status
    // Example: await updateCustomerPaymentMethod(customerId, paymentMethod);
    
  } catch (error) {
    console.error('Failed to handle payment method attached:', error);
  }
}