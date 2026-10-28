
<script setup lang="ts">
import { Search, RotateCcw } from 'lucide-vue-next'

const search = defineModel<string>('search', { default: '' })
const status = defineModel<string>('status', { default: 'pending' })

const emit = defineEmits<{ reset: [] }>()
</script>

<template>
  <div class="filters-card">
    <div class="search-field">
      <Search :size="16" />
      <input
        v-model="search"
        type="search"
        placeholder="Search request number, employee ID or leave type..."
        aria-label="Search leave requests"
      />
    </div>

    <select v-model="status" aria-label="Filter leave requests by status">
      <option value="pending">Pending Approval</option>
      <option value="approved">Approved</option>
      <option value="rejected">Rejected</option>
      <option value="cancelled">Cancelled</option>
      <option value="">All Status</option>
    </select>

    <button type="button" class="reset-button" @click="emit('reset')">
      <RotateCcw :size="14" />
      Reset
    </button>
  </div>
</template>

<style scoped>
.filters-card{display:grid;grid-template-columns:minmax(250px,1fr) 185px auto;gap:8px;margin-bottom:14px;padding:10px;border:1px solid var(--border);border-radius:10px;background:var(--bg-card);box-shadow:var(--shadow)}
.search-field{display:flex;align-items:center;gap:9px;min-width:0;height:40px;padding:0 11px;border:1px solid var(--border);border-radius:7px;background:var(--bg-card-soft);color:var(--text-muted)}
.search-field:focus-within{border-color:var(--primary)}
.search-field input{width:100%;min-width:0;height:100%;border:0;outline:0;background:transparent;color:var(--text-primary);font-family:inherit;font-size:10px}
.search-field input::placeholder{color:var(--text-muted)}
select{height:40px;padding:0 11px;border:1px solid var(--border);border-radius:7px;outline:0;background:var(--bg-card-soft);color:var(--text-primary);font-family:inherit;font-size:10px}
select:focus{border-color:var(--primary)}
.reset-button{display:flex;align-items:center;justify-content:center;gap:7px;padding:0 13px;border:1px solid var(--border);border-radius:7px;background:var(--bg-card-soft);color:var(--text-secondary);font-family:inherit;font-size:10px;font-weight:600;cursor:pointer}
.reset-button:hover{color:var(--text-primary);border-color:var(--primary)}
@media(max-width:700px){.filters-card{grid-template-columns:1fr}}
</style>
