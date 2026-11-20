<script setup lang="ts">
import {
  Plus,
  X,
  CalendarDays,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  UserCheck,
  FileText,
  MessageSquare,
  Paperclip,
  Camera,
} from 'lucide-vue-next'
import EmployeeLeaveDateCalendar from '~/components/employee/EmployeeLeaveDateCalendar.vue'
import EmployeeWfhProofModal from '~/components/employee/EmployeeWfhProofModal.vue'
import WorkFromHomeTable from '~/components/employee/work-from-home/WorkFromHomeTable.vue'
import { employeeWfhError, useWorkFromHome } from '~/composables/employee/work-from-home/useWorkFromHome'
import type {
  ScheduleData,
  WfhFileItem,
  WfhRequest,
} from '~/types/employee/work-from-home/workFromHome'

definePageMeta({ layout: false, middleware: 'employee' })

const api = useWorkFromHome()
const { success } = useToast()

const records = ref<WfhRequest[]>([])
const loading = ref(false)
const error = ref('')
const selected = ref<WfhRequest | null>(null)
const detailShowCalendar = ref(false)
const detailShowBreakdown = ref(true)

// Employee daily proof-of-work attachment state
const DAY_STATUS_LABELS: Record<string, string> = {
  not_submitted: 'Not Submitted',
  draft: 'Draft',
  submitted: 'Submitted (Pending Verification)',
  accepted: 'Verified (Attendance Recorded)',
  returned: 'Returned (Resubmit)',
}

const activeUploadDate = ref<string | null>(null)
const uploadSaving = ref(false)
const uploadError = ref('')
const previewAttachment = ref<{ file: WfhFileItem; date: string } | null>(null)

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return '—'
  const d = new Date(`${dateStr.slice(0, 10)}T12:00:00`)
  return Number.isNaN(d.getTime())
    ? dateStr
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatDateWithWeekday = (dateStr?: string | null) => {
  if (!dateStr) return '—'
  const d = new Date(`${dateStr.slice(0, 10)}T12:00:00`)
  return Number.isNaN(d.getTime())
    ? dateStr
    : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

const formatDateTime = (iso?: string | null) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

const formatPeriod = (start?: string, end?: string) => {
  if (!start && !end) return '—'
  if (!end || start === end) return formatDate(start)
  return `${formatDate(start)} – ${formatDate(end)}`
}

const openDetail = (record: WfhRequest) => {
  detailShowCalendar.value = false
  detailShowBreakdown.value = true
  activeUploadDate.value = null
  uploadError.value = ''
  previewAttachment.value = null
  selected.value = record
}

const proofModalOpen = computed({
  get: () => activeUploadDate.value !== null,
  set: (val: boolean) => {
    if (!val) {
      activeUploadDate.value = null
      uploadError.value = ''
    }
  },
})

const startDayUpload = (date: string) => {
  activeUploadDate.value = date
  uploadError.value = ''
}

// Files come from EmployeeWfhProofModal (it validates type, size and count)
const submitDayModalUpload = async (payload: { images: File[]; document: File | null }) => {
  const request = selected.value
  const date = activeUploadDate.value
  if (!request || !date) return

  if (!payload.images.length && !payload.document) {
    uploadError.value = 'Attach at least one image or a supporting document.'
    return
  }

  uploadSaving.value = true
  uploadError.value = ''

  try {
    await api.attachDayProof(request.id, { date_attendance: date, ...payload })

    activeUploadDate.value = null
    success('Proof of Work Submitted', 'Your attachments have been submitted for Admin attendance verification.')
    await load()
    const refreshed = records.value.find(r => r.id === request.id)
    if (refreshed) selected.value = refreshed
  } catch (problem) {
    uploadError.value = employeeWfhError(problem, 'Unable to upload proof of work.')
  } finally {
    uploadSaving.value = false
  }
}

// Work schedule: fallback schedule name/code in the details dialog
const scheduleData = ref<ScheduleData | null>(null)

const loadSchedule = async () => {
  try {
    const data = await api.schedule()
    if (data) scheduleData.value = data
  } catch (err) {
    console.warn('Could not load work schedule', err)
  }
}

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    records.value = await api.list()
  } catch (problem) {
    error.value = employeeWfhError(problem, 'Unable to load work-from-home requests.')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  load()
  loadSchedule()
})

// New / edit live on their own pages
const BASE = '/employee/requests/work-from-home'
const editRequest = (record: WfhRequest) =>
  navigateTo({ path: `${BASE}/edit`, query: { id: String(record.id) } })
</script>

<template>
  <section class="wfh-page">
    <header class="header">
      <div>
        <h1>Work From Home</h1>
        <p>Submit and track your work-from-home requests.</p>
      </div>
      <NuxtLink :to="`${BASE}/create`" class="primary">
        <Plus :size="16" /> New Request
      </NuxtLink>
    </header>

    <p v-if="error" class="error" role="alert">
      {{ error }} <button type="button" @click="load">Retry</button>
    </p>

    <div class="panel">
      <div class="panel-heading">
        <div>
          <h2>My Requests</h2>
          <p>Requests are reviewed by your administrator.</p>
        </div>
        <button type="button" :disabled="loading" @click="load">Refresh</button>
      </div>

      <WorkFromHomeTable
        v-if="!error"
        :records="records"
        :loading="loading"
        @open="openDetail"
        @edit="editRequest"
      />
    </div>

    <!-- Request Details Modal -->
    <div v-if="selected" class="overlay" @click.self="selected = null">
      <section class="dialog detail-dialog" role="dialog" aria-modal="true" aria-labelledby="wfh-detail">
        <header class="detail-modal-head">
          <div>
            <p class="detail-eyebrow">{{ selected.request_no }}</p>
            <h2 id="wfh-detail">WFH Request Details</h2>
            <p class="detail-subtitle">Filed on {{ formatDate(selected.request_date) }}</p>
          </div>
          <div class="detail-head-actions">
            <span class="status status-lg" :class="selected.status">
              <span class="status-dot" />
              {{ selected.status }}
            </span>
            <button type="button" class="close-btn" aria-label="Close" @click="selected = null">
              <X :size="18" />
            </button>
          </div>
        </header>

        <div class="detail-modal-body">
          <!-- Key Info Grid -->
          <div class="detail-info-grid">
            <div class="detail-info-card">
              <span class="detail-card-label"><CalendarDays :size="13" /> WFH Period</span>
              <strong>{{ formatPeriod(selected.start_date, selected.end_date) }}</strong>
            </div>

            <div class="detail-info-card detail-card-highlight">
              <span class="detail-card-label"><Clock :size="13" /> Scheduled WFH Days</span>
              <div class="detail-days-row">
                <strong>{{ selected.number_of_days }} {{ selected.number_of_days === 1 ? 'day' : 'days' }}</strong>
                <span
                  v-if="selected.calendar_days && selected.calendar_days > selected.number_of_days"
                  class="detail-rest-tag"
                >
                  {{ selected.calendar_days - selected.number_of_days }} rest {{ (selected.calendar_days - selected.number_of_days) === 1 ? 'day' : 'days' }} off
                </span>
              </div>
            </div>

            <div class="detail-info-card">
              <span class="detail-card-label"><Clock :size="13" /> Work Schedule</span>
              <strong>
                {{ selected.schedule_name || scheduleData?.schedule_name || 'Standard Schedule' }}
                <span v-if="selected.schedule_code || scheduleData?.schedule_code" class="detail-code-tag">
                  {{ selected.schedule_code || scheduleData?.schedule_code }}
                </span>
              </strong>
            </div>

            <div class="detail-info-card">
              <span class="detail-card-label"><UserCheck :size="13" /> Supervisor</span>
              <strong>{{ selected.supervisor_name }}</strong>
            </div>

            <div class="detail-info-card">
              <span class="detail-card-label"><CalendarDays :size="13" /> Request Date</span>
              <strong>{{ formatDate(selected.request_date) }}</strong>
            </div>

            <div class="detail-info-card">
              <span class="detail-card-label">
                <UserCheck :size="13" />
                {{ selected.status === 'rejected' ? 'Rejected By' : 'Approved By' }}
              </span>
              <strong>
                {{ selected.status === 'pending' ? 'Not yet decided' : (selected.approved_by || 'Administrator') }}
                <small v-if="selected.approved_at" class="detail-decided-date">
                  on {{ formatDate(selected.approved_at) }}
                </small>
              </strong>
            </div>
          </div>

          <!-- Daily Schedule Breakdown & Calendar Preview -->
          <div v-if="selected.breakdown?.length" class="detail-schedule-section">
            <div class="detail-schedule-head">
              <div class="detail-schedule-title">
                <Clock :size="14" />
                <span>Scheduled Days & Shift Breakdown</span>
              </div>
              <div class="detail-schedule-toggles">
                <button type="button" class="detail-toggle-btn" @click="detailShowCalendar = !detailShowCalendar">
                  <CalendarDays :size="12" />
                  <span>{{ detailShowCalendar ? 'Hide Calendar' : 'Calendar View' }}</span>
                </button>
                <button type="button" class="detail-toggle-btn" @click="detailShowBreakdown = !detailShowBreakdown">
                  <span>{{ detailShowBreakdown ? 'Hide Days' : 'Show Days' }}</span>
                  <component :is="detailShowBreakdown ? ChevronUp : ChevronDown" :size="13" />
                </button>
              </div>
            </div>

            <div v-if="detailShowCalendar" class="detail-calendar-wrap">
              <EmployeeLeaveDateCalendar
                :start="selected.start_date"
                :end="selected.end_date"
                :active-dates="selected.working_dates"
                :total-days="selected.number_of_days"
                readonly
                hide-presets
              />
            </div>

            <div v-if="detailShowBreakdown" class="breakdown-chips-grid">
              <div
                v-for="item in selected.breakdown"
                :key="item.date"
                class="breakdown-chip"
                :class="item.is_working_day ? 'chip-work' : 'chip-rest'"
              >
                <span class="chip-date-text">{{ item.date }}</span>
                <span class="chip-day-name">{{ item.day_name }}</span>
                <span class="chip-type-tag">
                  <Clock v-if="item.is_working_day" :size="11" class="chip-time-icon" />
                  {{ item.is_working_day ? (item.schedule_time || 'Regular Shift') : 'Rest day (Off)' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Daily Proof of Work (Attach for Attendance) -->
          <div v-if="selected.status === 'approved' && selected.days?.length" class="pow-section">
            <div class="pow-section-head">
              <div>
                <div class="pow-section-title">
                  <Paperclip :size="15" />
                  <span>Daily Proof of Work (Attendance Verification)</span>
                </div>
                <p class="pow-section-subtitle">
                  Time In on your approved WFH day from the Dashboard, then Time Out with a live photo of your Proof of Work. Once verified by Admin, each day is counted as complete attendance.
                </p>
              </div>
              <div v-if="selected.counts" class="pow-progress-pills">
                <span class="pow-pill verified">
                  <CheckCircle2 :size="12" /> {{ selected.counts.accepted }}/{{ selected.counts.expected }} Verified
                </span>
                <span v-if="selected.counts.submitted > 0" class="pow-pill pending">
                  {{ selected.counts.submitted }} Pending
                </span>
                <span v-if="selected.counts.returned > 0" class="pow-pill returned">
                  {{ selected.counts.returned }} Returned
                </span>
              </div>
            </div>

            <!-- Inline Attachment Preview -->
            <div v-if="previewAttachment" class="pow-preview-card">
              <div class="pow-preview-head">
                <strong>{{ previewAttachment.file.name }} · {{ formatDateWithWeekday(previewAttachment.date) }}</strong>
                <div class="pow-preview-actions">
                  <a :href="previewAttachment.file.url" target="_blank" rel="noopener noreferrer">Open in new tab</a>
                  <button type="button" @click="previewAttachment = null">Close preview</button>
                </div>
              </div>
              <iframe
                v-if="previewAttachment.file.mime === 'application/pdf'"
                :src="previewAttachment.file.url"
                title="PDF preview"
                class="pow-pdf-frame"
              />
              <img v-else :src="previewAttachment.file.url" :alt="previewAttachment.file.name" class="pow-preview-img" />
            </div>

            <div class="pow-days-list">
              <article v-for="day in selected.days" :key="day.date" class="pow-day-card" :class="day.status">
                <div class="pow-day-head">
                  <div>
                    <strong class="pow-day-date">{{ formatDateWithWeekday(day.date) }}</strong>
                    <span v-if="day.submitted_at" class="pow-day-meta">
                      Submitted {{ formatDateTime(day.submitted_at) }}
                    </span>
                  </div>
                  <div class="pow-day-actions">
                    <span class="pow-status-badge" :class="day.status">
                      <span class="pow-status-dot" />
                      {{ DAY_STATUS_LABELS[day.status] ?? day.status }}
                    </span>
                    <button
                      v-if="day.status !== 'accepted' && (day.images.length || day.document)"
                      type="button"
                      class="pow-attach-btn"
                      @click="startDayUpload(day.date)"
                    >
                      <Camera :size="13" />
                      <span>
                        {{ day.status === 'returned' ? 'Resubmit Proof' : 'Update Proof' }}
                      </span>
                    </button>
                  </div>
                </div>

                <p v-if="day.status !== 'accepted' && !day.images.length && !day.document" class="pow-day-meta">
                  Proof of Work is attached when you Time Out from the Dashboard on this day.
                </p>

                <!-- Uploaded Files Display -->
                <div v-if="day.images.length || day.document" class="pow-files-grid">
                  <button
                    v-for="img in day.images"
                    :key="img.id ?? img.path"
                    type="button"
                    class="pow-thumb-btn"
                    @click="previewAttachment = { file: img, date: day.date }"
                  >
                    <img :src="img.url" :alt="img.name" loading="lazy" />
                    <span>{{ img.name }}</span>
                  </button>

                  <button
                    v-if="day.document"
                    type="button"
                    class="pow-doc-btn"
                    @click="previewAttachment = { file: day.document, date: day.date }"
                  >
                    <FileText :size="18" />
                    <div>
                      <strong>{{ day.document.name }}</strong>
                      <small>{{ day.document.mime === 'application/pdf' ? 'PDF Document' : 'Image Document' }} · Click to preview</small>
                    </div>
                  </button>
                </div>

                <!-- Verification / Return Banner -->
                <p v-if="day.status === 'accepted'" class="pow-verified-banner">
                  <CheckCircle2 :size="14" />
                  <span>
                    Verified by {{ day.reviewed_by || 'Administrator' }}
                    <template v-if="day.reviewed_at">on {{ formatDateTime(day.reviewed_at) }}</template>
                    · Counted as Complete Attendance
                  </span>
                </p>
                <p v-if="day.remarks" class="pow-remarks-note" :class="day.status">
                  <strong>Admin Note:</strong> {{ day.remarks }}
                </p>
              </article>
            </div>
          </div>

          <EmployeeWfhProofModal
            v-model="proofModalOpen"
            :title="`Attach Proof of Work · ${formatDateWithWeekday(activeUploadDate)}`"
            :subtitle="`${selected.request_no} · Take a live photo or attach your Proof of Work images for Admin verification.`"
            submit-label="Submit Proof of Work"
            :saving="uploadSaving"
            :error-message="uploadError"
            @submit="submitDayModalUpload"
          />

          <!-- Reason Box -->
          <div class="detail-box">
            <div class="detail-box-head">
              <FileText :size="14" />
              <span>Reason for WFH</span>
            </div>
            <p class="detail-box-text">{{ selected.reason }}</p>
          </div>

          <!-- Admin Remarks Box -->
          <div v-if="selected.remarks" class="detail-box detail-remarks-box" :class="selected.status">
            <div class="detail-box-head">
              <MessageSquare :size="14" />
              <span>HR / Admin Remarks</span>
            </div>
            <p class="detail-box-text">{{ selected.remarks }}</p>
          </div>

          <div class="dialog-actions">
            <button type="button" @click="selected = null">Close</button>
            <button
              v-if="selected.status.toLowerCase() === 'pending'"
              type="button"
              class="primary"
              @click="editRequest(selected)"
            >
              Edit Request
            </button>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
/* Page spacing matches the other employee request pages (e.g. Time Log Correction) */
.wfh-page {
  max-width: 1660px;
  margin: 0 auto;
  color: var(--text-primary);
}

.header,
.panel-heading,
.dialog-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

h1 {
  margin: 0 0 7px;
  font-size: 27px;
  font-weight: 700;
  letter-spacing: -0.7px;
}

h2 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}

p {
  margin: 4px 0 0;
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.6;
}

.header {
  align-items: flex-start;
  margin-bottom: 22px;
}

.header p {
  margin: 0;
}

.error {
  margin: 0 0 15px;
  padding: 12px 15px;
  border-radius: 9px;
  background: var(--red-soft, #fee2e2);
  color: var(--red, #b91c1c);
}

.error button {
  margin-left: 8px;
  padding: 4px 10px;
}

/* Table card: no padding so the table runs edge to edge; the heading has its own padding */
.panel {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

button,
input,
textarea {
  font-family: inherit;
  font-size: 12px;
  color: var(--text-primary);
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 9px 12px;
}

button {
  font-weight: 600;
  cursor: pointer;
}

button:disabled {
  opacity: 0.5;
  cursor: default;
}

.primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

/* "New Request" link: same as the Time Log Correction "New Correction Request" button */
a.primary {
  min-height: 41px;
  padding: 10px 17px;
  border-radius: 9px;
  background: linear-gradient(135deg, #1f68f2, #2878ff);
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
}

.panel-heading {
  padding: 18px;
}

.panel-heading h2 {
  margin: 0 0 6px;
}

.panel-heading p {
  margin: 0;
  font-size: 12px;
  color: var(--text-secondary);
}

/* Status pill in the details dialog (the table has its own in WorkFromHomeTable) */
.status {
  text-transform: capitalize;
  border-radius: 6px;
  padding: 4px 9px;
  font-size: 11px;
  font-weight: 600;
  background: #eab30822;
  color: #d18b00;
}

.status.approved {
  background: #22c55e22;
  color: #16a34a;
}

.status.rejected {
  background: #ef444422;
  color: #ef4444;
}

.overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  backdrop-filter: blur(2px);
}

.dialog {
  width: min(980px, 95vw);
  max-height: 92vh;
  overflow-y: auto;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px 26px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
}

.breakdown-chips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 6px;
  margin-top: 8px;
}

.breakdown-chip {
  padding: 6px 8px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 10px;
  border: 1px solid var(--border);
}

.chip-work {
  background: rgba(16, 185, 129, 0.08);
  border-color: rgba(16, 185, 129, 0.2);
}

.chip-rest {
  background: rgba(245, 158, 11, 0.08);
  border-color: rgba(245, 158, 11, 0.2);
}

.chip-date-text {
  font-weight: 700;
  color: var(--text-primary);
}

.chip-day-name {
  color: var(--text-secondary);
}

.chip-type-tag {
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.chip-time-icon {
  flex-shrink: 0;
  opacity: 0.85;
}

.chip-work .chip-type-tag {
  color: #10b981;
}

.chip-rest .chip-type-tag {
  color: #f59e0b;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}

/* Request Details Modal Styles */
.detail-dialog {
  width: min(1140px, 95vw);
  max-height: 92vh;
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.detail-modal-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 26px;
  border-bottom: 1px solid var(--border);
}

.detail-eyebrow {
  margin: 0;
  color: var(--primary);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.8px;
}

.detail-modal-head h2 {
  margin: 4px 0;
  font-size: 18px;
  font-weight: 700;
}

.detail-subtitle {
  margin: 0;
  font-size: 12px;
  color: var(--text-muted);
}

.detail-head-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-lg {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 11px;
  border-radius: 999px;
  font-size: 11px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.close-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
}

.detail-modal-body {
  padding: 22px 26px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.detail-info-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.detail-info-card {
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card-soft);
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.detail-card-highlight {
  border-color: rgba(16, 185, 129, 0.3);
  background: rgba(16, 185, 129, 0.05);
}

.detail-card-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 500;
}

.detail-info-card strong {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
}

.detail-days-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.detail-rest-tag {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 5px;
  background: rgba(245, 158, 11, 0.14);
  color: #f59e0b;
}

.detail-code-tag {
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  margin-left: 4px;
  border-radius: 4px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-secondary);
}

.detail-decided-date {
  font-weight: 400;
  margin-left: 4px;
  color: var(--text-muted);
  font-size: 11px;
}

.detail-schedule-section {
  padding: 14px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--bg-card-soft);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-schedule-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.detail-schedule-title {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
}

.detail-schedule-toggles {
  display: flex;
  align-items: center;
  gap: 6px;
}

.detail-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 9px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 600;
}

.detail-calendar-wrap {
  margin-top: 2px;
}

.detail-box {
  padding: 13px 15px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--bg-card-soft);
}

.detail-box-head {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.detail-box-text {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-secondary);
  white-space: pre-wrap;
}

.detail-remarks-box.rejected {
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.06);
}

.detail-remarks-box.approved {
  border-color: rgba(16, 185, 129, 0.35);
  background: rgba(16, 185, 129, 0.06);
}

/* Proof of Work / Attendance Section */
.pow-section {
  padding: 15px;
  border-radius: 12px;
  border: 1px solid rgba(59, 130, 246, 0.28);
  background: rgba(59, 130, 246, 0.04);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.pow-section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.pow-section-title {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
}

.pow-section-subtitle {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--text-secondary);
}

.pow-progress-pills {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.pow-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 9px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
}

.pow-pill.verified {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.pow-pill.pending {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
}

.pow-pill.returned {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.pow-preview-card {
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pow-preview-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 12px;
}

.pow-preview-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pow-preview-actions a {
  color: var(--primary);
  font-weight: 600;
  text-decoration: none;
}

.pow-preview-img {
  max-height: 320px;
  width: 100%;
  object-fit: contain;
  border-radius: 8px;
  background: var(--bg-page);
}

.pow-pdf-frame {
  width: 100%;
  height: 360px;
  border: 1px solid var(--border);
  border-radius: 8px;
}

.pow-days-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 12px;
  align-items: stretch;
}

.pow-day-card {
  padding: 13px 15px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pow-day-card.accepted {
  border-color: rgba(16, 185, 129, 0.35);
}

.pow-day-card.returned {
  border-color: rgba(239, 68, 68, 0.35);
}

.pow-day-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.pow-day-date {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
}

.pow-day-meta {
  display: block;
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 2px;
}

.pow-day-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.pow-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  background: rgba(148, 163, 184, 0.14);
  color: var(--text-secondary);
}

.pow-status-badge.submitted {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
}

.pow-status-badge.accepted {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.pow-status-badge.returned {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.pow-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.pow-attach-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 7px;
  border: 1px solid var(--border);
  background: var(--bg-card-soft);
  color: var(--text-primary);
}

.pow-files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(125px, 1fr));
  gap: 8px;
}

.pow-thumb-btn {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 6px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg-card-soft);
  text-align: left;
  overflow: hidden;
}

.pow-thumb-btn img {
  width: 100%;
  height: 82px;
  object-fit: cover;
  border-radius: 5px;
}

.pow-thumb-btn span {
  font-size: 11px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pow-doc-btn {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg-card-soft);
  text-align: left;
}

.pow-doc-btn strong {
  display: block;
  font-size: 12px;
  color: var(--text-primary);
}

.pow-doc-btn small {
  font-size: 11px;
  color: var(--text-muted);
}

.pow-verified-banner {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 11px;
  border-radius: 8px;
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
  font-size: 12px;
  font-weight: 600;
}

.pow-remarks-note {
  margin: 0;
  padding: 8px 11px;
  border-radius: 8px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  font-size: 12px;
}

.pow-remarks-note.returned {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.pow-upload-form {
  padding-top: 10px;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pow-upload-error {
  margin: 0;
  padding: 8px 10px;
  border-radius: 7px;
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
  font-size: 12px;
}

.pow-upload-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.pow-file-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 11px;
  color: var(--text-secondary);
}

.pow-file-field input {
  padding: 7px;
  font-size: 11px;
}

.pow-file-field small {
  color: #10b981;
  font-weight: 600;
}

.pow-upload-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.pow-upload-actions .primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

@media (max-width: 640px) {
  .pow-upload-grid {
    grid-template-columns: 1fr;
  }
  .detail-info-grid {
    grid-template-columns: 1fr;
  }
  .detail-modal-head,
  .detail-modal-body {
    padding: 14px;
  }
  h1 {
    font-size: 22px;
    line-height: 1.3;
  }
  .header {
    gap: 14px;
  }
  .header .primary {
    width: 100%;
  }
  .panel-heading {
    align-items: flex-start;
    gap: 14px;
    padding: 14px;
  }
  .overlay {
    padding: 10px;
  }
  .dialog {
    padding: 16px;
    max-height: calc(100dvh - 20px);
  }
}
</style>
