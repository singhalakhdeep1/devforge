import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is required');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
    typescript: true,
    appInfo: {
        name: 'DevHub Platform',
        version: '1.0.0',
    },
});

// Subscription plans
export const SUBSCRIPTION_PLANS = {
    FREE: {
        name: 'Free',
        price: 0,
        features: [
            '3 projects',
            '2 team members',
            '5GB storage',
            'Basic analytics',
            'Community support',
        ],
    },
    PRO: {
        name: 'Pro',
        priceId: process.env.STRIPE_PRO_PRICE_ID!,
        price: 9.99,
        interval: 'month' as Stripe.Price.Recurring.Interval,
        features: [
            'Unlimited projects',
            '10 team members',
            '50GB storage',
            'Advanced analytics',
            'Priority support',
            'Custom domains',
            'Video calls (1 hour/day)',
        ],
    },
    BUSINESS: {
        name: 'Business',
        priceId: process.env.STRIPE_BUSINESS_PRICE_ID!,
        price: 29.99,
        interval: 'month' as Stripe.Price.Recurring.Interval,
        features: [
            'Unlimited projects',
            'Unlimited team members',
            '500GB storage',
            'Advanced analytics',
            '24/7 Premium support',
            'Custom domains',
            'Unlimited video calls',
            'White-label options',
            'SSO/SAML',
            'Dedicated account manager',
        ],
    },
    ENTERPRISE: {
        name: 'Enterprise',
        priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
        price: 99.99,
        interval: 'month' as Stripe.Price.Recurring.Interval,
        features: [
            'Everything in Business',
            'Unlimited storage',
            'Custom integrations',
            'On-premise deployment',
            'SLA guarantees',
            'Advanced security features',
            'Custom contracts',
            'Training & onboarding',
        ],
    },
};

// Product IDs
export const STRIPE_PRODUCTS = {
    PRO: process.env.STRIPE_PRO_PRODUCT_ID!,
    BUSINESS: process.env.STRIPE_BUSINESS_PRODUCT_ID!,
    ENTERPRISE: process.env.STRIPE_ENTERPRISE_PRODUCT_ID!,
};

// Webhook signing secret
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;
