<script setup lang="ts">
import {
  ClipboardCheck,
  Umbrella,
  TimerReset,
  Clock3,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    total: number
    leaves: number
    overtime: number
    undertime: number
  }
}>()
</script>

<template>
  <div class="approval-stats">

    <StatCard
      label="Total Pending"
      :value="stats.total"
      description="Requests requiring action"
      :icon="ClipboardCheck"
      tone="blue"
    />

    <StatCard
      label="Leave Requests"
      :value="stats.leaves"
      description="Pending leave approvals"
      :icon="Umbrella"
      tone="green"
    />

    <StatCard
      label="Overtime Requests"
      :value="stats.overtime"
      description="Pending OT approvals"
      :icon="TimerReset"
      tone="orange"
    />

    <StatCard
      label="Undertime Requests"
      :value="stats.undertime"
      description="Pending undertime approvals"
      :icon="Clock3"
      tone="purple"
    />

  </div>
</template>

<style scoped>
.approval-stats {
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 12px;

  margin-bottom: 14px;
}

@media (max-width: 1100px) {
  .approval-stats {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .approval-stats {
    grid-template-columns: 1fr;
  }
}
</style>