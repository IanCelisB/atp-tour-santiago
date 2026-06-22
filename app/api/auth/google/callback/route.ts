import { cookies } from 'next/headers';
import { OAuth2RequestError } from 'arctic';
import { prisma } from '@/lib/db';
import { getGoogleClient } from '@/lib/auth/google';
import { getSession } from '@/lib/auth/session';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  const cookieStore = await cookies();
  const storedState = cookieStore.get('google_oauth_state')?.value ?? null;
  const storedCodeVerifier =
    cookieStore.get('google_code_verifier')?.value ?? null;

  if (
    !code ||
    !state ||
    !storedState ||
    state !== storedState ||
    !storedCodeVerifier
  ) {
    return NextResponse.json(
      { error: 'Invalid state or missing code' },
      { status: 400 },
    );
  }

  const google = getGoogleClient();
  if (!google) {
    return NextResponse.json(
      { error: 'Google login not configured' },
      { status: 503 },
    );
  }

  let tokens;
  try {
    tokens = await google.validateAuthorizationCode(code, storedCodeVerifier);
  } catch (e) {
    if (e instanceof OAuth2RequestError) {
      return NextResponse.json(
        { error: 'Invalid authorization code' },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: 'OAuth error' }, { status: 500 });
  }

  // Fetch user info from Google
  const response = await fetch(
    'https://openidconnect.googleapis.com/v1/userinfo',
    {
      headers: { Authorization: `Bearer ${tokens.accessToken()}` },
    },
  );
  const userInfo = await response.json();

  if (!userInfo.email || !userInfo.email_verified) {
    return NextResponse.json(
      { error: 'Google account has no verified email' },
      { status: 400 },
    );
  }

  // Find or create user
  let user = await prisma.user.findUnique({
    where: { email: userInfo.email },
  });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: userInfo.email,
        passwordHash: '', // no password for OAuth users
        role: 'view', // default to view role
      },
    });
  }

  // Set session
  const session = await getSession();
  session.userId = user.id;
  session.email = user.email;
  session.role = user.role as 'admin' | 'view';
  await session.save();

  // Clear OAuth state cookies
  cookieStore.delete('google_oauth_state');
  cookieStore.delete('google_code_verifier');

  // Redirect to home
  return NextResponse.redirect(new URL('/', url));
}
