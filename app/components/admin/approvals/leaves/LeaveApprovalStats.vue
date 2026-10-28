
<script setup lang="ts">
import { ClipboardList, Clock3, CircleCheck, CircleX } from 'lucide-vue-next'
import type { LeaveApprovalStats } from '~/types/leaveApproval'

defineProps<{ stats: LeaveApprovalStats }>()
</script>

<template>
  <div class="stats-grid">
    <StatCard
      label="Total Requests"
      :value="stats.total"
      description="All submitted leave requests"
      :icon="ClipboardList"
      tone="blue"
    />

    <StatCard
      label="Pending Approval"
      :value="stats.pending"
      description="Requests awaiting HR review"
      :icon="Clock3"
      tone="orange"
    />

    <StatCard
      label="Approved Requests"
      :value="stats.approved"
      description="Approved leave applications"
      :icon="CircleCheck"
      tone="green"
    />

    <StatCard
      label="Rejected Requests"
      :value="stats.rejected"
      description="Rejected leave applications"
      :icon="CircleX"
      tone="purple"
    />
  </div>
</template>

<style scoped>
.stats-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:14px}
@media(max-width:1100px){.stats-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:600px){.stats-grid{grid-template-columns:1fr}}
</style>
