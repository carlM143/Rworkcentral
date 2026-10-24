<script setup lang="ts">
import {
  AlertTriangle,
  ReceiptText,
  Calculator,
  Settings2,
  History,
} from 'lucide-vue-next'

defineProps<{
  issues: {
    id: number
    label: string
    count: number
    tone: string
  }[]
}>()

const emit = defineEmits<{
  createBilling: []
  rates: []
  history: []
}>()
</script>

<template>
  <aside class="billing-side">

    <!-- ISSUES -->
    <article class="side-card">

      <div class="side-heading">

        <div class="side-icon orange">
          <AlertTriangle :size="16" />
        </div>

        <div>
          <h3>
            Billing Issues
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
            :class="issue.tone"
          >
            {{ issue.count }}
          </strong>
        </div>

      </div>

    </article>

    <!-- QUICK -->
    <article class="side-card">

      <div class="side-heading">

        <div class="side-icon blue">
          <ReceiptText :size="16" />
        </div>

        <div>
          <h3>
            Quick Actions
          </h3>

          <p>
            Common billing tasks.
          </p>
        </div>

      </div>

      <div class="quick-actions">

        <button
          type="button"
          @click="emit('createBilling')"
        >
          <Calculator :size="15" />
          Create Billing
        </button>

        <button
          type="button"
          @click="emit('rates')"
        >
          <Settings2 :size="15" />
          Manage Billing Rates
        </button>

        <button
          type="button"
          @click="emit('history')"
        >
          <History :size="15" />
          Billing History
        </button>

      </div>

    </article>

  </aside>
</template>

<style scoped>
.billing-side {
  display: flex;
  flex-direction: column;

  gap: 12px;
}

.side-card {
  overflow: hidden;

  border: 1px solid var(--border);
  border-radius: 11px;

  background: var(--bg-card);

  box-shadow: var(--shadow);
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

  align-items: center;
  justify-content: center;

  border-radius: 8px;
}

.side-icon.orange {
  background: var(--orange-soft);
  color: var(--orange);
}

.side-icon.blue {
  background: var(--primary-soft);
  color: var(--primary);
}

.side-heading h3 {
  margin: 0;

  color: var(--text-primary);

  font-size: 10px;
}

.side-heading p {
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

.quick-actions {
  padding: 7px;
}

.quick-actions button {
  display: flex;

  width: 100%;
  min-height: 38px;

  align-items: center;
  gap: 9px;

  padding: 0 9px;

  border: 0;
  border-radius: 7px;

  background: transparent;

  color: var(--text-secondary);

  font-size: 8px;

  text-align: left;
}

.quick-actions button:hover {
  background: var(--bg-card-soft);

  color: var(--primary);
}
</style>