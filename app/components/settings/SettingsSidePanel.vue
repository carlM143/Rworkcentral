<script setup lang="ts">
import {
  ShieldCheck,
  Settings2,
  UserPlus,
  Users,
  Building2,
  Workflow,
} from 'lucide-vue-next'

import type {
  ConfigurationStatus,
  SecurityRoleSummary,
} from '~/types/settings'

defineProps<{
  roles:
    SecurityRoleSummary[]

  configurationStatus: {
    id: number
    name: string
    status: ConfigurationStatus
  }[]
}>()

const emit = defineEmits<{
  addUser: []
  manageRoles: []
  company: []
  approvals: []
}>()
</script>

<template>
  <aside class="settings-side">

    <!-- SECURITY -->
    <article class="side-card">

      <div class="side-heading">

        <div class="side-icon green">
          <ShieldCheck :size="17" />
        </div>

        <div>
          <h3>
            Security & Access
          </h3>

          <p>
            Current user access distribution.
          </p>
        </div>

      </div>

      <div class="summary-list">

        <div
          v-for="role in roles"
          :key="role.role"
          class="summary-row"
        >
          <div>
            <Users :size="15" />

            <span>
              {{ role.role }}
            </span>
          </div>

          <strong>
            {{ role.users }}
          </strong>
        </div>

      </div>

    </article>

    <!-- CONFIGURATION STATUS -->
    <article class="side-card">

      <div class="side-heading">

        <div class="side-icon orange">
          <Settings2 :size="17" />
        </div>

        <div>
          <h3>
            Configuration Status
          </h3>

          <p>
            Current HRIS setup progress.
          </p>
        </div>

      </div>

      <div class="status-list">

        <div
          v-for="item in configurationStatus"
          :key="item.id"
          class="status-row"
        >
          <span>
            {{ item.name }}
          </span>

          <strong
            :class="
              item.status
                .toLowerCase()
                .replace(/\s+/g, '-')
            "
          >
            {{ item.status }}
          </strong>
        </div>

      </div>

    </article>

    <!-- QUICK -->
    <article class="side-card">

      <div class="side-heading">

        <div class="side-icon blue">
          <Settings2 :size="17" />
        </div>

        <div>
          <h3>
            Quick Actions
          </h3>

          <p>
            Common administrative settings.
          </p>
        </div>

      </div>

      <div class="quick-list">

        <button
          type="button"
          @click="emit('addUser')"
        >
          <UserPlus :size="15" />

          Add System User
        </button>

        <button
          type="button"
          @click="emit('manageRoles')"
        >
          <ShieldCheck :size="15" />

          Manage Roles & Permissions
        </button>

        <button
          type="button"
          @click="emit('company')"
        >
          <Building2 :size="15" />

          Company Settings
        </button>

        <button
          type="button"
          @click="emit('approvals')"
        >
          <Workflow :size="15" />

          Approval Workflow
        </button>

      </div>

    </article>

  </aside>
</template>

<style scoped>
.settings-side {
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

/* HEADER */

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

.side-icon.green {
  background: var(--green-soft);
  color: var(--green);
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

  font-size: 13px;
  font-weight: 700;
}

.side-heading p {
  margin: 4px 0 0;

  color: var(--text-muted);

  font-size: 10px;

  line-height: 1.4;
}

/* SECURITY */

.summary-list,
.status-list {
  padding: 5px 14px 10px;
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

  color: var(--text-secondary);

  font-size: 10px;
}

.summary-row svg {
  color: var(--text-muted);
}

.summary-row strong {
  color: var(--primary);

  font-size: 11px;
  font-weight: 700;
}

/* CONFIG STATUS */

.status-row {
  display: flex;

  min-height: 46px;

  align-items: center;
  justify-content: space-between;

  gap: 10px;

  padding: 9px 0;

  border-bottom:
    1px solid var(--border-soft);
}

.status-row:last-child {
  border-bottom: 0;
}

.status-row > span {
  color: var(--text-secondary);

  font-size: 10px;
}

.status-row strong {
  font-size: 9px;
  font-weight: 650;

  text-align: right;
}

.status-row strong.complete {
  color: var(--green);
}

.status-row strong.needs-review {
  color: var(--orange);
}

.status-row strong.not-configured {
  color: var(--red);
}

/* QUICK ACTIONS */

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

@media (max-width: 1100px) {
  .settings-side {
    display: grid;

    grid-template-columns:
      repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 800px) {
  .settings-side {
    grid-template-columns: 1fr;
  }
}
</style>