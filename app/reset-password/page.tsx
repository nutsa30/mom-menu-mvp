'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';

type Status = 'idle' | 'loading' | 'success' | 'error_invalid' | 'error_expired' | 'error_used' | 'error_generic';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (!token) setStatus('error_invalid');
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (password.length < 6) {
      setValidationError('პაროლი მინიმუმ 6 სიმბოლო უნდა იყოს.');
      return;
    }
    if (password !== confirm) {
      setValidationError('პაროლები არ ემთხვევა.');
      return;
    }

    setStatus('loading');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.error === 'token_expired') { setStatus('error_expired'); return; }
        if (data.error === 'token_used')    { setStatus('error_used');    return; }
        if (data.error === 'invalid_token') { setStatus('error_invalid'); return; }
        setStatus('error_generic');
        return;
      }
      setStatus('success');
    } catch {
      setStatus('error_generic');
    }
  };

  const errorMessage: Record<string, string> = {
    error_invalid: 'ბმული არასწორია ან უკვე ვადაგასულია.',
    error_expired: '⏱ ბმული ვადაგასულია. გთხოვთ, ახლიდან მოითხოვოთ პაროლის აღდგენა.',
    error_used:    'ეს ბმული უკვე გამოყენებულია. გთხოვთ, ახლიდან მოითხოვოთ პაროლის აღდგენა.',
    error_generic: 'შეცდომა. გთხოვთ, სცადოთ ახლიდან.',
  };

  return (
    <div className="min-h-screen bg-[#465940] flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-[#FDFBF0] rounded-[32px] shadow-2xl overflow-hidden grid lg:grid-cols-[45%_55%]" style={{ minHeight: 480 }}>

        {/* Left panel */}
        <div className="hidden lg:flex bg-[#465940] flex-col p-10 relative">
          <div className="absolute top-[-80px] right-[-80px] w-64 h-64 rounded-full bg-[#FDFBF0]/10" />
          <div className="absolute bottom-[-60px] left-[-60px] w-80 h-80 rounded-full bg-[#FDFBF0]/10" />
          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-full max-w-[260px]">
              <div className="bg-[#465940] rounded-3xl overflow-hidden" style={{ height: 280 }}>
                <Image src="/cooking.jpg" alt="cooking" width={260} height={280} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex items-center justify-center bg-[#FDFBF0] px-10 py-12">
          <div className="w-full max-w-sm">

            {status === 'success' ? (
              <div className="text-center">
                <div className="text-5xl mb-4">✅</div>
                <h2 className="text-2xl font-black text-[#465940] mb-2">პაროლი შეიცვალა!</h2>
                <p className="text-[#465940]/60 text-sm mb-6">
                  შეგიძლიათ ახლა ახალი პაროლით შეხვიდეთ.
                </p>
                <button
                  onClick={() => router.push('/login?lang=ka')}
                  className="w-full bg-[#465940] text-[#FDFBF0] py-3.5 rounded-full font-bold text-sm shadow-md hover:opacity-90 transition"
                >
                  შესვლა →
                </button>
              </div>
            ) : errorMessage[status] ? (
              <div className="text-center">
                <div className="text-5xl mb-4">⚠️</div>
                <h2 className="text-2xl font-black text-[#465940] mb-2">ბმული არასწორია</h2>
                <p className="text-[#465940]/60 text-sm mb-6">{errorMessage[status]}</p>
                <a
                  href="/forgot-password?lang=ka"
                  className="text-[#465940] font-bold hover:underline text-sm"
                >
                  ← პაროლის აღდგენა ახლიდან
                </a>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-black text-[#465940] mb-1">ახალი პაროლი</h1>
                <p className="text-[#465940]/60 text-sm mb-8">
                  შეიყვანეთ ახალი პაროლი თქვენი ანგარიშისთვის.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#465940] mb-1.5">
                      ახალი პაროლი
                    </label>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="მინიმუმ 6 სიმბოლო"
                        className="w-full px-4 py-3 rounded-xl border border-[#465940]/20 focus:outline-none focus:border-[#465940] transition text-sm pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#465940]/40 hover:text-[#465940] text-xs"
                      >
                        {showPass ? 'დამალვა' : 'ჩვენება'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#465940] mb-1.5">
                      პაროლის დადასტურება
                    </label>
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="გაიმეორეთ პაროლი"
                      className="w-full px-4 py-3 rounded-xl border border-[#465940]/20 focus:outline-none focus:border-[#465940] transition text-sm"
                    />
                  </div>

                  {validationError && (
                    <p className="text-red-600 text-sm">{validationError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full bg-[#465940] text-[#FDFBF0] py-3.5 rounded-full font-bold text-sm shadow-md hover:opacity-90 transition disabled:opacity-60"
                  >
                    {status === 'loading' ? 'იცვლება...' : 'პაროლის შეცვლა'}
                  </button>
                </form>

                <p className="text-sm text-[#465940]/60 mt-6 text-center">
                  <a href="/login?lang=ka" className="text-[#465940] font-bold hover:underline">
                    ← შესვლაზე დაბრუნება
                  </a>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
