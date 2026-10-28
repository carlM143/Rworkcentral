
<script setup lang="ts">
import { Search, RotateCcw } from 'lucide-vue-next'
import type { LeaveBalanceOption } from '~/types/leaveBalance'

defineProps<{
  departments: LeaveBalanceOption[]
  statuses: LeaveBalanceOption[]
}>()

const search = defineModel<string>('search', { default: '' })
const department = defineModel<string>('department', { default: 'all' })
const status = defineModel<string>('status', { default: 'all' })

defineEmits<{ reset: [] }>()
</script>

<template>
  <div class="filter-bar">
    <div class="search-box">
      <Search :size="16" />
      <input
        v-model="search"
        type="text"
        placeholder="Search employee name, employee no. or leave type..."
      />
    </div>

    <select v-model="department" class="filter-select">
      <option
        v-for="option in departments"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>

    <select v-model="status" class="filter-select">
      <option
        v-for="option in statuses"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>

    <button type="button" class="reset-button" @click="$emit('reset')">
      <RotateCcw :size="14" />
      Reset Filters
    </button>
  </div>
</template>

<style scoped>
.filter-bar{display:flex;align-items:center;gap:8px;margin-bottom:15px;padding:10px;border:1px solid var(--border,#29364b);border-radius:11px;background:var(--bg-card,#141e2d)}
.search-box{display:flex;align-items:center;gap:10px;flex:1;min-width:200px;padding:0 12px;border:1px solid var(--border,#29364b);border-radius:8px;color:var(--text-muted,#94a3b8)}
.search-box input{width:100%;height:40px;border:0;outline:0;background:transparent;color:var(--text-primary,#fff);font-size:11px}
.search-box input::placeholder{color:var(--text-muted,#94a3b8)}
.filter-select,.reset-button{height:40px;border:1px solid var(--border,#29364b);border-radius:8px;background:var(--bg-card,#141e2d);color:var(--text-primary,#fff);font-size:11px}
.filter-select{min-width:170px;padding:0 12px}
.reset-button{display:flex;align-items:center;justify-content:center;gap:8px;padding:0 14px;white-space:nowrap;cursor:pointer}
.reset-button:hover{border-color:var(--primary,#2563eb)}
@media(max-width:950px){.filter-bar{flex-wrap:wrap}.search-box{flex-basis:100%}.filter-select{flex:1}}
@media(max-width:500px){.filter-select,.reset-button{width:100%}}
</style>
