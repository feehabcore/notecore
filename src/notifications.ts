import type { Credential } from './types';
import { nowIso, daysBetween } from './utils/time';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

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
  void maybeNotifyPasswordRotationsAsync(opts);
}

export async function requestAppNotificationPermission() {
  if (Capacitor.isNativePlatform()) {
    const res = await LocalNotifications.requestPermissions();
    return res.display === 'granted';
  }
  if (typeof Notification === 'undefined') return false;
  if (Notification.permission === 'granted') return true;
  const perm = await Notification.requestPermission();
  return perm === 'granted';
}

async function canSendAppNotifications() {
  if (Capacitor.isNativePlatform()) {
    const res = await LocalNotifications.checkPermissions();
    return res.display === 'granted';
  }
  if (typeof Notification === 'undefined') return false;
  return Notification.permission === 'granted';
}

async function sendAppNotification(title: string, body: string) {
  if (Capacitor.isNativePlatform()) {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: Math.floor(Date.now() % 2147483000),
          title,
          body,
          schedule: { at: new Date(Date.now() + 1200) },
        },
      ],
    });
    return;
  }
  new Notification(title, { body });
}

async function maybeNotifyPasswordRotationsAsync(opts: {
  due: Credential[];
  enabled: boolean;
}) {
  if (!opts.enabled) return;
  if (!(await canSendAppNotifications())) return;
  if (opts.due.length === 0) return;

  const now = nowIso();
  const notified = loadNotified();

  for (const cred of opts.due) {
    const last = notified[cred.id];
    // At most once per day per credential.
    if (last && daysBetween(last, now) < 1) continue;

    try {
      await sendAppNotification(
        'Time to change a password',
        `${cred.label} hasn’t been changed in a while. Rotating passwords monthly improves privacy.`
      );
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
  void maybeNotifySensitiveNotesAsync(opts);
}

async function maybeNotifySensitiveNotesAsync(opts: {
  dueNoteTitles: { id: string; title: string }[];
  enabled: boolean;
}) {
  if (!opts.enabled) return;
  if (!(await canSendAppNotifications())) return;
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
      await sendAppNotification(
        'Review saved credentials',
        `“${n.title || 'Untitled note'}” looks like it may contain a password. Consider rotating it monthly.`
      );
      notified[n.id] = now;
    } catch {
      // ignore
    }
  }

  localStorage.setItem(SENSITIVE_NOTES_KEY, JSON.stringify(notified));
}

