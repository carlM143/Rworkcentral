<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Eye,
  FileDiff,
  Filter,
  History,
  Landmark,
  Layers,
  RefreshCw,
  Search,
  UserCheck,
  X,
} from 'lucide-vue-next'
import type { ContributionChangeLogRecord } from '~/composables/admin/contribution/useContributionChangeLogApi'
import { useContributionChangeLogs } from '~/composables/admin/contribution/useContributionChangeLogs'
import type { ContributionRateScheduleRecord } from '~/composables/admin/contribution/useContributionRateScheduleApi'

const title = 'Contribution History'
const subtitle = 'Audit trail of all contribution configuration changes (contribution_change_logs) and historical rate schedule versions.'

const { contributionTypes, loadContributionTypes } = useContributionTypes()
const { rateSchedules, loading: schedulesLoading, errorMessage: scheduleError, loadRateSchedules } = useContributionRateSchedules()
const { rateBrackets, loadRateBrackets } = useContributionRateBrackets()
const { changeLogs, loading: logsLoading, errorMessage: logError, loadChangeLogs } = useContributionChangeLogs()

const activeTab = ref<'logs' | 'schedules'>('logs')

const refreshAll = async () => {
  await Promise.all([
    loadContributionTypes(),
    loadChangeLogs(),
    loadRateSchedules(),
    loadRateBrackets(),
  ])
}

onMounted(refreshAll)

const combinedError = computed(() => logError.value || scheduleError.value)
const isLoading = computed(() => logsLoading.value || schedulesLoading.value)

const typeLabels = computed<Record<number, string>>(() =>
  Object.fromEntries(
    contributionTypes.value.map(t => [
      t.id,
      `${t.contribution_code} — ${t.contribution_name}`,
    ]),
  ),
)

const entityTypeLabels: Record<string, string> = {
  contribution_type: 'Contribution Type',
  rate_schedule: 'Rate Schedule',
  rate_bracket: 'Rate Bracket',
  deduction_setting: 'Deduction Setting',
}

const actionLabels: Record<string, string> = {
  created: 'Created',
  updated: 'Updated',
  versioned: 'Versioned',
  deactivated: 'Deactivated',
  deleted: 'Deleted',
}

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

const fieldLabels: Record<string, string> = {
  contribution_code: 'Contribution Code',
  contribution_name: 'Contribution Name',
  provider: 'Provider',
  is_status: 'Status',
  contribution_type_id: 'Contribution Type ID',
  calculation_method: 'Calculation Method',
  salary_basis: 'Salary Basis',
  employee_rate: 'Employee Rate (%)',
  employer_rate: 'Employer Rate (%)',
  employee_amount: 'Employee Amount (₱)',
  employer_amount: 'Employer Amount (₱)',
  frequency: 'Deduction Frequency',
  minimum_salary_base: 'Minimum Salary Base (₱)',
  maximum_salary_base: 'Maximum Salary Base (₱)',
  effective_from: 'Effective From',
  effective_to: 'Effective To',
  brackets_count: 'Brackets Count',
  contribution_rate_schedule_id: 'Rate Schedule ID',
  salary_from: 'Salary From (₱)',
  salary_to: 'Salary To (₱)',
  monthly_salary_credit: 'Monthly Salary Credit (₱)',
  employer_ec_amount: 'Employer EC Amount (₱)',
  company_id: 'Company ID',
  department_id: 'Department ID',
  salary_type_id: 'Salary Type ID',
  deduction_schedule: 'Deduction Schedule',
  first_cutoff_percent: '1st Cutoff (%)',
  second_cutoff_percent: '2nd Cutoff (%)',
  week_1_percent: '1st Saturday (%)',
  week_2_percent: '2nd Saturday (%)',
  week_3_percent: '3rd Saturday (%)',
  week_4_percent: '4th Saturday (%)',
}

// =====================================================
// FORMATTERS
// =====================================================

const toNumber = (val: unknown): number | null => {
  if (val === null || val === undefined || val === '' || typeof val === 'boolean') return null
  const n = Number(val)
  return Number.isNaN(n) ? null : n
}

const formatPeso = (val: unknown) => {
  const n = toNumber(val)
  if (n === null) return '—'
  return '₱' + n.toLocaleString('en-PH', {
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })
}

const formatPercent = (val: unknown) => {
  const n = toNumber(val)
  if (n === null) return '—'
  return `${Number(n.toFixed(4))}%`
}

const formatDateTime = (iso?: string | null) => {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return String(iso)
  return d.toLocaleString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const logTypeName = (log: ContributionChangeLogRecord) => {
  if (log.contribution_type) {
    return `${log.contribution_type.contribution_code} — ${log.contribution_type.contribution_name}`
  }
  return typeLabels.value[log.contribution_type_id] ?? `Type #${log.contribution_type_id}`
}

const formatFieldVal = (key: string, val: unknown): string => {
  if (val === null || val === undefined || val === '') return '—'
  if (key === 'is_status') return val ? 'Active' : 'Inactive'
  if (key.includes('amount') || key.includes('salary_from') || key.includes('salary_to') || key.includes('salary_base') || key.includes('salary_credit')) {
    return formatPeso(val)
  }
  if (key.includes('rate') || key.includes('percent')) {
    return formatPercent(val)
  }
  if (key === 'calculation_method') {
    return methodLabels[String(val)] ?? String(val)
  }
  if (key === 'frequency') {
    return frequencyLabels[String(val)] ?? String(val)
  }
  if ((key === 'effective_from' || key === 'effective_to') && typeof val === 'string') {
    return val.slice(0, 10)
  }
  return String(val)
}

const getDiffEntries = (log: ContributionChangeLogRecord) => {
  const oldObj = log.old_values ?? {}
  const newObj = log.new_values ?? {}
  const keys = Array.from(new Set([...Object.keys(oldObj), ...Object.keys(newObj)]))

  return keys.map((key) => {
    const oldVal = oldObj[key]
    const newVal = newObj[key]
    const oldFormatted = formatFieldVal(key, oldVal)
    const newFormatted = formatFieldVal(key, newVal)
    const changed = log.old_values !== null && log.new_values !== null && oldFormatted !== newFormatted

    return {
      key,
      label: fieldLabels[key] ?? key.replace(/_/g, ' '),
      oldRaw: oldVal,
      newRaw: newVal,
      oldText: oldFormatted,
      newText: newFormatted,
      changed,
    }
  })
}

const summarizeLogHighlights = (log: ContributionChangeLogRecord) => {
  const entries = getDiffEntries(log)
  if (log.old_values && log.new_values) {
    const changed = entries.filter(e => e.changed)
    if (changed.length > 0) {
      return changed
        .slice(0, 3)
        .map(e => `${e.label}: ${e.oldText} → ${e.newText}`)
        .join(' · ')
    }
  }
  const source = log.new_values ?? log.old_values
  if (!source) return ''
  const previewKeys = ['calculation_method', 'employee_rate', 'employer_rate', 'employee_amount', 'salary_from', 'deduction_schedule', 'effective_from']
  const parts: string[] = []
  for (const k of previewKeys) {
    if (source[k] !== undefined && source[k] !== null && source[k] !== '') {
      parts.push(`${fieldLabels[k] ?? k}: ${formatFieldVal(k, source[k])}`)
    }
    if (parts.length >= 3) break
  }
  return parts.join(' · ')
}

// =====================================================
// CHANGE LOG FILTERS & PAGINATION
// =====================================================

const logSearch = ref('')
const logFilterType = ref('all')
const logFilterEntity = ref('all')
const logFilterAction = ref('all')

const logPage = ref(1)
const logPerPage = 10

const filteredLogs = computed(() => {
  const term = logSearch.value.trim().toLowerCase()

  return changeLogs.value.filter((item) => {
    if (logFilterType.value !== 'all' && String(item.contribution_type_id) !== logFilterType.value) {
      return false
    }
    if (logFilterEntity.value !== 'all' && item.entity_type !== logFilterEntity.value) {
      return false
    }
    if (logFilterAction.value !== 'all' && item.action !== logFilterAction.value) {
      return false
    }

    if (!term) return true

    const typeStr = logTypeName(item).toLowerCase()
    const entityStr = (entityTypeLabels[item.entity_type] ?? item.entity_type).toLowerCase()
    const actionStr = (actionLabels[item.action] ?? item.action).toLowerCase()
    const actorStr = String(item.actor_name ?? '').toLowerCase()
    const reasonStr = String(item.reason ?? '').toLowerCase()
    const companyStr = String(item.company?.company_name ?? '').toLowerCase()

    return (
      typeStr.includes(term) ||
      entityStr.includes(term) ||
      actionStr.includes(term) ||
      actorStr.includes(term) ||
      reasonStr.includes(term) ||
      companyStr.includes(term)
    )
  })
})

const totalLogPages = computed(() => Math.max(1, Math.ceil(filteredLogs.value.length / logPerPage)))

const visibleLogs = computed(() => {
  const start = (logPage.value - 1) * logPerPage
  return filteredLogs.value.slice(start, start + logPerPage)
})

const logPaginationStart = computed(() =>
  filteredLogs.value.length === 0 ? 0 : (logPage.value - 1) * logPerPage + 1,
)

const logPaginationEnd = computed(() =>
  Math.min(logPage.value * logPerPage, filteredLogs.value.length),
)

watch([logSearch, logFilterType, logFilterEntity, logFilterAction], () => {
  logPage.value = 1
})

// =====================================================
// SUMMARY COUNTS
// =====================================================

const createdOrVersionedCount = computed(() =>
  changeLogs.value.filter(l => l.action === 'created' || l.action === 'versioned').length,
)

const updatedOrDeactivatedCount = computed(() =>
  changeLogs.value.filter(l => l.action === 'updated' || l.action === 'deactivated' || l.action === 'deleted').length,
)

const activeSchedulesCount = computed(() =>
  rateSchedules.value.filter(s => s.is_status).length,
)

// =====================================================
// SCHEDULE SNAPSHOT TAB HELPERS
// =====================================================

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
// MODALS
// =====================================================

const selectedLog = ref<ContributionChangeLogRecord | null>(null)
const selectedLogEntries = computed(() =>
  selectedLog.value ? getDiffEntries(selectedLog.value) : [],
)

const previewSchedule = ref<ContributionRateScheduleRecord | null>(null)
const previewBrackets = computed(() =>
  previewSchedule.value ? bracketsForSchedule(previewSchedule.value.id) : [],
)

// =====================================================
// CSV EXPORT
// =====================================================

const exportCsv = () => {
  const escape = (val: unknown) => `"${String(val ?? '').replace(/"/g, '""')}"`

  if (activeTab.value === 'logs') {
    const headers = [
      'Log ID',
      'Date & Time',
      'Contribution Type',
      'Entity Type',
      'Entity ID',
      'Action',
      'Reason',
      'Changed By',
      'Old Values',
      'New Values',
    ]

    const rows = filteredLogs.value.map(l => [
      l.id,
      formatDateTime(l.created_at),
      logTypeName(l),
      entityTypeLabels[l.entity_type] ?? l.entity_type,
      l.entity_id,
      actionLabels[l.action] ?? l.action,
      l.reason ?? '',
      l.actor_name,
      l.old_values ? JSON.stringify(l.old_values) : '',
      l.new_values ? JSON.stringify(l.new_values) : '',
    ])

    const csv = [headers.map(escape).join(','), ...rows.map(r => r.map(escape).join(','))].join('\r\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'contribution-change-logs.csv'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    return
  }

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

  const csv = [headers.map(escape).join(','), ...rows.map(r => r.map(escape).join(','))].join('\r\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'contribution-rate-schedules-history.csv'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <section class="ch">
    <div v-if="combinedError" class="ch-error" role="alert">
      {{ combinedError }}
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
        <button type="button" class="ch-btn ch-outline" :disabled="isLoading" @click="refreshAll">
          <RefreshCw :size="15" :class="{ 'ch-spin': isLoading }" />
          <span>Refresh</span>
        </button>

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
        <span>Total Change Logs</span>
        <strong>{{ changeLogs.length }}</strong>
        <small>Recorded in contribution_change_logs</small>
      </div>

      <div class="ch-stat">
        <span>Created & Versioned</span>
        <strong>{{ createdOrVersionedCount }}</strong>
        <small class="ch-green">
          <CheckCircle2 :size="13" />
          Initial & versioned entries
        </small>
      </div>

      <div class="ch-stat">
        <span>Updated & Deactivated</span>
        <strong>{{ updatedOrDeactivatedCount }}</strong>
        <small>Rate & setting modifications</small>
      </div>

      <div class="ch-stat">
        <span>Active Rate Schedules</span>
        <strong>{{ activeSchedulesCount }}</strong>
        <small>{{ rateBrackets.length }} configured bracket tiers</small>
      </div>
    </div>

    <!-- VIEW TABS -->
    <div class="ch-tabs">
      <button
        type="button"
        class="ch-tab"
        :class="{ 'is-active': activeTab === 'logs' }"
        @click="activeTab = 'logs'"
      >
        <History :size="15" />
        <span>Audit Change Logs ({{ changeLogs.length }})</span>
      </button>

      <button
        type="button"
        class="ch-tab"
        :class="{ 'is-active': activeTab === 'schedules' }"
        @click="activeTab = 'schedules'"
      >
        <Layers :size="15" />
        <span>Rate Schedule Versions ({{ rateSchedules.length }})</span>
      </button>
    </div>

    <!-- TAB 1: AUDIT CHANGE LOGS (contribution_change_logs) -->
    <div v-if="activeTab === 'logs'" class="ch-panel">
      <div class="ch-panel-head">
        <div>
          <h2>Contribution Change Logs</h2>
          <p>Complete audit history of created, updated, versioned, deactivated, and deleted contribution configurations.</p>
        </div>

        <div class="ch-toolbar">
          <div class="ch-search">
            <Search :size="16" />
            <input
              v-model="logSearch"
              type="text"
              placeholder="Search actor, reason, type..."
              aria-label="Search contribution change logs"
            />
          </div>

          <div class="ch-filter">
            <Filter :size="14" />
            <select v-model="logFilterType" aria-label="Filter by contribution type">
              <option value="all">All Contribution Types</option>
              <option v-for="t in contributionTypes" :key="t.id" :value="String(t.id)">
                {{ t.contribution_code }} — {{ t.contribution_name }}
              </option>
            </select>
          </div>

          <div class="ch-filter">
            <select v-model="logFilterEntity" aria-label="Filter by entity type">
              <option value="all">All Entities</option>
              <option value="contribution_type">Contribution Type</option>
              <option value="rate_schedule">Rate Schedule</option>
              <option value="rate_bracket">Rate Bracket</option>
              <option value="deduction_setting">Deduction Setting</option>
            </select>
          </div>

          <div class="ch-filter">
            <select v-model="logFilterAction" aria-label="Filter by action">
              <option value="all">All Actions</option>
              <option value="created">Created</option>
              <option value="updated">Updated</option>
              <option value="versioned">Versioned</option>
              <option value="deactivated">Deactivated</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>
        </div>
      </div>

      <div class="ch-overflow">
        <table class="ch-table">
          <thead>
            <tr>
              <th scope="col">Date & Time</th>
              <th scope="col">Contribution Type</th>
              <th scope="col">Entity</th>
              <th scope="col">Action</th>
              <th scope="col">Reason & Change Summary</th>
              <th scope="col">Changed By</th>
              <th scope="col" class="ch-actions-col">Details</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in visibleLogs" :key="log.id">
              <td class="ch-date-cell">
                <div class="ch-date-main">
                  <Clock :size="13" />
                  <span>{{ formatDateTime(log.created_at) }}</span>
                </div>
              </td>
              <td class="ch-strong">{{ logTypeName(log) }}</td>
              <td>
                <div class="ch-entity-cell">
                  <span class="ch-entity-badge">
                    {{ entityTypeLabels[log.entity_type] ?? log.entity_type }}
                  </span>
                  <small class="ch-entity-sub">
                    #{{ log.entity_id }}
                    <template v-if="log.company?.company_name"> · {{ log.company.company_name }}</template>
                    <template v-else-if="log.contribution_rate_schedule_id"> · Schedule #{{ log.contribution_rate_schedule_id }}</template>
                  </small>
                </div>
              </td>
              <td>
                <span class="ch-action-pill" :class="`is-${log.action}`">
                  {{ actionLabels[log.action] ?? log.action }}
                </span>
              </td>
              <td class="ch-reason-cell">
                <p class="ch-reason-text">{{ log.reason || 'Configuration change recorded.' }}</p>
                <small v-if="summarizeLogHighlights(log)" class="ch-diff-inline">
                  {{ summarizeLogHighlights(log) }}
                </small>
              </td>
              <td>
                <div class="ch-actor-cell">
                  <UserCheck :size="13" />
                  <span>{{ log.actor_name }}</span>
                </div>
              </td>
              <td class="ch-actions-col">
                <button
                  type="button"
                  class="ch-view-btn"
                  @click="selectedLog = log"
                >
                  <FileDiff :size="13" />
                  <span>View Diff</span>
                </button>
              </td>
            </tr>

            <tr v-if="!logsLoading && visibleLogs.length === 0">
              <td colspan="7" class="ch-empty">
                No matching contribution change logs found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="ch-pagination">
        <div class="ch-pagination-info">
          Showing <strong>{{ logPaginationStart }}–{{ logPaginationEnd }}</strong> of
          <strong>{{ filteredLogs.length }}</strong> change log entries
        </div>
        <div class="ch-pagination-controls">
          <button type="button" class="ch-page-btn" :disabled="logPage === 1" @click="logPage--">
            <ChevronLeft :size="15" />
          </button>
          <span class="ch-page-indicator">Page {{ logPage }} of {{ totalLogPages }}</span>
          <button type="button" class="ch-page-btn" :disabled="logPage === totalLogPages" @click="logPage++">
            <ChevronRight :size="15" />
          </button>
        </div>
      </div>
    </div>

    <!-- TAB 2: RATE SCHEDULE VERSIONS -->
    <div v-else class="ch-panel">
      <div class="ch-panel-head">
        <div>
          <h2>Contribution Rate Schedule Versions</h2>
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

            <tr v-if="!schedulesLoading && visibleSchedules.length === 0">
              <td colspan="10" class="ch-empty">
                No matching contribution rate schedules found.
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

    <!-- CHANGE LOG DIFF MODAL -->
    <Teleport to="body">
      <div v-if="selectedLog" class="ch-backdrop" @click.self="selectedLog = null">
        <div class="ch-modal ch-diff-modal" role="dialog" aria-modal="true">
          <div class="ch-modal-head">
            <div>
              <div class="ch-modal-badges">
                <span class="ch-action-pill" :class="`is-${selectedLog.action}`">
                  {{ actionLabels[selectedLog.action] ?? selectedLog.action }}
                </span>
                <span class="ch-entity-badge">
                  {{ entityTypeLabels[selectedLog.entity_type] ?? selectedLog.entity_type }} #{{ selectedLog.entity_id }}
                </span>
              </div>
              <h2>{{ logTypeName(selectedLog) }} — Change Log #{{ selectedLog.id }}</h2>
              <p>
                Changed by <strong>{{ selectedLog.actor_name }}</strong> on
                <strong>{{ formatDateTime(selectedLog.created_at) }}</strong>
              </p>
            </div>
            <button type="button" class="ch-x" aria-label="Close" @click="selectedLog = null">
              <X :size="18" />
            </button>
          </div>

          <div class="ch-diff-body">
            <div class="ch-diff-meta-grid">
              <div class="ch-meta-card">
                <span>Contribution Type</span>
                <strong>{{ logTypeName(selectedLog) }}</strong>
              </div>
              <div class="ch-meta-card">
                <span>Entity Reference</span>
                <strong>{{ entityTypeLabels[selectedLog.entity_type] ?? selectedLog.entity_type }} (ID #{{ selectedLog.entity_id }})</strong>
              </div>
              <div class="ch-meta-card">
                <span>Rate Schedule / Company</span>
                <strong>
                  <template v-if="selectedLog.contribution_rate_schedule_id">
                    Schedule #{{ selectedLog.contribution_rate_schedule_id }}
                  </template>
                  <template v-else-if="selectedLog.company?.company_name">
                    {{ selectedLog.company.company_name }}
                  </template>
                  <template v-else>—</template>
                </strong>
              </div>
              <div class="ch-meta-card">
                <span>Actor</span>
                <strong>{{ selectedLog.actor_name }} (User #{{ selectedLog.changed_by }})</strong>
              </div>
            </div>

            <div v-if="selectedLog.reason" class="ch-reason-box">
              <span>Reason / Audit Note</span>
              <p>{{ selectedLog.reason }}</p>
            </div>

            <div class="ch-overflow">
              <table class="ch-table ch-diff-table">
                <thead>
                  <tr>
                    <th scope="col">Field</th>
                    <th scope="col">Previous Value (old_values)</th>
                    <th scope="col" class="ch-arrow-col" />
                    <th scope="col">New Value (new_values)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="entry in selectedLogEntries"
                    :key="entry.key"
                    :class="{ 'is-changed-row': entry.changed }"
                  >
                    <td class="ch-strong">{{ entry.label }}</td>
                    <td class="ch-old-val">{{ entry.oldText }}</td>
                    <td class="ch-arrow-col">
                      <ArrowRight :size="13" />
                    </td>
                    <td class="ch-new-val" :class="{ 'is-highlighted': entry.changed }">
                      {{ entry.newText }}
                    </td>
                  </tr>
                  <tr v-if="selectedLogEntries.length === 0">
                    <td colspan="4" class="ch-empty">
                      No structured field snapshot recorded for this entry.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="ch-modal-footer">
            <button type="button" class="ch-btn ch-outline" @click="selectedLog = null">
              Close
            </button>
          </div>
        </div>
      </div>
    </Teleport>

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

.ch-spin {
  animation: ch-spin 0.8s linear infinite;
}

@keyframes ch-spin {
  to {
    transform: rotate(360deg);
  }
}

.ch-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 16px;
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

.ch-tabs {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px;
  margin-bottom: 14px;
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 11px;
  background: var(--bg-card, #ffffff);
}

.ch-tab {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary, #667085);
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
  transition: all 0.15s ease;
}

.ch-tab.is-active {
  background: #246bfd;
  color: #ffffff;
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

.ch-date-cell {
  white-space: nowrap;
}

.ch-date-main {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary, #667085);
}

.ch-entity-cell {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.ch-entity-badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 3px 8px;
  border-radius: 6px;
  background: var(--bg-card-soft, #f1f5f9);
  border: 1px solid var(--border, #e2e8f0);
  font-size: 11px;
  font-weight: 650;
}

.ch-entity-sub {
  font-size: 11px;
  color: var(--text-secondary, #667085);
}

.ch-action-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  text-transform: capitalize;
}

.ch-action-pill.is-created {
  background: rgba(16, 185, 129, 0.14);
  color: #10b981;
}

.ch-action-pill.is-updated {
  background: rgba(36, 107, 253, 0.14);
  color: #246bfd;
}

.ch-action-pill.is-versioned {
  background: rgba(139, 92, 246, 0.15);
  color: #8b5cf6;
}

.ch-action-pill.is-deactivated {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.ch-action-pill.is-deleted {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.ch-reason-cell {
  max-width: 440px;
}

.ch-reason-text {
  margin: 0;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-primary, #172033);
}

.ch-diff-inline {
  display: block;
  margin-top: 3px;
  font-size: 11px;
  color: var(--text-secondary, #667085);
}

.ch-actor-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
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
  background: rgba(36, 107, 253, 0.15);
}

.ch-muted-dash {
  color: var(--text-secondary, #667085);
}

.ch-empty {
  padding: 28px !important;
  text-align: center;
  color: var(--text-secondary, #667085);
}

.ch-pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 20px;
}

.ch-pagination-info {
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
  font-size: 12px;
  font-weight: 600;
}

.ch-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(2px);
}

.ch-modal {
  width: min(980px, 95vw);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 14px;
  background: var(--bg-card, #ffffff);
  color: var(--text-primary, #172033);
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
}

.ch-diff-modal {
  width: min(1080px, 95vw);
}

.ch-modal-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 22px;
  border-bottom: 1px solid var(--border, #e6eaf0);
}

.ch-modal-badges {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.ch-modal-head h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 750;
}

.ch-modal-head p {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--text-secondary, #667085);
}

.ch-x {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary, #667085);
  cursor: pointer;
}

.ch-diff-body {
  padding: 18px 22px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ch-diff-meta-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.ch-meta-card {
  padding: 11px 14px;
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 10px;
  background: var(--bg-card-soft, #f8fafc);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ch-meta-card span {
  font-size: 11px;
  color: var(--text-secondary, #667085);
}

.ch-meta-card strong {
  font-size: 12.5px;
  font-weight: 700;
}

.ch-reason-box {
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid rgba(36, 107, 253, 0.25);
  background: rgba(36, 107, 253, 0.05);
}

.ch-reason-box span {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: #246bfd;
  margin-bottom: 4px;
}

.ch-reason-box p {
  margin: 0;
  font-size: 12.5px;
}

.ch-diff-table {
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 10px;
}

.ch-arrow-col {
  width: 32px;
  text-align: center;
  color: var(--text-secondary, #667085);
}

.ch-old-val {
  color: var(--text-secondary, #667085);
}

.ch-new-val.is-highlighted {
  font-weight: 700;
  color: #10b981;
}

.is-changed-row {
  background: rgba(16, 185, 129, 0.05);
}

.ch-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 22px;
  border-top: 1px solid var(--border, #e6eaf0);
}

@media (max-width: 960px) {
  .ch-stats,
  .ch-diff-meta-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .ch-stats,
  .ch-diff-meta-grid {
    grid-template-columns: 1fr;
  }
}
</style>
