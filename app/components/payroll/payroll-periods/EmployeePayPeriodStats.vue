
<script setup lang="ts">
import { CalendarRange, FileClock, CircleDot, CircleCheck } from 'lucide-vue-next'

defineProps<{
  stats: {
    total: number
    draft: number
    open: number
    closed: number
  }
}>()
</script>

<template>
  <div class="stats-grid">
    <StatCard
      label="Total Periods"
      :value="stats.total"
      description="Company payroll periods created"
      :icon="CalendarRange"
      tone="blue"
    />

    <StatCard
      label="Draft Periods"
      :value="stats.draft"
      description="Periods being prepared"
      :icon="FileClock"
      tone="orange"
    />

    <StatCard
      label="Open Periods"
      :value="stats.open"
      description="Open payroll cutoff periods"
      :icon="CircleDot"
      tone="purple"
    />

    <StatCard
      label="Closed Periods"
      :value="stats.closed"
      description="Completed payroll periods"
      :icon="CircleCheck"
      tone="green"
    />
  </div>
</template>

<style scoped>
.stats-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:14px}
@media(max-width:1100px){.stats-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:600px){.stats-grid{grid-template-columns:1fr}}
</style>
