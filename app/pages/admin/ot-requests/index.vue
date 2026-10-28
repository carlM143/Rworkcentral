<script setup lang="ts">
import {
  ArrowLeft,
  Download,
  Plus,
} from 'lucide-vue-next'

import OvertimeRequestStats from '~/components/admin/overtime/requests/OvertimeRequestStats.vue'
import OvertimeRequestFilters from '~/components/admin/overtime/requests/OvertimeRequestFilters.vue'
import OvertimeRequestTable from '~/components/admin/overtime/requests/OvertimeRequestTable.vue'

definePageMeta({
  alias: ['/admin/timekeeping/overtime-requests'],
})

const router =
  useRouter()

const {
  search,
  department,
  overtimeType,
  status,
  dateFrom,
  dateTo,

  currentPage,

  filteredRequests,
  paginatedRequests,

  totalPages,
  showingFrom,
  showingTo,

  stats,

  departmentOptions,
  overtimeTypeOptions,
  statusOptions,

  resetFilters,
  loading,
  loadError,
  approvingId,
  loadRequests,
  approveRequest,
} = useOvertimeRequests()

const {
  info,
  success,
  warning,
} = useToast()

const apiError = (problem: any) => (
  problem?.data?.errors?.status?.[0]
  ?? problem?.data?.errors?.end_at?.[0]
  ?? problem?.data?.message
  ?? problem?.response?._data?.message
  ?? problem?.message
  ?? 'Unable to approve the overtime request.'
)

const handleApprove = async (request: { id: number; requestNumber: string }) => {
  try {
    const message = await approveRequest(request.id)
    success('Overtime Approved', message)
  } catch (problem: any) {
    warning('Approval Failed', apiError(problem))
  }
}

const handleBack = () => {
  router.push(
    '/admin/overtime',
  )
}

const handleExport = () => {
  info(
    'Export Overtime Requests',
    'Overtime request export functionality will be connected later.',
  )
}

const handleFileOvertime = () => {
  info(
    'File Overtime Request',
    'Overtime request form will be added later.',
  )
}
</script>

<template>
  <section class="ot-request-page">

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

      Back to Overtime

    </button>

    <PageHeader
      title="Overtime Requests"
      description="Monitor employee overtime requests, requested hours, overtime types and approval status."
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
            handleFileOvertime
          "
        >
          File OT Request
        </AppButton>

      </div>

    </PageHeader>

    <OvertimeRequestStats
      :stats="stats"
    />

    <OvertimeRequestFilters
      v-model:search="
        search
      "
      v-model:department="
        department
      "
      v-model:overtime-type="
        overtimeType
      "
      v-model:status="
        status
      "
      v-model:date-from="
        dateFrom
      "
      v-model:date-to="
        dateTo
      "
      :departments="
        departmentOptions
      "
      :overtime-types="
        overtimeTypeOptions
      "
      :statuses="
        statusOptions
      "
      @reset="
        resetFilters
      "
    />

    <div v-if="loading" class="request-message">
      Loading overtime requests...
    </div>

    <div v-else-if="loadError" class="request-message request-error" role="alert">
      <span>{{ loadError }}</span>
      <AppButton variant="secondary" size="sm" @click="loadRequests">Retry</AppButton>
    </div>

    <OvertimeRequestTable
      v-else
      :requests="
        paginatedRequests
      "
      :approving-id="approvingId"
      @approve="handleApprove"
    />

    <div v-if="!loading && !loadError" class="table-footer">

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
            filteredRequests.length
          }}
        </strong>

        overtime requests
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
.ot-request-page {
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

.request-message {
  display: flex;
  min-height: 130px;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 12px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
  color: var(--text-muted);
  font-size: 12px;
}

.request-error {
  color: var(--red);
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
