'use client';

import { useState, useRef } from 'react';
import { updateHomePage } from './actions';
import { uploadImage } from '@/lib/uploadImage';

type S = Record<string, string | number>;

const TABS = ['hero', 'features', 'samples', 'pricing'] as const;
type Tab = typeof TABS[number];
const TAB_LABELS: Record<Tab, string> = {
  hero: 'Hero',
  features: 'სარგებლები',
  samples: 'კვების ფოტოები',
  pricing: 'ფასები',
};

// ── Image upload field ─────────────────────────────────────────────────────────
function ImageField({ label, name, value, onChange }: {
  label: string; name: string; value: string; onChange: (k: string, v: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handle = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(name, url);
    } catch { alert('ატვირთვა ვერ მოხერხდა'); }
    finally { setUploading(false); }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) handle(file);
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition flex items-center justify-center overflow-hidden ${
          dragOver ? 'border-[#ff7f50] bg-[#fff3ee]' : 'border-gray-200 hover:border-[#ff7f50] hover:bg-[#fef9f7]'
        }`}
        style={{ minHeight: value ? 160 : 100 }}
      >
        {uploading ? (
          <div className="text-center py-6">
            <div className="text-2xl mb-2">⏳</div>
            <p className="text-xs text-gray-500 font-semibold">იტვირთება...</p>
          </div>
        ) : value ? (
          <>
            <img src={value} alt="" className="w-full h-full object-cover absolute inset-0" style={{ maxHeight: 200 }} />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition">
              <span className="text-white font-bold text-sm bg-black/50 px-4 py-2 rounded-full">შეცვლა</span>
            </div>
          </>
        ) : (
          <div className="text-center py-6 px-4">
            <div className="text-3xl mb-2">📷</div>
            <p className="text-xs font-semibold text-gray-600">ჩააგდე ფოტო ან დააჭირე</p>
            <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WEBP</p>
          </div>
        )}
      </div>
      {value && (
        <input value={value} onChange={e => onChange(name, e.target.value)}
          placeholder="URL"
          className="mt-2 w-full border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-500 focus:outline-none focus:border-[#ff7f50]"
          onClick={e => e.stopPropagation()} />
      )}
      <input ref={fileRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handle(f); }} />
    </div>
  );
}

// ── Text field ─────────────────────────────────────────────────────────────────
function Field({ label, name, value, onChange, textarea }: {
  label: string; name: string; value: string | number; onChange: (k: string, v: string) => void; textarea?: boolean;
}) {
  const cls = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#ff7f50]";
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
      {textarea
        ? <textarea rows={2} value={value as string} onChange={e => onChange(name, e.target.value)} className={cls} />
        : <input value={value as string} onChange={e => onChange(name, e.target.value)} className={cls} />
      }
    </div>
  );
}

function BiField({ labelKa, labelEn, nameKa, nameEn, s, onChange, textarea }: {
  labelKa: string; labelEn: string; nameKa: string; nameEn: string; s: S; onChange: (k: string, v: string) => void; textarea?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label={labelKa} name={nameKa} value={s[nameKa] ?? ''} onChange={onChange} textarea={textarea} />
      <Field label={labelEn} name={nameEn} value={s[nameEn] ?? ''} onChange={onChange} textarea={textarea} />
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function HomepageAdminClient({ settings }: { settings: S }) {
  const [s, setS] = useState<S>(settings);
  const [tab, setTab] = useState<Tab>('hero');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (k: string, v: string) => { setS(prev => ({ ...prev, [k]: v })); setSaved(false); };

  const save = async () => {
    setSaving(true);
    await updateHomePage(s);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900">მთავარი გვერდი</h1>
          <p className="text-gray-400 text-sm mt-1">ყველა ტექსტი და ფოტო მართეთ აქედან</p>
        </div>
        <button onClick={save} disabled={saving}
          className={`px-6 py-2.5 rounded-full font-bold text-sm transition disabled:opacity-50 ${saved ? 'bg-green-500 text-white' : 'bg-[#ff7f50] hover:bg-[#e86e40] text-white'}`}>
          {saving ? 'ინახება...' : saved ? '✓ შენახულია' : 'შენახვა'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition ${tab === t ? 'bg-[#ff7f50] text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-[#ff7f50] hover:text-[#ff7f50]'}`}>
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">

        {/* HERO */}
        {tab === 'hero' && <>
          <h2 className="font-black text-gray-800 text-lg border-b pb-2">Hero სექცია</h2>
          <BiField labelKa="Badge ქართ." labelEn="Badge ინგლ." nameKa="heroBadgeKa" nameEn="heroBadgeEn" s={s} onChange={set} />
          <BiField labelKa="სათაური ქართ." labelEn="სათაური ინგლ." nameKa="heroTitleKa" nameEn="heroTitleEn" s={s} onChange={set} textarea />
          <BiField labelKa="ტექსტი ქართ." labelEn="ტექსტი ინგლ." nameKa="heroTextKa" nameEn="heroTextEn" s={s} onChange={set} textarea />
          <BiField labelKa="ღილაკი 1 ქართ." labelEn="ღილაკი 1 ინგლ." nameKa="heroCta1Ka" nameEn="heroCta1En" s={s} onChange={set} />
          <BiField labelKa="ღილაკი 2 ქართ." labelEn="ღილაკი 2 ინგლ." nameKa="heroCta2Ka" nameEn="heroCta2En" s={s} onChange={set} />
          <ImageField label="Hero ფოტო" name="heroImageUrl" value={s.heroImageUrl as string ?? ''} onChange={set} />
        </>}

        {/* FEATURES */}
        {tab === 'features' && <>
          <h2 className="font-black text-gray-800 text-lg border-b pb-2">სარგებლების სექცია</h2>
          <BiField labelKa="სექციის სათაური ქართ." labelEn="სექციის სათაური ინგლ." nameKa="featuresTitleKa" nameEn="featuresTitleEn" s={s} onChange={set} />
          {[1,2,3].map(i => (
            <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3">
              <p className="text-xs font-black text-gray-400 uppercase">ბარათი {i}</p>
              <Field label="ემოჯი / ხატი" name={`feature${i}Icon`} value={s[`feature${i}Icon`] ?? ''} onChange={set} />
              <BiField labelKa={`სათაური ${i} ქართ.`} labelEn={`სათაური ${i} ინგლ.`} nameKa={`feature${i}TitleKa`} nameEn={`feature${i}TitleEn`} s={s} onChange={set} />
              <BiField labelKa={`აღწერა ${i} ქართ.`} labelEn={`აღწერა ${i} ინგლ.`} nameKa={`feature${i}DescKa`} nameEn={`feature${i}DescEn`} s={s} onChange={set} textarea />
            </div>
          ))}
        </>}

        {/* SAMPLES */}
        {tab === 'samples' && <>
          <h2 className="font-black text-gray-800 text-lg border-b pb-2">კვების ფოტოების სექცია</h2>
          <p className="text-xs text-gray-400 bg-gray-50 rounded-xl px-4 py-3">
            ფოტოები და კერძების სახელები ავტომატურად იტვირთება რეცეპტებიდან (საუზმე, სადილი, სნექი, ვახშამი). რეცეპტს რომ ფოტო დაამატებ, აქაც გამოჩნდება.
          </p>
          <BiField labelKa="სექციის სათაური ქართ." labelEn="სექციის სათაური ინგლ." nameKa="sampleTitleKa" nameEn="sampleTitleEn" s={s} onChange={set} />
          <BiField labelKa="ქვესათაური ქართ." labelEn="ქვესათაური ინგლ." nameKa="sampleSubtitleKa" nameEn="sampleSubtitleEn" s={s} onChange={set} />
        </>}

        {/* PRICING */}
        {tab === 'pricing' && <>
          <h2 className="font-black text-gray-800 text-lg border-b pb-2">ფასების სექცია</h2>
          <BiField labelKa="სათაური ქართ." labelEn="სათაური ინგლ." nameKa="pricingTitleKa" nameEn="pricingTitleEn" s={s} onChange={set} />
          <BiField labelKa="ქვესათაური ქართ." labelEn="ქვესათაური ინგლ." nameKa="pricingSubtitleKa" nameEn="pricingSubtitleEn" s={s} onChange={set} textarea />
          {[1,2].map(i => (
            <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3">
              <p className="text-xs font-black text-gray-400 uppercase">გეგმა {i}</p>
              <BiField labelKa={`გეგმა ${i} სახელი ქართ.`} labelEn={`გეგმა ${i} სახელი ინგლ.`} nameKa={`plan${i}NameKa`} nameEn={`plan${i}NameEn`} s={s} onChange={set} />
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">ფასი (₾)</label>
                <input type="number" value={s[`plan${i}Price`] ?? ''}
                  onChange={e => set(`plan${i}Price`, e.target.value)}
                  className="w-32 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#ff7f50]" />
              </div>
              {[1,2,3].map(j => (
                <BiField key={j} labelKa={`სარგებელი ${j} ქართ.`} labelEn={`სარგებელი ${j} ინგლ.`}
                  nameKa={`plan${i}Feature${j}Ka`} nameEn={`plan${i}Feature${j}En`} s={s} onChange={set} />
              ))}
            </div>
          ))}
        </>}
      </div>
    </div>
  );
}
