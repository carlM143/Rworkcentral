<script setup lang="ts">
import {
  CalendarDays,
  UserCheck,
  ArrowRightLeft,
  TrendingUp,
  UserMinus,
  UserPlus,
} from 'lucide-vue-next'

import type {
  LifecycleUpcomingAction,
} from '~/types/employeeLifecycle'

defineProps<{
  upcomingActions:
    LifecycleUpcomingAction[]

  summary: {
    regularization: number
    transfers: number
    promotions: number
    offboarding: number
  }
}>()

const emit = defineEmits<{
  onboarding: []
  transfer: []
  regularization: []
  offboarding: []
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
  <aside class="lifecycle-side">

    <!-- UPCOMING -->
    <article class="side-card">

      <div class="side-heading">

        <div class="side-icon orange">
          <CalendarDays :size="17" />
        </div>

        <div>
          <h3>
            Upcoming Actions
          </h3>

          <p>
            Scheduled employee lifecycle actions.
          </p>
        </div>

      </div>

      <div class="side-list">

        <div
          v-for="item in upcomingActions"
          :key="item.id"
          class="side-row"
        >
          <div>
            <strong>
              {{ item.employeeName }}
            </strong>

            <span>
              {{ item.action }}
            </span>
          </div>

          <small>
            {{
              formatShortDate(
                item.dueDate,
              )
            }}
          </small>
        </div>

      </div>

    </article>

    <!-- SUMMARY -->
    <article class="side-card">

      <div class="side-heading">

        <div class="side-icon purple">
          <UserCheck :size="17" />
        </div>

        <div>
          <h3>
            Lifecycle Summary
          </h3>

          <p>
            Current employee movement activity.
          </p>
        </div>

      </div>

      <div class="summary-list">

        <div class="summary-row">
          <div>
            <UserCheck :size="15" />
            Regularization
          </div>

          <strong>
            {{ summary.regularization }}
          </strong>
        </div>

        <div class="summary-row">
          <div>
            <ArrowRightLeft :size="15" />
            Transfers
          </div>

          <strong>
            {{ summary.transfers }}
          </strong>
        </div>

        <div class="summary-row">
          <div>
            <TrendingUp :size="15" />
            Promotions
          </div>

          <strong>
            {{ summary.promotions }}
          </strong>
        </div>

        <div class="summary-row">
          <div>
            <UserMinus :size="15" />
            Offboarding
          </div>

          <strong>
            {{ summary.offboarding }}
          </strong>
        </div>

      </div>

    </article>

    <!-- QUICK -->
    <article class="side-card">

      <div class="side-heading">

        <div class="side-icon blue">
          <UserPlus :size="17" />
        </div>

        <div>
          <h3>
            Quick Actions
          </h3>

          <p>
            Common employee lifecycle tasks.
          </p>
        </div>

      </div>

      <div class="quick-list">

        <button
          type="button"
          @click="emit('onboarding')"
        >
          <UserPlus :size="15" />

          Start Onboarding
        </button>

        <button
          type="button"
          @click="emit('transfer')"
        >
          <ArrowRightLeft :size="15" />

          Process Transfer
        </button>

        <button
          type="button"
          @click="emit('regularization')"
        >
          <UserCheck :size="15" />

          Regularize Employee
        </button>

        <button
          type="button"
          @click="emit('offboarding')"
        >
          <UserMinus :size="15" />

          Start Offboarding
        </button>

      </div>

    </article>

  </aside>
</template>

<style scoped>
.lifecycle-side {
  display: flex;

  flex-direction: column;

  gap: 14px;
}

.side-card {
  overflow: hidden;

  border:
    1px solid var(--border);

  border-radius: 11px;

  background:
    var(--bg-card);

  box-shadow:
    var(--shadow);
}

/* =========================================
   HEADER
========================================= */

.side-heading {
  display: flex;

  align-items: center;

  gap: 10px;

  padding: 14px;

  border-bottom:
    1px solid var(--border-soft);
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
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.side-icon.purple {
  background:
    var(--purple-soft);

  color:
    var(--purple);
}

.side-icon.blue {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.side-heading h3 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 13px;
  font-weight: 700;
}

.side-heading p {
  margin: 4px 0 0;

  color:
    var(--text-muted);

  font-size: 10px;

  line-height: 1.4;
}

/* =========================================
   UPCOMING
========================================= */

.side-list {
  padding:
    5px 14px 10px;
}

.side-row {
  display: flex;

  min-height: 53px;

  align-items: center;
  justify-content: space-between;

  gap: 12px;

  padding: 10px 0;

  border-bottom:
    1px solid var(--border-soft);
}

.side-row:last-child {
  border-bottom: 0;
}

.side-row strong {
  display: block;

  color:
    var(--text-primary);

  font-size: 11px;
  font-weight: 650;
}

.side-row span {
  display: block;

  margin-top: 4px;

  color:
    var(--text-muted);

  font-size: 9px;
}

.side-row small {
  flex-shrink: 0;

  color:
    var(--orange);

  font-size: 9px;
  font-weight: 650;
}

/* =========================================
   SUMMARY
========================================= */

.summary-list {
  padding:
    5px 14px 10px;
}

.summary-row {
  display: flex;

  min-height: 44px;

  align-items: center;
  justify-content: space-between;

  gap: 12px;

  padding: 9px 0;

  border-bottom:
    1px solid var(--border-soft);
}

.summary-row:last-child {
  border-bottom: 0;
}

.summary-row > div {
  display: flex;

  align-items: center;

  gap: 8px;

  color:
    var(--text-secondary);

  font-size: 10px;
}

.summary-row > div svg {
  color:
    var(--text-muted);
}

.summary-row strong {
  color:
    var(--primary);

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

  background:
    transparent;

  color:
    var(--text-secondary);

  font-size: 10px;
  font-weight: 500;

  text-align: left;

  cursor: pointer;
}

.quick-list button:hover {
  background:
    var(--bg-card-soft);

  color:
    var(--primary);
}

/* =========================================
   RESPONSIVE
========================================= */

@media (max-width: 1100px) {
  .lifecycle-side {
    display: grid;

    grid-template-columns:
      repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 800px) {
  .lifecycle-side {
    grid-template-columns: 1fr;
  }
}
</style>