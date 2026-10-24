<script setup lang="ts">
import {
  CalendarDays,
  Clock3,
} from 'lucide-vue-next'

import type {
  BillingPeriod,
} from '~/types/billing'

defineProps<{
  period: BillingPeriod

  breakdown: {
    ready: number
    review: number
    issues: number
    completed: number
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

    <div class="card-heading">

      <div class="heading-left">

        <div class="heading-icon">
          <CalendarDays :size="17" />
        </div>

        <div>
          <h3>
            Current Billing Period
          </h3>

          <p>
            Current billing cycle and preparation progress.
          </p>
        </div>

      </div>

      <StatusBadge
        :status="period.status"
      />

    </div>

    <div class="period-content">

      <div class="period-details">

        <div>
          <span>Billing Period</span>

          <strong>
            {{ formatDate(period.dateFrom) }}
            –
            {{ formatDate(period.dateTo) }}
          </strong>
        </div>

        <div>
          <span>Billing Date</span>

          <strong>
            {{ formatDate(period.billingDate) }}
          </strong>
        </div>

        <div>
          <span>Batch Code</span>

          <strong>
            {{ period.code }}
          </strong>
        </div>

        <div>
          <span>Status</span>

          <strong>
            {{ period.status }}
          </strong>
        </div>

      </div>

      <div class="progress-area">

        <div class="progress-heading">

          <div>
            <Clock3 :size="13" />

            Billing Preparation
          </div>

          <strong>
            {{ period.progress }}%
          </strong>

        </div>

        <div class="progress-track">
          <div
            class="progress-value"
            :style="{
              width: `${period.progress}%`,
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

            <span>Ready</span>
          </div>
        </div>

        <div class="breakdown-item">
          <span class="dot review" />

          <div>
            <strong>
              {{ breakdown.review }}
            </strong>

            <span>For Review</span>
          </div>
        </div>

        <div class="breakdown-item">
          <span class="dot issue" />

          <div>
            <strong>
              {{ breakdown.issues }}
            </strong>

            <span>With Issues</span>
          </div>
        </div>

        <div class="breakdown-item">
          <span class="dot completed" />

          <div>
            <strong>
              {{ breakdown.completed }}
            </strong>

            <span>Completed</span>
          </div>
        </div>

      </div>

    </div>

  </article>
</template>

<style scoped>
.period-card {
  overflow: hidden;

  margin-bottom: 12px;

  border: 1px solid var(--border);
  border-radius: 11px;

  background: var(--bg-card);

  box-shadow: var(--shadow);
}

.card-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 12px;

  padding: 13px 15px;

  border-bottom:
    1px solid var(--border-soft);
}

.heading-left {
  display: flex;
  align-items: center;
  gap: 9px;
}

.heading-icon {
  display: flex;

  width: 35px;
  height: 35px;

  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background: var(--primary-soft);
  color: var(--primary);
}

.card-heading h3 {
  margin: 0;

  color: var(--text-primary);

  font-size: 10px;
}

.card-heading p {
  margin: 3px 0 0;

  color: var(--text-muted);

  font-size: 7px;
}

.period-content {
  padding: 13px;
}

.period-details {
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 8px;
}

.period-details > div {
  padding: 10px;

  border: 1px solid var(--border-soft);
  border-radius: 8px;

  background: var(--bg-card-soft);
}

.period-details span,
.period-details strong {
  display: block;
}

.period-details span {
  color: var(--text-muted);

  font-size: 7px;
}

.period-details strong {
  margin-top: 4px;

  color: var(--text-primary);

  font-size: 9px;
}

.progress-area {
  margin-top: 13px;
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

  height: 6px;

  border-radius: 20px;

  background: var(--bg-card-soft);
}

.progress-value {
  height: 100%;

  border-radius: inherit;

  background: var(--primary);
}

.breakdown {
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 8px;

  margin-top: 13px;
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

  font-size: 9px;
}

.breakdown-item div span {
  margin-top: 2px;

  color: var(--text-muted);

  font-size: 7px;
}

.dot {
  width: 8px;
  height: 8px;

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

.dot.completed {
  background: var(--purple);
}

@media (max-width: 700px) {
  .period-details,
  .breakdown {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}
</style>