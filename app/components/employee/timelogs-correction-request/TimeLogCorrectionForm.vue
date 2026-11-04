<script setup lang="ts">
import { ArrowLeft, CalendarDays, Clock3, FileClock, Save } from 'lucide-vue-next'

import type {
  CreateCorrectionPayload,
  TimeLogCorrectionRecord,
  TimeLogCorrectionType,
  UpdateCorrectionPayload,
} from '~/types/employee/timelogCorrectionRequest/timelogCorrectionRequest'

const props = defineProps<{ mode: 'create' | 'edit' }>()
const route = useRoute()
const router = useRouter()
const api = useTimeLogCorrectionApi()

const base = '/employee/timelog-correction-request'
const requestId = computed(() => String(route.query.id ?? ''))
const editing = computed(() => props.mode === 'edit')
const existing = ref<TimeLogCorrectionRecord | null>(null)
const loadingRecord = ref(false)
const lookingUp = ref(false)
const saving = ref(false)
const error = ref('')
const lookupError = ref('')
let lookupSequence = 0

const localToday = () => {
  const now = new Date()
  return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-')
}

const form = reactive({
  date: localToday(),
  issueType: 'time_in' as TimeLogCorrectionType,
  recordedIn: '',
  recordedOut: '',
  requestedTime: '',
  details: '',
})

const apiErrorMessage = (cause: unknown, fallback: string) => {
  const problem = cause as {
    data?: { message?: string; errors?: Record<string, string[]> }
    response?: { _data?: { message?: string; errors?: Record<string, string[]> } }
    message?: string
  }
  const data = problem.data ?? problem.response?._data
  const validationError = Object.values(data?.errors ?? {}).flat()[0]
  return String(validationError || data?.message || problem.message || fallback)
}

const toInputTime = (value?: string | null) => {
  if (!value) return ''
  const clock = value.match(/^(\d{2}):(\d{2})/)
  if (clock) return `${clock[1]}:${clock[2]}`
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

const lookupTimeLog = async (date: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return

  const sequence = ++lookupSequence
  lookingUp.value = true
  lookupError.value = ''

  try {
    const response = await api.lookup(date)
    if (sequence !== lookupSequence) return

    form.recordedIn = toInputTime(response.data?.time_in)
    form.recordedOut = toInputTime(response.data?.time_out)

    if (!response.data || response.found === false) {
      lookupError.value = response.message || 'No attendance time log was found for this date.'
    }
  } catch (cause: unknown) {
    if (sequence !== lookupSequence) return
    form.recordedIn = ''
    form.recordedOut = ''
    lookupError.value = apiErrorMessage(cause, 'Unable to load the attendance time log.')
  } finally {
    if (sequence === lookupSequence) lookingUp.value = false
  }
}

const hydrate = (request: TimeLogCorrectionRecord) => {
  form.date = request.work_date?.slice(0, 10) || localToday()
  form.issueType = request.correction_type
  form.recordedIn = toInputTime(request.original_time_in)
  form.recordedOut = toInputTime(request.original_time_out)
  form.requestedTime = toInputTime(request.requested_time)
  form.details = request.reason || ''
}

const loadExisting = async () => {
  if (!editing.value) return
  if (!requestId.value) {
    error.value = 'A valid request ID is required.'
    return
  }

  loadingRecord.value = true
  error.value = ''
  try {
    const response = await api.show(requestId.value)
    existing.value = response.data
    hydrate(response.data)
  } catch (cause: unknown) {
    existing.value = null
    error.value = apiErrorMessage(cause, 'Unable to load the correction request.')
  } finally {
    loadingRecord.value = false
  }
}

watch(() => form.date, date => {
  if (!editing.value && !loadingRecord.value) void lookupTimeLog(date)
})

onMounted(() => {
  if (editing.value) void loadExisting()
  else void lookupTimeLog(form.date)
})

const save = async () => {
  error.value = ''
  if (saving.value) return
  if (editing.value && !existing.value) { error.value = 'Request was not found.'; return }
  if (editing.value && existing.value?.status.toLowerCase() !== 'pending') { error.value = 'Only pending requests can be edited.'; return }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date)) { error.value = 'Select a valid attendance date.'; return }
  if (lookingUp.value) { error.value = 'Wait for the attendance time log to finish loading.'; return }
  if (lookupError.value) { error.value = lookupError.value; return }
  if (!form.requestedTime) { error.value = 'Enter the requested corrected time.'; return }
  if (!form.details.trim()) { error.value = 'Provide a reason for the correction.'; return }

  const payload: UpdateCorrectionPayload = {
    correction_type: form.issueType,
    requested_time: form.requestedTime,
    reason: form.details.trim(),
  }

  saving.value = true
  try {
    if (editing.value) {
      await api.update(requestId.value, payload)
      await router.push({ path: base, query: { updated: '1' } })
    } else {
      await api.create({ ...payload, work_date: form.date } as CreateCorrectionPayload)
      await router.push({ path: base, query: { submitted: '1' } })
    }
  } catch (cause: unknown) {
    error.value = apiErrorMessage(cause, editing.value ? 'Failed to update request.' : 'Failed to submit request.')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="correction-form-page">
    <NuxtLink :to="base" class="back-link"><ArrowLeft :size="16" /> Back to Time Log Correction Requests</NuxtLink>
    <div class="heading"><div class="heading-icon"><FileClock :size="24" /></div><div><h1>{{ editing ? 'Edit' : 'New' }} Time Log Correction Request</h1><p>Submit accurate attendance information for HR review.</p></div></div>

    <div v-if="loadingRecord" class="form-card missing">Loading correction request...</div>
    <div v-else-if="editing && !existing" class="form-card missing">{{ error || 'Request not found. Verify the link or return to your request list.' }}</div>
    <div v-else-if="editing && existing?.status.toLowerCase() !== 'pending'" class="form-card missing">This request is {{ existing?.status.toLowerCase() }} and can no longer be edited.</div>
    <form v-else class="form-card" @submit.prevent="save">
      <div class="section-heading"><CalendarDays :size="17" /><div><h2>Attendance Information</h2><p>Choose the date and the time log issue.</p></div></div>
      <div class="fields">
        <label><span>Attendance Date <b>*</b></span><input v-model="form.date" type="date" required :max="localToday()" :disabled="editing"></label>
        <label><span>Correction Type <b>*</b></span><select v-model="form.issueType"><option value="time_in">Time In</option><option value="time_out">Time Out</option></select></label>
      </div>

      <div class="section-heading second"><Clock3 :size="17" /><div><h2>Time Log Details</h2><p>Recorded times come from the attendance record for the selected date.</p></div></div>
      <div class="fields">
        <label><span>Recorded Time In</span><input v-model="form.recordedIn" type="time" readonly></label>
        <label><span>Recorded Time Out</span><input v-model="form.recordedOut" type="time" readonly></label>
        <label class="full"><span>Requested Corrected Time <b>*</b></span><input v-model="form.requestedTime" type="time" required></label>
        <label class="full"><span>Reason / Explanation <b>*</b></span><textarea v-model="form.details" rows="4" required minlength="5" maxlength="2000" placeholder="Explain why your attendance time log needs correction..."></textarea></label>
      </div>

      <p v-if="lookingUp" class="lookup-note">Loading the recorded attendance times...</p>
      <p v-else-if="lookupError" class="error" role="alert">{{ lookupError }}</p>
      <p class="note">A correction request does not directly change attendance. HR must review and approve it first.</p>
      <p v-if="error" class="error" role="alert">{{ error }}</p>
      <div class="actions"><NuxtLink :to="base" class="cancel">Cancel</NuxtLink><button type="submit" :disabled="saving || lookingUp"><Save :size="16" />{{ saving ? 'Saving…' : editing ? 'Update Request' : 'Submit Request' }}</button></div>
    </form>
  </section>
</template>

<style scoped>
.correction-form-page { max-width: 930px; margin: 0 auto; color: var(--text-primary); }
.back-link { display: inline-flex; align-items: center; gap: 7px; margin-bottom: 20px; color: var(--primary); font-size: 12px; font-weight: 600; text-decoration: none; }
.heading { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; }
.heading-icon { display: grid; width: 52px; height: 52px; place-items: center; border-radius: 12px; background: var(--primary-soft); color: var(--primary); }
.heading h1 { margin: 0 0 5px; font-size: 24px; }.heading p, .section-heading p { margin: 0; color: var(--text-secondary); font-size: 12px; }
.form-card { padding: 24px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); box-shadow: var(--shadow); }.missing { color: var(--text-secondary); font-size: 13px; }
.section-heading { display: flex; align-items: center; gap: 10px; margin-bottom: 19px; color: var(--primary); }.section-heading h2 { margin: 0 0 4px; color: var(--text-primary); font-size: 15px; }.section-heading.second { margin-top: 28px; padding-top: 24px; border-top: 1px solid var(--border-soft); }
.fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 17px; }.fields label { display: flex; min-width: 0; flex-direction: column; gap: 7px; color: var(--text-secondary); font-size: 12px; }.fields b { color: var(--red, #dc2626); }.fields label.full { grid-column: 1 / -1; }
.fields input, .fields select, .fields textarea { width: 100%; min-height: 42px; box-sizing: border-box; padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; outline: 0; background: var(--bg-card-soft); color: var(--text-primary); font: inherit; font-size: 13px; }.fields textarea { min-height: 110px; resize: vertical; }.fields input:focus, .fields select:focus, .fields textarea:focus { border-color: var(--primary); box-shadow: 0 0 0 2px var(--primary-soft); }.fields input[readonly] { color: var(--text-secondary); cursor: default; }
.lookup-note { margin: 14px 0 0; color: var(--text-secondary); font-size: 12px; }.note { margin: 19px 0 0; padding: 11px 13px; border-radius: 8px; background: var(--primary-soft); color: var(--text-secondary); font-size: 11px; }.error { margin-top: 14px; color: var(--red, #dc2626); font-size: 12px; }
.actions { display: flex; align-items: center; justify-content: flex-end; gap: 10px; margin-top: 26px; }.actions a, .actions button { display: inline-flex; min-height: 40px; align-items: center; justify-content: center; gap: 7px; padding: 10px 17px; border-radius: 8px; font-size: 12px; font-weight: 600; text-decoration: none; }.cancel { border: 1px solid var(--border); color: var(--text-primary); }.actions button { border: 0; background: linear-gradient(135deg, #1f68f2, #2878ff); color: #fff; cursor: pointer; }.actions button:disabled { opacity: .5; cursor: wait; }
@media (max-width: 640px) { .form-card { padding: 16px; }.heading h1 { font-size: 20px; }.fields { grid-template-columns: 1fr; }.actions { display: grid; grid-template-columns: 1fr 1fr; } }
</style>
