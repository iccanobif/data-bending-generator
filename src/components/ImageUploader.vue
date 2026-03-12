<template>
  <div class="upload-container">
    <div
      class="upload-area"
      :class="{ dragover: isDragging }"
      @click="triggerFileInput"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <div class="upload-icon">{{ isDragging ? '📂' : '📁' }}</div>
      <p><strong>{{ isDragging ? 'Drop your image here' : 'Drag & drop or click to select' }}</strong></p>
      <p style="font-size: 0.9rem; color: #999;">
        JPEG images only (.jpg or .jpeg) • Max 10MB
      </p>
      <button class="upload-button" type="button">Choose File</button>
      <input
        ref="fileInput"
        type="file"
        class="file-input"
        accept="image/jpeg,image/jpg"
        @change="handleFileChange"
      />
    </div>
    <div v-if="errorMessage" class="error-message">
      ⚠️ {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  (e: 'image-uploaded', file: File): void
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const errorMessage = ref<string | null>(null);

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleDragOver = () => {
  isDragging.value = true;
};

const handleDragLeave = () => {
  isDragging.value = false;
};

const handleDrop = (event: DragEvent) => {
  isDragging.value = false;
  errorMessage.value = null;
  
  const files = event.dataTransfer?.files;
  if (!files || files.length === 0) return;
  
  const file = files[0];
  validateAndEmitFile(file);
};

const handleFileChange = (event: Event) => {
  errorMessage.value = null;
  
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;
  
  validateAndEmitFile(file);
  
  // Reset input so the same file can be uploaded again
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const validateAndEmitFile = (file: File) => {
  // Validate file type
  if (!file.type.match(/image\/(jpeg|jpg)/)) {
    errorMessage.value = 'Invalid file type. Please upload a JPEG image (.jpg or .jpeg)';
    return;
  }
  
  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    errorMessage.value = `File is too large (${sizeMB}MB). Please upload an image smaller than 10MB.`;
    return;
  }
  
  emit('image-uploaded', file);
};
</script>

<style scoped>
.error-message {
  margin-top: 15px;
  padding: 12px 20px;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 6px;
  color: #c33;
  font-size: 0.95rem;
  text-align: center;
}
</style>
