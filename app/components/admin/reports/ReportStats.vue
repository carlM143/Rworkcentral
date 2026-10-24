<script setup lang="ts">
import {
  FileText,
  BarChart3,
  BadgeCheck,
  Clock3,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    totalReports: number
    generatedThisMonth: number
    completed: number
    pending: number
  }
}>()
</script>

<template>
  <div class="report-stats">

    <StatCard
      label="Available Reports"
      :value="stats.totalReports"
      description="Across all HRIS modules"
      :icon="FileText"
      tone="blue"
    />

    <StatCard
      label="Generated This Month"
      :value="stats.generatedThisMonth"
      description="Recently generated reports"
      :icon="BarChart3"
      tone="purple"
    />

    <StatCard
      label="Completed Exports"
      :value="stats.completed"
      description="Reports ready for review"
      :icon="BadgeCheck"
      tone="green"
    />

    <StatCard
      label="Pending Reports"
      :value="stats.pending"
      description="Generation still pending"
      :icon="Clock3"
      tone="orange"
    />

  </div>
</template>

<style scoped>
.report-stats {
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 12px;

  margin-bottom: 14px;
}

@media (max-width: 1100px) {
  .report-stats {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .report-stats {
    grid-template-columns: 1fr;
  }
}
</style>