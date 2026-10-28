<script setup lang="ts">
import {
  Clock3,
  CircleCheck,
  CircleX,
  CalendarDays,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    pending: number
    approved: number
    rejected: number
    thisMonth: number
  }
}>()
</script>

<template>
  <div class="stats-grid">

    <StatCard
      label="Pending Requests"
      :value="stats.pending"
      description="Waiting for review"
      :icon="Clock3"
      tone="orange"
    />

    <StatCard
      label="Approved"
      :value="stats.approved"
      description="Approved corrections"
      :icon="CircleCheck"
      tone="green"
    />

    <StatCard
      label="Rejected"
      :value="stats.rejected"
      description="Rejected corrections"
      :icon="CircleX"
      tone="purple"
    />

    <StatCard
      label="Requests This Month"
      :value="stats.thisMonth"
      description="Filed during current month"
      :icon="CalendarDays"
      tone="blue"
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
    grid-template-columns: 1fr;
  }
}
</style>