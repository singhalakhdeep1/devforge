import { stripe, SUBSCRIPTION_PLANS, STRIPE_PRODUCTS } from '../config/stripe';
import { logger } from '../config/logger';
import Stripe from 'stripe';

interface CreateCustomerParams {
    userId: string;
    email: string;
    name: string;
    metadata?: Record<string, string>;
}

interface CreateSubscriptionParams {
    customerId: string;
    priceId: string;
    trialDays?: number;
    metadata?: Record<string, string>;
}

interface PaymentIntentParams {
    amount: number;
    currency: string;
    customerId: string;
    description?: string;
    metadata?: Record<string, string>;
}

export class PaymentService {
    /**
     * Create Stripe customer
     */
    async createCustomer(params: CreateCustomerParams) {
        try {
            const customer = await stripe.customers.create({
                email: params.email,
                name: params.name,
                metadata: {
                    userId: params.userId,
                    ...params.metadata,
                },
            });

            logger.info(`Created Stripe customer ${customer.id} for user ${params.userId}`);
            return customer;
        } catch (error) {
            logger.error('Error creating customer:', error);
            throw error;
        }
    }

    /**
     * Get customer by ID
     */
    async getCustomer(customerId: string) {
        try {
            const customer = await stripe.customers.retrieve(customerId);
            return customer;
        } catch (error) {
            logger.error('Error getting customer:', error);
            throw error;
        }
    }

    /**
     * Update customer
     */
    async updateCustomer(customerId: string, params: Partial<Stripe.CustomerUpdateParams>) {
        try {
            const customer = await stripe.customers.update(customerId, params);
            logger.info(`Updated customer ${customerId}`);
            return customer;
        } catch (error) {
            logger.error('Error updating customer:', error);
            throw error;
        }
    }

    /**
     * Delete customer
     */
    async deleteCustomer(customerId: string) {
        try {
            const deleted = await stripe.customers.del(customerId);
            logger.info(`Deleted customer ${customerId}`);
            return deleted;
        } catch (error) {
            logger.error('Error deleting customer:', error);
            throw error;
        }
    }

    /**
     * Create subscription
     */
    async createSubscription(params: CreateSubscriptionParams) {
        try {
            const subscription = await stripe.subscriptions.create({
                customer: params.customerId,
                items: [{ price: params.priceId }],
                trial_period_days: params.trialDays,
                payment_behavior: 'default_incomplete',
                payment_settings: { save_default_payment_method: 'on_subscription' },
                expand: ['latest_invoice.payment_intent'],
                metadata: params.metadata,
            });

            logger.info(`Created subscription ${subscription.id} for customer ${params.customerId}`);
            return subscription;
        } catch (error) {
            logger.error('Error creating subscription:', error);
            throw error;
        }
    }

    /**
     * Get subscription
     */
    async getSubscription(subscriptionId: string) {
        try {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            return subscription;
        } catch (error) {
            logger.error('Error getting subscription:', error);
            throw error;
        }
    }

    /**
     * Update subscription
     */
    async updateSubscription(subscriptionId: string, params: Partial<Stripe.SubscriptionUpdateParams>) {
        try {
            const subscription = await stripe.subscriptions.update(subscriptionId, params);
            logger.info(`Updated subscription ${subscriptionId}`);
            return subscription;
        } catch (error) {
            logger.error('Error updating subscription:', error);
            throw error;
        }
    }

    /**
     * Cancel subscription
     */
    async cancelSubscription(subscriptionId: string, immediately: boolean = false) {
        try {
            const subscription = immediately
                ? await stripe.subscriptions.cancel(subscriptionId)
                : await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });

            logger.info(`Cancelled subscription ${subscriptionId} (immediate: ${immediately})`);
            return subscription;
        } catch (error) {
            logger.error('Error cancelling subscription:', error);
            throw error;
        }
    }

    /**
     * Resume cancelled subscription
     */
    async resumeSubscription(subscriptionId: string) {
        try {
            const subscription = await stripe.subscriptions.update(subscriptionId, {
                cancel_at_period_end: false,
            });

            logger.info(`Resumed subscription ${subscriptionId}`);
            return subscription;
        } catch (error) {
            logger.error('Error resuming subscription:', error);
            throw error;
        }
    }

    /**
     * Change subscription plan
     */
    async changeSubscriptionPlan(subscriptionId: string, newPriceId: string) {
        try {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);

            const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
                items: [
                    {
                        id: subscription.items.data[0].id,
                        price: newPriceId,
                    },
                ],
                proration_behavior: 'always_invoice',
            });

            logger.info(`Changed subscription ${subscriptionId} to price ${newPriceId}`);
            return updatedSubscription;
        } catch (error) {
            logger.error('Error changing subscription plan:', error);
            throw error;
        }
    }

    /**
     * Create payment intent
     */
    async createPaymentIntent(params: PaymentIntentParams) {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: params.amount,
                currency: params.currency,
                customer: params.customerId,
                description: params.description,
                metadata: params.metadata,
                automatic_payment_methods: { enabled: true },
            });

            logger.info(`Created payment intent ${paymentIntent.id}`);
            return paymentIntent;
        } catch (error) {
            logger.error('Error creating payment intent:', error);
            throw error;
        }
    }

    /**
     * Get payment intent
     */
    async getPaymentIntent(paymentIntentId: string) {
        try {
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            return paymentIntent;
        } catch (error) {
            logger.error('Error getting payment intent:', error);
            throw error;
        }
    }

    /**
     * Cancel payment intent
     */
    async cancelPaymentIntent(paymentIntentId: string) {
        try {
            const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
            logger.info(`Cancelled payment intent ${paymentIntentId}`);
            return paymentIntent;
        } catch (error) {
            logger.error('Error cancelling payment intent:', error);
            throw error;
        }
    }

    /**
     * Create invoice
     */
    async createInvoice(customerId: string, params?: Partial<Stripe.InvoiceCreateParams>) {
        try {
            const invoice = await stripe.invoices.create({
                customer: customerId,
                auto_advance: true,
                ...params,
            });

            logger.info(`Created invoice ${invoice.id} for customer ${customerId}`);
            return invoice;
        } catch (error) {
            logger.error('Error creating invoice:', error);
            throw error;
        }
    }

    /**
     * Get invoice
     */
    async getInvoice(invoiceId: string) {
        try {
            const invoice = await stripe.invoices.retrieve(invoiceId);
            return invoice;
        } catch (error) {
            logger.error('Error getting invoice:', error);
            throw error;
        }
    }

    /**
     * Pay invoice
     */
    async payInvoice(invoiceId: string) {
        try {
            const invoice = await stripe.invoices.pay(invoiceId);
            logger.info(`Paid invoice ${invoiceId}`);
            return invoice;
        } catch (error) {
            logger.error('Error paying invoice:', error);
            throw error;
        }
    }

    /**
     * Void invoice
     */
    async voidInvoice(invoiceId: string) {
        try {
            const invoice = await stripe.invoices.voidInvoice(invoiceId);
            logger.info(`Voided invoice ${invoiceId}`);
            return invoice;
        } catch (error) {
            logger.error('Error voiding invoice:', error);
            throw error;
        }
    }

    /**
     * List customer invoices
     */
    async listCustomerInvoices(customerId: string, limit: number = 10) {
        try {
            const invoices = await stripe.invoices.list({
                customer: customerId,
                limit,
            });

            return invoices.data;
        } catch (error) {
            logger.error('Error listing invoices:', error);
            throw error;
        }
    }

    /**
     * Create payment method
     */
    async createPaymentMethod(params: Stripe.PaymentMethodCreateParams) {
        try {
            const paymentMethod = await stripe.paymentMethods.create(params);
            logger.info(`Created payment method ${paymentMethod.id}`);
            return paymentMethod;
        } catch (error) {
            logger.error('Error creating payment method:', error);
            throw error;
        }
    }

    /**
     * Attach payment method to customer
     */
    async attachPaymentMethod(paymentMethodId: string, customerId: string) {
        try {
            const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
                customer: customerId,
            });

            logger.info(`Attached payment method ${paymentMethodId} to customer ${customerId}`);
            return paymentMethod;
        } catch (error) {
            logger.error('Error attaching payment method:', error);
            throw error;
        }
    }

    /**
     * Detach payment method
     */
    async detachPaymentMethod(paymentMethodId: string) {
        try {
            const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId);
            logger.info(`Detached payment method ${paymentMethodId}`);
            return paymentMethod;
        } catch (error) {
            logger.error('Error detaching payment method:', error);
            throw error;
        }
    }

    /**
     * List customer payment methods
     */
    async listCustomerPaymentMethods(customerId: string, type: string = 'card') {
        try {
            const paymentMethods = await stripe.paymentMethods.list({
                customer: customerId,
                type: type as Stripe.PaymentMethodListParams.Type,
            });

            return paymentMethods.data;
        } catch (error) {
            logger.error('Error listing payment methods:', error);
            throw error;
        }
    }

    /**
     * Set default payment method
     */
    async setDefaultPaymentMethod(customerId: string, paymentMethodId: string) {
        try {
            await stripe.customers.update(customerId, {
                invoice_settings: {
                    default_payment_method: paymentMethodId,
                },
            });

            logger.info(`Set default payment method ${paymentMethodId} for customer ${customerId}`);
        } catch (error) {
            logger.error('Error setting default payment method:', error);
            throw error;
        }
    }

    /**
     * Create refund
     */
    async createRefund(paymentIntentId: string, amount?: number, reason?: string) {
        try {
            const refund = await stripe.refunds.create({
                payment_intent: paymentIntentId,
                amount,
                reason: reason as Stripe.RefundCreateParams.Reason,
            });

            logger.info(`Created refund ${refund.id} for payment intent ${paymentIntentId}`);
            return refund;
        } catch (error) {
            logger.error('Error creating refund:', error);
            throw error;
        }
    }

    /**
     * Get refund
     */
    async getRefund(refundId: string) {
        try {
            const refund = await stripe.refunds.retrieve(refundId);
            return refund;
        } catch (error) {
            logger.error('Error getting refund:', error);
            throw error;
        }
    }

    /**
     * Create coupon
     */
    async createCoupon(params: Stripe.CouponCreateParams) {
        try {
            const coupon = await stripe.coupons.create(params);
            logger.info(`Created coupon ${coupon.id}`);
            return coupon;
        } catch (error) {
            logger.error('Error creating coupon:', error);
            throw error;
        }
    }

    /**
     * Apply coupon to customer
     */
    async applyCoupon(customerId: string, couponId: string) {
        try {
            const customer = await stripe.customers.update(customerId, {
                coupon: couponId,
            });

            logger.info(`Applied coupon ${couponId} to customer ${customerId}`);
            return customer;
        } catch (error) {
            logger.error('Error applying coupon:', error);
            throw error;
        }
    }

    /**
     * Get subscription usage
     */
    async getSubscriptionUsage(subscriptionId: string) {
        try {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
                expand: ['items.data.price.product'],
            });

            return {
                subscriptionId: subscription.id,
                status: subscription.status,
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                items: subscription.items.data.map(item => ({
                    id: item.id,
                    priceId: item.price.id,
                    quantity: item.quantity,
                    product: item.price.product,
                })),
            };
        } catch (error) {
            logger.error('Error getting subscription usage:', error);
            throw error;
        }
    }

    /**
     * Get customer portal session
     */
    async createPortalSession(customerId: string, returnUrl: string) {
        try {
            const session = await stripe.billingPortal.sessions.create({
                customer: customerId,
                return_url: returnUrl,
            });

            logger.info(`Created portal session for customer ${customerId}`);
            return session;
        } catch (error) {
            logger.error('Error creating portal session:', error);
            throw error;
        }
    }

    /**
     * Create checkout session
     */
    async createCheckoutSession(params: {
        customerId?: string;
        email?: string;
        priceId: string;
        successUrl: string;
        cancelUrl: string;
        trialDays?: number;
        metadata?: Record<string, string>;
    }) {
        try {
            const session = await stripe.checkout.sessions.create({
                customer: params.customerId,
                customer_email: params.email,
                mode: 'subscription',
                line_items: [
                    {
                        price: params.priceId,
                        quantity: 1,
                    },
                ],
                success_url: params.successUrl,
                cancel_url: params.cancelUrl,
                subscription_data: {
                    trial_period_days: params.trialDays,
                    metadata: params.metadata,
                },
            });

            logger.info(`Created checkout session ${session.id}`);
            return session;
        } catch (error) {
            logger.error('Error creating checkout session:', error);
            throw error;
        }
    }

    /**
     * Get checkout session
     */
    async getCheckoutSession(sessionId: string) {
        try {
            const session = await stripe.checkout.sessions.retrieve(sessionId);
            return session;
        } catch (error) {
            logger.error('Error getting checkout session:', error);
            throw error;
        }
    }

    /**
     * Get payment statistics
     */
    async getPaymentStatistics(customerId: string) {
        try {
            const [charges, invoices, subscription] = await Promise.all([
                stripe.charges.list({ customer: customerId, limit: 100 }),
                stripe.invoices.list({ customer: customerId, limit: 100 }),
                stripe.subscriptions.list({ customer: customerId, limit: 1 }),
            ]);

            const totalPaid = charges.data
                .filter(charge => charge.status === 'succeeded')
                .reduce((sum, charge) => sum + charge.amount, 0);

            const totalRefunded = charges.data.reduce((sum, charge) => sum + charge.amount_refunded, 0);

            return {
                totalCharges: charges.data.length,
                totalPaid: totalPaid / 100,
                totalRefunded: totalRefunded / 100,
                totalInvoices: invoices.data.length,
                activeSubscription: subscription.data.length > 0,
                subscriptionStatus: subscription.data[0]?.status,
            };
        } catch (error) {
            logger.error('Error getting payment statistics:', error);
            throw error;
        }
    }
}
