import { randomBytes } from 'node:crypto';
import { getConfig, redirectWithError, safeReturnTo, signState } from './_utils.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { siteOrigin, clientId, clientSecret, redirectUri } = getConfig(req);
  const returnTo = safeReturnTo(req.query.returnTo, siteOrigin);

  if (!clientSecret) {
    redirectWithError(res, returnTo, 'missing_line_secret');
    return;
  }

  const role = req.query.role === 'stylist' ? 'stylist' : 'customer';
  const nonce = randomBytes(16).toString('hex');
  const state = signState({ role, returnTo, nonce, createdAt: Date.now() }, clientSecret);

  const lineUrl = new URL('https://access.line.me/oauth2/v2.1/authorize');
  lineUrl.searchParams.set('response_type', 'code');
  lineUrl.searchParams.set('client_id', clientId);
  lineUrl.searchParams.set('redirect_uri', redirectUri);
  lineUrl.searchParams.set('state', state);
  lineUrl.searchParams.set('scope', 'openid profile');
  lineUrl.searchParams.set('nonce', nonce);

  res.redirect(302, lineUrl.toString());
}
