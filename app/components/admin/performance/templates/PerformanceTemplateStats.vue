<script setup lang="ts">
import {
  ClipboardList,
  CircleCheck,
  FilePenLine,
  Activity,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    totalTemplates: number
    activeTemplates: number
    draftTemplates: number
    totalUsage: number
  }
}>()
</script>

<template>
  <div class="stats-grid">

    <StatCard
      label="Evaluation Templates"
      :value="stats.totalTemplates"
      description="Performance templates on record"
      :icon="ClipboardList"
      tone="blue"
    />

    <StatCard
      label="Active Templates"
      :value="stats.activeTemplates"
      description="Templates available for evaluations"
      :icon="CircleCheck"
      tone="green"
    />

    <StatCard
      label="Draft Templates"
      :value="stats.draftTemplates"
      description="Templates still being prepared"
      :icon="FilePenLine"
      tone="orange"
    />

    <StatCard
      label="Template Usage"
      :value="stats.totalUsage"
      description="Evaluations using these templates"
      :icon="Activity"
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