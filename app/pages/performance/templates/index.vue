<script setup lang="ts">
import {
  Download,
  Plus,
  X,
  FileText,
  Trash2,
  Upload,
  FileSpreadsheet,
  Table2,
} from 'lucide-vue-next'
import PerformanceTemplateTable from '~/components/performance/templates/PerformanceTemplateTable.vue'
import type { PerformanceTemplate, TemplatePayload } from '~/types/performanceTemplate'

const {
  templates,
  search,
  department,
  currentPage,
  departmentOptions,
  filteredTemplates,
  paginatedTemplates,
  totalPages,
  showingFrom,
  showingTo,
  resetFilters,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} = usePerformanceTemplates()

const { info, success, warning } = useToast()
const { departments } = useDepartments()
const { positions } = usePositions()

type Dialog = 'create' | 'view' | 'edit' | 'delete' | 'export' | null
const dialog = ref<Dialog>(null)
const selected = ref<PerformanceTemplate | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const file = shallowRef<File | null>(null)
const exportFormat = ref<'excel' | 'pdf' | 'csv'>('excel')
const errorMessage = ref('')

const form = reactive({
  company: 'RWorkCentral Inc.',
  department: 'All Departments',
  position: 'All Positions',
})

const departmentsList = computed(() => [
  'All Departments',
  ...new Set(departments.value.map(item => item.name)),
])

const positionList = computed(() => {
  if (form.department === 'All Departments') return ['All Positions']

  return [
    'All Positions',
    ...new Set(
      positions.value
        .filter(item => item.department === form.department)
        .map(item => item.name),
    ),
  ]
})

watch(() => form.department, () => {
  form.position = 'All Positions'
})

const clearForm = () => {
  form.company = 'RWorkCentral Inc.'
  form.department = 'All Departments'
  form.position = 'All Positions'
  file.value = null
  errorMessage.value = ''

  if (fileInput.value) fileInput.value.value = ''
}

const openCreate = () => {
  selected.value = null
  clearForm()
  dialog.value = 'create'
}

const openView = (item: PerformanceTemplate) => {
  selected.value = item
  dialog.value = 'view'
}

const openEdit = (item: PerformanceTemplate) => {
  selected.value = item
  clearForm()
  form.company = item.company
  form.department = item.department
  nextTick(() => {
    form.position = item.position
  })
  dialog.value = 'edit'
}

const openDelete = (item: PerformanceTemplate) => {
  selected.value = item
  dialog.value = 'delete'
}

const closeModal = () => {
  dialog.value = null
  file.value = null
  errorMessage.value = ''
}

const handleFile = (event: Event) => {
  const input = event.target as HTMLInputElement
  const nextFile = input.files?.[0]
  errorMessage.value = ''

  if (!nextFile) {
    file.value = null
    return
  }

  const validExtensions = /\.(pdf|docx)$/i.test(nextFile.name)
  if (!validExtensions) {
    errorMessage.value = 'Please select a PDF or DOCX document.'
    input.value = ''
    file.value = null
    return
  }

  if (nextFile.size > 10 * 1024 * 1024) {
    errorMessage.value = 'Maximum file size is 10 MB.'
    input.value = ''
    file.value = null
    return
  }

  file.value = nextFile
}

const saveTemplate = () => {
  errorMessage.value = ''

  if (!form.company.trim() || !form.department || !form.position) {
    errorMessage.value = 'Complete the company, department and position fields.'
    return
  }

  if (dialog.value === 'create' && !file.value) {
    errorMessage.value = 'Attach a PDF or DOCX evaluation document.'
    return
  }

  if (dialog.value === 'edit' && !selected.value) return

  const previous = selected.value
  const payload: TemplatePayload = {
    company: form.company.trim(),
    department: form.department,
    position: form.position,
    documentName: file.value?.name ?? previous?.documentName ?? '',
    documentType: file.value?.type ?? previous?.documentType ?? '',
    documentSize: file.value?.size ?? previous?.documentSize ?? 0,
    documentUrl: file.value
      ? URL.createObjectURL(file.value)
      : previous?.documentUrl,
  }

  if (dialog.value === 'edit' && previous) {
    updateTemplate(previous.id, payload)
    if (file.value && previous.documentUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previous.documentUrl)
    }
    success('Template Updated', 'Changes saved in local mock data.')
  } else {
    createTemplate(payload)
    success('Template Created', 'Template added to local mock data.')
  }

  closeModal()
}

const downloadDocument = (item: PerformanceTemplate) => {
  if (!item.documentUrl) {
    info('Document Unavailable', 'Sample record only. No actual file has been uploaded.')
    return
  }

  const anchor = document.createElement('a')
  anchor.href = item.documentUrl
  anchor.download = item.documentName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
}

const confirmDelete = () => {
  if (!selected.value) return

  deleteTemplate(selected.value.id)
  if (selected.value.documentUrl?.startsWith('blob:')) {
    URL.revokeObjectURL(selected.value.documentUrl)
  }

  warning('Template Deleted', 'Template removed from local mock data.')
  closeModal()
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') closeModal()
}

onMounted(() => window.addEventListener('keydown', handleEscape))
onBeforeUnmount(() => window.removeEventListener('keydown', handleEscape))
</script>

<template>
  <section class="performance-templates-page">
    <PageHeader
      title="Evaluation Templates"
      description="Manage evaluation documents by company, department and position."
    >
      <div class="header-actions">
        <AppButton variant="secondary" :icon="Download" @click="dialog = 'export'">
          Export
        </AppButton>
        <AppButton :icon="Plus" @click="openCreate">
          Create Template
        </AppButton>
      </div>
    </PageHeader>

    <div class="template-overview">
      <div class="overview-item">
        <span>Total Templates</span>
        <strong>{{ templates.length }}</strong>
        <small>Evaluation documents listed</small>
      </div>
      <div class="overview-item">
        <span>Departments Covered</span>
        <strong>{{ new Set(templates.map(item => item.department)).size }}</strong>
        <small>Department assignments</small>
      </div>
      <div class="overview-item">
        <span>Files Attached</span>
        <strong>{{ templates.filter(item => item.documentUrl).length }}</strong>
        <small>Files uploaded in this session</small>
      </div>
    </div>

    <div class="template-filters">
      <div class="search-holder">
        <input
          v-model="search"
          aria-label="Search templates"
          placeholder="Search company, department, position or document..."
        >
      </div>
      <select v-model="department" aria-label="Filter department">
        <option value="">All Departments</option>
        <option v-for="option in departmentOptions" :key="option" :value="option">
          {{ option }}
        </option>
      </select>
      <button type="button" class="ui-button" @click="resetFilters">
        Reset Filters
      </button>
    </div>

    <PerformanceTemplateTable
      :templates="paginatedTemplates"
      @view="openView"
      @edit="openEdit"
      @delete="openDelete"
      @download="downloadDocument"
    />

    <div class="table-footer">
      <p>
        Showing <strong>{{ showingFrom }}–{{ showingTo }}</strong>
        of <strong>{{ filteredTemplates.length }}</strong> evaluation templates
      </p>
      <AppPagination v-model="currentPage" :total-pages="totalPages" />
    </div>

    <Teleport to="body">
      <Transition name="template-modal">
        <div
          v-if="dialog"
          class="template-modal-overlay"
          @click.self="closeModal"
        >
          <div class="template-dialog" role="dialog" aria-modal="true" aria-label="Evaluation template dialog">
            <div class="modal-heading">
              <div class="modal-heading-left">
                <div class="heading-icon">
                  <FileText :size="18" />
                </div>
                <div>
                  <h2>
                    {{ dialog === 'create' ? 'Create Evaluation Template'
                      : dialog === 'edit' ? 'Edit Evaluation Template'
                      : dialog === 'view' ? 'Evaluation Template Details'
                      : dialog === 'delete' ? 'Delete Evaluation Template'
                      : 'Export Evaluation Templates' }}
                  </h2>
                  <p>Evaluation document management</p>
                </div>
              </div>
              <button type="button" class="close-button" aria-label="Close" @click="closeModal">
                <X :size="17" />
              </button>
            </div>

            <form v-if="dialog === 'create' || dialog === 'edit'" @submit.prevent="saveTemplate">
              <div class="modal-body">
                <div class="form-grid">
                  <label class="field full">
                    <span>Company *</span>
                    <input v-model="form.company" maxlength="100" required placeholder="Company name">
                  </label>
                  <label class="field">
                    <span>Department *</span>
                    <select v-model="form.department">
                      <option v-for="option in departmentsList" :key="option" :value="option">
                        {{ option }}
                      </option>
                    </select>
                  </label>
                  <label class="field">
                    <span>Position *</span>
                    <select v-model="form.position">
                      <option v-for="option in positionList" :key="option" :value="option">
                        {{ option }}
                      </option>
                    </select>
                  </label>
                  <label class="field full">
                    <span>{{ dialog === 'edit' ? 'Replace Document (Optional)' : 'Evaluation Document *' }}</span>
                    <input
                      ref="fileInput"
                      type="file"
                      accept=".pdf,.docx"
                      :required="dialog === 'create'"
                      @change="handleFile"
                    >
                    <small>PDF or DOCX only, maximum 10 MB. Browser session only.</small>
                    <small v-if="dialog === 'edit' && selected && !file">
                      Current: {{ selected.documentName }}
                    </small>
                  </label>
                </div>
                <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>
                <p class="modal-note">
                  Frontend mock only. Files and changes are not saved to Laravel yet.
                </p>
              </div>
              <div class="modal-footer">
                <button type="button" class="ui-button" @click="closeModal">Cancel</button>
                <button type="submit" class="ui-button primary">
                  <Upload :size="15" />
                  {{ dialog === 'edit' ? 'Save Changes' : 'Create Template' }}
                </button>
              </div>
            </form>

            <template v-else-if="dialog === 'view' && selected">
              <div class="modal-body">
                <div class="detail-grid">
                  <div><span>Company</span><strong>{{ selected.company }}</strong></div>
                  <div><span>Department</span><strong>{{ selected.department }}</strong></div>
                  <div><span>Position</span><strong>{{ selected.position }}</strong></div>
                  <div><span>Document</span><strong>{{ selected.documentName }}</strong></div>
                </div>
                <p class="modal-note">
                  {{ selected.documentUrl
                    ? 'The uploaded document is available in this browser session.'
                    : 'This sample record has no attached file to download.' }}
                </p>
              </div>
              <div class="modal-footer">
                <button type="button" class="ui-button" @click="closeModal">Close</button>
                <button
                  type="button"
                  class="ui-button primary"
                  :disabled="!selected.documentUrl"
                  @click="downloadDocument(selected)"
                >
                  <Download :size="15" /> Download
                </button>
              </div>
            </template>

            <template v-else-if="dialog === 'delete' && selected">
              <div class="modal-body">
                <p class="confirmation-text">
                  Delete <strong>{{ selected.documentName }}</strong> assigned to
                  {{ selected.department }} / {{ selected.position }}?
                </p>
                <p class="modal-note">This removes the template from mock data.</p>
              </div>
              <div class="modal-footer">
                <button type="button" class="ui-button" @click="closeModal">Cancel</button>
                <button type="button" class="ui-button danger" @click="confirmDelete">
                  <Trash2 :size="15" /> Delete Template
                </button>
              </div>
            </template>

            <template v-else-if="dialog === 'export'">
              <div class="modal-body">
                <div class="export-stats">
                  <div><span>Total</span><strong>{{ templates.length }}</strong></div>
                  <div><span>Filtered</span><strong>{{ filteredTemplates.length }}</strong></div>
                </div>
                <p class="field-title">Export Format</p>
                <div class="export-options">
                  <button type="button" :class="{ selected: exportFormat === 'excel' }" @click="exportFormat = 'excel'">
                    <FileSpreadsheet :size="20" />
                    <strong>Excel</strong>
                    <small>Spreadsheet report</small>
                  </button>
                  <button type="button" :class="{ selected: exportFormat === 'pdf' }" @click="exportFormat = 'pdf'">
                    <FileText :size="20" />
                    <strong>PDF</strong>
                    <small>Printable report</small>
                  </button>
                  <button type="button" :class="{ selected: exportFormat === 'csv' }" @click="exportFormat = 'csv'">
                    <Table2 :size="20" />
                    <strong>CSV</strong>
                    <small>Raw data</small>
                  </button>
                </div>
                <p class="modal-note">
                  Included: Company, Department, Position, Document. Export is UI only for now.
                </p>
              </div>
              <div class="modal-footer">
                <button type="button" class="ui-button" @click="closeModal">Cancel</button>
                <button type="button" class="ui-button primary" disabled>
                  <Download :size="15" /> Export {{ exportFormat.toUpperCase() }}
                </button>
              </div>
            </template>
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<style scoped>
.performance-templates-page {
  width: 100%;
  max-width: 1660px;
  margin: 0 auto;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.template-overview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 12px;
}
.overview-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 17px;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--bg-card);
}
.overview-item span {
  color: var(--text-secondary);
  font-size: 10px;
}
.overview-item strong {
  color: var(--text-primary);
  font-size: 22px;
}
.overview-item small {
  color: var(--text-muted);
  font-size: 9px;
}
.template-filters {
  display: flex;
  gap: 9px;
  padding: 10px;
  margin-bottom: 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
}
.search-holder {
  flex: 1;
  min-width: 0;
}
.search-holder input, .template-filters select {
  width: 100%;
  min-height: 37px;
  padding: 0 11px;
  border: 1px solid var(--border);
  border-radius: 7px;
  outline: none;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font-size: 11px;
}
.template-filters select {
  max-width: 215px;
}
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  padding: 13px 3px 0;
}
.table-footer p {
  margin: 0;
  color: var(--text-muted);
  font-size: 10px;
}
.table-footer strong {
  color: var(--text-primary);
}
.ui-button {
  display: inline-flex;
  min-height: 36px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: transparent;
  color: var(--text-primary);
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
}
.ui-button.primary {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}
.ui-button.danger {
  background: var(--red);
  border-color: var(--red);
  color: white;
}
.ui-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
.template-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  background: rgba(2, 9, 22, .75);
  backdrop-filter: blur(5px);
}
.template-dialog {
  width: 100%;
  max-width: 570px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
  box-shadow: 0 24px 70px rgba(0,0,0,.28);
}
.modal-heading {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 15px 17px;
  border-bottom: 1px solid var(--border);
}
.modal-heading-left {
  display: flex;
  gap: 11px;
  align-items: center;
}
.heading-icon {
  display: flex;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--primary-soft);
  color: var(--primary);
}
.modal-heading h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 12px;
}
.modal-heading p {
  margin: 4px 0 0;
  color: var(--text-muted);
  font-size: 9px;
}
.close-button {
  width: 28px;
  height: 28px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: transparent;
  color: var(--text-secondary);
}
.modal-body {
  padding: 17px;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
}
.field.full {
  grid-column: 1 / -1;
}
.field span, .field-title {
  color: var(--text-primary);
  font-size: 10px;
  font-weight: 650;
}
.field input, .field select {
  width: 100%;
  min-height: 39px;
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font-size: 11px;
}
.field small {
  color: var(--text-muted);
  font-size: 9px;
}
.form-error {
  color: var(--red);
  font-size: 10px;
}
.modal-note {
  padding: 11px;
  border: 1px solid var(--border-soft);
  border-radius: 7px;
  background: var(--bg-card-soft);
  color: var(--text-muted);
  font-size: 9px;
  line-height: 1.5;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 13px 17px;
  border-top: 1px solid var(--border);
}
.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.detail-grid div, .export-stats div {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
}
.detail-grid span, .export-stats span {
  color: var(--text-muted);
  font-size: 9px;
}
.detail-grid strong, .export-stats strong {
  overflow-wrap: anywhere;
  color: var(--text-primary);
  font-size: 11px;
}
.confirmation-text {
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.7;
}
.export-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.export-options {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}
.export-options button {
  display: flex;
  min-height: 100px;
  flex-direction: column;
  align-items: flex-start;
  gap: 7px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  text-align: left;
}
.export-options button.selected {
  border-color: var(--primary);
  background: var(--primary-soft);
  color: var(--primary);
}
.export-options strong {
  font-size: 10px;
}
.export-options small {
  color: var(--text-muted);
  font-size: 8px;
}
.template-modal-enter-active, .template-modal-leave-active {
  transition: opacity .16s ease;
}
.template-modal-enter-from, .template-modal-leave-to {
  opacity: 0;
}
@media (max-width: 650px) {
  .header-actions, .table-footer, .template-filters {
    flex-direction: column;
    align-items: stretch;
  }
  .template-overview {
    grid-template-columns: 1fr;
  }
  .template-filters select {
    max-width: none;
  }
  .form-grid, .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
