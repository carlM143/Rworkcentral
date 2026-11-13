<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Coins,
  Download,
  Filter,
  Info,
  Landmark,
  Layers,
  MoreHorizontal,
  Pencil,
  Percent,
  Plus,
  Search,
  Table,
  Trash2,
  X,
} from 'lucide-vue-next'
import type { ContributionFrequency } from '~/composables/admin/contribution/useContributionRateScheduleApi'

// =====================================================
// TYPES
// =====================================================

type Row = Record<string, string | number | boolean | null>

type MethodKey = 'percentage' | 'fixed' | 'bracket'

type Field = {
  key: string
  label: string
  type?: 'text' | 'number' | 'date' | 'select'
  options?: string[]
  optionLabels?: Record<string, string>
  required?: boolean
  hint?: string
  methods?: MethodKey[]
}

type Column = {
  key: string
  label: string
  format?: 'status'
}

// =====================================================
// CONFIG
// =====================================================

const title = 'Contribution Rate'
const subtitle = 'How each government contribution is computed. Add a new version only when the government changes the rates.'

const { contributionTypes, loadContributionTypes } = useContributionTypes()

const {
  rateSchedules,
  errorMessage,
  loadRateSchedules,
  createRateSchedule,
  updateRateSchedule,
  deleteRateSchedule,
} = useContributionRateSchedules()

const typeOptions = computed(() => contributionTypes.value.map(type => String(type.id)))

const typeLabels = computed<Record<string, string>>(() =>
  Object.fromEntries(
    contributionTypes.value.map(type => [
      String(type.id),
      `${type.contribution_code} — ${type.contribution_name}`,
    ]),
  ),
)

const columns: Column[] = [
  { key: 'type_name', label: 'Contribution' },
  { key: 'method_label', label: 'Calculation' },
  { key: 'salary_basis', label: 'Salary Basis' },
  { key: 'employee_display', label: 'Employee Share' },
  { key: 'employer_display', label: 'Employer Share' },
  { key: 'salary_range', label: 'Salary Coverage' },
  { key: 'effective_from', label: 'Effective From' },
  { key: 'effective_to', label: 'Effective To' },
  { key: 'status', label: 'Status', format: 'status' },
]

// =====================================================
// CALCULATION METHODS
// =====================================================

const methodOptions: { key: MethodKey, label: string, tagline: string, description: string, icon: typeof Percent }[] = [
  {
    key: 'percentage',
    label: 'Percentage',
    tagline: 'Based on salary percentage',
    description: 'A percentage of the employee\'s monthly basic salary, within the minimum and maximum salary.',
    icon: Percent,
  },
  {
    key: 'fixed',
    label: 'Fixed',
    tagline: 'Fixed contribution amount',
    description: 'The same amount for every employee, regardless of salary.',
    icon: Coins,
  },
  {
    key: 'bracket',
    label: 'Bracket',
    tagline: 'Based on salary ranges',
    description: 'The employee\'s salary range decides the contribution. Ranges are set in Bracket Management.',
    icon: Layers,
  },
]

const methodLabels: Record<string, string> = {
  percentage: 'Percentage',
  fixed: 'Fixed',
  bracket: 'Bracket',
}

const frequencyLabels: Record<string, string> = {
  monthly: 'Monthly',
  semi_monthly: 'Semi-Monthly',
  weekly: 'Weekly',
  per_payroll: 'Every Payroll',
}

const SALARY_BASES = ['Monthly Basic Salary', 'Monthly Salary Credit', 'Monthly Fund Salary', 'Gross Pay']

// =====================================================
// MODAL STATE
// =====================================================

const modalOpen = ref(false)
const editingId = ref<number | null>(null)
const deletingId = ref<number | null>(null)
const saving = ref(false)
const localError = ref('')

const bracketPromptOpen = ref(false)
const bracketPromptSchedule = ref<{ id: number | null, typeName: string } | null>(null)

const form = ref<Row>({})

const isEditing = computed(() => editingId.value !== null)
const currentMethod = computed(() => String(form.value.method ?? 'percentage') as MethodKey)
const currentMethodOption = computed(() => methodOptions.find(o => o.key === currentMethod.value))

// Latest existing schedule of a contribution (the version a new one replaces)
const latestScheduleFor = (typeId: Row[string] | undefined) =>
  rateSchedules.value
    .filter(s => String(s.contribution_type_id) === String(typeId))
    .slice()
    .sort((a, b) => String(b.effective_from ?? '').localeCompare(String(a.effective_from ?? '')))[0] ?? null

const previousVersion = computed(() => (isEditing.value ? null : latestScheduleFor(form.value.type)))

// The method can only be chosen for a contribution's very first schedule.
const methodLocked = computed(() => isEditing.value || previousVersion.value !== null)

const salaryBasisOptions = computed(() => {
  const current = String(form.value.salary_basis ?? '')
  return current && !SALARY_BASES.includes(current) ? [current, ...SALARY_BASES] : SALARY_BASES
})

const fields = computed<Field[]>(() => [

  // Percentage
  { key: 'employee_rate', label: 'Employee Rate (%)', type: 'number', required: true, hint: 'Deducted from the employee', methods: ['percentage'] },
  { key: 'employer_rate', label: 'Employer Rate (%)', type: 'number', required: true, hint: 'Paid by the company', methods: ['percentage'] },

  // Fixed
  { key: 'employee_amount', label: 'Employee Amount (₱)', type: 'number', required: true, hint: 'Deducted from the employee', methods: ['fixed'] },
  { key: 'employer_amount', label: 'Employer Amount (₱)', type: 'number', required: true, hint: 'Paid by the company', methods: ['fixed'] },
  { key: 'frequency', label: 'Frequency', type: 'select', options: Object.keys(frequencyLabels), optionLabels: frequencyLabels, required: true, hint: 'How often the amount applies', methods: ['fixed'] },

    // Salary coverage (percentage only; bracket limits come from the brackets)
  { key: 'minimum_salary_base', label: 'Minimum Salary (₱)', type: 'number', hint: 'Lower salaries are computed as this amount', methods: ['percentage'] },
  { key: 'maximum_salary_base', label: 'Maximum Salary (₱)', type: 'number', hint: 'Higher salaries are computed as this amount', methods: ['percentage'] },

  // Common
  { key: 'effective_from', label: 'Effective From', type: 'date', required: true, hint: isEditing.value ? 'Starting date' : 'First payroll date the new rates apply' },
  { key: 'effective_to', label: 'Effective To', type: 'date', hint: 'Leave empty if still in use' },
  { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'], required: true },
])

const activeFields = computed(() =>
  fields.value.filter(field => !field.methods || field.methods.includes(currentMethod.value)),
)

// =====================================================
// FORMATTERS
// =====================================================

const numberOrNull = (value: Row[string] | undefined) => {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

const peso = (value: Row[string] | undefined) => {
  const n = numberOrNull(value)
  if (n === null) return '—'
  return '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const pct = (value: Row[string] | undefined) => {
  const n = numberOrNull(value)
  return n === null ? '—' : `${Number(n.toFixed(5))}%`
}

const contributionDisplay = (method: string, rate: Row[string], amount: Row[string], frequency: Row[string], brackets?: number) => {
  if (method === 'percentage') return pct(rate)
  if (method === 'fixed') {
    const freq = frequency ? ` / ${frequencyLabels[String(frequency)] ?? frequency}` : ''
    return `${peso(amount)}${freq}`
  }
  return brackets ? `By bracket (${brackets})` : 'By bracket — not set'
}

const salaryRangeDisplay = (method: string, min: Row[string], max: Row[string]) => {
  if (method === 'fixed') return 'Any salary'
  const lo = numberOrNull(min)
  const hi = numberOrNull(max)
  if (lo === null && hi === null) return 'All salaries'
  if (hi === null) return `${peso(lo)} and above`
  if (lo === null) return `Up to ${peso(hi)}`
  return `${peso(lo)} – ${peso(hi)}`
}

const fmt = (value: Row[string] | undefined) =>
  value === null || value === undefined || value === '' ? '—' : String(value)

// =====================================================
// TABLE DATA
// =====================================================

const records = computed<Row[]>(() =>
  rateSchedules.value.map(item => ({
    id: item.id,
    type: String(item.contribution_type_id),
    type_name: typeLabels.value[String(item.contribution_type_id)] ?? String(item.contribution_type_id),
    method: item.calculation_method,
    method_label: methodLabels[item.calculation_method] ?? item.calculation_method,
    salary_basis: item.calculation_method === 'fixed' ? null : item.salary_basis,
    employee_rate: item.employee_rate,
    employer_rate: item.employer_rate,
    employee_amount: item.employee_amount,
    employer_amount: item.employer_amount,
    frequency: item.frequency,
    brackets_count: item.brackets_count ?? 0,
    employee_display: contributionDisplay(item.calculation_method, item.employee_rate, item.employee_amount, item.frequency, item.brackets_count),
    employer_display: contributionDisplay(item.calculation_method, item.employer_rate, item.employer_amount, item.frequency, item.brackets_count),
    salary_range: salaryRangeDisplay(item.calculation_method, item.minimum_salary_base, item.maximum_salary_base),
    minimum_salary_base: item.minimum_salary_base,
    maximum_salary_base: item.maximum_salary_base,
    effective_from: item.effective_from?.slice(0, 10) ?? '',
    effective_to: item.effective_to?.slice(0, 10) ?? null,
    status: item.is_status ? 'Active' : 'Inactive',
  })),
)

const search = ref('')
const filterStatus = ref('all')
const page = ref(1)
const perPage = 6

const filtered = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  return records.value.filter((row) => {
    const matchesSearch = !keyword || Object.values(row).some(value =>
      String(value ?? '').toLowerCase().includes(keyword),
    )

    const matchesStatus =
      filterStatus.value === 'all'
      || (filterStatus.value === 'active' ? row.status === 'Active' : row.status === 'Inactive')

    return matchesSearch && matchesStatus
  })
})

const activeCount = computed(() => records.value.filter(row => row.status === 'Active').length)
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage)))
const visibleRows = computed(() => filtered.value.slice((page.value - 1) * perPage, page.value * perPage))
const paginationStart = computed(() => (filtered.value.length === 0 ? 0 : (page.value - 1) * perPage + 1))
const paginationEnd = computed(() => Math.min(page.value * perPage, filtered.value.length))

const pageNumbers = computed(() => {
  const total = totalPages.value
  const start = Math.max(1, Math.min(page.value - 2, total - 4))
  const end = Math.min(total, start + 4)
  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
})

watch([search, filterStatus], () => {
  page.value = 1
  closeActions()
})

watch(page, () => closeActions())

watch(totalPages, (total) => {
  if (page.value > total) page.value = total
})

// =====================================================
// THREE-DOTS DROPDOWN
// =====================================================

const openActionId = ref<number | null>(null)
const actionButtonRef = ref<HTMLElement | null>(null)
const actionPosition = ref({ top: 0, left: 0 })

const closeActions = () => {
  openActionId.value = null
  actionButtonRef.value = null
}

const updateActionPosition = () => {
  if (!actionButtonRef.value) return

  const rect = actionButtonRef.value.getBoundingClientRect()
  const menuWidth = 230
  const menuHeight = 150
  const gap = 6

  const left = Math.max(8, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8))
  const showAbove = rect.bottom + menuHeight + gap > window.innerHeight
  const top = showAbove ? rect.top - menuHeight - gap : rect.bottom + gap

  actionPosition.value = { top: Math.max(8, top), left }
}

const toggleActions = async (id: number, event: MouseEvent) => {
  if (openActionId.value === id) {
    closeActions()
    return
  }

  actionButtonRef.value = event.currentTarget as HTMLElement
  openActionId.value = id

  await nextTick()
  updateActionPosition()
}

const handleDocumentClick = (event: MouseEvent) => {
  const target = event.target
  if (!(target instanceof Element)) return
  if (target.closest('.cw-more-btn') || target.closest('.cw-action-dropdown')) return
  closeActions()
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key !== 'Escape') return
  closeActions()
  modalOpen.value = false
  deletingId.value = null
}

const selectedActionRecord = computed(() =>
  records.value.find(row => Number(row.id) === openActionId.value) ?? null,
)

onMounted(async () => {
  document.addEventListener('click', handleDocumentClick)
  document.addEventListener('keydown', handleEscape)
  window.addEventListener('scroll', closeActions, true)
  window.addEventListener('resize', closeActions)

  await Promise.all([loadContributionTypes(), loadRateSchedules()])
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
  document.removeEventListener('keydown', handleEscape)
  window.removeEventListener('scroll', closeActions, true)
  window.removeEventListener('resize', closeActions)
})

// =====================================================
// FORM ACTIONS
// =====================================================

const prefillFrom = (typeId: Row[string] | undefined) => {
  const type = typeId ?? ''
  const prev = latestScheduleFor(type)

  if (!prev) {
    form.value = {
      type,
      method: 'percentage',
      salary_basis: 'Monthly Basic Salary',
      frequency: 'monthly',
      effective_from: '',
      effective_to: null,
      status: 'Active',
    }
    return
  }

  form.value = {
    type,
    method: prev.calculation_method,
    salary_basis: prev.salary_basis ?? 'Monthly Basic Salary',
    employee_rate: prev.employee_rate,
    employer_rate: prev.employer_rate,
    employee_amount: prev.employee_amount,
    employer_amount: prev.employer_amount,
    frequency: prev.frequency ?? 'monthly',
    minimum_salary_base: prev.minimum_salary_base,
    maximum_salary_base: prev.maximum_salary_base,
    effective_from: '',
    effective_to: null,
    status: 'Active',
  }
}

const startAdd = () => {
  closeActions()
  localError.value = ''
  editingId.value = null
  prefillFrom(typeOptions.value[0] ?? '')
  modalOpen.value = true
}

const startEdit = () => {
  const record = selectedActionRecord.value
  closeActions()
  if (!record) return

  localError.value = ''
  editingId.value = Number(record.id)
  form.value = { ...record }
  modalOpen.value = true
}

watch(
  () => form.value.type,
  (typeId, oldTypeId) => {
    if (!modalOpen.value || isEditing.value || typeId === oldTypeId || oldTypeId === undefined) return
    prefillFrom(typeId)
  },
)

const selectMethod = (method: MethodKey) => {
  if (methodLocked.value) return
  form.value = { ...form.value, method }
}

const closeForm = () => {
  modalOpen.value = false
  editingId.value = null
  localError.value = ''
  form.value = {}
}

const save = async () => {
  localError.value = ''

  const missing = activeFields.value.find((field) => {
    if (!field.required) return false
    const value = form.value[field.key]
    return value === undefined || value === null || String(value).trim() === ''
  })

  if (missing) {
    localError.value = `${missing.label} is required.`
    return
  }

  const method = currentMethod.value
  const body = {
    contribution_type_id: Number(form.value.type),
    calculation_method: method,
    salary_basis: method !== 'fixed' ? String(form.value.salary_basis ?? '') : null,
    employee_rate: method === 'percentage' ? numberOrNull(form.value.employee_rate) : null,
    employer_rate: method === 'percentage' ? numberOrNull(form.value.employer_rate) : null,
    employee_amount: method === 'fixed' ? numberOrNull(form.value.employee_amount) : null,
    employer_amount: method === 'fixed' ? numberOrNull(form.value.employer_amount) : null,
    frequency: method === 'fixed' ? (String(form.value.frequency ?? 'monthly') as ContributionFrequency) : null,
    minimum_salary_base: method !== 'fixed' ? numberOrNull(form.value.minimum_salary_base) : null,
    maximum_salary_base: method !== 'fixed' ? numberOrNull(form.value.maximum_salary_base) : null,
    effective_from: String(form.value.effective_from ?? ''),
    effective_to: form.value.effective_to ? String(form.value.effective_to) : null,
    is_status: form.value.status === 'Active',
  }

  saving.value = true

  try {
    const wasNew = !isEditing.value
    const result = isEditing.value
      ? await updateRateSchedule(editingId.value as number, body)
      : await createRateSchedule(body)

    await loadRateSchedules()

    if (wasNew && method === 'bracket') {
      bracketPromptSchedule.value = {
        id: result?.data?.id ?? null,
        typeName: typeLabels.value[String(form.value.type)] ?? 'this schedule',
      }
      bracketPromptOpen.value = true
    }

    closeForm()
  } catch {
    // errorMessage is populated by the composable
  } finally {
    saving.value = false
  }
}

const manageSelectedBrackets = () => {
  const id = openActionId.value
  closeActions()
  if (id !== null) {
    void navigateTo({ path: '/admin/contribution/bracket-management', query: { schedule: String(id) } })
  }
}

// =====================================================
// DELETE
// =====================================================

const confirmDelete = () => {
  if (openActionId.value === null) return
  deletingId.value = openActionId.value
  closeActions()
}

const remove = async () => {
  if (deletingId.value === null) return
  const id = deletingId.value
  deletingId.value = null

  try {
    await deleteRateSchedule(id)
    await loadRateSchedules()
  } catch {
    // errorMessage is populated by the composable
  }
}

// =====================================================
// CSV EXPORT
// =====================================================

const csvValue = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`

const exportCsv = () => {
  const header = columns.map(column => csvValue(column.label)).join(',')
  const rows = filtered.value.map(row => columns.map(column => csvValue(row[column.key])).join(','))
  const csv = [header, ...rows].join('\r\n')

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = 'contribution-rate.csv'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <section class="cw">
    <div v-if="errorMessage" class="cw-error-banner" role="alert">
      {{ errorMessage }}
    </div>

    <!-- HEADER -->
    <div class="cw-header">
      <div class="cw-header-info">
        <div class="cw-eyebrow">
          <Landmark :size="14" />
          <span>PAYROLL CONFIGURATION / CONTRIBUTIONS</span>
        </div>
        <h1>{{ title }}</h1>
        <p>{{ subtitle }}</p>
      </div>

      <div class="cw-header-actions">
        <button type="button" class="cw-btn cw-outline" @click="exportCsv">
          <Download :size="16" />
          <span>Export CSV</span>
        </button>

        <button type="button" class="cw-btn cw-primary" @click="startAdd">
          <Plus :size="16" />
          <span>New Rate Version</span>
        </button>
      </div>
    </div>

    <!-- SUMMARY CARDS -->
    <div class="cw-stats">
      <div class="cw-stat">
        <span>Rate Schedules</span>
        <strong>{{ records.length }}</strong>
        <small>Current and past versions</small>
      </div>

      <div class="cw-stat">
        <span>Active</span>
        <strong>{{ activeCount }}</strong>
        <small class="cw-green">
          <CheckCircle2 :size="13" />
          Used by payroll
        </small>
      </div>

      <div class="cw-stat">
        <span>Inactive</span>
        <strong>{{ records.length - activeCount }}</strong>
        <small>Not used by payroll</small>
      </div>
    </div>

    <!-- DIRECTORY -->
    <div class="cw-panel">
      <div class="cw-panel-head">
        <h2>Rate Schedules</h2>
        <p>Each row is one version of a contribution's rates, valid from its effective date.</p>
      </div>

      <div class="cw-toolbar">
        <div class="cw-search">
          <Search :size="17" />
          <input v-model="search" type="text" placeholder="Search schedules..." aria-label="Search rate schedules">
        </div>

        <div class="cw-filter">
          <Filter :size="15" />
          <select v-model="filterStatus" aria-label="Filter by status">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div class="cw-overflow">
        <table class="cw-table">
          <thead>
            <tr>
              <th v-for="column in columns" :key="column.key" scope="col">{{ column.label }}</th>
              <th scope="col" class="cw-actions-heading">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="row in visibleRows" :key="String(row.id)">
              <td v-for="column in columns" :key="column.key">
                <span
                  v-if="column.format === 'status'"
                  class="cw-pill"
                  :class="row[column.key] === 'Active' ? 'cw-active' : 'cw-inactive'"
                >
                  <span class="cw-status-dot"></span>
                  {{ row[column.key] }}
                </span>
                <span v-else class="cw-cell-value">{{ fmt(row[column.key]) }}</span>
              </td>

              <td class="cw-actions-cell">
                <button
                  type="button"
                  class="cw-more-btn"
                  aria-label="More actions"
                  aria-haspopup="menu"
                  :aria-expanded="openActionId === Number(row.id)"
                  @click.stop="toggleActions(Number(row.id), $event)"
                >
                  <MoreHorizontal :size="18" />
                </button>
              </td>
            </tr>

            <tr v-if="visibleRows.length === 0">
              <td :colspan="columns.length + 1" class="cw-empty">No matching rate schedules found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- PAGINATION -->
    <div class="cw-pagination">
      <div class="cw-pagination-info">
        Showing <strong>{{ paginationStart }}–{{ paginationEnd }}</strong> of
        <strong>{{ filtered.length }}</strong> rate schedules
      </div>

      <div class="cw-pagination-controls">
        <button type="button" class="cw-page-arrow" aria-label="Previous page" :disabled="page === 1" @click="page--">
          <ChevronLeft :size="16" />
        </button>

        <button
          v-for="pageNumber in pageNumbers"
          :key="pageNumber"
          type="button"
          class="cw-page-number"
          :class="{ 'cw-page-active': page === pageNumber }"
          :aria-label="`Page ${pageNumber}`"
          :aria-current="page === pageNumber ? 'page' : undefined"
          @click="page = pageNumber"
        >
          {{ pageNumber }}
        </button>

        <button type="button" class="cw-page-arrow" aria-label="Next page" :disabled="page === totalPages" @click="page++">
          <ChevronRight :size="16" />
        </button>
      </div>
    </div>

    <!-- THREE DOTS DROPDOWN -->
    <Teleport to="body">
      <div
        v-if="openActionId !== null"
        class="cw-action-dropdown"
        role="menu"
        :style="{ top: `${actionPosition.top}px`, left: `${actionPosition.left}px` }"
      >
        <button type="button" role="menuitem" @click="startEdit">
          <Pencil :size="15" />
          <span>Edit Schedule</span>
        </button>

        <button
          v-if="selectedActionRecord?.method === 'bracket'"
          type="button"
          role="menuitem"
          @click="manageSelectedBrackets"
        >
          <Layers :size="15" />
          <span>Manage Brackets</span>
        </button>

        <button type="button" role="menuitem" class="cw-action-delete" @click="confirmDelete">
          <Trash2 :size="15" />
          <span>Delete Schedule</span>
        </button>
      </div>
    </Teleport>

    <!-- ADD / EDIT MODAL -->
    <Teleport to="body">
      <div v-if="modalOpen" class="cw-backdrop" @click.self="closeForm">
        <div class="cw-modal" role="dialog" aria-modal="true" :aria-label="isEditing ? 'Edit Rate Schedule' : 'New Rate Version'">
          <div class="cw-modal-head">
            <div>
              <h2>{{ isEditing ? 'Edit Rate Schedule' : 'New Rate Version' }}</h2>
              <p v-if="isEditing">Correct the rates or dates of this schedule.</p>
              <p v-else>Use this when the government changes the rates. The previous version stays for past payrolls.</p>
            </div>

            <button type="button" class="cw-x" aria-label="Close modal" @click="closeForm">
              <X :size="20" />
            </button>
          </div>

          <form @submit.prevent="save">
            <div v-if="localError" class="cw-form-error" role="alert">{{ localError }}</div>

            <!-- CONTRIBUTION -->
            <div class="cw-fields cw-fields--top">
              <label v-if="!isEditing">
                <span>Contribution <b>*</b></span>
                <select v-model="form.type" required>
                  <option value="" disabled>Select Contribution</option>
                  <option v-for="option in typeOptions" :key="option" :value="option">
                    {{ typeLabels[option] ?? option }}
                  </option>
                </select>
                <small class="cw-field-hint">SSS, PhilHealth, Pag-IBIG</small>
              </label>

              <div v-else class="cw-readonly-field">
                <span>Contribution</span>
                <div class="cw-readonly">{{ typeLabels[String(form.type)] ?? '—' }}</div>
              </div>

              <div v-if="methodLocked" class="cw-readonly-field">
                <span>Calculation Method</span>
                <div class="cw-readonly">
                  <component :is="currentMethodOption?.icon" :size="14" />
                  {{ currentMethodOption?.label }}
                </div>
                <small class="cw-field-hint">
                  {{ isEditing ? 'Fixed once the schedule is created.' : 'Same as the current version.' }}
                </small>
              </div>
            </div>

            <!-- METHOD CHOICE: only for a contribution's first schedule -->
            <div v-if="!methodLocked" class="cw-method-section">
              <span class="cw-method-title">Calculation Method <b>*</b></span>

              <div class="cw-method-grid" role="radiogroup" aria-label="Calculation method">
                <button
                  v-for="option in methodOptions"
                  :key="option.key"
                  type="button"
                  role="radio"
                  class="cw-method-card"
                  :class="{ 'is-selected': currentMethod === option.key }"
                  :aria-checked="currentMethod === option.key"
                  @click="selectMethod(option.key)"
                >
                  <span class="cw-method-icon">
                    <component :is="option.icon" :size="16" />
                  </span>
                  <span class="cw-method-text">
                    <strong>{{ option.label }}</strong>
                    <small>{{ option.tagline }}</small>
                  </span>
                </button>
              </div>
            </div>

            <p class="cw-method-desc">{{ currentMethodOption?.description }}</p>

            <div v-if="previousVersion" class="cw-method-notice" role="note">
              <Info :size="16" class="cw-notice-icon" />
              <span>
                Copied from the version effective <strong>{{ previousVersion.effective_from?.slice(0, 10) }}</strong>.
                Change only what the government changed, then set the new effective date.
                Set <strong>Effective To</strong> on the old version to the day before.
              </span>
            </div>

            <div v-else-if="currentMethod === 'bracket' && !isEditing" class="cw-method-notice" role="note">
              <Info :size="16" class="cw-notice-icon" />
              <span>Salary ranges and their rates are set in <strong>Bracket Management</strong> after saving.</span>
            </div>

            <!-- FIELDS FOR THE METHOD -->
            <div class="cw-fields">
              <label v-for="field in activeFields" :key="field.key">
                <span>
                  {{ field.label }}
                  <b v-if="field.required">*</b>
                </span>

                <select v-if="field.type === 'select'" v-model="form[field.key]" :required="field.required">
                  <option value="" disabled>Select {{ field.label }}</option>
                  <option v-for="option in field.options" :key="option" :value="option">
                    {{ field.optionLabels?.[option] ?? option }}
                  </option>
                </select>

                <input
                  v-else
                  v-model="form[field.key]"
                  :type="field.type || 'text'"
                  :required="field.required"
                  :min="field.type === 'number' ? 0 : undefined"
                  :max="field.key.endsWith('_rate') ? 100 : undefined"
                  :step="field.type === 'number' ? 'any' : undefined"
                  :placeholder="field.type === 'number' ? '0.00' : field.label"
                >

                <small v-if="field.hint" class="cw-field-hint">{{ field.hint }}</small>
              </label>
            </div>

            <div class="cw-modal-footer">
              <button type="button" class="cw-btn cw-outline" @click="closeForm">Cancel</button>
              <button type="submit" class="cw-btn cw-primary" :disabled="saving">
                {{ saving ? 'Saving…' : (isEditing ? 'Save Changes' : 'Save Version') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- BRACKET SETUP PROMPT -->
    <Teleport to="body">
      <div v-if="bracketPromptOpen" class="cw-backdrop" @click.self="bracketPromptOpen = false">
        <div class="cw-confirm" role="dialog" aria-modal="true" aria-label="Set up salary brackets">
          <h2>Set Up Salary Brackets?</h2>
          <p>
            You saved a bracket schedule for <strong>{{ bracketPromptSchedule?.typeName }}</strong>.
            Add its salary ranges and rates in <strong>Bracket Management</strong>.
          </p>

          <div class="cw-modal-footer">
            <button type="button" class="cw-btn cw-outline" @click="bracketPromptOpen = false">Later</button>
            <NuxtLink
              :to="{ path: '/admin/contribution/bracket-management', query: bracketPromptSchedule?.id ? { schedule: String(bracketPromptSchedule.id) } : {} }"
              class="cw-btn cw-primary"
              @click="bracketPromptOpen = false"
            >
              <Table :size="16" />
              <span>Manage Brackets</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- DELETE CONFIRMATION -->
    <Teleport to="body">
      <div v-if="deletingId !== null" class="cw-backdrop" @click.self="deletingId = null">
        <div class="cw-confirm" role="dialog" aria-modal="true" aria-label="Delete confirmation">
          <h2>Delete this schedule?</h2>
          <p>Schedules with brackets or used by a payroll can't be deleted. Set them to Inactive instead.</p>

          <div class="cw-modal-footer">
            <button type="button" class="cw-btn cw-outline" @click="deletingId = null">Cancel</button>
            <button type="button" class="cw-btn cw-delete" @click="remove">Delete Schedule</button>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.cw-error-banner { padding: 12px; margin-bottom: 14px; border: 1px solid var(--red); border-radius: 8px; background: color-mix(in srgb, var(--red) 10%, var(--bg-card)); color: var(--red); font-size: 11px; }

.cw { width: 100%; max-width: 1700px; margin: 0 auto; color: var(--text-primary, #172033); }
.cw-header { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 18px; margin-bottom: 24px; }
.cw-eyebrow { display: flex; align-items: center; gap: 7px; margin-bottom: 10px; color: var(--primary, #246bfd); font-size: 10px; font-weight: 750; letter-spacing: 1px; }
.cw h1 { margin: 0 0 6px; font-size: 27px; font-weight: 750; line-height: 1.25; }
.cw h2 { margin: 0; font-size: 15px; font-weight: 700; }
.cw p { margin: 5px 0 0; color: var(--text-secondary, #667085); font-size: 12px; }

.cw-header-actions { display: flex; align-items: center; gap: 9px; }
.cw-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 11px 14px; border: 1px solid transparent; border-radius: 9px; font-size: 12px; font-weight: 650; white-space: nowrap; cursor: pointer; }
.cw-primary { background: #246bfd; color: #ffffff; }
.cw-primary:hover { background: #1657dd; }
.cw-outline { border-color: var(--border, #e6eaf0); background: var(--bg-card, #ffffff); color: var(--text-primary, #172033); }
.cw-outline:hover { background: var(--bg-card-soft, #f8fafc); }

.cw-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin-bottom: 20px; }
.cw-stat { padding: 19px 21px; border: 1px solid var(--border, #e6eaf0); border-radius: 12px; background: var(--bg-card, #ffffff); box-shadow: var(--shadow, none); }
.cw-stat > span { display: block; color: var(--text-secondary, #667085); font-size: 12px; }
.cw-stat strong { display: block; margin: 8px 0 2px; font-size: 29px; line-height: 1.3; }
.cw-stat small { display: flex; align-items: center; gap: 5px; color: var(--text-muted, #98a2b3); font-size: 11px; }
.cw-green { color: #16a663 !important; }

.cw-panel { overflow: hidden; border: 1px solid var(--border, #e6eaf0); border-radius: 12px; background: var(--bg-card, #ffffff); }
.cw-panel-head { padding: 19px 20px 14px; border-bottom: 1px solid var(--border, #e6eaf0); }
.cw-panel-head h2 { font-size: 14px; font-weight: 700; }
.cw-panel-head p { margin-top: 5px; font-size: 11px; }

.cw-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; padding: 16px 18px; }
.cw-search { display: flex; flex: 0 1 340px; align-items: center; gap: 10px; width: 340px; max-width: 100%; min-width: 0; height: 39px; padding: 0 12px; border: 1px solid var(--border, #e6eaf0); border-radius: 8px; background: var(--bg-card-soft, #f8fafc); color: var(--text-secondary, #667085); }
.cw-search:focus-within { border-color: #246bfd; }
.cw-search input { flex: 1; width: 100%; min-width: 0; padding: 0; border: none; outline: none; background: transparent; color: var(--text-primary, #172033); font-size: 12px; }
.cw-filter { display: flex; align-items: center; gap: 8px; height: 39px; padding: 0 12px; border: 1px solid var(--border, #e6eaf0); border-radius: 8px; background: var(--bg-card-soft, #f8fafc); color: var(--text-secondary, #667085); }
.cw-filter select { border: none; outline: none; background: transparent; color: var(--text-primary, #172033); font-size: 12px; cursor: pointer; color-scheme: light dark; }
.cw-filter select option { background-color: var(--bg-card, #ffffff); color: var(--text-primary, #172033); }

.cw-overflow { width: 100%; overflow-x: auto; }
.cw-table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 12px; text-align: left; white-space: nowrap; }
.cw-table thead th { padding: 14px 16px; border-bottom: 1px solid var(--border, #e6eaf0); background: var(--bg-card-soft, #f8fafc); color: var(--text-secondary, #667085); font-size: 10px; font-weight: 700; letter-spacing: .25px; text-transform: uppercase; }
.cw-table tbody td { height: 68px; padding: 18px 16px; border-bottom: 1px solid var(--border, #e6eaf0); color: var(--text-primary, #172033); font-size: 12px; vertical-align: middle; }
.cw-table tbody tr:hover td { background: var(--bg-card-soft, #f8fafc); }
.cw-table tbody tr:last-child td { border-bottom: none; }
.cw-cell-value { font-size: 12px; font-weight: 500; }

.cw-pill { display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 6px 11px; border-radius: 999px; font-size: 11px; font-weight: 650; }
.cw-status-dot { width: 6px; height: 6px; flex-shrink: 0; border-radius: 50%; background: currentColor; }
.cw-active { background: rgba(22, 163, 74, .14); color: #16a34a; }
.cw-inactive { background: rgba(239, 68, 68, .12); color: #ef4444; }

.cw-actions-heading,
.cw-actions-cell { width: 85px; text-align: center !important; }
.cw-more-btn { display: inline-flex; width: 36px; height: 36px; align-items: center; justify-content: center; padding: 0; border: 1px solid var(--border, #e6eaf0); border-radius: 9px; background: transparent; color: var(--text-secondary, #667085); cursor: pointer; }
.cw-more-btn:hover,
.cw-more-btn[aria-expanded='true'] { border-color: #246bfd; background: rgba(36, 107, 253, .08); color: #246bfd; }
.cw-empty { padding: 45px 20px !important; color: var(--text-secondary, #667085); font-size: 12px; text-align: center; }

.cw-pagination { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 2px; }
.cw-pagination-info { color: var(--text-secondary, #667085); font-size: 11px; }
.cw-pagination-info strong { color: var(--text-primary, #172033); font-weight: 600; }
.cw-pagination-controls { display: flex; align-items: center; gap: 6px; }
.cw-page-arrow,
.cw-page-number { display: inline-flex; width: 34px; height: 34px; align-items: center; justify-content: center; border: 1px solid var(--border, #e6eaf0); border-radius: 8px; background: var(--bg-card, #ffffff); color: var(--text-secondary, #667085); font-size: 12px; cursor: pointer; }
.cw-page-arrow:hover:not(:disabled),
.cw-page-number:hover:not(.cw-page-active) { border-color: #246bfd; color: #246bfd; }
.cw-page-active { border-color: #246bfd; background: #246bfd; color: #ffffff; font-weight: 700; }
.cw-page-arrow:disabled { opacity: .4; cursor: not-allowed; }

@media (max-width: 768px) {
  .cw h1 { font-size: 23px; }
  .cw-header-actions { width: 100%; }
  .cw-stats { grid-template-columns: 1fr; }
  .cw-search { flex: 1 1 100%; width: 100%; max-width: none; }
  .cw-pagination { flex-direction: column; align-items: flex-start; gap: 12px; }
  .cw-pagination-controls { align-self: flex-end; }
}
</style>

<style>
.cw-action-dropdown { position: fixed; z-index: 9999; min-width: 230px; padding: 7px; border: 1px solid var(--border, #e6eaf0); border-radius: 12px; background: var(--bg-card, #ffffff); color: var(--text-primary, #172033); box-shadow: 0 15px 45px rgba(0, 0, 0, .2); }
.cw-action-dropdown button { display: flex; align-items: center; gap: 11px; width: 100%; padding: 12px 13px; border: none; border-radius: 8px; background: transparent; color: var(--text-primary, #172033); font-size: 12px; font-weight: 500; text-align: left; cursor: pointer; }
.cw-action-dropdown button:hover { background: var(--bg-card-soft, #f8fafc); }
.cw-action-dropdown .cw-action-delete { color: #ef4444; }
.cw-action-dropdown .cw-action-delete:hover { background: rgba(239, 68, 68, .08); }

.cw-backdrop { position: fixed; inset: 0; z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px; background: rgba(5, 15, 30, .55); }
.cw-modal,
.cw-confirm { width: min(680px, 100%); max-height: 90vh; overflow-y: auto; padding: 24px; border: 1px solid var(--border, #e6eaf0); border-radius: 15px; background: var(--bg-card, #ffffff); color: var(--text-primary, #172033); box-shadow: 0 20px 70px rgba(0, 0, 0, .27); }
.cw-confirm { max-width: 420px; }
.cw-modal h2,
.cw-confirm h2 { margin: 0; font-size: 17px; font-weight: 700; }
.cw-modal p,
.cw-confirm p { margin-top: 7px; color: var(--text-secondary, #667085); font-size: 12px; }
.cw-modal-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; margin-bottom: 20px; }
.cw-x { display: inline-flex; align-items: center; justify-content: center; padding: 7px; border: 1px solid var(--border, #e6eaf0); border-radius: 7px; background: var(--bg-card, #ffffff); color: var(--text-secondary, #667085); cursor: pointer; }

.cw-form-error { padding: 10px 12px; margin-bottom: 14px; border: 1px solid #ef4444; border-radius: 8px; background: rgba(239, 68, 68, .08); color: #ef4444; font-size: 12px; }

.cw-readonly-field { display: flex; flex-direction: column; gap: 7px; min-width: 0; }
.cw-readonly-field > span { font-size: 11px; font-weight: 650; }
.cw-readonly { display: flex; align-items: center; gap: 8px; padding: 11px; border: 1px solid var(--border-soft, #e6eaf0); border-radius: 8px; color: var(--text-secondary, #667085); font-size: 12px; font-weight: 600; }

.cw-method-section { margin-top: 14px; }
.cw-method-title { display: block; margin-bottom: 8px; color: var(--text-primary, #172033); font-size: 11px; font-weight: 650; }
.cw-method-title b { color: #ef4444; }
.cw-method-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.cw-method-card { display: flex; align-items: flex-start; gap: 10px; padding: 11px 12px; border: 1px solid var(--border, #e6eaf0); border-radius: 10px; background: var(--bg-card-soft, #f8fafc); color: var(--text-primary, #172033); text-align: left; cursor: pointer; }
.cw-method-card:hover { border-color: #246bfd; }
.cw-method-card.is-selected { border-color: #246bfd; background: color-mix(in srgb, #246bfd 10%, var(--bg-card, #ffffff)); box-shadow: 0 0 0 2px rgba(36, 107, 253, .18); }
.cw-method-icon { display: inline-flex; width: 30px; height: 30px; flex-shrink: 0; align-items: center; justify-content: center; border-radius: 8px; background: color-mix(in srgb, #246bfd 14%, transparent); color: #246bfd; }
.cw-method-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.cw-method-text strong { color: var(--text-primary, #172033); font-size: 12px; font-weight: 700; }
.cw-method-text small { color: var(--text-secondary, #667085); font-size: 10.5px; line-height: 1.3; }
.cw-method-desc { margin: 12px 0 14px !important; color: var(--text-secondary, #667085); font-size: 11.5px; }

.cw-method-notice { display: flex; align-items: center; gap: 10px; padding: 11px 14px; margin-bottom: 16px; border: 1px solid color-mix(in srgb, var(--primary, #246bfd) 25%, transparent); border-radius: 8px; background: color-mix(in srgb, var(--primary, #246bfd) 10%, var(--bg-card, #ffffff)); color: var(--text-primary, #172033); font-size: 12px; line-height: 1.45; }
.cw-notice-icon { flex-shrink: 0; color: var(--primary, #246bfd); }

.cw-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.cw-fields label { display: flex; flex-direction: column; gap: 7px; min-width: 0; }
.cw-fields label > span { font-size: 11px; font-weight: 650; }
.cw-fields label b { color: #ef4444; }
.cw-fields input,
.cw-fields select { width: 100%; min-width: 0; padding: 11px; border: 1px solid var(--border, #e6eaf0); border-radius: 8px; outline: none; background: var(--bg-card-soft, #f8fafc); color: var(--text-primary, #172033); font-size: 12px; color-scheme: light dark; }
.cw-fields select option { background-color: var(--bg-card, #ffffff); color: var(--text-primary, #172033); }
.cw-fields input:focus,
.cw-fields select:focus { border-color: #246bfd; }
.cw-field-hint { color: var(--text-secondary, #667085); font-size: 10.5px; line-height: 1.3; }

.cw-modal-footer { display: flex; justify-content: flex-end; gap: 9px; margin-top: 24px; }
.cw-modal-footer .cw-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 11px 14px; border: 1px solid transparent; border-radius: 9px; font-size: 12px; font-weight: 650; text-decoration: none; cursor: pointer; }
.cw-modal-footer .cw-btn:disabled { opacity: .6; cursor: not-allowed; }
.cw-modal-footer .cw-primary { background: #246bfd; color: #ffffff; }
.cw-modal-footer .cw-primary:hover { background: #1657dd; }
.cw-modal-footer .cw-outline { border-color: var(--border, #e6eaf0); background: var(--bg-card, #ffffff); color: var(--text-primary, #172033); }
.cw-modal-footer .cw-delete { background: #dc2626; color: #ffffff; }
.cw-modal-footer .cw-delete:hover { background: #b91c1c; }

@media (max-width: 720px) {
  .cw-method-grid,
  .cw-fields { grid-template-columns: 1fr; }
}
</style>