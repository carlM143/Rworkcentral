
<script setup lang="ts">
import {
  Wallet,
  BadgeCheck,
  Ban,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    total: number
    active: number
    inactive: number
  }
}>()
</script>

<template>
  <div class="employee-loan-stats">
    <StatCard
      label="Total Employee Loans"
      :value="stats.total"
      description="Recorded employee loans"
      :icon="Wallet"
      tone="blue"
    />

    <StatCard
      label="Active Employee Loans"
      :value="stats.active"
      description="Currently active loan records"
      :icon="BadgeCheck"
      tone="green"
    />

    <StatCard
      label="Inactive Employee Loans"
      :value="stats.inactive"
      description="Currently inactive loan records"
      :icon="Ban"
      tone="orange"
    />
  </div>
</template>

<style scoped>
.employee-loan-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

@media (max-width: 1100px) {
  .employee-loan-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .employee-loan-stats {
    grid-template-columns: 1fr;
  }
}
</style>
