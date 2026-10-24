<script setup lang="ts">
import {
  CalendarDays,
  Check,
  MoreHorizontal,
  RotateCcw,
  ShieldCheck,
  X,
} from 'lucide-vue-next'

import type {
  LeaveType,
  LeaveTypeCategory,
  LeaveTypeStatus,
} from '~/types/leaveType'

defineProps<{
  leaveTypes:
    LeaveType[]
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
    new Date(value),
  )
}

const categoryClass = (
  category:
    LeaveTypeCategory,
) => {
  if (
    category ===
    'Company Leave'
  ) {
    return 'company'
  }

  if (
    category ===
    'Statutory Leave'
  ) {
    return 'statutory'
  }

  return 'special'
}

const statusClass = (
  status:
    LeaveTypeStatus,
) => {
  return status ===
    'Active'
    ? 'active'
    : 'inactive'
}
</script>

<template>
  <article class="table-card">

    <!-- HEADER -->

    <div class="table-heading">

      <div>

        <h3>
          Leave Types
        </h3>

        <p>
          Manage available leave categories,
          default credits, pay treatment and leave rules.
        </p>

      </div>

    </div>

    <!-- TABLE -->

    <div
      v-if="
        leaveTypes.length
      "
      class="table-scroll"
    >

      <table>

        <thead>

          <tr>
            <th>Leave Type</th>
            <th>Category</th>
            <th>Description</th>
            <th>Default Credits</th>
            <th>Pay</th>
            <th>Approval</th>
            <th>Carry Over</th>
            <th>Min. Days</th>
            <th>Max. Days</th>
            <th>Status</th>
            <th>Last Updated</th>
            <th />
          </tr>

        </thead>

        <tbody>

          <tr
            v-for="
              item in leaveTypes
            "
            :key="
              item.id
            "
          >

            <!-- LEAVE TYPE -->

            <td>

              <div class="leave-type-cell">

                <div class="leave-icon">

                  <CalendarDays
                    :size="15"
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
                      item.code
                    }}
                  </span>

                </div>

              </div>

            </td>

            <!-- CATEGORY -->

            <td>

              <span
                class="category-badge"
                :class="
                  categoryClass(
                    item.category,
                  )
                "
              >
                {{
                  item.category
                }}
              </span>

            </td>

            <!-- DESCRIPTION -->

            <td>

              <p class="description">
                {{
                  item.description
                }}
              </p>

            </td>

            <!-- CREDITS -->

            <td>

              <div class="credit-cell">

                <strong>
                  {{
                    item.defaultCredits
                  }}
                </strong>

                <span>
                  {{
                    item.creditUnit
                  }}
                </span>

              </div>

            </td>

            <!-- PAID -->

            <td>

              <span
                class="boolean-badge"
                :class="
                  item.isPaid
                    ? 'yes'
                    : 'no'
                "
              >

                <Check
                  v-if="
                    item.isPaid
                  "
                  :size="11"
                />

                <X
                  v-else
                  :size="11"
                />

                {{
                  item.isPaid
                    ? 'Paid'
                    : 'Unpaid'
                }}

              </span>

            </td>

            <!-- APPROVAL -->

            <td>

              <div class="approval-cell">

                <ShieldCheck
                  :size="13"
                />

                <span>
                  {{
                    item.requiresApproval
                      ? 'Required'
                      : 'Not Required'
                  }}
                </span>

              </div>

            </td>

            <!-- CARRY OVER -->

            <td>

              <div
                v-if="
                  item.carryOverAllowed
                "
                class="carry-cell"
              >

                <RotateCcw
                  :size="12"
                />

                <div>

                  <strong>
                    Allowed
                  </strong>

                  <span>
                    Max
                    {{
                      item.maxCarryOver
                    }}
                    days
                  </span>

                </div>

              </div>

              <span
                v-else
                class="empty-value"
              >
                Not Allowed
              </span>

            </td>

            <!-- MIN -->

            <td>

              <strong class="day-value">
                {{
                  item.minimumDays
                }}
              </strong>

            </td>

            <!-- MAX -->

            <td>

              <strong
                v-if="
                  item.maximumDays
                "
                class="day-value"
              >
                {{
                  item.maximumDays
                }}
              </strong>

              <span
                v-else
                class="empty-value"
              >
                —
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

            <!-- UPDATED -->

            <td>

              <div class="updated-cell">

                <strong>
                  {{
                    formatDate(
                      item.updatedAt,
                    )
                  }}
                </strong>

                <span>
                  by
                  {{
                    item.createdBy
                  }}
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

      <CalendarDays
        :size="31"
      />

      <strong>
        No leave types found
      </strong>

      <span>
        Try changing your leave type filters.
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

  min-width: 1950px;

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

/* LEAVE */

.leave-type-cell {
  display: flex;

  min-width: 180px;

  align-items: center;

  gap: 8px;
}

.leave-icon {
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

.leave-type-cell strong,
.leave-type-cell span {
  display: block;
}

.leave-type-cell strong {
  color:
    var(--text-primary);

  font-size: 9px;
}

.leave-type-cell span {
  margin-top: 3px;

  color:
    var(--primary);

  font-size: 8px;
  font-weight: 650;
}

/* CATEGORY */

.category-badge {
  display: inline-flex;

  padding:
    5px 8px;

  border-radius: 20px;

  font-size: 8px;
  font-weight: 650;

  white-space: nowrap;
}

.category-badge.company {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.category-badge.statutory {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.category-badge.special {
  background:
    var(--purple-soft);

  color:
    var(--purple);
}

/* DESCRIPTION */

.description {
  width: 260px;

  margin: 0;

  color:
    var(--text-secondary);

  font-size: 8px;

  line-height: 1.5;
}

/* CREDIT */

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
  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 7px;
}

/* BOOLEAN */

.boolean-badge {
  display: inline-flex;

  align-items: center;

  gap: 4px;

  padding:
    5px 7px;

  border-radius: 20px;

  font-size: 8px;
  font-weight: 650;

  white-space: nowrap;
}

.boolean-badge.yes {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.boolean-badge.no {
  background:
    var(--red-soft);

  color:
    var(--red);
}

/* APPROVAL */

.approval-cell {
  display: flex;

  align-items: center;

  gap: 5px;

  color:
    var(--text-primary);

  white-space: nowrap;
}

.approval-cell svg {
  color:
    var(--primary);
}

/* CARRY */

.carry-cell {
  display: flex;

  align-items: center;

  gap: 6px;
}

.carry-cell svg {
  color:
    var(--primary);
}

.carry-cell strong,
.carry-cell span {
  display: block;
}

.carry-cell strong {
  color:
    var(--text-primary);

  font-size: 8px;
}

.carry-cell span {
  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 7px;
}

.day-value {
  color:
    var(--text-primary);
}

.empty-value {
  color:
    var(--text-muted);

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

.status-badge.inactive {
  background:
    var(--red-soft);

  color:
    var(--red);
}

/* UPDATE */

.updated-cell {
  min-width: 120px;
}

.updated-cell strong,
.updated-cell span {
  display: block;
}

.updated-cell strong {
  color:
    var(--text-primary);

  font-size: 8px;
}

.updated-cell span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 7px;
}

/* ACTION */

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