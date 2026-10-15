<script setup lang="ts">
import {
  CalendarDays,
  CheckCircle2,
  FileCheck2,
  MoreHorizontal,
  Star,
  UserRound,
  XCircle,
} from 'lucide-vue-next'

import type {
  Recommendation,
  RegularizationRecord,
  RegularizationStatus,
} from '~/types/regularization'

defineProps<{
  records:
    RegularizationRecord[]
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
    RegularizationStatus,
) => {
  if (
    status ===
    'Regularized'
  ) {
    return 'regularized'
  }

  if (
    status ===
    'Approved'
  ) {
    return 'approved'
  }

  if (
    status ===
    'Recommended'
  ) {
    return 'recommended'
  }

  if (
    status ===
    'For Review'
  ) {
    return 'review'
  }

  if (
    status ===
    'For Evaluation'
  ) {
    return 'evaluation'
  }

  if (
    status ===
    'Extended'
  ) {
    return 'extended'
  }

  return 'not-recommended'
}

const recommendationClass = (
  recommendation:
    Recommendation,
) => {
  if (
    recommendation ===
    'For Regularization'
  ) {
    return 'positive'
  }

  if (
    recommendation ===
    'Extend Probation'
  ) {
    return 'extended'
  }

  if (
    recommendation ===
    'Not Recommended'
  ) {
    return 'negative'
  }

  return 'pending'
}

const scoreClass = (
  score?: number,
) => {
  if (
    score === undefined
  ) {
    return 'none'
  }

  if (score >= 4.5) {
    return 'excellent'
  }

  if (score >= 4) {
    return 'good'
  }

  if (score >= 3) {
    return 'average'
  }

  return 'low'
}
</script>

<template>
  <article class="table-card">

    <!-- HEADER -->

    <div class="table-heading">

      <div>

        <h3>
          Employee Regularization
        </h3>

        <p>
          Track probationary employee evaluation,
          recommendation, approval and regularization.
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
            <th>Regularization No.</th>
            <th>Employee</th>
            <th>Department</th>
            <th>Date Hired</th>
            <th>Probation End</th>
            <th>Target Regularization</th>
            <th>Evaluation</th>
            <th>Score</th>
            <th>Recommendation</th>
            <th>Documents</th>
            <th>Reviewed By</th>
            <th>Approved By</th>
            <th>Effective Date</th>
            <th>Status</th>
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

              <strong class="record-number">
                {{
                  item.regularizationNumber
                }}
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

            <!-- DATE HIRED -->

            <td>

              <div class="date-cell">

                <CalendarDays
                  :size="13"
                />

                {{
                  formatDate(
                    item.dateHired,
                  )
                }}

              </div>

            </td>

            <!-- PROBATION END -->

            <td>

              <div class="date-cell probation-date">

                <CalendarDays
                  :size="13"
                />

                <div>

                  <strong>
                    {{
                      formatDate(
                        item.probationEndDate,
                      )
                    }}
                  </strong>

                  <span>
                    {{
                      item.probationMonths
                    }}
                    months
                  </span>

                </div>

              </div>

            </td>

            <!-- TARGET -->

            <td>

              <strong class="target-date">
                {{
                  formatDate(
                    item.targetRegularizationDate,
                  )
                }}
              </strong>

            </td>

            <!-- EVALUATION -->

            <td>

              <span
                class="evaluation-badge"
                :class="
                  item.evaluationStatus
                    .toLowerCase()
                    .replace(
                      ' ',
                      '-',
                    )
                "
              >
                {{
                  item.evaluationStatus
                }}
              </span>

            </td>

            <!-- SCORE -->

            <td>

              <div
                class="score-badge"
                :class="
                  scoreClass(
                    item.evaluationScore,
                  )
                "
              >

                <Star
                  :size="12"
                />

                <strong>
                  {{
                    item.evaluationScore !==
                    undefined
                      ? `${item.evaluationScore} / 5`
                      : 'Not Rated'
                  }}
                </strong>

              </div>

            </td>

            <!-- RECOMMENDATION -->

            <td>

              <span
                class="recommendation-badge"
                :class="
                  recommendationClass(
                    item.recommendation,
                  )
                "
              >
                {{
                  item.recommendation
                }}
              </span>

            </td>

            <!-- DOCUMENTS -->

            <td>

              <div
                class="document-status"
                :class="{
                  complete:
                    item.documentsComplete,
                  incomplete:
                    !item.documentsComplete,
                }"
              >

                <FileCheck2
                  v-if="
                    item.documentsComplete
                  "
                  :size="14"
                />

                <XCircle
                  v-else
                  :size="14"
                />

                <span>
                  {{
                    item.documentsComplete
                      ? 'Complete'
                      : 'Incomplete'
                  }}
                </span>

              </div>

            </td>

            <!-- REVIEWED -->

            <td>

              <strong class="person-name">
                {{
                  item.reviewedBy ||
                  'Not assigned'
                }}
              </strong>

            </td>

            <!-- APPROVED -->

            <td>

              <div
                v-if="item.approvedBy"
                class="approval-cell"
              >

                <CheckCircle2
                  :size="13"
                />

                <div>

                  <strong>
                    {{
                      item.approvedBy
                    }}
                  </strong>

                  <span>
                    {{
                      formatDate(
                        item.approvalDate,
                      )
                    }}
                  </span>

                </div>

              </div>

              <span
                v-else
                class="muted-text"
              >
                Pending
              </span>

            </td>

            <!-- EFFECTIVE -->

            <td>

              <strong class="effective-date">
                {{
                  formatDate(
                    item.effectiveDate,
                  )
                }}
              </strong>

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
                title="Regularization actions will be added later"
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

      <CheckCircle2
        :size="36"
      />

      <strong>
        No regularization records found
      </strong>

      <span>
        Try changing your regularization filters.
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

  min-width: 2600px;

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

/* DATES */

.date-cell {
  display: flex;

  align-items: center;

  gap: 6px;

  white-space: nowrap;
}

.date-cell svg {
  color:
    var(--text-muted);
}

.probation-date {
  align-items: flex-start;
}

.probation-date svg {
  margin-top: 2px;

  color:
    var(--orange);
}

.probation-date strong,
.probation-date span {
  display: block;
}

.probation-date strong {
  color:
    var(--text-primary);
}

.probation-date span {
  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 9px;
}

.target-date,
.effective-date {
  color:
    var(--text-primary);

  white-space: nowrap;
}

/* EVALUATION */

.evaluation-badge {
  display: inline-flex;

  padding:
    5px 8px;

  border-radius: 20px;

  font-size: 9px;
  font-weight: 650;

  white-space: nowrap;
}

.evaluation-badge.completed {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.evaluation-badge.in-progress {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.evaluation-badge.pending {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

/* SCORE */

.score-badge {
  display: inline-flex;

  align-items: center;

  gap: 5px;

  padding:
    6px 8px;

  border-radius: 7px;

  white-space: nowrap;
}

.score-badge svg {
  color:
    currentColor;
}

.score-badge.excellent {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.score-badge.good {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.score-badge.average {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.score-badge.low {
  background:
    var(--red-soft);

  color:
    var(--red);
}

.score-badge.none {
  background:
    var(--bg-card-soft);

  color:
    var(--text-muted);
}

/* RECOMMENDATION */

.recommendation-badge {
  display: inline-flex;

  padding:
    5px 8px;

  border-radius: 20px;

  font-size: 9px;
  font-weight: 650;

  white-space: nowrap;
}

.recommendation-badge.positive {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.recommendation-badge.extended {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.recommendation-badge.negative {
  background:
    var(--red-soft);

  color:
    var(--red);
}

.recommendation-badge.pending {
  background:
    var(--bg-card-soft);

  color:
    var(--text-muted);
}

/* DOCUMENT */

.document-status {
  display: inline-flex;

  align-items: center;

  gap: 5px;

  font-weight: 650;

  white-space: nowrap;
}

.document-status.complete {
  color:
    var(--green);
}

.document-status.incomplete {
  color:
    var(--red);
}

/* PEOPLE */

.person-name {
  color:
    var(--text-primary);

  white-space: nowrap;
}

.approval-cell {
  display: flex;

  min-width: 125px;

  align-items: flex-start;

  gap: 6px;
}

.approval-cell svg {
  margin-top: 1px;

  color:
    var(--green);
}

.approval-cell strong,
.approval-cell span {
  display: block;
}

.approval-cell strong {
  color:
    var(--text-primary);

  font-size: 10px;
}

.approval-cell span {
  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 9px;
}

.muted-text {
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

.status-badge.regularized {
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

.status-badge.recommended {
  background:
    var(--purple-soft);

  color:
    var(--purple);
}

.status-badge.review {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.status-badge.evaluation {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.status-badge.extended {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.status-badge.not-recommended {
  background:
    var(--red-soft);

  color:
    var(--red);
}

/* REMARKS */

.remarks {
  width: 235px;

  margin: 0;

  overflow: hidden;

  color:
    var(--text-secondary);

  text-overflow:
    ellipsis;

  white-space:
    nowrap;
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