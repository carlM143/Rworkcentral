<script setup lang="ts">
import {
  ShieldCheck,
  Users,
  Settings2,
  Plus,
  Copy,
  Grid3X3,
} from 'lucide-vue-next'

import type {
  RoleDefinition,
} from '~/types/rolePermission'

defineProps<{
  role?: RoleDefinition

  summary: {
    fullAccess: number
    manage: number
    approve: number
    restricted: number
  }
}>()

const emit = defineEmits<{
  createRole: []
  editPermissions: []
  cloneRole: []
}>()
</script>

<template>
  <aside class="roles-side">

    <!-- SELECTED ROLE -->
    <article class="side-card">

      <div class="side-heading">

        <div class="side-icon purple">
          <ShieldCheck :size="17" />
        </div>

        <div>
          <h3>
            Selected Role
          </h3>

          <p>
            Current role information.
          </p>
        </div>

      </div>

      <div
        v-if="role"
        class="role-summary"
      >
        <strong>
          {{ role.name }}
        </strong>

        <p>
          {{ role.description }}
        </p>

        <div class="role-summary-row">

          <span>
            <Users :size="14" />

            Assigned Users
          </span>

          <strong>
            {{ role.userCount }}
          </strong>

        </div>

        <div class="role-summary-row">

          <span>
            Role Type
          </span>

          <strong>
            {{ role.type }}
          </strong>

        </div>

        <div class="role-summary-row">

          <span>
            Status
          </span>

          <StatusBadge
            :status="role.status"
          />

        </div>

      </div>

    </article>

    <!-- PERMISSION SUMMARY -->
    <article class="side-card">

      <div class="side-heading">

        <div class="side-icon blue">
          <Grid3X3 :size="17" />
        </div>

        <div>
          <h3>
            Permission Summary
          </h3>

          <p>
            Selected role access overview.
          </p>
        </div>

      </div>

      <div class="summary-list">

        <div class="summary-row">
          <span>
            Full Access
          </span>

          <strong class="green">
            {{ summary.fullAccess }}
          </strong>
        </div>

        <div class="summary-row">
          <span>
            Manage
          </span>

          <strong>
            {{ summary.manage }}
          </strong>
        </div>

        <div class="summary-row">
          <span>
            Approval Access
          </span>

          <strong class="purple">
            {{ summary.approve }}
          </strong>
        </div>

        <div class="summary-row">
          <span>
            No Access
          </span>

          <strong class="red">
            {{ summary.restricted }}
          </strong>
        </div>

      </div>

    </article>

    <!-- QUICK ACTIONS -->
    <article class="side-card">

      <div class="side-heading">

        <div class="side-icon orange">
          <Settings2 :size="17" />
        </div>

        <div>
          <h3>
            Quick Actions
          </h3>

          <p>
            Common role management tasks.
          </p>
        </div>

      </div>

      <div class="quick-list">

        <button
          type="button"
          @click="
            emit('createRole')
          "
        >
          <Plus :size="15" />

          Create Role
        </button>

        <button
          type="button"
          @click="
            emit(
              'editPermissions',
            )
          "
        >
          <Settings2 :size="15" />

          Edit Permissions
        </button>

        <button
          type="button"
          @click="
            emit('cloneRole')
          "
        >
          <Copy :size="15" />

          Clone Role
        </button>

      </div>

    </article>

  </aside>
</template>

<style scoped>
.roles-side {
  display: flex;

  flex-direction: column;

  gap: 14px;
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

.side-icon.purple {
  background: var(--purple-soft);
  color: var(--purple);
}

.side-icon.blue {
  background: var(--primary-soft);
  color: var(--primary);
}

.side-icon.orange {
  background: var(--orange-soft);
  color: var(--orange);
}

.side-heading h3 {
  margin: 0;

  color: var(--text-primary);

  font-size: 13px;
  font-weight: 700;
}

.side-heading p {
  margin: 4px 0 0;

  color: var(--text-muted);

  font-size: 10px;
}

.role-summary {
  padding: 14px;
}

.role-summary > strong {
  color: var(--text-primary);

  font-size: 13px;
}

.role-summary > p {
  margin: 6px 0 12px;

  color: var(--text-secondary);

  font-size: 10px;

  line-height: 1.5;
}

.role-summary-row,
.summary-row {
  display: flex;

  min-height: 42px;

  align-items: center;
  justify-content: space-between;

  gap: 10px;

  border-top:
    1px solid var(--border-soft);
}

.role-summary-row span {
  display: flex;

  align-items: center;

  gap: 6px;

  color: var(--text-secondary);

  font-size: 10px;
}

.role-summary-row > strong {
  color: var(--text-primary);

  font-size: 11px;
}

.summary-list {
  padding: 5px 14px 10px;
}

.summary-row {
  border-top: 0;

  border-bottom:
    1px solid var(--border-soft);
}

.summary-row:last-child {
  border-bottom: 0;
}

.summary-row span {
  color: var(--text-secondary);

  font-size: 10px;
}

.summary-row strong {
  color: var(--primary);

  font-size: 11px;
}

.summary-row strong.green {
  color: var(--green);
}

.summary-row strong.purple {
  color: var(--purple);
}

.summary-row strong.red {
  color: var(--red);
}

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

  background: transparent;

  color: var(--text-secondary);

  font-size: 10px;
  font-weight: 500;

  text-align: left;

  cursor: pointer;
}

.quick-list button:hover {
  background: var(--bg-card-soft);
  color: var(--primary);
}

.roles-side :deep(.status-badge) {
  min-height: 25px;

  font-size: 9px;
}

@media (max-width: 1100px) {
  .roles-side {
    display: grid;

    grid-template-columns:
      repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 800px) {
  .roles-side {
    grid-template-columns: 1fr;
  }
}
</style>