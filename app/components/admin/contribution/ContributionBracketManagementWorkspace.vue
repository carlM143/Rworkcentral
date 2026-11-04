<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Coins,
  Download,
  Filter,
  Info,
  Landmark,
  Layers,
  Pencil,
  Percent,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-vue-next'
import type { ContributionRateBracketPayload, ContributionRateBracketRecord } from '~/composables/admin/contribution/useContributionRateBracketApi'

const route = useRoute()

const { contributionTypes, loadContributionTypes } = useContributionTypes()
const { rateSchedules, loadRateSchedules } = useContributionRateSchedules()
const {
  rateBrackets,
  loading,
  saving,
  errorMessage,
  loadRateBrackets,
  createRateBracket,
  updateRateBracket,
  deleteRateBracket,
} = useContributionRateBrackets()

const localError = ref('')

// Only schedules whose calculation_method === 'bracket'
const bracketSchedules = computed(() =>
  rateSchedules.value.filter(s => s.calculation_method === 'bracket'),
)

const typeLabels = computed<Record<number, string>>(() =>
  Object.fromEntries(
    contributionTypes.value.map(t => [
      t.id,
      `${t.contribution_code} — ${t.contribution_name}`,
    ]),
  ),
)

const scheduleLabel = (scheduleId: number) => {
  const s = rateSchedules.value.find(item => item.id === scheduleId)
  if (!s) return `Schedule #${scheduleId}`
  const typeName = s.contribution_type
    ? `${s.contribution_type.contribution_code} — ${s.contribution_type.contribution_name}`
    : (typeLabels.value[s.contribution_type_id] ?? `Type #${s.contribution_type_id}`)
  const eff = s.effective_from ? s.effective_from.slice(0, 10) : ''
  return `${typeName} (${s.salary_basis || 'Basic Salary'} • Effective ${eff})`
}

const selectedScheduleId = ref<string>('all')

const selectedSchedule = computed(() => {
  if (selectedScheduleId.value === 'all') return null
  return bracketSchedules.value.find(s => String(s.id) === selectedScheduleId.value) ?? null
})

// Sync initial schedule from ?schedule= query param
watch(
  [() => route.query.schedule, bracketSchedules],
  ([qSchedule, list]) => {
    if (qSchedule && list.some(s => String(s.id) === String(qSchedule))) {
      selectedScheduleId.value = String(qSchedule)
    } else if (selectedScheduleId.value === 'all' && list.length === 1 && list[0]) {
      selectedScheduleId.value = String(list[0].id)
    }
  },
  { immediate: true },
)

onMounted(async () => {
  await Promise.all([
    loadContributionTypes(),
    loadRateSchedules(),
    loadRateBrackets(),
  ])
})

// =====================================================
// FILTERING & PAGINATION
// =====================================================

const search = ref('')
const page = ref(1)
const perPage = 8

// Restrict displayed brackets to bracket-based schedules (or selected schedule)
const bracketScheduleIds = computed(() => new Set(bracketSchedules.value.map(s => s.id)))

const filteredBrackets = computed(() => {
  const term = search.value.trim().toLowerCase()

  return rateBrackets.value
    .filter((b) => {
      if (selectedScheduleId.value !== 'all') {
        if (String(b.contribution_rate_schedule_id) !== selectedScheduleId.value) return false
      } else if (bracketScheduleIds.value.size > 0 && !bracketScheduleIds.value.has(b.contribution_rate_schedule_id)) {
        return false
      }

      if (!term) return true

      const label = scheduleLabel(b.contribution_rate_schedule_id).toLowerCase()
      return (
        label.includes(term) ||
        String(b.salary_from ?? '').includes(term) ||
        String(b.salary_to ?? '').includes(term) ||
        String(b.employee_rate ?? '').includes(term) ||
        String(b.employer_rate ?? '').includes(term) ||
        String(b.employee_amount ?? '').includes(term) ||
        String(b.employer_amount ?? '').includes(term)
      )
    })
    .slice()
    .sort((a, b) => {
      if (a.contribution_rate_schedule_id !== b.contribution_rate_schedule_id) {
        return a.contribution_rate_schedule_id - b.contribution_rate_schedule_id
      }
      return Number(a.salary_from) - Number(b.salary_from)
    })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredBrackets.value.length / perPage)))

const visibleBrackets = computed(() => {
  const start = (page.value - 1) * perPage
  return filteredBrackets.value.slice(start, start + perPage)
})

const paginationStart = computed(() =>
  filteredBrackets.value.length === 0 ? 0 : (page.value - 1) * perPage + 1,
)

const paginationEnd = computed(() =>
  Math.min(page.value * perPage, filteredBrackets.value.length),
)

watch([search, selectedScheduleId], () => {
  page.value = 1
})

// =====================================================
// FORMATTERS
// =====================================================

const toNumber = (val: string | number | null | undefined): number | null => {
  if (val === null || val === undefined || val === '') return null
  const n = Number(val)
  return Number.isNaN(n) ? null : n
}

const formatPeso = (val: string | number | null | undefined) => {
  const n = toNumber(val)
  if (n === null) return '—'
  return '₱' + n.toLocaleString('en-PH', {
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })
}

const formatPercent = (val: string | number | null | undefined) => {
  const n = toNumber(val)
  if (n === null) return null
  return `${Number(n.toFixed(4))}%`
}

const formatRateOrAmount = (
  rate: string | number | null | undefined,
  amount: string | number | null | undefined,
) => {
  const r = toNumber(rate)
  const a = toNumber(amount)
  if (r !== null && a !== null) {
    return `${formatPercent(r)} (${formatPeso(a)})`
  }
  if (r !== null) return formatPercent(r) ?? '—'
  if (a !== null) return formatPeso(a)
  return '—'
}

const isRateMode = (b: ContributionRateBracketRecord) =>
  toNumber(b.employee_rate) !== null || toNumber(b.employer_rate) !== null

const coverageLabel = computed(() => {
  if (filteredBrackets.value.length === 0) return 'No brackets configured'
  const first = filteredBrackets.value[0]
  const last = filteredBrackets.value[filteredBrackets.value.length - 1]
  const from = formatPeso(first?.salary_from ?? 0)
  const to = last?.salary_to !== null && last?.salary_to !== undefined
    ? formatPeso(last.salary_to)
    : 'And Above'
  return `${from} – ${to}`
})

// =====================================================
// ADD / EDIT MODAL
// =====================================================

type ValueMode = 'rate' | 'amount'

const modalOpen = ref(false)
const editingId = ref<number | null>(null)
const deletingBracket = ref<ContributionRateBracketRecord | null>(null)
const valueMode = ref<ValueMode>('rate')

const form = ref<{
  contribution_rate_schedule_id: string
  salary_from: string
  salary_to: string
  employee_rate: string
  employer_rate: string
  employee_amount: string
  employer_amount: string
  monthly_salary_credit: string
  employer_ec_amount: string
}>({
  contribution_rate_schedule_id: '',
  salary_from: '',
  salary_to: '',
  employee_rate: '',
  employer_rate: '',
  employee_amount: '',
  employer_amount: '',
  monthly_salary_credit: '',
  employer_ec_amount: '',
})

const nextSuggestedSalaryFrom = (scheduleId: number): string => {
  const existing = rateBrackets.value
    .filter(b => b.contribution_rate_schedule_id === scheduleId)
    .slice()
    .sort((a, b) => Number(a.salary_from) - Number(b.salary_from))

  if (existing.length === 0) {
    const sched = bracketSchedules.value.find(s => s.id === scheduleId)
    const min = toNumber(sched?.minimum_salary_base)
    return min !== null ? String(min) : '0'
  }

  const last = existing[existing.length - 1]
  const lastTo = toNumber(last?.salary_to)
  if (lastTo !== null) {
    return String(Math.floor(lastTo) + 1)
  }
  return ''
}

const openAddModal = () => {
  localError.value = ''
  editingId.value = null
  const defaultScheduleId = selectedScheduleId.value !== 'all'
    ? selectedScheduleId.value
    : (bracketSchedules.value[0] ? String(bracketSchedules.value[0].id) : '')

  const suggestedFrom = defaultScheduleId ? nextSuggestedSalaryFrom(Number(defaultScheduleId)) : '0'

  valueMode.value = 'rate'
  form.value = {
    contribution_rate_schedule_id: defaultScheduleId,
    salary_from: suggestedFrom,
    salary_to: '',
    employee_rate: '',
    employer_rate: '',
    employee_amount: '',
    employer_amount: '',
    monthly_salary_credit: '',
    employer_ec_amount: '',
  }
  modalOpen.value = true
}

const openEditModal = (bracket: ContributionRateBracketRecord) => {
  localError.value = ''
  editingId.value = bracket.id

  const hasAmount = toNumber(bracket.employee_amount) !== null || toNumber(bracket.employer_amount) !== null
  const hasRate = toNumber(bracket.employee_rate) !== null || toNumber(bracket.employer_rate) !== null
  valueMode.value = hasAmount && !hasRate ? 'amount' : 'rate'

  form.value = {
    contribution_rate_schedule_id: String(bracket.contribution_rate_schedule_id),
    salary_from: String(toNumber(bracket.salary_from) ?? ''),
    salary_to: bracket.salary_to !== null && bracket.salary_to !== undefined ? String(toNumber(bracket.salary_to) ?? '') : '',
    employee_rate: bracket.employee_rate !== null && bracket.employee_rate !== undefined ? String(toNumber(bracket.employee_rate) ?? '') : '',
    employer_rate: bracket.employer_rate !== null && bracket.employer_rate !== undefined ? String(toNumber(bracket.employer_rate) ?? '') : '',
    employee_amount: bracket.employee_amount !== null && bracket.employee_amount !== undefined ? String(toNumber(bracket.employee_amount) ?? '') : '',
    employer_amount: bracket.employer_amount !== null && bracket.employer_amount !== undefined ? String(toNumber(bracket.employer_amount) ?? '') : '',
    monthly_salary_credit: bracket.monthly_salary_credit !== null && bracket.monthly_salary_credit !== undefined ? String(toNumber(bracket.monthly_salary_credit) ?? '') : '',
    employer_ec_amount: bracket.employer_ec_amount !== null && bracket.employer_ec_amount !== undefined ? String(toNumber(bracket.employer_ec_amount) ?? '') : '',
  }
  modalOpen.value = true
}

const closeModal = () => {
  modalOpen.value = false
  editingId.value = null
  localError.value = ''
}

const saveBracket = async () => {
  localError.value = ''
  const scheduleId = Number(form.value.contribution_rate_schedule_id)
  if (!scheduleId) {
    localError.value = 'Please select a bracket-based contribution rate schedule.'
    return
  }

  const salaryFrom = toNumber(form.value.salary_from)
  const salaryTo = toNumber(form.value.salary_to)

  if (salaryFrom === null || salaryFrom < 0) {
    localError.value = 'Please enter a valid Salary From amount.'
    return
  }

  if (salaryTo !== null && salaryTo < salaryFrom) {
    localError.value = 'Salary To must be greater than or equal to Salary From.'
    return
  }

  const empRate = valueMode.value === 'rate' ? toNumber(form.value.employee_rate) : null
  const erRate = valueMode.value === 'rate' ? toNumber(form.value.employer_rate) : null
  const empAmt = valueMode.value === 'amount' ? toNumber(form.value.employee_amount) : null
  const erAmt = valueMode.value === 'amount' ? toNumber(form.value.employer_amount) : null

  if (valueMode.value === 'rate' && (empRate === null || erRate === null)) {
    localError.value = 'Please enter both Employee Rate (%) and Employer Rate (%).'
    return
  }

  if (valueMode.value === 'amount' && (empAmt === null || erAmt === null)) {
    localError.value = 'Please enter both Employee Amount (₱) and Employer Amount (₱).'
    return
  }

  const payload: ContributionRateBracketPayload = {
    contribution_rate_schedule_id: scheduleId,
    salary_from: salaryFrom,
    salary_to: salaryTo,
    monthly_salary_credit: toNumber(form.value.monthly_salary_credit),
    employee_rate: empRate,
    employer_rate: erRate,
    employee_amount: empAmt,
    employer_amount: erAmt,
    employer_ec_amount: toNumber(form.value.employer_ec_amount),
  }

  try {
    if (editingId.value !== null) {
      await updateRateBracket(editingId.value, payload)
    } else {
      await createRateBracket(payload)
    }
    await loadRateSchedules()
    closeModal()
  } catch {
    // errorMessage handled by composable
  }
}

const confirmDeleteBracket = async () => {
  if (!deletingBracket.value) return
  try {
    await deleteRateBracket(deletingBracket.value.id)
    await loadRateSchedules()
    deletingBracket.value = null
  } catch {
    // errorMessage handled by composable
  }
}

// =====================================================
// CSV EXPORT
// =====================================================

const exportCsv = () => {
  const headers = ['Schedule', 'Salary From', 'Salary To', 'Employee Rate/Amount', 'Employer Rate/Amount']
  const rows = filteredBrackets.value.map(b => [
    scheduleLabel(b.contribution_rate_schedule_id),
    formatPeso(b.salary_from),
    b.salary_to !== null && b.salary_to !== undefined ? formatPeso(b.salary_to) : 'And Above',
    formatRateOrAmount(b.employee_rate, b.employee_amount),
    formatRateOrAmount(b.employer_rate, b.employer_amount),
  ])

  const escape = (val: unknown) => `"${String(val ?? '').replace(/"/g, '""')}"`
  const csv = [headers.map(escape).join(','), ...rows.map(r => r.map(escape).join(','))].join('\r\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'contribution-bracket-management.csv'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <section class="bm">
    <div v-if="errorMessage || localError" class="bm-error" role="alert">
      {{ localError || errorMessage }}
    </div>

    <!-- HEADER -->
    <div class="bm-header">
      <div class="bm-header-info">
        <div class="bm-eyebrow">
          <Landmark :size="14" />
          <span>PAYROLL CONFIGURATION / CONTRIBUTIONS / BRACKET MANAGEMENT</span>
        </div>
        <h1>Bracket Management</h1>
        <p>
          Automatically determine employee and employer contribution rates or amounts based on salary ranges.
        </p>
      </div>

      <div class="bm-header-actions">
        <NuxtLink to="/admin/contribution/rate-schedules" class="bm-btn bm-outline">
          <ArrowLeft :size="15" />
          <span>Contribution Rates</span>
        </NuxtLink>

        <button type="button" class="bm-btn bm-outline" @click="exportCsv">
          <Download :size="15" />
          <span>Export CSV</span>
        </button>

        <button
          type="button"
          class="bm-btn bm-primary"
          :disabled="bracketSchedules.length === 0"
          @click="openAddModal"
        >
          <Plus :size="16" />
          <span>Add Salary Bracket</span>
        </button>
      </div>
    </div>

    <!-- SCHEDULE SELECTOR BANNER -->
    <div class="bm-schedule-bar">
      <div class="bm-schedule-select-wrap">
        <label for="bm-schedule-select">
          <Layers :size="14" />
          <span>Bracket Rate Schedule</span>
        </label>
        <select id="bm-schedule-select" v-model="selectedScheduleId">
          <option value="all">All Bracket Schedules ({{ bracketSchedules.length }})</option>
          <option v-for="s in bracketSchedules" :key="s.id" :value="String(s.id)">
            {{ scheduleLabel(s.id) }}
          </option>
        </select>
      </div>

      <div v-if="selectedSchedule" class="bm-schedule-meta">
        <div class="bm-meta-item">
          <span>Salary Basis</span>
          <strong>{{ selectedSchedule.salary_basis || 'Basic Salary' }}</strong>
        </div>
        <div class="bm-meta-item">
          <span>Minimum Salary</span>
          <strong>{{ formatPeso(selectedSchedule.minimum_salary_base) }}</strong>
        </div>
        <div class="bm-meta-item">
          <span>Maximum Salary</span>
          <strong>{{ formatPeso(selectedSchedule.maximum_salary_base) }}</strong>
        </div>
        <div class="bm-meta-item">
          <span>Effective From</span>
          <strong>{{ selectedSchedule.effective_from?.slice(0, 10) || '—' }}</strong>
        </div>
        <div class="bm-meta-item">
          <span>Status</span>
          <span class="bm-status-pill" :class="selectedSchedule.is_status ? 'is-active' : 'is-inactive'">
            {{ selectedSchedule.is_status ? 'Active' : 'Inactive' }}
          </span>
        </div>
      </div>

      <div v-else-if="bracketSchedules.length === 0" class="bm-empty-schedule-note">
        <Info :size="15" />
        <span>
          No bracket-based rate schedule exists yet. Create a schedule with calculation method
          <strong>Bracket</strong> in
          <NuxtLink to="/admin/contribution/rate-schedules">Contribution Rate</NuxtLink> first.
        </span>
      </div>
    </div>

    <!-- SUMMARY STATS -->
    <div class="bm-stats">
      <div class="bm-stat">
        <span>Configured Brackets</span>
        <strong>{{ filteredBrackets.length }}</strong>
        <small>Salary tiers in view</small>
      </div>

      <div class="bm-stat">
        <span>Bracket Schedules</span>
        <strong>{{ bracketSchedules.length }}</strong>
        <small class="bm-green">
          <CheckCircle2 :size="13" />
          Active bracket schedules
        </small>
      </div>

      <div class="bm-stat">
        <span>Covered Salary Span</span>
        <strong class="bm-span-text">{{ coverageLabel }}</strong>
        <small>Lowest to highest tier</small>
      </div>
    </div>

    <!-- BRACKET TABLE PANEL -->
    <div class="bm-panel">
      <div class="bm-panel-head">
        <div>
          <h2>Salary Brackets Table</h2>
          <p>
            <strong>Employee Contribution</strong> = deducted from employee salary ·
            <strong>Employer Contribution</strong> = paid by the company
          </p>
        </div>

        <div class="bm-toolbar">
          <div class="bm-search">
            <Search :size="16" />
            <input
              v-model="search"
              type="text"
              placeholder="Search salary range or rate..."
              aria-label="Search salary brackets"
            />
          </div>
        </div>
      </div>

      <div class="bm-overflow">
        <table class="bm-table">
          <thead>
            <tr>
              <th v-if="selectedScheduleId === 'all'" scope="col">Contribution Schedule</th>
              <th scope="col">Salary From</th>
              <th scope="col">Salary To</th>
              <th scope="col">Salary Credit (MSC)</th>
              <th scope="col">Employee Rate / Amount</th>
              <th scope="col">Employer Rate / Amount</th>
              <th scope="col">Employer EC</th>
              <th scope="col" class="bm-actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="bracket in visibleBrackets" :key="bracket.id">
              <td v-if="selectedScheduleId === 'all'" class="bm-schedule-cell">
                {{ scheduleLabel(bracket.contribution_rate_schedule_id) }}
              </td>
              <td class="bm-money">{{ formatPeso(bracket.salary_from) }}</td>
              <td class="bm-money">
                <span v-if="bracket.salary_to !== null && bracket.salary_to !== undefined">
                  {{ formatPeso(bracket.salary_to) }}
                </span>
                <span v-else class="bm-open-ended">And Above</span>
              </td>
              <td class="bm-money">{{ formatPeso(bracket.monthly_salary_credit) }}</td>
              <td>
                <span class="bm-rate-badge" :class="isRateMode(bracket) ? 'is-rate' : 'is-amount'">
                  {{ formatRateOrAmount(bracket.employee_rate, bracket.employee_amount) }}
                </span>
              </td>
              <td>
                <span class="bm-rate-badge is-employer">
                  {{ formatRateOrAmount(bracket.employer_rate, bracket.employer_amount) }}
                </span>
              </td>
              <td class="bm-money">{{ formatPeso(bracket.employer_ec_amount) }}</td>
              <td class="bm-actions-col">
                <div class="bm-row-actions">
                  <button
                    type="button"
                    class="bm-act-btn bm-act-edit"
                    @click="openEditModal(bracket)"
                  >
                    <Pencil :size="13" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    class="bm-act-btn bm-act-del"
                    @click="deletingBracket = bracket"
                  >
                    <Trash2 :size="13" />
                    <span>Delete</span>
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="!loading && visibleBrackets.length === 0">
              <td :colspan="selectedScheduleId === 'all' ? 6 : 5" class="bm-empty">
                No salary brackets configured yet. Click <strong>Add Salary Bracket</strong> to define your first tier (e.g. ₱0 – ₱5,000).
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- PAGINATION -->
      <div class="bm-pagination">
        <div class="bm-pagination-info">
          Showing <strong>{{ paginationStart }}–{{ paginationEnd }}</strong> of
          <strong>{{ filteredBrackets.length }}</strong> brackets
        </div>
        <div class="bm-pagination-controls">
          <button
            type="button"
            class="bm-page-btn"
            :disabled="page === 1"
            @click="page--"
          >
            <ChevronLeft :size="15" />
          </button>
          <span class="bm-page-indicator">Page {{ page }} of {{ totalPages }}</span>
          <button
            type="button"
            class="bm-page-btn"
            :disabled="page === totalPages"
            @click="page++"
          >
            <ChevronRight :size="15" />
          </button>
        </div>
      </div>
    </div>

    <!-- ADD / EDIT MODAL -->
    <Teleport to="body">
      <div v-if="modalOpen" class="bm-backdrop" @click.self="closeModal">
        <div class="bm-modal" role="dialog" aria-modal="true">
          <div class="bm-modal-head">
            <div>
              <h2>{{ editingId === null ? 'Add Salary Bracket' : 'Edit Salary Bracket' }}</h2>
              <p>Define the salary range and the employee / employer contribution rate or amount.</p>
            </div>
            <button type="button" class="bm-x" aria-label="Close modal" @click="closeModal">
              <X :size="18" />
            </button>
          </div>

          <form @submit.prevent="saveBracket">
            <div v-if="localError || errorMessage" class="bm-modal-error">
              {{ localError || errorMessage }}
            </div>

            <div class="bm-field-full">
              <label>
                <span>Bracket Rate Schedule <b>*</b></span>
                <select v-model="form.contribution_rate_schedule_id" required>
                  <option value="" disabled>Select Bracket Schedule</option>
                  <option v-for="s in bracketSchedules" :key="s.id" :value="String(s.id)">
                    {{ scheduleLabel(s.id) }}
                  </option>
                </select>
              </label>
            </div>

            <!-- RATE VS AMOUNT TOGGLE -->
            <div class="bm-mode-switch">
              <span class="bm-mode-label">Contribution Value Type <b>*</b></span>
              <div class="bm-mode-buttons">
                <button
                  type="button"
                  class="bm-mode-btn"
                  :class="{ 'is-active': valueMode === 'rate' }"
                  @click="valueMode = 'rate'"
                >
                  <Percent :size="14" />
                  <span>Percentage Rate (%)</span>
                </button>
                <button
                  type="button"
                  class="bm-mode-btn"
                  :class="{ 'is-active': valueMode === 'amount' }"
                  @click="valueMode = 'amount'"
                >
                  <Coins :size="14" />
                  <span>Fixed Amount (₱)</span>
                </button>
              </div>
            </div>

            <div class="bm-fields-grid">
              <label>
                <span>Salary From (₱) <b>*</b></span>
                <input
                  v-model="form.salary_from"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="e.g. 0 or 5001"
                  required
                />
                <small>Lowest salary in this bracket</small>
              </label>

              <label>
                <span>Salary To (₱)</span>
                <input
                  v-model="form.salary_to"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="e.g. 5000 (leave empty for and above)"
                />
                <small>Highest salary in this bracket (optional)</small>
              </label>

              <template v-if="valueMode === 'rate'">
                <label>
                  <span>Employee Rate (%) <b>*</b></span>
                  <input
                    v-model="form.employee_rate"
                    type="number"
                    min="0"
                    max="100"
                    step="any"
                    placeholder="e.g. 1 or 2"
                    required
                  />
                  <small>Percentage deducted from employee salary</small>
                </label>

                <label>
                  <span>Employer Rate (%) <b>*</b></span>
                  <input
                    v-model="form.employer_rate"
                    type="number"
                    min="0"
                    max="100"
                    step="any"
                    placeholder="e.g. 2"
                    required
                  />
                  <small>Percentage paid by the company</small>
                </label>
              </template>

              <template v-else>
                <label>
                  <span>Employee Amount (₱) <b>*</b></span>
                  <input
                    v-model="form.employee_amount"
                    type="number"
                    min="0"
                    step="any"
                    placeholder="e.g. 100.00"
                    required
                  />
                  <small>Amount deducted from employee salary</small>
                </label>

                <label>
                  <span>Employer Amount (₱) <b>*</b></span>
                  <input
                    v-model="form.employer_amount"
                    type="number"
                    min="0"
                    step="any"
                    placeholder="e.g. 200.00"
                    required
                  />
                  <small>Amount paid by the company</small>
                </label>
              </template>
            </div>

            <div class="bm-modal-footer">
              <button type="button" class="bm-btn bm-outline" @click="closeModal">
                Cancel
              </button>
              <button type="submit" class="bm-btn bm-primary" :disabled="saving">
                {{ saving ? 'Saving...' : (editingId === null ? 'Save Bracket' : 'Save Changes') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- DELETE CONFIRMATION MODAL -->
    <Teleport to="body">
      <div v-if="deletingBracket" class="bm-backdrop" @click.self="deletingBracket = null">
        <div class="bm-confirm" role="dialog" aria-modal="true">
          <h2>Delete Salary Bracket?</h2>
          <p>
            Are you sure you want to delete the bracket
            <strong>{{ formatPeso(deletingBracket.salary_from) }} – {{ deletingBracket.salary_to !== null ? formatPeso(deletingBracket.salary_to) : 'And Above' }}</strong>?
            This action cannot be undone.
          </p>
          <div class="bm-modal-footer">
            <button type="button" class="bm-btn bm-outline" @click="deletingBracket = null">
              Cancel
            </button>
            <button type="button" class="bm-btn bm-delete" :disabled="saving" @click="confirmDeleteBracket">
              {{ saving ? 'Deleting...' : 'Delete Bracket' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.bm {
  width: 100%;
  max-width: 1700px;
  margin: 0 auto;
  color: var(--text-primary, #172033);
}

.bm-error,
.bm-modal-error {
  padding: 12px 14px;
  margin-bottom: 14px;
  border: 1px solid var(--red, #ef4444);
  border-radius: 9px;
  background: color-mix(in srgb, var(--red, #ef4444) 10%, var(--bg-card, #ffffff));
  color: var(--red, #ef4444);
  font-size: 12px;
}

.bm-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.bm-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.6px;
  color: #246bfd;
  margin-bottom: 6px;
}

.bm-header h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 750;
}

.bm-header p {
  margin: 4px 0 0;
  font-size: 12.5px;
  color: var(--text-secondary, #667085);
}

.bm-header-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.bm-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 10px 14px;
  border: 1px solid transparent;
  border-radius: 9px;
  font-size: 12px;
  font-weight: 650;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.15s ease;
}

.bm-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.bm-primary {
  background: #246bfd;
  color: #ffffff;
}

.bm-primary:hover:not(:disabled) {
  background: #1657dd;
}

.bm-outline {
  border-color: var(--border, #e6eaf0);
  background: var(--bg-card, #ffffff);
  color: var(--text-primary, #172033);
}

.bm-outline:hover {
  background: var(--bg-card-soft, #f8fafc);
}

.bm-delete {
  background: #dc2626;
  color: #ffffff;
}

.bm-delete:hover:not(:disabled) {
  background: #b91c1c;
}

/* SCHEDULE BAR */
.bm-schedule-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
  margin-bottom: 16px;
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 13px;
  background: var(--bg-card, #ffffff);
}

.bm-schedule-select-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 300px;
  flex: 1;
}

.bm-schedule-select-wrap label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-secondary, #667085);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.bm-schedule-select-wrap select {
  padding: 10px 12px;
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 8px;
  background: var(--bg-card-soft, #f8fafc);
  color: var(--text-primary, #172033);
  font-size: 12.5px;
  font-weight: 600;
  outline: none;
}

.bm-schedule-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 18px;
}

.bm-meta-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.bm-meta-item > span:first-child {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-secondary, #667085);
  text-transform: uppercase;
}

.bm-meta-item strong {
  font-size: 12.5px;
  font-weight: 700;
}

.bm-status-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 650;
}

.bm-status-pill.is-active {
  background: rgba(16, 185, 129, 0.14);
  color: #10b981;
}

.bm-status-pill.is-inactive {
  background: rgba(148, 163, 184, 0.16);
  color: #64748b;
}

.bm-empty-schedule-note {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-secondary, #667085);
}

.bm-empty-schedule-note a {
  color: #246bfd;
  font-weight: 650;
}

/* STATS */
.bm-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

.bm-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 18px;
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 13px;
  background: var(--bg-card, #ffffff);
}

.bm-stat span {
  font-size: 11px;
  font-weight: 650;
  color: var(--text-secondary, #667085);
}

.bm-stat strong {
  font-size: 22px;
  font-weight: 750;
}

.bm-stat .bm-span-text {
  font-size: 17px;
}

.bm-stat small {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: var(--text-secondary, #667085);
}

.bm-green {
  color: #10b981 !important;
}

/* PANEL & TABLE */
.bm-panel {
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 14px;
  background: var(--bg-card, #ffffff);
  overflow: hidden;
}

.bm-panel-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 18px 20px;
  border-bottom: 1px solid var(--border, #e6eaf0);
}

.bm-panel-head h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
}

.bm-panel-head p {
  margin: 4px 0 0;
  font-size: 11.5px;
  color: var(--text-secondary, #667085);
}

.bm-search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 9px;
  background: var(--bg-card-soft, #f8fafc);
  min-width: 260px;
}

.bm-search input {
  border: none;
  outline: none;
  background: transparent;
  color: var(--text-primary, #172033);
  font-size: 12px;
  width: 100%;
}

.bm-overflow {
  overflow-x: auto;
}

.bm-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12.5px;
  text-align: left;
}

.bm-table th,
.bm-table td {
  padding: 13px 18px;
  border-bottom: 1px solid var(--border, #e6eaf0);
  vertical-align: middle;
}

.bm-table thead th {
  background: var(--bg-card-soft, #f8fafc);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: var(--text-secondary, #667085);
}

.bm-money {
  font-weight: 650;
  font-variant-numeric: tabular-nums;
}

.bm-open-ended {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 6px;
  background: var(--bg-card-soft, #f8fafc);
  color: var(--text-secondary, #667085);
  font-size: 11px;
  font-weight: 600;
}

.bm-rate-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 700;
  background: rgba(36, 107, 253, 0.12);
  color: #246bfd;
}

.bm-rate-badge.is-employer {
  background: rgba(16, 185, 129, 0.13);
  color: #10b981;
}

.bm-actions-col {
  text-align: right;
  white-space: nowrap;
}

.bm-row-actions {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.bm-act-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
  border-radius: 7px;
  border: 1px solid var(--border, #e6eaf0);
  background: var(--bg-card, #ffffff);
  font-size: 11px;
  font-weight: 650;
  cursor: pointer;
  transition: all 0.15s ease;
}

.bm-act-edit {
  color: #246bfd;
  border-color: rgba(36, 107, 253, 0.35);
  background: rgba(36, 107, 253, 0.08);
}

.bm-act-edit:hover {
  background: #246bfd;
  color: #ffffff;
}

.bm-act-del {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.08);
}

.bm-act-del:hover {
  background: #ef4444;
  color: #ffffff;
}

.bm-empty {
  text-align: center;
  padding: 36px 20px;
  color: var(--text-secondary, #667085);
}

.bm-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  font-size: 12px;
  color: var(--text-secondary, #667085);
}

.bm-pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bm-page-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 7px;
  background: var(--bg-card, #ffffff);
  color: var(--text-primary, #172033);
  cursor: pointer;
}

.bm-page-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.bm-page-indicator {
  font-size: 11.5px;
  font-weight: 600;
}

/* MODAL */
.bm-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(5, 15, 30, 0.58);
}

.bm-modal,
.bm-confirm {
  width: min(620px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  padding: 24px;
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 15px;
  background: var(--bg-card, #ffffff);
  color: var(--text-primary, #172033);
  box-shadow: 0 20px 70px rgba(0, 0, 0, 0.28);
}

.bm-confirm {
  max-width: 430px;
}

.bm-modal-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.bm-modal-head h2,
.bm-confirm h2 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
}

.bm-modal-head p,
.bm-confirm p {
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--text-secondary, #667085);
}

.bm-x {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 7px;
  background: var(--bg-card, #ffffff);
  color: var(--text-secondary, #667085);
  cursor: pointer;
}

.bm-field-full {
  margin-bottom: 14px;
}

.bm-field-full label,
.bm-fields-grid label {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bm-field-full label > span,
.bm-fields-grid label > span,
.bm-mode-label {
  font-size: 11px;
  font-weight: 650;
}

.bm-field-full b,
.bm-fields-grid b,
.bm-mode-label b {
  color: #ef4444;
}

.bm-field-full select,
.bm-fields-grid input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 8px;
  background: var(--bg-card-soft, #f8fafc);
  color: var(--text-primary, #172033);
  font-size: 12px;
  outline: none;
}

.bm-fields-grid small {
  font-size: 10.5px;
  color: var(--text-secondary, #667085);
}

.bm-mode-switch {
  margin-bottom: 16px;
}

.bm-mode-buttons {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 7px;
}

.bm-mode-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 9px;
  background: var(--bg-card-soft, #f8fafc);
  color: var(--text-primary, #172033);
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
}

.bm-mode-btn.is-active {
  border-color: #246bfd;
  background: color-mix(in srgb, #246bfd 12%, var(--bg-card, #ffffff));
  color: #246bfd;
}

.bm-fields-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.bm-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
  margin-top: 22px;
}

@media (max-width: 768px) {
  .bm-stats,
  .bm-fields-grid,
  .bm-mode-buttons {
    grid-template-columns: 1fr;
  }
}
</style>

