import type { EvidenceProvenance } from "./types";

export type StyleEvidenceLink = {
  outfitObservationId?: string;
  itemId?: string;
  claim: string;
  provenance: EvidenceProvenance;
};

export type StyleSignal = {
  title: string;
  summary: string;
  evidence: StyleEvidenceLink[];
  confidence: "high" | "medium" | "tentative";
};

export type StyleProfileEdition = {
  id: string;
  ownerId: string;
  status: "current" | "archive";
  createdAt: string;
  sourceDataEdition: string;
  title: string;
  thesis: string;
  aspiration: string;
  styleWords: Array<{ word: string; status: "candidate" | "approved"; explanation: string }>;
  approvedIntentionWords: string[];
  creativeTension: string;
  signatureCodes: StyleSignal[];
  defaultFormulas: StyleSignal[];
  silhouette: StyleSignal;
  colourBehaviour: StyleSignal;
  patternAndTexture: StyleSignal;
  contextMap: StyleSignal[];
  trajectory: Array<{ year: number; summary: string; evidence: StyleEvidenceLink[]; confidence: "high" | "medium" | "tentative" }>;
  antiSignals: StyleSignal[];
  coverage: {
    years: number[];
    observations: number;
    completeOutfits: number;
    upperBodyOnly: number;
    partial: number;
    confidence: "high" | "medium" | "tentative";
  };
  changedBecause: string[];
  confidence: "high" | "medium" | "tentative";
  validation: { status: "passed"; checkedAt: string; ruleset: string };
  legacyEditionId?: string;
};

export type PurchaseResearch = {
  targetPriceEur: { min: number; max: number; basis?: "market-research-band-not-client-approved-budget" };
  specification: string;
  examples: Array<{
    label: string;
    url: string;
    price: string;
    checkedAt: string;
    match: "exact-example" | "construction-example" | "lower-cost-test";
  }>;
  unlockedLooks: Array<{ title: string; itemIds: string[] }>;
  generatedImage?: string;
  generatedAssetRecord?: string;
};

export type StyleRecommendation = {
  id: string;
  ownerId: string;
  editionId: string;
  surface: "briefing" | "weekly" | "clinic" | "edit" | "gap";
  briefingSlot?: "wear-next" | "small-change" | "wardrobe-decision";
  editGroup?: "workhorse" | "expressive" | "restyle" | "alter-repair" | "uncertain" | "move-on";
  kind: "wear" | "style-edit" | "alter" | "repair" | "restyle" | "replace" | "retire" | "buy";
  title: string;
  whatISee: string;
  whyItMatters: string;
  directAdvice: string;
  action: string;
  expectedEffect: string;
  evidence: StyleEvidenceLink[];
  observedFacts: Array<{ claim: string; sourceIds: string[] }>;
  inferredSignals: Array<{ claim: string; confidence: "high" | "medium" | "tentative" }>;
  statedGoals: string[];
  principle: string;
  alternatives: string[];
  confidence: "high" | "medium" | "tentative";
  novelty: "familiar" | "stretch" | "editorial";
  impact: number;
  effort: number;
  wardrobeLeverage: number;
  itemIds: string[];
  outfitIds: string[];
  missingEvidence: string[];
  sourceObservationId?: string;
  status: "new" | "saved" | "tried" | "worked" | "not-for-me" | "wrong-context" | "superseded";
  createdAt: string;
  purchase?: PurchaseResearch;
  unlockedOutfits?: Array<{ title: string; itemIds: string[] }>;
  duplicateCheck?: string;
  alternativesBeforeBuying?: string;
  validationStatus: "passed" | "failed";
  validation: { status: "passed"; checkedAt: string; ruleset: string };
  generatedVisual?: {
    src: string;
    version: string;
    role: "worn-preview";
    label: string;
    promptSummary: string;
    sourceIds: string[];
    fidelityChecks: string[];
  };
};

export type RecommendationOutcome = {
  ownerId: string;
  recommendationId: string;
  status: "saved" | "tried" | "worked" | "not-for-me" | "wrong-context";
  recordedAt: string;
};

export type WeeklyStyleEdition = {
  id: string;
  label: string;
  createdAt: string;
  direction: Record<string, string>;
  weeklyReview: Record<string, {
    outfitsReviewed: number;
    strongest: string;
    missedOpportunity: string;
    smallestEdit: string;
  }>;
  changes: string[];
  previousEdition: string;
};
