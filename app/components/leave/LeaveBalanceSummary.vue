<script setup lang="ts">
import {
  WalletCards,
} from 'lucide-vue-next'

import type {
  LeaveBalanceSummary,
} from '~/types/leave'

defineProps<{
  balances: LeaveBalanceSummary[]
}>()

const percentage = (
  total: number,
  available: number,
) => {
  if (!total) {
    return 0
  }

  return Math.round(
    (
      available /
      total
    ) * 100,
  )
}
</script>

<template>
  <article class="balance-card">

    <div class="card-heading">

      <div class="card-icon">
        <WalletCards :size="17" />
      </div>

      <div>
        <h3>
          Leave Balance Summary
        </h3>

        <p>
          Company-wide leave credit utilization.
        </p>
      </div>

    </div>

    <div class="balance-list">

      <div
        v-for="balance in balances"
        :key="balance.id"
        class="balance-item"
      >

        <div class="balance-heading">

          <div>
            <strong>
              {{ balance.leaveType }}
            </strong>

            <span>
              {{ balance.used }}
              used of
              {{ balance.total }}
            </span>
          </div>

          <strong class="available">
            {{ balance.available }}
            available
          </strong>

        </div>

        <div class="progress-track">
          <div
            class="progress-value"
            :style="{
              width:
                `${percentage(
                  balance.total,
                  balance.available,
                )}%`,
            }"
          />
        </div>

      </div>

    </div>

  </article>
</template>

<style scoped>
.balance-card {
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

  background:
    var(--purple-soft);

  color:
    var(--purple);
}

.card-heading h3 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 10px;
}

.card-heading p {
  margin: 3px 0 0;

  color:
    var(--text-muted);

  font-size: 7px;
}

.balance-list {
  padding: 5px 13px 12px;
}

.balance-item {
  padding: 11px 0;

  border-bottom:
    1px solid var(--border-soft);
}

.balance-item:last-child {
  border-bottom: 0;
}

.balance-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 10px;

  margin-bottom: 7px;
}

.balance-heading strong,
.balance-heading span {
  display: block;
}

.balance-heading > div strong {
  color:
    var(--text-primary);

  font-size: 8px;
}

.balance-heading span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 7px;
}

.available {
  color:
    var(--green);

  font-size: 8px;
}

.progress-track {
  overflow: hidden;

  height: 6px;

  border-radius: 20px;

  background:
    var(--bg-card-soft);
}

.progress-value {
  height: 100%;

  border-radius: inherit;

  background:
    var(--primary);
}
</style>