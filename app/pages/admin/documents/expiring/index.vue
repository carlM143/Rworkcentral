<script setup lang="ts">
import {
  Download,
  FolderOpen,
} from 'lucide-vue-next'

import ExpiringDocumentStats from '~/components/admin/documents/expiring/ExpiringDocumentStats.vue'
import ExpiringDocumentFilters from '~/components/admin/documents/expiring/ExpiringDocumentFilters.vue'
import ExpiringDocumentTable from '~/components/admin/documents/expiring/ExpiringDocumentTable.vue'

const router =
  useRouter()

const {
  search,
  category,
  department,
  expiryWindow,
  status,

  currentPage,

  filteredDocuments,
  paginatedDocuments,

  totalPages,
  showingFrom,
  showingTo,

  stats,

  categoryOptions,
  departmentOptions,
  expiryWindowOptions,
  statusOptions,

  getDaysRemaining,
  getDocumentStatus,

  resetFilters,
} = useExpiringDocuments()

const {
  info,
} = useToast()

const handleExport = () => {
  info(
    'Export Expiring Documents',
    'Expiring document export functionality will be connected later.',
  )
}

const handleDocuments = () => {
  router.push(
    '/admin/documents',
  )
}
</script>

<template>
  <section class="expiring-documents-page">

    <!-- HEADER -->

    <PageHeader
      title="Expiring Documents"
      description="Monitor employee documents approaching expiration, identify critical renewals and maintain valid compliance records."
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
          :icon="FolderOpen"
          @click="
            handleDocuments
          "
        >
          View Documents
        </AppButton>

      </div>

    </PageHeader>

    <!-- STATS -->

    <ExpiringDocumentStats
      :stats="
        stats
      "
    />

    <!-- FILTERS -->

    <ExpiringDocumentFilters
      v-model:search="
        search
      "
      v-model:category="
        category
      "
      v-model:department="
        department
      "
      v-model:expiry-window="
        expiryWindow
      "
      v-model:status="
        status
      "
      :categories="
        categoryOptions
      "
      :departments="
        departmentOptions
      "
      :expiry-windows="
        expiryWindowOptions
      "
      :statuses="
        statusOptions
      "
      @reset="
        resetFilters
      "
    />

    <!-- TABLE -->

    <ExpiringDocumentTable
      :documents="
        paginatedDocuments
      "
      :get-days-remaining="
        getDaysRemaining
      "
      :get-document-status="
        getDocumentStatus
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
            filteredDocuments.length
          }}
        </strong>

        expiring documents
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
.expiring-documents-page {
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

.table-footer {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 20px;

  padding:
    14px 3px 0;
}

.table-footer p {
  margin: 0;

  color:
    var(--text-muted);

  font-size: 11px;
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