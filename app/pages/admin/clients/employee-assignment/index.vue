<script setup lang="ts">
import {
  ArrowLeft,
  Download,
  UserPlus,
} from 'lucide-vue-next'

import ClientAssignmentStats from '~/components/admin/clients/employee-assignment/ClientAssignmentStats.vue'
import ClientAssignmentFilters from '~/components/admin/clients/employee-assignment/ClientAssignmentFilters.vue'
import ClientAssignmentTable from '~/components/admin/clients/employee-assignment/ClientAssignmentTable.vue'

const router =
  useRouter()

const route =
  useRoute()

const {
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

  resetFilters,
} = useClientEmployeeAssignments()

const {
  info,
} = useToast()

/* =========================================================
   QUERY FILTER

   Example:
   /admin/clients/employee-assignment?client=Davao Transport Services Inc.
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
   UI ONLY ACTIONS
========================================================= */

const handleExport = () => {
  info(
    'Export Employee Assignments',
    'Employee assignment export functionality will be connected later.',
  )
}

const handleAssignEmployee = () => {
  info(
    'Assign Employee',
    'Employee assignment form will be added after all Client submenu UIs are completed.',
  )
}

const handleBack = () => {
  router.push(
    '/admin/clients',
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

      <ArrowLeft
        :size="15"
      />

      Back to Clients

    </button>

    <!-- PAGE HEADER -->

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

    <!-- FILTERS -->

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

    align-items:
      stretch;

    flex-direction:
      column;
  }

  .table-footer {
    align-items:
      flex-start;

    flex-direction:
      column;
  }
}
</style>