<script setup lang="ts">
import {
  Download,
  FileSpreadsheet,
  Printer,
} from 'lucide-vue-next'

import PayrollReportStats from '~/components/admin/reports/payroll/PayrollReportStats.vue'
import PayrollReportFilters from '~/components/admin/reports/payroll/PayrollReportFilters.vue'
import PayrollReportTable from '~/components/admin/reports/payroll/PayrollReportTable.vue'

const {
  search,
  department,
  employmentType,
  status,
  period,

  currentPage,

  filteredRecords,
  paginatedRecords,

  stats,
  totals,

  totalPages,
  showingFrom,
  showingTo,

  departmentOptions,
  employmentTypeOptions,
  statusOptions,
  periodOptions,

  resetFilters,
} = usePayrollReport()

const {
  info,
} = useToast()

const handleGenerate = () => {
  info(
    'Payroll Report Generated',
    `Payroll report preview for ${period.value} is ready.`,
  )
}

const handleExportExcel = () => {
  info(
    'Export Payroll Report',
    'Excel payroll report export will be connected later.',
  )
}

const handleExportPdf = () => {
  info(
    'Export Payroll Report',
    'PDF payroll report export will be connected later.',
  )
}

const handlePrint = () => {
  info(
    'Print Payroll Report',
    'Print-ready payroll report will be connected later.',
  )
}
</script>

<template>
  <section class="payroll-report-page">

    <!-- =====================================================
         HEADER
    ====================================================== -->

    <PageHeader
      title="Payroll Report"
      description="Review employee earnings, statutory contributions, deductions and net payroll for a selected pay period."
    >

      <div class="header-actions">

        <AppButton
          variant="secondary"
          :icon="Printer"
          @click="handlePrint"
        >
          Print
        </AppButton>

        <AppButton
          variant="secondary"
          :icon="FileSpreadsheet"
          @click="handleExportExcel"
        >
          Excel
        </AppButton>

        <AppButton
          :icon="Download"
          @click="handleExportPdf"
        >
          Export PDF
        </AppButton>

      </div>

    </PageHeader>

    <!-- =====================================================
         REPORT CONTEXT
    ====================================================== -->

    <div class="report-context">

      <div class="context-item">

        <span>
          PAY PERIOD
        </span>

        <strong>
          {{ period }}
        </strong>

      </div>

      <div class="context-divider" />

      <div class="context-item">

        <span>
          EMPLOYEES
        </span>

        <strong>
          {{ filteredRecords.length }}
        </strong>

      </div>

      <div class="context-divider" />

      <div class="context-item">

        <span>
          REPORT TYPE
        </span>

        <strong>
          Payroll Summary
        </strong>

      </div>

      <div class="context-status">

        <span class="status-dot" />

        Generated Preview

      </div>

    </div>

    <!-- =====================================================
         STATS
    ====================================================== -->

    <PayrollReportStats
      :stats="stats"
    />

    <!-- =====================================================
         FILTERS
    ====================================================== -->

    <PayrollReportFilters
      v-model:search="search"
      v-model:period="period"
      v-model:department="department"
      v-model:employment-type="employmentType"
      v-model:status="status"
      :periods="periodOptions"
      :departments="departmentOptions"
      :employment-types="employmentTypeOptions"
      :statuses="statusOptions"
      @reset="resetFilters"
      @generate="handleGenerate"
    />

    <!-- =====================================================
         TABLE
    ====================================================== -->

    <PayrollReportTable
      :records="paginatedRecords"
      :totals="totals"
    />

    <!-- =====================================================
         PAGINATION
    ====================================================== -->

    <div class="table-footer">

      <p>
        Showing

        <strong>
          {{ showingFrom }}–{{ showingTo }}
        </strong>

        of

        <strong>
          {{ filteredRecords.length }}
        </strong>

        payroll records
      </p>

      <AppPagination
        v-model="currentPage"
        :total-pages="totalPages"
      />

    </div>

  </section>
</template>

<style scoped>
.payroll-report-page {
  width: 100%;

  max-width: 1680px;

  margin:
    0 auto;
}

/* HEADER */

.header-actions {
  display: flex;

  align-items: center;

  gap: 8px;
}

/* REPORT CONTEXT */

.report-context {
  display: flex;

  align-items: center;

  gap: 18px;

  margin-bottom: 14px;

  padding:
    12px 15px;

  border:
    1px solid var(--border);

  border-radius: 10px;

  background:
    var(--bg-card);

  box-shadow:
    var(--shadow);
}

.context-item span,
.context-item strong {
  display: block;
}

.context-item span {
  color:
    var(--text-muted);

  font-size: 8px;
  font-weight: 700;

  letter-spacing:
    0.6px;
}

.context-item strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 10.5px;
}

.context-divider {
  width: 1px;
  height: 27px;

  background:
    var(--border);
}

.context-status {
  display: inline-flex;

  align-items: center;

  gap: 6px;

  margin-left: auto;

  padding:
    6px 9px;

  border-radius:
    20px;

  background:
    var(--green-soft);

  color:
    var(--green);

  font-size: 9px;
  font-weight: 650;
}

.status-dot {
  width: 6px;
  height: 6px;

  border-radius:
    50%;

  background:
    currentColor;
}

/* FOOTER */

.table-footer {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 20px;

  padding:
    14px 3px 0;
}

.table-footer p {
  margin: 0;

  color:
    var(--text-muted);

  font-size: 11px;
}

.table-footer strong {
  color:
    var(--text-primary);

  font-weight: 650;
}

@media (max-width: 850px) {
  .report-context {
    align-items:
      flex-start;

    flex-wrap: wrap;
  }

  .context-divider {
    display: none;
  }

  .context-status {
    margin-left: 0;
  }
}

@media (max-width: 650px) {
  .header-actions {
    width: 100%;

    align-items: stretch;

    flex-direction: column;
  }

  .table-footer {
    align-items:
      flex-start;

    flex-direction: column;
  }
}
</style>