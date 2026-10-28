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

const scope =
  defineModel<string>(
    'scope',
    {
      default: '',
    },
  )

const requirement =
  defineModel<string>(
    'requirement',
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
  scopes: string[]
  requirements: string[]
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
        placeholder="Search category code, name or description..."
      />

      <AppSelect
        v-model="scope"
        :options="scopes"
        placeholder="All Scope"
      />

      <AppSelect
        v-model="requirement"
        :options="requirements"
        placeholder="Required / Optional"
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
    190px
    195px
    165px
    auto;

  gap: 8px;
}

:deep(input),
:deep(select),
:deep(button) {
  font-size: 11px;
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