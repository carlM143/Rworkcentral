<script setup lang="ts">
import {
  Clock3,
  Star,
  Plus,
  ClipboardCheck,
  FileText,
} from 'lucide-vue-next'

import type {
  PerformanceEvaluation,
} from '~/types/performance'

defineProps<{
  dueSoon:
    PerformanceEvaluation[]

  ratingSummary: {
    outstanding: number
    veryGood: number
    completed: number
    unscored: number
  }
}>()

const emit = defineEmits<{
  createCycle: []
  evaluations: []
  templates: []
}>()

const formatShortDate = (
  value: string,
) => {
  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
    },
  ).format(
    new Date(
      `${value}T00:00:00`,
    ),
  )
}
</script>

<template>
  <aside class="performance-side">

    <!-- DUE SOON -->
    <article class="side-card">

      <div class="side-heading">

        <div class="side-icon orange">
          <Clock3 :size="16" />
        </div>

        <div>
          <h3>
            Due Soon
          </h3>

          <p>
            Upcoming employee evaluations.
          </p>
        </div>

      </div>

      <div class="side-list">

        <div
          v-for="item in dueSoon"
          :key="item.id"
          class="side-row"
        >
          <div>
            <strong>
              {{ item.employeeName }}
            </strong>

            <span>
              {{ item.evaluationType }}
            </span>
          </div>

          <small>
            {{ formatShortDate(item.dueDate) }}
          </small>
        </div>

      </div>

    </article>

    <!-- RATINGS -->
    <article class="side-card">

      <div class="side-heading">

        <div class="side-icon purple">
          <Star :size="16" />
        </div>

        <div>
          <h3>
            Rating Summary
          </h3>

          <p>
            Current evaluation results.
          </p>
        </div>

      </div>

      <div class="summary-list">

        <div class="summary-row">
          <span>
            Outstanding
          </span>

          <strong>
            {{ ratingSummary.outstanding }}
          </strong>
        </div>

        <div class="summary-row">
          <span>
            Very Good
          </span>

          <strong>
            {{ ratingSummary.veryGood }}
          </strong>
        </div>

        <div class="summary-row">
          <span>
            Completed
          </span>

          <strong>
            {{ ratingSummary.completed }}
          </strong>
        </div>

        <div class="summary-row">
          <span>
            Awaiting Score
          </span>

          <strong>
            {{ ratingSummary.unscored }}
          </strong>
        </div>

      </div>

    </article>

    <!-- QUICK ACTIONS -->
    <article class="side-card">

      <div class="side-heading">

        <div class="side-icon blue">
          <ClipboardCheck :size="16" />
        </div>

        <div>
          <h3>
            Quick Actions
          </h3>

          <p>
            Common performance tasks.
          </p>
        </div>

      </div>

      <div class="quick-list">

        <button
          type="button"
          @click="
            emit('createCycle')
          "
        >
          <Plus :size="15" />

          Create Evaluation Cycle
        </button>

        <button
          type="button"
          @click="
            emit('evaluations')
          "
        >
          <ClipboardCheck :size="15" />

          Employee Evaluations
        </button>

        <button
          type="button"
          @click="
            emit('templates')
          "
        >
          <FileText :size="15" />

          Evaluation Templates
        </button>

      </div>

    </article>

  </aside>
</template>

<style scoped>
.performance-side {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* =========================================
   CARD
========================================= */

.side-card {
  overflow: hidden;

  border: 1px solid var(--border);
  border-radius: 11px;

  background: var(--bg-card);

  box-shadow: var(--shadow);
}

/* =========================================
   CARD HEADER
========================================= */

.side-heading {
  display: flex;

  align-items: center;

  gap: 10px;

  padding: 14px 14px;

  border-bottom: 1px solid var(--border-soft);
}

.side-icon {
  display: flex;

  width: 38px;
  height: 38px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 9px;
}

.side-icon.orange {
  background: var(--orange-soft);
  color: var(--orange);
}

.side-icon.purple {
  background: var(--purple-soft);
  color: var(--purple);
}

.side-icon.blue {
  background: var(--primary-soft);
  color: var(--primary);
}

.side-heading h3 {
  margin: 0;

  color: var(--text-primary);

  font-size: 13px;
  font-weight: 700;

  line-height: 1.3;
}

.side-heading p {
  margin: 4px 0 0;

  color: var(--text-muted);

  font-size: 10px;

  line-height: 1.4;
}

/* =========================================
   DUE SOON
========================================= */

.side-list {
  padding: 5px 14px 10px;
}

.side-row {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 12px;

  min-height: 53px;

  padding: 10px 0;

  border-bottom: 1px solid var(--border-soft);
}

.side-row:last-child {
  border-bottom: 0;
}

.side-row > div {
  min-width: 0;
}

.side-row strong {
  display: block;

  color: var(--text-primary);

  font-size: 11px;
  font-weight: 650;

  line-height: 1.3;
}

.side-row span {
  display: block;

  margin-top: 4px;

  color: var(--text-muted);

  font-size: 9px;

  line-height: 1.3;
}

.side-row small {
  flex-shrink: 0;

  color: var(--orange);

  font-size: 9px;
  font-weight: 650;

  white-space: nowrap;
}

/* =========================================
   RATING SUMMARY
========================================= */

.summary-list {
  padding: 5px 14px 10px;
}

.summary-row {
  display: flex;

  min-height: 42px;

  align-items: center;
  justify-content: space-between;

  gap: 12px;

  padding: 9px 0;

  border-bottom: 1px solid var(--border-soft);
}

.summary-row:last-child {
  border-bottom: 0;
}

.summary-row span {
  color: var(--text-secondary);

  font-size: 10px;
  font-weight: 500;
}

.summary-row strong {
  color: var(--primary);

  font-size: 11px;
  font-weight: 700;
}

/* =========================================
   QUICK ACTIONS
========================================= */

.quick-list {
  padding: 8px;
}

.quick-list button {
  display: flex;

  width: 100%;
  min-height: 44px;

  align-items: center;

  gap: 10px;

  padding: 0 11px;

  border: 0;
  border-radius: 7px;

  background: transparent;

  color: var(--text-secondary);

  font-size: 10px;
  font-weight: 500;

  text-align: left;

  cursor: pointer;

  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.quick-list button svg {
  flex-shrink: 0;
}

.quick-list button:hover {
  background: var(--bg-card-soft);
  color: var(--primary);
}

/* =========================================
   RESPONSIVE
========================================= */

@media (max-width: 1100px) {
  .performance-side {
    display: grid;

    grid-template-columns:
      repeat(3, minmax(0, 1fr));

    align-items: start;
  }
}

@media (max-width: 850px) {
  .performance-side {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .performance-side {
    grid-template-columns: 1fr;
  }

  .side-heading h3 {
    font-size: 12px;
  }

  .side-heading p {
    font-size: 9px;
  }
}
</style>