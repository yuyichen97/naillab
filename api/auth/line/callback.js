import {
  buildLineUser,
  decodeJwtPayload,
  encodeUser,
  getConfig,
  redirectWithError,
  verifyState
} from './_utils.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { clientId, clientSecret, redirectUri, siteOrigin } = getConfig(req);
  const statePayload = verifyState(req.query.state, clientSecret);
  const returnTo = statePayload?.returnTo || siteOrigin;

  if (req.query.error) {
    redirectWithError(res, returnTo, 'line_authorization_denied');
    return;
  }

  if (!statePayload) {
    redirectWithError(res, siteOrigin, 'invalid_line_state');
    return;
  }

  if (!req.query.code) {
    redirectWithError(res, returnTo, 'missing_line_code');
    return;
  }

  const form = new URLSearchParams();
  form.set('grant_type', 'authorization_code');
  form.set('code', req.query.code);
  form.set('redirect_uri', redirectUri);
  form.set('client_id', clientId);
  form.set('client_secret', clientSecret);

  const tokenResponse = await fetch('https://api.line.me/oauth2/v2.1/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: form
  });

  if (!tokenResponse.ok) {
    redirectWithError(res, returnTo, 'line_token_exchange_failed');
    return;
  }

  const tokenData = await tokenResponse.json();
  const idTokenPayload = tokenData.id_token ? decodeJwtPayload(tokenData.id_token) : {};
  let profile = {};

  if (tokenData.access_token) {
    const profileResponse = await fetch('https://api.line.me/v2/profile', {
      headers: { authorization: `Bearer ${tokenData.access_token}` }
    });

    if (profileResponse.ok) {
      profile = await profileResponse.json();
    }
  }

  if (!profile.userId && !idTokenPayload.sub) {
    redirectWithError(res, returnTo, 'line_profile_failed');
    return;
  }

  const user = buildLineUser(profile, idTokenPayload, statePayload.role);
  const url = new URL(returnTo);
  url.searchParams.set('line_demo_user', encodeUser(user));
  res.redirect(302, url.toString());
}
