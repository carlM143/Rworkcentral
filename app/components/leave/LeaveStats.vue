<script setup lang="ts">
import {
  Clock3,
  BadgeCheck,
  UserRoundCheck,
  WalletCards,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    pending: number
    approvedThisMonth: number
    onLeave: number
    remainingCredits: number
  }
}>()
</script>

<template>
  <div class="leave-stats">

    <StatCard
      label="Pending Requests"
      :value="stats.pending"
      description="Waiting for approval"
      :icon="Clock3"
      tone="orange"
    />

    <StatCard
      label="Approved This Month"
      :value="stats.approvedThisMonth"
      description="Approved leave requests"
      :icon="BadgeCheck"
      tone="green"
    />

    <StatCard
      label="Employees On Leave"
      :value="stats.onLeave"
      description="Currently away from work"
      :icon="UserRoundCheck"
      tone="blue"
    />

    <StatCard
      label="Available Leave Credits"
      :value="stats.remainingCredits"
      description="Company-wide available credits"
      :icon="WalletCards"
      tone="purple"
    />

  </div>
</template>

<style scoped>
.leave-stats {
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 12px;

  margin-bottom: 14px;
}

@media (max-width: 1100px) {
  .leave-stats {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .leave-stats {
    grid-template-columns: 1fr;
  }
}
</style>