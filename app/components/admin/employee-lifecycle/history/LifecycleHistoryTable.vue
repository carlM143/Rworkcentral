<script setup lang="ts">
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  CircleCheck,
  FilePenLine,
  History,
  MoreHorizontal,
  TrendingUp,
  UserMinus,
  UserPlus,
  UserRound,
} from 'lucide-vue-next'

import type {
  LifecycleEventType,
  LifecycleHistoryRecord,
  LifecycleHistoryStatus,
} from '~/types/lifecycleHistory'

defineProps<{
  records:
    LifecycleHistoryRecord[]
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

const eventClass = (
  type:
    LifecycleEventType,
) => {
  if (
    type ===
    'Onboarding'
  ) {
    return 'onboarding'
  }

  if (
    type ===
    'Regularization'
  ) {
    return 'regularization'
  }

  if (
    type ===
    'Transfer'
  ) {
    return 'transfer'
  }

  if (
    type ===
    'Promotion'
  ) {
    return 'promotion'
  }

  if (
    type ===
    'Employment Change'
  ) {
    return 'change'
  }

  return 'offboarding'
}

const eventIcon = (
  type:
    LifecycleEventType,
) => {
  if (
    type ===
    'Onboarding'
  ) {
    return UserPlus
  }

  if (
    type ===
    'Regularization'
  ) {
    return BadgeCheck
  }

  if (
    type ===
    'Transfer'
  ) {
    return BriefcaseBusiness
  }

  if (
    type ===
    'Promotion'
  ) {
    return TrendingUp
  }

  if (
    type ===
    'Employment Change'
  ) {
    return FilePenLine
  }

  return UserMinus
}

const statusClass = (
  status:
    LifecycleHistoryStatus,
) => {
  if (
    status ===
      'Completed' ||
    status ===
      'Effective'
  ) {
    return 'success'
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
    'In Progress'
  ) {
    return 'progress'
  }

  return 'cancelled'
}
</script>

<template>
  <article class="history-card">

    <!-- HEADER -->

    <div class="table-heading">

      <div>

        <h3>
          Employee Lifecycle History
        </h3>

        <p>
          Consolidated historical record of employee
          onboarding, movements, employment changes
          and separation events.
        </p>

      </div>

    </div>

    <!-- TABLE -->

    <div
      v-if="records.length"
      class="table-scroll"
    >

      <table>

        <thead>

          <tr>
            <th>Reference</th>
            <th>Employee</th>
            <th>Lifecycle Event</th>
            <th>Event Details</th>
            <th>Change</th>
            <th>Effective Date</th>
            <th>Processed By</th>
            <th>Approved By</th>
            <th>Status</th>
            <th>Description</th>
            <th>Remarks</th>
            <th />
          </tr>

        </thead>

        <tbody>

          <tr
            v-for="item in records"
            :key="item.id"
          >

            <!-- REFERENCE -->

            <td>

              <strong class="reference">
                {{ item.referenceNumber }}
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

                  <span>
                    {{ item.department }}
                    ·
                    {{ item.position }}
                  </span>

                </div>

              </div>

            </td>

            <!-- EVENT TYPE -->

            <td>

              <div
                class="event-type"
                :class="
                  eventClass(
                    item.eventType,
                  )
                "
              >

                <component
                  :is="
                    eventIcon(
                      item.eventType,
                    )
                  "
                  :size="14"
                />

                <span>
                  {{ item.eventType }}
                </span>

              </div>

            </td>

            <!-- EVENT -->

            <td>

              <div class="event-title">

                <History
                  :size="13"
                />

                <strong>
                  {{ item.eventTitle }}
                </strong>

              </div>

            </td>

            <!-- CHANGE -->

            <td>

              <div
                v-if="
                  item.previousValue ||
                  item.newValue
                "
                class="change-display"
              >

                <div class="change-value old">

                  <span>
                    Previous
                  </span>

                  <strong>
                    {{
                      item.previousValue ||
                      '—'
                    }}
                  </strong>

                </div>

                <div class="change-arrow">

                  <ArrowRight
                    :size="15"
                  />

                </div>

                <div class="change-value new">

                  <span>
                    New
                  </span>

                  <strong>
                    {{
                      item.newValue ||
                      '—'
                    }}
                  </strong>

                </div>

              </div>

              <span
                v-else
                class="not-applicable"
              >
                —
              </span>

            </td>

            <!-- EFFECTIVE -->

            <td>

              <div class="date-cell">

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

            <!-- PROCESSED -->

            <td>

              <strong class="person-name">
                {{ item.processedBy }}
              </strong>

            </td>

            <!-- APPROVED -->

            <td>

              <strong
                v-if="item.approvedBy"
                class="person-name approved"
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

                <CircleCheck
                  v-if="
                    item.status ===
                      'Completed' ||
                    item.status ===
                      'Effective'
                  "
                  :size="11"
                />

                <span
                  v-else
                  class="status-dot"
                />

                {{ item.status }}

              </span>

            </td>

            <!-- DESCRIPTION -->

            <td>

              <p
                class="description"
                :title="
                  item.description
                "
              >
                {{ item.description }}
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
                title="Lifecycle history details will be added later"
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

      <History
        :size="36"
      />

      <strong>
        No lifecycle history found
      </strong>

      <span>
        Try changing your lifecycle history filters.
      </span>

    </div>

  </article>
</template>

<style scoped>
.history-card {
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

  min-width: 2550px;

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

  font-size: 10.5px;

  vertical-align:
    middle;
}

tbody tr:hover {
  background:
    var(--bg-card-soft);
}

/* REFERENCE */

.reference {
  color:
    var(--primary);

  white-space:
    nowrap;
}

/* EMPLOYEE */

.employee-cell {
  display: flex;

  min-width: 225px;

  align-items: center;

  gap: 9px;
}

.employee-avatar {
  display: flex;

  width: 37px;
  height: 37px;

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
  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 9.5px;
}

/* EVENT TYPE */

.event-type {
  display: inline-flex;

  align-items: center;

  gap: 5px;

  padding:
    6px 8px;

  border-radius: 8px;

  font-size: 9px;
  font-weight: 650;

  white-space:
    nowrap;
}

.event-type.onboarding {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.event-type.regularization {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.event-type.transfer {
  background:
    var(--purple-soft);

  color:
    var(--purple);
}

.event-type.promotion {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.event-type.change {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.event-type.offboarding {
  background:
    var(--red-soft);

  color:
    var(--red);
}

/* EVENT TITLE */

.event-title {
  display: flex;

  min-width: 180px;

  align-items: center;

  gap: 6px;
}

.event-title svg {
  color:
    var(--text-muted);
}

.event-title strong {
  color:
    var(--text-primary);

  font-size: 10.5px;
}

/* CHANGE */

.change-display {
  display: flex;

  min-width: 410px;

  align-items: center;

  gap: 8px;
}

.change-value {
  width: 165px;

  padding:
    8px 9px;

  border:
    1px solid var(--border-soft);

  border-radius: 8px;

  background:
    var(--bg-card-soft);
}

.change-value.new {
  border-color:
    color-mix(
      in srgb,
      var(--green) 22%,
      var(--border)
    );

  background:
    var(--green-soft);
}

.change-value span,
.change-value strong {
  display: block;
}

.change-value span {
  color:
    var(--text-muted);

  font-size: 8px;

  font-weight: 600;

  text-transform:
    uppercase;
}

.change-value strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 9.5px;

  line-height: 1.4;
}

.change-arrow {
  display: flex;

  width: 27px;
  height: 27px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.not-applicable {
  color:
    var(--text-muted);
}

/* DATE */

.date-cell {
  display: flex;

  align-items: center;

  gap: 5px;

  color:
    var(--green);

  white-space: nowrap;
}

.date-cell strong {
  color:
    var(--text-primary);
}

/* PEOPLE */

.person-name {
  color:
    var(--text-primary);

  white-space: nowrap;
}

.person-name.approved {
  color:
    var(--green);
}

.pending-text {
  color:
    var(--text-muted);

  font-size: 9.5px;

  font-style:
    italic;
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

  white-space:
    nowrap;
}

.status-dot {
  width: 5px;
  height: 5px;

  border-radius:
    50%;

  background:
    currentColor;
}

.status-badge.success {
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

.status-badge.progress {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.status-badge.cancelled {
  background:
    var(--red-soft);

  color:
    var(--red);
}

/* TEXT */

.description,
.remarks {
  width: 235px;

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