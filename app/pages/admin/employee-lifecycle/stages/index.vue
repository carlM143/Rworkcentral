<script setup lang="ts">
import {
  Plus,
  Download,
  RotateCcw,
  Layers,
  CheckCircle2,
  XCircle,
  Clock,
  Edit2,
  Trash2,
  X,
  FileSpreadsheet,
} from 'lucide-vue-next'
import StatCard from '~/components/shared/StatCard.vue'
import AppButton from '~/components/ui/AppButton.vue'
import AppInput from '~/components/ui/AppInput.vue'
import AppSelect from '~/components/ui/AppSelect.vue'
import AppPagination from '~/components/ui/AppPagination.vue'
import type { LifecycleStage } from '~/types/lifecycleErd'

definePageMeta({
  layout: 'admin',
})

const { policies, stages, loading, errorMessage, load, saveStage, toggleStageStatus, deleteStage } = useLifecycleConfiguration()

const search = ref('')
const selectedPolicyName = ref('')
const selectedStatus = ref('')
const currentPage = ref(1)
const perPage = ref(6)

const isModalOpen = ref(false)
const editingStage = ref<Partial<LifecycleStage> | null>(null)
const stageToDelete = ref<LifecycleStage | null>(null)
const deleting = ref(false)

const confirmDeleteStage = async () => {
  if (!stageToDelete.value || deleting.value) return
  deleting.value = true
  try {
    if (await deleteStage(stageToDelete.value.id)) {
      stageToDelete.value = null
    }
  } finally {
    deleting.value = false
  }
}

const policyOptions = computed(() => policies.value.map(p => p.name))
const statusOptions = ['Active', 'Inactive']

const stats = computed(() => {
  const total = stages.value.length
  const active = stages.value.filter(s => s.status).length
  const inactive = total - active
  const avgMonths = total ? (stages.value.reduce((acc, s) => acc + s.monthsAfterHire, 0) / total).toFixed(1) : '0'
  return { total, active, inactive, avgMonths: `${avgMonths} mo` }
})

const filteredStages = computed(() => {
  return stages.value.filter(s => {
    const keyword = search.value.trim().toLowerCase()
    const matchesSearch =
      !keyword ||
      s.stageName.toLowerCase().includes(keyword) ||
      s.stageCode.toLowerCase().includes(keyword) ||
      s.policyName.toLowerCase().includes(keyword)

    const matchesPolicy =
      !selectedPolicyName.value ||
      s.policyName === selectedPolicyName.value

    const matchesStatus =
      !selectedStatus.value ||
      (selectedStatus.value === 'Active' && s.status) ||
      (selectedStatus.value === 'Inactive' && !s.status)

    return matchesSearch && matchesPolicy && matchesStatus
  }).slice().sort((a, b) => {
    const policyCmp = a.policyName.localeCompare(b.policyName)
    if (policyCmp !== 0) return policyCmp
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder
    return a.id - b.id
  })
})

const isNewPolicyGroup = (stage: LifecycleStage, idx: number) => {
  return idx === 0 || paginatedStages.value[idx - 1]?.policyName !== stage.policyName
}

const totalPages = computed(() => Math.max(1, Math.ceil(filteredStages.value.length / perPage.value)))

const paginatedStages = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredStages.value.slice(start, start + perPage.value)
})

const showingFrom = computed(() => (filteredStages.value.length ? (currentPage.value - 1) * perPage.value + 1 : 0))
const showingTo = computed(() => Math.min(currentPage.value * perPage.value, filteredStages.value.length))

const resetFilters = () => {
  search.value = ''
  selectedPolicyName.value = ''
  selectedStatus.value = ''
  currentPage.value = 1
}

watch([search, selectedPolicyName, selectedStatus], () => {
  currentPage.value = 1
})

const openAddModal = () => {
  editingStage.value = {
    lifecyclePolicyId: policies.value[0]?.id || 1,
    stageName: '',
    stageCode: '',
    requiresAttachment: true,
    monthsAfterHire: 1,
    sortOrder: stages.value.length + 1,
    status: true,
  }
  isModalOpen.value = true
}

const openEditModal = (stage: LifecycleStage) => {
  editingStage.value = { ...stage }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  editingStage.value = null
}

const handleSave = async () => {
  if (!editingStage.value?.stageName?.trim() || !editingStage.value?.stageCode?.trim()) return
  if (await saveStage(editingStage.value)) closeModal()
}

const handleExport = () => {
  const headers = ['ID', 'Stage Name', 'Stage Code', 'Policy', 'Months After Hire', 'Sort Order', 'Status']
  const rows = filteredStages.value.map(s => [
    s.id,
    s.stageName,
    s.stageCode,
    s.policyName,
    s.monthsAfterHire,
    s.sortOrder,
    s.status ? 'Active' : 'Inactive',
  ])
  const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\r\n')
  const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `lifecycle-stages-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <section class="lifecycle-page">
    <p v-if="loading" role="status">Loading lifecycle stages…</p>
    <p v-if="errorMessage" role="alert">{{ errorMessage }} <button type="button" @click="load">Retry</button></p>
    <!-- PAGE HEADER -->
    <PageHeader
      title="Lifecycle Stages"
      description="Configure progression milestones, stage codes, and timeline triggers (months after hire) linked to lifecycle policies based on the system ERD."
    >
      <div class="header-actions">
        <AppButton variant="secondary" :icon="Download" @click="handleExport">
          Export
        </AppButton>
        <AppButton variant="primary" :icon="Plus" @click="openAddModal">
          Add Stage
        </AppButton>
      </div>
    </PageHeader>

    <!-- STATS GRID -->
    <div class="stats-grid">
      <StatCard
        label="Total Stages"
        :value="stats.total"
        description="Defined progression milestones"
        :icon="Layers"
        tone="blue"
      />
      <StatCard
        label="Active Stages"
        :value="stats.active"
        description="Enabled stage definitions"
        :icon="CheckCircle2"
        tone="green"
      />
      <StatCard
        label="Avg. Timeline Trigger"
        :value="stats.avgMonths"
        description="Average months from hire"
        :icon="Clock"
        tone="orange"
      />
      <StatCard
        label="Inactive Stages"
        :value="stats.inactive"
        description="Disabled milestone stages"
        :icon="XCircle"
        tone="purple"
      />
    </div>

    <!-- FILTERS CARD -->
    <div class="filters-card">
      <div class="filters-grid">
        <AppInput
          v-model="search"
          searchable
          placeholder="Search stage name, code, or policy..."
        />

        <AppSelect
          v-model="selectedPolicyName"
          :options="policyOptions"
          placeholder="All Lifecycle Policies"
        />

        <AppSelect
          v-model="selectedStatus"
          :options="statusOptions"
          placeholder="All Status"
        />

        <AppButton
          variant="secondary"
          :icon="RotateCcw"
          @click="resetFilters"
        >
          Reset
        </AppButton>
      </div>
    </div>

    <!-- TABLE CARD -->
    <article class="table-card">
      <div class="table-heading">
        <div>
          <h3>Lifecycle Stages</h3>
          <p>Monitor stage definitions, progression sequences, and elapsed hire timelines.</p>
        </div>
        <span class="record-count">
          {{ filteredStages.length }}
          {{ filteredStages.length === 1 ? 'Record' : 'Records' }}
        </span>
      </div>

      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Stage Name & Code</th>
              <th>Associated Policy</th>
              <th>Trigger (Months After Hire)</th>
              <th>Sequence Order</th>
              <th>Status</th>
              <th class="actions-heading">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="paginatedStages.length === 0">
              <td colspan="6">
                <div class="empty-state">
                  <div class="empty-icon">
                    <Layers :size="24" />
                  </div>
                  <strong>No lifecycle stages found</strong>
                  <span>Try adjusting your search criteria or filters.</span>
                </div>
              </td>
            </tr>
            <template v-for="(stage, idx) in paginatedStages" :key="stage.id">
              <tr v-if="isNewPolicyGroup(stage, idx)" class="policy-group-row">
                <td colspan="6">
                  <div class="policy-group-header">
                    <Layers :size="14" />
                    <span>{{ stage.policyName }}</span>
                  </div>
                </td>
              </tr>
              <tr>
              <td>
                <div class="stage-info">
                  <strong class="stage-title">{{ stage.stageName }}</strong>
                  <span class="stage-code-pill">{{ stage.stageCode }}</span>
                </div>
              </td>
              <td>
                <span class="policy-pill">{{ stage.policyName }}</span>
              </td>
              <td>
                <div class="timeline-cell">
                  <Clock :size="14" />
                  <span>{{ stage.monthsAfterHire }} {{ stage.monthsAfterHire === 1 ? 'Month' : 'Months' }}</span>
                </div>
              </td>
              <td>
                <span class="order-badge">#{{ stage.sortOrder }}</span>
              </td>
              <td>
                <button
                  type="button"
                  class="status-badge cursor-pointer"
                  :class="stage.status ? 'completed' : 'on-hold'"
                  @click="toggleStageStatus(stage.id)"
                  title="Click to toggle status"
                >
                  <span class="status-dot" />
                  {{ stage.status ? 'Active' : 'Inactive' }}
                </button>
              </td>
              <td class="actions-cell">
                <div class="actions-group">
                  <button
                    type="button"
                    class="action-icon-btn edit"
                    title="Edit Stage"
                    @click="openEditModal(stage)"
                  >
                    <Edit2 :size="15" />
                  </button>
                  <button
                    type="button"
                    class="action-icon-btn delete"
                    title="Delete Stage"
                    @click="stageToDelete = stage"
                  >
                    <Trash2 :size="15" />
                  </button>
                </div>
              </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- PAGINATION -->
      <div class="table-footer">
        <p>
          Showing
          <strong>{{ showingFrom }}–{{ showingTo }}</strong>
          of
          <strong>{{ filteredStages.length }}</strong>
          stages
        </p>
        <AppPagination
          v-model="currentPage"
          :total-pages="totalPages"
        />
      </div>
    </article>

    <!-- ADD/EDIT MODAL -->
    <Teleport to="body">
      <div
        v-if="isModalOpen"
        class="modal-overlay"
        @click.self="closeModal"
      >
        <section
          class="modal-dialog"
          role="dialog"
          aria-modal="true"
        >
          <!-- MODAL HEADER -->
          <header class="dialog-header">
            <div class="dialog-header-left">
              <span class="header-icon">
                <Layers :size="20" />
              </span>
              <div>
                <h2>{{ editingStage?.id ? 'Edit Lifecycle Stage' : 'Add Lifecycle Stage' }}</h2>
                <p>Configure stage rules and trigger months based on ERD</p>
              </div>
            </div>
            <button
              type="button"
              class="close-icon"
              aria-label="Close"
              @click="closeModal"
            >
              <X :size="19" />
            </button>
          </header>

          <!-- MODAL BODY -->
          <div class="dialog-body" v-if="editingStage">
            <div class="form-group">
              <label class="form-label">Lifecycle Policy *</label>
              <select v-model="editingStage.lifecyclePolicyId" class="form-select">
                <option v-for="p in policies" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Stage Name *</label>
              <input
                v-model="editingStage.stageName"
                type="text"
                placeholder="e.g. 3rd Month Mid-Probationary Evaluation"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Stage Code (Unique Identifier) *</label>
              <input
                v-model="editingStage.stageCode"
                type="text"
                placeholder="e.g. M3_EVAL"
                class="form-input uppercase-text"
              />
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label">Months After Hire *</label>
                <input
                  v-model.number="editingStage.monthsAfterHire"
                  type="number"
                  min="0"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Sort Sequence *</label>
                <input
                  v-model.number="editingStage.sortOrder"
                  type="number"
                  min="1"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-group-checkbox">
              <label class="checkbox-label">
                <input v-model="editingStage.requiresAttachment" type="checkbox" class="styled-checkbox" />
                <span>Requires attachment to complete milestone</span>
              </label>
            </div>
            <div class="form-group-checkbox">
              <label class="checkbox-label">
                <input
                  v-model="editingStage.status"
                  type="checkbox"
                  class="styled-checkbox"
                />
                <span>Active Stage Status</span>
              </label>
            </div>
          </div>

          <!-- MODAL FOOTER -->
          <footer class="dialog-footer">
            <AppButton variant="secondary" @click="closeModal">Cancel</AppButton>
            <AppButton variant="primary" @click="handleSave">Save Stage</AppButton>
          </footer>
        </section>
      </div>
    </Teleport>

    <!-- DELETE CONFIRMATION MODAL -->
    <Teleport to="body">
      <div
        v-if="stageToDelete"
        class="modal-overlay"
        @click.self="!deleting && (stageToDelete = null)"
      >
        <section class="modal-dialog modal-dialog-sm" role="dialog" aria-modal="true">
          <header class="dialog-header">
            <div class="dialog-header-left">
              <span class="header-icon danger">
                <Trash2 :size="20" />
              </span>
              <div>
                <h2>Delete Lifecycle Stage</h2>
                <p>{{ stageToDelete.stageName }}</p>
              </div>
            </div>
            <button type="button" class="close-icon" aria-label="Close" :disabled="deleting" @click="stageToDelete = null">
              <X :size="19" />
            </button>
          </header>
          <div class="dialog-body">
            <p class="confirm-text">
              Are you sure you want to delete <strong>{{ stageToDelete.stageName }}</strong> ({{ stageToDelete.stageCode }})? Stages with existing employee milestones cannot be deleted and should be deactivated instead.
            </p>
          </div>
          <footer class="dialog-footer">
            <AppButton variant="secondary" :disabled="deleting" @click="stageToDelete = null">Cancel</AppButton>
            <AppButton variant="danger" :disabled="deleting" @click="confirmDeleteStage">
              {{ deleting ? 'Deleting…' : 'Delete Stage' }}
            </AppButton>
          </footer>
        </section>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.policy-group-row td {
  padding: 8px 16px;
  background: rgba(59, 130, 246, 0.06);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

.policy-group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 700;
  color: var(--primary);
  letter-spacing: 0.02em;
}

.modal-dialog-sm {
  max-width: 460px;
}

.header-icon.danger {
  background: rgba(239, 68, 68, 0.14);
  color: #f87171;
}

.confirm-text {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--text-secondary);
}

.lifecycle-page {
  width: 100%;
  max-width: 1680px;
  margin: 0 auto;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* STATS */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 14px;
}

@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

/* FILTERS */
.filters-card {
  margin-bottom: 14px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.filters-grid {
  display: grid;
  grid-template-columns: minmax(320px, 1fr) 220px 180px auto;
  gap: 9px;
}

@media (max-width: 1150px) {
  .filters-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 650px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }
}

/* TABLE CARD */
.table-card {
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.table-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 17px;
  border-bottom: 1px solid var(--border-soft);
}

.table-heading h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 700;
}

.table-heading p {
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: 11px;
}

.record-count {
  flex-shrink: 0;
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 650;
}

.table-scroll {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 960px;
  border-collapse: collapse;
}

th {
  padding: 13px 14px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 700;
  text-align: left;
  text-transform: uppercase;
  white-space: nowrap;
}

td {
  padding: 13px 14px;
  border-top: 1px solid var(--border-soft);
  color: var(--text-secondary);
  font-size: 10.5px;
  vertical-align: middle;
}

tbody tr {
  transition: background 0.15s ease;
}

tbody tr:hover {
  background: var(--bg-card-soft);
}

.stage-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 220px;
}

.stage-title {
  color: var(--text-primary);
  font-size: 11.5px;
  font-weight: 700;
}

.stage-code-pill {
  display: inline-block;
  align-self: flex-start;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 9.5px;
  font-family: monospace;
  font-weight: 650;
}

.policy-pill {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  background: var(--purple-soft);
  color: var(--purple);
  font-size: 10px;
  font-weight: 650;
  white-space: nowrap;
}

.timeline-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--text-primary);
  font-size: 10.5px;
  font-weight: 600;
  white-space: nowrap;
}

.timeline-cell svg {
  color: var(--text-muted);
}

.order-badge {
  display: inline-block;
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 700;
}

/* STATUS BADGE */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 9px;
  font-weight: 700;
  white-space: nowrap;
  border: none;
  background: transparent;
}

.status-dot {
  width: 5px;
  height: 5px;
  flex-shrink: 0;
  border-radius: 50%;
  background: currentColor;
}

.status-badge.completed {
  background: var(--green-soft);
  color: var(--green);
}

.status-badge.on-hold {
  background: var(--red-soft);
  color: var(--red);
}

/* ACTIONS */
.actions-heading {
  text-align: center;
}

.actions-cell {
  width: 80px;
  text-align: center;
}

.actions-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.action-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-icon-btn:hover.edit {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-soft);
}

.action-icon-btn:hover.delete {
  border-color: var(--red);
  color: var(--red);
  background: var(--red-soft);
}

/* EMPTY STATE */
.empty-state {
  display: flex;
  min-height: 220px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 25px;
  text-align: center;
}

.empty-icon {
  display: flex;
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: var(--primary-soft);
  color: var(--primary);
}

.empty-state strong {
  color: var(--text-primary);
  font-size: 13px;
}

.empty-state span {
  color: var(--text-muted);
  font-size: 11px;
}

/* TABLE FOOTER */
.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 14px 17px;
  border-top: 1px solid var(--border-soft);
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

/* MODAL / DIALOG */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 10050;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(3, 9, 23, 0.78);
  backdrop-filter: blur(5px);
}

.modal-dialog {
  display: flex;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--bg-card);
  color: var(--text-primary);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.3);
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid var(--border-soft);
  background: var(--bg-card);
}

.dialog-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  display: flex;
  width: 38px;
  height: 38px;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: var(--primary-soft);
  color: var(--primary);
}

.dialog-header h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 700;
}

.dialog-header p {
  margin: 3px 0 0;
  color: var(--text-muted);
  font-size: 10.5px;
}

.close-icon {
  display: flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.close-icon:hover {
  background: var(--red-soft);
  color: var(--red);
  border-color: var(--red);
}

.dialog-body {
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-row-2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.form-label {
  color: var(--text-secondary);
  font-size: 10.5px;
  font-weight: 600;
}

.form-input,
.form-select {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font-size: 11.5px;
  outline: none;
  transition: border-color 0.15s ease;
}

.form-input:focus,
.form-select:focus {
  border-color: var(--primary);
}

.uppercase-text {
  text-transform: uppercase;
}

.form-group-checkbox {
  padding-top: 4px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 500;
}

.styled-checkbox {
  width: 15px;
  height: 15px;
  accent-color: var(--primary);
  cursor: pointer;
}

.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 14px 20px;
  border-top: 1px solid var(--border-soft);
  background: var(--bg-card-soft);
}
</style>
