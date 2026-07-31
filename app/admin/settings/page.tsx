'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { adminDict, getAdminLocale } from '@/lib/adminI18n';

export default function AdminSettings() {
  const searchParams = useSearchParams();
  const locale = getAdminLocale(searchParams.get('lang') ?? undefined);
  const d = adminDict[locale];

  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwStatus, setPwStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [pwError, setPwError] = useState('');

  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [emailError, setEmailError] = useState('');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwNew !== pwConfirm) { setPwError(d.passwordsNoMatch); setPwStatus('error'); return; }
    if (pwNew.length < 6) { setPwError(d.minChars); setPwStatus('error'); return; }
    setPwStatus('loading'); setPwError('');
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: pwCurrent, newPassword: pwNew }),
    });
    const data = await res.json();
    if (!res.ok) {
      setPwError(data.error === 'wrong_password' ? d.wrongPassword : d.errorTryAgain);
      setPwStatus('error');
    } else {
      setPwStatus('success');
      setPwCurrent(''); setPwNew(''); setPwConfirm('');
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailStatus('loading'); setEmailError('');
    const res = await fetch('/api/auth/change-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newEmail, currentPassword: emailPassword }),
    });
    const data = await res.json();
    if (!res.ok) {
      const msg =
        data.error === 'wrong_password' ? d.wrongPassword :
        data.error === 'email_taken' ? 'ეს ელ-ფოსტა უკვე გამოყენებულია' :
        data.error === 'invalid_email' ? 'ელ-ფოსტის ფორმატი არასწორია' :
        data.error === 'same_email' ? 'ეს უკვე თქვენი ელ-ფოსტაა' :
        d.errorTryAgain;
      setEmailError(msg); setEmailStatus('error');
    } else {
      setEmailStatus('success');
      setNewEmail(''); setEmailPassword('');
    }
  };

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-3xl font-black text-[#465940] mb-1">{d.settingsTitle}</h1>
      <p className="text-[#465940]/60 text-sm mb-8">{d.manageCredentials}</p>

      {/* Email change */}
      <div className="bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm p-8 mb-6">
        <h2 className="text-lg font-bold text-[#465940] mb-1">ელ-ფოსტის შეცვლა</h2>
        <p className="text-sm text-[#465940]/60 mb-6">შეიყვანე ახალი ელ-ფოსტა და დაადასტურე მიმდინარე პაროლით. შეცვლა ძალაში შევა მხოლოდ მას შემდეგ, რაც ახალ მისამართზე მიღებულ ბმულს დაადასტურებ.</p>

        {emailStatus === 'success' && (
          <div className="mb-5 rounded-xl bg-[#465940]/10 px-4 py-3 text-sm font-semibold text-[#465940]">
            დადასტურების ბმული გაიგზავნა ახალ ელ-ფოსტაზე. გახსენი და დააჭირე ბმულს — მანამდე ძველი ელ-ფოსტა აქტიური რჩება.
          </div>
        )}

        {searchParams.get('emailChanged') === '1' && (
          <div className="mb-5 rounded-xl bg-[#465940]/10 px-4 py-3 text-sm font-semibold text-[#465940]">
            ელ-ფოსტა წარმატებით შეიცვალა
          </div>
        )}

        <form onSubmit={handleEmailChange} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#465940] mb-1.5">ახალი ელ-ფოსტა</label>
            <input type="email" required value={newEmail} onChange={e => setNewEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full px-4 py-3 rounded-xl border border-[#465940]/20 focus:outline-none focus:border-[#465940] transition text-sm text-[#465940] bg-white" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#465940] mb-1.5">{d.currentPassword}</label>
            <input type="password" required value={emailPassword} onChange={e => setEmailPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#465940]/20 focus:outline-none focus:border-[#465940] transition text-sm text-[#465940] bg-white" />
          </div>

          {emailStatus === 'error' && (
            <p className="text-[#FDFBF0] text-sm font-medium">{emailError}</p>
          )}

          <button type="submit" disabled={emailStatus === 'loading'}
            className="bg-[#465940] hover:bg-[#465940] text-[#FDFBF0] px-6 py-3 rounded-full font-bold text-sm transition disabled:opacity-60">
            {emailStatus === 'loading' ? d.saving : 'შეცვლა'}
          </button>
        </form>
      </div>

      <div className="bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm p-8">
        <h2 className="text-lg font-bold text-[#465940] mb-1">{d.changePassword}</h2>
        <p className="text-sm text-[#465940]/60 mb-6">{d.updateAdminPassword}</p>

        {pwStatus === 'success' && (
          <div className="mb-5 rounded-xl bg-[#465940]/10 px-4 py-3 text-sm font-semibold text-[#465940]">
            {d.passwordChanged}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#465940] mb-1.5">{d.currentPassword}</label>
            <input type="password" required value={pwCurrent} onChange={e => setPwCurrent(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#465940]/20 focus:outline-none focus:border-[#465940] transition text-sm text-[#465940] bg-white" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#465940] mb-1.5">{d.newPassword}</label>
            <input type="password" required minLength={6} value={pwNew} onChange={e => setPwNew(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#465940]/20 focus:outline-none focus:border-[#465940] transition text-sm text-[#465940] bg-white" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#465940] mb-1.5">{d.confirmPassword}</label>
            <input type="password" required value={pwConfirm} onChange={e => setPwConfirm(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#465940]/20 focus:outline-none focus:border-[#465940] transition text-sm text-[#465940] bg-white" />
          </div>

          {pwStatus === 'error' && (
            <p className="text-[#FDFBF0] text-sm font-medium">{pwError}</p>
          )}

          <button type="submit" disabled={pwStatus === 'loading'}
            className="bg-[#465940] hover:bg-[#465940] text-[#FDFBF0] px-6 py-3 rounded-full font-bold text-sm transition disabled:opacity-60">
            {pwStatus === 'loading' ? d.saving : d.updateBtn}
          </button>
        </form>
      </div>
    </div>
  );
}
