<script setup lang="ts">
import {
  ArrowLeft,
  Download,
  Plus,
} from 'lucide-vue-next'

import ClientDirectoryStats from '~/components/clients/directory/ClientDirectoryStats.vue'

import ClientDirectoryFilters from '~/components/clients/directory/ClientDirectoryFilters.vue'

import ClientDirectoryTable from '~/components/clients/directory/ClientDirectoryTable.vue'

import ClientDirectoryFormModal from '~/components/clients/directory/ClientDirectoryFormModal.vue'

import ClientDirectoryDetailsModal from '~/components/clients/directory/ClientDirectoryDetailsModal.vue'

import ClientDirectoryExportModal from '~/components/clients/directory/ClientDirectoryExportModal.vue'

import type {
  ClientDirectoryFormData,
  ClientDirectoryRecord,
} from '~/composables/useClientDirectory'

import type {
  ClientDirectoryExportFormat,
} from '~/components/clients/directory/ClientDirectoryExportModal.vue'

const router =
  useRouter()

const {
  search,
  industry,
  status,
  contractStatus,

  currentPage,

  filteredClients,
  paginatedClients,

  totalPages,
  showingFrom,
  showingTo,

  stats,

  industryOptions,
  statusOptions,
  contractStatusOptions,

  createClient,
  updateClient,

  resetFilters,
} = useClientDirectory()

const {
  info,
  success,
} = useToast()

/* =========================================================
   ADD / EDIT
========================================================= */

const formOpen =
  ref(false)

const editingClient =
  ref<
    ClientDirectoryRecord |
    null
  >(null)

const handleAddClient = () => {
  editingClient.value =
    null

  formOpen.value =
    true
}

const handleEditClient = (
  client:
    ClientDirectoryRecord,
) => {
  editingClient.value =
    client

  formOpen.value =
    true
}

const closeForm = () => {
  formOpen.value =
    false

  editingClient.value =
    null
}

/* =========================================================
   SAVE
========================================================= */

const handleSaveClient = (
  data:
    ClientDirectoryFormData,
) => {
  if (
    editingClient.value
  ) {
    const updated =
      updateClient(
        editingClient.value.id,
        data,
      )

    if (!updated) {
      info(
        'Client Not Found',
        'The selected client could not be found.',
      )

      return
    }

    closeForm()

    success(
      'Client Updated',
      `${updated.name} has been updated successfully.`,
    )

    return
  }

  const created =
    createClient(
      data,
    )

  closeForm()

  success(
    'Client Added',
    `${created.name} has been added to the client directory.`,
  )
}

/* =========================================================
   DETAILS
========================================================= */

const detailsOpen =
  ref(false)

const selectedClient =
  ref<
    ClientDirectoryRecord |
    null
  >(null)

const handleViewClient = (
  client:
    ClientDirectoryRecord,
) => {
  selectedClient.value =
    client

  detailsOpen.value =
    true
}

const closeDetails = () => {
  detailsOpen.value =
    false

  selectedClient.value =
    null
}

const handleEditFromDetails = (
  client:
    ClientDirectoryRecord,
) => {
  closeDetails()

  handleEditClient(
    client,
  )
}

/* =========================================================
   EMPLOYEE ASSIGNMENTS
========================================================= */

const handleAssignments = (
  client:
    ClientDirectoryRecord,
) => {
  closeDetails()

  router.push({
    path:
      '/clients/employee-assignment',

    query: {
      client:
        client.name,
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
    ClientDirectoryExportFormat,
) => {
  exportOpen.value =
    false

  info(
    `Export ${format}`,
    `${filteredClients.value.length} client record(s) are ready for export. Actual file generation will be connected during backend integration.`,
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
  <section class="client-directory-page">

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
      title="Client Directory"
      description="View registered clients, contact information, client sites, assigned employees and contract status."
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
            handleAddClient
          "
        >
          Add Client
        </AppButton>

      </div>

    </PageHeader>

    <!-- STATS -->

    <ClientDirectoryStats
      :stats="
        stats
      "
    />

    <!-- FILTERS -->

    <ClientDirectoryFilters
      v-model:search="
        search
      "
      v-model:industry="
        industry
      "
      v-model:status="
        status
      "
      v-model:contract-status="
        contractStatus
      "
      :industries="
        industryOptions
      "
      :statuses="
        statusOptions
      "
      :contract-statuses="
        contractStatusOptions
      "
      @reset="
        resetFilters
      "
    />

    <!-- TABLE -->

    <ClientDirectoryTable
      :clients="
        paginatedClients
      "
      @view="
        handleViewClient
      "
      @edit="
        handleEditClient
      "
      @assignments="
        handleAssignments
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
            filteredClients.length
          }}
        </strong>

        clients
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

    <ClientDirectoryFormModal
      :open="
        formOpen
      "
      :client="
        editingClient
      "
      @close="
        closeForm
      "
      @save="
        handleSaveClient
      "
    />

    <!-- DETAILS -->

    <ClientDirectoryDetailsModal
      :open="
        detailsOpen
      "
      :client="
        selectedClient
      "
      @close="
        closeDetails
      "
      @edit="
        handleEditFromDetails
      "
      @assignments="
        handleAssignments
      "
    />

    <!-- EXPORT -->

    <ClientDirectoryExportModal
      :open="
        exportOpen
      "
      :record-count="
        filteredClients.length
      "
      :industry="
        industry
      "
      :status="
        status
      "
      :contract-status="
        contractStatus
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
.client-directory-page {
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