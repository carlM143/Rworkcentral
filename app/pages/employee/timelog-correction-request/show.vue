<script setup lang="ts">
import { ArrowLeft, Ban, FileClock, Pencil, RefreshCw } from 'lucide-vue-next'

import type { TimeLogCorrectionRecord } from '~/types/employee/timelogCorrectionRequest/timelogCorrectionRequest'

useHead({ title: 'Time Log Correction Details | RWorkCentral' })

const route = useRoute()
const api = useTimeLogCorrectionApi()
const id = computed(() => String(route.query.id ?? ''))
const request = ref<TimeLogCorrectionRecord | null>(null)
const loading = ref(false)
const cancelling = ref(false)
const loadError = ref('')

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

const loadRequest = async () => {
  if (!id.value) {
    loadError.value = 'A valid request ID is required.'
    return
  }

  loading.value = true
  loadError.value = ''
  try {
    const response = await api.show(id.value)
    request.value = response.data
  } catch (cause: unknown) {
    request.value = null
    loadError.value = apiErrorMessage(cause, 'Unable to load the correction request.')
  } finally {
    loading.value = false
  }
}

const formatDate = (value?: string | null) => {
  if (!value) return '—'
  const day = value.slice(0, 10)
  const date = new Date(`${day}T12:00:00`)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

const formatTime = (value?: string | null) => {
  if (!value) return '—'
  const match = value.match(/^(\d{2}):(\d{2})/)
  if (!match) return value
  const hours = Number(match[1])
  return `${hours % 12 || 12}:${match[2]} ${hours >= 12 ? 'PM' : 'AM'}`
}

const correctionLabel = computed(() =>
  request.value?.correction_type === 'time_out' ? 'Time Out' : 'Time In',
)

const statusLabel = computed(() => {
  const status = request.value?.status || ''
  return status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : '—'
})

const cancelRequest = async () => {
  if (!request.value || cancelling.value) return
  if (!window.confirm('Cancel this pending time log correction request?')) return

  cancelling.value = true
  loadError.value = ''
  try {
    await api.cancel(request.value.id)
    await loadRequest()
  } catch (cause: unknown) {
    loadError.value = apiErrorMessage(cause, 'Unable to cancel the correction request.')
  } finally {
    cancelling.value = false
  }
}

onMounted(() => void loadRequest())
</script>

<template>
  <section class="details-page">
    <NuxtLink to="/employee/timelog-correction-request" class="back"><ArrowLeft :size="16" /> Back to Requests</NuxtLink>
    <header class="header"><div><h1>Time Log Correction Details</h1><p>Review your submitted attendance correction request.</p></div><FileClock :size="28" /></header>

    <div v-if="loading" class="details-card missing">Loading correction request...</div>
    <div v-else-if="!request" class="details-card missing">
      <p>{{ loadError || 'Request not found or the link is invalid.' }}</p>
      <button v-if="id" type="button" class="retry" @click="loadRequest"><RefreshCw :size="15" /> Try Again</button>
    </div>

    <article v-else class="details-card">
      <p v-if="loadError" class="error" role="alert">{{ loadError }}</p>
      <div class="card-heading"><div><h2>Request #{{ request.id }}</h2><p>{{ correctionLabel }} correction</p></div><span class="status" :class="request.status.toLowerCase()">{{ statusLabel }}</span></div>
      <dl class="details-grid">
        <div><dt>Attendance Date</dt><dd>{{ formatDate(request.work_date) }}</dd></div>
        <div><dt>Filing Date</dt><dd>{{ formatDate(request.created_at) }}</dd></div>
        <div><dt>Correction Type</dt><dd>{{ correctionLabel }}</dd></div>
      
        <div><dt>Recorded Time Out</dt><dd>{{ formatTime(request.original_time_out) }}</dd></div>
        <div><dt>Requested Time</dt><dd>{{ formatTime(request.requested_time) }}</dd></div>
        <div><dt>Reviewed At</dt><dd>{{ formatDate(request.reviewed_at) }}</dd></div>
        <div class="full"><dt>Reason / Explanation</dt><dd class="notes">{{ request.reason }}</dd></div>
        <div v-if="request.review_remarks" class="full"><dt>HR Review Remarks</dt><dd class="notes">{{ request.review_remarks }}</dd></div>
        <div v-if="request.attachment_path" class="full"><dt>Attachment</dt><dd>{{ request.attachment_path }}</dd></div>
      </dl>
      <div class="actions">
        <NuxtLink to="/employee/timelog-correction-request" class="close">Close</NuxtLink>
        <button v-if="request.status.toLowerCase() === 'pending'" type="button" class="cancel-request" :disabled="cancelling" @click="cancelRequest"><Ban :size="15" /> {{ cancelling ? 'Cancelling…' : 'Cancel Request' }}</button>
        <NuxtLink v-if="request.status.toLowerCase() === 'pending'" :to="{ path: '/employee/timelog-correction-request/edit', query: { id } }" class="edit"><Pencil :size="15" /> Edit Request</NuxtLink>
      </div>
    </article>
  </section>
</template>

<style scoped>
.details-page { max-width: 930px; margin: 0 auto; color: var(--text-primary); }.back { display: inline-flex; align-items: center; gap: 7px; margin-bottom: 20px; color: var(--primary); font-size: 12px; font-weight: 600; text-decoration: none; }.header { display: flex; align-items: center; justify-content: space-between; gap: 18px; margin-bottom: 18px; }.header svg { color: var(--primary); }.header h1 { margin: 0 0 7px; font-size: 24px; }.header p, .card-heading p { margin: 0; color: var(--text-secondary); font-size: 12px; }
.details-card { padding: 24px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); box-shadow: var(--shadow); }.card-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-bottom: 22px; border-bottom: 1px solid var(--border-soft); }.card-heading h2 { margin: 0 0 4px; font-size: 16px; }.status { padding: 7px 11px; border-radius: 6px; background: var(--bg-card-soft); color: var(--text-secondary); font-size: 11px; font-weight: 600; }.status.pending { background: var(--orange-soft); color: var(--orange); }.status.approved { background: var(--green-soft); color: var(--green); }.status.rejected, .status.cancelled { background: var(--red-soft); color: var(--red); }
.details-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 21px; padding: 24px 0; margin: 0; }.details-grid dt { margin-bottom: 7px; color: var(--text-muted); font-size: 11px; }.details-grid dd { margin: 0; color: var(--text-primary); font-size: 13px; overflow-wrap: anywhere; }.details-grid .full { grid-column: 1 / -1; }.notes { white-space: pre-wrap; line-height: 1.7; }
.actions { display: flex; justify-content: flex-end; flex-wrap: wrap; gap: 9px; margin-top: 18px; }.actions a, .actions button, .retry { display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 10px 16px; border-radius: 8px; font: inherit; font-size: 12px; font-weight: 600; text-decoration: none; cursor: pointer; }.close, .retry { border: 1px solid var(--border); background: transparent; color: var(--text-primary); }.edit { background: var(--primary); color: #fff; }.cancel-request { border: 1px solid var(--red); background: var(--red-soft); color: var(--red); }.cancel-request:disabled { opacity: .55; cursor: wait; }
.missing { color: var(--text-secondary); font-size: 12px; }.missing p { margin: 0 0 14px; }.error { margin: 0 0 14px; color: var(--red); font-size: 12px; }
@media (max-width: 600px) { .details-card { padding: 16px; }.details-grid { grid-template-columns: 1fr; gap: 15px; }.details-grid .full { grid-column: auto; }.header h1 { font-size: 21px; }.actions { display: grid; grid-template-columns: 1fr; } }
</style>
