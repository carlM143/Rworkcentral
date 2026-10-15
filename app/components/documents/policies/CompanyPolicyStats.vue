<script setup lang="ts">
import {
  BookOpenText,
  CircleCheck,
  FilePenLine,
  UserCheck,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    totalPolicies: number
    published: number
    drafts: number
    pendingAcknowledgments: number
  }
}>()
</script>

<template>
  <div class="stats-grid">

    <StatCard
      label="Company Policies"
      :value="stats.totalPolicies"
      description="Policies currently on record"
      :icon="BookOpenText"
      tone="blue"
    />

    <StatCard
      label="Published"
      :value="stats.published"
      description="Active published policies"
      :icon="CircleCheck"
      tone="green"
    />

    <StatCard
      label="Draft Policies"
      :value="stats.drafts"
      description="Policies still being prepared"
      :icon="FilePenLine"
      tone="orange"
    />

    <StatCard
      label="Pending Acknowledgments"
      :value="stats.pendingAcknowledgments"
      description="Employee acknowledgments outstanding"
      :icon="UserCheck"
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