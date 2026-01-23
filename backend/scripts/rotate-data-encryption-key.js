import crypto from 'crypto';
import { SecretsManagerClient, GetSecretValueCommand, PutSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const secretId = process.env.DATA_ENCRYPTION_SECRET_ID;
if (!secretId) {
  throw new Error('DATA_ENCRYPTION_SECRET_ID is required to rotate the data encryption key.');
}

const client = new SecretsManagerClient({});

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

const readSecretString = async () => {
  const response = await client.send(new GetSecretValueCommand({ SecretId: secretId }));
  if (response.SecretString) {
    return response.SecretString;
  }
  if (response.SecretBinary) {
    return Buffer.from(response.SecretBinary, 'base64').toString('utf8');
  }
  return null;
};

const rotateKey = async () => {
  const secretString = await readSecretString();
  const parsed = parseSecretPayload(secretString);
  const newKey = crypto.randomBytes(32).toString('base64');
  const payload = {
    currentKey: newKey,
    previousKey: parsed?.currentKey,
    rotatedAt: new Date().toISOString(),
  };

  await client.send(
    new PutSecretValueCommand({
      SecretId: secretId,
      SecretString: JSON.stringify(payload, null, 2),
    })
  );

  console.log(`Rotated DATA_ENCRYPTION_SECRET_ID ${secretId}. New key stored as currentKey.`);
};

await rotateKey();
