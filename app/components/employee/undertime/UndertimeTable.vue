<!-- Employee undertime requests (shared EmployeeRequestTable). -->
<script setup lang="ts">
import { Clock3 } from 'lucide-vue-next'
import EmployeeRequestTable from '~/components/shared-table/employee-table/EmployeeRequestTable.vue'
import type { UndertimeRequestRecord } from '~/types/employee/undertime/undertime'
import { requestClock } from '~/utils/employeeRequestTime'

const props = withDefaults(defineProps<{
  requests: UndertimeRequestRecord[]
  loading?: boolean
  cancellingId?: number | null
  pageSize?: number
}>(), {
  loading: false,
  cancellingId: null,
  pageSize: 8,
})

const emit = defineEmits<{
  view: [request: UndertimeRequestRecord]
  edit: [request: UndertimeRequestRecord]
  cancel: [request: UndertimeRequestRecord]
}>()

const columns = [
  { key: 'request', label: 'Request' },
  { key: 'date', label: 'Date / Time' },
  { key: 'duration', label: 'Duration', hideOnMobile: true },
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

const minutesLabel = (minutes: number) => {
  if (!minutes) return '—'
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return hours ? `${hours}h${rest ? ` ${rest}m` : ''}` : `${rest}m`
}

const statusLabel = (value: string) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
const badgeClass = (value: string) => {
  const status = value.toLowerCase()
  return status === 'approved' ? 'green' : status === 'pending' ? 'orange' : 'neutral'
}

const rows = computed(() => props.requests.map(request => ({ id: request.raw_id, request })))
const requestOf = (row: Record<string, unknown>) => row.request as UndertimeRequestRecord
const isPending = (request: UndertimeRequestRecord) => request.status.toLowerCase() === 'pending'
</script>

<template>
  <EmployeeRequestTable
    :columns="columns"
    :rows="rows"
    :page-size="pageSize"
    :loading="loading"
    empty-message="No undertime requests found."
    mobile-hint="Tap a request to view its time and status."
    @row-click="row => emit('view', requestOf(row))"
  >
    <template #cell-request="{ row }">
      <button type="button" class="row-open-button" @click.stop="emit('view', requestOf(row))">
        <Clock3 :size="16" />
        <strong>{{ requestOf(row).id }}</strong>
      </button>
      <small class="secondary-line">{{ requestOf(row).reason || 'No reason provided' }}</small>
    </template>

    <template #cell-date="{ row }">
      <strong class="date-value">{{ formatDate(requestOf(row).start) }}</strong>
      <small class="secondary-line">
        Leave at {{ requestClock(requestOf(row).timing.requestedTimeOut) }} · shift ends {{ requestClock(requestOf(row).timing.scheduledTimeOut) }}
      </small>
    </template>

    <template #cell-duration="{ row }">{{ minutesLabel(requestOf(row).timing.requestedMinutes) }}</template>

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
.row-open-button svg { flex-shrink: 0; color: var(--purple, #8b5cf6); }
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
