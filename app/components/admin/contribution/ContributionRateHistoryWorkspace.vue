<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileDiff,
  History,
  Landmark,
  Layers,
  RefreshCw,
  UserCheck,
  X,
} from 'lucide-vue-next'
import type { ContributionChangeLogRecord } from '~/composables/admin/contribution/useContributionChangeLogApi'
import { useContributionChangeLogs } from '~/composables/admin/contribution/useContributionChangeLogs'
import type { ContributionRateScheduleRecord } from '~/composables/admin/contribution/useContributionRateScheduleApi'

const title = 'Contribution History'
const subtitle = 'Audit trail of contribution configuration changes and past rate schedule versions.'

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

// =====================================================
// LABELS
// =====================================================

const typeLabels = computed<Record<number, string>>(() =>
  Object.fromEntries(
    contributionTypes.value.map(t => [t.id, `${t.contribution_code} — ${t.contribution_name}`]),
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
  salary_from: 'Salary From (₱)',
  salary_to: 'Salary To (₱)',
  monthly_salary_credit: 'Monthly Salary Credit (₱)',
  employer_ec_amount: 'Employer EC Amount (₱)',
  first_cutoff_percent: '1st Cutoff (%)',
  second_cutoff_percent: '2nd Cutoff (%)',
}

const HIDDEN_FIELDS = new Set([
  'company_id',
  'contribution_type_id',
  'contribution_rate_schedule_id',
])

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
  return n === null ? '—' : `${Number(n.toFixed(4))}%`
}

const formatDate = (val?: string | null) => (val ? String(val).slice(0, 10) : '—')

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

const logTypeName = (log: ContributionChangeLogRecord) =>
  log.contribution_type
    ? `${log.contribution_type.contribution_code} — ${log.contribution_type.contribution_name}`
    : typeLabels.value[log.contribution_type_id] ?? `Type #${log.contribution_type_id}`

const scheduleTypeName = (schedule: ContributionRateScheduleRecord) =>
  schedule.contribution_type
    ? `${schedule.contribution_type.contribution_code} — ${schedule.contribution_type.contribution_name}`
    : typeLabels.value[schedule.contribution_type_id] ?? `Type #${schedule.contribution_type_id}`

const formatFieldVal = (key: string, val: unknown): string => {
  if (val === null || val === undefined || val === '') return '—'
  if (key === 'is_status') return val ? 'Active' : 'Inactive'
  if (/amount|salary_from|salary_to|salary_base|salary_credit/.test(key)) return formatPeso(val)
  if (/rate|percent/.test(key)) return formatPercent(val)
  if (key === 'calculation_method') return methodLabels[String(val)] ?? String(val)
  if (key === 'frequency') return frequencyLabels[String(val)] ?? String(val)
  if ((key === 'effective_from' || key === 'effective_to') && typeof val === 'string') return val.slice(0, 10)
  return String(val)
}

const getDiffEntries = (log: ContributionChangeLogRecord) => {
  const oldObj = log.old_values ?? {}
  const newObj = log.new_values ?? {}
  const keys = Array.from(new Set([...Object.keys(oldObj), ...Object.keys(newObj)]))
    .filter(key => !HIDDEN_FIELDS.has(key))

  return keys.map((key) => {
    const oldText = formatFieldVal(key, oldObj[key])
    const newText = formatFieldVal(key, newObj[key])

    return {
      key,
      label: fieldLabels[key] ?? key.replace(/_/g, ' '),
      oldText,
      newText,
      changed: log.old_values !== null && log.new_values !== null && oldText !== newText,
    }
  })
}

const summarizeLogHighlights = (log: ContributionChangeLogRecord) => {
  const entries = getDiffEntries(log)

  if (log.old_values && log.new_values) {
    const changed = entries.filter(e => e.changed)
    if (changed.length) {
      return changed.slice(0, 3).map(e => `${e.label}: ${e.oldText} → ${e.newText}`).join(' · ')
    }
  }

  const source = log.new_values ?? log.old_values
  if (!source) return ''

  const previewKeys = ['calculation_method', 'employee_rate', 'employer_rate', 'employee_amount', 'salary_from', 'first_cutoff_percent', 'effective_from']

  return previewKeys
    .filter(k => source[k] !== undefined && source[k] !== null && source[k] !== '')
    .slice(0, 3)
    .map(k => `${fieldLabels[k] ?? k}: ${formatFieldVal(k, source[k])}`)
    .join(' · ')
}

// =====================================================
// CHANGE LOGS: FILTERS & PAGINATION
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
    if (logFilterType.value !== 'all' && String(item.contribution_type_id) !== logFilterType.value) return false
    if (logFilterEntity.value !== 'all' && item.entity_type !== logFilterEntity.value) return false
    if (logFilterAction.value !== 'all' && item.action !== logFilterAction.value) return false
    if (!term) return true

    return [
      logTypeName(item),
      entityTypeLabels[item.entity_type] ?? item.entity_type,
      actionLabels[item.action] ?? item.action,
      item.actor_name ?? '',
      item.reason ?? '',
    ].some(text => String(text).toLowerCase().includes(term))
  })
})

const logTotalPages = computed(() => Math.max(1, Math.ceil(filteredLogs.value.length / logPerPage)))
const visibleLogs = computed(() => filteredLogs.value.slice((logPage.value - 1) * logPerPage, logPage.value * logPerPage))
const logShowingFrom = computed(() => (logPage.value - 1) * logPerPage + 1)
const logShowingTo = computed(() => Math.min(logPage.value * logPerPage, filteredLogs.value.length))

watch([logSearch, logFilterType, logFilterEntity, logFilterAction], () => {
  logPage.value = 1
})

// =====================================================
// RATE SCHEDULES: FILTERS & PAGINATION
// =====================================================

const search = ref('')
const filterType = ref('all')
const filterMethod = ref('all')
const filterStatus = ref('all')
const page = ref(1)
const perPage = 8

const bracketsForSchedule = (scheduleId: number) =>
  rateBrackets.value
    .filter(b => b.contribution_rate_schedule_id === scheduleId)
    .slice()
    .sort((a, b) => Number(a.salary_from) - Number(b.salary_from))

const formatShare = (schedule: ContributionRateScheduleRecord, side: 'employee' | 'employer') => {
  if (schedule.calculation_method === 'percentage') {
    return formatPercent(side === 'employee' ? schedule.employee_rate : schedule.employer_rate)
  }

  if (schedule.calculation_method === 'fixed') {
    const amount = side === 'employee' ? schedule.employee_amount : schedule.employer_amount
    const freq = schedule.frequency ? ` / ${frequencyLabels[schedule.frequency] ?? schedule.frequency}` : ''
    return `${formatPeso(amount)}${freq}`
  }

  const count = schedule.brackets_count ?? bracketsForSchedule(schedule.id).length
  return count > 0 ? `${count} bracket tier${count === 1 ? '' : 's'}` : 'No brackets set'
}

const formatCoverage = (schedule: ContributionRateScheduleRecord) => {
  if (schedule.calculation_method === 'fixed') return 'Any salary'

  const lo = toNumber(schedule.minimum_salary_base)
  const hi = toNumber(schedule.maximum_salary_base)

  if (lo === null && hi === null) return 'All salaries'
  if (hi === null) return `${formatPeso(lo)} and above`
  if (lo === null) return `Up to ${formatPeso(hi)}`
  return `${formatPeso(lo)} – ${formatPeso(hi)}`
}

const formatBracketRateOrAmount = (rate: unknown, amount: unknown) => {
  const r = toNumber(rate)
  const a = toNumber(amount)
  if (r !== null && a !== null) return `${formatPercent(r)} (${formatPeso(a)})`
  if (r !== null) return formatPercent(r)
  if (a !== null) return formatPeso(a)
  return '—'
}

const filteredSchedules = computed(() => {
  const term = search.value.trim().toLowerCase()

  return rateSchedules.value.filter((item) => {
    if (filterType.value !== 'all' && String(item.contribution_type_id) !== filterType.value) return false
    if (filterMethod.value !== 'all' && item.calculation_method !== filterMethod.value) return false
    if (filterStatus.value === 'active' && !item.is_status) return false
    if (filterStatus.value === 'inactive' && item.is_status) return false
    if (!term) return true

    return [
      scheduleTypeName(item),
      methodLabels[item.calculation_method] ?? item.calculation_method,
      formatDate(item.effective_from),
      formatDate(item.effective_to),
    ].some(text => text.toLowerCase().includes(term))
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredSchedules.value.length / perPage)))
const visibleSchedules = computed(() => filteredSchedules.value.slice((page.value - 1) * perPage, page.value * perPage))
const showingFrom = computed(() => (page.value - 1) * perPage + 1)
const showingTo = computed(() => Math.min(page.value * perPage, filteredSchedules.value.length))

watch([search, filterType, filterMethod, filterStatus], () => {
  page.value = 1
})

// =====================================================
// SUMMARY COUNTS
// =====================================================

const createdOrVersionedCount = computed(() =>
  changeLogs.value.filter(l => l.action === 'created' || l.action === 'versioned').length,
)

const updatedOrDeactivatedCount = computed(() =>
  changeLogs.value.filter(l => ['updated', 'deactivated', 'deleted'].includes(l.action)).length,
)

const activeSchedulesCount = computed(() => rateSchedules.value.filter(s => s.is_status).length)

// =====================================================
// MODALS
// =====================================================

const selectedLog = ref<ContributionChangeLogRecord | null>(null)
const selectedLogEntries = computed(() => (selectedLog.value ? getDiffEntries(selectedLog.value) : []))

const previewSchedule = ref<ContributionRateScheduleRecord | null>(null)
const previewBrackets = computed(() => (previewSchedule.value ? bracketsForSchedule(previewSchedule.value.id) : []))

// =====================================================
// CSV EXPORT
// =====================================================

const downloadCsv = (filename: string, headers: string[], rows: unknown[][]) => {
  const escape = (val: unknown) => `"${String(val ?? '').replace(/"/g, '""')}"`
  const csv = [headers.map(escape).join(','), ...rows.map(r => r.map(escape).join(','))].join('\r\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')

  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

const exportCsv = () => {
  if (activeTab.value === 'logs') {
    downloadCsv(
      'contribution-change-logs.csv',
      ['Contribution', 'Changed Item', 'Action', 'Reason', 'Changed By', 'Date & Time', 'Old Values', 'New Values'],
      filteredLogs.value.map(l => [
        logTypeName(l),
        entityTypeLabels[l.entity_type] ?? l.entity_type,
        actionLabels[l.action] ?? l.action,
        l.reason ?? '',
        l.actor_name,
        formatDateTime(l.created_at),
        l.old_values ? JSON.stringify(l.old_values) : '',
        l.new_values ? JSON.stringify(l.new_values) : '',
      ]),
    )
    return
  }

  downloadCsv(
    'contribution-rate-schedules-history.csv',
    ['Contribution', 'Method', 'Employee Share', 'Employer Share', 'Salary Coverage', 'Effective From', 'Effective To', 'Status'],
    filteredSchedules.value.map(s => [
      scheduleTypeName(s),
      methodLabels[s.calculation_method] ?? s.calculation_method,
      formatShare(s, 'employee'),
      formatShare(s, 'employer'),
      formatCoverage(s),
      formatDate(s.effective_from),
      s.effective_to ? formatDate(s.effective_to) : 'Present',
      s.is_status ? 'Active' : 'Inactive',
    ]),
  )
}
</script>

<template>
  <section class="ch">
    <div v-if="combinedError" class="ch-error" role="alert">
      {{ combinedError }}
    </div>

    <!-- HEADER -->
    <div class="ch-header">
      <div>
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
        <small>All recorded changes</small>
      </div>

      <div class="ch-stat">
        <span>Created & Versioned</span>
        <strong>{{ createdOrVersionedCount }}</strong>
        <small class="ch-green">
          <CheckCircle2 :size="13" />
          New and versioned entries
        </small>
      </div>

      <div class="ch-stat">
        <span>Updated & Deactivated</span>
        <strong>{{ updatedOrDeactivatedCount }}</strong>
        <small>Rate and setting changes</small>
      </div>

      <div class="ch-stat">
        <span>Active Rate Schedules</span>
        <strong>{{ activeSchedulesCount }}</strong>
        <small>{{ rateBrackets.length }} bracket tiers</small>
      </div>
    </div>

    <!-- TABS -->
    <div class="ch-tabs">
      <button
        type="button"
        class="ch-tab"
        :class="{ 'is-active': activeTab === 'logs' }"
        @click="activeTab = 'logs'"
      >
        <History :size="15" />
        <span>Change Logs ({{ changeLogs.length }})</span>
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

    <!-- TAB 1: CHANGE LOGS -->
    <BaseDataTable
      v-if="activeTab === 'logs'"
      title="Contribution Change Logs"
      description="Every created, updated, versioned, deactivated and deleted contribution setting."
      :has-rows="visibleLogs.length > 0"
      :loading="logsLoading"
      min-width="1050px"
      empty-title="No change logs found"
      empty-description="Try adjusting your search or filters."
    >
      <template #toolbar>
        <input
          v-model="logSearch"
          type="search"
          class="table-search"
          placeholder="Search actor, reason, type..."
          aria-label="Search change logs"
        >

        <select v-model="logFilterType" class="table-filter" aria-label="Filter by contribution">
          <option value="all">All Contributions</option>
          <option v-for="t in contributionTypes" :key="t.id" :value="String(t.id)">
            {{ t.contribution_code }} — {{ t.contribution_name }}
          </option>
        </select>

        <select v-model="logFilterEntity" class="table-filter" aria-label="Filter by changed item">
          <option value="all">All Items</option>
          <option v-for="(label, key) in entityTypeLabels" :key="key" :value="key">
            {{ label }}
          </option>
        </select>

        <select v-model="logFilterAction" class="table-filter" aria-label="Filter by action">
          <option value="all">All Actions</option>
          <option v-for="(label, key) in actionLabels" :key="key" :value="key">
            {{ label }}
          </option>
        </select>
      </template>

      <template #headers>
      <th>Contribution</th>
      <th>Changed Item</th>
      <th>Summary</th>
      <th>Changed By</th>
      <th>Date & Time</th>
      <th>Status</th>
      <th class="text-right">Action</th>
    </template>

    <template #rows>
      <tr v-for="log in visibleLogs" :key="log.id">
        <td><strong>{{ logTypeName(log) }}</strong></td>
        <td>
          <span class="ch-entity-badge">
            {{ entityTypeLabels[log.entity_type] ?? log.entity_type }}
          </span>
        </td>
        <td class="ch-reason-cell">
          <p class="ch-reason-text">{{ log.reason || 'Configuration change recorded.' }}</p>
          <small v-if="summarizeLogHighlights(log)" class="ch-diff-inline">
            {{ summarizeLogHighlights(log) }}
          </small>
        </td>
        <td>
          <span class="ch-inline">
            <UserCheck :size="13" />
            {{ log.actor_name }}
          </span>
        </td>
        <td>
          <span class="ch-inline ch-nowrap">
            <Clock :size="13" />
            {{ formatDateTime(log.created_at) }}
          </span>
        </td>
        <td>
          <span class="ch-action-pill" :class="`is-${log.action}`">
            {{ actionLabels[log.action] ?? log.action }}
          </span>
        </td>
        <td class="text-right">
          <button type="button" class="ch-view-btn" @click="selectedLog = log">
            <FileDiff :size="13" />
            <span>View</span>
          </button>
        </td>
      </tr>
    </template>

      <template #bottom>
        <div class="ch-footer">
          <BaseTableFooter
            v-model="logPage"
            :showing-from="logShowingFrom"
            :showing-to="logShowingTo"
            :total-items="filteredLogs.length"
            :total-pages="logTotalPages"
            item-label="change logs"
          />
        </div>
      </template>
    </BaseDataTable>

    <!-- TAB 2: RATE SCHEDULE VERSIONS -->
    <BaseDataTable
      v-else
      title="Rate Schedule Versions"
      description="Current and past contribution rate schedules with their effective dates."
      :has-rows="visibleSchedules.length > 0"
      :loading="schedulesLoading"
      min-width="1000px"
      empty-title="No rate schedules found"
      empty-description="Try adjusting your search or filters."
    >
      <template #toolbar>
        <input
          v-model="search"
          type="search"
          class="table-search"
          placeholder="Search type, method, date..."
          aria-label="Search rate schedules"
        >

        <select v-model="filterType" class="table-filter" aria-label="Filter by contribution">
          <option value="all">All Contributions</option>
          <option v-for="t in contributionTypes" :key="t.id" :value="String(t.id)">
            {{ t.contribution_code }} — {{ t.contribution_name }}
          </option>
        </select>

        <select v-model="filterMethod" class="table-filter" aria-label="Filter by method">
          <option value="all">All Methods</option>
          <option v-for="(label, key) in methodLabels" :key="key" :value="key">
            {{ label }}
          </option>
        </select>

        <select v-model="filterStatus" class="table-filter" aria-label="Filter by status">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </template>

      <template #headers>
        <th>Contribution</th>
        <th>Method</th>
        <th>Employee Share</th>
        <th>Employer Share</th>
        <th>Salary Coverage</th>
        <th>Effective From</th>
        <th>Effective To</th>
        <th>Status</th>
        <th class="text-right">Details</th>
      </template>

      <template #rows>
        <tr v-for="schedule in visibleSchedules" :key="schedule.id">
          <td><strong>{{ scheduleTypeName(schedule) }}</strong></td>
          <td>
            <span class="ch-method-badge" :class="`is-${schedule.calculation_method}`">
              {{ methodLabels[schedule.calculation_method] ?? schedule.calculation_method }}
            </span>
          </td>
          <td class="ch-share-emp">{{ formatShare(schedule, 'employee') }}</td>
          <td class="ch-share-er">{{ formatShare(schedule, 'employer') }}</td>
          <td>{{ formatCoverage(schedule) }}</td>
          <td>{{ formatDate(schedule.effective_from) }}</td>
          <td>{{ schedule.effective_to ? formatDate(schedule.effective_to) : 'Present' }}</td>
          <td>
            <span
              class="status-pill"
              :class="schedule.is_status ? 'status-pill--active' : 'status-pill--inactive'"
            >
              {{ schedule.is_status ? 'Active' : 'Inactive' }}
            </span>
          </td>
          <td class="text-right">
            <button
              v-if="schedule.calculation_method === 'bracket'"
              type="button"
              class="ch-view-btn"
              @click="previewSchedule = schedule"
            >
              <Eye :size="13" />
              <span>Brackets</span>
            </button>
            <span v-else>—</span>
          </td>
        </tr>
      </template>

      <template #bottom>
        <div class="ch-footer">
          <BaseTableFooter
            v-model="page"
            :showing-from="showingFrom"
            :showing-to="showingTo"
            :total-items="filteredSchedules.length"
            :total-pages="totalPages"
            item-label="rate schedules"
          />
        </div>
      </template>
    </BaseDataTable>

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
                  {{ entityTypeLabels[selectedLog.entity_type] ?? selectedLog.entity_type }}
                </span>
              </div>
              <h2>{{ logTypeName(selectedLog) }}</h2>
            </div>
            <button type="button" class="ch-x" aria-label="Close" @click="selectedLog = null">
              <X :size="18" />
            </button>
          </div>

          <div class="ch-diff-body">
            <div class="ch-diff-meta-grid">
              <div class="ch-meta-card">
                <span>Contribution</span>
                <strong>{{ logTypeName(selectedLog) }}</strong>
              </div>
              <div class="ch-meta-card">
                <span>Changed By</span>
                <strong>{{ selectedLog.actor_name }}</strong>
              </div>
              <div class="ch-meta-card">
                <span>Date & Time</span>
                <strong>{{ formatDateTime(selectedLog.created_at) }}</strong>
              </div>
            </div>

            <div v-if="selectedLog.reason" class="ch-reason-box">
              <span>Reason</span>
              <p>{{ selectedLog.reason }}</p>
            </div>

            <div class="ch-diff-scroll">
              <table class="ch-diff-table">
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Previous Value</th>
                    <th class="ch-arrow-col" />
                    <th>New Value</th>
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
                    <td class="ch-arrow-col"><ArrowRight :size="13" /></td>
                    <td class="ch-new-val" :class="{ 'is-highlighted': entry.changed }">
                      {{ entry.newText }}
                    </td>
                  </tr>
                  <tr v-if="selectedLogEntries.length === 0">
                    <td colspan="4" class="ch-empty">No field details recorded for this entry.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="ch-modal-footer">
            <button type="button" class="ch-btn ch-outline" @click="selectedLog = null">Close</button>
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
              <p>Effective from <strong>{{ formatDate(previewSchedule.effective_from) }}</strong></p>
            </div>
            <button type="button" class="ch-x" aria-label="Close" @click="previewSchedule = null">
              <X :size="18" />
            </button>
          </div>

          <div class="ch-diff-body">
            <div class="ch-diff-scroll">
              <table class="ch-diff-table">
                <thead>
                  <tr>
                    <th>Salary From</th>
                    <th>Salary To</th>
                    <th>Employee</th>
                    <th>Employer</th>
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
                    <td colspan="4" class="ch-empty">No brackets added to this schedule yet.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="ch-modal-footer">
            <button type="button" class="ch-btn ch-outline" @click="previewSchedule = null">Close</button>
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
.ch { width: 100%; max-width: 1700px; margin: 0 auto; color: var(--text-primary, #172033); }

.ch-error { padding: 12px 14px; margin-bottom: 14px; border: 1px solid var(--red, #ef4444); border-radius: 9px; background: color-mix(in srgb, var(--red, #ef4444) 10%, var(--bg-card, #ffffff)); color: var(--red, #ef4444); font-size: 12px; }

.ch-header { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 18px; }
.ch-eyebrow { display: inline-flex; align-items: center; gap: 6px; margin-bottom: 6px; color: #246bfd; font-size: 10.5px; font-weight: 700; letter-spacing: .6px; }
.ch-header h1 { margin: 0; font-size: 22px; font-weight: 750; }
.ch-header p { margin: 4px 0 0; color: var(--text-secondary, #667085); font-size: 12.5px; }
.ch-header-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }

.ch-btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 10px 14px; border: 1px solid transparent; border-radius: 9px; font-size: 12px; font-weight: 650; text-decoration: none; cursor: pointer; }
.ch-primary { background: #246bfd; color: #ffffff; }
.ch-primary:hover { background: #1657dd; }
.ch-outline { border-color: var(--border, #e6eaf0); background: var(--bg-card, #ffffff); color: var(--text-primary, #172033); }
.ch-outline:hover { background: var(--bg-card-soft, #f8fafc); }
.ch-spin { animation: ch-spin .8s linear infinite; }
@keyframes ch-spin { to { transform: rotate(360deg); } }

.ch-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin-bottom: 16px; }
.ch-stat { display: flex; flex-direction: column; gap: 4px; padding: 16px 18px; border: 1px solid var(--border, #e6eaf0); border-radius: 13px; background: var(--bg-card, #ffffff); }
.ch-stat span { color: var(--text-secondary, #667085); font-size: 11px; font-weight: 650; }
.ch-stat strong { font-size: 22px; font-weight: 750; }
.ch-stat small { display: inline-flex; align-items: center; gap: 5px; color: var(--text-secondary, #667085); font-size: 11px; }
.ch-green { color: #10b981 !important; }

.ch-tabs { display: inline-flex; gap: 6px; padding: 5px; margin-bottom: 14px; border: 1px solid var(--border, #e6eaf0); border-radius: 11px; background: var(--bg-card, #ffffff); }
.ch-tab { display: inline-flex; align-items: center; gap: 7px; padding: 8px 14px; border: 0; border-radius: 8px; background: transparent; color: var(--text-secondary, #667085); font-size: 12px; font-weight: 650; cursor: pointer; }
.ch-tab.is-active { background: #246bfd; color: #ffffff; }

.ch-footer { padding: 0 16px 14px; }

.ch-entity-badge { display: inline-flex; padding: 3px 8px; border: 1px solid var(--border, #e2e8f0); border-radius: 6px; background: var(--bg-card-soft, #f1f5f9); font-size: 11px; font-weight: 650; white-space: nowrap; }

.ch-action-pill { display: inline-flex; padding: 3px 9px; border-radius: 999px; font-size: 11px; font-weight: 700; }
.ch-action-pill.is-created { background: rgba(16, 185, 129, .14); color: #10b981; }
.ch-action-pill.is-updated { background: rgba(36, 107, 253, .14); color: #246bfd; }
.ch-action-pill.is-versioned { background: rgba(139, 92, 246, .15); color: #8b5cf6; }
.ch-action-pill.is-deactivated { background: rgba(245, 158, 11, .15); color: #f59e0b; }
.ch-action-pill.is-deleted { background: rgba(239, 68, 68, .15); color: #ef4444; }

.ch-reason-cell { max-width: 420px; }
.ch-reason-text { margin: 0; color: var(--text-primary, #172033); }
.ch-diff-inline { display: block; margin-top: 3px; color: var(--text-secondary, #667085); font-size: 11px; }
.ch-inline { display: inline-flex; align-items: center; gap: 6px; }
.ch-nowrap { white-space: nowrap; }

.ch-method-badge { display: inline-flex; padding: 3px 9px; border-radius: 6px; font-size: 11px; font-weight: 700; }
.ch-method-badge.is-percentage { background: rgba(36, 107, 253, .12); color: #246bfd; }
.ch-method-badge.is-fixed { background: rgba(245, 158, 11, .14); color: #f59e0b; }
.ch-method-badge.is-bracket { background: rgba(139, 92, 246, .14); color: #8b5cf6; }

.ch-share-emp { color: #246bfd !important; font-weight: 650; }
.ch-share-er { color: #10b981 !important; font-weight: 650; }

.ch-view-btn { display: inline-flex; align-items: center; gap: 5px; padding: 6px 10px; border: 1px solid rgba(36, 107, 253, .35); border-radius: 7px; background: rgba(36, 107, 253, .08); color: #246bfd; font-size: 11px; font-weight: 650; cursor: pointer; }
.ch-view-btn:hover { background: rgba(36, 107, 253, .15); }

.ch-backdrop { position: fixed; inset: 0; z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 16px; background: rgba(15, 23, 42, .55); backdrop-filter: blur(2px); }
.ch-modal { display: flex; width: min(980px, 95vw); max-height: 90vh; flex-direction: column; overflow: hidden; border: 1px solid var(--border, #e6eaf0); border-radius: 14px; background: var(--bg-card, #ffffff); color: var(--text-primary, #172033); box-shadow: 0 24px 60px rgba(0, 0, 0, .35); }
.ch-diff-modal { width: min(1080px, 95vw); }
.ch-modal-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 18px 22px; border-bottom: 1px solid var(--border, #e6eaf0); }
.ch-modal-badges { display: flex; gap: 8px; margin-bottom: 6px; }
.ch-modal-head h2 { margin: 0; font-size: 16px; font-weight: 750; }
.ch-modal-head p { margin: 4px 0 0; color: var(--text-secondary, #667085); font-size: 12px; }
.ch-x { display: inline-flex; width: 32px; height: 32px; align-items: center; justify-content: center; border: 1px solid var(--border, #e6eaf0); border-radius: 8px; background: transparent; color: var(--text-secondary, #667085); cursor: pointer; }

.ch-diff-body { display: flex; flex-direction: column; gap: 16px; padding: 18px 22px; overflow-y: auto; }
.ch-diff-meta-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.ch-meta-card { display: flex; flex-direction: column; gap: 4px; padding: 11px 14px; border: 1px solid var(--border, #e6eaf0); border-radius: 10px; background: var(--bg-card-soft, #f8fafc); }
.ch-meta-card span { color: var(--text-secondary, #667085); font-size: 11px; }
.ch-meta-card strong { font-size: 12.5px; font-weight: 700; }
.ch-reason-box { padding: 12px 14px; border: 1px solid rgba(36, 107, 253, .25); border-radius: 10px; background: rgba(36, 107, 253, .05); }
.ch-reason-box span { display: block; margin-bottom: 4px; color: #246bfd; font-size: 11px; font-weight: 700; }
.ch-reason-box p { margin: 0; font-size: 12.5px; }

.ch-diff-scroll { overflow-x: auto; }
.ch-diff-table { width: 100%; border: 1px solid var(--border, #e6eaf0); border-collapse: collapse; font-size: 12.5px; text-align: left; }
.ch-diff-table th, .ch-diff-table td { padding: 11px 14px; border-bottom: 1px solid var(--border, #e6eaf0); }
.ch-diff-table thead th { background: var(--bg-card-soft, #f8fafc); color: var(--text-secondary, #667085); font-size: 11px; font-weight: 700; letter-spacing: .4px; text-transform: uppercase; }
.ch-strong { font-weight: 650; }
.ch-arrow-col { width: 32px; color: var(--text-secondary, #667085); text-align: center; }
.ch-old-val { color: var(--text-secondary, #667085); }
.ch-new-val.is-highlighted { color: #10b981; font-weight: 700; }
.is-changed-row { background: rgba(16, 185, 129, .05); }
.ch-empty { padding: 28px !important; color: var(--text-secondary, #667085); text-align: center; }

.ch-modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 14px 22px; border-top: 1px solid var(--border, #e6eaf0); }

@media (max-width: 960px) {
  .ch-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .ch-diff-meta-grid { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .ch-stats { grid-template-columns: 1fr; }
}
</style>