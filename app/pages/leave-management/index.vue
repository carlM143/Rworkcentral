<script setup lang="ts">
import {
  Download,
} from 'lucide-vue-next'

import LeaveRecentRequests from '~/components/leave/LeaveRecentRequests.vue'

// import FileLeaveModal from '~/components/leave/FileLeaveModal.vue'

import LeaveExportModal from '~/components/leave/LeaveExportModal.vue'

import type {
  LeaveRequestFormData,
} from '~/types/leave'

const router =
  useRouter()

const {
  leaveRequests,
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
   LEAVE REQUESTS
========================================================= */

const handleViewAllRequests =
  () => {
    router.push(
      '/leave-requests',
    )
  }

/* =========================================================
   QUICK ACTIONS
========================================================= */

const handleBalances = () => {
  router.push(
    '/leave-balances',
  )
}

const handleCalendar = () => {
  router.push(
    '/leave-calendar',
  )
}

/* =========================================================
   EXPORT
========================================================= */

const exportOpen =
  ref(false)

const handleExport = () => {
  exportOpen.value =
    true
}

const approvedCount =
  computed(() => {
    return leaveRequests.value.filter(
      request =>
        request.status ===
        'Approved',
    ).length
  })

const rejectedCount =
  computed(() => {
    return leaveRequests.value.filter(
      request =>
        request.status ===
        'Rejected',
    ).length
  })

const handleExportSubmit = (
  format:
    'Excel' |
    'PDF' |
    'CSV',
) => {
  exportOpen.value =
    false

  info(
    `Export ${format}`,
    `${leaveRequests.value.length} leave record(s) are ready for export. Actual file generation will be connected during backend integration.`,
  )
}
</script>

<template>
  <section class="leave-management-page">

    <!-- =====================================================
         HEADER
    ====================================================== -->

    <PageHeader
      title="Leave Management"
      description="Monitor leave requests, approvals, employee leave balances and employees currently on leave."
    >

      <div class="header-actions">

        <AppButton
          variant="secondary"
          :icon="Download"
          @click="
            handleExport
          "
        >
          Export
        </AppButton>

      </div>

    </PageHeader>

    <!-- =====================================================
         STATS
    ====================================================== -->

    <LeaveStats
      :stats="
        stats
      "
    />

    <!-- =====================================================
         MAIN CONTENT
    ====================================================== -->

    <div class="leave-layout">

      <!-- LEFT -->

      <div class="leave-main">

        <!-- RECENT ONLY -->

        <LeaveRecentRequests
          :requests="
            recentRequests
          "
          @view-all="
            handleViewAllRequests
          "
        />

        <!-- BALANCE SUMMARY -->

        <LeaveBalanceSummary
          :balances="
            leaveBalances
          "
        />

      </div>

      <!-- RIGHT SIDE PANEL -->

      <LeaveSidePanel
        :pending-requests="
          pendingRequests
        "
        :employees-on-leave="
          employeesOnLeave
        "
        @balances="
          handleBalances
        "
        @calendar="
          handleCalendar
        "
      />

    </div>


    <!-- =====================================================
         EXPORT
    ====================================================== -->

    <LeaveExportModal
      :open="
        exportOpen
      "
      :record-count="
        leaveRequests.length
      "
      :pending-count="
        pendingRequests.length
      "
      :approved-count="
        approvedCount
      "
      :rejected-count="
        rejectedCount
      "
      @close="
        exportOpen =
          false
      "
      @export="
        handleExportSubmit
      "
    />

  </section>
</template>

<style scoped>
.leave-management-page {
  width: 100%;

  max-width: 1660px;

  margin:
    0 auto;
}

/* =========================================================
   HEADER
========================================================= */

.header-actions {
  display: flex;

  align-items: center;

  gap: 8px;
}

/* =========================================================
   CONTENT
========================================================= */

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

/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 1100px) {
  .leave-layout {
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