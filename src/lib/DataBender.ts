import type { GlitchOptions } from '../types';

/**
 * DataBender - Core JPEG byte manipulation engine
 * Takes a JPEG file and applies random byte modifications to create glitch effects
 */

export class DataBender {
  /**
   * Bend (glitch) a JPEG image by randomly modifying bytes in safe zones
   * @param imageBuffer - The original JPEG file as ArrayBuffer
   * @param options - Glitch options (intensity, seed)
   * @returns A new glitched JPEG as Blob
   */
  static bendData(imageBuffer: ArrayBuffer, options: GlitchOptions): Blob {
    const bytes = new Uint8Array(imageBuffer);
    const glitchedBytes = new Uint8Array(bytes);

    // Find the scan data section (the actual image data)
    const scanStart = this.findScanDataStart(glitchedBytes);
    const scanEnd = this.findScanDataEnd(glitchedBytes, scanStart);

    if (scanStart === -1 || scanEnd === -1) {
      console.warn('Could not identify JPEG scan data, applying minimal glitching');
      // Fallback: glitch the last 70% of the file
      return this.fallbackGlitch(glitchedBytes, options);
    }

    // Calculate how many bytes to modify based on intensity
    const scanDataLength = scanEnd - scanStart;
    const intensity = options.intensity || 5; // Default intensity 5/10
    const bytesToModify = Math.floor(scanDataLength * (intensity / 100));

    // Use seed for reproducibility if provided
    const random = this.seededRandom(options.seed || Date.now());

    // Randomly modify bytes in the scan data section
    for (let i = 0; i < bytesToModify; i++) {
      const position = scanStart + Math.floor(random() * scanDataLength);
      
      // Avoid modifying marker bytes (0xFF) to prevent complete corruption
      if (glitchedBytes[position] !== 0xFF) {
        // Random modification strategies
        const strategy = Math.floor(random() * 3);
        
        switch (strategy) {
          case 0: // Random value
            glitchedBytes[position] = Math.floor(random() * 256);
            break;
          case 1: // Bit flip
            glitchedBytes[position] ^= Math.floor(random() * 256);
            break;
          case 2: // Shift
            glitchedBytes[position] = (glitchedBytes[position] + Math.floor(random() * 50)) % 256;
            break;
        }
      }
    }

    return new Blob([new Uint8Array(glitchedBytes)], { type: 'image/jpeg' });
  }

  /**
   * Find the start of JPEG scan data (after FFDA marker - Start of Scan)
   */
  private static findScanDataStart(bytes: Uint8Array): number {
    for (let i = 0; i < bytes.length - 1; i++) {
      // Look for FFDA marker (Start of Scan)
      if (bytes[i] === 0xFF && bytes[i + 1] === 0xDA) {
        // Skip the marker and its length bytes
        // FFDA is followed by 2 bytes indicating segment length
        const segmentLength = (bytes[i + 2] << 8) | bytes[i + 3];
        return i + 2 + segmentLength;
      }
    }
    return -1;
  }

  /**
   * Find the end of JPEG scan data (before FFD9 marker - End of Image)
   */
  private static findScanDataEnd(bytes: Uint8Array, startPos: number): number {
    for (let i = bytes.length - 2; i >= startPos; i--) {
      // Look for FFD9 marker (End of Image)
      if (bytes[i] === 0xFF && bytes[i + 1] === 0xD9) {
        return i;
      }
    }
    return bytes.length - 2;
  }

  /**
   * Fallback glitching strategy when JPEG structure parsing fails
   */
  private static fallbackGlitch(bytes: Uint8Array, options: GlitchOptions): Blob {
    const startPos = Math.floor(bytes.length * 0.3); // Skip first 30%
    const endPos = bytes.length - 2; // Preserve last 2 bytes (EOI marker)
    const length = endPos - startPos;
    
    const intensity = options.intensity || 5;
    const bytesToModify = Math.floor(length * (intensity / 200)); // More conservative
    const random = this.seededRandom(options.seed || Date.now());

    for (let i = 0; i < bytesToModify; i++) {
      const position = startPos + Math.floor(random() * length);
      if (bytes[position] !== 0xFF) {
        bytes[position] = Math.floor(random() * 256);
      }
    }

    return new Blob([new Uint8Array(bytes)], { type: 'image/jpeg' });
  }

  /**
   * Simple seeded random number generator (Mulberry32)
   * Returns a function that generates random numbers between 0 and 1
   */
  private static seededRandom(seed: number): () => number {
    return function() {
      let t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
}
