import { NextRequest, NextResponse } from 'next/server';

/**
 * Security headers applied to every page response.
 *
 * Why a single Content-Security-Policy:
 *   - Closes the Aikido "CSP not set" finding (risk score 91).
 *   - First line of defense against stored XSS in the Noticia HTML
 *     content and any future user-generated content.
 *   - The `frame-ancestors 'none'` + `X-Frame-Options: DENY` pair
 *     blocks clickjacking.
 *
 * Why these directives (and not stricter):
 *   - `script-src 'unsafe-inline' 'unsafe-eval'` is required for
 *     Next.js 16 / React 19 hydration and the framework's RSC
 *     streaming. Tightening requires nonces on every inline script,
 *     which is a follow-up. The CSP still denies third-party scripts.
 *   - `style-src 'unsafe-inline'` is required for Tailwind v4
 *     (`preflight`-style injected styles) and `next/font`'s runtime
 *     CSS variables.
 *   - `img-src` includes `data:` and `blob:` because the Jugador /
 *     Noticia / Galeria forms preview compressed WebP blobs and
 *     data-URI thumbnails before upload.
 *   - `connect-src 'self'` — the app makes zero browser-side
 *     cross-origin fetches. The Google userinfo call is server-side
 *     and is not subject to CSP.
 *   - `frame-src` and `form-action` whitelist only `accounts.google.com`
 *     so the OAuth flow can run.
 *
 * Per-request nonce:
 *   We forward a fresh `x-nonce` onto the request headers. The CSP
 *   policy itself does not currently reference the nonce (see above),
 *   but downstream code can read it via `headers().get('x-nonce')` to
 *   tag any custom inline scripts when we tighten the policy.
 */
function buildCspHeader(): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    // OAuth + video embeds. YouTube and Vimeo are the only third-party
    // frames we render (GalleryItem.tipo = 'VIDEO').
    "frame-src https://accounts.google.com https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com",
    "form-action 'self' https://accounts.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
  ].join('; ');
}

/**
 * Generate a per-request nonce. Used for tightening the CSP in a
 * future iteration (replacing `'unsafe-inline'` on script-src with
 * `'nonce-${nonce}'`). Currently forwarded only.
 */
function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  // base64 without padding is fine for a nonce
  return btoa(String.fromCharCode(...bytes));
}

export function proxy(request: NextRequest) {
  const nonce = generateNonce();

  // Forward the nonce to downstream server components so they can
  // attach it to any inline script they own.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // CSP — the main fix.
  response.headers.set('Content-Security-Policy', buildCspHeader());
  // Expose the nonce to anything downstream that wants to read it.
  response.headers.set('x-nonce', nonce);

  // Hardening headers that complement the CSP.
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  );

  // HSTS only on HTTPS — dev (http://localhost) must not get it.
  if (request.nextUrl.protocol === 'https:') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains',
    );
  }

  return response;
}

export const config = {
  /*
   * Apply the headers to every page route. We exclude:
   *   - /api/*         — no HTML rendered, headers are irrelevant
   *   - /_next/static  — static asset chunks, no CSP needed
   *   - /_next/image   — image optimization endpoint
   *   - /favicon.ico   — static asset
   *   - /uploads/*     — uploaded files served as-is
   */
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|uploads).*)',
  ],
};
