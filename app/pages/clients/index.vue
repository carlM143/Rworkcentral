<script setup lang="ts">
import {
  Download,
  Plus,
  RotateCcw,
} from 'lucide-vue-next'

import ClientFormModal from '~/components/clients/ClientFormModal.vue'
import ClientDetailsModal from '~/components/clients/ClientDetailsModal.vue'
import ClientExportModal from '~/components/clients/ClientExportModal.vue'

import type {
  Client,
} from '~/types/client'

type ClientFormData = {
  code: string
  name: string
  industry: string

  contactPerson: string
  email: string
  phone: string

  address: string

  branches: number

  contractStart: string
  contractEnd: string

  contractStatus:
    Client['contractStatus']

  status:
    Client['status']
}

const {
  search,
  status,
  contractStatus,

  currentPage,

  filteredClients,
  paginatedClients,

  totalPages,
  showingFrom,
  showingTo,

  stats,

  contractAlerts,
  recentActivity,

  statusOptions,
  contractOptions,

  createClient,
  updateClient,

  resetFilters,
} = useClientsOverview()

const router =
  useRouter()

const {
  success,
  info,
} = useToast()

/* =========================================================
   FORM MODAL
========================================================= */

const formOpen =
  ref(false)

const editingClient =
  ref<
    Client |
    null
  >(null)

const handleAddClient = () => {
  editingClient.value =
    null

  formOpen.value =
    true
}

const handleEditClient = (
  client: Client,
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
    ClientFormData,
) => {
  if (
    editingClient.value
  ) {
    const updated =
      updateClient(
        editingClient.value.id,
        {
          ...data,
        },
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
    createClient({
      ...data,
    })

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
    Client |
    null
  >(null)

const handleViewClient = (
  client:
    Client,
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
    Client,
) => {
  closeDetails()

  handleEditClient(
    client,
  )
}

/* =========================================================
   ASSIGNMENTS
========================================================= */

const handleAssignments = () => {
  router.push(
    '/clients/employee-assignment',
  )
}

const handleClientAssignments = (
  client:
    Client,
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
    | 'Excel'
    | 'PDF'
    | 'CSV',
) => {
  exportOpen.value =
    false

  info(
    `Export ${format}`,
    `${filteredClients.value.length} client record(s) are ready for export. Actual file generation will be connected during backend integration.`,
  )
}
</script>

<template>
  <section class="clients-page">

    <!-- HEADER -->

    <PageHeader
      title="Clients"
      description="Manage client accounts, contracts and employee assignments."
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

    <ClientStats
      :stats="
        stats
      "
    />

    <!-- FILTERS -->

    <div class="client-filters">

      <AppInput
        v-model="
          search
        "
        searchable
        clearable
        placeholder="Search client, code or contact person..."
      />

      <AppSelect
        v-model="
          status
        "
        :options="
          statusOptions
        "
        placeholder="All Status"
      />

      <AppSelect
        v-model="
          contractStatus
        "
        :options="
          contractOptions
        "
        placeholder="All Contracts"
      />

      <AppButton
        variant="secondary"
        :icon="RotateCcw"
        @click="
          resetFilters
        "
      >
        Reset
      </AppButton>

    </div>

    <!-- CONTENT -->

    <div class="clients-layout">

      <div class="clients-main">

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

        <!-- ACTIVITY -->

        <RecentClientActivity
          :activities="
            recentActivity
          "
        />

      </div>

      <!-- SIDE PANEL -->

      <ClientSidePanel
        :contract-alerts="
          contractAlerts
        "
        @add-client="
          handleAddClient
        "
        @assignments="
          handleAssignments
        "
      />

    </div>

    <!-- ADD / EDIT CLIENT -->

    <ClientFormModal
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

    <!-- CLIENT DETAILS -->

    <ClientDetailsModal
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
        handleClientAssignments
      "
    />

    <!-- EXPORT -->

    <ClientExportModal
      :open="
        exportOpen
      "
      :record-count="
        filteredClients.length
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
.clients-page {
  width: 100%;

  max-width: 1660px;

  margin:
    0 auto;
}

.header-actions {
  display: flex;

  align-items: center;

  gap: 8px;
}

/* FILTERS */

.client-filters {
  display: grid;

  grid-template-columns:
    minmax(300px, 1fr)
    180px
    190px
    auto;

  gap: 8px;

  margin-bottom: 14px;

  padding: 10px;

  border:
    1px solid var(--border);

  border-radius: 10px;

  background:
    var(--bg-card);

  box-shadow:
    var(--shadow);
}

/* LAYOUT */

.clients-layout {
  display: grid;

  grid-template-columns:
    minmax(0, 1fr)
    290px;

  gap: 12px;
}

.clients-main {
  display: flex;

  min-width: 0;

  flex-direction: column;

  gap: 12px;
}

/* FOOTER */

.table-footer {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 20px;

  padding:
    1px 3px 0;
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

  font-weight: 600;
}

@media (max-width: 1100px) {
  .clients-layout {
    grid-template-columns:
      1fr;
  }

  .client-filters {
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

  .client-filters {
    grid-template-columns:
      1fr;
  }

  .table-footer {
    align-items:
      flex-start;

    flex-direction:
      column;
  }
}
</style>