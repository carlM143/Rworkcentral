<script setup lang="ts">
import {
  History,
} from 'lucide-vue-next'

import type {
  AccessActivity,
} from '~/types/userAccess'

defineProps<{
  activities: AccessActivity[]
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
  <article class="activity-card">

    <div class="card-heading">

      <div class="heading-icon">
        <History :size="17" />
      </div>

      <div>
        <h3>
          Recent Access Activity
        </h3>

        <p>
          Latest account, permission and security changes.
        </p>
      </div>

    </div>

    <div class="activity-list">

      <div
        v-for="activity in activities"
        :key="activity.id"
        class="activity-row"
      >

        <div>
          <strong>
            {{ activity.action }}
          </strong>

          <span>
            {{ activity.userName }}
          </span>

          <p>
            {{ activity.description }}
          </p>

          <small class="performed-by">
            By {{ activity.performedBy }}
          </small>
        </div>

        <small>
          {{ formatDate(activity.date) }}
        </small>

      </div>

    </div>

  </article>
</template>

<style scoped>
.activity-card {
  overflow: hidden;

  border: 1px solid var(--border);
  border-radius: 11px;

  background: var(--bg-card);

  box-shadow: var(--shadow);
}

.card-heading {
  display: flex;

  align-items: center;

  gap: 10px;

  padding: 14px 16px;

  border-bottom: 1px solid var(--border-soft);
}

.heading-icon {
  display: flex;

  width: 38px;
  height: 38px;

  align-items: center;
  justify-content: center;

  border-radius: 9px;

  background: var(--purple-soft);
  color: var(--purple);
}

.card-heading h3 {
  margin: 0;

  color: var(--text-primary);

  font-size: 13px;
  font-weight: 700;
}

.card-heading p {
  margin: 4px 0 0;

  color: var(--text-muted);

  font-size: 10px;
}

.activity-list {
  padding: 5px 15px 10px;
}

.activity-row {
  display: flex;

  align-items: flex-start;
  justify-content: space-between;

  gap: 14px;

  padding: 12px 0;

  border-bottom: 1px solid var(--border-soft);
}

.activity-row:last-child {
  border-bottom: 0;
}

.activity-row strong {
  display: block;

  color: var(--text-primary);

  font-size: 11px;
}

.activity-row span {
  display: block;

  margin-top: 4px;

  color: var(--primary);

  font-size: 10px;
  font-weight: 600;
}

.activity-row p {
  margin: 4px 0 0;

  color: var(--text-secondary);

  font-size: 9px;
}

.activity-row > small {
  flex-shrink: 0;

  color: var(--text-muted);

  font-size: 9px;
}

.performed-by {
  display: block;

  margin-top: 4px;

  color: var(--text-muted) !important;

  font-size: 9px !important;
}
</style>