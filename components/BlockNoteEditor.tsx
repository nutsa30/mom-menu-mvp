'use client';

import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/ariakit';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/ariakit/style.css';
import { useEffect, useRef } from 'react';
import { uploadImage } from '@/lib/uploadImage';

export default function BlockNoteEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const initialized = useRef(false);

  const editor = useCreateBlockNote({
    uploadFile: async (file: File) => uploadImage(file),
    placeholders: { default: placeholder ?? 'დაიწყე წერა... "/" — ბლოკების მენიუ' },
  });

  useEffect(() => {
    if (initialized.current || !editor) return;
    initialized.current = true;
    if (!value) return;
    editor.tryParseHTMLToBlocks(value).then((blocks) => {
      if (blocks.length) editor.replaceBlocks(editor.document, blocks);
    });
  }, [editor]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = async () => {
    const html = await editor.blocksToHTMLLossy(editor.document);
    onChangeRef.current(html);
  };

  return (
    <div className="bn-container min-h-[480px] bg-white rounded-2xl border border-gray-200 overflow-hidden focus-within:border-[#ff7f50] transition-colors">
      <BlockNoteView
        editor={editor}
        onChange={handleChange}
        theme="light"
      />
    </div>
  );
}
