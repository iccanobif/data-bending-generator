<template>
  <div class="intensity-slider-container">
    <div class="slider-header">
      <label for="intensity-slider" class="slider-label">
        Glitch Intensity
      </label>
      <span class="intensity-value">{{ intensity }}</span>
    </div>
    <input
      id="intensity-slider"
      type="range"
      min="1"
      max="10"
      :value="intensity"
      @input="handleChange"
      class="intensity-slider"
    />
    <div class="slider-labels">
      <span>Subtle</span>
      <span>Extreme</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  intensity: number;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:intensity', value: number): void;
}>();

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:intensity', parseInt(target.value, 10));
};
</script>

<style scoped>
.intensity-slider-container {
  margin-bottom: 20px;
}

.slider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.slider-label {
  font-weight: 600;
  color: #333;
  font-size: 1rem;
}

.intensity-value {
  background: #667eea;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  min-width: 30px;
  text-align: center;
}

.intensity-slider {
  width: 100%;
  height: 8px;
  border-radius: 5px;
  background: linear-gradient(to right, #10b981 0%, #f59e0b 50%, #ef4444 100%);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
}

.intensity-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  border: 3px solid #667eea;
  transition: transform 0.2s ease;
}

.intensity-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.intensity-slider::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  border: 3px solid #667eea;
  transition: transform 0.2s ease;
}

.intensity-slider::-moz-range-thumb:hover {
  transform: scale(1.1);
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 0.85rem;
  color: #666;
}
</style>
