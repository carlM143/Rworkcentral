<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ArrowLeft, Check, ClipboardList, FileText, RotateCcw, Upload } from 'lucide-vue-next'
import WfhModalShell from '~/components/admin/wfh/WfhModalShell.vue'
import WfhStatusPill from '~/components/admin/wfh/WfhStatusPill.vue'
import {
  useWfhDocumentApi, wfhErrorMessage,
  type WfhDay, type WfhDocumentRecord, type WfhFile,
} from '~/composables/admin/wfh/useWfhDocumentApi'
import {
  wfhDateText, wfhDateTimeText, wfhPeriodText, wfhWeekday,
} from '~/composables/admin/wfh/useWfhFormat'

type Mode = 'days' | 'upload' | 'request' | 'history' | 'preview' | 'decide'

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
  submitted: 'Submitted',
  accepted: 'Accepted',
  returned: 'Returned',
}

const api = useWfhDocumentApi()
const detail = ref<WfhDocumentRecord>(props.record)
const mode = ref<Mode>(props.initialMode)
const loading = ref(true)
const saving = ref(false)
const error = ref('')

const title = computed(() => ({
  days: 'Daily Proof of Work',
  upload: 'Attach WFH Document',
  request: 'WFH Request Details',
  history: 'Activity History',
  preview: 'Document Preview',
  decide: decision.value === 'accept' ? 'Accept WFH Day' : 'Return WFH Day',
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
    if (mode.value === 'upload') resetUpload()
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

// ---------- Upload ----------

const MAX_BYTES = 4 * 1024 * 1024
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const uploadDate = ref('')
const uploadImages = ref<File[]>([])
const uploadDocument = ref<File | null>(null)
const imageInput = ref<HTMLInputElement | null>(null)
const documentInput = ref<HTMLInputElement | null>(null)

const uploadableDays = computed(() => (detail.value.days ?? []).filter(d => d.status !== 'accepted'))

const resetUpload = (date?: string) => {
  uploadDate.value = date ?? uploadableDays.value[0]?.date ?? ''
  uploadImages.value = []
  uploadDocument.value = null
  error.value = ''
  if (imageInput.value) imageInput.value.value = ''
  if (documentInput.value) documentInput.value.value = ''
}

const startUpload = (date?: string) => {
  resetUpload(date)
  mode.value = 'upload'
}

const selectImages = (event: Event) => {
  const files = Array.from((event.target as HTMLInputElement).files ?? [])
  const invalid = files.find(f => !IMAGE_TYPES.includes(f.type) || f.size > MAX_BYTES)
  if (invalid) { error.value = `${invalid.name}: use JPG, PNG or WEBP up to 4 MB.`; uploadImages.value = []; return }
  if (files.length > 10) { error.value = 'Attach up to 10 images per day.'; uploadImages.value = []; return }
  error.value = ''
  uploadImages.value = files
}

const selectDocument = (event: Event) => {
  const picked = (event.target as HTMLInputElement).files?.[0] ?? null
  if (picked && (![...IMAGE_TYPES, 'application/pdf'].includes(picked.type) || picked.size > MAX_BYTES)) {
    error.value = `${picked.name}: use PDF, JPG, PNG or WEBP up to 4 MB.`
    uploadDocument.value = null
    return
  }
  error.value = ''
  uploadDocument.value = picked
}

const submitUpload = async () => {
  if (!uploadDate.value) { error.value = 'Choose the WFH date.'; return }
  if (!uploadImages.value.length && !uploadDocument.value) { error.value = 'Attach at least one image or a document.'; return }
  saving.value = true
  error.value = ''
  try {
    const response = await api.attach(detail.value.id, {
      date: uploadDate.value,
      images: uploadImages.value,
      document: uploadDocument.value,
    })
    applyUpdate(response.data, response.message)
    mode.value = 'days'
  } catch (err) {
    error.value = wfhErrorMessage(err, 'Upload failed. Try again.')
  } finally {
    saving.value = false
  }
}

// ---------- Accept / Return ----------

const decision = ref<'accept' | 'return'>('accept')
const decideDay = ref<WfhDay | null>(null)
const note = ref('')

const startDecision = (day: WfhDay, action: 'accept' | 'return') => {
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

// ---------- Preview ----------

const previewFile = ref<WfhFile | null>(null)
const previewDate = ref('')

const openPreview = (day: WfhDay, file: WfhFile) => {
  previewFile.value = file
  previewDate.value = day.date
  mode.value = 'preview'
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
    :busy="saving"
    @close="emit('close')"
  >
    <p v-if="loading" class="muted">Loading details...</p>

    <!-- DAYS -->
    <template v-else-if="mode === 'days'">
      <p v-if="!detail.has_schedule" class="review-note">
        This employee has no work schedule assigned, so every calendar day in the WFH period is listed.
      </p>

      <div v-for="day in detail.days" :key="day.date" class="day-card">
        <div class="day-top">
          <div>
            <strong>{{ wfhWeekday(day.date) }}, {{ wfhDateText(day.date) }}</strong>
            <small v-if="day.submitted_at">Submitted {{ wfhDateTimeText(day.submitted_at) }}</small>
            <small v-if="day.reviewed_at">{{ STATUS_LABELS[day.status] }} by {{ day.reviewed_by || '—' }} on {{ wfhDateTimeText(day.reviewed_at) }}</small>
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
            :aria-label="`Preview ${img.name}`"
            @click="openPreview(day, img)"
          >
            <img :src="img.url" :alt="`Proof of work for ${wfhDateText(day.date)}`" loading="lazy">
          </button>
          <button
            v-if="day.document"
            type="button"
            class="thumb"
            :class="{ 'doc-thumb': day.document.mime === 'application/pdf' }"
            :aria-label="`Preview ${day.document.name}`"
            @click="openPreview(day, day.document)"
          >
            <template v-if="day.document.mime === 'application/pdf'"><FileText :size="20" /><span>PDF</span></template>
            <img v-else :src="day.document.url" :alt="`Supporting document for ${wfhDateText(day.date)}`" loading="lazy">
          </button>
        </div>

        <div class="day-actions">
          <button v-if="day.status !== 'accepted'" class="btn ghost" @click="startUpload(day.date)">
            <Upload :size="14" /> Attach
          </button>
          <template v-if="day.status === 'submitted' && day.tracker_id">
            <button class="btn reject" @click="startDecision(day, 'return')"><RotateCcw :size="14" /> Return</button>
            <button class="btn approve" @click="startDecision(day, 'accept')"><Check :size="14" /> Accept</button>
          </template>
        </div>
      </div>

      <p v-if="!detail.days?.length" class="muted">No scheduled working days fall within this WFH period.</p>
    </template>

    <!-- UPLOAD -->
    <template v-else-if="mode === 'upload'">
      <template v-if="uploadableDays.length">
        <label for="wfh-date">WFH date</label>
        <select id="wfh-date" v-model="uploadDate">
          <option v-for="d in uploadableDays" :key="d.date" :value="d.date">
            {{ wfhWeekday(d.date) }}, {{ wfhDateText(d.date) }} ({{ STATUS_LABELS[d.status] }})
          </option>
        </select>

        <label for="wfh-images">Proof of work images (JPG, PNG, WEBP; up to 10, 4 MB each)</label>
        <input id="wfh-images" ref="imageInput" type="file" multiple accept=".jpg,.jpeg,.png,.webp" @change="selectImages">
        <p v-if="uploadImages.length" class="hint">{{ uploadImages.length }} image(s) selected</p>

        <label for="wfh-doc">Supporting document, optional (PDF or image, 4 MB)</label>
        <input id="wfh-doc" ref="documentInput" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" @change="selectDocument">

        <p class="hint">Attaching sends the day for HR review. A new document replaces the previous one; images are added.</p>
      </template>
      <p v-else class="muted">Every day in this request is already accepted.</p>

      <p v-if="error" class="error">{{ error }}</p>

      <div class="modal-actions">
        <button class="btn ghost" :disabled="saving" @click="backToDays"><ArrowLeft :size="15" /> Back to days</button>
        <button v-if="uploadableDays.length" class="btn primary" :disabled="saving" @click="submitUpload">
          <Upload :size="15" /> {{ saving ? 'Uploading...' : 'Attach and submit' }}
        </button>
      </div>
    </template>

    <!-- DECIDE -->
    <template v-else-if="mode === 'decide' && decideDay">
      <div class="review-note">
        {{ decision === 'accept' ? 'Accept' : 'Return' }} the proof of work for
        <strong>{{ wfhWeekday(decideDay.date) }}, {{ wfhDateText(decideDay.date) }}</strong>
        ({{ decideDay.images.length }} image(s){{ decideDay.document ? ', 1 document' : '' }}).
      </div>

      <label for="wfh-note">HR remarks {{ decision === 'return' ? '(required)' : '(optional)' }}</label>
      <textarea
        id="wfh-note"
        v-model="note"
        rows="4"
        :placeholder="decision === 'return' ? 'Explain what the employee needs to fix...' : 'Optional note'"
      />
      <p v-if="error" class="error">{{ error }}</p>

      <div class="modal-actions">
        <button class="btn ghost" :disabled="saving" @click="backToDays">Cancel</button>
        <button class="btn" :class="decision === 'accept' ? 'approve' : 'reject'" :disabled="saving" @click="submitDecision">
          {{ saving ? 'Saving...' : decision === 'accept' ? 'Accept day' : 'Return day' }}
        </button>
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

    <!-- PREVIEW -->
    <template v-else-if="mode === 'preview' && previewFile">
      <p class="muted">{{ previewFile.name }} · {{ wfhDateText(previewDate) }}</p>
      <iframe v-if="previewFile.mime === 'application/pdf'" class="preview-pdf" :src="previewFile.url" title="Document preview" />
      <img v-else class="preview-image" :src="previewFile.url" :alt="`Proof of work for ${wfhDateText(previewDate)}`">

      <div class="modal-actions">
        <a class="btn ghost" :href="previewFile.url" target="_blank" rel="noopener">Open in new tab</a>
        <button class="btn primary" @click="backToDays"><ArrowLeft :size="15" /> Back to days</button>
      </div>
    </template>

    <p v-if="error && !loading && mode !== 'upload' && mode !== 'decide'" class="error">{{ error }}</p>
  </WfhModalShell>
</template>

<style scoped>
.day-card {
  margin-bottom: 10px;
  padding: 14px;
  border: 1px solid var(--border, #29364d);
  border-radius: 10px;
  background: var(--bg-card-soft, #182438);
}

.day-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.day-top strong { display: block; font-size: 13px; }

.day-top small {
  display: block;
  margin-top: 4px;
  color: var(--text-muted, #7c8da8);
  font-size: 11px;
}

.day-remarks {
  margin: 10px 0 0;
  color: var(--text-secondary, #a2b0c6);
  font-size: 12px;
  line-height: 1.5;
}

.thumbs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.thumb {
  width: 72px;
  height: 72px;
  overflow: hidden;
  padding: 0;
  border: 1px solid var(--border, #29364d);
  border-radius: 8px;
  background: var(--bg-card, #131e30);
  cursor: zoom-in;
}

.thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  margin-top: 12px;
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
</style>