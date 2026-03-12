import type { BeautyMetrics } from '../types';

/**
 * BeautyScorer - Analyzes glitched images for aesthetic quality
 * Prioritizes images with color diversity, recognizable shapes, and visual interest
 */

export class BeautyScorer {
  /**
   * Analyze an image and return beauty metrics
   * @param imageBlob - The glitched image blob
   * @param originalBlob - The original image blob for comparison
   * @returns Promise resolving to beauty metrics
   */
  static async analyzeImage(
    imageBlob: Blob,
    originalBlob?: Blob
  ): Promise<BeautyMetrics> {
    const imageData = await this.loadImageData(imageBlob);
    
    const colorDiversity = this.calculateColorDiversity(imageData);
    const isBalanced = this.checkBalance(imageData);
    
    // If we have the original, calculate difference
    let differenceFromOriginal = 50; // Default middle value
    if (originalBlob) {
      const originalData = await this.loadImageData(originalBlob);
      differenceFromOriginal = this.calculateDifference(imageData, originalData);
    }
    
    // Calculate overall score
    // Prioritize color diversity and balance, moderate difference
    const overallScore = this.calculateOverallScore(
      colorDiversity,
      differenceFromOriginal,
      isBalanced
    );
    
    return {
      colorDiversity,
      differenceFromOriginal,
      isBalanced,
      overallScore
    };
  }

  /**
   * Load image data from blob using canvas
   */
  private static async loadImageData(blob: Blob): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(blob);
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Use smaller size for performance (max 200x200)
        const maxSize = 200;
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        canvas.width = Math.floor(img.width * scale);
        canvas.height = Math.floor(img.height * scale);
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        URL.revokeObjectURL(url);
        resolve(imageData);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };
      
      img.src = url;
    });
  }

  /**
   * Calculate color diversity using histogram analysis
   * Returns 0-100, where higher means more diverse colors
   */
  private static calculateColorDiversity(imageData: ImageData): number {
    const pixels = imageData.data;
    const colorMap = new Map<string, number>();
    
    // Sample pixels (every 4th pixel for performance)
    for (let i = 0; i < pixels.length; i += 16) { // RGBA, so +16 = 4 pixels
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      
      // Reduce color space to buckets (64 levels per channel = 262,144 colors)
      const rBucket = Math.floor(r / 4);
      const gBucket = Math.floor(g / 4);
      const bBucket = Math.floor(b / 4);
      
      const colorKey = `${rBucket},${gBucket},${bBucket}`;
      colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
    }
    
    const uniqueColors = colorMap.size;
    const totalSamples = pixels.length / 16;
    
    // More unique colors = higher score
    // Normalize to 0-100
    const diversity = Math.min((uniqueColors / totalSamples) * 200, 100);
    
    return Math.round(diversity);
  }

  /**
   * Check if image is balanced (not completely gray/black/white)
   */
  private static checkBalance(imageData: ImageData): boolean {
    const pixels = imageData.data;
    let grayCount = 0;
    let extremelyDarkCount = 0;
    let extremelyLightCount = 0;
    let totalSampled = 0;
    
    // Sample pixels
    for (let i = 0; i < pixels.length; i += 16) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      
      totalSampled++;
      
      // Check if gray (RGB values close together)
      const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(b - r));
      if (maxDiff < 15) {
        grayCount++;
      }
      
      // Check if extremely dark (all RGB < 30)
      if (r < 30 && g < 30 && b < 30) {
        extremelyDarkCount++;
      }
      
      // Check if extremely light (all RGB > 225)
      if (r > 225 && g > 225 && b > 225) {
        extremelyLightCount++;
      }
    }
    
    const grayRatio = grayCount / totalSampled;
    const darkRatio = extremelyDarkCount / totalSampled;
    const lightRatio = extremelyLightCount / totalSampled;
    
    // Reject if >70% gray, or >80% extremely dark/light
    if (grayRatio > 0.7 || darkRatio > 0.8 || lightRatio > 0.8) {
      return false;
    }
    
    return true;
  }

  /**
   * Calculate perceptual difference from original image
   * Returns 0-100, where 0 = identical, 100 = completely different
   */
  private static calculateDifference(
    glitchedData: ImageData,
    originalData: ImageData
  ): number {
    const pixels1 = glitchedData.data;
    const pixels2 = originalData.data;
    
    let totalDiff = 0;
    let sampledPixels = 0;
    
    const minLength = Math.min(pixels1.length, pixels2.length);
    
    // Sample every 4th pixel
    for (let i = 0; i < minLength; i += 16) {
      const rDiff = Math.abs(pixels1[i] - pixels2[i]);
      const gDiff = Math.abs(pixels1[i + 1] - pixels2[i + 1]);
      const bDiff = Math.abs(pixels1[i + 2] - pixels2[i + 2]);
      
      // Average RGB difference
      totalDiff += (rDiff + gDiff + bDiff) / 3;
      sampledPixels++;
    }
    
    // Average difference per pixel, normalized to 0-100
    const avgDiff = totalDiff / sampledPixels;
    const normalizedDiff = (avgDiff / 255) * 100;
    
    return Math.round(normalizedDiff);
  }

  /**
   * Calculate overall beauty score based on metrics
   * Prioritizes: color diversity > balance > moderate difference
   */
  private static calculateOverallScore(
    colorDiversity: number,
    differenceFromOriginal: number,
    isBalanced: boolean
  ): number {
    // If not balanced, heavily penalize
    if (!isBalanced) {
      return Math.min(colorDiversity * 0.3, 30);
    }
    
    // Ideal difference is 10-40% (visible glitch but recognizable)
    let diffScore = 0;
    if (differenceFromOriginal >= 10 && differenceFromOriginal <= 40) {
      // Perfect range
      diffScore = 100;
    } else if (differenceFromOriginal < 10) {
      // Too similar
      diffScore = (differenceFromOriginal / 10) * 70; // Max 70
    } else if (differenceFromOriginal <= 60) {
      // Moderately too different, but still acceptable
      diffScore = 100 - ((differenceFromOriginal - 40) / 20) * 30; // 100 down to 70
    } else {
      // Way too different
      diffScore = Math.max(70 - ((differenceFromOriginal - 60) / 40) * 70, 0); // 70 down to 0
    }
    
    // Weighted average: 50% color diversity, 30% difference score, 20% balance bonus
    const score = colorDiversity * 0.5 + diffScore * 0.3 + (isBalanced ? 20 : 0);
    
    return Math.round(Math.min(score, 100));
  }
}
