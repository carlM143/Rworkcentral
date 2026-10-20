<script setup lang="ts">
import {
  ArrowLeft,
  Download,
  UserPlus,
} from 'lucide-vue-next'

import ClientAssignmentStats from '~/components/clients/employee-assignment/ClientAssignmentStats.vue'

import ClientAssignmentFilters from '~/components/clients/employee-assignment/ClientAssignmentFilters.vue'

import ClientAssignmentTable from '~/components/clients/employee-assignment/ClientAssignmentTable.vue'

import ClientAssignmentFormModal from '~/components/clients/employee-assignment/ClientAssignmentFormModal.vue'

import ClientAssignmentDetailsModal from '~/components/clients/employee-assignment/ClientAssignmentDetailsModal.vue'

import ClientAssignmentExportModal from '~/components/clients/employee-assignment/ClientAssignmentExportModal.vue'

import type {
  ClientAssignmentFormData,
  ClientEmployeeAssignment,
} from '~/types/clientEmployeeAssignment'

const router =
  useRouter()

const route =
  useRoute()

const {
  availableEmployees,
  availableClients,

  search,
  client,
  department,
  status,
  assignmentType,

  currentPage,

  filteredAssignments,
  paginatedAssignments,

  totalPages,
  showingFrom,
  showingTo,

  stats,

  clientOptions,
  departmentOptions,
  statusOptions,
  assignmentTypeOptions,

  createAssignment,
  updateAssignment,
  activateAssignment,
  endAssignment,

  resetFilters,
} = useClientEmployeeAssignments()

const {
  info,
  success,
} = useToast()

/* =========================================================
   QUERY FILTER
========================================================= */

watch(
  () =>
    route.query.client,
  value => {
    if (
      typeof value ===
        'string' &&
      value
    ) {
      client.value =
        value
    }
  },
  {
    immediate: true,
  },
)

/* =========================================================
   ADD / EDIT
========================================================= */

const formOpen =
  ref(false)

const editingAssignment =
  ref<
    ClientEmployeeAssignment |
    null
  >(null)

const handleAssignEmployee = () => {
  editingAssignment.value =
    null

  formOpen.value =
    true
}

const handleEdit = (
  assignment:
    ClientEmployeeAssignment,
) => {
  editingAssignment.value =
    assignment

  formOpen.value =
    true
}

const closeForm = () => {
  formOpen.value =
    false

  editingAssignment.value =
    null
}

/* =========================================================
   SAVE
========================================================= */

const handleSave = (
  data:
    ClientAssignmentFormData,
) => {
  if (
    editingAssignment.value
  ) {
    const updated =
      updateAssignment(
        editingAssignment.value.id,
        data,
      )

    if (!updated) {
      info(
        'Unable to Update',
        'Employee or client record could not be found.',
      )

      return
    }

    closeForm()

    success(
      'Assignment Updated',
      `${updated.employeeName}'s client assignment has been updated.`,
    )

    return
  }

  const created =
    createAssignment(
      data,
    )

  if (!created) {
    info(
      'Unable to Assign',
      'Employee or client record could not be found.',
    )

    return
  }

  closeForm()

  success(
    'Employee Assigned',
    `${created.employeeName} has been assigned to ${created.clientName}.`,
  )
}

/* =========================================================
   DETAILS
========================================================= */

const detailsOpen =
  ref(false)

const selectedAssignment =
  ref<
    ClientEmployeeAssignment |
    null
  >(null)

const handleView = (
  assignment:
    ClientEmployeeAssignment,
) => {
  selectedAssignment.value =
    assignment

  detailsOpen.value =
    true
}

const closeDetails = () => {
  detailsOpen.value =
    false

  selectedAssignment.value =
    null
}

const handleEditFromDetails = (
  assignment:
    ClientEmployeeAssignment,
) => {
  closeDetails()

  handleEdit(
    assignment,
  )
}

/* =========================================================
   VIEW EMPLOYEE
========================================================= */

const handleEmployee = (
  assignment:
    ClientEmployeeAssignment,
) => {
  closeDetails()

  router.push(
    `/employees/${assignment.employeeId}`,
  )
}

/* =========================================================
   ACTIVATE
========================================================= */

const handleActivate = (
  assignment:
    ClientEmployeeAssignment,
) => {
  const result =
    activateAssignment(
      assignment.id,
    )

  if (!result) {
    return
  }

  closeDetails()

  success(
    'Assignment Activated',
    `${result.employeeName}'s assignment to ${result.clientName} is now active.`,
  )
}

/* =========================================================
   END
========================================================= */

const handleEnd = (
  assignment:
    ClientEmployeeAssignment,
) => {
  const result =
    endAssignment(
      assignment.id,
    )

  if (!result) {
    return
  }

  closeDetails()

  success(
    'Assignment Ended',
    `${result.employeeName}'s assignment to ${result.clientName} has been ended.`,
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
    `${filteredAssignments.value.length} assignment record(s) are ready for export. Actual file generation will be connected during backend integration.`,
  )
}

/* =========================================================
   BACK
========================================================= */

const handleBack = () => {
  router.push(
    '/clients',
  )
}
</script>

<template>
  <section class="assignment-page">

    <!-- BACK -->

    <button
      type="button"
      class="back-button"
      @click="
        handleBack
      "
    >

      <ArrowLeft :size="15" />

      Back to Clients

    </button>

    <!-- HEADER -->

    <PageHeader
      title="Employee Assignment"
      description="Monitor employees assigned to clients, deployment dates, assignment types and current assignment status."
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
          :icon="UserPlus"
          @click="
            handleAssignEmployee
          "
        >
          Assign Employee
        </AppButton>

      </div>

    </PageHeader>

    <!-- STATS -->

    <ClientAssignmentStats
      :stats="
        stats
      "
    />

    <!-- FILTER -->

    <ClientAssignmentFilters
      v-model:search="
        search
      "
      v-model:client="
        client
      "
      v-model:department="
        department
      "
      v-model:status="
        status
      "
      v-model:assignment-type="
        assignmentType
      "
      :clients="
        clientOptions
      "
      :departments="
        departmentOptions
      "
      :statuses="
        statusOptions
      "
      :assignment-types="
        assignmentTypeOptions
      "
      @reset="
        resetFilters
      "
    />

    <!-- TABLE -->

    <ClientAssignmentTable
      :assignments="
        paginatedAssignments
      "
      @view="
        handleView
      "
      @edit="
        handleEdit
      "
      @employee="
        handleEmployee
      "
      @activate="
        handleActivate
      "
      @end="
        handleEnd
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
            filteredAssignments.length
          }}
        </strong>

        employee assignments
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

    <ClientAssignmentFormModal
      :open="
        formOpen
      "
      :assignment="
        editingAssignment
      "
      :employees="
        availableEmployees
      "
      :clients="
        availableClients
      "
      @close="
        closeForm
      "
      @save="
        handleSave
      "
    />

    <!-- DETAILS -->

    <ClientAssignmentDetailsModal
      :open="
        detailsOpen
      "
      :assignment="
        selectedAssignment
      "
      @close="
        closeDetails
      "
      @edit="
        handleEditFromDetails
      "
      @employee="
        handleEmployee
      "
      @activate="
        handleActivate
      "
      @end="
        handleEnd
      "
    />

    <!-- EXPORT -->

    <ClientAssignmentExportModal
      :open="
        exportOpen
      "
      :record-count="
        filteredAssignments.length
      "
      :client="
        client
      "
      :department="
        department
      "
      :status="
        status
      "
      :assignment-type="
        assignmentType
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
.assignment-page {
  width: 100%;

  max-width: 1660px;

  margin:
    0 auto;
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

  font-family:
    inherit;

  font-size: 10px;
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
    align-items:
      flex-start;

    flex-direction:
      column;
  }
}
</style>