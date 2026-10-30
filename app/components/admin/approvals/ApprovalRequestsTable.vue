<script setup lang="ts">
import {
  UserRound,
  Eye,
  Check,
  RotateCcw,
} from 'lucide-vue-next'

import type {
  ApprovalRequest,
} from '~/types/approval'

defineProps<{
  requests: ApprovalRequest[]
  processingId?: number | null
}>()

const emit = defineEmits<{
  revert: [request: ApprovalRequest]
  view: [request: ApprovalRequest]
}>()

const formatDate = (
  date: string,
) => {
  if (!date) return '—'
  const parsed = new Date(`${date.slice(0, 10)}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return date

  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    },
  ).format(parsed)
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
          Approval Requests
        </h3>

        <p>
          Review employee requests requiring approval or manage reviewed requests.
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
            <th>Status</th>
            <th>Approver</th>
            <th class="actions-header">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="request in requests"
            :key="`${request.type}-${request.sourceId ?? request.id}`"
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

            <!-- STATUS -->
            <td>
              <span
                class="status-pill"
                :class="request.status.toLowerCase()"
              >
                <span class="status-dot" />
                {{ request.status }}
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
            <td class="actions-cell">
              <div class="row-actions">

                <button
                  type="button"
                  class="preview-button"
                  title="Preview request"
                  @click="
                    emit(
                      'view',
                      request,
                    )
                  "
                >
                  <Eye :size="13" />
                  <span>Preview</span>
                </button>

                <button
                  v-if="request.status !== 'Pending'"
                  type="button"
                  class="undo-button"
                  title="Undo approval and revert to pending"
                  :disabled="processingId === request.id"
                  @click="
                    emit(
                      'revert',
                      request,
                    )
                  "
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

    <div
      v-else
      class="empty-state"
    >
      <div class="empty-icon">
        <Check :size="23" />
      </div>

      <strong>
        No requests found
      </strong>

      <p>
        No requests match the selected filters.
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
  padding: 16px 17px;

  border-bottom:
    1px solid var(--border-soft);
}

.table-heading h3 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 14px;
  font-weight: 700;
}

.table-heading p {
  margin: 5px 0 0;

  color:
    var(--text-muted);

  font-size: 10px;
}

.table-scroll {
  overflow-x: auto;
}

.approval-table {
  width: 100%;

  min-width: 1100px;

  border-collapse: collapse;
}

.approval-table th {
  padding: 12px 13px;

  border-bottom:
    1px solid var(--border);

  background:
    var(--bg-card-soft);

  color:
    var(--text-secondary);

  font-size: 10px;

  font-weight: 700;

  text-align: left;
  text-transform: uppercase;
  white-space: nowrap;
}

.approval-table th.actions-header {
  text-align: right;
}

.approval-table td {
  padding: 13px;

  border-bottom:
    1px solid var(--border-soft);

  color:
    var(--text-secondary);

  font-size: 10px;

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

  gap: 9px;
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

  font-size: 10px;
}

.employee-cell span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 9px;
}

/* REQUEST */

.request-cell {
  max-width: 285px;
}

.request-cell strong,
.request-cell small {
  display: block;
}

.request-cell strong {
  margin-top: 5px;

  color:
    var(--text-primary);

  font-size: 10px;
}

.request-cell small {
  overflow: hidden;

  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 9px;

  white-space: nowrap;
  text-overflow: ellipsis;
}

.request-type {
  display: inline-flex;

  padding:
    3px 7px;

  border-radius: 5px;

  font-size: 8px;
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

.request-type.time-log-correction,
.request-type.undertime {
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

/* STATUS PILL */
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 9px;
  border-radius: 20px;
  font-size: 9px;
  font-weight: 650;
  white-space: nowrap;
}
.status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
}
.status-pill.pending {
  background: var(--orange-soft);
  color: var(--orange);
}
.status-pill.approved {
  background: var(--green-soft);
  color: var(--green);
}
.status-pill.rejected {
  background: var(--red-soft);
  color: var(--red);
}

/* ACTIONS */

.actions-header {
  text-align: right;
}

.actions-cell {
  text-align: right;
}

.row-actions {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}

.preview-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
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
}

.undo-button:hover {
  background: var(--orange);
  color: #fff;
}

.undo-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

  font-size: 10px;
}
</style>
