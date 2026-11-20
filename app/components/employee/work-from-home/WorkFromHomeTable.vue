<!-- Employee WFH requests: shared EmployeeRequestTable on desktop, cards on mobile. -->
<script setup lang="ts">
import { CheckCircle2, Paperclip } from 'lucide-vue-next'
import EmployeeRequestTable from '~/components/shared-table/employee-table/EmployeeRequestTable.vue'
import type { WfhRequest } from '~/types/employee/work-from-home/workFromHome'

const props = withDefaults(defineProps<{
  records: WfhRequest[]
  loading?: boolean
  pageSize?: number
}>(), {
  loading: false,
  pageSize: 8,
})

const emit = defineEmits<{
  open: [record: WfhRequest]
  /** Pending requests only. */
  edit: [record: WfhRequest]
}>()

const columns = [
  { key: 'request_no', label: 'Request' },
  { key: 'dates', label: 'Dates' },
  { key: 'days', label: 'Days' },
  { key: 'supervisor', label: 'Supervisor', hideOnMobile: true },
  { key: 'status', label: 'Status' },
  { key: 'proof', label: 'Proof of Work', hideOnMobile: true },
  { key: 'actions', label: '', hideOnMobile: true },
]

const formatDate = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(`${value.slice(0, 10)}T12:00:00`)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatPeriod = (start?: string, end?: string) => {
  if (!start && !end) return '—'
  if (!end || start === end) return formatDate(start)
  return `${formatDate(start)} – ${formatDate(end)}`
}

const dayLabel = (count: number) => `${count} ${count === 1 ? 'day' : 'days'}`

// Shared table rows carry the record itself so slots can read every field
const rows = computed(() => props.records.map(record => ({ id: record.id, record })))
const recordOf = (row: Record<string, unknown>) => row.record as WfhRequest

const onRowClick = (row: Record<string, unknown>) => emit('open', recordOf(row))
</script>

<template>
  <EmployeeRequestTable
    class="desktop-request-table"
    :columns="columns"
    :rows="rows"
    :page-size="pageSize"
    :loading="loading"
    empty-message="No work-from-home requests yet."
    mobile-hint="Tap a request to view details and attach proof of work."
    @row-click="onRowClick"
  >
    <template #cell-request_no="{ row }">
      <strong>{{ recordOf(row).request_no }}</strong>
    </template>

    <template #cell-dates="{ row }">
      {{ formatPeriod(recordOf(row).start_date, recordOf(row).end_date) }}
    </template>

    <template #cell-days="{ row }">
      {{ dayLabel(recordOf(row).number_of_days) }}
    </template>

    <template #cell-supervisor="{ row }">
      {{ recordOf(row).supervisor_name }}
    </template>

    <template #cell-status="{ row }">
      <span class="status" :class="recordOf(row).status">{{ recordOf(row).status }}</span>
    </template>

    <template #cell-proof="{ row }">
      <span
        v-if="recordOf(row).status === 'approved' && recordOf(row).counts"
        class="pow-summary-badge"
        :class="recordOf(row).document_status"
      >
        <CheckCircle2 v-if="recordOf(row).document_status === 'complete'" :size="12" />
        <Paperclip v-else :size="12" />
        {{ recordOf(row).counts?.accepted }}/{{ recordOf(row).counts?.expected }} verified
      </span>
      <span v-else class="muted">—</span>
    </template>

    <template #cell-actions="{ row }">
      <div class="row-actions">
        <button type="button" class="details-btn" @click.stop="emit('open', recordOf(row))">
          {{ recordOf(row).status === 'approved' ? 'Details / Attach' : 'Details' }}
        </button>
        <button
          v-if="recordOf(row).status.toLowerCase() === 'pending'"
          type="button"
          class="details-btn"
          @click.stop="emit('edit', recordOf(row))"
        >
          Edit
        </button>
      </div>
    </template>
  </EmployeeRequestTable>

  <!-- Mobile: cards instead of the table -->
  <div class="mobile-requests">
    <p v-if="loading" class="mobile-empty" role="status">Loading requests…</p>
    <p v-else-if="!records.length" class="mobile-empty">No work-from-home requests yet.</p>
    <button
      v-for="record in loading ? [] : records"
      :key="record.id"
      type="button"
      class="request-card"
      :aria-label="`View ${record.request_no} details`"
      @click="emit('open', record)"
    >
      <span class="request-card-header">
        <strong>{{ record.request_no }}</strong>
        <span class="status" :class="record.status">{{ record.status }}</span>
      </span>
      <span class="request-card-dates">{{ formatPeriod(record.start_date, record.end_date) }}</span>
      <span class="request-card-meta">
        {{ dayLabel(record.number_of_days) }} · {{ record.supervisor_name }}
        <template v-if="record.status === 'approved' && record.counts">
          · {{ record.counts.accepted }}/{{ record.counts.expected }} verified
        </template>
      </span>
      <span class="request-card-link">
        {{ record.status === 'approved' ? 'View details & attach proof →' : 'View details →' }}
      </span>
    </button>
  </div>
</template>

<style scoped>
/* Slot content renders in this component's scope, so these styles apply inside the shared table. */
.status { display: inline-block; text-transform: capitalize; border-radius: 6px; padding: 4px 9px; font-size: 11px; font-weight: 600; background: #eab30822; color: #d18b00; }
.status.approved { background: #22c55e22; color: #16a34a; }
.status.rejected { background: #ef444422; color: #ef4444; }

.pow-summary-badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; background: rgba(245, 158, 11, 0.14); color: #f59e0b; }
.pow-summary-badge.complete { background: rgba(16, 185, 129, 0.14); color: #10b981; }
.muted { color: var(--text-muted); }

.row-actions { display: flex; gap: 6px; }
.details-btn { padding: 7px 11px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card); color: var(--text-primary); font: inherit; font-size: 11px; font-weight: 600; white-space: nowrap; cursor: pointer; }
.details-btn:hover { border-color: var(--primary); color: var(--primary); }

.mobile-requests { display: none; }
@media (max-width: 850px) {
  .desktop-request-table { display: none; }
  .mobile-requests { display: grid; gap: 10px; padding: 0 14px 14px; }
  .request-card { display: flex; flex-direction: column; align-items: stretch; gap: 7px; width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px; text-align: left; background: var(--bg-card-soft); color: var(--text-primary); font: inherit; font-size: 11px; cursor: pointer; }
  .request-card-header { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
  .request-card-dates { color: var(--text-primary); }
  .request-card-meta { color: var(--text-secondary); overflow-wrap: anywhere; }
  .request-card-link { color: var(--primary); font-weight: 600; }
  .mobile-empty { margin: 0; padding: 18px 0; color: var(--text-secondary); font-size: 12px; text-align: center; }
}
</style>
