<script setup lang="ts">
import { ArrowLeft, Briefcase, Send, X, ImagePlus } from 'lucide-vue-next'
import { getObaApiError, useObaRequest } from '~/composables/employee/oba-request/useObaRequest'
import ObaEmployeePicker from '~/components/employee/oba-request/ObaEmployeePicker.vue'
import type { ObaAvailableEmployee, ObaRequestPayload } from '~/types/employee/oba-request/obaRequest'

definePageMeta({ layout: false })
useHead({ title: 'New OBA Request | Employee Portal — RWorkCentral' })

const selectedEmployees = ref<ObaAvailableEmployee[]>([])

const MAX_FILES = 5
const MAX_SIZE = 5 * 1024 * 1024

const router = useRouter()
const api = useObaRequest()

const pad = (n: number) => String(n).padStart(2, '0')
const localDateKey = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
const today = localDateKey()

const form = reactive({
  destination: '',
  reason: '',
  requestDate: today,
  departureTime: '',
  returnTime: '',
})
const files = ref<{ file: File; preview: string }[]>([])
const isSubmitting = ref(false)
const formError = ref('')

const toMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

const durationText = computed(() => {
  if (!form.departureTime || !form.returnTime) return ''
  const mins = toMinutes(form.returnTime) - toMinutes(form.departureTime)
  if (mins <= 0) return ''
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h ? (m ? `${h} hr ${m} min` : `${h} hr`) : `${m} min`
})

const onFiles = (event: Event) => {
  const input = event.target as HTMLInputElement
  formError.value = ''
  for (const file of Array.from(input.files || [])) {
    if (files.value.length >= MAX_FILES) { formError.value = `You can attach up to ${MAX_FILES} images.`; break }
    if (!['image/jpeg', 'image/png'].includes(file.type)) { formError.value = 'Only JPG and PNG images are allowed.'; continue }
    if (file.size > MAX_SIZE) { formError.value = `${file.name} is larger than 5 MB.`; continue }
    files.value.push({ file, preview: URL.createObjectURL(file) })
  }
  input.value = ''
}
const removeFile = (index: number) => {
  const [removed] = files.value.splice(index, 1)
  if (removed) URL.revokeObjectURL(removed.preview)
}
onBeforeUnmount(() => files.value.forEach(item => URL.revokeObjectURL(item.preview)))

const goBack = () => router.push('/employee/requests/oba-requests')

const validateForm = () => {
  formError.value = ''
  if (!form.destination.trim()) { formError.value = 'Please enter the destination.'; return false }
  if (!form.requestDate) { formError.value = 'Please choose the date of the request.'; return false }
  if (form.requestDate < today) { formError.value = 'The date cannot be before today.'; return false }
  if (!form.departureTime) { formError.value = 'Please choose the departure time.'; return false }
  if (!form.returnTime) { formError.value = 'Please choose the return time.'; return false }
  if (toMinutes(form.returnTime) <= toMinutes(form.departureTime)) { formError.value = 'The return time must be later than the departure time.'; return false }
  if (!selectedEmployees.value.length) { formError.value = 'Please add at least one employee.'; return false }
  if (!form.reason.trim()) { formError.value = 'Please provide a reason.'; return false }
  return true
}

const saveRequest = async () => {
  if (isSubmitting.value || !validateForm()) return
  isSubmitting.value = true
  try {
    const payload: ObaRequestPayload = {
      destination: form.destination.trim(),
      reason: form.reason.trim(),
      date_request: form.requestDate,
      time_from: form.departureTime,
      time_to: form.returnTime,
      employee_ids: selectedEmployees.value.map(e => e.id),
      images: files.value.map(item => item.file),
    }
    const res = await api.create(payload)
    if (!res.success) throw new Error(res.message || 'Request was not saved.')
    await router.push({ path: '/employee/requests/oba-requests', query: { submitted: '1' } })
  } catch (error: unknown) {
    formError.value = getObaApiError(error, 'Failed to submit the OBA request.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="oba-page">
    <header class="page-header">
      <button type="button" class="back-button" aria-label="Back to OBA requests" @click="goBack"><ArrowLeft :size="20" /></button>
      <div>
        <p class="eyebrow">Official Business Authorization</p>
        <h1>New OBA Request</h1>
        <p class="page-description">List the employees going out. Your Department Head and HR will review it.</p>
      </div>
    </header>

    <form class="request-form" novalidate @submit.prevent="saveRequest">
      <div class="form-card">
        <div class="section-heading">
          <span class="section-icon"><Briefcase :size="20" /></span>
          <div><h2>Official Business Details</h2><p>Your Department Head approves first, then HR.</p></div>
        </div>

        <label>
          <span>Destination <em>*</em></span>
          <input v-model="form.destination" type="text" maxlength="255" placeholder="e.g. Client office, Makati City" required>
        </label>

        <label>
          <span>Date of Request <em>*</em></span>
          <input v-model="form.requestDate" type="date" :min="today" required>
        </label>

        <div class="pair">
          <label><span>Departure Time <em>*</em></span><input v-model="form.departureTime" type="time" required></label>
          <label><span>Return Time <em>*</em></span><input v-model="form.returnTime" type="time" required></label>
        </div>

        <p v-if="durationText" class="duration-pill">Duration: <strong>{{ durationText }}</strong></p>

        <div class="upload-field">
          <span class="field-label">Employees covered <em>*</em> <small>(include yourself if you are going)</small></span>
          <ObaEmployeePicker v-model="selectedEmployees" :disabled="isSubmitting" />
        </div>

        <label class="reason-field">
          <span>Particulars / Reason <em>*</em></span>
          <textarea v-model="form.reason" maxlength="2000" rows="5" required placeholder="Explain the purpose of your official business." />
          <small>{{ form.reason.length }}/2000</small>
        </label>

        <div class="upload-field">
          <span class="field-label">Supporting Images <small>(optional · up to {{ MAX_FILES }} · JPG/PNG · 5 MB each)</small></span>
          <label class="upload-button">
            <ImagePlus :size="17" /> Add images
            <input type="file" accept="image/jpeg,image/png" multiple hidden @change="onFiles">
          </label>
          <div v-if="files.length" class="thumbs">
            <div v-for="(item, index) in files" :key="item.preview" class="thumb">
              <img :src="item.preview" :alt="item.file.name">
              <button type="button" :aria-label="`Remove ${item.file.name}`" @click="removeFile(index)"><X :size="14" /></button>
            </div>
          </div>
        </div>

        <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>
      </div>

      <div class="action-bar">
        <button type="button" class="cancel-button" :disabled="isSubmitting" @click="goBack">Cancel</button>
        <button type="submit" class="submit-button" :disabled="isSubmitting">
          <Send :size="18" /> {{ isSubmitting ? 'Submitting...' : 'Submit Request' }}
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.oba-page { width: min(100%, 860px); margin: 0 auto; padding-bottom: 24px; }
.page-header { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 18px; }
.back-button { display: grid; place-items: center; flex: 0 0 42px; width: 42px; height: 42px; padding: 0; border: 1px solid var(--border); border-radius: 11px; background: var(--bg-card); color: var(--text-primary); cursor: pointer; }
.back-button:hover { border-color: var(--primary); color: var(--primary); }
.eyebrow { margin: 0 0 3px; color: var(--primary); font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
h1 { margin: 0; color: var(--text-primary); font-size: clamp(22px, 3vw, 28px); line-height: 1.2; }
h2 { margin: 0; color: var(--text-primary); font-size: 15px; }
p { margin: 3px 0 0; color: var(--text-secondary); font-size: 12px; line-height: 1.6; }
.request-form { display: grid; gap: 14px; }
.form-card { display: grid; gap: 18px; padding: clamp(16px, 3vw, 26px); border: 1px solid var(--border); border-radius: 14px; background: var(--bg-card); box-shadow: 0 14px 38px rgb(0 0 0 / 8%); }
.section-heading { display: flex; align-items: center; gap: 12px; padding-bottom: 17px; border-bottom: 1px solid var(--border-soft); }
.section-icon { display: grid; place-items: center; flex: 0 0 42px; width: 42px; height: 42px; border-radius: 11px; background: var(--primary-soft); color: var(--primary); }
.pair { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
label { display: grid; gap: 7px; min-width: 0; }
label > span, .field-label { color: var(--text-primary); font-size: 12px; font-weight: 650; }
.field-label small { color: var(--text-muted); font-weight: 400; }
em { color: var(--red, #ef4444); font-style: normal; }
input:not([type="file"]), textarea { width: 100%; box-sizing: border-box; border: 1px solid var(--border); border-radius: 9px; background: var(--bg-card-soft); color: var(--text-primary); font: inherit; font-size: 13px; outline: none; }
input:not([type="file"]) { min-height: 44px; padding: 0 12px; }
textarea { min-height: 116px; padding: 12px 12px 28px; resize: vertical; }
input:focus, textarea:focus { border-color: var(--primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 14%, transparent); }
.reason-field { position: relative; }
.reason-field small { position: absolute; right: 10px; bottom: 8px; color: var(--text-muted); font-size: 10px; }
.duration-pill { margin: -6px 0 0; padding: 8px 12px; border: 1px solid var(--border-soft); border-radius: 8px; background: var(--bg-card-soft); }
.duration-pill strong { color: var(--text-primary); }
.upload-field { display: grid; gap: 9px; }
.upload-button { display: inline-flex; align-items: center; gap: 8px; width: fit-content; min-height: 40px; padding: 0 14px; border: 1px dashed var(--primary); border-radius: 9px; background: var(--primary-soft); color: var(--primary); font-size: 12px; font-weight: 600; cursor: pointer; }
.thumbs { display: flex; flex-wrap: wrap; gap: 10px; }
.thumb { position: relative; width: 84px; height: 84px; overflow: hidden; border: 1px solid var(--border); border-radius: 9px; }
.thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.thumb button { position: absolute; top: 4px; right: 4px; display: grid; place-items: center; width: 22px; height: 22px; padding: 0; border: 0; border-radius: 50%; background: #000a; color: #fff; cursor: pointer; }
.form-error { margin: 0; padding: 11px 13px; border: 1px solid #ef444440; border-radius: 9px; background: #ef444414; color: var(--red, #ef4444); font-size: 12px; }
.action-bar { display: flex; justify-content: flex-end; gap: 10px; padding: 14px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); }
.action-bar button { min-height: 44px; padding: 0 18px; border-radius: 9px; font: inherit; font-size: 12px; font-weight: 700; cursor: pointer; }
.cancel-button { border: 1px solid var(--border); background: var(--bg-card-soft); color: var(--text-primary); }
.submit-button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: 1px solid var(--primary); background: var(--primary); color: #fff; }
.action-bar button:disabled { opacity: .6; cursor: not-allowed; }
@media (max-width: 850px) {
  .oba-page { padding-bottom: calc(92px + env(safe-area-inset-bottom)); }
  input:not([type="file"]), textarea { font-size: 16px; }
  .action-bar { position: fixed; z-index: 25; right: 0; bottom: calc(64px + env(safe-area-inset-bottom)); left: 0; padding: 10px 14px; border-width: 1px 0 0; border-radius: 0; box-shadow: 0 -8px 24px rgb(0 0 0 / 14%); }
  .cancel-button { flex: 0 0 34%; }
  .submit-button { flex: 1; }
}
</style>