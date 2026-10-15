<script setup lang="ts">
import {
  FileBarChart,
  CircleCheck,
  Landmark,
  Download,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    total: number
    available: number
    statutory: number
    generated: number
  }
}>()
</script>

<template>
  <div class="stats-grid">

    <StatCard
      label="Report Templates"
      :value="stats.total"
      description="Reports available in the center"
      :icon="FileBarChart"
      tone="blue"
    />

    <StatCard
      label="Available Reports"
      :value="stats.available"
      description="Ready to view or export"
      :icon="CircleCheck"
      tone="green"
    />

    <StatCard
      label="Statutory Reports"
      :value="stats.statutory"
      description="Government contribution reports"
      :icon="Landmark"
      tone="purple"
    />

    <StatCard
      label="Reports Generated"
      :value="stats.generated"
      description="Mock generation history"
      :icon="Download"
      tone="orange"
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