
<script setup lang="ts">
import {
  RefreshCw,
  RotateCcw,
  Search,
} from 'lucide-vue-next'

const search = defineModel<string>('search', {
  default: '',
})

const status = defineModel<string>('status', {
  default: 'pending',
})

defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  refresh: []
  reset: []
}>()

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved (Not Applied)' },
  { value: 'applied', label: 'Applied to Time Log' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: '', label: 'All Requests' },
]
</script>

<template>
  <div class="filters-card">

    <label class="search-control">
      <Search :size="16" />

      <input
        v-model="search"
        type="search"
        placeholder="Search employee or employee ID..."
        autocomplete="off"
        aria-label="Search correction requests"
      >
    </label>

    <label class="status-control">
      <span>Status</span>

      <select
        v-model="status"
        aria-label="Filter by correction status"
      >
        <option
          v-for="option in statusOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </label>

    <AppButton
      variant="secondary"
      :icon="RotateCcw"
      :disabled="loading"
      @click="emit('reset')"
    >
      Reset
    </AppButton>

    <AppButton
      variant="secondary"
      :icon="RefreshCw"
      :disabled="loading"
      @click="emit('refresh')"
    >
      Refresh
    </AppButton>

  </div>
</template>

<style scoped>
.filters-card {
  display: grid;
  grid-template-columns: minmax(240px, 1fr) 210px auto auto;
  align-items: end;
  gap: 9px;
  margin-bottom: 14px;
  padding: 11px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.search-control {
  display: flex;
  min-height: 40px;
  align-items: center;
  gap: 9px;
  padding: 0 11px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--bg-card-soft);
  color: var(--text-muted);
}

.search-control:focus-within,
.status-control select:focus {
  border-color: var(--primary);
}

.search-control input,
.status-control select {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--text-primary);
  font: inherit;
  font-size: 11px;
}

.search-control input::placeholder {
  color: var(--text-muted);
}

.status-control {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: var(--text-muted);
  font-size: 10px;
}

.status-control select {
  min-height: 40px;
  padding: 0 10px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--bg-card-soft);
  cursor: pointer;
}

.status-control option {
  background: var(--bg-card);
  color: var(--text-primary);
}

@media (max-width: 820px) {
  .filters-card {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 540px) {
  .filters-card {
    grid-template-columns: 1fr;
  }

  .filters-card > * {
    width: 100%;
  }
}
</style>
