<script setup lang="ts">
import {
  FolderOpen,
  CircleCheck,
  ShieldCheck,
  Files,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    totalCategories: number
    activeCategories: number
    requiredCategories: number
    totalDocuments: number
  }
}>()
</script>

<template>
  <div class="stats-grid">

    <StatCard
      label="Document Categories"
      :value="stats.totalCategories"
      description="Configured document classifications"
      :icon="FolderOpen"
      tone="blue"
    />

    <StatCard
      label="Active Categories"
      :value="stats.activeCategories"
      description="Categories currently available"
      :icon="CircleCheck"
      tone="green"
    />

    <StatCard
      label="Required Categories"
      :value="stats.requiredCategories"
      description="Mandatory document categories"
      :icon="ShieldCheck"
      tone="orange"
    />

    <StatCard
      label="Documents Filed"
      :value="stats.totalDocuments"
      description="Documents under these categories"
      :icon="Files"
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