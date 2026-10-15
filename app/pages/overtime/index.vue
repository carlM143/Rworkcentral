<script setup lang="ts">
import {
  Download,
  Plus,
} from 'lucide-vue-next'

const {
  stats,

  pendingRequests,
  todayOvertime,

  recentRequests,

  departmentSummary,
} = useOvertimeManagement()

const router =
  useRouter()

const {
  info,
} = useToast()

const handleExport = () => {
  info(
    'Export Overtime',
    'Overtime export will be connected later.',
  )
}

const handleFileOvertime = () => {
  router.push(
    '/ot-requests',
  )
}

const handleApproved = () => {
  router.push(
    '/approved-overtime',
  )
}

const handleHistory = () => {
  router.push(
    '/overtime-history',
  )
}
</script>

<template>
  <section class="overtime-page">

    <!-- HEADER -->
    <PageHeader
      title="Overtime"
      description="Monitor overtime requests, approvals, approved hours and employee overtime activity."
    >

      <AppButton
        variant="secondary"
        :icon="Download"
        @click="handleExport"
      >
        Export
      </AppButton>

      <AppButton
        :icon="Plus"
        @click="handleFileOvertime"
      >
        File Overtime
      </AppButton>

    </PageHeader>

    <!-- STATS -->
    <OvertimeStats
      :stats="stats"
    />

    <!-- MAIN -->
    <div class="overtime-layout">

      <!-- LEFT -->
      <div class="overtime-main">

        <OvertimeRequestsTable
          :requests="recentRequests"
        />

        <OvertimeDepartmentSummary
          :departments="departmentSummary"
        />

      </div>

      <!-- RIGHT -->
      <OvertimeSidePanel
        :pending-requests="pendingRequests"
        :today-overtime="todayOvertime"
        @file-overtime="handleFileOvertime"
        @approved="handleApproved"
        @history="handleHistory"
      />

    </div>

  </section>
</template>

<style scoped>
.overtime-page {
  width: 100%;

  max-width: 1660px;

  margin: 0 auto;
}

.overtime-layout {
  display: grid;

  grid-template-columns:
    minmax(0, 1fr)
    300px;

  gap: 12px;
}

.overtime-main {
  display: flex;

  min-width: 0;

  flex-direction: column;

  gap: 12px;
}

@media (max-width: 1100px) {
  .overtime-layout {
    grid-template-columns: 1fr;
  }
}
</style>