<script setup lang="ts">
import {
  ArrowLeft,
  Download,
  FileText,
} from 'lucide-vue-next'

import LeaveCalendarStats from '~/components/leave/calendar/LeaveCalendarStats.vue'
import LeaveCalendarFilters from '~/components/leave/calendar/LeaveCalendarFilters.vue'
import LeaveCalendarGrid from '~/components/leave/calendar/LeaveCalendarGrid.vue'

const router =
  useRouter()

const {
  search,
  department,
  leaveType,
  status,

  monthLabel,
  calendarDays,

  stats,

  departmentOptions,
  leaveTypeOptions,
  statusOptions,

  previousMonth,
  nextMonth,
  goToday,

  resetFilters,
} = useLeaveCalendar()

const {
  info,
} = useToast()

const handleBack = () => {
  router.push(
    '/leave-management',
  )
}

const handleExport = () => {
  info(
    'Export Leave Calendar',
    'Leave calendar export functionality will be connected later.',
  )
}

const handleFiledLeaves = () => {
  router.push(
    '/filed-leaves',
  )
}
</script>

<template>
  <section class="leave-calendar-page">

    <!-- BACK -->

    <button
      type="button"
      class="back-button"
      @click="
        handleBack
      "
    >

      <ArrowLeft
        :size="16"
      />

      Back to Leave Management

    </button>

    <!-- HEADER -->

    <PageHeader
      title="Leave Calendar"
      description="View approved and pending employee leaves by date, department and leave type."
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

        <AppButton
          :icon="FileText"
          @click="
            handleFiledLeaves
          "
        >
          View Filed Leaves
        </AppButton>

      </div>

    </PageHeader>

    <!-- STATS -->

    <LeaveCalendarStats
      :stats="
        stats
      "
    />

    <!-- FILTERS -->

    <LeaveCalendarFilters
      v-model:search="
        search
      "
      v-model:department="
        department
      "
      v-model:leave-type="
        leaveType
      "
      v-model:status="
        status
      "
      :departments="
        departmentOptions
      "
      :leave-types="
        leaveTypeOptions
      "
      :statuses="
        statusOptions
      "
      @reset="
        resetFilters
      "
    />

    <!-- CALENDAR -->

    <LeaveCalendarGrid
      :month-label="
        monthLabel
      "
      :days="
        calendarDays
      "
      @previous="
        previousMonth
      "
      @next="
        nextMonth
      "
      @today="
        goToday
      "
    />

  </section>
</template>

<style scoped>
.leave-calendar-page {
  width: 100%;

  max-width: 1660px;

  margin:
    0 auto;
}

.back-button {
  display: inline-flex;

  align-items: center;

  gap: 6px;

  margin-bottom: 11px;

  padding: 0;

  border: 0;

  background:
    transparent;

  color:
    var(--primary);

  font-size: 11px;
  font-weight: 600;

  cursor: pointer;
}

.back-button:hover {
  color:
    var(--primary-dark);
}

.header-actions {
  display: flex;

  align-items: center;

  gap: 8px;
}

@media (max-width: 650px) {
  .header-actions {
    width: 100%;

    align-items:
      stretch;

    flex-direction:
      column;
  }
}
</style>