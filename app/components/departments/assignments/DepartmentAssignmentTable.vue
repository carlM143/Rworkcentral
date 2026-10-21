<script setup lang="ts">
import {
  Building2,
  CalendarDays,
  UserRound,
  Users,
} from 'lucide-vue-next'

import type {
  DepartmentAssignment,
  DepartmentAssignmentStatus,
  DepartmentAssignmentType,
} from '~/types/departmentAssignment'

defineProps<{
  assignments: DepartmentAssignment[]
}>()

const emit = defineEmits<{
  view: [assignment: DepartmentAssignment]
  edit: [assignment: DepartmentAssignment]
  end: [assignment: DepartmentAssignment]
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

const formatDateTime = (
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
    new Date(value),
  )
}

const typeClass = (
  type:
    DepartmentAssignmentType,
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

  return 'acting'
}

const statusClass = (
  status:
    DepartmentAssignmentStatus,
) => {
  if (
    status ===
    'Active'
  ) {
    return 'active'
  }

  if (
    status ===
    'Temporary'
  ) {
    return 'temporary'
  }

  return 'ended'
}
</script>

<template>
  <article class="table-card">

    <div class="table-heading">

      <div>

        <h3>
          Employee Department Assignments
        </h3>

        <p>
          Review employee department,
          position, supervisor and current
          assignment information.
        </p>

      </div>

    </div>

    <div
      v-if="
        assignments.length
      "
      class="table-scroll"
    >

      <table>

        <thead>

          <tr>
            <th>Assignment No.</th>
            <th>Employee</th>
            <th>Department</th>
            <th>Position</th>
            <th>Assignment Type</th>
            <th>Supervisor</th>
            <th>Effective Date</th>
            <th>End Date</th>
            <th>Status</th>
            <th>Assigned By</th>
            <th>Last Assigned</th>
            <th class="sticky-remarks-column">Remarks</th>
            <th class="sticky-action-column">Actions</th>
          </tr>

        </thead>

        <tbody>

          <tr
            v-for="
              item in assignments
            "
            :key="
              item.id
            "
          >

            <!-- ASSIGNMENT NO -->

            <td>

              <strong class="assignment-number">
                {{
                  item.assignmentNumber
                }}
              </strong>

            </td>

            <!-- EMPLOYEE -->

            <td>

              <div class="employee-cell">

                <div class="employee-icon">

                  <UserRound
                    :size="16"
                  />

                </div>

                <div>

                  <strong>
                    {{
                      item.employeeName
                    }}
                  </strong>

                  <span>
                    {{
                      item.employeeNumber
                    }}
                  </span>

                </div>

              </div>

            </td>

            <!-- DEPARTMENT -->

            <td>

              <div class="department-cell">

                <Building2
                  :size="13"
                />

                <strong>
                  {{
                    item.department
                  }}
                </strong>

              </div>

            </td>

            <!-- POSITION -->

            <td>

              <strong class="position-name">
                {{
                  item.position
                }}
              </strong>

            </td>

            <!-- TYPE -->

            <td>

              <span
                class="type-badge"
                :class="
                  typeClass(
                    item.assignmentType,
                  )
                "
              >
                {{
                  item.assignmentType
                }}
              </span>

            </td>

            <!-- SUPERVISOR -->

            <td>

              <div class="supervisor-cell">

                <Users
                  :size="13"
                />

                <span>
                  {{
                    item.supervisor
                  }}
                </span>

              </div>

            </td>

            <!-- EFFECTIVE -->

            <td>

              <div class="date-cell">

                <CalendarDays
                  :size="13"
                />

                {{
                  formatDate(
                    item.effectiveDate,
                  )
                }}

              </div>

            </td>

            <!-- END -->

            <td>

              <span class="end-date">
                {{
                  formatDate(
                    item.endDate,
                  )
                }}
              </span>

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

            <!-- ASSIGNED BY -->

            <td>

              <strong class="assigned-by">
                {{
                  item.assignedBy
                }}
              </strong>

            </td>

            <!-- DATE ASSIGNED -->

            <td>

              <span class="assigned-date">
                {{
                  formatDateTime(
                    item.assignedAt,
                  )
                }}
              </span>

            </td>

            <!-- REMARKS -->

            <td class="sticky-remarks-column">

              <p class="remarks">
                {{
                  item.remarks ||
                  'No remarks'
                }}
              </p>

            </td>

            <!-- ACTION -->

            <td class="sticky-action-column">

              <DepartmentAssignmentActions
                :assignment="item"
                @view="emit('view', $event)"
                @edit="emit('edit', $event)"
                @end="emit('end', $event)"
              />

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

      <Users
        :size="34"
      />

      <strong>
        No department assignments found
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

  min-width: 2050px;

  border-collapse: collapse;
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

  text-transform: uppercase;

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

/* ASSIGNMENT */

.assignment-number {
  color:
    var(--primary);

  font-size: 10px;

  white-space: nowrap;
}

/* EMPLOYEE */

.employee-cell {
  display: flex;

  min-width: 190px;

  align-items: center;

  gap: 9px;
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

  font-size: 9px;
}

/* DEPARTMENT */

.department-cell {
  display: flex;

  min-width: 145px;

  align-items: center;

  gap: 6px;

  color:
    var(--text-primary);
}

.department-cell svg {
  color:
    var(--text-muted);
}

.position-name {
  color:
    var(--text-primary);

  white-space: nowrap;
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

.type-badge.acting {
  background:
    var(--purple-soft);

  color:
    var(--purple);
}

/* SUPERVISOR */

.supervisor-cell {
  display: flex;

  min-width: 145px;

  align-items: center;

  gap: 5px;

  color:
    var(--text-primary);
}

.supervisor-cell svg {
  color:
    var(--text-muted);
}

/* DATES */

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

.end-date,
.assigned-date {
  white-space: nowrap;
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

.status-badge.temporary {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.status-badge.ended {
  background:
    var(--red-soft);

  color:
    var(--red);
}

.assigned-by {
  color:
    var(--text-primary);

  white-space: nowrap;
}

/* REMARKS */

.remarks {
  width: 190px;

  margin: 0;

  overflow: hidden;

  color:
    var(--text-secondary);

  font-size: 10px;

  text-overflow: ellipsis;

  white-space: nowrap;
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

/* Keep Remarks and Actions adjacent while scrolling horizontally. */
.table-scroll table {
  min-width: 1850px;
  table-layout: auto;
}

.table-scroll th.sticky-remarks-column,
.table-scroll td.sticky-remarks-column {
  position: sticky;
  right: 72px;
  z-index: 2;
  box-sizing: border-box;
  width: 172px;
  min-width: 172px;
  max-width: 172px;
  padding: 10px 12px;
  background: var(--bg-card);
  box-shadow: -1px 0 0 var(--border-soft);
}

.table-scroll th.sticky-action-column,
.table-scroll td.sticky-action-column {
  position: sticky;
  right: 0;
  z-index: 3;
  box-sizing: border-box;
  width: 72px;
  min-width: 72px;
  max-width: 72px;
  padding: 10px 12px;
  text-align: center;
  background: var(--bg-card);
}

.table-scroll thead th.sticky-remarks-column,
.table-scroll thead th.sticky-action-column {
  z-index: 5;
  background: var(--bg-card-soft);
}

.table-scroll tbody tr:hover td.sticky-remarks-column,
.table-scroll tbody tr:hover td.sticky-action-column {
  background: var(--bg-card-soft);
}

.table-scroll td.sticky-action-column :deep(.actions-holder) {
  justify-content: center;
}

.table-scroll td.sticky-remarks-column .remarks {
  width: 145px;
  max-width: 145px;
  margin: 0;
}

</style>