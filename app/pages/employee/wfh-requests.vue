<script setup lang="ts">
import {
  House,
  Plus,
  X,
  CalendarDays,
  CalendarCheck2,
  Clock,
  Info,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  UserCheck,
  FileText,
  MessageSquare,
  Upload,
  Paperclip,
  Camera,
} from 'lucide-vue-next'
import EmployeeLeaveDateCalendar from '~/components/employee/EmployeeLeaveDateCalendar.vue'
import EmployeeWfhProofModal from '~/components/employee/EmployeeWfhProofModal.vue'

definePageMeta({ layout: false, middleware: 'employee' })

interface DateBreakdownItem {
  date: string
  day_name: string
  is_working_day: boolean
  schedule_time?: string | null
}

interface WfhFileItem {
  id?: number
  path: string
  url: string
  name: string
  mime: 'image' | 'application/pdf'
}

interface WfhDayTracker {
  date: string
  tracker_id: number | null
  status: 'not_submitted' | 'draft' | 'submitted' | 'accepted' | 'returned'
  remarks: string | null
  submitted_at: string | null
  reviewed_at: string | null
  reviewed_by: string | null
  document: WfhFileItem | null
  images: WfhFileItem[]
}

interface WfhRequest {
  id: number
  request_no: string
  start_date: string
  end_date: string
  number_of_days: number
  calendar_days?: number
  working_dates?: string[]
  breakdown?: DateBreakdownItem[]
  schedule_name?: string | null
  schedule_code?: string | null
  working_days?: string[]
  rest_days?: string[]
  supervisor_name: string
  reason: string
  request_date: string
  status: string
  remarks: string | null
  approved_by?: string | null
  approved_at?: string | null
  document_status?: string
  counts?: {
    expected: number
    not_submitted: number
    submitted: number
    accepted: number
    returned: number
    attachments: number
  }
  days?: WfhDayTracker[]
}

interface ScheduleData {
  schedule_id: number | null
  schedule_name: string | null
  schedule_code: string | null
  working_days: string[]
  rest_days: string[]
}

const { $api } = useNuxtApp()
const { success } = useToast()

const records = ref<WfhRequest[]>([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const formError = ref('')
const formOpen = ref(false)
const selected = ref<WfhRequest | null>(null)
const detailShowCalendar = ref(false)
const detailShowBreakdown = ref(true)

// Employee daily proof-of-work attachment state
const MAX_BYTES = 4 * 1024 * 1024
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const DAY_STATUS_LABELS: Record<string, string> = {
  not_submitted: 'Not Submitted',
  draft: 'Draft',
  submitted: 'Submitted (Pending Verification)',
  accepted: 'Verified (Attendance Recorded)',
  returned: 'Returned (Resubmit)',
}

const activeUploadDate = ref<string | null>(null)
const uploadImages = ref<File[]>([])
const uploadDocument = ref<File | null>(null)
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
  uploadImages.value = []
  uploadDocument.value = null
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
  uploadImages.value = []
  uploadDocument.value = null
  uploadError.value = ''
}

const submitDayModalUpload = async (payload: { images: File[]; document: File | null }) => {
  if (!selected.value || !activeUploadDate.value) return
  uploadImages.value = payload.images
  uploadDocument.value = payload.document
  await submitDayUpload(activeUploadDate.value)
}

const selectDayImages = (event: Event) => {
  const files = Array.from((event.target as HTMLInputElement).files ?? [])
  const invalid = files.find(f => !IMAGE_TYPES.includes(f.type) || f.size > MAX_BYTES)
  if (invalid) {
    uploadError.value = `${invalid.name}: use JPG, PNG or WEBP up to 4 MB.`
    uploadImages.value = []
    return
  }
  if (files.length > 10) {
    uploadError.value = 'Attach up to 10 images per day.'
    uploadImages.value = []
    return
  }
  uploadError.value = ''
  uploadImages.value = files
}

const selectDayDocument = (event: Event) => {
  const picked = (event.target as HTMLInputElement).files?.[0] ?? null
  if (picked && (![...IMAGE_TYPES, 'application/pdf'].includes(picked.type) || picked.size > MAX_BYTES)) {
    uploadError.value = `${picked.name}: use PDF, JPG, PNG or WEBP up to 4 MB.`
    uploadDocument.value = null
    return
  }
  uploadError.value = ''
  uploadDocument.value = picked
}

const submitDayUpload = async (date: string) => {
  if (!selected.value) return
  if (!uploadImages.value.length && !uploadDocument.value) {
    uploadError.value = 'Attach at least one image or a supporting document.'
    return
  }

  uploadSaving.value = true
  uploadError.value = ''

  try {
    const body = new FormData()
    body.append('date_attendance', date)
    for (const img of uploadImages.value) {
      body.append('images[]', img)
    }
    if (uploadDocument.value) {
      body.append('document', uploadDocument.value)
    }

    await $api(`/employee/wfh-requests/${selected.value.id}/days`, {
      method: 'POST',
      body,
    })

    activeUploadDate.value = null
    uploadImages.value = []
    uploadDocument.value = null
    success('Proof of Work Submitted', 'Your attachments have been submitted for Admin attendance verification.')
    await load()
    const refreshed = records.value.find(r => r.id === selected.value?.id)
    if (refreshed) selected.value = refreshed
  } catch (problem: any) {
    uploadError.value = String(
      Object.values(problem?.data?.errors ?? {}).flat()[0] ||
      problem?.data?.message ||
      'Unable to upload proof of work.'
    )
  } finally {
    uploadSaving.value = false
  }
}

// Work schedule & preview
const scheduleData = ref<ScheduleData | null>(null)
const loadingSchedule = ref(false)
const showBreakdown = ref(false)
const previewDays = ref<number | null>(null)
const calendarDaysCount = ref<number | null>(null)
const previewBreakdown = ref<DateBreakdownItem[]>([])
const previewLoading = ref(false)

const form = reactive({
  start_date: '',
  end_date: '',
  supervisor_name: '',
  reason: '',
})

// JavaScript weekday indexes: Sun=0, Mon=1, ..., Sat=6
const weekdayIndexes: Record<string, number> = {
  sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
}

const toWeekdayIndex = (day: unknown): number | null => {
  if (typeof day !== 'string') return null
  const key = day.trim().toLowerCase().replace(/[^a-z]/g, '').slice(0, 3)
  return weekdayIndexes[key] ?? null
}

const restDayIndexes = computed<number[]>(() => {
  if (!scheduleData.value?.rest_days?.length) return []
  return scheduleData.value.rest_days
    .map(d => toWeekdayIndex(d))
    .filter((d): d is number => d !== null)
})

const excludedRestDaysCount = computed(() => {
  if (calendarDaysCount.value === null || previewDays.value === null) return 0
  return Math.max(0, calendarDaysCount.value - previewDays.value)
})

const loadSchedule = async () => {
  loadingSchedule.value = true
  try {
    const res = await $api<{ success: boolean; data: ScheduleData }>('/employee/wfh-requests/schedule')
    if (res?.data) {
      scheduleData.value = res.data
    }
  } catch (err) {
    console.warn('Could not load work schedule', err)
  } finally {
    loadingSchedule.value = false
  }
}

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    records.value = (await $api<{ data: WfhRequest[] }>('/employee/wfh-requests')).data
  } catch (problem: any) {
    error.value = problem?.data?.message || 'Unable to load work-from-home requests.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  load()
  loadSchedule()
})

const openForm = () => {
  Object.assign(form, { start_date: '', end_date: '', supervisor_name: '', reason: '' })
  previewDays.value = null
  calendarDaysCount.value = null
  previewBreakdown.value = []
  formError.value = ''
  showBreakdown.value = false
  formOpen.value = true
  if (!scheduleData.value) {
    loadSchedule()
  }
}

let previewVersion = 0
watch([() => form.start_date, () => form.end_date], async ([start, end]) => {
  const version = ++previewVersion
  previewDays.value = null
  calendarDaysCount.value = null
  previewBreakdown.value = []
  formError.value = ''

  if (!start || !end || end < start) {
    previewLoading.value = false
    return
  }

  previewLoading.value = true
  try {
    const response = await $api<{
      data: {
        number_of_days: number
        calendar_days?: number
        working_dates?: string[]
        breakdown?: DateBreakdownItem[]
        schedule_name?: string
        schedule_code?: string
        working_days?: string[]
        rest_days?: string[]
      }
    }>('/employee/wfh-requests/preview', {
      method: 'POST',
      body: { start_date: start, end_date: end },
    })

    if (version === previewVersion) {
      previewDays.value = response.data.number_of_days
      calendarDaysCount.value = response.data.calendar_days ?? null
      previewBreakdown.value = response.data.breakdown ?? []

      if (response.data.schedule_name && !scheduleData.value?.schedule_name) {
        scheduleData.value = {
          schedule_id: null,
          schedule_name: response.data.schedule_name,
          schedule_code: response.data.schedule_code ?? null,
          working_days: response.data.working_days ?? [],
          rest_days: response.data.rest_days ?? [],
        }
      }
    }
  } catch (problem: any) {
    if (version === previewVersion) {
      formError.value = String(
        Object.values(problem?.data?.errors ?? {}).flat()[0] ||
        problem?.data?.message ||
        'Unable to calculate scheduled days.'
      )
    }
  } finally {
    if (version === previewVersion) previewLoading.value = false
  }
})

const submit = async () => {
  if (previewLoading.value || previewDays.value === null || previewDays.value <= 0) {
    formError.value = 'Select a valid date range with scheduled working days.'
    return
  }
  saving.value = true
  formError.value = ''
  try {
    await $api('/employee/wfh-requests', {
      method: 'POST',
      body: {
        ...form,
        supervisor_name: form.supervisor_name.trim(),
        reason: form.reason.trim(),
      },
    })
    formOpen.value = false
    success('Request Submitted', 'Your work-from-home request is pending admin approval.')
    await load()
  } catch (problem: any) {
    formError.value = String(
      Object.values(problem?.data?.errors ?? {}).flat()[0] ||
      problem?.data?.message ||
      'Unable to submit request.'
    )
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="wfh-page">
    <header class="header">
      <div>
        <h1>Work From Home</h1>
        <p>Submit and track your work-from-home requests.</p>
      </div>
      <button type="button" class="primary" @click="openForm">
        <Plus :size="16" /> New Request
      </button>
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

      <p v-if="loading" role="status">Loading requests…</p>
      <p v-else-if="!error && !records.length">No work-from-home requests yet.</p>
      <template v-else-if="!error">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Request</th>
                <th>Dates</th>
                <th>Days</th>
                <th>Supervisor</th>
                <th>Status</th>
                <th>Proof of Work</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in records" :key="record.id">
                <td><strong>{{ record.request_no }}</strong></td>
                <td>{{ formatPeriod(record.start_date, record.end_date) }}</td>
                <td>{{ record.number_of_days }} {{ record.number_of_days === 1 ? 'day' : 'days' }}</td>
                <td>{{ record.supervisor_name }}</td>
                <td><span class="status" :class="record.status">{{ record.status }}</span></td>
                <td>
                  <span v-if="record.status === 'approved' && record.counts" class="pow-summary-badge" :class="record.document_status">
                    <CheckCircle2 v-if="record.document_status === 'complete'" :size="12" />
                    <Paperclip v-else :size="12" />
                    {{ record.counts.accepted }}/{{ record.counts.expected }} verified
                  </span>
                  <span v-else class="pow-summary-muted">—</span>
                </td>
                <td>
                  <button type="button" @click="openDetail(record)">
                    {{ record.status === 'approved' ? 'Details / Attach' : 'Details' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mobile-requests">
          <button
            v-for="record in records"
            :key="record.id"
            type="button"
            class="request-card"
            :aria-label="`View ${record.request_no} details`"
            @click="openDetail(record)"
          >
            <span class="request-card-header">
              <strong>{{ record.request_no }}</strong>
              <span class="status" :class="record.status">{{ record.status }}</span>
            </span>
            <span class="request-card-dates">{{ formatPeriod(record.start_date, record.end_date) }}</span>
            <span class="request-card-meta">
              {{ record.number_of_days }} {{ record.number_of_days === 1 ? 'day' : 'days' }} · {{ record.supervisor_name }}
              <template v-if="record.status === 'approved' && record.counts">
                · {{ record.counts.accepted }}/{{ record.counts.expected }} verified
              </template>
            </span>
            <span class="request-card-link">
              {{ record.status === 'approved' ? 'View details & attach proof →' : 'View details →' }}
            </span>
          </button>
        </div>
      </template>
    </div>

    <!-- New WFH Request Dialog with Interactive Calendar and Schedule Validation -->
    <div v-if="formOpen" class="overlay" @click.self="!saving && (formOpen = false)">
      <form class="dialog wfh-dialog" role="dialog" aria-modal="true" aria-labelledby="wfh-title" @submit.prevent="submit">
        <div class="dialog-heading">
          <h2 id="wfh-title"><House :size="18" /> New Work-from-Home Request</h2>
          <button type="button" aria-label="Close" :disabled="saving" @click="formOpen = false">
            <X :size="20" />
          </button>
        </div>

        <p v-if="formError" class="error-banner" role="alert">
          <AlertCircle :size="16" />
          <span>{{ formError }}</span>
        </p>

        <fieldset :disabled="saving" class="wfh-form-fields">
          <!-- Employee Work Schedule Info Card -->
          <div class="schedule-info-card">
            <div class="schedule-info-header">
              <div class="schedule-title-block">
                <Clock :size="15" class="schedule-icon" />
                <span class="schedule-title">
                  {{ scheduleData?.schedule_name || scheduleData?.schedule_code || 'Standard Work Schedule' }}
                </span>
                <span v-if="scheduleData?.schedule_code" class="schedule-code-pill">
                  {{ scheduleData.schedule_code }}
                </span>
              </div>
              <span class="schedule-verified-badge">
                <CalendarCheck2 :size="12" /> Schedule Checked
              </span>
            </div>

            <div class="schedule-days-summary">
              <div class="schedule-day-group">
                <span class="schedule-label">Working Days:</span>
                <span class="schedule-value">
                  {{ scheduleData?.working_days?.length ? scheduleData.working_days.join(', ') : 'Monday – Friday' }}
                </span>
              </div>
              <div v-if="scheduleData?.rest_days?.length" class="schedule-day-group">
                <span class="schedule-label">Rest Days:</span>
                <span class="schedule-value rest-pill-text">
                  {{ scheduleData.rest_days.join(', ') }} (Excluded from WFH count)
                </span>
              </div>
            </div>
          </div>

          <!-- Calendar Period Picker -->
          <div class="calendar-section">
            <label class="section-label">
              <CalendarDays :size="14" />
              <span>Select Date Range (Start Date → End Date)</span>
            </label>

            <EmployeeLeaveDateCalendar
              v-model:start="form.start_date"
              v-model:end="form.end_date"
              :total-days="previewDays ?? undefined"
              :disabled-weekdays="restDayIndexes"
              selection-mode="range"
            />
          </div>

          <!-- Scheduled WFH Days Schedule Validation Card -->
          <div class="scheduled-days-container">
            <!-- Calculating State -->
            <div v-if="previewLoading" class="preview-status loading-state">
              <span class="preview-spinner"></span>
              <span>Checking your schedule and calculating working days…</span>
            </div>

            <!-- Calculated State -->
            <div v-else-if="previewDays !== null" class="preview-status ready-state">
              <div class="ready-main">
                <div class="ready-left">
                  <div class="preview-label-tag">
                    <CheckCircle2 :size="14" />
                    <span>Scheduled work-from-home days:</span>
                  </div>
                  <div class="preview-count-line">
                    <strong class="preview-big-count">{{ previewDays }}</strong>
                    <span class="preview-count-unit">{{ previewDays === 1 ? 'day' : 'days' }}</span>
                  </div>
                </div>

                <div class="ready-badges">
                  <span class="badge-work">
                    ✓ {{ previewDays }} Working {{ previewDays === 1 ? 'day' : 'days' }}
                  </span>
                  <span v-if="excludedRestDaysCount > 0" class="badge-rest">
                    ✕ {{ excludedRestDaysCount }} Rest {{ excludedRestDaysCount === 1 ? 'day' : 'days' }} excluded
                  </span>
                </div>
              </div>

              <!-- Breakdown toggle if multi-day -->
              <div v-if="previewBreakdown.length > 1" class="breakdown-toggle-wrapper">
                <button
                  type="button"
                  class="breakdown-toggle-btn"
                  @click="showBreakdown = !showBreakdown"
                >
                  <span>{{ showBreakdown ? 'Hide schedule breakdown' : 'View daily schedule breakdown' }}</span>
                  <component :is="showBreakdown ? ChevronUp : ChevronDown" :size="14" />
                </button>

                <div v-if="showBreakdown" class="breakdown-chips-grid">
                  <div
                    v-for="item in previewBreakdown"
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
            </div>

            <!-- Prompt State -->
            <div v-else class="preview-status empty-state">
              <Info :size="14" />
              <span>Select your start and end dates on the calendar above to calculate scheduled days.</span>
            </div>
          </div>

          <!-- Supervisor & Reason Fields -->
          <div class="form-inputs-group">
            <label>
              <span>Supervisor name <em class="req">*</em></span>
              <input
                v-model="form.supervisor_name"
                placeholder="Enter supervisor's full name"
                maxlength="255"
                required
              />
            </label>

            <label>
              <span>Reason for work from home <em class="req">*</em></span>
              <textarea
                v-model="form.reason"
                placeholder="State the reason and tasks for your work-from-home schedule..."
                maxlength="1000"
                rows="3"
                required
              />
            </label>
          </div>

          <div class="dialog-actions">
            <button type="button" :disabled="saving" @click="formOpen = false">
              Cancel
            </button>
            <button
              type="submit"
              class="primary"
              :disabled="previewLoading || previewDays === null || previewDays <= 0 || saving"
            >
              {{ saving ? 'Submitting…' : 'Submit Request' }}
            </button>
          </div>
        </fieldset>
      </form>
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
          </div>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.wfh-page {
  max-width: 1400px;
  margin: auto;
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

.panel {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
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

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

th,
td {
  text-align: left;
  padding: 12px;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}

th {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--bg-card-soft);
}

.panel-heading p {
  font-size: 11px;
  color: var(--text-muted);
}

.mobile-requests {
  display: none;
}

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

.wfh-dialog {
  width: min(1040px, 95vw);
}

.dialog-heading {
  flex-wrap: nowrap;
  align-items: center;
  margin-bottom: 16px;
}

.dialog-heading h2 {
  flex: 1;
  min-width: 0;
  line-height: 1.45;
}

.dialog-heading > button {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: transparent;
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  font-size: 12px;
  margin-bottom: 16px;
}

.wfh-form-fields {
  border: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Schedule Info Card */
.schedule-info-card {
  padding: 12px 14px;
  background: var(--bg-card-soft);
  border: 1px solid var(--border);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.schedule-info-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.schedule-title-block {
  display: flex;
  align-items: center;
  gap: 7px;
}

.schedule-icon {
  color: var(--primary);
}

.schedule-title {
  font-weight: 600;
  font-size: 13px;
  color: var(--text-primary);
}

.schedule-code-pill {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  text-transform: uppercase;
}

.schedule-verified-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 500;
  color: #10b981;
}

.schedule-days-summary {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 11px;
}

.schedule-day-group {
  display: flex;
  gap: 6px;
  align-items: baseline;
}

.schedule-label {
  color: var(--text-muted);
  font-weight: 500;
}

.schedule-value {
  color: var(--text-secondary);
}

.rest-pill-text {
  color: #f59e0b;
}

/* Calendar Section */
.calendar-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
}

/* Scheduled Days Card */
.scheduled-days-container {
  border-radius: 10px;
  overflow: hidden;
}

.preview-status {
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--bg-card-soft);
  font-size: 12px;
}

.loading-state {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-secondary);
}

.preview-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
}

.ready-state {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: rgba(16, 185, 129, 0.05);
  border-color: rgba(16, 185, 129, 0.25);
}

.ready-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.preview-label-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #10b981;
  font-weight: 600;
}

.preview-count-line {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-top: 3px;
}

.preview-big-count {
  font-size: 24px;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1;
}

.preview-count-unit {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
}

.ready-badges {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.badge-work {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.badge-rest {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.breakdown-toggle-wrapper {
  border-top: 1px dashed var(--border);
  padding-top: 8px;
}

.breakdown-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  padding: 4px 0;
  font-size: 11px;
  color: var(--primary);
  font-weight: 600;
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

/* Form fields */
.form-inputs-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-inputs-group label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
}

.req {
  color: #ef4444;
  font-style: normal;
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
.pow-summary-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  background: rgba(245, 158, 11, 0.14);
  color: #f59e0b;
}

.pow-summary-badge.complete {
  background: rgba(16, 185, 129, 0.14);
  color: #10b981;
}

.pow-summary-muted {
  color: var(--text-muted);
}

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
  .panel {
    padding: 14px;
  }
  .header .primary {
    width: 100%;
  }
  .panel-heading {
    align-items: flex-start;
    margin-bottom: 14px;
  }
  .table-wrap {
    display: none;
  }
  .mobile-requests {
    display: grid;
    gap: 10px;
  }
  .request-card {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 7px;
    width: 100%;
    padding: 12px;
    text-align: left;
    background: var(--bg-card-soft);
    font-size: 11px;
  }
  .request-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }
  .request-card-dates {
    color: var(--text-primary);
  }
  .request-card-meta {
    color: var(--text-secondary);
    overflow-wrap: anywhere;
  }
  .request-card-link {
    color: var(--primary);
    font-weight: 600;
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
