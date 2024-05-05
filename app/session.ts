import { createCookieSessionStorage } from '@remix-run/node';

const SESSION_SECRET = process.env.SESSION_SECRET;

if (!SESSION_SECRET) {
  throw new Error('Set SESSION_SECRET environment variable');
}

export const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: 'work-journal-session',
      secrets: [SESSION_SECRET],

      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    },
  });
