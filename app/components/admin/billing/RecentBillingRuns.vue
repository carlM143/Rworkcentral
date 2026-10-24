<script setup lang="ts">
import {
  History,
} from 'lucide-vue-next'

import type {
  BillingRun,
} from '~/types/billing'

defineProps<{
  runs: BillingRun[]
}>()

const currency = (
  value: number,
) => {
  return new Intl.NumberFormat(
    'en-PH',
    {
      style: 'currency',
      currency: 'PHP',
      maximumFractionDigits: 0,
    },
  ).format(value)
}
</script>

<template>
  <article class="history-card">

    <div class="card-heading">

      <div class="card-icon">
        <History :size="16" />
      </div>

      <div>
        <h3>
          Recent Billing Runs
        </h3>

        <p>
          Recently processed billing periods.
        </p>
      </div>

    </div>

    <div class="run-list">

      <div
        v-for="run in runs"
        :key="run.id"
        class="run-row"
      >

        <div>
          <strong>
            {{ run.period }}
          </strong>

          <span>
            {{ run.clients }}
            clients
          </span>
        </div>

        <div class="amount">
          <strong>
            {{ currency(run.totalAmount) }}
          </strong>

          <StatusBadge
            :status="run.status"
          />
        </div>

      </div>

    </div>

  </article>
</template>

<style scoped>
.history-card {
  overflow: hidden;

  border: 1px solid var(--border);
  border-radius: 11px;

  background: var(--bg-card);

  box-shadow: var(--shadow);
}

.card-heading {
  display: flex;
  align-items: center;

  gap: 9px;

  padding: 12px 13px;

  border-bottom:
    1px solid var(--border-soft);
}

.card-icon {
  display: flex;

  width: 34px;
  height: 34px;

  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background: var(--purple-soft);
  color: var(--purple);
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

.run-list {
  padding: 5px 12px 9px;
}

.run-row {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 10px;

  padding: 10px 0;

  border-bottom:
    1px solid var(--border-soft);
}

.run-row:last-child {
  border-bottom: 0;
}

.run-row strong,
.run-row span {
  display: block;
}

.run-row > div:first-child strong {
  color: var(--text-primary);

  font-size: 8px;
}

.run-row span {
  margin-top: 3px;

  color: var(--text-muted);

  font-size: 7px;
}

.amount {
  text-align: right;
}

.amount > strong {
  margin-bottom: 5px;

  color: var(--text-primary);

  font-size: 8px;
}
</style>