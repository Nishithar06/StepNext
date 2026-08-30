/**
 * Centralized Active User Identity Service for StepNext.
 * Manages deterministic user identities and local session persistence for MVP.
 */

export interface AppUser {
  id: string;
  email: string;
  name: string;
  user_metadata?: {
    name?: string;
  };
}

const USER_ID_STORAGE_KEY = 'stepnext_active_user_id';
const USER_STORAGE_KEY = 'stepnext_active_user';

export function getActiveUser(): AppUser | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id && parsed.email) {
        return parsed;
      }
    }
    return null;
  } catch (err) {
    console.warn('[UserService] Error reading active user:', err);
    return null;
  }
}

export function setActiveUser(user: AppUser): void {
  try {
    if (user && user.id) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem(USER_ID_STORAGE_KEY, user.id.trim());
    } else {
      clearActiveUser();
    }
  } catch (err) {
    console.error('[UserService] Error saving active user:', err);
  }
}

export function clearActiveUser(): void {
  try {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(USER_ID_STORAGE_KEY);
  } catch (err) {
    console.error('[UserService] Error clearing active user:', err);
  }
}

export function getActiveUserId(): string | null {
  try {
    const saved = localStorage.getItem(USER_ID_STORAGE_KEY);
    return saved && saved.trim() !== '' ? saved.trim() : null;
  } catch (err) {
    console.warn('[UserService] Error reading active user ID:', err);
    return null;
  }
}

export function setActiveUserId(userId: string): void {
  try {
    if (userId && userId.trim() !== '') {
      localStorage.setItem(USER_ID_STORAGE_KEY, userId.trim());
    } else {
      localStorage.removeItem(USER_ID_STORAGE_KEY);
    }
  } catch (err) {
    console.error('[UserService] Error setting active user ID:', err);
  }
}

export function clearActiveUserId(): void {
  clearActiveUser();
}

export function getDeterministicUserId(email: string): string {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail) return '';
  
  // djb2 hash algorithm for stable, collision-resistant string hashing
  let hash = 5381;
  for (let i = 0; i < cleanEmail.length; i++) {
    hash = ((hash << 5) + hash) + cleanEmail.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  const hashHex = Math.abs(hash).toString(16).padStart(8, '0');
  const cleanPrefix = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
  const encodedEnd = btoa(cleanEmail).replace(/[^a-zA-Z0-9]/g, '').slice(-8);
  
  return `user_${cleanPrefix}_${hashHex}${encodedEnd}`;
}

