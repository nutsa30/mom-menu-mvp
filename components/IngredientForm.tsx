'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { uploadImage } from '@/lib/uploadImage';

const AGE_GROUPS = [
  { value: 'FROM_6',  label: '6 თვიდან'  },
  { value: 'FROM_9',  label: '9 თვიდან'  },
  { value: 'FROM_12', label: '12 თვიდან' },
  { value: 'FROM_24', label: '24 თვიდან' },
];

const SEASONS = [
  { value: 'SPRING', ka: '🌸 გაზაფხული', en: '🌸 Spring' },
  { value: 'SUMMER', ka: '☀️ ზაფხული',   en: '☀️ Summer' },
  { value: 'AUTUMN', ka: '🍂 შემოდგომა',  en: '🍂 Autumn' },
  { value: 'WINTER', ka: '❄️ ზამთარი',   en: '❄️ Winter' },
];

const NUTRIENTS = [
  { key: 'calories',     label: 'კალორია',         unit: 'kcal', isInt: true },
  { key: 'proteinGrams', label: 'ცილა',             unit: 'g'   },
  { key: 'carbsGrams',   label: 'ნახშირწყლები',    unit: 'g'   },
  { key: 'fatGrams',     label: 'ცხიმი',            unit: 'g'   },
  { key: 'fiberGrams',   label: 'ბოჭკო',            unit: 'g'   },
  { key: 'calciumMg',    label: 'კალციუმი',         unit: 'mg'  },
  { key: 'ironMg',       label: 'რკინა',            unit: 'mg'  },
  { key: 'zincMg',       label: 'თუთია (Zinc)',      unit: 'mg'  },
  { key: 'potassiumMg',  label: 'კალიუმი',          unit: 'mg'  },
  { key: 'magnesiumMg',  label: 'მაგნიუმი',         unit: 'mg'  },
  { key: 'phosphorusMg', label: 'ფოსფორი',          unit: 'mg'  },
  { key: 'sodiumMg',     label: 'ნატრიუმი',         unit: 'mg'  },
  { key: 'vitaminAmcg',  label: 'A ვიტამინი',       unit: 'mcg' },
  { key: 'vitaminCmg',   label: 'C ვიტამინი',       unit: 'mg'  },
  { key: 'vitaminDmcg',  label: 'D ვიტამინი',       unit: 'mcg' },
  { key: 'vitaminEmg',   label: 'E ვიტამინი',       unit: 'mg'  },
  { key: 'vitaminKmcg',  label: 'K ვიტამინი',       unit: 'mcg' },
  { key: 'vitaminB6mg',  label: 'B6 ვიტამინი',      unit: 'mg'  },
  { key: 'vitaminB12mcg',label: 'B12 ვიტამინი',     unit: 'mcg' },
  { key: 'folateMcg',    label: 'ფოლატი (B9)',       unit: 'mcg' },
  { key: 'omega3Mg',     label: 'Omega-3',            unit: 'mg'  },
];

const inp = 'w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#ff7f50] transition text-sm bg-white';
const lbl = 'block text-sm font-semibold text-gray-700 mb-1.5';
const sec = 'bg-white rounded-2xl border border-gray-100 shadow-sm p-6';

type Props = { ingredient?: any; backUrl?: string };

export default function IngredientForm({ ingredient, backUrl = '/admin/ingredients' }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const isEdit = !!ingredient;

  const [titleKa, setTitleKa] = useState(ingredient?.titleKa ?? '');
  const [titleEn, setTitleEn] = useState(ingredient?.titleEn ?? '');
  const [type, setType] = useState(ingredient?.type ?? 'FRUIT');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(ingredient?.imageUrl ?? '');
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [ageGroups, setAgeGroups] = useState<string[]>(ingredient?.ageGroups ?? []);
  const [seasons, setSeasons] = useState<string[]>(ingredient?.seasons ?? []);
  const [benefitsKa, setBenefitsKa] = useState<string>((ingredient?.benefitsKa ?? []).join('\n'));
  const [benefitsEn, setBenefitsEn] = useState<string>((ingredient?.benefitsEn ?? []).join('\n'));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const setImage = (f: File) => {
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
    setError('');
  };

  const initNutrients: Record<string, string> = {};
  NUTRIENTS.forEach(({ key }) => {
    if (ingredient?.[key] != null && Number(ingredient[key]) > 0) initNutrients[key] = String(ingredient[key]);
  });
  const [nutrients, setNutrients] = useState<Record<string, string>>(initNutrients);

  const toggle = (arr: string[], set: (v: string[]) => void, val: string) =>
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!titleKa || !titleEn) { setError('სახელი სავალდებულოა'); return; }
    setSaving(true);

    let finalImageUrl = imagePreview.startsWith('blob:') ? '' : imagePreview;
    if (imageFile) {
      setUploading(true);
      try {
        finalImageUrl = await uploadImage(imageFile);
      } catch (err: any) {
        setError('ფოტოს ატვირთვა ვერ მოხერხდა: ' + err.message);
        setUploading(false);
        setSaving(false);
        return;
      }
      setUploading(false);
    }

    const nutrientPayload: Record<string, number | null> = {};
    NUTRIENTS.forEach(({ key }) => {
      nutrientPayload[key] = nutrients[key] ? Number(nutrients[key]) : null;
    });

    const url = isEdit ? `/api/ingredients/${ingredient.id}` : '/api/ingredients';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titleKa, titleEn, type,
          imageUrl: finalImageUrl || null,
          ageGroups, seasons,
          benefitsKa: benefitsKa.split('\n').map(s => s.trim()).filter(Boolean),
          benefitsEn: benefitsEn.split('\n').map(s => s.trim()).filter(Boolean),
          ...nutrientPayload,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Server error');
      router.push(backUrl);
      router.refresh();
    } catch (err: any) {
      setError('შეცდომა: ' + err.message);
      setSaving(false);
    }
  };

  const busy = uploading || saving;

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <a href={backUrl} className="text-gray-400 hover:text-gray-600 text-sm transition">← უკან</a>
        <span className="text-gray-300">/</span>
        <h1 className="text-2xl font-black text-gray-900">{isEdit ? 'რედაქტირება' : 'ახალი ხილი / ბოსტნეული'}</h1>
      </div>

      {error && <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Titles */}
        <div className={sec}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>სახელი ქართულად</label>
              <input className={inp} value={titleKa} onChange={e => setTitleKa(e.target.value)} placeholder="ვაშლი" required />
            </div>
            <div>
              <label className={lbl}>სახელი ინგლისურად</label>
              <input className={inp} value={titleEn} onChange={e => setTitleEn(e.target.value)} placeholder="Apple" required />
            </div>
          </div>
        </div>

        {/* Type */}
        <div className={sec}>
          <label className={lbl}>ტიპი</label>
          <div className="grid grid-cols-2 gap-2">
            {[{ v: 'FRUIT', l: '🍎 ხილი' }, { v: 'VEGETABLE', l: '🥦 ბოსტნეული' }].map(opt => (
              <button key={opt.v} type="button" onClick={() => setType(opt.v)}
                className={`py-3 rounded-xl text-sm font-bold border-2 transition ${type === opt.v ? 'border-[#ff7f50] bg-[#fff8f6] text-[#ff7f50]' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}>
                {opt.l}
              </button>
            ))}
          </div>
        </div>

        {/* Image */}
        <div className={sec}>
          <p className={lbl}>ფოტო</p>
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f && f.type.startsWith('image/')) setImage(f); }}
            className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition flex items-center justify-center overflow-hidden ${dragOver ? 'border-[#ff7f50] bg-[#fff3ee]' : 'border-gray-200 hover:border-[#ff7f50] hover:bg-[#fef9f7]'}`}
            style={{ minHeight: imagePreview ? 220 : 140 }}
          >
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="" className="w-full object-cover absolute inset-0" style={{ maxHeight: 260 }} />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                  <span className="text-white font-bold text-sm bg-black/50 px-4 py-2 rounded-full">შეცვლა</span>
                </div>
              </>
            ) : (
              <div className="text-center py-8 px-4">
                <div className="text-4xl mb-3">📷</div>
                <p className="text-sm font-semibold text-gray-600">ჩააგდე ფოტო ან დააჭირე</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP</p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) setImage(f); }} />
          {imageFile && <p className="mt-2 text-xs text-gray-400">{imageFile.name} · {(imageFile.size / 1024 / 1024).toFixed(1)} MB</p>}
        </div>

        {/* Seasons */}
        <div className={sec}>
          <p className={lbl}>სეზონი</p>
          <div className="grid grid-cols-2 gap-2">
            {SEASONS.map(s => (
              <label key={s.value} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${seasons.includes(s.value) ? 'border-[#ff7f50] bg-[#fff8f6]' : 'border-gray-100 hover:border-gray-200'}`}>
                <input type="checkbox" className="hidden" checked={seasons.includes(s.value)} onChange={() => toggle(seasons, setSeasons, s.value)} />
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${seasons.includes(s.value) ? 'bg-[#ff7f50] border-[#ff7f50]' : 'border-gray-300'}`}>
                  {seasons.includes(s.value) && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <span className="text-sm font-medium text-gray-700">{s.ka}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Age Groups */}
        <div className={sec}>
          <p className={lbl}>ასაკობრივი ჯგუფი</p>
          <div className="grid grid-cols-2 gap-2">
            {AGE_GROUPS.map(ag => (
              <label key={ag.value} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${ageGroups.includes(ag.value) ? 'border-[#ff7f50] bg-[#fff8f6]' : 'border-gray-100 hover:border-gray-200'}`}>
                <input type="checkbox" className="hidden" checked={ageGroups.includes(ag.value)} onChange={() => toggle(ageGroups, setAgeGroups, ag.value)} />
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${ageGroups.includes(ag.value) ? 'bg-[#ff7f50] border-[#ff7f50]' : 'border-gray-300'}`}>
                  {ageGroups.includes(ag.value) && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <span className="text-sm font-medium text-gray-700">{ag.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className={sec}>
          <p className={lbl}>სარგებლობა (Benefits)</p>
          <p className="text-xs text-gray-400 mb-3">თითოეული სარგებელი ახალ სტრიქონზე — ქართული და ინგლისური ცალ-ცალკე</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>ქართულად</label>
              <textarea
                className={`${inp} min-h-[120px] resize-none`}
                value={benefitsKa}
                onChange={e => setBenefitsKa(e.target.value)}
                placeholder={'ენერგია\nტვინის განვითარება\nკუნთები'}
              />
            </div>
            <div>
              <label className={lbl}>ინგლისურად</label>
              <textarea
                className={`${inp} min-h-[120px] resize-none`}
                value={benefitsEn}
                onChange={e => setBenefitsEn(e.target.value)}
                placeholder={'energy\nbrain support\nmuscle function'}
              />
            </div>
          </div>
        </div>

        {/* Nutrients */}
        <div className={sec}>
          <p className={lbl}>ვიტამინები და მინერალები (100გ-ზე)</p>
          <div className="space-y-2">
            {NUTRIENTS.map(({ key, label, unit }) => (
              <div key={key} className="flex items-center gap-3">
                <label className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer">
                  <div
                    onClick={() => setNutrients(prev => {
                      const next = { ...prev };
                      if (next[key] !== undefined) delete next[key];
                      else next[key] = '';
                      return next;
                    })}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition ${nutrients[key] !== undefined ? 'bg-[#ff7f50] border-[#ff7f50]' : 'border-gray-300'}`}
                  >
                    {nutrients[key] !== undefined && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <span className="text-sm text-gray-700 truncate">{label}</span>
                </label>
                {nutrients[key] !== undefined ? (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={nutrients[key]}
                      onChange={e => setNutrients(prev => ({ ...prev, [key]: e.target.value }))}
                      className="w-24 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-right focus:outline-none focus:border-[#ff7f50]"
                    />
                    <span className="text-xs text-gray-400 w-8">{unit}</span>
                  </div>
                ) : (
                  <span className="text-gray-300 text-sm w-36 text-right flex-shrink-0">—</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={busy}
          className="w-full bg-[#ff7f50] hover:bg-[#e86e40] disabled:opacity-60 text-white py-3.5 rounded-2xl font-bold text-sm transition">
          {uploading ? 'ფოტო იტვირთება...' : saving ? 'ინახება...' : (isEdit ? 'განახლება' : 'შენახვა')}
        </button>
      </form>
    </div>
  );
}
