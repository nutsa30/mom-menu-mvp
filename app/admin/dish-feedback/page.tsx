import { prisma } from '@/lib/prisma';

export default async function AdminDishFeedbackPage() {
  const votes = await prisma.dishVote.findMany({
    include: { dish: { select: { id: true, titleKa: true, imageUrl: true, mealType: true } } },
  });

  const tally = new Map<string, { dish: any; likes: number; dislikes: number }>();
  for (const v of votes) {
    if (!v.dish) continue;
    const entry = tally.get(v.dishId) ?? { dish: v.dish, likes: 0, dislikes: 0 };
    if (v.liked) entry.likes++; else entry.dislikes++;
    tally.set(v.dishId, entry);
  }

  const disliked = [...tally.values()].filter((t) => t.dislikes > 0).sort((a, b) => b.dislikes - a.dislikes);
  const liked = [...tally.values()].filter((t) => t.likes > 0).sort((a, b) => b.likes - a.likes);

  const List = ({ items, countKey, accent }: { items: typeof disliked; countKey: 'likes' | 'dislikes'; accent: string }) => (
    <div className="space-y-2">
      {items.length === 0 ? (
        <p className="text-sm text-[#465940]/50 text-center py-8">ჯერ ხმა არ არის</p>
      ) : (
        items.map((t) => (
          <a key={t.dish.id} href={`/admin/meals/${t.dish.id}`}
            className="flex items-center gap-3 rounded-xl border border-[#465940]/10 bg-white p-3 hover:border-[#465940]/30 transition">
            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-[#465940]/5">
              {t.dish.imageUrl
                ? <img src={t.dish.imageUrl} alt={t.dish.titleKa} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-lg"></div>
              }
            </div>
            <p className="flex-1 min-w-0 font-semibold text-sm text-[#465940] truncate">{t.dish.titleKa}</p>
            <span className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-black ${accent}`}>
              {t[countKey]} ხმა
            </span>
          </a>
        ))
      )}
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-3xl font-black text-[#465940]">კერძების შეფასება</h1>
        <p className="text-[#465940]/60 text-sm mt-1">"ჭამა" ავტომატურად ითვლება მოწონებად, "არ მოეწონა" — დაწუნებად. დაკლიკებით კერძის რედაქტირება/წაშლაზე გადახვალთ.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="rounded-[20px] bg-[#FDFBF0] p-6 shadow-sm">
          <h2 className="mb-4 font-bold text-red-600">👎 დაწუნებული კერძები</h2>
          <List items={disliked} countKey="dislikes" accent="bg-red-100 text-red-700" />
        </section>

        <section className="rounded-[20px] bg-[#FDFBF0] p-6 shadow-sm">
          <h2 className="mb-4 font-bold text-[#465940]">👍 მოწონებული კერძები</h2>
          <List items={liked} countKey="likes" accent="bg-[#465940]/10 text-[#465940]" />
        </section>
      </div>
    </div>
  );
}
