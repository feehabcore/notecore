import * as React from 'react';
import { Bell, Shield, RotateCw, FileDown, FileText, KeyRound, Fingerprint, Trash2 } from 'lucide-react';
import { useAppStore } from '../store';
import { downloadCredentialsPdf, downloadNotesPdf } from '../utils/pdfExport';
import {
  isBiometricAvailable,
  registerBiometricCredential,
  verifyBiometricCredential,
} from '../utils/biometric';
import ProcessingSpinner from './ProcessingSpinner';
import { requestAppNotificationPermission } from '../notifications';
import AppToast, { useToastMessage } from './AppToast';

export default function Settings() {
  const { data, updateSettings, resetAllData } = useAppStore();
  const [days, setDays] = React.useState(String(data.settings.passwordRotationDays));
  const [exportType, setExportType] = React.useState<'notes' | 'credentials' | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [processing, setProcessing] = React.useState<
    null | 'save-days' | 'biometric' | 'notify' | 'export-selected' | 'export-all' | 'reset'
  >(null);
  const { toast, showToast } = useToastMessage();

  React.useEffect(() => {
    setDays(String(data.settings.passwordRotationDays));
  }, [data.settings.passwordRotationDays]);

  React.useEffect(() => {
    setSelectedIds([]);
  }, [exportType]);

  const applyDays = async () => {
    setProcessing('save-days');
    const n = Math.max(1, Math.min(365, Math.floor(Number(days) || 30)));
    updateSettings({ passwordRotationDays: n });
    setDays(String(n));
    await new Promise((resolve) => setTimeout(resolve, 250));
    setProcessing(null);
  };

  const toggleNotifications = async () => {
    setProcessing('notify');
    const next = !data.settings.notifyWithBrowserNotifications;
    if (next) {
      try {
        const ok = await requestAppNotificationPermission();
        if (!ok) {
          updateSettings({ notifyWithBrowserNotifications: false });
          setProcessing(null);
          return;
        }
      } catch {
        updateSettings({ notifyWithBrowserNotifications: false });
        setProcessing(null);
        return;
      }
    }
    updateSettings({ notifyWithBrowserNotifications: next });
    await new Promise((resolve) => setTimeout(resolve, 250));
    setProcessing(null);
  };

  const isNotes = exportType === 'notes';
  const exportItems = isNotes ? data.notes : exportType === 'credentials' ? data.credentials : [];
  const allSelected = exportItems.length > 0 && selectedIds.length === exportItems.length;

  const toggleId = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const selectAll = () => {
    setSelectedIds(exportItems.map((x) => x.id));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const exportSelected = async () => {
    if (!exportType || selectedIds.length === 0) return;
    setProcessing('export-selected');
    try {
      if (exportType === 'notes') {
        const notes = data.notes.filter((n) => selectedIds.includes(n.id));
        await downloadNotesPdf(notes);
        showToast('PDF exported. Choose where to save from share sheet.', 'success');
        setProcessing(null);
        return;
      }
      const creds = data.credentials.filter((c) => selectedIds.includes(c.id));
      await downloadCredentialsPdf(creds);
      showToast('PDF exported. Choose where to save from share sheet.', 'success');
    } catch {
      showToast('Export failed. Please try again.', 'error');
    } finally {
      setProcessing(null);
    }
  };

  const exportAll = async () => {
    if (!exportType) return;
    setProcessing('export-all');
    try {
      if (exportType === 'notes') {
        if (data.notes.length === 0) {
          setProcessing(null);
          return;
        }
        await downloadNotesPdf(data.notes);
        showToast('PDF exported. Choose where to save from share sheet.', 'success');
        setProcessing(null);
        return;
      }
      if (data.credentials.length === 0) {
        setProcessing(null);
        return;
      }
      await downloadCredentialsPdf(data.credentials);
      showToast('PDF exported. Choose where to save from share sheet.', 'success');
    } catch {
      showToast('Export failed. Please try again.', 'error');
    } finally {
      setProcessing(null);
    }
  };

  const toggleBiometricOnOpen = async () => {
    setProcessing('biometric');
    const next = !data.settings.requireBiometricOnOpen;
    if (!next) {
      updateSettings({ requireBiometricOnOpen: false });
      setProcessing(null);
      return;
    }
    if (!isBiometricAvailable()) {
      alert('Biometric/Passkey is not supported on this device/browser.');
      setProcessing(null);
      return;
    }

    let credentialId = data.settings.biometricCredentialId;
    if (!credentialId) {
      credentialId = await registerBiometricCredential();
      if (!credentialId) {
        alert('Biometric setup failed or was cancelled.');
        setProcessing(null);
        return;
      }
    }
    updateSettings({ requireBiometricOnOpen: true, biometricCredentialId: credentialId });
    await new Promise((resolve) => setTimeout(resolve, 250));
    setProcessing(null);
  };

  const resetWithBiometric = async () => {
    setProcessing('reset');
    if (!confirm('This will permanently delete all notes, credentials, documents, and settings. Continue?')) {
      setProcessing(null);
      return;
    }

    const credentialId = data.settings.biometricCredentialId;
    if (credentialId) {
      const ok = await verifyBiometricCredential(credentialId);
      if (!ok) {
        alert('Biometric verification failed. Reset cancelled.');
        setProcessing(null);
        return;
      }
    } else {
      if (!confirm('No biometric profile is configured. Continue reset without biometric verification?')) {
        setProcessing(null);
        return;
      }
    }

    resetAllData();
    localStorage.removeItem('notecore.passwordRotationNotified');
    localStorage.removeItem('notecore.sensitiveNotesNotified');
    localStorage.removeItem('notecore.feedbackPromptDismissed');
    alert('All app data has been reset.');
    setProcessing(null);
  };

  return (
    <div className="px-6 pt-6 pb-32 max-w-4xl mx-auto">
      {toast && <AppToast message={toast.message} tone={toast.tone} />}
      <span className="font-sans text-[11px] uppercase tracking-widest text-secondary font-bold mb-2 block">
        Privacy controls
      </span>
      <h2 className="font-headline text-4xl font-extrabold tracking-tighter text-primary">Settings</h2>
      <p className="text-secondary mt-2 max-w-2xl">
        Notecore stores notes and credentials in your browser (local storage). Password-rotation reminders help you keep
        credentials fresh.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-4">
        <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary">
            <RotateCw size={22} />
          </div>
          <div className="flex-1">
            <div className="font-headline font-bold text-primary text-lg">Password change reminder</div>
            <div className="text-secondary text-sm mt-1">
              Remind you to change saved passwords after this many days.
            </div>
            <div className="mt-4 flex items-center gap-3">
              <input
                value={days}
                onChange={(e) => setDays(e.target.value)}
                onBlur={applyDays}
                className="w-28 px-4 py-3 rounded-xl bg-surface-container-high border-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary/20"
                inputMode="numeric"
              />
              <span className="text-secondary font-medium">days</span>
              <button
                onClick={applyDays}
                disabled={processing === 'save-days'}
                className="ml-auto px-5 py-3 rounded-xl bg-primary text-white font-bold active:scale-95 transition-transform"
              >
                {processing === 'save-days' ? <ProcessingSpinner size={16} color="#ffffff" /> : 'Save'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary">
            <Fingerprint size={22} />
          </div>
          <div className="flex-1">
            <div className="font-headline font-bold text-primary text-lg">Biometric lock (fingerprint / face)</div>
            <div className="text-secondary text-sm mt-1">
              Enable passkey/biometric check every time the app opens. Uses your device security (fingerprint, face, or screen lock).
            </div>
          </div>
          <button
            onClick={() => void toggleBiometricOnOpen()}
            disabled={processing === 'biometric'}
            className={`px-4 py-2 rounded-xl font-bold border transition-colors ${
              data.settings.requireBiometricOnOpen
                ? 'bg-tertiary-container text-tertiary-fixed border-transparent'
                : 'bg-surface-container text-primary border-outline-variant/20'
            }`}
          >
            {processing === 'biometric' ? (
              <ProcessingSpinner size={16} color={data.settings.requireBiometricOnOpen ? '#89f5e7' : '#182442'} />
            ) : data.settings.requireBiometricOnOpen ? (
              'On'
            ) : (
              'Off'
            )}
          </button>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary">
            <Bell size={22} />
          </div>
          <div className="flex-1">
            <div className="font-headline font-bold text-primary text-lg">App notifications</div>
            <div className="text-secondary text-sm mt-1">
              Optional. When enabled and allowed, Notecore can send app notifications when a saved credential is due
              for rotation.
            </div>
          </div>
          <button
            onClick={toggleNotifications}
            disabled={processing === 'notify'}
            className={`px-4 py-2 rounded-xl font-bold border transition-colors ${
              data.settings.notifyWithBrowserNotifications
                ? 'bg-tertiary-container text-tertiary-fixed border-transparent'
                : 'bg-surface-container text-primary border-outline-variant/20'
            }`}
          >
            {processing === 'notify' ? (
              <ProcessingSpinner size={16} color={data.settings.notifyWithBrowserNotifications ? '#89f5e7' : '#182442'} />
            ) : data.settings.notifyWithBrowserNotifications ? (
              'On'
            ) : (
              'Off'
            )}
          </button>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6 space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary">
              <FileDown size={22} />
            </div>
            <div className="flex-1">
              <div className="font-headline font-bold text-primary text-lg">Download PDF</div>
              <div className="text-secondary text-sm mt-1">
                Issued by Notecore. Export selected notes or credentials, or export all in one decorated PDF file.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => setExportType('notes')}
              className={`p-4 rounded-xl border text-left transition-colors ${
                isNotes
                  ? 'bg-tertiary-container text-tertiary-fixed border-transparent'
                  : 'bg-surface-container text-primary border-outline-variant/20'
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                <FileText size={18} />
                Print Notes
              </div>
              <div className="text-xs mt-1 opacity-80">{data.notes.length} saved</div>
            </button>

            <button
              onClick={() => setExportType('credentials')}
              className={`p-4 rounded-xl border text-left transition-colors ${
                exportType === 'credentials'
                  ? 'bg-tertiary-container text-tertiary-fixed border-transparent'
                  : 'bg-surface-container text-primary border-outline-variant/20'
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                <KeyRound size={18} />
                Print Credentials
              </div>
              <div className="text-xs mt-1 opacity-80">{data.credentials.length} saved</div>
            </button>
          </div>

          {exportType && (
            <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-low p-4">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="font-bold text-primary">
                  Select {isNotes ? 'note(s)' : 'credential(s)'} to include
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={allSelected ? clearSelection : selectAll}
                    className="px-3 py-1.5 rounded-lg bg-surface-container-high text-primary text-sm font-bold"
                  >
                    {allSelected ? 'Clear all' : 'Select all'}
                  </button>
                </div>
              </div>

              <div className="max-h-52 overflow-auto space-y-2 pr-1">
                {exportItems.length === 0 ? (
                  <div className="text-sm text-secondary">No {isNotes ? 'notes' : 'credentials'} saved yet.</div>
                ) : (
                  exportItems.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/10 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleId(item.id)}
                        className="mt-1"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-primary truncate">
                          {'title' in item ? item.title || 'Untitled note' : item.label || 'Untitled credential'}
                        </div>
                        <div className="text-xs text-secondary truncate">
                          {'content' in item
                            ? item.content || 'No content'
                            : `${item.category}${item.bankName ? ` • ${item.bankName}` : ''}`}
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => void exportSelected()}
                  disabled={selectedIds.length === 0 || processing === 'export-selected'}
                  className="px-4 py-2 rounded-xl bg-primary text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing === 'export-selected' ? <ProcessingSpinner size={16} color="#ffffff" /> : 'Download selected PDF'}
                </button>
                <button
                  onClick={() => void exportAll()}
                  disabled={exportItems.length === 0 || processing === 'export-all'}
                  className="px-4 py-2 rounded-xl bg-surface-container-high text-primary font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing === 'export-all' ? <ProcessingSpinner size={16} color="#182442" /> : 'Download all PDF'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-tertiary-container text-on-tertiary-container rounded-2xl p-6 flex items-start gap-4">
          <Shield size={26} className="text-tertiary-fixed fill-current mt-1" />
          <div>
            <div className="font-headline font-bold text-xl">Security note</div>
            <p className="text-sm opacity-85 mt-1 leading-relaxed">
              This project is local-first. If you want real encryption-at-rest and cross-device sync, we can add a master
              password and WebCrypto-based encryption next.
            </p>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-error/20 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <div className="font-headline font-bold text-primary text-lg">Reset all data</div>
            <p className="text-secondary text-sm mt-1">
              Delete all notes, credentials, ID photos, and settings. Biometric verification is requested if configured.
            </p>
          </div>
          <button
            onClick={() => void resetWithBiometric()}
            disabled={processing === 'reset'}
            className="px-5 py-3 rounded-xl bg-error text-white font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            {processing === 'reset' ? <ProcessingSpinner size={16} color="#ffffff" /> : <Trash2 size={18} />}
            {processing === 'reset' ? 'Resetting...' : 'Reset everything'}
          </button>
        </div>

        <div className="text-center pt-2">
          <span className="text-secondary text-sm">
            Developed by Yeomun Hasan -{' '}
            <a
              href="https://feehab.dev"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-primary hover:underline"
            >
              feehab.dev
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}

