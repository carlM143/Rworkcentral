<script setup lang="ts">
import {
  Building2,
  BadgeCheck,
  Users,
  UserRoundX,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    total: number
    active: number
    employees: number
    vacantHeads: number
  }
}>()
</script>

<template>
  <div class="department-stats">
    <StatCard
      label="Total Departments"
      :value="stats.total"
      description="Departments configured"
      :icon="Building2"
      tone="blue"
    />

    <StatCard
      label="Active Departments"
      :value="stats.active"
      description="Currently operational"
      :icon="BadgeCheck"
      tone="green"
    />

    <StatCard
      label="Assigned Employees"
      :value="stats.employees"
      description="Active workforce assigned"
      :icon="Users"
      tone="purple"
    />

    <StatCard
      label="Vacant Department Heads"
      :value="stats.vacantHeads"
      description="Requires assignment"
      :icon="UserRoundX"
      tone="orange"
    />
  </div>
</template>

<style scoped>
.department-stats {
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 12px;

  margin-bottom: 14px;
}

@media (max-width: 1100px) {
  .department-stats {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .department-stats {
    grid-template-columns: 1fr;
  }
}
</style>