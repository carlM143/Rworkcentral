
<script setup lang="ts">
import {
  ArrowLeftRight,
  Clock3,
  CircleCheck,
  BadgeCheck,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    totalTransfers: number
    pendingReview: number
    approved: number
    completed: number
  }
}>()
</script>

<template>
  <div class="stats-grid">
    <StatCard
      label="Total Transfers"
      :value="stats.totalTransfers"
      description="All department transfer records"
      :icon="ArrowLeftRight"
      tone="blue"
    />

    <StatCard
      label="Pending Review"
      :value="stats.pendingReview"
      description="Awaiting approval"
      :icon="Clock3"
      tone="orange"
    />

    <StatCard
      label="Approved"
      :value="stats.approved"
      description="Awaiting application"
      :icon="CircleCheck"
      tone="purple"
    />

    <StatCard
      label="Completed"
      :value="stats.completed"
      description="Applied department transfers"
      :icon="BadgeCheck"
      tone="green"
    />
  </div>
</template>

<style scoped>
.stats-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:14px}
@media(max-width:1100px){.stats-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:600px){.stats-grid{grid-template-columns:1fr}}
</style>
