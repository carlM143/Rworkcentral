<script setup lang="ts">
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  Eye,
  MoreHorizontal,
  Pencil,
  UserRound,
  UserRoundSearch,
  XCircle,
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

const emit =
  defineEmits<{
    view: [
      assignment:
        ClientEmployeeAssignment,
    ]

    edit: [
      assignment:
        ClientEmployeeAssignment,
    ]

    employee: [
      assignment:
        ClientEmployeeAssignment,
    ]

    activate: [
      assignment:
        ClientEmployeeAssignment,
    ]

    end: [
      assignment:
        ClientEmployeeAssignment,
    ]
  }>()

const openMenuId =
  ref<number | null>(
    null,
  )

const toggleMenu = (
  id: number,
) => {
  openMenuId.value =
    openMenuId.value === id
      ? null
      : id
}

const closeMenu = () => {
  openMenuId.value =
    null
}

const handleAction = (
  action:
    | 'view'
    | 'edit'
    | 'employee'
    | 'activate'
    | 'end',

  assignment:
    ClientEmployeeAssignment,
) => {
  closeMenu()

  emit(
    action,
    assignment,
  )
}

const handleWindowClick = () => {
  closeMenu()
}

onMounted(() => {
  window.addEventListener(
    'click',
    handleWindowClick,
  )
})

onBeforeUnmount(() => {
  window.removeEventListener(
    'click',
    handleWindowClick,
  )
})

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

            <td>

              <div class="employee-cell">

                <div class="employee-icon">

                  <UserRound
                    :size="15"
                  />

                </div>

                <div>

                  <strong>
                    {{ assignment.employeeName }}
                  </strong>

                  <span>
                    {{ assignment.employeeNumber }}
                  </span>

                </div>

              </div>

            </td>

            <td>

              <div class="client-cell">

                <div class="client-icon">

                  <Building2
                    :size="14"
                  />

                </div>

                <div>

                  <strong>
                    {{ assignment.clientName }}
                  </strong>

                  <span>
                    {{ assignment.clientCode }}
                  </span>

                </div>

              </div>

            </td>

            <td>

              <span class="department">
                {{ assignment.department }}
              </span>

            </td>

            <td>

              <strong class="position">
                {{ assignment.position }}
              </strong>

            </td>

            <td>

              <div class="date-cell">

                <CalendarDays :size="12" />

                {{
                  formatDate(
                    assignment.assignmentDate,
                  )
                }}

              </div>

            </td>

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

            <td>

              <span
                class="type-badge"
                :class="
                  typeClass(
                    assignment.assignmentType,
                  )
                "
              >
                {{ assignment.assignmentType }}
              </span>

            </td>

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

                {{ assignment.status }}

              </span>

            </td>

            <td>

              <div class="assigned-by">

                <strong>
                  {{ assignment.assignedBy }}
                </strong>

                <span>
                  Assignment creator
                </span>

              </div>

            </td>

            <!-- ACTION -->

            <td class="action-cell">

              <div class="action-wrapper">

                <button
                  type="button"
                  class="action-button"
                  @click.stop="
                    toggleMenu(
                      assignment.id,
                    )
                  "
                >

                  <MoreHorizontal
                    :size="17"
                  />

                </button>

                <Transition name="menu-fade">

                  <div
                    v-if="
                      openMenuId ===
                      assignment.id
                    "
                    class="action-menu"
                    @click.stop
                  >

                    <button
                      type="button"
                      @click="
                        handleAction(
                          'view',
                          assignment,
                        )
                      "
                    >

                      <Eye :size="14" />

                      <div>

                        <strong>
                          View Details
                        </strong>

                        <span>
                          Review assignment
                        </span>

                      </div>

                    </button>

                    <button
                      type="button"
                      @click="
                        handleAction(
                          'edit',
                          assignment,
                        )
                      "
                    >

                      <Pencil :size="14" />

                      <div>

                        <strong>
                          Edit Assignment
                        </strong>

                        <span>
                          Update deployment
                        </span>

                      </div>

                    </button>

                    <button
                      type="button"
                      @click="
                        handleAction(
                          'employee',
                          assignment,
                        )
                      "
                    >

                      <UserRoundSearch
                        :size="14"
                      />

                      <div>

                        <strong>
                          View Employee
                        </strong>

                        <span>
                          Open employee profile
                        </span>

                      </div>

                    </button>

                    <button
                      v-if="
                        assignment.status ===
                        'Pending'
                      "
                      type="button"
                      @click="
                        handleAction(
                          'activate',
                          assignment,
                        )
                      "
                    >

                      <CheckCircle2
                        :size="14"
                      />

                      <div>

                        <strong>
                          Activate Assignment
                        </strong>

                        <span>
                          Confirm deployment
                        </span>

                      </div>

                    </button>

                    <button
                      v-if="
                        assignment.status ===
                        'Active'
                      "
                      type="button"
                      class="danger-action"
                      @click="
                        handleAction(
                          'end',
                          assignment,
                        )
                      "
                    >

                      <XCircle
                        :size="14"
                      />

                      <div>

                        <strong>
                          End Assignment
                        </strong>

                        <span>
                          Close current deployment
                        </span>

                      </div>

                    </button>

                  </div>

                </Transition>

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
  overflow: visible;

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
    1px solid var(--border-soft);
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

  border-collapse: collapse;
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

  font-size: 9px;

  vertical-align: middle;
}

tbody tr:hover {
  background:
    var(--bg-card-soft);
}

.employee-cell,
.client-cell {
  display: flex;

  align-items: center;

  gap: 8px;
}

.employee-cell {
  min-width: 190px;
}

.client-cell {
  min-width: 235px;
}

.employee-icon,
.client-icon {
  display: flex;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 8px;
}

.employee-icon {
  width: 34px;
  height: 34px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.client-icon {
  width: 30px;
  height: 30px;

  background:
    var(--purple-soft);

  color:
    var(--purple);
}

.employee-cell strong,
.employee-cell span,
.client-cell strong,
.client-cell span {
  display: block;
}

.employee-cell strong,
.client-cell strong {
  color:
    var(--text-primary);

  font-size: 9px;
}

.employee-cell span,
.client-cell span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 8px;
}

.department {
  display: inline-flex;

  padding:
    5px 7px;

  border-radius: 5px;

  background:
    var(--bg-card-soft);

  white-space: nowrap;
}

.position {
  color:
    var(--text-primary);

  white-space: nowrap;
}

.date-cell {
  display: flex;

  align-items: center;

  gap: 5px;

  white-space: nowrap;
}

.ended-date {
  color:
    var(--red);
}

.type-badge,
.status-badge {
  display: inline-flex;

  align-items: center;

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

.status-badge {
  gap: 5px;
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

/* ACTION */

.action-cell {
  position: relative;

  width: 45px;
}

.action-wrapper {
  position: relative;
}

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

.action-menu {
  position: absolute;

  z-index: 300;

  top:
    calc(100% + 5px);

  right: 0;

  width: 220px;

  padding: 5px;

  border:
    1px solid var(--border);

  border-radius: 9px;

  background:
    var(--bg-card);

  box-shadow:
    0 18px 45px
    rgba(0, 0, 0, 0.25);
}

.action-menu button {
  display: flex;

  width: 100%;

  align-items: flex-start;

  gap: 8px;

  padding: 8px;

  border: 0;
  border-radius: 6px;

  background:
    transparent;

  color:
    var(--text-secondary);

  font-family:
    inherit;

  text-align: left;

  cursor: pointer;
}

.action-menu button:hover {
  background:
    var(--bg-card-soft);

  color:
    var(--primary);
}

.action-menu svg {
  flex-shrink: 0;

  margin-top: 2px;
}

.action-menu strong,
.action-menu span {
  display: block;
}

.action-menu strong {
  color:
    var(--text-primary);

  font-size: 8px;
}

.action-menu span {
  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 7px;
}

.action-menu .danger-action:hover {
  background:
    var(--red-soft);

  color:
    var(--red);
}

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

.menu-fade-enter-active,
.menu-fade-leave-active {
  transition:
    0.12s ease;
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;

  transform:
    translateY(-3px);
}
</style>