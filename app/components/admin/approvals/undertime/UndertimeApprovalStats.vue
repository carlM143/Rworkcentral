<script setup lang="ts">
import { CheckCircle2, Clock3, ListChecks, TimerReset } from 'lucide-vue-next'

defineProps<{
  stats: {
    total: number
    pending: number
    approved: number
    minutes: number
  }
}>()
</script>

<template>
  <div class="stats-grid">
    <StatCard label="Total Requests" :value="stats.total" description="All submitted undertime requests" :icon="ListChecks" tone="blue" />
    <StatCard label="Pending Approval" :value="stats.pending" description="Requests awaiting review" :icon="Clock3" tone="orange" />
    <StatCard label="Approved Requests" :value="stats.approved" description="Approved undertime requests" :icon="CheckCircle2" tone="green" />
    <StatCard label="Approved Minutes" :value="stats.minutes" description="Total approved undertime" :icon="TimerReset" tone="purple" />
  </div>
</template>

<style scoped>
.stats-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:14px}
@media(max-width:1100px){.stats-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:600px){.stats-grid{grid-template-columns:1fr}}
</style>
