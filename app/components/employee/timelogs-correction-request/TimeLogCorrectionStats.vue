<!-- Summary cards for the employee's time log correction requests. -->
<script setup lang="ts">
import type { TimeLogCorrectionRecord } from '~/types/employee/timelogCorrectionRequest/timelogCorrectionRequest'

const props = defineProps<{ requests: TimeLogCorrectionRecord[] }>()

const countByStatus = (status: string) =>
  props.requests.filter(request => request.status.toLowerCase() === status).length

const stats = computed(() => [
  { label: 'Total Requests', value: props.requests.length, note: 'Recorded submissions' },
  { label: 'Pending', value: countByStatus('pending'), note: 'Awaiting HR review' },
  { label: 'Approved', value: countByStatus('approved'), note: 'Approved by HR' },
])
</script>

<template>
  <div class="stats-grid">
    <div v-for="stat in stats" :key="stat.label" class="stat-card">
      <span>{{ stat.label }}</span>
      <strong>{{ stat.value }}</strong>
      <small>{{ stat.note }}</small>
    </div>
  </div>
</template>

<style scoped>
.stats-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 13px; margin-bottom: 18px; }
.stat-card { display: flex; flex-direction: column; gap: 7px; min-height: 102px; padding: 18px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); box-shadow: var(--shadow); }
.stat-card span { color: var(--text-secondary); font-size: 11px; }
.stat-card strong { font-size: 27px; line-height: 1.2; }
.stat-card small { color: var(--text-muted); font-size: 10px; }
@media (max-width: 640px) {
  .stats-grid { gap: 8px; }
  .stat-card { min-width: 0; min-height: 90px; padding: 10px; }
  .stat-card strong { font-size: 22px; }
  .stat-card small { line-height: 1.4; overflow-wrap: anywhere; }
}
</style>
