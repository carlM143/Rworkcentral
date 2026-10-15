<script setup lang="ts">
import {
  RotateCcw,
} from 'lucide-vue-next'

defineProps<{
  statusOptions: string[]
}>()

const search =
  defineModel<string>('search', {
    default: '',
  })

const status =
  defineModel<string>('status', {
    default: '',
  })

defineEmits<{
  reset: []
}>()
</script>

<template>
  <div class="department-filters">

    <div class="search-filter">
      <AppInput
        v-model="search"
        searchable
        clearable
        placeholder="Search department, code or department head..."
      />
    </div>

    <div class="status-filter">
      <AppSelect
        v-model="status"
        :options="statusOptions"
        placeholder="All Status"
      />
    </div>

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
.department-filters {
  display: grid;

  grid-template-columns:
    minmax(280px, 1fr)
    220px
    auto;

  gap: 8px;

  margin-bottom: 14px;
  padding: 10px;

  border: 1px solid var(--border);
  border-radius: 10px;

  background: var(--bg-card);

  box-shadow: var(--shadow);
}

@media (max-width: 800px) {
  .department-filters {
    grid-template-columns: 1fr;
  }
}
</style>