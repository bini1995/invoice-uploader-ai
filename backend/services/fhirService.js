import axios from 'axios';

export const getFhirConfig = (provider) => {
  const prefix = `FHIR_${provider.toUpperCase()}`;
  return {
    provider,
    clientId: process.env[`${prefix}_CLIENT_ID`],
    clientSecret: process.env[`${prefix}_CLIENT_SECRET`],
    authUrl: process.env[`${prefix}_AUTH_URL`],
    tokenUrl: process.env[`${prefix}_TOKEN_URL`],
    baseUrl: process.env[`${prefix}_BASE_URL`],
    redirectUri: process.env[`${prefix}_REDIRECT_URI`],
    scopes: process.env[`${prefix}_SCOPES`],
    aud: process.env[`${prefix}_AUD`],
  };
};

export const buildAuthorizationUrl = (config, options = {}) => {
  const scope = config.scopes || options.scope || 'openid profile fhirUser launch/patient';
  const searchParams = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope,
    state: options.state || '',
    aud: config.aud || options.aud || config.baseUrl,
  });
  return `${config.authUrl}?${searchParams.toString()}`;
};

export const exchangeAuthorizationCode = async (config, code) => {
  const payload = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: config.redirectUri,
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });
  const response = await axios.post(config.tokenUrl, payload.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return response.data;
};

export const fetchFhirResource = async (config, resourceType, accessToken, params = {}) => {
  const response = await axios.get(`${config.baseUrl}/${resourceType}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/fhir+json',
    },
    params,
  });
  return response.data;
};
