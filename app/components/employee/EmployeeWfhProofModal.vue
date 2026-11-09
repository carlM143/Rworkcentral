<script setup lang="ts">
import {
  Camera,
  Upload,
  X,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  SwitchCamera,
} from 'lucide-vue-next'

interface CapturedImageItem {
  id: string
  file: File
  previewUrl: string
  isLive: boolean
}

const props = defineProps<{
  modelValue: boolean
  title?: string
  subtitle?: string
  submitLabel?: string
  saving?: boolean
  errorMessage?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'submit': [payload: { images: File[]; document: File | null }]
}>()

const MAX_BYTES = 4 * 1024 * 1024
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const videoRef = ref<HTMLVideoElement | null>(null)
const captureCanvasRef = ref<HTMLCanvasElement | null>(null)
const nativeCameraInput = ref<HTMLInputElement | null>(null)
const fileUploadInput = ref<HTMLInputElement | null>(null)
const docUploadInput = ref<HTMLInputElement | null>(null)

const cameraActive = ref(false)
const cameraStarting = ref(false)
const cameraFacing = ref<'environment' | 'user'>('environment')
const cameraError = ref('')
const localError = ref('')

const capturedItems = ref<CapturedImageItem[]>([])
const supportingDocument = ref<File | null>(null)

let mediaStream: MediaStream | null = null

const stopCamera = () => {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop())
    mediaStream = null
  }
  if (videoRef.value) {
    videoRef.value.srcObject = null
  }
  cameraActive.value = false
  cameraStarting.value = false
}

const startCamera = async () => {
  localError.value = ''
  cameraError.value = ''

  if (!import.meta.client || !navigator.mediaDevices?.getUserMedia) {
    // Fallback to native device camera input
    nativeCameraInput.value?.click()
    return
  }

  stopCamera()
  cameraStarting.value = true

  try {
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: cameraFacing.value },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })
    } catch {
      // Fallback to any available video device
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      })
    }

    cameraActive.value = true
    await nextTick()
    if (videoRef.value && mediaStream) {
      videoRef.value.srcObject = mediaStream
      await videoRef.value.play().catch(() => {})
    }
  } catch (err: any) {
    cameraError.value = 'Unable to access live webcam directly. Opening device camera capture instead.'
    nativeCameraInput.value?.click()
  } finally {
    cameraStarting.value = false
  }
}

const switchCameraFacing = async () => {
  cameraFacing.value = cameraFacing.value === 'environment' ? 'user' : 'environment'
  if (cameraActive.value) {
    await startCamera()
  }
}

const captureLiveFrame = () => {
  if (!videoRef.value || !captureCanvasRef.value) return
  if (capturedItems.value.length >= 10) {
    localError.value = 'You can attach up to 10 proof-of-work images.'
    return
  }

  const video = videoRef.value
  const canvas = captureCanvasRef.value
  const width = video.videoWidth || 1280
  const height = video.videoHeight || 720

  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.drawImage(video, 0, 0, width, height)

  // Stamp current date & time on bottom-right corner for live proof verification
  const timestamp = new Date().toLocaleString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const fontSize = Math.max(14, Math.round(width * 0.018))
  ctx.font = `600 ${fontSize}px sans-serif`
  const textLabel = `LIVE WFH PROOF · ${timestamp}`
  const textWidth = ctx.measureText(textLabel).width
  const padX = 12
  const padY = 8
  const boxW = textWidth + padX * 2
  const boxH = fontSize + padY * 2

  ctx.fillStyle = 'rgba(15, 23, 42, 0.72)'
  ctx.fillRect(width - boxW - 14, height - boxH - 14, boxW, boxH)
  ctx.fillStyle = '#f8fafc'
  ctx.fillText(textLabel, width - boxW - 14 + padX, height - 14 - padY - 2)

  canvas.toBlob(
    (blob) => {
      if (!blob) return
      const index = capturedItems.value.length + 1
      const fileName = `wfh-live-proof-${Date.now()}-${index}.jpg`
      const file = new File([blob], fileName, { type: 'image/jpeg' })
      const previewUrl = URL.createObjectURL(blob)
      capturedItems.value.push({
        id: `${Date.now()}-${Math.random()}`,
        file,
        previewUrl,
        isLive: true,
      })
      localError.value = ''
    },
    'image/jpeg',
    0.9
  )
}

const addFiles = (files: File[], isLive = false) => {
  localError.value = ''
  for (const file of files) {
    if (capturedItems.value.length >= 10) {
      localError.value = 'Maximum of 10 proof-of-work images allowed.'
      break
    }
    if (!IMAGE_TYPES.includes(file.type) || file.size > MAX_BYTES) {
      localError.value = `${file.name}: please use JPG, PNG, or WEBP up to 4 MB.`
      continue
    }
    capturedItems.value.push({
      id: `${Date.now()}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
      isLive,
    })
  }
}

const onNativeCameraSelected = (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  if (files.length) addFiles(files, true)
  input.value = ''
}

const onFilesSelected = (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  if (files.length) addFiles(files, false)
  input.value = ''
}

const onDocSelected = (event: Event) => {
  const input = event.target as HTMLInputElement
  const picked = input.files?.[0] ?? null
  if (picked && (![...IMAGE_TYPES, 'application/pdf'].includes(picked.type) || picked.size > MAX_BYTES)) {
    localError.value = `${picked.name}: use PDF, JPG, PNG, or WEBP up to 4 MB.`
    input.value = ''
    return
  }
  localError.value = ''
  supportingDocument.value = picked
}

const removeCapturedItem = (id: string) => {
  const idx = capturedItems.value.findIndex(item => item.id === id)
  if (idx !== -1) {
    URL.revokeObjectURL(capturedItems.value[idx].previewUrl)
    capturedItems.value.splice(idx, 1)
  }
}

const clearAll = () => {
  stopCamera()
  for (const item of capturedItems.value) {
    URL.revokeObjectURL(item.previewUrl)
  }
  capturedItems.value = []
  supportingDocument.value = null
  localError.value = ''
  cameraError.value = ''
}

const closeModal = () => {
  if (props.saving) return
  clearAll()
  emit('update:modelValue', false)
}

const handleSubmit = () => {
  if (!capturedItems.value.length) {
    localError.value = 'Please take a live photo or attach at least one Proof of Work image before submitting.'
    return
  }
  stopCamera()
  emit('submit', {
    images: capturedItems.value.map(i => i.file),
    document: supportingDocument.value,
  })
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      clearAll()
      // Automatically open live camera so employee can picture live right away
      nextTick(() => {
        void startCamera()
      })
    } else {
      clearAll()
    }
  }
)

onBeforeUnmount(() => {
  clearAll()
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="wfh-proof-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wfh-proof-modal-title"
      @click.self="closeModal"
    >
      <div class="wfh-proof-modal">
        <!-- Header -->
        <header class="wfh-proof-header">
          <div class="wfh-proof-title-wrap">
            <span class="wfh-proof-icon">
              <Camera :size="20" />
            </span>
            <div>
              <h2 id="wfh-proof-modal-title">{{ title || 'Time Out & Attach Proof of Work' }}</h2>
              <p>{{ subtitle || 'Take a live photo of your work output or attach proof-of-work images to complete your WFH Time Out.' }}</p>
            </div>
          </div>
          <button type="button" class="wfh-proof-close" :disabled="saving" aria-label="Close" @click="closeModal">
            <X :size="18" />
          </button>
        </header>

        <!-- Hidden Inputs -->
        <input
          ref="nativeCameraInput"
          type="file"
          accept="image/*"
          capture="environment"
          class="sr-only-input"
          @change="onNativeCameraSelected"
        />
        <input
          ref="fileUploadInput"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          class="sr-only-input"
          @change="onFilesSelected"
        />
        <canvas ref="captureCanvasRef" class="sr-only-input" />

        <div class="wfh-proof-body">
          <!-- Error Banner -->
          <div v-if="localError || errorMessage || cameraError" class="wfh-proof-alert" role="alert">
            <AlertCircle :size="16" />
            <span>{{ localError || errorMessage || cameraError }}</span>
          </div>

          <div class="wfh-proof-web-grid">
            <!-- Left Column: Live Camera Viewfinder Section -->
            <div class="camera-section">
              <div class="camera-section-bar">
                <div class="camera-bar-title">
                  <Camera :size="15" />
                  <strong>Live Camera Capture</strong>
                  <span v-if="cameraActive" class="live-indicator">
                    <span class="live-dot" /> LIVE
                  </span>
                </div>
                <div class="camera-bar-actions">
                  <button
                    v-if="cameraActive"
                    type="button"
                    class="cam-btn-secondary"
                    @click="switchCameraFacing"
                  >
                    <SwitchCamera :size="14" />
                    <span>Flip Camera</span>
                  </button>
                  <button
                    v-if="!cameraActive"
                    type="button"
                    class="cam-btn-primary"
                    :disabled="cameraStarting"
                    @click="startCamera"
                  >
                    <Camera :size="14" />
                    <span>{{ cameraStarting ? 'Starting Camera…' : 'Open Live Camera' }}</span>
                  </button>
                  <button
                    v-else
                    type="button"
                    class="cam-btn-secondary"
                    @click="stopCamera"
                  >
                    <X :size="14" />
                    <span>Close Camera</span>
                  </button>
                </div>
              </div>

              <!-- Active Live Video Stream -->
              <div v-if="cameraActive" class="camera-stage">
                <video
                  ref="videoRef"
                  autoplay
                  playsinline
                  muted
                  class="camera-video"
                />
                <div class="camera-controls-bar">
                  <button
                    type="button"
                    class="shutter-btn"
                    @click="captureLiveFrame"
                  >
                    <Camera :size="18" />
                    <span>Take Live Photo ({{ capturedItems.length }}/10)</span>
                  </button>
                </div>
              </div>

              <!-- Quick Action Buttons when Camera is Closed -->
              <div v-else class="camera-closed-actions">
                <button type="button" class="capture-option-card primary-capture" @click="startCamera">
                  <Camera :size="22" />
                  <div>
                    <strong>Picture Live with Camera</strong>
                    <small>Use your webcam or phone camera to snap live proof of work</small>
                  </div>
                </button>

                <button type="button" class="capture-option-card" @click="fileUploadInput?.click()">
                  <Upload :size="22" />
                  <div>
                    <strong>Upload Images from Device</strong>
                    <small>Select screenshots or photos (JPG, PNG, WEBP up to 4 MB)</small>
                  </div>
                </button>
              </div>
            </div>

            <!-- Right Column: Captured & Selected Proof of Work Images + Supporting Document -->
            <div class="captured-side-panel">
              <div class="captured-section">
                <div class="captured-head">
                  <strong>
                    Proof of Work Images ({{ capturedItems.length }}/10)
                    <em class="req-star">*</em>
                  </strong>
                  <div class="captured-head-btns">
                    <button type="button" class="mini-action-btn" @click="fileUploadInput?.click()">
                      <Upload :size="12" /> + Add Image File
                    </button>
                  </div>
                </div>

                <div v-if="capturedItems.length" class="captured-grid">
                  <div v-for="item in capturedItems" :key="item.id" class="captured-card">
                    <img :src="item.previewUrl" :alt="item.file.name" />
                    <span class="captured-tag" :class="item.isLive ? 'tag-live' : 'tag-file'">
                      {{ item.isLive ? '● LIVE PHOTO' : 'FILE' }}
                    </span>
                    <button
                      type="button"
                      class="captured-remove"
                      aria-label="Remove image"
                      @click="removeCapturedItem(item.id)"
                    >
                      <Trash2 :size="13" />
                    </button>
                  </div>
                </div>
                <p v-else class="captured-empty">
                  No proof-of-work photos captured yet. Click <strong>Take Live Photo</strong> on the left to snap your proof of work.
                </p>
              </div>

              <!-- Optional Supporting Document -->
              <div class="doc-section">
                <label class="doc-label">
                  <span><FileText :size="14" /> Supporting Document (Optional PDF or Image)</span>
                  <input
                    ref="docUploadInput"
                    type="file"
                    accept="application/pdf,image/jpeg,image/png,image/webp"
                    @change="onDocSelected"
                  />
                </label>
                <div v-if="supportingDocument" class="doc-picked">
                  <span>{{ supportingDocument.name }}</span>
                  <button type="button" @click="supportingDocument = null">Remove</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <footer class="wfh-proof-footer">
          <button type="button" class="footer-btn-cancel" :disabled="saving" @click="closeModal">
            Cancel
          </button>
          <button
            type="button"
            class="footer-btn-submit"
            :disabled="saving || !capturedItems.length"
            @click="handleSubmit"
          >
            <CheckCircle2 :size="16" />
            <span>{{ saving ? 'Submitting…' : (submitLabel || 'Submit Proof & Time Out') }}</span>
          </button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.wfh-proof-overlay {
  position: fixed;
  inset: 0;
  z-index: 25000;
  background: rgba(15, 23, 42, 0.72);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.wfh-proof-modal {
  width: min(1040px, 95vw);
  max-width: 1040px;
  max-height: calc(100dvh - 32px);
  background: var(--bg-card, #ffffff);
  color: var(--text-primary, #0f172a);
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 16px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.32);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.wfh-proof-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 20px;
  border-bottom: 1px solid var(--border, #e2e8f0);
}

.wfh-proof-title-wrap {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.wfh-proof-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.wfh-proof-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}

.wfh-proof-header p {
  margin: 3px 0 0;
  font-size: 12px;
  color: var(--text-secondary, #64748b);
}

.wfh-proof-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--border, #e2e8f0);
  background: transparent;
  color: var(--text-secondary, #64748b);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.sr-only-input {
  display: none;
}

.wfh-proof-body {
  padding: 20px 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.wfh-proof-web-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.95fr);
  gap: 18px;
  align-items: start;
}

.captured-side-panel {
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 12px;
  background: var(--bg-card-soft, #f8fafc);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.wfh-proof-alert {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 9px;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  font-size: 12px;
  font-weight: 600;
}

.camera-section {
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 12px;
  background: var(--bg-card-soft, #f8fafc);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.camera-section-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.camera-bar-title {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
}

.live-indicator {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  font-size: 10px;
  font-weight: 800;
}

.live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ef4444;
}

.camera-bar-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.cam-btn-primary,
.cam-btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 11px;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.cam-btn-primary {
  background: #2563eb;
  color: #ffffff;
  border: 1px solid #2563eb;
}

.cam-btn-secondary {
  background: var(--bg-card, #ffffff);
  color: var(--text-primary, #0f172a);
  border: 1px solid var(--border, #cbd5e1);
}

.camera-stage {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  background: #090d16;
  border: 1px solid var(--border, #334155);
}

.camera-video {
  width: 100%;
  max-height: 280px;
  object-fit: cover;
  display: block;
}

.camera-controls-bar {
  display: flex;
  justify-content: center;
  padding: 10px;
  background: rgba(15, 23, 42, 0.85);
}

.shutter-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 20px;
  border-radius: 999px;
  border: 2px solid #ffffff;
  background: #10b981;
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
}

.camera-closed-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.capture-option-card {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 13px;
  border-radius: 10px;
  border: 1px dashed var(--border, #cbd5e1);
  background: var(--bg-card, #ffffff);
  color: var(--text-primary, #0f172a);
  text-align: left;
  cursor: pointer;
}

.capture-option-card.primary-capture {
  border-style: solid;
  border-color: rgba(37, 99, 235, 0.45);
  background: rgba(37, 99, 235, 0.06);
}

.capture-option-card strong {
  display: block;
  font-size: 12.5px;
}

.capture-option-card small {
  display: block;
  margin-top: 2px;
  font-size: 11px;
  color: var(--text-secondary, #64748b);
}

.captured-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.captured-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 13px;
}

.req-star {
  color: #ef4444;
  font-style: normal;
}

.mini-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 6px;
  border: 1px solid var(--border, #cbd5e1);
  background: var(--bg-card-soft, #f8fafc);
  color: var(--text-primary, #0f172a);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.captured-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(115px, 1fr));
  gap: 10px;
}

.captured-card {
  position: relative;
  border-radius: 9px;
  overflow: hidden;
  border: 1px solid var(--border, #cbd5e1);
  background: var(--bg-card-soft, #f8fafc);
  aspect-ratio: 4 / 3;
}

.captured-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.captured-tag {
  position: absolute;
  left: 6px;
  bottom: 6px;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.03em;
}

.tag-live {
  background: rgba(16, 185, 129, 0.9);
  color: #ffffff;
}

.tag-file {
  background: rgba(15, 23, 42, 0.8);
  color: #f8fafc;
}

.captured-remove {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: rgba(239, 68, 68, 0.9);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.captured-empty {
  margin: 0;
  padding: 14px;
  border-radius: 9px;
  border: 1px dashed var(--border, #cbd5e1);
  text-align: center;
  font-size: 12px;
  color: var(--text-secondary, #64748b);
}

.doc-section {
  border-top: 1px solid var(--border, #e2e8f0);
  padding-top: 12px;
}

.doc-label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary, #64748b);
}

.doc-label span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.doc-picked {
  margin-top: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  border-radius: 7px;
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  font-size: 12px;
  font-weight: 600;
}

.wfh-proof-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid var(--border, #e2e8f0);
  background: var(--bg-card-soft, #f8fafc);
}

.footer-btn-cancel {
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid var(--border, #cbd5e1);
  background: var(--bg-card, #ffffff);
  color: var(--text-primary, #0f172a);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.footer-btn-submit {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 18px;
  border-radius: 8px;
  border: 1px solid #10b981;
  background: #10b981;
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.footer-btn-submit:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

@media (max-width: 820px) {
  .wfh-proof-web-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .camera-closed-actions {
    grid-template-columns: 1fr;
  }
}
</style>
