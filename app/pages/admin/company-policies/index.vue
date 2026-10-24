<script setup lang="ts">
import {
  Download,
  Plus,
} from 'lucide-vue-next'

import CompanyPolicyStats from '~/components/admin/documents/policies/CompanyPolicyStats.vue'
import CompanyPolicyFilters from '~/components/admin/documents/policies/CompanyPolicyFilters.vue'
import CompanyPolicyTable from '~/components/admin/documents/policies/CompanyPolicyTable.vue'

const {
  search,
  category,
  status,
  acknowledgment,

  currentPage,

  filteredPolicies,
  paginatedPolicies,

  totalPages,
  showingFrom,
  showingTo,

  stats,

  categoryOptions,
  statusOptions,
  acknowledgmentOptions,

  resetFilters,
} = useCompanyPolicies()

const {
  info,
} = useToast()

const handleExport = () => {
  info(
    'Export Company Policies',
    'Company policy export functionality will be connected later.',
  )
}

const handleAddPolicy = () => {
  info(
    'Add Company Policy',
    'Company policy creation form will be added later.',
  )
}
</script>

<template>
  <section class="company-policies-page">

    <!-- HEADER -->

    <PageHeader
      title="Company Policies"
      description="Manage official company policies, policy versions, effective dates and employee acknowledgment requirements."
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
            handleAddPolicy
          "
        >
          Add Policy
        </AppButton>

      </div>

    </PageHeader>

    <!-- STATS -->

    <CompanyPolicyStats
      :stats="
        stats
      "
    />

    <!-- FILTERS -->

    <CompanyPolicyFilters
      v-model:search="
        search
      "
      v-model:category="
        category
      "
      v-model:status="
        status
      "
      v-model:acknowledgment="
        acknowledgment
      "
      :categories="
        categoryOptions
      "
      :statuses="
        statusOptions
      "
      :acknowledgments="
        acknowledgmentOptions
      "
      @reset="
        resetFilters
      "
    />

    <!-- TABLE -->

    <CompanyPolicyTable
      :policies="
        paginatedPolicies
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
            filteredPolicies.length
          }}
        </strong>

        company policies
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
.company-policies-page {
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