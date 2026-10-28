<script setup lang="ts">
import {
  TrendingUp,
  Clock3,
  BadgeCheck,
  CircleCheck,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    total: number
    pending: number
    approved: number
    effective: number
  }
}>()
</script>

<template>
  <div class="stats-grid">

    <StatCard
      label="Promotion Records"
      :value="stats.total"
      description="Employee promotion records"
      :icon="TrendingUp"
      tone="blue"
    />

    <StatCard
      label="For Review / Approval"
      :value="stats.pending"
      description="Promotions requiring action"
      :icon="Clock3"
      tone="orange"
    />

    <StatCard
      label="Approved / Scheduled"
      :value="stats.approved"
      description="Upcoming employee promotions"
      :icon="BadgeCheck"
      tone="purple"
    />

    <StatCard
      label="Effective Promotions"
      :value="stats.effective"
      description="Promotions already implemented"
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