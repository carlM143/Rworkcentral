
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
  <div class="loan-types-stats">

    <StatCard
      label="Total Loan Types"
      :value="stats.total"
      description="Configured loan categories"
      :icon="Wallet"
      tone="blue"
    />

    <StatCard
      label="Active Loan Types"
      :value="stats.active"
      description="Currently available loan types"
      :icon="BadgeCheck"
      tone="green"
    />

    <StatCard
      label="Inactive Loan Types"
      :value="stats.inactive"
      description="Currently disabled loan types"
      :icon="Ban"
      tone="orange"
    />

  </div>
</template>

<style scoped>
.loan-types-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

@media (max-width: 1100px) {
  .loan-types-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .loan-types-stats {
    grid-template-columns: 1fr;
  }
}
</style>
