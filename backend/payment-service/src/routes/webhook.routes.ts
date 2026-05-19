import { Router, Request, Response } from 'express';
import { stripe, STRIPE_WEBHOOK_SECRET } from '../config/stripe';
import { logger } from '../config/logger';
import Stripe from 'stripe';

const router = Router();

/**
 * Stripe webhook handler
 * POST /api/webhooks/stripe
 */
router.post('/stripe', async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
        logger.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    logger.info(`Received webhook event: ${event.type}`);

    try {
        switch (event.type) {
            case 'customer.created':
                await handleCustomerCreated(event.data.object as Stripe.Customer);
                break;

            case 'customer.updated':
                await handleCustomerUpdated(event.data.object as Stripe.Customer);
                break;

            case 'customer.deleted':
                await handleCustomerDeleted(event.data.object as Stripe.Customer);
                break;

            case 'customer.subscription.created':
                await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
                break;

            case 'customer.subscription.updated':
                await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
                break;

            case 'customer.subscription.deleted':
                await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
                break;

            case 'customer.subscription.trial_will_end':
                await handleTrialWillEnd(event.data.object as Stripe.Subscription);
                break;

            case 'invoice.created':
                await handleInvoiceCreated(event.data.object as Stripe.Invoice);
                break;

            case 'invoice.payment_succeeded':
                await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
                break;

            case 'invoice.payment_failed':
                await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
                break;

            case 'payment_intent.succeeded':
                await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
                break;

            case 'payment_intent.payment_failed':
                await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
                break;

            case 'payment_method.attached':
                await handlePaymentMethodAttached(event.data.object as Stripe.PaymentMethod);
                break;

            case 'payment_method.detached':
                await handlePaymentMethodDetached(event.data.object as Stripe.PaymentMethod);
                break;

            case 'charge.succeeded':
                await handleChargeSucceeded(event.data.object as Stripe.Charge);
                break;

            case 'charge.failed':
                await handleChargeFailed(event.data.object as Stripe.Charge);
                break;

            case 'charge.refunded':
                await handleChargeRefunded(event.data.object as Stripe.Charge);
                break;

            default:
                logger.info(`Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
    } catch (error) {
        logger.error('Error handling webhook:', error);
        res.status(500).json({ error: 'Webhook handler failed' });
    }
});

// Webhook handlers

async function handleCustomerCreated(customer: Stripe.Customer) {
    logger.info(`Customer created: ${customer.id}`);
    // Update database with customer info
    // Send welcome email
}

async function handleCustomerUpdated(customer: Stripe.Customer) {
    logger.info(`Customer updated: ${customer.id}`);
    // Update database with customer info
}

async function handleCustomerDeleted(customer: Stripe.Customer) {
    logger.info(`Customer deleted: ${customer.id}`);
    // Mark customer as deleted in database
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
    logger.info(`Subscription created: ${subscription.id}`);
    // Save subscription to database
    // Update user's plan
    // Send confirmation email
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    logger.info(`Subscription updated: ${subscription.id}`);
    // Update subscription in database
    // Update user's plan if changed
    // Send notification email
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    logger.info(`Subscription deleted: ${subscription.id}`);
    // Mark subscription as cancelled in database
    // Downgrade user to free plan
    // Send cancellation confirmation email
}

async function handleTrialWillEnd(subscription: Stripe.Subscription) {
    logger.info(`Trial will end for subscription: ${subscription.id}`);
    // Send trial ending reminder email
    // Notify user 3 days before trial ends
}

async function handleInvoiceCreated(invoice: Stripe.Invoice) {
    logger.info(`Invoice created: ${invoice.id}`);
    // Save invoice to database
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    logger.info(`Invoice payment succeeded: ${invoice.id}`);
    // Update payment status in database
    // Send receipt email
    // Activate/renew subscription
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    logger.info(`Invoice payment failed: ${invoice.id}`);
    // Update payment status in database
    // Send payment failed email
    // Notify user to update payment method
    // If multiple failures, downgrade or suspend account
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    logger.info(`Payment intent succeeded: ${paymentIntent.id}`);
    // Update payment record in database
    // Process one-time payment
    // Send confirmation email
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
    logger.info(`Payment intent failed: ${paymentIntent.id}`);
    // Update payment record in database
    // Send payment failed notification
}

async function handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod) {
    logger.info(`Payment method attached: ${paymentMethod.id}`);
    // Update customer payment methods in database
}

async function handlePaymentMethodDetached(paymentMethod: Stripe.PaymentMethod) {
    logger.info(`Payment method detached: ${paymentMethod.id}`);
    // Remove payment method from database
}

async function handleChargeSucceeded(charge: Stripe.Charge) {
    logger.info(`Charge succeeded: ${charge.id}`);
    // Record successful charge in database
    // Update analytics
}

async function handleChargeFailed(charge: Stripe.Charge) {
    logger.info(`Charge failed: ${charge.id}`);
    // Record failed charge in database
    // Send notification to user
}

async function handleChargeRefunded(charge: Stripe.Charge) {
    logger.info(`Charge refunded: ${charge.id}`);
    // Update charge status in database
    // Send refund confirmation email
    // Update user's balance/credits
}

export default router;
