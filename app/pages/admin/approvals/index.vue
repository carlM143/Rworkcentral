<script setup lang="ts">
import {
  Download,
  ClipboardCheck,
} from 'lucide-vue-next'

import type {
  ApprovalRequest,
} from '~/types/approval'

const {
  search,
  type,
  department,
  priority,

  currentPage,

  filteredRequests,
  paginatedRequests,

  totalPages,
  showingFrom,
  showingTo,

  stats,
  typeSummary,
  urgentRequests,

  typeOptions,
  priorityOptions,
  departments,


  resetFilters,
} = useApprovalCenter()

const exportOpen = ref(false)
const requestOpen = ref(false)
const requestMode = ref('view')
const selectedRequest = ref<ApprovalRequest | null>(null)
const openRequest = (mode: string, request: ApprovalRequest) => { selectedRequest.value = request; requestMode.value = mode; requestOpen.value = true }
const handleExport = () => { exportOpen.value = true }
const handleView = (request: ApprovalRequest) => openRequest('view', request)
const handleApprove = (request: ApprovalRequest) => openRequest('approve', request)
const handleReject = (request: ApprovalRequest) => openRequest('reject', request)
</script>

<template>
  <section class="approval-page">

    <!-- HEADER -->
    <PageHeader
      title="Approval Center"
      description="Review and manage pending leave, overtime, time correction and work-from-home requests."
    >

      <AppButton
        variant="secondary"
        :icon="Download"
        @click="handleExport"
      >
        Export
      </AppButton>

    </PageHeader>

    <!-- STATS -->
    <ApprovalStats
      :stats="stats"
    />

    <!-- FILTERS -->
    <ApprovalFilters
      v-model:search="search"
      v-model:type="type"
      v-model:department="department"
      v-model:priority="priority"
      :departments="departments"
      :type-options="typeOptions"
      :priority-options="priorityOptions"
      @reset="resetFilters"
    />

    <!-- MAIN -->
    <div class="approval-layout">

      <div class="approval-main">

        <ApprovalRequestsTable
          :requests="paginatedRequests"
          @view="handleView"
          @approve="handleApprove"
          @reject="handleReject"
        />

        <div class="table-footer">

          <p>
            Showing

            <strong>
              {{ showingFrom }}–{{ showingTo }}
            </strong>

            of

            <strong>
              {{ filteredRequests.length }}
            </strong>

            pending requests
          </p>

          <AppPagination
            v-model="currentPage"
            :total-pages="totalPages"
          />

        </div>

      </div>

      <ApprovalSidePanel
        :urgent-requests="urgentRequests"
        :summary="typeSummary"
      />

    </div>

    <PayrollExportDialog :open="exportOpen" title="Approval Center Requests" :records="filteredRequests" :sample="false" :filters="{ Search: search, Type: type, Department: department, Priority: priority }" @close="exportOpen = false" />
    <ApprovalRequestDialog :open="requestOpen" kind="Overview" :mode="requestMode" :request="selectedRequest" @close="requestOpen = false" />
  </section>
</template>

<style scoped>
.approval-page {
  width: 100%;

  max-width: 1660px;

  margin: 0 auto;
}

.approval-layout {
  display: grid;

  grid-template-columns:
    minmax(0, 1fr)
    280px;

  gap: 12px;
}

.approval-main {
  min-width: 0;
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

  font-weight: 600;
}

@media (max-width: 1100px) {
  .approval-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 650px) {
  .table-footer {
    flex-direction: column;

    align-items: flex-start;
  }
}
</style>