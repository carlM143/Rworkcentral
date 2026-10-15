<script setup lang="ts">
import {
  FileClock,
  Clock3,
  CircleCheck,
  CircleX,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    totalRequests: number
    pendingReview: number
    approved: number
    rejected: number
  }
}>()
</script>

<template>
  <div class="stats-grid">

    <StatCard
      label="Leave Requests"
      :value="stats.totalRequests"
      description="Leave requests on record"
      :icon="FileClock"
      tone="blue"
    />

    <StatCard
      label="Pending Review"
      :value="stats.pendingReview"
      description="Requests requiring approval action"
      :icon="Clock3"
      tone="orange"
    />

    <StatCard
      label="Approved"
      :value="stats.approved"
      description="Approved leave requests"
      :icon="CircleCheck"
      tone="green"
    />

    <StatCard
      label="Rejected"
      :value="stats.rejected"
      description="Rejected leave requests"
      :icon="CircleX"
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