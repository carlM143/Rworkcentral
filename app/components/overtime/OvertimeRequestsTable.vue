
<script setup lang="ts">
import {
  TimerReset,
  Eye,
  X,
  UserRound,
  CalendarDays,
  Clock3,
  FileText,
  CheckCircle2,
  Building2,
  Hash,
} from 'lucide-vue-next'

import type {
  OvertimeRequest,
} from '~/types/overtime'

defineProps<{
  requests: OvertimeRequest[]
}>()

const selectedRequest = ref<OvertimeRequest | null>(null)
const showDetailsModal = ref(false)

const formatDate = (date: string) => {
  if (!date) return '—'

  const parsed = new Date(`${date}T00:00:00`)

  if (Number.isNaN(parsed.getTime())) return date

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed)
}

const viewRequest = (request: OvertimeRequest) => {
  selectedRequest.value = request
  showDetailsModal.value = true
}

const closeModal = () => {
  showDetailsModal.value = false
  selectedRequest.value = null
}
</script>

<template>
  <article class="overtime-table-card">

    <div class="table-heading">
      <div>
        <h3>Recent Overtime Requests</h3>
        <p>Review recently filed employee overtime requests.</p>
      </div>
    </div>

    <div v-if="requests.length" class="table-scroll">
      <table class="overtime-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Date</th>
            <th>Time</th>
            <th>Hours</th>
            <th>Reason</th>
            <th>Approved By</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="request in requests"
            :key="request.id"
          >
            <td>
              <div class="employee-cell">
                <div class="employee-icon">
                  <TimerReset :size="15" />
                </div>

                <div>
                  <strong>{{ request.employeeName }}</strong>
                  <span>
                    {{ request.employeeNumber }}
                    ·
                    {{ request.department }}
                  </span>
                </div>
              </div>
            </td>

            <td>{{ formatDate(request.date) }}</td>

            <td>
              <strong class="time-range">
                {{ request.timeFrom }} – {{ request.timeTo }}
              </strong>
            </td>

            <td>
              <strong class="hours">
                {{ request.hours }} hrs
              </strong>
            </td>

            <td>
              <span class="reason">
                {{ request.reason }}
              </span>
            </td>

            <td>{{ request.approvedBy || '—' }}</td>

            <td>
              <StatusBadge :status="request.status" />
            </td>

            <td class="action-column">
              <button
                type="button"
                class="view-button"
                title="View Overtime Details"
                aria-label="View overtime details"
                @click="viewRequest(request)"
              >
                <Eye :size="15" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="empty-state">
      No overtime requests found.
    </div>
  </article>

  <!-- DETAILS MODAL -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="showDetailsModal && selectedRequest"
        class="modal-overlay"
        @click.self="closeModal"
      >
        <div
          class="details-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="overtime-details-title"
        >

          <div class="modal-header">
            <div class="modal-title-group">
              <div class="modal-title-icon">
                <TimerReset :size="20" />
              </div>

              <div>
                <h2 id="overtime-details-title">
                  Overtime Request Details
                </h2>
                <p>Employee overtime information and approval status</p>
              </div>
            </div>

            <button
              type="button"
              class="close-button"
              aria-label="Close details"
              @click="closeModal"
            >
              <X :size="18" />
            </button>
          </div>

          <div class="modal-body">

            <!-- EMPLOYEE -->
            <div class="employee-profile">
              <div class="profile-avatar">
                <UserRound :size="23" />
              </div>

              <div class="profile-info">
                <h3>{{ selectedRequest.employeeName }}</h3>
                <p>
                  {{ selectedRequest.employeeNumber }}
                  ·
                  {{ selectedRequest.department }}
                </p>
              </div>

              <StatusBadge :status="selectedRequest.status" />
            </div>

            <!-- REQUEST INFORMATION -->
            <div class="modal-section-title">
              <FileText :size="15" />
              Request Information
            </div>

            <div class="details-grid">
              <div class="detail-item">
                <div class="detail-label">
                  <Hash :size="13" />
                  Request ID
                </div>
                <strong>{{ selectedRequest.id }}</strong>
              </div>

              <div class="detail-item">
                <div class="detail-label">
                  <CalendarDays :size="13" />
                  Overtime Date
                </div>
                <strong>{{ formatDate(selectedRequest.date) }}</strong>
              </div>

              <div class="detail-item">
                <div class="detail-label">
                  <Clock3 :size="13" />
                  Start Time
                </div>
                <strong>{{ selectedRequest.timeFrom }}</strong>
              </div>

              <div class="detail-item">
                <div class="detail-label">
                  <Clock3 :size="13" />
                  End Time
                </div>
                <strong>{{ selectedRequest.timeTo }}</strong>
              </div>

              <div class="detail-item">
                <div class="detail-label">
                  <TimerReset :size="13" />
                  Overtime Hours
                </div>
                <strong class="highlight-hours">
                  {{ selectedRequest.hours }} hrs
                </strong>
              </div>

              <div class="detail-item">
                <div class="detail-label">
                  <Building2 :size="13" />
                  Department
                </div>
                <strong>{{ selectedRequest.department }}</strong>
              </div>
            </div>

            <!-- REASON -->
            <div class="modal-section-title">
              <FileText :size="15" />
              Reason for Overtime
            </div>

            <div class="reason-box">
              {{ selectedRequest.reason || 'No reason provided.' }}
            </div>

            <!-- APPROVAL -->
            <div class="modal-section-title">
              <CheckCircle2 :size="15" />
              Approval Information
            </div>

            <div class="approval-card">
              <div>
                <span class="approval-label">Current Status</span>
                <StatusBadge :status="selectedRequest.status" />
              </div>

              <div>
                <span class="approval-label">Approved By</span>
                <strong>
                  {{ selectedRequest.approvedBy || 'Not yet approved' }}
                </strong>
              </div>
            </div>

          </div>

          <div class="modal-footer">
            <button
              type="button"
              class="done-button"
              @click="closeModal"
            >
              Close Details
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.overtime-table-card {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.table-heading {
  padding: 13px 15px;
  border-bottom: 1px solid var(--border-soft);
}

.table-heading h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 11px;
}

.table-heading p {
  margin: 3px 0 0;
  color: var(--text-muted);
  font-size: 8px;
}

.table-scroll {
  overflow-x: auto;
}

.overtime-table {
  width: 100%;
  min-width: 1100px;
  border-collapse: collapse;
}

.overtime-table th {
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  font-size: 8px;
  font-weight: 650;
  text-align: left;
  text-transform: uppercase;
}

.overtime-table td {
  padding: 11px 12px;
  border-bottom: 1px solid var(--border-soft);
  color: var(--text-secondary);
  font-size: 9px;
}

.overtime-table tbody tr:last-child td {
  border-bottom: 0;
}

.overtime-table tbody tr:hover {
  background: var(--bg-card-soft);
}

.employee-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.employee-icon {
  display: flex;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--primary-soft);
  color: var(--primary);
}

.employee-cell strong,
.employee-cell span {
  display: block;
}

.employee-cell strong {
  color: var(--text-primary);
  font-size: 9px;
}

.employee-cell span {
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 7px;
}

.time-range {
  color: var(--text-primary);
  white-space: nowrap;
}

.hours {
  color: var(--primary);
  white-space: nowrap;
}

.reason {
  display: block;
  max-width: 210px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.action-column {
  width: 45px;
  text-align: right;
}

.view-button {
  display: inline-flex;
  width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
}

.view-button:hover {
  background: var(--primary-soft);
  color: var(--primary);
  border-color: var(--primary);
}

.empty-state {
  padding: 35px;
  color: var(--text-muted);
  text-align: center;
  font-size: 12px;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(5, 12, 26, 0.75);
  backdrop-filter: blur(5px);
}

.details-modal {
  width: 100%;
  max-width: 590px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: 15px;
  background: var(--bg-card);
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 20px 22px;
  border-bottom: 1px solid var(--border);
}

.modal-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-title-icon {
  display: flex;
  width: 42px;
  height: 42px;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  background: var(--primary-soft);
  color: var(--primary);
}

.modal-header h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 700;
}

.modal-header p {
  margin: 4px 0 0;
  color: var(--text-muted);
  font-size: 10px;
}

.close-button {
  display: flex;
  width: 31px;
  height: 31px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
}

.close-button:hover {
  background: var(--red-soft);
  color: var(--red);
}

.modal-body {
  padding: 20px 22px;
}

.employee-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--bg-card-soft);
}

.profile-avatar {
  display: flex;
  width: 45px;
  height: 45px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  background: var(--primary-soft);
  color: var(--primary);
}

.profile-info {
  min-width: 0;
  flex: 1;
}

.profile-info h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 13px;
}

.profile-info p {
  margin: 4px 0 0;
  color: var(--text-muted);
  font-size: 10px;
}

.modal-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 22px 0 12px;
  color: var(--text-primary);
  font-size: 11px;
  font-weight: 700;
}

.modal-section-title svg {
  color: var(--primary);
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card-soft);
}

.detail-label {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
  font-size: 9px;
}

.detail-item strong {
  color: var(--text-primary);
  font-size: 11px;
}

.detail-item .highlight-hours {
  color: var(--primary);
  font-size: 14px;
}

.reason-box {
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  font-size: 11px;
  line-height: 1.7;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.approval-card {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  padding: 15px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card-soft);
}

.approval-card > div {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 9px;
}

.approval-label {
  color: var(--text-muted);
  font-size: 9px;
}

.approval-card strong {
  color: var(--text-primary);
  font-size: 11px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 15px 22px;
  border-top: 1px solid var(--border);
}

.done-button {
  padding: 11px 18px;
  border: 0;
  border-radius: 8px;
  background: var(--primary);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.done-button:hover {
  background: var(--primary-dark);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity .2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 600px) {
  .details-grid,
  .approval-card {
    grid-template-columns: 1fr;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 16px;
  }

  .employee-profile {
    flex-wrap: wrap;
  }
}
</style>
