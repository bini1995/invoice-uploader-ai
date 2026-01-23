import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import logger from './logger.js';

const parseSecretPayload = (secretValue) => {
  if (!secretValue) {
    return null;
  }
  try {
    const parsed = JSON.parse(secretValue);
    if (typeof parsed === 'string') {
      return { currentKey: parsed };
    }
    if (parsed && typeof parsed === 'object') {
      if (parsed.currentKey || parsed.previousKey) {
        return parsed;
      }
    }
  } catch (error) {
    return { currentKey: secretValue };
  }
  return { currentKey: secretValue };
};

const readSecretString = async (client, secretId) => {
  const response = await client.send(new GetSecretValueCommand({ SecretId: secretId }));
  if (response.SecretString) {
    return response.SecretString;
  }
  if (response.SecretBinary) {
    return Buffer.from(response.SecretBinary, 'base64').toString('utf8');
  }
  return null;
};

let secretsLoaded = false;

const loadSecrets = async () => {
  if (secretsLoaded) {
    return;
  }
  const secretId = process.env.DATA_ENCRYPTION_SECRET_ID;
  if (!secretId) {
    secretsLoaded = true;
    return;
  }

  try {
    const client = new SecretsManagerClient({});
    const secretString = await readSecretString(client, secretId);
    const parsed = parseSecretPayload(secretString);
    if (!parsed?.currentKey) {
      logger.warn('DATA_ENCRYPTION_SECRET_ID resolved without a currentKey.');
      secretsLoaded = true;
      return;
    }
    process.env.DATA_ENCRYPTION_KEY = parsed.currentKey;
    if (parsed.previousKey) {
      process.env.DATA_ENCRYPTION_KEY_PREVIOUS = parsed.previousKey;
    }
    if (parsed.rotatedAt) {
      process.env.DATA_ENCRYPTION_KEY_ROTATED_AT = parsed.rotatedAt;
    }
    logger.info('Loaded DATA_ENCRYPTION_KEY from AWS Secrets Manager.');
  } catch (error) {
    logger.error('Failed to load secrets from AWS Secrets Manager.', { error: error.message });
  } finally {
    secretsLoaded = true;
  }
};

export { loadSecrets };
