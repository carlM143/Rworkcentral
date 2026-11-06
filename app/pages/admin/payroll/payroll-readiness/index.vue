<script setup lang="ts">
import {
  RefreshCw,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  UserPlus,
  Calculator,
  Lock,
  X,
} from 'lucide-vue-next'
import PayrollReadinessFilter from '~/components/admin/payroll/payroll-readiness/PayrollReadinessFilter.vue'
import PayrollReadinessStats from '~/components/admin/payroll/payroll-readiness/PayrollReadinessStats.vue'
import PayrollReadinessTable from '~/components/admin/payroll/payroll-readiness/PayrollReadinessTable.vue'
import type {
  PeriodStatus,
  ReadinessStatus,
} from '~/types/payroll/payroll-readiness/payrollReadiness'
import type { PayrollGenerationResult } from '~/types/payroll/payroll-generation/payrollGeneration'

const route = useRoute()
const router = useRouter()
const { success, error: showError } = useToast()

const readinessApi = usePayrollReadiness()
const periodApi = usePayrollPeriod()
const groupApi = usePayrollGroup()
const generationApi = usePayrollGeneration()

const { readiness, loading, updatingStatus } = readinessApi
const { periods } = periodApi
const { groups } = groupApi
const { generating, finalizing } = generationApi

const generationResult = ref<PayrollGenerationResult | null>(null)
const generationMessage = ref('')

const periodId = ref<number | null>(route.query.period ? Number(route.query.period) : null)
const groupId = ref<number | null>(route.query.group ? Number(route.query.group) : null)
const statusFilter = ref<'' | ReadinessStatus>('')
const search = ref('')
const errorMessage = ref('')

const ASSIGN_ROUTE = '/admin/payroll/payroll-group/assign-employee/create'

const formatDate = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(`${value.slice(0, 10)}T00:00:00`)
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(date)
}

const frequencyLabel = (value?: string) => ({
  weekly: 'Weekly',
  bi_weekly: 'Bi-weekly',
  semi_monthly: 'Semi-monthly',
  monthly: 'Monthly',
}[value ?? ''] ?? value ?? '')

const period = computed(() => readiness.value?.period ?? null)
const periodStatus = computed(() => (period.value?.status ?? '').toLowerCase())

const periodBlockers = computed(() =>
  readiness.value?.period_issues.filter(i => i.severity === 'blocker') ?? [],
)

const periodWarnings = computed(() =>
  readiness.value?.period_issues.filter(i => i.severity === 'warning') ?? [],
)

const visibleGroups = computed(() =>
  readiness.value?.groups.filter(g => g.employees > 0 || groupId.value === g.id) ?? [],
)

const filteredEmployees = computed(() => {
  const rows = readiness.value?.employees ?? []
  const term = search.value.trim().toLowerCase()

  return rows.filter((row) => {
    if (statusFilter.value && row.status !== statusFilter.value) return false
    if (term && !`${row.emp_id} ${row.name}`.toLowerCase().includes(term)) return false
    return true
  })
})

const load = async () => {
  errorMessage.value = ''

  if (!periodId.value) {
    readiness.value = null
    return
  }

  try {
    await readinessApi.fetchReadiness(periodId.value, groupId.value)
  } catch (err) {
    errorMessage.value = readinessApi.getErrorMessage(err)
  }
}

const syncQuery = () => {
  router.replace({
    query: {
      ...route.query,
      period: periodId.value ? String(periodId.value) : undefined,
      group: groupId.value ? String(groupId.value) : undefined,
    },
  })
}

watch([periodId, groupId], () => {
  syncQuery()
  void load()
})

const resetFilters = () => {
  groupId.value = null
  statusFilter.value = ''
  search.value = ''
}

const changePeriodStatus = async (status: PeriodStatus) => {
  if (!periodId.value) return

  try {
    const res = await readinessApi.updatePeriodStatus(periodId.value, status)
    success('Payroll Period Updated', res.message)
    await Promise.all([load(), periodApi.fetchPeriods()])
  } catch (err) {
    showError('Unable to Update Period', readinessApi.getErrorMessage(err))
  }
}

const formatMoney = (value: number | string | null | undefined) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(value ?? 0))

const canGenerate = computed(() =>
  !!readiness.value?.can_generate && ['open', 'processing'].includes(periodStatus.value),
)

const runGenerate = async () => {
  if (!periodId.value || !readiness.value) return

  const isRegenerate = periodStatus.value === 'processing'
  const count = readiness.value.stats.included
  const name = period.value?.period_name || `Payroll Period #${periodId.value}`

  const confirmed = window.confirm(
    isRegenerate
      ? `Regenerate payroll for ${name}?\n\nDraft payroll records will be recalculated. Finalized records are not changed.`
      : `Generate payroll for ${count} employee(s) in ${name}?`,
  )

  if (!confirmed) return

  try {
    const res = await generationApi.generatePayroll(periodId.value, groupId.value)
    generationResult.value = res.data
    generationMessage.value = res.message
    success(isRegenerate ? 'Payroll Regenerated' : 'Payroll Generated', res.message)
    await Promise.all([load(), periodApi.fetchPeriods()])
  } catch (err) {
    showError('Unable to Generate Payroll', readinessApi.getErrorMessage(err))
  }
}

const runFinalize = async () => {
  if (!periodId.value) return

  const confirmed = window.confirm(
    'Finalize this payroll?\n\nPayroll records will be locked, loan deductions will be posted, and the period will be closed. This cannot be undone.',
  )

  if (!confirmed) return

  try {
    const res = await generationApi.finalizePayroll(periodId.value)
    success('Payroll Finalized', res.message)
    generationResult.value = null
    await Promise.all([load(), periodApi.fetchPeriods()])
  } catch (err) {
    showError('Unable to Finalize Payroll', readinessApi.getErrorMessage(err))
  }
}

watch(periodId, () => {
  generationResult.value = null
})

onMounted(async () => {
  try {
    await Promise.all([
      periodApi.fetchPeriods(),
      groupApi.fetchGroups({ is_active: true }),
    ])
  } catch (err) {
    errorMessage.value = readinessApi.getErrorMessage(err)
  }

  if (periodId.value) {
    await load()
    return
  }

  const open = periods.value.find(p => p.status?.toLowerCase() === 'open')
  const draft = periods.value.find(p => p.status?.toLowerCase() === 'draft')

  periodId.value = open?.id ?? draft?.id ?? periods.value[0]?.id ?? null
})
</script>

<template>
  <section class="readiness-page">
    <PageHeader
      title="Payroll Readiness"
      description="Check that every employee in a payroll period is complete before generating payroll."
    >
      <AppButton
        variant="secondary"
        :icon="RefreshCw"
        :disabled="loading || !periodId"
        @click="load"
      >
        Re-check
      </AppButton>
    </PageHeader>

    <PayrollReadinessFilter
      v-model:period="periodId"
      v-model:group="groupId"
      v-model:status="statusFilter"
      v-model:search="search"
      :periods="periods"
      :groups="groups"
      @reset="resetFilters"
    />

    <div
      v-if="errorMessage"
      class="alert alert--error"
    >
      {{ errorMessage }}
    </div>

    <div
      v-if="!periodId"
      class="empty-card"
    >
      <strong>Select a payroll period</strong>
      <span>Create a payroll period first if none are listed.</span>
    </div>

    <template v-else-if="readiness && period">
      <div class="period-card">
        <div class="period-info">
          <span class="eyebrow">Payroll period</span>
          <h2>{{ period.period_name || `Payroll Period #${period.id}` }}</h2>
          <p>
            Cutoff {{ period.cutoff_number }} ·
            {{ formatDate(period.cutoff_start) }} – {{ formatDate(period.cutoff_end) }} ·
            Pay on {{ formatDate(period.payment_date) }}
          </p>
        </div>

        <div class="period-actions">
          <StatusBadge :status="period.status" />

          <AppButton
            v-if="periodStatus === 'draft'"
            :icon="PlayCircle"
            :disabled="updatingStatus"
            @click="changePeriodStatus('open')"
          >
            {{ updatingStatus ? 'Opening…' : 'Open Period' }}
          </AppButton>

          <template v-else-if="periodStatus === 'open' || periodStatus === 'processing'">
            <AppButton
              v-if="periodStatus === 'open'"
              variant="secondary"
              :disabled="updatingStatus || generating"
              @click="changePeriodStatus('draft')"
            >
              Back to Draft
            </AppButton>

            <AppButton
              v-if="periodStatus === 'processing'"
              variant="secondary"
              :icon="Lock"
              :disabled="finalizing || generating"
              @click="runFinalize"
            >
              {{ finalizing ? 'Finalizing…' : 'Finalize Payroll' }}
            </AppButton>

            <AppButton
              :icon="Calculator"
              :disabled="!canGenerate || generating || finalizing"
              :title="canGenerate ? '' : 'Fix all blockers before generating payroll.'"
              @click="runGenerate"
            >
              {{ generating
                ? 'Generating…'
                : periodStatus === 'processing' ? 'Regenerate Payroll' : 'Generate Payroll' }}
            </AppButton>
          </template>
        </div>
      </div>

      <div
        v-if="readiness.can_generate"
        class="alert alert--ok"
      >
        <CheckCircle2 :size="16" />
        Everything required is in place. This period is ready for payroll generation.
      </div>

      <div
        v-for="issue in periodBlockers"
        :key="issue.code"
        class="alert alert--error"
      >
        <XCircle :size="16" />
        {{ issue.message }}
      </div>

      <div
        v-for="issue in periodWarnings"
        :key="issue.code"
        class="alert alert--warn"
      >
        <AlertTriangle :size="16" />
        {{ issue.message }}
      </div>

      <div
        v-if="generationResult"
        class="result-card"
      >
        <div class="result-head">
          <strong>{{ generationMessage }}</strong>
          <button
            type="button"
            class="icon-btn"
            aria-label="Dismiss"
            @click="generationResult = null"
          >
            <X :size="16" />
          </button>
        </div>

        <div
          v-if="generationResult.generated.length"
          class="table-scroll"
        >
          <table class="result-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th class="num">Gross Pay</th>
                <th class="num">Deductions</th>
                <th class="num">Net Pay</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="line in generationResult.generated"
                :key="line.payroll_id"
              >
                <td>{{ line.name }}</td>
                <td class="num">{{ formatMoney(line.gross_pay) }}</td>
                <td class="num">{{ formatMoney(line.total_deductions) }}</td>
                <td class="num"><strong>{{ formatMoney(line.net_pay) }}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <ul
          v-if="generationResult.skipped.length"
          class="skipped"
        >
          <li
            v-for="line in generationResult.skipped"
            :key="line.employee_id"
          >
            <strong>{{ line.name }}</strong> — {{ line.reason }}
          </li>
        </ul>
      </div>

      <PayrollReadinessStats :stats="readiness.stats" />

      <div
        v-if="visibleGroups.length"
        class="groups-grid"
      >
        <div
          v-for="g in visibleGroups"
          :key="g.id"
          class="group-card"
          :class="{ 'group-card--active': groupId === g.id }"
          @click="groupId = groupId === g.id ? null : g.id"
        >
          <div class="group-head">
            <strong>{{ g.group_name }}</strong>
            <span>{{ frequencyLabel(g.frequency) }}</span>
          </div>
          <div class="group-counts">
            <span>{{ g.employees }} employees</span>
            <span class="c-ready">{{ g.ready }} ready</span>
            <span
              v-if="g.warning"
              class="c-warn"
            >{{ g.warning }} warning</span>
            <span
              v-if="g.blocked"
              class="c-block"
            >{{ g.blocked }} blocked</span>
          </div>
          <small
            v-if="g.frequency_mismatch && g.employees"
            class="c-warn"
          >
            Not a semi-monthly group
          </small>
        </div>
      </div>

      <div
        v-if="readiness.unassigned.length"
        class="unassigned-card"
      >
        <div class="unassigned-head">
          <div>
            <strong>Employees without a payroll group</strong>
            <span>These active employees won’t be paid in this period until they’re assigned.</span>
          </div>
          <AppButton
            :icon="UserPlus"
            @click="navigateTo(ASSIGN_ROUTE)"
          >
            Assign Employees
          </AppButton>
        </div>
        <ul>
          <li
            v-for="e in readiness.unassigned"
            :key="e.employee_id"
          >
            <strong>{{ e.name }}</strong>
            <span>{{ e.emp_id }}<template v-if="e.department"> · {{ e.department }}</template></span>
          </li>
        </ul>
      </div>

      <PayrollReadinessTable
        :employees="filteredEmployees"
        :loading="loading"
      />
    </template>

    <div
      v-else-if="loading"
      class="empty-card"
    >
      Checking payroll readiness…
    </div>
  </section>
</template>

<style scoped>
.readiness-page {
  width: 100%;
  min-width: 0;
}

.period-card {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 12px;
  padding: 18px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
}

.eyebrow {
  color: var(--text-muted);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .04em;
  text-transform: uppercase;
}

.period-info h2 {
  margin: 4px 0;
  color: var(--text-primary);
  font-size: 18px;
}

.period-info p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 12px;
}

.period-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.alert {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  padding: 11px 14px;
  border-radius: 8px;
  font-size: 12px;
}

.alert--error {
  background: rgb(248 113 113 / 10%);
  color: #f87171;
}

.alert--warn {
  background: rgb(251 146 60 / 10%);
  color: #fb923c;
}

.alert--ok {
  background: rgb(34 197 94 / 10%);
  color: #22c55e;
}

.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.group-card {
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
  cursor: pointer;
}

.group-card:hover,
.group-card--active {
  border-color: var(--primary);
}

.group-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.group-head strong {
  color: var(--text-primary);
  font-size: 13px;
}

.group-head span {
  color: var(--text-muted);
  font-size: 10px;
}

.group-counts {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 8px;
  color: var(--text-secondary);
  font-size: 11px;
}

.group-card small {
  display: block;
  margin-top: 6px;
  font-size: 10px;
}

.c-ready { color: #22c55e; }
.c-warn { color: #fb923c; }
.c-block { color: #f87171; }

.unassigned-card {
  margin-bottom: 14px;
  padding: 16px;
  border: 1px solid rgb(248 113 113 / 35%);
  border-radius: 10px;
  background: var(--bg-card);
}

.unassigned-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.unassigned-head strong,
.unassigned-head span {
  display: block;
}

.unassigned-head strong {
  color: var(--text-primary);
  font-size: 13px;
}

.unassigned-head span {
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 11px;
}

.unassigned-card ul {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 8px;
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
}

.unassigned-card li {
  padding: 8px 10px;
  border: 1px solid var(--border-soft);
  border-radius: 8px;
}

.unassigned-card li strong,
.unassigned-card li span {
  display: block;
}

.unassigned-card li strong {
  color: var(--text-primary);
  font-size: 12px;
}

.unassigned-card li span {
  color: var(--text-muted);
  font-size: 10px;
}

.result-card {
  margin-bottom: 14px;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
}

.result-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
  color: var(--text-primary);
  font-size: 13px;
}

.icon-btn {
  display: grid;
  place-items: center;
  border: 0;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}

.table-scroll {
  overflow-x: auto;
}

.result-table {
  width: 100%;
  min-width: 520px;
  border-collapse: collapse;
  font-size: 12px;
}

.result-table th {
  padding: 8px 10px;
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 700;
  text-align: left;
  text-transform: uppercase;
}

.result-table td {
  padding: 8px 10px;
  border-top: 1px solid var(--border-soft);
  color: var(--text-secondary);
}

.result-table td strong {
  color: var(--text-primary);
}

.result-table .num {
  text-align: right;
}

.skipped {
  margin: 10px 0 0;
  padding-left: 18px;
  color: #fb923c;
  font-size: 12px;
}

.skipped strong {
  color: var(--text-primary);
}

.empty-card {
  display: flex;
  min-height: 160px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
  color: var(--text-muted);
  font-size: 12px;
}

.empty-card strong {
  color: var(--text-primary);
  font-size: 13px;
}
</style>