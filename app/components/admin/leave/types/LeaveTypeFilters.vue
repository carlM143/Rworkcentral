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

const payStatus =
  defineModel<string>(
    'payStatus',
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
  payStatuses: string[]
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
        placeholder="Search leave code, leave type or description..."
      />

      <AppSelect
        v-model="category"
        :options="categories"
        placeholder="All Categories"
      />

      <AppSelect
        v-model="payStatus"
        :options="payStatuses"
        placeholder="Paid / Unpaid"
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
    minmax(300px, 1fr)
    210px
    170px
    160px
    auto;

  gap: 8px;
}

@media (max-width: 1100px) {
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