<script setup lang="ts">
import { Clock3, ArrowRight } from 'lucide-vue-next'
import TimeCorrectionActions from '~/components/admin/timekeeping/time-log-corrections/TimeCorrectionActions.vue'
import type { TimeLogCorrectionRequest } from '~/types/timeLogCorrection'

defineProps<{
  requests: TimeLogCorrectionRequest[]
}>()

const emit = defineEmits<{
  view: [request: TimeLogCorrectionRequest]
  approve: [request: TimeLogCorrectionRequest]
  reject: [request: TimeLogCorrectionRequest]
  apply: [request: TimeLogCorrectionRequest]
}>()

const formatDate = (value?: string | null) => {
  if (!value) return '—'

  const date = new Date(`${value.slice(0, 10)}T12:00:00`)

  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

const formatDateTime = (value?: string | null) => {
  if (!value) return '—'

  const date = new Date(value.replace(' ', 'T'))

  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

const originalTime = (request: TimeLogCorrectionRequest) => {
  const value = request.correctionType === 'Time In'
    ? request.originalTimeIn
    : request.originalTimeOut

  return value || 'Missing'
}

const statusClass = (value: string) =>
  value.toLowerCase()

const statusDescription = (value: string) => {
  switch (value.toLowerCase()) {
    case 'pending': return 'Awaiting review'
    case 'approved': return 'Awaiting application'
    case 'applied': return 'Attendance updated'
    case 'rejected': return 'Request rejected'
    case 'cancelled': return 'Request cancelled'
    default: return ''
  }
}
</script>

<template>
  <article class="table-card">

    <div class="table-heading">
      <div>
        <h3>Correction Requests</h3>
        <p>
          Review employee attendance corrections and manage requests.
        </p>
      </div>

      <span class="request-count">
        {{ requests.length }} records
      </span>
    </div>

    <div v-if="requests.length" class="table-scroll">
      <table class="correction-table">

        <thead>
          <tr>
            <th>Employee</th>
            <th>Attendance Date</th>
            <th>Correction Details</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="request in requests"
            :key="request.id"
          >

            <!-- Employee -->
            <td>
              <div class="employee-cell">
                <strong class="employee-name">
                  {{ request.employeeName }}
                </strong>

                <span class="employee-id">
                  ID: {{ request.employeeNumber || '—' }}
                </span>

                <div class="employee-meta">
                  <span>{{ request.requestNumber }}</span>
                  <span class="meta-dot">•</span>
                  <span>
                    {{ formatDateTime(request.requestedAt) }}
                  </span>
                </div>
              </div>
            </td>

            <!-- Attendance Date -->
            <td>
              <div class="date-cell">
                <strong>
                  {{ formatDate(request.attendanceDate) }}
                </strong>

                <span>Attendance Date</span>
              </div>
            </td>

            <!-- Correction Details -->
            <td>
              <div class="correction-cell">

                <span class="type-badge">
                  {{ request.correctionType }}
                </span>

                <div class="time-comparison">

                  <div class="time-block">
                    <span class="time-label">
                      Original
                    </span>

                    <strong
                      :class="{
                        'missing-time':
                          originalTime(request) === 'Missing'
                      }"
                    >
                      {{ originalTime(request) }}
                    </strong>
                  </div>

                  <ArrowRight
                    :size="15"
                    class="time-arrow"
                  />

                  <div class="time-block">
                    <span class="time-label">
                      Requested
                    </span>

                    <strong class="new-time">
                      {{ request.requestedTime || '—' }}
                    </strong>
                  </div>

                </div>
              </div>
            </td>

            <!-- Status -->
            <td>
              <div class="status-cell">

                <span
                  class="status-badge"
                  :class="statusClass(request.status)"
                >
                  <span class="status-dot" />
                  {{ request.status }}
                </span>

                <small>
                  {{ statusDescription(request.status) }}
                </small>
              </div>
            </td>

            <!-- Actions -->
            <td>
              <TimeCorrectionActions
                :request="request"
                @view="emit('view', request)"
                @approve="emit('approve', request)"
                @reject="emit('reject', request)"
                @apply="emit('apply', request)"
              />
            </td>

          </tr>
        </tbody>

      </table>
    </div>

    <div v-else class="empty-state">
      <Clock3 :size="28" />

      <strong>
        No correction requests found
      </strong>

      <span>
        Try adjusting your filters.
      </span>
    </div>

  </article>
</template>

<style scoped>
.table-card {
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.table-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 15px 16px;
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
  font-size: 11px;
}

.request-count {
  flex-shrink: 0;
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 600;
}

.table-scroll {
  width: 100%;
  overflow-x: auto;
}

.correction-table {
  width: 100%;
  min-width: 900px;
  border-collapse: collapse;
  text-align: left;
}

.correction-table th {
  padding: 13px 16px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  white-space: nowrap;
}

.correction-table td {
  padding: 16px;
  border-bottom: 1px solid var(--border-soft);
  color: var(--text-secondary);
  font-size: 11px;
  vertical-align: middle;
}

.correction-table tbody tr:last-child td {
  border-bottom: 0;
}

.correction-table tbody tr:hover {
  background: var(--bg-card-soft);
}

.correction-table th:nth-child(1) {
  width: 24%;
}

.correction-table th:nth-child(2) {
  width: 16%;
}

.correction-table th:nth-child(3) {
  width: 29%;
}

.correction-table th:nth-child(4) {
  width: 14%;
}

.correction-table th:nth-child(5) {
  width: 17%;
}

/* Employee */
.employee-cell {
  display: flex;
  min-width: 170px;
  flex-direction: column;
  gap: 5px;
}

.employee-name {
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 700;
}

.employee-id {
  color: var(--text-muted);
  font-size: 10px;
}

.employee-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
  font-size: 9px;
}

.meta-dot {
  opacity: .6;
}

/* Date */
.date-cell {
  display: flex;
  flex-direction: column;
  gap: 5px;
  white-space: nowrap;
}

.date-cell strong {
  color: var(--text-primary);
  font-size: 11px;
  font-weight: 600;
}

.date-cell span {
  color: var(--text-muted);
  font-size: 9px;
}

/* Correction */
.correction-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 9px;
}

.type-badge {
  display: inline-flex;
  padding: 5px 9px;
  border-radius: 6px;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}

.time-comparison {
  display: flex;
  align-items: center;
  gap: 14px;
}

.time-block {
  display: flex;
  flex-direction: column;
  gap: 5px;
  white-space: nowrap;
}

.time-label {
  color: var(--text-muted);
  font-size: 9px;
}

.time-block strong {
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 650;
}

.time-block .missing-time {
  color: var(--red);
}

.time-block .new-time {
  color: var(--primary);
  font-weight: 750;
}

.time-arrow {
  flex-shrink: 0;
  color: var(--text-muted);
}

/* Status */
.status-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 7px;
}

.status-cell small {
  color: var(--text-muted);
  font-size: 9px;
  white-space: nowrap;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}

.status-dot {
  width: 6px;
  height: 6px;
  flex-shrink: 0;
  border-radius: 50%;
  background: currentColor;
}

.status-badge.pending {
  color: #b45309;
  background: #fef3c7;
}

.status-badge.approved {
  color: #1d4ed8;
  background: #dbeafe;
}

.status-badge.applied {
  color: #15803d;
  background: #dcfce7;
}

.status-badge.rejected {
  color: #dc2626;
  background: #fee2e2;
}

.status-badge.cancelled {
  color: #64748b;
  background: #e2e8f0;
}

/* Empty */
.empty-state {
  display: flex;
  min-height: 260px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
  color: var(--text-muted);
}

.empty-state strong {
  color: var(--text-primary);
  font-size: 12px;
}

.empty-state span {
  font-size: 10px;
}

@media (max-width: 768px) {
  .table-heading {
    align-items: flex-start;
  }

  .request-count {
    font-size: 9px;
  }

  .correction-table th,
  .correction-table td {
    padding: 12px;
  }
}
</style>
