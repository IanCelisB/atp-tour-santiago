import { cookies } from 'next/headers';
import { getIronSession, type SessionOptions } from 'iron-session';

export interface SessionData {
  userId?: string;
  email?: string;
  role?: 'admin' | 'view';
}

const sessionOptions: SessionOptions = {
  password:
    process.env.SESSION_SECRET ?? 'dev-only-secret-min-32-chars-long-please-rotate',
  cookieName: 'atp_session',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function requireAdmin() {
  const session = await getSession();
  if (session.role !== 'admin') {
    throw new Error('Forbidden: admin role required');
  }
  return session;
}

export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return session.role === 'admin';
}
