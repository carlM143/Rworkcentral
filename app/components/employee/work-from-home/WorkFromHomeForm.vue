<!--
  New / edit work-from-home request form (pages/employee/requests/work-from-home/create.vue and edit.vue).
  Checks the employee's schedule and previews the working days in the selected range.
-->
<script setup lang="ts">
import {
  ArrowLeft,
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  House,
  Info,
  Save,
} from 'lucide-vue-next'
import EmployeeLeaveDateCalendar from '~/components/employee/EmployeeLeaveDateCalendar.vue'
import { employeeWfhError, useWorkFromHome } from '~/composables/employee/work-from-home/useWorkFromHome'
import type {
  DateBreakdownItem,
  ScheduleData,
  WfhRequest,
} from '~/types/employee/work-from-home/workFromHome'

const props = defineProps<{ mode: 'create' | 'edit' }>()

const BASE = '/employee/requests/work-from-home'

const route = useRoute()
const api = useWorkFromHome()
const { success } = useToast()

const editing = computed(() => props.mode === 'edit')
const editId = computed(() => Number(route.query.id))

const form = reactive({
  start_date: '',
  end_date: '',
  supervisor_name: '',
  reason: '',
})

const saving = ref(false)
const error = ref('')

/* =========================================================
   EDIT: load the request (no show endpoint, so find it in the list)
========================================================= */

const existing = ref<WfhRequest | null>(null)
const loadingRecord = ref(false)
const recordError = ref('')

const canEdit = computed(() => !editing.value || existing.value?.status.toLowerCase() === 'pending')

const loadRecord = async () => {
  if (!Number.isInteger(editId.value) || editId.value <= 0) {
    recordError.value = 'Request not found. Verify the link or return to your request list.'
    return
  }

  loadingRecord.value = true
  try {
    existing.value = (await api.list()).find(record => record.id === editId.value) ?? null
    if (!existing.value) {
      recordError.value = 'Request not found. Verify the link or return to your request list.'
      return
    }
    Object.assign(form, {
      start_date: existing.value.start_date.slice(0, 10),
      end_date: existing.value.end_date.slice(0, 10),
      supervisor_name: existing.value.supervisor_name,
      reason: existing.value.reason,
    })
  } catch (problem) {
    recordError.value = employeeWfhError(problem, 'Unable to load the work-from-home request.')
  } finally {
    loadingRecord.value = false
  }
}

/* =========================================================
   SCHEDULE & WORKING-DAY PREVIEW
========================================================= */

const scheduleData = ref<ScheduleData | null>(null)
const showBreakdown = ref(false)
const previewDays = ref<number | null>(null)
const calendarDaysCount = ref<number | null>(null)
const previewBreakdown = ref<DateBreakdownItem[]>([])
const previewLoading = ref(false)

// JavaScript weekday indexes: Sun=0, Mon=1, ..., Sat=6
const weekdayIndexes: Record<string, number> = {
  sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
}

const toWeekdayIndex = (day: unknown): number | null => {
  if (typeof day !== 'string') return null
  const key = day.trim().toLowerCase().replace(/[^a-z]/g, '').slice(0, 3)
  return weekdayIndexes[key] ?? null
}

const restDayIndexes = computed<number[]>(() =>
  (scheduleData.value?.rest_days ?? [])
    .map(day => toWeekdayIndex(day))
    .filter((day): day is number => day !== null),
)

const excludedRestDaysCount = computed(() => {
  if (calendarDaysCount.value === null || previewDays.value === null) return 0
  return Math.max(0, calendarDaysCount.value - previewDays.value)
})

const loadSchedule = async () => {
  try {
    scheduleData.value = await api.schedule() ?? null
  } catch (problem) {
    console.warn('Could not load work schedule', problem)
  }
}

let previewVersion = 0
watch([() => form.start_date, () => form.end_date], async ([start, end]) => {
  const version = ++previewVersion
  previewDays.value = null
  calendarDaysCount.value = null
  previewBreakdown.value = []
  error.value = ''

  if (!start || !end || end < start) {
    previewLoading.value = false
    return
  }

  previewLoading.value = true
  try {
    const data = await api.preview({ start_date: start, end_date: end })
    if (version !== previewVersion) return

    previewDays.value = data.number_of_days
    calendarDaysCount.value = data.calendar_days ?? null
    previewBreakdown.value = data.breakdown ?? []

    if (data.schedule_name && !scheduleData.value?.schedule_name) {
      scheduleData.value = {
        schedule_id: null,
        schedule_name: data.schedule_name,
        schedule_code: data.schedule_code ?? null,
        working_days: data.working_days ?? [],
        rest_days: data.rest_days ?? [],
      }
    }
  } catch (problem) {
    if (version === previewVersion) error.value = employeeWfhError(problem, 'Unable to calculate scheduled days.')
  } finally {
    if (version === previewVersion) previewLoading.value = false
  }
})

/* =========================================================
   SUBMIT
========================================================= */

const canSubmit = computed(() =>
  !saving.value && !previewLoading.value && previewDays.value !== null && previewDays.value > 0,
)

const save = async () => {
  if (!canSubmit.value) {
    error.value = 'Select a valid date range with scheduled working days.'
    return
  }

  saving.value = true
  error.value = ''
  const payload = {
    ...form,
    supervisor_name: form.supervisor_name.trim(),
    reason: form.reason.trim(),
  }

  try {
    if (editing.value && existing.value) {
      await api.update(existing.value.id, payload)
      success('Request Updated', 'Your work-from-home request was updated.')
    } else {
      await api.create(payload)
      success('Request Submitted', 'Your work-from-home request is pending admin approval.')
    }
    await navigateTo(BASE)
  } catch (problem) {
    error.value = employeeWfhError(problem, editing.value ? 'Unable to update request.' : 'Unable to submit request.')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  void loadSchedule()
  if (editing.value) void loadRecord()
})
</script>

<template>
  <section class="wfh-form-page">
    <NuxtLink :to="BASE" class="back-link"><ArrowLeft :size="16" /> Back to Work From Home Requests</NuxtLink>

    <div class="heading">
      <div class="heading-icon"><House :size="24" /></div>
      <div>
        <h1>{{ editing ? 'Edit' : 'New' }} Work-from-Home Request</h1>
        <p>Pick your dates; rest days in your work schedule are not counted.</p>
      </div>
    </div>

    <div v-if="loadingRecord" class="form-card missing">Loading work-from-home request…</div>
    <div v-else-if="editing && !existing" class="form-card missing">{{ recordError || 'Request not found.' }}</div>
    <div v-else-if="!canEdit" class="form-card missing">
      This request is {{ existing?.status.toLowerCase() }} and can no longer be edited.
    </div>

    <form v-else class="form-card" @submit.prevent="save">
      <fieldset :disabled="saving" class="form-fields">
        <!-- Employee work schedule -->
        <div class="schedule-info-card">
          <div class="schedule-info-header">
            <div class="schedule-title-block">
              <Clock :size="15" class="schedule-icon" />
              <span class="schedule-title">
                {{ scheduleData?.schedule_name || scheduleData?.schedule_code || 'Standard Work Schedule' }}
              </span>
              <span v-if="scheduleData?.schedule_code" class="schedule-code-pill">{{ scheduleData.schedule_code }}</span>
            </div>
            <span class="schedule-verified-badge"><CalendarCheck2 :size="12" /> Schedule Checked</span>
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
              <span class="schedule-value rest-pill-text">{{ scheduleData.rest_days.join(', ') }} (Excluded from WFH count)</span>
            </div>
          </div>
        </div>

        <!-- Date range -->
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

        <!-- Scheduled working days -->
        <div v-if="previewLoading" class="preview-status loading-state">
          <span class="preview-spinner" />
          <span>Checking your schedule and calculating working days…</span>
        </div>

        <div v-else-if="previewDays !== null" class="preview-status ready-state">
          <div class="ready-main">
            <div>
              <div class="preview-label-tag"><CheckCircle2 :size="14" /><span>Scheduled work-from-home days:</span></div>
              <div class="preview-count-line">
                <strong class="preview-big-count">{{ previewDays }}</strong>
                <span class="preview-count-unit">{{ previewDays === 1 ? 'day' : 'days' }}</span>
              </div>
            </div>
            <div class="ready-badges">
              <span class="badge-work">✓ {{ previewDays }} Working {{ previewDays === 1 ? 'day' : 'days' }}</span>
              <span v-if="excludedRestDaysCount > 0" class="badge-rest">
                ✕ {{ excludedRestDaysCount }} Rest {{ excludedRestDaysCount === 1 ? 'day' : 'days' }} excluded
              </span>
            </div>
          </div>

          <div v-if="previewBreakdown.length > 1" class="breakdown-toggle-wrapper">
            <button type="button" class="breakdown-toggle-btn" @click="showBreakdown = !showBreakdown">
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
                  <Clock v-if="item.is_working_day" :size="11" />
                  {{ item.is_working_day ? (item.schedule_time || 'Regular Shift') : 'Rest day (Off)' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="preview-status empty-state">
          <Info :size="14" />
          <span>Select your start and end dates on the calendar above to calculate scheduled days.</span>
        </div>

        <!-- Supervisor & reason -->
        <div class="fields">
          <label>
            <span>Supervisor name <b>*</b></span>
            <input v-model="form.supervisor_name" placeholder="Enter supervisor's full name" maxlength="255" required>
          </label>
          <label>
            <span>Reason for work from home <b>*</b></span>
            <textarea
              v-model="form.reason"
              placeholder="State the reason and tasks for your work-from-home schedule..."
              maxlength="1000"
              rows="4"
              required
            />
          </label>
        </div>
      </fieldset>

      <p v-if="error" class="error" role="alert">{{ error }}</p>

      <div class="actions">
        <NuxtLink :to="BASE" class="cancel">Cancel</NuxtLink>
        <button type="submit" :disabled="!canSubmit">
          <Save :size="16" />
          {{ saving ? 'Saving…' : editing ? 'Update Request' : 'Submit Request' }}
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped>
/* Page frame: same as the Time Log Correction form */
.wfh-form-page { max-width: 1040px; margin: 0 auto; color: var(--text-primary); }
.back-link { display: inline-flex; align-items: center; gap: 7px; margin-bottom: 20px; color: var(--primary); font-size: 12px; font-weight: 600; text-decoration: none; }
.heading { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; }
.heading-icon { display: grid; flex-shrink: 0; width: 52px; height: 52px; place-items: center; border-radius: 12px; background: var(--primary-soft); color: var(--primary); }
.heading h1 { margin: 0 0 5px; font-size: 24px; }
.heading p { margin: 0; color: var(--text-secondary); font-size: 12px; }
.form-card { padding: 24px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); box-shadow: var(--shadow); }
.missing { color: var(--text-secondary); font-size: 13px; }
.form-fields { display: flex; flex-direction: column; gap: 16px; min-width: 0; margin: 0; padding: 0; border: 0; }

/* Schedule card */
.schedule-info-card { display: flex; flex-direction: column; gap: 8px; padding: 12px 14px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg-card-soft); }
.schedule-info-header { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
.schedule-title-block { display: flex; align-items: center; gap: 7px; }
.schedule-icon { color: var(--primary); }
.schedule-title { color: var(--text-primary); font-size: 13px; font-weight: 600; }
.schedule-code-pill { padding: 2px 6px; border: 1px solid var(--border); border-radius: 4px; background: var(--bg-card); color: var(--text-secondary); font-size: 10px; font-weight: 700; text-transform: uppercase; }
.schedule-verified-badge { display: inline-flex; align-items: center; gap: 5px; color: #10b981; font-size: 11px; font-weight: 500; }
.schedule-days-summary { display: flex; flex-direction: column; gap: 4px; font-size: 11px; }
.schedule-day-group { display: flex; align-items: baseline; gap: 6px; }
.schedule-label { color: var(--text-muted); font-weight: 500; }
.schedule-value { color: var(--text-secondary); }
.rest-pill-text { color: #f59e0b; }

/* Calendar */
.calendar-section { display: flex; flex-direction: column; gap: 8px; }
.section-label { display: inline-flex; align-items: center; gap: 6px; color: var(--text-secondary); font-size: 12px; font-weight: 600; }

/* Working-day preview */
.preview-status { padding: 12px 14px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg-card-soft); font-size: 12px; }
.loading-state { display: flex; align-items: center; gap: 10px; color: var(--text-secondary); }
.preview-spinner { width: 14px; height: 14px; border: 2px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-state { display: flex; align-items: center; gap: 8px; color: var(--text-muted); }
.ready-state { display: flex; flex-direction: column; gap: 10px; border-color: rgba(16, 185, 129, .25); background: rgba(16, 185, 129, .05); }
.ready-main { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.preview-label-tag { display: flex; align-items: center; gap: 6px; color: #10b981; font-size: 12px; font-weight: 600; }
.preview-count-line { display: flex; align-items: baseline; gap: 6px; margin-top: 3px; }
.preview-big-count { color: var(--text-primary); font-size: 24px; font-weight: 800; line-height: 1; }
.preview-count-unit { color: var(--text-secondary); font-size: 13px; font-weight: 600; }
.ready-badges { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.badge-work, .badge-rest { padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; }
.badge-work { background: rgba(16, 185, 129, .15); color: #10b981; }
.badge-rest { background: rgba(245, 158, 11, .15); color: #f59e0b; }
.breakdown-toggle-wrapper { padding-top: 8px; border-top: 1px dashed var(--border); }
.breakdown-toggle-btn { display: inline-flex; align-items: center; gap: 6px; padding: 4px 0; border: 0; background: transparent; color: var(--primary); font: inherit; font-size: 11px; font-weight: 600; cursor: pointer; }
.breakdown-chips-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 6px; margin-top: 8px; }
.breakdown-chip { display: flex; flex-direction: column; gap: 2px; padding: 6px 8px; border: 1px solid var(--border); border-radius: 6px; font-size: 10px; }
.chip-work { border-color: rgba(16, 185, 129, .2); background: rgba(16, 185, 129, .08); }
.chip-rest { border-color: rgba(245, 158, 11, .2); background: rgba(245, 158, 11, .08); }
.chip-date-text { color: var(--text-primary); font-weight: 700; }
.chip-day-name { color: var(--text-secondary); }
.chip-type-tag { display: inline-flex; align-items: center; gap: 4px; font-weight: 600; }
.chip-work .chip-type-tag { color: #10b981; }
.chip-rest .chip-type-tag { color: #f59e0b; }

/* Fields & actions: same as the Time Log Correction form */
.fields { display: grid; gap: 17px; }
.fields label { display: flex; min-width: 0; flex-direction: column; gap: 7px; color: var(--text-secondary); font-size: 12px; }
.fields b { color: var(--red, #dc2626); }
.fields input, .fields textarea { width: 100%; min-height: 42px; box-sizing: border-box; padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; outline: 0; background: var(--bg-card-soft); color: var(--text-primary); font: inherit; font-size: 13px; }
.fields textarea { min-height: 110px; resize: vertical; }
.fields input:focus, .fields textarea:focus { border-color: var(--primary); box-shadow: 0 0 0 2px var(--primary-soft); }
.error { margin: 14px 0 0; color: var(--red, #dc2626); font-size: 12px; }
.actions { display: flex; align-items: center; justify-content: flex-end; gap: 10px; margin-top: 26px; }
.actions a, .actions button { display: inline-flex; min-height: 40px; align-items: center; justify-content: center; gap: 7px; padding: 10px 17px; border-radius: 8px; font-size: 12px; font-weight: 600; text-decoration: none; }
.cancel { border: 1px solid var(--border); color: var(--text-primary); }
.actions button { border: 0; background: linear-gradient(135deg, #1f68f2, #2878ff); color: #fff; cursor: pointer; }
.actions button:disabled { opacity: .5; cursor: not-allowed; }

@media (max-width: 640px) {
  .form-card { padding: 16px; }
  .heading h1 { font-size: 20px; }
  .actions { display: grid; grid-template-columns: 1fr 1fr; }
}
@media (prefers-reduced-motion: reduce) { .preview-spinner { animation: none; } }
</style>
