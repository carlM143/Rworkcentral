<script setup lang="ts">
import {
  ArrowRight,
  CalendarDays,
  FilePenLine,
  MoreHorizontal,
  UserRound,
} from 'lucide-vue-next'

import type {
  EmploymentChangeRecord,
  EmploymentChangeStatus,
  EmploymentChangeType,
} from '~/types/employmentChange'

defineProps<{
  records:
    EmploymentChangeRecord[]
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
    EmploymentChangeStatus,
) => {
  if (
    status ===
    'Effective'
  ) {
    return 'effective'
  }

  if (
    status ===
    'Approved'
  ) {
    return 'approved'
  }

  if (
    status ===
    'Scheduled'
  ) {
    return 'scheduled'
  }

  if (
    status ===
    'Pending Approval'
  ) {
    return 'pending'
  }

  if (
    status ===
    'For Review'
  ) {
    return 'review'
  }

  if (
    status ===
      'Rejected' ||
    status ===
      'Cancelled'
  ) {
    return 'rejected'
  }

  return 'draft'
}

const typeClass = (
  type:
    EmploymentChangeType,
) => {
  if (
    type ===
    'Employment Type Change'
  ) {
    return 'employment'
  }

  if (
    type ===
    'Contract Extension'
  ) {
    return 'contract'
  }

  if (
    type ===
    'Work Arrangement Change'
  ) {
    return 'arrangement'
  }

  if (
    type ===
    'Reporting Line Change'
  ) {
    return 'reporting'
  }

  if (
    type ===
    'Compensation Adjustment'
  ) {
    return 'compensation'
  }

  return 'status'
}
</script>

<template>
  <article class="table-card">

    <div class="table-heading">

      <div>

        <h3>
          Employment Changes
        </h3>

        <p>
          Track changes to employee employment terms,
          work arrangements, contracts, compensation and status.
        </p>

      </div>

    </div>

    <div
      v-if="records.length"
      class="table-scroll"
    >

      <table>

        <thead>

          <tr>
            <th>Change No.</th>
            <th>Employee</th>
            <th>Department</th>
            <th>Change Type</th>
            <th>Current Value</th>
            <th />
            <th>New Value</th>
            <th>Requested Date</th>
            <th>Effective Date</th>
            <th>Requested By</th>
            <th>Approved By</th>
            <th>Status</th>
            <th>Reason</th>
            <th>Remarks</th>
            <th />
          </tr>

        </thead>

        <tbody>

          <tr
            v-for="item in records"
            :key="item.id"
          >

            <td>

              <strong class="record-number">
                {{ item.changeNumber }}
              </strong>

            </td>

            <!-- EMPLOYEE -->

            <td>

              <div class="employee-cell">

                <div class="employee-avatar">

                  <UserRound
                    :size="17"
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

            <!-- DEPARTMENT -->

            <td>

              <strong class="department">
                {{ item.department }}
              </strong>

            </td>

            <!-- TYPE -->

            <td>

              <span
                class="type-badge"
                :class="
                  typeClass(
                    item.changeType,
                  )
                "
              >
                {{ item.changeType }}
              </span>

            </td>

            <!-- CURRENT -->

            <td>

              <div class="value-card current">

                <span>
                  Current
                </span>

                <strong>
                  {{ item.currentValue }}
                </strong>

              </div>

            </td>

            <!-- ARROW -->

            <td>

              <div class="change-arrow">

                <ArrowRight
                  :size="18"
                />

              </div>

            </td>

            <!-- NEW -->

            <td>

              <div class="value-card new">

                <span>
                  New
                </span>

                <strong>
                  {{ item.newValue }}
                </strong>

              </div>

            </td>

            <!-- REQUEST DATE -->

            <td>

              <div class="date-cell">

                <CalendarDays
                  :size="13"
                />

                {{
                  formatDate(
                    item.requestedDate,
                  )
                }}

              </div>

            </td>

            <!-- EFFECTIVE -->

            <td>

              <div class="date-cell effective-date">

                <CalendarDays
                  :size="13"
                />

                <strong>
                  {{
                    formatDate(
                      item.effectiveDate,
                    )
                  }}
                </strong>

              </div>

            </td>

            <!-- REQUESTED -->

            <td>

              <strong class="person-name">
                {{ item.requestedBy }}
              </strong>

            </td>

            <!-- APPROVED -->

            <td>

              <strong
                v-if="item.approvedBy"
                class="person-name approved-person"
              >
                {{ item.approvedBy }}
              </strong>

              <span
                v-else
                class="pending-text"
              >
                Pending
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

                {{ item.status }}

              </span>

            </td>

            <!-- REASON -->

            <td>

              <p
                class="reason-text"
                :title="item.reason"
              >
                {{ item.reason }}
              </p>

            </td>

            <!-- REMARKS -->

            <td>

              <p
                class="remarks"
                :title="
                  item.remarks ||
                  'No remarks'
                "
              >
                {{
                  item.remarks ||
                  'No remarks'
                }}
              </p>

            </td>

            <!-- ACTION -->

            <td>

              <button
                type="button"
                class="action-button"
                title="Employment change actions will be added later"
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

    <div
      v-else
      class="empty-state"
    >

      <FilePenLine
        :size="36"
      />

      <strong>
        No employment changes found
      </strong>

      <span>
        Try changing your employment change filters.
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

  font-size: 11px;
}

.table-scroll {
  overflow-x: auto;
}

table {
  width: 100%;

  min-width: 2500px;

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

  font-size: 10.5px;

  vertical-align: middle;
}

tbody tr:hover {
  background:
    var(--bg-card-soft);
}

/* NUMBER */

.record-number {
  color:
    var(--primary);

  white-space: nowrap;
}

/* EMPLOYEE */

.employee-cell {
  display: flex;

  min-width: 230px;

  align-items: center;

  gap: 9px;
}

.employee-avatar {
  display: flex;

  width: 36px;
  height: 36px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 9px;

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

  font-size: 11px;
}

.employee-cell span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 9.5px;
}

.department {
  color:
    var(--text-primary);

  white-space: nowrap;
}

/* TYPE */

.type-badge {
  display: inline-flex;

  padding:
    5px 8px;

  border-radius: 20px;

  font-size: 9px;
  font-weight: 650;

  white-space: nowrap;
}

.type-badge.employment {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.type-badge.contract {
  background:
    var(--purple-soft);

  color:
    var(--purple);
}

.type-badge.arrangement {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.type-badge.reporting {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.type-badge.compensation {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.type-badge.status {
  background:
    var(--red-soft);

  color:
    var(--red);
}

/* VALUES */

.value-card {
  width: 220px;

  padding:
    9px 10px;

  border:
    1px solid var(--border-soft);

  border-radius: 9px;

  background:
    var(--bg-card-soft);
}

.value-card.new {
  border-color:
    color-mix(
      in srgb,
      var(--primary) 22%,
      var(--border)
    );

  background:
    var(--primary-soft);
}

.value-card span,
.value-card strong {
  display: block;
}

.value-card span {
  color:
    var(--text-muted);

  font-size: 8px;

  font-weight: 600;

  text-transform:
    uppercase;
}

.value-card strong {
  margin-top: 4px;

  color:
    var(--text-primary);

  font-size: 10px;

  line-height: 1.45;
}

/* ARROW */

.change-arrow {
  display: flex;

  width: 32px;
  height: 32px;

  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

/* DATE */

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

.effective-date svg {
  color:
    var(--green);
}

.effective-date strong {
  color:
    var(--text-primary);
}

/* PEOPLE */

.person-name {
  color:
    var(--text-primary);

  white-space: nowrap;
}

.approved-person {
  color:
    var(--green);
}

.pending-text {
  color:
    var(--text-muted);

  font-style: italic;
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

.status-badge.effective {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.status-badge.approved {
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

.status-badge.pending,
.status-badge.review {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.status-badge.rejected {
  background:
    var(--red-soft);

  color:
    var(--red);
}

.status-badge.draft {
  background:
    var(--bg-card-soft);

  color:
    var(--text-muted);
}

/* TEXT */

.reason-text,
.remarks {
  width: 230px;

  margin: 0;

  overflow: hidden;

  color:
    var(--text-secondary);

  font-size: 10px;

  text-overflow:
    ellipsis;

  white-space:
    nowrap;
}

.remarks {
  width: 190px;

  color:
    var(--text-muted);
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

  min-height: 280px;

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

  font-size: 13px;
}

.empty-state span {
  font-size: 11px;
}
</style>