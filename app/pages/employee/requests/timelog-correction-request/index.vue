<script setup lang="ts">
import { Plus, Search } from 'lucide-vue-next'
import TimelogCorrectionTable from '~/components/employee/timelogs-correction-request/TimelogCorrectionTable.vue'
import TimeLogCorrectionStats from '~/components/employee/timelogs-correction-request/TimeLogCorrectionStats.vue'

import type { TimeLogCorrectionRecord } from '~/types/employee/timelogCorrectionRequest/timelogCorrectionRequest'

// The existing Employee Portal API calls these requests "Attendance Report".
// This list also allows a future dedicated "Time Log Correction" request type.
useHead({ title: 'Time Log Correction Requests | RWorkCentral' })

const BASE = '/employee/requests/timelog-correction-request'

const route = useRoute()
const api = useTimeLogCorrectionApi()
const requests = ref<TimeLogCorrectionRecord[]>([])
const loading = ref(false)
const loadError = ref('')
const cancellingId = ref<number | null>(null)
const search = ref('')
const status = ref('All')

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

const loadRequests = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const response = await api.list()
    const payload: unknown = response.data
    requests.value = Array.isArray(payload)
      ? payload
      : Array.isArray((payload as { data?: unknown[] })?.data)
        ? (payload as { data: TimeLogCorrectionRecord[] }).data
        : []
  } catch (cause: unknown) {
    requests.value = []
    loadError.value = apiErrorMessage(cause, 'Unable to load time log correction requests.')
  } finally {
    loading.value = false
  }
}

const filteredRequests = computed(() => requests.value.filter(request => {
  const statusMatches = status.value === 'All' ||
    request.status.toLowerCase() === status.value.toLowerCase()
  const keyword = search.value.trim().toLowerCase()
  const textMatches = !keyword ||
    [request.id, request.correction_type, request.work_date, request.reason, request.status]
      .some(value => String(value ?? '').toLowerCase().includes(keyword))
  return statusMatches && textMatches
}))

const viewRequest = (id: number) => navigateTo({ path: `${BASE}/show`, query: { id: String(id) } })

const cancelRequest = async (id: number) => {
  if (!Number.isInteger(id) || cancellingId.value !== null) return
  if (!window.confirm('Cancel this pending time log correction request?')) return

  cancellingId.value = id
  loadError.value = ''
  try {
    await api.cancel(id)
    await loadRequests()
  } catch (cause: unknown) {
    loadError.value = apiErrorMessage(cause, 'Unable to cancel the correction request.')
  } finally {
    cancellingId.value = null
  }
}

onMounted(() => void loadRequests())

// Submitted / updated message shows as a toast, like the other modules.
const { success: toastSuccess } = useToast()
onMounted(() => {
  if (route.query.submitted === '1') toastSuccess('Time log correction submitted', 'HR will review your request.')
  else if (route.query.updated === '1') toastSuccess('Request updated', 'Your changes were saved.')
  if (route.query.submitted || route.query.updated) void navigateTo({ query: {} }, { replace: true })
})
</script>

<template>
  <section class="correction-page">
    <header class="page-header">
      <div>
        <h1>Time Log Correction Requests</h1>
        <p>Review attendance-related requests and track their approval status.</p>
      </div>
      <NuxtLink :to="`${BASE}/create`" class="primary-button">
        <Plus :size="17" /> New Correction Request
      </NuxtLink>
    </header>

    <p v-if="loadError" class="error-message" role="alert">{{ loadError }}</p>

    <TimeLogCorrectionStats :requests="requests" />

    <article class="table-card">
      <div class="table-header">
        <div>
          <h2>Request History</h2>
          <p>Time log issues submitted through the employee request system.</p>
        </div>
        <div class="filters">
          <label class="search-field">
            <Search :size="16" />
            <input v-model="search" type="search" placeholder="Search requests..." aria-label="Search requests">
          </label>
          <select v-model="status" aria-label="Filter by status">
            <option>All</option><option>Pending</option><option>Approved</option><option>Rejected</option><option>Cancelled</option>
          </select>
        </div>
      </div>

      <TimelogCorrectionTable
        :requests="filteredRequests"
        :loading="loading"
        :cancelling-id="cancellingId"
        @view="viewRequest"
        @cancel="cancelRequest"
      />
    </article>
  </section>
</template>

<style scoped>
.correction-page { max-width: 1660px; margin: 0 auto; color: var(--text-primary); }
.page-header, .table-header { display: flex; align-items: center; justify-content: space-between; gap: 20px; }
.page-header { margin-bottom: 22px; align-items: flex-start; }
h1 { margin: 0 0 7px; font-size: 27px; letter-spacing: -.6px; }
h2 { margin: 0 0 6px; font-size: 15px; }
p { margin: 0; color: var(--text-secondary); font-size: 12px; line-height: 1.6; }
.primary-button { display: inline-flex; align-items: center; justify-content: center; gap: 9px; min-height: 41px; padding: 10px 17px; border-radius: 9px; background: linear-gradient(135deg, #1f68f2, #2878ff); color: #fff; font-size: 12px; font-weight: 600; text-decoration: none; white-space: nowrap; }
.success-message { margin-bottom: 15px; padding: 12px 15px; background: var(--green-soft, #dcfce7); color: var(--green, #15803d); border-radius: 9px; }
.error-message { margin-bottom: 15px; padding: 12px 15px; background: var(--red-soft, #fee2e2); color: var(--red, #b91c1c); border-radius: 9px; }
.table-card { overflow: hidden; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); box-shadow: var(--shadow); }
.table-header { padding: 18px; }.filters { display: flex; align-items: center; gap: 10px; }
.search-field { display: flex; align-items: center; gap: 8px; min-width: 225px; padding: 0 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); color: var(--text-muted); }
.search-field input { min-width: 0; width: 100%; height: 38px; border: 0; outline: 0; color: var(--text-primary); background: transparent; font: inherit; font-size: 12px; }
.filters select { height: 40px; min-width: 115px; padding: 0 10px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); color: var(--text-primary); font: inherit; font-size: 12px; }
@media (max-width: 850px) { .page-header, .table-header { flex-wrap: wrap; } .filters { width: 100%; } .search-field { flex: 1; } }
@media (max-width: 640px) { h1 { font-size: 22px; line-height: 1.3; } .page-header { gap: 14px; } .page-header .primary-button { width: 100%; } .table-header { padding: 14px; gap: 14px; }.filters { flex-wrap: wrap; }.search-field { min-width: 100%; }.filters select { width: 100%; } }
</style>
