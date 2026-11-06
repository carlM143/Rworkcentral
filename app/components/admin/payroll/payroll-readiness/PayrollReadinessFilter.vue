<script setup lang="ts">
import { Search, RotateCcw } from 'lucide-vue-next'
import type { PayrollPeriod } from '~/types/payroll/payroll-periods/payrollPeriod'
import type { PayrollGroup } from '~/types/payroll/payroll-groups/payrollGroup'
import type { ReadinessStatus } from '~/types/payroll/payroll-readiness/payrollReadiness'

defineProps<{
  periods: PayrollPeriod[]
  groups: PayrollGroup[]
}>()

const period = defineModel<number | null>('period', { default: null })
const group = defineModel<number | null>('group', { default: null })
const status = defineModel<'' | ReadinessStatus>('status', { default: '' })
const search = defineModel<string>('search', { default: '' })

const emit = defineEmits<{ reset: [] }>()

const periodLabel = (p: PayrollPeriod) => {
  const name = p.period_name || p.label || `Payroll Period #${p.id}`
  return `${name} (${p.status})`
}
</script>

<template>
  <div class="filter-card">
    <div class="search">
      <Search :size="15" />
      <input
        v-model="search"
        type="search"
        placeholder="Search employee ID or name"
      >
    </div>

    <select v-model="period">
      <option :value="null" disabled>
        Select payroll period
      </option>
      <option
        v-for="p in periods"
        :key="p.id"
        :value="p.id"
      >
        {{ periodLabel(p) }}
      </option>
    </select>

    <select v-model="group">
      <option :value="null">
        All payroll groups
      </option>
      <option
        v-for="g in groups"
        :key="g.id"
        :value="g.id"
      >
        {{ g.group_name }}
      </option>
    </select>

    <select v-model="status">
      <option value="">
        All statuses
      </option>
      <option value="ready">
        Ready
      </option>
      <option value="warning">
        Warnings
      </option>
      <option value="blocked">
        Blocked
      </option>
    </select>

    <button
      type="button"
      class="reset"
      @click="emit('reset')"
    >
      <RotateCcw :size="14" />
      Reset
    </button>
  </div>
</template>

<style scoped>
.filter-card {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 14px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
}

.search,
select {
  padding: 9px 11px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft, transparent);
  color: var(--text-primary);
  font: inherit;
  font-size: 12px;
}

.search {
  display: flex;
  flex: 1 1 240px;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
}

.search input {
  flex: 1;
  min-width: 0;
  border: 0;
  background: transparent;
  color: var(--text-primary);
  font: inherit;
  outline: none;
}

select {
  flex: 0 1 220px;
}

.search:focus-within,
select:focus {
  border-color: var(--primary);
  outline: 2px solid var(--primary-soft);
}

.reset {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: transparent;
  color: var(--text-primary);
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
</style>