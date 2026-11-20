<script setup lang="ts">
import { Briefcase, Clock3, ClipboardCheck, CheckCircle2 } from 'lucide-vue-next'
import type { ObaSummary } from '~/types/oba-request/obaRequest'

const props = defineProps<{ summary: ObaSummary }>()

const total = computed(() => Object.values(props.summary).reduce((sum, n) => sum + (n ?? 0), 0))

const cards = computed(() => [
  { label: 'Total Requests', value: total.value, note: 'All submissions', icon: Briefcase, tone: 'blue' },
  { label: 'Pending', value: props.summary.pending ?? 0, note: 'Awaiting department head', icon: Clock3, tone: 'orange' },
  { label: 'Dept. Head Approved', value: props.summary.dept_head_approved ?? 0, note: 'Awaiting final approval', icon: ClipboardCheck, tone: 'purple' },
  { label: 'Approved', value: props.summary.approved ?? 0, note: 'Fully approved', icon: CheckCircle2, tone: 'green' },
])
</script>

<template>
  <div class="stats-grid">
    <article v-for="card in cards" :key="card.label" class="stat-card">
      <span class="stat-icon" :class="card.tone"><component :is="card.icon" :size="19" /></span>
      <div>
        <p>{{ card.label }}</p>
        <strong>{{ card.value }}</strong>
        <small>{{ card.note }}</small>
      </div>
    </article>
  </div>
</template>

<style scoped>
.stats-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 13px; margin-bottom: 14px; }
.stat-card { display: flex; gap: 12px; padding: 17px; border: 1px solid var(--border); border-radius: 11px; background: var(--bg-card); box-shadow: var(--shadow); min-width: 0; }
.stat-icon { display: flex; width: 38px; height: 38px; flex-shrink: 0; align-items: center; justify-content: center; border-radius: 50%; }
.blue { background: var(--primary-soft); color: var(--primary); }
.orange { background: var(--orange-soft); color: var(--orange); }
.purple { background: var(--purple-soft); color: var(--purple); }
.green { background: var(--green-soft); color: var(--green); }
.stat-card p { margin: 0 0 6px; color: var(--text-secondary); font-size: 11px; }
.stat-card strong { display: block; color: var(--text-primary); font-size: 23px; line-height: 1.1; }
.stat-card small { display: block; margin-top: 6px; color: var(--text-muted); font-size: 10px; }
@media (max-width: 1000px) { .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 550px) { .stats-grid { gap: 8px; } .stat-card { padding: 12px; } }
</style>