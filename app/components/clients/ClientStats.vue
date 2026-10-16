<script setup lang="ts">
import {
  Building2,
  BadgeCheck,
  Users,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    total: number
    active: number
    employees: number
  }
}>()
</script>

<template>
  <div class="client-stats">

    <StatCard
      label="Total Clients"
      :value="stats.total"
      description="Registered client accounts"
      :icon="Building2"
      tone="blue"
    />

    <StatCard
      label="Active Clients"
      :value="stats.active"
      description="Currently active contracts"
      :icon="BadgeCheck"
      tone="green"
    />

    <StatCard
      label="Assigned Employees"
      :value="stats.employees"
      description="Employees deployed to clients"
      :icon="Users"
      tone="purple"
    />

  </div>
</template>

<style scoped>
.client-stats {
  display: grid;

  grid-template-columns:
    repeat(3, minmax(0, 1fr));

  gap: 12px;

  margin-bottom: 14px;
}

@media (max-width: 900px) {
  .client-stats {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .client-stats {
    grid-template-columns: 1fr;
  }
}
</style>