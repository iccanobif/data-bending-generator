export interface GlitchOptions {
  intensity: number; // 1-10 (for Phase 2, default to 5 in POC)
  seed?: number; // Random seed for reproducibility
}

export interface GlitchedImage {
  id: string;
  blobUrl: string;
  blob: Blob;
  selected: boolean;
  beautyScore?: number; // For Phase 3
}

export interface BeautyMetrics {
  colorDiversity: number;    // 0-100
  differenceFromOriginal: number; // 0-100
  isBalanced: boolean;       // not completely black/white
  overallScore: number;      // 0-100
}
