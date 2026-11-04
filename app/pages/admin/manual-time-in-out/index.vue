
<script setup lang="ts">
import {
  ArrowLeft,
  Download,
  Plus,
} from 'lucide-vue-next'

import ManualTimeStats from '~/components/admin/timekeeping/manual-time-in-out/ManualTimeStats.vue'
import ManualTimeFilters from '~/components/admin/timekeeping/manual-time-in-out/ManualTimeFilters.vue'
import ManualTimeTable from '~/components/admin/timekeeping/manual-time-in-out/ManualTimeTable.vue'
import ManualTimeDetailsModal from '~/components/admin/timekeeping/manual-time-in-out/ManualTimeDetailsModal.vue'

import type {
  ManualTimeEntry,
} from '~/types/manualTimeEntry'

definePageMeta({
  layout: 'admin',
})

const router = useRouter()

const {
  search,
  department,
  entryType,
  status,
  dateFrom,
  dateTo,
  currentPage,
  filteredEntries,
  paginatedEntries,
  totalPages,
  showingFrom,
  showingTo,
  stats,
  departments,
  entryTypeOptions,
  statusOptions,
  resetFilters,
  loading,
  error: fetchError,
  fetchEntries,
} = useManualTimeEntries()

onMounted(async () => {
  await fetchEntries()
})

const { info } = useToast()

// =============================================
// VIEW DETAILS
// =============================================

const detailsModalOpen = ref(false)

const selectedEntry = ref<ManualTimeEntry | null>(null)

const handleView = (entry: ManualTimeEntry) => {
  selectedEntry.value = entry
  detailsModalOpen.value = true
}

const closeDetails = () => {
  detailsModalOpen.value = false
  selectedEntry.value = null
}

// =============================================
// ADD NEW ENTRY - SEPARATE PAGE
// =============================================

const handleAdd = () => {
  router.push('/admin/manual-time-in-out/create')
}

const handleEdit = (entry: ManualTimeEntry) => {
  router.push(`/admin/manual-time-in-out/${entry.id}/edit`)
}

// =============================================
// VALIDATE ENTRY
// =============================================

const handleValidate = (_entry: ManualTimeEntry) => {
  info(
    'Already Recorded',
    'Manual attendance is saved directly to Time Logs. Separate validation is not yet available.',
  )
}

// =============================================
// CANCEL ENTRY
// =============================================

const handleCancel = (_entry: ManualTimeEntry) => {
  info(
    'Cancellation Not Available',
    'Cancelling manual attendance requires backend support and an audit trail.',
  )
}

// =============================================
// VIEW EMPLOYEE
// =============================================

const handleEmployee = (entry: ManualTimeEntry) => {
  router.push(`/admin/employees/${entry.employeeId}`)
}

// =============================================
// VIEW TIME LOG
// =============================================

const handleTimeLog = (entry: ManualTimeEntry) => {
  router.push({
    path: '/admin/time-logs',
    query: {
      employee: entry.employeeNumber,
      date: entry.attendanceDate,
    },
  })
}

// =============================================
// EXPORT
// =============================================

const handleExport = () => {
  info(
    'Export Manual Entries',
    'Manual time entry export will be connected later.',
  )
}

// =============================================
// BACK
// =============================================

const handleBack = () => {
  router.push('/admin/time-logs')
}
</script>

<template>
  <section class="manual-time-page">
    <!-- BACK -->

    <button
      type="button"
      class="back-button"
      @click="handleBack"
    >
      <ArrowLeft :size="15" />
      Back to Time Logs
    </button>

    <!-- HEADER -->

    <PageHeader
      title="Manual Time In / Out"
      description="Record and validate employee attendance entries when biometric or automatic time logs are unavailable."
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
          @click="handleAdd"
        >
          Add Manual Entry
        </AppButton>
      </div>
    </PageHeader>
   <!-- API ERROR -->
    <div v-if="fetchError" class="manual-api-error">
      <span>{{ fetchError }}</span>
      <button type="button" @click="fetchEntries">
        Retry
      </button>
    </div>
    <!-- STATISTICS -->
    <ManualTimeStats :stats="stats" />

    <!-- FILTERS -->

    <ManualTimeFilters
      v-model:search="search"
      v-model:department="department"
      v-model:entry-type="entryType"
      v-model:status="status"
      v-model:date-from="dateFrom"
      v-model:date-to="dateTo"
      :departments="departments"
      :entry-type-options="entryTypeOptions"
      :status-options="statusOptions"
      @reset="resetFilters"
    />

    <!-- TABLE LOADING -->

    <div v-if="loading" class="manual-loading">
      Loading manual attendance records...
    </div>

    <!-- TABLE -->

    <ManualTimeTable
      v-else
      :entries="paginatedEntries"
      @view="handleView"
      @edit="handleEdit"
      @validate="handleValidate"
      @employee="handleEmployee"
      @time-log="handleTimeLog"
      @cancel="handleCancel"
    />

    <!-- PAGINATION -->

    <div class="table-footer">
      <p>
        Showing
        <strong>
          {{ showingFrom }}–{{ showingTo }}
        </strong>
        of
        <strong>{{ filteredEntries.length }}</strong>
        manual time entries
      </p>

      <AppPagination
        v-model="currentPage"
        :total-pages="totalPages"
      />
    </div>

    <!-- VIEW DETAILS ONLY -->

    <ManualTimeDetailsModal
      :open="detailsModalOpen"
      :entry="selectedEntry"
      @close="closeDetails"
    />
  </section>
</template>

<style scoped>
.manual-time-page {
  width: 100%;
  max-width: 1660px;
  margin: 0 auto;
}

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
  opacity: 0.8;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 13px 3px 0;
}

.table-footer p {
  margin: 0;
  color: var(--text-muted);
  font-size: 10px;
}

.table-footer strong {
  color: var(--text-primary);
  font-weight: 650;
}

.manual-api-error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 15px;
  padding: 13px 15px;
  border: 1px solid var(--red, #ef4444);
  border-radius: 9px;
  background: var(--red-soft, rgba(239, 68, 68, 0.1));
  color: var(--red, #ef4444);
  font-size: 12px;
}

.manual-api-error button {
  border: none;
  background: transparent;
  color: inherit;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.manual-loading {
  display: flex;
  min-height: 180px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--bg-card);
  color: var(--text-muted);
  font-size: 12px;
}

@media (max-width: 650px) {
  .header-actions {
    width: 100%;
    align-items: stretch;
    flex-direction: column;
  }

  .table-footer {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
