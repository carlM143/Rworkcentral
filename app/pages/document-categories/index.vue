<script setup lang="ts">
import {
  Download,
  Plus,
} from 'lucide-vue-next'

import DocumentCategoryStats from '~/components/documents/categories/DocumentCategoryStats.vue'
import DocumentCategoryFilters from '~/components/documents/categories/DocumentCategoryFilters.vue'
import DocumentCategoryTable from '~/components/documents/categories/DocumentCategoryTable.vue'

const {
  search,
  scope,
  requirement,
  status,

  currentPage,

  filteredCategories,
  paginatedCategories,

  totalPages,
  showingFrom,
  showingTo,

  stats,

  scopeOptions,
  requirementOptions,
  statusOptions,

  resetFilters,
} = useDocumentCategories()

const {
  info,
} = useToast()

const handleExport = () => {
  info(
    'Export Document Categories',
    'Document category export functionality will be connected later.',
  )
}

const handleAddCategory = () => {
  info(
    'Add Document Category',
    'Document category creation form will be added later.',
  )
}
</script>

<template>
  <section class="document-categories-page">

    <!-- HEADER -->

    <PageHeader
      title="Document Categories"
      description="Manage employee and company document classifications, required records, expiration tracking and document requirements."
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
            handleAddCategory
          "
        >
          Add Category
        </AppButton>

      </div>

    </PageHeader>

    <!-- STATS -->

    <DocumentCategoryStats
      :stats="
        stats
      "
    />

    <!-- FILTERS -->

    <DocumentCategoryFilters
      v-model:search="
        search
      "
      v-model:scope="
        scope
      "
      v-model:requirement="
        requirement
      "
      v-model:status="
        status
      "
      :scopes="
        scopeOptions
      "
      :requirements="
        requirementOptions
      "
      :statuses="
        statusOptions
      "
      @reset="
        resetFilters
      "
    />

    <!-- TABLE -->

    <DocumentCategoryTable
      :categories="
        paginatedCategories
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
            filteredCategories.length
          }}
        </strong>

        document categories
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
.document-categories-page {
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
    align-items: flex-start;

    flex-direction: column;
  }
}
</style>