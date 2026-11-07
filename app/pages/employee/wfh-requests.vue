<script setup lang="ts">
import { House, Plus, X } from 'lucide-vue-next'

definePageMeta({ layout: false, middleware: 'employee' })
interface WfhRequest { id: number; request_no: string; start_date: string; end_date: string; number_of_days: number; supervisor_name: string; reason: string; request_date: string; status: string; remarks: string | null }
const { $api } = useNuxtApp()
const { success } = useToast()
const records = ref<WfhRequest[]>([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const formError = ref('')
const formOpen = ref(false)
const selected = ref<WfhRequest | null>(null)
const previewDays = ref<number | null>(null)
const previewLoading = ref(false)
const form = reactive({ start_date: '', end_date: '', supervisor_name: '', reason: '' })
const load = async () => {
  loading.value = true
  error.value = ''
  try { records.value = (await $api<{ data: WfhRequest[] }>('/employee/wfh-requests')).data }
  catch (problem: any) { error.value = problem?.data?.message || 'Unable to load work-from-home requests.' }
  finally { loading.value = false }
}
onMounted(load)
const openForm = () => {
  Object.assign(form, { start_date: '', end_date: '', supervisor_name: '', reason: '' })
  previewDays.value = null
  formError.value = ''
  formOpen.value = true
}
let previewVersion = 0
watch([() => form.start_date, () => form.end_date], async ([start, end]) => {
  const version = ++previewVersion
  previewDays.value = null
  formError.value = ''
  if (!start || !end || end < start) { previewLoading.value = false; return }
  previewLoading.value = true
  try {
    const response = await $api<{ data: { number_of_days: number } }>('/employee/wfh-requests/preview', { method: 'POST', body: { start_date: start, end_date: end } })
    if (version === previewVersion) previewDays.value = response.data.number_of_days
  } catch (problem: any) {
    if (version === previewVersion) formError.value = String(Object.values(problem?.data?.errors ?? {}).flat()[0] || problem?.data?.message || 'Unable to calculate scheduled days.')
  } finally { if (version === previewVersion) previewLoading.value = false }
})
const submit = async () => {
  if (previewLoading.value || previewDays.value === null) { formError.value = 'Select a valid date range and wait for the scheduled-day calculation.'; return }
  saving.value = true
  formError.value = ''
  try {
    await $api('/employee/wfh-requests', { method: 'POST', body: { ...form, supervisor_name: form.supervisor_name.trim(), reason: form.reason.trim() } })
    formOpen.value = false
    success('Request Submitted', 'Your work-from-home request is pending admin approval.')
    await load()
  } catch (problem: any) { formError.value = String(Object.values(problem?.data?.errors ?? {}).flat()[0] || problem?.data?.message || 'Unable to submit request.') }
  finally { saving.value = false }
}
</script>

<template>
  <section class="wfh-page">
    <header class="header"><div><h1>Work From Home</h1><p>Submit and track your work-from-home requests.</p></div><button type="button" class="primary" @click="openForm"><Plus :size="16" /> New Request</button></header>
    <p v-if="error" class="error" role="alert">{{ error }} <button type="button" @click="load">Retry</button></p>
    <div class="panel">
      <div class="panel-heading"><div><h2>My Requests</h2><p>Requests are reviewed by your administrator.</p></div><button type="button" :disabled="loading" @click="load">Refresh</button></div>
      <p v-if="loading" role="status">Loading requests…</p>
      <p v-else-if="!error && !records.length">No work-from-home requests yet.</p>
      <template v-else-if="!error">
        <div class="table-wrap"><table><thead><tr><th>Request</th><th>Dates</th><th>Days</th><th>Supervisor</th><th>Status</th><th></th></tr></thead><tbody>
          <tr v-for="record in records" :key="record.id"><td>{{ record.request_no }}</td><td>{{ record.start_date }} – {{ record.end_date }}</td><td>{{ record.number_of_days }}</td><td>{{ record.supervisor_name }}</td><td><span class="status" :class="record.status">{{ record.status }}</span></td><td><button type="button" @click="selected = record">Details</button></td></tr>
        </tbody></table></div>
        <div class="mobile-requests">
          <button v-for="record in records" :key="record.id" type="button" class="request-card" :aria-label="`View ${record.request_no} details`" @click="selected = record">
            <span class="request-card-header"><strong>{{ record.request_no }}</strong><span class="status" :class="record.status">{{ record.status }}</span></span>
            <span class="request-card-dates">{{ record.start_date }} – {{ record.end_date }}</span>
            <span class="request-card-meta">{{ record.number_of_days }} {{ record.number_of_days === 1 ? 'day' : 'days' }} · {{ record.supervisor_name }}</span>
            <span class="request-card-link">View details →</span>
          </button>
        </div>
      </template>
    </div>
    <div v-if="formOpen" class="overlay" @click.self="!saving && (formOpen = false)">
      <form class="dialog" role="dialog" aria-modal="true" aria-labelledby="wfh-title" @submit.prevent="submit">
        <div class="dialog-heading"><h2 id="wfh-title"><House :size="18" /> New Work-from-Home Request</h2><button type="button" aria-label="Close" :disabled="saving" @click="formOpen = false"><X :size="20" /></button></div>
        <p v-if="formError" class="error" role="alert">{{ formError }}</p>
        <fieldset :disabled="saving">
          <label>Start date<input v-model="form.start_date" type="date" required /></label>
          <label>End date<input v-model="form.end_date" type="date" :min="form.start_date" required /></label>
          <p v-if="previewLoading" role="status">Calculating scheduled days…</p><p v-else-if="previewDays !== null">Scheduled work-from-home days: <strong>{{ previewDays }}</strong></p>
          <label>Supervisor name<input v-model="form.supervisor_name" maxlength="255" required /></label>
          <label>Reason<textarea v-model="form.reason" maxlength="1000" rows="4" required /></label>
          <button type="submit" class="primary" :disabled="previewLoading || previewDays === null">{{ saving ? 'Submitting…' : 'Submit Request' }}</button>
        </fieldset>
      </form>
    </div>
    <div v-if="selected" class="overlay" @click.self="selected = null"><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="wfh-detail">
      <div class="dialog-heading"><h2 id="wfh-detail">{{ selected.request_no }}</h2><button type="button" aria-label="Close" @click="selected = null"><X :size="20" /></button></div>
      <p><strong>Status:</strong> {{ selected.status }}</p><p><strong>Dates:</strong> {{ selected.start_date }} – {{ selected.end_date }} ({{ selected.number_of_days }} days)</p>
      <p><strong>Supervisor:</strong> {{ selected.supervisor_name }}</p><p><strong>Reason:</strong> {{ selected.reason }}</p><p v-if="selected.remarks"><strong>Admin remarks:</strong> {{ selected.remarks }}</p>
    </section></div>
  </section>
</template>

<style scoped>
.wfh-page { max-width: 1400px; margin: auto; color: var(--text-primary); } .header, .panel-heading, .dialog-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
h1 { margin: 0 0 7px; font-size: 27px; font-weight: 700; letter-spacing: -.7px; } h2 { display: flex; align-items: center; gap: 8px; margin: 0; font-size: 14px; font-weight: 600; } p { margin: 4px 0 0; color: var(--text-secondary); font-size: 12px; line-height: 1.7; }
.panel { margin-top: 20px; padding: 20px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); }
button, input, textarea { font-family: inherit; font-size: 12px; color: var(--text-primary); background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 9px 12px; } button { font-weight: 600; cursor: pointer; } button:disabled { opacity: .5; cursor: default; }
.primary { display: inline-flex; align-items: center; justify-content: center; gap: 6px; background: var(--primary); color: white; }
.table-wrap { overflow-x: auto; } table { width: 100%; border-collapse: collapse; font-size: 11px; } th, td { text-align: left; padding: 12px; border-bottom: 1px solid var(--border); white-space: nowrap; } th { font-size: 10px; font-weight: 500; color: var(--text-secondary); background: var(--bg-card-soft); } .panel-heading p { font-size: 10px; color: var(--text-muted); }
.mobile-requests { display: none; }
.status { text-transform: capitalize; border-radius: 8px; padding: 4px 8px; background: #eab30822; color: #d18b00; } .status.approved { background: #22c55e22; color: #16a34a; } .status.rejected { background: #ef444422; color: #ef4444; }
.overlay { position: fixed; inset: 0; z-index: 1000; background: #0009; display: flex; align-items: center; justify-content: center; padding: 20px; } .dialog { width: min(560px, 100%); max-height: 90vh; overflow: auto; background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 24px; }
.dialog-heading { flex-wrap: nowrap; align-items: flex-start; margin-bottom: 18px; }
.dialog-heading h2 { flex: 1; min-width: 0; line-height: 1.45; }
.dialog-heading h2 svg { flex-shrink: 0; }
.dialog-heading > button { flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; padding: 8px; }
fieldset { border: 0; padding: 0; display: grid; gap: 14px; } label { display: flex; flex-direction: column; gap: 6px; font-size: 11px; font-weight: 500; color: var(--text-secondary); } .dialog-heading h2 { font-size: 15px; } .error { color: #ef4444; }
@media (max-width: 600px) {
  .panel { padding: 14px; } .header .primary { width: 100%; }
  .panel-heading { align-items: flex-start; margin-bottom: 14px; }
  .table-wrap { display: none; }
  .mobile-requests { display: grid; gap: 10px; }
  .request-card { display: flex; flex-direction: column; align-items: stretch; gap: 7px; width: 100%; padding: 12px; text-align: left; background: var(--bg-card-soft); font-size: 11px; }
  .request-card-header { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
  .request-card-dates { color: var(--text-primary); }
  .request-card-meta { color: var(--text-secondary); overflow-wrap: anywhere; }
  .request-card-link { color: var(--primary); font-weight: 600; }
  .overlay { padding: 12px; }
  .dialog { padding: 18px; max-height: calc(100dvh - 24px); }
}
</style>
