# Data Bending Glitch Art Generator

A web application that creates glitch art through JPEG byte manipulation. Upload a photo and get 10 unique glitched variants to choose from.

## Features (Phase 1 - POC)

- ✅ Upload JPEG images
- ✅ Capture JPEG images directly from webcam
- ✅ Generate 10 glitched variants using random byte manipulation
- ✅ Select multiple variants
- ✅ Download selected images as JPEG files
- ✅ Responsive grid layout with auto-scaled images
- ✅ Built with Vue 3 + TypeScript

## How It Works

1. **Upload**: Choose a JPEG image (max 10MB)
2. **Capture (optional)**: Use "Use Webcam" to shoot a picture directly in the browser
3. **Generate**: The app automatically creates 10 glitched variants
4. **Select**: Click on images to select/deselect your favorites
5. **Download**: Click "Download Selected" to save chosen variants

## Technical Details

### Data Bending Algorithm

The application uses smart JPEG byte manipulation:
- Parses JPEG structure to identify safe modification zones
- Randomly modifies bytes in the scan data section
- Avoids headers and markers to prevent complete corruption
- Uses different random seeds for each variant to ensure variety

### Architecture

- **DataBender.ts**: Low-level JPEG byte manipulation engine
- **GlitchGenerator.ts**: Orchestrates generation of 10 variants
- **Vue Components**: Reactive UI with TypeScript
- **100% Client-Side**: All processing happens in your browser

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Usage

1. Open the app in your browser (usually http://localhost:3000)
2. Click "Choose File" and select a JPEG image, or click "Use Webcam" and capture a photo
3. Wait a few seconds for glitch variants to generate
4. Click on variants to select them (green border indicates selection)
5. Click "Download Selected" to save your favorites

## Future Enhancements (Planned)

### Phase 2
- Intensity slider (control glitch severity)
- Drag-and-drop file upload
- Better error handling and UX improvements

### Phase 3
- Beauty scoring algorithm (color diversity, difference from original)
- Smart ranking: show top 5 variants by default, expandable to all 10
- Optional beauty filter toggle

## Project Structure

```
data-bending/
├── src/
│   ├── components/
│   │   ├── ImageUploader.vue    # File upload interface
│   │   └── ImageGallery.vue     # Display variants with selection
│   ├── lib/
│   │   ├── DataBender.ts        # JPEG byte manipulation
│   │   └── GlitchGenerator.ts   # Generate variants
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces
│   ├── styles/
│   │   └── main.css             # Global styles
│   ├── App.vue                  # Root component
│   └── main.ts                  # App entry point
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Tips

- **Best results**: High-quality JPEG images work best
- **File size**: Keep images under 10MB for optimal performance
- **Variety**: Each upload generates fresh variants with different glitch patterns
- **Selection**: You can select all 10 variants if you want them all!

## License

MIT

## Credits

Built with Vue.js, TypeScript, and Vite
