import { generateState, generateCodeVerifier } from 'arctic';
import { cookies } from 'next/headers';
import { getGoogleClient } from '@/lib/auth/google';
import { NextResponse } from 'next/server';

export async function GET() {
  const google = getGoogleClient();
  if (!google) {
    return NextResponse.json(
      {
        error:
          'Google login is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env',
      },
      { status: 503 },
    );
  }

  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = google.createAuthorizationURL(state, codeVerifier, [
    'openid',
    'profile',
    'email',
  ]);

  const cookieStore = await cookies();
  cookieStore.set('google_oauth_state', state, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
  });
  cookieStore.set('google_code_verifier', codeVerifier, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10,
  });

  return NextResponse.redirect(url);
}
