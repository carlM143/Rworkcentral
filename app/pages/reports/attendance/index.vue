<script setup lang="ts">
import {
  Download,
  FileSpreadsheet,
} from 'lucide-vue-next'

import AttendanceReportStats from '~/components/reports/attendance/AttendanceReportStats.vue'
import AttendanceReportFilters from '~/components/reports/attendance/AttendanceReportFilters.vue'
import AttendanceReportTable from '~/components/reports/attendance/AttendanceReportTable.vue'

const {
  search,
  department,
  employmentType,
  status,
  dateFrom,
  dateTo,

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

  resetFilters,
} = useAttendanceReport()

const {
  info,
} = useToast()

const formatPeriod = (
  from: string,
  to: string,
) => {
  const formatter =
    new Intl.DateTimeFormat(
      'en-US',
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      },
    )

  const fromDate =
    new Date(
      `${from}T00:00:00`,
    )

  const toDate =
    new Date(
      `${to}T00:00:00`,
    )

  return `${formatter.format(
    fromDate,
  )} - ${formatter.format(
    toDate,
  )}`
}

const handleGenerate = () => {
  info(
    'Attendance Report Generated',
    `Report period: ${formatPeriod(
      dateFrom.value,
      dateTo.value,
    )}`,
  )
}

const handleExport = () => {
  info(
    'Export Attendance Report',
    'Excel/PDF attendance export functionality will be connected later.',
  )
}
</script>

<template>
  <section class="attendance-report-page">

    <!-- =====================================================
         HEADER
    ====================================================== -->

    <PageHeader
      title="Attendance Report"
      description="Review employee attendance, absences, late occurrences, undertime, leave, overtime and total worked hours for a selected reporting period."
    >

      <div class="header-actions">

        <AppButton
          variant="secondary"
          :icon="FileSpreadsheet"
          @click="handleExport"
        >
          Export Excel
        </AppButton>

        <AppButton
          :icon="Download"
          @click="handleExport"
        >
          Export Report
        </AppButton>

      </div>

    </PageHeader>

    <!-- =====================================================
         REPORT PERIOD
    ====================================================== -->

    <div class="report-context">

      <div class="context-item">

        <span>
          REPORT PERIOD
        </span>

        <strong>
          {{
            formatPeriod(
              dateFrom,
              dateTo,
            )
          }}
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
          Attendance Summary
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

    <AttendanceReportStats
      :stats="stats"
    />

    <!-- =====================================================
         FILTERS
    ====================================================== -->

    <AttendanceReportFilters
      v-model:search="search"
      v-model:department="department"
      v-model:employment-type="employmentType"
      v-model:status="status"
      v-model:date-from="dateFrom"
      v-model:date-to="dateTo"
      :departments="departmentOptions"
      :employment-types="employmentTypeOptions"
      :statuses="statusOptions"
      @reset="resetFilters"
      @generate="handleGenerate"
    />

    <!-- =====================================================
         TABLE
    ====================================================== -->

    <AttendanceReportTable
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

        employees
      </p>

      <AppPagination
        v-model="currentPage"
        :total-pages="totalPages"
      />

    </div>

  </section>
</template>

<style scoped>
.attendance-report-page {
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

/* ================================================
   REPORT CONTEXT
================================================ */

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

/* ================================================
   FOOTER
================================================ */

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