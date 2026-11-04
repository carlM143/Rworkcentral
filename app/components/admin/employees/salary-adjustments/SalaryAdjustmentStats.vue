<script setup lang="ts">
import { Wallet, Clock3, BadgeCheck, CheckCircle2 } from 'lucide-vue-next'
import type { SalaryAdjustmentStats } from '~/types/salaryAdjustments/salaryAdjustment'

defineProps<{ stats: SalaryAdjustmentStats }>()
</script>

<template>
  <div class="adjustment-stats">
    <StatCard label="Total Adjustments" :value="stats.total" description="All salary adjustment records" :icon="Wallet" tone="blue" />
    <StatCard label="Pending Review" :value="stats.pending" description="Awaiting approval" :icon="Clock3" tone="orange" />
    <StatCard label="Approved" :value="stats.approved" description="Waiting for manual application" :icon="BadgeCheck" tone="purple" />
    <StatCard label="Applied" :value="stats.applied" description="Salary setup successfully updated" :icon="CheckCircle2" tone="green" />
  </div>
</template>

<style scoped>
.adjustment-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 14px; }
@media (max-width: 1100px) { .adjustment-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 600px) { .adjustment-stats { grid-template-columns: 1fr; } }
</style>