<script setup lang="ts">
import { exportReport } from '~/utils/reportExport'
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

const { error: showError } = useToast()
const exporting = ref(false)
const archive = useReportArchive()
const { download } = useReportActions({ title: 'Report History', category: 'Payroll', rows: ref<object[]>([]), period: () => '' })
const handleBrowseReports = () => router.push('/admin/reports/center')
const handleOpenModule = (module: ReportModule) => router.push(module.route)
const handleQuickReport = (route: string) => router.push(route)
const handleDownload = (report: RecentReport) => {
  const saved = archive.value.find(item => item.id === report.id)
  if (saved) return download(saved.format, saved.document)
}
const handleExportAnalytics = async () => {
  if (exporting.value) return
  exporting.value = true
  try {
    await exportReport({ title: 'Reports Analytics', period: 'Current sample reporting periods',
      rows: analytics.value.map(item => ({ metric: item.label, value: item.value, period: item.description })),
      generatedAt: new Date().toISOString(), sample: true }, 'Excel')
  } catch (error) { showError('Export failed', error instanceof Error ? error.message : 'Please try again.') }
  finally { exporting.value = false }
}
</script>

<template>
  <section class="reports-page">
    <ReportDataNotice />

    <!-- HEADER -->
    <PageHeader
      title="Reports & Analytics"
      description="Access HRIS reports, workforce analytics, payroll summaries, billing reports and statutory records."
    >

      <AppButton
        variant="secondary"
        :icon="Download"
        :disabled="exporting" @click="handleExportAnalytics"
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
