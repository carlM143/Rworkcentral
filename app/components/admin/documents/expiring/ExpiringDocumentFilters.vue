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

const category =
  defineModel<string>(
    'category',
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

const expiryWindow =
  defineModel<string>(
    'expiryWindow',
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
  categories: string[]
  departments: string[]
  expiryWindows: string[]
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
        placeholder="Search employee, document name or document number..."
      />

      <AppSelect
        v-model="category"
        :options="categories"
        placeholder="All Categories"
      />

      <AppSelect
        v-model="department"
        :options="departments"
        placeholder="All Departments"
      />

      <AppSelect
        v-model="expiryWindow"
        :options="expiryWindows"
        placeholder="Expiry Window"
      />

      <AppSelect
        v-model="status"
        :options="statuses"
        placeholder="Expiry Status"
      />

      <AppButton
        variant="secondary"
        :icon="RotateCcw"
        @click="
          emit('reset')
        "
      >
        Reset
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
    minmax(300px, 1fr)
    205px
    205px
    175px
    165px
    auto;

  gap: 8px;
}

:deep(input),
:deep(select),
:deep(button) {
  font-size: 11px;
}

@media (max-width: 1300px) {
  .filters-grid {
    grid-template-columns:
      repeat(
        3,
        minmax(0, 1fr)
      );
  }
}

@media (max-width: 850px) {
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