<script setup lang="ts">
import {
  CalendarDays,
  Users,
  Banknote,
  AlertTriangle,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    period: string
    employees: number
    grossPay: number
    issues: number
  }
}>()

const formatCurrency = (
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
  <div class="payroll-stats">

    <StatCard
      label="Current Payroll Period"
      :value="stats.period"
      description="Active payroll processing period"
      :icon="CalendarDays"
      tone="blue"
    />

    <StatCard
      label="Employees for Payroll"
      :value="stats.employees"
      description="Employees included in preview"
      :icon="Users"
      tone="green"
    />

    <StatCard
      label="Estimated Gross Pay"
      :value="formatCurrency(stats.grossPay)"
      description="Before deductions"
      :icon="Banknote"
      tone="purple"
    />

    <StatCard
      label="Pending Issues"
      :value="stats.issues"
      description="Requires payroll review"
      :icon="AlertTriangle"
      tone="orange"
    />

  </div>
</template>

<style scoped>
.payroll-stats {
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 12px;

  margin-bottom: 14px;
}

@media (max-width: 1150px) {
  .payroll-stats {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .payroll-stats {
    grid-template-columns: 1fr;
  }
}
</style>