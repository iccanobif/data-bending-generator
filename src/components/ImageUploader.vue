<template>
  <div class="upload-container">
    <div class="upload-area" @click="triggerFileInput">
      <div class="upload-icon">📁</div>
      <p><strong>Click to select a JPEG image</strong></p>
      <p style="font-size: 0.9rem; color: #999;">Upload a .jpg or .jpeg file to start glitching</p>
      <button class="upload-button" type="button">Choose File</button>
      <input
        ref="fileInput"
        type="file"
        class="file-input"
        accept="image/jpeg,image/jpg"
        @change="handleFileChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  (e: 'image-uploaded', file: File): void
}>();

const fileInput = ref<HTMLInputElement | null>(null);

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;
  
  // Validate file type
  if (!file.type.match(/image\/(jpeg|jpg)/)) {
    alert('Please upload a JPEG image (.jpg or .jpeg)');
    return;
  }
  
  // Validate file size (max 10MB for POC)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    alert('File is too large. Please upload an image smaller than 10MB.');
    return;
  }
  
  emit('image-uploaded', file);
  
  // Reset input so the same file can be uploaded again
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};
</script>
