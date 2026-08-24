/**
 * Centralized Active User Identity Service for LifePilot AI.
 * Abstracts local development identity storage in preparation for Supabase Authentication.
 */

const USER_ID_STORAGE_KEY = 'stepnext_active_user_id';

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
  try {
    localStorage.removeItem(USER_ID_STORAGE_KEY);
  } catch (err) {
    console.error('[UserService] Error clearing active user ID:', err);
  }
}
