
<script setup lang="ts">
import { CalendarDays, RotateCcw } from 'lucide-vue-next'

const search = defineModel<string>('search', { default: '' })
const fromDepartment = defineModel<string>('fromDepartment', { default: '' })
const toDepartment = defineModel<string>('toDepartment', { default: '' })
const status = defineModel<string>('status', { default: '' })
const dateFrom = defineModel<string>('dateFrom', { default: '' })
const dateTo = defineModel<string>('dateTo', { default: '' })

defineProps<{
  departments: string[]
  statuses: string[]
}>()

const emit = defineEmits<{ reset: [] }>()
</script>

<template>
  <div class="filters-card">
    <div class="filter-row">
      <AppInput
        v-model="search"
        searchable
        clearable
        placeholder="Search transfer number, employee or reason..."
      />

      <AppSelect
        v-model="fromDepartment"
        :options="departments"
        placeholder="From Department"
      />

      <AppSelect
        v-model="toDepartment"
        :options="departments"
        placeholder="To Department"
      />

      <AppSelect
        v-model="status"
        :options="statuses"
        placeholder="All Status"
      />
    </div>

    <div class="date-row">
      <label class="date-control">
        <CalendarDays :size="15" />
        <span>
          Effective Date From
          <input v-model="dateFrom" type="date">
        </span>
      </label>

      <label class="date-control">
        <CalendarDays :size="15" />
        <span>
          Effective Date To
          <input v-model="dateTo" type="date">
        </span>
      </label>

      <AppButton
        variant="secondary"
        :icon="RotateCcw"
        @click="emit('reset')"
      >
        Reset Filters
      </AppButton>
    </div>
  </div>
</template>

<style scoped>
.filters-card{margin-bottom:14px;padding:11px;border:1px solid var(--border);border-radius:10px;background:var(--bg-card);box-shadow:var(--shadow)}
.filter-row{display:grid;grid-template-columns:minmax(260px,1fr) 190px 190px 170px;gap:9px}
.date-row{display:flex;align-items:center;gap:9px;margin-top:10px;flex-wrap:wrap}
.date-control{display:flex;align-items:center;gap:9px;min-height:44px;width:220px;padding:6px 11px;border:1px solid var(--border);border-radius:8px;background:var(--bg-card-soft);color:var(--text-muted)}
.date-control span{display:block;flex:1;font-size:10px}
.date-control input{display:block;width:100%;margin-top:2px;border:0;outline:0;background:transparent;color:var(--text-primary);font:inherit;font-size:11px}
:deep(input),:deep(select),:deep(button){font-size:12px}
@media(max-width:1200px){.filter-row{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:650px){.filter-row{grid-template-columns:1fr}.date-row{align-items:stretch;flex-direction:column}.date-control{width:100%}}
</style>
