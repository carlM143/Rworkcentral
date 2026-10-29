<script setup lang="ts">
import { Plus, RotateCcw, BriefcaseBusiness, CheckCircle } from 'lucide-vue-next'
import EmploymentTypeModal from '~/components/admin/employmentTypes/EmploymentTypeModal.vue'
import EmploymentTypeTable from '~/components/admin/employmentTypes/EmploymentTypeTable.vue'
import EmploymentTypeDeleteModal from '~/components/admin/employmentTypes/EmploymentTypeDeleteModal.vue'
import type { EmploymentTypePayload, EmploymentTypeRecord } from '~/composables/admin/employmentTypes/useEmploymentTypeApi'

const {
  employmentTypes,
  loading,
  saving,
  errorMessage,
  search,
  filteredEmploymentTypes,
  stats,
  loadEmploymentTypes,
  createEmploymentType,
  updateEmploymentType,
  deleteEmploymentType,
} = useEmploymentTypes()

const { success, error: showError } = useToast()

const modalOpen = ref(false)
const selectedItem = ref<EmploymentTypeRecord | null>(null)

const deleteModalOpen = ref(false)
const itemToDelete = ref<EmploymentTypeRecord | null>(null)
const deleting = ref(false)

onMounted(async () => {
  try {
    await loadEmploymentTypes()
  } catch (err: any) {
    showError('Error', err?.message || 'Failed to load employment types.')
  }
})

const openAddModal = () => {
  selectedItem.value = null
  modalOpen.value = true
}

const openEditModal = (item: EmploymentTypeRecord) => {
  selectedItem.value = item
  modalOpen.value = true
}

const handleSave = async (data: EmploymentTypePayload, id?: number) => {
  try {
    let res
    if (id) {
      res = await updateEmploymentType(id, data)
      success('Employment Type Updated', res.message || 'Employment type updated successfully.')
    } else {
      res = await createEmploymentType(data)
      success('Employment Type Added', res.message || 'Employment type created successfully.')
    }
    modalOpen.value = false
  } catch (err: any) {
    const msg = err?.data?.message || err?.message || 'Could not save employment type.'
    showError('Operation Failed', msg)
  }
}

const promptDelete = (item: EmploymentTypeRecord) => {
  itemToDelete.value = item
  deleteModalOpen.value = true
}

const confirmDelete = async (item: EmploymentTypeRecord) => {
  deleting.value = true
  try {
    const res = await deleteEmploymentType(item.id)
    success('Employment Type Deleted', res.message || 'Employment type deleted successfully.')
    deleteModalOpen.value = false
    itemToDelete.value = null
  } catch (err: any) {
    const msg = err?.data?.message || err?.message || 'Could not delete employment type.'
    showError('Deletion Failed', msg)
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <section class="employment-types-page">
    <PageHeader
      title="Employment Types"
      description="Manage employee classifications, categories and appointment statuses."
    >
      <AppButton :icon="Plus" :disabled="loading || saving" @click="openAddModal">
        Add Employment Type
      </AppButton>
    </PageHeader>

    <div v-if="errorMessage" class="error-banner" role="alert">
      {{ errorMessage }}
    </div>

    <!-- STATS -->
    <div class="stats-grid">
      <div class="stat-card card">
        <div class="stat-icon blue"><BriefcaseBusiness :size="20" /></div>
        <div>
          <span>Total Employment Types</span>
          <strong>{{ stats.total }}</strong>
        </div>
      </div>
      <div class="stat-card card">
        <div class="stat-icon green"><CheckCircle :size="20" /></div>
        <div>
          <span>Active Status</span>
          <strong>{{ stats.active }}</strong>
        </div>
      </div>
    </div>

    <!-- FILTERS -->
    <div class="filter-bar card">
      <AppInput
        v-model="search"
        searchable
        clearable
        placeholder="Search employment types..."
      />
      <AppButton variant="secondary" :icon="RotateCcw" @click="search = ''">
        Reset
      </AppButton>
    </div>

    <p v-if="loading" class="loading-text" role="status">Loading employment types...</p>

    <!-- TABLE -->
    <EmploymentTypeTable
      v-if="!loading"
      :employment-types="filteredEmploymentTypes"
      @edit="openEditModal"
      @delete="promptDelete"
    />

    <!-- CREATE / EDIT MODAL -->
    <EmploymentTypeModal
      :open="modalOpen"
      :employment-type="selectedItem"
      :saving="saving"
      @close="modalOpen = false"
      @save="handleSave"
    />

    <!-- DELETE CONFIRMATION MODAL -->
    <EmploymentTypeDeleteModal
      :open="deleteModalOpen"
      :employment-type="itemToDelete"
      :deleting="deleting"
      @close="deleteModalOpen = false"
      @confirm="confirmDelete"
    />
  </section>
</template>

<style scoped>
.employment-types-page { width: 100%; max-width: 1660px; margin: 0 auto; }
.card { border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); box-shadow: var(--shadow); }
.error-banner { padding: 12px; margin-bottom: 14px; border: 1px solid var(--red); border-radius: 8px; background: color-mix(in srgb, var(--red) 10%, var(--bg-card)); color: var(--red); font-size: 11px; }
.stats-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin-bottom: 16px; }
.stat-card { display: flex; align-items: center; gap: 14px; padding: 16px 20px; }
.stat-icon { display: flex; width: 42px; height: 42px; align-items: center; justify-content: center; border-radius: 10px; flex-shrink: 0; }
.stat-icon.blue { background: var(--primary-soft); color: var(--primary); }
.stat-icon.green { background: var(--green-soft); color: var(--green); }
.stat-card span { display: block; color: var(--text-muted); font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
.stat-card strong { display: block; margin-top: 3px; color: var(--text-primary); font-size: 20px; font-weight: 750; }
.filter-bar { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 12px 16px; margin-bottom: 16px; }
.loading-text { text-align: center; padding: 30px; color: var(--text-muted); font-size: 11px; }
@media (max-width: 700px) { .stats-grid { grid-template-columns: 1fr; } }
</style>
