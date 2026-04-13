import * as React from 'react';
import { Search, LayoutDashboard, Lock, FileText, Settings, ShieldCheck, X, KeyRound } from 'lucide-react';
import { motion } from 'motion/react';
import { Screen } from '../types';
import { useAppStore } from '../store';

function toPlainText(htmlOrText: string) {
  if (!htmlOrText) return '';
  const div = document.createElement('div');
  div.innerHTML = htmlOrText;
  return div.textContent || div.innerText || '';
}

interface LayoutProps {
  children: React.ReactNode;
  currentScreen: Screen;
  onScreenChange: (screen: Screen) => void;
  onCreateNote: () => void;
  onOpenNote: (noteId: string) => void;
}

export default function Layout({ children, currentScreen, onScreenChange, onCreateNote, onOpenNote }: LayoutProps) {
  const { data } = useAppStore();
  const isEditorOrAdd = currentScreen === 'editor' || currentScreen === 'add-credential';
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [q, setQ] = React.useState('');

  const searchResults = React.useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return { notes: [], creds: [] };
    const notes = data.notes
      .filter((n) => `${n.title}\n${toPlainText(n.content)}\n${n.tags.join(' ')}`.toLowerCase().includes(query))
      .slice(0, 6);
    const creds = data.credentials
      .filter((c) => `${c.label}\n${c.username ?? ''}\n${c.email ?? ''}\n${c.website ?? ''}`.toLowerCase().includes(query))
      .slice(0, 6);
    return { notes, creds };
  }, [data.credentials, data.notes, q]);

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="font-headline font-extrabold text-primary tracking-tighter text-2xl">Notecore</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setSearchOpen(true);
                setQ('');
              }}
              className="text-primary hover:opacity-70 transition-opacity p-2 rounded-full hover:bg-surface-container"
              aria-label="Search"
            >
              <Search size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto">
        {children}
      </main>

      {/* Bottom Nav */}
      {!isEditorOrAdd && (
        <nav className="fixed bottom-0 left-0 w-full z-50 px-4 pt-2 pb-6 bg-surface/60 backdrop-blur-xl border-t border-outline-variant/15 shadow-[0_-10px_30px_rgba(24,36,66,0.04)] rounded-t-2xl">
          <div className="max-w-lg mx-auto flex justify-around items-center">
            <NavItem 
              active={currentScreen === 'dashboard'} 
              onClick={() => onScreenChange('dashboard')}
              icon={<LayoutDashboard size={20} />}
              label="Dashboard"
            />
            <NavItem 
              active={currentScreen === 'vaults'} 
              onClick={() => onScreenChange('vaults')}
              icon={<Lock size={20} />}
              label="Vaults"
            />
            <NavItem 
              active={currentScreen === 'notes'} 
              onClick={() => onScreenChange('notes')}
              icon={<FileText size={20} />}
              label="Notes"
            />
            <NavItem 
              active={currentScreen === 'settings'} 
              onClick={() => onScreenChange('settings')}
              icon={<Settings size={20} />}
              label="Settings"
            />
          </div>
        </nav>
      )}

      {/* Contextual FAB (Dashboard only) */}
      {currentScreen === 'dashboard' && (
        <motion.button 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed right-6 bottom-24 w-14 h-14 bg-vault-gradient text-white rounded-full flex items-center justify-center shadow-xl z-40"
          onClick={onCreateNote}
          aria-label="Create new note"
        >
          <ShieldCheck size={28} />
        </motion.button>
      )}

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-start justify-center p-4 pt-24" onMouseDown={() => setSearchOpen(false)}>
          <div
            className="w-full max-w-2xl bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-outline-variant/10 flex items-center gap-3">
              <Search size={18} className="text-secondary" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search notes and credentials…"
                className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline/60"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="p-2 rounded-xl hover:bg-surface-container text-secondary"
                aria-label="Close search"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-5">
              <div>
                <div className="text-[11px] uppercase tracking-widest font-bold text-secondary mb-2">Notes</div>
                {searchResults.notes.length === 0 ? (
                  <div className="text-secondary text-sm">No matches.</div>
                ) : (
                  <div className="space-y-2">
                    {searchResults.notes.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => {
                          setSearchOpen(false);
                          onOpenNote(n.id);
                        }}
                        className="w-full text-left px-4 py-3 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-colors"
                      >
                        <div className="font-bold text-primary">{n.title}</div>
                          <div className="text-secondary text-sm line-clamp-1">{toPlainText(n.content) || '—'}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="text-[11px] uppercase tracking-widest font-bold text-secondary mb-2">Credentials</div>
                {searchResults.creds.length === 0 ? (
                  <div className="text-secondary text-sm">No matches.</div>
                ) : (
                  <div className="space-y-2">
                    {searchResults.creds.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setSearchOpen(false);
                          onScreenChange('vaults');
                        }}
                        className="w-full text-left px-4 py-3 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-colors flex items-center gap-3"
                      >
                        <KeyRound size={18} className="text-primary" />
                        <div className="min-w-0">
                          <div className="font-bold text-primary truncate">{c.label}</div>
                          <div className="text-secondary text-sm truncate">{c.category}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center px-4 py-1 rounded-xl transition-all tap-highlight-transparent ${
        active 
          ? 'text-primary bg-surface-container-highest' 
          : 'text-secondary hover:text-primary'
      }`}
    >
      {icon}
      <span className="font-sans text-[11px] font-medium uppercase tracking-wider mt-1">{label}</span>
    </button>
  );
}
