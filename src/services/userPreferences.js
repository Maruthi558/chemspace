/**
 * ChemSpace User Preferences Store
 * Synchronizes personal scientific workspace preferences between localStorage and the backend.
 */

import { getCurrentUserUid } from './workspaceApi';

const API_BASE = '/api/workspace/preferences';

const DEFAULT_PREFERENCES = {
  language: 'en',
  theme: 'dark',
  voiceEnabled: true,
  voiceSpeed: 1.0,
  voiceName: 'default',
  autoRead: false,
  aiResponseMode: 'balanced',
  webSearchEnabled: true,
  watermarkEnabled: true,
  privacyBlurEnabled: true
};

function getStorageKey() {
  const uid = getCurrentUserUid();
  return `chemspace_user_preferences_${uid || 'guest'}`;
}

function getAuthHeader() {
  const token = localStorage.getItem('chemspace_token');
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`
  };
}

/**
 * Load preferences for current user
 */
export function getUserPreferences() {
  try {
    const key = getStorageKey();
    const raw = localStorage.getItem(key);
    if (raw) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
    }
  } catch {}
  return { ...DEFAULT_PREFERENCES };
}

/**
 * Save and synchronize preferences
 */
export async function saveUserPreferences(partialPrefs) {
  const current = getUserPreferences();
  const updated = { ...current, ...partialPrefs };
  const key = getStorageKey();

  try {
    localStorage.setItem(key, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('chemspace-preferences-changed', { detail: updated }));
  } catch {}

  const token = localStorage.getItem('chemspace_token');
  if (token && !token.startsWith('guest_')) {
    try {
      await fetch(API_BASE, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({
          language: updated.language,
          theme: updated.theme,
          voice_enabled: updated.voiceEnabled,
          voice_speed: updated.voiceSpeed,
          voice_name: updated.voiceName,
          auto_read: updated.autoRead,
          ai_response_mode: updated.aiResponseMode,
          web_search_enabled: updated.webSearchEnabled,
          watermark_enabled: updated.watermarkEnabled,
          privacy_blur_enabled: updated.privacyBlurEnabled
        })
      });
    } catch {}
  }

  return updated;
}

/**
 * Sync from backend on login
 */
export async function syncPreferencesFromBackend() {
  const token = localStorage.getItem('chemspace_token');
  if (!token || token.startsWith('guest_')) return getUserPreferences();

  try {
    const res = await fetch(API_BASE, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.preferences) {
        const key = getStorageKey();
        localStorage.setItem(key, JSON.stringify(data.preferences));
        window.dispatchEvent(new CustomEvent('chemspace-preferences-changed', { detail: data.preferences }));
        return data.preferences;
      }
    }
  } catch {}
  return getUserPreferences();
}
