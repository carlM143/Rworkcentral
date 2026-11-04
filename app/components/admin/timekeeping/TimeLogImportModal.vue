
<script setup lang="ts">
import {
  Upload,
  FileSpreadsheet,
  X,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
} from 'lucide-vue-next'

import type {
  AttendanceImportSummary,
} from '~/types/attendanceImport'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  imported: [result: AttendanceImportSummary]
}>()

const { $api } = useNuxtApp()

interface ImportResult {
  imported: number
  updated: number
  duplicates: number
  invalid: number
  processed: number
  errors: string[]
}

interface ImportResponse {
  success: boolean
  message: string
  data: ImportResult
}

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const uploading = ref(false)
const replaceExisting = ref(false)
const errorMessage = ref('')
const result = ref<ImportResult | null>(null)
const dragging = ref(false)

const reset = () => {
  selectedFile.value = null
  replaceExisting.value = false
  errorMessage.value = ''
  result.value = null
  dragging.value = false

  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const close = () => {
  if (uploading.value) return

  reset()
  emit('close')
}

const browseFile = () => {
  fileInput.value?.click()
}

const setFile = (file?: File | null) => {
  errorMessage.value = ''
  result.value = null

  if (!file) return

  const extension = file.name
    .split('.')
    .pop()
    ?.toLowerCase()

  if (extension !== 'csv') {
    errorMessage.value = 'Please select a CSV file.'
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    errorMessage.value = 'Maximum allowed file size is 5 MB.'
    return
  }

  selectedFile.value = file
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  setFile(target.files?.[0])
}

const handleDrop = (event: DragEvent) => {
  dragging.value = false
  setFile(event.dataTransfer?.files?.[0])
}

const uploadCsv = async () => {
  if (!selectedFile.value || uploading.value) return

  uploading.value = true
  errorMessage.value = ''
  result.value = null

  try {
    const formData = new FormData()

    formData.append('file', selectedFile.value)
    formData.append(
      'replace_existing',
      replaceExisting.value ? '1' : '0',
    )

    const response = await $api<ImportResponse>(
      '/admin/time-logs/import',
      {
        method: 'POST',
        body: formData,
      },
    )

    if (!response.success) {
      throw new Error(
        response.message || 'Attendance import failed.',
      )
    }

    result.value = response.data

    emit('imported', {
      imported: response.data.imported,
      duplicates: response.data.duplicates,
      invalid: response.data.invalid,
    })
  } catch (error: any) {
    errorMessage.value =
      error?.data?.message ||
      error?.message ||
      'Unable to import attendance CSV.'
  } finally {
    uploading.value = false
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) reset()
  },
)
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="attendance-import-overlay"
      @click.self="close"
    >
      <div class="attendance-import-modal">
        <div class="modal-header">
          <div class="modal-title">
            <div class="header-icon">
              <Upload :size="18" />
            </div>

            <div>
              <h3>Import Attendance</h3>
              <p>
                Upload biometric records and match them with employees.
              </p>
            </div>
          </div>

          <button
            class="close-button"
            type="button"
            :disabled="uploading"
            @click="close"
          >
            <X :size="17" />
          </button>
        </div>

        <div class="modal-body">
          <div class="source-info">
            <span>Attendance Source</span>
            <strong>RWorkCentral — Biometric CSV</strong>
          </div>

          <div
            class="upload-zone"
            :class="{ dragging }"
            @dragover.prevent="dragging = true"
            @dragleave.prevent="dragging = false"
            @drop.prevent="handleDrop"
          >
            <input
              ref="fileInput"
              type="file"
              accept=".csv,text/csv"
              hidden
              @change="handleFileChange"
            />

            <div class="file-icon">
              <FileSpreadsheet :size="26" />
            </div>

            <template v-if="selectedFile">
              <strong>{{ selectedFile.name }}</strong>

              <p>
                {{ (selectedFile.size / 1024).toFixed(2) }} KB
              </p>

              <button
                class="browse-button"
                type="button"
                :disabled="uploading"
                @click="browseFile"
              >
                Change CSV File
              </button>
            </template>

            <template v-else>
              <strong>Upload attendance CSV</strong>

              <p>Drag and drop your biometric export here.</p>

              <button
                class="browse-button"
                type="button"
                @click="browseFile"
              >
                Browse CSV File
              </button>
            </template>

            <small>CSV only · Maximum 5 MB · Up to 10,000 rows</small>
          </div>

          <div class="format-info">
            <strong>Required CSV Columns</strong>
            <p>
              emp_id, work_date, time_in, time_out,
              break_out, break_in
            </p>
            <small>
              One attendance record per employee per work date.
              Time format: 24-hour HH:mm or 12-hour AM/PM.
            </small>
          </div>

          <label class="replace-option">
            <input
              v-model="replaceExisting"
              type="checkbox"
              :disabled="uploading"
            />

            <div>
              <strong>Replace existing attendance records</strong>
              <span>
                When enabled, matching employee/date records
                will be updated using the uploaded CSV.
              </span>
            </div>
          </label>

          <div v-if="errorMessage" class="import-error">
            <AlertCircle :size="16" />
            <span>{{ errorMessage }}</span>
          </div>

          <div v-if="result" class="import-result">
            <div class="result-heading">
              <CheckCircle2 :size="18" />
              <strong>Import Processing Completed</strong>
            </div>

            <div class="result-grid">
              <div>
                <strong>{{ result.imported }}</strong>
                <span>Imported</span>
              </div>
              <div>
                <strong>{{ result.updated }}</strong>
                <span>Updated</span>
              </div>
              <div>
                <strong>{{ result.duplicates }}</strong>
                <span>Duplicates</span>
              </div>
              <div>
                <strong>{{ result.invalid }}</strong>
                <span>Invalid</span>
              </div>
            </div>

            <div
              v-if="result.errors?.length"
              class="result-errors"
            >
              <strong>Rows needing review</strong>

              <p
                v-for="(message, index) in result.errors"
                :key="index"
              >
                {{ message }}
              </p>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button
            class="cancel-button"
            type="button"
            :disabled="uploading"
            @click="close"
          >
            {{ result ? 'Done' : 'Cancel' }}
          </button>

          <button
            v-if="!result"
            class="import-button"
            type="button"
            :disabled="!selectedFile || uploading"
            @click="uploadCsv"
          >
            <LoaderCircle
              v-if="uploading"
              :size="15"
              class="spinner"
            />

            <Upload v-else :size="15" />

            {{ uploading ? 'Importing...' : 'Import Attendance' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.attendance-import-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(3, 11, 28, .72);
  backdrop-filter: blur(6px);
}

.attendance-import-modal {
  width: 100%;
  max-width: 660px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
  color: var(--text-primary);
  box-shadow: 0 25px 70px rgba(0, 0, 0, .28);
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid var(--border);
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-icon,
.file-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-soft);
  color: var(--primary);
}

.header-icon {
  width: 36px;
  height: 36px;
  border-radius: 9px;
}

.modal-title h3 {
  margin: 0;
  font-size: 13px;
}

.modal-title p {
  margin: 4px 0 0;
  color: var(--text-muted);
  font-size: 9px;
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 33px;
  height: 33px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
}

.modal-body {
  padding: 16px;
}

.source-info {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
  font-size: 10px;
}

.source-info span {
  color: var(--text-muted);
}

.upload-zone {
  display: flex;
  min-height: 185px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  border: 1px dashed var(--border);
  border-radius: 9px;
  background: var(--bg-card-soft);
  text-align: center;
}

.upload-zone.dragging {
  border-color: var(--primary);
  background: var(--primary-soft);
}

.file-icon {
  width: 40px;
  height: 40px;
  border-radius: 9px;
}

.upload-zone strong {
  font-size: 12px;
  overflow-wrap: anywhere;
}

.upload-zone p,
.upload-zone small {
  margin: 0;
  color: var(--text-muted);
  font-size: 9px;
}

.browse-button,
.import-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 9px 12px;
  border: none;
  border-radius: 7px;
  background: var(--primary);
  color: white;
  font-size: 10px;
  font-weight: 650;
  cursor: pointer;
}

.format-info {
  margin-top: 12px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
}

.format-info strong {
  font-size: 11px;
}

.format-info p {
  margin: 7px 0;
  color: var(--primary);
  font-size: 10px;
  overflow-wrap: anywhere;
}

.format-info small {
  color: var(--text-muted);
  font-size: 9px;
}

.replace-option {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 13px;
  cursor: pointer;
}

.replace-option input {
  margin-top: 3px;
  accent-color: var(--primary);
}

.replace-option strong,
.replace-option span {
  display: block;
}

.replace-option strong {
  font-size: 11px;
}

.replace-option span {
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 9px;
  line-height: 1.5;
}

.import-error,
.import-result {
  margin-top: 13px;
  padding: 12px;
  border-radius: 8px;
}

.import-error {
  display: flex;
  gap: 8px;
  border: 1px solid var(--red);
  background: var(--red-soft);
  color: var(--red);
  font-size: 10px;
}

.import-result {
  border: 1px solid var(--border);
  background: var(--bg-card-soft);
}

.result-heading {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--green);
  font-size: 11px;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-top: 13px;
}

.result-grid div {
  padding: 10px 5px;
  border: 1px solid var(--border);
  border-radius: 7px;
  text-align: center;
}

.result-grid strong,
.result-grid span {
  display: block;
}

.result-grid strong {
  font-size: 18px;
}

.result-grid span {
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 9px;
}

.result-errors {
  max-height: 140px;
  overflow-y: auto;
  margin-top: 12px;
}

.result-errors strong {
  font-size: 10px;
}

.result-errors p {
  margin: 6px 0;
  color: var(--red);
  font-size: 10px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
  padding: 14px 16px;
  border-top: 1px solid var(--border);
}

.cancel-button {
  padding: 9px 14px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 10px;
  cursor: pointer;
}

button:disabled {
  opacity: .5;
  cursor: not-allowed;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 520px) {
  .result-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .source-info {
    flex-direction: column;
  }
}
</style>
