import * as React from 'react';
import { Share2, Globe, Landmark, AppWindow, ChevronRight, ShieldCheck, KeyRound, Trash2, CheckCircle2, AlertTriangle, IdCard, Download, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppStore } from '../store';
import { formatRelativeTime, nowIso, daysBetween } from '../utils/time';
import type { VaultCategory } from '../types';
import ProcessingSpinner from './ProcessingSpinner';

export default function Vaults() {
  const { data, deleteCredential, markCredentialPasswordChanged } = useAppStore();
  const [category, setCategory] = React.useState<VaultCategory | 'All'>('All');
  const credentialsSectionRef = React.useRef<HTMLElement | null>(null);
  const [processingId, setProcessingId] = React.useState<string | null>(null);
  const [processingAction, setProcessingAction] = React.useState<'rotate' | 'delete' | 'front' | 'back' | null>(null);
  const [visiblePasswords, setVisiblePasswords] = React.useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const categories: VaultCategory[] = React.useMemo(
    () => ['Social Media', 'Google Account', 'Websites', 'Apps', 'Banking', 'Government IDs', 'Work / Professional', 'Entertainment', 'Utility', 'Other'],
    []
  );

  const creds = React.useMemo(() => {
    if (category === 'All') return data.credentials;
    return data.credentials.filter((c) => c.category === category);
  }, [data.credentials, category]);

  const now = nowIso();
  const rotationDays = Math.max(1, Math.floor(data.settings.passwordRotationDays));
  const dueCount = data.credentials.filter((c) => daysBetween(c.passwordUpdatedAt, now) >= rotationDays).length;

  const downloadImage = (dataUrl: string, fileName: string) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const withProcessing = async (id: string, action: 'rotate' | 'delete' | 'front' | 'back', fn: () => void) => {
    setProcessingId(id);
    setProcessingAction(action);
    await new Promise((resolve) => setTimeout(resolve, 250));
    fn();
    setProcessingId(null);
    setProcessingAction(null);
  };

  const pickCategory = (next: VaultCategory) => {
    setCategory(next);
    // On mobile, immediately jump to filtered list so the click feels responsive.
    window.setTimeout(() => {
      credentialsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyText = async (key: string, value?: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 1200);
    } catch {
      // no-op
    }
  };

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto pb-32">
      {/* Editorial Header Section */}
      <section className="mb-10">
        <span className="font-sans text-[0.6875rem] uppercase tracking-[0.2em] text-secondary font-bold mb-2 block">Secure Storage</span>
        <h1 className="font-headline text-5xl font-extrabold text-primary tracking-tight leading-none mb-4">Vaults</h1>
        <p className="text-secondary max-w-md text-lg leading-relaxed">
          Your credentials, organized by category. Items that are older than {rotationDays} days will be flagged for rotation.
        </p>
      </section>

      {/* Stats Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="md:col-span-2 p-8 rounded-2xl bg-primary-container text-on-primary-container flex flex-col justify-between min-h-[180px] shadow-[0_20px_40px_rgba(24,36,66,0.06)] relative overflow-hidden"
        >
          <div className="relative z-10">
            <span className="text-sm font-medium opacity-80 mb-1 block">Total Items Protected</span>
            <div className="text-5xl font-headline font-extrabold text-white tracking-tighter">{data.credentials.length}</div>
          </div>
          <div className="flex items-center gap-2 relative z-10">
            <ShieldCheck size={20} className="text-tertiary-fixed fill-current" />
            <span className="text-xs font-bold tracking-widest uppercase text-tertiary-fixed">
              {dueCount > 0 ? `${dueCount} password${dueCount === 1 ? '' : 's'} due for rotation` : 'All passwords are fresh'}
            </span>
          </div>
          {/* Abstract Gradient Decor */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-tertiary-container to-transparent opacity-40 -mr-16 -mt-16 rounded-full blur-3xl"></div>
        </motion.div>

        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="p-8 rounded-2xl bg-surface-container-lowest flex flex-col justify-between shadow-[0_20px_40px_rgba(24,36,66,0.04)]"
        >
          <span className="text-sm font-medium text-secondary">Categories</span>
          <div className="text-4xl font-headline font-extrabold text-primary tracking-tighter">{categories.length}</div>
          <div className="text-xs font-bold uppercase tracking-widest text-secondary">
            Stored locally in your browser
          </div>
        </motion.div>
      </section>

      {/* Vault List */}
      <section className="space-y-3">
        <VaultItem
          icon={<Share2 size={28} />}
          title="Social Media"
          description="Passwords, recovery keys, profiles"
          count={data.credentials.filter((c) => c.category === 'Social Media').length}
          onClick={() => pickCategory('Social Media')}
        />
        <VaultItem
          icon={<Globe size={28} />}
          title="Google Account"
          description="Gmail logins and recovery data"
          count={data.credentials.filter((c) => c.category === 'Google Account').length}
          onClick={() => pickCategory('Google Account')}
        />
        <VaultItem
          icon={<Globe size={28} />}
          title="Websites"
          description="Logins for sites and services"
          count={data.credentials.filter((c) => c.category === 'Websites').length}
          isLow
          onClick={() => pickCategory('Websites')}
        />
        <VaultItem
          icon={<Landmark size={28} />}
          title="Banking"
          description="Cards, bank portals, PIN notes"
          count={data.credentials.filter((c) => c.category === 'Banking').length}
          isHighSecurity
          onClick={() => pickCategory('Banking')}
        />
        <VaultItem
          icon={<IdCard size={28} />}
          title="Government IDs"
          description="NID, passport, driving license"
          count={data.credentials.filter((c) => c.category === 'Government IDs').length}
          onClick={() => pickCategory('Government IDs')}
        />
        <VaultItem
          icon={<AppWindow size={28} />}
          title="Apps"
          description="Apps, subscriptions, licenses"
          count={data.credentials.filter((c) => c.category === 'Apps').length}
          isLow
          onClick={() => pickCategory('Apps')}
        />
      </section>

      {/* Credentials List */}
      <section ref={credentialsSectionRef} className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-headline text-xl font-bold text-primary tracking-tight">Credentials</h2>
          <div className="flex items-center gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as VaultCategory | 'All')}
              className="px-4 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant/15 text-primary font-bold text-sm"
            >
              <option value="All">All</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {creds.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-surface-container mx-auto flex items-center justify-center text-primary mb-4">
              <KeyRound size={26} />
            </div>
            <div className="font-headline font-bold text-primary text-xl">No credentials</div>
            <p className="text-secondary mt-2">Add your first credential from the Dashboard.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {creds.map((c) => {
              const isDue = daysBetween(c.passwordUpdatedAt, now) >= rotationDays;
              return (
                <motion.div
                  key={c.id}
                  whileHover={{ y: -2 }}
                  className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-5 flex items-start justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-headline font-bold text-primary text-lg truncate">{c.label}</div>
                      {isDue && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-error-container/60 text-error text-[10px] font-bold uppercase tracking-widest">
                          <AlertTriangle size={12} />
                          due
                        </span>
                      )}
                    </div>
                    <div className="text-secondary text-sm mt-1 flex flex-wrap gap-x-4 gap-y-1">
                      <span className="font-bold">{c.category}</span>
                      {c.bankName && <span>bank: {c.bankName}</span>}
                      {c.bankAccountNumber && <span>account: {c.bankAccountNumber}</span>}
                      {c.bankUserId && <span>app user: {c.bankUserId}</span>}
                      {c.cardEnabled && c.cardType && <span>card: {c.cardType}</span>}
                      {c.govIdType && <span>doc: {c.govIdType}</span>}
                      {c.govIdNumber && <span>id: {c.govIdNumber}</span>}
                      {c.socialPlatform && <span>app: {c.socialPlatform}</span>}
                      {c.phoneNumber && <span>phone: {c.phoneNumber}</span>}
                      {c.googleRecoveryEmail && <span>recovery email: {c.googleRecoveryEmail}</span>}
                      {c.googleRecoveryPhone && <span>recovery phone: {c.googleRecoveryPhone}</span>}
                      {c.username && <span>user: {c.username}</span>}
                      {c.website && <span className="truncate">site: {c.website}</span>}
                    </div>
                    {c.email && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm text-primary font-semibold truncate">email: {c.email}</span>
                        <button
                          type="button"
                          onClick={() => void copyText(`${c.id}-email`, c.email)}
                          className="px-2 py-1 rounded-lg bg-surface-container text-primary text-xs font-bold flex items-center gap-1"
                        >
                          {copiedKey === `${c.id}-email` ? <Check size={14} /> : <Copy size={14} />}
                          {copiedKey === `${c.id}-email` ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm text-primary font-semibold">
                        password: {c.password ? (visiblePasswords[c.id] ? c.password : '••••••••••') : '-'}
                      </span>
                      {c.password && (
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(c.id)}
                          className="px-2 py-1 rounded-lg bg-surface-container text-primary text-xs font-bold flex items-center gap-1"
                        >
                          {visiblePasswords[c.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                          {visiblePasswords[c.id] ? 'Hide' : 'Show'}
                        </button>
                      )}
                      {c.password && (
                        <button
                          type="button"
                          onClick={() => void copyText(`${c.id}-password`, c.password)}
                          className="px-2 py-1 rounded-lg bg-surface-container text-primary text-xs font-bold flex items-center gap-1"
                        >
                          {copiedKey === `${c.id}-password` ? <Check size={14} /> : <Copy size={14} />}
                          {copiedKey === `${c.id}-password` ? 'Copied' : 'Copy'}
                        </button>
                      )}
                    </div>
                    <div className="text-[11px] uppercase tracking-widest font-bold text-outline mt-3">
                      last password change: {formatRelativeTime(c.passwordUpdatedAt, now)}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch gap-2">
                    {c.category === 'Government IDs' && c.govFrontImage && (
                      <button
                        onClick={() =>
                          void withProcessing(c.id, 'front', () =>
                            downloadImage(c.govFrontImage!, `${c.label || 'gov-id'}-front.png`)
                          )
                        }
                        className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-sm flex items-center justify-center gap-2"
                        title="Download front image"
                        disabled={processingId === c.id}
                      >
                        {processingId === c.id && processingAction === 'front' ? (
                          <ProcessingSpinner size={16} color="#ffffff" />
                        ) : (
                          <Download size={16} />
                        )}
                        {processingId === c.id && processingAction === 'front' ? 'Preparing...' : 'Front'}
                      </button>
                    )}
                    {c.category === 'Government IDs' && c.govBackImage && (
                      <button
                        onClick={() =>
                          void withProcessing(c.id, 'back', () =>
                            downloadImage(c.govBackImage!, `${c.label || 'gov-id'}-back.png`)
                          )
                        }
                        className="px-4 py-2 rounded-xl bg-primary-container text-white font-bold text-sm flex items-center justify-center gap-2"
                        title="Download back image"
                        disabled={processingId === c.id}
                      >
                        {processingId === c.id && processingAction === 'back' ? (
                          <ProcessingSpinner size={16} color="#ffffff" />
                        ) : (
                          <Download size={16} />
                        )}
                        {processingId === c.id && processingAction === 'back' ? 'Preparing...' : 'Back'}
                      </button>
                    )}
                    <button
                      onClick={() =>
                        void withProcessing(c.id, 'rotate', () => markCredentialPasswordChanged(c.id))
                      }
                      className="px-4 py-2 rounded-xl bg-tertiary-container text-tertiary-fixed font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
                      title="Mark password changed today"
                      disabled={processingId === c.id}
                    >
                      {processingId === c.id && processingAction === 'rotate' ? (
                        <ProcessingSpinner size={16} color="#89f5e7" />
                      ) : (
                        <CheckCircle2 size={16} />
                      )}
                      {processingId === c.id && processingAction === 'rotate' ? 'Updating...' : 'Rotated'}
                    </button>
                    <button
                      onClick={() => void withProcessing(c.id, 'delete', () => deleteCredential(c.id))}
                      className="px-4 py-2 rounded-xl bg-surface-container text-error font-bold text-sm flex items-center justify-center gap-2 hover:opacity-80"
                      title="Delete credential"
                      disabled={processingId === c.id}
                    >
                      {processingId === c.id && processingAction === 'delete' ? (
                        <ProcessingSpinner size={16} color="#ba1a1a" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                      {processingId === c.id && processingAction === 'delete' ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function VaultItem({
  icon,
  title,
  description,
  count,
  isHighSecurity,
  isLow,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  count: number;
  isHighSecurity?: boolean;
  isLow?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={`group w-full text-left flex items-center justify-between p-5 rounded-2xl transition-all duration-300 cursor-pointer ${
        isLow 
          ? 'bg-surface-container-low hover:bg-surface-container-lowest' 
          : 'bg-surface-container-lowest hover:bg-surface-bright shadow-[0_4px_12px_rgba(24,36,66,0.02)] hover:shadow-[0_20px_40px_rgba(24,36,66,0.06)]'
      }`}
    >
      <div className="flex items-center gap-5 min-w-0">
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors duration-300 ${
          isHighSecurity 
            ? 'bg-surface-container-low text-primary group-hover:bg-tertiary group-hover:text-white' 
            : 'bg-surface-container-low text-primary group-hover:bg-primary group-hover:text-white'
        }`}>
          {icon}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-headline text-xl font-bold text-primary tracking-tight">{title}</h3>
            {isHighSecurity && (
              <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed-dim/20 text-on-tertiary-container text-[10px] font-bold uppercase tracking-tighter">High Security</span>
            )}
          </div>
          <p className="text-secondary text-sm leading-snug">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 shrink-0 pl-4">
        <div className="text-right min-w-[42px]">
          <span className="block font-headline font-extrabold text-lg text-primary">{count}</span>
          <span className="block text-[10px] uppercase tracking-[0.2em] text-secondary font-bold">Items</span>
        </div>
        <ChevronRight size={20} className="text-outline-variant group-hover:text-primary transition-colors" />
      </div>
    </motion.button>
  );
}
