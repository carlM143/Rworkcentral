<script setup lang="ts">
import {
  Clock3,
  TimerReset,
  Plus,
  BadgeCheck,
  History,
} from 'lucide-vue-next'

import type {
  OvertimeRequest,
} from '~/types/overtime'

defineProps<{
  pendingRequests: OvertimeRequest[]
  todayOvertime: OvertimeRequest[]
}>()

const emit = defineEmits<{
  fileOvertime: []
  approved: []
  history: []
}>()
</script>

<template>
  <div class="overtime-side">

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
            OT requests awaiting action.
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
              {{ request.department }}
            </span>
          </div>

          <small>
            {{ request.hours }} hrs
          </small>

        </div>

        <p
          v-if="!pendingRequests.length"
          class="empty-text"
        >
          No pending OT requests.
        </p>

      </div>

    </article>

    <!-- TODAY -->
    <article class="side-card">

      <div class="side-heading">

        <div class="side-icon green">
          <TimerReset :size="16" />
        </div>

        <div>
          <h3>
            Today's Approved OT
          </h3>

          <p>
            Employees scheduled for OT today.
          </p>
        </div>

      </div>

      <div class="request-list">

        <div
          v-for="request in todayOvertime"
          :key="request.id"
          class="request-row"
        >

          <div>
            <strong>
              {{ request.employeeName }}
            </strong>

            <span>
              {{ request.timeFrom }}
              –
              {{ request.timeTo }}
            </span>
          </div>

          <small>
            {{ request.hours }} hrs
          </small>

        </div>

        <p
          v-if="!todayOvertime.length"
          class="empty-text"
        >
          No approved overtime today.
        </p>

      </div>

    </article>

    <!-- QUICK -->
    <article class="side-card">

      <div class="side-heading">

        <div class="side-icon blue">
          <TimerReset :size="16" />
        </div>

        <div>
          <h3>
            Quick Actions
          </h3>

          <p>
            Common overtime tasks.
          </p>
        </div>

      </div>

      <div class="quick-list">

        <button
          type="button"
          @click="emit('fileOvertime')"
        >
          <Plus :size="15" />

          File Overtime
        </button>

        <button
          type="button"
          @click="emit('approved')"
        >
          <BadgeCheck :size="15" />

          Approved Overtime
        </button>

        <button
          type="button"
          @click="emit('history')"
        >
          <History :size="15" />

          Overtime History
        </button>

      </div>

    </article>

  </div>
</template>

<style scoped>
.overtime-side {
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
    var(--primary);

  font-size: 8px;

  font-weight: 600;
}

.empty-text {
  margin: 10px 0;

  color:
    var(--text-muted);

  font-size: 8px;
}

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