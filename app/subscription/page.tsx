import { PLAN_AMOUNTS_BY_INTERVAL } from '@/lib/bog';
import SubscriptionClient from './SubscriptionClient';

export default function SubscriptionPage() {
  const planAmounts = {
    1: Number(PLAN_AMOUNTS_BY_INTERVAL[1] ?? 17),
    3: Number(PLAN_AMOUNTS_BY_INTERVAL[3] ?? 39),
    6: Number(PLAN_AMOUNTS_BY_INTERVAL[6] ?? 59),
  };
  return <SubscriptionClient planAmounts={planAmounts} />;
}
