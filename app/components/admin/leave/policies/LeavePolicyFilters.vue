
<script setup lang="ts">
import { Search, RotateCcw } from 'lucide-vue-next'
import type { LeaveTypeOption, EmploymentTypeOption } from '~/types/leavePolicy'

const search = defineModel<string>('search', { default: '' })
const status = defineModel<string>('status', { default: '' })
const leaveTypeId = defineModel<number>('leaveTypeId', { default: 0 })
const employmentTypeId = defineModel<number>('employmentTypeId', { default: 0 })

defineProps<{
  leaveTypes: LeaveTypeOption[]
  employmentTypes: EmploymentTypeOption[]
}>()

const emit = defineEmits<{ reset: [] }>()
</script>

<template>
  <div class="filters-card">
    <div class="filter-row">
      <div class="search-field">
        <Search :size="15" />
        <input v-model="search" type="search" placeholder="Search leave type or employment type..." />
      </div>

      <select v-model.number="leaveTypeId" class="filter-select">
        <option :value="0">All Leave Types</option>
        <option v-for="item in leaveTypes" :key="item.id" :value="item.id">
          {{ item.name }}
        </option>
      </select>

      <select v-model.number="employmentTypeId" class="filter-select">
        <option :value="0">All Employment Types</option>
        <option v-for="item in employmentTypes" :key="item.id" :value="item.id">
          {{ item.name }}
        </option>
      </select>

      <select v-model="status" class="filter-select">
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
      </select>

      <button type="button" class="reset-button" @click="emit('reset')">
        <RotateCcw :size="14" />
        Reset Filters
      </button>
    </div>
  </div>
</template>

<style scoped>
.filters-card{margin-bottom:14px;padding:10px;border:1px solid var(--border);border-radius:10px;background:var(--bg-card);box-shadow:var(--shadow)}
.filter-row{display:grid;grid-template-columns:minmax(240px,1fr) 180px 180px 135px auto;gap:8px}
.search-field{display:flex;align-items:center;gap:9px;height:40px;padding:0 12px;border:1px solid var(--border);border-radius:7px;background:var(--bg-card-soft);color:var(--text-muted)}
.search-field input{width:100%;height:100%;border:0;outline:0;background:transparent;color:var(--text-primary);font-family:inherit;font-size:11px}
.search-field input::placeholder{color:var(--text-muted)}
.filter-select{width:100%;height:40px;padding:0 9px;border:1px solid var(--border);border-radius:7px;outline:0;background:var(--bg-card-soft);color:var(--text-primary);font-family:inherit;font-size:10px;cursor:pointer}
.reset-button{display:inline-flex;align-items:center;justify-content:center;gap:7px;height:40px;padding:0 12px;border:1px solid var(--border);border-radius:7px;background:transparent;color:var(--text-secondary);font-family:inherit;font-size:10px;font-weight:600;white-space:nowrap;cursor:pointer}
.reset-button:hover{background:var(--bg-card-soft);color:var(--text-primary)}
.search-field:focus-within,.filter-select:focus{border-color:var(--primary)}
@media(max-width:1250px){.filter-row{grid-template-columns:minmax(200px,1fr) repeat(2,170px)}}
@media(max-width:750px){.filter-row{grid-template-columns:repeat(2,minmax(0,1fr))}.search-field{grid-column:1/-1}}
@media(max-width:500px){.filter-row{grid-template-columns:1fr}.search-field{grid-column:auto}}
</style>
