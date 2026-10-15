<script setup lang="ts">
import {
  Download,
  FileSpreadsheet,
  Printer,
} from 'lucide-vue-next'

import BillingReportStats from '~/components/reports/billing/BillingReportStats.vue'
import BillingReportFilters from '~/components/reports/billing/BillingReportFilters.vue'
import BillingReportTable from '~/components/reports/billing/BillingReportTable.vue'

const {
  search,
  client,
  period,
  status,

  currentPage,

  filteredRecords,
  paginatedRecords,

  stats,
  totals,

  totalPages,
  showingFrom,
  showingTo,

  clientOptions,
  periodOptions,
  statusOptions,

  resetFilters,
} = useBillingReport()

const {
  info,
} = useToast()

const handleGenerate = () => {
  info(
    'Billing Report Generated',
    `Billing report preview for ${period.value} is ready.`,
  )
}

const handleExcel = () => {
  info(
    'Export Billing Report',
    'Excel billing export will be connected later.',
  )
}

const handlePdf = () => {
  info(
    'Export Billing Report',
    'PDF billing export will be connected later.',
  )
}

const handlePrint = () => {
  info(
    'Print Billing Report',
    'Print-ready billing report will be connected later.',
  )
}
</script>

<template>
  <section class="billing-report-page">

    <PageHeader
      title="Billing Report"
      description="Review client billing amounts, overtime, allowances, adjustments, deductions, invoice information and net billing for a selected period."
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

    <!-- REPORT CONTEXT -->

    <div class="report-context">

      <div class="context-item">

        <span>
          BILLING PERIOD
        </span>

        <strong>
          {{ period }}
        </strong>

      </div>

      <div class="context-divider" />

      <div class="context-item">

        <span>
          CLIENTS INCLUDED
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
          Client Billing Summary
        </strong>

      </div>

      <div class="context-status">

        <span class="status-dot" />

        Generated Preview

      </div>

    </div>

    <!-- STATS -->

    <BillingReportStats
      :stats="stats"
    />

    <!-- FILTERS -->

    <BillingReportFilters
      v-model:search="search"
      v-model:client="client"
      v-model:period="period"
      v-model:status="status"
      :clients="clientOptions"
      :periods="periodOptions"
      :statuses="statusOptions"
      @reset="resetFilters"
      @generate="handleGenerate"
    />

    <!-- TABLE -->

    <BillingReportTable
      :records="paginatedRecords"
      :totals="totals"
    />

    <!-- PAGINATION -->

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

        billing records
      </p>

      <AppPagination
        v-model="currentPage"
        :total-pages="totalPages"
      />

    </div>

  </section>
</template>

<style scoped>
.billing-report-page {
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

/* PAGINATION */

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