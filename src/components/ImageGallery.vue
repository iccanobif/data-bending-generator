<template>
  <div class="gallery-container" @keydown="handleKeyDown" tabindex="0">
    <div class="gallery-header">
      <div>
        <h2>Glitch Variants</h2>
        <p class="gallery-info">
          {{ selectedCount }} of {{ displayedVariants.length }} selected
          <span v-if="!showAllVariants && variants.length > 5"> (showing top 5 by beauty score)</span>
        </p>
      </div>
      <div class="gallery-actions">
        <label class="show-original-toggle">
          <input
            type="checkbox"
            v-model="showOriginal"
          />
          <span>Show Original</span>
        </label>
        <button
          v-if="variants.length > 5"
          class="action-button"
          @click="toggleShowAll"
        >
          {{ showAllVariants ? '⭐ Show Top 5' : '🎨 Show All ' + variants.length }}
        </button>
        <button
          class="action-button"
          @click="selectAll"
          :disabled="displayedVariants.length === 0"
        >
          ☑️ Select All
        </button>
        <button
          class="action-button"
          @click="deselectAll"
          :disabled="selectedCount === 0"
        >
          ❌ Deselect All
        </button>
        <button
          class="download-button"
          :disabled="selectedCount === 0"
          @click="$emit('download-selected')"
        >
          📥 Download ({{ selectedCount }})
        </button>
      </div>
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
      <div v-if="originalImage && showOriginal" class="image-card original">
        <div class="image-wrapper">
          <img :src="originalImage" alt="Original image" />
        </div>
        <div class="image-label original-label">Original</div>
      </div>

      <!-- Glitched Variants -->
      <div
        v-for="(variant, index) in displayedVariants"
        :key="variant.id"
        class="image-card"
        :class="{ selected: variant.selected, focused: focusedIndex === index }"
        @click="toggleVariant(index)"
        :data-index="index"
      >
        <div class="image-wrapper">
          <img :src="variant.blobUrl" :alt="`Glitch variant ${variant.id}`" />
        </div>
        <div class="image-info">
          <div class="image-label">{{ variant.id }}</div>
          <div v-if="variant.beautyScore" class="beauty-score">
            <span class="score-label">Beauty:</span>
            <span class="score-value">{{ variant.beautyScore.overallScore }}</span>
            <div class="score-stars">{{ getStars(variant.beautyScore.overallScore) }}</div>
          </div>
        </div>
        <div class="selection-indicator">✓</div>
      </div>
    </div>

    <div v-if="variants.length > 0" class="keyboard-hint">
      <small>💡 Tip: Use arrow keys to navigate, Space to select, Enter to download</small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { GlitchedImage } from '../types';

interface Props {
  originalImage: string | null;
  variants: GlitchedImage[];
  isLoading: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'toggle-selection', id: string): void;
  (e: 'download-selected'): void;
}>();

const showOriginal = ref(true);
const showAllVariants = ref(true);
const focusedIndex = ref<number>(-1);

const selectedCount = computed(() => {
  return props.variants.filter(v => v.selected).length;
});

const displayedVariants = computed(() => {
  if (showAllVariants.value || props.variants.length <= 5) {
    return props.variants;
  }
  // Show only top 5 by beauty score
  return props.variants.slice(0, 5);
});

const toggleVariant = (index: number) => {
  focusedIndex.value = index;
  // Get the actual variant from the full list
  const variantId = displayedVariants.value[index].id;
  emit('toggle-selection', variantId);
};

const toggleShowAll = () => {
  showAllVariants.value = !showAllVariants.value;
};

const selectAll = () => {
  displayedVariants.value.forEach(variant => {
    if (!variant.selected) {
      emit('toggle-selection', variant.id);
    }
  });
};

const deselectAll = () => {
  displayedVariants.value.forEach(variant => {
    if (variant.selected) {
      emit('toggle-selection', variant.id);
    }
  });
};

const getStars = (score: number): string => {
  const starCount = Math.round(score / 20); // 0-5 stars
  return '⭐'.repeat(starCount);
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (displayedVariants.value.length === 0) return;

  // Initialize focus if not set
  if (focusedIndex.value === -1 && displayedVariants.value.length > 0) {
    focusedIndex.value = 0;
  }

  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      event.preventDefault();
      focusedIndex.value = Math.min(focusedIndex.value + 1, displayedVariants.value.length - 1);
      scrollToFocused();
      break;
    
    case 'ArrowLeft':
    case 'ArrowUp':
      event.preventDefault();
      focusedIndex.value = Math.max(focusedIndex.value - 1, 0);
      scrollToFocused();
      break;
    
    case ' ':
    case 'Spacebar':
      event.preventDefault();
      if (focusedIndex.value >= 0 && focusedIndex.value < displayedVariants.value.length) {
        emit('toggle-selection', displayedVariants.value[focusedIndex.value].id);
      }
      break;
    
    case 'Enter':
      event.preventDefault();
      if (selectedCount.value > 0) {
        emit('download-selected');
      }
      break;
    
    case 'a':
    case 'A':
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        selectAll();
      }
      break;
  }
};

const scrollToFocused = () => {
  if (focusedIndex.value >= 0) {
    const element = document.querySelector(`[data-index="${focusedIndex.value}"]`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
};

// Reset focused index when variants change
watch(() => props.variants.length, () => {
  focusedIndex.value = -1;
});
</script>

<style scoped>
.gallery-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.show-original-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  font-size: 0.95rem;
}

.show-original-toggle input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.action-button {
  background: #f3f4f6;
  color: #333;
  border: 1px solid #d1d5db;
  padding: 10px 18px;
  font-size: 0.95rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.action-button:hover:not(:disabled) {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.image-card.focused {
  outline: 3px solid #667eea;
  outline-offset: 2px;
}

.keyboard-hint {
  margin-top: 20px;
  text-align: center;
  color: #666;
  font-style: italic;
}

.image-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.beauty-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-size: 0.85rem;
  padding: 4px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 4px;
}

.score-label {
  color: #666;
  font-size: 0.75rem;
  font-weight: 500;
}

.score-value {
  font-weight: bold;
  color: #667eea;
  font-size: 1rem;
}

.score-stars {
  font-size: 0.85rem;
  line-height: 1;
}
</style>
