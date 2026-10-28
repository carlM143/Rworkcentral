<script setup lang="ts">
import {
  Users,
  UserCheck,
  ShieldCheck,
  UserX,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    total: number
    active: number
    roles: number
    disabled: number
  }
}>()
</script>

<template>
  <div class="access-stats">

    <StatCard
      label="Total Users"
      :value="stats.total"
      description="Registered system accounts"
      :icon="Users"
      tone="blue"
    />

    <StatCard
      label="Active Users"
      :value="stats.active"
      description="Users with active access"
      :icon="UserCheck"
      tone="green"
    />

    <StatCard
      label="Active Roles"
      :value="stats.roles"
      description="Configured access roles"
      :icon="ShieldCheck"
      tone="purple"
    />

    <StatCard
      label="Disabled Accounts"
      :value="stats.disabled"
      description="Accounts without system access"
      :icon="UserX"
      tone="orange"
    />

  </div>
</template>

<style scoped>
.access-stats {
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 14px;

  margin-bottom: 14px;
}

@media (max-width: 1100px) {
  .access-stats {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .access-stats {
    grid-template-columns: 1fr;
  }
}
</style>