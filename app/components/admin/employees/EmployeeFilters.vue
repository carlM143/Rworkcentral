
<script setup lang="ts">
import { RotateCcw } from 'lucide-vue-next'

defineProps<{
  departments: string[]
  positions: string[]
  employmentTypes: string[]
}>()

const search = defineModel<string>('search', {
  default: '',
})

const department = defineModel<string>('department', {
  default: '',
})

const position = defineModel<string>('position', {
  default: '',
})

const employmentType = defineModel<string>('employmentType', {
  default: '',
})

const status = defineModel<string>('status', {
  default: '',
})

const emit = defineEmits<{
  reset: []
}>()

const statusOptions = [
  'Active',
  'Inactive',
]
</script>

<template>
  <div class="filters-card">

    <!-- SEARCH -->
    <div class="filter-search">
      <AppInput
        v-model="search"
        placeholder="Search employee, ID or email..."
        searchable
        clearable
      />
    </div>

    <!-- DEPARTMENT FROM DATABASE -->
    <div class="filter-control">
      <AppSelect
        v-model="department"
        :options="departments"
        placeholder="All Departments"
      />
    </div>

    <!-- POSITION FROM DATABASE -->
    <div class="filter-control">
      <AppSelect
        v-model="position"
        :options="positions"
        placeholder="All Positions"
      />
    </div>

    <!-- EMPLOYMENT TYPE FROM DATABASE -->
    <div class="filter-control">
      <AppSelect
        v-model="employmentType"
        :options="employmentTypes"
        placeholder="All Employment Types"
      />
    </div>

    <!-- STATUS -->
    <div class="filter-control">
      <AppSelect
        v-model="status"
        :options="statusOptions"
        placeholder="All Status"
      />
    </div>

    <!-- RESET -->
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
.filters-card {
  display: grid;

  grid-template-columns:
    minmax(260px, 1.5fr)
    repeat(4, minmax(140px, 0.7fr))
    auto;

  gap: 9px;

  margin-bottom: 14px;
  padding: 13px;

  border: 1px solid var(--border);
  border-radius: 11px;

  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.filter-search,
.filter-control {
  min-width: 0;
}

@media (max-width: 1350px) {
  .filters-card {
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
  }

  .filter-search {
    grid-column: span 3;
  }
}

@media (max-width: 800px) {
  .filters-card {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .filter-search {
    grid-column: span 2;
  }
}

@media (max-width: 650px) {
  .filters-card {
    grid-template-columns: 1fr;
  }

  .filter-search {
    grid-column: auto;
  }
}
</style>
