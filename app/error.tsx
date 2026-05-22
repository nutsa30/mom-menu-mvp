'use client';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-screen bg-[#fff8f6] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
        <span className="text-5xl">⚠️</span>
      </div>
      <h1 className="text-2xl font-black text-gray-900 mb-3">რაღაც გაგვიფუჭდა</h1>
      <p className="text-gray-400 text-sm max-w-xs mb-8">
        მოხდა მოულოდნელი შეცდომა. სცადეთ გვერდის განახლება.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="bg-[#ff7f50] hover:bg-[#e86e40] text-white font-bold px-8 py-3 rounded-full transition text-sm"
        >
          კვლავ სცადე
        </button>
        <a
          href="/"
          className="bg-white border border-gray-200 text-gray-600 hover:border-[#ff7f50] hover:text-[#ff7f50] font-bold px-8 py-3 rounded-full transition text-sm"
        >
          მთავარი
        </a>
      </div>
    </main>
  );
}
