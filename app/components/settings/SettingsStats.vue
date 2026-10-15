<script setup lang="ts">
import {
  Users,
  ShieldCheck,
  Settings2,
  AlertTriangle,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    users: number
    roles: number
    modules: number
    review: number
  }
}>()
</script>

<template>
  <div class="settings-stats">

    <StatCard
      label="System Users"
      :value="stats.users"
      description="Users with HRIS access"
      :icon="Users"
      tone="blue"
    />

    <StatCard
      label="Active Roles"
      :value="stats.roles"
      description="Configured access roles"
      :icon="ShieldCheck"
      tone="green"
    />

    <StatCard
      label="Configuration Areas"
      :value="stats.modules"
      description="Available system settings"
      :icon="Settings2"
      tone="purple"
    />

    <StatCard
      label="Needs Attention"
      :value="stats.review"
      description="Settings requiring review"
      :icon="AlertTriangle"
      tone="orange"
    />

  </div>
</template>

<style scoped>
.settings-stats {
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 14px;

  margin-bottom: 14px;
}

@media (max-width: 1100px) {
  .settings-stats {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .settings-stats {
    grid-template-columns: 1fr;
  }
}
</style>