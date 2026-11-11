"use client";

import { useEffect, useRef } from "react";

type Props = { productId?: string; categoryId?: string; trainingGoal?: string };

export function BrowsingEventTracker({ productId, categoryId, trainingGoal }: Props) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    const signal = productId ? { product_id: productId }
      : categoryId ? { category_id: categoryId }
        : trainingGoal ? { training_goal: trainingGoal } : null;
    if (!signal) return;
    sent.current = true;
    void fetch("/api/browsing-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(signal),
    }).catch(() => undefined);
  }, [productId, categoryId, trainingGoal]);

  return null;
}
