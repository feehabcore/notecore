import type { Credential } from './types';
import { nowIso, daysBetween } from './utils/time';

const NOTIFIED_KEY = 'notecore.passwordRotationNotified';

type NotifiedMap = Record<string, string>; // credId -> ISO last notified

function loadNotified(): NotifiedMap {
  try {
    const raw = localStorage.getItem(NOTIFIED_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as NotifiedMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveNotified(map: NotifiedMap) {
  localStorage.setItem(NOTIFIED_KEY, JSON.stringify(map));
}

export function maybeNotifyPasswordRotations(opts: {
  due: Credential[];
  enabled: boolean;
}) {
  if (!opts.enabled) return;
  if (typeof Notification === 'undefined') return;
  if (Notification.permission !== 'granted') return;
  if (opts.due.length === 0) return;

  const now = nowIso();
  const notified = loadNotified();

  for (const cred of opts.due) {
    const last = notified[cred.id];
    // At most once per day per credential.
    if (last && daysBetween(last, now) < 1) continue;

    try {
      new Notification('Time to change a password', {
        body: `${cred.label} hasn’t been changed in a while. Rotating passwords monthly improves privacy.`,
      });
      notified[cred.id] = now;
    } catch {
      // Ignore notification failures
    }
  }

  saveNotified(notified);
}

const SENSITIVE_NOTES_KEY = 'notecore.sensitiveNotesNotified';

export function maybeNotifySensitiveNotes(opts: {
  dueNoteTitles: { id: string; title: string }[];
  enabled: boolean;
}) {
  if (!opts.enabled) return;
  if (typeof Notification === 'undefined') return;
  if (Notification.permission !== 'granted') return;
  if (opts.dueNoteTitles.length === 0) return;

  const now = nowIso();
  const notified = (() => {
    try {
      const raw = localStorage.getItem(SENSITIVE_NOTES_KEY);
      return raw ? (JSON.parse(raw) as Record<string, string>) : {};
    } catch {
      return {};
    }
  })();

  for (const n of opts.dueNoteTitles) {
    const last = notified[n.id];
    if (last && daysBetween(last, now) < 1) continue;
    try {
      new Notification('Review saved credentials', {
        body: `“${n.title || 'Untitled note'}” looks like it may contain a password. Consider rotating it monthly.`,
      });
      notified[n.id] = now;
    } catch {
      // ignore
    }
  }

  localStorage.setItem(SENSITIVE_NOTES_KEY, JSON.stringify(notified));
}

