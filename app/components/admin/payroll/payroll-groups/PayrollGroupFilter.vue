<script setup lang="ts">
import { RotateCcw } from 'lucide-vue-next'

const search = defineModel<string>('search', {
  default: '',
})

const status = defineModel<string>('status', {
  default: '',
})

const emit = defineEmits<{
  reset: []
}>()
</script>

<template>
  <div class="filter-card">
    <AppInput
      v-model="search"
      searchable
      clearable
      placeholder="Search payroll group..."
    />

    <AppSelect
      v-model="status"
      :options="['Active', 'Inactive']"
      placeholder="All Statuses"
    />

    <AppButton
      variant="secondary"
      :icon="RotateCcw"
      @click="emit('reset')"
    >
      Reset Filters
    </AppButton>
  </div>
</template>

<style scoped>
.filter-card {
  display: grid;
  grid-template-columns: minmax(250px, 1fr) 190px auto;
  align-items: center;
  gap: 9px;
  margin-bottom: 14px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

@media (max-width: 700px) {
  .filter-card {
    grid-template-columns: 1fr;
  }
}
</style>