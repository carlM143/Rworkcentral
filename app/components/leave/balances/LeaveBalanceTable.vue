<script setup lang="ts">
import {
  CalendarDays,
  MoreHorizontal,
  SlidersHorizontal,
  UserRound,
} from 'lucide-vue-next'

import type {
  LeaveBalance,
  LeaveBalanceStatus,
} from '~/types/leaveBalance'

defineProps<{
  balances:
    LeaveBalance[]
}>()

const emit =
  defineEmits<{
    employee: [
      balance:
        LeaveBalance,
    ]

    adjust: [
      balance:
        LeaveBalance,
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

const handleEmployee = (
  balance:
    LeaveBalance,
) => {
  closeMenu()

  emit(
    'employee',
    balance,
  )
}

const handleAdjust = (
  balance:
    LeaveBalance,
) => {
  closeMenu()

  emit(
    'adjust',
    balance,
  )
}

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

const statusClass = (
  status:
    LeaveBalanceStatus,
) => {
  if (
    status ===
    'Healthy'
  ) {
    return 'healthy'
  }

  if (
    status ===
    'Low Balance'
  ) {
    return 'low'
  }

  return 'exhausted'
}
</script>

<template>
  <article class="table-card">

    <div class="table-heading">

      <div>

        <h3>
          Employee Leave Balances
        </h3>

        <p>
          Review allocated, used and remaining
          leave credits for each employee.
        </p>

      </div>

    </div>

    <div
      v-if="
        balances.length
      "
      class="table-scroll"
    >

      <table>

        <thead>

          <tr>
            <th>Employee</th>
            <th>Department</th>
            <th>Vacation Leave</th>
            <th>Sick Leave</th>
            <th>Emergency Leave</th>
            <th>Special Leave</th>
            <th>Total Allocated</th>
            <th>Total Used</th>
            <th>Available</th>
            <th>Status</th>
            <th>Last Updated</th>
            <th />
          </tr>

        </thead>

        <tbody>

          <tr
            v-for="
              item in balances
            "
            :key="
              item.id
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
                    {{ item.employeeName }}
                  </strong>

                  <span>
                    {{ item.employeeNumber }}
                    ·
                    {{ item.position }}
                  </span>

                </div>

              </div>

            </td>

            <td>

              <strong class="department">
                {{ item.department }}
              </strong>

            </td>

            <td>

              <div class="credit-cell">

                <strong>
                  {{ item.vacationLeave.available }}
                </strong>

                <span>
                  {{ item.vacationLeave.used }}
                  used /
                  {{ item.vacationLeave.allocated }}
                </span>

              </div>

            </td>

            <td>

              <div class="credit-cell">

                <strong>
                  {{ item.sickLeave.available }}
                </strong>

                <span>
                  {{ item.sickLeave.used }}
                  used /
                  {{ item.sickLeave.allocated }}
                </span>

              </div>

            </td>

            <td>

              <div class="credit-cell">

                <strong>
                  {{ item.emergencyLeave.available }}
                </strong>

                <span>
                  {{ item.emergencyLeave.used }}
                  used /
                  {{ item.emergencyLeave.allocated }}
                </span>

              </div>

            </td>

            <td>

              <div class="credit-cell">

                <strong>
                  {{ item.specialLeave.available }}
                </strong>

                <span>
                  {{ item.specialLeave.used }}
                  used /
                  {{ item.specialLeave.allocated }}
                </span>

              </div>

            </td>

            <td>
              <strong class="total-value">
                {{ item.totalAllocated }}
              </strong>
            </td>

            <td>
              <strong class="used-value">
                {{ item.totalUsed }}
              </strong>
            </td>

            <td>
              <strong class="available-value">
                {{ item.totalAvailable }}
              </strong>
            </td>

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

                {{ item.status }}

              </span>

            </td>

            <td>

              <div class="updated-cell">

                <CalendarDays
                  :size="12"
                />

                {{
                  formatDate(
                    item.lastUpdated,
                  )
                }}

              </div>

            </td>

            <!-- ACTION -->

            <td class="action-cell">

              <button
                type="button"
                class="action-button"
                title="More actions"
                @click.stop="
                  toggleMenu(
                    item.id,
                  )
                "
              >
                <MoreHorizontal
                  :size="17"
                />
              </button>

              <div
                v-if="
                  openMenuId ===
                  item.id
                "
                class="action-menu"
              >

                <button
                  type="button"
                  @click="
                    handleEmployee(
                      item,
                    )
                  "
                >
                  <UserRound
                    :size="14"
                  />

                  View Employee
                </button>

                <button
                  type="button"
                  @click="
                    handleAdjust(
                      item,
                    )
                  "
                >
                  <SlidersHorizontal
                    :size="14"
                  />

                  Adjust Credits
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

      <CalendarDays
        :size="31"
      />

      <strong>
        No leave balances found
      </strong>

      <span>
        Try changing your filters.
      </span>

    </div>

  </article>
</template>

<style scoped>
.table-card {
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

  min-width: 1800px;

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

  white-space:
    nowrap;
}

td {
  padding:
    13px;

  border-top:
    1px solid var(--border-soft);

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

.employee-cell {
  display: flex;

  min-width: 225px;

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
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 8px;
}

.department {
  color:
    var(--text-primary);

  white-space:
    nowrap;
}

.credit-cell {
  min-width: 105px;
}

.credit-cell strong,
.credit-cell span {
  display: block;
}

.credit-cell strong {
  color:
    var(--text-primary);

  font-size: 11px;
}

.credit-cell span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 8px;
}

.total-value {
  color:
    var(--text-primary);
}

.used-value {
  color:
    var(--orange);
}

.available-value {
  color:
    var(--green);

  font-size: 11px;
}

.status-badge {
  display: inline-flex;

  align-items: center;

  gap: 5px;

  padding:
    5px 8px;

  border-radius: 20px;

  font-size: 8px;
  font-weight: 650;

  white-space:
    nowrap;
}

.status-dot {
  width: 5px;
  height: 5px;

  border-radius: 50%;

  background:
    currentColor;
}

.status-badge.healthy {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.status-badge.low {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.status-badge.exhausted {
  background:
    var(--red-soft);

  color:
    var(--red);
}

.updated-cell {
  display: flex;

  align-items: center;

  gap: 5px;

  white-space:
    nowrap;
}

.updated-cell svg {
  color:
    var(--text-muted);
}

.action-cell {
  position: relative;

  width: 45px;

  text-align: right;
}

.action-button {
  display: inline-flex;

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
  z-index: 50;

  top: 44px;
  right: 10px;

  width: 160px;

  overflow: hidden;

  border:
    1px solid var(--border);

  border-radius: 8px;

  background:
    var(--bg-card);

  box-shadow:
    0 12px 35px
    rgba(0, 0, 0, 0.22);
}

.action-menu button {
  display: flex;

  width: 100%;

  align-items: center;

  gap: 8px;

  padding:
    9px 10px;

  border: 0;

  background:
    transparent;

  color:
    var(--text-secondary);

  font-family: inherit;

  font-size: 8px;

  text-align: left;

  cursor: pointer;
}

.action-menu button:hover {
  background:
    var(--primary-soft);

  color:
    var(--primary);
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
</style>