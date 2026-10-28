<script setup lang="ts">
import { RotateCcw, Search } from 'lucide-vue-next'

const search = defineModel<string>('search', { default: '' })
const status = defineModel<string>('status', { default: '' })
const dateFrom = defineModel<string>('dateFrom', { default: '' })
const dateTo = defineModel<string>('dateTo', { default: '' })

defineProps<{ statuses: string[] }>()
const emit = defineEmits<{ reset: [] }>()
</script>

<template>
  <div class="filters-card">
    <div class="search-field">
      <Search :size="16" />
      <input v-model="search" type="search" placeholder="Search request number or employee..." aria-label="Search undertime requests" />
    </div>

    <select v-model="status" aria-label="Filter undertime requests by status">
      <option value="">All Status</option>
      <option v-for="item in statuses" :key="item" :value="item">{{ item }}</option>
    </select>

    <input v-model="dateFrom" type="date" aria-label="Undertime date from" />
    <input v-model="dateTo" type="date" aria-label="Undertime date to" />

    <button type="button" class="reset-button" @click="emit('reset')">
      <RotateCcw :size="14" />
      Reset
    </button>
  </div>
</template>

<style scoped>
.filters-card{display:grid;grid-template-columns:minmax(250px,1fr) 180px 155px 155px auto;gap:8px;margin-bottom:14px;padding:10px;border:1px solid var(--border);border-radius:10px;background:var(--bg-card);box-shadow:var(--shadow)}
.search-field{display:flex;align-items:center;gap:9px;min-width:0;height:40px;padding:0 11px;border:1px solid var(--border);border-radius:7px;background:var(--bg-card-soft);color:var(--text-muted)}
.search-field:focus-within{border-color:var(--primary)}
.search-field input{width:100%;min-width:0;height:100%;padding:0;border:0;outline:0;background:transparent;color:var(--text-primary);font:inherit;font-size:10px}
select,.filters-card>input{height:40px;padding:0 11px;border:1px solid var(--border);border-radius:7px;outline:0;background:var(--bg-card-soft);color:var(--text-primary);font:inherit;font-size:10px}
select:focus,.filters-card>input:focus{border-color:var(--primary)}
.reset-button{display:flex;align-items:center;justify-content:center;gap:7px;padding:0 13px;border:1px solid var(--border);border-radius:7px;background:var(--bg-card-soft);color:var(--text-secondary);font:inherit;font-size:10px;font-weight:600;cursor:pointer}
.reset-button:hover{border-color:var(--primary);color:var(--text-primary)}
@media(max-width:950px){.filters-card{grid-template-columns:1fr 1fr}}
@media(max-width:600px){.filters-card{grid-template-columns:1fr}}
</style>
