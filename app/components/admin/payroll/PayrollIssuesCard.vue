<script setup lang="ts">
import {
  AlertTriangle,
} from 'lucide-vue-next'

defineProps<{
  issues: {
    id: number
    label: string
    count: number
    type: string
  }[]
}>()
</script>

<template>
  <article class="issues-card">

    <div class="card-heading">
      <div class="card-icon">
        <AlertTriangle :size="17" />
      </div>

      <div>
        <h3>
          Payroll Issues
        </h3>

        <p>
          Items requiring review.
        </p>
      </div>
    </div>

    <div class="issue-list">

      <div
        v-for="issue in issues"
        :key="issue.id"
        class="issue-row"
      >
        <span>
          {{ issue.label }}
        </span>

        <strong
          :class="issue.type"
        >
          {{ issue.count }}
        </strong>
      </div>

    </div>

  </article>
</template>

<style scoped>
.issues-card {
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

  background: var(--orange-soft);
  color: var(--orange);
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

.issue-list {
  padding: 5px 13px 9px;
}

.issue-row {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 10px 0;

  border-bottom:
    1px solid var(--border-soft);
}

.issue-row:last-child {
  border-bottom: 0;
}

.issue-row span {
  color: var(--text-secondary);

  font-size: 8px;
}

.issue-row strong {
  color: var(--text-primary);

  font-size: 9px;
}

.issue-row strong.danger {
  color: var(--red);
}

.issue-row strong.warning {
  color: var(--orange);
}
</style>