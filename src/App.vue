<template>
  <div class="app">
    <header class="app-header">
      <h1>✨ Data Bending Glitch Art Generator</h1>
      <p>Transform your images with random byte manipulation</p>
    </header>

    <ImageUploader @image-uploaded="handleImageUpload" />

    <!-- Intensity Control (shown after uploading an image) -->
    <div v-if="uploadedFile" class="controls-container">
      <IntensitySlider
        :intensity="intensity"
        @update:intensity="handleIntensityChange"
      />
      <button
        type="button"
        class="regenerate-button"
        @click="regenerateVariants"
        :disabled="isGenerating"
      >
        🔄 Regenerate Variants
      </button>
    </div>

    <ImageGallery
      v-if="variants.length > 0 || isGenerating"
      :original-image="originalImage"
      :variants="variants"
      :is-loading="isGenerating"
      @toggle-selection="toggleSelection"
      @download-selected="downloadSelected"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ImageUploader from './components/ImageUploader.vue';
import ImageGallery from './components/ImageGallery.vue';
import IntensitySlider from './components/IntensitySlider.vue';
import { DEFAULT_INTENSITY } from './constants/glitch';
import { GlitchGenerator } from './lib/GlitchGenerator';
import type { GlitchedImage } from './types';

const originalImage = ref<string | null>(null);
const uploadedFile = ref<File | null>(null);
const variants = ref<GlitchedImage[]>([]);
const isGenerating = ref(false);
const intensity = ref(DEFAULT_INTENSITY); // Default intensity

const handleImageUpload = async (file: File) => {
  uploadedFile.value = file;
  intensity.value = DEFAULT_INTENSITY; // Reset intensity to default
  await generateVariants(file, intensity.value);
};

const generateVariants = async (file: File, targetIntensity: number) => {
  isGenerating.value = true;
  
  // Clear previous variants and revoke their URLs
  if (variants.value.length > 0) {
    GlitchGenerator.revokeVariants(variants.value);
    variants.value = [];
  }
  
  // Update original image (revoke old URL first to prevent memory leaks)
  if (originalImage.value) {
    URL.revokeObjectURL(originalImage.value);
  }
  originalImage.value = URL.createObjectURL(file);
  
  try {
    // Generate 10 glitched variants with specified intensity
    const newVariants = await GlitchGenerator.generateVariants(file, targetIntensity, 100);
    variants.value = newVariants;
  } catch (error) {
    console.error('Error generating glitch variants:', error);
    alert('Failed to generate glitch variants. Please try a different image.');
  } finally {
    isGenerating.value = false;
  }
};

const handleIntensityChange = (newIntensity: number) => {
  intensity.value = newIntensity;
};

const regenerateVariants = async () => {
  if (uploadedFile.value) {
    await generateVariants(uploadedFile.value, intensity.value);
  }
};

const toggleSelection = (id: string) => {
  const variant = variants.value.find(v => v.id === id);
  if (variant) {
    variant.selected = !variant.selected;
  }
};

const downloadSelected = () => {
  const selected = variants.value.filter(v => v.selected);
  
  if (selected.length === 0) {
    alert('Please select at least one image to download');
    return;
  }
  
  // Download each selected image
  selected.forEach((variant) => {
    const link = document.createElement('a');
    link.href = variant.blobUrl;
    link.download = `glitch_${variant.id.replace('glitch-', '')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
};
</script>
