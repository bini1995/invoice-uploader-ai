const crypto = require('crypto');

function encrypt(text, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', crypto.createHash('sha256').update(key).digest(), iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(data, key) {
  const [ivHex, tagHex, encryptedHex] = data.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', crypto.createHash('sha256').update(key).digest(), iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}

function encryptSensitive(text) {
  const key = process.env.DATA_ENCRYPTION_KEY;
  return key ? encrypt(text, key) : text;
}

function decryptSensitive(text) {
  const key = process.env.DATA_ENCRYPTION_KEY;
  return key ? decrypt(text, key) : text;
}
module.exports = { encrypt, decrypt, encryptSensitive, decryptSensitive };
