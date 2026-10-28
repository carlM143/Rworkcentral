
<script setup lang="ts">
import { RotateCcw, Search } from 'lucide-vue-next'

const search = defineModel<string>('search', { default: '' })
const status = defineModel<string>('status', { default: '' })

defineProps<{ statuses: string[] }>()

const emit = defineEmits<{ reset: [] }>()

const formatStatus = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1)
</script>

<template>
  <div class="filters-card">
    <div class="filter-row">
      <div class="search-field">
        <Search :size="16" />
        <input
          v-model="search"
          type="search"
          placeholder="Search leave name or code..."
        />
      </div>

      <select v-model="status" class="filter-select">
        <option value="">All Status</option>
        <option v-for="item in statuses" :key="item" :value="item">
          {{ formatStatus(item) }}
        </option>
      </select>

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
.filters-card{margin-bottom:14px;padding:10px;border:1px solid var(--border);border-radius:10px;background:var(--bg-card);box-shadow:var(--shadow)}
.filter-row{display:grid;grid-template-columns:minmax(250px,1fr) 190px auto;gap:8px}
.search-field{display:flex;align-items:center;gap:9px;height:40px;padding:0 12px;border:1px solid var(--border);border-radius:7px;background:var(--bg-card-soft);color:var(--text-muted)}
.search-field input{width:100%;height:100%;border:0;outline:0;background:transparent;color:var(--text-primary);font-family:inherit;font-size:11px}
.search-field input::placeholder{color:var(--text-muted)}
.filter-select{width:100%;height:40px;padding:0 12px;border:1px solid var(--border);border-radius:7px;outline:0;background:var(--bg-card-soft);color:var(--text-primary);font-family:inherit;font-size:11px;cursor:pointer}
.filter-select:focus,.search-field:focus-within{border-color:var(--primary)}
@media(max-width:800px){.filter-row{grid-template-columns:1fr 190px}}
@media(max-width:600px){.filter-row{grid-template-columns:1fr}}
</style>
