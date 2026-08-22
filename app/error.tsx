'use client';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-screen bg-[#6F7A5C] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-24 h-24 bg-[#6F7A5C] rounded-full flex items-center justify-center mb-6">
        <span className="text-5xl"></span>
      </div>
      <h1 className="text-2xl font-black text-[#F5F1E4] mb-3">რაღაც გაგვიფუჭდა</h1>
      <p className="text-[#F5F1E4]/60 text-sm max-w-xs mb-8">
        მოხდა მოულოდნელი შეცდომა. სცადეთ გვერდის განახლება.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="bg-[#F5F1E4]/20 hover:bg-[#F5F1E4]/30 text-[#F5F1E4] font-bold px-8 py-3 rounded-full transition text-sm"
        >
          კვლავ სცადე
        </button>
        <a
          href="/"
          className="bg-[#F5F1E4] border border-[#6F7A5C]/20 text-[#6F7A5C]/80 hover:border-[#6F7A5C] hover:text-[#F5F1E4] font-bold px-8 py-3 rounded-full transition text-sm"
        >
          მთავარი
        </a>
      </div>
    </main>
  );
}
