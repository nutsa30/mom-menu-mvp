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

const NUTRIENTS = [
  { key: 'carbsGrams',   label: 'ნახშირწყლები',    unit: 'g'   },
  { key: 'fatGrams',     label: 'ცხიმი',            unit: 'g'   },
  { key: 'fiberGrams',   label: 'ბოჭკო',            unit: 'g'   },
  { key: 'calciumMg',   label: 'კალციუმი',          unit: 'mg'  },
  { key: 'ironMg',      label: 'რკინა',             unit: 'mg'  },
  { key: 'zincMg',      label: 'თუთია (Zinc)',       unit: 'mg'  },
  { key: 'potassiumMg', label: 'კალიუმი',           unit: 'mg'  },
  { key: 'magnesiumMg', label: 'მაგნიუმი',          unit: 'mg'  },
  { key: 'phosphorusMg',label: 'ფოსფორი',           unit: 'mg'  },
  { key: 'sodiumMg',    label: 'ნატრიუმი',          unit: 'mg'  },
  { key: 'vitaminAmcg', label: 'A ვიტამინი',        unit: 'mcg' },
  { key: 'vitaminCmg',  label: 'C ვიტამინი',        unit: 'mg'  },
  { key: 'vitaminDmcg', label: 'D ვიტამინი',        unit: 'mcg' },
  { key: 'vitaminEmg',  label: 'E ვიტამინი',        unit: 'mg'  },
  { key: 'vitaminKmcg', label: 'K ვიტამინი',        unit: 'mcg' },
  { key: 'vitaminB6mg', label: 'B6 ვიტამინი',       unit: 'mg'  },
  { key: 'vitaminB12mcg',label: 'B12 ვიტამინი',     unit: 'mcg' },
  { key: 'folateMcg',   label: 'ფოლატი (B9)',        unit: 'mcg' },
  { key: 'omega3Mg',    label: 'Omega-3',             unit: 'mg'  },
];

const ALLERGEN_LIST = [
  { key: 'dairy',      label: 'რძის პროდუქტი'   },
  { key: 'egg',        label: 'კვერცხი'          },
  { key: 'gluten',     label: 'გლუტენი'          },
  { key: 'peanut',     label: 'არაქისი'           },
  { key: 'treeNuts',   label: 'კაკალი'            },
  { key: 'soy',        label: 'სოია'             },
  { key: 'fish',       label: 'თევზი'            },
  { key: 'shellfish',  label: 'კიბოსნაირი'        },
  { key: 'molluscs',   label: 'მოლუსკები'         },
  { key: 'sesame',     label: 'სეზამი'            },
  { key: 'corn',       label: 'სიმინდი'           },
  { key: 'tomato',     label: 'პომიდვრი'          },
  { key: 'strawberry', label: 'მარწყვი'           },
  { key: 'citrus',     label: 'ციტრუსი'           },
  { key: 'mustard',    label: 'მდოგვი'            },
  { key: 'celery',     label: 'ნიახური'           },
  { key: 'sulphites',  label: 'სულფიტები'         },
  { key: 'lupin',      label: 'ლუპინი'            },
];

const inp = 'w-full px-4 py-3 rounded-xl border border-[#465940]/20 focus:outline-none focus:border-[#465940] transition text-sm text-[#465940] bg-white';
const lbl = 'block text-sm font-semibold text-[#465940] mb-1.5';
const sec = 'bg-[#FDFBF0] rounded-2xl border border-[#465940]/10 shadow-sm p-6';

export default function NewMealPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [titleKa, setTitleKa] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [descKa, setDescKa] = useState('');
  const [descEn, setDescEn] = useState('');
  const [ingredientsKa, setIngredientsKa] = useState('');
  const [ingredientsEn, setIngredientsEn] = useState('');
  const [mealType, setMealType] = useState('BREAKFAST');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [ageGroups, setAgeGroups] = useState<string[]>([]);
  const [allergens, setAllergens] = useState<string[]>([]);
  const [nutrients, setNutrients] = useState<Record<string, string>>({});

  const [blwNoteKa, setBlwNoteKa] = useState('');
  const [blwNoteEn, setBlwNoteEn] = useState('');
  const [pureeNoteKa, setPureeNoteKa] = useState('');
  const [pureeNoteEn, setPureeNoteEn] = useState('');

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggle = (arr: string[], set: (v: string[]) => void, val: string) =>
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  const setImage = (f: File) => {
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
    setError('');
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setImage(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith('image/')) setImage(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!ageGroups.length) { setError('ასაკობრივი ჯგუფი სავალდებულოა'); return; }
    setSaving(true);

    let imageUrl = '';
    if (imageFile) {
      setUploading(true);
      try {
        imageUrl = await uploadImage(imageFile);
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

    try {
      const res = await fetch('/api/dishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titleKa, titleEn,
          descriptionKa: descKa, descriptionEn: descEn,
          ingredientsKa: ingredientsKa.split(',').map((s) => s.trim()).filter(Boolean),
          ingredientsEn: ingredientsEn.split(',').map((s) => s.trim()).filter(Boolean),
          mealType, ageGroups, allergens, imageUrl,
          calories: calories ? Number(calories) : null,
          proteinGrams: protein ? Number(protein) : null,
          ...nutrientPayload,
          blwNoteKa: blwNoteKa || null,
          blwNoteEn: blwNoteEn || null,
          pureeNoteKa: pureeNoteKa || null,
          pureeNoteEn: pureeNoteEn || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? 'Server error');
      }
      router.push('/admin/meals');
      router.refresh();
    } catch (err: any) {
      setError('შეცდომა: ' + err.message);
      setSaving(false);
    }
  };

  const busy = uploading || saving;

  return (
    <div className="p-6 max-w-3xl">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <a href="/admin/meals" className="text-[#465940]/60 hover:text-[#465940]/80 text-sm transition">← უკან</a>
        <span className="text-[#465940]/40">/</span>
        <h1 className="text-2xl font-black text-[#465940]">ახალი კერძი</h1>
      </div>

      {error && (
        <div className="mb-5 rounded-xl bg-[#465940] border border-[#FDFBF0]/30 px-4 py-3 text-sm font-medium text-[#FDFBF0]">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Image upload ── */}
        <div className={sec}>
          <p className={lbl}>ფოტო</p>
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition flex items-center justify-center overflow-hidden
              ${dragOver ? 'border-[#465940] bg-[#fff3ee]' : 'border-[#465940]/20 hover:border-[#465940] hover:bg-[#fef9f7]'}`}
            style={{ minHeight: imagePreview ? 240 : 160 }}
          >
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="" className="w-full h-full object-cover absolute inset-0" style={{ maxHeight: 280 }} />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                  <span className="text-[#FDFBF0] font-bold text-sm bg-black/50 px-4 py-2 rounded-full">შეცვლა</span>
                </div>
              </>
            ) : (
              <div className="text-center py-8 px-4">
                <div className="text-4xl mb-3">📷</div>
                <p className="text-sm font-semibold text-[#465940]/80">ჩააგდე ფოტო ან დააჭირე</p>
                <p className="text-xs text-[#465940]/60 mt-1">JPG, PNG, WEBP · ნებისმიერი ზომა</p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
          {imageFile && (
            <p className="mt-2 text-xs text-[#465940]/60">
              {imageFile.name} · {(imageFile.size / 1024 / 1024).toFixed(1)} MB
            </p>
          )}
        </div>

        {/* ── Basic info ── */}
        <div className={`${sec} space-y-4`}>
          <p className="text-sm font-bold text-[#465940]/70 uppercase tracking-wide">ძირითადი</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>სახელი ქართულად *</label>
              <input required className={inp} value={titleKa} onChange={(e) => setTitleKa(e.target.value)} placeholder="შვრიის ფაფა ბანანით" />
            </div>
            <div>
              <label className={lbl}>სახელი ინგლისურად *</label>
              <input required className={inp} value={titleEn} onChange={(e) => setTitleEn(e.target.value)} placeholder="Banana oat porridge" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>მომზადების წესი ქართულად</label>
              <textarea className={`${inp} min-h-[90px] resize-none`} value={descKa} onChange={(e) => setDescKa(e.target.value)} placeholder="ნაზი, თბილი საუზმე..." />
            </div>
            <div>
              <label className={lbl}>მომზადების წესი ინგლისურად</label>
              <textarea className={`${inp} min-h-[90px] resize-none`} value={descEn} onChange={(e) => setDescEn(e.target.value)} placeholder="A soft warm breakfast..." />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>ინგრედიენტები ქართ. (მძიმით)</label>
              <textarea className={`${inp} min-h-[80px] resize-none`} value={ingredientsKa} onChange={(e) => setIngredientsKa(e.target.value)} placeholder="შვრია, ბანანი, რძე" />
            </div>
            <div>
              <label className={lbl}>ინგრედიენტები ინგ. (comma)</label>
              <textarea className={`${inp} min-h-[80px] resize-none`} value={ingredientsEn} onChange={(e) => setIngredientsEn(e.target.value)} placeholder="oats, banana, milk" />
            </div>
          </div>
        </div>

        {/* ── Meal type + Age + Allergens ── */}
        <div className={`${sec} space-y-5`}>
          <p className="text-sm font-bold text-[#465940]/70 uppercase tracking-wide">კატეგორია</p>

          <div>
            <label className={lbl}>კვების ტიპი *</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { v: 'BREAKFAST', l: 'საუზმე', icon: '🌅' },
                { v: 'SNACK', l: 'სნექი', icon: '🍎' },
                { v: 'LUNCH', l: 'სადილი', icon: '🥗' },
                { v: 'DINNER', l: 'ვახშამი', icon: '🍲' },
              ].map(({ v, l, icon }) => (
                <button key={v} type="button" onClick={() => setMealType(v)}
                  className={`py-3 rounded-xl text-sm font-bold transition border ${mealType === v ? 'bg-[#465940] text-[#FDFBF0] border-[#465940]' : 'bg-[#FDFBF0] text-[#465940]/80 border-[#465940]/20 hover:border-[#465940]'}`}>
                  {icon}<br />{l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={lbl}>ასაკობრივი ჯგუფები *</label>
            <div className="grid grid-cols-2 gap-2">
              {AGE_GROUPS.map((ag) => (
                <label key={ag.value}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border cursor-pointer transition ${ageGroups.includes(ag.value) ? 'border-[#465940] bg-[#fff3ee]' : 'border-[#465940]/20 hover:border-[#465940]/30'}`}>
                  <input type="checkbox" className="accent-[#465940] w-4 h-4"
                    checked={ageGroups.includes(ag.value)}
                    onChange={() => toggle(ageGroups, setAgeGroups, ag.value)} />
                  <span className="text-sm font-medium text-[#465940]">{ag.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className={lbl}>ალერგენები (შეიცავს)</label>
            <div className="flex flex-wrap gap-2">
              {ALLERGEN_LIST.map(({ key, label }) => (
                <button key={key} type="button" onClick={() => toggle(allergens, setAllergens, key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${allergens.includes(key) ? 'bg-[#465940] text-[#FDFBF0]' : 'bg-[#465940]/10 text-[#465940]/80 hover:bg-[#465940]/15'}`}>
                  {allergens.includes(key) ? '✓ ' : ''}{label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Nutrition ── */}
        <div className={`${sec} space-y-4`}>
          <p className="text-sm font-bold text-[#465940]/70 uppercase tracking-wide">კვებითი ღირებულება</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>კალორიები (kcal)</label>
              <input type="number" min="0" className={inp} value={calories} onChange={(e) => setCalories(e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className={lbl}>ცილა — Protein (g)</label>
              <input type="number" min="0" step="0.1" className={inp} value={protein} onChange={(e) => setProtein(e.target.value)} placeholder="0" />
            </div>
          </div>

          <div className="rounded-xl border border-[#465940]/10 divide-y divide-[#465940]/5 overflow-hidden">
            {NUTRIENTS.map((n) => {
              const active = n.key in nutrients;
              return (
                <div key={n.key} className="flex items-center gap-3 px-4 py-3 bg-[#465940]/5/50">
                  <input type="checkbox" className="accent-[#465940] w-4 h-4 flex-shrink-0"
                    checked={active}
                    onChange={(e) => {
                      if (e.target.checked) setNutrients((p) => ({ ...p, [n.key]: '' }));
                      else setNutrients((p) => { const c = { ...p }; delete c[n.key]; return c; });
                    }} />
                  <span className="text-sm text-[#465940] flex-1">{n.label}</span>
                  {active ? (
                    <div className="flex items-center gap-1.5">
                      <input type="number" min="0" step="0.1" placeholder="0"
                        value={nutrients[n.key]}
                        onChange={(e) => setNutrients((p) => ({ ...p, [n.key]: e.target.value }))}
                        className="w-24 px-3 py-1.5 rounded-lg border border-[#465940]/20 focus:outline-none focus:border-[#465940] text-sm text-right" />
                      <span className="text-xs text-[#465940]/60 w-8">{n.unit}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-[#465940]/40 w-20 text-right">—</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* BLW & Puree */}
        <div className={`${sec} space-y-4`}>
          <p className="text-sm font-bold text-[#465940]/70 uppercase tracking-wide">BLW & Puree რჩევები</p>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={lbl}>BLW რჩევა (ქართ.)</label>
              <textarea className={`${inp} min-h-[80px] resize-none`} value={blwNoteKa} onChange={(e) => setBlwNoteKa(e.target.value)} placeholder="BLW მიწოდების წესი..." /></div>
            <div><label className={lbl}>BLW note (English)</label>
              <textarea className={`${inp} min-h-[80px] resize-none`} value={blwNoteEn} onChange={(e) => setBlwNoteEn(e.target.value)} placeholder="BLW serving tips..." /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={lbl}>Puree რჩევა (ქართ.)</label>
              <textarea className={`${inp} min-h-[80px] resize-none`} value={pureeNoteKa} onChange={(e) => setPureeNoteKa(e.target.value)} placeholder="ბლენდერში..." /></div>
            <div><label className={lbl}>Puree note (English)</label>
              <textarea className={`${inp} min-h-[80px] resize-none`} value={pureeNoteEn} onChange={(e) => setPureeNoteEn(e.target.value)} placeholder="Blend until smooth..." /></div>
          </div>
        </div>

        {/* ── Submit ── */}
        <div className="flex items-center gap-3 pb-8">
          <button type="submit" disabled={busy}
            className="flex-1 bg-[#465940] hover:bg-[#465940] disabled:opacity-50 text-[#FDFBF0] py-4 rounded-full font-black text-sm transition flex items-center justify-center gap-2">
            {uploading && <span className="animate-spin text-base">⏳</span>}
            {uploading ? 'ფოტო იტვირთება...' : saving ? 'ინახება...' : 'კერძის შენახვა'}
          </button>
          <a href="/admin/meals"
            className="px-6 py-4 rounded-full border border-[#465940]/20 text-[#465940]/80 font-bold text-sm hover:bg-[#465940]/5 transition text-center">
            გაუქმება
          </a>
        </div>
      </form>
    </div>
  );
}
