<script setup lang="ts">
import {
  UserMinus,
  ClipboardClock,
  WalletCards,
  CircleCheck,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    total: number
    active: number
    finalPay: number
    completed: number
  }
}>()
</script>

<template>
  <div class="stats-grid">

    <StatCard
      label="Offboarding Records"
      :value="stats.total"
      description="Employee separation records"
      :icon="UserMinus"
      tone="blue"
    />

    <StatCard
      label="Active Clearance"
      :value="stats.active"
      description="Employees undergoing clearance"
      :icon="ClipboardClock"
      tone="orange"
    />

    <StatCard
      label="Ready for Final Pay"
      :value="stats.finalPay"
      description="Clearance already completed"
      :icon="WalletCards"
      tone="purple"
    />

    <StatCard
      label="Completed"
      :value="stats.completed"
      description="Fully completed offboarding"
      :icon="CircleCheck"
      tone="green"
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