<script setup lang="ts">
import {
  UserPlus,
  UserCheck,
  ArrowRightLeft,
  UserMinus,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    onboarding: number
    regularization: number
    transfers: number
    offboarding: number
  }
}>()
</script>

<template>
  <div class="lifecycle-stats">

    <StatCard
      label="Active Onboarding"
      :value="stats.onboarding"
      description="Employees currently onboarding"
      :icon="UserPlus"
      tone="blue"
    />

    <StatCard
      label="For Regularization"
      :value="stats.regularization"
      description="Employees awaiting review"
      :icon="UserCheck"
      tone="green"
    />

    <StatCard
      label="Pending Transfers"
      :value="stats.transfers"
      description="Scheduled department changes"
      :icon="ArrowRightLeft"
      tone="orange"
    />

    <StatCard
      label="Offboarding"
      :value="stats.offboarding"
      description="Employees under exit processing"
      :icon="UserMinus"
      tone="purple"
    />

  </div>
</template>

<style scoped>
.lifecycle-stats {
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 14px;

  margin-bottom: 14px;
}

@media (max-width: 1100px) {
  .lifecycle-stats {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .lifecycle-stats {
    grid-template-columns: 1fr;
  }
}
</style>