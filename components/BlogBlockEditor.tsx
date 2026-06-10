'use client';

import { useState, useCallback } from 'react';

type Block =
  | { id: string; type: 'p';       text: string }
  | { id: string; type: 'h2';      text: string }
  | { id: string; type: 'h3';      text: string }
  | { id: string; type: 'ul';      items: string[] }
  | { id: string; type: 'ol';      items: string[] }
  | { id: string; type: 'divider' };

function uid() { return Math.random().toString(36).slice(2); }

function blocksToHtml(blocks: Block[]): string {
  return blocks.map(b => {
    if (b.type === 'p')       return `<p>${b.text}</p>`;
    if (b.type === 'h2')      return `<h2>${b.text}</h2>`;
    if (b.type === 'h3')      return `<h3>${b.text}</h3>`;
    if (b.type === 'ul')      return `<ul>${b.items.filter(Boolean).map(i => `<li>${i}</li>`).join('')}</ul>`;
    if (b.type === 'ol')      return `<ol>${b.items.filter(Boolean).map(i => `<li>${i}</li>`).join('')}</ol>`;
    if (b.type === 'divider') return `<hr/>`;
    return '';
  }).join('\n');
}

function htmlToBlocks(html: string): Block[] {
  if (!html || !html.trim()) return [];
  // Simple parser for our own HTML output
  const blocks: Block[] = [];
  const div = typeof document !== 'undefined' ? document.createElement('div') : null;
  if (!div) return [{ id: uid(), type: 'p', text: html.replace(/<[^>]*>/g, '') }];
  div.innerHTML = html;
  Array.from(div.childNodes).forEach(node => {
    if (node.nodeType === 3) { // text node
      const t = node.textContent?.trim();
      if (t) blocks.push({ id: uid(), type: 'p', text: t });
      return;
    }
    const el = node as HTMLElement;
    const tag = el.tagName?.toLowerCase();
    if (tag === 'p')   { blocks.push({ id: uid(), type: 'p',  text: el.textContent ?? '' }); return; }
    if (tag === 'h2')  { blocks.push({ id: uid(), type: 'h2', text: el.textContent ?? '' }); return; }
    if (tag === 'h3')  { blocks.push({ id: uid(), type: 'h3', text: el.textContent ?? '' }); return; }
    if (tag === 'hr')  { blocks.push({ id: uid(), type: 'divider' }); return; }
    if (tag === 'ul')  {
      const items = Array.from(el.querySelectorAll('li')).map(li => li.textContent ?? '');
      blocks.push({ id: uid(), type: 'ul', items: items.length ? items : [''] });
      return;
    }
    if (tag === 'ol')  {
      const items = Array.from(el.querySelectorAll('li')).map(li => li.textContent ?? '');
      blocks.push({ id: uid(), type: 'ol', items: items.length ? items : [''] });
      return;
    }
    // fallback: treat as paragraph
    const t = el.textContent?.trim();
    if (t) blocks.push({ id: uid(), type: 'p', text: t });
  });
  return blocks.length ? blocks : [];
}

const BLOCK_TYPES = [
  { type: 'p',       label: 'ტექსტი',      icon: '¶' },
  { type: 'h2',      label: 'სათაური',     icon: 'H2' },
  { type: 'h3',      label: 'ქვესათ.',     icon: 'H3' },
  { type: 'ul',      label: '• სია',        icon: '•' },
  { type: 'ol',      label: '1. სია',       icon: '1.' },
  { type: 'divider', label: 'გამყოფი',     icon: '—' },
] as const;

const cls = 'w-full border border-[#465940]/20 rounded-xl px-3 py-2 text-sm text-[#465940] bg-white focus:outline-none focus:border-[#465940] resize-none transition';

export default function BlogBlockEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const [blocks, setBlocks] = useState<Block[]>(() => htmlToBlocks(value));

  const update = useCallback((newBlocks: Block[]) => {
    setBlocks(newBlocks);
    onChange(blocksToHtml(newBlocks));
  }, [onChange]);

  const addBlock = (afterIdx: number, type: Block['type'] = 'p') => {
    const b: Block = type === 'ul' || type === 'ol'
      ? { id: uid(), type, items: [''] }
      : type === 'divider'
      ? { id: uid(), type: 'divider' }
      : { id: uid(), type, text: '' };
    const next = [...blocks];
    next.splice(afterIdx + 1, 0, b);
    update(next);
  };

  const removeBlock = (idx: number) => {
    update(blocks.filter((_, i) => i !== idx));
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const next = [...blocks];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    update(next);
  };

  const moveDown = (idx: number) => {
    if (idx === blocks.length - 1) return;
    const next = [...blocks];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    update(next);
  };

  const updateText = (idx: number, text: string) => {
    const next = [...blocks];
    const b = next[idx];
    if (b.type === 'p' || b.type === 'h2' || b.type === 'h3') {
      next[idx] = { ...b, text };
    }
    update(next);
  };

  const updateItem = (blockIdx: number, itemIdx: number, val: string) => {
    const next = [...blocks];
    const b = next[blockIdx];
    if (b.type === 'ul' || b.type === 'ol') {
      const items = [...b.items];
      items[itemIdx] = val;
      next[blockIdx] = { ...b, items };
    }
    update(next);
  };

  const addItem = (blockIdx: number) => {
    const next = [...blocks];
    const b = next[blockIdx];
    if (b.type === 'ul' || b.type === 'ol') {
      next[blockIdx] = { ...b, items: [...b.items, ''] };
    }
    update(next);
  };

  const removeItem = (blockIdx: number, itemIdx: number) => {
    const next = [...blocks];
    const b = next[blockIdx];
    if (b.type === 'ul' || b.type === 'ol') {
      const items = b.items.filter((_, i) => i !== itemIdx);
      next[blockIdx] = { ...b, items: items.length ? items : [''] };
    }
    update(next);
  };

  const changeType = (idx: number, type: Block['type']) => {
    const old = blocks[idx];
    let newBlock: Block;
    if (type === 'divider') {
      newBlock = { id: old.id, type: 'divider' };
    } else if (type === 'ul' || type === 'ol') {
      const text = (old as any).text ?? '';
      newBlock = { id: old.id, type, items: text ? [text] : [''] };
    } else {
      const items = (old as any).items;
      newBlock = { id: old.id, type, text: items ? items.join('\n') : ((old as any).text ?? '') };
    }
    const next = [...blocks];
    next[idx] = newBlock;
    update(next);
  };

  const btnCls = 'w-7 h-7 rounded-lg flex items-center justify-center text-xs text-[#465940]/50 hover:bg-[#465940]/10 hover:text-[#465940] transition';

  return (
    <div className="space-y-2">
      {blocks.length === 0 && (
        <div className="border-2 border-dashed border-[#465940]/20 rounded-2xl p-8 text-center">
          <p className="text-sm text-[#465940]/50 mb-3">{placeholder || 'დაიწყე ბლოგის წერა...'}</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {BLOCK_TYPES.map(bt => (
              <button key={bt.type} type="button"
                onClick={() => addBlock(-1, bt.type as Block['type'])}
                className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#465940]/10 text-[#465940] hover:bg-[#465940]/15 transition">
                {bt.icon} {bt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {blocks.map((block, idx) => (
        <div key={block.id} className="group relative bg-[#FDFBF0] border border-[#465940]/15 rounded-2xl p-4">
          {/* Controls */}
          <div className="flex items-center gap-1 mb-2">
            {/* Type switcher */}
            <select
              value={block.type}
              onChange={e => changeType(idx, e.target.value as Block['type'])}
              className="text-xs border border-[#465940]/20 rounded-lg px-2 py-1 text-[#465940] bg-white focus:outline-none mr-2"
            >
              {BLOCK_TYPES.map(bt => <option key={bt.type} value={bt.type}>{bt.icon} {bt.label}</option>)}
            </select>
            <div className="flex-1" />
            <button type="button" onClick={() => moveUp(idx)} className={btnCls} title="ზევით">↑</button>
            <button type="button" onClick={() => moveDown(idx)} className={btnCls} title="ქვევით">↓</button>
            <button type="button" onClick={() => removeBlock(idx)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs text-[#465940]/40 hover:bg-red-50 hover:text-red-500 transition" title="წაშლა">✕</button>
          </div>

          {/* Block content */}
          {block.type === 'p' && (
            <textarea rows={3} value={block.text} onChange={e => updateText(idx, e.target.value)}
              placeholder="აბზაცი..." className={cls} />
          )}
          {block.type === 'h2' && (
            <input value={block.text} onChange={e => updateText(idx, e.target.value)}
              placeholder="სათაური..." className={`${cls} font-black text-lg`} />
          )}
          {block.type === 'h3' && (
            <input value={block.text} onChange={e => updateText(idx, e.target.value)}
              placeholder="ქვესათაური..." className={`${cls} font-bold`} />
          )}
          {(block.type === 'ul' || block.type === 'ol') && (
            <div className="space-y-1.5">
              {block.items.map((item, ii) => (
                <div key={ii} className="flex gap-2 items-center">
                  <span className="text-[#465940]/40 text-xs w-5 flex-shrink-0 text-center font-bold">
                    {block.type === 'ul' ? '•' : `${ii + 1}.`}
                  </span>
                  <input value={item} onChange={e => updateItem(idx, ii, e.target.value)}
                    placeholder={`${ii + 1}-ე ელემენტი...`}
                    className={cls} />
                  {block.items.length > 1 && (
                    <button type="button" onClick={() => removeItem(idx, ii)}
                      className="text-[#465940]/30 hover:text-red-400 transition text-xs">✕</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => addItem(idx)}
                className="text-xs text-[#465940]/50 hover:text-[#465940] font-semibold transition">
                + ელემენტის დამატება
              </button>
            </div>
          )}
          {block.type === 'divider' && (
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-[#465940]/20" />
              <span className="text-xs text-[#465940]/30">— — —</span>
              <div className="flex-1 h-px bg-[#465940]/20" />
            </div>
          )}

          {/* Add block below */}
          <div className="mt-3 pt-2 border-t border-[#465940]/10 flex flex-wrap gap-1.5">
            {BLOCK_TYPES.map(bt => (
              <button key={bt.type} type="button"
                onClick={() => addBlock(idx, bt.type as Block['type'])}
                className="px-2.5 py-1 rounded-full text-[10px] font-bold text-[#465940]/50 hover:bg-[#465940]/10 hover:text-[#465940] transition">
                + {bt.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
