import * as React from 'react';
import { ArrowLeft, Cloud, Check, Lock, Trash2, Tag, CalendarDays, Bold, Italic, Underline, ImagePlus, Palette } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppStore } from '../store';
import { nowIso } from '../utils/time';

interface EditorProps {
  onBack: () => void;
  noteId: string;
}

export default function Editor({ onBack, noteId }: EditorProps) {
  const { data, updateNote, deleteNote } = useAppStore();
  const note = data.notes.find((n) => n.id === noteId);

  const [title, setTitle] = React.useState(note?.title ?? '');
  const [content, setContent] = React.useState(note?.content ?? '');
  const [tagsText, setTagsText] = React.useState((note?.tags ?? []).join(', '));
  const [savedTick, setSavedTick] = React.useState(0);
  const editorRef = React.useRef<HTMLDivElement | null>(null);
  const imageInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    setTitle(note?.title ?? '');
    setContent(note?.content ?? '');
    setTagsText((note?.tags ?? []).join(', '));
  }, [noteId]);

  React.useEffect(() => {
    if (!editorRef.current) return;
    const html = note?.content?.trim() ? note.content : '<p><br/></p>';
    editorRef.current.innerHTML = html;
  }, [note?.id]);

  React.useEffect(() => {
    const handle = window.setTimeout(() => {
      if (!note) return;
      const tags = tagsText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      updateNote(noteId, { title: title.trim() || 'Untitled note', content, tags });
      setSavedTick((t) => t + 1);
    }, 400);
    return () => window.clearTimeout(handle);
  }, [noteId, title, content, tagsText, updateNote]);

  if (!note) {
    return (
      <div className="px-6 py-20 text-center">
        <h2 className="text-2xl font-headline font-bold text-primary mb-4">Note not found</h2>
        <p className="text-secondary">This note may have been deleted.</p>
        <button onClick={onBack} className="mt-6 bg-primary text-white px-6 py-3 rounded-xl font-bold">
          Back
        </button>
      </div>
    );
  }

  const applyCommand = (cmd: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
    const html = editorRef.current?.innerHTML ?? '';
    setContent(html);
  };

  const onEditorInput = () => {
    setContent(editorRef.current?.innerHTML ?? '');
  };

  const onPickImage = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const data = String(reader.result ?? '');
      if (!data) return;
      applyCommand('insertImage', data);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-surface min-h-screen">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="active:scale-95 transition-transform hover:opacity-80"
            >
              <ArrowLeft size={24} className="text-secondary" />
            </button>
            <h1 className="font-headline font-extrabold text-primary tracking-tighter text-2xl">Notecore</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-tertiary-container text-tertiary-fixed px-4 py-2 rounded-xl active:scale-95 transition-transform font-medium">
              <div className="relative">
                <Cloud size={20} className="fill-current" />
                <Check size={10} className="absolute inset-0 m-auto text-tertiary-container font-bold" />
              </div>
              <span className="hidden sm:inline">Saved</span>
            </button>
            <button
              onClick={() => {
                deleteNote(noteId);
                onBack();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container text-error font-bold active:scale-95 transition-transform"
              title="Delete note"
            >
              <Trash2 size={18} />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 md:py-16">
        <div className="flex flex-col gap-10">
          {/* Editor Header & Metadata */}
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-tertiary-fixed-dim/20 text-on-tertiary-container text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Lock size={14} className="fill-current" /> Secure
              </span>
              <div className="flex items-center gap-2 text-secondary text-sm">
                <CalendarDays size={16} />
                <span>Updated {new Date(note.updatedAt).toLocaleString()}</span>
              </div>
            </div>

            <input 
              className="w-full bg-transparent border-none focus:ring-0 p-0 text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-primary placeholder:text-surface-dim" 
              placeholder="Title your thought..." 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <div className="bg-surface-container-lowest/80 backdrop-blur-xl rounded-2xl border border-outline-variant/10 p-4 flex items-center gap-3">
              <Tag size={18} className="text-secondary" />
              <input
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                placeholder="Tags (comma separated) e.g. journal, work"
                className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline/60"
              />
              <span className="text-[10px] uppercase tracking-widest font-bold text-outline">
                {savedTick > 0 ? 'saved' : 'editing'}
              </span>
            </div>
          </div>

          {/* Content Area */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-6 shadow-[0_20px_40px_rgba(24,36,66,0.04)]">
            <div className="mb-4 flex flex-wrap gap-2 items-center">
              <button onClick={() => applyCommand('bold')} className="p-2 rounded-lg bg-surface-container text-primary hover:opacity-90" title="Bold">
                <Bold size={16} />
              </button>
              <button onClick={() => applyCommand('italic')} className="p-2 rounded-lg bg-surface-container text-primary hover:opacity-90" title="Italic">
                <Italic size={16} />
              </button>
              <button onClick={() => applyCommand('underline')} className="p-2 rounded-lg bg-surface-container text-primary hover:opacity-90" title="Underline">
                <Underline size={16} />
              </button>
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container text-primary cursor-pointer" title="Text color">
                <Palette size={16} />
                <input
                  type="color"
                  onChange={(e) => applyCommand('foreColor', e.target.value)}
                  className="w-6 h-6 border-none bg-transparent p-0"
                />
              </label>
              <button
                onClick={() => imageInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container text-primary hover:opacity-90"
                title="Insert image"
              >
                <ImagePlus size={16} />
                Image
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => void onPickImage(e.target.files)}
              />
            </div>

            <div
              ref={editorRef}
              className="rich-note-editor w-full min-h-[520px] bg-transparent border-none focus:ring-0 p-0 text-lg md:text-xl text-on-surface-variant leading-relaxed font-sans"
              contentEditable
              suppressContentEditableWarning
              onInput={onEditorInput}
              style={{ outline: 'none' }}
            />
            <div className="mt-6 pt-4 border-t border-outline-variant/10 flex items-center justify-between text-[11px] uppercase tracking-widest font-bold text-outline">
              <span>created {new Date(note.createdAt).toLocaleDateString()}</span>
              <span>{new Date(nowIso()).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
