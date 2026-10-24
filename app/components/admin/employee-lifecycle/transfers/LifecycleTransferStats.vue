<script setup lang="ts">
import {
  ArrowLeftRight,
  Clock3,
  CalendarCheck2,
  BadgeCheck,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    total: number
    pending: number
    scheduled: number
    effective: number
  }
}>()
</script>

<template>
  <div class="stats-grid">

    <StatCard
      label="Transfer Records"
      :value="stats.total"
      description="Employee movement records"
      :icon="ArrowLeftRight"
      tone="blue"
    />

    <StatCard
      label="Pending Approval"
      :value="stats.pending"
      description="Transfers requiring approval"
      :icon="Clock3"
      tone="orange"
    />

    <StatCard
      label="Approved / Scheduled"
      :value="stats.scheduled"
      description="Upcoming employee transfers"
      :icon="CalendarCheck2"
      tone="purple"
    />

    <StatCard
      label="Effective Transfers"
      :value="stats.effective"
      description="Transfers already implemented"
      :icon="BadgeCheck"
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