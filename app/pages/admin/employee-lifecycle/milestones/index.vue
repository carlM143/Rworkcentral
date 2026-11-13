<script setup lang="ts">
import {
  Download,
  RotateCcw,
  CheckCircle2,
  Clock,
  CalendarDays,
  AlertCircle,
  FileCheck,
  UserRound,
  UserCog,
  X,
  FileText,
  Paperclip,
  UploadCloud,
  Trash2,
  Award,
} from 'lucide-vue-next'
import StatCard from '~/components/shared/StatCard.vue'
import AppButton from '~/components/ui/AppButton.vue'
import AppInput from '~/components/ui/AppInput.vue'
import AppSelect from '~/components/ui/AppSelect.vue'
import AppPagination from '~/components/ui/AppPagination.vue'
import type { EmployeeMilestone } from '~/types/lifecycleErd'
import EmploymentTypeChangeModal from '~/components/admin/employee-lifecycle/EmploymentTypeChangeModal.vue'

definePageMeta({
  layout: 'admin',
})

const {
  milestones,
  loading, errorMessage, load,
} = useLifecycleMilestones()

const { employmentTypes, loadEmploymentTypes } = useEmploymentTypes()

const { $api } = useNuxtApp()
const toast = useToast()
const saving = ref(false)
const selectedFile = ref<File | null>(null)
const removedAttachment = ref(false)
const employmentChangeOpen = ref(false)
const employmentChangeEmployeeId = ref<number | undefined>()
const openEmploymentChange = (employeeId?: number) => {
  employmentChangeEmployeeId.value = employeeId
  employmentChangeOpen.value = true
}

const search = ref('')
const selectedDepartment = ref('')
const selectedEmploymentType = ref('')
const selectedStatus = ref('')
const currentPage = ref(1)
const perPage = ref(6)

// Modal State
const isModalOpen = ref(false)
const selectedMilestone = ref<EmployeeMilestone | null>(null)
const editingRemarks = ref('')
const editingCompleted = ref(false)
const requiresAttachment = computed(() => selectedMilestone.value?.requiresAttachment !== false)
const resultingCompleted = computed(() => requiresAttachment.value ? !!selectedFileName.value : editingCompleted.value)
const selectedFileName = ref<string | null>(null)
const selectedFileSize = ref<string | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

const departments = computed(() => {
  const set = new Set(milestones.value.map(m => m.department))
  return Array.from(set).filter(Boolean)
})
const isActiveType = (status: unknown) => [true, 1, '1', 'active', 'Active'].includes(status as string | number | boolean)
// Keep every active type from the Employment Types page, and fall back to any
// type already present on a milestone when that list is unavailable.
const employmentTypeOptions = computed(() => {
  const options = new Set(
    milestones.value
      .map(m => m.employmentType)
      .filter(name => name && name !== '—'),
  )
  for (const type of employmentTypes.value) {
    if (type.name && isActiveType(type.status)) options.add(type.name)
  }
  return [...options].sort((a, b) => a.localeCompare(b))
})
const statusOptions = ['Pending', 'Completed']

onMounted(() => { loadEmploymentTypes() })

const stats = computed(() => {
  const total = milestones.value.length
  const completed = milestones.value.filter(m => m.status === 'completed').length
  const pending = total - completed
  const probationaryUpcoming = milestones.value.filter(m => {
    return m.employmentType === 'Probationary' && m.stageCode === 'M6_REGULARIZATION'
  }).length

  return { total, completed, pending, probationaryUpcoming }
})

const filteredMilestones = computed(() => {
  return milestones.value.filter(m => {
    const keyword = search.value.trim().toLowerCase()
    const matchesSearch =
      !keyword ||
      m.employeeName.toLowerCase().includes(keyword) ||
      m.employeeNumber.toLowerCase().includes(keyword) ||
      m.stageName.toLowerCase().includes(keyword) ||
      m.stageCode.toLowerCase().includes(keyword)

    const matchesDept =
      !selectedDepartment.value ||
      m.department === selectedDepartment.value

    const matchesType =
      !selectedEmploymentType.value ||
      m.employmentType === selectedEmploymentType.value

    const matchesStatus =
      !selectedStatus.value ||
      (selectedStatus.value === 'Pending' && m.status === 'pending') ||
      (selectedStatus.value === 'Completed' && m.status === 'completed')

    return matchesSearch && matchesDept && matchesType && matchesStatus
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredMilestones.value.length / perPage.value)))

const paginatedMilestones = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredMilestones.value.slice(start, start + perPage.value)
})

const showingFrom = computed(() => (filteredMilestones.value.length ? (currentPage.value - 1) * perPage.value + 1 : 0))
const showingTo = computed(() => Math.min(currentPage.value * perPage.value, filteredMilestones.value.length))

const resetFilters = () => {
  search.value = ''
  selectedDepartment.value = ''
  selectedEmploymentType.value = ''
  selectedStatus.value = ''
  currentPage.value = 1
}

watch([search, selectedDepartment, selectedEmploymentType, selectedStatus], () => {
  currentPage.value = 1
})

const openEvaluationModal = (milestone: EmployeeMilestone) => {
  selectedFile.value = null
  removedAttachment.value = false
  selectedMilestone.value = milestone
  editingCompleted.value = milestone.status === 'completed'
  editingRemarks.value = milestone.remarks || ''
  selectedFileName.value = milestone.attachmentName || null
  selectedFileSize.value = milestone.attachmentSize || null
  isModalOpen.value = true
}

const closeModal = () => {
  if (saving.value) return
  isModalOpen.value = false
  selectedMilestone.value = null
  editingRemarks.value = ''
  selectedFileName.value = null
  selectedFileSize.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    if (file.size > 10 * 1024 * 1024 || !['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
      toast.error('Invalid attachment', 'Choose a PDF, JPG or PNG up to 10 MB.')
      target.value = ''
      return
    }
    selectedFile.value = file
    removedAttachment.value = false
    selectedFileName.value = file.name
    const sizeInKb = Math.round(file.size / 1024)
    selectedFileSize.value = sizeInKb > 1024 ? `${(sizeInKb / 1024).toFixed(1)} MB` : `${sizeInKb} KB`
  }
}

const handleRemoveAttachment = () => {
  selectedFile.value = null
  removedAttachment.value = true
  selectedFileName.value = null
  selectedFileSize.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}

const handleSaveEvaluation = async () => {
  if (!selectedMilestone.value || saving.value) return
  saving.value = true
  try {
    const milestone = selectedMilestone.value
    let documentId = removedAttachment.value ? null : milestone.evaluationDocumentId || null
    if (selectedFile.value) {
      const body = new FormData()
      body.append('document', selectedFile.value)
      const uploaded = await $api<any>(`/admin/employees/${milestone.employeeId}/lifecycle-evaluations`, { method: 'POST', body })
      documentId = uploaded.data.id
      milestone.evaluationDocumentId = documentId
      selectedFile.value = null
    }
    await $api(`/admin/lifecycle/milestones/${milestone.id}`, { method: 'PUT', body: { remarks: editingRemarks.value, evaluation_document_id: documentId, status: resultingCompleted.value ? 'completed' : 'pending' } })
    await load()
    saving.value = false
    closeModal()
    toast.success('Evaluation saved', 'Milestone status and remarks have been updated.')
  } catch (err: any) { toast.error('Unable to save evaluation', err?.data?.message || 'Please try again.') }
  finally { saving.value = false }
}

const downloadAttachment = async () => {
  const m = selectedMilestone.value
  if (!m?.evaluationDocumentId) return
  try {
    const blob = await $api<Blob>(`/admin/employees/${m.employeeId}/lifecycle-evaluations/${m.evaluationDocumentId}`, { responseType: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = m.attachmentName || 'evaluation'; a.click()
    URL.revokeObjectURL(url)
  } catch { toast.error('Unable to download attachment', 'Please try again.') }
}
watch(totalPages, pages => { currentPage.value = Math.min(currentPage.value, pages) })

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const handleExport = () => {
  const headers = [
    'Milestone ID',
    'Employee ID',
    'Employee Name',
    'Department',
    'Position',
    'Employment Type',
    'Stage Name',
    'Stage Code',
    'Policy Name',
    'Target Date',
    'Evaluation Attachment',
    'Status',
    'HR Remarks',
  ]
  const rows = filteredMilestones.value.map(m => [
    m.id,
    m.employeeNumber,
    m.employeeName,
    m.department,
    m.position,
    m.employmentType,
    m.stageName,
    m.stageCode,
    m.policyName,
    m.dueDate,
    m.attachmentName || 'None',
    m.status === 'completed' ? 'Completed' : 'Pending',
    m.remarks || '',
  ])
  const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\r\n')
  const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `employee-lifecycle-milestones-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <section class="lifecycle-page">
    <p v-if="loading" role="status">Loading employee milestones…</p>
    <p v-if="errorMessage" role="alert">{{ errorMessage }} <button @click="load">Retry</button></p>
    <!-- PAGE HEADER -->
    <PageHeader
      title="Employee Milestones"
      description="Automatically track employee milestones from each hire date and the applicable lifecycle policy stages. Changing an employment type rebuilds the employee's plan from their hire date."
    >
      <div class="header-actions">
        <AppButton :icon="UserCog" @click="openEmploymentChange()">Change Employment Type</AppButton>
        <AppButton variant="secondary" :icon="Download" @click="handleExport">
          Export
        </AppButton>
      </div>
    </PageHeader>

    <!-- STATS GRID -->
    <div class="stats-grid">
      <StatCard
        label="Total Milestones"
        :value="stats.total"
        description="All employee milestone tracking"
        :icon="FileCheck"
        tone="blue"
      />
      <StatCard
        label="Completed"
        :value="stats.completed"
        description="Evaluation form attached & finalized"
        :icon="CheckCircle2"
        tone="green"
      />
      <StatCard
        label="Pending Attachment"
        :value="stats.pending"
        description="Awaiting evaluation submission"
        :icon="Clock"
        tone="orange"
      />
      <StatCard
        label="Regularization Targets"
        :value="stats.probationaryUpcoming"
        description="Probationary to regular transitions"
        :icon="AlertCircle"
        tone="purple"
      />
    </div>

    <!-- FILTERS CARD -->
    <div class="filters-card">
      <div class="filters-grid">
        <AppInput
          v-model="search"
          searchable
          placeholder="Search employee, ID, or milestone stage..."
        />

        <AppSelect
          v-model="selectedDepartment"
          :options="departments"
          placeholder="All Departments"
        />

        <AppSelect
          v-model="selectedEmploymentType"
          :options="employmentTypeOptions"
          placeholder="All Employment Types"
          aria-label="Filter by employment type"
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
          <h3>Employee Milestones</h3>
          <p>Monitor employee milestone target dates, evaluation attachments, and completion records.</p>
        </div>
        <span class="record-count">
          {{ filteredMilestones.length }}
          {{ filteredMilestones.length === 1 ? 'Record' : 'Records' }}
        </span>
      </div>

      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department & Role</th>
              <th>Lifecycle Stage</th>
              <th>Target Date</th>
              <th>Evaluation Proof</th>
              <th>Status</th>
              <th>HR Remarks</th>
              <th class="actions-heading">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="paginatedMilestones.length === 0">
              <td colspan="8">
                <div class="empty-state">
                  <div class="empty-icon">
                    <FileCheck :size="24" />
                  </div>
                  <strong>No employee milestones found</strong>
                  <span>Try adjusting your search criteria or filters.</span>
                </div>
              </td>
            </tr>
            <tr v-for="milestone in paginatedMilestones" :key="milestone.id">
              <!-- EMPLOYEE CELL -->
              <td>
                <div class="employee-cell">
                  <div class="employee-avatar">
                    <UserRound :size="17" />
                  </div>
                  <div class="employee-info">
                    <NuxtLink :to="{ path: '/admin/employee-lifecycle/employee-history', query: { employee: milestone.employeeId } }" class="employee-history-link">{{ milestone.employeeName }}</NuxtLink>
                    <span class="employee-meta">EMP-{{ milestone.employeeNumber }} · {{ milestone.position }} · Hired {{ formatDate(milestone.dateHired) }}</span>
                  </div>
                </div>
              </td>

              <!-- DEPARTMENT -->
              <td>
                <div class="dept-info">
                  <span class="dept-name">{{ milestone.department }}</span>
                  <span class="type-sub" :class="{ 'is-probationary': milestone.employmentType === 'Probationary' }">
                    {{ milestone.employmentType }}
                  </span>
                </div>
              </td>

              <!-- STAGE -->
              <td>
                <div class="stage-info">
                  <div class="stage-title-row">
                    <strong class="stage-name">{{ milestone.stageName }}</strong>
                    <span v-if="milestone.stageCode === 'M6_REGULARIZATION'" class="regularization-pill">
                      Probi → Regular
                    </span>
                  </div>
                  <span class="policy-sub">{{ milestone.policyName }}</span>
                </div>
              </td>

              <!-- TARGET DATE (Formerly Due Date) -->
              <td>
                <div class="date-cell" :class="{ 'is-reg-target': milestone.stageCode === 'M6_REGULARIZATION' }">
                  <CalendarDays :size="15" />
                  <strong>{{ formatDate(milestone.dueDate) }}</strong>
                </div>
              </td>

              <!-- EVALUATION PROOF (ATTACHMENT) -->
              <td>
                <div v-if="milestone.attachmentName" class="attachment-pill" :title="milestone.attachmentName">
                  <Paperclip :size="13" class="text-primary flex-shrink-0" />
                  <span class="attachment-name">{{ milestone.attachmentName }}</span>
                  <span class="attachment-size">{{ milestone.attachmentSize }}</span>
                </div>
                <div v-else class="no-attachment-text">
                  <span>No attachment</span>
                </div>
              </td>

              <!-- STATUS (AUTOMATIC BASED ON ATTACHMENT) -->
              <td>
                <span
                  class="status-badge"
                  :class="milestone.status === 'completed' ? 'completed' : 'for-completion'"
                >
                  <span class="status-dot" />
                  {{ milestone.status === 'completed' ? 'Completed' : 'Pending' }}
                </span>
              </td>

              <!-- REMARKS -->
              <td>
                <p class="remarks-text" :title="milestone.remarks || ''">
                  {{ milestone.remarks || 'No remarks provided' }}
                </p>
              </td>

              <!-- ACTIONS -->
              <td class="actions-cell">
                <div class="actions-group">
                  <button
                    type="button"
                    class="action-btn"
                    title="Change this employee's employment type"
                    @click="openEmploymentChange(milestone.employeeId)"
                  >
                    <UserCog :size="14" aria-hidden="true" />
                    <span>Change Type</span>
                  </button>
                  <button
                    type="button"
                    class="action-btn"
                    :title="milestone.attachmentName ? 'View or update this milestone evaluation proof' : 'Upload evaluation proof and complete this milestone'"
                    @click="openEvaluationModal(milestone)"
                  >
                    <FileText v-if="milestone.attachmentName" :size="14" aria-hidden="true" />
                    <Paperclip v-else :size="14" aria-hidden="true" />
                    <span>{{ milestone.attachmentName ? 'View Proof' : 'Upload Proof' }}</span>
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
          <strong>{{ filteredMilestones.length }}</strong>
          employee milestones
        </p>
        <AppPagination
          v-model="currentPage"
          :total-pages="totalPages"
        />
      </div>
    </article>

    <!-- EVALUATION & ATTACHMENT MODAL -->
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
                <FileCheck :size="20" />
              </span>
              <div>
                <h2>Evaluation Proof & Completion</h2>
                <p v-if="selectedMilestone">
                  {{ selectedMilestone.employeeName }} (EMP-{{ selectedMilestone.employeeNumber }})
                </p>
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
          <div class="dialog-body" v-if="selectedMilestone">
            <!-- REGULARIZATION TRIGGER BANNER -->
            <div v-if="selectedMilestone.stageCode === 'M6_REGULARIZATION'" class="regularization-banner">
              <div class="banner-icon">
                <Award :size="20" />
              </div>
              <div class="banner-text">
                <strong>Manual review required</strong>
                <p>
                  Save the evaluation here to complete this milestone. Use Change Employment Type on this page to record the employment decision.
                </p>
              </div>
            </div>

            <!-- MILESTONE CONTEXT CARD -->
            <div class="info-card">
              <div class="info-row">
                <span class="info-label">Milestone Stage:</span>
                <strong class="info-val">{{ selectedMilestone.stageName }}</strong>
              </div>
              <div class="info-row">
                <span class="info-label">Target Date:</span>
                <strong class="info-val">{{ formatDate(selectedMilestone.dueDate) }}</strong>
              </div>
              <div class="info-row">
                <span class="info-label">Current Employment:</span>
                <span class="info-val font-semibold" :class="selectedMilestone.employmentType === 'Probationary' ? 'text-orange' : 'text-green'">
                  {{ selectedMilestone.employmentType }}
                </span>
              </div>
              <div class="info-row">
                <span class="info-label">Resulting Status:</span>
                <span
                  class="status-badge"
                  :class="resultingCompleted ? 'completed' : 'for-completion'"
                >
                  <span class="status-dot" />
                  {{ resultingCompleted ? 'Completed' : 'Pending' }}
                </span>
              </div>
            </div>

            <!-- ATTACHMENT UPLOAD SECTION -->
            <div v-if="!requiresAttachment" class="form-group-checkbox">
              <label><input v-model="editingCompleted" type="checkbox" /> Mark milestone as completed</label>
              <p>This stage does not require an attachment.</p>
            </div>
            <div v-if="requiresAttachment || selectedFileName" class="form-group">
              <label class="form-label">{{ requiresAttachment ? 'Evaluation Attachment (Required to complete milestone) *' : 'Existing Evaluation Attachment' }}</label>

              <!-- HIDDEN FILE INPUT -->
              <input
                ref="fileInputRef"
                type="file"
                class="hidden-file-input"
                accept=".pdf,.png,.jpg,.jpeg"
                @change="handleFileSelect"
              />

              <!-- ATTACHED FILE PREVIEW -->
              <div v-if="selectedFileName" class="uploaded-file-card">
                <div class="file-card-left">
                  <div class="file-icon-box">
                    <Paperclip :size="18" />
                  </div>
                  <div>
                    <strong class="file-card-title">{{ selectedFileName }}</strong>
                    <span class="file-card-meta">{{ selectedFileSize }} · {{ selectedFile ? 'Ready to upload' : 'Saved attachment' }}</span>
                    <button v-if="selectedMilestone?.evaluationDocumentId && !selectedFile && !removedAttachment" type="button" @click="downloadAttachment">Download</button>
                  </div>
                </div>
                <div class="file-card-actions">
                  <button
                    type="button"
                    class="file-action-btn delete"
                    :title="requiresAttachment ? 'Remove attachment (reverts status to Pending)' : 'Remove attachment'"
                    @click="handleRemoveAttachment"
                  >
                    <Trash2 :size="15" />
                  </button>
                </div>
              </div>

              <!-- EMPTY UPLOAD DROPZONE -->
              <div
                v-else
                class="upload-dropzone"
                @click="triggerFileInput"
              >
                <UploadCloud :size="28" class="upload-icon" />
                <strong>Click to upload evaluation proof / rating form</strong>
                <span>PDF, PNG or JPG, up to 10 MB</span>
              </div>
            </div>

            <!-- HR REMARKS -->
            <div class="form-group">
              <label class="form-label">HR Evaluation Notes / Remarks</label>
              <textarea
                v-model="editingRemarks"
                rows="3"
                placeholder="Enter evaluation outcome, performance assessment notes, or supervisor remarks..."
                class="form-textarea"
              ></textarea>
            </div>
          </div>

          <!-- MODAL FOOTER -->
          <footer class="dialog-footer">
            <AppButton variant="secondary" @click="closeModal">Cancel</AppButton>
            <AppButton variant="primary" :disabled="saving" @click="handleSaveEvaluation">
              {{ saving ? 'Saving…' : 'Save Evaluation' }}
            </AppButton>
          </footer>
        </section>
      </div>
    </Teleport>
    <EmploymentTypeChangeModal :open="employmentChangeOpen" :employee-id="employmentChangeEmployeeId" @close="employmentChangeOpen = false" @saved="load" />
  </section>
</template>

<style scoped>
.employee-history-link { color: var(--primary); font-weight: 650; text-decoration: none; }
.employee-history-link:hover { text-decoration: underline; }
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
  grid-template-columns: minmax(260px, 1fr) 180px 170px 150px auto;
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
  min-width: 1180px;
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

/* EMPLOYEE CELL */
.employee-cell {
  display: flex;
  min-width: 220px;
  align-items: center;
  gap: 10px;
}

.employee-avatar {
  display: flex;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: var(--primary-soft);
  color: var(--primary);
}

.employee-info {
  min-width: 0;
}

.employee-info strong {
  display: block;
  color: var(--text-primary);
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.employee-meta {
  display: block;
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 10px;
  white-space: nowrap;
}

/* DEPT & ROLE */
.dept-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  white-space: nowrap;
}

.dept-name {
  color: var(--text-primary);
  font-size: 10.5px;
  font-weight: 650;
}

.type-sub {
  color: var(--primary);
  font-size: 9.5px;
  font-weight: 600;
}

.type-sub.is-probationary {
  color: var(--orange);
}

/* STAGE */
.stage-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 220px;
}

.stage-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.regularization-pill {
  display: inline-block;
  padding: 2px 7px;
  border-radius: 4px;
  background: var(--green-soft);
  color: var(--green);
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.stage-name {
  color: var(--text-primary);
  font-size: 11px;
  font-weight: 700;
}

.policy-sub {
  color: var(--text-muted);
  font-size: 9.5px;
}

/* DATE */
.date-cell {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  white-space: nowrap;
}

.date-cell.is-reg-target strong {
  color: var(--green);
}

.date-cell svg {
  color: var(--text-muted);
}

.date-cell strong {
  color: var(--text-primary);
  font-size: 10.5px;
  font-weight: 650;
}

/* ATTACHMENT PROOF PILL */
.attachment-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-card-soft);
  max-width: 190px;
}

.attachment-name {
  color: var(--text-primary);
  font-size: 10px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.attachment-size {
  color: var(--text-muted);
  font-size: 9px;
  white-space: nowrap;
}

.no-attachment-text {
  color: var(--text-muted);
  font-size: 10px;
  font-style: italic;
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

.status-badge.for-completion {
  background: var(--orange-soft);
  color: var(--orange);
}

/* REMARKS */
.remarks-text {
  max-width: 220px;
  margin: 0;
  overflow: hidden;
  color: var(--text-secondary);
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ACTIONS */
.actions-heading {
  text-align: right;
}

.actions-cell {
  width: 200px;
  text-align: right;
}

.actions-group {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}

.action-btn {
  display: inline-flex;
  height: 28px;
  align-items: center;
  gap: 5px;
  padding: 0 9px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 650;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-soft);
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

.text-orange {
  color: var(--orange);
}

.text-green {
  color: var(--green);
}

/* REGULARIZATION BANNER */
.regularization-banner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid rgba(22, 166, 99, 0.3);
  border-radius: 9px;
  background: var(--green-soft);
}

.banner-icon {
  display: flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(22, 166, 99, 0.2);
  color: var(--green);
  flex-shrink: 0;
}

.banner-text strong {
  display: block;
  color: var(--green);
  font-size: 11.5px;
  font-weight: 700;
}

.banner-text p {
  margin: 3px 0 0;
  color: var(--text-secondary);
  font-size: 10.5px;
  line-height: 1.4;
}

.form-group-checkbox {
  padding: 6px 0;
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
  width: 16px;
  height: 16px;
  accent-color: var(--primary);
  cursor: pointer;
}

.info-card {
  padding: 12px 14px;
  border: 1px solid var(--border-soft);
  border-radius: 8px;
  background: var(--bg-card-soft);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
}

.info-label {
  color: var(--text-muted);
}

.info-val {
  color: var(--text-primary);
  font-weight: 650;
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

.hidden-file-input {
  display: none;
}

/* DROPZONE */
.upload-dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 24px 16px;
  border: 1.5px dashed var(--border);
  border-radius: 10px;
  background: var(--bg-card-soft);
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: center;
}

.upload-dropzone:hover {
  border-color: var(--primary);
  background: var(--primary-soft);
}

.upload-icon {
  color: var(--primary);
}

.upload-dropzone strong {
  color: var(--text-primary);
  font-size: 11.5px;
}

.upload-dropzone span {
  color: var(--text-muted);
  font-size: 10px;
}

/* UPLOADED FILE CARD */
.uploaded-file-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
}

.file-card-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.file-icon-box {
  display: flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: var(--primary-soft);
  color: var(--primary);
  flex-shrink: 0;
}

.file-card-title {
  display: block;
  color: var(--text-primary);
  font-size: 11px;
  font-weight: 650;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 280px;
}

.file-card-meta {
  display: block;
  color: var(--text-muted);
  font-size: 9.5px;
}

.file-card-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.file-action-btn {
  display: flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-card);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.file-action-btn.delete:hover {
  border-color: var(--red);
  color: var(--red);
  background: var(--red-soft);
}

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

.form-textarea:focus {
  border-color: var(--primary);
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
