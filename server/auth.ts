import crypto from 'crypto';

// Password Security Helpers using Node.js crypto module
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `pbkdf2$100000$${salt}$${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.startsWith('pbkdf2$')) {
    // Legacy fallback or unhashed protection comparison
    return false;
  }
  
  const parts = storedHash.split('$');
  if (parts.length !== 4) return false;
  
  const iterations = parseInt(parts[1], 10);
  const salt = parts[2];
  const originalHash = parts[3];

  const hash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');
  
  try {
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(originalHash, 'hex'));
  } catch {
    return false;
  }
}

// Password Strength Validator
export function validatePasswordStrength(password: string): { valid: boolean; error?: string } {
  if (!password || password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter (A-Z).' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter (a-z).' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number (0-9).' };
  }
  return { valid: true };
}

// Email Normalizer
export function normalizeEmail(email: string): string {
  if (!email) return '';
  return email.trim().toLowerCase();
}

// Token Generators
export function generateToken(prefix = 'tok'): string {
  return `${prefix}_${crypto.randomBytes(24).toString('hex')}`;
}

// Session store in-memory map backed by tokens
interface SessionData {
  userId: string;
  role: string;
  createdAt: string;
  expiresAt: string;
}

const activeSessions = new Map<string, SessionData>();

export function createSession(userId: string, role: string, rememberMe = false): { token: string; expiresAt: string } {
  const token = generateToken('sess');
  // 30 days if rememberMe, 24 hours otherwise
  const durationMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  const expiresAt = new Date(Date.now() + durationMs).toISOString();

  activeSessions.set(token, {
    userId,
    role,
    createdAt: new Date().toISOString(),
    expiresAt,
  });

  return { token, expiresAt };
}

export function validateSession(token: string): SessionData | null {
  if (!token) return null;
  const session = activeSessions.get(token);
  if (!session) return null;

  if (new Date(session.expiresAt).getTime() < Date.now()) {
    activeSessions.delete(token);
    return null;
  }

  return session;
}

export function invalidateSession(token: string): boolean {
  return activeSessions.delete(token);
}

export function invalidateAllUserSessions(userId: string): void {
  for (const [token, session] of activeSessions.entries()) {
    if (session.userId === userId) {
      activeSessions.delete(token);
    }
  }
}
