<script setup lang="ts">
import {
  Download,
  FileBarChart,
} from 'lucide-vue-next'

import ReportsCenterStats from '~/components/reports/center/ReportsCenterStats.vue'
import ReportsCenterFilters from '~/components/reports/center/ReportsCenterFilters.vue'
import ReportsCenterGrid from '~/components/reports/center/ReportsCenterGrid.vue'

import type {
  ReportCenterItem,
} from '~/types/reportCenter'

const router =
  useRouter()

const {
  search,
  category,
  availability,

  filteredReports,
  featuredReports,

  stats,

  categoryOptions,
  availabilityOptions,

  resetFilters,
} = useReportsCenter()

const {
  info,
} = useToast()

const handleOpenReport = async (
  report:
    ReportCenterItem,
) => {
  if (
    report.route
  ) {
    await router.push(
      report.route,
    )

    return
  }

  info(
    report.title,
    'Detailed report page will be connected later.',
  )
}

const handleExportReport = (
  report:
    ReportCenterItem,
) => {
  info(
    `Export ${report.title}`,
    'Report export functionality will be connected later.',
  )
}

const handleQuickExport = () => {
  info(
    'Quick Export',
    'Bulk report export functionality will be added later.',
  )
}
</script>

<template>
  <section class="reports-center-page">

    <!-- =====================================================
         HEADER
    ====================================================== -->

    <PageHeader
      title="Reports Center"
      description="Access operational, payroll, statutory and employee reports from one centralized reporting hub."
    >

      <div class="header-actions">

        <AppButton
          variant="secondary"
          :icon="Download"
          @click="handleQuickExport"
        >
          Quick Export
        </AppButton>

        <AppButton
          :icon="FileBarChart"
          @click="
            availability =
              'Available'
          "
        >
          Available Reports
        </AppButton>

      </div>

    </PageHeader>

    <!-- =====================================================
         STATS
    ====================================================== -->

    <ReportsCenterStats
      :stats="stats"
    />

    <!-- =====================================================
         FEATURED
    ====================================================== -->

    <div
      v-if="featuredReports.length"
      class="featured-section"
    >

      <div class="section-heading">

        <div>

          <span class="section-kicker">
            QUICK ACCESS
          </span>

          <h2>
            Frequently Used Reports
          </h2>

          <p>
            Open commonly used HR and payroll reports
            directly from the reports center.
          </p>

        </div>

      </div>

      <div class="featured-grid">

        <button
          v-for="
            report in featuredReports
          "
          :key="report.id"
          type="button"
          class="featured-card"
          @click="
            handleOpenReport(
              report,
            )
          "
        >

          <div>

            <strong>
              {{ report.title }}
            </strong>

            <span>
              {{ report.category }}
            </span>

          </div>

          <span class="featured-action">
            Open
          </span>

        </button>

      </div>

    </div>

    <!-- =====================================================
         FILTERS
    ====================================================== -->

    <ReportsCenterFilters
      v-model:search="search"
      v-model:category="category"
      v-model:availability="availability"
      :categories="categoryOptions"
      :availabilities="availabilityOptions"
      @reset="resetFilters"
    />

    <!-- =====================================================
         REPORT GRID
    ====================================================== -->

    <div class="reports-heading">

      <div>

        <h2>
          All Reports
        </h2>

        <p>
          {{
            filteredReports.length
          }}
          report{{
            filteredReports.length === 1
              ? ''
              : 's'
          }}
          found
        </p>

      </div>

    </div>

    <ReportsCenterGrid
      :reports="filteredReports"
      @open="handleOpenReport"
      @export="handleExportReport"
    />

  </section>
</template>

<style scoped>
.reports-center-page {
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

/* FEATURED */

.featured-section {
  margin-bottom: 14px;

  padding: 16px;

  border:
    1px solid var(--border);

  border-radius: 12px;

  background:
    var(--bg-card);

  box-shadow:
    var(--shadow);
}

.section-heading {
  display: flex;

  align-items: flex-start;
  justify-content: space-between;

  gap: 15px;

  margin-bottom: 12px;
}

.section-kicker {
  color:
    var(--primary);

  font-size: 9px;
  font-weight: 700;

  letter-spacing:
    1px;
}

.section-heading h2 {
  margin:
    4px 0 0;

  color:
    var(--text-primary);

  font-size: 14px;
}

.section-heading p {
  margin:
    4px 0 0;

  color:
    var(--text-muted);

  font-size: 10px;
}

.featured-grid {
  display: grid;

  grid-template-columns:
    repeat(
      3,
      minmax(0, 1fr)
    );

  gap: 9px;
}

.featured-card {
  display: flex;

  min-height: 66px;

  align-items: center;
  justify-content: space-between;

  gap: 15px;

  padding:
    11px 12px;

  border:
    1px solid var(--border-soft);

  border-radius: 9px;

  background:
    var(--bg-card-soft);

  color:
    var(--text-primary);

  text-align: left;

  transition:
    border-color 0.18s ease,
    background 0.18s ease,
    transform 0.18s ease;
}

.featured-card:hover {
  transform:
    translateY(-1px);

  border-color:
    color-mix(
      in srgb,
      var(--primary) 28%,
      var(--border)
    );

  background:
    var(--primary-soft);
}

.featured-card strong,
.featured-card span {
  display: block;
}

.featured-card strong {
  font-size: 10.5px;
}

.featured-card div span {
  margin-top: 4px;

  color:
    var(--text-muted);

  font-size: 9px;
}

.featured-action {
  color:
    var(--primary);

  font-size: 9px;
  font-weight: 700;
}

/* REPORTS HEADING */

.reports-heading {
  display: flex;

  align-items: center;
  justify-content: space-between;

  margin:
    4px 0 10px;
}

.reports-heading h2 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 14px;
}

.reports-heading p {
  margin:
    3px 0 0;

  color:
    var(--text-muted);

  font-size: 10px;
}

@media (max-width: 900px) {
  .featured-grid {
    grid-template-columns:
      1fr;
  }
}

@media (max-width: 650px) {
  .header-actions {
    width: 100%;

    align-items: stretch;

    flex-direction: column;
  }
}
</style>