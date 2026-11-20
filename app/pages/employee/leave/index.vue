<script setup lang="ts">
import { Plus, Search } from 'lucide-vue-next'
import LeaveTable from '~/components/employee/leave/LeaveTable.vue'
import ConfirmationModal from '~/components/ui/ConfirmationModal.vue'
import { employeeRequestError, useLeave } from '~/composables/employee/leave/useLeave'
import type { LeaveRequestRecord } from '~/types/employee/leave/leave'

definePageMeta({ layout: false, middleware: 'employee' })
useHead({ title: 'Leave Requests | Employee Portal — RWorkCentral' })

const BASE = '/employee/leave'

const route = useRoute()
const api = useLeave()
const { success, error: showError } = useToast()

const requests = ref<LeaveRequestRecord[]>([])
const loading = ref(false)
const loadError = ref('')
const search = ref('')
const status = ref('All')

const load = async () => {
  loading.value = true
  loadError.value = ''
  try {
    requests.value = await api.list()
  } catch (cause) {
    requests.value = []
    loadError.value = employeeRequestError(cause, 'Unable to load your leave requests.')
  } finally {
    loading.value = false
  }
}

onMounted(() => void load())

const filtered = computed(() => requests.value.filter((request) => {
  if (status.value !== 'All' && request.status.toLowerCase() !== status.value.toLowerCase()) return false
  const keyword = search.value.trim().toLowerCase()
  if (!keyword) return true
  return [request.id, request.type, request.start, request.end, request.reason, request.status]
    .some(value => String(value ?? '').toLowerCase().includes(keyword))
}))

const countBy = (value: string) => requests.value.filter(request => request.status.toLowerCase() === value).length
const stats = computed(() => [
  { label: 'Total Requests', value: requests.value.length, note: 'Recorded submissions' },
  { label: 'Pending', value: countBy('pending'), note: 'Awaiting HR review' },
  { label: 'Approved', value: countBy('approved'), note: 'Approved by HR' },
])

const notice = computed(() =>
  route.query.updated === '1' ? 'Leave request updated successfully.'
    : route.query.submitted === '1' ? 'Leave request submitted successfully to HR.'
      : '',
)

const viewRequest = (request: LeaveRequestRecord) =>
  navigateTo({ path: `${BASE}/show`, query: { id: String(request.raw_id) } })

const editRequest = (request: LeaveRequestRecord) =>
  navigateTo({ path: `${BASE}/edit`, query: { id: String(request.raw_id) } })

/* Cancel (ConfirmationModal) */
const cancelTarget = ref<LeaveRequestRecord | null>(null)
const cancellingId = ref<number | null>(null)

const confirmCancel = async () => {
  const target = cancelTarget.value
  if (!target) return
  cancellingId.value = target.raw_id
  try {
    const res = await api.cancel(target.raw_id)
    success('Leave Request Cancelled', res.message || 'Your leave request was cancelled.')
    await load()
  } catch (cause) {
    showError('Unable to Cancel', employeeRequestError(cause, 'The leave request could not be cancelled.'))
  } finally {
    cancellingId.value = null
    cancelTarget.value = null
  }
}
</script>

<template>
  <section class="request-page">
    <header class="page-header">
      <div>
        <h1>Leave Requests</h1>
        <p>File leave and track its approval status.</p>
      </div>
      <NuxtLink :to="`${BASE}/create`" class="primary-button">
        <Plus :size="17" /> New Leave Request
      </NuxtLink>
    </header>

    <p v-if="loadError" class="error-message" role="alert">
      {{ loadError }} <button type="button" @click="load">Retry</button>
    </p>
    <p v-if="notice" class="success-message" role="status">{{ notice }}</p>

    <div class="stats-grid">
      <div v-for="stat in stats" :key="stat.label" class="stat-card">
        <span>{{ stat.label }}</span><strong>{{ stat.value }}</strong><small>{{ stat.note }}</small>
      </div>
    </div>

    <article class="table-card">
      <div class="table-header">
        <div>
          <h2>Request History</h2>
          <p>Your leave requests and their dates, pay and status.</p>
        </div>
        <div class="filters">
          <label class="search-field">
            <Search :size="16" />
            <input v-model="search" type="search" placeholder="Search requests..." aria-label="Search leave requests">
          </label>
          <select v-model="status" aria-label="Filter by status">
            <option>All</option><option>Pending</option><option>Approved</option><option>Rejected</option><option>Cancelled</option>
          </select>
        </div>
      </div>

      <LeaveTable
        :requests="filtered"
        :loading="loading"
        :cancelling-id="cancellingId"
        @view="viewRequest"
        @edit="editRequest"
        @cancel="request => (cancelTarget = request)"
      />
    </article>

    <ConfirmationModal
      :open="!!cancelTarget"
      title="Cancel Leave Request?"
      :message="cancelTarget ? `${cancelTarget.type} (${cancelTarget.id}) will be cancelled. This cannot be undone.` : ''"
      :confirm-text="cancellingId ? 'Cancelling…' : 'Cancel Request'"
      cancel-text="Keep Request"
      variant="danger"
      :loading="!!cancellingId"
      @confirm="confirmCancel"
      @cancel="!cancellingId && (cancelTarget = null)"
    />
  </section>
</template>

<style scoped>
/* Same frame as the other employee request pages (e.g. Time Log Correction) */
.request-page { max-width: 1660px; margin: 0 auto; color: var(--text-primary); }
.page-header, .table-header { display: flex; align-items: center; justify-content: space-between; gap: 20px; }
.page-header { align-items: flex-start; margin-bottom: 22px; }
h1 { margin: 0 0 7px; font-size: 27px; letter-spacing: -.6px; }
h2 { margin: 0 0 6px; font-size: 15px; }
p { margin: 0; color: var(--text-secondary); font-size: 12px; line-height: 1.6; }
.primary-button { display: inline-flex; align-items: center; justify-content: center; gap: 9px; min-height: 41px; padding: 10px 17px; border-radius: 9px; background: linear-gradient(135deg, #1f68f2, #2878ff); color: #fff; font-size: 12px; font-weight: 600; text-decoration: none; white-space: nowrap; }
.success-message { margin-bottom: 15px; padding: 12px 15px; border-radius: 9px; background: var(--green-soft, #dcfce7); color: var(--green, #15803d); }
.error-message { margin-bottom: 15px; padding: 12px 15px; border-radius: 9px; background: var(--red-soft, #fee2e2); color: var(--red, #b91c1c); }
.error-message button { margin-left: 8px; padding: 3px 10px; border: 1px solid currentColor; border-radius: 6px; background: transparent; color: inherit; font: inherit; cursor: pointer; }
.stats-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 13px; margin-bottom: 18px; }
.stat-card { display: flex; flex-direction: column; gap: 7px; min-height: 102px; padding: 18px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); box-shadow: var(--shadow); }
.stat-card span { color: var(--text-secondary); font-size: 11px; }
.stat-card strong { font-size: 27px; line-height: 1.2; }
.stat-card small { color: var(--text-muted); font-size: 10px; }
.table-card { overflow: hidden; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); box-shadow: var(--shadow); }
.table-header { padding: 18px; }
.filters { display: flex; align-items: center; gap: 10px; }
.search-field { display: flex; align-items: center; gap: 8px; min-width: 225px; padding: 0 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); color: var(--text-muted); }
.search-field input { width: 100%; min-width: 0; height: 38px; border: 0; outline: 0; background: transparent; color: var(--text-primary); font: inherit; font-size: 12px; }
.filters select { min-width: 115px; height: 40px; padding: 0 10px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); color: var(--text-primary); font: inherit; font-size: 12px; }
@media (max-width: 850px) { .page-header, .table-header { flex-wrap: wrap; } .filters { width: 100%; } .search-field { flex: 1; } }
@media (max-width: 640px) {
  h1 { font-size: 22px; line-height: 1.3; }
  .page-header { gap: 14px; }
  .page-header .primary-button { width: 100%; }
  .stats-grid { gap: 8px; }
  .stat-card { min-width: 0; min-height: 90px; padding: 10px; }
  .stat-card strong { font-size: 22px; }
  .table-header { gap: 14px; padding: 14px; }
  .filters { flex-wrap: wrap; }
  .search-field, .filters select { width: 100%; min-width: 100%; }
}
</style>
