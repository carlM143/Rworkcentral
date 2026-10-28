<script setup lang="ts">
import {
  House,
  Clock3,
  CircleCheck,
  CalendarDays,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    totalRequests: number
    pendingReview: number
    approved: number
    approvedDays: number
  }
}>()
</script>

<template>
  <div class="stats-grid">

    <StatCard
      label="WFH Requests"
      :value="stats.totalRequests"
      description="Work from home requests on record"
      :icon="House"
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
      description="Approved WFH requests"
      :icon="CircleCheck"
      tone="green"
    />

    <StatCard
      label="Approved WFH Days"
      :value="stats.approvedDays"
      description="Total approved remote work days"
      :icon="CalendarDays"
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