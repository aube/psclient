<script setup lang="ts">
import { ref } from 'vue'
import { useRestApi } from '../../lib/restapi'

interface UploadStatus {
  type: 'success' | 'error' | ''
  message: string
}

const isDragOver = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFiles = ref<File[]>([])
const uploading = ref(false)
const uploadStatus = ref<UploadStatus | null>(null)

const { post } = useRestApi()

const handleDragOver = (e: DragEvent) => {
  isDragOver.value = true
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'copy'
  }
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const handleDrop = (e: DragEvent) => {
  isDragOver.value = false
  if (e.dataTransfer?.files) {
    addFiles(Array.from(e.dataTransfer.files))
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files) {
    addFiles(Array.from(target.files))
  }
}

const isValidFileType = (file: File): boolean => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx']

  // Check MIME type
  if (allowedTypes.includes(file.type)) {
    return true
  }

  // Check file extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase()
  return allowedExtensions.includes(extension)
}

const addFiles = (files: File[]) => {
  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB in bytes

  // Validate files
  const validFiles = files.filter(file => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      uploadStatus.value = {
        type: 'error',
        message: `Файл ${file.name} слишком большой. Максимальный размер 10МБ.`,
      }
      return false
    }

    // Check file type
    if (!isValidFileType(file)) {
      uploadStatus.value = {
        type: 'error',
        message: `Файл ${file.name} имеет недопустимый формат.`,
      }
      return false
    }

    return true
  })

  // Filter out duplicates and add new files
  const newFiles = validFiles.filter(newFile =>
    !selectedFiles.value.some(existingFile =>
      existingFile.name === newFile.name && existingFile.size === newFile.size
    )
  )

  if (newFiles.length > 0) {
    selectedFiles.value = [...selectedFiles.value, ...newFiles]
    // Clear any previous error messages if we successfully added files
    if (uploadStatus.value?.type === 'error') {
      uploadStatus.value = null
    }
  }

  // Clear success messages when adding new files
  if (uploadStatus.value?.type === 'success') {
    uploadStatus.value = null
  }
}

</script>

<template>
  <div class="upload-container">
    <div
      class="drop-zone"
      :class="{ 'dragover': isDragOver }"
      @click="triggerFileInput"
      @dragleave.prevent="handleDragLeave"
      @dragover.prevent="handleDragOver"
      @drop.prevent="handleDrop"
    >
      <div class="drop-zone-content">
        <i class="pi pi-cloud-upload upload-icon" />
        <p class="drop-text">
          Перетащите файлы сюда или нажмите для выбора
        </p>
        <p class="drop-hint">
          Поддерживаемые форматы: JPG, PNG, PDF, DOC, DOCX
        </p>
      </div>
      <input
        ref="fileInput"
        class="hidden-file-input"
        multiple
        type="file"
        @change="handleFileSelect"
      >
    </div>
  </div>
</template>

<style scoped>
.upload-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1rem;
}

.drop-zone {
  border: 2px dashed var(--p-surface-400);
  border-radius: 8px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: var(--p-primary-contrast-color);
}

.drop-zone:hover {
  border-color: var(--p-primary-hover-color);
  background-color: var(--p-highlight-background);
}

.drop-zone.dragover {
  border-color: var(--p-primary-color);
  background-color: var(--p-highlight-background);
}

.upload-icon {
  font-size: 3rem;
  color: var(--p-primary-color);
  margin-bottom: 1rem;
}

.drop-text {
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--p-text-color);
}

.drop-hint {
  color: var(--p-surface-400);
  font-size: 0.9rem;
}

.hidden-file-input {
  display: none;
}

</style>