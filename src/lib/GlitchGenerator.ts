import { DataBender } from './DataBender';
import { BeautyScorer } from './BeautyScorer';
import type { GlitchedImage, GlitchOptions, BeautyMetrics } from '../types';

/**
 * GlitchGenerator - Orchestrates the generation of multiple glitched variants
 * Uses DataBender to create 10 unique variations of an input image
 */

export class GlitchGenerator {
  /**
   * Generate multiple glitched variants from a single image
   * @param file - The original JPEG file
   * @param baseIntensity - Base glitch intensity (1-10), default 5
   * @param count - Number of variants to generate, default 10
   * @returns Promise resolving to array of glitched images sorted by beauty score
   */
  static async generateVariants(
    file: File,
    baseIntensity: number = 5,
    count: number = 10
  ): Promise<GlitchedImage[]> {
    // Read the file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    const variants: GlitchedImage[] = [];

    // Generate variants with different random seeds and varying intensities
    for (let i = 0; i < count; i++) {
      // Vary intensity slightly for each variant (±20% of base)
      const intensityVariation = baseIntensity * 0.2;
      const variantIntensity = baseIntensity + (Math.random() * intensityVariation * 2 - intensityVariation);
      const clampedIntensity = Math.max(1, Math.min(10, variantIntensity));

      const options: GlitchOptions = {
        intensity: clampedIntensity,
        seed: Date.now() + i * 1000 + Math.floor(Math.random() * 1000)
      };

      // Generate glitched blob using DataBender
      const glitchedBlob = DataBender.bendData(arrayBuffer, options);
      
      // Create blob URL for display
      const blobUrl = URL.createObjectURL(glitchedBlob);

      variants.push({
        id: `glitch-${i + 1}`,
        blobUrl,
        blob: glitchedBlob,
        selected: false
      });
    }

    // Analyze beauty scores for all variants
    await this.analyzeBeauty(variants, file);

    // Sort by beauty score (highest first)
    variants.sort((a, b) => (b.beautyScore?.overallScore || 0) - (a.beautyScore?.overallScore || 0));

    // Reassign IDs after sorting to maintain proper order
    variants.forEach((variant, index) => {
      variant.id = `glitch-${index + 1}`;
    });

    return variants;
  }

  /**
   * Analyze beauty scores for all variants
   * @param variants - Array of glitched images
   * @param originalFile - The original image file for comparison
   */
  private static async analyzeBeauty(
    variants: GlitchedImage[],
    originalFile: File
  ): Promise<void> {
    // Analyze each variant in parallel
    const analysisPromises = variants.map(async (variant) => {
      const metrics = await BeautyScorer.analyzeImage(variant.blob, originalFile);
      variant.beautyScore = metrics;
    });

    await Promise.all(analysisPromises);
  }

  /**
   * Clean up blob URLs to prevent memory leaks
   * @param variants - Array of glitched images
   */
  static revokeVariants(variants: GlitchedImage[]): void {
    variants.forEach(variant => {
      URL.revokeObjectURL(variant.blobUrl);
    });
  }
}
