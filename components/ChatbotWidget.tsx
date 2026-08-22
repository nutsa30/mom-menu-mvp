'use client';

import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

type Msg = { role: 'user' | 'assistant'; content: string };

function ChatbotPanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setError('');
    const nextMessages: Msg[] = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setLoading(true);
    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: nextMessages.slice(0, -1) }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError('ბოდიში, ამ წამს პასუხის გაცემა ვერ ხერხდება — სცადეთ მოგვიანებით ან მოგვწერეთ info@mommenu.ge-ზე.');
        return;
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setError('კავშირის შეცდომა — სცადეთ ხელახლა.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[60]">
      {open && (
        <div className="mb-3 w-[90vw] max-w-[360px] h-[70vh] max-h-[520px] bg-[#F5F1E4] rounded-2xl shadow-2xl border border-[#6F7A5C]/10 flex flex-col overflow-hidden">
          <div className="bg-[#6F7A5C] px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-lg">💬</span>
              <span className="text-[#F5F1E4] font-bold text-sm">mom menu დამხმარე</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-[#F5F1E4]/70 hover:text-[#F5F1E4] text-xl leading-none">×</button>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-sm text-[#6F7A5C]/60 text-center mt-8">
                გამარჯობა! 👋 დამისვით შეკითხვა რეცეპტების, გამოწერის ან საიტის შესახებ.
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                  m.role === 'user' ? 'bg-[#6F7A5C] text-[#F5F1E4]' : 'bg-[#6F7A5C]/10 text-[#6F7A5C]'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#6F7A5C]/10 text-[#6F7A5C]/60 rounded-2xl px-3 py-2 text-sm">იწერს...</div>
              </div>
            )}
            {error && <p className="text-red-600 text-xs text-center">{error}</p>}
          </div>

          <div className="p-3 border-t border-[#6F7A5C]/10 flex gap-2 flex-shrink-0">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="დაწერეთ შეკითხვა..."
              className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-[#6F7A5C]/20 focus:outline-none focus:border-[#6F7A5C] text-sm bg-white text-[#6F7A5C]"
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="px-4 py-2 bg-[#6F7A5C] text-[#F5F1E4] rounded-xl text-sm font-bold disabled:opacity-40 flex-shrink-0"
            >
              →
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="w-14 h-14 rounded-full bg-[#6F7A5C] shadow-xl flex items-center justify-center text-2xl hover:scale-105 transition"
        aria-label="ჩატბოტი"
      >
        {open ? '×' : '💬'}
      </button>
    </div>
  );
}

const HIDE_ON = ['/admin'];

const DISABLED = true; // Temporarily disabled site-wide at the user's request — flip to false to re-enable.

export default function ChatbotWidget() {
  const pathname = usePathname();
  if (DISABLED || HIDE_ON.some((p) => pathname.startsWith(p))) return null;
  return <ChatbotPanel />;
}
