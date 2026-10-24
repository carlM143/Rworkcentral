<script setup lang="ts">
import {
  Clock3,
  ClipboardCheck,
  BadgeDollarSign,
  WalletCards,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    pendingEmployees: number
    forReview: number
    grossPay: number
    netPay: number
  }
}>()

const money = (
  value: number,
) => {
  return new Intl.NumberFormat(
    'en-PH',
    {
      style: 'currency',
      currency: 'PHP',
      maximumFractionDigits: 0,
    },
  ).format(value)
}
</script>

<template>
  <div class="stats-grid">

    <StatCard
      label="Pending Employees"
      :value="stats.pendingEmployees"
      description="Employee payroll records in queue"
      :icon="Clock3"
      tone="orange"
    />

    <StatCard
      label="For Review"
      :value="stats.forReview"
      description="Payroll records awaiting review"
      :icon="ClipboardCheck"
      tone="purple"
    />

    <StatCard
      label="Total Gross Pay"
      :value="
        money(
          stats.grossPay,
        )
      "
      description="Combined pending employee gross pay"
      :icon="BadgeDollarSign"
      tone="blue"
    />

    <StatCard
      label="Estimated Net Pay"
      :value="
        money(
          stats.netPay,
        )
      "
      description="Estimated pay after deductions"
      :icon="WalletCards"
      tone="green"
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