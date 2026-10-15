<script setup lang="ts">
import {
  CalendarDays,
  CalendarRange,
  MoreHorizontal,
  Users,
} from 'lucide-vue-next'

import type {
  PerformanceCycle,
  PerformanceCycleStatus,
  PerformanceCycleType,
} from '~/types/performanceCycle'

defineProps<{
  cycles:
    PerformanceCycle[]
}>()

const formatDate = (
  value: string,
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
      `${value}T00:00:00`,
    ),
  )
}

const typeClass = (
  type:
    PerformanceCycleType,
) => {
  if (
    type ===
    'Annual Review'
  ) {
    return 'annual'
  }

  if (
    type ===
    'Semi-Annual Review'
  ) {
    return 'semi'
  }

  if (
    type ===
    'Quarterly Review'
  ) {
    return 'quarterly'
  }

  return 'probationary'
}

const statusClass = (
  status:
    PerformanceCycleStatus,
) => {
  if (
    status ===
    'Active'
  ) {
    return 'active'
  }

  if (
    status ===
    'Completed'
  ) {
    return 'completed'
  }

  if (
    status ===
    'Scheduled'
  ) {
    return 'scheduled'
  }

  if (
    status ===
    'Draft'
  ) {
    return 'draft'
  }

  return 'archived'
}

const completionPercent = (
  item:
    PerformanceCycle,
) => {
  if (
    item.totalEmployees <= 0
  ) {
    return 0
  }

  return Math.round(
    (
      item.completedEvaluations /
      item.totalEmployees
    ) *
      100,
  )
}
</script>

<template>
  <article class="table-card">

    <!-- HEADER -->

    <div class="table-heading">

      <div>

        <h3>
          Evaluation Cycles
        </h3>

        <p>
          Manage performance periods, evaluation
          windows and employee evaluation progress.
        </p>

      </div>

    </div>

    <!-- TABLE -->

    <div
      v-if="
        cycles.length
      "
      class="table-scroll"
    >

      <table>

        <thead>

          <tr>
            <th>Cycle</th>
            <th>Type</th>
            <th>Year</th>
            <th>Performance Period</th>
            <th>Evaluation Window</th>
            <th>Employees</th>
            <th>Completed</th>
            <th>Pending</th>
            <th>Progress</th>
            <th>Status</th>
            <th>Created By</th>
            <th>Last Updated</th>
            <th />
          </tr>

        </thead>

        <tbody>

          <tr
            v-for="
              item in cycles
            "
            :key="
              item.id
            "
          >

            <!-- CYCLE -->

            <td>

              <div class="cycle-cell">

                <div class="cycle-icon">

                  <CalendarRange
                    :size="16"
                  />

                </div>

                <div>

                  <strong>
                    {{
                      item.name
                    }}
                  </strong>

                  <span>
                    {{
                      item.cycleCode
                    }}
                  </span>

                </div>

              </div>

            </td>

            <!-- TYPE -->

            <td>

              <span
                class="type-badge"
                :class="
                  typeClass(
                    item.type,
                  )
                "
              >
                {{
                  item.type
                }}
              </span>

            </td>

            <!-- YEAR -->

            <td>

              <strong class="year-value">
                {{
                  item.evaluationYear
                }}
              </strong>

            </td>

            <!-- PERFORMANCE PERIOD -->

            <td>

              <div class="date-range">

                <CalendarDays
                  :size="13"
                />

                <div>

                  <strong>
                    {{
                      formatDate(
                        item.performancePeriodStart,
                      )
                    }}
                  </strong>

                  <span>
                    to
                    {{
                      formatDate(
                        item.performancePeriodEnd,
                      )
                    }}
                  </span>

                </div>

              </div>

            </td>

            <!-- EVALUATION WINDOW -->

            <td>

              <div class="date-range evaluation">

                <CalendarDays
                  :size="13"
                />

                <div>

                  <strong>
                    {{
                      formatDate(
                        item.evaluationStart,
                      )
                    }}
                  </strong>

                  <span>
                    to
                    {{
                      formatDate(
                        item.evaluationEnd,
                      )
                    }}
                  </span>

                </div>

              </div>

            </td>

            <!-- EMPLOYEES -->

            <td>

              <div class="employee-count">

                <Users
                  :size="13"
                />

                <strong>
                  {{
                    item.totalEmployees
                  }}
                </strong>

              </div>

            </td>

            <!-- COMPLETED -->

            <td>

              <strong class="completed-value">
                {{
                  item.completedEvaluations
                }}
              </strong>

            </td>

            <!-- PENDING -->

            <td>

              <strong
                class="pending-value"
                :class="{
                  clear:
                    item.pendingEvaluations ===
                    0,
                }"
              >
                {{
                  item.pendingEvaluations
                }}
              </strong>

            </td>

            <!-- PROGRESS -->

            <td>

              <div class="progress-cell">

                <div class="progress-header">

                  <span>
                    {{
                      item.completedEvaluations
                    }}
                    /
                    {{
                      item.totalEmployees
                    }}
                  </span>

                  <strong>
                    {{
                      completionPercent(
                        item,
                      )
                    }}%
                  </strong>

                </div>

                <div class="progress-track">

                  <div
                    class="progress-bar"
                    :class="{
                      complete:
                        completionPercent(
                          item,
                        ) ===
                        100,
                    }"
                    :style="{
                      width:
                        `${completionPercent(
                          item,
                        )}%`,
                    }"
                  />

                </div>

              </div>

            </td>

            <!-- STATUS -->

            <td>

              <span
                class="status-badge"
                :class="
                  statusClass(
                    item.status,
                  )
                "
              >

                <span class="status-dot" />

                {{
                  item.status
                }}

              </span>

            </td>

            <!-- CREATED -->

            <td>

              <strong class="created-by">
                {{
                  item.createdBy
                }}
              </strong>

            </td>

            <!-- UPDATED -->

            <td>

              <span class="updated-date">
                {{
                  new Date(
                    item.updatedAt,
                  ).toLocaleDateString(
                    'en-US',
                    {
                      month:
                        'short',
                      day:
                        'numeric',
                      year:
                        'numeric',
                    },
                  )
                }}
              </span>

            </td>

            <!-- ACTION -->

            <td>

              <button
                type="button"
                class="action-button"
                title="Cycle actions will be added later"
              >

                <MoreHorizontal
                  :size="18"
                />

              </button>

            </td>

          </tr>

        </tbody>

      </table>

    </div>

    <!-- EMPTY -->

    <div
      v-else
      class="empty-state"
    >

      <CalendarRange
        :size="34"
      />

      <strong>
        No evaluation cycles found
      </strong>

      <span>
        Try changing your performance cycle filters.
      </span>

    </div>

  </article>
</template>

<style scoped>
.table-card {
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
  padding:
    16px 17px;

  border-bottom:
    1px solid var(--border-soft);
}

.table-heading h3 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 15px;
}

.table-heading p {
  margin:
    5px 0 0;

  color:
    var(--text-muted);

  font-size: 10px;
}

.table-scroll {
  overflow-x: auto;
}

table {
  width: 100%;

  min-width: 2150px;

  border-collapse:
    collapse;
}

th {
  padding:
    12px 13px;

  background:
    var(--bg-card-soft);

  color:
    var(--text-secondary);

  font-size: 10px;
  font-weight: 700;

  text-align: left;

  text-transform:
    uppercase;

  white-space: nowrap;
}

td {
  padding:
    13px;

  border-top:
    1px solid var(--border-soft);

  color:
    var(--text-secondary);

  font-size: 10px;

  vertical-align: middle;
}

tbody tr:hover {
  background:
    var(--bg-card-soft);
}

/* CYCLE */

.cycle-cell {
  display: flex;

  min-width: 265px;

  align-items: center;

  gap: 9px;
}

.cycle-icon {
  display: flex;

  width: 36px;
  height: 36px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.cycle-cell strong,
.cycle-cell span {
  display: block;
}

.cycle-cell strong {
  color:
    var(--text-primary);

  font-size: 10px;
}

.cycle-cell span {
  margin-top: 3px;

  color:
    var(--primary);

  font-size: 9px;
  font-weight: 650;
}

/* TYPE */

.type-badge {
  display: inline-flex;

  padding:
    5px 9px;

  border-radius: 20px;

  font-size: 9px;
  font-weight: 650;

  white-space: nowrap;
}

.type-badge.annual {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.type-badge.semi {
  background:
    var(--purple-soft);

  color:
    var(--purple);
}

.type-badge.quarterly {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.type-badge.probationary {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.year-value {
  color:
    var(--text-primary);
}

/* DATE RANGE */

.date-range {
  display: flex;

  min-width: 170px;

  align-items: flex-start;

  gap: 6px;
}

.date-range svg {
  margin-top: 1px;

  color:
    var(--text-muted);
}

.date-range.evaluation svg {
  color:
    var(--primary);
}

.date-range strong,
.date-range span {
  display: block;
}

.date-range strong {
  color:
    var(--text-primary);

  font-size: 10px;
}

.date-range span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 9px;
}

/* COUNTS */

.employee-count {
  display: flex;

  align-items: center;

  gap: 5px;

  color:
    var(--text-primary);
}

.employee-count svg {
  color:
    var(--primary);
}

.completed-value {
  color:
    var(--green);
}

.pending-value {
  color:
    var(--orange);
}

.pending-value.clear {
  color:
    var(--green);
}

/* PROGRESS */

.progress-cell {
  width: 160px;
}

.progress-header {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 10px;

  margin-bottom: 5px;
}

.progress-header span {
  color:
    var(--text-secondary);

  font-size: 9px;
}

.progress-header strong {
  color:
    var(--text-primary);

  font-size: 9px;
}

.progress-track {
  overflow: hidden;

  height: 6px;

  border-radius: 20px;

  background:
    var(--border-soft);
}

.progress-bar {
  height: 100%;

  border-radius: inherit;

  background:
    var(--primary);

  transition:
    width 0.2s ease;
}

.progress-bar.complete {
  background:
    var(--green);
}

/* STATUS */

.status-badge {
  display: inline-flex;

  align-items: center;

  gap: 5px;

  padding:
    5px 8px;

  border-radius: 20px;

  font-size: 9px;
  font-weight: 650;

  white-space: nowrap;
}

.status-dot {
  width: 5px;
  height: 5px;

  border-radius: 50%;

  background:
    currentColor;
}

.status-badge.active {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.status-badge.completed {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.status-badge.scheduled {
  background:
    var(--purple-soft);

  color:
    var(--purple);
}

.status-badge.draft {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.status-badge.archived {
  background:
    var(--bg-card-soft);

  color:
    var(--text-muted);
}

.created-by {
  color:
    var(--text-primary);

  white-space: nowrap;
}

.updated-date {
  white-space: nowrap;
}

/* ACTION */

.action-button {
  display: flex;

  width: 32px;
  height: 32px;

  align-items: center;
  justify-content: center;

  border:
    1px solid transparent;

  border-radius: 7px;

  background:
    transparent;

  color:
    var(--text-secondary);
}

.action-button:hover {
  border-color:
    var(--border);

  background:
    var(--bg-card-soft);

  color:
    var(--primary);
}

/* EMPTY */

.empty-state {
  display: flex;

  min-height: 260px;

  flex-direction: column;

  align-items: center;
  justify-content: center;

  gap: 8px;

  color:
    var(--text-muted);
}

.empty-state strong {
  color:
    var(--text-primary);

  font-size: 12px;
}

.empty-state span {
  font-size: 10px;
}
</style>