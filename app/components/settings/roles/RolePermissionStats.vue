<script setup lang="ts">
import {
  ShieldCheck,
  BadgeCheck,
  Users,
  ShieldPlus,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    totalRoles: number
    activeRoles: number
    assignedUsers: number
    customRoles: number
  }
}>()
</script>

<template>
  <div class="role-stats">

    <StatCard
      label="Total Roles"
      :value="stats.totalRoles"
      description="Configured system roles"
      :icon="ShieldCheck"
      tone="blue"
    />

    <StatCard
      label="Active Roles"
      :value="stats.activeRoles"
      description="Roles currently available"
      :icon="BadgeCheck"
      tone="green"
    />

    <StatCard
      label="Assigned Users"
      :value="stats.assignedUsers"
      description="Users assigned to roles"
      :icon="Users"
      tone="purple"
    />

    <StatCard
      label="Custom Roles"
      :value="stats.customRoles"
      description="Organization-specific roles"
      :icon="ShieldPlus"
      tone="orange"
    />

  </div>
</template>

<style scoped>
.role-stats {
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 14px;

  margin-bottom: 14px;
}

@media (max-width: 1100px) {
  .role-stats {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .role-stats {
    grid-template-columns: 1fr;
  }
}
</style>