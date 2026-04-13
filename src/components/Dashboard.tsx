import * as React from 'react';
import { PlusCircle, Key, Users, Globe, AppWindow, CreditCard, FileText, Lock, AlertTriangle, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { Screen } from '../types';
import { useAppStore } from '../store';
import { daysBetween, formatRelativeTime, nowIso } from '../utils/time';
import { noteLooksLikeCredential } from '../utils/sensitive';

interface DashboardProps {
  onNavigate: (screen: Screen) => void;
  onCreateNote: () => void;
  onOpenNote: (noteId: string) => void;
}

export default function Dashboard({ onNavigate, onCreateNote, onOpenNote }: DashboardProps) {
  const { data } = useAppStore();
  const now = nowIso();
  const rotationDays = Math.max(1, Math.floor(data.settings.passwordRotationDays));
  const due = data.credentials.filter((c) => daysBetween(c.passwordUpdatedAt, now) >= rotationDays);
  const sensitiveDue = data.notes.filter(
    (n) => noteLooksLikeCredential(n) && daysBetween(n.updatedAt, now) >= rotationDays
  );
  const totalAssets = data.notes.length + data.credentials.length;
  const recentNotes = data.notes.slice(0, 2);
  const recentCreds = data.credentials.slice(0, 1);
  const dueTotal = due.length + sensitiveDue.length;

  return (
    <div className="px-6 pt-4 pb-32">
      {/* Summary Section */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="md:col-span-8 bg-vault-gradient rounded-2xl p-8 flex flex-col justify-between min-h-[240px] shadow-[0_20px_40px_rgba(24,36,66,0.06)]"
        >
          <div>
            <span className="font-sans text-tertiary-fixed text-[11px] uppercase tracking-wider font-bold mb-2 block">
              Security Status: {dueTotal > 0 ? 'Action Needed' : 'Fortified'}
            </span>
            <h2 className="font-headline text-white text-4xl font-bold tracking-tight mb-4">
              {dueTotal > 0
                ? `You have ${dueTotal} item${dueTotal === 1 ? '' : 's'} to review for privacy.`
                : 'Your vault is up to date.'}
            </h2>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <span className="text-on-primary-container text-xs font-medium uppercase tracking-widest">Total Assets</span>
              <span className="font-headline text-white text-3xl font-extrabold tracking-tighter">{totalAssets}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-on-primary-container text-xs font-medium uppercase tracking-widest">Encrypted</span>
              <span className="font-headline text-tertiary-fixed text-3xl font-extrabold tracking-tighter">Local</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-4 bg-surface-container-lowest rounded-2xl p-8 flex flex-col justify-center border border-outline-variant/15"
        >
          <span className="font-sans text-secondary text-[11px] uppercase tracking-wider font-bold mb-4 block">Quick Action</span>
          <button 
            onClick={onCreateNote}
            className="w-full bg-tertiary-container text-tertiary-fixed py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98]"
          >
            <PlusCircle size={20} />
            Create New Note
          </button>
          <button 
            onClick={() => onNavigate('add-credential')}
            className="w-full mt-3 bg-surface-container text-primary py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-surface-container-high transition-all active:scale-[0.98]"
          >
            <Key size={20} />
            Add Credential
          </button>
        </motion.div>
      </section>

      {/* Vaults Grid */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-headline text-primary text-xl font-bold tracking-tight">Vaults</h3>
          <button 
            onClick={() => onNavigate('vaults')}
            className="text-secondary text-sm font-medium hover:text-primary cursor-pointer"
          >
            View all categories
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <VaultCard onClick={() => onNavigate('vaults')} icon={<Users size={24} />} title="Social" count={`${data.credentials.filter((c) => c.category === 'Social Media').length} Items`} />
          <VaultCard onClick={() => onNavigate('vaults')} icon={<Globe size={24} />} title="Web" count={`${data.credentials.filter((c) => c.category === 'Websites').length} Items`} />
          <VaultCard onClick={() => onNavigate('vaults')} icon={<AppWindow size={24} />} title="Apps" count={`${data.credentials.filter((c) => c.category === 'Apps').length} Items`} />
          <VaultCard onClick={() => onNavigate('vaults')} icon={<CreditCard size={24} />} title="Banking" count={`${data.credentials.filter((c) => c.category === 'Banking').length} Items`} />
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-headline text-primary text-xl font-bold tracking-tight">Recent Activity</h3>
          <span className="text-secondary text-sm font-medium">Latest</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentNotes[0] ? (
            <ActivityCard
              icon={<FileText size={20} />}
              title={recentNotes[0].title}
              description={recentNotes[0].content || '—'}
              type="encrypted"
              time={formatRelativeTime(recentNotes[0].updatedAt, now)}
              onClick={() => onOpenNote(recentNotes[0].id)}
            />
          ) : (
            <ActivityCard
              icon={<FileText size={20} />}
              title="No notes yet"
              description="Create a note to see activity here."
              type="encrypted"
              time="—"
              onClick={onCreateNote}
            />
          )}

          {recentNotes[1] ? (
            <ActivityCard
              icon={<FileText size={20} />}
              title={recentNotes[1].title}
              description={recentNotes[1].content || '—'}
              type="encrypted"
              time={formatRelativeTime(recentNotes[1].updatedAt, now)}
              onClick={() => onOpenNote(recentNotes[1].id)}
            />
          ) : (
            <ActivityCard
              icon={<Lock size={20} />}
              title="Add a credential"
              description="Store a website/app login and get monthly password reminders."
              type="credential"
              time="—"
              onClick={() => onNavigate('add-credential')}
            />
          )}

          {due[0] ? (
            <ActivityCard
              icon={<AlertTriangle size={20} />}
              title={`${due[0].label}: rotate password`}
              description={`Password is older than ${rotationDays} days. Changing monthly improves privacy.`}
              type="alert"
              time={formatRelativeTime(due[0].passwordUpdatedAt, now)}
              onClick={() => onNavigate('vaults')}
            />
          ) : sensitiveDue[0] ? (
            <ActivityCard
              icon={<AlertTriangle size={20} />}
              title="Note may contain a password"
              description={`“${sensitiveDue[0].title || 'Untitled note'}” looks like a login. Consider rotating passwords monthly.`}
              type="alert"
              time={formatRelativeTime(sensitiveDue[0].updatedAt, now)}
              onClick={() => onOpenNote(sensitiveDue[0].id)}
            />
          ) : recentCreds[0] ? (
            <ActivityCard
              icon={<Lock size={20} />}
              title={recentCreds[0].label}
              description={`Credential saved in ${recentCreds[0].category}.`}
              type="credential"
              time={formatRelativeTime(recentCreds[0].updatedAt, now)}
              onClick={() => onNavigate('vaults')}
            />
          ) : (
            <ActivityCard
              icon={<AlertTriangle size={20} />}
              title="No reminders"
              description={`When a saved password is older than ${rotationDays} days, it will show here.`}
              type="alert"
              time="—"
              onClick={() => onNavigate('settings')}
            />
          )}
        </div>
      </section>
    </div>
  );
}

function VaultCard({ icon, title, count, onClick }: { icon: React.ReactNode; title: string; count: string; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -5 }}
      className="w-full text-left bg-surface-container-low p-6 rounded-2xl hover:bg-surface-container-high transition-all cursor-pointer group"
    >
      <div className="w-12 h-12 bg-surface-container-lowest rounded-xl flex items-center justify-center text-primary mb-4 shadow-sm group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span className="block font-headline text-primary font-bold text-lg">{title}</span>
      <span className="text-secondary text-xs uppercase tracking-widest font-bold">{count}</span>
    </motion.button>
  );
}

function ActivityCard({
  icon,
  title,
  description,
  type,
  time,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  type: 'encrypted' | 'credential' | 'alert';
  time: string;
  onClick: () => void;
}) {
  const badgeStyles = {
    encrypted: 'bg-tertiary-fixed-dim/10 text-on-tertiary-container',
    credential: 'bg-secondary-container/30 text-primary',
    alert: 'bg-error-container/40 text-error'
  };

  const iconStyles = {
    encrypted: 'bg-tertiary-fixed-dim/20 text-on-tertiary-container',
    credential: 'bg-secondary-container text-primary',
    alert: 'bg-error-container/20 text-error'
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/10 shadow-[0_4px_20px_rgba(24,36,66,0.02)] hover:shadow-[0_10px_30px_rgba(24,36,66,0.06)] transition-all group cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconStyles[type]}`}>
          {icon}
        </div>
        <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-tighter ${badgeStyles[type]}`}>
          {type}
        </span>
      </div>
      <h4 className="font-headline text-primary font-bold mb-1 group-hover:text-primary-container">{title}</h4>
      <p className="text-secondary text-sm line-clamp-2 mb-4 leading-relaxed">{description}</p>
      <div className="flex items-center gap-2 text-[10px] font-bold text-outline uppercase tracking-wider">
        <Clock size={14} />
        {time}
      </div>
    </motion.div>
  );
}
