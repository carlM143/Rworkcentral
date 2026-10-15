<script setup lang="ts">
import {
  Download,
  Plus,
} from 'lucide-vue-next'

import PerformanceTemplateStats from '~/components/performance/templates/PerformanceTemplateStats.vue'
import PerformanceTemplateFilters from '~/components/performance/templates/PerformanceTemplateFilters.vue'
import PerformanceTemplateTable from '~/components/performance/templates/PerformanceTemplateTable.vue'

const {
  search,
  templateType,
  scope,
  status,

  currentPage,

  filteredTemplates,
  paginatedTemplates,

  totalPages,
  showingFrom,
  showingTo,

  stats,

  templateTypeOptions,
  scopeOptions,
  statusOptions,

  resetFilters,
} = usePerformanceTemplates()

const {
  info,
} = useToast()

const handleExport = () => {
  info(
    'Export Evaluation Templates',
    'Evaluation template export functionality will be connected later.',
  )
}

const handleCreateTemplate = () => {
  info(
    'Create Evaluation Template',
    'Evaluation template builder will be added later.',
  )
}
</script>

<template>
  <section class="performance-templates-page">

    <!-- HEADER -->

    <PageHeader
      title="Evaluation Templates"
      description="Manage reusable evaluation forms, performance criteria, scoring rules, employee scope and template availability."
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
            handleCreateTemplate
          "
        >
          Create Template
        </AppButton>

      </div>

    </PageHeader>

    <!-- STATS -->

    <PerformanceTemplateStats
      :stats="
        stats
      "
    />

    <!-- FILTERS -->

    <PerformanceTemplateFilters
      v-model:search="
        search
      "
      v-model:template-type="
        templateType
      "
      v-model:scope="
        scope
      "
      v-model:status="
        status
      "
      :template-types="
        templateTypeOptions
      "
      :scopes="
        scopeOptions
      "
      :statuses="
        statusOptions
      "
      @reset="
        resetFilters
      "
    />

    <!-- TABLE -->

    <PerformanceTemplateTable
      :templates="
        paginatedTemplates
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
            filteredTemplates.length
          }}
        </strong>

        evaluation templates
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
.performance-templates-page {
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