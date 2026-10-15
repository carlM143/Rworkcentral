<script setup lang="ts">
import {
  ArrowRight,
  Building2,
  CalendarDays,
  MapPin,
  MoreHorizontal,
  UserRound,
} from 'lucide-vue-next'

import type {
  LifecycleTransfer,
  LifecycleTransferStatus,
  LifecycleTransferType,
} from '~/types/lifecycleTransfer'

defineProps<{
  records:
    LifecycleTransfer[]
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
    LifecycleTransferStatus,
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
    'Rejected'
  ) {
    return 'rejected'
  }

  if (
    status ===
    'Cancelled'
  ) {
    return 'cancelled'
  }

  return 'draft'
}

const typeClass = (
  type:
    LifecycleTransferType,
) => {
  if (
    type ===
    'Department Transfer'
  ) {
    return 'department'
  }

  if (
    type ===
    'Position Transfer'
  ) {
    return 'position'
  }

  if (
    type ===
    'Branch Transfer'
  ) {
    return 'branch'
  }

  if (
    type ===
    'Client Assignment Transfer'
  ) {
    return 'client'
  }

  return 'internal'
}
</script>

<template>
  <article class="table-card">

    <div class="table-heading">

      <div>

        <h3>
          Employee Transfer Records
        </h3>

        <p>
          Track department, position, branch and
          assignment movements across the employee lifecycle.
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
            <th>Transfer No.</th>
            <th>Employee</th>
            <th>Transfer Type</th>
            <th>Current Assignment</th>
            <th />
            <th>New Assignment</th>
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

            <!-- NUMBER -->

            <td>

              <strong class="transfer-number">
                {{ item.transferNumber }}
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
                    item.transferType,
                  )
                "
              >
                {{ item.transferType }}
              </span>

            </td>

            <!-- CURRENT -->

            <td>

              <div class="assignment-card current">

                <div class="assignment-row">

                  <Building2
                    :size="13"
                  />

                  <strong>
                    {{ item.currentDepartment }}
                  </strong>

                </div>

                <span>
                  {{ item.currentPosition }}
                </span>

                <div class="branch-row">

                  <MapPin
                    :size="11"
                  />

                  {{ item.currentBranch }}

                </div>

              </div>

            </td>

            <!-- ARROW -->

            <td>

              <div class="transfer-arrow">

                <ArrowRight
                  :size="18"
                />

              </div>

            </td>

            <!-- NEW -->

            <td>

              <div class="assignment-card destination">

                <div class="assignment-row">

                  <Building2
                    :size="13"
                  />

                  <strong>
                    {{ item.newDepartment }}
                  </strong>

                </div>

                <span>
                  {{ item.newPosition }}
                </span>

                <div class="branch-row">

                  <MapPin
                    :size="11"
                  />

                  {{ item.newBranch }}

                </div>

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

            <!-- REQUESTED BY -->

            <td>

              <strong class="person-name">
                {{ item.requestedBy }}
              </strong>

            </td>

            <!-- APPROVED BY -->

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

              <p class="reason-text">
                {{ item.reason }}
              </p>

            </td>

            <!-- REMARKS -->

            <td>

              <p class="remarks">
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
                title="Transfer actions will be added later"
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

      <ArrowRight
        :size="36"
      />

      <strong>
        No employee transfers found
      </strong>

      <span>
        Try changing your transfer filters.
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

  min-width: 2450px;

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

/* TRANSFER NO */

.transfer-number {
  color:
    var(--primary);

  white-space: nowrap;
}

/* EMPLOYEE */

.employee-cell {
  display: flex;

  min-width: 180px;

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

.type-badge.department {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.type-badge.position {
  background:
    var(--purple-soft);

  color:
    var(--purple);
}

.type-badge.branch {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.type-badge.client {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.type-badge.internal {
  background:
    var(--bg-card-soft);

  color:
    var(--text-primary);
}

/* ASSIGNMENT */

.assignment-card {
  min-width: 205px;

  padding:
    9px 10px;

  border:
    1px solid var(--border-soft);

  border-radius: 9px;

  background:
    var(--bg-card-soft);
}

.assignment-card.destination {
  border-color:
    color-mix(
      in srgb,
      var(--primary) 20%,
      var(--border)
    );

  background:
    var(--primary-soft);
}

.assignment-row {
  display: flex;

  align-items: center;

  gap: 5px;
}

.assignment-row svg {
  color:
    var(--primary);
}

.assignment-row strong {
  color:
    var(--text-primary);

  font-size: 10px;
}

.assignment-card > span {
  display: block;

  margin-top: 4px;

  color:
    var(--text-secondary);

  font-size: 9.5px;
}

.branch-row {
  display: flex;

  align-items: center;

  gap: 4px;

  margin-top: 5px;

  color:
    var(--text-muted);

  font-size: 9px;
}

/* ARROW */

.transfer-arrow {
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

.effective-date svg {
  color:
    var(--green);
}

.effective-date strong {
  color:
    var(--text-primary);
}

/* PERSON */

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

.status-badge.pending {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.status-badge.rejected,
.status-badge.cancelled {
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
  width: 220px;

  margin: 0;

  overflow: hidden;

  color:
    var(--text-secondary);

  font-size: 10px;

  text-overflow: ellipsis;

  white-space: nowrap;
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