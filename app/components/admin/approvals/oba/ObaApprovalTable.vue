<script setup lang="ts">
import { Briefcase, Eye, Users } from 'lucide-vue-next'
import type { ObaRequestRecord } from '~/types/oba-request/obaRequest'

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  dept_head_approved: 'Dept. Head Approved',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
}
const statusLabel = (value: string) => statusLabels[value] ?? value
const statusClass = (value: string) =>
  value === 'approved' ? 'green'
    : value === 'pending' ? 'orange'
      : value === 'dept_head_approved' ? 'blue'
        : value === 'rejected' ? 'red' : 'neutral'
const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
const timeRange = (from: string, to: string) => `${formatTime(from)} – ${formatTime(to)}`
const employeeSummary = (record: ObaRequestRecord) => {
  const names = (record.oba_employees ?? []).map(employee => employee.employee_name)
  if (!names.length) return '—'
  return names.length > 2 ? `${names.slice(0, 2).join(', ')} +${names.length - 2} more` : names.join(', ')
}

defineProps<{ requests: ObaRequestRecord[]; loading?: boolean }>()
defineEmits<{ review: [request: ObaRequestRecord] }>()
</script>

<template>
  <article class="oba-table-card">
    <div class="table-heading">
      <h3>OBA Requests</h3>
      <p>Official business requests filed by employees.</p>
    </div>

    <div class="table-scroll">
      <table class="oba-table">
        <thead>
          <tr>
            <th>Filed By</th>
            <th>Destination</th>
            <th>Employees</th>
            <th>Date</th>
            <th>Time</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <tr v-for="request in requests" :key="request.id" @click="$emit('review', request)">
            <td>
              <div class="employee-cell">

                <div>
                  <strong>{{ request.filer_name || '—' }}</strong>
                  <span>{{ request.department_name || 'No department' }} · #{{ request.id }}</span>
                </div>
              </div>
            </td>
            <td>
              <strong class="destination"> {{ request.destination }}</strong>
            </td>
            <td>{{ employeeSummary(request) }}</td>
            <td>{{ formatDate(request.date_request) }}</td>
            <td>{{ timeRange(request.time_from, request.time_to) }}</td>
            <td><span class="badge" :class="statusClass(request.status)">{{ statusLabel(request.status) }}</span></td>
            <td class="action-column">
              <button type="button" class="view-button" aria-label="Review request" @click.stop="$emit('review', request)"><Eye :size="15" /></button>
            </td>
          </tr>
          <tr v-if="!requests.length" class="empty-row">
            <td colspan="7">{{ loading ? 'Loading OBA requests...' : 'No OBA requests found.' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </article>
</template>

<style scoped>
.oba-table-card { overflow: hidden; border: 1px solid var(--border); border-radius: 11px; background: var(--bg-card); box-shadow: var(--shadow); }
.table-heading { padding: 13px 15px; border-bottom: 1px solid var(--border-soft); }
.table-heading h3 { margin: 0; color: var(--text-primary); font-size: 12px; }
.table-heading p { margin: 3px 0 0; color: var(--text-muted); font-size: 9px; }
.table-scroll { overflow-x: auto; }
.oba-table { width: 100%; min-width: 1000px; border-collapse: collapse; }
.oba-table th { padding: 10px 12px; border-bottom: 1px solid var(--border); background: var(--bg-card-soft); color: var(--text-secondary); font-size: 9px; font-weight: 650; text-align: left; text-transform: uppercase; }
.oba-table td { padding: 11px 12px; border-bottom: 1px solid var(--border-soft); color: var(--text-secondary); font-size: 10px; vertical-align: top; }
.oba-table tbody tr:last-child td { border-bottom: 0; }
.oba-table tbody tr:not(.empty-row) { cursor: pointer; }
.oba-table tbody tr:hover { background: var(--bg-card-soft); }
.empty-row td { padding: 32px; text-align: center; }
.employee-cell { display: flex; align-items: center; gap: 8px; }
.employee-icon { display: flex; width: 32px; height: 32px; flex-shrink: 0; align-items: center; justify-content: center; border-radius: 8px; background: var(--primary-soft); color: var(--primary); }
.employee-cell strong, .employee-cell span { display: block; }
.employee-cell strong { color: var(--text-primary); font-size: 10px; }
.employee-cell span { margin-top: 2px; color: var(--text-muted); font-size: 8px; }
.destination { display: inline-flex; align-items: center; gap: 5px; color: var(--text-primary); font-size: 10px; }
.destination svg { color: var(--primary); flex-shrink: 0; }
.reason { display: block; max-width: 220px; margin-top: 3px; overflow: hidden; color: var(--text-muted); font-size: 8px; text-overflow: ellipsis; white-space: nowrap; }
.badge { display: inline-block; padding: 4px 8px; border-radius: 5px; font-size: 9px; font-weight: 600; white-space: nowrap; }
.green { background: var(--green-soft); color: var(--green); }
.orange { background: var(--orange-soft); color: var(--orange); }
.blue { background: var(--primary-soft); color: var(--primary); }
.red { background: var(--red-soft); color: var(--red); }
.neutral { background: var(--bg-card-soft); color: var(--text-secondary); }
.action-column { width: 45px; text-align: right; }
.view-button { display: inline-flex; width: 30px; height: 30px; align-items: center; justify-content: center; border: 1px solid var(--border); border-radius: 7px; background: transparent; color: var(--text-secondary); }
.view-button:hover { background: var(--primary-soft); color: var(--primary); }
</style>