<script setup lang="ts">
import type { WageProposal } from '~/types/wageFlow'
import { canApplyWageOrder, wageMoney as money, wageToday } from '~/utils/wageWorkflow'
import { AlertTriangle, CheckCircle2, CircleDollarSign, ClipboardCheck, FileSearch, RefreshCcw } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const workflow = useWageWorkflow()
const { wageOrders, wageAdjustments, activeWageOrder } = workflow
const toast = useToast()
const orderFilter = ref(typeof route.query.order === 'string' ? route.query.order : activeWageOrder.value?.code ?? '')
const selectedWageOrder = computed(() => workflow.orderByCode(orderFilter.value))
const currentBatch = computed(() => workflow.batchFor(orderFilter.value))
const factorDraft = ref(workflow.state.value.config.annualFactor)
const thresholdDraft = ref(workflow.state.value.config.distortionThreshold)
const paidDays = computed({ get: () => workflow.state.value.config.paidDays, set: (value: number) => { workflow.state.value.config.paidDays = Number.isFinite(Number(value)) ? Math.max(0, Math.min(31, Number(value))) : 0 } })
const search = ref('')
const result = ref('')
const status = ref('')
const resultOptions = ['Required', 'Compliant', 'Distortion Review']
const statusOptions = ['Draft', 'For Review', 'Approved', 'Scheduled', 'Applied']
const orderRows = computed(() => wageAdjustments.value.filter(row => row.wageOrderCode === orderFilter.value))
const filteredRecords = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return orderRows.value.filter(row => (!keyword || [row.employeeName, row.employeeNumber, row.department].some(value => value.toLowerCase().includes(keyword)))
    && (!result.value || row.result === result.value) && (!status.value || row.status === status.value))
})
const requiredCount = computed(() => filteredRecords.value.filter(row => row.result === 'Required').length)
const compliantCount = computed(() => filteredRecords.value.filter(row => row.result === 'Compliant').length)
const distortionCount = computed(() => filteredRecords.value.filter(row => row.result === 'Distortion Review' && !row.distortionDecision).length)
const retro = (row: WageProposal) => workflow.retroFor(row)
const totalRetro = computed(() => filteredRecords.value.reduce((sum, row) => sum + retro(row).retroAmount, 0))
const employeesWithRetro = computed(() => filteredRecords.value.filter(row => retro(row).retroAmount > 0).length)
const monthlyImpact = computed(() => filteredRecords.value.filter(row => row.status !== 'Applied').reduce((sum, row) => sum + Math.max(0, row.proposedRate - row.currentRate) * paidDays.value, 0))
const approvedRecords = computed(() => currentBatch.value?.status === 'Approved' ? workflow.batchRows(currentBatch.value) : [])
const noRequired = computed(() => orderRows.value.length > 0 && !orderRows.value.some(row => row.result === 'Required'))
const applyDisabledReason = computed(() => {
  if (currentBatch.value?.status !== 'Approved') return 'Approve the whole Required batch before applying.'
  return canApplyWageOrder(selectedWageOrder.value, wageToday()) || approvedRecords.value.map(row => workflow.readyProblem(row)).find(Boolean) || ''
})
const evaluateDisabledReason = computed(() => {
  if (!selectedWageOrder.value || !['Active', 'Scheduled'].includes(selectedWageOrder.value.status)) return 'Select an active or scheduled wage order.'
  if (factorDraft.value !== workflow.state.value.config.annualFactor || thresholdDraft.value !== workflow.state.value.config.distortionThreshold) return 'Save the evaluation rules before generating proposals.'
  if (['For Review', 'Approved', 'Applied'].includes(currentBatch.value?.status ?? '') || orderRows.value.some(row => ['Approved', 'Scheduled', 'Applied'].includes(row.status))) return 'This evaluation has pending, approved or applied decisions.'
  return ''
})
const submitDisabled = computed(() => !currentBatch.value?.proposalIds.length || !['Draft', 'Rejected'].includes(currentBatch.value.status))
const saveRules = () => {
  try { workflow.updateConfig(factorDraft.value, thresholdDraft.value); toast.success('Evaluation rules saved', 'Evaluate again to generate proposals using these rules.') }
  catch (problem) { toast.error('Check evaluation rules', problem instanceof Error ? problem.message : 'Unable to save.') }
}
const resetFilters = () => { search.value = ''; result.value = ''; status.value = '' }
const openWageOrders = () => router.push('/admin/settings/compensation/wage-orders')
const dialogOpen = ref(false)
const dialogMode = ref('view')
const selectedRecord = ref<WageProposal | null>(null)
const openAction = (mode: string, record: WageProposal | null = null) => { selectedRecord.value = record; dialogMode.value = mode; dialogOpen.value = true }
const runEvaluation = () => openAction('evaluate')
const applyAdjustment = () => openAction('applyBatch')
const adjustmentActions = (row: WageProposal) => [
  { key: 'view', label: 'View Details' },
  ...(row.result === 'Distortion Review' ? [
    { key: 'reviewDistortion', label: 'Review Proposal', disabled: !!row.distortionDecision || row.status === 'Applied', reason: 'This HR case already has a decision.' },
    { key: 'applyDistortion', label: 'Apply HR Correction', disabled: row.distortionDecision !== 'Approved' || !!workflow.readyProblem(row), reason: workflow.readyProblem(row) || 'Requires separate HR approval.' },
  ] : []),
  { key: 'history', label: 'View History' },
]
watch(() => route.query.order, value => { if (typeof value === 'string') { orderFilter.value = value; dialogOpen.value = false } })
const currentPage = ref(1)
const totalPages = computed(() => Math.max(1, Math.ceil(filteredRecords.value.length / 10)))
const paginatedRecords = computed(() => filteredRecords.value.slice((currentPage.value - 1) * 10, currentPage.value * 10))
watch([search, result, status, orderFilter], () => { currentPage.value = 1 })
watch(totalPages, value => { currentPage.value = Math.min(currentPage.value, value) })
const resultClass = (value: string) => value === 'Compliant' ? 'compliant' : value === 'Distortion Review' ? 'distortion' : 'required'
</script>

<template>
  <section class="page">
    <p class="demo-notice">Sample/session data · Daily-equivalent rates in PHP · No backend or payroll records are changed.</p>

    <PageHeader
      title="Wage Adjustments"
      description="Review employees affected by government wage orders before applying effective-dated salary changes."
    >

      <div class="header-actions">

        <AppButton
          variant="secondary"
          :icon="FileSearch"
          @click="openWageOrders"
        >
          Wage Orders
        </AppButton>

        <AppButton
          :icon="ClipboardCheck"
          :disabled="!!evaluateDisabledReason" :title="evaluateDisabledReason" @click="runEvaluation"
        >
          Evaluate Employees
        </AppButton>

      </div>

    </PageHeader>

    <div
      v-if="selectedWageOrder"
      class="order-context"
    >
      <div>
        <span>
          SELECTED WAGE ORDER
        </span>

        <strong>
          {{ selectedWageOrder.code }}
        </strong>
      </div>

      <div>
        <span>
          REGION
        </span>

        <strong>
          {{ selectedWageOrder.region }}
        </strong>
      </div>

      <div>
        <span>
          NEW MINIMUM
        </span>

        <strong class="green">
          {{ money(selectedWageOrder.newMinimumRate) }}
        </strong>
      </div>

      <div>
        <span>
          EFFECTIVE DATE
        </span>

        <strong>
          {{ selectedWageOrder.effectiveDate }}
        </strong>
      </div>
    </div>

    <article class="filter-card rules-grid">
      <label>Company Annual Factor<input v-model.number="factorDraft" type="number" min="1" max="366" :disabled="workflow.configLocked.value" aria-label="Company Annual Factor"><small>Monthly rate × 12 ÷ factor (e.g. 313 or 261).</small></label>
      <label>Distortion Threshold (PHP / day)<input v-model.number="thresholdDraft" type="number" min="0" step="0.01" :disabled="workflow.configLocked.value" aria-label="Distortion Threshold"><small>Flag compliant rates with a smaller minimum/junior gap.</small></label>
      <AppButton variant="secondary" :disabled="workflow.configLocked.value" @click="saveRules">Save Evaluation Rules</AppButton>
    </article>
    <div class="stats-grid">

      <StatCard
        label="Proposals in View"
        :value="filteredRecords.length"
        description="Matching wage proposals"
        :icon="FileSearch"
        tone="blue"
      />

      <StatCard
        label="Required Adjustment"
        :value="requiredCount"
        description="Below applicable minimum"
        :icon="CircleDollarSign"
        tone="orange"
      />

      <StatCard
        label="Already Compliant"
        :value="compliantCount"
        description="No required minimum adjustment"
        :icon="CheckCircle2"
        tone="green"
      />

      <StatCard
        label="Distortion Review"
        :value="distortionCount"
        description="Salary gaps requiring HR review"
        :icon="AlertTriangle"
        tone="purple"
      />

      <StatCard label="Total Retro Amount" :value="money(totalRetro)" description="Actual mock workdays in retro period" :icon="CircleDollarSign" tone="green" />
      <StatCard label="Employees With Retro" :value="employeesWithRetro" description="Matching proposals with retro pay" :icon="ClipboardCheck" tone="purple" />
    </div>

    <article class="filter-card batch-card">
      <div><strong>Required Batch {{ currentBatch ? '#' + currentBatch.id : '' }}</strong><p>Status: <span class="workflow-badge">{{ currentBatch?.status || 'Not evaluated' }}</span> · {{ currentBatch?.proposalIds.length || 0 }} Required proposals. Compliant and distortion cases excluded.</p>
      <p>Approval and application always cover the full evaluation, regardless of search or table filters.</p><p v-if="currentBatch?.remarks">Decision remarks: {{ currentBatch.remarks }}</p></div>
      <div class="batch-buttons"><AppButton variant="secondary" :disabled="submitDisabled" @click="openAction('submitBatch')">Submit Batch for Approval</AppButton>
      <AppButton :disabled="currentBatch?.status !== 'For Review'" @click="openAction('reviewBatch')">Review Batch</AppButton>
      <AppButton variant="secondary" :disabled="!currentBatch" @click="openAction('batchHistory')">Batch History</AppButton></div>
    </article>
    <p v-if="noRequired" class="demo-notice">No employees below the new minimum.</p>
    <article class="impact-card">

      <div>
        <span>
          POTENTIAL MONTHLY INCREASE (FILTERED PROPOSALS)
        </span>

        <strong>
          {{ money(monthlyImpact) }}
        </strong>

        <p>
          Estimate only: proposed daily increase × paid days below; excludes already effective changes.
        </p>
      </div>

      <label class="paid-days">Estimated paid days / month<input v-model.number="paidDays" type="number" min="0" max="31" step="1"></label>
      <AppButton
        :disabled="!!applyDisabledReason || !approvedRecords.length" :title="applyDisabledReason"
        @click="applyAdjustment"
      >
        Apply Approved Adjustments
      </AppButton>

    </article>

    <article class="filter-card">

      <div class="filter-grid">
        <AppSelect v-model="orderFilter" :options="wageOrders.map(item => item.code)" placeholder="All Wage Orders" aria-label="Wage order filter" />

        <AppInput
          v-model="search"
          searchable
          placeholder="Search employee or department..."
        />

        <AppSelect
          v-model="result"
          :options="resultOptions"
          placeholder="All Results"
        />

        <AppSelect
          v-model="status"
          :options="statusOptions"
          placeholder="All Status"
        />

        <AppButton
          variant="secondary"
          :icon="RefreshCcw"
          @click="resetFilters"
        >
          Reset
        </AppButton>

      </div>

    </article>

    <article class="table-card">

      <div class="table-scroll">

        <table>

          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Region</th>
              <th>Old Daily Rate</th>
              <th>New Minimum</th>
              <th>Required Increase</th>
              <th>Proposed Rate</th>
              <th>Result</th>
              <th>Distortion</th>
              <th>Wage Order</th>
              <th>Effective Date</th>
              <th>Retro From</th><th>Retro To</th><th>Days Covered</th><th>Retro Amount</th><th>Workflow Status</th>
              <th class="action-cell">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="!filteredRecords.length"><td colspan="17">{{ orderRows.length ? 'No wage adjustments match your filters.' : 'Evaluate the selected wage order to generate proposals.' }}</td></tr>

            <tr
              v-for="item in paginatedRecords"
              :key="item.id"
            >

              <td>
                <strong>
                  {{ item.employeeName }}
                </strong>

                <span>
                  {{ item.employeeNumber }}
                  ·
                  {{ item.position }}
                  <small>{{ item.employmentType }}<template v-if="item.employmentType === 'monthly'"> · {{ money(item.monthlyRate || 0) }} × 12 ÷ {{ item.conversionFactor }}</template></small>
                </span>
              </td>

              <td>
                {{ item.department }}
              </td>

              <td>
                {{ item.region }}
              </td>

              <td>
                {{ money(item.currentRate) }}
              </td>

              <td>
                <strong>
                  {{ money(item.newMinimumRate) }}
                </strong>
              </td>

              <td>
                <span
                  :class="{
                    increase:
                      item.requiredIncrease > 0,
                  }"
                >
                  {{
                    item.requiredIncrease > 0
                      ? `+${money(item.requiredIncrease)}`
                      : money(0)
                  }}
                </span>
              </td>

              <td>
                <strong class="proposed">
                  {{ money(item.proposedRate) }}
                </strong>
              </td>

              <td>
                <span
                  class="result-badge"
                  :class="resultClass(item.result)"
                >
                  {{ item.result }}
                </span>
              </td>

              <td>
                <span
                  :class="{
                    risk:
                      item.distortionRisk,
                  }"
                >
                  {{
                    item.result === 'Distortion Review' ? (item.distortionDecision || 'HR Review Required') : '—'
                  }}
                </span>
              </td>

              <td>
                {{ item.wageOrderCode }}
              </td>

              <td>
                {{ item.effectiveDate }}
              </td>

              <td>{{ retro(item).retroFrom || 'No retro' }}</td><td>{{ retro(item).retroTo || '—' }}</td><td>{{ retro(item).daysCovered }}</td><td>{{ money(retro(item).retroAmount) }}</td>
              <td><span class="workflow-badge" :data-status="item.status">{{ item.status === 'Applied' ? 'Applied (Effective)' : item.status }}</span></td>
              <td class="action-cell"><WageActionMenu :label="'Actions for ' + item.employeeName" :items="adjustmentActions(item)" @select="key => openAction(key, item)" /></td>

            </tr>

          </tbody>

        </table>

      </div>

    </article>

    <div class="wage-footer"><p>{{ filteredRecords.length }} proposals in view · {{ currentBatch?.proposalIds.length || 0 }} Required proposals in the full batch</p><AppPagination v-model="currentPage" :total-pages="totalPages" /></div>
    <WageAdjustmentDialog :open="dialogOpen" :mode="dialogMode" :record="selectedRecord" :order-code="orderFilter" @close="dialogOpen = false" />
  </section>
</template>

<style scoped>
.rules-grid { display:grid;grid-template-columns:1fr 1fr auto;gap:16px;align-items:center; }
.rules-grid label { display:flex;flex-direction:column;gap:6px;font-size:12px;color:var(--text-secondary); }
.rules-grid input { padding:9px;border:1px solid var(--border);border-radius:7px;background:var(--bg-card-soft);color:var(--text-primary); }
.rules-grid small { color:var(--text-muted);font-size:10px; }
.batch-card { display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap;margin-bottom:14px; }
.batch-card p { margin:6px 0 0;font-size:11px;color:var(--text-secondary); }
.batch-buttons { display:flex;gap:8px;flex-wrap:wrap; }
.workflow-badge { display:inline-block;padding:5px 8px;background:var(--primary-soft);color:var(--primary);border-radius:12px;font-size:10px;white-space:nowrap; }
.workflow-badge[data-status="Applied"] { color:var(--green);background:var(--green-soft); }
td small { display:block;color:var(--text-muted);font-size:9px;margin-top:4px; }
@media(max-width:900px) { .rules-grid { grid-template-columns:1fr; } }

.demo-notice, .wage-footer { font-size:12px;color:var(--text-muted); }
.wage-footer { display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-top:14px; }
.paid-days { font-size:11px;display:flex;flex-direction:column;gap:6px;color:var(--text-secondary); }
.paid-days input { max-width:130px;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--bg-card-soft);color:var(--text-primary); }
.action-cell { position:sticky;right:0;background:var(--bg-card);box-shadow:-5px 0 8px #0001;text-align:center;min-width:76px; }
th.action-cell { background:var(--bg-card-soft); }

.page {
  width: 100%;
  max-width: 1680px;
  margin: 0 auto;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.order-context {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
  padding: 13px 15px;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--bg-card);
}

.order-context span,
.order-context strong {
  display: block;
}

.order-context span {
  color: var(--text-muted);
  font-size: 8px;
  font-weight: 700;
}

.order-context strong {
  margin-top: 4px;
  color: var(--text-primary);
  font-size: 10.5px;
}

.order-context .green {
  color: var(--green);
}

.stats-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 14px;
}

.impact-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 14px;
  padding: 14px 16px;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--bg-card);
}

.impact-card span {
  color: var(--text-muted);
  font-size: 8px;
  font-weight: 700;
}

.impact-card strong {
  display: block;
  margin-top: 3px;
  color: var(--green);
  font-size: 18px;
}

.impact-card p {
  margin: 3px 0 0;
  color: var(--text-muted);
  font-size: 9px;
}

.filter-card {
  margin-bottom: 14px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--bg-card);
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(2,minmax(160px,1fr)) repeat(2,180px) auto;
  gap: 9px;
}

.table-card {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--bg-card);
}

.table-scroll {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 1900px;
  border-collapse: collapse;
}

th {
  padding: 11px 12px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  font-size: 9px;
  text-align: left;
  white-space: nowrap;
}

td {
  padding: 12px;
  border-top: 1px solid var(--border-soft);
  color: var(--text-secondary);
  font-size: 10px;
}

td strong,
td span {
  display: block;
}

td strong {
  color: var(--text-primary);
}

td span {
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 9px;
}

.increase,
.proposed {
  color: var(--green) !important;
}

.risk {
  color: var(--orange) !important;
  font-weight: 650;
}

.result-badge {
  display: inline-flex;
  margin: 0;
  padding: 5px 8px;
  border-radius: 20px;
  font-weight: 650;
}

.result-badge.compliant {
  background: var(--green-soft);
  color: var(--green);
}

.result-badge.required {
  background: var(--orange-soft);
  color: var(--orange);
}

.result-badge.distortion {
  background: var(--purple-soft);
  color: var(--purple);
}

@media (max-width: 900px) {
  .order-context,
  .stats-grid,
  .filter-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .header-actions,
  .impact-card {
    align-items: stretch;
    flex-direction: column;
  }

  .order-context,
  .stats-grid,
  .filter-grid {
    grid-template-columns: 1fr;
  }
}
</style>
