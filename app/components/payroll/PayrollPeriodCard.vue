<script setup lang="ts">
import {
  CalendarDays,
  Clock3,
  BadgeCheck,
} from 'lucide-vue-next'

import type {
  PayrollPeriod,
} from '~/types/payroll'

defineProps<{
  period: PayrollPeriod

  breakdown: {
    ready: number
    review: number
    issues: number
  }
}>()

const formatDate = (
  date: string,
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
      `${date}T00:00:00`,
    ),
  )
}
</script>

<template>
  <article class="period-card">

    <div class="card-header">

      <div class="card-title">
        <div class="card-icon">
          <CalendarDays :size="17" />
        </div>

        <div>
          <h3>
            Current Payroll Period
          </h3>

          <p>
            Active payroll cycle and processing progress.
          </p>
        </div>
      </div>

      <StatusBadge
        :status="period.status"
      />

    </div>

    <div class="period-body">

      <div class="period-main">

        <div>
          <span>
            Payroll Period
          </span>

          <strong>
            {{ formatDate(period.dateFrom) }}
            –
            {{ formatDate(period.dateTo) }}
          </strong>
        </div>

        <div>
          <span>
            Payroll Date
          </span>

          <strong>
            {{ formatDate(period.payrollDate) }}
          </strong>
        </div>

        <div>
          <span>
            Payroll Type
          </span>

          <strong>
            {{ period.type }}
          </strong>
        </div>

        <div>
          <span>
            Batch Code
          </span>

          <strong>
            {{ period.code }}
          </strong>
        </div>

      </div>

      <div class="progress-section">

        <div class="progress-heading">
          <div>
            <Clock3 :size="14" />

            Processing Progress
          </div>

          <strong>
            {{ period.progress }}%
          </strong>
        </div>

        <div class="progress-track">
          <div
            class="progress-bar"
            :style="{
              width:
                `${period.progress}%`,
            }"
          />
        </div>

      </div>

      <div class="breakdown">

        <div class="breakdown-item">
          <span class="dot ready" />

          <div>
            <strong>
              {{ breakdown.ready }}
            </strong>

            <span>
              Ready
            </span>
          </div>
        </div>

        <div class="breakdown-item">
          <span class="dot review" />

          <div>
            <strong>
              {{ breakdown.review }}
            </strong>

            <span>
              For Review
            </span>
          </div>
        </div>

        <div class="breakdown-item">
          <span class="dot issue" />

          <div>
            <strong>
              {{ breakdown.issues }}
            </strong>

            <span>
              With Issues
            </span>
          </div>
        </div>

        <div class="breakdown-item">
          <BadgeCheck
            :size="15"
            class="complete-icon"
          />

          <div>
            <strong>
              0
            </strong>

            <span>
              Completed
            </span>
          </div>
        </div>

      </div>

    </div>

  </article>
</template>

<style scoped>
.period-card {
  overflow: hidden;

  border: 1px solid var(--border);
  border-radius: 11px;

  background: var(--bg-card);

  box-shadow: var(--shadow);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 12px;

  padding: 13px 15px;

  border-bottom:
    1px solid var(--border-soft);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 9px;
}

.card-icon {
  display: flex;

  width: 35px;
  height: 35px;

  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background: var(--primary-soft);
  color: var(--primary);
}

.card-title h3 {
  margin: 0;

  color: var(--text-primary);

  font-size: 11px;
}

.card-title p {
  margin: 3px 0 0;

  color: var(--text-muted);

  font-size: 8px;
}

.period-body {
  padding: 14px;
}

.period-main {
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 9px;
}

.period-main > div {
  padding: 11px;

  border: 1px solid var(--border-soft);
  border-radius: 8px;

  background: var(--bg-card-soft);
}

.period-main span,
.period-main strong {
  display: block;
}

.period-main span {
  color: var(--text-muted);

  font-size: 7px;
}

.period-main strong {
  margin-top: 4px;

  color: var(--text-primary);

  font-size: 9px;
}

.progress-section {
  margin-top: 15px;
}

.progress-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 7px;

  color: var(--text-secondary);

  font-size: 8px;
}

.progress-heading div {
  display: flex;
  align-items: center;
  gap: 6px;
}

.progress-heading strong {
  color: var(--primary);
}

.progress-track {
  overflow: hidden;

  height: 7px;

  border-radius: 20px;

  background: var(--bg-card-soft);
}

.progress-bar {
  height: 100%;

  border-radius: inherit;

  background: var(--primary);
}

.breakdown {
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 8px;

  margin-top: 14px;
}

.breakdown-item {
  display: flex;
  align-items: center;
  gap: 8px;

  padding: 9px;

  border: 1px solid var(--border-soft);
  border-radius: 8px;
}

.breakdown-item strong,
.breakdown-item span {
  display: block;
}

.breakdown-item strong {
  color: var(--text-primary);

  font-size: 10px;
}

.breakdown-item div span {
  margin-top: 2px;

  color: var(--text-muted);

  font-size: 7px;
}

.dot {
  width: 8px;
  height: 8px;

  flex-shrink: 0;

  border-radius: 50%;
}

.dot.ready {
  background: var(--green);
}

.dot.review {
  background: var(--orange);
}

.dot.issue {
  background: var(--red);
}

.complete-icon {
  color: var(--purple);
}

@media (max-width: 750px) {
  .period-main,
  .breakdown {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}
</style>