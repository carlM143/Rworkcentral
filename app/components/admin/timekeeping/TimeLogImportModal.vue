
<script setup lang="ts">
import {
  Upload,
  FileSpreadsheet,
  X,
  CheckCircle2,
  AlertTriangle,
  CopyCheck,
} from 'lucide-vue-next'

import type {
  AttendanceImportSummary,
} from '~/types/attendanceImport'

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  imported: [result: AttendanceImportSummary]
}>()

const {
  rows,
  fileName,
  error,
  busy,
  summary,
  selectFile,
  commitImport,
  reset,
} = useAttendanceImport()

const inputRef = ref<HTMLInputElement | null>(null)
const dragging = ref(false)

const openPicker = () => inputRef.value?.click()

const onFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) await selectFile(file)
  input.value = ''
}

const onDrop = async (event: DragEvent) => {
  dragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) await selectFile(file)
}

const close = () => {
  reset()
  emit('close')
}

const importData = () => {
  if (!summary.value.valid) return
  const result = commitImport()
  emit('imported', result)
  close()
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="attendance-import-overlay" @click.self="close">
      <section
        class="attendance-import-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Import biometric attendance"
      >
        <header class="modal-heading">
          <span class="heading-icon"><Upload :size="18" /></span>
          <div class="heading-text">
            <h3>Import Attendance</h3>
            <p>Upload biometric records and review employee matching.</p>
          </div>
          <button class="icon-button" type="button" @click="close">
            <X :size="18" />
          </button>
        </header>

        <div class="modal-body">
          <div class="source-info">
            <span>Attendance Source</span>
            <strong>RWorkCentral — Single Biometric</strong>
          </div>

          <div
            class="upload-area"
            :class="{ dragging }"
            @dragover.prevent="dragging = true"
            @dragleave.prevent="dragging = false"
            @drop.prevent="onDrop"
          >
            <FileSpreadsheet :size="29" />
            <strong>{{ fileName || 'Upload attendance CSV' }}</strong>
            <p>Drag and drop your biometric export here.</p>

            <button
              class="browse-button"
              type="button"
              :disabled="busy"
              @click="openPicker"
            >
              {{ busy ? 'Reading file...' : 'Browse CSV File' }}
            </button>

            <input
              ref="inputRef"
              type="file"
              accept=".csv,text/csv"
              hidden
              @change="onFileChange"
            />

            <small>CSV only · Maximum 5 MB · 10,000 rows</small>
          </div>

          <p v-if="error" class="error-message">
            <AlertTriangle :size="14" />
            {{ error }}
          </p>

          <template v-if="rows.length">
            <div class="preview-stats">
              <div>
                <span>Total Rows</span>
                <strong>{{ summary.total }}</strong>
              </div>
              <div>
                <span>Valid</span>
                <strong class="success">{{ summary.valid }}</strong>
              </div>
              <div>
                <span>Duplicates</span>
                <strong class="warning">{{ summary.duplicates }}</strong>
              </div>
              <div>
                <span>Invalid</span>
                <strong class="danger">{{ summary.invalid }}</strong>
              </div>
            </div>

            <div class="preview-heading">
              <h4>Attendance Preview</h4>
              <span>Showing first 100 rows</span>
            </div>

            <div class="preview-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Date</th>
                    <th>Time In</th>
                    <th>Time Out</th>
                    <th>Validation</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in rows.slice(0, 100)" :key="row.rowNumber">
                    <td>
                      <strong>{{ row.employeeName || row.employeeNumber }}</strong>
                      <small>{{ row.employeeNumber }}</small>
                    </td>
                    <td>{{ row.date }}</td>
                    <td>{{ row.timeIn || '—' }}</td>
                    <td>{{ row.timeOut || '—' }}</td>
                    <td>
                      <span
                        class="validation"
                        :class="row.status.toLowerCase()"
                        :title="row.message"
                      >
                        {{ row.status }}
                      </span>
                      <small v-if="row.status !== 'Valid'">{{ row.message }}</small>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p class="preview-note">
              <CopyCheck :size="14" />
              Existing employee/date records are skipped. Only valid new rows
              will be imported.
            </p>
          </template>
        </div>

        <footer class="modal-footer">
          <button type="button" class="cancel-button" @click="close">
            Cancel
          </button>

          <button
            type="button"
            class="import-button"
            :disabled="busy || !summary.valid"
            @click="importData"
          >
            <CheckCircle2 :size="16" />
            Import {{ summary.valid }} Records
          </button>
        </footer>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.attendance-import-overlay {
  position: fixed;
  inset: 0;
  z-index: 10050;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: rgba(2, 9, 22, .78);
  backdrop-filter: blur(5px);
}

.attendance-import-modal {
  width: 100%;
  max-width: 760px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 13px;
  background: var(--bg-card);
  color: var(--text-primary);
  box-shadow: 0 24px 70px rgba(0, 0, 0, .3);
}

.modal-heading {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--border);
}

.heading-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: var(--primary-soft);
  color: var(--primary);
}

.heading-text {
  flex: 1;
}

.heading-text h3 {
  margin: 0;
  font-size: 14px;
}

.heading-text p {
  margin: 4px 0 0;
  color: var(--text-muted);
  font-size: 10px;
}

.icon-button {
  border: 1px solid var(--border);
  border-radius: 7px;
  background: transparent;
  color: var(--text-secondary);
  padding: 6px;
}

.modal-body {
  padding: 18px;
  overflow-y: auto;
}

.source-info {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 12px;
  margin-bottom: 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
  font-size: 11px;
}

.source-info span {
  color: var(--text-muted);
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 9px;
  padding: 25px 15px;
  border: 1px dashed var(--border);
  border-radius: 10px;
  background: var(--bg-card-soft);
  text-align: center;
}

.upload-area.dragging {
  border-color: var(--primary);
  background: var(--primary-soft);
}

.upload-area > svg {
  color: var(--primary);
}

.upload-area strong {
  font-size: 12px;
}

.upload-area p,
.upload-area small {
  margin: 0;
  color: var(--text-muted);
  font-size: 10px;
}

.browse-button,
.import-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 10px 14px;
  border: 0;
  border-radius: 7px;
  background: var(--primary);
  color: white;
  font-size: 11px;
  font-weight: 600;
}

.error-message {
  display: flex;
  gap: 8px;
  color: var(--red);
  font-size: 11px;
}

.preview-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 9px;
  margin: 15px 0;
}

.preview-stats > div {
  padding: 11px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
}

.preview-stats span {
  display: block;
  color: var(--text-muted);
  font-size: 9px;
}

.preview-stats strong {
  display: block;
  margin-top: 6px;
  font-size: 18px;
}

.success { color: var(--green); }
.warning { color: var(--orange); }
.danger { color: var(--red); }

.preview-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 9px;
}

.preview-heading h4 {
  margin: 0;
  font-size: 12px;
}

.preview-heading span {
  color: var(--text-muted);
  font-size: 10px;
}

.preview-scroll {
  overflow: auto;
  max-height: 260px;
  border: 1px solid var(--border);
  border-radius: 8px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid var(--border-soft);
  font-size: 10px;
  white-space: nowrap;
}

th {
  background: var(--bg-card-soft);
  color: var(--text-secondary);
}

td {
  color: var(--text-secondary);
}

td strong, td small {
  display: block;
}

td strong {
  color: var(--text-primary);
}

td small {
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 9px;
}

.validation {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 15px;
  font-size: 9px;
  font-weight: 650;
}

.validation.valid {
  background: var(--green-soft);
  color: var(--green);
}

.validation.duplicate {
  background: var(--orange-soft);
  color: var(--orange);
}

.validation.invalid {
  background: var(--red-soft);
  color: var(--red);
}

.preview-note {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--text-muted);
  font-size: 10px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 14px 18px;
  border-top: 1px solid var(--border);
}

.cancel-button {
  padding: 10px 15px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: transparent;
  color: var(--text-primary);
  font-size: 11px;
}

.import-button:disabled,
.browse-button:disabled {
  opacity: .5;
  cursor: not-allowed;
}

@media (max-width: 650px) {
  .preview-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .source-info {
    flex-direction: column;
  }
}
</style>
