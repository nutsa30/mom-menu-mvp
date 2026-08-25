import { prisma } from '@/lib/prisma';
import { ApproveTestimonialButton, DeleteTestimonialButton } from '@/components/AdminTestimonialActions';

export default async function AdminTestimonialsPage() {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: [{ approved: 'asc' }, { createdAt: 'desc' }],
  });
  const pending = testimonials.filter((t) => !t.approved).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-3xl font-black text-[#465940]">კომენტარები</h1>
        <p className="text-[#465940]/60 text-sm mt-1">{testimonials.length} სულ · {pending} დასამტკიცებელი</p>
      </div>

      {testimonials.length === 0 ? (
        <div className="rounded-[20px] bg-[#FDFBF0] p-10 text-center">
          <p className="text-sm text-[#465940]/60">ჯერ კომენტარი არ არის</p>
        </div>
      ) : (
        <div className="space-y-3">
          {testimonials.map((t) => (
            <div key={t.id} className="rounded-[20px] bg-[#FDFBF0] p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <p className="font-black text-[#465940]">{t.authorName}</p>
                  <p className="text-[10px] text-[#465940]/50">{new Date(t.createdAt).toLocaleDateString('ka-GE')}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${t.approved ? 'bg-[#465940]/10 text-[#465940]' : 'bg-amber-50 text-amber-700'}`}>
                    {t.approved ? 'გამოქვეყნებული' : 'მოლოდინში'}
                  </span>
                  <ApproveTestimonialButton id={t.id} approved={t.approved} />
                  <DeleteTestimonialButton id={t.id} />
                </div>
              </div>
              <p className="text-sm text-[#465940]/80 leading-relaxed">{t.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
