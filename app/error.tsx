'use client';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-screen bg-[#465940] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-24 h-24 bg-[#465940] rounded-full flex items-center justify-center mb-6">
        <span className="text-5xl">⚠️</span>
      </div>
      <h1 className="text-2xl font-black text-[#FDFBF0] mb-3">რაღაც გაგვიფუჭდა</h1>
      <p className="text-[#FDFBF0]/60 text-sm max-w-xs mb-8">
        მოხდა მოულოდნელი შეცდომა. სცადეთ გვერდის განახლება.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="bg-[#FDFBF0]/20 hover:bg-[#FDFBF0]/30 text-[#FDFBF0] font-bold px-8 py-3 rounded-full transition text-sm"
        >
          კვლავ სცადე
        </button>
        <a
          href="/"
          className="bg-[#FDFBF0] border border-[#465940]/20 text-[#465940]/80 hover:border-[#465940] hover:text-[#FDFBF0] font-bold px-8 py-3 rounded-full transition text-sm"
        >
          მთავარი
        </a>
      </div>
    </main>
  );
}
