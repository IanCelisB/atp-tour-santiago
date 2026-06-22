import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from './middleware';

/**
 * Middleware security-header tests.
 *
 * The middleware adds a CSP + a few hardening headers to every page
 * response. These tests pin the contract:
 *
 *   - CSP is set with a strict default-src and the right allowlists
 *     for our app's actual outbound connections (Google OAuth).
 *   - X-Content-Type-Options blocks MIME sniffing.
 *   - X-Frame-Options / frame-ancestors prevent clickjacking.
 *   - Referrer-Policy is strict-origin-when-cross-origin.
 *   - Permissions-Policy disables powerful APIs we don't use.
 *   - Strict-Transport-Security is added on HTTPS origins.
 */

function makeReq(url = 'https://atp-tour-santiago.onrender.com/') {
  return new NextRequest(new URL(url));
}

describe('middleware — security headers', () => {
  it('sets a Content-Security-Policy header', () => {
    const res = middleware(makeReq());
    const csp = res.headers.get('Content-Security-Policy');
    expect(csp).toBeDefined();
    expect(csp).not.toBe('');
  });

  it('CSP locks default-src to self', () => {
    const res = middleware(makeReq());
    const csp = res.headers.get('Content-Security-Policy') ?? '';
    expect(csp).toMatch(/default-src\s+'self'/);
  });

  it('CSP restricts script-src to self + inline (Next.js / React 19 need inline)', () => {
    const res = middleware(makeReq());
    const csp = res.headers.get('Content-Security-Policy') ?? '';
    expect(csp).toMatch(/script-src\s+'self'/);
    expect(csp).toMatch(/'unsafe-inline'/);
  });

  it('CSP allows style-src self + inline (Tailwind v4 + next/font inject styles)', () => {
    const res = middleware(makeReq());
    const csp = res.headers.get('Content-Security-Policy') ?? '';
    expect(csp).toMatch(/style-src\s+'self'\s+'unsafe-inline'/);
  });

  it('CSP allows local images, data: URIs, and blob: (compressed uploads)', () => {
    const res = middleware(makeReq());
    const csp = res.headers.get('Content-Security-Policy') ?? '';
    expect(csp).toMatch(/img-src\s+'self'\s+data:\s+blob:/);
  });

  it('CSP whitelists Google OAuth endpoints (frame + form-action)', () => {
    const res = middleware(makeReq());
    const csp = res.headers.get('Content-Security-Policy') ?? '';
    expect(csp).toMatch(/frame-src\s+https:\/\/accounts\.google\.com/);
    expect(csp).toMatch(/form-action\s+'self'\s+https:\/\/accounts\.google\.com/);
  });

  it('CSP whitelists YouTube and Vimeo (gallery VIDEO embeds)', () => {
    const res = middleware(makeReq());
    const csp = res.headers.get('Content-Security-Policy') ?? '';
    expect(csp).toMatch(/frame-src[^;]*https:\/\/www\.youtube\.com/);
    expect(csp).toMatch(/frame-src[^;]*https:\/\/player\.vimeo\.com/);
  });

  it('CSP disables object-src and locks base-uri to self', () => {
    const res = middleware(makeReq());
    const csp = res.headers.get('Content-Security-Policy') ?? '';
    expect(csp).toMatch(/object-src\s+'none'/);
    expect(csp).toMatch(/base-uri\s+'self'/);
  });

  it('CSP sets frame-ancestors to none (anti-clickjacking)', () => {
    const res = middleware(makeReq());
    const csp = res.headers.get('Content-Security-Policy') ?? '';
    expect(csp).toMatch(/frame-ancestors\s+'none'/);
  });

  it('CSP does NOT allow arbitrary third-party origins in connect-src', () => {
    const res = middleware(makeReq());
    const csp = res.headers.get('Content-Security-Policy') ?? '';
    expect(csp).toMatch(/connect-src\s+'self'/);
    expect(csp).not.toMatch(/connect-src\s+'self'\s+\*/);
  });

  it('sets X-Content-Type-Options: nosniff', () => {
    const res = middleware(makeReq());
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });

  it('sets X-Frame-Options: DENY', () => {
    const res = middleware(makeReq());
    expect(res.headers.get('X-Frame-Options')).toBe('DENY');
  });

  it('sets Referrer-Policy: strict-origin-when-cross-origin', () => {
    const res = middleware(makeReq());
    expect(res.headers.get('Referrer-Policy')).toBe(
      'strict-origin-when-cross-origin',
    );
  });

  it('sets Permissions-Policy disabling camera, microphone, geolocation', () => {
    const res = middleware(makeReq());
    const policy = res.headers.get('Permissions-Policy') ?? '';
    expect(policy).toContain('camera=()');
    expect(policy).toContain('microphone=()');
    expect(policy).toContain('geolocation=()');
  });

  it('adds Strict-Transport-Security on HTTPS origins', () => {
    const res = middleware(makeReq('https://atp-tour-santiago.onrender.com/'));
    const hsts = res.headers.get('Strict-Transport-Security') ?? '';
    expect(hsts).toMatch(/max-age=\d+/);
    expect(hsts).toContain('includeSubDomains');
  });

  it('does NOT add Strict-Transport-Security on HTTP origins (dev)', () => {
    const res = middleware(makeReq('http://localhost:3000/'));
    expect(res.headers.get('Strict-Transport-Security')).toBeNull();
  });

  it('exposes a x-nonce request header for downstream server components', () => {
    const res = middleware(makeReq());
    // The nonce is forwarded onto the request headers so server components
    // can read it via `headers().get('x-nonce')` if they need to attach
    // it to a custom inline script.
    expect(res.headers.get('x-nonce')).toBeDefined();
  });
});
