
<script setup lang="ts">
import { RotateCcw } from 'lucide-vue-next'

defineProps<{
  departments: string[]
  salaryTypes: string[]
}>()

const search = defineModel<string>('search', { default: '' })
const department = defineModel<string>('department', { default: '' })
const salaryType = defineModel<string>('salaryType', { default: '' })
const status = defineModel<string>('status', { default: '' })

const emit = defineEmits<{
  reset: []
}>()

const statusOptions = ['Active', 'Inactive']
</script>

<template>
  <div class="rate-filters">
    <div class="search-filter">
      <AppInput
        v-model="search"
        searchable
        clearable
        placeholder="Search employee, employee ID or salary type..."
      />
    </div>

    <AppSelect
      v-model="salaryType"
      :options="salaryTypes"
      placeholder="All Salary Types"
    />

    <AppSelect
      v-model="department"
      :options="departments"
      placeholder="All Departments"
    />

    <AppSelect
      v-model="status"
      :options="statusOptions"
      placeholder="All Status"
    />

    <AppButton
      variant="secondary"
      :icon="RotateCcw"
      @click="emit('reset')"
    >
      Reset
    </AppButton>
  </div>
</template>

<style scoped>
.rate-filters {
  display: grid;
  grid-template-columns:
    minmax(250px, 1fr)
    minmax(150px, 190px)
    minmax(150px, 190px)
    minmax(140px, 170px)
    auto;
  gap: 9px;
  align-items: center;
  margin-bottom: 14px;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--bg-card);
}

.search-filter {
  min-width: 0;
}

@media (max-width: 1100px) {
  .rate-filters {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .search-filter {
    grid-column: span 2;
  }
}

@media (max-width: 600px) {
  .rate-filters {
    grid-template-columns: 1fr;
  }

  .search-filter {
    grid-column: auto;
  }
}
</style>
