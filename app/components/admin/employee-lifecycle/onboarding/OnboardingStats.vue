<script setup lang="ts">
import {
  UserPlus,
  LoaderCircle,
  ClipboardCheck,
  CircleCheck,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    total: number
    active: number
    forCompletion: number
    completed: number
    averageProgress: number
  }
}>()
</script>

<template>
  <div class="stats-grid">

    <StatCard
      label="Onboarding Employees"
      :value="stats.total"
      description="Employees currently tracked"
      :icon="UserPlus"
      tone="blue"
    />

    <StatCard
      label="In Progress"
      :value="stats.active"
      description="Active onboarding processes"
      :icon="LoaderCircle"
      tone="orange"
    />

    <StatCard
      label="For Completion"
      :value="stats.forCompletion"
      description="Almost ready to complete"
      :icon="ClipboardCheck"
      tone="purple"
    />

    <StatCard
      label="Completed"
      :value="stats.completed"
      description="Finished onboarding records"
      :icon="CircleCheck"
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