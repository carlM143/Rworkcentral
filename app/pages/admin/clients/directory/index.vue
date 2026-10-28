<script setup lang="ts">
import {
  ArrowLeft,
  Download,
  Plus,
} from 'lucide-vue-next'

import ClientDirectoryStats from '~/components/admin/clients/directory/ClientDirectoryStats.vue'
import ClientDirectoryFilters from '~/components/admin/clients/directory/ClientDirectoryFilters.vue'
import ClientDirectoryTable from '~/components/admin/clients/directory/ClientDirectoryTable.vue'

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

  resetFilters,
} = useClientDirectory()

const {
  info,
} = useToast()

/* =========================================================
   UI ONLY ACTIONS
========================================================= */

const handleExport = () => {
  info(
    'Export Client Directory',
    'Client directory export functionality will be connected later.',
  )
}

const handleAddClient = () => {
  info(
    'Add Client',
    'Client creation form will be added after all Client submenu UIs are completed.',
  )
}

const handleBack = () => {
  router.push(
    '/admin/clients',
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

      <ArrowLeft :size="15" />

      Back to Clients

    </button>

    <!-- PAGE HEADER -->

    <PageHeader
      title="Client Directory"
      description="View registered clients, contact information, branches, assigned employees and contract status."
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