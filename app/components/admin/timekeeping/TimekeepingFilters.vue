<script setup lang="ts">
import {
  RotateCcw,
} from 'lucide-vue-next'

defineProps<{
  departments: string[]
  statusOptions: string[]
}>()

const search =
  defineModel<string>('search', {
    default: '',
  })

const department =
  defineModel<string>('department', {
    default: '',
  })

const status =
  defineModel<string>('status', {
    default: '',
  })

const date =
  defineModel<string>('date', {
    default: '',
  })

defineEmits<{
  reset: []
}>()
</script>

<template>
  <div class="timekeeping-filters">

    <!-- SEARCH -->
    <AppInput
      v-model="search"
      searchable
      clearable
      placeholder="Search employee or employee ID..."
    />

    <!-- DEPARTMENT -->
    <AppSelect
      v-model="department"
      :options="departments"
      placeholder="All Departments"
    />

    <!-- STATUS -->
    <AppSelect
      v-model="status"
      :options="statusOptions"
      placeholder="All Status"
    />

    <!-- DATE -->
    <input
      v-model="date"
      type="date"
      class="date-filter"
    >

    <!-- RESET -->
    <AppButton
      variant="secondary"
      :icon="RotateCcw"
      @click="$emit('reset')"
    >
      Reset
    </AppButton>

  </div>
</template>

<style scoped>
.timekeeping-filters {
  display: grid;

  grid-template-columns:
    minmax(260px, 1fr)
    210px
    180px
    170px
    auto;

  gap: 8px;

  margin-bottom: 14px;
  padding: 10px;

  border: 1px solid var(--border);
  border-radius: 10px;

  background: var(--bg-card);

  box-shadow: var(--shadow);
}

.date-filter {
  width: 100%;
  height: 40px;

  padding: 0 11px;

  border: 1px solid var(--border);
  border-radius: 8px;

  outline: none;

  background: var(--bg-card);
  color: var(--text-primary);

  font-size: 12px;
}

.date-filter:focus {
  border-color: var(--primary);

  box-shadow:
    0 0 0 3px
    rgba(36, 107, 253, 0.08);
}

@media (max-width: 1150px) {
  .timekeeping-filters {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 650px) {
  .timekeeping-filters {
    grid-template-columns: 1fr;
  }
}
</style>