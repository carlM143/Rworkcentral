<script setup lang="ts">
import {
  CalendarDays,
  CircleCheck,
  WalletCards,
  CircleOff,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    totalTypes: number
    activeTypes: number
    paidTypes: number
    inactiveTypes: number
  }
}>()
</script>

<template>
  <div class="stats-grid">

    <StatCard
      label="Leave Types"
      :value="stats.totalTypes"
      description="Configured leave categories"
      :icon="CalendarDays"
      tone="blue"
    />

    <StatCard
      label="Active Types"
      :value="stats.activeTypes"
      description="Currently available leave types"
      :icon="CircleCheck"
      tone="green"
    />

    <StatCard
      label="Paid Leave Types"
      :value="stats.paidTypes"
      description="Active paid leave categories"
      :icon="WalletCards"
      tone="purple"
    />

    <StatCard
      label="Inactive Types"
      :value="stats.inactiveTypes"
      description="Disabled or legacy leave types"
      :icon="CircleOff"
      tone="orange"
    />

  </div>
</template>

<style scoped>
.stats-grid {
  display: grid;

  grid-template-columns:
    repeat(
      4,
      minmax(0, 1fr)
    );

  gap: 14px;

  margin-bottom: 14px;
}

@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );
  }
}

@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns:
      1fr;
  }
}
</style>