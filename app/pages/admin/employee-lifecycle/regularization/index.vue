
<script setup lang="ts">
import { computed, ref } from 'vue'
import { Download, UserCheck } from 'lucide-vue-next'

import RegularizationStats from '~/components/admin/employee-lifecycle/regularization/RegularizationStats.vue'
import RegularizationFilters from '~/components/admin/employee-lifecycle/regularization/RegularizationFilters.vue'
import RegularizationTable from '~/components/admin/employee-lifecycle/regularization/RegularizationTable.vue'
import RegularizationModal from '~/components/admin/employee-lifecycle/regularization/RegularizationModal.vue'

type ModalMode =
  | 'export'
  | 'process'
  | 'view'
  | 'status'
  | 'history'
  | null

type RegularizationRow = Record<string, any>

const {
  search,
  department,
  evaluationStatus,
  status,

  currentPage,

  filteredRecords,
  paginatedRecords,

  totalPages,
  showingFrom,
  showingTo,

  stats,

  departmentOptions,
  evaluationStatusOptions,
  statusOptions,

  resetFilters,
} = useRegularization()

// Modal state
const regularizationModal = ref<ModalMode>(null)
const selectedRegularization = ref<RegularizationRow | null>(null)

// Bridge between existing composable records and modal/table components.
const tableRecords = computed(
  () => paginatedRecords.value as unknown as RegularizationRow[]
)

const modalRecords = computed(
  () => filteredRecords.value as unknown as RegularizationRow[]
)

const openRegularizationModal = (
  mode: Exclude<ModalMode, null>,
  record?: RegularizationRow
) => {
  selectedRegularization.value = record ?? null
  regularizationModal.value = mode
}

const closeRegularizationModal = () => {
  regularizationModal.value = null
  selectedRegularization.value = null
}

// Header actions
const handleExport = () => {
  openRegularizationModal('export')
}

const handleProcess = () => {
  openRegularizationModal('process')
}

// Table actions
const handleView = (record: RegularizationRow) => {
  openRegularizationModal('view', record)
}

const handleStatus = (record: RegularizationRow) => {
  openRegularizationModal('status', record)
}

const handleHistory = (record: RegularizationRow) => {
  openRegularizationModal('history', record)
}
</script>

<template>
  <section class="regularization-page">

    <!-- PAGE HEADER -->
    <PageHeader
      title="Employee Regularization"
      description="Monitor probationary employees, HR recommendations and effective regularization dates."
    >
      <div class="header-actions">
        <AppButton
          variant="secondary"
          :icon="Download"
          @click="handleExport"
        >
          Export
        </AppButton>

        <AppButton
          :icon="UserCheck"
          @click="handleProcess"
        >
          Process Regularization
        </AppButton>
      </div>
    </PageHeader>

    <!-- STATISTICS -->
    <RegularizationStats :stats="stats" />

    <!-- FILTERS -->
    <RegularizationFilters
      v-model:search="search"
      v-model:department="department"
      v-model:evaluation-status="evaluationStatus"
      v-model:status="status"
      :departments="departmentOptions"
      :evaluation-statuses="evaluationStatusOptions"
      :statuses="statusOptions"
      @reset="resetFilters"
    />

    <!-- RECORDS TABLE -->
    <RegularizationTable
      :records="tableRecords"
      @view="handleView"
      @details="handleStatus"
      @history="handleHistory"
    />

    <!-- PAGINATION -->
    <div class="table-footer">
      <p>
        Showing

        <strong>{{ showingFrom }}–{{ showingTo }}</strong>

        of

        <strong>{{ filteredRecords.length }}</strong>

        regularization records
      </p>

      <AppPagination
        v-model="currentPage"
        :total-pages="totalPages"
      />
    </div>

    <!-- REGULARIZATION MODAL -->
    <RegularizationModal
      :open="regularizationModal !== null"
      :mode="regularizationModal ?? 'view'"
      :records="modalRecords"
      :selected="selectedRegularization"
      @close="closeRegularizationModal"
    />

  </section>
</template>

<style scoped>
.regularization-page {
  width: 100%;
  max-width: 1680px;
  margin: 0 auto;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 14px 3px 0;
}

.table-footer p {
  margin: 0;
  color: var(--text-muted);
  font-size: 11px;
}

.table-footer strong {
  color: var(--text-primary);
  font-weight: 650;
}

@media (max-width: 650px) {
  .header-actions {
    width: 100%;
    align-items: stretch;
    flex-direction: column;
  }

  .table-footer {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
