<script setup lang="ts">
import { Coins, Info, Pencil, Plus, Trash2, Users, X } from 'lucide-vue-next'
import type {
  HolidayPayAppliesTo,
  HolidayPayHistory,
  HolidayPayRule,
  HolidayPayScenario,
} from '~/types/holiday-management/holiday-pay/holidayPay'

const { success, error: showError } = useToast()
const api = useHolidayPay()
const { rules, holidayTypes, loadingRules, loadingHistory, saving } = api

const tab = ref<'rules' | 'history'>('rules')
const errorMessage = ref('')

// =====================================================
// LABELS & FORMATTERS
// =====================================================

const SCENARIOS: { value: HolidayPayScenario, label: string }[] = [
  { value: 'unworked', label: 'Not worked' },
  { value: 'worked', label: 'Worked' },
  { value: 'worked_overtime', label: 'Worked – overtime' },
  { value: 'rest_day_worked', label: 'Rest day worked' },
  { value: 'rest_day_overtime', label: 'Rest day – overtime' },
]

const APPLIES_TO: { value: HolidayPayAppliesTo, label: string }[] = [
  { value: 'all', label: 'All employees' },
  { value: 'daily_paid', label: 'Daily-paid only' },
  { value: 'monthly_paid', label: 'Monthly-paid only' },
]

const scenarioLabel = (value: string) => SCENARIOS.find(s => s.value === value)?.label ?? value
const appliesToLabel = (value: string) => APPLIES_TO.find(a => a.value === value)?.label ?? value

const money = (value: number | string | null | undefined) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(value ?? 0))

const percent = (value: number | string | null | undefined) => `${Number(value ?? 0)}%`

const date = (value?: string | null) => {
  if (!value) return '—'
  const d = new Date(`${value.slice(0, 10)}T00:00:00`)
  return Number.isNaN(d.getTime())
    ? value
    : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(d)
}

const minutes = (value: number) => {
  if (!value) return '—'
  const h = Math.floor(value / 60)
  const m = value % 60
  return h ? `${h}h${m ? ` ${m}m` : ''}` : `${m}m`
}

// =====================================================
// PAY RULES TAB
// =====================================================

const ruleTypeFilter = ref<number | null>(null)
const ruleStatusFilter = ref<'' | 'active' | 'inactive'>('active')

const scenarioOrder = (value: string) => SCENARIOS.findIndex(s => s.value === value)

const filteredRules = computed(() =>
  rules.value
    .filter(r => !ruleTypeFilter.value || r.holiday_type_id === ruleTypeFilter.value)
    .filter(r => !ruleStatusFilter.value || (ruleStatusFilter.value === 'active') === r.is_status)
    .slice()
    .sort((a, b) =>
      a.holiday_type_id - b.holiday_type_id
      || scenarioOrder(a.scenario) - scenarioOrder(b.scenario)
      || b.effective_from.localeCompare(a.effective_from)),
)

const loadRules = async () => {
  errorMessage.value = ''
  try {
    await Promise.all([api.fetchRules(), api.fetchHolidayTypes()])
  } catch (err) {
    errorMessage.value = api.getErrorMessage(err)
  }
}

// Form modal
const formOpen = ref(false)
const editingId = ref<number | null>(null)
const formError = ref('')

const form = reactive({
  holiday_type_id: null as number | null,
  scenario: 'worked' as HolidayPayScenario,
  rate_percent: '' as string | number,
  applies_to: 'all' as HolidayPayAppliesTo,
  effective_from: '',
  effective_to: '',
  is_status: true,
})

const openForm = (rule?: HolidayPayRule) => {
  editingId.value = rule?.id ?? null
  formError.value = ''

  Object.assign(form, {
    holiday_type_id: rule?.holiday_type_id ?? holidayTypes.value[0]?.id ?? null,
    scenario: rule?.scenario ?? 'worked',
    rate_percent: rule ? Number(rule.rate_percent) : '',
    applies_to: rule?.applies_to ?? 'all',
    effective_from: rule?.effective_from?.slice(0, 10) ?? '',
    effective_to: rule?.effective_to?.slice(0, 10) ?? '',
    is_status: rule?.is_status ?? true,
  })

  formOpen.value = true
}

const closeForm = () => {
  formOpen.value = false
  editingId.value = null
}

// What HR sees as the extra pay, since basic pay already covers 100% of a worked day
const premiumHint = computed(() => {
  const rate = Number(form.rate_percent)
  if (!rate && rate !== 0) return ''

  if (form.scenario === 'unworked') return `Employee receives ${rate}% of the daily rate without working.`
  if (form.scenario.endsWith('overtime')) return `Overtime hours are paid at ${rate}% of the hourly rate.`

  const extra = rate - 100
  return extra > 0
    ? `Basic pay covers 100%, so payroll adds ${extra}% of the daily rate as holiday pay.`
    : 'Same as a regular working day — no extra holiday pay.'
})

const saveRule = async () => {
  formError.value = ''

  if (!form.holiday_type_id || form.rate_percent === '' || !form.effective_from) {
    formError.value = 'Holiday type, rate and effective date are required.'
    return
  }

  try {
    const res = await api.saveRule({
      holiday_type_id: form.holiday_type_id,
      scenario: form.scenario,
      rate_percent: Number(form.rate_percent),
      applies_to: form.applies_to,
      effective_from: form.effective_from,
      effective_to: form.effective_to || null,
      is_status: form.is_status,
    }, editingId.value)

    success(editingId.value ? 'Rule Updated' : 'Rule Added', res.message)
    closeForm()
    await api.fetchRules()
  } catch (err) {
    formError.value = api.getErrorMessage(err)
  }
}

const removeRule = async (rule: HolidayPayRule) => {
  const name = `${rule.holiday_type?.type_name ?? 'Holiday'} · ${scenarioLabel(rule.scenario)}`
  if (!window.confirm(`Delete the rule "${name}"?`)) return

  try {
    const res = await api.deleteRule(rule.id)
    success('Rule Deleted', res.message)
    await api.fetchRules()
  } catch (err) {
    showError('Unable to Delete Rule', api.getErrorMessage(err))
  }
}

// =====================================================
// HISTORY TAB
// =====================================================

const history = ref<HolidayPayHistory | null>(null)
const periodId = ref<number | null>(null)
const holidayId = ref<number | null>(null)
const search = ref('')
const page = ref(1)
const perPage = 10
const historyLoaded = ref(false)

const loadHistory = async () => {
  errorMessage.value = ''
  try {
    history.value = await api.fetchHistory({
      payroll_period_id: periodId.value,
      holiday_id: holidayId.value,
      search: search.value.trim(),
      page: page.value,
      per_page: perPage,
    })
    historyLoaded.value = true
  } catch (err) {
    errorMessage.value = api.getErrorMessage(err)
  }
}

let searchTimer: ReturnType<typeof setTimeout> | undefined

watch([periodId, holidayId], () => {
  if (page.value !== 1) page.value = 1
  else void loadHistory()
})

watch(search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    if (page.value !== 1) page.value = 1
    else void loadHistory()
  }, 350)
})

watch(page, () => void loadHistory())

watch(tab, (value) => {
  if (value === 'history' && !historyLoaded.value) void loadHistory()
})

onMounted(loadRules)
onBeforeUnmount(() => clearTimeout(searchTimer))
</script>

<template>
  <section class="hp-page">
    <PageHeader
      title="Holiday Pay"
      description="Holiday pay rates per holiday type, and the holiday pay each employee received in payroll."
    >
      <AppButton v-if="tab === 'rules'" :icon="Plus" @click="openForm()">Add Rule</AppButton>
    </PageHeader>

    <div v-if="errorMessage" class="alert">{{ errorMessage }}</div>

    <div class="tabs" role="tablist">
      <button type="button" role="tab" :class="{ active: tab === 'rules' }" :aria-selected="tab === 'rules'" @click="tab = 'rules'">
        Pay Rules
      </button>
      <button type="button" role="tab" :class="{ active: tab === 'history' }" :aria-selected="tab === 'history'" @click="tab = 'history'">
        Holiday Pay History
      </button>
    </div>

    <!-- ================= PAY RULES ================= -->
    <template v-if="tab === 'rules'">
      <div class="note">
        <Info :size="16" />
        <span>
          Rates are a percentage of the employee's daily rate for that day. Payroll uses the rule in effect on the holiday's date.
          To change a rate, set an <strong>Effective To</strong> on the current rule and add a new one, so past payrolls keep their rate.
          No rule means no holiday pay for that situation.
        </span>
      </div>

      <BaseDataTable
        title="Pay Rules"
        description="One rate per holiday type and situation."
        :has-rows="filteredRules.length > 0"
        :loading="loadingRules"
        min-width="950px"
        empty-title="No pay rules found"
        empty-description="Add a rule, or run the HolidayPayRuleSeeder for the DOLE default rates."
      >
        <template #toolbar>
          <select v-model="ruleTypeFilter" class="table-filter" aria-label="Holiday type">
            <option :value="null">All Holiday Types</option>
            <option v-for="t in holidayTypes" :key="t.id" :value="t.id">{{ t.type_name }}</option>
          </select>

          <select v-model="ruleStatusFilter" class="table-filter" aria-label="Status">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </template>

        <template #headers>
          <th>Holiday Type</th>
          <th>Situation</th>
          <th class="num">Rate</th>
          <th>Applies To</th>
          <th>Effective From</th>
          <th>Effective To</th>
          <th>Status</th>
          <th class="text-right">Action</th>
        </template>

        <template #rows>
          <tr v-for="rule in filteredRules" :key="rule.id">
            <td><strong>{{ rule.holiday_type?.type_name ?? '—' }}</strong></td>
            <td>{{ scenarioLabel(rule.scenario) }}</td>
            <td class="num"><strong>{{ percent(rule.rate_percent) }}</strong></td>
            <td>{{ appliesToLabel(rule.applies_to) }}</td>
            <td>{{ date(rule.effective_from) }}</td>
            <td>{{ date(rule.effective_to) }}</td>
            <td>
              <span class="pill" :class="rule.is_status ? 'pill--on' : 'pill--off'">
                {{ rule.is_status ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="text-right">
              <div class="actions">
                <button type="button" class="icon-btn" :aria-label="`Edit rule`" @click="openForm(rule)">
                  <Pencil :size="14" />
                </button>
                <button type="button" class="icon-btn icon-btn--danger" :aria-label="`Delete rule`" @click="removeRule(rule)">
                  <Trash2 :size="14" />
                </button>
              </div>
            </td>
          </tr>
        </template>
      </BaseDataTable>
    </template>

    <!-- ================= HISTORY ================= -->
    <template v-else>
      <div class="stats">
        <div class="stat">
          <span class="stat-icon stat-icon--green"><Coins :size="18" /></span>
          <div>
            <small>Total Holiday Pay</small>
            <strong>{{ money(history?.totals.amount) }}</strong>
          </div>
        </div>
        <div class="stat">
          <span class="stat-icon stat-icon--blue"><Users :size="18" /></span>
          <div>
            <small>Employees Paid</small>
            <strong>{{ history?.totals.employees ?? 0 }}</strong>
          </div>
        </div>
        <div class="stat">
          <span class="stat-icon stat-icon--violet"><Info :size="18" /></span>
          <div>
            <small>Holiday Pay Lines</small>
            <strong>{{ history?.totals.records ?? 0 }}</strong>
          </div>
        </div>
      </div>

      <BaseDataTable
        title="Holiday Pay History"
        description="Created by payroll generation. To change an amount, fix the rule, time log or coverage, then regenerate the payroll."
        :has-rows="(history?.rows.length ?? 0) > 0"
        :loading="loadingHistory"
        min-width="1150px"
        empty-title="No holiday pay yet"
        empty-description="Holiday pay appears here after generating a payroll whose cut-off includes a holiday."
      >
        <template #toolbar>
          <input
            v-model="search"
            type="search"
            class="table-search"
            placeholder="Search employee name or ID"
            aria-label="Search employee"
          >

          <select v-model="periodId" class="table-filter" aria-label="Payroll period">
            <option :value="null">All Pay Periods</option>
            <option v-for="p in history?.filters.periods ?? []" :key="p.id" :value="p.id">{{ p.period_name }}</option>
          </select>

          <select v-model="holidayId" class="table-filter" aria-label="Holiday">
            <option :value="null">All Holidays</option>
            <option v-for="h in history?.filters.holidays ?? []" :key="h.id" :value="h.id">{{ h.name }}</option>
          </select>
        </template>

        <template #headers>
          <th>Date</th>
          <th>Holiday</th>
          <th>Employee</th>
          <th>Pay Period</th>
          <th>Situation</th>
          <th class="num">Worked / OT</th>
          <th class="num">Rate</th>
          <th class="num">Holiday Pay</th>
          <th>Payroll</th>
        </template>

        <template #rows>
          <tr v-for="row in history?.rows ?? []" :key="row.id">
            <td>{{ date(row.holiday_date) }}</td>
            <td>
              <strong>{{ row.holiday.name ?? '—' }}</strong>
              <small class="sub">{{ row.holiday.type ?? '' }}</small>
            </td>
            <td>
              <strong>{{ row.employee.name }}</strong>
              <small class="sub">{{ row.employee.emp_id }}<template v-if="row.employee.department"> · {{ row.employee.department }}</template></small>
            </td>
            <td>{{ row.period?.period_name ?? '—' }}</td>
            <td>{{ row.scenario_label }}</td>
            <td class="num">{{ minutes(row.worked_minutes) }} / {{ minutes(row.overtime_minutes) }}</td>
            <td class="num">{{ percent(row.rate_percent) }}</td>
            <td class="num"><strong class="net">{{ money(row.amount) }}</strong></td>
            <td>
              <span class="pill" :class="row.payroll_status === 'finalized' ? 'pill--on' : 'pill--draft'">
                {{ row.payroll_status === 'finalized' ? 'Finalized' : 'Draft' }}
              </span>
            </td>
          </tr>
        </template>

        <template #bottom>
          <div class="footer-wrap">
            <BaseTableFooter
              v-model="page"
              :showing-from="history?.meta.from ?? 0"
              :showing-to="history?.meta.to ?? 0"
              :total-items="history?.meta.total ?? 0"
              :total-pages="history?.meta.last_page ?? 1"
              item-label="holiday pay lines"
            />
          </div>
        </template>
      </BaseDataTable>
    </template>

    <!-- ================= RULE FORM ================= -->
    <Teleport to="body">
      <div v-if="formOpen" class="hp-overlay" @click.self="closeForm">
        <div class="hp-modal" role="dialog" aria-modal="true" :aria-label="editingId ? 'Edit Pay Rule' : 'Add Pay Rule'">
          <div class="hp-modal-head">
            <div>
              <h3>{{ editingId ? 'Edit Pay Rule' : 'Add Pay Rule' }}</h3>
              <p>Rate for one holiday type and situation.</p>
            </div>
            <button type="button" class="hp-close" aria-label="Close" @click="closeForm"><X :size="17" /></button>
          </div>

          <form class="hp-form" @submit.prevent="saveRule">
            <div v-if="formError" class="alert">{{ formError }}</div>

            <div class="hp-grid">
              <label>
                <span>Holiday Type <b>*</b></span>
                <select v-model="form.holiday_type_id" required>
                  <option v-for="t in holidayTypes" :key="t.id" :value="t.id">{{ t.type_name }}</option>
                </select>
              </label>

              <label>
                <span>Situation <b>*</b></span>
                <select v-model="form.scenario" required>
                  <option v-for="s in SCENARIOS" :key="s.value" :value="s.value">{{ s.label }}</option>
                </select>
              </label>

              <label>
                <span>Rate (% of daily rate) <b>*</b></span>
                <input v-model="form.rate_percent" type="number" min="0" max="1000" step="0.01" placeholder="e.g. 200" required>
              </label>

              <label>
                <span>Applies To</span>
                <select v-model="form.applies_to">
                  <option v-for="a in APPLIES_TO" :key="a.value" :value="a.value">{{ a.label }}</option>
                </select>
              </label>

              <label>
                <span>Effective From <b>*</b></span>
                <input v-model="form.effective_from" type="date" required>
              </label>

              <label>
                <span>Effective To</span>
                <input v-model="form.effective_to" type="date">
                <small>Leave empty if still in use</small>
              </label>

              <label>
                <span>Status</span>
                <select v-model="form.is_status">
                  <option :value="true">Active</option>
                  <option :value="false">Inactive</option>
                </select>
              </label>
            </div>

            <p v-if="premiumHint" class="hint">{{ premiumHint }}</p>

            <div class="hp-foot">
              <AppButton variant="secondary" type="button" @click="closeForm">Cancel</AppButton>
              <AppButton type="submit" :disabled="saving">
                {{ saving ? 'Saving…' : (editingId ? 'Save Changes' : 'Add Rule') }}
              </AppButton>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.hp-page { width: 100%; min-width: 0; }

.alert { margin-bottom: 12px; padding: 11px 14px; border-radius: 8px; background: rgb(248 113 113 / 10%); color: #f87171; font-size: 12px; }

.tabs { display: inline-flex; gap: 4px; margin-bottom: 14px; padding: 4px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg-card); }
.tabs button { padding: 8px 16px; border: 0; border-radius: 7px; background: transparent; color: var(--text-secondary); font-size: 12px; font-weight: 600; cursor: pointer; }
.tabs button.active { background: var(--primary, #246bfd); color: #fff; }

.note { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 14px; padding: 12px 14px; border: 1px solid color-mix(in srgb, var(--primary, #246bfd) 25%, transparent); border-radius: 10px; background: color-mix(in srgb, var(--primary, #246bfd) 8%, var(--bg-card)); color: var(--text-secondary); font-size: 12px; line-height: 1.5; }
.note svg { flex-shrink: 0; margin-top: 1px; color: var(--primary, #246bfd); }
.note strong { color: var(--text-primary); }

.stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin-bottom: 14px; }
.stat { display: flex; align-items: center; gap: 14px; padding: 18px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); }
.stat small { display: block; color: var(--text-secondary); font-size: 11px; }
.stat strong { display: block; margin-top: 4px; color: var(--text-primary); font-size: 20px; }
.stat-icon { display: grid; width: 40px; height: 40px; flex-shrink: 0; place-items: center; border-radius: 10px; }
.stat-icon--green { background: rgb(34 197 94 / 14%); color: #22c55e; }
.stat-icon--blue { background: rgb(36 107 253 / 14%); color: #3b82f6; }
.stat-icon--violet { background: rgb(139 92 246 / 14%); color: #a78bfa; }

.num { text-align: right; white-space: nowrap; }
.net { color: #22c55e; }
.sub { display: block; margin-top: 3px; color: var(--text-muted); font-size: 11px; }
.footer-wrap { padding: 0 16px 14px; }

.pill { display: inline-flex; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.pill--on { background: rgb(34 197 94 / 11%); color: #22c55e; }
.pill--off { background: rgb(148 163 184 / 12%); color: #94a3b8; }
.pill--draft { background: rgb(251 146 60 / 12%); color: #fb923c; }

.actions { display: inline-flex; gap: 6px; }
.icon-btn { display: inline-grid; width: 30px; height: 30px; place-items: center; border: 1px solid var(--border); border-radius: 7px; background: transparent; color: var(--text-secondary); cursor: pointer; }
.icon-btn:hover { border-color: var(--primary); color: var(--primary); }
.icon-btn--danger:hover { border-color: #ef4444; color: #ef4444; }

@media (max-width: 900px) {
  .stats { grid-template-columns: 1fr; }
}
</style>

<style>
.hp-overlay { position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; background: rgba(0, 0, 0, .65); backdrop-filter: blur(3px); }
.hp-modal { width: 100%; max-width: 620px; max-height: calc(100vh - 40px); overflow-y: auto; border: 1px solid var(--border); border-radius: 14px; background: var(--bg-card); color: var(--text-primary); }
.hp-modal-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 18px 22px; border-bottom: 1px solid var(--border-soft); }
.hp-modal-head h3 { margin: 0; font-size: 17px; }
.hp-modal-head p { margin: 4px 0 0; color: var(--text-muted); font-size: 12px; }
.hp-close { display: grid; width: 34px; height: 34px; place-items: center; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--text-secondary); cursor: pointer; }
.hp-form { padding: 18px 22px; }
.hp-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.hp-grid label { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.hp-grid label > span { font-size: 11px; font-weight: 650; }
.hp-grid label b { color: #ef4444; }
.hp-grid label small { color: var(--text-muted); font-size: 10.5px; }
.hp-grid input,
.hp-grid select { width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 8px; outline: none; background: var(--bg-card-soft, var(--bg-card)); color: var(--text-primary); font-size: 12px; color-scheme: light dark; }
.hp-grid input:focus,
.hp-grid select:focus { border-color: var(--primary, #246bfd); }
.hp-form .hint { margin: 14px 0 0; padding: 10px 12px; border-radius: 8px; background: rgb(34 197 94 / 8%); color: #22c55e; font-size: 12px; }
.hp-foot { display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px; }

@media (max-width: 620px) {
  .hp-grid { grid-template-columns: 1fr; }
}
</style>