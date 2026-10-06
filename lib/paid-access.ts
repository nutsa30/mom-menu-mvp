type AccessAccount = {
  role?: string; subscriptionStatus: string; isBlocked?: boolean;
  paymentFailedAt?: Date | string | null; subscriptionRenewsAt?: Date | string | null;
};

export function hasPaidAccess(account: AccessAccount | null | undefined, fullOnly = false, now = Date.now()): boolean {
  if (!account || account.isBlocked) return false;
  if (account.role === 'ADMIN') return true;
  if (account.paymentFailedAt) return false;
  if (!['FULL_PLAN', ...(!fullOnly ? ['RECIPE_PLAN'] : [])].includes(account.subscriptionStatus)) return false;
  if (account.subscriptionRenewsAt) {
    const end = new Date(account.subscriptionRenewsAt).getTime();
    if (!Number.isFinite(end) || end <= now) return false;
  }
  return true;
}
