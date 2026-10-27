<script setup lang="ts">
import {
  Upload,
  X,
  Camera,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Trash2,
  Check,
  AlertCircle,
  Crop,
  Sparkles,
  RefreshCw,
  Eye,
} from 'lucide-vue-next'

const props = defineProps<{
  modelValue: boolean
  currentPhotoUrl?: string | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'saved': [url: string]
  'removed': []
}>()

const {
  uploadProfilePhoto,
  deleteProfilePhoto,
  isUploadingPhoto,
  photoError,
} = useEmployeePortal()

const fileInput = ref<HTMLInputElement | null>(null)
const selectedImageSrc = ref<string | null>(null)
const previewCanvas = ref<HTMLCanvasElement | null>(null)
const localError = ref('')
const isDragOver = ref(false)

// Image metadata & ratio detection
const originalWidth = ref(0)
const originalHeight = ref(0)
const isExactOneToOne = ref(false)
const aspectRatioLabel = ref('')

// Interactive crop adjustments
const zoom = ref(1)
const panX = ref(0)
const panY = ref(0)
const rotation = ref(0)
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const showCircleGuide = ref(true)

let loadedImage: HTMLImageElement | null = null

const resetState = () => {
  selectedImageSrc.value = null
  loadedImage = null
  originalWidth.value = 0
  originalHeight.value = 0
  isExactOneToOne.value = false
  aspectRatioLabel.value = ''
  zoom.value = 1
  panX.value = 0
  panY.value = 0
  rotation.value = 0
  localError.value = ''
  if (fileInput.value) fileInput.value.value = ''
}

const close = () => {
  resetState()
  emit('update:modelValue', false)
}

const triggerFileSelect = () => {
  fileInput.value?.click()
}

const processFile = (file: File) => {
  localError.value = ''

  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    localError.value = 'Please choose a valid image (JPG, PNG, or WebP).'
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    localError.value = 'Image size must be 5 MB or smaller.'
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    const dataUrl = String(reader.result)
    const img = new Image()
    img.onload = () => {
      loadedImage = img
      originalWidth.value = img.naturalWidth
      originalHeight.value = img.naturalHeight

      // Check 1:1 ratio
      const ratio = img.naturalWidth / img.naturalHeight
      isExactOneToOne.value = Math.abs(ratio - 1.0) < 0.015

      if (isExactOneToOne.value) {
        aspectRatioLabel.value = '1:1 Square'
      } else if (ratio > 1) {
        aspectRatioLabel.value = `Landscape (${img.naturalWidth}×${img.naturalHeight})`
      } else {
        aspectRatioLabel.value = `Portrait (${img.naturalWidth}×${img.naturalHeight})`
      }

      selectedImageSrc.value = dataUrl
      zoom.value = 1
      panX.value = 0
      panY.value = 0
      rotation.value = 0

      nextTick(drawCanvas)
    }
    img.onerror = () => {
      localError.value = 'Failed to load selected image.'
    }
    img.src = dataUrl
  }
  reader.onerror = () => {
    localError.value = 'Failed to read image file.'
  }
  reader.readAsDataURL(file)
}

const onFileSelected = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) processFile(file)
}

const onDrop = (event: DragEvent) => {
  isDragOver.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) processFile(file)
}

const onDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = true
}

const onDragLeave = () => {
  isDragOver.value = false
}

// Calculate allowed pan boundaries so the image ALWAYS completely fits and covers the 1:1 box
// and CANNOT be dragged over any corner or edge!
const getBounds = () => {
  if (!loadedImage || !previewCanvas.value) return { maxPanX: 0, maxPanY: 0 }
  const size = previewCanvas.value.width // 320
  const imgAspect = loadedImage.width / loadedImage.height

  let baseW = size
  let baseH = size
  if (imgAspect > 1) {
    baseW = size * imgAspect
  } else {
    baseH = size / imgAspect
  }

  const isSwapped = rotation.value === 90 || rotation.value === 270
  const screenW = (isSwapped ? baseH : baseW) * zoom.value
  const screenH = (isSwapped ? baseW : baseH) * zoom.value

  const maxPanX = Math.max(0, (screenW - size) / 2)
  const maxPanY = Math.max(0, (screenH - size) / 2)

  return { maxPanX, maxPanY }
}

const clampPan = () => {
  const { maxPanX, maxPanY } = getBounds()
  panX.value = Math.min(maxPanX, Math.max(-maxPanX, panX.value))
  panY.value = Math.min(maxPanY, Math.max(-maxPanY, panY.value))
}

// Rotate Clockwise & Counter-Clockwise
const rotateCw = () => {
  rotation.value = (rotation.value + 90) % 360
  clampPan()
  drawCanvas()
}

const rotateCcw = () => {
  rotation.value = (rotation.value - 90 + 360) % 360
  clampPan()
  drawCanvas()
}

const resetCrop = () => {
  zoom.value = 1
  panX.value = 0
  panY.value = 0
  rotation.value = 0
  drawCanvas()
}

// 1:1 Canvas Rendering with Viewport Crop Box
const drawCanvas = () => {
  if (!previewCanvas.value || !loadedImage) return
  const canvas = previewCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  clampPan()

  const size = canvas.width // Square 320x320
  ctx.clearRect(0, 0, size, size)

  ctx.save()
  // Move to center, apply user pan, rotation, and zoom
  ctx.translate(size / 2 + panX.value, size / 2 + panY.value)
  ctx.rotate((rotation.value * Math.PI) / 180)
  ctx.scale(zoom.value, zoom.value)

  // Calculate draw dimensions to cover 1:1 square
  const imgAspect = loadedImage.width / loadedImage.height
  let drawW = size
  let drawH = size

  if (imgAspect > 1) {
    drawW = size * imgAspect
  } else {
    drawH = size / imgAspect
  }

  ctx.drawImage(loadedImage, -drawW / 2, -drawH / 2, drawW, drawH)
  ctx.restore()
}

watch([zoom], () => {
  clampPan()
  drawCanvas()
})

// Mouse & Touch Dragging for Pan with strict boundary clamping
const onPointerDown = (e: MouseEvent | TouchEvent) => {
  if (!selectedImageSrc.value) return
  isDragging.value = true
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
  dragStart.value = { x: clientX - panX.value, y: clientY - panY.value }
}

const onPointerMove = (e: MouseEvent | TouchEvent) => {
  if (!isDragging.value) return
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
  panX.value = clientX - dragStart.value.x
  panY.value = clientY - dragStart.value.y
  clampPan()
  drawCanvas()
}

const onPointerUp = () => {
  isDragging.value = false
}

// Mouse Wheel Zoom
const onWheel = (e: WheelEvent) => {
  if (!selectedImageSrc.value) return
  e.preventDefault()
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  zoom.value = Math.min(3, Math.max(1, Number((zoom.value + delta).toFixed(2))))
  clampPan()
  drawCanvas()
}

// Generate exact 500x500 1:1 Square Output
const getCroppedDataUrl = (): string => {
  if (!loadedImage) return ''

  clampPan()

  const exportCanvas = document.createElement('canvas')
  exportCanvas.width = 500
  exportCanvas.height = 500
  const ctx = exportCanvas.getContext('2d')
  if (!ctx) return ''

  const exportSize = 500
  const previewSize = previewCanvas.value ? previewCanvas.value.width : 320
  const scaleRatio = exportSize / previewSize

  ctx.save()
  ctx.translate(exportSize / 2 + panX.value * scaleRatio, exportSize / 2 + panY.value * scaleRatio)
  ctx.rotate((rotation.value * Math.PI) / 180)
  ctx.scale(zoom.value * scaleRatio, zoom.value * scaleRatio)

  const imgAspect = loadedImage.width / loadedImage.height
  let drawW = previewSize
  let drawH = previewSize

  if (imgAspect > 1) {
    drawW = previewSize * imgAspect
  } else {
    drawH = previewSize / imgAspect
  }

  ctx.drawImage(loadedImage, -drawW / 2, -drawH / 2, drawW, drawH)
  ctx.restore()

  return exportCanvas.toDataURL('image/jpeg', 0.92)
}

const handleSave = async () => {
  localError.value = ''
  const croppedDataUrl = getCroppedDataUrl()
  if (!croppedDataUrl) {
    localError.value = 'Please select and position an image before saving.'
    return
  }

  const result = await uploadProfilePhoto(croppedDataUrl)
  if (result.success) {
    emit('saved', croppedDataUrl)
    close()
  } else {
    localError.value = result.message || 'Failed to update profile photo.'
  }
}

const handleRemoveCurrent = async () => {
  if (!confirm('Are you sure you want to remove your profile photo and reset to initials?')) return
  localError.value = ''
  const result = await deleteProfilePhoto()
  if (result.success) {
    emit('removed')
    close()
  } else {
    localError.value = result.message || 'Failed to remove photo.'
  }
}

// Watch modelValue to reset state when opened
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    resetState()
  }
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="photo-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="photo-modal-title"
      @click.self="close"
    >
      <div class="photo-modal-card">
        <!-- Header -->
        <header class="modal-header">
          <div class="modal-title-group">
            <div class="modal-icon">
              <Camera :size="20" />
            </div>
            <div>
              <h2 id="photo-modal-title">Employee Profile Photo</h2>
              <p class="modal-subtitle">
                Upload or crop your photo into a strict 1:1 square ratio
              </p>
            </div>
          </div>
          <button
            type="button"
            class="modal-close-btn"
            aria-label="Close dialog"
            @click="close"
          >
            <X :size="19" />
          </button>
        </header>

        <!-- Hidden File Input -->
        <input
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          class="hidden-input"
          @change="onFileSelected"
        >

        <!-- Error Alert -->
        <div v-if="localError || photoError" class="modal-error-alert" role="alert">
          <AlertCircle :size="16" />
          <span>{{ localError || photoError }}</span>
        </div>

        <!-- Body: Step 1 - Choose Photo / Dropzone (if none selected) -->
        <div v-if="!selectedImageSrc" class="modal-body-initial">
          <div
            class="upload-dropzone"
            :class="{ active: isDragOver }"
            @click="triggerFileSelect"
            @dragover="onDragOver"
            @dragleave="onDragLeave"
            @drop.prevent="onDrop"
          >
            <div class="dropzone-icon">
              <Upload :size="32" />
            </div>
            <h3 class="dropzone-title">Select a photo from your device</h3>
            <p class="dropzone-hint">
              Drag & drop here, or <span class="browse-link">browse files</span>
            </p>
            <div class="dropzone-badges">
              <span class="badge">JPG, PNG, WebP</span>
              <span class="badge">Max 5 MB</span>
              <span class="badge highlight">1:1 Ratio Required</span>
            </div>
          </div>

          <div class="ratio-info-card">
            <Crop :size="18" class="info-icon" />
            <div>
              <strong>1:1 Aspect Ratio Cropper Included</strong>
              <p>
                If your chosen photo is not square (e.g. landscape or portrait), our built-in interactive cropper will let you frame, zoom, and crop it to 1:1 before saving.
              </p>
            </div>
          </div>

          <!-- Existing Photo Management -->
          <div v-if="currentPhotoUrl" class="current-photo-section">
            <div class="current-photo-preview">
              <img :src="currentPhotoUrl" alt="Current profile photo" class="current-img">
              <div class="current-info">
                <strong>Current Photo</strong>
                <small>1:1 Square on file</small>
              </div>
            </div>
            <button
              type="button"
              class="btn-danger-soft"
              :disabled="isUploadingPhoto"
              @click="handleRemoveCurrent"
            >
              <Trash2 :size="14" />
              <span>Remove Photo</span>
            </button>
          </div>
        </div>

        <!-- Body: Step 2 - Interactive 1:1 Cropper Workspace -->
        <div v-else class="modal-body-cropper">
          <!-- Ratio Status Badge -->
          <div
            class="ratio-status-banner"
            :class="isExactOneToOne ? 'is-square' : 'is-cropped'"
          >
            <div class="ratio-status-left">
              <Check v-if="isExactOneToOne" :size="16" />
              <Crop v-else :size="16" />
              <span>
                <strong>{{ isExactOneToOne ? '1:1 Square Detected' : 'Cropper Active (1:1 Ratio)' }}:</strong>
                {{ isExactOneToOne
                  ? `Image is already square (${originalWidth}×${originalHeight}px). Frame or save directly.`
                  : `Original is ${aspectRatioLabel}. Drag and zoom inside the 1:1 box to crop.`
                }}
              </span>
            </div>
            <button
              type="button"
              class="guide-toggle-btn"
              :title="showCircleGuide ? 'Hide circular avatar guide' : 'Show circular avatar guide'"
              @click="showCircleGuide = !showCircleGuide"
            >
              <Eye :size="13" />
              <span>{{ showCircleGuide ? 'Circle Guide On' : 'Square View' }}</span>
            </button>
          </div>

          <!-- Canvas Crop Area -->
          <div class="cropper-stage">
            <div
              class="cropper-viewport-1to1"
              :class="{ 'circle-guide-active': showCircleGuide }"
              @mousedown="onPointerDown"
              @mousemove="onPointerMove"
              @mouseup="onPointerUp"
              @mouseleave="onPointerUp"
              @touchstart.passive="onPointerDown"
              @touchmove.prevent="onPointerMove"
              @touchend="onPointerUp"
              @wheel="onWheel"
            >
              <canvas
                ref="previewCanvas"
                width="320"
                height="320"
                class="crop-canvas"
              />

              <!-- 1:1 Crop Boundary Brackets & Rule of Thirds -->
              <div class="crop-overlay-guides" aria-hidden="true">
                <span class="corner tl" />
                <span class="corner tr" />
                <span class="corner bl" />
                <span class="corner br" />
                <div class="grid-line grid-v1" />
                <div class="grid-line grid-v2" />
                <div class="grid-line grid-h1" />
                <div class="grid-line grid-h2" />
                <div v-if="showCircleGuide" class="circle-stencil" />
              </div>

              <!-- Drag Hint -->
              <div class="drag-hint" :class="{ hidden: isDragging }">
                Drag to reposition · Scroll to zoom
              </div>
            </div>
          </div>

          <!-- Cropper Toolbar Controls -->
          <div class="cropper-toolbar">
            <!-- Zoom Controls -->
            <div class="toolbar-group zoom-group">
              <button
                type="button"
                class="tool-btn"
                title="Zoom Out"
                :disabled="zoom <= 1"
                @click="zoom = Math.max(1, Number((zoom - 0.15).toFixed(2)))"
              >
                <ZoomOut :size="16" />
              </button>
              <input
                v-model.number="zoom"
                type="range"
                min="1"
                max="3"
                step="0.05"
                class="zoom-slider"
                aria-label="Zoom level"
              >
              <button
                type="button"
                class="tool-btn"
                title="Zoom In"
                :disabled="zoom >= 3"
                @click="zoom = Math.min(3, Number((zoom + 0.15).toFixed(2)))"
              >
                <ZoomIn :size="16" />
              </button>
              <span class="zoom-value">{{ Math.round(zoom * 100) }}%</span>
            </div>

            <!-- Rotate & Reset Controls -->
            <div class="toolbar-group">
              <button
                type="button"
                class="tool-btn"
                title="Rotate 90° Counter-Clockwise"
                @click="rotateCcw"
              >
                <RotateCcw :size="16" />
              </button>
              <button
                type="button"
                class="tool-btn"
                title="Rotate 90° Clockwise"
                @click="rotateCw"
              >
                <RotateCw :size="16" />
              </button>
              <button
                type="button"
                class="tool-btn"
                title="Reset Position & Zoom"
                @click="resetCrop"
              >
                <RefreshCw :size="15" />
              </button>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <footer class="modal-footer">
          <div class="footer-left">
            <button
              v-if="selectedImageSrc"
              type="button"
              class="btn-text"
              :disabled="isUploadingPhoto"
              @click="triggerFileSelect"
            >
              Choose different file
            </button>
          </div>
          <div class="footer-right">
            <button
              type="button"
              class="btn-secondary"
              :disabled="isUploadingPhoto"
              @click="close"
            >
              Cancel
            </button>
            <button
              v-if="selectedImageSrc"
              type="button"
              class="btn-primary"
              :disabled="isUploadingPhoto"
              @click="handleSave"
            >
              <RefreshCw v-if="isUploadingPhoto" :size="16" class="spinning" />
              <Check v-else :size="16" />
              <span>{{ isUploadingPhoto ? 'Saving 1:1 Photo…' : 'Crop & Save (1:1 Ratio)' }}</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.photo-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(10, 20, 38, 0.65);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: fadeIn 0.2s ease-out;
}

.photo-modal-card {
  width: 100%;
  max-width: 540px;
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 18px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleUp {
  from { opacity: 0; transform: scale(0.95) translateY(12px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

/* Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
  border-bottom: 1px solid var(--border, #e2e8f0);
}

.modal-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #1059b8, #0b3d82);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(16, 89, 184, 0.25);
}

.modal-header h2 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary, #0f172a);
}

.modal-subtitle {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--text-secondary, #64748b);
}

.modal-close-btn {
  background: transparent;
  border: none;
  color: var(--text-muted, #94a3b8);
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.modal-close-btn:hover {
  background: var(--bg-card-soft, #f1f5f9);
  color: var(--text-primary, #0f172a);
}

.hidden-input {
  display: none;
}

.modal-error-alert {
  margin: 14px 22px 0;
  padding: 10px 14px;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: #dc2626;
  font-size: 12.5px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Step 1: Initial Dropzone Body */
.modal-body-initial {
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.upload-dropzone {
  border: 2px dashed var(--border, #cbd5e1);
  border-radius: 14px;
  padding: 36px 20px;
  text-align: center;
  cursor: pointer;
  background: var(--bg-card-soft, #f8fafc);
  transition: all 0.2s ease;
}

.upload-dropzone:hover,
.upload-dropzone.active {
  border-color: var(--primary, #1059b8);
  background: rgba(16, 89, 184, 0.04);
  transform: translateY(-1px);
}

.dropzone-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(16, 89, 184, 0.1);
  color: var(--primary, #1059b8);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.dropzone-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #0f172a);
}

.dropzone-hint {
  margin: 6px 0 16px;
  font-size: 13px;
  color: var(--text-secondary, #64748b);
}

.browse-link {
  color: var(--primary, #1059b8);
  font-weight: 600;
  text-decoration: underline;
}

.dropzone-badges {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.badge {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 999px;
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border, #e2e8f0);
  color: var(--text-secondary, #64748b);
}

.badge.highlight {
  background: rgba(16, 89, 184, 0.1);
  border-color: rgba(16, 89, 184, 0.3);
  color: var(--primary, #1059b8);
}

.ratio-info-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  background: var(--bg-card-soft, #f8fafc);
  border: 1px solid var(--border, #e2e8f0);
}

.info-icon {
  color: var(--primary, #1059b8);
  flex-shrink: 0;
  margin-top: 2px;
}

.ratio-info-card strong {
  display: block;
  font-size: 12.5px;
  color: var(--text-primary, #0f172a);
}

.ratio-info-card p {
  margin: 3px 0 0;
  font-size: 11.5px;
  color: var(--text-secondary, #64748b);
  line-height: 1.45;
}

.current-photo-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 12px;
  background: var(--bg-card-soft, #f8fafc);
  border: 1px solid var(--border, #e2e8f0);
}

.current-photo-preview {
  display: flex;
  align-items: center;
  gap: 12px;
}

.current-img {
  width: 44px;
  height: 44px;
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--primary, #1059b8);
}

.current-info strong {
  display: block;
  font-size: 13px;
  color: var(--text-primary, #0f172a);
}

.current-info small {
  font-size: 11px;
  color: var(--text-muted, #94a3b8);
}

.btn-danger-soft {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid rgba(239, 68, 68, 0.25);
  background: rgba(239, 68, 68, 0.08);
  color: #dc2626;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-danger-soft:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.16);
}

/* Step 2: Interactive Cropper Body */
.modal-body-cropper {
  padding: 18px 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.ratio-status-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 9px;
  font-size: 12px;
}

.ratio-status-banner.is-square {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #065f46;
}

.ratio-status-banner.is-cropped {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: #92400e;
}

.ratio-status-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.ratio-status-left span {
  white-space: normal;
  line-height: 1.35;
}

.guide-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid currentColor;
  background: transparent;
  color: inherit;
  font-size: 10.5px;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s ease;
}

.guide-toggle-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

/* Cropper Stage */
.cropper-stage {
  display: flex;
  gap: 18px;
  justify-content: center;
  align-items: center;
  background: #0f172a;
  border-radius: 14px;
  padding: 18px;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.4);
}

.cropper-viewport-1to1 {
  position: relative;
  width: 300px;
  height: 300px;
  aspect-ratio: 1 / 1;
  background: #090d16;
  border-radius: 10px;
  overflow: hidden;
  cursor: grab;
  user-select: none;
  touch-action: none;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}

.cropper-viewport-1to1:active {
  cursor: grabbing;
}

.crop-canvas {
  width: 100%;
  height: 100%;
  aspect-ratio: 1 / 1;
  display: block;
}

/* Crop Overlay Brackets & Guides */
.crop-overlay-guides {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.corner {
  position: absolute;
  width: 18px;
  height: 18px;
  border-color: #ffffff;
  border-style: solid;
}
.corner.tl { top: 0; left: 0; border-width: 3px 0 0 3px; }
.corner.tr { top: 0; right: 0; border-width: 3px 3px 0 0; }
.corner.bl { bottom: 0; left: 0; border-width: 0 0 3px 3px; }
.corner.br { bottom: 0; right: 0; border-width: 0 3px 3px 0; }

.grid-line {
  position: absolute;
  background: rgba(255, 255, 255, 0.18);
}
.grid-v1 { top: 0; bottom: 0; left: 33.333%; width: 1px; }
.grid-v2 { top: 0; bottom: 0; left: 66.666%; width: 1px; }
.grid-h1 { left: 0; right: 0; top: 33.333%; height: 1px; }
.grid-h2 { left: 0; right: 0; top: 66.666%; height: 1px; }

.circle-stencil {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.38);
  border: 1.5px dashed rgba(255, 255, 255, 0.7);
}

.drag-hint {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  color: #e2e8f0;
  font-size: 10px;
  padding: 3px 9px;
  border-radius: 999px;
  pointer-events: none;
  white-space: nowrap;
  transition: opacity 0.2s ease;
}

.drag-hint.hidden {
  opacity: 0;
}

/* Cropper Toolbar */
.cropper-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 10px;
  background: var(--bg-card-soft, #f8fafc);
  border: 1px solid var(--border, #e2e8f0);
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.zoom-group {
  flex: 1;
  max-width: 320px;
}

.zoom-slider {
  flex: 1;
  accent-color: var(--primary, #1059b8);
  cursor: pointer;
}

.zoom-value {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary, #64748b);
  min-width: 36px;
  text-align: right;
}

.tool-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--border, #e2e8f0);
  background: var(--bg-card, #ffffff);
  color: var(--text-primary, #0f172a);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.tool-btn:hover:not(:disabled) {
  background: var(--bg-card-soft, #f1f5f9);
  border-color: var(--primary, #1059b8);
  color: var(--primary, #1059b8);
}

.tool-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Footer */
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 22px;
  border-top: 1px solid var(--border, #e2e8f0);
  background: var(--bg-card-soft, #f8fafc);
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-text {
  background: transparent;
  border: none;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--primary, #1059b8);
  cursor: pointer;
  padding: 6px 4px;
}
.btn-text:hover {
  text-decoration: underline;
}

.btn-secondary {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid var(--border, #cbd5e1);
  background: var(--bg-card, #ffffff);
  color: var(--text-primary, #0f172a);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-secondary:hover:not(:disabled) {
  background: var(--bg-card-soft, #f1f5f9);
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #1059b8, #0b3d82);
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(16, 89, 184, 0.3);
  transition: all 0.15s ease;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(16, 89, 184, 0.4);
}

.btn-primary:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

@media (max-width: 560px) {
  .cropper-viewport-1to1 {
    width: 280px;
    height: 280px;
  }
}
</style>
