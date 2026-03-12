<template>
  <div class="gallery-container">
    <div class="gallery-header">
      <div>
        <h2>Glitch Variants</h2>
        <p class="gallery-info">
          {{ selectedCount }} of {{ variants.length }} selected
        </p>
      </div>
      <button
        class="download-button"
        :disabled="selectedCount === 0"
        @click="$emit('download-selected')"
      >
        📥 Download Selected ({{ selectedCount }})
      </button>
    </div>

    <div v-if="isLoading" class="loading">
      <div class="loading-spinner"></div>
      <p>Generating glitch variants...</p>
    </div>

    <div v-else-if="variants.length === 0" class="empty-state">
      <p>No variants generated yet</p>
    </div>

    <div v-else class="gallery-grid">
      <!-- Original Image -->
      <div v-if="originalImage" class="image-card original">
        <div class="image-wrapper">
          <img :src="originalImage" alt="Original image" />
        </div>
        <div class="image-label original-label">Original</div>
      </div>

      <!-- Glitched Variants -->
      <div
        v-for="variant in variants"
        :key="variant.id"
        class="image-card"
        :class="{ selected: variant.selected }"
        @click="$emit('toggle-selection', variant.id)"
      >
        <div class="image-wrapper">
          <img :src="variant.blobUrl" :alt="`Glitch variant ${variant.id}`" />
        </div>
        <div class="image-label">{{ variant.id }}</div>
        <div class="selection-indicator">✓</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { GlitchedImage } from '../types';

interface Props {
  originalImage: string | null;
  variants: GlitchedImage[];
  isLoading: boolean;
}

const props = defineProps<Props>();

defineEmits<{
  (e: 'toggle-selection', id: string): void;
  (e: 'download-selected'): void;
}>();

const selectedCount = computed(() => {
  return props.variants.filter(v => v.selected).length;
});
</script>
