<script setup lang="ts">
import { CalendarClock, Clock3, Coffee, Info, RotateCcw, Save } from 'lucide-vue-next'
import type {
  WorkSchedule,
  WorkScheduleDayFormData,
  WorkScheduleFormData,
  WorkScheduleStatus,
  WorkScheduleType,
} from '~/types/workSchedule'
import { createDefaultScheduleDays } from '~/types/workSchedule'

const props = withDefaults(defineProps<{
  schedule?: WorkSchedule | null
  scheduleTypes: WorkScheduleType[]
  suggestedCode?: string
  saving?: boolean
  mode?: 'create' | 'edit'
}>(), {
  schedule: null,
  suggestedCode: '',
  saving: false,
  mode: 'create',
})

const emit = defineEmits<{
  save: [data: WorkScheduleFormData]
  cancel: []
}>()

const { error } = useToast()
const statusOptions: WorkScheduleStatus[] = ['Active', 'Inactive']

const form = reactive<WorkScheduleFormData>({
  code: '',
  name: '',
  type: '',
  workHours: 8,
  gracePeriod: 5,
  status: 'Active',
  breakStart: '12:00',
  breakEnd: '13:00',
  days: createDefaultScheduleDays(),
})

const inputTime = (value: string | null | undefined, fallback = '') => {
  const match = value?.match(/^(\d{1,2}):(\d{2})/)
  return match ? `${String(Number(match[1])).padStart(2, '0')}:${match[2]}` : fallback
}

const cloneDays = (days?: WorkScheduleDayFormData[]): WorkScheduleDayFormData[] => {
  if (!Array.isArray(days) || days.length !== 7) return createDefaultScheduleDays()
  return days.map(day => ({
    day_of_week: day.day_of_week,
    is_working_day: Boolean(day.is_working_day),
    time_in: day.is_working_day ? inputTime(day.time_in, '08:00') : null,
    time_out: day.is_working_day ? inputTime(day.time_out, '17:00') : null,
  }))
}

const loadForm = () => {
  const schedule = props.schedule
  form.code = schedule?.code ?? props.suggestedCode
  form.name = schedule?.name ?? ''
  form.type = schedule?.type ?? props.scheduleTypes[0] ?? ''
  form.workHours = schedule?.workHours ?? 8
  form.gracePeriod = schedule?.gracePeriod ?? 5
  form.status = schedule?.status ?? 'Active'
  form.breakStart = schedule?.breakStart ? inputTime(schedule.breakStart) : '12:00'
  form.breakEnd = schedule?.breakEnd ? inputTime(schedule.breakEnd) : '13:00'
  form.days = cloneDays(schedule?.days)
}

watch(
  [() => props.schedule, () => props.suggestedCode, () => props.scheduleTypes],
  loadForm,
  { immediate: true },
)

const dayLabel = (day: WorkScheduleDayFormData) => {
  if (day.day_of_week === 'Sat') return 'Saturday'
  if (day.day_of_week === 'Sun') return 'Sunday'
  return day.day_of_week
}

const applyMondayToWeekdays = () => {
  const monday = form.days.find(day => day.day_of_week === 'Monday')
  if (!monday) return

  form.days.forEach(day => {
    if (['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(day.day_of_week)) {
      day.is_working_day = true
      day.time_in = monday.time_in || '08:00'
      day.time_out = monday.time_out || '17:00'
    }
  })
}

const resetDays = () => {
  form.days = createDefaultScheduleDays()
}

const toggleDay = (day: WorkScheduleDayFormData) => {
  if (day.is_working_day) {
    day.time_in ||= '08:00'
    day.time_out ||= '17:00'
  } else {
    day.time_in = null
    day.time_out = null
  }
}

const handleSave = () => {
  if (!form.name.trim()) {
    error('Schedule Name Required', 'Please enter a work schedule name.')
    return
  }
  if (!form.code.trim()) {
    error('Schedule Code Required', 'Please enter a work schedule code.')
    return
  }
  if (!form.type) {
    error('Schedule Type Required', 'Please select a schedule type.')
    return
  }
  if (!Number.isFinite(Number(form.workHours)) || Number(form.workHours) <= 0 || Number(form.workHours) > 24) {
    error('Invalid Work Hours', 'Required work hours must be between 1 and 24.')
    return
  }

  const workingDays = form.days.filter(day => day.is_working_day)
  if (!workingDays.length) {
    error('Working Day Required', 'Please select at least one working day.')
    return
  }

  const invalidDay = workingDays.find(day => !day.time_in || !day.time_out || day.time_in === day.time_out)
  if (invalidDay) {
    error('Invalid Day Schedule', `${dayLabel(invalidDay)} requires different Time In and Time Out values.`)
    return
  }

  emit('save', {
    code: form.code.trim(),
    name: form.name.trim(),
    type: form.type,
    workHours: Number(form.workHours),
    gracePeriod: Number(form.gracePeriod),
    status: form.status,
    breakStart: form.breakStart,
    breakEnd: form.breakEnd,
    days: cloneDays(form.days),
  })
}
</script>

<template>
  <form class="schedule-form" @submit.prevent="handleSave">
    <section class="form-card">
      <div class="section-heading">
        <span class="section-icon blue"><CalendarClock :size="17" /></span>
        <div><h2>Schedule Information</h2><p>Enter the reusable schedule name, code, type and status.</p></div>
      </div>

      <div class="form-grid">
        <label class="field"><span>Schedule Name *</span><AppInput v-model="form.name" placeholder="Example: Regular Day Shift" /></label>
        <label class="field"><span>Schedule Code *</span><AppInput v-model="form.code" placeholder="WS-001" /></label>
        <label class="field"><span>Schedule Type *</span><AppSelect v-model="form.type" :options="scheduleTypes" placeholder="Select schedule type" /></label>
        <label class="field"><span>Status</span><AppSelect v-model="form.status" :options="statusOptions" /></label>
      </div>
    </section>

    <section class="form-card">
      <div class="section-heading with-actions">
        <div class="heading-copy">
          <span class="section-icon green"><Clock3 :size="17" /></span>
          <div><h2>Day-by-Day Shift Timings</h2><p>Configure every day from Monday through Sunday.</p></div>
        </div>
        <div class="section-actions">
          <button type="button" class="text-button" @click="applyMondayToWeekdays">Apply Monday to Weekdays</button>
          <button type="button" class="text-button" @click="resetDays"><RotateCcw :size="13" /> Reset Days</button>
        </div>
      </div>

      <div class="day-list">
        <div v-for="day in form.days" :key="day.day_of_week" class="day-row" :class="{ disabled: !day.is_working_day }">
          <label class="day-toggle">
            <input v-model="day.is_working_day" type="checkbox" @change="toggleDay(day)">
            <span>{{ dayLabel(day) }}</span>
          </label>

          <div v-if="day.is_working_day" class="day-times">
            <label><span>Time In</span><input v-model="day.time_in" type="time"></label>
            <span class="time-separator">to</span>
            <label><span>Time Out</span><input v-model="day.time_out" type="time"></label>
          </div>
          <span v-else class="rest-label">Rest Day / Off</span>
        </div>
      </div>

      <div class="form-grid metrics-grid">
        <label class="field"><span>Required Work Hours</span><input v-model.number="form.workHours" class="native-input" type="number" min="1" max="24" step="0.25"></label>
        <label class="field"><span>Grace Period (minutes)</span><input v-model.number="form.gracePeriod" class="native-input" type="number" min="0" max="120"></label>
      </div>
    </section>

    <section class="form-card">
      <div class="section-heading">
        <span class="section-icon orange"><Coffee :size="17" /></span>
        <div><h2>Break Schedule</h2><p>Configure the standard employee break period.</p></div>
      </div>
      <div class="form-grid">
        <label class="field"><span>Break Start</span><input v-model="form.breakStart" class="native-input" type="time"></label>
        <label class="field"><span>Break End</span><input v-model="form.breakEnd" class="native-input" type="time"></label>
      </div>
    </section>

    <div class="form-footer">
      <p><Info :size="14" /> All seven days are submitted to the work-schedule API.</p>
      <div class="footer-actions">
        <AppButton type="button" variant="secondary" @click="emit('cancel')">Cancel</AppButton>
        <AppButton type="submit" :icon="Save" :disabled="saving">{{ saving ? 'Saving...' : mode === 'edit' ? 'Save Changes' : 'Save Schedule' }}</AppButton>
      </div>
    </div>
  </form>
</template>

<style scoped>
.schedule-form{display:grid;gap:14px}.form-card{padding:17px;border:1px solid var(--border);border-radius:12px;background:var(--bg-card);box-shadow:var(--shadow)}
.section-heading,.heading-copy{display:flex;align-items:center;gap:10px}.section-heading{margin-bottom:15px}.section-heading.with-actions{justify-content:space-between}.section-icon{display:grid;width:36px;height:36px;flex:none;place-items:center;border-radius:9px}.section-icon.blue{background:var(--primary-soft);color:var(--primary)}.section-icon.green{background:var(--green-soft);color:var(--green)}.section-icon.orange{background:var(--orange-soft);color:var(--orange)}
.section-heading h2{margin:0;color:var(--text-primary);font-size:13px}.section-heading p{margin:4px 0 0;color:var(--text-muted);font-size:10px}.section-actions{display:flex;gap:7px}.text-button{display:inline-flex;align-items:center;gap:5px;padding:7px 9px;border:1px solid var(--border);border-radius:7px;background:var(--bg-card-soft);color:var(--primary);font:inherit;font-size:9px;font-weight:600;cursor:pointer}
.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.field{display:grid;gap:6px}.field>span{color:var(--text-primary);font-size:10px;font-weight:600}.native-input,.day-times input{width:100%;height:40px;padding:0 10px;border:1px solid var(--border);border-radius:7px;outline:0;background:var(--bg-card-soft);color:var(--text-primary);font:inherit;font-size:10px;color-scheme:dark}.native-input:focus,.day-times input:focus{border-color:var(--primary)}
.day-list{display:grid;gap:8px}.day-row{display:flex;min-height:55px;align-items:center;justify-content:space-between;gap:15px;padding:9px 12px;border:1px solid var(--border-soft);border-radius:9px;background:var(--bg-card-soft)}.day-row.disabled{opacity:.68}.day-toggle{display:flex;min-width:130px;align-items:center;gap:9px;color:var(--text-primary);font-size:10px;font-weight:650}.day-toggle input{width:16px;height:16px;accent-color:var(--primary)}.day-times{display:grid;grid-template-columns:145px auto 145px;align-items:end;gap:9px}.day-times label{display:grid;gap:4px}.day-times label span{color:var(--text-muted);font-size:8px}.time-separator{padding-bottom:12px;color:var(--text-muted);font-size:9px}.rest-label{color:var(--text-muted);font-size:9px}.metrics-grid{margin-top:14px;padding-top:14px;border-top:1px solid var(--border-soft)}
.form-footer{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:14px 16px;border:1px solid var(--border);border-radius:11px;background:var(--bg-card)}.form-footer p{display:flex;align-items:center;gap:6px;margin:0;color:var(--text-muted);font-size:9px}.footer-actions{display:flex;gap:8px}
@media(max-width:750px){.form-grid{grid-template-columns:1fr}.section-heading.with-actions,.form-footer{align-items:flex-start;flex-direction:column}.section-actions{flex-wrap:wrap}.day-row{align-items:flex-start;flex-direction:column}.day-times{width:100%;grid-template-columns:1fr auto 1fr}.footer-actions{width:100%;justify-content:flex-end}}
</style>
