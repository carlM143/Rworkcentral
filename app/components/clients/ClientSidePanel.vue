<script setup lang="ts">
import {
  AlertTriangle,
  Plus,
  Users,
  Settings2,
} from 'lucide-vue-next'

import type {
  Client,
} from '~/types/client'

defineProps<{
  contractAlerts: Client[]
}>()

const emit = defineEmits<{
  addClient: []
  assignments: []
}>()
</script>

<template>
  <aside class="client-side">

    <!-- CONTRACT ALERTS -->

    <article class="side-card">

      <div class="side-heading">

        <div class="side-icon orange">
          <AlertTriangle :size="16" />
        </div>

        <div>
          <h3>
            Contract Alerts
          </h3>

          <p>
            Contracts requiring attention.
          </p>
        </div>

      </div>

      <div class="side-list">

        <div
          v-for="client in contractAlerts"
          :key="client.id"
          class="side-row"
        >
          <div>
            <strong>
              {{ client.name }}
            </strong>

            <span>
              {{ client.contractStatus }}
            </span>
          </div>

          <StatusBadge
            :status="client.contractStatus"
          />
        </div>

        <p
          v-if="!contractAlerts.length"
          class="empty-text"
        >
          No contract alerts.
        </p>

      </div>

    </article>

    <!-- QUICK ACTIONS -->

    <article class="side-card">

      <div class="side-heading">

        <div class="side-icon blue">
          <Settings2 :size="16" />
        </div>

        <div>
          <h3>
            Quick Actions
          </h3>

          <p>
            Common client management tasks.
          </p>
        </div>

      </div>

      <div class="quick-actions">

        <button
          type="button"
          @click="emit('addClient')"
        >
          <Plus :size="15" />

          Add Client
        </button>

        <button
          type="button"
          @click="emit('assignments')"
        >
          <Users :size="15" />

          Employee Assignments
        </button>

      </div>

    </article>

  </aside>
</template>

<style scoped>
.client-side {
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

  flex-shrink: 0;

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

.side-list {
  padding: 5px 12px 9px;
}

.side-row {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 10px;

  padding: 9px 0;

  border-bottom:
    1px solid var(--border-soft);
}

.side-row:last-child {
  border-bottom: 0;
}

.side-row strong,
.side-row span {
  display: block;
}

.side-row > div strong {
  color: var(--text-primary);

  font-size: 8px;
}

.side-row > div span {
  margin-top: 2px;

  color: var(--text-muted);

  font-size: 7px;
}

.empty-text {
  color: var(--text-muted);

  font-size: 8px;
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

  cursor: pointer;
}

.quick-actions button:hover {
  background: var(--bg-card-soft);
  color: var(--primary);
}
</style>