// utils/session30m.ts → đổi thành dùng cookie
import Cookies from 'js-cookie';

const SESSION_KEY = 'luna_30m_session';
const SESSION_DURATION_MINUTES = 30;

interface LunaSession {
  sessionId: string;
  startedAt: number;
  expiresAt: number;
}

export function getCurrent30mSession(): LunaSession | null {
  const raw = Cookies.get(SESSION_KEY);
  if (!raw) return null;

  try {
    const session: LunaSession = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      Cookies.remove(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    Cookies.remove(SESSION_KEY);
    return null;
  }
}

export function create30mSession(): LunaSession {
  const now = Date.now();
  const session: LunaSession = {
    sessionId: `luna_${now}_${Math.random().toString(36).substr(2, 9)}`,
    startedAt: now,
    expiresAt: now + SESSION_DURATION_MINUTES * 60 * 1000,
  };

  Cookies.set(SESSION_KEY, JSON.stringify(session), {
    expires: SESSION_DURATION_MINUTES / (24 * 60), // 30 phút tính bằng ngày
    path: '/',
    sameSite: 'lax',
    // secure: process.env.NODE_ENV === 'production', // HTTPS only ở prod
    secure: false, // dev mode
  });

  return session;
}

export function getOrCreate30mSession(): LunaSession {
  return getCurrent30mSession() || create30mSession();
}

export function clear30mSession() {
  Cookies.remove(SESSION_KEY, { path: '/' });
}