'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createBlog, updateBlog } from './actions';
import { uploadImage } from '@/lib/uploadImage';
import dynamic from 'next/dynamic';

const BlockNoteEditor = dynamic(() => import('@/components/BlockNoteEditor'), { ssr: false });

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

// Pending file + preview for gallery images not yet uploaded
type PendingImage = { file: File; preview: string };

export default function BlogForm({
  initialData,
  blogId,
}: {
  initialData?: BlogFields;
  blogId?: string;
}) {
  const router = useRouter();
  const coverRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const [lang, setLang] = useState<'ka' | 'en'>('ka');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [galleryDragOver, setGalleryDragOver] = useState(false);

  // Cover photo
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState(initialData?.imageUrl ?? '');

  // Gallery: already-saved URLs + pending local files
  const [savedImages, setSavedImages] = useState<string[]>(initialData?.images ?? []);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);

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
      // Auto-generate slug from English title unless user has manually edited it
      if (key === 'titleEn' && !slugEdited) {
        next.slug = toSlug(val);
      }
      return next;
    });
  };

  // ── Cover photo ──────────────────────────────────────────────
  const setCover = (f: File) => {
    setCoverFile(f);
    setCoverPreview(URL.createObjectURL(f));
    setError('');
  };

  const onCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setCover(f);
  };

  const onCoverDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith('image/')) setCover(f);
  };

  // ── Gallery photos ───────────────────────────────────────────
  const addGalleryFiles = (files: FileList | null) => {
    if (!files) return;
    const newPending: PendingImage[] = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setPendingImages((p) => [...p, ...newPending]);
    setError('');
  };

  const onGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addGalleryFiles(e.target.files);
    e.target.value = '';
  };

  const onGalleryDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setGalleryDragOver(false);
    addGalleryFiles(e.dataTransfer.files);
  };

  const removeSaved = (url: string) => setSavedImages((s) => s.filter((u) => u !== url));
  const removePending = (idx: number) => setPendingImages((p) => p.filter((_, i) => i !== idx));

  // ── Submit ───────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    let imageUrl = form.imageUrl;

    // Upload cover if changed
    if (coverFile) {
      setUploading(true);
      try {
        imageUrl = await uploadImage(coverFile);
      } catch (err: any) {
        setError('გარეკანის ფოტოს ატვირთვა ვერ მოხერხდა: ' + err.message);
        setUploading(false);
        setSaving(false);
        return;
      }
    }

    // Upload pending gallery images
    let allImages = [...savedImages];
    if (pendingImages.length) {
      try {
        const uploaded = await Promise.all(pendingImages.map((p) => uploadImage(p.file)));
        allImages = [...allImages, ...uploaded];
      } catch (err: any) {
        setError('ფოტოების ატვირთვა ვერ მოხერხდა: ' + err.message);
        setUploading(false);
        setSaving(false);
        return;
      }
    }
    setUploading(false);

    try {
      const payload = { ...form, imageUrl, images: allImages };
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
  const statusLabel = uploading
    ? 'ფოტო იტვირთება...'
    : saving
    ? 'ინახება...'
    : blogId
    ? 'შენახვა'
    : 'შექმნა';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Lang toggle */}
      <div className="flex gap-2">
        {(['ka', 'en'] as const).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition ${
              lang === l ? 'bg-[#ff7f50] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {l === 'ka' ? 'ქართული' : 'English'}
          </button>
        ))}
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">
          {lang === 'ka' ? 'სათაური (ქართული)' : 'Title (English)'}
        </label>
        <input
          value={lang === 'ka' ? form.titleKa : form.titleEn}
          onChange={lang === 'ka' ? set('titleKa') : set('titleEn')}
          required={lang === 'ka'}
          placeholder={lang === 'ka' ? 'ბლოგ პოსტის სათაური' : 'Blog post title'}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff7f50]"
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">
          URL Slug <span className="text-gray-300 font-normal">(SEO)</span>
        </label>
        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#ff7f50] transition">
          <span className="px-3 py-2.5 text-xs text-gray-400 bg-gray-50 border-r border-gray-200 select-none whitespace-nowrap">
            /blog/
          </span>
          <input
            value={form.slug}
            onChange={(e) => {
              setSlugEdited(true);
              setForm((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }));
            }}
            placeholder="blog-post-url"
            className="flex-1 px-3 py-2.5 text-sm focus:outline-none bg-white"
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">ავტომატურად ივსება ინგლისური სათაურიდან · შეცვლა შეიძლება</p>
      </div>

      {/* Content */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">
          {lang === 'ka' ? 'კონტენტი (ქართული)' : 'Content (English)'}
        </label>
        <BlockNoteEditor
          key={lang}
          value={lang === 'ka' ? form.contentKa : form.contentEn}
          onChange={(html) =>
            setForm((f) => ({ ...f, [lang === 'ka' ? 'contentKa' : 'contentEn']: html }))
          }
          placeholder={lang === 'ka' ? 'დაიწყე წერა... "/" — ბლოკების მენიუ' : 'Start writing... "/" for blocks menu'}
        />
      </div>

      {/* ── Cover photo ── */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">
          გარეკანის ფოტო <span className="text-gray-300">(ბლოგების სიაში ჩანს)</span>
        </label>
        <div
          onClick={() => coverRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onCoverDrop}
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition flex items-center justify-center overflow-hidden
            ${dragOver ? 'border-[#ff7f50] bg-[#fff3ee]' : 'border-gray-200 hover:border-[#ff7f50] hover:bg-[#fef9f7]'}`}
          style={{ minHeight: coverPreview ? 200 : 140 }}
        >
          {coverPreview ? (
            <>
              <img src={coverPreview} alt="" className="w-full h-full object-cover absolute inset-0" style={{ maxHeight: 240 }} />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                <span className="text-white font-bold text-sm bg-black/50 px-4 py-2 rounded-full">შეცვლა</span>
              </div>
            </>
          ) : (
            <div className="text-center py-6 px-4">
              <div className="text-3xl mb-2">🖼️</div>
              <p className="text-sm font-semibold text-gray-600">გარეკანის ფოტო</p>
              <p className="text-xs text-gray-400 mt-1">ჩააგდე ან დააჭირე</p>
            </div>
          )}
        </div>
        <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={onCoverChange} />
        {coverPreview && (
          <button
            type="button"
            onClick={() => { setCoverPreview(''); setCoverFile(null); setForm((f) => ({ ...f, imageUrl: '' })); }}
            className="mt-1.5 text-xs text-red-400 hover:text-red-600 font-semibold transition"
          >
            გარეკანის წაშლა
          </button>
        )}
      </div>

      {/* ── Gallery photos ── */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">
          ბლოგის ფოტოები <span className="text-gray-300">(სრულ პოსტში ჩანს)</span>
        </label>

        {/* Thumbnails grid */}
        {(savedImages.length > 0 || pendingImages.length > 0) && (
          <div className="grid grid-cols-4 gap-2 mb-3">
            {savedImages.map((url, i) => (
              <div key={url} className="relative group rounded-xl overflow-hidden h-24 bg-gray-100">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeSaved(url)}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  ✕
                </button>
                <span className="absolute bottom-1 left-1 text-[9px] bg-black/40 text-white px-1 rounded">{i + 1}</span>
              </div>
            ))}
            {pendingImages.map((p, i) => (
              <div key={p.preview} className="relative group rounded-xl overflow-hidden h-24 bg-gray-100">
                <img src={p.preview} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePending(i)}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  ✕
                </button>
                <span className="absolute bottom-1 left-1 text-[9px] bg-[#ff7f50]/80 text-white px-1 rounded">ახ.</span>
              </div>
            ))}
          </div>
        )}

        {/* Drop zone for gallery */}
        <div
          onClick={() => galleryRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setGalleryDragOver(true); }}
          onDragLeave={() => setGalleryDragOver(false)}
          onDrop={onGalleryDrop}
          className={`cursor-pointer rounded-2xl border-2 border-dashed transition flex items-center justify-center py-5 px-4 text-center
            ${galleryDragOver ? 'border-[#ff7f50] bg-[#fff3ee]' : 'border-gray-200 hover:border-[#ff7f50] hover:bg-[#fef9f7]'}`}
        >
          <div>
            <div className="text-2xl mb-1">📷</div>
            <p className="text-sm font-semibold text-gray-600">ფოტოების დამატება</p>
            <p className="text-xs text-gray-400 mt-0.5">შეგიძლია რამდენიმე ერთად</p>
          </div>
        </div>
        <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={onGalleryChange} />
      </div>

      {/* Published toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setForm((f) => ({ ...f, isPublished: !f.isPublished }))}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
            form.isPublished ? 'bg-[#ff7f50]' : 'bg-gray-200'
          }`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${form.isPublished ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
        <span className="text-sm font-semibold text-gray-700">
          {form.isPublished ? 'გამოქვეყნებული' : 'დრაფტი'}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={busy}
          className="flex-1 bg-[#ff7f50] hover:bg-[#e86e40] text-white font-bold px-6 py-3 rounded-full text-sm transition disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {busy && (
            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
          )}
          {statusLabel}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/blogs')}
          className="border border-gray-200 text-gray-500 hover:border-gray-300 font-semibold px-6 py-3 rounded-full text-sm transition"
        >
          გაუქმება
        </button>
      </div>
    </form>
  );
}
