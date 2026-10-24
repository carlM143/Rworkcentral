<script setup lang="ts">
import {
  TimerReset,
  Eye,
} from 'lucide-vue-next'

import type {
  OvertimeRequest,
} from '~/types/overtime'

defineProps<{
  requests: OvertimeRequest[]
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
  request: OvertimeRequest,
) => {
  info(
    'Overtime Request',
    `${request.employeeName} — ${request.hours} overtime hours`,
  )
}
</script>

<template>
  <article class="overtime-table-card">

    <div class="table-heading">
      <div>
        <h3>
          Recent Overtime Requests
        </h3>

        <p>
          Review recently filed employee overtime requests.
        </p>
      </div>
    </div>

    <div
      v-if="requests.length"
      class="table-scroll"
    >
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
              {{ formatDate(request.date) }}
            </td>

            <td>
              <strong class="time-range">
                {{ request.timeFrom }}
                –
                {{ request.timeTo }}
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

            <td>
              {{
                request.approvedBy ||
                '—'
              }}
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
.overtime-table-card {
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

.overtime-table {
  width: 100%;

  min-width: 1100px;

  border-collapse: collapse;
}

.overtime-table th {
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

.overtime-table td {
  padding: 11px 12px;

  border-bottom:
    1px solid var(--border-soft);

  color:
    var(--text-secondary);

  font-size: 9px;
}

.overtime-table
tbody
tr:last-child
td {
  border-bottom: 0;
}

.overtime-table tbody tr:hover {
  background:
    var(--bg-card-soft);
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

.time-range {
  color:
    var(--text-primary);

  white-space: nowrap;
}

.hours {
  color:
    var(--primary);

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