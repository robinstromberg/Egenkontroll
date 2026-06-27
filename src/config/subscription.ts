export type BillingPlan = 'monthly' | 'annual';
export type SubscriptionStatus = 'inactive' | 'trial' | 'active' | 'past_due' | 'cancelled';

export const trialDays = 30;

export const billingPlans: Record<BillingPlan, {
  label: string;
  priceLabel: string;
  description: string;
}> = {
  monthly: {
    label: 'Månadsvis',
    priceLabel: '129 kr/mån',
    description: 'Flexibelt när du vill komma igång och utvärdera i lugn takt.',
  },
  annual: {
    label: 'Årsvis',
    priceLabel: '99 kr/mån',
    description: 'Planerad årsbetalning efter lansering när betalning är aktiverad.',
  },
};

export function createTrialWindow(now = new Date()) {
  const trialStartedAt = now.toISOString();
  const trialEndsAt = new Date(now);
  trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);

  return {
    trialStartedAt,
    trialEndsAt: trialEndsAt.toISOString(),
  };
}

export function daysUntilTrialEnds(trialEndsAt: string | null): number | null {
  if (!trialEndsAt) return null;

  const end = new Date(trialEndsAt).getTime();
  if (Number.isNaN(end)) return null;

  const diff = end - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function subscriptionStatusLabel(status: SubscriptionStatus): string {
  switch (status) {
    case 'trial':
      return 'Förhandslansering';
    case 'active':
      return 'Aktiv';
    case 'past_due':
      return 'Betalning krävs';
    case 'cancelled':
      return 'Avslutad';
    case 'inactive':
    default:
      return 'Ej aktiverad';
  }
}
