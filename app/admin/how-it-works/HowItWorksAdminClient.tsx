'use client';

import { useState } from 'react';
import { createStep, updateStep, deleteStep, createFaq, updateFaq, deleteFaq, updateSettings } from './actions';

const inputCls = 'w-full px-3 py-2 rounded-xl border border-[#465940]/20 focus:outline-none focus:border-[#465940] text-sm text-[#465940] bg-white';
const card = 'bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm p-6';

// ── Step Form ─────────────────────────────────────────────────────────────────
function StepForm({
  initial, onDone,
}: {
  initial?: { id: string; icon: string; titleKa: string; titleEn: string; descKa: string; descEn: string; sortOrder: number };
  onDone: () => void;
}) {
  const [icon, setIcon] = useState(initial?.icon ?? '🍽️');
  const [titleKa, setTitleKa] = useState(initial?.titleKa ?? '');
  const [titleEn, setTitleEn] = useState(initial?.titleEn ?? '');
  const [descKa, setDescKa] = useState(initial?.descKa ?? '');
  const [descEn, setDescEn] = useState(initial?.descEn ?? '');
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    const data = { icon, titleKa, titleEn, descKa, descEn, sortOrder: Number(sortOrder) };
    if (initial) await updateStep(initial.id, data);
    else await createStep(data);
    setLoading(false);
    onDone();
  };

  return (
    <div className="space-y-3 mt-4 pt-4 border-t border-[#465940]/10">
      <div className="flex gap-3">
        <div className="w-24">
          <label className="text-xs font-semibold text-[#465940]/70 block mb-1">ემოჯი</label>
          <input value={icon} onChange={(e) => setIcon(e.target.value)} className={inputCls} />
        </div>
        <div className="w-24">
          <label className="text-xs font-semibold text-[#465940]/70 block mb-1">თანმიმდევრობა</label>
          <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} className={inputCls} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-[#465940]/70 block mb-1">სათაური (ქართ.)</label>
          <input value={titleKa} onChange={(e) => setTitleKa(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="text-xs font-semibold text-[#465940]/70 block mb-1">სათაური (ინგლ.)</label>
          <input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="text-xs font-semibold text-[#465940]/70 block mb-1">აღწერა (ქართ.)</label>
          <textarea rows={3} value={descKa} onChange={(e) => setDescKa(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="text-xs font-semibold text-[#465940]/70 block mb-1">აღწერა (ინგლ.)</label>
          <textarea rows={3} value={descEn} onChange={(e) => setDescEn(e.target.value)} className={inputCls} />
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={submit} disabled={loading || !titleKa || !titleEn}
          className="bg-[#465940] text-[#FDFBF0] text-sm font-bold px-5 py-2 rounded-full hover:bg-[#465940] disabled:opacity-50 transition">
          {loading ? 'ინახება...' : initial ? 'შენახვა' : 'დამატება'}
        </button>
        <button onClick={onDone} className="text-sm text-[#465940]/60 hover:text-[#465940]/80 px-4 py-2 transition">გაუქმება</button>
      </div>
    </div>
  );
}

// ── FAQ Form ──────────────────────────────────────────────────────────────────
function FaqForm({
  initial, onDone,
}: {
  initial?: { id: string; questionKa: string; questionEn: string; answerKa: string; answerEn: string; sortOrder: number };
  onDone: () => void;
}) {
  const [questionKa, setQuestionKa] = useState(initial?.questionKa ?? '');
  const [questionEn, setQuestionEn] = useState(initial?.questionEn ?? '');
  const [answerKa, setAnswerKa] = useState(initial?.answerKa ?? '');
  const [answerEn, setAnswerEn] = useState(initial?.answerEn ?? '');
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    const data = { questionKa, questionEn, answerKa, answerEn, sortOrder: Number(sortOrder) };
    if (initial) await updateFaq(initial.id, data);
    else await createFaq(data);
    setLoading(false);
    onDone();
  };

  return (
    <div className="space-y-3 mt-4 pt-4 border-t border-[#465940]/10">
      <div className="w-24">
        <label className="text-xs font-semibold text-[#465940]/70 block mb-1">თანმიმდევრობა</label>
        <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} className={inputCls} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-[#465940]/70 block mb-1">კითხვა (ქართ.)</label>
          <input value={questionKa} onChange={(e) => setQuestionKa(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="text-xs font-semibold text-[#465940]/70 block mb-1">კითხვა (ინგლ.)</label>
          <input value={questionEn} onChange={(e) => setQuestionEn(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="text-xs font-semibold text-[#465940]/70 block mb-1">პასუხი (ქართ.)</label>
          <textarea rows={3} value={answerKa} onChange={(e) => setAnswerKa(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="text-xs font-semibold text-[#465940]/70 block mb-1">პასუხი (ინგლ.)</label>
          <textarea rows={3} value={answerEn} onChange={(e) => setAnswerEn(e.target.value)} className={inputCls} />
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={submit} disabled={loading || !questionKa || !questionEn}
          className="bg-[#465940] text-[#FDFBF0] text-sm font-bold px-5 py-2 rounded-full hover:bg-[#465940] disabled:opacity-50 transition">
          {loading ? 'ინახება...' : initial ? 'შენახვა' : 'დამატება'}
        </button>
        <button onClick={onDone} className="text-sm text-[#465940]/60 hover:text-[#465940]/80 px-4 py-2 transition">გაუქმება</button>
      </div>
    </div>
  );
}

// ── Main Client Component ─────────────────────────────────────────────────────
function SettingsForm({ settings }: { settings: any }) {
  const [heroTitleKa, setHeroTitleKa] = useState(settings?.heroTitleKa ?? '');
  const [heroTitleEn, setHeroTitleEn] = useState(settings?.heroTitleEn ?? '');
  const [heroSubtitleKa, setHeroSubtitleKa] = useState(settings?.heroSubtitleKa ?? '');
  const [heroSubtitleEn, setHeroSubtitleEn] = useState(settings?.heroSubtitleEn ?? '');
  const [ctaTitleKa, setCtaTitleKa] = useState(settings?.ctaTitleKa ?? '');
  const [ctaTitleEn, setCtaTitleEn] = useState(settings?.ctaTitleEn ?? '');
  const [ctaSubtitleKa, setCtaSubtitleKa] = useState(settings?.ctaSubtitleKa ?? '');
  const [ctaSubtitleEn, setCtaSubtitleEn] = useState(settings?.ctaSubtitleEn ?? '');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const submit = async () => {
    setLoading(true);
    await updateSettings({ heroTitleKa, heroTitleEn, heroSubtitleKa, heroSubtitleEn, ctaTitleKa, ctaTitleEn, ctaSubtitleKa, ctaSubtitleEn });
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className={card}>
      <h2 className="text-lg font-black text-[#465940] mb-5">გვერდის ტექსტები</h2>

      <p className="text-xs font-bold text-[#465940] uppercase tracking-widest mb-3">Hero სექცია (ზედა)</p>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div>
          <label className="text-xs font-semibold text-[#465940]/70 block mb-1">სათაური (ქართ.)</label>
          <input value={heroTitleKa} onChange={(e) => setHeroTitleKa(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="text-xs font-semibold text-[#465940]/70 block mb-1">სათაური (ინგლ.)</label>
          <input value={heroTitleEn} onChange={(e) => setHeroTitleEn(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="text-xs font-semibold text-[#465940]/70 block mb-1">ქვესათაური (ქართ.)</label>
          <textarea rows={2} value={heroSubtitleKa} onChange={(e) => setHeroSubtitleKa(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="text-xs font-semibold text-[#465940]/70 block mb-1">ქვესათაური (ინგლ.)</label>
          <textarea rows={2} value={heroSubtitleEn} onChange={(e) => setHeroSubtitleEn(e.target.value)} className={inputCls} />
        </div>
      </div>

      <p className="text-xs font-bold text-[#465940] uppercase tracking-widest mb-3">CTA სექცია (ქვედა)</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-[#465940]/70 block mb-1">სათაური (ქართ.)</label>
          <input value={ctaTitleKa} onChange={(e) => setCtaTitleKa(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="text-xs font-semibold text-[#465940]/70 block mb-1">სათაური (ინგლ.)</label>
          <input value={ctaTitleEn} onChange={(e) => setCtaTitleEn(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="text-xs font-semibold text-[#465940]/70 block mb-1">ქვესათაური (ქართ.)</label>
          <input value={ctaSubtitleKa} onChange={(e) => setCtaSubtitleKa(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="text-xs font-semibold text-[#465940]/70 block mb-1">ქვესათაური (ინგლ.)</label>
          <input value={ctaSubtitleEn} onChange={(e) => setCtaSubtitleEn(e.target.value)} className={inputCls} />
        </div>
      </div>

      <button onClick={submit} disabled={loading}
        className="mt-4 bg-[#465940] text-[#FDFBF0] text-sm font-bold px-5 py-2 rounded-full hover:bg-[#465940] disabled:opacity-50 transition">
        {loading ? 'ინახება...' : saved ? '✓ შენახულია' : 'შენახვა'}
      </button>
    </div>
  );
}

export default function HowItWorksAdminClient({
  steps, faqs, settings,
}: {
  steps: any[];
  faqs: any[];
  settings: any;
}) {
  const [editingStep, setEditingStep] = useState<string | null>(null);
  const [addingStep, setAddingStep] = useState(false);
  const [editingFaq, setEditingFaq] = useState<string | null>(null);
  const [addingFaq, setAddingFaq] = useState(false);

  const confirmDelete = async (fn: () => Promise<void>) => {
    if (confirm('დარწმუნებული ხარ?')) await fn();
  };

  return (
    <div className="p-8 space-y-10">
      <div>
        <h1 className="text-3xl font-black text-[#465940]">როგორ მუშაობს — კონტენტი</h1>
        <p className="text-[#465940]/60 text-sm mt-1">ნაბიჯები და ხშირი კითხვები</p>
      </div>

      <SettingsForm settings={settings} />

      {/* ── Steps ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-[#465940]">ნაბიჯები</h2>
          <button onClick={() => { setAddingStep(true); setEditingStep(null); }}
            className="bg-[#465940] text-[#FDFBF0] text-sm font-bold px-5 py-2 rounded-full hover:bg-[#465940] transition">
            + ნაბიჯის დამატება
          </button>
        </div>

        {addingStep && (
          <div className={card + ' mb-4'}>
            <p className="font-bold text-[#465940]">ახალი ნაბიჯი</p>
            <StepForm onDone={() => setAddingStep(false)} />
          </div>
        )}

        <div className="space-y-3">
          {steps.map((step) => (
            <div key={step.id} className={card}>
              {editingStep === step.id ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{step.icon}</span>
                    <p className="font-bold text-[#465940]">{step.titleKa}</p>
                  </div>
                  <StepForm initial={step} onDone={() => setEditingStep(null)} />
                </>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl mt-0.5">{step.icon}</span>
                    <div>
                      <p className="font-bold text-[#465940]">{step.titleKa}</p>
                      <p className="text-xs text-[#465940]/60">{step.titleEn}</p>
                      <p className="text-sm text-[#465940]/70 mt-1">{step.descKa}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => { setEditingStep(step.id); setAddingStep(false); }}
                      className="text-xs text-[#465940]/60 hover:text-[#FDFBF0] transition font-medium">რედაქტირება</button>
                    <button onClick={() => confirmDelete(() => deleteStep(step.id))}
                      className="text-xs text-[#465940]/60 hover:text-[#FDFBF0] transition font-medium">წაშლა</button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {steps.length === 0 && (
            <div className={card + ' text-center text-[#465940]/60 text-sm py-10'}>ნაბიჯები არ არის</div>
          )}
        </div>
      </section>

      {/* ── FAQs ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-[#465940]">ხშირი კითხვები (FAQ)</h2>
          <button onClick={() => { setAddingFaq(true); setEditingFaq(null); }}
            className="bg-[#465940] text-[#FDFBF0] text-sm font-bold px-5 py-2 rounded-full hover:bg-[#465940] transition">
            + კითხვის დამატება
          </button>
        </div>

        {addingFaq && (
          <div className={card + ' mb-4'}>
            <p className="font-bold text-[#465940]">ახალი კითხვა</p>
            <FaqForm onDone={() => setAddingFaq(false)} />
          </div>
        )}

        <div className="space-y-3">
          {faqs.map((faq) => (
            <div key={faq.id} className={card}>
              {editingFaq === faq.id ? (
                <>
                  <p className="font-bold text-[#465940]">{faq.questionKa}</p>
                  <FaqForm initial={faq} onDone={() => setEditingFaq(null)} />
                </>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-[#465940]">— {faq.questionKa}</p>
                    <p className="text-xs text-[#465940]/60 mb-1">— {faq.questionEn}</p>
                    <p className="text-sm text-[#465940]/70">{faq.answerKa}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => { setEditingFaq(faq.id); setAddingFaq(false); }}
                      className="text-xs text-[#465940]/60 hover:text-[#FDFBF0] transition font-medium">რედაქტირება</button>
                    <button onClick={() => confirmDelete(() => deleteFaq(faq.id))}
                      className="text-xs text-[#465940]/60 hover:text-[#FDFBF0] transition font-medium">წაშლა</button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {faqs.length === 0 && (
            <div className={card + ' text-center text-[#465940]/60 text-sm py-10'}>კითხვები არ არის</div>
          )}
        </div>
      </section>
    </div>
  );
}
