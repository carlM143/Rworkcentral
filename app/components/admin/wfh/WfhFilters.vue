<script setup lang="ts">
import { RotateCcw, Search } from 'lucide-vue-next'

withDefaults(defineProps<{
  departments: string[]
  statusOptions: [string, string][]
  placeholder?: string
}>(), {
  placeholder: 'Search employee, request no. or reason...',
})

const search = defineModel<string>('search', { default: '' })
const department = defineModel<string>('department', { default: 'All' })
const status = defineModel<string>('status', { default: 'All' })

const reset = () => {
  search.value = ''
  department.value = 'All'
  status.value = 'All'
}
</script>

<template>
  <div class="wfh-filters">
    <label class="search">
      <Search :size="16" />
      <input v-model="search" type="search" :placeholder="placeholder" aria-label="Search">
    </label>

    <select v-model="department" aria-label="Department">
      <option value="All">All Departments</option>
      <option v-for="d in departments" :key="d" :value="d">{{ d }}</option>
    </select>

    <select v-model="status" aria-label="Status">
      <option value="All">All Status</option>
      <option v-for="[value, text] in statusOptions" :key="value" :value="value">{{ text }}</option>
    </select>

    <button type="button" class="reset" @click="reset">
      <RotateCcw :size="15" /> Reset
    </button>
  </div>
</template>

<style scoped>
.wfh-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  margin-bottom: 16px;
  padding: 13px;
  border: 1px solid var(--border, #29364d);
  border-radius: 12px;
  background: var(--bg-card, #131e30);
}

.search {
  display: flex;
  flex: 1;
  min-width: 220px;
  align-items: center;
  gap: 9px;
  padding: 0 12px;
  border: 1px solid var(--border, #29364d);
  border-radius: 8px;
  background: var(--bg-card-soft, #182438);
  color: var(--text-muted, #7c8da8);
}

.search input {
  width: 100%;
  min-height: 40px;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--text-primary, #f8fafc);
  font-family: inherit;
  font-size: 13px;
}

select,
.reset {
  min-height: 42px;
  padding: 0 12px;
  border: 1px solid var(--border, #29364d);
  border-radius: 8px;
  background: var(--bg-card-soft, #182438);
  color: var(--text-primary, #f8fafc);
  font-family: inherit;
  font-size: 13px;
}

select { min-width: 170px; }

.reset {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-weight: 600;
  cursor: pointer;
}

.search:focus-within,
select:focus-visible,
.reset:focus-visible {
  border-color: var(--primary, #327bff);
  outline: none;
}

@media (max-width: 650px) {
  select, .reset { flex: 1; }
}
</style>