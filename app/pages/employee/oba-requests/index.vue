<script setup lang="ts">
import { Briefcase, Plus, Search } from 'lucide-vue-next'
import EmployeeRequestTable from '~/components/shared-table/employee-table/EmployeeRequestTable.vue'
import { getObaApiError, useObaRequest } from '~/composables/employee/oba-request/useObaRequest'
import type { ObaRequestRecord } from '~/types/employee/oba-request/obaRequest'

definePageMeta({ layout: false })
useHead({ title: 'Official Business Authorization | RWorkCentral' })

const route = useRoute()
const api = useObaRequest()

const requests = ref<ObaRequestRecord[]>([])
const loading = ref(false)
const loadError = ref('')
const notice = ref('')
const cancellingId = ref<number | null>(null)
const search = ref('')
const status = ref('All')

const isDepartmentHead = ref(false)
const approvalCount = ref(0)

const columns = [
  { key: 'request', label: 'Request' },
  { key: 'dates', label: 'Dates / Times' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Action', hideOnMobile: true },
  { key: 'reference', label: 'Reference', mobileOnly: true },
]

const CANCELLABLE = ['pending', 'dept_head_approved']

const loadRequests = async () => {
  loading.value = true
  loadError.value = ''
  try {
    // The table paginates on the client, so load a large page at once.
    const response = await api.list({ per_page: 100 })
    requests.value = response.data?.data ?? []
  } catch (cause: unknown) {
    requests.value = []
    loadError.value = getObaApiError(cause, 'Unable to load OBA requests.')
  } finally {
    loading.value = false
  }
}

const loadApprovals = async () => {
  try {
    const res = await api.approvals({ status: 'pending' })
    isDepartmentHead.value = res.is_department_head
    approvalCount.value = res.data?.length ?? 0
  } catch {
    isDepartmentHead.value = false
  }
}

const statusLabel = (value: string) => ({
  pending: 'Pending',
  dept_head_approved: 'Dept. Head Approved',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
} as Record<string, string>)[value] ?? value

const statusClass = (value: string) => ({
  approved: 'green',
  pending: 'orange',
  dept_head_approved: 'blue',
  rejected: 'red',
} as Record<string, string>)[value] ?? 'neutral'

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' })
const timeRange = (from: string, to: string) => {
  const sameDay = new Date(from).toDateString() === new Date(to).toDateString()
  return sameDay
    ? `${formatTime(from)} – ${formatTime(to)}`
    : `${formatDate(from)} ${formatTime(from)} – ${formatDate(to)} ${formatTime(to)}`
}

const filteredRequests = computed(() => requests.value.filter(request => {
  const statusMatches = status.value === 'All' || request.status === status.value
  const keyword = search.value.trim().toLowerCase()
  const textMatches = !keyword ||
    [request.id, request.destination, request.reason, statusLabel(request.status)]
      .some(value => String(value ?? '').toLowerCase().includes(keyword))
  return statusMatches && textMatches
}))

const rows = computed(() => filteredRequests.value.map(request => ({
  id: String(request.id),
  request: request.destination,
  reason: request.reason,
  dates: request.time_from,
  timeFrom: request.time_from,
  timeTo: request.time_to,
  status: statusLabel(request.status),
  statusKey: request.status,
  isCancellable: Boolean(request.is_filer) && CANCELLABLE.includes(request.status),
  isCancelling: cancellingId.value === request.id,
  reference: String(request.id),
})))

const pendingCount = computed(() => requests.value.filter(r => CANCELLABLE.includes(r.status)).length)
const approvedCount = computed(() => requests.value.filter(r => r.status === 'approved').length)

const viewRequest = (row: Record<string, unknown>) => navigateTo({
  path: '/employee/oba-requests/show',
  query: { id: String(row.id) },
})

const cancelRequest = async (row: Record<string, unknown>) => {
  const id = Number(row.id)
  if (!Number.isInteger(id) || cancellingId.value !== null) return
  if (!window.confirm('Cancel this OBA request?')) return

  cancellingId.value = id
  loadError.value = ''
  notice.value = ''
  try {
    await api.cancel(id)
    notice.value = 'OBA request cancelled successfully.'
    await loadRequests()
  } catch (cause: unknown) {
    loadError.value = getObaApiError(cause, 'Unable to cancel the OBA request.')
  } finally {
    cancellingId.value = null
  }
}

onMounted(() => {
  if (route.query.submitted === '1') notice.value = 'OBA request submitted successfully.'
  void loadRequests()
  void loadApprovals()
})
</script>

<template>
  <section class="oba-page">
    <header class="page-header">
      <div>
        <h1>Official Business Authorization</h1>
        <p>Official business requests that cover you or that you filed.</p>
      </div>
      <div class="header-actions">
        <NuxtLink v-if="isDepartmentHead" to="/employee/oba-requests/approvals" class="secondary-button">
          For my approval<span v-if="approvalCount"> ({{ approvalCount }})</span>
        </NuxtLink>
        <NuxtLink to="/employee/oba-requests/create" class="primary-button">
          <Plus :size="17" /> New OBA Request
        </NuxtLink>
      </div>
    </header>

    <p v-if="loadError" class="error-message" role="alert">{{ loadError }}</p>
    <p v-if="notice" class="success-message" role="status">{{ notice }}</p>

    <div class="stats-grid">
      <div class="stat-card"><span>Total Requests</span><strong>{{ requests.length }}</strong><small>Recorded submissions</small></div>
      <div class="stat-card"><span>Pending</span><strong>{{ pendingCount }}</strong><small>Awaiting review</small></div>
      <div class="stat-card"><span>Approved</span><strong>{{ approvedCount }}</strong><small>Approved requests</small></div>
    </div>

    <article class="table-card">
      <div class="table-header">
        <div>
          <h2>Request History</h2>
          <p>Official business requests that include you.</p>
        </div>
        <div class="filters">
          <label class="search-field">
            <Search :size="16" />
            <input v-model="search" type="search" placeholder="Search requests..." aria-label="Search requests">
          </label>
          <select v-model="status" aria-label="Filter by status">
            <option value="All">All</option>
            <option value="pending">Pending</option>
            <option value="dept_head_approved">Dept. Head Approved</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <EmployeeRequestTable
        class="desktop-request-table"
        :columns="columns"
        :rows="rows"
        :page-size="8"
        :loading="loading"
        empty-message="No OBA requests found."
        mobile-hint="Tap a request row to view its destination, schedule and status."
        @row-click="viewRequest"
      >
        <template #cell-request="{ row }">
          <button type="button" class="row-open-button" @click.stop="viewRequest(row)">
            <Briefcase :size="17" />
            <strong>{{ row.request }}</strong>
          </button>
          <small class="secondary-line">{{ String(row.reason || 'No reason provided') }}</small>
        </template>
        <template #cell-dates="{ row }">
          <strong class="date-value">{{ formatDate(String(row.timeFrom)) }}</strong>
          <small class="secondary-line">{{ timeRange(String(row.timeFrom), String(row.timeTo)) }}</small>
        </template>
        <template #cell-status="{ row }">
          <span class="badge" :class="statusClass(String(row.statusKey))">{{ row.status }}</span>
        </template>
        <template #cell-actions="{ row }">
          <div class="action-buttons">
            <NuxtLink
              :to="{ path: '/employee/oba-requests/show', query: { id: String(row.id) } }"
              @click.stop
            >View</NuxtLink>
            <button
              v-if="row.isCancellable"
              type="button"
              :disabled="Boolean(row.isCancelling)"
              @click.stop="cancelRequest(row)"
            >{{ row.isCancelling ? 'Cancelling…' : 'Cancel' }}</button>
          </div>
        </template>
        <template #cell-reference="{ row }">{{ row.reference }}</template>
      </EmployeeRequestTable>

      <div class="mobile-request-list">
        <p v-if="loading" class="mobile-empty" role="status">Loading requests…</p>
        <p v-else-if="!filteredRequests.length" class="mobile-empty">No OBA requests found.</p>
        <button
          v-for="request in filteredRequests"
          :key="request.id"
          type="button"
          class="mobile-request-card"
          :aria-label="`View OBA request ${request.id}`"
          @click="viewRequest({ id: request.id })"
        >
          <span class="mobile-card-header">
            <strong>{{ request.destination }}</strong>
            <span class="badge" :class="statusClass(request.status)">{{ statusLabel(request.status) }}</span>
          </span>
          <span class="mobile-card-date">{{ formatDate(request.time_from) }} · {{ timeRange(request.time_from, request.time_to) }}</span>
          <span class="mobile-card-reason">{{ request.reason || 'No reason provided' }}</span>
          <span class="mobile-card-footer"><span>Reference #{{ request.id }}</span><span>View details →</span></span>
        </button>
      </div>
    </article>
  </section>
</template>

<style scoped>
.oba-page { max-width: 1660px; margin: 0 auto; color: var(--text-primary); }
.page-header, .table-header { display: flex; align-items: center; justify-content: space-between; gap: 20px; }
.page-header { margin-bottom: 22px; align-items: flex-start; }
.header-actions { display: flex; flex-wrap: wrap; gap: 10px; }
h1 { margin: 0 0 7px; font-size: 27px; letter-spacing: -.6px; }
h2 { margin: 0 0 6px; font-size: 15px; }
p { margin: 0; color: var(--text-secondary); font-size: 12px; line-height: 1.6; }
.primary-button { display: inline-flex; align-items: center; justify-content: center; gap: 9px; min-height: 41px; padding: 10px 17px; border-radius: 9px; background: linear-gradient(135deg, #1f68f2, #2878ff); color: #fff; font-size: 12px; font-weight: 600; text-decoration: none; white-space: nowrap; }
.secondary-button { display: inline-flex; align-items: center; justify-content: center; min-height: 41px; padding: 10px 17px; border: 1px solid var(--primary); border-radius: 9px; background: var(--bg-card); color: var(--primary); font-size: 12px; font-weight: 600; text-decoration: none; white-space: nowrap; }
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
.blue { background: var(--primary-soft); color: var(--primary); }
.red { background: var(--red-soft, #ef444414); color: var(--red, #ef4444); }
.neutral { background: var(--bg-card-soft); color: var(--text-secondary); }
.action-buttons { display: flex; gap: 14px; }
.action-buttons a { color: var(--primary); font-size: 11px; font-weight: 600; text-decoration: none; }
.action-buttons button { padding: 0; border: 0; background: transparent; color: var(--red); font: inherit; font-size: 11px; font-weight: 600; cursor: pointer; }
.action-buttons a:hover, .action-buttons button:hover { text-decoration: underline; }
.action-buttons button:disabled { opacity: .55; cursor: wait; }
.mobile-request-list { display: none; }
@media (max-width: 850px) { .page-header, .table-header { flex-wrap: wrap; } .filters { width: 100%; } .search-field { flex: 1; } }
@media (max-width: 850px) {
  .desktop-request-table { display: none; }
  .mobile-request-list { display: grid; gap: 10px; padding: 0 14px 14px; }
  .mobile-request-card { display: flex; flex-direction: column; gap: 7px; width: 100%; min-width: 0; padding: 13px; text-align: left; font: inherit; font-size: 12px; color: var(--text-primary); background: var(--bg-card-soft); border: 1px solid var(--border); border-radius: 9px; }
  .mobile-card-header, .mobile-card-footer { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .mobile-card-header strong { min-width: 0; overflow-wrap: anywhere; }
  .mobile-card-header .badge { flex-shrink: 0; }
  .mobile-card-date { font-weight: 600; }
  .mobile-card-reason { color: var(--text-secondary); line-height: 1.5; overflow-wrap: anywhere; }
  .mobile-card-footer { color: var(--text-muted); font-size: 11px; }
  .mobile-card-footer span:last-child { color: var(--primary); font-weight: 600; }
  .mobile-empty { padding: 18px 0; text-align: center; }
}
@media (max-width: 640px) { h1 { font-size: 22px; line-height: 1.3; } .page-header { gap: 14px; } .header-actions { width: 100%; } .header-actions a { flex: 1; } .stats-grid { gap: 8px; } .stat-card { min-width: 0; min-height: 90px; padding: 10px; }.stat-card strong { font-size: 22px; }.stat-card small { line-height: 1.4; overflow-wrap: anywhere; }.table-header { padding: 14px; gap: 14px; }.filters { flex-wrap: wrap; }.search-field { min-width: 100%; }.filters select { width: 100%; } }
</style>