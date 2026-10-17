<script setup lang="ts">
import {
  ArrowLeft,
  Download,
  Plus,
} from 'lucide-vue-next'

const exportModalOpen = ref(false)

const handleOpenExport = () => {
  exportModalOpen.value = true
}

const handleCloseExport = () => {
  exportModalOpen.value = false
}

const handleConfirmExport = (payload: {
  format: string
  scope: string
  includeEmployee: boolean
  includeDepartment: boolean
  includeRateType: boolean
  includePayBasis: boolean
  includeBasicRate: boolean
  includeHourlyRate: boolean
  includeOtRate: boolean
  includeTripRate: boolean
  includeEffectiveDate: boolean
  includeStatus: boolean
}) => {
  exportModalOpen.value = false

  info(
    'Export Payroll Rates',
    `Export setup saved. Format: ${payload.format.toUpperCase()}, Scope: ${payload.scope}. Backend export can be connected next.`,
  )
}

import PayrollRateStats from '~/components/payroll/rates/PayrollRateStats.vue'
import PayrollRateFilters from '~/components/payroll/rates/PayrollRateFilters.vue'
import PayrollRateTable from '~/components/payroll/rates/PayrollRateTable.vue'
import AddEditPayrollRateModal from '~/components/payroll/rates/AddEditPayrollRateModal.vue'
import PayrollRateDetailsModal from '~/components/payroll/rates/PayrollRateDetailsModal.vue'
import PayrollRateHistoryModal from '~/components/payroll/rates/PayrollRateHistoryModal.vue'

import PayrollRatesExportModal from '~/components/payroll/rates/PayrollRatesExportModal.vue'

import type {
  PayrollRate,
  PayrollRateFormData,
} from '~/types/payrollRate'

const router =
  useRouter()

const {
  employees,
} = useEmployees()

const {
  search,
  rateType,
  department,
  status,

  currentPage,

  filteredRates,
  paginatedRates,

  totalPages,
  showingFrom,
  showingTo,

  stats,

  departmentOptions,
  rateTypeOptions,
  payBasisOptions,
  statusOptions,

  createRate,
  updateRate,

  activateRate,
  deactivateRate,

  resetFilters,
} = usePayrollRates()

const {
  info,
  success,
} = useToast()

/* =========================================================
   ADD / EDIT
========================================================= */

const formModalOpen =
  ref(false)

const editingRate =
  ref<
    PayrollRate |
    null
  >(null)

const handleAdd = () => {
  editingRate.value =
    null

  formModalOpen.value =
    true
}

const handleEdit = (
  rate:
    PayrollRate,
) => {
  editingRate.value =
    rate

  formModalOpen.value =
    true
}

const closeForm = () => {
  formModalOpen.value =
    false

  editingRate.value =
    null
}

/* =========================================================
   SAVE
========================================================= */

const handleSave = (
  data:
    PayrollRateFormData,
) => {
  if (
    editingRate.value
  ) {
    const updated =
      updateRate(
        editingRate.value.id,
        data,
      )

    if (!updated) {
      info(
        'Unable to Update Rate',
        'The selected payroll rate could not be updated.',
      )

      return
    }

    closeForm()

    success(
      'Payroll Rate Updated',
      `${updated.rateCode} has been updated successfully.`,
    )

    return
  }

  const created =
    createRate(data)

  if (!created) {
    info(
      'Unable to Create Rate',
      'Please verify the employee and rate information.',
    )

    return
  }

  closeForm()

  success(
    'Payroll Rate Created',
    `${created.rateCode} has been created successfully.`,
  )
}

/* =========================================================
   DETAILS
========================================================= */

const detailsOpen =
  ref(false)

const selectedRate =
  ref<
    PayrollRate |
    null
  >(null)

const handleView = (
  rate:
    PayrollRate,
) => {
  selectedRate.value =
    rate

  detailsOpen.value =
    true
}

const closeDetails = () => {
  detailsOpen.value =
    false

  selectedRate.value =
    null
}

/* =========================================================
   HISTORY
========================================================= */

const historyOpen =
  ref(false)

const historyRate =
  ref<
    PayrollRate |
    null
  >(null)

const handleHistory = (
  rate:
    PayrollRate,
) => {
  historyRate.value =
    rate

  historyOpen.value =
    true
}

const closeHistory = () => {
  historyOpen.value =
    false

  historyRate.value =
    null
}

/* =========================================================
   VIEW EMPLOYEE
========================================================= */

const handleEmployee = (
  rate:
    PayrollRate,
) => {
  router.push(
    `/employees/${rate.employeeId}`,
  )
}

/* =========================================================
   ACTIVATE
========================================================= */

const handleActivate = (
  rate:
    PayrollRate,
) => {
  const updated =
    activateRate(
      rate.id,
    )

  if (!updated) {
    info(
      'Rate Not Found',
      'The selected payroll rate could not be found.',
    )

    return
  }

  success(
    'Rate Activated',
    `${updated.rateCode} is now active.`,
  )
}

/* =========================================================
   DEACTIVATE
========================================================= */

const handleDeactivate = (
  rate:
    PayrollRate,
) => {
  const updated =
    deactivateRate(
      rate.id,
    )

  if (!updated) {
    info(
      'Rate Not Found',
      'The selected payroll rate could not be found.',
    )

    return
  }

  success(
    'Rate Deactivated',
    `${updated.rateCode} has been deactivated.`,
  )
}



/* =========================================================
   BACK
========================================================= */

const handleBack = () => {
  router.push(
    '/payroll',
  )
}
</script>

<template>
  <section class="rates-page">

    <!-- BACK -->

    <button
      type="button"
      class="back-button"
      @click="
        handleBack
      "
    >
      <ArrowLeft :size="15" />

      Back to Payroll
    </button>

    <!-- HEADER -->

    <PageHeader
      title="Payroll Rates"
      description="Manage employee and driver compensation, premium rates, allowances and effective payroll rates."
    >

      <div class="header-actions">

        <AppButton
          variant="secondary"
          :icon="Download"
          @click="
            handleOpenExport
          "
        >
          Export
        </AppButton>

        <AppButton
          :icon="Plus"
          @click="
            handleAdd
          "
        >
          Add Payroll Rate
        </AppButton>

      </div>

    </PageHeader>

    <!-- STATS -->

    <PayrollRateStats
      :stats="
        stats
      "
    />

    <!-- FILTERS -->

    <PayrollRateFilters
      v-model:search="
        search
      "
      v-model:rate-type="
        rateType
      "
      v-model:department="
        department
      "
      v-model:status="
        status
      "
      :rate-types="
        rateTypeOptions
      "
      :departments="
        departmentOptions
      "
      :statuses="
        statusOptions
      "
      @reset="
        resetFilters
      "
    />

    <!-- TABLE -->

    <PayrollRateTable
      :rates="
        paginatedRates
      "
      @view="
        handleView
      "
      @edit="
        handleEdit
      "
      @employee="
        handleEmployee
      "
      @history="
        handleHistory
      "
      @activate="
        handleActivate
      "
      @deactivate="
        handleDeactivate
      "
    />

    <!-- PAGINATION -->

    <div class="table-footer">

      <p>
        Showing

        <strong>
          {{
            showingFrom
          }}–{{
            showingTo
          }}
        </strong>

        of

        <strong>
          {{
            filteredRates.length
          }}
        </strong>

        payroll rate profiles
      </p>

      <AppPagination
        v-model="
          currentPage
        "
        :total-pages="
          totalPages
        "
      />

    </div>

    <!-- ADD / EDIT -->

    <AddEditPayrollRateModal
      :open="
        formModalOpen
      "
      :rate="
        editingRate
      "
      :employees="
        employees
      "
      :rate-types="
        rateTypeOptions
      "
      :pay-bases="
        payBasisOptions
      "
      @close="
        closeForm
      "
      @save="
        handleSave
      "
    />

    <!-- DETAILS -->

    <PayrollRateDetailsModal
      :open="
        detailsOpen
      "
      :rate="
        selectedRate
      "
      @close="
        closeDetails
      "
    />

    <!-- HISTORY -->

  <PayrollRateHistoryModal
    :open="
      historyOpen
    "
    :rate="
      historyRate
    "
    @close="
      closeHistory
    "
  />

  <!-- EXPORT -->

  <PayrollRatesExportModal
    :open="
      exportModalOpen
    "
    @close="
      handleCloseExport
    "
    @export="
      handleConfirmExport
    "
  />

  </section>
</template>

<style scoped>
.rates-page {
  width: 100%;

  max-width: 1660px;

  margin:
    0 auto;
}

.back-button {
  display: inline-flex;

  align-items: center;

  gap: 6px;

  margin-bottom: 10px;

  padding: 0;

  border: 0;

  background:
    transparent;

  color:
    var(--primary);

  font-family:
    inherit;

  font-size: 10px;
  font-weight: 600;

  cursor: pointer;
}

.back-button:hover {
  color:
    var(--primary-dark);
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

  padding:
    13px 3px 0;
}

.table-footer p {
  margin: 0;

  color:
    var(--text-muted);

  font-size: 10px;
}

.table-footer strong {
  color:
    var(--text-primary);

  font-weight: 650;
}

@media (max-width: 650px) {
  .header-actions {
    width: 100%;

    align-items:
      stretch;

    flex-direction:
      column;
  }

  .table-footer {
    align-items:
      flex-start;

    flex-direction:
      column;
  }
}
</style>