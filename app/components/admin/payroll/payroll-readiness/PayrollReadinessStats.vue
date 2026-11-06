<script setup lang="ts">
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  UserX,
} from 'lucide-vue-next'
import type { ReadinessStats } from '~/types/payroll/payroll-readiness/payrollReadiness'

const props = defineProps<{ stats: ReadinessStats }>()

const cards = computed(() => [
  { label: 'Included Employees', value: props.stats.included, hint: 'In a payroll group this cutoff', icon: Users, tone: 'blue' },
  { label: 'Ready', value: props.stats.ready, hint: 'No issues found', icon: CheckCircle2, tone: 'green' },
  { label: 'Warnings', value: props.stats.warning, hint: 'Review before generating', icon: AlertTriangle, tone: 'orange' },
  { label: 'Blocked', value: props.stats.blocked, hint: 'Must be fixed first', icon: XCircle, tone: 'red' },
  { label: 'Unassigned', value: props.stats.unassigned, hint: 'Active, but no payroll group', icon: UserX, tone: 'red' },
])
</script>

<template>
  <div class="stats-grid">
    <div
      v-for="card in cards"
      :key="card.label"
      class="stat"
    >
      <div
        class="icon"
        :class="`tone-${card.tone}`"
      >
        <component
          :is="card.icon"
          :size="18"
        />
      </div>
      <div>
        <span class="label">{{ card.label }}</span>
        <strong>{{ card.value }}</strong>
        <small>{{ card.hint }}</small>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
}

.icon {
  display: grid;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 9px;
}

.tone-blue { background: rgb(59 130 246 / 14%); color: #60a5fa; }
.tone-green { background: rgb(34 197 94 / 14%); color: #22c55e; }
.tone-orange { background: rgb(251 146 60 / 14%); color: #fb923c; }
.tone-red { background: rgb(248 113 113 / 14%); color: #f87171; }

.label,
strong,
small {
  display: block;
}

.label {
  color: var(--text-secondary);
  font-size: 11px;
}

strong {
  margin: 2px 0;
  color: var(--text-primary);
  font-size: 22px;
}

small {
  color: var(--text-muted);
  font-size: 10px;
}

@media (max-width: 1200px) {
  .stats-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

@media (max-width: 700px) {
  .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>