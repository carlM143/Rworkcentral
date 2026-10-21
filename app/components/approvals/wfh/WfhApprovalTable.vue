<script setup lang="ts">
import {
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  House,
  MapPin,
  MoreHorizontal,
  ShieldCheck,
  UserRound,
} from 'lucide-vue-next'


import WfhApprovalActions from '~/components/approvals/wfh/WfhApprovalActions.vue'


import type {
  WfhApproval,
  WfhApprovalStatus,
  WfhRequestType,
} from '~/types/wfhApproval'



const props = defineProps<{
  requests: WfhApproval[]
}>()

const emit = defineEmits<{
  view: [request: WfhApproval]
  review: [request: WfhApproval]
  approve: [request: WfhApproval]
  reject: [request: WfhApproval]
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

const formatDateTime = (
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
      hour: 'numeric',
      minute: '2-digit',
    },
  ).format(
    new Date(value),
  )
}

const typeClass = (
  type:
    WfhRequestType,
) => {
  if (
    type ===
    'Full Day WFH'
  ) {
    return 'full'
  }

  if (
    type ===
    'Half Day WFH'
  ) {
    return 'half'
  }

  return 'hybrid'
}

const statusClass = (
  status:
    WfhApprovalStatus,
) => {
  if (
    status ===
    'Approved'
  ) {
    return 'approved'
  }

  if (
    status ===
    'Pending'
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
    'Rejected'
  ) {
    return 'rejected'
  }

  return 'cancelled'
}
</script>

<template>
  <article class="table-card">

    <!-- HEADER -->

    <div class="table-heading">

      <div>

        <h3>
          Work From Home Approval Requests
        </h3>

        <p>
          Review WFH schedules, employee work plans,
          remote work locations and approval status.
        </p>

      </div>

    </div>

    <!-- TABLE -->

    <div
      v-if="
        requests.length
      "
      class="table-scroll"
    >

      <table>

        <thead>

          <tr>
            <th>Request No.</th>
            <th>Employee</th>
            <th>Department</th>
            <th>WFH Type</th>
            <th>WFH Period</th>
            <th>Days</th>
            <th>Work Location</th>
            <th>Reason</th>
            <th>Work Plan</th>
            <th>Supervisor</th>
            <th>Filed Date</th>
            <th>Status</th>
            <th>Reviewed By</th>
            <th>Remarks</th>
            <th />
          </tr>

        </thead>

        <tbody>

          <tr
            v-for="
              item in requests
            "
            :key="
              item.id
            "
          >

            <!-- REQUEST -->

            <td>

              <strong class="request-number">
                {{
                  item.requestNumber
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
                    ·
                    {{
                      item.position
                    }}
                  </span>

                </div>

              </div>

            </td>

            <!-- DEPARTMENT -->

            <td>

              <div class="department-cell">

                <BriefcaseBusiness
                  :size="13"
                />

                <strong>
                  {{
                    item.department
                  }}
                </strong>

              </div>

            </td>

            <!-- TYPE -->

            <td>

              <span
                class="type-badge"
                :class="
                  typeClass(
                    item.requestType,
                  )
                "
              >

                <House
                  :size="12"
                />

                {{
                  item.requestType
                }}

              </span>

            </td>

            <!-- PERIOD -->

            <td>

              <div class="period-cell">

                <CalendarDays
                  :size="13"
                />

                <div>

                  <strong>
                    {{
                      formatDate(
                        item.startDate,
                      )
                    }}
                  </strong>

                  <span
                    v-if="
                      item.startDate !==
                      item.endDate
                    "
                  >
                    to
                    {{
                      formatDate(
                        item.endDate,
                      )
                    }}
                  </span>

                </div>

              </div>

            </td>

            <!-- DAYS -->

            <td>

              <strong class="days-value">
                {{
                  item.totalDays
                }}

                {{
                  item.totalDays === 1
                    ? 'day'
                    : 'days'
                }}
              </strong>

            </td>

            <!-- LOCATION -->

            <td>

              <div class="location-cell">

                <MapPin
                  :size="13"
                />

                {{
                  item.workLocation
                }}

              </div>

            </td>

            <!-- REASON -->

            <td>

              <p class="reason">
                {{
                  item.reason
                }}
              </p>

            </td>

            <!-- WORK PLAN -->

            <td>

              <p class="work-plan">
                {{
                  item.workPlan
                }}
              </p>

            </td>

            <!-- SUPERVISOR -->

            <td>

              <div class="supervisor-cell">

                <ShieldCheck
                  :size="13"
                />

                {{
                  item.immediateSupervisor
                }}

              </div>

            </td>

            <!-- FILED -->

            <td>

              <div class="filed-cell">

                <Clock3
                  :size="13"
                />

                {{
                  formatDateTime(
                    item.filedAt,
                  )
                }}

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

            <!-- REVIEWED -->

            <td>

              <div class="review-cell">

                <strong>
                  {{
                    item.reviewedBy ??
                    '—'
                  }}
                </strong>

                <span
                  v-if="
                    item.reviewedAt
                  "
                >
                  {{
                    formatDateTime(
                      item.reviewedAt,
                    )
                  }}
                </span>

              </div>

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
            <td class="action-column">
              <WfhApprovalActions
                :request="item"
                @view="emit('view', $event)"
                @review="emit('review', $event)"
                @approve="emit('approve', $event)"
                @reject="emit('reject', $event)"
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

      <House
        :size="34"
      />

      <strong>
        No WFH approval requests found
      </strong>

      <span>
        Try changing your WFH approval filters.
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

  font-size: 10px;

  vertical-align: middle;
}

tbody tr:hover {
  background:
    var(--bg-card-soft);
}

.request-number {
  color:
    var(--primary);

  white-space: nowrap;
}

/* EMPLOYEE */

.employee-cell {
  display: flex;

  min-width: 225px;

  align-items: center;

  gap: 9px;
}

.employee-icon {
  display: flex;

  width: 35px;
  height: 35px;

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

  min-width: 140px;

  align-items: center;

  gap: 5px;

  color:
    var(--text-primary);
}

.department-cell svg {
  color:
    var(--text-muted);
}

/* TYPE */

.type-badge {
  display: inline-flex;

  align-items: center;

  gap: 5px;

  padding:
    5px 9px;

  border-radius: 20px;

  font-size: 9px;
  font-weight: 650;

  white-space: nowrap;
}

.type-badge.full {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.type-badge.half {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.type-badge.hybrid {
  background:
    var(--purple-soft);

  color:
    var(--purple);
}

/* PERIOD */

.period-cell {
  display: flex;

  min-width: 150px;

  align-items: flex-start;

  gap: 6px;
}

.period-cell svg {
  margin-top: 1px;

  color:
    var(--text-muted);
}

.period-cell strong,
.period-cell span {
  display: block;
}

.period-cell strong {
  color:
    var(--text-primary);

  font-size: 10px;
}

.period-cell span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 9px;
}

.days-value {
  color:
    var(--text-primary);

  white-space: nowrap;
}

/* LOCATION */

.location-cell {
  display: flex;

  min-width: 130px;

  align-items: center;

  gap: 5px;

  color:
    var(--text-primary);
}

.location-cell svg {
  color:
    var(--primary);
}

/* REASON */

.reason,
.work-plan {
  width: 245px;

  margin: 0;

  color:
    var(--text-secondary);

  font-size: 10px;

  line-height: 1.45;
}

.work-plan {
  width: 270px;
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
    var(--primary);
}

/* FILED */

.filed-cell {
  display: flex;

  min-width: 165px;

  align-items: center;

  gap: 5px;

  white-space: nowrap;
}

.filed-cell svg {
  color:
    var(--text-muted);
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

.status-badge.pending {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.status-badge.review {
  background:
    var(--purple-soft);

  color:
    var(--purple);
}

.status-badge.approved {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.status-badge.rejected {
  background:
    var(--red-soft);

  color:
    var(--red);
}

.status-badge.cancelled {
  background:
    var(--bg-card-soft);

  color:
    var(--text-muted);
}

/* REVIEW */

.review-cell {
  min-width: 145px;
}

.review-cell strong,
.review-cell span {
  display: block;
}

.review-cell strong {
  color:
    var(--text-primary);

  font-size: 10px;
}

.review-cell span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 9px;
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


/* =========================================
   ACTION COLUMN
========================================= */

.action-column {
  width: 70px;
  min-width: 70px;
  max-width: 70px;

  text-align: center;
  vertical-align: middle;

  position: static;
}

/* =========================================
   NORMAL HORIZONTAL SCROLLING
========================================= */

.table-scroll {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
}

.table-card {
  position: relative;
}

/* =========================================
   NO STICKY ACTIONS
========================================= */

table th:last-child,
table td:last-child {
  position: static !important;
  right: auto !important;
  left: auto !important;
  box-shadow: none !important;
}
</style>