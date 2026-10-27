<script setup lang="ts">
import {
  UserRound,
  Eye,
  Check,
  X,
} from 'lucide-vue-next'

import type {
  ApprovalRequest,
} from '~/types/approval'

defineProps<{
  requests: ApprovalRequest[]
}>()

const emit = defineEmits<{
  approve: [request: ApprovalRequest]
  reject: [request: ApprovalRequest]
  view: [request: ApprovalRequest]
}>()

const formatDate = (
  date: string,
) => {
  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    },
  ).format(
    new Date(
      `${date}T00:00:00`,
    ),
  )
}

const typeClass = (
  type: string,
) => {
  return type
    .toLowerCase()
    .replace(/\s+/g, '-')
}
</script>

<template>
  <article class="approval-table-card">

    <div class="table-heading">
      <div>
        <h3>
          Pending Requests
        </h3>

        <p>
          Review employee requests requiring approval.
        </p>
      </div>
    </div>

    <div
      v-if="requests.length"
      class="table-scroll"
    >
      <table class="approval-table">

        <thead>
          <tr>
            <th>Employee</th>
            <th>Request</th>
            <th>Reference</th>
            <th>Request Date</th>
            <th>Priority</th>
            <th>Approver</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="request in requests"
            :key="request.id"
          >

            <!-- EMPLOYEE -->
            <td>
              <div class="employee-cell">

                <div class="employee-icon">
                  <UserRound :size="15" />
                </div>

                <div>
                  <strong>
                    {{ request.employeeName }}
                  </strong>

                  <span>
                    {{ request.employeeNumber }}
                    ·
                    {{ request.department }}
                  </span>
                </div>

              </div>
            </td>

            <!-- REQUEST -->
            <td>
              <div class="request-cell">

                <span
                  class="request-type"
                  :class="
                    typeClass(
                      request.type,
                    )
                  "
                >
                  {{ request.type }}
                </span>

                <strong>
                  {{ request.title }}
                </strong>

                <small>
                  {{ request.description }}
                </small>

              </div>
            </td>

            <!-- REFERENCE -->
            <td>
              <span class="reference">
                {{ request.reference }}
              </span>
            </td>

            <!-- DATE -->
            <td>
              {{ formatDate(request.requestDate) }}
            </td>

            <!-- PRIORITY -->
            <td>
              <span
                class="priority"
                :class="
                  request.priority
                    .toLowerCase()
                "
              >
                {{ request.priority }}
              </span>
            </td>

            <!-- APPROVER -->
            <td>
              {{
                request.approver ||
                'Not assigned'
              }}
            </td>

            <!-- ACTIONS -->
            <td>
              <div class="row-actions">

                <button
                  type="button"
                  class="action-button view"
                  title="View request" aria-label="View request"
                  @click="
                    emit(
                      'view',
                      request,
                    )
                  "
                >
                  <Eye :size="14" />
                </button>

                <button
                  type="button"
                  class="action-button approve"
                  title="Approve request" aria-label="Approve request"
                  @click="
                    emit(
                      'approve',
                      request,
                    )
                  "
                >
                  <Check :size="14" />
                </button>

                <button
                  type="button"
                  class="action-button reject"
                  title="Reject request" aria-label="Reject request"
                  @click="
                    emit(
                      'reject',
                      request,
                    )
                  "
                >
                  <X :size="14" />
                </button>

              </div>
            </td>

          </tr>
        </tbody>

      </table>
    </div>

    <div
      v-else
      class="empty-state"
    >
      <div class="empty-icon">
        <Check :size="23" />
      </div>

      <strong>
        No pending requests
      </strong>

      <p>
        All requests have been reviewed.
      </p>
    </div>

  </article>
</template>

<style scoped>
.approval-table-card {
  overflow: hidden;

  border:
    1px solid var(--border);

  border-radius: 11px;

  background:
    var(--bg-card);

  box-shadow:
    var(--shadow);
}

.table-heading {
  padding: 13px 15px;

  border-bottom:
    1px solid var(--border-soft);
}

.table-heading h3 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 11px;
}

.table-heading p {
  margin: 3px 0 0;

  color:
    var(--text-muted);

  font-size: 8px;
}

.table-scroll {
  overflow-x: auto;
}

.approval-table {
  width: 100%;

  min-width: 1150px;

  border-collapse: collapse;
}

.approval-table th {
  padding: 10px 12px;

  border-bottom:
    1px solid var(--border);

  background:
    var(--bg-card-soft);

  color:
    var(--text-secondary);

  font-size: 8px;

  font-weight: 650;

  text-align: left;
  text-transform: uppercase;
}

.approval-table td {
  padding: 11px 12px;

  border-bottom:
    1px solid var(--border-soft);

  color:
    var(--text-secondary);

  font-size: 9px;

  vertical-align: middle;
}

.approval-table
tbody
tr:last-child
td {
  border-bottom: 0;
}

.approval-table tbody tr:hover {
  background:
    var(--bg-card-soft);
}

/* EMPLOYEE */

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

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.employee-cell strong,
.employee-cell span {
  display: block;
}

.employee-cell strong {
  color:
    var(--text-primary);

  font-size: 9px;
}

.employee-cell span {
  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 7px;
}

/* REQUEST */

.request-cell {
  max-width: 275px;
}

.request-cell strong,
.request-cell small {
  display: block;
}

.request-cell strong {
  margin-top: 5px;

  color:
    var(--text-primary);

  font-size: 9px;
}

.request-cell small {
  overflow: hidden;

  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 7px;

  white-space: nowrap;
  text-overflow: ellipsis;
}

.request-type {
  display: inline-flex;

  padding:
    3px 6px;

  border-radius: 5px;

  font-size: 7px;
  font-weight: 650;
}

.request-type.leave {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.request-type.overtime {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.request-type.time-log-correction {
  background:
    var(--purple-soft);

  color:
    var(--purple);
}

.request-type.wfh {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.reference {
  color:
    var(--primary);

  font-weight: 600;
}

/* PRIORITY */

.priority {
  display: inline-flex;

  padding:
    4px 7px;

  border-radius: 20px;

  font-size: 7px;
  font-weight: 650;
}

.priority.normal {
  background:
    var(--bg-card-soft);

  color:
    var(--text-secondary);
}

.priority.urgent {
  background:
    var(--red-soft);

  color:
    var(--red);
}

/* ACTIONS */

.row-actions {
  display: flex;

  align-items: center;

  gap: 5px;
}

.action-button {
  display: flex;

  width: 29px;
  height: 29px;

  align-items: center;
  justify-content: center;

  border:
    1px solid var(--border);

  border-radius: 6px;

  background:
    transparent;

  color:
    var(--text-secondary);
}

.action-button.view:hover {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.action-button.approve:hover {
  border-color:
    var(--green);

  background:
    var(--green-soft);

  color:
    var(--green);
}

.action-button.reject:hover {
  border-color:
    var(--red);

  background:
    var(--red-soft);

  color:
    var(--red);
}

/* EMPTY */

.empty-state {
  display: flex;

  min-height: 260px;

  flex-direction: column;

  align-items: center;
  justify-content: center;

  padding: 30px;

  text-align: center;
}

.empty-icon {
  display: flex;

  width: 48px;
  height: 48px;

  align-items: center;
  justify-content: center;

  margin-bottom: 10px;

  border-radius: 12px;

  background:
    var(--green-soft);

  color:
    var(--green);
}

.empty-state strong {
  color:
    var(--text-primary);

  font-size: 12px;
}

.empty-state p {
  margin: 4px 0 0;

  color:
    var(--text-muted);

  font-size: 8px;
}
</style>