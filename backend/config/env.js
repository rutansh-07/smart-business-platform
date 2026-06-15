const requiredInProduction = ['MONGO_URI', 'JWT_SECRET'];

export function validateEnv() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    return;
  }

  const missing = requiredInProduction.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
    process.exit(1);
  }
}

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production');
  }

  return secret || 'fallback_secret_dev_only';
}
