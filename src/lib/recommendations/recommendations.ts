export type RecommendationSignal = {
  kind: "view" | "purchase" | "category" | "goal";
  productId?: string | null;
  productName?: string | null;
  categoryId?: string | null;
  trainingGoal?: string | null;
};

export type RecommendationCandidate = {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  trainingGoal: string | null;
  featured: boolean;
  variants: { active: boolean; stock: number }[];
  images?: { storage_path: string; alt_text: string; sort_order: number }[];
};

export type Recommendation = {
  product: RecommendationCandidate;
  reason: string;
};

const SIGNAL_WEIGHT = { purchase: 5, view: 3, category: 2, goal: 2 } as const;

export function rankRecommendations(
  candidates: RecommendationCandidate[],
  signals: RecommendationSignal[],
  limit = 8,
): Recommendation[] {
  const eligible = candidates
    .filter((candidate) => candidate.variants.some((variant) => variant.active && variant.stock > 0))
    .sort((a, b) => Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name, "pt-BR") || a.id.localeCompare(b.id));
  const recentSignals = signals.slice(0, 100);
  const interactedProductIds = new Set(recentSignals
    .filter((signal) => signal.kind === "view" || signal.kind === "purchase")
    .map((signal) => signal.productId)
    .filter((id): id is string => Boolean(id)));

  const ranked = eligible.flatMap((product) => {
    const matches = recentSignals.flatMap((signal, index) => {
      if (signal.productId === product.id) return [];
      const sameCategory = Boolean(signal.categoryId && signal.categoryId === product.categoryId);
      const sameGoal = Boolean(signal.trainingGoal && normalize(signal.trainingGoal) === normalize(product.trainingGoal ?? ""));
      if (!sameCategory && !sameGoal) return [];

      const specificity = signal.kind === "category" && sameCategory ? 2 : signal.kind === "goal" && sameGoal ? 2 : 0;
      const score = SIGNAL_WEIGHT[signal.kind] + specificity + (sameCategory ? 1 : 0) + (sameGoal ? 1 : 0);
      return [{ score, index, reason: explain(signal, sameCategory, sameGoal) }];
    }).sort((a, b) => b.score - a.score || a.index - b.index);

    return matches.length ? [{ product, score: matches.reduce((sum, match) => sum + match.score, 0), reason: matches[0].reason }] : [];
  }).sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name, "pt-BR") || a.product.id.localeCompare(b.product.id));

  if (ranked.length) return ranked.slice(0, limit).map(({ product, reason }) => ({ product, reason }));

  return eligible.filter((product) => !interactedProductIds.has(product.id)).slice(0, limit)
    .map((product) => ({ product, reason: product.featured
      ? "Produto em destaque com estoque disponível."
      : "Produto disponível no catálogo." }));
}

function explain(signal: RecommendationSignal, sameCategory: boolean, sameGoal: boolean): string {
  if (signal.kind === "category" && signal.categoryId) return "Da categoria que você explorou.";
  if (signal.kind === "goal" && signal.trainingGoal) return `Para seu objetivo de treino: ${signal.trainingGoal}.`;
  if (signal.kind === "purchase" && signal.productName) return `Relacionada à sua compra de ${signal.productName}.`;
  if (signal.kind === "view" && signal.productName) return `Relacionada ao produto que você viu: ${signal.productName}.`;
  if (sameGoal && signal.trainingGoal) return `Para seu objetivo de treino: ${signal.trainingGoal}.`;
  return sameCategory ? "Da mesma categoria de um produto do seu histórico." : "Para um objetivo de treino do seu histórico.";
}

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase("pt-BR");
}
