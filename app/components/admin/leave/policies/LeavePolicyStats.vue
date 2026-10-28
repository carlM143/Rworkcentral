
<script setup lang="ts">
import { ClipboardList, CircleCheck, Clock3, Wallet } from 'lucide-vue-next'

defineProps<{
  stats: {
    total: number
    approved: number
    pending: number
    paid: number
  }
}>()
</script>

<template>
  <div class="stats-grid">
    <StatCard label="Total Policies" :value="stats.total" description="Configured leave policies" :icon="ClipboardList" tone="blue" />
    <StatCard label="Approved Policies" :value="stats.approved" description="Policies marked as approved" :icon="CircleCheck" tone="green" />
    <StatCard label="Pending Policies" :value="stats.pending" description="Policies awaiting approval" :icon="Clock3" tone="orange" />
    <StatCard label="Paid Policies" :value="stats.paid" description="Policies configured as paid" :icon="Wallet" tone="purple" />
  </div>
</template>

<style scoped>
.stats-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:14px}
@media(max-width:1100px){.stats-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:600px){.stats-grid{grid-template-columns:1fr}}
</style>
