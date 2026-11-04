<script setup lang="ts">
import { RotateCcw } from 'lucide-vue-next'

const search = defineModel<string>('search', { default: '' })
const status = defineModel<string>('status', { default: '' })
const adjustmentType = defineModel<string>('adjustmentType', { default: '' })
const dateFrom = defineModel<string>('dateFrom', { default: '' })
const dateTo = defineModel<string>('dateTo', { default: '' })

const emit = defineEmits<{ reset: [] }>()

const statusOptions = ['Pending', 'Approved', 'Rejected', 'Applied', 'Cancelled']
const typeOptions = ['Increase', 'Decrease', 'Correction']
</script>

<template>
  <div class="adjustment-filters">
    <div class="search-field">
      <AppInput v-model="search" searchable clearable placeholder="Search employee, ID or salary type..." />
    </div>

    <div class="select-field">
      <AppSelect v-model="status" :options="statusOptions" placeholder="All Status" />
    </div>

    <div class="select-field">
      <AppSelect v-model="adjustmentType" :options="typeOptions" placeholder="All Types" />
    </div>

    <label class="date-field">
      <span>Effective From</span>
      <input v-model="dateFrom" type="date" aria-label="Effective from" />
    </label>

    <label class="date-field">
      <span>Effective To</span>
      <input v-model="dateTo" type="date" aria-label="Effective to" :min="dateFrom || undefined" />
    </label>

    <AppButton variant="secondary" :icon="RotateCcw" @click="emit('reset')">Reset</AppButton>
  </div>
</template>

<style scoped>
.adjustment-filters {
  display: grid;
  grid-template-columns: minmax(230px, 1.5fr) minmax(140px, .65fr) minmax(140px, .65fr) minmax(155px, .7fr) minmax(155px, .7fr) auto;
  align-items: end;
  gap: 9px;
  margin-bottom: 14px;
  padding: 12px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 11px;
  box-shadow: var(--shadow);
}
.search-field, .select-field, .date-field { min-width: 0; }
.date-field { display: flex; flex-direction: column; gap: 5px; }
.date-field span { color: var(--text-muted); font-size: 10px; }
.date-field input {
  width: 100%; height: 38px; min-width: 0; padding: 0 10px;
  border: 1px solid var(--border); border-radius: 8px;
  background: var(--bg-card-soft); color: var(--text-primary); font-size: 12px;
  color-scheme: dark;
}
@media (max-width: 1100px) {
  .adjustment-filters { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .search-field { grid-column: span 3; }
}
@media (max-width: 850px) {
  .adjustment-filters { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .search-field { grid-column: span 2; }
  .date-field { grid-row: auto; }
}
@media (max-width: 560px) {
  .adjustment-filters { grid-template-columns: 1fr; }
  .search-field { grid-column: auto; }
}
</style>