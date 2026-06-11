'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ga } from '@/lib/gtag';

export default function SubscriptionPage() {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (plan: 'RECIPE_PLAN' | 'FULL_PLAN') => {
    setLoadingPlan(plan);

    const planLabel = plan === 'RECIPE_PLAN' ? 'რეცეპტების წვდომა' : 'სრული პაკეტი';
    const planPrice = plan === 'RECIPE_PLAN' ? 15 : 30;

    ga.subscribe(planLabel, planPrice); // start_checkout

    const res = await fetch('/api/subscription/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    });

    if (!res.ok) {
      const data = await res.json();
      alert(data.error || 'Subscription update failed');
      setLoadingPlan(null);
      return;
    }

    setLoadingPlan(null);
    router.push('/dashboard');
  };

  return (
    <main className="min-h-screen bg-background px-6 py-16 text-on-surface">
      <section className="mx-auto max-w-5xl text-center">
        <h1 className="mb-4 text-4xl font-bold">Choose your plan</h1>
        <p className="mb-12 text-on-surface-variant">
          Simulated payment for MVP. Click subscribe and it will count as active.
        </p>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-[32px] bg-[#FDFBF0] p-8 shadow-soft">
            <h2 className="mb-3 text-2xl font-bold">Recipe Plan</h2>
            <p className="mb-2 text-4xl font-bold">15₾</p>
            <p className="mb-6 text-sm text-on-surface-variant">
              Recipe access only. Users can open and read recipes.
            </p>
            <button
              onClick={() => handleSubscribe('RECIPE_PLAN')}
              disabled={loadingPlan !== null}
              className="w-full rounded-full border border-primary-container py-4 font-semibold text-primary disabled:opacity-60"
            >
              {loadingPlan === 'RECIPE_PLAN' ? 'Processing...' : 'Subscribe 15₾'}
            </button>
          </div>

          <div className="rounded-[32px] border-2 border-primary-container bg-[#FDFBF0] p-8 shadow-soft">
            <h2 className="mb-3 text-2xl font-bold">Full Plan</h2>
            <p className="mb-2 text-4xl font-bold">30₾</p>
            <p className="mb-6 text-sm text-on-surface-variant">
              Recipe access + balanced daily meal plan generator.
            </p>
            <button
              onClick={() => handleSubscribe('FULL_PLAN')}
              disabled={loadingPlan !== null}
              className="w-full rounded-full bg-primary-container py-4 font-semibold text-[#FDFBF0] disabled:opacity-60"
            >
              {loadingPlan === 'FULL_PLAN' ? 'Processing...' : 'Subscribe 30₾'}
            </button>
          </div>
        </div>

        <Link href="/" className="mt-10 inline-block font-semibold text-primary">
          Back home
        </Link>
      </section>
    </main>
  );
}
