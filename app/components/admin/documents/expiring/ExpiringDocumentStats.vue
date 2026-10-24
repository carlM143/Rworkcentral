<script setup lang="ts">
import {
  CalendarClock,
  CircleAlert,
  TriangleAlert,
  Clock3,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    expiringDocuments: number
    expired: number
    critical: number
    within30Days: number
  }
}>()
</script>

<template>
  <div class="stats-grid">

    <StatCard
      label="Tracked Documents"
      :value="stats.expiringDocuments"
      description="Documents with expiry dates"
      :icon="CalendarClock"
      tone="blue"
    />

    <StatCard
      label="Expired"
      :value="stats.expired"
      description="Documents already expired"
      :icon="CircleAlert"
      tone="orange"
    />

    <StatCard
      label="Critical"
      :value="stats.critical"
      description="Expiring within 7 days"
      :icon="TriangleAlert"
      tone="purple"
    />

    <StatCard
      label="Within 30 Days"
      :value="stats.within30Days"
      description="Upcoming document expirations"
      :icon="Clock3"
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