<script setup lang="ts">
import { ArrowLeft, CalendarDays, Clock3, RotateCcw, Save, Info } from 'lucide-vue-next'
import { useWorkSchedules } from '~/composables/admin/employeeSchedule/useWorkSchedules'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Edit Work Schedule | RWorkCentral' })

type Weekday = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Sat' | 'Sun'
type BooleanValue = boolean | number | string | null | undefined

interface WorkScheduleDayFromApi {
  day_of_week: string
  is_working_day?: BooleanValue
  time_in?: string | null
  time_out?: string | null
}

interface WorkScheduleFromApi {
  id: number
  schedule_name: string
  schedule_code: string
  schedule_type_id: number
  scheduleType?: { id: number; type_name: string } | null
  schedule_type?: { id: number; type_name: string } | null
  required_work_hours: string | number
  grace_period: string | number
  status: BooleanValue
  days?: WorkScheduleDayFromApi[] | null
}

interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

interface DayEditor {
  day_of_week: Weekday
  is_working_day: boolean
  time_in: string
  time_out: string
}

const WEEK: { day: Weekday; label: string }[] = [
  { day: 'Monday', label: 'Monday' },
  { day: 'Tuesday', label: 'Tuesday' },
  { day: 'Wednesday', label: 'Wednesday' },
  { day: 'Thursday', label: 'Thursday' },
  { day: 'Friday', label: 'Friday' },
  { day: 'Sat', label: 'Saturday' },
  { day: 'Sun', label: 'Sunday' },
]

const route = useRoute()
const router = useRouter()
const { $api } = useNuxtApp()
const { success: showSuccess, error: showError } = useToast()
const { schedules, scheduleTypeNames, loadSchedules } = useWorkSchedules()

const scheduleId = computed(() => Number(route.params.id))
const loading = ref(true)
const saving = ref(false)
const schedule = ref<WorkScheduleFromApi | null>(null)
const pageError = ref('')
const validationError = ref('')
const dayRows = ref<DayEditor[]>([])

const form = reactive({
  schedule_name: '',
  schedule_code: '',
  schedule_type_id: 0,
  required_work_hours: 8,
  grace_period: 0,
  status: true,
})

const normalizeDay = (day: string | null | undefined): Weekday | null => {
  const value = String(day ?? '').trim().toLowerCase()
  return WEEK.find(item =>
    item.day.toLowerCase() === value || item.label.toLowerCase() === value ||
    item.day.toLowerCase().slice(0, 3) === value.slice(0, 3) && value.length >= 3,
  )?.day ?? null
}

const isTrue = (value: BooleanValue) =>
  value === true || value === 1 || value === '1' || value === 'true'

const toTimeInput = (value: string | null | undefined): string => {
  const match = String(value ?? '').match(/^(\d{2}):(\d{2})(?::\d{2})?$/)
  return match ? `${match[1]}:${match[2]}` : ''
}

const hydrateFromDatabase = (record: WorkScheduleFromApi) => {
  form.schedule_name = String(record.schedule_name ?? '')
  form.schedule_code = String(record.schedule_code ?? '')
  form.schedule_type_id = Number(record.schedule_type_id) || 0
  form.required_work_hours = Number(record.required_work_hours ?? 8)
  form.grace_period = Number(record.grace_period ?? 0)
  form.status = isTrue(record.status)

  // Your Laravel controller stores ONLY working days.
  // A missing weekday is therefore a REST DAY, never a default 8 AM-5 PM shift.
  const savedDays = new Map<Weekday, WorkScheduleDayFromApi>()
  for (const item of Array.isArray(record.days) ? record.days : []) {
    const name = normalizeDay(item.day_of_week)
    if (name) savedDays.set(name, item)
  }

  dayRows.value = WEEK.map(({ day }) => {
    const saved = savedDays.get(day)
    const working = Boolean(saved) && (saved?.is_working_day == null || isTrue(saved.is_working_day))
    return {
      day_of_week: day,
      is_working_day: working,
      time_in: working ? toTimeInput(saved?.time_in) : '',
      time_out: working ? toTimeInput(saved?.time_out) : '',
    }
  })
  validationError.value = ''
}

const currentTypeName = computed(() =>
  schedule.value?.scheduleType?.type_name || schedule.value?.schedule_type?.type_name ||
  `Schedule type #${form.schedule_type_id}`,
)

const typeOptions = computed(() => {
  const types = new Map<number, string>()
  if (form.schedule_type_id) types.set(form.schedule_type_id, currentTypeName.value)

  // Reuse the type information the current composable already provides.
  for (const item of (schedules.value ?? []) as unknown as Record<string, any>[]) {
    const id = Number(item.schedule_type_id)
    const relation = item.scheduleType ?? item.schedule_type
    if (id && relation?.type_name) types.set(id, String(relation.type_name))
  }

  // Support composables that return full schedule-type objects.
  for (const item of (scheduleTypeNames.value ?? []) as unknown as any[]) {
    if (item && typeof item === 'object') {
      const id = Number(item.id ?? item.schedule_type_id)
      const name = item.type_name ?? item.name
      if (id && name) types.set(id, String(name))
    }
  }

  return [...types].map(([id, name]) => ({ id, name }))
})

const workingCount = computed(() => dayRows.value.filter(item => item.is_working_day).length)
const restCount = computed(() => 7 - workingCount.value)

const resetToSaved = () => {
  if (schedule.value) hydrateFromDatabase(schedule.value)
}

const applyWeekdays = () => {
  for (const item of dayRows.value) {
    if (item.day_of_week === 'Sat' || item.day_of_week === 'Sun') continue
    item.is_working_day = true
    if (!item.time_in) item.time_in = '08:00'
    if (!item.time_out) item.time_out = '17:00'
  }
}

const onToggleDay = (item: DayEditor) => {
  if (item.is_working_day) {
    if (!item.time_in) item.time_in = '08:00'
    if (!item.time_out) item.time_out = '17:00'
  } else {
    item.time_in = ''
    item.time_out = ''
  }
}

const messageFromError = (problem: any): string => {
  const data = problem?.data ?? problem?.response?._data ?? {}
  return String(Object.values(data.errors ?? {}).flat()[0] ?? data.message ?? problem?.message ?? 'An unexpected error occurred.')
}

const loadSchedule = async () => {
  loading.value = true
  pageError.value = ''
  schedule.value = null

  if (!Number.isInteger(scheduleId.value) || scheduleId.value < 1) {
    pageError.value = 'Invalid work schedule ID.'
    loading.value = false
    return
  }

  try {
    // GET one schedule instead of relying on a possibly stale list/cache.
    // Controller: ScheduleController::show() with ->load(['days', 'scheduleType']).
    const response = await $api<ApiResponse<WorkScheduleFromApi>>(
      `/admin/work-schedules/${scheduleId.value}`,
      { method: 'GET' },
    )
    if (!response?.success || !response?.data?.id) {
      throw new Error(response?.message || 'Work schedule not found.')
    }
    schedule.value = response.data
    hydrateFromDatabase(response.data)

    // Optional list for displaying other schedule types. A failure does not
    // replace or erase the successfully loaded schedule detail.
    try { await loadSchedules() } catch { /* detail remains usable */ }
  } catch (problem) {
    pageError.value = messageFromError(problem)
    showError('Could Not Load Work Schedule', pageError.value)
  } finally {
    loading.value = false
  }
}

const save = async () => {
  if (!schedule.value || saving.value) return
  validationError.value = ''

  if (!form.schedule_name.trim() || !form.schedule_code.trim() || !form.schedule_type_id) {
    validationError.value = 'Schedule name, code, and type are required.'
    return
  }
  if (!Number.isFinite(form.required_work_hours) || form.required_work_hours <= 0 || form.required_work_hours > 24) {
    validationError.value = 'Required work hours must be greater than 0 and no more than 24.'
    return
  }
  if (!Number.isInteger(form.grace_period) || form.grace_period < 0 || form.grace_period > 120) {
    validationError.value = 'Grace period must be a whole number from 0 to 120 minutes.'
    return
  }

  const selected = dayRows.value.filter(item => item.is_working_day)
  if (!selected.length) {
    validationError.value = 'Select at least one working day.'
    return
  }
  for (const item of selected) {
    if (!item.time_in || !item.time_out) {
      validationError.value = `${item.day_of_week} requires Time In and Time Out.`
      return
    }
    if (item.time_in === item.time_out) {
      validationError.value = `${item.day_of_week} Time Out must be different from Time In.`
      return
    }
  }

  // EXACT payload expected by ScheduleController::validateSchedule().
  const payload = {
    schedule_name: form.schedule_name.trim(),
    schedule_code: form.schedule_code.trim(),
    schedule_type_id: form.schedule_type_id,
    required_work_hours: form.required_work_hours,
    grace_period: form.grace_period,
    status: form.status,
    days: selected.map(item => ({
      day_of_week: item.day_of_week,
      is_working_day: true,
      time_in: item.time_in,  // HH:mm (not HH:mm:ss)
      time_out: item.time_out,
    })),
  }

  saving.value = true
  try {
    const response = await $api<ApiResponse<WorkScheduleFromApi>>(
      `/admin/work-schedules/${schedule.value.id}`,
      { method: 'PUT', body: payload },
    )
    if (!response?.success) throw new Error(response?.message || 'Could not save changes.')
    showSuccess('Schedule Updated', response.message || 'Work schedule updated successfully.')
    await router.push('/admin/work-schedules')
  } catch (problem) {
    validationError.value = messageFromError(problem)
    showError('Work Schedule Error', validationError.value)
  } finally {
    saving.value = false
  }
}

onMounted(loadSchedule)
watch(scheduleId, loadSchedule)
</script>

<template>
  <section class="schedule-page">
    <button type="button" class="back-button" @click="router.push('/admin/work-schedules')">
      <ArrowLeft :size="15" /> Back to Work Schedules
    </button>

    <PageHeader title="Edit Work Schedule" description="Edit the saved work schedule and rest days from the database." />

    <div v-if="loading" class="page-message">Loading saved schedule...</div>
    <div v-else-if="pageError" class="page-message error-message">{{ pageError }}</div>

    <form v-else-if="schedule" class="schedule-form" @submit.prevent="save">
      <section class="form-card">
        <div class="section-heading">
          <span class="heading-icon blue"><CalendarDays :size="18" /></span>
          <div><h2>Schedule Information</h2><p>Loaded from work schedule #{{ schedule.id }}.</p></div>
        </div>
        <div class="form-grid">
          <label><span>Schedule Name <em>*</em></span><input v-model="form.schedule_name" required maxlength="255" /></label>
          <label><span>Schedule Code <em>*</em></span><input v-model="form.schedule_code" required maxlength="50" /></label>
          <label><span>Schedule Type <em>*</em></span>
            <select v-model.number="form.schedule_type_id" required>
              <option v-for="type in typeOptions" :key="type.id" :value="type.id">{{ type.name }}</option>
            </select>
          </label>
          <label><span>Status</span>
            <select v-model="form.status"><option :value="true">Active</option><option :value="false">Inactive</option></select>
          </label>
        </div>
      </section>

      <section class="form-card">
        <div class="section-heading timing-heading">
          <span class="heading-icon green"><Clock3 :size="18" /></span>
          <div class="heading-copy"><h2>Day-by-Day Shift Timings</h2><p>Only saved working days are enabled. Missing days are rest days.</p></div>
          <div class="heading-actions">
            <button type="button" class="secondary-button" @click="applyWeekdays">Apply Monday to Weekdays</button>
            <button type="button" class="secondary-button" @click="resetToSaved"><RotateCcw :size="13" /> Reset to Saved</button>
          </div>
        </div>

        <div class="day-list">
          <div v-for="(day, index) in dayRows" :key="day.day_of_week" class="day-row" :class="{ inactive: !day.is_working_day }">
            <label class="day-checkbox">
              <input v-model="day.is_working_day" type="checkbox" @change="onToggleDay(day)" />
              <strong>{{ WEEK[index]?.label }}</strong>
            </label>
            <div v-if="day.is_working_day" class="time-group">
              <label><span>Time In</span><input v-model="day.time_in" type="time" required /></label>
              <span class="time-separator">to</span>
              <label><span>Time Out</span><input v-model="day.time_out" type="time" required /></label>
            </div>
            <span v-else class="rest-label">Rest Day / Off</span>
          </div>
        </div>

        <div class="form-grid bottom-fields">
          <label><span>Required Work Hours</span><input v-model.number="form.required_work_hours" type="number" min="0.01" max="24" step="0.01" required /></label>
          <label><span>Grace Period (minutes)</span><input v-model.number="form.grace_period" type="number" min="0" max="120" step="1" required /></label>
        </div>
        <div class="day-summary"><Info :size="15" /> {{ workingCount }} working day(s) · {{ restCount }} rest day(s)</div>
      </section>

      <p v-if="validationError" role="alert" class="validation-error">{{ validationError }}</p>
      <div class="form-actions">
        <button type="button" class="secondary-button cancel" :disabled="saving" @click="router.push('/admin/work-schedules')">Cancel</button>
        <button type="submit" class="save-button" :disabled="saving">
          <Save :size="16" /> {{ saving ? 'Saving...' : 'Save Schedule' }}
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.schedule-page{width:100%;max-width:1200px;margin:0 auto;padding-bottom:28px}
.back-button{display:inline-flex;align-items:center;gap:6px;margin-bottom:10px;padding:0;border:0;background:transparent;color:var(--primary);font:inherit;font-size:11px;font-weight:600;cursor:pointer}
.page-message{display:grid;min-height:160px;place-items:center;border:1px solid var(--border);border-radius:12px;background:var(--bg-card);color:var(--text-muted);font-size:12px}
.error-message{color:var(--red,#ef4444)}
.schedule-form{display:grid;gap:13px}.form-card{padding:18px;border:1px solid var(--border);border-radius:12px;background:var(--bg-card);min-width:0}
.section-heading{display:flex;align-items:center;gap:11px;margin-bottom:15px}.heading-icon{display:grid;place-items:center;flex:0 0 38px;width:38px;height:38px;border-radius:10px}.heading-icon.blue{background:#2563eb1c;color:#3b82f6}.heading-icon.green{background:#16a34a1c;color:#22c55e}
.section-heading h2{font-size:14px;font-weight:700;margin:0;color:var(--text-primary)}.section-heading p{font-size:11px;color:var(--text-secondary);margin:4px 0 0}.heading-copy{flex:1;min-width:0}.heading-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px}.form-grid label,.time-group label{display:grid;gap:6px;min-width:0}.form-grid label>span,.time-group label>span{font-size:11px;font-weight:650;color:var(--text-primary)}em{color:#ef4444;font-style:normal}
input:not([type=checkbox]),select{width:100%;height:39px;min-width:0;box-sizing:border-box;border:1px solid var(--border);border-radius:8px;background:var(--bg-card-soft);color:var(--text-primary);font:inherit;font-size:12px;padding:0 11px;outline:none;color-scheme:inherit}
input:focus,select:focus{border-color:var(--primary);outline:2px solid color-mix(in srgb,var(--primary) 18%,transparent)}
.day-list{display:grid;gap:7px}.day-row{display:flex;align-items:center;justify-content:space-between;gap:15px;min-height:63px;padding:9px 13px;border:1px solid var(--border);border-radius:9px;background:var(--bg-card-soft)}.day-row.inactive{opacity:.7}.day-checkbox{display:flex;align-items:center;gap:10px;cursor:pointer}.day-checkbox strong{font-size:12px;color:var(--text-primary)}.day-checkbox input{width:15px;height:15px;accent-color:var(--primary);cursor:pointer}
.time-group{display:flex;align-items:flex-end;gap:12px;min-width:300px}.time-group label{width:145px}.time-group label>span{color:var(--text-secondary);font-size:10px}.time-separator{align-self:center;margin-top:17px;color:var(--text-muted);font-size:11px}.rest-label{color:var(--text-muted);font-size:11px}.bottom-fields{margin-top:16px;padding-top:13px;border-top:1px solid var(--border)}.day-summary{display:flex;align-items:center;gap:7px;margin-top:12px;color:var(--text-secondary);font-size:11px}
.secondary-button,.save-button{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:34px;padding:0 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg-card-soft);color:var(--text-primary);font:inherit;font-size:11px;font-weight:650;cursor:pointer}.secondary-button:hover{border-color:var(--primary);color:var(--primary)}
.form-actions{display:flex;justify-content:flex-end;gap:10px}.form-actions button{min-height:42px;padding-inline:18px}.save-button{background:var(--primary);border-color:var(--primary);color:#fff}.form-actions button:disabled{opacity:.6;cursor:not-allowed}
.validation-error{padding:12px;border:1px solid #ef444455;border-radius:9px;background:#ef444415;color:#ef4444;font-size:12px;margin:0}
@media(max-width:760px){.form-grid{grid-template-columns:1fr}.timing-heading{flex-wrap:wrap}.heading-actions{width:100%}.day-row{align-items:stretch;flex-direction:column}.time-group{width:100%;min-width:0}.time-group label{flex:1;width:auto}.rest-label{text-align:right}.form-actions button{flex:1}}
</style>
