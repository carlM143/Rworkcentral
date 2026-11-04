
<script setup lang="ts">
import { RotateCcw } from 'lucide-vue-next'

defineProps<{
  loanTypeOptions: string[]
}>()

const search = defineModel<string>('search', {
  default: '',
})

const status = defineModel<string>('status', {
  default: '',
})

const loanType = defineModel<string>('loanType', {
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
  <div class="employee-loan-filters">

    <div class="search-filter">
      <AppInput
        v-model="search"
        searchable
        clearable
        placeholder="Search employee, ID, loan type or reference..."
      />
    </div>

    <div class="loan-type-filter">
      <AppSelect
        v-model="loanType"
        :options="loanTypeOptions"
        placeholder="All Loan Types"
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
.employee-loan-filters {
  display: grid;
  grid-template-columns:
    minmax(260px, 1fr)
    210px
    160px
    auto;
  gap: 8px;
  padding: 10px;
  margin-bottom: 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.employee-loan-filters > div {
  min-width: 0;
}

@media (max-width: 1100px) {
  .employee-loan-filters {
    grid-template-columns:
      minmax(220px, 1fr)
      190px;
  }
}

@media (max-width: 650px) {
  .employee-loan-filters {
    grid-template-columns: 1fr;
  }
}
</style>
