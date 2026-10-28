<script setup lang="ts">
import {
  Download,
  Plus,
} from 'lucide-vue-next'

const {
  leaveBalances,

  stats,

  employeesOnLeave,
  pendingRequests,

  recentRequests,
} = useLeaveManagement()

const {
  info,
} = useToast()

/* =========================================================
   ACTIONS
========================================================= */

const handleExport = () => {
  info(
    'Export Leave Records',
    'Leave export will be connected later.',
  )
}

const handleFileLeave = () => {
  info(
    'File Leave',
    'Leave filing form will be implemented in the Filed Leaves module.',
  )
}

const handleBalances = () => {
  info(
    'Leave Balances',
    'Employee leave balances will be implemented next.',
  )
}

const handleCalendar = () => {
  return navigateTo('/admin/holiday-leave')
}
</script>

<template>
  <section class="leave-management-page">

    <!-- HEADER -->
    <PageHeader
      title="Leave Management"
      description="Monitor leave requests, approvals, employee leave balances and employees currently on leave."
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
        @click="handleFileLeave"
      >
        File Leave
      </AppButton>
    </PageHeader>

    <!-- STATS -->
    <LeaveStats
      :stats="stats"
    />

    <!-- MAIN -->
    <div class="leave-layout">

      <!-- LEFT -->
      <div class="leave-main">

        <LeaveRequestsTable
          :requests="recentRequests"
        />

        <LeaveBalanceSummary
          :balances="leaveBalances"
        />

      </div>

      <!-- RIGHT -->
      <LeaveSidePanel
        :pending-requests="pendingRequests"
        :employees-on-leave="employeesOnLeave"
        @file-leave="handleFileLeave"
        @balances="handleBalances"
        @calendar="handleCalendar"
      />

    </div>

  </section>
</template>

<style scoped>
.leave-management-page {
  width: 100%;
  max-width: 1660px;

  margin: 0 auto;
}

.leave-layout {
  display: grid;

  grid-template-columns:
    minmax(0, 1fr)
    300px;

  gap: 12px;
}

.leave-main {
  display: flex;
  min-width: 0;

  flex-direction: column;

  gap: 12px;
}

@media (max-width: 1100px) {
  .leave-layout {
    grid-template-columns: 1fr;
  }
}
</style>
