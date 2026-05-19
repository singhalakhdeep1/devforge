import { Router } from 'express';
import { PaymentService } from '../services/payment.service';
import { SUBSCRIPTION_PLANS } from '../config/stripe';
import { logger } from '../config/logger';

const router = Router();
const paymentService = new PaymentService();

/**
 * Get subscription plans
 */
router.get('/plans', (req, res) => {
    res.json({
        success: true,
        data: SUBSCRIPTION_PLANS,
    });
});

/**
 * Create customer
 */
router.post('/customers', async (req, res) => {
    try {
        const { userId, email, name, metadata } = req.body;

        const customer = await paymentService.createCustomer({
            userId,
            email,
            name,
            metadata,
        });

        res.json({
            success: true,
            data: customer,
        });
    } catch (error) {
        logger.error('Create customer error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create customer',
        });
    }
});

/**
 * Get customer
 */
router.get('/customers/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;
        const customer = await paymentService.getCustomer(customerId);

        res.json({
            success: true,
            data: customer,
        });
    } catch (error) {
        logger.error('Get customer error:', error);
        res.status(404).json({
            success: false,
            error: 'Customer not found',
        });
    }
});

/**
 * Update customer
 */
router.patch('/customers/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;
        const customer = await paymentService.updateCustomer(customerId, req.body);

        res.json({
            success: true,
            data: customer,
        });
    } catch (error) {
        logger.error('Update customer error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update customer',
        });
    }
});

/**
 * Create subscription
 */
router.post('/subscriptions', async (req, res) => {
    try {
        const { customerId, priceId, trialDays, metadata } = req.body;

        const subscription = await paymentService.createSubscription({
            customerId,
            priceId,
            trialDays,
            metadata,
        });

        res.json({
            success: true,
            data: subscription,
        });
    } catch (error) {
        logger.error('Create subscription error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create subscription',
        });
    }
});

/**
 * Get subscription
 */
router.get('/subscriptions/:subscriptionId', async (req, res) => {
    try {
        const { subscriptionId } = req.params;
        const subscription = await paymentService.getSubscription(subscriptionId);

        res.json({
            success: true,
            data: subscription,
        });
    } catch (error) {
        logger.error('Get subscription error:', error);
        res.status(404).json({
            success: false,
            error: 'Subscription not found',
        });
    }
});

/**
 * Update subscription
 */
router.patch('/subscriptions/:subscriptionId', async (req, res) => {
    try {
        const { subscriptionId } = req.params;
        const subscription = await paymentService.updateSubscription(subscriptionId, req.body);

        res.json({
            success: true,
            data: subscription,
        });
    } catch (error) {
        logger.error('Update subscription error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update subscription',
        });
    }
});

/**
 * Cancel subscription
 */
router.delete('/subscriptions/:subscriptionId', async (req, res) => {
    try {
        const { subscriptionId } = req.params;
        const { immediately } = req.query;

        const subscription = await paymentService.cancelSubscription(
            subscriptionId,
            immediately === 'true'
        );

        res.json({
            success: true,
            data: subscription,
        });
    } catch (error) {
        logger.error('Cancel subscription error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to cancel subscription',
        });
    }
});

/**
 * Resume subscription
 */
router.post('/subscriptions/:subscriptionId/resume', async (req, res) => {
    try {
        const { subscriptionId } = req.params;
        const subscription = await paymentService.resumeSubscription(subscriptionId);

        res.json({
            success: true,
            data: subscription,
        });
    } catch (error) {
        logger.error('Resume subscription error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to resume subscription',
        });
    }
});

/**
 * Change subscription plan
 */
router.post('/subscriptions/:subscriptionId/change-plan', async (req, res) => {
    try {
        const { subscriptionId } = req.params;
        const { priceId } = req.body;

        const subscription = await paymentService.changeSubscriptionPlan(subscriptionId, priceId);

        res.json({
            success: true,
            data: subscription,
        });
    } catch (error) {
        logger.error('Change plan error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to change plan',
        });
    }
});

/**
 * Create payment intent
 */
router.post('/payment-intents', async (req, res) => {
    try {
        const { amount, currency, customerId, description, metadata } = req.body;

        const paymentIntent = await paymentService.createPaymentIntent({
            amount,
            currency,
            customerId,
            description,
            metadata,
        });

        res.json({
            success: true,
            data: paymentIntent,
        });
    } catch (error) {
        logger.error('Create payment intent error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create payment intent',
        });
    }
});

/**
 * Create checkout session
 */
router.post('/checkout/sessions', async (req, res) => {
    try {
        const { customerId, email, priceId, successUrl, cancelUrl, trialDays, metadata } = req.body;

        const session = await paymentService.createCheckoutSession({
            customerId,
            email,
            priceId,
            successUrl,
            cancelUrl,
            trialDays,
            metadata,
        });

        res.json({
            success: true,
            data: session,
        });
    } catch (error) {
        logger.error('Create checkout session error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create checkout session',
        });
    }
});

/**
 * Create portal session
 */
router.post('/portal/sessions', async (req, res) => {
    try {
        const { customerId, returnUrl } = req.body;

        const session = await paymentService.createPortalSession(customerId, returnUrl);

        res.json({
            success: true,
            data: session,
        });
    } catch (error) {
        logger.error('Create portal session error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create portal session',
        });
    }
});

/**
 * List customer invoices
 */
router.get('/customers/:customerId/invoices', async (req, res) => {
    try {
        const { customerId } = req.params;
        const { limit = '10' } = req.query;

        const invoices = await paymentService.listCustomerInvoices(
            customerId,
            parseInt(limit as string)
        );

        res.json({
            success: true,
            data: invoices,
        });
    } catch (error) {
        logger.error('List invoices error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to list invoices',
        });
    }
});

/**
 * List customer payment methods
 */
router.get('/customers/:customerId/payment-methods', async (req, res) => {
    try {
        const { customerId } = req.params;
        const { type = 'card' } = req.query;

        const paymentMethods = await paymentService.listCustomerPaymentMethods(
            customerId,
            type as string
        );

        res.json({
            success: true,
            data: paymentMethods,
        });
    } catch (error) {
        logger.error('List payment methods error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to list payment methods',
        });
    }
});

/**
 * Attach payment method
 */
router.post('/payment-methods/:paymentMethodId/attach', async (req, res) => {
    try {
        const { paymentMethodId } = req.params;
        const { customerId } = req.body;

        const paymentMethod = await paymentService.attachPaymentMethod(paymentMethodId, customerId);

        res.json({
            success: true,
            data: paymentMethod,
        });
    } catch (error) {
        logger.error('Attach payment method error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to attach payment method',
        });
    }
});

/**
 * Detach payment method
 */
router.post('/payment-methods/:paymentMethodId/detach', async (req, res) => {
    try {
        const { paymentMethodId } = req.params;
        const paymentMethod = await paymentService.detachPaymentMethod(paymentMethodId);

        res.json({
            success: true,
            data: paymentMethod,
        });
    } catch (error) {
        logger.error('Detach payment method error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to detach payment method',
        });
    }
});

/**
 * Create refund
 */
router.post('/refunds', async (req, res) => {
    try {
        const { paymentIntentId, amount, reason } = req.body;

        const refund = await paymentService.createRefund(paymentIntentId, amount, reason);

        res.json({
            success: true,
            data: refund,
        });
    } catch (error) {
        logger.error('Create refund error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create refund',
        });
    }
});

/**
 * Get payment statistics
 */
router.get('/customers/:customerId/statistics', async (req, res) => {
    try {
        const { customerId } = req.params;
        const statistics = await paymentService.getPaymentStatistics(customerId);

        res.json({
            success: true,
            data: statistics,
        });
    } catch (error) {
        logger.error('Get statistics error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get statistics',
        });
    }
});

export default router;
