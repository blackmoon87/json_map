/**
 * API Key Manager
 * Manages Google Gemini API key storage in browser's localStorage
 */

const API_KEY_STORAGE_KEY = 'gemini_api_key';

export const apiKeyManager = {
  /**
   * Get stored API key from localStorage
   */
  getApiKey(): string | null {
    try {
      return localStorage.getItem(API_KEY_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to read API key from localStorage:', e);
      return null;
    }
  },

  /**
   * Save API key to localStorage
   */
  saveApiKey(apiKey: string): boolean {
    try {
      if (!apiKey || !apiKey.trim()) {
        console.warn('API key is empty');
        return false;
      }
      localStorage.setItem(API_KEY_STORAGE_KEY, apiKey.trim());
      return true;
    } catch (e) {
      console.error('Failed to save API key to localStorage:', e);
      return false;
    }
  },

  /**
   * Remove API key from localStorage
   */
  removeApiKey(): boolean {
    try {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
      return true;
    } catch (e) {
      console.error('Failed to remove API key from localStorage:', e);
      return false;
    }
  },

  /**
   * Check if API key is saved
   */
  hasApiKey(): boolean {
    return !!this.getApiKey();
  },

  /**
   * Get masked API key for display (show first 8 and last 4 chars)
   */
  getMaskedApiKey(): string | null {
    const key = this.getApiKey();
    if (!key || key.length < 12) return key;
    return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`;
  }
};
