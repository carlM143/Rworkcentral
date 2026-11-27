<!-- Admin OBA requests table (shared BaseDataTable + TableActionMenu). -->
<script setup lang="ts">
import { CheckCircle2, Eye, XCircle } from 'lucide-vue-next'
import BaseDataTable from '~/components/shared-table/BaseDataTable.vue'
import TableActionMenu from '~/components/shared-table/TableActionMenu.vue'
import type { ObaRequestRecord, ObaRequestStatus } from '~/types/oba-request/obaRequest'

defineProps<{ requests: ObaRequestRecord[], loading?: boolean }>()

const emit = defineEmits<{
  review: [request: ObaRequestRecord]
  approve: [request: ObaRequestRecord]
  reject: [request: ObaRequestRecord]
}>()

const statusLabels: Record<ObaRequestStatus, string> = {
  pending: 'Pending',
  dept_head_approved: 'Dept. Head Approved',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
}

const statusLabel = (value: string) => statusLabels[value as ObaRequestStatus] ?? value

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

const employeeNames = (record: ObaRequestRecord) =>
  (record.oba_employees ?? []).map(employee => employee.employee_name)

const employeeSummary = (record: ObaRequestRecord) => {
  const names = employeeNames(record)
  if (!names.length) return '—'
  return names.length > 2 ? `${names.slice(0, 2).join(', ')} +${names.length - 2} more` : names.join(', ')
}

// Mirrors the backend rules:
//   approve: only after the department head approved
//   reject:  while pending or after the department head approved
const { can, user, roleName } = useAuth()
const canFinalApprove = computed(() => roleName.value !== 'supervisor' && can('approvals', 'oba.approve'))
const isPendingDepartmentApprover = (record: ObaRequestRecord) =>
  record.status === 'pending' && can('approvals', 'oba.edit')
  && Boolean(record.department_approvals?.some(a => a.user_id === user.value?.id && a.status === 'pending'))

const menuItems = (record: ObaRequestRecord) => [
  { key: 'view', label: 'View Details', icon: Eye },
  ...(isPendingDepartmentApprover(record) || (canFinalApprove.value && record.status === 'dept_head_approved')
    ? [{ key: 'approve', label: 'Approve', icon: CheckCircle2 }]
    : []),
  ...(isPendingDepartmentApprover(record) || (canFinalApprove.value && (record.status === 'pending' || record.status === 'dept_head_approved'))
    ? [{ key: 'reject', label: 'Reject', icon: XCircle, danger: true, dividerBefore: true }]
    : []),
]

const onAction = (record: ObaRequestRecord, key: string) => {
  if (key === 'approve') emit('approve', record)
  else if (key === 'reject') emit('reject', record)
  else emit('review', record)
}
</script>

<template>
  <BaseDataTable
    title="OBA Requests"
    description="Official business requests filed by employees. HR approves after the department head."
    :has-rows="requests.length > 0"
    :loading="loading && !requests.length"
    min-width="1000px"
    empty-title="No OBA requests found"
    empty-description="Try adjusting your search or filters."
  >
    <template #headers>
      <th>Filed By</th>
      <th>Destination</th>
      <th>Employees</th>
      <th>Date</th>
      <th>Time</th>
      <th>Status</th>
      <th class="text-right"><span class="sr-only">Actions</span></th>
    </template>

    <template #rows>
      <tr
        v-for="request in requests"
        :key="request.id"
        class="clickable-row"
        @click="emit('review', request)"
      >
        <td>
          <strong class="cell-title">{{ request.filer_name || '—' }}</strong>
        </td>
        <td>
          <strong class="cell-title">{{ request.destination }}</strong>
        </td>
        <td>
          <span class="cell-title">{{ employeeSummary(request) }}</span>
          <small class="cell-sub">{{ employeeNames(request).length }} employee(s)</small>
        </td>
        <td>{{ formatDate(request.date_request) }}</td>
        <td>{{ formatTime(request.time_from) }} – {{ formatTime(request.time_to) }}</td>
        <td>
          <span class="status-pill" :class="`oba-${request.status}`">{{ statusLabel(request.status) }}</span>
        </td>
        <td class="text-right" @click.stop>
          <TableActionMenu
            :items="menuItems(request)"
            :label="`Actions for OBA request #${request.id}`"
            @select="key => onAction(request, key)"
          />
        </td>
      </tr>
    </template>
  </BaseDataTable>
</template>

<style scoped>
.clickable-row { cursor: pointer; }
.cell-title { display: block; }
.cell-sub { display: block; margin-top: 3px; color: var(--text-muted); font-size: 11px; }

.oba-pending { background: var(--orange-soft, rgba(245, 158, 11, 0.12)); color: var(--orange, #fbbf24); }
.oba-dept_head_approved { background: var(--primary-soft, rgba(59, 130, 246, 0.12)); color: var(--primary, #60a5fa); }
.oba-approved { background: var(--green-soft, rgba(34, 197, 94, 0.12)); color: var(--green, #4ade80); }
.oba-rejected { background: var(--red-soft, rgba(239, 68, 68, 0.12)); color: var(--red, #f87171); }
.oba-cancelled { background: rgba(148, 163, 184, 0.12); color: #a8b3c4; }

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
</style>
