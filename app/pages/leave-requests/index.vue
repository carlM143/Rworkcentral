<script setup lang="ts">
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Download,
  Plus,
  RotateCcw,
  Search,
  XCircle,
  Clock3,
} from 'lucide-vue-next'

import FileLeaveModal from '~/components/leave/FileLeaveModal.vue'

import LeaveRequestDetailsModal from '~/components/leave/LeaveRequestDetailsModal.vue'

import LeaveExportModal from '~/components/leave/LeaveExportModal.vue'

import LeaveRequestsTable from '~/components/leave/LeaveRequestsTable.vue'

import type {
  LeaveRequest,
  LeaveRequestFormData,
} from '~/types/leave'

const router =
  useRouter()

const {
  activeEmployees,
  activeLeaveTypes,

  leaveRequests,

  fileLeaveRequest,
} = useLeaveManagement()

const {
  info,
  success,
} = useToast()

/* =========================================================
   FILTERS
========================================================= */

const search =
  ref('')

const department =
  ref('')

const leaveType =
  ref('')

const status =
  ref('')

const dateFrom =
  ref('')

const dateTo =
  ref('')

/* =========================================================
   FILTER OPTIONS
========================================================= */

const departmentOptions =
  computed(() => {
    return [
      ...new Set(
        leaveRequests.value
          .map(
            request =>
              request.department,
          )
          .filter(Boolean),
      ),
    ].sort()
  })

/* =========================================================
   FILTERED REQUESTS
========================================================= */

const filteredRequests =
  computed(() => {
    const keyword =
      search.value
        .trim()
        .toLowerCase()

    return leaveRequests.value.filter(
      request => {
        const matchesSearch =
          !keyword ||
          request.employeeName
            .toLowerCase()
            .includes(keyword) ||
          request.employeeNumber
            .toLowerCase()
            .includes(keyword) ||
          request.department
            .toLowerCase()
            .includes(keyword) ||
          request.position
            .toLowerCase()
            .includes(keyword) ||
          request.leaveType
            .toLowerCase()
            .includes(keyword) ||
          request.reason
            ?.toLowerCase()
            .includes(keyword)

        const matchesDepartment =
          !department.value ||
          request.department ===
            department.value

        const matchesLeaveType =
          !leaveType.value ||
          request.leaveType ===
            leaveType.value

        const matchesStatus =
          !status.value ||
          request.status ===
            status.value

        const matchesDateFrom =
          !dateFrom.value ||
          request.dateFrom >=
            dateFrom.value

        const matchesDateTo =
          !dateTo.value ||
          request.dateTo <=
            dateTo.value

        return (
          matchesSearch &&
          matchesDepartment &&
          matchesLeaveType &&
          matchesStatus &&
          matchesDateFrom &&
          matchesDateTo
        )
      },
    )
  })

/* =========================================================
   STATS
========================================================= */

const stats =
  computed(() => {
    return {
      total:
        leaveRequests.value.length,

      pending:
        leaveRequests.value.filter(
          request =>
            request.status ===
            'Pending',
        ).length,

      approved:
        leaveRequests.value.filter(
          request =>
            request.status ===
            'Approved',
        ).length,

      rejected:
        leaveRequests.value.filter(
          request =>
            request.status ===
            'Rejected',
        ).length,
    }
  })

/* =========================================================
   PAGINATION
========================================================= */

const currentPage =
  ref(1)

const perPage =
  ref(6)

const totalPages =
  computed(() => {
    return Math.max(
      1,
      Math.ceil(
        filteredRequests.value.length /
          perPage.value,
      ),
    )
  })

const paginatedRequests =
  computed(() => {
    const start =
      (currentPage.value - 1) *
      perPage.value

    return filteredRequests.value.slice(
      start,
      start + perPage.value,
    )
  })

const showingFrom =
  computed(() => {
    if (
      !filteredRequests.value.length
    ) {
      return 0
    }

    return (
      (currentPage.value - 1) *
        perPage.value +
      1
    )
  })

const showingTo =
  computed(() => {
    return Math.min(
      currentPage.value *
        perPage.value,
      filteredRequests.value.length,
    )
  })

watch(
  [
    search,
    department,
    leaveType,
    status,
    dateFrom,
    dateTo,
  ],
  () => {
    currentPage.value =
      1
  },
)

watch(
  totalPages,
  value => {
    if (
      currentPage.value >
      value
    ) {
      currentPage.value =
        value
    }
  },
)

/* =========================================================
   RESET
========================================================= */

const resetFilters = () => {
  search.value =
    ''

  department.value =
    ''

  leaveType.value =
    ''

  status.value =
    ''

  dateFrom.value =
    ''

  dateTo.value =
    ''

  currentPage.value =
    1
}

/* =========================================================
   FILE LEAVE
========================================================= */

const fileLeaveOpen =
  ref(false)

const handleFileLeave = () => {
  fileLeaveOpen.value =
    true
}

const closeFileLeave = () => {
  fileLeaveOpen.value =
    false
}

const handleSaveLeave = (
  data:
    LeaveRequestFormData,
) => {
  const request =
    fileLeaveRequest(
      data,
    )

  if (!request) {
    info(
      'Unable to File Leave',
      'The selected employee could not be found.',
    )

    return
  }

  closeFileLeave()

  currentPage.value =
    1

  success(
    'Leave Request Filed',
    `${request.employeeName}'s ${request.leaveType} request has been submitted for approval.`,
  )
}

/* =========================================================
   DETAILS
========================================================= */

const detailsOpen =
  ref(false)

const selectedRequest =
  ref<
    LeaveRequest |
    null
  >(null)

const handleViewRequest = (
  request:
    LeaveRequest,
) => {
  selectedRequest.value =
    request

  detailsOpen.value =
    true
}

const closeDetails = () => {
  detailsOpen.value =
    false

  selectedRequest.value =
    null
}

/* =========================================================
   EMPLOYEE
========================================================= */

const handleEmployee = (
  request:
    LeaveRequest,
) => {
  closeDetails()

  router.push(
    `/employees/${request.employeeId}`,
  )
}

/* =========================================================
   APPROVAL
========================================================= */

const handleReview = (
  request:
    LeaveRequest,
) => {
  closeDetails()

  router.push({
    path:
      '/approvals/leaves',

    query: {
      request:
        request.id,
    },
  })
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
    `${filteredRequests.value.length} filtered leave request(s) are ready for export. File generation will be connected during backend integration.`,
  )
}

/* =========================================================
   BACK
========================================================= */

const handleBack = () => {
  router.push(
    '/leave-management',
  )
}
</script>

<template>
  <section class="leave-request-page">

    <!-- =====================================================
         BACK
    ====================================================== -->

    <button
      type="button"
      class="back-button"
      @click="handleBack"
    >
      <ArrowLeft :size="15" />

      Back to Leave Management
    </button>

    <!-- =====================================================
         HEADER
    ====================================================== -->

    <PageHeader
      title="Leave Requests"
      description="Review and manage employee leave requests, requested dates, leave types and approval status."
    >

      <div class="header-actions">

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

      </div>

    </PageHeader>

    <!-- =====================================================
         STATS
    ====================================================== -->

    <div class="stats-grid">

      <StatCard
        label="Total Requests"
        :value="stats.total"
        description="All employee leave requests"
        :icon="CalendarDays"
        tone="blue"
      />

      <StatCard
        label="Pending Requests"
        :value="stats.pending"
        description="Waiting for review and approval"
        :icon="Clock3"
        tone="orange"
      />

      <StatCard
        label="Approved"
        :value="stats.approved"
        description="Approved employee leave requests"
        :icon="CheckCircle2"
        tone="green"
      />

      <StatCard
        label="Rejected"
        :value="stats.rejected"
        description="Rejected employee leave requests"
        :icon="XCircle"
        tone="purple"
      />

    </div>

    <!-- =====================================================
         FILTERS
    ====================================================== -->

    <article class="filter-card">

      <div class="filter-main-row">

        <!-- SEARCH -->

        <label class="search-field">

          <Search
            :size="16"
            class="search-icon"
          />

          <input
            v-model="search"
            type="text"
            placeholder="Search employee, ID, department or reason..."
          >

        </label>

        <!-- DEPARTMENT -->

        <select
          v-model="department"
          class="filter-select"
        >
          <option value="">
            All Departments
          </option>

          <option
            v-for="item in departmentOptions"
            :key="item"
            :value="item"
          >
            {{ item }}
          </option>
        </select>

        <!-- LEAVE TYPE -->

        <select
          v-model="leaveType"
          class="filter-select"
        >
          <option value="">
            All Leave Types
          </option>

          <option
            v-for="item in activeLeaveTypes"
            :key="item"
            :value="item"
          >
            {{ item }}
          </option>
        </select>

        <!-- STATUS -->

        <select
          v-model="status"
          class="filter-select"
        >
          <option value="">
            All Status
          </option>

          <option value="Pending">
            Pending
          </option>

          <option value="Approved">
            Approved
          </option>

          <option value="Rejected">
            Rejected
          </option>
        </select>

      </div>

      <div class="filter-date-row">

        <!-- DATE FROM -->

        <label class="date-field">

          <span>
            Date From
          </span>

          <div>
            <CalendarDays :size="14" />

            <input
              v-model="dateFrom"
              type="date"
            >
          </div>

        </label>

        <!-- DATE TO -->

        <label class="date-field">

          <span>
            Date To
          </span>

          <div>
            <CalendarDays :size="14" />

            <input
              v-model="dateTo"
              type="date"
            >
          </div>

        </label>

        <!-- RESET -->

        <button
          type="button"
          class="reset-button"
          @click="resetFilters"
        >
          <RotateCcw :size="14" />

          Reset Filters
        </button>

      </div>

    </article>

    <!-- =====================================================
         TABLE
    ====================================================== -->

    <LeaveRequestsTable
      :requests="paginatedRequests"
      @view="handleViewRequest"
    />

    <!-- =====================================================
         FOOTER / PAGINATION
    ====================================================== -->

    <div class="table-footer">

      <p>
        Showing

        <strong>
          {{ showingFrom }}–{{ showingTo }}
        </strong>

        of

        <strong>
          {{ filteredRequests.length }}
        </strong>

        leave requests
      </p>

      <AppPagination
        v-model="currentPage"
        :total-pages="totalPages"
      />

    </div>

    <!-- =====================================================
         FILE LEAVE MODAL
    ====================================================== -->

    <FileLeaveModal
      :open="fileLeaveOpen"
      :employees="activeEmployees"
      :leave-types="activeLeaveTypes"
      @close="closeFileLeave"
      @save="handleSaveLeave"
    />

    <!-- =====================================================
         DETAILS
    ====================================================== -->

    <LeaveRequestDetailsModal
      :open="detailsOpen"
      :request="selectedRequest"
      @close="closeDetails"
      @employee="handleEmployee"
      @review="handleReview"
    />

    <!-- =====================================================
         EXPORT
    ====================================================== -->

    <LeaveExportModal
      :open="exportOpen"
      :record-count="filteredRequests.length"
      :pending-count="
        filteredRequests.filter(
          request =>
            request.status === 'Pending',
        ).length
      "
      :approved-count="
        filteredRequests.filter(
          request =>
            request.status === 'Approved',
        ).length
      "
      :rejected-count="
        filteredRequests.filter(
          request =>
            request.status === 'Rejected',
        ).length
      "
      @close="
        exportOpen = false
      "
      @export="handleExportSubmit"
    />

  </section>
</template>

<style scoped>
.leave-request-page {
  width: 100%;
  max-width: 1660px;

  margin: 0 auto;
}

/* =========================================================
   BACK
========================================================= */

.back-button {
  display: inline-flex;

  align-items: center;

  gap: 6px;

  margin-bottom: 10px;

  padding: 0;

  border: 0;

  background: transparent;

  color: var(--primary);

  font-family: inherit;

  font-size: 10px;
  font-weight: 600;

  cursor: pointer;
}

.back-button:hover {
  color: var(--primary-dark);
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
   STATS
========================================================= */

.stats-grid {
  display: grid;

  grid-template-columns:
    repeat(
      4,
      minmax(0, 1fr)
    );

  gap: 12px;

  margin-bottom: 14px;
}

/* =========================================================
   FILTER
========================================================= */

.filter-card {
  margin-bottom: 14px;

  padding: 10px;

  border:
    1px solid var(--border);

  border-radius: 11px;

  background:
    var(--bg-card);

  box-shadow:
    var(--shadow);
}

.filter-main-row {
  display: grid;

  grid-template-columns:
    minmax(300px, 1fr)
    200px
    200px
    170px;

  gap: 8px;
}

.search-field {
  position: relative;

  display: flex;

  height: 40px;

  align-items: center;
}

.search-icon {
  position: absolute;

  left: 11px;

  color:
    var(--text-muted);

  pointer-events: none;
}

.search-field input,
.filter-select {
  width: 100%;
  height: 40px;

  border:
    1px solid var(--border);

  border-radius: 8px;

  outline: 0;

  background:
    var(--bg-card-soft);

  color:
    var(--text-primary);

  font-family: inherit;

  font-size: 9px;
}

.search-field input {
  padding:
    0 11px 0 35px;
}

.filter-select {
  padding:
    0 10px;
}

.search-field input:focus,
.filter-select:focus {
  border-color:
    var(--primary);
}

/* =========================================================
   DATE ROW
========================================================= */

.filter-date-row {
  display: flex;

  align-items: flex-end;

  gap: 8px;

  margin-top: 8px;
}

.date-field {
  display: flex;

  width: 185px;

  flex-direction: column;

  gap: 3px;
}

.date-field > span {
  padding-left: 8px;

  color:
    var(--text-muted);

  font-size: 7px;
}

.date-field > div {
  position: relative;

  display: flex;

  height: 40px;

  align-items: center;
}

.date-field svg {
  position: absolute;

  left: 10px;

  color:
    var(--text-muted);

  pointer-events: none;
}

.date-field input {
  width: 100%;
  height: 40px;

  padding:
    0 9px 0 32px;

  border:
    1px solid var(--border);

  border-radius: 8px;

  outline: 0;

  background:
    var(--bg-card-soft);

  color:
    var(--text-primary);

  font-family: inherit;

  font-size: 9px;
}

.date-field input:focus {
  border-color:
    var(--primary);
}

.reset-button {
  display: inline-flex;

  height: 40px;

  align-items: center;
  justify-content: center;

  gap: 7px;

  padding:
    0 14px;

  border:
    1px solid var(--border);

  border-radius: 8px;

  background:
    var(--bg-card);

  color:
    var(--text-primary);

  font-family: inherit;

  font-size: 9px;
  font-weight: 600;

  cursor: pointer;
}

.reset-button:hover {
  background:
    var(--bg-card-soft);
}

/* =========================================================
   TABLE FOOTER
========================================================= */

.table-footer {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 20px;

  padding:
    13px 3px 0;
}

.table-footer p {
  margin: 0;

  color:
    var(--text-muted);

  font-size: 10px;
}

.table-footer strong {
  color:
    var(--text-primary);

  font-weight: 650;
}

/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 1200px) {
  .filter-main-row {
    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );
  }
}

@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );
  }
}

@media (max-width: 650px) {
  .header-actions {
    width: 100%;

    align-items: stretch;

    flex-direction: column;
  }

  .stats-grid,
  .filter-main-row {
    grid-template-columns:
      1fr;
  }

  .filter-date-row {
    align-items: stretch;

    flex-direction: column;
  }

  .date-field,
  .reset-button {
    width: 100%;
  }

  .table-footer {
    align-items:
      flex-start;

    flex-direction:
      column;
  }
}
</style>