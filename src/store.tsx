import * as React from 'react';
import type { AppDataV1, CardType, Credential, GovIdType, Note, Settings, SocialPlatform, VaultCategory } from './types';
import { createDefaultData, loadData, saveData } from './storage';
import { newId } from './utils/ids';
import { nowIso, daysBetween } from './utils/time';

type AppStore = {
  data: AppDataV1;
  addNote: (input?: Partial<Pick<Note, 'title' | 'content' | 'tags'>>) => Note;
  updateNote: (id: string, patch: Partial<Pick<Note, 'title' | 'content' | 'tags'>>) => void;
  deleteNote: (id: string) => void;

  addCredential: (input: {
    label: string;
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
    cardCvv?: string;
    cardExpiryDate?: string;
    cardHolderName?: string;
    cardType?: CardType;
    govIdType?: GovIdType;
    govIdNumber?: string;
    govFrontImage?: string;
    govBackImage?: string;
    socialPlatform?: SocialPlatform;
    phoneNumber?: string;
    googleRecoveryEmail?: string;
    googleRecoveryPhone?: string;
    googleBackupCodes?: string;
  }) => Credential;
  updateCredential: (
    id: string,
    patch: Partial<
      Pick<
        Credential,
        | 'label'
        | 'category'
        | 'username'
        | 'email'
        | 'password'
        | 'website'
        | 'notes'
        | 'bankName'
        | 'bankAccountNumber'
        | 'bankAppName'
        | 'bankUserId'
        | 'cardEnabled'
        | 'cardName'
        | 'cardCvv'
        | 'cardExpiryDate'
        | 'cardHolderName'
        | 'cardType'
        | 'govIdType'
        | 'govIdNumber'
        | 'govFrontImage'
        | 'govBackImage'
        | 'socialPlatform'
        | 'phoneNumber'
        | 'googleRecoveryEmail'
        | 'googleRecoveryPhone'
        | 'googleBackupCodes'
      >
    >
  ) => void;
  markCredentialPasswordChanged: (id: string) => void;
  deleteCredential: (id: string) => void;

  updateSettings: (patch: Partial<Settings>) => void;
  resetAllData: () => void;
  getDuePasswordRotations: () => Credential[];
};

const StoreContext = React.createContext<AppStore | null>(null);

function sortByUpdatedDesc<T extends { updatedAt: string }>(items: T[]) {
  return [...items].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = React.useState<AppDataV1>(() => loadData());

  React.useEffect(() => {
    saveData(data);
  }, [data]);

  const addNote: AppStore['addNote'] = (input) => {
    const now = nowIso();
    const note: Note = {
      id: newId('note'),
      title: input?.title?.trim() || 'Untitled note',
      content: input?.content ?? '',
      tags: Array.isArray(input?.tags) ? input!.tags : [],
      createdAt: now,
      updatedAt: now,
    };
    setData((d) => ({ ...d, notes: sortByUpdatedDesc([note, ...d.notes]) }));
    return note;
  };

  const updateNote: AppStore['updateNote'] = (id, patch) => {
    const now = nowIso();
    setData((d) => ({
      ...d,
      notes: sortByUpdatedDesc(
        d.notes.map((n) =>
          n.id !== id
            ? n
            : {
                ...n,
                ...(patch.title !== undefined ? { title: patch.title } : {}),
                ...(patch.content !== undefined ? { content: patch.content } : {}),
                ...(patch.tags !== undefined ? { tags: patch.tags } : {}),
                updatedAt: now,
              }
        )
      ),
    }));
  };

  const deleteNote: AppStore['deleteNote'] = (id) => {
    setData((d) => ({ ...d, notes: d.notes.filter((n) => n.id !== id) }));
  };

  const addCredential: AppStore['addCredential'] = (input) => {
    const now = nowIso();
    const cred: Credential = {
      id: newId('cred'),
      label: input.label.trim() || 'Untitled credential',
      category: input.category,
      username: input.username?.trim() || undefined,
      email: input.email?.trim() || undefined,
      password: input.password ?? undefined,
      website: input.website?.trim() || undefined,
      notes: input.notes?.trim() || undefined,
      bankName: input.bankName?.trim() || undefined,
      bankAccountNumber: input.bankAccountNumber?.trim() || undefined,
      bankAppName: input.bankAppName?.trim() || undefined,
      bankUserId: input.bankUserId?.trim() || undefined,
      cardEnabled: Boolean(input.cardEnabled),
      cardName: input.cardName?.trim() || undefined,
      cardCvv: input.cardCvv?.trim() || undefined,
      cardExpiryDate: input.cardExpiryDate?.trim() || undefined,
      cardHolderName: input.cardHolderName?.trim() || undefined,
      cardType: input.cardType ?? undefined,
      govIdType: input.govIdType ?? undefined,
      govIdNumber: input.govIdNumber?.trim() || undefined,
      govFrontImage: input.govFrontImage ?? undefined,
      govBackImage: input.govBackImage ?? undefined,
      socialPlatform: input.socialPlatform ?? undefined,
      phoneNumber: input.phoneNumber?.trim() || undefined,
      googleRecoveryEmail: input.googleRecoveryEmail?.trim() || undefined,
      googleRecoveryPhone: input.googleRecoveryPhone?.trim() || undefined,
      googleBackupCodes: input.googleBackupCodes?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
      passwordUpdatedAt: now,
    };
    setData((d) => ({ ...d, credentials: sortByUpdatedDesc([cred, ...d.credentials]) }));
    return cred;
  };

  const updateCredential: AppStore['updateCredential'] = (id, patch) => {
    const now = nowIso();
    setData((d) => ({
      ...d,
      credentials: sortByUpdatedDesc(
        d.credentials.map((c) => {
          if (c.id !== id) return c;
          const next: Credential = {
            ...c,
            ...(patch.label !== undefined ? { label: patch.label } : {}),
            ...(patch.category !== undefined ? { category: patch.category } : {}),
            ...(patch.username !== undefined ? { username: patch.username?.trim() || undefined } : {}),
            ...(patch.email !== undefined ? { email: patch.email?.trim() || undefined } : {}),
            ...(patch.password !== undefined ? { password: patch.password } : {}),
            ...(patch.website !== undefined ? { website: patch.website?.trim() || undefined } : {}),
            ...(patch.notes !== undefined ? { notes: patch.notes?.trim() || undefined } : {}),
            ...(patch.bankName !== undefined ? { bankName: patch.bankName?.trim() || undefined } : {}),
            ...(patch.bankAccountNumber !== undefined
              ? { bankAccountNumber: patch.bankAccountNumber?.trim() || undefined }
              : {}),
            ...(patch.bankAppName !== undefined ? { bankAppName: patch.bankAppName?.trim() || undefined } : {}),
            ...(patch.bankUserId !== undefined ? { bankUserId: patch.bankUserId?.trim() || undefined } : {}),
            ...(patch.cardEnabled !== undefined ? { cardEnabled: patch.cardEnabled } : {}),
            ...(patch.cardName !== undefined ? { cardName: patch.cardName?.trim() || undefined } : {}),
            ...(patch.cardCvv !== undefined ? { cardCvv: patch.cardCvv?.trim() || undefined } : {}),
            ...(patch.cardExpiryDate !== undefined
              ? { cardExpiryDate: patch.cardExpiryDate?.trim() || undefined }
              : {}),
            ...(patch.cardHolderName !== undefined
              ? { cardHolderName: patch.cardHolderName?.trim() || undefined }
              : {}),
            ...(patch.cardType !== undefined ? { cardType: patch.cardType } : {}),
            ...(patch.govIdType !== undefined ? { govIdType: patch.govIdType } : {}),
            ...(patch.govIdNumber !== undefined ? { govIdNumber: patch.govIdNumber?.trim() || undefined } : {}),
            ...(patch.govFrontImage !== undefined ? { govFrontImage: patch.govFrontImage } : {}),
            ...(patch.govBackImage !== undefined ? { govBackImage: patch.govBackImage } : {}),
            ...(patch.socialPlatform !== undefined ? { socialPlatform: patch.socialPlatform } : {}),
            ...(patch.phoneNumber !== undefined ? { phoneNumber: patch.phoneNumber?.trim() || undefined } : {}),
            ...(patch.googleRecoveryEmail !== undefined
              ? { googleRecoveryEmail: patch.googleRecoveryEmail?.trim() || undefined }
              : {}),
            ...(patch.googleRecoveryPhone !== undefined
              ? { googleRecoveryPhone: patch.googleRecoveryPhone?.trim() || undefined }
              : {}),
            ...(patch.googleBackupCodes !== undefined
              ? { googleBackupCodes: patch.googleBackupCodes?.trim() || undefined }
              : {}),
            updatedAt: now,
          };
          // If password changed, update passwordUpdatedAt too
          if (patch.password !== undefined && patch.password !== c.password) {
            next.passwordUpdatedAt = now;
          }
          return next;
        })
      ),
    }));
  };

  const markCredentialPasswordChanged: AppStore['markCredentialPasswordChanged'] = (id) => {
    const now = nowIso();
    setData((d) => ({
      ...d,
      credentials: sortByUpdatedDesc(
        d.credentials.map((c) => (c.id === id ? { ...c, passwordUpdatedAt: now, updatedAt: now } : c))
      ),
    }));
  };

  const deleteCredential: AppStore['deleteCredential'] = (id) => {
    setData((d) => ({ ...d, credentials: d.credentials.filter((c) => c.id !== id) }));
  };

  const updateSettings: AppStore['updateSettings'] = (patch) => {
    setData((d) => ({ ...d, settings: { ...d.settings, ...patch } }));
  };

  const getDuePasswordRotations: AppStore['getDuePasswordRotations'] = () => {
    const now = nowIso();
    const days = Math.max(1, Math.floor(data.settings.passwordRotationDays));
    return data.credentials.filter((c) => daysBetween(c.passwordUpdatedAt, now) >= days);
  };

  const resetAllData: AppStore['resetAllData'] = () => {
    setData(createDefaultData());
  };

  const store: AppStore = React.useMemo(
    () => ({
      data,
      addNote,
      updateNote,
      deleteNote,
      addCredential,
      updateCredential,
      markCredentialPasswordChanged,
      deleteCredential,
      updateSettings,
      resetAllData,
      getDuePasswordRotations,
    }),
    [data]
  );

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useAppStore() {
  const ctx = React.useContext(StoreContext);
  if (!ctx) throw new Error('useAppStore must be used within AppProvider');
  return ctx;
}

