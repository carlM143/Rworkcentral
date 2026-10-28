<script setup lang="ts">
import { BriefcaseBusiness, CircleCheck, CircleOff, Building2 } from 'lucide-vue-next'

defineProps<{
  stats: {
    totalPositions: number
    activePositions: number
    inactivePositions: number
    departmentsUsed: number
  }
}>()
</script>

<template>
  <div class="stats-grid">
    <StatCard label="Total Positions" :value="stats.totalPositions" description="Configured job positions" :icon="BriefcaseBusiness" tone="blue" />
    <StatCard label="Active Positions" :value="stats.activePositions" description="Currently active positions" :icon="CircleCheck" tone="green" />
    <StatCard label="Inactive Positions" :value="stats.inactivePositions" description="Currently inactive positions" :icon="CircleOff" tone="orange" />
    <StatCard label="Departments Used" :value="stats.departmentsUsed" description="Departments represented in positions" :icon="Building2" tone="purple" />
  </div>
</template>

<style scoped>
.stats-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:14px}
@media(max-width:1100px){.stats-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:600px){.stats-grid{grid-template-columns:1fr}}
</style>