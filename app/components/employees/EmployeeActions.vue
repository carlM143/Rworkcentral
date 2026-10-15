<script setup lang="ts">
import {
  MoreHorizontal,
  Eye,
  Pencil,
  ArrowRightLeft,
  Files,
  UserX,
  UserCheck,
  History,
} from 'lucide-vue-next'

import type { Employee } from '~/types/employee'

const props = withDefaults(
  defineProps<{
    employee: Employee
    mode?: 'active' | 'inactive'
  }>(),
  {
    mode: 'active',
  },
)

const open = ref(false)

const {
  success,
  info,
} = useToast()

const close = () => {
  open.value = false
}

const handleDocuments = () => {
  close()

  info(
    'Employee Documents',
    'Open the employee profile to review documents.',
  )
}

const handleHistory = () => {
  close()

  info(
    'Employment History',
    'Employment history will be connected to the employee lifecycle module.',
  )
}

const handleReactivate = () => {
  close()

  success(
    'Reactivation Ready',
    `${props.employee.firstName} ${props.employee.lastName} is ready for reactivation review.`,
  )
}
</script>

<template>
  <div class="actions-wrapper">

    <!-- ACTION TRIGGER -->
    <button
      type="button"
      class="actions-trigger"
      @click.stop="open = !open"
    >
      <MoreHorizontal :size="18" />
    </button>

    <!-- ACTION MENU -->
    <div
      v-if="open"
      class="actions-menu"
      @mouseleave="close"
    >

      <!-- VIEW PROFILE -->
      <NuxtLink
        :to="`/employees/${employee.id}`"
        class="action-item"
        @click="close"
      >
        <Eye :size="15" />
        View Profile
      </NuxtLink>

      <!-- ==========================================
           ACTIVE EMPLOYEE ACTIONS
      =========================================== -->
      <template v-if="mode === 'active'">

        <NuxtLink
          :to="`/employees/${employee.id}/edit`"
          class="action-item"
          @click="close"
        >
          <Pencil :size="15" />
          Edit Employee
        </NuxtLink>

        <button
          type="button"
          class="action-item"
        >
          <ArrowRightLeft :size="15" />
          Transfer Department
        </button>

        <button
          type="button"
          class="action-item"
          @click="handleDocuments"
        >
          <Files :size="15" />
          View Documents
        </button>

        <div class="action-divider" />

        <button
          type="button"
          class="action-item danger"
        >
          <UserX :size="15" />
          Deactivate Employee
        </button>

      </template>

      <!-- ==========================================
           INACTIVE EMPLOYEE ACTIONS
      =========================================== -->
      <template v-else>

        <button
          type="button"
          class="action-item"
          @click="handleDocuments"
        >
          <Files :size="15" />
          View Documents
        </button>

        <button
          type="button"
          class="action-item"
          @click="handleHistory"
        >
          <History :size="15" />
          Employment History
        </button>

        <div class="action-divider" />

        <button
          type="button"
          class="action-item reactivate"
          @click="handleReactivate"
        >
          <UserCheck :size="15" />
          Reactivate Employee
        </button>

      </template>

    </div>
  </div>
</template>

<style scoped>
.actions-wrapper {
  position: relative;
  display: inline-flex;
}

.actions-trigger {
  display: flex;

  width: 32px;
  height: 32px;

  align-items: center;
  justify-content: center;

  border: 1px solid transparent;
  border-radius: 7px;

  background: transparent;
  color: var(--text-secondary);
}

.actions-trigger:hover {
  border-color: var(--border);

  background: var(--bg-card-soft);
  color: var(--text-primary);
}

.actions-menu {
  position: absolute;

  top: 36px;
  right: 0;

  z-index: 20;

  width: 190px;

  padding: 6px;

  border: 1px solid var(--border);
  border-radius: 9px;

  background: var(--bg-card);

  box-shadow:
    0 12px 35px
    rgba(15, 23, 42, 0.18);
}

.action-item {
  display: flex;

  width: 100%;
  min-height: 36px;

  align-items: center;
  gap: 9px;

  padding: 0 9px;

  border: 0;
  border-radius: 6px;

  background: transparent;
  color: var(--text-secondary);

  font-size: 11px;
  text-align: left;

  text-decoration: none;
}

.action-item:hover {
  background: var(--bg-card-soft);
  color: var(--text-primary);
}

/* DEACTIVATE */

.action-item.danger {
  color: var(--red);
}

.action-item.danger:hover {
  background: var(--red-soft);
  color: var(--red);
}

/* REACTIVATE */

.action-item.reactivate {
  color: var(--green);
}

.action-item.reactivate:hover {
  background: var(--green-soft);
  color: var(--green);
}

/* DIVIDER */

.action-divider {
  height: 1px;

  margin: 5px 0;

  background: var(--border-soft);
}
</style>