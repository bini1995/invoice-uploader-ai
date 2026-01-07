
import Ajv from 'ajv';
const schema = {
  type: 'object',
  properties: {
    showRoleEmojis: { type: 'boolean', default: false },
    autoArchive: { type: 'boolean', default: true },
    emailTone: { type: 'string' },
    csvSizeLimitMB: { type: 'number' },
    pdfSizeLimitMB: { type: 'number' },
    defaultRetention: { type: 'string' },
  },
  additionalProperties: true,
};

const ajv = new Ajv({ useDefaults: true });
const validateSettings = ajv.compile(schema);

export { validateSettings };
