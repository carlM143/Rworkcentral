<script setup lang="ts">
import {
  Building2,
  CalendarDays,
  MoreHorizontal,
  UserRound,
} from 'lucide-vue-next'

import type {
  ClientAssignmentStatus,
  ClientAssignmentType,
  ClientEmployeeAssignment,
} from '~/types/clientEmployeeAssignment'

defineProps<{
  assignments:
    ClientEmployeeAssignment[]
}>()

const formatDate = (
  value?: string,
) => {
  if (!value) {
    return '—'
  }

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

const statusClass = (
  status:
    ClientAssignmentStatus,
) => {
  if (
    status ===
    'Active'
  ) {
    return 'active'
  }

  if (
    status ===
    'Pending'
  ) {
    return 'pending'
  }

  if (
    status ===
    'Transferred'
  ) {
    return 'transferred'
  }

  return 'ended'
}

const typeClass = (
  type:
    ClientAssignmentType,
) => {
  if (
    type ===
    'Primary'
  ) {
    return 'primary'
  }

  if (
    type ===
    'Temporary'
  ) {
    return 'temporary'
  }

  if (
    type ===
    'Reliever'
  ) {
    return 'reliever'
  }

  return 'project'
}
</script>

<template>
  <article class="table-card">

    <!-- HEADER -->

    <div class="table-heading">

      <div>

        <h3>
          Employee Assignment
        </h3>

        <p>
          Monitor employee deployments,
          assigned clients, assignment types
          and current assignment status.
        </p>

      </div>

    </div>

    <!-- TABLE -->

    <div
      v-if="
        assignments.length
      "
      class="table-scroll"
    >

      <table>

        <thead>

          <tr>
            <th>Employee</th>
            <th>Client</th>
            <th>Department</th>
            <th>Position</th>
            <th>Assignment Date</th>
            <th>End Date</th>
            <th>Assignment Type</th>
            <th>Status</th>
            <th>Assigned By</th>
            <th />
          </tr>

        </thead>

        <tbody>

          <tr
            v-for="
              assignment in assignments
            "
            :key="
              assignment.id
            "
          >

            <!-- EMPLOYEE -->

            <td>

              <div class="employee-cell">

                <div class="employee-icon">

                  <UserRound
                    :size="15"
                  />

                </div>

                <div>

                  <strong>
                    {{
                      assignment.employeeName
                    }}
                  </strong>

                  <span>
                    {{
                      assignment.employeeNumber
                    }}
                  </span>

                </div>

              </div>

            </td>

            <!-- CLIENT -->

            <td>

              <div class="client-cell">

                <div class="client-icon">

                  <Building2
                    :size="14"
                  />

                </div>

                <div>

                  <strong>
                    {{
                      assignment.clientName
                    }}
                  </strong>

                  <span>
                    {{
                      assignment.clientCode
                    }}
                  </span>

                </div>

              </div>

            </td>

            <!-- DEPARTMENT -->

            <td>

              <span class="department">
                {{
                  assignment.department
                }}
              </span>

            </td>

            <!-- POSITION -->

            <td>

              <strong class="position">
                {{
                  assignment.position
                }}
              </strong>

            </td>

            <!-- ASSIGNMENT DATE -->

            <td>

              <div class="date-cell">

                <CalendarDays
                  :size="12"
                />

                {{
                  formatDate(
                    assignment.assignmentDate,
                  )
                }}

              </div>

            </td>

            <!-- END DATE -->

            <td>

              <span
                :class="{
                  'ended-date':
                    assignment.endDate,
                }"
              >
                {{
                  formatDate(
                    assignment.endDate,
                  )
                }}
              </span>

            </td>

            <!-- TYPE -->

            <td>

              <span
                class="type-badge"
                :class="
                  typeClass(
                    assignment.assignmentType,
                  )
                "
              >
                {{
                  assignment.assignmentType
                }}
              </span>

            </td>

            <!-- STATUS -->

            <td>

              <span
                class="status-badge"
                :class="
                  statusClass(
                    assignment.status,
                  )
                "
              >

                <span class="status-dot" />

                {{
                  assignment.status
                }}

              </span>

            </td>

            <!-- ASSIGNED BY -->

            <td>

              <div class="assigned-by">

                <strong>
                  {{
                    assignment.assignedBy
                  }}
                </strong>

                <span>
                  Assignment creator
                </span>

              </div>

            </td>

            <!-- ACTION -->

            <td>

              <button
                type="button"
                class="action-button"
                title="Actions will be added later"
              >

                <MoreHorizontal
                  :size="17"
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

      <UserRound
        :size="32"
      />

      <strong>
        No employee assignments found
      </strong>

      <span>
        Try changing your assignment filters.
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
    15px 16px;

  border-bottom:
    1px solid
    var(--border-soft);
}

.table-heading h3 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 14px;
}

.table-heading p {
  margin:
    5px 0 0;

  color:
    var(--text-muted);

  font-size: 9px;
}

.table-scroll {
  overflow-x: auto;
}

table {
  width: 100%;

  min-width: 1650px;

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

  font-size: 9px;
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
    1px solid
    var(--border-soft);

  color:
    var(--text-secondary);

  font-size: 9px;

  vertical-align:
    middle;
}

tbody tr:hover {
  background:
    var(--bg-card-soft);
}

/* =========================
   EMPLOYEE
========================= */

.employee-cell {
  display: flex;

  min-width: 190px;

  align-items: center;

  gap: 8px;
}

.employee-icon {
  display: flex;

  width: 34px;
  height: 34px;

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

  font-size: 8px;
}

/* =========================
   CLIENT
========================= */

.client-cell {
  display: flex;

  min-width: 235px;

  align-items: center;

  gap: 8px;
}

.client-icon {
  display: flex;

  width: 30px;
  height: 30px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 7px;

  background:
    var(--purple-soft);

  color:
    var(--purple);
}

.client-cell strong,
.client-cell span {
  display: block;
}

.client-cell strong {
  color:
    var(--text-primary);

  font-size: 9px;
}

.client-cell span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 8px;
}

/* =========================
   DEPARTMENT / POSITION
========================= */

.department {
  display: inline-flex;

  padding:
    5px 7px;

  border-radius: 5px;

  background:
    var(--bg-card-soft);

  color:
    var(--text-secondary);

  white-space: nowrap;
}

.position {
  color:
    var(--text-primary);

  white-space: nowrap;
}

/* =========================
   DATE
========================= */

.date-cell {
  display: flex;

  align-items: center;

  gap: 5px;

  white-space: nowrap;
}

.date-cell svg {
  color:
    var(--text-muted);
}

.ended-date {
  color:
    var(--red);

  white-space: nowrap;
}

/* =========================
   TYPE
========================= */

.type-badge {
  display: inline-flex;

  padding:
    5px 8px;

  border-radius: 20px;

  font-size: 8px;
  font-weight: 650;

  white-space: nowrap;
}

.type-badge.primary {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.type-badge.temporary {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.type-badge.reliever {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.type-badge.project {
  background:
    var(--purple-soft);

  color:
    var(--purple);
}

/* =========================
   STATUS
========================= */

.status-badge {
  display: inline-flex;

  align-items: center;

  gap: 5px;

  padding:
    5px 8px;

  border-radius: 20px;

  font-size: 8px;
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

.status-badge.pending {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.status-badge.transferred {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.status-badge.ended {
  background:
    var(--red-soft);

  color:
    var(--red);
}

/* =========================
   ASSIGNED BY
========================= */

.assigned-by {
  min-width: 120px;
}

.assigned-by strong,
.assigned-by span {
  display: block;
}

.assigned-by strong {
  color:
    var(--text-primary);

  font-size: 9px;
}

.assigned-by span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 8px;
}

/* =========================
   ACTION
========================= */

.action-button {
  display: flex;

  width: 31px;
  height: 31px;

  align-items: center;
  justify-content: center;

  border:
    1px solid transparent;

  border-radius: 7px;

  background:
    transparent;

  color:
    var(--text-secondary);

  cursor: pointer;
}

.action-button:hover {
  border-color:
    var(--border);

  background:
    var(--bg-card-soft);

  color:
    var(--primary);
}

/* =========================
   EMPTY
========================= */

.empty-state {
  display: flex;

  min-height: 250px;

  flex-direction: column;

  align-items: center;
  justify-content: center;

  gap: 7px;

  color:
    var(--text-muted);
}

.empty-state strong {
  color:
    var(--text-primary);

  font-size: 11px;
}

.empty-state span {
  font-size: 9px;
}
</style>