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

const industry =
  defineModel<string>(
    'industry',
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

const contractStatus =
  defineModel<string>(
    'contractStatus',
    {
      default: '',
    },
  )

defineProps<{
  industries: string[]
  statuses: string[]
  contractStatuses: string[]
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
        placeholder="Search client, code, contact or location..."
      />

      <AppSelect
        v-model="industry"
        :options="industries"
        placeholder="All Industries"
      />

      <AppSelect
        v-model="status"
        :options="statuses"
        placeholder="All Client Status"
      />

      <AppSelect
        v-model="contractStatus"
        :options="contractStatuses"
        placeholder="All Contract Status"
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

  padding: 10px;

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
    210px
    190px
    210px
    auto;

  gap: 8px;

  align-items: center;
}

@media (max-width: 1250px) {
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