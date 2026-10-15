<script setup lang="ts">
import {
  Users,
  Eye,
} from 'lucide-vue-next'

import type {
  LeaveRequest,
} from '~/types/leave'

defineProps<{
  requests: LeaveRequest[]
}>()

const {
  info,
} = useToast()

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

const viewRequest = (
  request: LeaveRequest,
) => {
  info(
    'Leave Request',
    `${request.employeeName} — ${request.leaveType}`,
  )
}
</script>

<template>
  <article class="leave-table-card">

    <div class="table-heading">
      <div>
        <h3>
          Recent Leave Requests
        </h3>

        <p>
          Review recently filed employee leave requests.
        </p>
      </div>
    </div>

    <div
      v-if="requests.length"
      class="table-scroll"
    >
      <table class="leave-table">

        <thead>
          <tr>
            <th>Employee</th>
            <th>Leave Type</th>
            <th>From</th>
            <th>To</th>
            <th>Days</th>
            <th>Reason</th>
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
                  <Users :size="15" />
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

            <td>
              <strong class="leave-type">
                {{ request.leaveType }}
              </strong>
            </td>

            <td>
              {{ formatDate(request.dateFrom) }}
            </td>

            <td>
              {{ formatDate(request.dateTo) }}
            </td>

            <td>
              {{ request.days }}
            </td>

            <td>
              <span class="reason">
                {{
                  request.reason ||
                  'Not provided'
                }}
              </span>
            </td>

            <td>
              <StatusBadge
                :status="request.status"
              />
            </td>

            <td class="action-column">
              <button
                type="button"
                class="view-button"
                @click="
                  viewRequest(request)
                "
              >
                <Eye :size="15" />
              </button>
            </td>

          </tr>
        </tbody>

      </table>
    </div>

  </article>
</template>

<style scoped>
.leave-table-card {
  overflow: hidden;

  border: 1px solid var(--border);
  border-radius: 11px;

  background: var(--bg-card);

  box-shadow: var(--shadow);
}

.table-heading {
  padding: 13px 15px;

  border-bottom:
    1px solid var(--border-soft);
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

.leave-table {
  width: 100%;

  min-width: 1050px;

  border-collapse: collapse;
}

.leave-table th {
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

.leave-table td {
  padding: 11px 12px;

  border-bottom:
    1px solid var(--border-soft);

  color:
    var(--text-secondary);

  font-size: 9px;
}

.leave-table
tbody
tr:last-child
td {
  border-bottom: 0;
}

.leave-table tbody tr:hover {
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

.leave-type {
  color:
    var(--text-primary);
}

.reason {
  display: block;

  max-width: 190px;

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

  border:
    1px solid var(--border);

  border-radius: 7px;

  background: transparent;

  color:
    var(--text-secondary);
}

.view-button:hover {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}
</style>