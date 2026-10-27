export type ReplacementCost = {
  amount: number;
  currency: "EUR";
  basis: "exact" | "product-family" | "comparable";
  sourceTitle: string;
  sourceUrl: string;
  researchedAt: string;
};

export const replacementCosts: Record<string, ReplacementCost> = {};

export function formatReplacementCost(cost: ReplacementCost): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: cost.currency, maximumFractionDigits: 0 }).format(cost.amount);
}

export function replacementCostBasisLabel(basis: ReplacementCost["basis"]): string {
  if (basis === "exact") return "Current exact-product price";
  if (basis === "product-family") return "Current product-family replacement";
  return "Current comparable replacement";
}
