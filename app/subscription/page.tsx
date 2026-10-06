import { getExperience } from '@/lib/experience';
import { planPrice } from '@/lib/market';
import { PLAN_AMOUNTS_BY_INTERVAL } from '@/lib/bog';
import SubscriptionClient from './SubscriptionClient';

export default async function SubscriptionPage() {
  const experience = await getExperience();
  const planAmounts = {
    1: planPrice(experience.market, 1),
    3: planPrice(experience.market, 3),
    6: planPrice(experience.market, 6),
  };
  return <SubscriptionClient planAmounts={planAmounts} />;
}
