<template>
  <div class="app">
    <header class="app-header">
      <h1>✨ Data Bending Glitch Art Generator</h1>
      <p>Transform your images with random byte manipulation</p>
    </header>

    <ImageUploader @image-uploaded="handleImageUpload" />

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
import { GlitchGenerator } from './lib/GlitchGenerator';
import type { GlitchedImage } from './types';

const originalImage = ref<string | null>(null);
const variants = ref<GlitchedImage[]>([]);
const isGenerating = ref(false);

const handleImageUpload = async (file: File) => {
  isGenerating.value = true;
  
  // Clear previous variants and revoke their URLs
  if (variants.value.length > 0) {
    GlitchGenerator.revokeVariants(variants.value);
    variants.value = [];
  }
  
  // Set original image
  originalImage.value = URL.createObjectURL(file);
  
  try {
    // Generate 10 glitched variants (with default intensity 5)
    const newVariants = await GlitchGenerator.generateVariants(file, 5, 10);
    variants.value = newVariants;
  } catch (error) {
    console.error('Error generating glitch variants:', error);
    alert('Failed to generate glitch variants. Please try a different image.');
  } finally {
    isGenerating.value = false;
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
  selected.forEach((variant, index) => {
    const link = document.createElement('a');
    link.href = variant.blobUrl;
    link.download = `glitch_${variant.id.replace('glitch-', '')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
};
</script>
