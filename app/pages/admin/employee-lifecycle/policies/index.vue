<script setup lang="ts">
import {
  Plus,
  Download,
  RotateCcw,
  FileText,
  CheckCircle2,
  XCircle,
  Layers,
  Edit2,
  Trash2,
  X,
} from 'lucide-vue-next'
import StatCard from '~/components/shared/StatCard.vue'
import AppButton from '~/components/ui/AppButton.vue'
import AppInput from '~/components/ui/AppInput.vue'
import AppSelect from '~/components/ui/AppSelect.vue'
import AppPagination from '~/components/ui/AppPagination.vue'
import type { LifecyclePolicy } from '~/types/lifecycleErd'

definePageMeta({
  layout: 'admin',
})

const { policies, employmentTypes: typeRecords, loading, errorMessage, load, savePolicy, togglePolicyStatus, deletePolicy } = useLifecycleConfiguration()

const search = ref('')
const selectedEmploymentType = ref('')
const selectedStatus = ref('')
const currentPage = ref(1)
const perPage = ref(6)

const isModalOpen = ref(false)
const editingPolicy = ref<Partial<LifecyclePolicy> | null>(null)
const policyToDelete = ref<LifecyclePolicy | null>(null)
const deleting = ref(false)

const confirmDeletePolicy = async () => {
  if (!policyToDelete.value || deleting.value) return
  deleting.value = true
  try {
    if (await deletePolicy(policyToDelete.value.id)) {
      policyToDelete.value = null
    }
  } finally {
    deleting.value = false
  }
}

const employmentTypes = computed(() => ['All Types', ...typeRecords.value.map(t => t.name)])
const statusOptions = ['Active', 'Inactive']

const stats = computed(() => {
  const total = policies.value.length
  const active = policies.value.filter(p => p.status).length
  const inactive = total - active
  const totalStages = policies.value.reduce((acc, p) => acc + (p.stagesCount || 0), 0)
  return { total, active, inactive, totalStages }
})

const filteredPolicies = computed(() => {
  return policies.value.filter(p => {
    const keyword = search.value.trim().toLowerCase()
    const matchesSearch =
      !keyword ||
      p.name.toLowerCase().includes(keyword) ||
      p.description.toLowerCase().includes(keyword)

    const matchesType =
      !selectedEmploymentType.value ||
      p.employmentTypeName === selectedEmploymentType.value

    const matchesStatus =
      !selectedStatus.value ||
      (selectedStatus.value === 'Active' && p.status) ||
      (selectedStatus.value === 'Inactive' && !p.status)

    return matchesSearch && matchesType && matchesStatus
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredPolicies.value.length / perPage.value)))

const paginatedPolicies = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredPolicies.value.slice(start, start + perPage.value)
})

const showingFrom = computed(() => (filteredPolicies.value.length ? (currentPage.value - 1) * perPage.value + 1 : 0))
const showingTo = computed(() => Math.min(currentPage.value * perPage.value, filteredPolicies.value.length))

const resetFilters = () => {
  search.value = ''
  selectedEmploymentType.value = ''
  selectedStatus.value = ''
  currentPage.value = 1
}

watch([search, selectedEmploymentType, selectedStatus], () => {
  currentPage.value = 1
})

const openAddModal = () => {
  editingPolicy.value = {
    name: '',
    description: '',
    employmentTypeName: 'All Types',
    status: true,
  }
  isModalOpen.value = true
}

const openEditModal = (policy: LifecyclePolicy) => {
  editingPolicy.value = { ...policy }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  editingPolicy.value = null
}

const handleSave = async () => {
  if (!editingPolicy.value?.name?.trim()) return
  if (await savePolicy(editingPolicy.value)) closeModal()
}

const handleExport = () => {
  const headers = ['ID', 'Policy Name', 'Employment Type', 'Description', 'Stages Count', 'Status', 'Creator', 'Updated At']
  const rows = filteredPolicies.value.map(p => [
    p.id,
    p.name,
    p.employmentTypeName,
    p.description,
    p.stagesCount,
    p.status ? 'Active' : 'Inactive',
    p.creatorName,
    p.updatedAt,
  ])
  const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\r\n')
  const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `lifecycle-policies-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <section class="lifecycle-page">
    <p v-if="loading" role="status">Loading lifecycle policies…</p>
    <p v-if="errorMessage" role="alert">{{ errorMessage }} <button type="button" @click="load">Retry</button></p>
    <!-- PAGE HEADER -->
    <PageHeader
      title="Lifecycle Policies"
      description="Manage employee lifecycle milestone frameworks, policy definitions, and progression standards based on the system ERD."
    >
      <div class="header-actions">
        <AppButton variant="secondary" :icon="Download" @click="handleExport">
          Export
        </AppButton>
        <AppButton variant="primary" :icon="Plus" @click="openAddModal">
          Add Policy
        </AppButton>
      </div>
    </PageHeader>

    <!-- STATS GRID -->
    <div class="stats-grid">
      <StatCard
        label="Total Policies"
        :value="stats.total"
        description="Configured lifecycle frameworks"
        :icon="FileText"
        tone="blue"
      />
      <StatCard
        label="Active Policies"
        :value="stats.active"
        description="Enabled policy definitions"
        :icon="CheckCircle2"
        tone="green"
      />
      <StatCard
        label="Configured Stages"
        :value="stats.totalStages"
        description="Total milestone checkpoints"
        :icon="Layers"
        tone="orange"
      />
      <StatCard
        label="Inactive Policies"
        :value="stats.inactive"
        description="Draft or archived policies"
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
          placeholder="Search policy name or description..."
        />

        <AppSelect
          v-model="selectedEmploymentType"
          :options="employmentTypes"
          placeholder="All Employment Types"
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
          <h3>Lifecycle Policies</h3>
          <p>Define lifecycle policies and assign them to employment categories.</p>
        </div>
        <span class="record-count">
          {{ filteredPolicies.length }}
          {{ filteredPolicies.length === 1 ? 'Record' : 'Records' }}
        </span>
      </div>

      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Policy Name & Description</th>
              <th>Employment Type</th>
              <th>Stages</th>
              <th>Created By</th>
              <th>Status</th>
              <th>Updated</th>
              <th class="actions-heading">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="paginatedPolicies.length === 0">
              <td colspan="7">
                <div class="empty-state">
                  <div class="empty-icon">
                    <FileText :size="24" />
                  </div>
                  <strong>No lifecycle policies found</strong>
                  <span>Try adjusting your search criteria or filters.</span>
                </div>
              </td>
            </tr>
            <tr v-for="policy in paginatedPolicies" :key="policy.id">
              <td>
                <div class="policy-info">
                  <strong class="policy-title">{{ policy.name }}</strong>
                  <p class="policy-desc">{{ policy.description }}</p>
                </div>
              </td>
              <td>
                <span class="type-pill">{{ policy.employmentTypeName }}</span>
              </td>
              <td>
                <span class="stages-pill">{{ policy.stagesCount }} Stages</span>
              </td>
              <td>
                <span class="meta-text">{{ policy.creatorName }}</span>
              </td>
              <td>
                <button
                  type="button"
                  class="status-badge cursor-pointer"
                  :class="policy.status ? 'completed' : 'on-hold'"
                  @click="togglePolicyStatus(policy.id)"
                  title="Click to toggle status"
                >
                  <span class="status-dot" />
                  {{ policy.status ? 'Active' : 'Inactive' }}
                </button>
              </td>
              <td>
                <span class="meta-text">{{ policy.updatedAt }}</span>
              </td>
              <td class="actions-cell">
                <div class="actions-group">
                  <button
                    type="button"
                    class="action-icon-btn edit"
                    title="Edit Policy"
                    @click="openEditModal(policy)"
                  >
                    <Edit2 :size="15" />
                  </button>
                  <button
                    type="button"
                    class="action-icon-btn delete"
                    title="Delete Policy"
                    @click="policyToDelete = policy"
                  >
                    <Trash2 :size="15" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- PAGINATION -->
      <div class="table-footer">
        <p>
          Showing
          <strong>{{ showingFrom }}–{{ showingTo }}</strong>
          of
          <strong>{{ filteredPolicies.length }}</strong>
          policies
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
                <FileText :size="20" />
              </span>
              <div>
                <h2>{{ editingPolicy?.id ? 'Edit Lifecycle Policy' : 'Add Lifecycle Policy' }}</h2>
                <p>Configure lifecycle progression standard based on ERD</p>
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
          <div class="dialog-body" v-if="editingPolicy">
            <div class="form-group">
              <label class="form-label">Policy Name *</label>
              <input
                v-model="editingPolicy.name"
                type="text"
                placeholder="e.g. Probationary Regularization Policy"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Covered Employment Type *</label>
              <select v-model="editingPolicy.employmentTypeName" class="form-select">
                <option v-for="t in employmentTypes" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea
                v-model="editingPolicy.description"
                rows="3"
                placeholder="Describe milestone objectives and progression criteria..."
                class="form-textarea"
              ></textarea>
            </div>

            <div class="form-group-checkbox">
              <label class="checkbox-label">
                <input
                  v-model="editingPolicy.status"
                  type="checkbox"
                  class="styled-checkbox"
                />
                <span>Active Status (enforced for new hires)</span>
              </label>
            </div>
          </div>

          <!-- MODAL FOOTER -->
          <footer class="dialog-footer">
            <AppButton variant="secondary" @click="closeModal">Cancel</AppButton>
            <AppButton variant="primary" @click="handleSave">Save Policy</AppButton>
          </footer>
        </section>
      </div>
    </Teleport>

    <!-- DELETE CONFIRMATION MODAL -->
    <Teleport to="body">
      <div
        v-if="policyToDelete"
        class="modal-overlay"
        @click.self="!deleting && (policyToDelete = null)"
      >
        <section class="modal-dialog modal-dialog-sm" role="dialog" aria-modal="true">
          <header class="dialog-header">
            <div class="dialog-header-left">
              <span class="header-icon danger">
                <Trash2 :size="20" />
              </span>
              <div>
                <h2>Delete Lifecycle Policy</h2>
                <p>{{ policyToDelete.name }}</p>
              </div>
            </div>
            <button type="button" class="close-icon" aria-label="Close" :disabled="deleting" @click="policyToDelete = null">
              <X :size="19" />
            </button>
          </header>
          <div class="dialog-body">
            <p class="confirm-text">
              Are you sure you want to delete <strong>{{ policyToDelete.name }}</strong>? Policies with existing stages cannot be deleted and should be deactivated instead.
            </p>
          </div>
          <footer class="dialog-footer">
            <AppButton variant="secondary" :disabled="deleting" @click="policyToDelete = null">Cancel</AppButton>
            <AppButton variant="danger" :disabled="deleting" @click="confirmDeletePolicy">
              {{ deleting ? 'Deleting…' : 'Delete Policy' }}
            </AppButton>
          </footer>
        </section>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
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

.policy-info {
  min-width: 240px;
}

.policy-title {
  display: block;
  color: var(--text-primary);
  font-size: 11.5px;
  font-weight: 700;
}

.policy-desc {
  margin: 3px 0 0;
  color: var(--text-muted);
  font-size: 10px;
  line-height: 1.4;
  max-width: 440px;
}

.type-pill {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 10px;
  font-weight: 650;
  white-space: nowrap;
}

.stages-pill {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  background: var(--purple-soft);
  color: var(--purple);
  font-size: 10px;
  font-weight: 650;
  white-space: nowrap;
}

.meta-text {
  color: var(--text-secondary);
  font-size: 10.5px;
  white-space: nowrap;
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

.form-label {
  color: var(--text-secondary);
  font-size: 10.5px;
  font-weight: 600;
}

.form-input,
.form-select,
.form-textarea {
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
.form-select:focus,
.form-textarea:focus {
  border-color: var(--primary);
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
