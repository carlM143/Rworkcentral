<script setup lang="ts">
import {
  History,
  CircleCheck,
  CircleX,
  Timer,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    totalRecords: number
    approved: number
    rejectedOrCancelled: number
    approvedHours: number
  }
}>()
</script>

<template>
  <div class="stats-grid">

    <StatCard
      label="OT History Records"
      :value="stats.totalRecords"
      description="Finalized overtime records"
      :icon="History"
      tone="blue"
    />

    <StatCard
      label="Approved"
      :value="stats.approved"
      description="Approved historical OT requests"
      :icon="CircleCheck"
      tone="green"
    />

    <StatCard
      label="Rejected / Cancelled"
      :value="stats.rejectedOrCancelled"
      description="OT requests not processed"
      :icon="CircleX"
      tone="orange"
    />

    <StatCard
      label="Approved OT Hours"
      :value="`${stats.approvedHours} hrs`"
      description="Total approved historical hours"
      :icon="Timer"
      tone="purple"
    />

  </div>
</template>

<style scoped>
.stats-grid {
  display: grid;

  grid-template-columns:
    repeat(
      4,
      minmax(0, 1fr)
    );

  gap: 14px;

  margin-bottom: 14px;
}

@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );
  }
}

@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns:
      1fr;
  }
}
</style>