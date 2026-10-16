<script setup lang="ts">
import {
  Plus,
  Download,
  RotateCcw,
} from 'lucide-vue-next'

import type {
  Client,
} from '~/types/client'

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

  resetFilters,
} = useClientsOverview()

const router =
  useRouter()

const {
  info,
} = useToast()

const handleAddClient = () => {
  info(
    'Add Client',
    'Client creation form will be implemented after the Clients Overview.',
  )
}

const handleViewClient = (
  client: Client,
) => {
  router.push(
    `/clients/${client.id}`,
  )
}

const handleEditClient = (
  client: Client,
) => {
  info(
    'Edit Client',
    `${client.name} editing UI will be implemented with Client Details.`,
  )
}

const handleAssignments = () => {
  info(
    'Employee Assignments',
    'Client employee assignment UI will be implemented later.',
  )
}

const handleExport = () => {
  info(
    'Export Clients',
    'Client export will be connected later.',
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

      <AppButton
        variant="secondary"
        :icon="Download"
        @click="handleExport"
      >
        Export
      </AppButton>

      <AppButton
        :icon="Plus"
        @click="handleAddClient"
      >
        Add Client
      </AppButton>

    </PageHeader>

    <!-- STATS -->
    <ClientStats
      :stats="stats"
    />

    <!-- FILTERS -->
    <div class="client-filters">

      <AppInput
        v-model="search"
        searchable
        clearable
        placeholder="Search client, code or contact person..."
      />

      <AppSelect
        v-model="status"
        :options="statusOptions"
        placeholder="All Status"
      />

      <AppSelect
        v-model="contractStatus"
        :options="contractOptions"
        placeholder="All Contracts"
      />

      <AppButton
        variant="secondary"
        :icon="RotateCcw"
        @click="resetFilters"
      >
        Reset
      </AppButton>

    </div>

    <!-- MAIN -->
    <div class="clients-layout">

      <div class="clients-main">

        <ClientDirectoryTable
          :clients="paginatedClients"
          @view="handleViewClient"
          @edit="handleEditClient"
        />

        <div class="table-footer">

          <p>
            Showing

            <strong>
              {{ showingFrom }}–{{ showingTo }}
            </strong>

            of

            <strong>
              {{ filteredClients.length }}
            </strong>

            clients
          </p>

          <AppPagination
            v-model="currentPage"
            :total-pages="totalPages"
          />

        </div>

        <RecentClientActivity
          :activities="recentActivity"
        />

      </div>

      <ClientSidePanel
        :contract-alerts="contractAlerts"
        @add-client="handleAddClient"
        @assignments="handleAssignments"
      />

    </div>

  </section>
</template>

<style scoped>
.clients-page {
  width: 100%;

  max-width: 1660px;

  margin: 0 auto;
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

  padding: 1px 3px 0;
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
    grid-template-columns: 1fr;
  }

  .client-filters {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 650px) {
  .client-filters {
    grid-template-columns: 1fr;
  }

  .table-footer {
    flex-direction: column;

    align-items: flex-start;
  }
}
</style>