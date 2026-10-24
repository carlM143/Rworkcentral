<script setup lang="ts">
import {
  Download,
  FileSpreadsheet,
  HeartPulse,
  Printer,
} from 'lucide-vue-next'

import PhilhealthReportStats from '~/components/admin/reports/philhealth/PhilhealthReportStats.vue'
import PhilhealthReportFilters from '~/components/admin/reports/philhealth/PhilhealthReportFilters.vue'
import PhilhealthReportTable from '~/components/admin/reports/philhealth/PhilhealthReportTable.vue'

const {
  search,
  month,
  year,
  department,
  status,

  currentPage,

  filteredRecords,
  paginatedRecords,

  stats,
  totals,

  totalPages,
  showingFrom,
  showingTo,

  monthOptions,
  yearOptions,
  departmentOptions,
  statusOptions,

  resetFilters,
} = usePhilhealthReport()

const {
  info,
} = useToast()

const handleGenerate = () => {
  info(
    'PhilHealth Report Generated',
    `PhilHealth contribution preview for ${month.value} ${year.value} is ready.`,
  )
}

const handleExcel = () => {
  info(
    'Export PhilHealth Report',
    'PhilHealth Excel export functionality will be connected later.',
  )
}

const handlePdf = () => {
  info(
    'Export PhilHealth Report',
    'PhilHealth PDF export functionality will be connected later.',
  )
}

const handlePrint = () => {
  info(
    'Print PhilHealth Report',
    'Print-ready PhilHealth contribution report will be connected later.',
  )
}
</script>

<template>
  <section class="philhealth-report-page">

    <!-- HEADER -->

    <PageHeader
      title="PhilHealth Contribution Report"
      description="Review employee and employer PhilHealth premium contributions, contribution basis and monthly remittance status."
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

      <div class="context-icon">

        <HeartPulse
          :size="19"
        />

      </div>

      <div class="context-item">

        <span>
          CONTRIBUTION PERIOD
        </span>

        <strong>
          {{ month }} {{ year }}
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
          PhilHealth Contribution Summary
        </strong>

      </div>

      <div class="context-status">

        <span class="status-dot" />

        Generated Preview

      </div>

    </div>

    <!-- STATS -->

    <PhilhealthReportStats
      :stats="stats"
    />

    <!-- FILTERS -->

    <PhilhealthReportFilters
      v-model:search="search"
      v-model:month="month"
      v-model:year="year"
      v-model:department="department"
      v-model:status="status"
      :months="monthOptions"
      :years="yearOptions"
      :departments="departmentOptions"
      :statuses="statusOptions"
      @reset="resetFilters"
      @generate="handleGenerate"
    />

    <!-- TABLE -->

    <PhilhealthReportTable
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

        PhilHealth contribution records
      </p>

      <AppPagination
        v-model="currentPage"
        :total-pages="totalPages"
      />

    </div>

  </section>
</template>

<style scoped>
.philhealth-report-page {
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

.context-icon {
  display: flex;

  width: 37px;
  height: 37px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 9px;

  background:
    var(--red-soft);

  color:
    var(--red);
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

    flex-direction: column;
  }
}
</style>