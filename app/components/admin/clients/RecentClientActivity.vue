<script setup lang="ts">
import {
  History,
} from 'lucide-vue-next'

import type {
  ClientActivity,
} from '~/types/client'

defineProps<{
  activities: ClientActivity[]
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
  <article class="activity-card">

    <div class="card-heading">

      <div class="card-icon">
        <History :size="16" />
      </div>

      <div>
        <h3>
          Recent Client Activity
        </h3>

        <p>
          Latest client-related updates.
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
            {{ activity.clientName }}
          </strong>

          <span>
            {{ activity.action }}
          </span>

          <p>
            {{ activity.description }}
          </p>
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

  border:
    1px solid var(--border);

  border-radius: 11px;

  background:
    var(--bg-card);

  box-shadow:
    var(--shadow);
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

.activity-list {
  padding: 5px 13px 9px;
}

.activity-row {
  display: flex;

  align-items: flex-start;
  justify-content: space-between;

  gap: 12px;

  padding: 10px 0;

  border-bottom:
    1px solid var(--border-soft);
}

.activity-row:last-child {
  border-bottom: 0;
}

.activity-row strong,
.activity-row span {
  display: block;
}

.activity-row strong {
  color:
    var(--text-primary);

  font-size: 8px;
}

.activity-row span {
  margin-top: 2px;

  color:
    var(--primary);

  font-size: 7px;
}

.activity-row p {
  margin: 3px 0 0;

  color:
    var(--text-muted);

  font-size: 7px;
}

.activity-row small {
  flex-shrink: 0;

  color:
    var(--text-muted);

  font-size: 7px;
}
</style>