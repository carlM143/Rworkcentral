<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Filter,
  History,
  Landmark,
  Layers,
  Search,
  X,
} from 'lucide-vue-next'
import type { ContributionRateScheduleRecord } from '~/composables/admin/contribution/useContributionRateScheduleApi'

const title = 'Contribution History'
const subtitle = 'Review historical and currently effective contribution rate schedules and salary bracket breakdowns across all contribution types.'

const { contributionTypes, loadContributionTypes } = useContributionTypes()
const { rateSchedules, loading, errorMessage, loadRateSchedules } = useContributionRateSchedules()
const { rateBrackets, loadRateBrackets } = useContributionRateBrackets()

onMounted(async () => {
  await Promise.all([
    loadContributionTypes(),
    loadRateSchedules(),
    loadRateBrackets(),
  ])
})

const typeLabels = computed<Record<number, string>>(() =>
  Object.fromEntries(
    contributionTypes.value.map(t => [
      t.id,
      `${t.contribution_code} — ${t.contribution_name}`,
    ]),
  ),
)

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
  if (n === null) return '—'
  return `${Number(n.toFixed(4))}%`
}

const bracketsForSchedule = (scheduleId: number) =>
  rateBrackets.value
    .filter(b => b.contribution_rate_schedule_id === scheduleId)
    .slice()
    .sort((a, b) => Number(a.salary_from) - Number(b.salary_from))

const formatShare = (schedule: ContributionRateScheduleRecord, side: 'employee' | 'employer') => {
  const method = schedule.calculation_method
  if (method === 'percentage') {
    return formatPercent(side === 'employee' ? schedule.employee_rate : schedule.employer_rate)
  }
  if (method === 'fixed') {
    const amt = side === 'employee' ? schedule.employee_amount : schedule.employer_amount
    const fallbackAmt = side === 'employee' ? schedule.employee_rate : schedule.employer_rate
    const freq = schedule.frequency ? ` / ${frequencyLabels[schedule.frequency] ?? schedule.frequency}` : ''
    return `${formatPeso(amt ?? fallbackAmt)}${freq}`
  }
  const count = schedule.brackets_count ?? bracketsForSchedule(schedule.id).length
  return count > 0 ? `${count} bracket tier${count === 1 ? '' : 's'}` : 'No brackets set'
}

const formatCoverage = (schedule: ContributionRateScheduleRecord) => {
  if (schedule.calculation_method === 'fixed') return 'Any salary'
  const lo = toNumber(schedule.minimum_salary_base)
  const hi = toNumber(schedule.maximum_salary_base)
  if (lo === null && hi === null) {
    if (schedule.calculation_method === 'bracket') {
      const tiers = bracketsForSchedule(schedule.id)
      if (tiers.length > 0) {
        const first = tiers[0]
        const last = tiers[tiers.length - 1]
        const from = formatPeso(first?.salary_from ?? 0)
        const to = last?.salary_to !== null && last?.salary_to !== undefined ? formatPeso(last.salary_to) : 'And Above'
        return `${from} – ${to}`
      }
    }
    return 'All salaries'
  }
  if (hi === null) return `${formatPeso(lo)} and above`
  if (lo === null) return `Up to ${formatPeso(hi)}`
  return `${formatPeso(lo)} – ${formatPeso(hi)}`
}

const formatBracketRateOrAmount = (
  rate: string | number | null | undefined,
  amount: string | number | null | undefined,
) => {
  const r = toNumber(rate)
  const a = toNumber(amount)
  if (r !== null && a !== null) return `${formatPercent(r)} (${formatPeso(a)})`
  if (r !== null) return formatPercent(r)
  if (a !== null) return formatPeso(a)
  return '—'
}

const scheduleTypeName = (schedule: ContributionRateScheduleRecord) => {
  if (schedule.contribution_type) {
    return `${schedule.contribution_type.contribution_code} — ${schedule.contribution_type.contribution_name}`
  }
  return typeLabels.value[schedule.contribution_type_id] ?? `Type #${schedule.contribution_type_id}`
}

// =====================================================
// FILTERS & PAGINATION
// =====================================================

const search = ref('')
const filterType = ref('all')
const filterMethod = ref('all')
const filterStatus = ref('all')

const page = ref(1)
const perPage = 8

const filteredSchedules = computed(() => {
  const term = search.value.trim().toLowerCase()

  return rateSchedules.value.filter((item) => {
    if (filterType.value !== 'all' && String(item.contribution_type_id) !== filterType.value) {
      return false
    }
    if (filterMethod.value !== 'all' && item.calculation_method !== filterMethod.value) {
      return false
    }
    if (filterStatus.value === 'active' && !item.is_status) return false
    if (filterStatus.value === 'inactive' && item.is_status) return false

    if (!term) return true

    const typeStr = scheduleTypeName(item).toLowerCase()
    const methodStr = (methodLabels[item.calculation_method] ?? item.calculation_method).toLowerCase()
    const basisStr = String(item.salary_basis ?? '').toLowerCase()
    const effFrom = String(item.effective_from ?? '').slice(0, 10)
    const effTo = String(item.effective_to ?? '').slice(0, 10)

    return (
      typeStr.includes(term) ||
      methodStr.includes(term) ||
      basisStr.includes(term) ||
      effFrom.includes(term) ||
      effTo.includes(term)
    )
  })
})

const activeCount = computed(() => rateSchedules.value.filter(s => s.is_status).length)

const totalPages = computed(() => Math.max(1, Math.ceil(filteredSchedules.value.length / perPage)))

const visibleSchedules = computed(() => {
  const start = (page.value - 1) * perPage
  return filteredSchedules.value.slice(start, start + perPage)
})

const paginationStart = computed(() =>
  filteredSchedules.value.length === 0 ? 0 : (page.value - 1) * perPage + 1,
)

const paginationEnd = computed(() =>
  Math.min(page.value * perPage, filteredSchedules.value.length),
)

watch([search, filterType, filterMethod, filterStatus], () => {
  page.value = 1
})

// =====================================================
// BRACKET PREVIEW MODAL
// =====================================================

const previewSchedule = ref<ContributionRateScheduleRecord | null>(null)
const previewBrackets = computed(() =>
  previewSchedule.value ? bracketsForSchedule(previewSchedule.value.id) : [],
)

// =====================================================
// CSV EXPORT
// =====================================================

const exportCsv = () => {
  const headers = [
    'Contribution Type',
    'Calculation Method',
    'Salary Basis',
    'Employee Contribution',
    'Employer Contribution',
    'Salary Coverage',
    'Effective From',
    'Effective To',
    'Status',
  ]

  const rows = filteredSchedules.value.map(s => [
    scheduleTypeName(s),
    methodLabels[s.calculation_method] ?? s.calculation_method,
    s.calculation_method === 'fixed' ? '—' : (s.salary_basis || '—'),
    formatShare(s, 'employee'),
    formatShare(s, 'employer'),
    formatCoverage(s),
    s.effective_from ? String(s.effective_from).slice(0, 10) : '—',
    s.effective_to ? String(s.effective_to).slice(0, 10) : 'Present',
    s.is_status ? 'Active' : 'Inactive',
  ])

  const escape = (val: unknown) => `"${String(val ?? '').replace(/"/g, '""')}"`
  const csv = [headers.map(escape).join(','), ...rows.map(r => r.map(escape).join(','))].join('\r\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'contribution-history.csv'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <section class="ch">
    <div v-if="errorMessage" class="ch-error" role="alert">
      {{ errorMessage }}
    </div>

    <!-- HEADER -->
    <div class="ch-header">
      <div class="ch-header-info">
        <div class="ch-eyebrow">
          <Landmark :size="14" />
          <span>PAYROLL CONFIGURATION / CONTRIBUTIONS / HISTORY</span>
        </div>
        <h1>{{ title }}</h1>
        <p>{{ subtitle }}</p>
      </div>

      <div class="ch-header-actions">
        <NuxtLink to="/admin/contribution/bracket-management" class="ch-btn ch-outline">
          <Layers :size="15" />
          <span>Bracket Management</span>
        </NuxtLink>

        <button type="button" class="ch-btn ch-outline" @click="exportCsv">
          <Download :size="15" />
          <span>Export CSV</span>
        </button>
      </div>
    </div>

    <!-- SUMMARY STATS -->
    <div class="ch-stats">
      <div class="ch-stat">
        <span>Total Rate Schedules</span>
        <strong>{{ rateSchedules.length }}</strong>
        <small>All historical & current schedules</small>
      </div>

      <div class="ch-stat">
        <span>Active Schedules</span>
        <strong>{{ activeCount }}</strong>
        <small class="ch-green">
          <CheckCircle2 :size="13" />
          Currently in effect
        </small>
      </div>

      <div class="ch-stat">
        <span>Total Salary Brackets</span>
        <strong>{{ rateBrackets.length }}</strong>
        <small>Configured bracket tiers</small>
      </div>
    </div>

    <!-- DIRECTORY PANEL -->
    <div class="ch-panel">
      <div class="ch-panel-head">
        <div>
          <h2>Contribution Rate Schedule History</h2>
          <p>Filter by contribution type, calculation method, or effective status.</p>
        </div>

        <div class="ch-toolbar">
          <div class="ch-search">
            <Search :size="16" />
            <input
              v-model="search"
              type="text"
              placeholder="Search type, method, date..."
              aria-label="Search contribution history"
            />
          </div>

          <div class="ch-filter">
            <Filter :size="14" />
            <select v-model="filterType" aria-label="Filter by contribution type">
              <option value="all">All Contribution Types</option>
              <option v-for="t in contributionTypes" :key="t.id" :value="String(t.id)">
                {{ t.contribution_code }} — {{ t.contribution_name }}
              </option>
            </select>
          </div>

          <div class="ch-filter">
            <select v-model="filterMethod" aria-label="Filter by calculation method">
              <option value="all">All Methods</option>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed</option>
              <option value="bracket">Bracket</option>
            </select>
          </div>

          <div class="ch-filter">
            <select v-model="filterStatus" aria-label="Filter by status">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <div class="ch-overflow">
        <table class="ch-table">
          <thead>
            <tr>
              <th scope="col">Contribution Type</th>
              <th scope="col">Method</th>
              <th scope="col">Salary Basis</th>
              <th scope="col">Employee Share</th>
              <th scope="col">Employer Share</th>
              <th scope="col">Salary Coverage</th>
              <th scope="col">Effective From</th>
              <th scope="col">Effective To</th>
              <th scope="col">Status</th>
              <th scope="col" class="ch-actions-col">Details</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="schedule in visibleSchedules" :key="schedule.id">
              <td class="ch-strong">{{ scheduleTypeName(schedule) }}</td>
              <td>
                <span class="ch-method-badge" :class="`is-${schedule.calculation_method}`">
                  {{ methodLabels[schedule.calculation_method] ?? schedule.calculation_method }}
                </span>
              </td>
              <td>{{ schedule.calculation_method === 'fixed' ? '—' : (schedule.salary_basis || '—') }}</td>
              <td class="ch-share-emp">{{ formatShare(schedule, 'employee') }}</td>
              <td class="ch-share-er">{{ formatShare(schedule, 'employer') }}</td>
              <td>{{ formatCoverage(schedule) }}</td>
              <td>{{ schedule.effective_from ? String(schedule.effective_from).slice(0, 10) : '—' }}</td>
              <td>
                <span v-if="schedule.effective_to">
                  {{ String(schedule.effective_to).slice(0, 10) }}
                </span>
                <span v-else class="ch-present-tag">Present</span>
              </td>
              <td>
                <span class="ch-status-pill" :class="schedule.is_status ? 'is-active' : 'is-inactive'">
                  {{ schedule.is_status ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="ch-actions-col">
                <button
                  v-if="schedule.calculation_method === 'bracket'"
                  type="button"
                  class="ch-view-btn"
                  @click="previewSchedule = schedule"
                >
                  <Eye :size="13" />
                  <span>View Brackets</span>
                </button>
                <span v-else class="ch-muted-dash">—</span>
              </td>
            </tr>

            <tr v-if="!loading && visibleSchedules.length === 0">
              <td colspan="10" class="ch-empty">
                No matching contribution history records found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="ch-pagination">
        <div class="ch-pagination-info">
          Showing <strong>{{ paginationStart }}–{{ paginationEnd }}</strong> of
          <strong>{{ filteredSchedules.length }}</strong> schedule records
        </div>
        <div class="ch-pagination-controls">
          <button type="button" class="ch-page-btn" :disabled="page === 1" @click="page--">
            <ChevronLeft :size="15" />
          </button>
          <span class="ch-page-indicator">Page {{ page }} of {{ totalPages }}</span>
          <button type="button" class="ch-page-btn" :disabled="page === totalPages" @click="page++">
            <ChevronRight :size="15" />
          </button>
        </div>
      </div>
    </div>

    <!-- BRACKET BREAKDOWN MODAL -->
    <Teleport to="body">
      <div v-if="previewSchedule" class="ch-backdrop" @click.self="previewSchedule = null">
        <div class="ch-modal" role="dialog" aria-modal="true">
          <div class="ch-modal-head">
            <div>
              <h2>{{ scheduleTypeName(previewSchedule) }} — Salary Brackets</h2>
              <p>
                Salary Basis: <strong>{{ previewSchedule.salary_basis || 'Basic Salary' }}</strong> ·
                Effective From: <strong>{{ String(previewSchedule.effective_from ?? '').slice(0, 10) }}</strong>
              </p>
            </div>
            <button type="button" class="ch-x" aria-label="Close" @click="previewSchedule = null">
              <X :size="18" />
            </button>
          </div>

          <div class="ch-overflow">
            <table class="ch-table">
              <thead>
                <tr>
                  <th scope="col">Salary From</th>
                  <th scope="col">Salary To</th>
                  <th scope="col">Employee Rate / Amount</th>
                  <th scope="col">Employer Rate / Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="b in previewBrackets" :key="b.id">
                  <td class="ch-strong">{{ formatPeso(b.salary_from) }}</td>
                  <td>{{ b.salary_to !== null && b.salary_to !== undefined ? formatPeso(b.salary_to) : 'And Above' }}</td>
                  <td class="ch-share-emp">{{ formatBracketRateOrAmount(b.employee_rate, b.employee_amount) }}</td>
                  <td class="ch-share-er">{{ formatBracketRateOrAmount(b.employer_rate, b.employer_amount) }}</td>
                </tr>
                <tr v-if="previewBrackets.length === 0">
                  <td colspan="4" class="ch-empty">
                    No brackets have been added to this schedule yet.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="ch-modal-footer">
            <button type="button" class="ch-btn ch-outline" @click="previewSchedule = null">
              Close
            </button>
            <NuxtLink
              :to="{ path: '/admin/contribution/bracket-management', query: { schedule: String(previewSchedule.id) } }"
              class="ch-btn ch-primary"
              @click="previewSchedule = null"
            >
              <Layers :size="15" />
              <span>Manage Brackets</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.ch {
  width: 100%;
  max-width: 1700px;
  margin: 0 auto;
  color: var(--text-primary, #172033);
}

.ch-error {
  padding: 12px 14px;
  margin-bottom: 14px;
  border: 1px solid var(--red, #ef4444);
  border-radius: 9px;
  background: color-mix(in srgb, var(--red, #ef4444) 10%, var(--bg-card, #ffffff));
  color: var(--red, #ef4444);
  font-size: 12px;
}

.ch-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.ch-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.6px;
  color: #246bfd;
  margin-bottom: 6px;
}

.ch-header h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 750;
}

.ch-header p {
  margin: 4px 0 0;
  font-size: 12.5px;
  color: var(--text-secondary, #667085);
}

.ch-header-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.ch-btn {
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

.ch-primary {
  background: #246bfd;
  color: #ffffff;
}

.ch-primary:hover {
  background: #1657dd;
}

.ch-outline {
  border-color: var(--border, #e6eaf0);
  background: var(--bg-card, #ffffff);
  color: var(--text-primary, #172033);
}

.ch-outline:hover {
  background: var(--bg-card-soft, #f8fafc);
}

.ch-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

.ch-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 18px;
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 13px;
  background: var(--bg-card, #ffffff);
}

.ch-stat span {
  font-size: 11px;
  font-weight: 650;
  color: var(--text-secondary, #667085);
}

.ch-stat strong {
  font-size: 22px;
  font-weight: 750;
}

.ch-stat small {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: var(--text-secondary, #667085);
}

.ch-green {
  color: #10b981 !important;
}

.ch-panel {
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 14px;
  background: var(--bg-card, #ffffff);
  overflow: hidden;
}

.ch-panel-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 18px 20px;
  border-bottom: 1px solid var(--border, #e6eaf0);
}

.ch-panel-head h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
}

.ch-panel-head p {
  margin: 4px 0 0;
  font-size: 11.5px;
  color: var(--text-secondary, #667085);
}

.ch-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.ch-search,
.ch-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 9px;
  background: var(--bg-card-soft, #f8fafc);
}

.ch-search input,
.ch-filter select {
  border: none;
  outline: none;
  background: transparent;
  color: var(--text-primary, #172033);
  font-size: 12px;
}

.ch-filter select option {
  background: var(--bg-card, #ffffff);
  color: var(--text-primary, #172033);
}

.ch-overflow {
  overflow-x: auto;
}

.ch-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12.5px;
  text-align: left;
}

.ch-table th,
.ch-table td {
  padding: 13px 16px;
  border-bottom: 1px solid var(--border, #e6eaf0);
  vertical-align: middle;
}

.ch-table thead th {
  background: var(--bg-card-soft, #f8fafc);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: var(--text-secondary, #667085);
}

.ch-strong {
  font-weight: 650;
}

.ch-method-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
}

.ch-method-badge.is-percentage {
  background: rgba(36, 107, 253, 0.12);
  color: #246bfd;
}

.ch-method-badge.is-fixed {
  background: rgba(245, 158, 11, 0.14);
  color: #f59e0b;
}

.ch-method-badge.is-bracket {
  background: rgba(139, 92, 246, 0.14);
  color: #8b5cf6;
}

.ch-share-emp {
  font-weight: 650;
  color: #246bfd;
}

.ch-share-er {
  font-weight: 650;
  color: #10b981;
}

.ch-present-tag {
  font-size: 11px;
  color: var(--text-secondary, #667085);
}

.ch-status-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 650;
}

.ch-status-pill.is-active {
  background: rgba(16, 185, 129, 0.14);
  color: #10b981;
}

.ch-status-pill.is-inactive {
  background: rgba(148, 163, 184, 0.16);
  color: #64748b;
}

.ch-actions-col {
  text-align: right;
  white-space: nowrap;
}

.ch-view-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
  border: 1px solid rgba(36, 107, 253, 0.35);
  border-radius: 7px;
  background: rgba(36, 107, 253, 0.08);
  color: #246bfd;
  font-size: 11px;
  font-weight: 650;
  cursor: pointer;
}

.ch-view-btn:hover {
  background: #246bfd;
  color: #ffffff;
}

.ch-muted-dash {
  color: var(--text-secondary, #667085);
}

.ch-empty {
  text-align: center;
  padding: 36px 20px;
  color: var(--text-secondary, #667085);
}

.ch-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  font-size: 12px;
  color: var(--text-secondary, #667085);
}

.ch-pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ch-page-btn {
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

.ch-page-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.ch-page-indicator {
  font-size: 11.5px;
  font-weight: 600;
}

.ch-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(5, 15, 30, 0.58);
}

.ch-modal {
  width: min(680px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  padding: 24px;
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 15px;
  background: var(--bg-card, #ffffff);
  color: var(--text-primary, #172033);
  box-shadow: 0 20px 70px rgba(0, 0, 0, 0.28);
}

.ch-modal-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.ch-modal-head h2 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
}

.ch-modal-head p {
  margin: 5px 0 0;
  font-size: 12px;
  color: var(--text-secondary, #667085);
}

.ch-x {
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

.ch-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .ch-stats {
    grid-template-columns: 1fr;
  }
}
</style>
