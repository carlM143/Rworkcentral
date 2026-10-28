<script setup lang="ts">
import {
  UsersRound,
  UserRoundCheck,
  Building2,
  HeartPulse,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    employees: number
    employeeShare: number
    employerShare: number
    totalPremium: number
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
      maximumFractionDigits: 2,
    },
  ).format(value)
}
</script>

<template>
  <div class="stats-grid">

    <StatCard
      label="Employees"
      :value="stats.employees"
      description="Employees included in report"
      :icon="UsersRound"
      tone="blue"
    />

    <StatCard
      label="Employee Share"
      :value="money(stats.employeeShare)"
      description="Total employee premium share"
      :icon="UserRoundCheck"
      tone="purple"
    />

    <StatCard
      label="Employer Share"
      :value="money(stats.employerShare)"
      description="Total employer premium share"
      :icon="Building2"
      tone="orange"
    />

    <StatCard
      label="Total Premium"
      :value="money(stats.totalPremium)"
      description="Combined PhilHealth premium"
      :icon="HeartPulse"
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