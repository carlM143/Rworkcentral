<script setup lang="ts">
import {
  Download,
  FileText,
} from 'lucide-vue-next'

import type {
  ReportModule,
  RecentReport,
} from '~/types/report'

const {
  reportModules,

  recentReports,

  stats,

  analytics,

  frequentReports,
} = useReportsOverview()

const router =
  useRouter()

const {
  info,
} = useToast()

/* =========================================================
   ACTIONS
========================================================= */

const handleBrowseReports = () => {
  info(
    'Report Library',
    'Select a report category below to continue.',
  )
}

const handleOpenModule = (
  module: ReportModule,
) => {
  router.push(
    module.route,
  )
}

const handleQuickReport = (
  route: string,
) => {
  router.push(
    route,
  )
}

const handleDownload = (
  report: RecentReport,
) => {
  info(
    'Download Report',
    `${report.title} download will be connected to the reporting backend later.`,
  )
}
</script>

<template>
  <section class="reports-page">

    <!-- HEADER -->
    <PageHeader
      title="Reports & Analytics"
      description="Access HRIS reports, workforce analytics, payroll summaries, billing reports and statutory records."
    >

      <AppButton
        variant="secondary"
        :icon="Download"
        @click="
          info(
            'Export Analytics',
            'Analytics export will be connected later.',
          )
        "
      >
        Export
      </AppButton>

      <AppButton
        :icon="FileText"
        @click="handleBrowseReports"
      >
        Browse Reports
      </AppButton>

    </PageHeader>

    <!-- STATS -->
    <ReportStats
      :stats="stats"
    />

    <!-- MAIN -->
    <div class="reports-layout">

      <div class="reports-main">

        <!-- REPORT LIBRARY -->
        <ReportCategoryGrid
          :modules="reportModules"
          @open="handleOpenModule"
        />

        <!-- RECENT -->
        <RecentReportsTable
          :reports="recentReports"
          @download="handleDownload"
        />

      </div>

      <!-- SIDE -->
      <ReportsSidePanel
        :analytics="analytics"
        :frequent-reports="frequentReports"
        @open-report="handleQuickReport"
      />

    </div>

  </section>
</template>

<style scoped>
.reports-page {
  width: 100%;

  max-width: 1660px;

  margin: 0 auto;
}

.reports-layout {
  display: grid;

  grid-template-columns:
    minmax(0, 1fr)
    290px;

  gap: 12px;
}

.reports-main {
  display: flex;

  min-width: 0;

  flex-direction: column;

  gap: 12px;
}

@media (max-width: 1100px) {
  .reports-layout {
    grid-template-columns: 1fr;
  }
}
</style>