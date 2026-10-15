<script setup lang="ts">
import {
  CircleCheck,
  Timer,
  WalletCards,
  BadgeCheck,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    approvedRequests: number
    approvedHours: number
    readyForPayroll: number
    processed: number
  }
}>()
</script>

<template>
  <div class="stats-grid">

    <StatCard
      label="Approved OT Requests"
      :value="stats.approvedRequests"
      description="Approved overtime records"
      :icon="CircleCheck"
      tone="blue"
    />

    <StatCard
      label="Approved OT Hours"
      :value="`${stats.approvedHours} hrs`"
      description="Total approved overtime hours"
      :icon="Timer"
      tone="green"
    />

    <StatCard
      label="Ready for Payroll"
      :value="stats.readyForPayroll"
      description="Approved OT awaiting payroll"
      :icon="WalletCards"
      tone="orange"
    />

    <StatCard
      label="Processed"
      :value="stats.processed"
      description="OT already processed in payroll"
      :icon="BadgeCheck"
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