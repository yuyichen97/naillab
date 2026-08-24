import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export function base64UrlEncode(value) {
  return Buffer.from(value).toString('base64url');
}

export function base64UrlJson(value) {
  return base64UrlEncode(JSON.stringify(value));
}

function base64UrlDecode(value) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

export function getConfig(req) {
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:5173';
  const protocol = req.headers['x-forwarded-proto'] || (host.includes('localhost') ? 'http' : 'https');
  const siteOrigin = process.env.FRONTEND_URL || `${protocol}://${host}`;
  const clientId = process.env.LINE_CLIENT_ID || '2010135774';
  const clientSecret = process.env.LINE_CLIENT_SECRET || '';
  const redirectUri = process.env.LINE_REDIRECT_URI || `${siteOrigin}/api/auth/line/callback`;

  return { siteOrigin, clientId, clientSecret, redirectUri };
}

export function safeReturnTo(value, fallbackOrigin) {
  try {
    const url = new URL(value || fallbackOrigin);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return fallbackOrigin;
    return url.origin;
  } catch {
    return fallbackOrigin;
  }
}

export function signState(payload, secret) {
  const body = base64UrlJson(payload);
  const signature = createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${signature}`;
}

export function verifyState(state, secret) {
  try {
    if (!state || !secret || !state.includes('.')) return null;

    const [body, signature] = state.split('.');
    const expected = createHmac('sha256', secret).update(body).digest('base64url');
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);

    if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) {
      return null;
    }

    const payload = JSON.parse(base64UrlDecode(body));
    if (!payload.createdAt || Date.now() - payload.createdAt > 10 * 60 * 1000) return null;

    return payload;
  } catch {
    return null;
  }
}

export function redirectWithError(res, returnTo, code) {
  try {
    const url = new URL(returnTo);
    url.searchParams.set('line_error', code);
    res.redirect(302, url.toString());
  } catch {
    res.redirect(302, `/?line_error=${encodeURIComponent(code)}`);
  }
}

export function decodeJwtPayload(token) {
  try {
    const [, payload] = token.split('.');
    return JSON.parse(base64UrlDecode(payload));
  } catch {
    return {};
  }
}

export function encodeUser(user) {
  return base64UrlJson(user);
}

export function buildLineUser(profile = {}, idTokenPayload = {}, role = 'customer') {
  const lineId = profile.userId || idTokenPayload.sub || randomBytes(8).toString('hex');
  const displayName = profile.displayName || idTokenPayload.name || 'LINE 使用者';
  const email = idTokenPayload.email || '';

  return {
    id: `line-${lineId}`,
    name: displayName,
    phone: email || `${lineId}@line.local`,
    email,
    role,
    location: '',
    studioName: role === 'stylist' ? displayName : '',
    avatarUrl: profile.pictureUrl || idTokenPayload.picture || '',
    provider: 'line',
    isLineLogin: true,
    isLocalDemo: true
  };
}
