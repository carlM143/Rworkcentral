<script setup lang="ts">
import {
  Download,
  FileSpreadsheet,
  Gift,
  Printer,
} from 'lucide-vue-next'

import ThirteenthMonthStats from '~/components/reports/thirteenth-month/ThirteenthMonthStats.vue'
import ThirteenthMonthFilters from '~/components/reports/thirteenth-month/ThirteenthMonthFilters.vue'
import ThirteenthMonthTable from '~/components/reports/thirteenth-month/ThirteenthMonthTable.vue'

const {
  search,
  year,
  department,
  employmentType,
  status,

  currentPage,

  filteredRecords,
  paginatedRecords,

  stats,
  totals,

  totalPages,
  showingFrom,
  showingTo,

  yearOptions,
  departmentOptions,
  employmentTypeOptions,
  statusOptions,

  resetFilters,
} = useThirteenthMonthPay()

const {
  info,
} = useToast()

const handleGenerate = () => {
  info(
    '13th Month Report Generated',
    `13th month pay preview for ${year.value} is ready.`,
  )
}

const handleExcel = () => {
  info(
    'Export 13th Month Pay',
    'Excel export functionality will be connected later.',
  )
}

const handlePdf = () => {
  info(
    'Export 13th Month Pay',
    'PDF export functionality will be connected later.',
  )
}

const handlePrint = () => {
  info(
    'Print 13th Month Pay',
    'Print-ready report will be connected later.',
  )
}
</script>

<template>
  <section class="thirteenth-month-page">

    <!-- =====================================================
         HEADER
    ====================================================== -->

    <PageHeader
      title="13th Month Pay"
      description="Review annual employee 13th month pay computation, covered basic pay, adjustments, payable balances and release status."
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
          @click="handleExcel"
        >
          Excel
        </AppButton>

        <AppButton
          :icon="Download"
          @click="handlePdf"
        >
          Export PDF
        </AppButton>

      </div>

    </PageHeader>

    <!-- =====================================================
         REPORT CONTEXT
    ====================================================== -->

    <div class="report-context">

      <div class="context-icon">

        <Gift
          :size="19"
        />

      </div>

      <div class="context-item">

        <span>
          COVERAGE YEAR
        </span>

        <strong>
          {{ year }}
        </strong>

      </div>

      <div class="context-divider" />

      <div class="context-item">

        <span>
          EMPLOYEES INCLUDED
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
          13th Month Pay Summary
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

    <ThirteenthMonthStats
      :stats="stats"
    />

    <!-- =====================================================
         FILTERS
    ====================================================== -->

    <ThirteenthMonthFilters
      v-model:search="search"
      v-model:year="year"
      v-model:department="department"
      v-model:employment-type="employmentType"
      v-model:status="status"
      :years="yearOptions"
      :departments="departmentOptions"
      :employment-types="employmentTypeOptions"
      :statuses="statusOptions"
      @reset="resetFilters"
      @generate="handleGenerate"
    />

    <!-- =====================================================
         TABLE
    ====================================================== -->

    <ThirteenthMonthTable
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

        employee records
      </p>

      <AppPagination
        v-model="currentPage"
        :total-pages="totalPages"
      />

    </div>

  </section>
</template>

<style scoped>
.thirteenth-month-page {
  width: 100%;

  max-width: 1680px;

  margin:
    0 auto;
}

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

.context-icon {
  display: flex;

  width: 37px;
  height: 37px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 9px;

  background:
    var(--orange-soft);

  color:
    var(--orange);
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

  border-radius: 20px;

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

  border-radius: 50%;

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

    flex-direction:
      column;
  }
}
</style>