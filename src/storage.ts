import type { AppDataV1, Settings } from './types';

const STORAGE_KEY = 'notecore.data';

const defaultSettings: Settings = {
  passwordRotationDays: 30,
  notifyWithBrowserNotifications: false,
  requireBiometricOnOpen: false,
  biometricCredentialId: undefined,
};

export function createDefaultData(): AppDataV1 {
  return { version: 1, notes: [], credentials: [], settings: defaultSettings };
}

export function loadData(): AppDataV1 {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createDefaultData();
    }
    const parsed = JSON.parse(raw) as Partial<AppDataV1>;
    if (parsed.version !== 1) {
      return createDefaultData();
    }
    return {
      version: 1,
      notes: Array.isArray(parsed.notes) ? (parsed.notes as AppDataV1['notes']) : [],
      credentials: Array.isArray(parsed.credentials)
        ? (parsed.credentials as AppDataV1['credentials'])
        : [],
      settings: { ...defaultSettings, ...(parsed.settings ?? {}) },
    };
  } catch {
    return createDefaultData();
  }
}

export function saveData(data: AppDataV1) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

