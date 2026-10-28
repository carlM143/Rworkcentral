<script setup lang="ts">
import {
  Clock3,
  BadgeCheck,
  TimerReset,
  CircleX,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    pending: number
    approvedThisMonth: number
    approvedHours: number
    rejected: number
  }
}>()
</script>

<template>
  <div class="overtime-stats">

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
      description="Approved OT requests"
      :icon="BadgeCheck"
      tone="green"
    />

    <StatCard
      label="Approved OT Hours"
      :value="`${stats.approvedHours} hrs`"
      description="Total approved overtime"
      :icon="TimerReset"
      tone="blue"
    />

    <StatCard
      label="Rejected This Month"
      :value="stats.rejected"
      description="Rejected OT requests"
      :icon="CircleX"
      tone="purple"
    />

  </div>
</template>

<style scoped>
.overtime-stats {
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 12px;

  margin-bottom: 14px;
}

@media (max-width: 1100px) {
  .overtime-stats {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .overtime-stats {
    grid-template-columns: 1fr;
  }
}
</style>