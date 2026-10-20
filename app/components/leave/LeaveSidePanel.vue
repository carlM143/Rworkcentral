<script setup lang="ts">
import {
  Clock3,
  UserRoundCheck,
  Plus,
  WalletCards,
  CalendarDays,
} from 'lucide-vue-next'

import type {
  LeaveRequest,
} from '~/types/leave'

defineProps<{
  pendingRequests: LeaveRequest[]
  employeesOnLeave: LeaveRequest[]
}>()

const emit = defineEmits<{
  fileLeave: []
  balances: []
  calendar: []
}>()

const formatShortDate = (
  date: string,
) => {
  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
    },
  ).format(
    new Date(
      `${date}T00:00:00`,
    ),
  )
}
</script>

<template>
  <div class="leave-side">

    <!-- PENDING -->
    <article class="side-card">

      <div class="side-heading">

        <div class="side-icon orange">
          <Clock3 :size="16" />
        </div>

        <div>
          <h3>
            Pending Approvals
          </h3>

          <p>
            Requests awaiting action.
          </p>
        </div>

      </div>

      <div class="request-list">

        <div
          v-for="request in pendingRequests"
          :key="request.id"
          class="request-row"
        >
          <div>
            <strong>
              {{ request.employeeName }}
            </strong>

            <span>
              {{ request.leaveType }}
            </span>
          </div>

          <small>
            {{ request.days }}
            day<span v-if="request.days > 1">s</span>
          </small>
        </div>

        <p
          v-if="!pendingRequests.length"
          class="empty-text"
        >
          No pending requests.
        </p>

      </div>

    </article>

    <!-- CURRENTLY ON LEAVE -->
    <article class="side-card">

      <div class="side-heading">

        <div class="side-icon green">
          <UserRoundCheck :size="16" />
        </div>

        <div>
          <h3>
            Currently On Leave
          </h3>

          <p>
            Employees away today.
          </p>
        </div>

      </div>

      <div class="request-list">

        <div
          v-for="request in employeesOnLeave"
          :key="request.id"
          class="request-row"
        >
          <div>
            <strong>
              {{ request.employeeName }}
            </strong>

            <span>
              {{ request.leaveType }}
            </span>
          </div>

          <small>
            Until
            {{ formatShortDate(request.dateTo) }}
          </small>
        </div>

        <p
          v-if="!employeesOnLeave.length"
          class="empty-text"
        >
          No employees are on leave today.
        </p>

      </div>

    </article>

    <!-- QUICK ACTIONS -->
    <article class="side-card">

      <div class="side-heading">

        <div class="side-icon blue">
          <CalendarDays :size="16" />
        </div>

        <div>
          <h3>
            Quick Actions
          </h3>

          <p>
            Common leave management tasks.
          </p>
        </div>

      </div>

      <div class="quick-list">

        <button
          type="button"
          @click="emit('balances')"
        >
          <WalletCards :size="15" />

          View Leave Balances
        </button>

        <button
          type="button"
          @click="emit('calendar')"
        >
          <CalendarDays :size="15" />

          Leave Calendar
        </button>

      </div>

    </article>

  </div>
</template>

<style scoped>
.leave-side {
  display: flex;
  flex-direction: column;

  gap: 12px;
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

.side-heading {
  display: flex;
  align-items: center;
  gap: 9px;

  padding: 12px 13px;

  border-bottom:
    1px solid var(--border-soft);
}

.side-icon {
  display: flex;

  width: 34px;
  height: 34px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 8px;
}

.side-icon.orange {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.side-icon.green {
  background:
    var(--green-soft);

  color:
    var(--green);
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

  font-size: 10px;
}

.side-heading p {
  margin: 3px 0 0;

  color:
    var(--text-muted);

  font-size: 7px;
}

/* REQUESTS */

.request-list {
  padding: 5px 12px 9px;
}

.request-row {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 10px;

  padding: 9px 0;

  border-bottom:
    1px solid var(--border-soft);
}

.request-row:last-child {
  border-bottom: 0;
}

.request-row strong,
.request-row span {
  display: block;
}

.request-row strong {
  color:
    var(--text-primary);

  font-size: 8px;
}

.request-row span {
  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 7px;
}

.request-row small {
  color:
    var(--text-secondary);

  font-size: 7px;

  text-align: right;
}

.empty-text {
  margin: 10px 0;

  color:
    var(--text-muted);

  font-size: 8px;
}

/* QUICK */

.quick-list {
  padding: 7px;
}

.quick-list button {
  display: flex;

  width: 100%;
  min-height: 38px;

  align-items: center;
  gap: 9px;

  padding: 0 9px;

  border: 0;
  border-radius: 7px;

  background: transparent;

  color:
    var(--text-secondary);

  font-size: 8px;

  text-align: left;
}

.quick-list button:hover {
  background:
    var(--bg-card-soft);

  color:
    var(--primary);
}
</style>