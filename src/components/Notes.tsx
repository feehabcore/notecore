import * as React from 'react';
import { PlusCircle, Trash2, FileText, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppStore } from '../store';
import { formatRelativeTime, nowIso } from '../utils/time';

function toPlainText(htmlOrText: string) {
  if (!htmlOrText) return '';
  const div = document.createElement('div');
  div.innerHTML = htmlOrText;
  return div.textContent || div.innerText || '';
}

export default function Notes({
  onCreate,
  onOpen,
}: {
  onCreate: () => void;
  onOpen: (noteId: string) => void;
}) {
  const { data, deleteNote } = useAppStore();
  const [q, setQ] = React.useState('');

  const notes = React.useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return data.notes;
    return data.notes.filter((n) => {
      const hay = `${n.title}\n${toPlainText(n.content)}\n${n.tags.join(' ')}`.toLowerCase();
      return hay.includes(query);
    });
  }, [data.notes, q]);

  return (
    <div className="px-6 pt-6 pb-32 max-w-5xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <span className="font-sans text-[11px] uppercase tracking-widest text-secondary font-bold mb-2 block">
            Encrypted Notes (local)
          </span>
          <h2 className="font-headline text-4xl font-extrabold tracking-tighter text-primary">Notes</h2>
          <p className="text-secondary mt-2 max-w-xl">
            Write anything. If you store credentials, consider using the Credential vault so you get monthly reminders.
          </p>
        </div>
        <button
          onClick={onCreate}
          className="bg-vault-gradient text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 active:scale-95 transition-transform"
        >
          <PlusCircle size={20} />
          New note
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 p-4 mb-6 flex items-center gap-3">
        <Search size={18} className="text-secondary" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search notes…"
          className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline/60"
        />
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-16 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
          <div className="w-14 h-14 rounded-2xl bg-surface-container mx-auto flex items-center justify-center text-primary mb-4">
            <FileText size={26} />
          </div>
          <div className="font-headline font-bold text-primary text-xl">No notes yet</div>
          <p className="text-secondary mt-2">Create your first note to get started.</p>
          <button
            onClick={onCreate}
            className="mt-6 bg-primary text-white px-6 py-3 rounded-xl font-bold active:scale-95 transition-transform"
          >
            Create a note
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map((n) => (
            <motion.div
              key={n.id}
              whileHover={{ y: -3 }}
              className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-5 shadow-[0_4px_20px_rgba(24,36,66,0.02)]"
            >
              <button onClick={() => onOpen(n.id)} className="text-left w-full">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-headline font-bold text-primary text-lg leading-snug line-clamp-2">{n.title}</h3>
                    <p className="text-secondary text-sm mt-2 line-clamp-2 whitespace-pre-wrap">
                      {toPlainText(n.content) || '—'}
                    </p>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-outline">
                    {formatRelativeTime(n.updatedAt, nowIso())}
                  </span>
                </div>
                {n.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {n.tags.slice(0, 4).map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-medium"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </button>
              <div className="mt-4 pt-4 border-t border-outline-variant/10 flex justify-end">
                <button
                  onClick={() => deleteNote(n.id)}
                  className="text-error text-sm font-bold flex items-center gap-2 hover:opacity-80"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

