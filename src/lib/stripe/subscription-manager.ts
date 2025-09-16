// Subscription Management Service for Hans Oracle
import { stripe, SUBSCRIPTION_TIERS, type SubscriptionTier, type BillingInterval, getPriceId } from './config';
import Stripe from 'stripe';

export interface CreateSubscriptionParams {
  userId: string;
  email: string;
  tier: SubscriptionTier;
  interval: BillingInterval;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface SubscriptionDetails {
  id: string;
  customerId: string;
  status: Stripe.Subscription.Status;
  tier: SubscriptionTier;
  interval: BillingInterval;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  priceId: string;
  amount: number;
  currency: string;
  metadata: Record<string, string>;
}

export interface BillingPortalParams {
  customerId: string;
  returnUrl: string;
}

export class SubscriptionManager {
  // Create a new customer or retrieve existing one
  async getOrCreateCustomer(userId: string, email: string): Promise<Stripe.Customer> {
    try {
      // First, try to find existing customer by metadata
      const existingCustomers = await stripe.customers.list({
        email: email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        const customer = existingCustomers.data[0];
        
        // Update metadata if needed
        if (customer.metadata.userId !== userId) {
          await stripe.customers.update(customer.id, {
            metadata: { userId },
          });
        }
        
        return customer;
      }

      // Create new customer
      const customer = await stripe.customers.create({
        email,
        metadata: {
          userId,
        },
      });

      console.log(`✅ Created new Stripe customer: ${customer.id} for user: ${userId}`);
      return customer;
    } catch (error) {
      console.error('Failed to get or create customer:', error);
      throw new Error('Failed to initialize customer account');
    }
  }

  // Create checkout session for subscription
  async createCheckoutSession(params: CreateSubscriptionParams): Promise<Stripe.Checkout.Session> {
    try {
      const priceId = getPriceId(params.tier, params.interval);
      if (!priceId) {
        throw new Error(`No price ID found for tier: ${params.tier}, interval: ${params.interval}`);
      }

      // Get or create customer
      const customer = await this.getOrCreateCustomer(params.userId, params.email);

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        allow_promotion_codes: true,
        subscription_data: {
          metadata: {
            userId: params.userId,
            tier: params.tier,
            interval: params.interval,
            ...params.metadata,
          },
        },
        metadata: {
          userId: params.userId,
          tier: params.tier,
          interval: params.interval,
        },
      });

      console.log(`✅ Created checkout session: ${session.id} for user: ${params.userId}`);
      return session;
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      throw new Error('Failed to create payment session');
    }
  }

  // Get subscription details by customer ID
  async getSubscriptionByCustomer(customerId: string): Promise<SubscriptionDetails | null> {
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'all',
        limit: 1,
      });

      if (subscriptions.data.length === 0) {
        return null;
      }

      const subscription = subscriptions.data[0];
      return this.formatSubscriptionDetails(subscription);
    } catch (error) {
      console.error('Failed to get subscription:', error);
      return null;
    }
  }

  // Get subscription details by user ID
  async getSubscriptionByUserId(userId: string): Promise<SubscriptionDetails | null> {
    try {
      // Find customer by user ID
      const customers = await stripe.customers.list({
        limit: 1,
      });

      const customer = customers.data.find(c => c.metadata.userId === userId);
      if (!customer) {
        return null;
      }

      return await this.getSubscriptionByCustomer(customer.id);
    } catch (error) {
      console.error('Failed to get subscription by user ID:', error);
      return null;
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string, cancelImmediately: boolean = false): Promise<Stripe.Subscription> {
    try {
      if (cancelImmediately) {
        // Cancel immediately
        const subscription = await stripe.subscriptions.cancel(subscriptionId);
        console.log(`✅ Immediately canceled subscription: ${subscriptionId}`);
        return subscription;
      } else {
        // Cancel at period end
        const subscription = await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });
        console.log(`✅ Scheduled subscription cancellation: ${subscriptionId}`);
        return subscription;
      }
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  // Reactivate canceled subscription
  async reactivateSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false,
      });
      console.log(`✅ Reactivated subscription: ${subscriptionId}`);
      return subscription;
    } catch (error) {
      console.error('Failed to reactivate subscription:', error);
      throw new Error('Failed to reactivate subscription');
    }
  }

  // Change subscription tier (upgrade/downgrade)
  async changeSubscriptionTier(
    subscriptionId: string,
    newTier: SubscriptionTier,
    newInterval: BillingInterval,
    prorate: boolean = true
  ): Promise<Stripe.Subscription> {
    try {
      const newPriceId = getPriceId(newTier, newInterval);
      if (!newPriceId) {
        throw new Error(`No price ID found for tier: ${newTier}, interval: ${newInterval}`);
      }

      // Get current subscription
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const currentItem = subscription.items.data[0];

      // Update subscription
      const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
        items: [
          {
            id: currentItem.id,
            price: newPriceId,
          },
        ],
        proration_behavior: prorate ? 'create_prorations' : 'none',
        metadata: {
          ...subscription.metadata,
          tier: newTier,
          interval: newInterval,
        },
      });

      console.log(`✅ Changed subscription tier: ${subscriptionId} to ${newTier}/${newInterval}`);
      return updatedSubscription;
    } catch (error) {
      console.error('Failed to change subscription tier:', error);
      throw new Error('Failed to change subscription tier');
    }
  }

  // Create billing portal session
  async createBillingPortalSession(params: BillingPortalParams): Promise<Stripe.BillingPortal.Session> {
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: params.customerId,
        return_url: params.returnUrl,
      });

      console.log(`✅ Created billing portal session for customer: ${params.customerId}`);
      return session;
    } catch (error) {
      console.error('Failed to create billing portal session:', error);
      throw new Error('Failed to create billing portal session');
    }
  }

  // Get customer's invoices
  async getCustomerInvoices(customerId: string, limit: number = 10): Promise<Stripe.Invoice[]> {
    try {
      const invoices = await stripe.invoices.list({
        customer: customerId,
        limit,
      });

      return invoices.data;
    } catch (error) {
      console.error('Failed to get customer invoices:', error);
      return [];
    }
  }

  // Get upcoming invoice (for proration preview)
  async getUpcomingInvoice(customerId: string, subscriptionId?: string): Promise<Stripe.Invoice | null> {
    try {
      const params: Stripe.InvoiceRetrieveUpcomingParams = {
        customer: customerId,
      };

      if (subscriptionId) {
        params.subscription = subscriptionId;
      }

      const invoice = await stripe.invoices.retrieveUpcoming(params);
      return invoice;
    } catch (error) {
      console.error('Failed to get upcoming invoice:', error);
      return null;
    }
  }

  // Preview subscription change
  async previewSubscriptionChange(
    subscriptionId: string,
    newTier: SubscriptionTier,
    newInterval: BillingInterval
  ): Promise<{
    immediateTotal: number;
    nextInvoiceTotal: number;
    currency: string;
  }> {
    try {
      const newPriceId = getPriceId(newTier, newInterval);
      if (!newPriceId) {
        throw new Error(`No price ID found for tier: ${newTier}, interval: ${newInterval}`);
      }

      // Get current subscription
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const currentItem = subscription.items.data[0];

      // Create preview invoice
      const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
        customer: subscription.customer as string,
        subscription: subscriptionId,
        subscription_items: [
          {
            id: currentItem.id,
            price: newPriceId,
          },
        ],
        subscription_proration_behavior: 'create_prorations',
      });

      return {
        immediateTotal: upcomingInvoice.amount_due,
        nextInvoiceTotal: upcomingInvoice.amount_due,
        currency: upcomingInvoice.currency,
      };
    } catch (error) {
      console.error('Failed to preview subscription change:', error);
      throw new Error('Failed to preview subscription change');
    }
  }

  // Helper method to format subscription details
  private formatSubscriptionDetails(subscription: Stripe.Subscription): SubscriptionDetails {
    const priceId = subscription.items.data[0]?.price.id || '';
    const amount = subscription.items.data[0]?.price.unit_amount || 0;
    const currency = subscription.items.data[0]?.price.currency || 'usd';
    const interval = subscription.items.data[0]?.price.recurring?.interval as BillingInterval || 'monthly';
    
    // Determine tier from metadata or price ID
    const tier = (subscription.metadata.tier as SubscriptionTier) || this.getTierFromPriceId(priceId);

    return {
      id: subscription.id,
      customerId: subscription.customer as string,
      status: subscription.status,
      tier,
      interval,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      priceId,
      amount,
      currency,
      metadata: subscription.metadata,
    };
  }

  // Helper to determine tier from price ID
  private getTierFromPriceId(priceId: string): SubscriptionTier {
    for (const [tier, config] of Object.entries(SUBSCRIPTION_TIERS)) {
      if (Object.values(config.stripePriceIds).includes(priceId)) {
        return tier as SubscriptionTier;
      }
    }
    return 'seeker'; // fallback
  }
}

// Export singleton instance
export const subscriptionManager = new SubscriptionManager();