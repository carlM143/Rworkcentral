<script setup lang="ts">
import {
  AlertTriangle,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  FileSearch,
  RefreshCcw,
} from 'lucide-vue-next'

import WageAdjustmentActions from '~/components/payroll/wage-adjustments/WageAdjustmentActions.vue'

import WageAdjustmentModal from '~/components/payroll/wage-adjustments/WageAdjustmentModal.vue'

import WageEvaluationModal from '~/components/payroll/wage-adjustments/WageEvaluationModal.vue'

import ApplyWageAdjustmentsModal from '~/components/payroll/wage-adjustments/ApplyWageAdjustmentsModal.vue'

import type {
  WageAdjustmentRecord,
  WageAdjustmentStatus,
} from '~/types/wageManagement'

const router =
  useRouter()

const {
  wageAdjustments,
  activeWageOrder,
} = useWageManagement()

const {
  info,
  success,
} = useToast()

/* =========================================================
   FILTERS
========================================================= */

const search =
  ref('')

const result =
  ref('')

const status =
  ref('')

const resultOptions = [
  'Required',
  'Compliant',
  'Distortion Review',
]

const statusOptions = [
  'For Review',
  'Pending Approval',
  'Approved',
  'Scheduled',
  'Effective',
]

const filteredRecords =
  computed(() => {
    const keyword =
      search.value
        .trim()
        .toLowerCase()

    return wageAdjustments.value.filter(
      item => {
        const matchesSearch =
          !keyword ||
          item.employeeName
            .toLowerCase()
            .includes(keyword) ||
          item.employeeNumber
            .toLowerCase()
            .includes(keyword) ||
          item.department
            .toLowerCase()
            .includes(keyword)

        return (
          matchesSearch &&
          (
            !result.value ||
            item.result ===
              result.value
          ) &&
          (
            !status.value ||
            item.status ===
              status.value
          )
        )
      },
    )
  })

/* =========================================================
   STATS
========================================================= */

const requiredCount =
  computed(
    () =>
      wageAdjustments.value.filter(
        item =>
          item.result ===
          'Required',
      ).length,
  )

const compliantCount =
  computed(
    () =>
      wageAdjustments.value.filter(
        item =>
          item.result ===
          'Compliant',
      ).length,
  )

const distortionCount =
  computed(
    () =>
      wageAdjustments.value.filter(
        item =>
          item.distortionRisk,
      ).length,
  )

const monthlyImpact =
  computed(() => {
    return wageAdjustments.value.reduce(
      (
        total,
        item,
      ) =>
        total +
        item.requiredIncrease *
          26,
      0,
    )
  })

const approvedAdjustments =
  computed(() => {
    return wageAdjustments.value.filter(
      item =>
        item.status ===
          'Approved' &&
        item.requiredIncrease >
          0,
    )
  })

/* =========================================================
   HELPERS
========================================================= */

const money = (
  value: number,
) => {
  return new Intl.NumberFormat(
    'en-PH',
    {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    },
  ).format(value)
}

const resetFilters = () => {
  search.value = ''
  result.value = ''
  status.value = ''
}

const resultClass = (
  value: string,
) => {
  if (
    value ===
    'Compliant'
  ) {
    return 'compliant'
  }

  if (
    value ===
    'Distortion Review'
  ) {
    return 'distortion'
  }

  return 'required'
}

const statusClass = (
  value: string,
) => {
  if (
    value ===
    'Effective'
  ) {
    return 'effective'
  }

  if (
    value ===
    'Approved'
  ) {
    return 'approved'
  }

  if (
    value ===
    'Scheduled'
  ) {
    return 'scheduled'
  }

  if (
    value ===
    'Pending Approval'
  ) {
    return 'pending'
  }

  return 'review'
}

/* =========================================================
   WAGE ORDERS
========================================================= */

const openWageOrders = () => {
  router.push(
    '/settings/compensation/wage-orders',
  )
}

/* =========================================================
   EVALUATE
========================================================= */

const evaluationOpen =
  ref(false)

const runEvaluation = () => {
  evaluationOpen.value =
    true
}

const handleEvaluation = () => {
  evaluationOpen.value =
    false

  success(
    'Wage Evaluation Completed',
    `${wageAdjustments.value.length} employee record(s) were evaluated against the active wage order.`,
  )
}

/* =========================================================
   APPLY APPROVED
========================================================= */

const applyModalOpen =
  ref(false)

const applyAdjustment = () => {
  applyModalOpen.value =
    true
}

const handleApplyAdjustment =
  () => {
    const records =
      approvedAdjustments.value

    if (!records.length) {
      info(
        'No Approved Adjustments',
        'There are currently no approved wage adjustments ready to apply.',
      )

      applyModalOpen.value =
        false

      return
    }

    records.forEach(
      item => {
        item.currentRate =
          item.proposedRate

        item.requiredIncrease =
          0

        item.result =
          'Compliant'

        item.status =
          'Effective'
      },
    )

    applyModalOpen.value =
      false

    success(
      'Adjustments Applied',
      `${records.length} approved wage adjustment(s) were marked effective.`,
    )
  }

/* =========================================================
   DETAILS / REVIEW
========================================================= */

const adjustmentModalOpen =
  ref(false)

const adjustmentModalMode =
  ref<
    'view' |
    'review'
  >('view')

const selectedAdjustment =
  ref<
    WageAdjustmentRecord |
    null
  >(null)

const handleView = (
  record:
    WageAdjustmentRecord,
) => {
  selectedAdjustment.value =
    record

  adjustmentModalMode.value =
    'view'

  adjustmentModalOpen.value =
    true
}

const handleReview = (
  record:
    WageAdjustmentRecord,
) => {
  selectedAdjustment.value =
    record

  adjustmentModalMode.value =
    'review'

  adjustmentModalOpen.value =
    true
}

const closeAdjustmentModal =
  () => {
    adjustmentModalOpen.value =
      false

    selectedAdjustment.value =
      null
  }

const handleSaveReview = (
  payload: {
    id: number
    proposedRate: number
    effectiveDate: string
    status:
      WageAdjustmentStatus
    remarks: string
  },
) => {
  const record =
    wageAdjustments.value.find(
      item =>
        item.id ===
        payload.id,
    )

  if (!record) {
    info(
      'Record Not Found',
      'The selected wage adjustment could not be found.',
    )

    return
  }

  record.proposedRate =
    payload.proposedRate

  record.effectiveDate =
    payload.effectiveDate

  record.status =
    payload.status

  closeAdjustmentModal()

  success(
    'Wage Adjustment Updated',
    `${record.employeeName}'s wage adjustment review has been saved.`,
  )
}

/* =========================================================
   EMPLOYEE
========================================================= */

const handleEmployee = (
  record:
    WageAdjustmentRecord,
) => {
  router.push(
    `/employees/${record.employeeId}`,
  )
}

/* =========================================================
   HISTORY
========================================================= */

const handleHistory = (
  record:
    WageAdjustmentRecord,
) => {
  router.push(
    `/employees/${record.employeeId}/compensation-history`,
  )
}
</script>

<template>
  <section class="page">

    <PageHeader
      title="Wage Adjustments"
      description="Review employees affected by government wage orders before applying effective-dated salary changes."
    >

      <div class="header-actions">

        <AppButton
          variant="secondary"
          :icon="FileSearch"
          @click="
            openWageOrders
          "
        >
          Wage Orders
        </AppButton>

        <AppButton
          :icon="ClipboardCheck"
          @click="
            runEvaluation
          "
        >
          Evaluate Employees
        </AppButton>

      </div>

    </PageHeader>

    <!-- ACTIVE WAGE ORDER -->

    <div
      v-if="
        activeWageOrder
      "
      class="order-context"
    >

      <div>
        <span>
          ACTIVE WAGE ORDER
        </span>

        <strong>
          {{
            activeWageOrder.code
          }}
        </strong>
      </div>

      <div>
        <span>
          REGION
        </span>

        <strong>
          {{
            activeWageOrder.region
          }}
        </strong>
      </div>

      <div>
        <span>
          NEW MINIMUM
        </span>

        <strong class="green">
          {{
            money(
              activeWageOrder.newMinimumRate,
            )
          }}
        </strong>
      </div>

      <div>
        <span>
          EFFECTIVE DATE
        </span>

        <strong>
          {{
            activeWageOrder.effectiveDate
          }}
        </strong>
      </div>

    </div>

    <!-- STATS -->

    <div class="stats-grid">

      <StatCard
        label="Employees Reviewed"
        :value="
          wageAdjustments.length
        "
        description="Employees evaluated"
        :icon="FileSearch"
        tone="blue"
      />

      <StatCard
        label="Required Adjustment"
        :value="
          requiredCount
        "
        description="Below applicable minimum"
        :icon="CircleDollarSign"
        tone="orange"
      />

      <StatCard
        label="Already Compliant"
        :value="
          compliantCount
        "
        description="No required minimum adjustment"
        :icon="CheckCircle2"
        tone="green"
      />

      <StatCard
        label="Distortion Review"
        :value="
          distortionCount
        "
        description="Salary gaps requiring HR review"
        :icon="AlertTriangle"
        tone="purple"
      />

    </div>

    <!-- IMPACT -->

    <article class="impact-card">

      <div>
        <span>
          ESTIMATED MONTHLY PAYROLL IMPACT
        </span>

        <strong>
          {{
            money(
              monthlyImpact,
            )
          }}
        </strong>

        <p>
          Preview only. Actual computation will use real schedules and payroll rules.
        </p>
      </div>

      <AppButton
        @click="
          applyAdjustment
        "
      >
        Apply Approved Adjustments
      </AppButton>

    </article>

    <!-- FILTERS -->

    <article class="filter-card">

      <div class="filter-grid">

        <AppInput
          v-model="
            search
          "
          searchable
          placeholder="Search employee or department..."
        />

        <AppSelect
          v-model="
            result
          "
          :options="
            resultOptions
          "
          placeholder="All Results"
        />

        <AppSelect
          v-model="
            status
          "
          :options="
            statusOptions
          "
          placeholder="All Status"
        />

        <AppButton
          variant="secondary"
          :icon="RefreshCcw"
          @click="
            resetFilters
          "
        >
          Reset
        </AppButton>

      </div>

    </article>

    <!-- TABLE -->

    <article class="table-card">

      <div class="table-scroll">

        <table>

          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Region</th>
              <th>Current Rate</th>
              <th>New Minimum</th>
              <th>Required Increase</th>
              <th>Proposed Rate</th>
              <th>Result</th>
              <th>Distortion</th>
              <th>Wage Order</th>
              <th>Effective Date</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>

          <tbody>

            <tr
              v-for="
                item in
                filteredRecords
              "
              :key="
                item.id
              "
            >

              <td>
                <strong>
                  {{
                    item.employeeName
                  }}
                </strong>

                <span>
                  {{
                    item.employeeNumber
                  }}
                  ·
                  {{
                    item.position
                  }}
                </span>
              </td>

              <td>
                {{ item.department }}
              </td>

              <td>
                {{ item.region }}
              </td>

              <td>
                {{
                  money(
                    item.currentRate,
                  )
                }}
              </td>

              <td>
                <strong>
                  {{
                    money(
                      item.newMinimumRate,
                    )
                  }}
                </strong>
              </td>

              <td>
                <span
                  :class="{
                    increase:
                      item.requiredIncrease >
                      0,
                  }"
                >
                  {{
                    item.requiredIncrease >
                    0
                      ? `+${money(
                          item.requiredIncrease,
                        )}`
                      : money(0)
                  }}
                </span>
              </td>

              <td>
                <strong class="proposed">
                  {{
                    money(
                      item.proposedRate,
                    )
                  }}
                </strong>
              </td>

              <td>
                <span
                  class="result-badge"
                  :class="
                    resultClass(
                      item.result,
                    )
                  "
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
                    item.distortionRisk
                      ? 'Review Required'
                      : 'No Risk'
                  }}
                </span>
              </td>

              <td>
                {{
                  item.wageOrderCode
                }}
              </td>

              <td>
                {{
                  item.effectiveDate
                }}
              </td>

              <td>
                <span
                  class="status-badge"
                  :class="
                    statusClass(
                      item.status,
                    )
                  "
                >
                  {{ item.status }}
                </span>
              </td>

              <td class="action-cell">

                <WageAdjustmentActions
                  :record="item"
                  @view="
                    handleView
                  "
                  @review="
                    handleReview
                  "
                  @employee="
                    handleEmployee
                  "
                  @history="
                    handleHistory
                  "
                />

              </td>

            </tr>

          </tbody>

        </table>

      </div>

    </article>

    <!-- DETAILS / REVIEW -->

    <WageAdjustmentModal
      :open="
        adjustmentModalOpen
      "
      :record="
        selectedAdjustment
      "
      :mode="
        adjustmentModalMode
      "
      @close="
        closeAdjustmentModal
      "
      @save="
        handleSaveReview
      "
    />

    <!-- EVALUATION -->

    <WageEvaluationModal
      :open="
        evaluationOpen
      "
      :wage-order="
        activeWageOrder
      "
      :records="
        wageAdjustments
      "
      @close="
        evaluationOpen = false
      "
      @evaluate="
        handleEvaluation
      "
    />

    <!-- APPLY -->

    <ApplyWageAdjustmentsModal
      :open="
        applyModalOpen
      "
      :records="
        approvedAdjustments
      "
      @close="
        applyModalOpen = false
      "
      @apply="
        handleApplyAdjustment
      "
    />

  </section>
</template>

<style scoped>
.page {
  width: 100%;

  max-width: 1680px;

  margin:
    0 auto;
}

.header-actions {
  display: flex;

  gap: 8px;
}

.order-context {
  display: grid;

  grid-template-columns:
    repeat(
      4,
      minmax(0, 1fr)
    );

  gap: 12px;

  margin-bottom: 14px;

  padding: 13px 15px;

  border:
    1px solid var(--border);

  border-radius: 11px;

  background:
    var(--bg-card);
}

.order-context span,
.order-context strong {
  display: block;
}

.order-context span {
  color:
    var(--text-muted);

  font-size: 8px;
  font-weight: 700;
}

.order-context strong {
  margin-top: 4px;

  color:
    var(--text-primary);

  font-size: 10.5px;
}

.order-context .green {
  color:
    var(--green);
}

.stats-grid {
  display: grid;

  grid-template-columns:
    repeat(
      4,
      minmax(0, 1fr)
    );

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

  border:
    1px solid var(--border);

  border-radius: 11px;

  background:
    var(--bg-card);
}

.impact-card span {
  color:
    var(--text-muted);

  font-size: 8px;
  font-weight: 700;
}

.impact-card strong {
  display: block;

  margin-top: 3px;

  color:
    var(--green);

  font-size: 18px;
}

.impact-card p {
  margin: 3px 0 0;

  color:
    var(--text-muted);

  font-size: 9px;
}

.filter-card {
  margin-bottom: 14px;

  padding: 12px;

  border:
    1px solid var(--border);

  border-radius: 11px;

  background:
    var(--bg-card);
}

.filter-grid {
  display: grid;

  grid-template-columns:
    minmax(300px, 1fr)
    210px
    210px
    auto;

  gap: 9px;
}

.table-card {
  overflow: visible;

  border:
    1px solid var(--border);

  border-radius: 11px;

  background:
    var(--bg-card);
}

.table-scroll {
  overflow-x: auto;

  overflow-y: visible;
}

table {
  width: 100%;

  min-width: 1950px;

  border-collapse: collapse;
}

th {
  padding: 11px 12px;

  background:
    var(--bg-card-soft);

  color:
    var(--text-secondary);

  font-size: 9px;

  text-align: left;

  white-space: nowrap;
}

td {
  padding: 12px;

  border-top:
    1px solid var(--border-soft);

  color:
    var(--text-secondary);

  font-size: 10px;
}

td strong,
td span {
  display: block;
}

td strong {
  color:
    var(--text-primary);
}

td span {
  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 9px;
}

.increase,
.proposed {
  color:
    var(--green) !important;
}

.risk {
  color:
    var(--orange) !important;

  font-weight: 650;
}

.result-badge,
.status-badge {
  display: inline-flex;

  margin: 0;

  padding: 5px 8px;

  border-radius: 20px;

  font-weight: 650;

  white-space: nowrap;
}

.result-badge.compliant {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.result-badge.required {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.result-badge.distortion {
  background:
    var(--purple-soft);

  color:
    var(--purple);
}

.status-badge.effective {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.status-badge.approved {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.status-badge.scheduled {
  background:
    var(--purple-soft);

  color:
    var(--purple);
}

.status-badge.pending {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.status-badge.review {
  background:
    var(--bg-card-soft);

  color:
    var(--text-secondary);
}

.action-cell {
  position: relative;

  width: 45px;

  text-align: right;
}

@media (max-width: 900px) {
  .order-context,
  .stats-grid,
  .filter-grid {
    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );
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
    grid-template-columns:
      1fr;
  }
}
</style>