<script setup lang="ts">
import {
  ArrowLeft,
  Download,
  Plus,
} from 'lucide-vue-next'

import ManualTimeStats from '~/components/admin/timekeeping/manual-time-in-out/ManualTimeStats.vue'

import ManualTimeFilters from '~/components/admin/timekeeping/manual-time-in-out/ManualTimeFilters.vue'

import ManualTimeTable from '~/components/admin/timekeeping/manual-time-in-out/ManualTimeTable.vue'

import AddManualTimeModal from '~/components/admin/timekeeping/manual-time-in-out/AddManualTimeModal.vue'

import ManualTimeDetailsModal from '~/components/admin/timekeeping/manual-time-in-out/ManualTimeDetailsModal.vue'

import type {
  ManualTimeEntry,
  ManualTimeEntryFormData,
} from '~/types/manualTimeEntry'

const router =
  useRouter()

const {
  employees,
} = useEmployees()

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

  createEntry,
  updateEntry,
  validateEntry,
  cancelEntry,

  resetFilters,
} = useManualTimeEntries()

const {
  info,
  success,
} = useToast()

/* =========================================================
   ADD / EDIT MODAL
========================================================= */

const formModalOpen =
  ref(false)

const editingEntry =
  ref<
    ManualTimeEntry |
    null
  >(null)

/* =========================================================
   DETAILS MODAL
========================================================= */

const detailsModalOpen =
  ref(false)

const selectedEntry =
  ref<
    ManualTimeEntry |
    null
  >(null)

/* =========================================================
   ADD
========================================================= */

const handleAdd = () => {
  editingEntry.value =
    null

  formModalOpen.value =
    true
}

/* =========================================================
   EDIT
========================================================= */

const handleEdit = (
  entry:
    ManualTimeEntry,
) => {
  editingEntry.value =
    entry

  formModalOpen.value =
    true
}

/* =========================================================
   SAVE
========================================================= */

const handleSave = (
  data:
    ManualTimeEntryFormData,
) => {
  if (
    editingEntry.value
  ) {
    const updated =
      updateEntry(
        editingEntry.value.id,
        data,
      )

    if (!updated) {
      info(
        'Entry Not Found',
        'The selected manual time entry could not be found.',
      )

      return
    }

    formModalOpen.value =
      false

    editingEntry.value =
      null

    success(
      'Manual Entry Updated',
      `${updated.employeeName}'s manual time entry has been updated.`,
    )

    return
  }

  const created =
    createEntry(data)

  if (!created) {
    info(
      'Unable to Save',
      'The selected employee could not be found.',
    )

    return
  }

  formModalOpen.value =
    false

  success(
    'Manual Entry Added',
    `${created.entryNumber} has been submitted for validation.`,
  )
}

/* =========================================================
   CLOSE FORM
========================================================= */

const closeFormModal = () => {
  formModalOpen.value =
    false

  editingEntry.value =
    null
}

/* =========================================================
   DETAILS
========================================================= */

const handleView = (
  entry:
    ManualTimeEntry,
) => {
  selectedEntry.value =
    entry

  detailsModalOpen.value =
    true
}

const closeDetails = () => {
  detailsModalOpen.value =
    false

  selectedEntry.value =
    null
}

/* =========================================================
   VALIDATE
========================================================= */

const handleValidate = (
  entry:
    ManualTimeEntry,
) => {
  const result =
    validateEntry(
      entry.id,
    )

  if (!result) {
    return
  }

  success(
    'Entry Validated',
    `${entry.employeeName}'s ${entry.entryType.toLowerCase()} entry has been validated.`,
  )
}

/* =========================================================
   CANCEL
========================================================= */

const handleCancel = (
  entry:
    ManualTimeEntry,
) => {
  const result =
    cancelEntry(
      entry.id,
    )

  if (!result) {
    return
  }

  success(
    'Entry Cancelled',
    `${entry.entryNumber} has been cancelled.`,
  )
}

/* =========================================================
   EMPLOYEE
========================================================= */

const handleEmployee = (
  entry:
    ManualTimeEntry,
) => {
  router.push(
    `/admin/employees/${entry.employeeId}`,
  )
}

/* =========================================================
   TIME LOG
========================================================= */

const handleTimeLog = (
  entry:
    ManualTimeEntry,
) => {
  router.push({
    path:
      '/admin/time-logs',

    query: {
      employee:
        entry.employeeNumber,

      date:
        entry.attendanceDate,
    },
  })
}

/* =========================================================
   EXPORT
========================================================= */

const handleExport = () => {
  info(
    'Export Manual Entries',
    'Manual time entry export will be connected later.',
  )
}

/* =========================================================
   BACK
========================================================= */

const handleBack = () => {
  router.push(
    '/admin/timekeeping',
  )
}
</script>

<template>
  <section class="manual-time-page">

    <button
      type="button"
      class="back-button"
      @click="
        handleBack
      "
    >
      <ArrowLeft :size="15" />

      Back to Timekeeping
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
          @click="
            handleExport
          "
        >
          Export
        </AppButton>

        <AppButton
          :icon="Plus"
          @click="
            handleAdd
          "
        >
          Add Manual Entry
        </AppButton>

      </div>

    </PageHeader>

    <!-- STATS -->

    <ManualTimeStats
      :stats="stats"
    />

    <!-- FILTER -->

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
      @reset="
        resetFilters
      "
    />

    <!-- TABLE -->

    <ManualTimeTable
      :entries="
        paginatedEntries
      "
      @view="
        handleView
      "
      @edit="
        handleEdit
      "
      @validate="
        handleValidate
      "
      @employee="
        handleEmployee
      "
      @time-log="
        handleTimeLog
      "
      @cancel="
        handleCancel
      "
    />

    <!-- PAGINATION -->

    <div class="table-footer">

      <p>
        Showing

        <strong>
          {{
            showingFrom
          }}–{{
            showingTo
          }}
        </strong>

        of

        <strong>
          {{
            filteredEntries.length
          }}
        </strong>

        manual time entries
      </p>

      <AppPagination
        v-model="
          currentPage
        "
        :total-pages="
          totalPages
        "
      />

    </div>

    <!-- ADD / EDIT -->

    <AddManualTimeModal
      :open="
        formModalOpen
      "
      :employees="
        employees
      "
      :entry="
        editingEntry
      "
      @close="
        closeFormModal
      "
      @save="
        handleSave
      "
    />

    <!-- DETAILS -->

    <ManualTimeDetailsModal
      :open="
        detailsModalOpen
      "
      :entry="
        selectedEntry
      "
      @close="
        closeDetails
      "
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

  background:
    transparent;

  color:
    var(--primary);

  font-family: inherit;

  font-size: 10px;
  font-weight: 600;

  cursor: pointer;
}

.header-actions {
  display: flex;

  align-items: center;

  gap: 8px;
}

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