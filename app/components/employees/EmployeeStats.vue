<script setup lang="ts">
import {
  Users,
  BadgeCheck,
  Clock3,
  BriefcaseBusiness,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    total: number
    regular: number
    probationary: number
    contractual: number
  }
}>()
</script>

<template>
  <div class="employee-stats">
    <StatCard
      label="Total Employees"
      :value="stats.total"
      description="Active workforce"
      :icon="Users"
      tone="blue"
    />

    <StatCard
      label="Regular"
      :value="stats.regular"
      description="Regular employees"
      :icon="BadgeCheck"
      tone="green"
    />

    <StatCard
      label="Probationary"
      :value="stats.probationary"
      description="Under probation"
      :icon="Clock3"
      tone="orange"
    />

    <StatCard
      label="Contractual"
      :value="stats.contractual"
      description="Contract employees"
      :icon="BriefcaseBusiness"
      tone="purple"
    />
  </div>
</template>

<style scoped>
.employee-stats {
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 12px;

  margin-bottom: 14px;
}

@media (max-width: 1100px) {
  .employee-stats {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .employee-stats {
    grid-template-columns: 1fr;
  }
}
</style>