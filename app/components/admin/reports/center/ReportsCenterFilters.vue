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

const availability =
  defineModel<string>(
    'availability',
    {
      default: '',
    },
  )

defineProps<{
  categories: string[]
  availabilities: string[]
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
        placeholder="Search report title, code or description..."
      />

      <AppSelect
        v-model="category"
        :options="categories"
        placeholder="All Categories"
      />

      <AppSelect
        v-model="availability"
        :options="availabilities"
        placeholder="Availability"
      />

      <AppButton
        variant="secondary"
        :icon="RotateCcw"
        @click="emit('reset')"
      >
        Reset
      </AppButton>

    </div>

  </div>
</template>

<style scoped>
.filters-card {
  margin-bottom: 14px;

  padding: 12px;

  border:
    1px solid var(--border);

  border-radius: 11px;

  background:
    var(--bg-card);

  box-shadow:
    var(--shadow);
}

.filters-grid {
  display: grid;

  grid-template-columns:
    minmax(320px, 1fr)
    220px
    190px
    auto;

  gap: 9px;
}

:deep(input),
:deep(select),
:deep(button) {
  font-size: 11px;
}

@media (max-width: 1000px) {
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