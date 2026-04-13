import * as React from 'react';
import { ArrowLeft, RefreshCw, Eye, Shield, Lock, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';
import type { CardType, GovIdType, SocialPlatform, VaultCategory } from '../types';
import { useAppStore } from '../store';
import ProcessingSpinner from './ProcessingSpinner';

interface AddCredentialProps {
  onBack: () => void;
}

export default function AddCredential({ onBack }: AddCredentialProps) {
  const { addCredential } = useAppStore();
  const [label, setLabel] = React.useState('');
  const [category, setCategory] = React.useState<VaultCategory>('Websites');
  const [username, setUsername] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [website, setWebsite] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [notes, setNotes] = React.useState('');
  const [bankName, setBankName] = React.useState('');
  const [bankAccountNumber, setBankAccountNumber] = React.useState('');
  const [bankAppName, setBankAppName] = React.useState('');
  const [bankUserId, setBankUserId] = React.useState('');
  const [hasCardInfo, setHasCardInfo] = React.useState(false);
  const [cardName, setCardName] = React.useState('');
  const [cardCvv, setCardCvv] = React.useState('');
  const [cardExpiryDate, setCardExpiryDate] = React.useState('');
  const [cardHolderName, setCardHolderName] = React.useState('');
  const [cardType, setCardType] = React.useState<CardType>('Visa');
  const [govIdType, setGovIdType] = React.useState<GovIdType>('NID');
  const [govIdNumber, setGovIdNumber] = React.useState('');
  const [govFrontImage, setGovFrontImage] = React.useState<string | null>(null);
  const [govBackImage, setGovBackImage] = React.useState<string | null>(null);
  const [socialPlatform, setSocialPlatform] = React.useState<SocialPlatform>('Facebook');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [googleRecoveryEmail, setGoogleRecoveryEmail] = React.useState('');
  const [googleRecoveryPhone, setGoogleRecoveryPhone] = React.useState('');
  const [googleBackupCodes, setGoogleBackupCodes] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);
  const isBanking = category === 'Banking';
  const isGov = category === 'Government IDs';
  const isSocial = category === 'Social Media';
  const isGoogle = category === 'Google Account';

  const generatePassword = () => {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*()-_=+';
    const len = 18;
    let out = '';
    for (let i = 0; i < len; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
    setPassword(out);
    setShowPassword(true);
  };

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });

  const onGovImage = async (which: 'front' | 'back', fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;
    const data = await readFileAsDataUrl(file);
    if (which === 'front') setGovFrontImage(data);
    else setGovBackImage(data);
  };

  const onSave = async () => {
    const trimmedLabel = label.trim();
    const websiteLabel = website.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    const computedLabel = isBanking
      ? bankName.trim() || bankAppName.trim() || 'Banking credential'
      : isGov
      ? `${govIdType} ${govIdNumber.trim() ? `- ${govIdNumber.trim()}` : ''}`.trim() || 'Government ID'
      : isSocial
      ? socialPlatform
      : isGoogle
      ? (email.trim() || '').toLowerCase()
      : trimmedLabel || websiteLabel || email.trim() || username.trim() || 'Credential';
    if (!computedLabel) {
      alert('Please enter at least one identifying field before saving.');
      return;
    }
    if (isBanking && (!bankName.trim() || !bankAccountNumber.trim() || !bankUserId.trim() || !password.trim())) {
      alert('For Banking, please fill bank name, account number, user ID, and password.');
      return;
    }
    if (isGov && (!govIdNumber.trim() || !govFrontImage || (govIdType === 'NID' && !govBackImage))) {
      alert('For this document, number and required photo(s) must be provided.');
      return;
    }
    if (isSocial && (!password.trim() || (!phoneNumber.trim() && !email.trim()))) {
      alert('For Social Media, add password and at least phone or email.');
      return;
    }
    if (isGoogle && (!email.trim().toLowerCase().endsWith('@gmail.com') || !password.trim())) {
      alert('For Google Account, use a valid Gmail address and password.');
      return;
    }

    addCredential({
      label: computedLabel,
      category,
      username: username.trim() || undefined,
      email: email.trim() || undefined,
      website: website.trim() || undefined,
      password: password || undefined,
      notes: notes.trim() || undefined,
      bankName: isBanking ? bankName.trim() || undefined : undefined,
      bankAccountNumber: isBanking ? bankAccountNumber.trim() || undefined : undefined,
      bankAppName: isBanking ? bankAppName.trim() || undefined : undefined,
      bankUserId: isBanking ? bankUserId.trim() || undefined : undefined,
      cardEnabled: isBanking ? hasCardInfo : false,
      cardName: isBanking && hasCardInfo ? cardName.trim() || undefined : undefined,
      cardCvv: isBanking && hasCardInfo ? cardCvv.trim() || undefined : undefined,
      cardExpiryDate: isBanking && hasCardInfo ? cardExpiryDate.trim() || undefined : undefined,
      cardHolderName: isBanking && hasCardInfo ? cardHolderName.trim() || undefined : undefined,
      cardType: isBanking && hasCardInfo ? cardType : undefined,
      govIdType: isGov ? govIdType : undefined,
      govIdNumber: isGov ? govIdNumber.trim() || undefined : undefined,
      govFrontImage: isGov ? govFrontImage || undefined : undefined,
      govBackImage: isGov ? govBackImage || undefined : undefined,
      socialPlatform: isSocial ? socialPlatform : undefined,
      phoneNumber: isSocial ? phoneNumber.trim() || undefined : undefined,
      googleRecoveryEmail: isGoogle ? googleRecoveryEmail.trim() || undefined : undefined,
      googleRecoveryPhone: isGoogle ? googleRecoveryPhone.trim() || undefined : undefined,
      googleBackupCodes: isGoogle ? googleBackupCodes.trim() || undefined : undefined,
    });
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 350));
    onBack();
  };

  return (
    <div className="bg-surface min-h-screen">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="active:scale-95 transition-transform hover:opacity-80 text-primary"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="font-headline tracking-tight font-bold text-2xl text-primary">New Credential</h1>
          </div>
          <span className="font-bold text-primary">Notecore</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-8 pb-32">
        {/* Editorial Intro */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-12"
        >
          <span className="font-sans text-[11px] font-medium uppercase tracking-widest text-secondary mb-2 block">Security Protocol</span>
          <h2 className="font-headline text-4xl font-extrabold tracking-tighter text-primary mb-4 leading-tight">Fortify Your Identity</h2>
          <p className="text-secondary max-w-lg leading-relaxed">Ensure every entry is cataloged within the high-encryption vault. Precise categorization enables instant retrieval when security demands it.</p>
        </motion.div>

        {/* Form Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-primary ml-1">
                  {isBanking
                    ? 'Credential Label (optional)'
                    : isGov
                    ? 'Document Label (optional)'
                    : isSocial
                    ? 'Profile Label (optional)'
                    : isGoogle
                    ? 'Google Label (optional)'
                    : 'App / Website Name'}
                </label>
                <input 
                  className="w-full px-5 py-4 rounded-xl bg-surface-container-high border-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary/20 transition-all text-on-surface placeholder:text-outline/60" 
                  placeholder={
                    isBanking
                      ? 'Optional title (auto uses bank name)'
                      : isGov
                      ? 'Optional title (auto uses document type/number)'
                      : isSocial
                      ? 'Optional title (auto uses social app)'
                      : isGoogle
                      ? 'Optional title (auto uses Gmail)'
                      : 'e.g. Proton Mail'
                  }
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-primary ml-1">Category</label>
                <div className="relative group">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as VaultCategory)}
                    className="w-full px-5 py-4 rounded-xl bg-surface-container-high border-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary/20 transition-all text-on-surface appearance-none cursor-pointer"
                  >
                    <option>Banking</option>
                    <option>Government IDs</option>
                    <option>Social Media</option>
                    <option>Google Account</option>
                    <option>Websites</option>
                    <option>Apps</option>
                    <option>Work / Professional</option>
                    <option>Entertainment</option>
                    <option>Utility</option>
                    <option>Other</option>
                  </select>
                  <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-secondary" />
                </div>
              </div>
            </div>

            <div className="p-8 bg-surface-container-low rounded-2xl space-y-6">
              {isBanking ? (
                <>
                  <div className="space-y-2">
                    <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-primary ml-1">Bank Name</label>
                    <input
                      className="w-full px-5 py-4 rounded-xl bg-surface-container-lowest border-none focus:ring-1 focus:ring-primary/20 transition-all text-on-surface"
                      placeholder="e.g. Chase Bank"
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-primary ml-1">Bank Account Number</label>
                    <input
                      className="w-full px-5 py-4 rounded-xl bg-surface-container-lowest border-none focus:ring-1 focus:ring-primary/20 transition-all text-on-surface"
                      placeholder="Enter account number"
                      type="text"
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-primary ml-1">Bank App Name (optional)</label>
                    <input
                      className="w-full px-5 py-4 rounded-xl bg-surface-container-lowest border-none focus:ring-1 focus:ring-primary/20 transition-all text-on-surface"
                      placeholder="e.g. Chase Mobile"
                      type="text"
                      value={bankAppName}
                      onChange={(e) => setBankAppName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-primary ml-1">Bank App User ID</label>
                    <input
                      className="w-full px-5 py-4 rounded-xl bg-surface-container-lowest border-none focus:ring-1 focus:ring-primary/20 transition-all text-on-surface"
                      placeholder="User ID"
                      type="text"
                      value={bankUserId}
                      onChange={(e) => setBankUserId(e.target.value)}
                    />
                  </div>
                </>
              ) : isGov ? (
                <>
                  <div className="space-y-2">
                    <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-primary ml-1">Document Type</label>
                    <div className="relative">
                      <select
                        value={govIdType}
                        onChange={(e) => setGovIdType(e.target.value as GovIdType)}
                        className="w-full px-5 py-4 rounded-xl bg-surface-container-lowest border-none focus:ring-1 focus:ring-primary/20 transition-all text-on-surface appearance-none cursor-pointer"
                      >
                        <option>NID</option>
                        <option>Passport</option>
                        <option>Driving License</option>
                        <option>Other</option>
                      </select>
                      <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-secondary" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-primary ml-1">Card / Document Number</label>
                    <input
                      className="w-full px-5 py-4 rounded-xl bg-surface-container-lowest border-none focus:ring-1 focus:ring-primary/20 transition-all text-on-surface"
                      placeholder="Enter ID number"
                      type="text"
                      value={govIdNumber}
                      onChange={(e) => setGovIdNumber(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-primary ml-1">Front Photo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => void onGovImage('front', e.target.files)}
                      className="w-full px-5 py-4 rounded-xl bg-surface-container-lowest border-none"
                    />
                    {govFrontImage && (
                      <img src={govFrontImage} alt="Front preview" className="w-full h-44 object-cover rounded-xl border border-outline-variant/15" />
                    )}
                  </div>

                  {(govIdType === 'NID' || govIdType === 'Driving License') && (
                    <div className="space-y-2">
                      <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-primary ml-1">
                        Back Photo {govIdType === 'NID' ? '(required)' : '(optional)'}
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => void onGovImage('back', e.target.files)}
                        className="w-full px-5 py-4 rounded-xl bg-surface-container-lowest border-none"
                      />
                      {govBackImage && (
                        <img src={govBackImage} alt="Back preview" className="w-full h-44 object-cover rounded-xl border border-outline-variant/15" />
                      )}
                    </div>
                  )}
                </>
              ) : isSocial ? (
                <>
                  <div className="space-y-2">
                    <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-primary ml-1">Social Media App</label>
                    <div className="relative">
                      <select
                        value={socialPlatform}
                        onChange={(e) => setSocialPlatform(e.target.value as SocialPlatform)}
                        className="w-full px-5 py-4 rounded-xl bg-surface-container-lowest border-none focus:ring-1 focus:ring-primary/20 transition-all text-on-surface appearance-none cursor-pointer"
                      >
                        <option>Facebook</option>
                        <option>X</option>
                        <option>Instagram</option>
                        <option>TikTok</option>
                        <option>YouTube</option>
                        <option>LinkedIn</option>
                        <option>Snapchat</option>
                        <option>Pinterest</option>
                        <option>Reddit</option>
                        <option>Other</option>
                      </select>
                      <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-secondary" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-primary ml-1">Phone Number</label>
                    <input
                      className="w-full px-5 py-4 rounded-xl bg-surface-container-lowest border-none focus:ring-1 focus:ring-primary/20 transition-all text-on-surface"
                      placeholder="+880..."
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-primary ml-1">Email Address</label>
                    <input
                      className="w-full px-5 py-4 rounded-xl bg-surface-container-lowest border-none focus:ring-1 focus:ring-primary/20 transition-all text-on-surface"
                      placeholder="name@example.com"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </>
              ) : isGoogle ? (
                <>
                  <div className="space-y-2">
                    <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-primary ml-1">Gmail Address</label>
                    <input
                      className="w-full px-5 py-4 rounded-xl bg-surface-container-lowest border-none focus:ring-1 focus:ring-primary/20 transition-all text-on-surface"
                      placeholder="you@gmail.com"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-primary ml-1">Recovery Email (optional)</label>
                    <input
                      className="w-full px-5 py-4 rounded-xl bg-surface-container-lowest border-none focus:ring-1 focus:ring-primary/20 transition-all text-on-surface"
                      placeholder="backup@example.com"
                      type="email"
                      value={googleRecoveryEmail}
                      onChange={(e) => setGoogleRecoveryEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-primary ml-1">Recovery Number (optional)</label>
                    <input
                      className="w-full px-5 py-4 rounded-xl bg-surface-container-lowest border-none focus:ring-1 focus:ring-primary/20 transition-all text-on-surface"
                      placeholder="+880..."
                      type="tel"
                      value={googleRecoveryPhone}
                      onChange={(e) => setGoogleRecoveryPhone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-primary ml-1">Backup Codes (optional)</label>
                    <textarea
                      className="w-full px-5 py-4 rounded-xl bg-surface-container-lowest border-none focus:ring-1 focus:ring-primary/20 transition-all text-on-surface resize-none"
                      placeholder="One code per line"
                      rows={4}
                      value={googleBackupCodes}
                      onChange={(e) => setGoogleBackupCodes(e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-primary ml-1">Website URL</label>
                    <input
                      className="w-full px-5 py-4 rounded-xl bg-surface-container-lowest border-none focus:ring-1 focus:ring-primary/20 transition-all text-on-surface"
                      placeholder="https://example.com"
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-primary ml-1">Username</label>
                    <input
                      className="w-full px-5 py-4 rounded-xl bg-surface-container-lowest border-none focus:ring-1 focus:ring-primary/20 transition-all text-on-surface"
                      placeholder="your_username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-primary ml-1">Email Address</label>
                    <input
                      className="w-full px-5 py-4 rounded-xl bg-surface-container-lowest border-none focus:ring-1 focus:ring-primary/20 transition-all text-on-surface"
                      placeholder="name@example.com"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </>
              )}
              {!isGov && (
                <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-primary">
                    {isBanking
                      ? 'Bank App Password'
                      : isSocial
                      ? 'Social Password'
                      : isGoogle
                      ? 'Google Account Password'
                      : 'Master Password'}
                  </label>
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="text-tertiary font-bold text-[10px] uppercase tracking-widest hover:opacity-70 transition-opacity flex items-center gap-1"
                  >
                    <RefreshCw size={12} /> Generate
                  </button>
                </div>
                <div className="relative">
                  <input 
                    className="w-full px-5 py-4 pr-14 rounded-xl bg-surface-container-lowest border-none focus:ring-1 focus:ring-primary/20 transition-all text-on-surface font-mono tracking-widest" 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <Eye size={20} />
                  </button>
                </div>
              </div>
              )}

              {isBanking && (
                <div className="border border-outline-variant/20 rounded-2xl p-5 space-y-4 bg-surface-container-lowest/60">
                  <div className="flex items-center justify-between">
                    <h4 className="font-headline font-bold text-primary">Card Information</h4>
                    <label className="inline-flex items-center gap-2 text-sm text-secondary font-medium">
                      <input
                        type="checkbox"
                        checked={hasCardInfo}
                        onChange={(e) => setHasCardInfo(e.target.checked)}
                      />
                      Add card info
                    </label>
                  </div>

                  {hasCardInfo && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-primary ml-1">Card Name</label>
                        <input
                          className="w-full px-4 py-3 rounded-xl bg-surface-container-low border-none focus:ring-1 focus:ring-primary/20 transition-all"
                          placeholder="Personal Debit"
                          type="text"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-primary ml-1">Card Type</label>
                        <div className="relative">
                          <select
                            value={cardType}
                            onChange={(e) => setCardType(e.target.value as CardType)}
                            className="w-full px-4 py-3 rounded-xl bg-surface-container-low border-none focus:ring-1 focus:ring-primary/20 appearance-none"
                          >
                            <option>Mastercard</option>
                            <option>Visa</option>
                            <option>American Express</option>
                            <option>Other</option>
                          </select>
                          <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-secondary" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-primary ml-1">Name on Card</label>
                        <input
                          className="w-full px-4 py-3 rounded-xl bg-surface-container-low border-none focus:ring-1 focus:ring-primary/20 transition-all"
                          placeholder="Notecore User"
                          type="text"
                          value={cardHolderName}
                          onChange={(e) => setCardHolderName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-primary ml-1">Expiry Date</label>
                        <input
                          className="w-full px-4 py-3 rounded-xl bg-surface-container-low border-none focus:ring-1 focus:ring-primary/20 transition-all"
                          placeholder="MM/YY"
                          type="text"
                          value={cardExpiryDate}
                          onChange={(e) => setCardExpiryDate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-primary ml-1">CVV</label>
                        <input
                          className="w-full px-4 py-3 rounded-xl bg-surface-container-low border-none focus:ring-1 focus:ring-primary/20 transition-all"
                          placeholder="CVV"
                          type="text"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-primary ml-1">Encryption Notes</label>
              <textarea 
                className="w-full px-5 py-4 rounded-xl bg-surface-container-high border-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary/20 transition-all text-on-surface resize-none" 
                placeholder="Optional context or recovery hints..." 
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="pt-4">
              <button 
                onClick={onSave}
                disabled={
                  isSaving ||
                  (isBanking
                    ? !bankName.trim() || !bankAccountNumber.trim() || !bankUserId.trim() || !password.trim()
                    : isGov
                    ? !govIdNumber.trim() || !govFrontImage || (govIdType === 'NID' && !govBackImage)
                    : isSocial
                    ? !password.trim() || (!phoneNumber.trim() && !email.trim())
                    : isGoogle
                    ? !password.trim() || !email.trim().toLowerCase().endsWith('@gmail.com')
                    : !password.trim() || (!label.trim() && !website.trim() && !email.trim() && !username.trim()))
                }
                className="w-full md:w-auto px-12 py-5 bg-vault-gradient text-white font-headline font-bold text-lg rounded-xl active:scale-95 transition-all shadow-[0_20px_40px_rgba(24,36,66,0.1)] hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSaving ? (
                  <>
                    <ProcessingSpinner size={18} color="#ffffff" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Shield size={20} />
                    Save to Vault
                  </>
                )}
              </button>
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-8">
            <div className="p-8 bg-tertiary-container text-on-tertiary-container rounded-2xl relative overflow-hidden">
              <div className="relative z-10">
                <Lock size={40} className="text-tertiary-fixed mb-4 fill-current" />
                <h3 className="font-headline text-xl font-bold mb-2">Zero-Knowledge Encryption</h3>
                <p className="text-sm opacity-80 leading-relaxed mb-6">Your credentials are encrypted locally before they ever reach our servers. Only you hold the decryption key.</p>
                <div className="flex items-center gap-2 px-3 py-2 bg-black/20 rounded-lg inline-flex">
                  <Shield size={14} />
                  <span className="font-sans text-[10px] font-bold uppercase tracking-widest">AES-256 Validated</span>
                </div>
              </div>
              <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-tertiary-fixed/10 rounded-full blur-3xl"></div>
            </div>

            <div className="p-8 bg-surface-container-lowest rounded-2xl ghost-border">
              <h4 className="font-sans text-[11px] font-bold uppercase tracking-wider text-secondary mb-4">Reminder logic</h4>
              <p className="text-sm text-secondary leading-relaxed">
                If you save a password here, Notecore will remind you after <span className="font-bold">1 month</span> (default)
                to rotate it for better privacy. You can change this in Settings.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
