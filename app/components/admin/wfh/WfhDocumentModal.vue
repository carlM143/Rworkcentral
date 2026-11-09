<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  ArrowLeft,
  Check,
  ClipboardList,
  FileText,
  RotateCcw,
  CheckCircle2,
  Clock,
  ZoomIn,
  ZoomOut,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ExternalLink,
  CalendarDays,
  Paperclip,
  History,
  Info,
} from 'lucide-vue-next'
import WfhModalShell from '~/components/admin/wfh/WfhModalShell.vue'
import WfhStatusPill from '~/components/admin/wfh/WfhStatusPill.vue'
import {
  useWfhDocumentApi, wfhErrorMessage,
  type WfhDay, type WfhDocumentRecord, type WfhFile,
} from '~/composables/admin/wfh/useWfhDocumentApi'
import {
  wfhDateText, wfhDateTimeText, wfhPeriodText, wfhWeekday,
} from '~/composables/admin/wfh/useWfhFormat'

type Mode = 'days' | 'request' | 'history' | 'preview' | 'decide'

const props = withDefaults(defineProps<{
  record: WfhDocumentRecord
  initialMode?: Mode
}>(), {
  initialMode: 'days',
})

const emit = defineEmits<{
  close: []
  updated: [record: WfhDocumentRecord, message?: string]
}>()

const STATUS_LABELS: Record<string, string> = {
  not_submitted: 'Not Submitted',
  draft: 'Draft',
  submitted: 'Submitted (For Review)',
  accepted: 'Verified (Attendance)',
  returned: 'Returned to Employee',
}

const api = useWfhDocumentApi()
const detail = ref<WfhDocumentRecord>(props.record)
const mode = ref<Mode>(props.initialMode)
const loading = ref(true)
const saving = ref(false)
const error = ref('')

const title = computed(() => ({
  days: 'Verify Daily Proof of Work',
  request: 'WFH Request Details',
  history: 'Activity History',
  preview: 'Document Preview',
  decide: decision.value === 'accept' ? 'Verify WFH Day as Attendance' : 'Return WFH Day to Employee',
})[mode.value])

const subtitle = computed(() =>
  [detail.value.employee.name, detail.value.employee.department].filter(Boolean).join(' · '))

const applyUpdate = (record: WfhDocumentRecord, message?: string) => {
  detail.value = record
  emit('updated', record, message)
}

onMounted(async () => {
  try {
    const response = await api.show(props.record.id)
    applyUpdate(response.data)
  } catch (err) {
    error.value = wfhErrorMessage(err, 'Unable to load request details.')
  } finally {
    loading.value = false
  }
})

const backToDays = () => {
  error.value = ''
  mode.value = 'days'
}

// ---------- Verify (Accept) / Return ----------

const decision = ref<'accept' | 'return'>('accept')
const decideDay = ref<WfhDay | null>(null)
const note = ref('')

const startDecision = (day: WfhDay, action: 'accept' | 'return') => {
  closeLightbox()
  decideDay.value = day
  decision.value = action
  note.value = ''
  error.value = ''
  mode.value = 'decide'
}

const submitDecision = async () => {
  const trackerId = decideDay.value?.tracker_id
  if (!trackerId) return
  if (decision.value === 'return' && !note.value.trim()) { error.value = 'Enter the reason for returning this day.'; return }
  saving.value = true
  error.value = ''
  try {
    const response = decision.value === 'accept'
      ? await api.accept(trackerId, note.value.trim())
      : await api.returnDay(trackerId, note.value.trim())
    applyUpdate(response.data, response.message)
    mode.value = 'days'
  } catch (err) {
    error.value = wfhErrorMessage(err, 'Unable to save the review.')
  } finally {
    saving.value = false
  }
}

// ---------- Full-Screen Big Image Lightbox & PDF Preview ----------

const previewFile = ref<WfhFile | null>(null)
const previewDate = ref('')
const lightboxDay = ref<WfhDay | null>(null)
const lightboxFiles = ref<WfhFile[]>([])
const lightboxIndex = ref(0)
const lightboxOpen = ref(false)
const lightboxZoom = ref(1)

const currentLightboxFile = computed(() => lightboxFiles.value[lightboxIndex.value] ?? null)

const openPreview = (day: WfhDay, file: WfhFile) => {
  previewDate.value = day.date
  lightboxDay.value = day
  if (file.mime === 'application/pdf') {
    previewFile.value = file
    mode.value = 'preview'
    return
  }

  const allImages: WfhFile[] = [...day.images]
  if (day.document && day.document.mime === 'image') {
    allImages.push(day.document)
  }
  const idx = allImages.findIndex(f => f.path === file.path)
  lightboxFiles.value = allImages.length ? allImages : [file]
  lightboxIndex.value = idx >= 0 ? idx : 0
  lightboxZoom.value = 1
  lightboxOpen.value = true
}

const closeLightbox = () => {
  lightboxOpen.value = false
  lightboxZoom.value = 1
}

const prevLightboxImage = () => {
  if (lightboxFiles.value.length <= 1) return
  lightboxIndex.value = (lightboxIndex.value - 1 + lightboxFiles.value.length) % lightboxFiles.value.length
  lightboxZoom.value = 1
}

const nextLightboxImage = () => {
  if (lightboxFiles.value.length <= 1) return
  lightboxIndex.value = (lightboxIndex.value + 1) % lightboxFiles.value.length
  lightboxZoom.value = 1
}

const toggleLightboxZoom = () => {
  lightboxZoom.value = lightboxZoom.value > 1 ? 1 : 2
}

// ---------- History ----------

const history = computed(() => {
  const r = detail.value
  const events: { when: string, action: string, actor: string, notes: string }[] = []
  if (r.request_date) events.push({ when: r.request_date, action: 'Request filed', actor: r.employee.name, notes: r.reason })
  if (r.approved_at) events.push({ when: r.approved_at, action: 'Request approved', actor: r.approved_by ?? '—', notes: r.remarks ?? '' })
  for (const day of r.days ?? []) {
    if (day.submitted_at) events.push({ when: day.submitted_at, action: `Proof submitted for ${wfhDateText(day.date)}`, actor: r.employee.name, notes: '' })
    if (day.reviewed_at) events.push({ when: day.reviewed_at, action: `${STATUS_LABELS[day.status]} ${wfhDateText(day.date)}`, actor: day.reviewed_by ?? '—', notes: day.remarks ?? '' })
  }
  return events.sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime())
})
</script>

<template>
  <WfhModalShell
    :eyebrow="detail.request_no"
    :title="title"
    :subtitle="subtitle"
    :busy="saving || lightboxOpen"
    @close="emit('close')"
  >
    <!-- Top Web Toolbar: Summary Metrics + View Switcher Tabs -->
    <div class="web-modal-toolbar">
      <div class="toolbar-metrics">
        <span class="metric-chip">
          <CalendarDays :size="13" />
          <strong>{{ wfhPeriodText(detail.start_date, detail.end_date) }}</strong>
        </span>
        <span class="metric-chip verified">
          <CheckCircle2 :size="13" />
          <strong>{{ detail.counts?.accepted ?? 0 }} / {{ detail.counts?.expected ?? detail.number_of_days }} Verified</strong>
        </span>
        <span v-if="(detail.counts?.submitted ?? 0) > 0" class="metric-chip pending">
          <Clock :size="13" />
          <strong>{{ detail.counts.submitted }} For Review</strong>
        </span>
        <span class="metric-chip">
          <Paperclip :size="13" />
          <strong>{{ detail.counts?.attachments ?? 0 }} Attachment(s)</strong>
        </span>
      </div>

      <div class="toolbar-tabs">
        <button
          type="button"
          class="tab-btn"
          :class="{ active: mode === 'days' || mode === 'decide' }"
          @click="mode = 'days'"
        >
          <ClipboardList :size="14" />
          <span>Proof of Work Days</span>
        </button>
        <button
          type="button"
          class="tab-btn"
          :class="{ active: mode === 'request' }"
          @click="mode = 'request'"
        >
          <Info :size="14" />
          <span>Request Info</span>
        </button>
        <button
          type="button"
          class="tab-btn"
          :class="{ active: mode === 'history' }"
          @click="mode = 'history'"
        >
          <History :size="14" />
          <span>History</span>
        </button>
      </div>
    </div>

    <p v-if="loading" class="muted">Loading details...</p>

    <!-- DAYS (Multi-Column Web Grid) -->
    <template v-else-if="mode === 'days'">
      <p v-if="!detail.has_schedule" class="review-note">
        This employee has no work schedule assigned, so every calendar day in the WFH period is listed.
      </p>

      <div v-if="detail.days?.length" class="days-web-grid">
        <div v-for="day in detail.days" :key="day.date" class="day-card" :class="day.status">
          <div class="day-top">
            <div>
              <strong>{{ wfhWeekday(day.date) }}, {{ wfhDateText(day.date) }}</strong>
              <small v-if="day.submitted_at">Submitted {{ wfhDateTimeText(day.submitted_at) }}</small>
              <small v-if="day.reviewed_at">{{ STATUS_LABELS[day.status] }} by {{ day.reviewed_by || '—' }}</small>
            </div>
            <WfhStatusPill :status="day.status" :label="STATUS_LABELS[day.status] ?? day.status" />
          </div>

          <p v-if="day.remarks" class="day-remarks">HR remarks: {{ day.remarks }}</p>

          <div v-if="day.images.length || day.document" class="thumbs">
            <button
              v-for="img in day.images"
              :key="img.path"
              type="button"
              class="thumb"
              :aria-label="`Enlarge ${img.name}`"
              title="Click to enlarge image"
              @click="openPreview(day, img)"
            >
              <img :src="img.url" :alt="`Proof of work for ${wfhDateText(day.date)}`">
              <span class="thumb-zoom-hint">
                <Maximize2 :size="13" />
              </span>
            </button>
            <button
              v-if="day.document"
              type="button"
              class="thumb"
              :class="{ 'doc-thumb': day.document.mime === 'application/pdf' }"
              :aria-label="`Preview ${day.document.name}`"
              title="Click to preview document"
              @click="openPreview(day, day.document)"
            >
              <template v-if="day.document.mime === 'application/pdf'"><FileText :size="20" /><span>PDF</span></template>
              <template v-else>
                <img :src="day.document.url" :alt="`Supporting document for ${wfhDateText(day.date)}`">
                <span class="thumb-zoom-hint">
                  <Maximize2 :size="13" />
                </span>
              </template>
            </button>
          </div>

          <div v-else class="awaiting-upload-note">
            <Clock :size="13" />
            <span>Waiting for employee to attach proof of work.</span>
          </div>

          <div v-if="day.status === 'submitted' && day.tracker_id" class="day-actions">
            <button class="btn reject" @click="startDecision(day, 'return')">
              <RotateCcw :size="14" /> Return
            </button>
            <button class="btn approve" @click="startDecision(day, 'accept')">
              <Check :size="14" /> Verify as Attendance
            </button>
          </div>

          <div v-else-if="day.status === 'accepted'" class="verified-attendance-badge">
            <CheckCircle2 :size="13" />
            <span>Verified · Counted as complete attendance</span>
          </div>
        </div>
      </div>

      <p v-else class="muted">No scheduled working days fall within this WFH period.</p>
    </template>

    <!-- DECIDE -->
    <template v-else-if="mode === 'decide' && decideDay">
      <div class="decide-split-layout">
        <div class="decide-left">
          <div class="review-note">
            <template v-if="decision === 'accept'">
              Verify the proof of work submitted by <strong>{{ detail.employee.name }}</strong> for
              <strong>{{ wfhWeekday(decideDay.date) }}, {{ wfhDateText(decideDay.date) }}</strong>
              ({{ decideDay.images.length }} image(s){{ decideDay.document ? ', 1 document' : '' }}).
              Once verified, this day will be <strong>counted and recorded as complete attendance</strong> in Timekeeping.
            </template>
            <template v-else>
              Return the proof of work for
              <strong>{{ wfhWeekday(decideDay.date) }}, {{ wfhDateText(decideDay.date) }}</strong>
              ({{ decideDay.images.length }} image(s){{ decideDay.document ? ', 1 document' : '' }}) back to the employee for resubmission.
            </template>
          </div>

          <label for="wfh-note">HR remarks {{ decision === 'return' ? '(required)' : '(optional)' }}</label>
          <textarea
            id="wfh-note"
            v-model="note"
            rows="4"
            :placeholder="decision === 'return' ? 'Explain what the employee needs to fix or re-upload...' : 'Optional verification note'"
          />
          <p v-if="error" class="error">{{ error }}</p>

          <div class="modal-actions">
            <button class="btn ghost" :disabled="saving" @click="backToDays">Cancel</button>
            <button class="btn" :class="decision === 'accept' ? 'approve' : 'reject'" :disabled="saving" @click="submitDecision">
              {{ saving ? 'Saving...' : decision === 'accept' ? 'Verify & Record Attendance' : 'Return Day' }}
            </button>
          </div>
        </div>

        <div v-if="decideDay.images.length || decideDay.document" class="decide-right">
          <h4>Submitted Proof of Work (Click to Enlarge)</h4>
          <div class="decide-preview-grid">
            <button
              v-for="img in decideDay.images"
              :key="img.path"
              type="button"
              class="decide-preview-card"
              title="Click to enlarge image"
              @click="openPreview(decideDay, img)"
            >
              <img :src="img.url" :alt="img.name">
              <span class="thumb-zoom-hint"><Maximize2 :size="13" /></span>
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- REQUEST -->
    <template v-else-if="mode === 'request'">
      <div class="info-grid">
        <div><small>Employee No.</small><strong>{{ detail.employee.emp_id }}</strong></div>
        <div><small>Position</small><strong>{{ detail.employee.position || '—' }}</strong></div>
        <div><small>WFH Period</small><strong>{{ wfhPeriodText(detail.start_date, detail.end_date) }}</strong></div>
        <div><small>Number of Days</small><strong>{{ detail.number_of_days }}</strong></div>
        <div><small>Supervisor</small><strong>{{ detail.supervisor_name }}</strong></div>
        <div><small>Work Schedule</small><strong>{{ detail.employee.work_schedule || 'Not assigned' }}</strong></div>
        <div><small>Approved By</small><strong>{{ detail.approved_by || '—' }}</strong></div>
        <div><small>Approved On</small><strong>{{ wfhDateText(detail.approved_at) }}</strong></div>
      </div>

      <h3>Reason for WFH</h3>
      <p class="detail-text">{{ detail.reason }}</p>

      <template v-if="detail.remarks">
        <h3>Remarks</h3>
        <p class="detail-text">{{ detail.remarks }}</p>
      </template>

      <div class="modal-actions">
        <button class="btn primary" @click="backToDays"><ClipboardList :size="15" /> Review days</button>
      </div>
    </template>

    <!-- HISTORY -->
    <template v-else-if="mode === 'history'">
      <div v-for="(h, i) in history" :key="i" class="timeline">
        <strong>{{ h.action }}</strong>
        <p>{{ h.when.length === 10 ? wfhDateText(h.when) : wfhDateTimeText(h.when) }} · {{ h.actor }}</p>
        <small v-if="h.notes">{{ h.notes }}</small>
      </div>
      <p v-if="!history.length" class="muted">No activity recorded yet.</p>
    </template>

    <!-- PREVIEW (PDF) -->
    <template v-else-if="mode === 'preview' && previewFile">
      <p class="muted">{{ previewFile.name }} · {{ wfhDateText(previewDate) }}</p>
      <iframe v-if="previewFile.mime === 'application/pdf'" class="preview-pdf" :src="previewFile.public_url || previewFile.url" title="Document preview" />
      <img v-else class="preview-image" :src="previewFile.url" :alt="`Proof of work for ${wfhDateText(previewDate)}`">

      <div class="modal-actions">
        <a class="btn ghost" :href="previewFile.public_url || previewFile.url" target="_blank" rel="noopener">Open in new tab</a>
        <button class="btn primary" @click="backToDays"><ArrowLeft :size="15" /> Back to days</button>
      </div>
    </template>

    <p v-if="error && !loading && mode !== 'decide'" class="error">{{ error }}</p>

    <!-- Full-Screen Big Image Lightbox -->
    <Teleport to="body">
      <div
        v-if="lightboxOpen && currentLightboxFile"
        class="wfh-lightbox-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Proof of work full-size image viewer"
        @click.self="closeLightbox"
      >
        <header class="wfh-lightbox-topbar">
          <div class="wfh-lightbox-meta">
            <strong>{{ detail.employee.name }} · {{ wfhWeekday(previewDate) }}, {{ wfhDateText(previewDate) }}</strong>
            <span>{{ currentLightboxFile.name }} ({{ lightboxIndex + 1 }} of {{ lightboxFiles.length }})</span>
          </div>

          <div class="wfh-lightbox-controls">
            <template v-if="lightboxDay?.status === 'submitted' && lightboxDay.tracker_id">
              <button type="button" class="lb-action-btn reject" @click="startDecision(lightboxDay, 'return')">
                <RotateCcw :size="14" /> Return Day
              </button>
              <button type="button" class="lb-action-btn approve" @click="startDecision(lightboxDay, 'accept')">
                <Check :size="14" /> Verify as Attendance
              </button>
            </template>
            <button
              type="button"
              class="lb-btn"
              title="Zoom Out"
              :disabled="lightboxZoom <= 1"
              @click="lightboxZoom = Math.max(1, Number((lightboxZoom - 0.5).toFixed(1)))"
            >
              <ZoomOut :size="16" />
            </button>
            <span class="lb-zoom-text">{{ Math.round(lightboxZoom * 100) }}%</span>
            <button
              type="button"
              class="lb-btn"
              title="Zoom In"
              :disabled="lightboxZoom >= 3"
              @click="lightboxZoom = Math.min(3, Number((lightboxZoom + 0.5).toFixed(1)))"
            >
              <ZoomIn :size="16" />
            </button>
            <a
              :href="currentLightboxFile.public_url || currentLightboxFile.url"
              target="_blank"
              rel="noopener noreferrer"
              class="lb-btn"
              title="Open original in new tab"
            >
              <ExternalLink :size="16" />
            </a>
            <button type="button" class="lb-btn lb-close" title="Close full-screen preview" @click="closeLightbox">
              <X :size="18" />
            </button>
          </div>
        </header>

        <div class="wfh-lightbox-stage" @click.self="closeLightbox">
          <button
            v-if="lightboxFiles.length > 1"
            type="button"
            class="lb-nav lb-prev"
            aria-label="Previous image"
            @click.stop="prevLightboxImage"
          >
            <ChevronLeft :size="24" />
          </button>

          <div class="wfh-lightbox-img-wrap">
            <img
              :src="currentLightboxFile.url"
              :alt="currentLightboxFile.name"
              class="wfh-lightbox-img"
              :style="{ transform: `scale(${lightboxZoom})` }"
              @click.stop="toggleLightboxZoom"
            >
          </div>

          <button
            v-if="lightboxFiles.length > 1"
            type="button"
            class="lb-nav lb-next"
            aria-label="Next image"
            @click.stop="nextLightboxImage"
          >
            <ChevronRight :size="24" />
          </button>
        </div>
      </div>
    </Teleport>
  </WfhModalShell>
</template>

<style scoped>
.web-modal-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding-bottom: 14px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--border, #29364d);
}

.toolbar-metrics {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.metric-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 11px;
  border-radius: 8px;
  border: 1px solid var(--border, #29364d);
  background: var(--bg-card-soft, #182438);
  color: var(--text-secondary, #a2b0c6);
  font-size: 12px;
}

.metric-chip strong {
  color: var(--text-primary, #f8fafc);
  font-weight: 600;
}

.metric-chip.verified {
  border-color: rgba(16, 185, 129, 0.35);
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.metric-chip.verified strong {
  color: #10b981;
}

.metric-chip.pending {
  border-color: rgba(50, 123, 255, 0.35);
  background: rgba(50, 123, 255, 0.12);
  color: #60a5fa;
}

.metric-chip.pending strong {
  color: #60a5fa;
}

.toolbar-tabs {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border-radius: 9px;
  border: 1px solid var(--border, #29364d);
  background: var(--bg-card-soft, #182438);
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--text-secondary, #a2b0c6);
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.tab-btn.active {
  background: var(--primary, #327bff);
  color: #ffffff;
}

.days-web-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
  gap: 12px;
}

.day-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 14px;
  border: 1px solid var(--border, #29364d);
  border-radius: 11px;
  background: var(--bg-card-soft, #182438);
  gap: 10px;
}

.day-card.accepted {
  border-color: rgba(16, 185, 129, 0.35);
  background: rgba(16, 185, 129, 0.05);
}

.day-card.submitted {
  border-color: rgba(50, 123, 255, 0.45);
  background: rgba(50, 123, 255, 0.06);
}

.day-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.day-top strong { display: block; font-size: 13.5px; }

.day-top small {
  display: block;
  margin-top: 3px;
  color: var(--text-muted, #7c8da8);
  font-size: 11px;
}

.day-remarks {
  margin: 0;
  color: var(--text-secondary, #a2b0c6);
  font-size: 12px;
  line-height: 1.5;
}

.awaiting-upload-note {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  color: var(--text-muted, #7c8da8);
}

.verified-attendance-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 6px;
  background: rgba(16, 185, 129, 0.14);
  color: #10b981;
  font-size: 11px;
  font-weight: 600;
}

.thumbs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.thumb {
  position: relative;
  width: 110px;
  height: 82px;
  overflow: hidden;
  padding: 0;
  border: 1px solid var(--border, #29364d);
  border-radius: 9px;
  background: var(--bg-card, #131e30);
  cursor: zoom-in;
  transition: transform 0.15s ease, border-color 0.15s ease;
}

.thumb:hover {
  transform: translateY(-1px);
  border-color: var(--primary, #327bff);
}

.thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-zoom-hint {
  position: absolute;
  right: 5px;
  bottom: 5px;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: rgba(15, 23, 42, 0.78);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.thumb:focus-visible { outline: 2px solid var(--primary, #327bff); outline-offset: 2px; }

.doc-thumb {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: var(--primary, #327bff);
  font-size: 10px;
  font-weight: 700;
}

.day-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
  margin-top: auto;
  padding-top: 6px;
}

/* Decide Split Layout */
.decide-split-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.decide-right {
  padding: 14px;
  border-radius: 10px;
  border: 1px solid var(--border, #29364d);
  background: var(--bg-card-soft, #182438);
}

.decide-right h4 {
  margin: 0 0 10px;
  font-size: 12.5px;
  color: var(--text-secondary, #a2b0c6);
}

.decide-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 10px;
}

.decide-preview-card {
  position: relative;
  height: 140px;
  padding: 0;
  border-radius: 9px;
  overflow: hidden;
  border: 1px solid var(--border, #29364d);
  background: var(--bg-card, #131e30);
  cursor: zoom-in;
}

.decide-preview-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.preview-image {
  display: block;
  max-width: 100%;
  max-height: 62vh;
  margin: auto;
  border-radius: 6px;
}

.preview-pdf {
  width: 100%;
  height: 60vh;
  border: 0;
}

/* Full-screen Big Image Lightbox */
.wfh-lightbox-overlay {
  position: fixed;
  inset: 0;
  z-index: 25000;
  background: rgba(8, 13, 24, 0.94);
  backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
}

.wfh-lightbox-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 14px 22px;
  background: rgba(15, 23, 42, 0.88);
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  color: #f8fafc;
}

.wfh-lightbox-meta strong {
  display: block;
  font-size: 14px;
}

.wfh-lightbox-meta span {
  display: block;
  font-size: 11.5px;
  color: #94a3b8;
  margin-top: 2px;
}

.wfh-lightbox-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.lb-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  padding: 0 12px;
  border-radius: 8px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.lb-action-btn.approve {
  background: #124d34;
  border: 1px solid #1c6b49;
  color: #76ffb9;
}

.lb-action-btn.reject {
  background: #52212b;
  border: 1px solid #7a2f3c;
  color: #ffabb1;
}

.lb-zoom-text {
  min-width: 44px;
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  color: #e2e8f0;
}

.lb-btn {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(30, 41, 59, 0.85);
  color: #f8fafc;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  text-decoration: none;
}

.lb-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.lb-close {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.45);
  color: #fca5a5;
}

.wfh-lightbox-stage {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  padding: 24px;
}

.wfh-lightbox-img-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 92vw;
  max-height: 82vh;
}

.wfh-lightbox-img {
  max-width: 90vw;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 10px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.65);
  cursor: zoom-in;
  transition: transform 0.2s ease;
}

.lb-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: rgba(15, 23, 42, 0.82);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
}

.lb-prev { left: 20px; }
.lb-next { right: 20px; }

@media (max-width: 760px) {
  .decide-split-layout {
    grid-template-columns: 1fr;
  }
}
</style>
