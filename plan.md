## Plan: Data Bending Glitch Art Web Application

A browser-based Vue.js + TypeScript application that generates glitch art through JPG byte manipulation, presenting 10 variant candidates for user selection and download.

**Tech Stack Decisions**

- **Framework**: Vue.js 3 with Composition API + TypeScript
- **Styling**: Vanilla CSS with responsive grid, no framework dependencies
- **Dev Server**: Vite
- **Image format**: Process and save as JPG (preserving original format)
- **Variant count**: Generate exactly 10 glitched variations per upload
- **All processing runs in browser** (no backend initially)

**Implementation Strategy: Minimal POC First**

Start with a minimal proof of concept to test the core data bending functionality, then add enhancements.

---

## PHASE 1: MINIMAL POC (Priority 1 - ✅ COMPLETED)

**Goal**: Get basic data bending working end-to-end with minimal UI

### Steps

1. **Project Setup** ✅
   - Initialize project with Vite + Vue 3 + TypeScript
   - Create basic folder structure: src/, src/components/, src/lib/, src/types/
   - Set up tsconfig.json for strict TypeScript
   - Create minimal HTML entry point

2. **Core Data Bending Engine** (TypeScript) ✅
   - `src/lib/DataBender.ts` — JPEG byte manipulation logic
     - Parse JPEG structure to identify safe zones (avoid headers/markers)
     - Implement simple random byte modification
     - Return modified byte array as blob
   - `src/types/index.ts` — TypeScript interfaces (GlitchOptions, ImageData, etc.)

3. **Glitch Generator** (TypeScript) ✅
   - `src/lib/GlitchGenerator.ts` — Orchestrate generation of 10 variants
     - Generate 10 variants with different random seeds
     - Return array of blob URLs for display

4. **Minimal UI Components** ✅
   - `src/App.vue` — Root component, basic layout
   - `src/components/ImageUploader.vue` — Simple file input (no drag-and-drop yet)
   - `src/components/ImageGallery.vue` — Display original + 10 variants in grid
     - Show thumbnails auto-scaled to viewport
     - Click to select/deselect (visual border highlight)
     - "Download Selected" button

5. **Download Functionality** ✅
   - Implement batch download of selected images as JPG files
   - Sequential naming: `glitch_1.jpg`, `glitch_2.jpg`, etc.

6. **Basic Styling** ✅
   - `src/styles/main.css` — Minimal CSS for grid layout and selection states
   - Auto-scale images to fit viewport

### POC Success Criteria
- ✅ Upload a JPG and see 10 glitched variants
- ✅ Variants have visible glitch effects but are not completely corrupted
- ✅ Can select multiple variants
- ✅ Can download selected variants as JPG files
- ✅ All code is in TypeScript with proper types

---

## PHASE 2: ENHANCEMENTS (Priority 2 - ✅ COMPLETED)

**Goal**: Add polish and advanced features

### Steps

7. **Glitch Intensity Control** ✅
   - Add slider component (1-10 intensity)
   - Modify DataBender to accept intensity parameter
   - Intensity affects number of bytes modified and modification range
   - Regenerate variants when intensity changes

8. **Improved Upload UX** ✅
   - Add drag-and-drop support to ImageUploader
   - Add file validation with user-friendly error messages
   - Visual feedback on drag over

9. **Enhanced Gallery** ✅
   - Add "show original" toggle
   - Select All / Deselect All buttons
   - Add keyboard navigation (arrow keys to navigate, space to select, Enter to download)
   - Focused item indicator
   - Keyboard hints display

---

## PHASE 3: BEAUTY ALGORITHM (Priority 3 - Optional Enhancement)

**Goal**: Implement intelligent filtering/ranking of glitch variants

### Steps

10. **Beauty Scorer Module** (TypeScript)
    - `src/lib/BeautyScorer.ts` — Analyze image quality
      - Color diversity metric (histogram analysis via canvas)
      - Difference from original (perceptual hash comparison)
      - Balance check (reject completely black/white images)
      - Return score 0-100

11. **Hybrid Display Strategy**
    - Rank all 10 variants by beauty score
    - Display top 5 by default
    - "Show All Variants" button to reveal remaining 5
    - Visual indicator of beauty score (star rating or numeric)

12. **Optional Beauty Filter Toggle**
    - UI toggle to enable/disable beauty filtering
    - When disabled, show all 10 in random order
    - Save user preference to localStorage

---

## File Structure

```
data-bending/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
├── src/
│   ├── main.ts                          # Vue app entry point
│   ├── App.vue                           # Root component
│   ├── components/
│   │   ├── ImageUploader.vue             # File upload (Phase 1: basic, Phase 2: drag-drop)
│   │   ├── ImageGallery.vue              # Display variants with selection
│   │   └── IntensitySlider.vue           # (Phase 2) Glitch intensity control
│   ├── lib/
│   │   ├── DataBender.ts                 # Core JPEG manipulation
│   │   ├── GlitchGenerator.ts            # Generate 10 variants
│   │   └── BeautyScorer.ts               # (Phase 3) Image quality analysis
│   ├── types/
│   │   └── index.ts                      # TypeScript interfaces
│   └── styles/
│       └── main.css                      # Vanilla CSS
└── README.md
```

---

## TypeScript Interfaces (Draft)

```typescript
// src/types/index.ts

export interface GlitchOptions {
  intensity: number; // 1-10
  seed?: number;
}

export interface GlitchedImage {
  id: string;
  blobUrl: string;
  blob: Blob;
  beautyScore?: number;
}

export interface BeautyMetrics {
  colorDiversity: number;    // 0-100
  differenceFromOriginal: number; // 0-100
  isBalanced: boolean;       // not completely black/white
  overallScore: number;      // 0-100
}
```

---

## Verification Checklist

### Phase 1 (POC)
- [x] Project builds without TypeScript errors
- [x] Upload JPG → see 10 glitched variants in grid
- [x] Variants have visible but not destructive glitches
- [x] Click to select/deselect variants (visual feedback)
- [x] Download selected variants as valid JPG files
- [x] Images auto-scale to viewport

### Phase 2 (Enhancements)
- [x] Intensity slider changes glitch severity
- [x] Drag-and-drop file upload works
- [x] Error handling for invalid files
- [x] Show Original toggle
- [x] Select All / Deselect All buttons
- [x] Keyboard navigation (arrows, space, enter)

### Phase 3 (Beauty Algorithm)
- [ ] Beauty scores calculated for all variants
- [ ] Top 5 shown by default, "Show All" reveals rest
- [ ] Toggle beauty filter on/off

---

## Implementation Order Summary

1. **First**: Minimal POC (Steps 1-6) — Core functionality only ✅ **COMPLETED**
2. **Then**: Enhancements (Steps 7-9) — Intensity control, better UX
3. **Finally**: Beauty Algorithm (Steps 10-12) — Optional intelligent ranking

---

## Development Server

Running at: http://localhost:3000
