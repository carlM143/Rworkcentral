
<script setup lang="ts">
import {
  Clock3,
  CheckCircle2,
  XCircle,
  CalendarDays,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    pending: number
    approved: number
    rejected: number
    this_month: number
  }
}>()
</script>

<template>
  <div class="correction-stats">
    <StatCard
      label="Pending Requests"
      :value="stats.pending"
      description="Waiting for review"
      :icon="Clock3"
      tone="orange"
    />

    <StatCard
      label="Approved"
      :value="stats.approved"
      description="Approved corrections"
      :icon="CheckCircle2"
      tone="green"
    />

    <StatCard
      label="Rejected"
      :value="stats.rejected"
      description="Rejected corrections"
      :icon="XCircle"
      tone="purple"
    />

    <StatCard
      label="Requests This Month"
      :value="stats.this_month"
      description="Filed during current month"
      :icon="CalendarDays"
      tone="blue"
    />
  </div>
</template>

<style scoped>
.correction-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

@media (max-width: 1100px) {
  .correction-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .correction-stats {
    grid-template-columns: 1fr;
  }
}
</style>
