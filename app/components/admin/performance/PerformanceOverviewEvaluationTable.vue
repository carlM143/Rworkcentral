<script setup lang="ts">
import {
  UserRound,
  Eye,
} from 'lucide-vue-next'

import type {
  PerformanceEvaluation,
} from '~/types/performance'

defineProps<{
  evaluations: PerformanceEvaluation[]
}>()

const emit = defineEmits<{
  view: [
    evaluation:
      PerformanceEvaluation,
  ]
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
</script>

<template>
  <article class="evaluation-card">

    <div class="table-heading">

      <div>
        <h3>
          Employee Evaluations
        </h3>

        <p>
          Monitor employee evaluation progress,
          ratings and due dates.
        </p>
      </div>

    </div>

    <div
      v-if="evaluations.length"
      class="table-scroll"
    >
      <table class="evaluation-table">

        <thead>
          <tr>
            <th>Employee</th>
            <th>Evaluation</th>
            <th>Evaluator</th>
            <th>Due Date</th>
            <th>Score</th>
            <th>Rating</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="evaluation in evaluations"
            :key="evaluation.id"
          >

            <td>
              <div class="employee-cell">

                <div class="employee-icon">
                  <UserRound :size="15" />
                </div>

                <div>
                  <strong>
                    {{ evaluation.employeeName }}
                  </strong>

                  <span>
                    {{ evaluation.employeeNumber }}
                    ·
                    {{ evaluation.department }}
                  </span>
                </div>

              </div>
            </td>

            <td>
              <span class="evaluation-type">
                {{ evaluation.evaluationType }}
              </span>
            </td>

            <td>
              {{ evaluation.evaluator }}
            </td>

            <td>
              {{ formatDate(evaluation.dueDate) }}
            </td>

            <td>
              <strong
                v-if="
                  evaluation.score !==
                  undefined
                "
                class="score"
              >
                {{ evaluation.score }}%
              </strong>

              <span v-else>
                —
              </span>
            </td>

            <td>
              {{
                evaluation.rating ||
                '—'
              }}
            </td>

            <td>
              <StatusBadge
                :status="evaluation.status"
              />
            </td>

            <td>
              <button
                type="button"
                class="view-button"
                @click="
                  emit(
                    'view',
                    evaluation,
                  )
                "
              >
                <Eye :size="14" />
              </button>
            </td>

          </tr>
        </tbody>

      </table>
    </div>

  </article>
</template>

<style scoped>
.evaluation-card {
  overflow: hidden;

  border: 1px solid var(--border);
  border-radius: 11px;

  background: var(--bg-card);

  box-shadow: var(--shadow);
}

/* =========================================
   TABLE HEADING
========================================= */

.table-heading {
  padding: 15px 16px;

  border-bottom: 1px solid var(--border-soft);
}

.table-heading h3 {
  margin: 0;

  color: var(--text-primary);

  font-size: 14px;
  font-weight: 700;
}

.table-heading p {
  margin: 5px 0 0;

  color: var(--text-muted);

  font-size: 11px;
  line-height: 1.5;
}

/* =========================================
   TABLE WRAPPER
========================================= */

.table-scroll {
  width: 100%;
  overflow-x: auto;
}

.evaluation-table {
  width: 100%;
  min-width: 1000px;

  border-collapse: collapse;
  table-layout: auto;
}

/* =========================================
   TABLE HEADER
========================================= */

.evaluation-table th {
  padding: 12px 14px;

  border-bottom: 1px solid var(--border);

  background: var(--bg-card-soft);
  color: var(--text-secondary);

  font-size: 10px;
  font-weight: 700;

  text-align: left;
  text-transform: uppercase;

  letter-spacing: 0.25px;

  white-space: nowrap;
}

/* =========================================
   TABLE BODY
========================================= */

.evaluation-table td {
  padding: 13px 14px;

  border-bottom: 1px solid var(--border-soft);

  color: var(--text-secondary);

  font-size: 11px;

  vertical-align: middle;
}

.evaluation-table tbody tr:last-child td {
  border-bottom: 0;
}

.evaluation-table tbody tr {
  transition: background 0.15s ease;
}

.evaluation-table tbody tr:hover {
  background: var(--bg-card-soft);
}

/* =========================================
   COLUMN WIDTHS
========================================= */

.evaluation-table th:nth-child(1),
.evaluation-table td:nth-child(1) {
  min-width: 240px;
}

.evaluation-table th:nth-child(2),
.evaluation-table td:nth-child(2) {
  min-width: 120px;
}

.evaluation-table th:nth-child(3),
.evaluation-table td:nth-child(3) {
  min-width: 145px;
}

.evaluation-table th:nth-child(4),
.evaluation-table td:nth-child(4) {
  min-width: 120px;
}

.evaluation-table th:nth-child(5),
.evaluation-table td:nth-child(5) {
  width: 80px;
}

.evaluation-table th:nth-child(6),
.evaluation-table td:nth-child(6) {
  min-width: 120px;
}

.evaluation-table th:nth-child(7),
.evaluation-table td:nth-child(7) {
  min-width: 125px;
}

.evaluation-table th:nth-child(8),
.evaluation-table td:nth-child(8) {
  width: 55px;
}

/* =========================================
   EMPLOYEE
========================================= */

.employee-cell {
  display: flex;

  align-items: center;

  gap: 10px;
}

.employee-icon {
  display: flex;

  width: 38px;
  height: 38px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 9px;

  background: var(--primary-soft);
  color: var(--primary);
}

.employee-cell > div:last-child {
  min-width: 0;
}

.employee-cell strong {
  display: block;

  color: var(--text-primary);

  font-size: 12px;
  font-weight: 650;

  line-height: 1.25;
}

.employee-cell span {
  display: block;

  margin-top: 4px;

  color: var(--text-muted);

  font-size: 9px;

  line-height: 1.3;

  white-space: nowrap;
}

/* =========================================
   EVALUATION TYPE
========================================= */

.evaluation-type {
  display: inline-flex;

  align-items: center;

  min-height: 25px;

  padding: 4px 9px;

  border-radius: 20px;

  background: var(--purple-soft);
  color: var(--purple);

  font-size: 9px;
  font-weight: 650;

  white-space: nowrap;
}

/* =========================================
   SCORE
========================================= */

.score {
  color: var(--green);

  font-size: 11px;
  font-weight: 700;
}

/* =========================================
   STATUS BADGE
========================================= */

.evaluation-card :deep(.status-badge) {
  min-height: 27px;

  padding: 4px 10px;

  font-size: 10px;

  white-space: nowrap;
}

/* =========================================
   VIEW BUTTON
========================================= */

.view-button {
  display: inline-flex;

  width: 32px;
  height: 32px;

  align-items: center;
  justify-content: center;

  border: 1px solid var(--border);
  border-radius: 7px;

  background: transparent;

  color: var(--text-secondary);

  cursor: pointer;

  transition:
    background 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;
}

.view-button:hover {
  border-color: var(--primary);

  background: var(--primary-soft);

  color: var(--primary);
}

/* =========================================
   MOBILE
========================================= */

@media (max-width: 650px) {
  .table-heading {
    padding: 13px;
  }

  .table-heading h3 {
    font-size: 13px;
  }

  .table-heading p {
    font-size: 10px;
  }

  .evaluation-table td {
    padding: 12px;
  }
}
</style>
