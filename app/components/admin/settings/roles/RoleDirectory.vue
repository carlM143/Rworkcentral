<script setup lang="ts">
import {
  ShieldCheck,
  Users,
  ChevronRight,
} from 'lucide-vue-next'

import type {
  RoleDefinition,
} from '~/types/rolePermission'

import type {
  SystemUserRole,
} from '~/types/userAccess'

defineProps<{
  roles: RoleDefinition[]
  selectedRole: SystemUserRole
}>()

const emit = defineEmits<{
  select: [
    role:
      SystemUserRole,
  ]
}>()
</script>

<template>
  <article class="role-card">

    <div class="card-heading">
      <div>
        <h3>
          Roles
        </h3>

        <p>
          Select a role to review its system permissions.
        </p>
      </div>
    </div>

    <div class="role-list">

      <button
        v-for="role in roles"
        :key="role.id"
        type="button"
        class="role-item"
        :class="{
          active:
            selectedRole ===
            role.name,
        }"
        @click="
          emit(
            'select',
            role.name,
          )
        "
      >

        <div class="role-icon">
          <ShieldCheck :size="17" />
        </div>

        <div class="role-content">

          <div class="role-title">
            <strong>
              {{ role.name }}
            </strong>

            <ChevronRight :size="15" />
          </div>

          <p>
            {{ role.description }}
          </p>

          <div class="role-meta">

            <span>
              <Users :size="13" />

              {{ role.userCount }}
              users
            </span>

            <span>
              {{ role.type }}
            </span>

            <StatusBadge
              :status="role.status"
            />

          </div>

        </div>

      </button>

    </div>

  </article>
</template>

<style scoped>
.role-card {
  overflow: hidden;

  border: 1px solid var(--border);
  border-radius: 11px;

  background: var(--bg-card);

  box-shadow: var(--shadow);
}

.card-heading {
  padding: 15px 16px;

  border-bottom:
    1px solid var(--border-soft);
}

.card-heading h3 {
  margin: 0;

  color: var(--text-primary);

  font-size: 14px;
  font-weight: 700;
}

.card-heading p {
  margin: 5px 0 0;

  color: var(--text-muted);

  font-size: 11px;
}

.role-list {
  padding: 10px;
}

.role-item {
  display: flex;

  width: 100%;

  align-items: flex-start;

  gap: 11px;

  padding: 12px;

  border: 1px solid transparent;
  border-radius: 9px;

  background: transparent;

  color: inherit;

  text-align: left;

  cursor: pointer;
}

.role-item + .role-item {
  margin-top: 6px;
}

.role-item:hover {
  background: var(--bg-card-soft);
}

.role-item.active {
  border-color: var(--primary);

  background: var(--primary-soft);
}

.role-icon {
  display: flex;

  width: 38px;
  height: 38px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 9px;

  background: var(--purple-soft);
  color: var(--purple);
}

.role-content {
  min-width: 0;

  flex: 1;
}

.role-title {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 10px;
}

.role-title strong {
  color: var(--text-primary);

  font-size: 12px;
  font-weight: 700;
}

.role-title svg {
  color: var(--text-muted);
}

.role-content p {
  margin: 5px 0 0;

  color: var(--text-secondary);

  font-size: 10px;

  line-height: 1.5;
}

.role-meta {
  display: flex;

  flex-wrap: wrap;

  align-items: center;

  gap: 8px;

  margin-top: 9px;
}

.role-meta > span {
  display: inline-flex;

  align-items: center;

  gap: 5px;

  color: var(--text-muted);

  font-size: 9px;
}

.role-card :deep(.status-badge) {
  min-height: 24px;

  padding: 3px 8px;

  font-size: 9px;
}
</style>