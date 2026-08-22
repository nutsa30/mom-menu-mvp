'use client';

import { useState } from 'react';

type Settings = {
  introKa: string; introEn: string;
  email: string;
  responseTimeKa: string; responseTimeEn: string;
  workingHoursKa: string; workingHoursEn: string;
};

export default function ContactClient({ locale, settings }: { locale: 'ka' | 'en'; settings: Settings }) {
  const ka = locale === 'ka';
  const s = settings;

  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus]   = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errMsg, setErrMsg]   = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrMsg('');
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message }),
    });
    const data = await res.json();
    if (res.ok) {
      setStatus('sent');
      setName(''); setEmail(''); setMessage('');
    } else {
      setStatus('error');
      setErrMsg(data.error || (ka ? 'შეცდომა' : 'Error'));
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-5 py-14 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

      {/* Left — info */}
      <div>
        <h2 className="text-2xl font-black text-[#F5F1E4] mb-4">
          {ka ? 'დაგვიკავშირდი' : 'Get in touch'}
        </h2>
        <p className="text-[#F5F1E4]/70 leading-relaxed mb-8">
          {ka ? s.introKa : s.introEn}
        </p>

        <div className="space-y-5">
          <InfoRow icon="phone" label={ka ? 'ტელეფონი' : 'Phone'}>
            <a href="tel:+995557466668" className="text-[#F5F1E4] font-semibold hover:opacity-80 transition text-sm">
              +995 557 46 66 68
            </a>
          </InfoRow>

          <InfoRow icon="email" label={ka ? 'ელ-ფოსტა' : 'Email'}>
            <a href={`mailto:${s.email}`} className="text-[#F5F1E4] font-semibold hover:opacity-80 transition text-sm">
              {s.email}
            </a>
          </InfoRow>

          <InfoRow icon="location" label={ka ? 'მისამართი' : 'Address'}>
            <p className="text-[#F5F1E4] font-semibold text-sm">
              {ka ? 'ჩიქოვანის ქ. 45, თბილისი, საქართველო' : '45 Chikovani St, Tbilisi, Georgia'}
            </p>
          </InfoRow>

          <InfoRow icon="clock" label={ka ? 'პასუხის დრო' : 'Response time'}>
            <p className="text-[#F5F1E4] font-semibold text-sm">
              {ka ? s.responseTimeKa : s.responseTimeEn}
            </p>
          </InfoRow>

          <InfoRow icon="calendar" label={ka ? 'სამუშაო საათები' : 'Working hours'}>
            <p className="text-[#F5F1E4] font-semibold text-sm">
              {ka ? s.workingHoursKa : s.workingHoursEn}
            </p>
          </InfoRow>
        </div>
      </div>

      {/* Right — form */}
      <div className="bg-[#F5F1E4] rounded-2xl shadow-xl p-7">
        {status === 'sent' ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4"></div>
            <h3 className="text-xl font-black text-[#6F7A5C] mb-2">
              {ka ? 'გაგზავნილია!' : 'Sent!'}
            </h3>
            <p className="text-[#6F7A5C]/70 text-sm">
              {ka ? 'შეტყობინება მივიღეთ. 24 საათში გიპასუხებთ.' : "We received your message. We'll reply within 24 hours."}
            </p>
            <button onClick={() => setStatus('idle')}
              className="mt-6 text-sm font-semibold text-[#6F7A5C] underline underline-offset-2">
              {ka ? 'კიდევ ერთი შეტყობინება' : 'Send another'}
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <Field label={ka ? 'სახელი' : 'Name'}>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required
                placeholder={ka ? 'შენი სახელი' : 'Your name'} className={inputCls} />
            </Field>
            <Field label={ka ? 'ელ-ფოსტა' : 'Email'}>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder={ka ? 'შენი ელ-ფოსტა' : 'Your email'} className={inputCls} />
            </Field>
            <Field label={ka ? 'შეტყობინება' : 'Message'}>
              <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={5}
                placeholder={ka ? 'დაწერე შენი შეტყობინება...' : 'Write your message...'} className={inputCls + ' resize-none'} />
            </Field>
            {status === 'error' && <p className="text-red-600 text-sm font-medium">{errMsg}</p>}
            <button type="submit" disabled={status === 'sending'}
              className="w-full py-3.5 rounded-full font-bold text-[#F5F1E4] text-sm transition"
              style={{ background: status === 'sending' ? 'rgba(111,122,92,.5)' : '#6F7A5C' }}>
              {status === 'sending' ? (ka ? 'იგზავნება...' : 'Sending...') : (ka ? 'გაგზავნა' : 'Send message')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const inputCls = 'w-full px-4 py-3 rounded-xl border border-[#6F7A5C]/20 text-[#6F7A5C] text-sm outline-none focus:border-[#6F7A5C] transition placeholder:text-[#6F7A5C]/40 bg-white font-semibold';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-bold text-[#6F7A5C] mb-1.5">{label} *</label>
      {children}
    </div>
  );
}

function InfoRow({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) {
  const icons: Record<string, React.ReactNode> = {
    phone: <><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l.95-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></>,
    email: <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>,
    location: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>,
    clock: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
  };
  return (
    <div className="flex items-start gap-4">
      <div className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: 'rgba(245,241,228,.12)' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F5F1E4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {icons[icon]}
        </svg>
      </div>
      <div>
        <div className="text-[#F5F1E4]/50 text-xs font-semibold uppercase tracking-wider mb-0.5">{label}</div>
        {children}
      </div>
    </div>
  );
}
