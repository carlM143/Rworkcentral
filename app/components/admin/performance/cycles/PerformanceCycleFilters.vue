<script setup lang="ts">
import {
  RotateCcw,
} from 'lucide-vue-next'

const search =
  defineModel<string>(
    'search',
    {
      default: '',
    },
  )

const cycleType =
  defineModel<string>(
    'cycleType',
    {
      default: '',
    },
  )

const evaluationYear =
  defineModel<string>(
    'evaluationYear',
    {
      default: '',
    },
  )

const status =
  defineModel<string>(
    'status',
    {
      default: '',
    },
  )

defineProps<{
  cycleTypes: string[]
  years: string[]
  statuses: string[]
}>()

const emit =
  defineEmits<{
    reset: []
  }>()
</script>

<template>
  <div class="filters-card">

    <div class="filters-grid">

      <AppInput
        v-model="search"
        searchable
        clearable
        placeholder="Search cycle code, name or remarks..."
      />

      <AppSelect
        v-model="cycleType"
        :options="cycleTypes"
        placeholder="All Cycle Types"
      />

      <AppSelect
        v-model="evaluationYear"
        :options="years"
        placeholder="Evaluation Year"
      />

      <AppSelect
        v-model="status"
        :options="statuses"
        placeholder="All Status"
      />

      <AppButton
        variant="secondary"
        :icon="RotateCcw"
        @click="
          emit('reset')
        "
      >
        Reset Filters
      </AppButton>

    </div>

  </div>
</template>

<style scoped>
.filters-card {
  margin-bottom: 14px;

  padding: 11px;

  border:
    1px solid var(--border);

  border-radius: 10px;

  background:
    var(--bg-card);

  box-shadow:
    var(--shadow);
}

.filters-grid {
  display: grid;

  grid-template-columns:
    minmax(320px, 1fr)
    230px
    180px
    170px
    auto;

  gap: 8px;
}

:deep(input),
:deep(select),
:deep(button) {
  font-size: 11px;
}

@media (max-width: 1150px) {
  .filters-grid {
    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );
  }
}

@media (max-width: 650px) {
  .filters-grid {
    grid-template-columns:
      1fr;
  }
}
</style>