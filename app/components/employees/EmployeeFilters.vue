<script setup lang="ts">
import {
  RotateCcw,
} from 'lucide-vue-next'

const search = defineModel<string>('search', {
  default: '',
})

const department = defineModel<string>(
  'department',
  {
    default: '',
  },
)

const position = defineModel<string>(
  'position',
  {
    default: '',
  },
)

const employmentType = defineModel<string>(
  'employmentType',
  {
    default: '',
  },
)

defineProps<{
  departments: string[]
  positions: string[]
}>()

const emit = defineEmits<{
  reset: []
}>()

const employmentTypes = [
  'Regular',
  'Probationary',
  'Contractual',
]
</script>

<template>
  <div class="filters-card">
    <div class="filter-search">
      <AppInput
        v-model="search"
        placeholder="Search employee, ID or email..."
        searchable
        clearable
      />
    </div>

    <div class="filter-control">
      <AppSelect
        v-model="department"
        :options="departments"
        placeholder="All Departments"
      />
    </div>

    <div class="filter-control">
      <AppSelect
        v-model="position"
        :options="positions"
        placeholder="All Positions"
      />
    </div>

    <div class="filter-control">
      <AppSelect
        v-model="employmentType"
        :options="employmentTypes"
        placeholder="Employment Type"
      />
    </div>

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
    minmax(150px, 0.7fr)
    minmax(150px, 0.7fr)
    minmax(150px, 0.7fr)
    auto;

  gap: 9px;

  margin-bottom: 14px;
  padding: 13px;

  border: 1px solid var(--border);
  border-radius: 11px;

  background: var(--bg-card);

  box-shadow: var(--shadow);
}

@media (max-width: 1150px) {
  .filters-card {
    grid-template-columns:
      repeat(2, 1fr);
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