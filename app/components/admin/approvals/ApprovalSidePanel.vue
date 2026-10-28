<script setup lang="ts">
import {
  AlertTriangle,
  Umbrella,
  TimerReset,
  Clock3,
  Laptop,
} from 'lucide-vue-next'

import type {
  ApprovalRequest,
} from '~/types/approval'

defineProps<{
  urgentRequests: ApprovalRequest[]

  summary: {
    leave: number
    overtime: number
    corrections: number
    wfh: number
  }
}>()
</script>

<template>
  <aside class="approval-side">

    <!-- URGENT -->
    <article class="side-card">

      <div class="side-heading">

        <div class="side-icon danger">
          <AlertTriangle :size="16" />
        </div>

        <div>
          <h3>
            Urgent Requests
          </h3>

          <p>
            Requests requiring priority review.
          </p>
        </div>

      </div>

      <div class="urgent-list">

        <div
          v-for="request in urgentRequests"
          :key="request.id"
          class="urgent-row"
        >
          <div>
            <strong>
              {{ request.employeeName }}
            </strong>

            <span>
              {{ request.type }}
            </span>
          </div>

          <small>
            {{ request.reference }}
          </small>
        </div>

        <p
          v-if="!urgentRequests.length"
          class="empty-message"
        >
          No urgent requests.
        </p>

      </div>

    </article>

    <!-- SUMMARY -->
    <article class="side-card">

      <div class="side-heading">

        <div class="side-icon blue">
          <Clock3 :size="16" />
        </div>

        <div>
          <h3>
            Request Summary
          </h3>

          <p>
            Pending requests by category.
          </p>
        </div>

      </div>

      <div class="summary-list">

        <div class="summary-row">
          <div>
            <Umbrella :size="14" />

            Leave
          </div>

          <strong>
            {{ summary.leave }}
          </strong>
        </div>

        <div class="summary-row">
          <div>
            <TimerReset :size="14" />

            Overtime
          </div>

          <strong>
            {{ summary.overtime }}
          </strong>
        </div>

        <div class="summary-row">
          <div>
            <Clock3 :size="14" />

            Time Corrections
          </div>

          <strong>
            {{ summary.corrections }}
          </strong>
        </div>

        <div class="summary-row">
          <div>
            <Laptop :size="14" />

            Work From Home
          </div>

          <strong>
            {{ summary.wfh }}
          </strong>
        </div>

      </div>

    </article>

  </aside>
</template>

<style scoped>
.approval-side {
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

.side-icon.danger {
  background:
    var(--red-soft);

  color:
    var(--red);
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

/* URGENT */

.urgent-list {
  padding:
    5px 12px 9px;
}

.urgent-row {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 8px;

  padding: 9px 0;

  border-bottom:
    1px solid var(--border-soft);
}

.urgent-row:last-child {
  border-bottom: 0;
}

.urgent-row strong,
.urgent-row span {
  display: block;
}

.urgent-row strong {
  color:
    var(--text-primary);

  font-size: 8px;
}

.urgent-row span {
  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 7px;
}

.urgent-row small {
  color:
    var(--red);

  font-size: 7px;
}

/* SUMMARY */

.summary-list {
  padding:
    5px 13px 9px;
}

.summary-row {
  display: flex;

  align-items: center;
  justify-content: space-between;

  padding: 10px 0;

  border-bottom:
    1px solid var(--border-soft);
}

.summary-row:last-child {
  border-bottom: 0;
}

.summary-row > div {
  display: flex;

  align-items: center;

  gap: 7px;

  color:
    var(--text-secondary);

  font-size: 8px;
}

.summary-row strong {
  color:
    var(--text-primary);

  font-size: 9px;
}

.empty-message {
  color:
    var(--text-muted);

  font-size: 8px;
}
</style>