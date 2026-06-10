'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createBlog, updateBlog } from './actions';
import { uploadImage } from '@/lib/uploadImage';
import BlogBlockEditor from '@/components/BlogBlockEditor';

export type BlogFields = {
  titleKa: string;
  titleEn: string;
  contentKa: string;
  contentEn: string;
  imageUrl: string;
  images: string[];
  slug: string;
  isPublished: boolean;
};

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

type UploadBoxProps = {
  label: string;
  badge: string;
  hint: string;
  preview: string;
  onFile: (f: File) => void;
  onClear: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
  ratio: string;
};

function UploadBox({ label, badge, hint, preview, onFile, onClear, inputRef, ratio }: UploadBoxProps) {
  const [dragOver, setDragOver] = useState(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith('image/')) onFile(f);
  };

  return (
    <div>
      {/* Label row */}
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-xs font-semibold text-[#465940]/70">{label}</span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#465940]/10 text-[#465940]/60">{badge}</span>
      </div>
      <p className="text-[11px] text-[#465940]/50 mb-2">{hint}</p>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition flex items-center justify-center overflow-hidden
          ${dragOver ? 'border-[#465940] bg-[#465940]/5' : 'border-[#465940]/20 hover:border-[#465940] hover:bg-[#465940]/5'}`}
        style={{ minHeight: preview ? 160 : 110, aspectRatio: ratio }}
      >
        {preview ? (
          <>
            <img src={preview} alt="" className="w-full h-full object-cover absolute inset-0" />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition">
              <span className="text-[#FDFBF0] font-bold text-sm bg-black/50 px-4 py-2 rounded-full">შეცვლა</span>
            </div>
          </>
        ) : (
          <div className="text-center py-5 px-4">
            <div className="text-2xl mb-1.5">🖼️</div>
            <p className="text-xs font-semibold text-[#465940]/70">ჩააგდე ან დააჭირე</p>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      {preview && (
        <button type="button" onClick={onClear}
          className="mt-1.5 text-xs text-[#465940]/50 hover:text-[#465940] font-semibold transition">
          წაშლა
        </button>
      )}
    </div>
  );
}

export default function BlogForm({
  initialData,
  blogId,
}: {
  initialData?: BlogFields;
  blogId?: string;
}) {
  const router = useRouter();
  const thumbRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const [lang, setLang] = useState<'ka' | 'en'>('ka');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Thumbnail (blog list, 4:3)
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState(initialData?.imageUrl ?? '');

  // Detail cover (blog inner page, 16:7)
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState(initialData?.images?.[0] ?? '');

  const [slugEdited, setSlugEdited] = useState(!!initialData?.slug);
  const [form, setForm] = useState<BlogFields>({
    titleKa: initialData?.titleKa ?? '',
    titleEn: initialData?.titleEn ?? '',
    contentKa: initialData?.contentKa ?? '',
    contentEn: initialData?.contentEn ?? '',
    imageUrl: initialData?.imageUrl ?? '',
    images: initialData?.images ?? [],
    slug: initialData?.slug ?? '',
    isPublished: initialData?.isPublished ?? false,
  });

  const set = (key: keyof BlogFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.value;
    setForm((f) => {
      const next = { ...f, [key]: val };
      if (key === 'titleEn' && !slugEdited) next.slug = toSlug(val);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    let imageUrl = form.imageUrl;
    let detailCoverUrl = form.images?.[0] ?? '';

    if (thumbFile || coverFile) {
      setUploading(true);
      try {
        if (thumbFile) imageUrl = await uploadImage(thumbFile);
        if (coverFile) detailCoverUrl = await uploadImage(coverFile);
      } catch (err: any) {
        setError('ფოტოს ატვირთვა ვერ მოხერხდა: ' + err.message);
        setUploading(false);
        setSaving(false);
        return;
      }
      setUploading(false);
    }

    try {
      const images = detailCoverUrl ? [detailCoverUrl] : [];
      const payload = { ...form, imageUrl, images };
      if (blogId) {
        await updateBlog(blogId, payload);
      } else {
        await createBlog(payload);
      }
      router.push('/admin/blogs');
      router.refresh();
    } catch (err: any) {
      setError('შეცდომა: ' + err.message);
      setSaving(false);
    }
  };

  const busy = uploading || saving;
  const statusLabel = uploading ? 'ფოტო იტვირთება...' : saving ? 'ინახება...' : blogId ? 'შენახვა' : 'შექმნა';

  const inputCls = 'w-full border border-[#465940]/20 rounded-xl px-4 py-2.5 text-sm text-[#465940] bg-white focus:outline-none focus:border-[#465940] transition';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl bg-[#465940] border border-[#FDFBF0]/30 px-4 py-3 text-sm font-medium text-[#FDFBF0]">
          {error}
        </div>
      )}

      {/* Lang toggle */}
      <div className="flex gap-2">
        {(['ka', 'en'] as const).map((l) => (
          <button key={l} type="button" onClick={() => setLang(l)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition ${
              lang === l ? 'bg-[#465940] text-[#FDFBF0]' : 'bg-[#465940]/10 text-[#465940]/70 hover:bg-[#465940]/15'
            }`}>
            {l === 'ka' ? 'ქართული' : 'English'}
          </button>
        ))}
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-[#465940]/70 mb-1.5">
          {lang === 'ka' ? 'სათაური (ქართული)' : 'Title (English)'}
        </label>
        <input
          value={lang === 'ka' ? form.titleKa : form.titleEn}
          onChange={lang === 'ka' ? set('titleKa') : set('titleEn')}
          required={lang === 'ka'}
          placeholder={lang === 'ka' ? 'ბლოგ პოსტის სათაური' : 'Blog post title'}
          className={inputCls}
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-xs font-semibold text-[#465940]/70 mb-1.5">
          URL Slug <span className="text-[#465940]/40 font-normal">(SEO)</span>
        </label>
        <div className="flex items-center border border-[#465940]/20 rounded-xl overflow-hidden focus-within:border-[#465940] transition">
          <span className="px-3 py-2.5 text-xs text-[#465940]/60 bg-[#465940]/5 border-r border-[#465940]/20 select-none whitespace-nowrap">/blog/</span>
          <input
            value={form.slug}
            onChange={(e) => {
              setSlugEdited(true);
              setForm((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }));
            }}
            placeholder="blog-post-url"
            className="flex-1 px-3 py-2.5 text-sm text-[#465940] bg-white focus:outline-none"
          />
        </div>
        <p className="text-xs text-[#465940]/60 mt-1">ავტომატურად ივსება ინგლისური სათაურიდან · შეცვლა შეიძლება</p>
      </div>

      {/* Photos — side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <UploadBox
          label="სიის thumbnail"
          badge="4:3 · 1200×900px"
          hint="ბლოგების სიაში (/blog) ჩანს — პორტრეტი ან კვადრატი"
          preview={thumbPreview}
          onFile={(f) => { setThumbFile(f); setThumbPreview(URL.createObjectURL(f)); }}
          onClear={() => { setThumbPreview(''); setThumbFile(null); setForm(f => ({ ...f, imageUrl: '' })); }}
          inputRef={thumbRef}
          ratio="4/3"
        />
        <UploadBox
          label="სტატიის cover"
          badge="16:9 · 1200×675px"
          hint="სტატიის შიდა გვერდზე (/blog/სათაური) ზევით ჩანს — სტანდარტული ფართო ფორმატი"
          preview={coverPreview}
          onFile={(f) => { setCoverFile(f); setCoverPreview(URL.createObjectURL(f)); }}
          onClear={() => { setCoverPreview(''); setCoverFile(null); setForm(f => ({ ...f, images: [] })); }}
          inputRef={coverRef}
          ratio="16/9"
        />
      </div>

      {/* Content */}
      <div>
        <label className="block text-xs font-semibold text-[#465940]/70 mb-1.5">
          {lang === 'ka' ? 'კონტენტი (ქართული)' : 'Content (English)'}
        </label>
        <BlogBlockEditor
          key={lang}
          value={lang === 'ka' ? form.contentKa : form.contentEn}
          onChange={(html) => setForm(f => ({ ...f, [lang === 'ka' ? 'contentKa' : 'contentEn']: html }))}
          placeholder={lang === 'ka' ? 'დაიწყე ბლოგის წერა...' : 'Start writing your blog...'}
        />
      </div>

      {/* Published toggle */}
      <div className="flex items-center gap-3">
        <button type="button"
          onClick={() => setForm((f) => ({ ...f, isPublished: !f.isPublished }))}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${form.isPublished ? 'bg-[#465940]' : 'bg-[#465940]/15'}`}>
          <span className={`inline-block h-4 w-4 transform rounded-full bg-[#FDFBF0] shadow transition ${form.isPublished ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
        <span className="text-sm font-semibold text-[#465940]">
          {form.isPublished ? 'გამოქვეყნებული' : 'დრაფტი'}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={busy}
          className="flex-1 bg-[#465940] text-[#FDFBF0] font-bold px-6 py-3 rounded-full text-sm transition disabled:opacity-60 flex items-center justify-center gap-2">
          {busy && (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
          )}
          {statusLabel}
        </button>
        <button type="button" onClick={() => router.push('/admin/blogs')}
          className="border border-[#465940]/20 text-[#465940]/70 hover:border-[#465940]/30 font-semibold px-6 py-3 rounded-full text-sm transition">
          გაუქმება
        </button>
      </div>
    </form>
  );
}
