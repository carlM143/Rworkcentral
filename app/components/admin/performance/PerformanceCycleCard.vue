<script setup lang="ts">
import {
  CalendarDays,
  Users,
} from 'lucide-vue-next'

import type {
  PerformanceCycle,
} from '~/types/performance'

defineProps<{
  cycle: PerformanceCycle
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
  <article class="cycle-card">

    <div class="cycle-heading">

      <div class="heading-left">

        <div class="heading-icon">
          <CalendarDays :size="17" />
        </div>

        <div>
          <h3>
            Current Evaluation Cycle
          </h3>

          <p>
            Active employee performance review cycle.
          </p>
        </div>

      </div>

      <StatusBadge
        :status="cycle.status"
      />

    </div>

    <div class="cycle-content">

      <div class="cycle-title">

        <div>
          <span>
            Evaluation Cycle
          </span>

          <h2>
            {{ cycle.name }}
          </h2>
        </div>

        <div class="employee-summary">
          <Users :size="15" />

          <span>
            {{ cycle.completedEmployees }}
            of
            {{ cycle.totalEmployees }}
            completed
          </span>
        </div>

      </div>

      <div class="cycle-details">

        <div>
          <span>
            Start Date
          </span>

          <strong>
            {{ formatDate(cycle.dateFrom) }}
          </strong>
        </div>

        <div>
          <span>
            End Date
          </span>

          <strong>
            {{ formatDate(cycle.dateTo) }}
          </strong>
        </div>

        <div>
          <span>
            Employees
          </span>

          <strong>
            {{ cycle.totalEmployees }}
          </strong>
        </div>

        <div>
          <span>
            Completed
          </span>

          <strong>
            {{ cycle.completedEmployees }}
          </strong>
        </div>

      </div>

      <div class="progress-section">

        <div class="progress-heading">
          <span>
            Evaluation Progress
          </span>

          <strong>
            {{ cycle.progress }}%
          </strong>
        </div>

        <div class="progress-track">

          <div
            class="progress-value"
            :style="{
              width: `${cycle.progress}%`,
            }"
          />

        </div>

      </div>

    </div>

  </article>
</template>

<style scoped>
.cycle-card {
  overflow: hidden;

  margin-bottom: 14px;

  border: 1px solid var(--border);
  border-radius: 11px;

  background: var(--bg-card);

  box-shadow: var(--shadow);
}

/* =========================================
   CARD HEADER
========================================= */

.cycle-heading {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 12px;

  padding: 14px 16px;

  border-bottom: 1px solid var(--border-soft);
}

.heading-left {
  display: flex;

  align-items: center;

  gap: 10px;
}

.heading-icon {
  display: flex;

  width: 38px;
  height: 38px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 9px;

  background: var(--purple-soft);
  color: var(--purple);
}

.cycle-heading h3 {
  margin: 0;

  color: var(--text-primary);

  font-size: 13px;
  font-weight: 700;
}

.cycle-heading p {
  margin: 4px 0 0;

  color: var(--text-muted);

  font-size: 10px;
}

/* =========================================
   CONTENT
========================================= */

.cycle-content {
  padding: 16px;
}

/* =========================================
   CYCLE TITLE
========================================= */

.cycle-title {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 20px;
}

.cycle-title > div:first-child > span {
  display: block;

  color: var(--text-muted);

  font-size: 10px;
}

.cycle-title h2 {
  margin: 5px 0 0;

  color: var(--text-primary);

  font-size: 18px;
  font-weight: 700;

  line-height: 1.3;
}

.employee-summary {
  display: flex;

  flex-shrink: 0;

  align-items: center;

  gap: 6px;

  color: var(--text-secondary);

  font-size: 10px;
  font-weight: 500;
}

/* =========================================
   CYCLE DETAILS
========================================= */

.cycle-details {
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 10px;

  margin-top: 15px;
}

.cycle-details > div {
  padding: 12px;

  border: 1px solid var(--border-soft);
  border-radius: 8px;

  background: var(--bg-card-soft);
}

.cycle-details span,
.cycle-details strong {
  display: block;
}

.cycle-details span {
  color: var(--text-muted);

  font-size: 9px;
}

.cycle-details strong {
  margin-top: 5px;

  color: var(--text-primary);

  font-size: 11px;
  font-weight: 650;
}

/* =========================================
   PROGRESS
========================================= */

.progress-section {
  margin-top: 15px;
}

.progress-heading {
  display: flex;

  align-items: center;
  justify-content: space-between;

  margin-bottom: 8px;

  color: var(--text-secondary);

  font-size: 10px;
}

.progress-heading strong {
  color: var(--primary);

  font-size: 10px;
  font-weight: 700;
}

.progress-track {
  overflow: hidden;

  height: 8px;

  border-radius: 20px;

  background: var(--bg-card-soft);
}

.progress-value {
  height: 100%;

  border-radius: inherit;

  background: var(--primary);

  transition: width 0.3s ease;
}

/* =========================================
   TABLET
========================================= */

@media (max-width: 900px) {
  .cycle-details {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

/* =========================================
   MOBILE
========================================= */

@media (max-width: 650px) {
  .cycle-heading {
    align-items: flex-start;
  }

  .cycle-title {
    align-items: flex-start;

    flex-direction: column;
  }

  .cycle-details {
    grid-template-columns: 1fr;
  }

  .cycle-title h2 {
    font-size: 16px;
  }

  .cycle-content {
    padding: 13px;
  }
}
</style>