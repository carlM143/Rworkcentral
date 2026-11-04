
<script setup lang="ts">
import { RotateCcw } from 'lucide-vue-next'

const search = defineModel<string>('search', {
  default: '',
})

const status = defineModel<string>('status', {
  default: '',
})

const statusOptions = [
  'Active',
  'Inactive',
]

defineEmits<{
  reset: []
}>()
</script>

<template>
  <div class="loan-types-filters">

    <!-- SEARCH -->
    <div class="search-filter">
      <AppInput
        v-model="search"
        searchable
        clearable
        placeholder="Search loan name, code or provider..."
      />
    </div>

    <!-- STATUS FILTER -->
    <div class="status-filter">
      <AppSelect
        v-model="status"
        :options="statusOptions"
        placeholder="All Status"
      />
    </div>

    <!-- RESET BUTTON -->
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
.loan-types-filters {
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
  .loan-types-filters {
    grid-template-columns: 1fr;
  }
}
</style>
