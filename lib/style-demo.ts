import type { StyleProfileEdition, StyleRecommendation, StyleSignal } from "./style-assistant-types";

export function demoStyle(ownerId: string) {
  const signal = (title: string): StyleSignal => ({ title, summary: "A synthetic example to explore the interface; no personal style has been inferred.", evidence: [], confidence: "tentative" });
  const edition: StyleProfileEdition = {
    id: "demo-style", ownerId, status: "current", createdAt: "2026-01-01", sourceDataEdition: "synthetic-demo",
    title: "Explore a sample style briefing", thesis: "Try colour, texture and proportion with four fictional garments. These suggestions demonstrate the workspace; they are not based on anyone's photos.",
    aspiration: "Build a wardrobe around your own preferences.",
    styleWords: ["Colour", "Texture", "Ease"].map((word) => ({ word, status: "candidate", explanation: "A demonstration word, ready to replace with your own intention." })),
    approvedIntentionWords: [], creativeTension: "Use the examples as a starting point, then build from real evidence.",
    signatureCodes: [signal("One clear colour")], defaultFormulas: [signal("Shirt, trousers, jacket")],
    silhouette: signal("Relaxed shapes"), colourBehaviour: signal("Cobalt and forest"), patternAndTexture: signal("Plain fabrics"),
    contextMap: [], trajectory: [], antiSignals: [],
    coverage: { years: [], observations: 0, completeOutfits: 0, upperBodyOnly: 0, partial: 0, confidence: "tentative" },
    changedBecause: ["This edition contains fictional sample content only."], confidence: "tentative",
    validation: { status: "passed", checkedAt: "2026-01-01", ruleset: "synthetic-demo-only" },
  };
  const recommendations: StyleRecommendation[] = [
    { slot: "wear-next", title: "Try the light shirt with forest trousers", advice: "Use the cream shirt as a light base and the forest trousers as the anchor.", ids: ["demo-shirt", "demo-trousers"] },
    { slot: "small-change", title: "Add the cobalt jacket", advice: "Try one saturated layer over the light shirt.", ids: ["demo-jacket", "demo-shirt"] },
    { slot: "wardrobe-decision", title: "Explore before you buy", advice: "Try a few combinations before deciding that anything is missing.", ids: ["demo-shoes", "demo-trousers"] },
  ].map((sample, index) => ({
    id: `demo-recommendation-${index}`, ownerId, editionId: edition.id, surface: "briefing",
    briefingSlot: sample.slot as StyleRecommendation["briefingSlot"], kind: "wear", title: sample.title,
    whatISee: "Fictional garments in the demo catalogue.", whyItMatters: "This illustrates how a suggestion connects to specific catalogue items.",
    directAdvice: sample.advice, action: "Try the combination", expectedEffect: "An example of colour balance.",
    evidence: [], observedFacts: [], inferredSignals: [], statedGoals: [], principle: "Try before buying.",
    alternatives: [], confidence: "tentative", novelty: "familiar", impact: 1, effort: 1, wardrobeLeverage: 1,
    itemIds: sample.ids, outfitIds: [], missingEvidence: ["Personal photos, fit and comfort feedback"],
    status: "new", createdAt: "2026-01-01", validationStatus: "passed",
    validation: { status: "passed", checkedAt: "2026-01-01", ruleset: "synthetic-demo-only" },
  }));
  return { edition, recommendations };
}
