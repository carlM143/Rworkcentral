<script setup lang="ts">
import {
  ShieldCheck,
  AlertTriangle,
  UserPlus,
  Users,
  KeyRound,
  Grid3X3,
} from 'lucide-vue-next'

import type {
  SystemUserRole,
} from '~/types/userAccess'

defineProps<{
  roleSummary: {
    role: SystemUserRole
    count: number
  }[]

  securityIssues: {
    invited: number
    disabled: number
    withoutTwoFactor: number
  }
}>()

const emit = defineEmits<{
  addUser: []
  manageRoles: []
  permissionMatrix: []
}>()
</script>

<template>
  <aside class="access-side">

    <!-- ROLE SUMMARY -->
    <article class="side-card">

      <div class="side-heading">

        <div class="side-icon purple">
          <ShieldCheck :size="17" />
        </div>

        <div>
          <h3>
            Role Summary
          </h3>

          <p>
            Current system access distribution.
          </p>
        </div>

      </div>

      <div class="summary-list">

        <div
          v-for="item in roleSummary"
          :key="item.role"
          class="summary-row"
        >
          <div>
            <Users :size="15" />

            <span>
              {{ item.role }}
            </span>
          </div>

          <strong>
            {{ item.count }}
          </strong>
        </div>

      </div>

    </article>

    <!-- SECURITY ISSUES -->
    <article class="side-card">

      <div class="side-heading">

        <div class="side-icon orange">
          <AlertTriangle :size="17" />
        </div>

        <div>
          <h3>
            Access Review
          </h3>

          <p>
            Account security requiring attention.
          </p>
        </div>

      </div>

      <div class="security-list">

        <div class="security-row">
          <span>
            Pending Invitations
          </span>

          <strong>
            {{ securityIssues.invited }}
          </strong>
        </div>

        <div class="security-row">
          <span>
            Disabled Accounts
          </span>

          <strong>
            {{ securityIssues.disabled }}
          </strong>
        </div>

        <div class="security-row">
          <span>
            Admin 2FA Missing
          </span>

          <strong>
            {{
              securityIssues.withoutTwoFactor
            }}
          </strong>
        </div>

      </div>

    </article>

    <!-- QUICK ACTIONS -->
    <article class="side-card">

      <div class="side-heading">

        <div class="side-icon blue">
          <KeyRound :size="17" />
        </div>

        <div>
          <h3>
            Quick Actions
          </h3>

          <p>
            Common user access tasks.
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

          Manage Roles
        </button>

        <button
          type="button"
          @click="
            emit(
              'permissionMatrix',
            )
          "
        >
          <Grid3X3 :size="15" />

          Permission Matrix
        </button>

      </div>

    </article>

  </aside>
</template>

<style scoped>
.access-side {
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

  border-bottom: 1px solid var(--border-soft);
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

/* SUMMARY */

.summary-list,
.security-list {
  padding: 5px 14px 10px;
}

.summary-row,
.security-row {
  display: flex;

  min-height: 44px;

  align-items: center;
  justify-content: space-between;

  gap: 12px;

  padding: 9px 0;

  border-bottom: 1px solid var(--border-soft);
}

.summary-row:last-child,
.security-row:last-child {
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
}

/* SECURITY */

.security-row span {
  color: var(--text-secondary);

  font-size: 10px;
}

.security-row strong {
  color: var(--orange);

  font-size: 11px;
  font-weight: 700;
}

/* QUICK */

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
  .access-side {
    display: grid;

    grid-template-columns:
      repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 800px) {
  .access-side {
    grid-template-columns: 1fr;
  }
}
</style>