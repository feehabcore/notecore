import * as React from 'react';
import { useState } from 'react';
import { Screen } from './types';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Vaults from './components/Vaults';
import AddCredential from './components/AddCredential';
import Editor from './components/Editor';
import Notes from './components/Notes';
import Settings from './components/Settings';
import { useAppStore } from './store';
import { maybeNotifyPasswordRotations, maybeNotifySensitiveNotes } from './notifications';
import { noteLooksLikeCredential } from './utils/sensitive';
import { daysBetween, nowIso } from './utils/time';
import { verifyBiometricCredential } from './utils/biometric';
import ProcessingSpinner from './components/ProcessingSpinner';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [editorNoteId, setEditorNoteId] = useState<string | null>(null);
  const { addNote, getDuePasswordRotations, data } = useAppStore();
  const [isUnlocked, setIsUnlocked] = useState(!data.settings.requireBiometricOnOpen);
  const [showFeedbackPrompt, setShowFeedbackPrompt] = useState(false);
  const [isVerifyingUnlock, setIsVerifyingUnlock] = useState(false);

  React.useEffect(() => {
    if (!data.settings.requireBiometricOnOpen) {
      setIsUnlocked(true);
      return;
    }
    setIsUnlocked(false);
  }, [data.settings.requireBiometricOnOpen]);

  React.useEffect(() => {
    const total = data.notes.length + data.credentials.length;
    const dismissed = localStorage.getItem('notecore.feedbackPromptDismissed') === '1';
    if (!dismissed && total >= 2) setShowFeedbackPrompt(true);
  }, [data.notes.length, data.credentials.length]);

  React.useEffect(() => {
    const due = getDuePasswordRotations();
    maybeNotifyPasswordRotations({ due, enabled: data.settings.notifyWithBrowserNotifications });
    const now = nowIso();
    const rotationDays = Math.max(1, Math.floor(data.settings.passwordRotationDays));
    const sensitiveDue = data.notes
      .filter((n) => noteLooksLikeCredential(n) && daysBetween(n.updatedAt, now) >= rotationDays)
      .map((n) => ({ id: n.id, title: n.title }));
    maybeNotifySensitiveNotes({ dueNoteTitles: sensitiveDue, enabled: data.settings.notifyWithBrowserNotifications });
  }, [
    data.credentials.length,
    data.notes.length,
    data.settings.notifyWithBrowserNotifications,
    data.settings.passwordRotationDays,
  ]);

  const createNoteAndOpen = () => {
    const note = addNote({ title: 'Untitled note', content: '', tags: [] });
    setEditorNoteId(note.id);
    setCurrentScreen('editor');
  };

  const openNote = (noteId: string) => {
    setEditorNoteId(noteId);
    setCurrentScreen('editor');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentScreen} onCreateNote={createNoteAndOpen} onOpenNote={openNote} />;
      case 'vaults':
        return <Vaults />;
      case 'add-credential':
        return <AddCredential onBack={() => setCurrentScreen('dashboard')} />;
      case 'editor':
        return (
          <EditorGate
            noteId={editorNoteId}
            onReady={(id) => setEditorNoteId(id)}
            addNote={addNote}
            onBack={() => setCurrentScreen('notes')}
          />
        );
      case 'notes':
        return <Notes onCreate={createNoteAndOpen} onOpen={openNote} />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onNavigate={setCurrentScreen} onCreateNote={createNoteAndOpen} onOpenNote={openNote} />;
    }
  };

  if (!isUnlocked && data.settings.requireBiometricOnOpen) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl bg-surface-container-lowest border border-outline-variant/15 p-8 text-center">
          <h2 className="font-headline text-3xl font-bold text-primary">Unlock Notecore</h2>
          <p className="text-secondary mt-2">Please verify with fingerprint / face to enter.</p>
          <button
            onClick={async () => {
              const id = data.settings.biometricCredentialId;
              if (!id) return;
              setIsVerifyingUnlock(true);
              const ok = await verifyBiometricCredential(id);
              if (ok) setIsUnlocked(true);
              else alert('Verification failed.');
              setIsVerifyingUnlock(false);
            }}
            disabled={isVerifyingUnlock}
            className="mt-6 w-full bg-primary text-white py-3 rounded-xl font-bold disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isVerifyingUnlock ? (
              <>
                <ProcessingSpinner size={18} color="#ffffff" />
                Verifying...
              </>
            ) : (
              'Verify biometric'
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Layout
        currentScreen={currentScreen}
        onScreenChange={setCurrentScreen}
        onCreateNote={createNoteAndOpen}
        onOpenNote={openNote}
      >
        {renderScreen()}
      </Layout>

      {showFeedbackPrompt && (
        <div className="fixed inset-0 z-[80] bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-surface-container-lowest border border-outline-variant/10 p-6">
            <h3 className="font-headline text-2xl font-bold text-primary">Are you satisfied with Notecore?</h3>
            <p className="text-secondary mt-2">
              If you like the app, please give a star or follow on GitHub.
            </p>
            <div className="mt-4">
              <a
                href="https://github.com/feehabcore"
                target="_blank"
                rel="noreferrer"
                className="font-bold text-primary underline"
              >
                https://github.com/feehabcore
              </a>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => {
                  localStorage.setItem('notecore.feedbackPromptDismissed', '1');
                  setShowFeedbackPrompt(false);
                }}
                className="px-4 py-2 rounded-xl bg-surface-container text-primary font-bold"
              >
                Maybe later
              </button>
              <button
                onClick={() => {
                  window.open('https://github.com/feehabcore', '_blank', 'noopener,noreferrer');
                  localStorage.setItem('notecore.feedbackPromptDismissed', '1');
                  setShowFeedbackPrompt(false);
                }}
                className="px-4 py-2 rounded-xl bg-primary text-white font-bold"
              >
                Open GitHub
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function EditorGate({
  noteId,
  onReady,
  addNote,
  onBack,
}: {
  noteId: string | null;
  onReady: (id: string) => void;
  addNote: (input?: { title?: string; content?: string; tags?: string[] }) => { id: string };
  onBack: () => void;
}) {
  React.useEffect(() => {
    if (noteId) return;
    const note = addNote({ title: 'Untitled note', content: '', tags: [] });
    onReady(note.id);
  }, [noteId, addNote, onReady]);

  if (!noteId) return null;
  return <Editor noteId={noteId} onBack={onBack} />;
}
