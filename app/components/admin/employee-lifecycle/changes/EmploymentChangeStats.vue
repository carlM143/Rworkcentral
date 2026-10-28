<script setup lang="ts">
import {
  FilePenLine,
  Clock3,
  ClipboardCheck,
  CircleCheck,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    total: number
    pending: number
    approved: number
    effective: number
  }
}>()
</script>

<template>
  <div class="stats-grid">

    <StatCard
      label="Employment Changes"
      :value="stats.total"
      description="Employee change records"
      :icon="FilePenLine"
      tone="blue"
    />

    <StatCard
      label="For Review / Approval"
      :value="stats.pending"
      description="Changes requiring action"
      :icon="Clock3"
      tone="orange"
    />

    <StatCard
      label="Approved / Scheduled"
      :value="stats.approved"
      description="Changes ready for implementation"
      :icon="ClipboardCheck"
      tone="purple"
    />

    <StatCard
      label="Effective Changes"
      :value="stats.effective"
      description="Changes already implemented"
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