<script setup lang="ts">
import {
  Download,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  UserCog,
  X,
  Paperclip,
  UploadCloud,
  Trash2,
  History,
  Eye,
} from 'lucide-vue-next'
import StatCard from '~/components/shared/StatCard.vue'
import BaseDataTable from '~/components/shared-table/BaseDataTable.vue'
import TableActionMenu from '~/components/shared-table/TableActionMenu.vue'
import AppButton from '~/components/ui/AppButton.vue'
import AppInput from '~/components/ui/AppInput.vue'
import AppSelect from '~/components/ui/AppSelect.vue'
import AppPagination from '~/components/ui/AppPagination.vue'
import type { EmployeeMilestone, MilestoneEvaluationInput } from '~/types/lifecycleErd'
import EmploymentTypeChangeModal from '~/components/admin/employee-lifecycle/EmploymentTypeChangeModal.vue'

definePageMeta({
  layout: 'admin',
})

const {
  milestones,
  departments,
  stats,
  meta,
  loading, errorMessage, load, fetchAllForExport,
} = useLifecycleMilestones()

const { employmentTypes, loadEmploymentTypes } = useEmploymentTypes()

const { $api } = useNuxtApp()
const toast = useToast()
const exporting = ref(false)
const selectedFile = ref<File | null>(null)
const uploadedDocumentId = ref<number | null>(null)
const removedAttachment = ref(false)
const employmentChangeOpen = ref(false)
const employmentChangeEmployeeId = ref<number | undefined>()
const openEmploymentChange = (milestone?: EmployeeMilestone) => {
  setEvaluationMilestone(milestone ?? null)
  employmentChangeEmployeeId.value = milestone?.employeeId
  employmentChangeOpen.value = true
}

const closeEmploymentChange = () => {
  employmentChangeOpen.value = false
  setEvaluationMilestone(null)
}

const search = ref('')
const selectedDepartment = ref('')
const selectedEmploymentType = ref('')
const selectedStatus = ref('')
const currentPage = ref(1)
const perPage = ref(6)

// Modal State
const selectedMilestone = ref<EmployeeMilestone | null>(null)
const detailsMilestone = ref<EmployeeMilestone | null>(null)
const detailsDialog = ref<HTMLDialogElement | null>(null)
const editingRemarks = ref('')
const editingCompleted = ref(false)
const requiresAttachment = computed(() => selectedMilestone.value?.requiresAttachment !== false)
const hasEvaluationProof = computed(() => !!selectedFile.value
  || (!removedAttachment.value && !!selectedMilestone.value?.evaluationDocumentId))
const resultingCompleted = computed(() => requiresAttachment.value ? hasEvaluationProof.value : editingCompleted.value)
const selectedFileName = ref<string | null>(null)
const selectedFileSize = ref<string | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const evaluationDirty = computed(() => {
  const milestone = selectedMilestone.value
  return !!milestone && (
    !!selectedFile.value || removedAttachment.value
    || editingRemarks.value !== (milestone.remarks || '')
    || (!requiresAttachment.value && editingCompleted.value !== (milestone.status === 'completed'))
  )
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
const statusOptions = ['Pending', 'Due Soon', 'Completed']

const currentQueryParams = () => ({
  search: search.value,
  department: selectedDepartment.value,
  employmentType: selectedEmploymentType.value,
  status: selectedStatus.value,
  page: currentPage.value,
  perPage: perPage.value,
})

const reloadMilestones = () => load(currentQueryParams())

onMounted(() => {
  loadEmploymentTypes()
  reloadMilestones()
})

const paginatedMilestones = computed(() => milestones.value)
const totalPages = computed(() => Math.max(1, meta.value.last_page))
const showingFrom = computed(() => meta.value.from)
const showingTo = computed(() => meta.value.to)

const resetFilters = () => {
  search.value = ''
  selectedDepartment.value = ''
  selectedEmploymentType.value = ''
  selectedStatus.value = ''
  currentPage.value = 1
}

let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(search, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    if (currentPage.value !== 1) {
      currentPage.value = 1
    } else {
      reloadMilestones()
    }
  }, 300)
})

watch([selectedDepartment, selectedEmploymentType, selectedStatus], () => {
  if (currentPage.value !== 1) {
    currentPage.value = 1
  } else {
    reloadMilestones()
  }
})

watch(currentPage, () => {
  reloadMilestones()
})

const setEvaluationMilestone = (milestone: EmployeeMilestone | null) => {
  selectedFile.value = null
  uploadedDocumentId.value = null
  removedAttachment.value = false
  selectedMilestone.value = milestone
  editingCompleted.value = milestone?.status === 'completed'
  editingRemarks.value = milestone?.remarks || ''
  selectedFileName.value = milestone?.attachmentName || null
  selectedFileSize.value = milestone?.attachmentSize || null
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
    uploadedDocumentId.value = null
    removedAttachment.value = false
    selectedFileName.value = file.name
    const sizeInKb = Math.round(file.size / 1024)
    selectedFileSize.value = sizeInKb > 1024 ? `${(sizeInKb / 1024).toFixed(1)} MB` : `${sizeInKb} KB`
  }
}

const handleRemoveAttachment = () => {
  selectedFile.value = null
  uploadedDocumentId.value = null
  removedAttachment.value = true
  selectedFileName.value = null
  selectedFileSize.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}

const prepareMilestoneEvaluation = async (): Promise<MilestoneEvaluationInput> => {
  const milestone = selectedMilestone.value
  if (!milestone) throw new Error('No milestone selected.')

  let documentId = removedAttachment.value ? null : milestone.evaluationDocumentId ?? null
  if (selectedFile.value) {
    if (uploadedDocumentId.value === null) {
      const body = new FormData()
      body.append('document', selectedFile.value)
      const uploaded = await $api<{ data: { id: number } }>(`/admin/employees/${milestone.employeeId}/lifecycle-evaluations`, { method: 'POST', body })
      uploadedDocumentId.value = uploaded.data.id
    }
    documentId = uploadedDocumentId.value
  }
  return {
    milestone_id: milestone.id,
    evaluation_document_id: documentId,
    remarks: editingRemarks.value,
    status: resultingCompleted.value ? 'completed' : 'pending',
  }
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
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(dateStr) ? `${dateStr}T00:00:00` : dateStr)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const hasReviewWindow = (milestone: EmployeeMilestone) => !!(milestone.reviewWindowStart && milestone.reviewWindowEnd)

const milestoneDateLabel = (milestone: EmployeeMilestone) =>
  milestone.reviewWindowStart && milestone.reviewWindowEnd
    ? `${formatDate(milestone.reviewWindowStart)} – ${formatDate(milestone.reviewWindowEnd)}`
    : formatDate(milestone.dueDate)

const employeeHistoryRoute = (milestone: EmployeeMilestone) => ({
  path: '/admin/employee-lifecycle/employee-history',
  query: { employee: milestone.employeeId },
})

const milestoneActions = [
  { key: 'details', label: 'View Details', icon: Eye },
  { key: 'history', label: 'Employee History', icon: History },
  { key: 'change-type', label: 'Change Type', icon: UserCog },
]

const handleMilestoneAction = async (key: string, milestone: EmployeeMilestone) => {
  switch (key) {
    case 'details':
      detailsMilestone.value = milestone
      await nextTick()
      detailsDialog.value?.showModal()
      break
    case 'history':
      await navigateTo(employeeHistoryRoute(milestone))
      break
    case 'change-type':
      openEmploymentChange(milestone)
      break
  }
}

const milestoneDetails = computed(() => {
  const milestone = detailsMilestone.value
  if (!milestone) return []

  return [
    { label: 'Department', value: milestone.department },
    { label: 'Position', value: milestone.position },
    { label: 'Employment Type', value: milestone.employmentType },
    { label: 'Hire Date', value: formatDate(milestone.dateHired) },
    { label: 'Milestone', value: milestone.stageName },
    { label: 'Policy', value: milestone.policyName },
    { label: hasReviewWindow(milestone) ? 'Review Window' : 'Target Date', value: milestoneDateLabel(milestone) },
    { label: 'Status', value: milestone.status === 'completed' ? 'Completed' : 'Pending' },
    { label: 'Evaluation Proof', value: milestone.attachmentName || 'No attachment' },
  ]
})

const handleExport = async () => {
  if (exporting.value) return
  exporting.value = true
  try {
    const allRecords = await fetchAllForExport(currentQueryParams())
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
      'Review Window Start',
      'Review Window End',
      'Evaluation Attachment',
      'Status',
      'HR Remarks',
    ]
    const rows = allRecords.map(m => [
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
      m.reviewWindowStart || '',
      m.reviewWindowEnd || '',
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
  } catch {
    toast.error('Export failed', 'Unable to export milestones.')
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <section class="lifecycle-page">
    <p v-if="errorMessage" role="alert">{{ errorMessage }} <button @click="reloadMilestones">Retry</button></p>
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
    <BaseDataTable
      title="Employee Milestones"
      description="The regularization review window follows the lifecycle policy. HR records the effective date manually."
      :has-rows="paginatedMilestones.length > 0"
      :loading="loading"
      min-width="1000px"
      empty-title="No employee milestones found"
      empty-description="Try adjusting your search criteria or filters."
    >
      <template #heading-actions>
        <span class="record-count">
          {{ meta.total }}
          {{ meta.total === 1 ? 'Record' : 'Records' }}
        </span>
      </template>

      <template #headers>
              <th>Employee</th>
              <th>Department</th>
              <th>Milestone</th>
              <th>Target Date</th>
              <th>Status</th>
              <th class="actions-heading">Actions</th>
            </template>

      <template #rows>
            <tr v-for="milestone in paginatedMilestones" :key="milestone.id">
              <!-- EMPLOYEE CELL -->
              <td class="employee-cell">
                <NuxtLink
                  :to="employeeHistoryRoute(milestone)"
                  class="employee-history-link"
                >
                  {{ milestone.employeeName }}
                </NuxtLink>
              </td>

              <!-- DEPARTMENT -->
              <td>
                <span class="dept-name">{{ milestone.department }}</span>
              </td>

              <!-- STAGE -->
              <td>
                <strong class="stage-name">{{ milestone.stageName }}</strong>
              </td>

              <!-- TARGET DATE -->
              <td>
                <strong class="target-date">{{ milestoneDateLabel(milestone) }}</strong>
              </td>

              <!-- STATUS -->
              <td>
                <span
                  class="status-badge"
                  :class="milestone.status === 'completed' ? 'completed' : 'for-completion'"
                >
                  <span class="status-dot" />
                  {{ milestone.status === 'completed' ? 'Completed' : 'Pending' }}
                </span>
              </td>

              <!-- ACTIONS -->
              <td class="actions-cell">
                <TableActionMenu
                  :items="milestoneActions"
                  :label="`Actions for ${milestone.employeeName}: ${milestone.stageName}`"
                  @select="handleMilestoneAction($event, milestone)"
                />
              </td>
            </tr>
          </template>
    </BaseDataTable>

    <!-- PAGINATION (below the table, like other modules) -->
    <div class="lc-table-footer">
        <p>
          Showing
          <strong>{{ showingFrom }}–{{ showingTo }}</strong>
          of
          <strong>{{ meta.total }}</strong>
          employee milestones
        </p>
        <AppPagination
          v-model="currentPage"
          :total-pages="totalPages"
        />
      </div>

    <dialog
      ref="detailsDialog"
      class="details-dialog"
      aria-labelledby="milestone-details-title"
      @click.self="detailsDialog?.close()"
      @close="detailsMilestone = null"
    >
      <template v-if="detailsMilestone">
        <header class="dialog-header">
          <div>
            <h2 id="milestone-details-title">Milestone Details</h2>
            <p>{{ detailsMilestone.employeeName }} (EMP-{{ detailsMilestone.employeeNumber }})</p>
          </div>
          <form method="dialog">
            <button type="submit" class="close-icon" aria-label="Close milestone details">
              <X :size="16" aria-hidden="true" />
            </button>
          </form>
        </header>
        <dl class="details-grid">
          <div v-for="detail in milestoneDetails" :key="detail.label">
            <dt>{{ detail.label }}</dt>
            <dd>{{ detail.value || '—' }}</dd>
          </div>
          <div class="details-remarks">
            <dt>HR Remarks</dt>
            <dd>{{ detailsMilestone.remarks || '—' }}</dd>
          </div>
        </dl>
      </template>
    </dialog>

    <EmploymentTypeChangeModal
      :open="employmentChangeOpen"
      :employee-id="employmentChangeEmployeeId"
      :prepare-evaluation="selectedMilestone ? prepareMilestoneEvaluation : undefined"
      :evaluation-dirty="evaluationDirty"
      :evaluation-proof-missing="!!selectedMilestone && requiresAttachment && !hasEvaluationProof"
      @close="closeEmploymentChange"
      @saved="reloadMilestones"
    >
      <template v-if="selectedMilestone" #evaluation="{ disabled }">
        <fieldset class="evaluation-panel" :disabled="disabled">
          <legend>Evaluation Proof & Completion</legend>

            <!-- MILESTONE CONTEXT CARD -->
            <div class="info-card">
              <div class="info-row">
                <span class="info-label">Milestone Stage:</span>
                <strong class="info-val">{{ selectedMilestone.stageName }}</strong>
              </div>
              <div class="info-row">
                <span class="info-label">{{ hasReviewWindow(selectedMilestone) ? 'Review Window:' : 'Target Date:' }}</span>
                <strong class="info-val">{{ milestoneDateLabel(selectedMilestone) }}</strong>
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
            <div class="form-group">
              <label class="form-label" for="milestone-evaluation-file">{{ requiresAttachment ? 'Evaluation Attachment (Required to complete milestone)' : 'Evaluation Attachment (Optional)' }}</label>

              <!-- HIDDEN FILE INPUT -->
              <input
                id="milestone-evaluation-file"
                ref="fileInputRef"
                type="file"
                class="hidden-file-input"
                accept=".pdf,.png,.jpg,.jpeg"
                tabindex="-1"
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
              <button
                v-else
                type="button"
                class="upload-dropzone"
                @click="triggerFileInput"
              >
                <UploadCloud :size="28" class="upload-icon" />
                <strong>Upload proof</strong>
                <span>PDF, PNG or JPG, up to 10 MB</span>
              </button>
            </div>

            <!-- HR REMARKS -->
            <div class="form-group">
              <label class="form-label" for="milestone-evaluation-remarks">HR Evaluation Notes / Remarks</label>
              <textarea
                id="milestone-evaluation-remarks"
                v-model="editingRemarks"
                maxlength="5000"
                rows="3"
                placeholder="Enter evaluation outcome, performance assessment notes, or supervisor remarks..."
                class="form-textarea"
              ></textarea>
            </div>
        </fieldset>
      </template>
    </EmploymentTypeChangeModal>
  </section>
</template>

<style scoped>
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

@media (max-width: 1280px) {
  .stats-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 820px) {
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
  min-width: 680px;
  border-collapse: collapse;
}

th {
  padding: 12px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 700;
  text-align: left;
  text-transform: uppercase;
  white-space: nowrap;
}

td {
  padding: 12px;
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
  min-width: 170px;
}

.employee-history-link {
  color: var(--text-primary);
  font-weight: 600;
  text-decoration: none;
}

.employee-history-link:hover {
  text-decoration: underline;
}

/* DEPARTMENT */
.dept-name {
  color: var(--text-primary);
  font-size: 10.5px;
  font-weight: 650;
  white-space: nowrap;
}

.stage-name {
  color: var(--text-primary);
  font-size: 11px;
  font-weight: 700;
}

.target-date {
  color: var(--text-primary);
  font-weight: 650;
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

/* ACTIONS */
.actions-heading,
.actions-cell {
  width: 1%;
  text-align: right;
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
.details-dialog {
  width: min(520px, calc(100% - 32px));
  max-height: 90vh;
  margin: auto;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--bg-card);
  color: var(--text-primary);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.3);
}

.details-dialog::backdrop {
  background: rgba(3, 9, 23, 0.78);
  backdrop-filter: blur(5px);
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 20px;
  margin: 0;
  padding: 20px;
  font-size: 12px;
}

.details-grid dt {
  color: var(--text-muted);
}

.details-grid dd {
  margin: 3px 0 0;
  overflow-wrap: anywhere;
  font-weight: 600;
}

.details-remarks {
  grid-column: 1 / -1;
  white-space: pre-wrap;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid var(--border-soft);
  background: var(--bg-card);
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

.evaluation-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
  margin: 18px 0;
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
}

.evaluation-panel legend {
  padding: 0 5px;
  font-size: 13px;
  font-weight: 700;
}

.text-orange {
  color: var(--orange);
}

.text-green {
  color: var(--green);
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


/* Pagination below the table card, same as other modules */
.lc-table-footer { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 13px 3px 0; }
.lc-table-footer p { margin: 0; color: var(--text-muted); font-size: 12px; }
.lc-table-footer strong { color: var(--text-primary); font-weight: 650; }
@media (max-width: 650px) { .lc-table-footer { align-items: flex-start; flex-direction: column; } }
</style>
