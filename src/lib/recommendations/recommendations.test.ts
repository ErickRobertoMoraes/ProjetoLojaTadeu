import { describe, expect, it } from "vitest";
import { rankRecommendations, type RecommendationCandidate } from "./recommendations";

const candidate = (id: string, overrides: Partial<RecommendationCandidate> = {}): RecommendationCandidate => ({
  id, name: `Produto ${id}`, slug: `produto-${id}`, categoryId: "categoria-a", trainingGoal: "Força",
  featured: false, variants: [{ active: true, stock: 3 }], ...overrides,
});

describe("rankRecommendations", () => {
  it("ranks matching category and goal signals deterministically with a reason", () => {
    const products = [candidate("b"), candidate("a", { categoryId: "categoria-b" })];
    const signals = [
      { kind: "category" as const, categoryId: "categoria-a" },
      { kind: "goal" as const, trainingGoal: "Força" },
    ];
    const first = rankRecommendations(products, signals);
    expect(first.map(({ product }) => product.id)).toEqual(["b", "a"]);
    expect(first[0].reason).toContain("categoria");
    expect(rankRecommendations(products, signals)).toEqual(first);
  });

  it("explains recommendations using the related viewed or purchased product", () => {
    const products = [candidate("related")];
    expect(rankRecommendations(products, [{ kind: "view", productId: "source", productName: "Camiseta", categoryId: "categoria-a" }])[0].reason)
      .toContain("viu: Camiseta");
    expect(rankRecommendations(products, [{ kind: "purchase", productId: "source", productName: "Whey", categoryId: "categoria-a" }])[0].reason)
      .toContain("compra de Whey");
  });

  it("explains category and training goal matches", () => {
    expect(rankRecommendations([candidate("category")], [{ kind: "category", categoryId: "categoria-a" }])[0].reason)
      .toContain("categoria que você explorou");
    expect(rankRecommendations([candidate("goal")], [{ kind: "goal", trainingGoal: "Força" }])[0].reason)
      .toContain("seu objetivo de treino: Força");
  });

  it("omits viewed products and candidates without active stock", () => {
    const products = [candidate("seen"), candidate("empty", { variants: [{ active: true, stock: 0 }] })];
    expect(rankRecommendations(products, [{ kind: "view", productId: "seen", categoryId: "categoria-a" }])).toEqual([]);
  });

  it("uses a deterministic featured-first in-stock fallback without history", () => {
    const products = [candidate("z"), candidate("b", { featured: true }), candidate("a", { variants: [{ active: false, stock: 8 }] })];
    expect(rankRecommendations(products, []).map(({ product, reason }) => [product.id, reason])).toEqual([
      ["b", "Produto em destaque com estoque disponível."],
      ["z", "Produto disponível no catálogo."],
    ]);
  });
});
