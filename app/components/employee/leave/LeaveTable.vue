<!-- Employee leave requests (shared EmployeeRequestTable). -->
<script setup lang="ts">
import { Umbrella } from 'lucide-vue-next'
import EmployeeRequestTable from '~/components/shared-table/employee-table/EmployeeRequestTable.vue'
import type { LeaveRequestRecord } from '~/types/employee/leave/leave'

const props = withDefaults(defineProps<{
  requests: LeaveRequestRecord[]
  loading?: boolean
  cancellingId?: number | null
  pageSize?: number
}>(), {
  loading: false,
  cancellingId: null,
  pageSize: 8,
})

const emit = defineEmits<{
  view: [request: LeaveRequestRecord]
  edit: [request: LeaveRequestRecord]
  cancel: [request: LeaveRequestRecord]
}>()

const columns = [
  { key: 'request', label: 'Request' },
  { key: 'dates', label: 'Dates' },
  { key: 'days', label: 'Days', hideOnMobile: true },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Action', hideOnMobile: true },
]

const formatDate = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(`${value.slice(0, 10)}T12:00:00`)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}

const statusLabel = (value: string) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
const badgeClass = (value: string) => {
  const status = value.toLowerCase()
  return status === 'approved' ? 'green' : status === 'pending' ? 'orange' : 'neutral'
}

const payLabel = (request: LeaveRequestRecord) => {
  if (request.total_unpaid_days && request.total_paid_days) return 'Mixed pay'
  if (request.total_unpaid_days) return 'Unpaid'
  return 'Paid'
}

const rows = computed(() => props.requests.map(request => ({ id: request.raw_id, request })))
const requestOf = (row: Record<string, unknown>) => row.request as LeaveRequestRecord
const isPending = (request: LeaveRequestRecord) => request.status.toLowerCase() === 'pending'
</script>

<template>
  <EmployeeRequestTable
    :columns="columns"
    :rows="rows"
    :page-size="pageSize"
    :loading="loading"
    empty-message="No leave requests found."
    mobile-hint="Tap a request to view its dates, pay and status."
    @row-click="row => emit('view', requestOf(row))"
  >
    <template #cell-request="{ row }">
      <button type="button" class="row-open-button" @click.stop="emit('view', requestOf(row))">
        <Umbrella :size="16" />
        <strong>{{ requestOf(row).type }}</strong>
      </button>
      <small class="secondary-line">{{ requestOf(row).id }} · {{ requestOf(row).reason || 'No reason provided' }}</small>
    </template>

    <template #cell-dates="{ row }">
      <strong class="date-value">{{ formatDate(requestOf(row).start) }}</strong>
      <small v-if="requestOf(row).end && requestOf(row).end !== requestOf(row).start" class="secondary-line">
        to {{ formatDate(requestOf(row).end) }}
      </small>
    </template>

    <template #cell-days="{ row }">
      {{ requestOf(row).total_days }} day(s)
      <small class="secondary-line">{{ payLabel(requestOf(row)) }}</small>
    </template>

    <template #cell-status="{ row }">
      <span class="badge" :class="badgeClass(requestOf(row).status)">{{ statusLabel(requestOf(row).status) }}</span>
    </template>

    <template #cell-actions="{ row }">
      <div class="action-buttons">
        <button type="button" @click.stop="emit('view', requestOf(row))">View</button>
        <template v-if="isPending(requestOf(row))">
          <button type="button" @click.stop="emit('edit', requestOf(row))">Edit</button>
          <button
            type="button"
            class="danger"
            :disabled="cancellingId === requestOf(row).raw_id"
            @click.stop="emit('cancel', requestOf(row))"
          >
            {{ cancellingId === requestOf(row).raw_id ? 'Cancelling…' : 'Cancel' }}
          </button>
        </template>
      </div>
    </template>
  </EmployeeRequestTable>
</template>

<style scoped>
/* Slot content renders in this component's scope, so these styles apply inside the shared table. */
.row-open-button { display: inline-flex; align-items: center; gap: 7px; padding: 0; border: 0; background: transparent; color: var(--text-primary); font: inherit; font-size: 11px; cursor: pointer; }
.row-open-button svg { flex-shrink: 0; color: var(--primary); }
.secondary-line { display: block; max-width: 340px; overflow: hidden; margin-top: 5px; color: var(--text-muted); font-size: 10px; line-height: 1.4; text-overflow: ellipsis; white-space: nowrap; }
.date-value { color: var(--text-primary); font-size: 12px; font-weight: 600; }
.badge { display: inline-block; padding: 5px 8px; border-radius: 5px; font-size: 10px; font-weight: 600; white-space: nowrap; }
.green { background: var(--green-soft); color: var(--green); }
.orange { background: var(--orange-soft); color: var(--orange); }
.neutral { background: var(--bg-card-soft); color: var(--text-secondary); }
.action-buttons { display: flex; gap: 14px; }
.action-buttons button { padding: 0; border: 0; background: transparent; color: var(--primary); font: inherit; font-size: 11px; font-weight: 600; cursor: pointer; }
.action-buttons button.danger { color: var(--red); }
.action-buttons button:hover { text-decoration: underline; }
.action-buttons button:disabled { opacity: .55; cursor: wait; }
</style>
