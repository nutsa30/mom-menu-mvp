import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#6F7A5C] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-24 h-24 bg-[#6F7A5C]/10 rounded-full flex items-center justify-center mb-6">
        <span className="text-5xl"></span>
      </div>
      <h1 className="text-8xl font-black text-[#6F7A5C] leading-none mb-2">404</h1>
      <h2 className="text-2xl font-black text-[#6F7A5C] mb-3">გვერდი ვერ მოიძებნა</h2>
      <p className="text-[#6F7A5C]/60 text-sm max-w-xs mb-8">
        სამწუხაროდ, თქვენ მიერ ძებნილი გვერდი არ არსებობს ან წაშლილია.
      </p>
      <Link
        href="/"
        className="bg-[#6F7A5C] hover:bg-[#6F7A5C] text-[#F5F1E4] font-bold px-8 py-3 rounded-full transition text-sm"
      >
        ← მთავარ გვერდზე
      </Link>
    </main>
  );
}
