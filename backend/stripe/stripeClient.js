let Stripe;
try {
  const mod = await import('stripe');
  Stripe = mod.default;
} catch {
  Stripe = null;
}

let connectionSettings = null;

async function getCredentials() {
  if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PUBLISHABLE_KEY) {
    return {
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      secretKey: process.env.STRIPE_SECRET_KEY,
    };
  }

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? 'depl ' + process.env.WEB_REPL_RENEWAL
      : null;

  if (!xReplitToken) {
    throw new Error('Stripe credentials not configured. Set STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY environment variables.');
  }

  const connectorName = 'stripe';
  const isProduction = process.env.REPLIT_DEPLOYMENT === '1';
  const targetEnvironment = isProduction ? 'production' : 'development';

  const url = new URL(`https://${hostname}/api/v2/connection`);
  url.searchParams.set('include_secrets', 'true');
  url.searchParams.set('connector_names', connectorName);
  url.searchParams.set('environment', targetEnvironment);

  const response = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json',
      'X_REPLIT_TOKEN': xReplitToken
    }
  });

  const data = await response.json();
  connectionSettings = data.items?.[0];

  if (!connectionSettings || (!connectionSettings.settings.publishable || !connectionSettings.settings.secret)) {
    throw new Error(`Stripe ${targetEnvironment} connection not found`);
  }

  return {
    publishableKey: connectionSettings.settings.publishable,
    secretKey: connectionSettings.settings.secret,
  };
}

export async function getUncachableStripeClient() {
  if (!Stripe) {
    throw new Error('Stripe package is not installed. Run: npm install stripe');
  }
  const { secretKey } = await getCredentials();
  return new Stripe(secretKey, {
    apiVersion: '2025-08-27.basil',
  });
}

export async function getStripePublishableKey() {
  const { publishableKey } = await getCredentials();
  return publishableKey;
}

export async function getStripeSecretKey() {
  const { secretKey } = await getCredentials();
  return secretKey;
}

let stripeSync = null;

export async function getStripeSync() {
  if (!stripeSync) {
    try {
      const { StripeSync } = await import('stripe-replit-sync');
      const secretKey = await getStripeSecretKey();

      stripeSync = new StripeSync({
        poolConfig: {
          connectionString: process.env.DATABASE_URL,
          max: 2,
        },
        stripeSecretKey: secretKey,
      });
    } catch {
      stripeSync = {
        findOrCreateManagedWebhook: async () => ({ id: 'skipped' }),
        syncBackfill: async () => {},
        processWebhook: async () => {},
      };
    }
  }
  return stripeSync;
}
