<script setup lang="ts">
import { ClipboardCheck, FileClock, Plus, Search } from 'lucide-vue-next'
import EmployeeRequestTable from '~/components/shared-table/employee-table/EmployeeRequestTable.vue'

import type { TimeLogCorrectionRecord } from '~/types/employee/timelogCorrectionRequest/timelogCorrectionRequest'

// The existing Employee Portal API calls these requests "Attendance Report".
// This list also allows a future dedicated "Time Log Correction" request type.
useHead({ title: 'Time Log Correction Requests | RWorkCentral' })

const route = useRoute()
const api = useTimeLogCorrectionApi()
const requests = ref<TimeLogCorrectionRecord[]>([])
const loading = ref(false)
const loadError = ref('')
const cancellingId = ref<number | null>(null)
const search = ref('')
const status = ref('All')
const columns = [
  { key: 'request', label: 'Request' },
  { key: 'dates', label: 'Dates / Times' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Action', hideOnMobile: true },
  { key: 'reference', label: 'Reference', mobileOnly: true },
]

const relatedRequests = computed(() => requests.value)

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

const filteredRequests = computed(() => relatedRequests.value.filter(request => {
  const statusMatches = status.value === 'All' ||
    request.status.toLowerCase() === status.value.toLowerCase()
  const keyword = search.value.trim().toLowerCase()
  const textMatches = !keyword ||
    [request.id, request.correction_type, request.work_date, request.reason, request.status]
      .some(value => String(value ?? '').toLowerCase().includes(keyword))
  return statusMatches && textMatches
}))

const rows = computed(() => filteredRequests.value.map(request => ({
  id: String(request.id),
  request: 'Time Log Correction',
  dates: request.work_date,
  reason: request.reason,
  status: request.status.charAt(0).toUpperCase() + request.status.slice(1).toLowerCase(),
  isEditable: request.status.toLowerCase() === 'pending',
  isCancelling: cancellingId.value === request.id,
  reference: String(request.id),
})))

const viewRequest = (row: Record<string, unknown>) => navigateTo({
  path: '/employee/timelog-correction-request/show',
  query: { id: String(row.id) },
})

const formatDate = (value: unknown) => {
  const date = String(value ?? '')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return date || '—'
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

const pendingCount = computed(() => relatedRequests.value.filter(request => request.status.toLowerCase() === 'pending').length)
const approvedCount = computed(() => relatedRequests.value.filter(request => request.status.toLowerCase() === 'approved').length)

const cancelRequest = async (row: Record<string, unknown>) => {
  const id = Number(row.id)
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
</script>

<template>
  <section class="correction-page">
    <header class="page-header">
      <div>
        <div class="eyebrow"><FileClock :size="15" /> Employee Requests</div>
        <h1>Time Log Correction Requests</h1>
        <p>Review attendance-related requests and track their approval status.</p>
      </div>
      <NuxtLink to="/employee/timelog-correction-request/create" class="primary-button">
        <Plus :size="17" /> New Correction Request
      </NuxtLink>
    </header>

    <p v-if="loadError" class="error-message" role="alert">{{ loadError }}</p>
    <p v-if="route.query.submitted === '1' || route.query.updated === '1'" class="success-message" role="status">{{ route.query.updated === '1' ? 'Request updated successfully.' : 'Time log correction request submitted successfully.' }}</p>

    <div class="stats-grid">
      <div class="stat-card"><span>Total Requests</span><strong>{{ relatedRequests.length }}</strong><small>Recorded submissions</small></div>
      <div class="stat-card"><span>Pending</span><strong>{{ pendingCount }}</strong><small>Awaiting HR review</small></div>
      <div class="stat-card"><span>Approved</span><strong>{{ approvedCount }}</strong><small>Approved by HR</small></div>
    </div>

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

      <EmployeeRequestTable
        :columns="columns"
        :rows="rows"
        :page-size="8"
        :loading="loading"
        empty-message="No time log correction requests found."
        mobile-hint="Tap a request row to view its target date, reason and status."
        @row-click="viewRequest"
      >
        <template #cell-request="{ row }">
          <button type="button" class="row-open-button" @click.stop="viewRequest(row)">
            <ClipboardCheck :size="17" />
            <strong>{{ row.request }}</strong>
          </button>
          <small class="secondary-line">{{ String(row.reason || 'No reason provided') }}</small>
        </template>
        <template #cell-dates="{ row }">
          <strong class="date-value">{{ formatDate(row.dates) }}</strong>
          <small class="secondary-line">Target attendance date</small>
        </template>
        <template #cell-status="{ row }">
          <span
            class="badge"
            :class="row.status === 'Approved' ? 'green' : row.status === 'Pending' ? 'orange' : 'neutral'"
          >{{ row.status }}</span>
        </template>
        <template #cell-actions="{ row }">
          <div class="action-buttons">
            <NuxtLink
              :to="{ path: '/employee/timelog-correction-request/show', query: { id: String(row.id) } }"
              @click.stop
            >View</NuxtLink>
            <NuxtLink
              v-if="row.isEditable"
              :to="{ path: '/employee/timelog-correction-request/edit', query: { id: String(row.id) } }"
              @click.stop
            >Edit</NuxtLink>
            <button
              v-if="row.isEditable"
              type="button"
              :disabled="row.isCancelling"
              @click.stop="cancelRequest(row)"
            >{{ row.isCancelling ? 'Cancelling…' : 'Cancel' }}</button>
          </div>
        </template>
        <template #cell-reference="{ row }">{{ row.reference }}</template>
      </EmployeeRequestTable>
    </article>
  </section>
</template>

<style scoped>
.correction-page { max-width: 1660px; margin: 0 auto; color: var(--text-primary); }
.page-header, .table-header { display: flex; align-items: center; justify-content: space-between; gap: 20px; }
.page-header { margin-bottom: 22px; align-items: flex-start; }
.eyebrow { display: flex; align-items: center; gap: 7px; margin-bottom: 8px; color: var(--primary); font-size: 11px; font-weight: 600; }
h1 { margin: 0 0 7px; font-size: 27px; letter-spacing: -.6px; }
h2 { margin: 0 0 6px; font-size: 15px; }
p { margin: 0; color: var(--text-secondary); font-size: 12px; line-height: 1.6; }
.primary-button { display: inline-flex; align-items: center; justify-content: center; gap: 9px; min-height: 41px; padding: 10px 17px; border-radius: 9px; background: linear-gradient(135deg, #1f68f2, #2878ff); color: #fff; font-size: 12px; font-weight: 600; text-decoration: none; white-space: nowrap; }
.success-message { margin-bottom: 15px; padding: 12px 15px; background: var(--green-soft, #dcfce7); color: var(--green, #15803d); border-radius: 9px; }
.error-message { margin-bottom: 15px; padding: 12px 15px; background: var(--red-soft, #fee2e2); color: var(--red, #b91c1c); border-radius: 9px; }
.stats-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 13px; margin-bottom: 18px; }
.stat-card { display: flex; flex-direction: column; gap: 7px; min-height: 102px; padding: 18px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); box-shadow: var(--shadow); }
.stat-card span { color: var(--text-secondary); font-size: 11px; }.stat-card strong { font-size: 27px; line-height: 1.2; }.stat-card small { color: var(--text-muted); font-size: 10px; }
.table-card { overflow: hidden; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); box-shadow: var(--shadow); }
.table-header { padding: 18px; }.filters { display: flex; align-items: center; gap: 10px; }
.search-field { display: flex; align-items: center; gap: 8px; min-width: 225px; padding: 0 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); color: var(--text-muted); }
.search-field input { min-width: 0; width: 100%; height: 38px; border: 0; outline: 0; color: var(--text-primary); background: transparent; font: inherit; font-size: 12px; }
.filters select { height: 40px; min-width: 115px; padding: 0 10px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); color: var(--text-primary); font: inherit; font-size: 12px; }
.row-open-button { color: var(--text-primary) !important; font-size: 11px !important; }.row-open-button svg { flex-shrink: 0; color: var(--primary); }
.secondary-line { display: block; max-width: 340px; overflow: hidden; margin-top: 5px; color: var(--text-muted); font-size: 10px; line-height: 1.4; text-overflow: ellipsis; white-space: nowrap; }
.date-value { color: var(--text-primary); font-size: 12px; font-weight: 600; }
.badge { display: inline-block; padding: 5px 8px; border-radius: 5px; font-size: 10px; font-weight: 600; white-space: nowrap; }
.green { background: var(--green-soft); color: var(--green); }
.orange { background: var(--orange-soft); color: var(--orange); }
.neutral { background: var(--bg-card-soft); color: var(--text-secondary); }
.action-buttons { display: flex; gap: 14px; }
.action-buttons a { color: var(--primary); font-size: 11px; font-weight: 600; text-decoration: none; }
.action-buttons button { padding: 0; border: 0; background: transparent; color: var(--red); font: inherit; font-size: 11px; font-weight: 600; cursor: pointer; }
.action-buttons a:hover, .action-buttons button:hover { text-decoration: underline; }
.action-buttons button:disabled { opacity: .55; cursor: wait; }
@media (max-width: 850px) { .page-header, .table-header { flex-wrap: wrap; } .filters { width: 100%; } .search-field { flex: 1; } }
@media (max-width: 640px) { h1 { font-size: 22px; } .stats-grid { gap: 8px; } .stat-card { min-height: 90px; padding: 12px; }.stat-card strong { font-size: 22px; }.page-header .primary-button { width: 100%; } .filters { flex-wrap: wrap; }.search-field { min-width: 100%; }.filters select { width: 100%; } }
</style>
