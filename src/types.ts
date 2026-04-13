export type Screen =
  | 'dashboard'
  | 'vaults'
  | 'notes'
  | 'settings'
  | 'add-credential'
  | 'editor';

export type VaultCategory =
  | 'Social Media'
  | 'Google Account'
  | 'Websites'
  | 'Apps'
  | 'Banking'
  | 'Government IDs'
  | 'Work / Professional'
  | 'Entertainment'
  | 'Utility'
  | 'Other';

export type CardType = 'Mastercard' | 'Visa' | 'American Express' | 'Other';
export type GovIdType = 'NID' | 'Passport' | 'Driving License' | 'Other';
export type SocialPlatform =
  | 'Facebook'
  | 'X'
  | 'Instagram'
  | 'TikTok'
  | 'YouTube'
  | 'LinkedIn'
  | 'Snapchat'
  | 'Pinterest'
  | 'Reddit'
  | 'Other';

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface Credential {
  id: string;
  label: string; // App/website name
  category: VaultCategory;
  username?: string;
  email?: string;
  password?: string;
  website?: string;
  notes?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAppName?: string;
  bankUserId?: string;
  cardEnabled?: boolean;
  cardName?: string;
  cardNumber?: string;
  cardCvv?: string;
  cardExpiryDate?: string;
  cardHolderName?: string;
  cardType?: CardType;
  govIdType?: GovIdType;
  govIdNumber?: string;
  govFrontImage?: string; // data URL
  govBackImage?: string; // data URL (often needed for NID)
  socialPlatform?: SocialPlatform;
  phoneNumber?: string;
  googleRecoveryEmail?: string;
  googleRecoveryPhone?: string;
  googleBackupCodes?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  passwordUpdatedAt: string; // ISO (used for rotation reminders)
}

export interface Settings {
  passwordRotationDays: number; // default 30
  notifyWithBrowserNotifications: boolean;
  requireBiometricOnOpen: boolean;
  biometricCredentialId?: string;
}

export interface AppDataV1 {
  version: 1;
  notes: Note[];
  credentials: Credential[];
  settings: Settings;
}
