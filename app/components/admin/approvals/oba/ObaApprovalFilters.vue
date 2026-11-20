<script setup lang="ts">
import { RotateCcw, Search } from 'lucide-vue-next'
import type { ObaRequestStatus } from '~/types/oba-request/obaRequest'

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'dept_head_approved', label: 'Dept. Head Approved' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
]

const search = defineModel<string>('search', { default: '' })
const status = defineModel<ObaRequestStatus | ''>('status', { default: '' })
const dateFrom = defineModel<string>('dateFrom', { default: '' })
const dateTo = defineModel<string>('dateTo', { default: '' })

defineEmits<{ reset: [] }>()
</script>

<template>
  <div class="filters-card">
    <label class="search-field">
      <Search :size="16" />
      <input v-model="search" type="search" placeholder="Search employee, destination or reason..." aria-label="Search OBA requests">
    </label>

    <select v-model="status" aria-label="Filter by status">
      <option value="">All statuses</option>
      <option v-for="option in statusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
    </select>

    <label class="date-field"><span>From</span><input v-model="dateFrom" type="date"></label>
    <label class="date-field"><span>To</span><input v-model="dateTo" type="date" :min="dateFrom || undefined"></label>

    <button type="button" class="reset-button" @click="$emit('reset')"><RotateCcw :size="14" /> Reset</button>
  </div>
</template>

<style scoped>
.filters-card { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 14px; padding: 12px; border: 1px solid var(--border); border-radius: 11px; background: var(--bg-card); box-shadow: var(--shadow); }
.search-field { display: flex; flex: 1 1 260px; align-items: center; gap: 8px; min-width: 0; padding: 0 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); color: var(--text-muted); }
.search-field input { width: 100%; min-width: 0; height: 38px; border: 0; outline: 0; background: transparent; color: var(--text-primary); font-size: 12px; }
select, .date-field input { height: 40px; padding: 0 10px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); color: var(--text-primary); font: inherit; font-size: 12px; }
.date-field { display: flex; align-items: center; gap: 7px; }
.date-field span { color: var(--text-secondary); font-size: 11px; }
.reset-button { display: inline-flex; align-items: center; gap: 6px; height: 40px; padding: 0 14px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card); color: var(--text-secondary); font-size: 12px; }
.reset-button:hover { color: var(--text-primary); background: var(--bg-card-soft); }
@media (max-width: 650px) { .filters-card > *, .date-field { width: 100%; } .date-field input { flex: 1; } }
</style>