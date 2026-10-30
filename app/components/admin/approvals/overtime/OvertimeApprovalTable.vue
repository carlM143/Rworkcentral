<script setup lang="ts">
import {
  Clock,
  Eye,
  RotateCcw,
  Timer,
  UserRound,
} from 'lucide-vue-next'

import type {
  OvertimeApproval,
  OvertimeApprovalStatus,
} from '~/types/overtimeApproval'

defineProps<{
  requests: OvertimeApproval[]
}>()

const emit = defineEmits<{ action: [mode: string, request: OvertimeApproval] }>()

const formatDate = (value: string) => {
  if (!value) return '—'
  const date = new Date(`${value.slice(0, 10)}T12:00:00`)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
}

const formatTime = (value?: string) => {
  if (!value) return '—'
  const [hour, minute] = value.split(':').map(Number)
  const date = new Date()
  date.setHours(hour ?? 0, minute ?? 0, 0, 0)

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

const statusClass = (status: OvertimeApprovalStatus) => {
  const s = String(status || '').toLowerCase()
  if (s === 'approved') return 'approved'
  if (s === 'pending') return 'pending'
  if (s === 'rejected') return 'rejected'
  return 'cancelled'
}
</script>

<template>
  <article class="table-card">
    <div class="table-heading">
      <h3>Overtime Approval Requests</h3>
      <p>Review requested overtime hours, schedules and approval status.</p>
    </div>

    <div v-if="requests.length" class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>OT No.</th>
            <th>Employee</th>
            <th>OT Schedule</th>
            <th>Hours</th>
            <th>Reason</th>
            <th>Status</th>
            <th class="actions-header">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in requests" :key="item.id">
            <!-- OT NO -->
            <td>
              <strong class="request-number">{{ item.requestNumber }}</strong>
            </td>

            <!-- EMPLOYEE -->
            <td>
              <div class="employee-cell">
                <div class="employee-avatar">
                  <UserRound :size="15" />
                </div>
                <div class="cell-info">
                  <strong>{{ item.employeeName }}</strong>
                  <span>{{ item.employeeNumber }} · {{ item.department }}</span>
                </div>
              </div>
            </td>

            <!-- OT SCHEDULE -->
            <td>
              <div class="schedule-cell">
                <strong>{{ formatDate(item.overtimeDate) }}</strong>
                <span>
                  <Clock :size="11" />
                  {{ formatTime(item.startTime) }} – {{ formatTime(item.endTime) }}
                </span>
              </div>
            </td>

            <!-- HOURS -->
            <td>
              <span class="hours-badge">
                <Timer :size="12" />
                {{ item.approvedHours ?? item.requestedHours }} hrs
              </span>
            </td>

            <!-- REASON -->
            <td>
              <p class="reason" :title="item.reason || ''">
                {{ item.reason || 'No reason provided' }}
              </p>
            </td>

            <!-- STATUS -->
            <td>
              <span class="badge" :class="statusClass(item.status)">
                <span class="status-dot" />
                {{ item.status }}
              </span>
            </td>

            <!-- ACTIONS -->
            <td class="actions-cell">
              <div class="action-buttons-row">
                <button
                  type="button"
                  class="preview-button"
                  title="Preview request details"
                  @click="emit('action', 'review', item)"
                >
                  <Eye :size="13" />
                  <span>Preview</span>
                </button>

                <button
                  v-if="item.status === 'Approved' || item.status === 'Rejected'"
                  type="button"
                  class="undo-button"
                  title="Undo approval and revert to pending"
                  @click="emit('action', 'revert', item)"
                >
                  <RotateCcw :size="13" />
                  <span>Undo</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="empty-state">
      <Timer :size="30" />
      <strong>No Overtime Requests Found</strong>
      <span>No overtime records match the selected filters.</span>
    </div>
  </article>
</template>

<style scoped>
.table-card {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.table-heading {
  padding: 16px 17px;
  border-bottom: 1px solid var(--border-soft);
}

.table-heading h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 700;
}

.table-heading p {
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: 10px;
}

.table-scroll {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 900px;
  border-collapse: collapse;
}

th {
  padding: 12px 13px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 700;
  text-align: left;
  text-transform: uppercase;
  white-space: nowrap;
}

td {
  padding: 13px;
  border-top: 1px solid var(--border-soft);
  color: var(--text-secondary);
  font-size: 10px;
  vertical-align: middle;
}

tbody tr:hover {
  background: var(--bg-card-soft);
}

.request-number {
  color: var(--primary);
  white-space: nowrap;
  font-weight: 650;
}

/* EMPLOYEE */
.employee-cell {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 170px;
}

.employee-avatar {
  display: flex;
  width: 31px;
  height: 31px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--primary-soft);
  color: var(--primary);
}

.cell-info strong,
.cell-info span {
  display: block;
}

.cell-info strong {
  color: var(--text-primary);
  font-size: 10px;
}

.cell-info span {
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 9px;
}

/* SCHEDULE */
.schedule-cell strong,
.schedule-cell span {
  display: block;
}

.schedule-cell strong {
  color: var(--text-primary);
  font-size: 10px;
}

.schedule-cell span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 9px;
}

/* HOURS BADGE */
.hours-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  border-radius: 6px;
  background: var(--orange-soft);
  color: var(--orange);
  font-size: 10px;
  font-weight: 650;
  white-space: nowrap;
}

/* REASON */
.reason {
  max-width: 220px;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* STATUS BADGE */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 9px;
  border-radius: 20px;
  font-size: 9px;
  font-weight: 650;
  white-space: nowrap;
  text-transform: capitalize;
}

.badge.approved {
  background: var(--green-soft);
  color: var(--green);
}

.badge.pending {
  background: var(--orange-soft);
  color: var(--orange);
}

.badge.rejected,
.badge.cancelled {
  background: var(--red-soft);
  color: var(--red);
}

.status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
}

/* ACTIONS */
.actions-header,
.actions-cell {
  text-align: right;
}

.action-buttons-row {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}

.preview-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 11px;
  border: 1px solid var(--primary);
  border-radius: 7px;
  background: var(--primary-soft);
  color: var(--primary);
  font-family: inherit;
  font-size: 10px;
  font-weight: 650;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.preview-button:hover {
  background: var(--primary);
  color: #fff;
}

.undo-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 11px;
  border: 1px solid var(--orange);
  border-radius: 7px;
  background: var(--orange-soft);
  color: var(--orange);
  font-family: inherit;
  font-size: 10px;
  font-weight: 650;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.undo-button:hover {
  background: var(--orange);
  color: #fff;
}

.empty-state {
  display: flex;
  min-height: 240px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-muted);
}

.empty-state strong {
  color: var(--text-primary);
  font-size: 12px;
}

.empty-state span {
  font-size: 10px;
}
</style>
