<script setup lang="ts">
import {
  Files,
  BadgeCheck,
  Clock3,
  FileWarning,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    total: number
    verified: number
    expiring: number
    missing: number
  }
}>()
</script>

<template>
  <div class="document-stats">

    <StatCard
      label="Total Documents"
      :value="stats.total"
      description="Employee documents on record"
      :icon="Files"
      tone="blue"
    />

    <StatCard
      label="Verified"
      :value="stats.verified"
      description="Verified employee documents"
      :icon="BadgeCheck"
      tone="green"
    />

    <StatCard
      label="Expiring Soon"
      :value="stats.expiring"
      description="Documents requiring renewal"
      :icon="Clock3"
      tone="orange"
    />

    <StatCard
      label="Missing Requirements"
      :value="stats.missing"
      description="Required documents not submitted"
      :icon="FileWarning"
      tone="purple"
    />

  </div>
</template>

<style scoped>
.document-stats {
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 14px;

  margin-bottom: 14px;
}

@media (max-width: 1100px) {
  .document-stats {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .document-stats {
    grid-template-columns: 1fr;
  }
}
</style>