<script setup lang="ts">
import {
  CalendarDays,
  ClipboardCheck,
  MoreHorizontal,
  Star,
  UserRound,
  Users,
} from 'lucide-vue-next'

import type {
  PerformanceEvaluation,
  PerformanceEvaluationStatus,
  PerformanceRecommendation,
} from '~/types/performanceEvaluation'

defineProps<{
  evaluations:
    PerformanceEvaluation[]
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
    PerformanceEvaluationStatus,
) => {
  if (
    status ===
    'Pending'
  ) {
    return 'pending'
  }

  if (
    status ===
    'In Progress'
  ) {
    return 'progress'
  }

  if (
    status ===
    'For Review'
  ) {
    return 'review'
  }

  if (
    status ===
    'Completed'
  ) {
    return 'completed'
  }

  return 'acknowledged'
}

const recommendationClass = (
  value:
    PerformanceRecommendation,
) => {
  if (
    value ===
    'Outstanding'
  ) {
    return 'outstanding'
  }

  if (
    value ===
    'Exceeds Expectations'
  ) {
    return 'exceeds'
  }

  if (
    value ===
    'Meets Expectations'
  ) {
    return 'meets'
  }

  if (
    value ===
    'Needs Improvement'
  ) {
    return 'needs'
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
          Employee Evaluations
        </h3>

        <p>
          Track employee review progress,
          performance scores, evaluators and
          final recommendations.
        </p>

      </div>

    </div>

    <!-- TABLE -->

    <div
      v-if="
        evaluations.length
      "
      class="table-scroll"
    >

      <table>

        <thead>

          <tr>
            <th>Evaluation No.</th>
            <th>Employee</th>
            <th>Department</th>
            <th>Evaluation Cycle</th>
            <th>Performance Period</th>
            <th>Evaluator</th>
            <th>Due Date</th>
            <th>Progress</th>
            <th>Overall Score</th>
            <th>Recommendation</th>
            <th>Status</th>
            <th>Remarks</th>
            <th />
          </tr>

        </thead>

        <tbody>

          <tr
            v-for="
              item in evaluations
            "
            :key="
              item.id
            "
          >

            <!-- NUMBER -->

            <td>

              <strong class="evaluation-number">
                {{
                  item.evaluationNumber
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

              <strong class="department">
                {{
                  item.department
                }}
              </strong>

            </td>

            <!-- CYCLE -->

            <td>

              <div class="cycle-cell">

                <ClipboardCheck
                  :size="13"
                />

                <div>

                  <strong>
                    {{
                      item.cycleName
                    }}
                  </strong>

                  <span>
                    {{
                      item.cycleCode
                    }}
                  </span>

                </div>

              </div>

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
                        item.evaluationPeriodStart,
                      )
                    }}
                  </strong>

                  <span>
                    to
                    {{
                      formatDate(
                        item.evaluationPeriodEnd,
                      )
                    }}
                  </span>

                </div>

              </div>

            </td>

            <!-- EVALUATOR -->

            <td>

              <div class="evaluator-cell">

                <Users
                  :size="13"
                />

                <div>

                  <strong>
                    {{
                      item.evaluatorName
                    }}
                  </strong>

                  <span>
                    {{
                      item.evaluatorPosition
                    }}
                  </span>

                </div>

              </div>

            </td>

            <!-- DUE -->

            <td>

              <strong class="due-date">
                {{
                  formatDate(
                    item.dueDate,
                  )
                }}
              </strong>

            </td>

            <!-- PROGRESS -->

            <td>

              <div class="progress-cell">

                <div class="progress-header">

                  <span>
                    Completion
                  </span>

                  <strong>
                    {{
                      item.progress
                    }}%
                  </strong>

                </div>

                <div class="progress-track">

                  <div
                    class="progress-bar"
                    :class="{
                      complete:
                        item.progress ===
                        100,
                    }"
                    :style="{
                      width:
                        `${item.progress}%`,
                    }"
                  />

                </div>

              </div>

            </td>

            <!-- SCORE -->

            <td>

              <div
                class="score-badge"
                :class="
                  scoreClass(
                    item.overallScore,
                  )
                "
              >

                <Star
                  :size="13"
                />

                <strong>
                  {{
                    item.overallScore !==
                    undefined
                      ? `${item.overallScore} / 5`
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
                title="Evaluation actions will be added later"
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

      <ClipboardCheck
        :size="34"
      />

      <strong>
        No performance evaluations found
      </strong>

      <span>
        Try changing your evaluation filters.
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

  min-width: 2250px;

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

.evaluation-number {
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

.department {
  color:
    var(--text-primary);

  white-space: nowrap;
}

/* CYCLE */

.cycle-cell {
  display: flex;

  min-width: 240px;

  align-items: flex-start;

  gap: 6px;
}

.cycle-cell svg {
  margin-top: 1px;

  color:
    var(--primary);
}

.cycle-cell strong,
.cycle-cell span {
  display: block;
}

.cycle-cell strong {
  color:
    var(--text-primary);

  font-size: 10px;
}

.cycle-cell span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 9px;
}

/* PERIOD */

.period-cell {
  display: flex;

  min-width: 165px;

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

/* EVALUATOR */

.evaluator-cell {
  display: flex;

  min-width: 175px;

  align-items: flex-start;

  gap: 6px;
}

.evaluator-cell svg {
  margin-top: 1px;

  color:
    var(--primary);
}

.evaluator-cell strong,
.evaluator-cell span {
  display: block;
}

.evaluator-cell strong {
  color:
    var(--text-primary);

  font-size: 10px;
}

.evaluator-cell span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 9px;
}

.due-date {
  color:
    var(--text-primary);

  white-space: nowrap;
}

/* PROGRESS */

.progress-cell {
  width: 150px;
}

.progress-header {
  display: flex;

  justify-content: space-between;

  gap: 8px;

  margin-bottom: 5px;
}

.progress-header span,
.progress-header strong {
  font-size: 9px;
}

.progress-header span {
  color:
    var(--text-muted);
}

.progress-header strong {
  color:
    var(--text-primary);
}

.progress-track {
  overflow: hidden;

  height: 6px;

  border-radius: 20px;

  background:
    var(--border-soft);
}

.progress-bar {
  height: 100%;

  border-radius: inherit;

  background:
    var(--primary);
}

.progress-bar.complete {
  background:
    var(--green);
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

.score-badge strong {
  font-size: 10px;
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

.recommendation-badge.outstanding {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.recommendation-badge.exceeds {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.recommendation-badge.meets {
  background:
    var(--purple-soft);

  color:
    var(--purple);
}

.recommendation-badge.needs {
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

.status-badge.progress {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.status-badge.review {
  background:
    var(--purple-soft);

  color:
    var(--purple);
}

.status-badge.completed {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.status-badge.acknowledged {
  background:
    var(--green-soft);

  color:
    var(--green);
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
</style>