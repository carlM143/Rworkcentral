<script setup lang="ts">
import {
  RotateCcw,
} from 'lucide-vue-next'

defineProps<{
  departments: string[]
  typeOptions: string[]
  priorityOptions: string[]
}>()

const search =
  defineModel<string>(
    'search',
    {
      default: '',
    },
  )

const type =
  defineModel<string>(
    'type',
    {
      default: '',
    },
  )

const department =
  defineModel<string>(
    'department',
    {
      default: '',
    },
  )

const priority =
  defineModel<string>(
    'priority',
    {
      default: '',
    },
  )

defineEmits<{
  reset: []
}>()
</script>

<template>
  <div class="approval-filters">

    <AppInput
      v-model="search"
      searchable
      clearable
      placeholder="Search employee, ID or reference..."
    />

    <AppSelect
      v-model="type"
      :options="typeOptions"
      placeholder="All Request Types"
    />

    <AppSelect
      v-model="department"
      :options="departments"
      placeholder="All Departments"
    />

    <AppSelect
      v-model="priority"
      :options="priorityOptions"
      placeholder="All Priority"
    />

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
.approval-filters {
  display: grid;

  grid-template-columns:
    minmax(260px, 1fr)
    200px
    190px
    160px
    auto;

  gap: 8px;

  margin-bottom: 14px;
  padding: 10px;

  border:
    1px solid var(--border);

  border-radius: 10px;

  background:
    var(--bg-card);

  box-shadow:
    var(--shadow);
}

@media (max-width: 1100px) {
  .approval-filters {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 650px) {
  .approval-filters {
    grid-template-columns: 1fr;
  }
}
</style>