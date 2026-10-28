
<script setup lang="ts">
import { ListChecks, CircleCheck, CircleOff, ClipboardList } from 'lucide-vue-next'

defineProps<{
  stats: {
    total: number
    active: number
    inactive: number
    policies: number
  }
}>()
</script>

<template>
  <div class="stats-grid">
    <StatCard
      label="Total Leave Types"
      :value="stats.total"
      description="Configured leave categories"
      :icon="ListChecks"
      tone="blue"
    />

    <StatCard
      label="Active Leave Types"
      :value="stats.active"
      description="Currently available leave types"
      :icon="CircleCheck"
      tone="green"
    />

    <StatCard
      label="Inactive Leave Types"
      :value="stats.inactive"
      description="Unavailable leave categories"
      :icon="CircleOff"
      tone="orange"
    />

    <StatCard
      label="Leave Policies"
      :value="stats.policies"
      description="Policies assigned to leave types"
      :icon="ClipboardList"
      tone="purple"
    />
  </div>
</template>

<style scoped>
.stats-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:14px}
@media(max-width:1100px){.stats-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:600px){.stats-grid{grid-template-columns:1fr}}
</style>
