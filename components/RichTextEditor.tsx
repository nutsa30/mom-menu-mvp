'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { useEffect, useCallback, useRef, useState } from 'react';
import { uploadImage } from '@/lib/uploadImage';

function Btn({
  active, onClick, title, disabled, children,
}: {
  active?: boolean; onClick: () => void; title?: string; disabled?: boolean; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className={`px-2.5 py-1 rounded-lg text-sm font-bold transition select-none disabled:opacity-40 ${
        active ? 'bg-[#ff7f50] text-white' : 'text-gray-600 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-gray-200 mx-0.5 self-center" />;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'ტექსტი...',
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const imageRef = useRef<HTMLInputElement>(null);
  const [imgUploading, setImgUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#ff7f50] underline underline-offset-2',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-xl max-w-full my-4 mx-auto block',
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'outline-none min-h-[220px] p-4 prose-blog',
        'data-placeholder': placeholder,
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (!editor) return;
    const cur = editor.getHTML();
    if (value !== cur) editor.commands.setContent(value, false);
  }, [value, editor]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href ?? '';
    const url = window.prompt('ბმულის URL:', prev);
    if (url === null) return;
    if (url === '') { editor.chain().focus().unsetLink().run(); return; }
    editor.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  const onImageFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !editor) return;
    setImgUploading(true);
    try {
      const url = await uploadImage(file);
      editor.chain().focus().setImage({ src: url }).run();
    } catch {
      alert('ფოტოს ატვირთვა ვერ მოხერხდა');
    } finally {
      setImgUploading(false);
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#ff7f50] transition-colors">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-gray-100">
        <Btn active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="სათაური 1">H1</Btn>
        <Btn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="სათაური 2">H2</Btn>
        <Btn active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="სათაური 3">H3</Btn>
        <Divider />
        <Btn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="გამუქება"><b>B</b></Btn>
        <Btn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="დახრა"><i>I</i></Btn>
        <Divider />
        <Btn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="სია">• —</Btn>
        <Btn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="ნომრიანი სია">1.</Btn>
        <Btn active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="ციტატა">"</Btn>
        <Divider />
        <Btn active={editor.isActive('link')} onClick={addLink} title="ბმულის დამატება">🔗</Btn>
        {editor.isActive('link') && (
          <Btn onClick={() => editor.chain().focus().unsetLink().run()} title="ბმულის წაშლა">✕🔗</Btn>
        )}
        <Divider />
        <Btn
          onClick={() => imageRef.current?.click()}
          disabled={imgUploading}
          title="სურათის ჩასმა კონტენტში"
        >
          {imgUploading ? '⏳' : '🖼️'}
        </Btn>
        <Divider />
        <Btn onClick={() => editor.chain().focus().undo().run()} title="გასაუქმებელი">↩</Btn>
        <Btn onClick={() => editor.chain().focus().redo().run()} title="გასამეორებელი">↪</Btn>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />

      {/* Hidden file input for inline images */}
      <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={onImageFileChange} />
    </div>
  );
}
