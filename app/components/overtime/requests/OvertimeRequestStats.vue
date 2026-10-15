<script setup lang="ts">
import {
  TimerReset,
  Clock3,
  CircleCheck,
  Timer,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    totalRequests: number
    pending: number
    approved: number
    approvedHours: number
  }
}>()
</script>

<template>
  <div class="stats-grid">

    <StatCard
      label="Total OT Requests"
      :value="stats.totalRequests"
      description="Overtime requests on record"
      :icon="TimerReset"
      tone="blue"
    />

    <StatCard
      label="Pending Review"
      :value="stats.pending"
      description="Requests requiring action"
      :icon="Clock3"
      tone="orange"
    />

    <StatCard
      label="Approved Requests"
      :value="stats.approved"
      description="Approved overtime requests"
      :icon="CircleCheck"
      tone="green"
    />

    <StatCard
      label="Approved OT Hours"
      :value="`${stats.approvedHours} hrs`"
      description="Total approved overtime hours"
      :icon="Timer"
      tone="purple"
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