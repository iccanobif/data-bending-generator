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

    <div class="webcam-actions">
      <button
        type="button"
        class="upload-button webcam-button"
        @click="startCamera"
        :disabled="isCameraOpen || isCameraStarting"
      >
        {{ isCameraStarting ? 'Starting camera...' : 'Use Webcam' }}
      </button>
    </div>

    <div v-if="isCameraOpen" class="webcam-panel">
      <video ref="videoElement" class="webcam-preview" autoplay playsinline muted></video>
      <div class="webcam-controls">
        <button type="button" class="upload-button" @click="captureFromCamera">
          Capture Photo
        </button>
        <button type="button" class="action-close-button" @click="stopCamera">
          Close Camera
        </button>
      </div>
    </div>

    <div v-if="errorMessage" class="error-message">
      ⚠️ {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref } from 'vue';

const emit = defineEmits<{
  (e: 'image-uploaded', file: File): void
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const videoElement = ref<HTMLVideoElement | null>(null);
const isDragging = ref(false);
const errorMessage = ref<string | null>(null);
const isCameraOpen = ref(false);
const isCameraStarting = ref(false);
const mediaStream = ref<MediaStream | null>(null);

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

const startCamera = async () => {
  if (isCameraOpen.value || isCameraStarting.value) {
    return;
  }

  errorMessage.value = null;
  isCameraStarting.value = true;

  try {
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
    } catch {
      stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
    }

    mediaStream.value = stream;
    isCameraOpen.value = true;
    await nextTick(); // v-ifでDOMが更新されるのを待つ

    if (videoElement.value) {
      videoElement.value.srcObject = stream;
      await videoElement.value.play();
    }
  } catch {
    errorMessage.value = 'Unable to access webcam. Please allow camera permission and try again.';
    stopCamera();
  } finally {
    isCameraStarting.value = false;
  }
};

const stopCamera = () => {
  if (mediaStream.value) {
    mediaStream.value.getTracks().forEach((track) => {
      track.stop();
    });
  }

  mediaStream.value = null;

  if (videoElement.value) {
    videoElement.value.srcObject = null;
  }

  isCameraOpen.value = false;
  isCameraStarting.value = false;
};

const canvasToJpegBlob = (canvas: HTMLCanvasElement): Promise<Blob | null> => {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', 0.92);
  });
};

const captureFromCamera = async () => {
  if (!videoElement.value) {
    errorMessage.value = 'Camera preview is not available yet.';
    return;
  }

  const width = videoElement.value.videoWidth;
  const height = videoElement.value.videoHeight;

  if (!width || !height) {
    errorMessage.value = 'Camera is still initializing. Please try again in a moment.';
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    errorMessage.value = 'Failed to prepare captured image.';
    return;
  }

  context.drawImage(videoElement.value, 0, 0, width, height);

  const blob = await canvasToJpegBlob(canvas);
  if (!blob) {
    errorMessage.value = 'Failed to capture image from webcam.';
    return;
  }

  const capturedFile = new File(
    [blob],
    `webcam_${Date.now()}.jpg`,
    { type: 'image/jpeg', lastModified: Date.now() },
  );

  validateAndEmitFile(capturedFile);
  stopCamera();
};

onBeforeUnmount(() => {
  stopCamera();
});
</script>

<style scoped>
.webcam-actions {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.webcam-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.webcam-panel {
  margin-top: 20px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 16px;
  background: #f9fafb;
}

.webcam-preview {
  width: 100%;
  max-height: 420px;
  border-radius: 8px;
  background: #111827;
  object-fit: contain;
}

.webcam-controls {
  margin-top: 12px;
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.action-close-button {
  background: #f3f4f6;
  color: #333;
  border: 1px solid #d1d5db;
  padding: 12px 20px;
  font-size: 1rem;
  border-radius: 6px;
  cursor: pointer;
}

.action-close-button:hover {
  background: #e5e7eb;
}

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
