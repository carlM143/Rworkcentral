
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RefreshCw, Plus } from 'lucide-vue-next'

import LoanTypesTable from '~/components/admin/loans/loan-types/LoanTypesTable.vue'
import LoanTypesStats from '~/components/admin/loans/loan-types/LoanTypesStats.vue'
import LoanTypesFilters from '~/components/admin/loans/loan-types/LoanTypesFilters.vue'
import AddLoanTypeModal from '~/components/admin/loans/loan-types/AddLoanTypeModal.vue'
import DeleteLoanTypeModal from '~/components/admin/loans/loan-types/DeleteLoanTypeModal.vue'

import { useLoanTypes } from '~/composables/admin/loans/loan-types/useLoanTypes'

import type {
  CreateLoanTypePayload,
  LoanType,
} from '~/types/loans/loan-types/loanType'

definePageMeta({
  layout: 'admin',
})

const {
  filteredLoanTypes,
  loading,
  loadError,
  search,
  statusFilter,
  stats,
  getLoanTypes,
  createLoanType,
  updateLoanType,
  deleteLoanType,
  resetFilters,
} = useLoanTypes()

const showAddModal = ref(false)
const editingLoanType = ref<LoanType | null>(null)
const deletingLoanType = ref<LoanType | null>(null)
const saveBusy = ref(false)
const deleteBusy = ref(false)
const saveError = ref('')
const deleteError = ref('')

const getErrorMessage = (error: unknown, fallback: string) => {
  const problem = error as {
    data?: { message?: string; errors?: Record<string, string[]> }
    response?: { _data?: { message?: string; errors?: Record<string, string[]> } }
    message?: string
  }
  const data = problem.data ?? problem.response?._data
  const firstError = Object.values(data?.errors ?? {}).flat()[0]

  return String(firstError || data?.message || problem.message || fallback)
}

const openAddModal = () => {
  saveError.value = ''
  editingLoanType.value = null
  showAddModal.value = true
}

const openEditModal = (item: LoanType) => {
  saveError.value = ''
  editingLoanType.value = item
  showAddModal.value = true
}

const closeAddModal = () => {
  if (saveBusy.value) return

  showAddModal.value = false
  editingLoanType.value = null
  saveError.value = ''
}

const handleCreateLoanType = async (
  payload: CreateLoanTypePayload,
) => {
  if (saveBusy.value) return

  saveBusy.value = true
  saveError.value = ''

  try {
    if (editingLoanType.value) {
      await updateLoanType(editingLoanType.value.id, payload)
    } else {
      await createLoanType(payload)
    }

    showAddModal.value = false
    editingLoanType.value = null

    await getLoanTypes()
  } catch (error: unknown) {
    saveError.value = getErrorMessage(error, 'Unable to save loan type.')
  } finally {
    saveBusy.value = false
  }
}

const openDeleteModal = (item: LoanType) => {
  deleteError.value = ''
  deletingLoanType.value = item
}

const closeDeleteModal = () => {
  if (deleteBusy.value) return
  deletingLoanType.value = null
  deleteError.value = ''
}

const handleDeleteLoanType = async (item: LoanType) => {
  if (deleteBusy.value) return

  deleteBusy.value = true
  deleteError.value = ''

  try {
    await deleteLoanType(item.id)
    deletingLoanType.value = null
    await getLoanTypes()
  } catch (error: unknown) {
    deleteError.value = getErrorMessage(error, 'Unable to delete loan type.')
  } finally {
    deleteBusy.value = false
  }
}

onMounted(() => {
  void getLoanTypes()
})
</script>

<template>
  <section class="loan-types-page">

    <!-- PAGE HEADER -->
    <PageHeader
      title="Loan Types"
      description="Manage loan categories and providers."
    >
      <div class="header-actions">
        <AppButton
          variant="secondary"
          :icon="RefreshCw"
          :disabled="loading"
          @click="getLoanTypes"
        >
          Refresh
        </AppButton>

        <AppButton
          :icon="Plus"
          @click="openAddModal"
        >
          Add Loan Type
        </AppButton>
      </div>
    </PageHeader>

    <!-- STATISTICS -->
    <LoanTypesStats :stats="stats" />

    <!-- FILTERS -->
    <LoanTypesFilters
      v-model:search="search"
      v-model:status="statusFilter"
      @reset="resetFilters"
    />

    <!-- API ERROR -->
    <div
      v-if="loadError"
      class="api-error"
      role="alert"
    >
      {{ loadError }}
    </div>

    <!-- TABLE -->
    <LoanTypesTable
      v-if="!loadError"
      :loan-types="filteredLoanTypes"
      :loading="loading"
      :busy="saveBusy || deleteBusy"
      @edit="openEditModal"
      @delete="openDeleteModal"
    />

    <!-- RECORD COUNT -->
    <div
      v-if="!loading && !loadError"
      class="table-footer"
    >
      <p>
        Showing
        <strong>{{ filteredLoanTypes.length }}</strong>
        of
        <strong>{{ stats.total }}</strong>
        loan types
      </p>
    </div>

    <!-- ADD LOAN TYPE MODAL -->
    <AddLoanTypeModal
      :open="showAddModal"
      :busy="saveBusy"
      :error="saveError"
      :loan-type="editingLoanType"
      @close="closeAddModal"
      @submit="handleCreateLoanType"
    />

    <DeleteLoanTypeModal
      :open="Boolean(deletingLoanType)"
      :loan-type="deletingLoanType"
      :busy="deleteBusy"
      :error="deleteError"
      @close="closeDeleteModal"
      @confirm="handleDeleteLoanType"
    />

  </section>
</template>

<style scoped>
.loan-types-page {
  width: 100%;
  max-width: 1660px;
  min-width: 0;
  margin: 0 auto;
}

.header-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 3px 0;
}

.table-footer p {
  margin: 0;
  color: var(--text-muted);
  font-size: 12px;
}

.table-footer strong {
  color: var(--text-primary);
  font-weight: 600;
}

.api-error {
  margin-bottom: 14px;
  padding: 14px;
  border: 1px solid var(--red, #ef4444);
  border-radius: 10px;
  background: var(--bg-card);
  color: var(--red, #ef4444);
  font-size: 13px;
}

@media (max-width: 650px) {
  .header-actions {
    width: 100%;
  }
}
</style>
