<!-- Employee time log correction requests: shared EmployeeRequestTable on desktop, cards on mobile. -->
<script setup lang="ts">
import { ClipboardCheck } from 'lucide-vue-next'
import EmployeeRequestTable from '~/components/shared-table/employee-table/EmployeeRequestTable.vue'
import type { TimeLogCorrectionRecord } from '~/types/employee/timelogCorrectionRequest/timelogCorrectionRequest'

const props = withDefaults(defineProps<{
  requests: TimeLogCorrectionRecord[]
  loading?: boolean
  cancellingId?: number | null
  pageSize?: number
}>(), {
  loading: false,
  cancellingId: null,
  pageSize: 8,
})

const emit = defineEmits<{
  view: [id: number]
  cancel: [id: number]
}>()

const BASE = '/employee/requests/timelog-correction-request'

const columns = [
  { key: 'request', label: 'Request' },
  { key: 'dates', label: 'Dates / Times' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Action', hideOnMobile: true },
  { key: 'reference', label: 'Reference', mobileOnly: true },
]

const statusLabel = (value: string) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()

const badgeClass = (value: string) => {
  const status = value.toLowerCase()
  return status === 'approved' ? 'green' : status === 'pending' ? 'orange' : 'neutral'
}

const formatDate = (value: unknown) => {
  const date = String(value ?? '')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return date || '—'
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

const rows = computed(() => props.requests.map(request => ({
  id: request.id,
  request: 'Time Log Correction',
  dates: request.work_date,
  reason: request.reason,
  status: statusLabel(request.status),
  isEditable: request.status.toLowerCase() === 'pending',
  isCancelling: props.cancellingId === request.id,
  reference: String(request.id),
})))

const onView = (row: Record<string, unknown>) => emit('view', Number(row.id))
</script>

<template>
  <EmployeeRequestTable
    class="desktop-request-table"
    :columns="columns"
    :rows="rows"
    :page-size="pageSize"
    :loading="loading"
    empty-message="No time log correction requests found."
    mobile-hint="Tap a request row to view its target date, reason and status."
    @row-click="onView"
  >
    <template #cell-request="{ row }">
      <button type="button" class="row-open-button" @click.stop="onView(row)">
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
      <span class="badge" :class="badgeClass(String(row.status))">{{ row.status }}</span>
    </template>

    <template #cell-actions="{ row }">
      <div class="action-buttons">
        <NuxtLink :to="{ path: `${BASE}/show`, query: { id: String(row.id) } }" @click.stop>View</NuxtLink>
        <NuxtLink
          v-if="row.isEditable"
          :to="{ path: `${BASE}/edit`, query: { id: String(row.id) } }"
          @click.stop
        >Edit</NuxtLink>
        <button
          v-if="row.isEditable"
          type="button"
          :disabled="Boolean(row.isCancelling)"
          @click.stop="emit('cancel', Number(row.id))"
        >{{ row.isCancelling ? 'Cancelling…' : 'Cancel' }}</button>
      </div>
    </template>

    <template #cell-reference="{ row }">{{ row.reference }}</template>
  </EmployeeRequestTable>

  <!-- Mobile: cards instead of the table -->
  <div class="mobile-request-list">
    <p v-if="loading" class="mobile-empty" role="status">Loading requests…</p>
    <p v-else-if="!requests.length" class="mobile-empty">No time log correction requests found.</p>
    <button
      v-for="request in loading ? [] : requests"
      :key="request.id"
      type="button"
      class="mobile-request-card"
      :aria-label="`View correction request ${request.id}`"
      @click="emit('view', request.id)"
    >
      <span class="mobile-card-header">
        <strong>Time Log Correction</strong>
        <span class="badge" :class="badgeClass(request.status)">{{ statusLabel(request.status) }}</span>
      </span>
      <span class="mobile-card-date">{{ formatDate(request.work_date) }}</span>
      <span class="mobile-card-reason">{{ request.reason || 'No reason provided' }}</span>
      <span class="mobile-card-footer"><span>Reference #{{ request.id }}</span><span>View details →</span></span>
    </button>
  </div>
</template>

<style scoped>
/* Slot content renders in this component's scope, so these styles apply inside the shared table. */
.row-open-button { color: var(--text-primary) !important; font-size: 11px !important; }
.row-open-button svg { flex-shrink: 0; color: var(--primary); }
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

.mobile-request-list { display: none; }
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
  .mobile-empty { margin: 0; padding: 18px 0; color: var(--text-secondary); font-size: 12px; text-align: center; }
}
</style>
