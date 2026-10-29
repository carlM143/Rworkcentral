
<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'

import {
  Download,
  Plus,
  X,
  Eye,
  Pencil,
  Copy,
  Save,
  FileDown,
  ClipboardList,
} from 'lucide-vue-next'

import PerformanceTemplateStats from '~/components/admin/performance/templates/PerformanceTemplateStats.vue'
import PerformanceTemplateFilters from '~/components/admin/performance/templates/PerformanceTemplateFilters.vue'
import PerformanceTemplateTable from '~/components/admin/performance/templates/PerformanceTemplateTable.vue'

import type {
  PerformanceTemplate,
  PerformanceTemplateType,
  PerformanceTemplateStatus,
} from '~/types/performanceTemplate'

definePageMeta({
  layout: 'admin',
})

const {
  search,
  templateType,
  scope,
  status,
  currentPage,
  filteredTemplates,
  stats,
  templateTypeOptions,
  scopeOptions,
  statusOptions,
  resetFilters,
} = usePerformanceTemplates()

const { info } = useToast()

type ModalMode = 'create' | 'view' | 'edit' | 'export' | null

interface TemplateForm {
  templateCode: string
  name: string
  type: string
  scope: string
  description: string
  sectionCount: number
  status: string
}

const modalMode = ref<ModalMode>(null)
const selectedTemplate = ref<PerformanceTemplate | null>(null)

const addedTemplates = ref<PerformanceTemplate[]>([])
const editedTemplates = ref<Record<string, PerformanceTemplate>>({})

const exportScope = ref<'filtered' | 'all'>('filtered')
const formError = ref('')

const createEmptyForm = (): TemplateForm => ({
  templateCode: '',
  name: '',
  type: '',
  scope: '',
  description: '',
  sectionCount: 1,
  status: 'Draft',
})

const form = ref<TemplateForm>(createEmptyForm())

// --------------------------------------------------
// OPTIONS
// --------------------------------------------------


const normalizeOptions = (options: unknown): string[] => {
  const values = unref(options)

  if (!Array.isArray(values)) {
    return []
  }

  return values
    .filter((value): value is string => typeof value === 'string')
    .filter(value => {
      const normalized = value.trim().toLowerCase()

      return (
        normalized !== 'all' &&
        !normalized.startsWith('all ')
      )
    })
}

const typeChoices = computed(() => {
  const options = normalizeOptions(templateTypeOptions)

  return [
    ...new Set([
      ...options,
      'General Review',
      'Probationary Review',
      'Leadership Review',
      'Technical Review',
      'Driver Review',
      ...(form.value.type ? [form.value.type] : []),
    ]),
  ]
})

const scopeChoices = computed(() => {
  const options = normalizeOptions(scopeOptions)

  return [
    ...new Set([
      ...options,
      ...(form.value.scope ? [form.value.scope] : []),
    ]),
  ]
})

const statusChoices = [
  'Active',
  'Draft',
  'Inactive',
  'Archived',
]

// --------------------------------------------------
// DISPLAY RECORDS
// --------------------------------------------------

const matchesFilters = (item: PerformanceTemplate) => {
  const term = search.value.trim().toLowerCase()

  const searchable = [
    item.templateCode,
    item.name,
    item.type,
    item.scope,
    item.description,
    item.createdBy,
  ].join(' ').toLowerCase()

  const matchesSelection = (selected: string, value: string) =>
    !selected ||
    selected.toLowerCase() === 'all' ||
    selected.toLowerCase().startsWith('all ') ||
    selected === value

  return (
    (!term || searchable.includes(term)) &&
    matchesSelection(templateType.value, item.type) &&
    matchesSelection(scope.value, item.scope) &&
    matchesSelection(status.value, item.status)
  )
}

const displayTemplates = computed(() => {
  const existing = filteredTemplates.value
    .map(item => editedTemplates.value[String(item.id)] ?? item)
    .filter(matchesFilters)

  const added = addedTemplates.value.filter(matchesFilters)

  return [...added, ...existing]
})

const pageSize = 6

const totalPages = computed(() =>
  Math.max(1, Math.ceil(displayTemplates.value.length / pageSize)),
)

const paginatedTemplates = computed(() => {
  const start = (currentPage.value - 1) * pageSize

  return displayTemplates.value.slice(start, start + pageSize)
})

const showingFrom = computed(() =>
  displayTemplates.value.length
    ? (currentPage.value - 1) * pageSize + 1
    : 0,
)

const showingTo = computed(() =>
  Math.min(
    currentPage.value * pageSize,
    displayTemplates.value.length,
  ),
)

watch(displayTemplates, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value
  }
})

// --------------------------------------------------
// MODALS
// --------------------------------------------------

const closeModal = () => {
  modalMode.value = null
  selectedTemplate.value = null
  formError.value = ''
}

const handleCreateTemplate = () => {
  form.value = createEmptyForm()
  selectedTemplate.value = null
  formError.value = ''
  modalMode.value = 'create'
}

const handleViewTemplate = (item: PerformanceTemplate) => {
  selectedTemplate.value = item
  modalMode.value = 'view'
}

const handleEditTemplate = (item: PerformanceTemplate) => {
  selectedTemplate.value = item

  form.value = {
    templateCode: item.templateCode,
    name: item.name,
    type: item.type,
    scope: item.scope,
    description: item.description,
    sectionCount: item.sectionCount,
    status: item.status,
  }

  formError.value = ''
  modalMode.value = 'edit'
}

const handleDuplicateTemplate = (item: PerformanceTemplate) => {
  selectedTemplate.value = null

  form.value = {
    templateCode: `${item.templateCode}-COPY`,
    name: `${item.name} (Copy)`,
    type: item.type,
    scope: item.scope,
    description: item.description,
    sectionCount: item.sectionCount,
    status: 'Draft',
  }

  formError.value = ''
  modalMode.value = 'create'
}

// --------------------------------------------------
// SAVE FRONTEND RECORD
// --------------------------------------------------

const handleSaveTemplate = () => {
  const values = form.value

  if (
    !values.templateCode.trim() ||
    !values.name.trim() ||
    !values.type ||
    !values.scope ||
    !values.description.trim()
  ) {
    formError.value = 'Please complete all required fields.'
    return
  }

  if (values.sectionCount < 1) {
    formError.value = 'Sections must be at least 1.'
    return
  }

  const isEdit = modalMode.value === 'edit'
  const selected = selectedTemplate.value

  const codeExists = [
    ...filteredTemplates.value,
    ...addedTemplates.value,
  ].some(item => {
    const current =
      editedTemplates.value[String(item.id)] ?? item

    return (
      current.templateCode.toLowerCase() ===
        values.templateCode.trim().toLowerCase() &&
      (!isEdit || current.id !== selected?.id)
    )
  })

  if (codeExists) {
    formError.value = 'Template code already exists.'
    return
  }

  const today = new Date().toISOString().slice(0, 10)

  const record = {
    ...(selected ?? {}),
    id: isEdit && selected ? selected.id : Date.now(),
    templateCode: values.templateCode.trim(),
    name: values.name.trim(),
    type: values.type as PerformanceTemplateType,
    scope: values.scope,
    description: values.description.trim(),
    sectionCount: Number(values.sectionCount),
    criteriaCount: selected?.criteriaCount ?? 0,
    scoringScale: selected?.scoringScale ?? '1–5',
    passingScore: selected?.passingScore ?? 3,
    totalWeight: selected?.totalWeight ?? 0,
    usageCount: selected?.usageCount ?? 0,
    status: values.status as PerformanceTemplateStatus,
    createdBy: selected?.createdBy ?? 'Current User',
    updatedAt: today,
  } as PerformanceTemplate

  if (isEdit && selected) {
    const key = String(selected.id)

    if (addedTemplates.value.some(item => item.id === selected.id)) {
      addedTemplates.value = addedTemplates.value.map(item =>
        item.id === selected.id ? record : item,
      )
    } else {
      editedTemplates.value[key] = record
    }
  } else {
    addedTemplates.value.unshift(record)
  }

  currentPage.value = 1

  info(
    isEdit ? 'Template Updated' : 'Template Created',
    'Changes are saved in the current frontend session only.',
  )

  closeModal()
}

// --------------------------------------------------
// CSV EXPORT
// --------------------------------------------------

const handleExport = () => {
  exportScope.value = 'filtered'
  modalMode.value = 'export'
}

const exportCsv = () => {
  const records = exportScope.value === 'filtered'
    ? displayTemplates.value
    : [
        ...addedTemplates.value,
        ...filteredTemplates.value.map(item =>
          editedTemplates.value[String(item.id)] ?? item,
        ),
      ]

  const headers = [
    'Template Code',
    'Template Name',
    'Template Type',
    'Employee Scope',
    'Description',
    'Sections',
    'Status',
    'Last Updated',
  ]

  const escapeCsv = (value: unknown) => {
    const text = String(value ?? '')

    // Prevent spreadsheet formula execution.
    const safe = /^[\s]*[=+\-@]/.test(text)
      ? `'${text}`
      : text

    return `"${safe.replace(/"/g, '""')}"`
  }

  const rows = records.map(item => [
    item.templateCode,
    item.name,
    item.type,
    item.scope,
    item.description,
    item.sectionCount,
    item.status,
    item.updatedAt,
  ])

  const csv = [
    headers.map(escapeCsv).join(','),
    ...rows.map(row => row.map(escapeCsv).join(',')),
  ].join('\r\n')

  const blob = new Blob(
    ['\uFEFF', csv],
    { type: 'text/csv;charset=utf-8;' },
  )

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = 'evaluation-templates.csv'

  document.body.appendChild(link)
  link.click()
  link.remove()

  URL.revokeObjectURL(url)

  closeModal()
}

// --------------------------------------------------
// MODAL KEYBOARD / SCROLL
// --------------------------------------------------

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && modalMode.value) {
    closeModal()
  }
}

watch(modalMode, value => {
  if (!import.meta.client) return

  document.body.style.overflow = value ? 'hidden' : ''
})

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <section class="performance-templates-page">
    <!-- HEADER -->
    <PageHeader
      title="Evaluation Templates"
      description="Manage reusable evaluation templates, employee scope and template availability."
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
          :icon="Plus"
          @click="handleCreateTemplate"
        >
          Create Template
        </AppButton>
      </div>
    </PageHeader>

    <!-- STATS -->
    <PerformanceTemplateStats :stats="stats" />

    <!-- FILTERS -->
    <PerformanceTemplateFilters
      v-model:search="search"
      v-model:template-type="templateType"
      v-model:scope="scope"
      v-model:status="status"
      :template-types="templateTypeOptions"
      :scopes="scopeOptions"
      :statuses="statusOptions"
      @reset="resetFilters"
    />

    <!-- TABLE -->
    <PerformanceTemplateTable
      :templates="paginatedTemplates"
      @view="handleViewTemplate"
      @edit="handleEditTemplate"
      @duplicate="handleDuplicateTemplate"
    />

    <!-- PAGINATION -->
    <div class="table-footer">
      <p>
        Showing
        <strong>{{ showingFrom }}–{{ showingTo }}</strong>
        of
        <strong>{{ displayTemplates.length }}</strong>
        evaluation templates
      </p>

      <AppPagination
        v-model="currentPage"
        :total-pages="totalPages"
      />
    </div>

    <!-- MODALS -->
    <Teleport to="body">
      <div
        v-if="modalMode"
        class="pt-overlay"
        @click.self="closeModal"
      >
        <div
          class="pt-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pt-modal-title"
        >
          <!-- MODAL HEADER -->
          <div class="pt-modal-header">
            <div class="pt-modal-heading">
              <div class="pt-modal-icon">
                <FileDown
                  v-if="modalMode === 'export'"
                  :size="19"
                />
                <Eye
                  v-else-if="modalMode === 'view'"
                  :size="19"
                />
                <Pencil
                  v-else-if="modalMode === 'edit'"
                  :size="19"
                />
                <ClipboardList v-else :size="19" />
              </div>

              <div>
                <h2 id="pt-modal-title">
                  {{
                    modalMode === 'export'
                      ? 'Export Evaluation Templates'
                      : modalMode === 'view'
                        ? 'View Evaluation Template'
                        : modalMode === 'edit'
                          ? 'Edit Evaluation Template'
                          : 'Create Evaluation Template'
                  }}
                </h2>

                <p>
                  {{
                    modalMode === 'export'
                      ? 'Export currently loaded template records.'
                      : modalMode === 'view'
                        ? 'Review template information.'
                        : 'Enter evaluation template details.'
                  }}
                </p>
              </div>
            </div>

            <button
              type="button"
              class="pt-close"
              aria-label="Close modal"
              @click="closeModal"
            >
              <X :size="18" />
            </button>
          </div>

          <!-- VIEW MODAL -->
          <div
            v-if="modalMode === 'view' && selectedTemplate"
            class="pt-modal-body"
          >
            <div class="pt-details">
              <div
                v-for="field in [
                  { label: 'Template Code', value: selectedTemplate.templateCode },
                  { label: 'Template Name', value: selectedTemplate.name },
                  { label: 'Template Type', value: selectedTemplate.type },
                  { label: 'Employee Scope', value: selectedTemplate.scope },
                  { label: 'Sections', value: selectedTemplate.sectionCount },
                  { label: 'Status', value: selectedTemplate.status },
                  { label: 'Created By', value: selectedTemplate.createdBy },
                  { label: 'Last Updated', value: selectedTemplate.updatedAt },
                ]"
                :key="field.label"
                class="pt-detail"
              >
                <span>{{ field.label }}</span>
                <strong>{{ field.value ?? '—' }}</strong>
              </div>

              <div class="pt-detail pt-full">
                <span>Description</span>
                <strong>
                  {{ selectedTemplate.description || '—' }}
                </strong>
              </div>
            </div>
          </div>

          <!-- CREATE / EDIT MODAL -->
          <form
            v-else-if="modalMode === 'create' || modalMode === 'edit'"
            @submit.prevent="handleSaveTemplate"
          >
            <div class="pt-modal-body">
              <div v-if="formError" class="pt-error">
                {{ formError }}
              </div>

              <div class="pt-form-grid">
                <label class="pt-field">
                  Template Code *
                  <input
                    v-model="form.templateCode"
                    placeholder="e.g. EVAL-001"
                    required
                  />
                </label>

                <label class="pt-field">
                  Template Name *
                  <input
                    v-model="form.name"
                    placeholder="Enter template name"
                    required
                  />
                </label>

                <label class="pt-field">
                  Template Type *
                  <select v-model="form.type" required>
                    <option value="" disabled>
                      Select template type
                    </option>

                    <option
                      v-for="option in typeChoices"
                      :key="option"
                      :value="option"
                    >
                      {{ option }}
                    </option>
                  </select>
                </label>

                <label class="pt-field">
                  Employee Scope *
                  <select v-model="form.scope" required>
                    <option value="" disabled>
                      Select employee scope
                    </option>

                    <option
                      v-for="option in scopeChoices"
                      :key="option"
                      :value="option"
                    >
                      {{ option }}
                    </option>
                  </select>
                </label>

                <label class="pt-field">
                  Number of Sections *
                  <input
                    v-model.number="form.sectionCount"
                    type="number"
                    min="1"
                    step="1"
                    required
                  />
                </label>

                <label class="pt-field">
                  Status *
                  <select v-model="form.status" required>
                    <option
                      v-for="option in statusChoices"
                      :key="option"
                      :value="option"
                    >
                      {{ option }}
                    </option>
                  </select>
                </label>

                <label class="pt-field pt-full">
                  Description *
                  <textarea
                    v-model="form.description"
                    rows="4"
                    placeholder="Describe the purpose of this evaluation template..."
                    required
                  />
                </label>
              </div>

              <p class="pt-note">
                Frontend demo only. Template sections and criteria
                are not yet configured through a builder.
              </p>
            </div>

            <div class="pt-modal-footer">
              <button
                type="button"
                class="pt-secondary"
                @click="closeModal"
              >
                Cancel
              </button>

              <button type="submit" class="pt-primary">
                <Save :size="15" />
                {{
                  modalMode === 'edit'
                    ? 'Save Changes'
                    : 'Create Template'
                }}
              </button>
            </div>
          </form>

          <!-- EXPORT MODAL -->
          <div
            v-else-if="modalMode === 'export'"
            class="pt-modal-body"
          >
            <p class="pt-export-description">
              Choose which template records to export as CSV.
            </p>

            <label class="pt-export-option">
              <input
                v-model="exportScope"
                type="radio"
                value="filtered"
              />

              <span>
                <strong>Filtered Records</strong>
                <small>
                  Export {{ displayTemplates.length }} records
                  matching current filters.
                </small>
              </span>
            </label>

            <label class="pt-export-option">
              <input
                v-model="exportScope"
                type="radio"
                value="all"
              />

              <span>
                <strong>Currently Loaded Records</strong>
                <small>
                  Export available frontend records.
                  This is not a database-wide export.
                </small>
              </span>
            </label>
          </div>

          <!-- VIEW / EXPORT FOOTER -->
          <div
            v-if="modalMode === 'view' || modalMode === 'export'"
            class="pt-modal-footer"
          >
            <button
              type="button"
              class="pt-secondary"
              @click="closeModal"
            >
              Close
            </button>

            <button
              v-if="modalMode === 'view' && selectedTemplate"
              type="button"
              class="pt-primary"
              @click="handleEditTemplate(selectedTemplate)"
            >
              <Pencil :size="15" />
              Edit Template
            </button>

            <button
              v-if="modalMode === 'export'"
              type="button"
              class="pt-primary"
              @click="exportCsv"
            >
              <Download :size="15" />
              Export CSV
            </button>
          </div>
        </div>
      </div>
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
    flex-direction: column;
    align-items: stretch;
  }

  .table-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

<style>
/* BACKDROP */
.pt-overlay {
  position: fixed;
  inset: 0;
  z-index: 100000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(3, 9, 22, 0.67);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

/* MODAL */
.pt-modal {
  width: 100%;
  max-width: 690px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--bg-card);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.35);
}

/* HEADER */
.pt-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
}

.pt-modal-heading {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pt-modal-icon {
  display: flex;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: var(--primary-soft);
  color: var(--primary);
}

.pt-modal-header h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 17px;
  font-weight: 700;
}

.pt-modal-header p {
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: 11px;
}

.pt-close {
  display: flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
}

.pt-close:hover {
  border-color: var(--border);
  background: var(--bg-card-soft);
}

/* BODY */
.pt-modal-body {
  padding: 24px;
}

.pt-details,
.pt-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.pt-detail,
.pt-field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.pt-detail span {
  color: var(--text-muted);
  font-size: 11px;
}

.pt-detail strong {
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.pt-full {
  grid-column: 1 / -1;
}

.pt-field {
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 600;
}

.pt-field input,
.pt-field select,
.pt-field textarea {
  width: 100%;
  min-height: 39px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  outline: none;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 11px;
  font-weight: 400;
}

.pt-field textarea {
  resize: vertical;
}

.pt-field input:focus,
.pt-field select:focus,
.pt-field textarea:focus {
  border-color: var(--primary);
}

.pt-field input::placeholder,
.pt-field textarea::placeholder {
  color: var(--text-muted);
}

.pt-error {
  margin-bottom: 16px;
  padding: 11px 13px;
  border: 1px solid var(--red);
  border-radius: 8px;
  background: var(--red-soft);
  color: var(--red);
  font-size: 11px;
}

.pt-note {
  margin: 17px 0 0;
  color: var(--text-muted);
  font-size: 10px;
  line-height: 1.5;
}

/* EXPORT */
.pt-export-description {
  margin: 0 0 16px;
  color: var(--text-secondary);
  font-size: 12px;
}

.pt-export-option {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-top: 10px;
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card-soft);
  cursor: pointer;
}

.pt-export-option input {
  margin-top: 3px;
  accent-color: var(--primary);
}

.pt-export-option span {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.pt-export-option strong {
  color: var(--text-primary);
  font-size: 12px;
}

.pt-export-option small {
  color: var(--text-muted);
  font-size: 10px;
}

/* FOOTER */
.pt-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid var(--border);
}

.pt-secondary,
.pt-primary {
  display: inline-flex;
  min-height: 38px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 17px;
  border-radius: 8px;
  font-family: inherit;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.pt-secondary {
  border: 1px solid var(--border);
  background: var(--bg-card-soft);
  color: var(--text-primary);
}

.pt-primary {
  border: 1px solid var(--primary);
  background: var(--primary);
  color: #fff;
}

.pt-secondary:hover {
  filter: brightness(1.08);
}

.pt-primary:hover {
  filter: brightness(1.1);
}

@media (max-width: 650px) {
  .pt-overlay {
    padding: 12px;
  }

  .pt-modal {
    max-height: 94vh;
  }

  .pt-modal-body {
    padding: 18px;
  }

  .pt-details,
  .pt-form-grid {
    grid-template-columns: 1fr;
  }

  .pt-modal-footer {
    flex-wrap: wrap;
  }
}
</style>
