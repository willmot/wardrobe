export type Confidence = "exact" | "probable" | "possible" | "unidentified";
export type ReviewState = "approved";
export type PairingType = "worn" | "suggested";
export type Season = "spring" | "summer" | "autumn" | "winter";
export type Formality = "sport" | "casual" | "smart-casual" | "formal" | "costume";
export type GarmentWeight = "light" | "midweight" | "heavy";

export type GarmentColor = {
  name: string;
  hex: string;
};

export type GarmentStyle = {
  seasons: Season[];
  textures: string[];
  formality: Formality;
  silhouettes: string[];
  weight: GarmentWeight;
};

export type Pairing = {
  itemId: string;
  type: PairingType;
  count?: number;
  rationale: string;
};

export type WardrobeProfile = {
  id: string;
  name: string;
  photosName: string;
  initials: string;
};

export type OutfitRegion = "head" | "eyes" | "neck" | "upper-body" | "hands" | "lower-body" | "feet" | "carried";
export type OutfitRegionStatus = "observed" | "visible-none" | "out-of-frame" | "occluded" | "ambiguous";
export type OutfitCompleteness = "full" | "clothing-complete" | "partial" | "upper-body-only" | "accessories-only";
export type EvidenceProvenance = "observed" | "inferred" | "stated";

export type OutfitEvidencePhoto = {
  photoId: string;
  url: string;
  capturedAt: string;
  regionStatus: Record<OutfitRegion, OutfitRegionStatus>;
};

export type OutfitObservedItem = {
  itemId: string;
  ownerId: string;
  ownership: "owned" | "borrowed";
  provenance: "observed";
  visibility: "full" | "partial" | "detail";
  regions: OutfitRegion[];
  observationIds: string[];
};

export type OutfitObservation = {
  id: string;
  ownerId: string;
  sessionId: string;
  capturedAt: string;
  year: number;
  subjectStatus: "confirmed";
  sourceImageIds: string[];
  completeness: OutfitCompleteness;
  observedItems: OutfitObservedItem[];
  evidencePhotos: OutfitEvidencePhoto[];
  context: {
    label: string | null;
    season: Season;
    occasion: "home" | "casual" | "work" | "evening" | "event" | "travel" | "outdoors" | "sport" | "costume" | "unknown";
    provenance: EvidenceProvenance;
    confidence: "high" | "medium" | "low";
  };
  provenance: "source-photo-session";
  confidence: "high" | "medium";
  supersedes?: string;
};

export type ResearchSource = {
  title: string;
  url: string;
  sourceType: "official" | "retailer" | "resale" | "editorial";
  retrievedAt: string;
};

export type WardrobeItem = {
  ownerId: string;
  id: string;
  name: string;
  brand: string;
  product: string;
  category: "Outerwear" | "Tops" | "Knitwear" | "Dresses" | "Bottoms" | "Footwear" | "Accessories";
  layer: string;
  color: string;
  colors: {
    primary: GarmentColor;
    secondary?: GarmentColor;
  };
  material: string;
  pattern: string;
  tags: string[];
  style: GarmentStyle;
  lastWorn: string;
  wornCount: number;
  confidence: Confidence;
  status: ReviewState;
  image: string;
  sourceImages: string[];
  sourceDates: string[];
  pairings: Pairing[];
  research: ResearchSource[];
  notes: string;
  aiGenerated: boolean;
  renderState: "ready" | "pending" | "failed";
};

export type ImportRun = {
  ownerId: string;
  id: string;
  startedAt: string;
  windowLabel: string;
  status: "complete" | "ready_for_review" | "permission_needed" | "running" | "partial_failure";
  found: number;
  newPhotos: number;
  observations: number;
  reviewCount: number;
  message: string;
  /** Photos identifiers captured by this run, used to keep overlapping imports idempotent. */
  photoIds?: string[];
  skipped?: number;
  exported?: number;
};

export type StoreShape = {
  profiles: WardrobeProfile[];
  wardrobe: WardrobeItem[];
  imports: ImportRun[];
  outfitObservations: OutfitObservation[];
  recommendationOutcomes: Array<{
    ownerId: string;
    recommendationId: string;
    status: "saved" | "tried" | "worked" | "not-for-me" | "wrong-context";
    recordedAt: string;
  }>;
};
