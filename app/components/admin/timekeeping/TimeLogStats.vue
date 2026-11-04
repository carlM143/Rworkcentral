
<script setup lang="ts">
import {
  ListChecks,
  BadgeCheck,
  FileWarning,
  AlertTriangle,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    total: number
    complete: number
    missing: number
    issues: number
  }
}>()
</script>

<template>
  <div class="time-log-stats">
    <StatCard
      label="Total Logs"
      :value="stats.total"
      description="Records within selected period"
      :icon="ListChecks"
      tone="blue"
    />

    <StatCard
      label="Complete Logs"
      :value="stats.complete"
      description="Complete time entries"
      :icon="BadgeCheck"
      tone="green"
    />

    <StatCard
      label="Missing Logs"
      :value="stats.missing"
      description="No recorded attendance"
      :icon="FileWarning"
      tone="orange"
    />

    <StatCard
      label="With Issues"
      :value="stats.issues"
      description="Late, undertime or incomplete"
      :icon="AlertTriangle"
      tone="purple"
    />
  </div>
</template>

<style scoped>
.time-log-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

@media (max-width: 1100px) {
  .time-log-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .time-log-stats {
    grid-template-columns: 1fr;
  }
}
</style>
