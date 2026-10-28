<script setup lang="ts">
import { ArrowLeft, RefreshCw } from 'lucide-vue-next'

import UndertimeApprovalFilters from '~/components/admin/approvals/undertime/UndertimeApprovalFilters.vue'
import UndertimeApprovalStats from '~/components/admin/approvals/undertime/UndertimeApprovalStats.vue'
import UndertimeApprovalTable from '~/components/admin/approvals/undertime/UndertimeApprovalTable.vue'
import { useUndertimeApprovals } from '~/composables/admin/approvals/useUndertimeApprovals'
import type { UndertimeRequest } from '~/types/undertimeRequest'

definePageMeta({
  layout: 'admin',
  alias: ['/admin/undertime-requests'],
})

const router = useRouter()
const { success, warning } = useToast()
const {
  requests,
  loading,
  loadError,
  approvingId,
  search,
  status,
  dateFrom,
  dateTo,
  currentPage,
  statusOptions,
  filteredRequests,
  paginatedRequests,
  stats,
  totalPages,
  showingFrom,
  showingTo,
  loadRequests,
  approveRequest,
  resetFilters,
} = useUndertimeApprovals()

const handleApprove = async (request: UndertimeRequest) => {
  try {
    const message = await approveRequest(request.id)
    success('Undertime Approved', message)
  } catch (problem: any) {
    warning(
      'Approval Failed',
      problem?.data?.errors?.status?.[0]
        ?? problem?.data?.errors?.requested_minutes?.[0]
        ?? problem?.data?.errors?.requested_time_out?.[0]
        ?? problem?.data?.message
        ?? problem?.response?._data?.message
        ?? problem?.message
        ?? 'Unable to approve the undertime request.',
    )
  }
}

onMounted(() => { void loadRequests() })
</script>

<template>
  <section class="undertime-approvals-page">
    <button type="button" class="back-button" @click="router.push('/admin/approvals')">
      <ArrowLeft :size="15" />
      Back to Approval Center
    </button>

    <PageHeader
      title="Undertime Approvals"
      description="Review employee undertime schedules, requested minutes, reasons and approval status."
    >
      <AppButton variant="secondary" :icon="RefreshCw" :disabled="loading" @click="loadRequests">
        {{ loading ? 'Refreshing...' : 'Refresh' }}
      </AppButton>
    </PageHeader>

    <UndertimeApprovalStats :stats="stats" />

    <UndertimeApprovalFilters
      v-model:search="search"
      v-model:status="status"
      v-model:date-from="dateFrom"
      v-model:date-to="dateTo"
      :statuses="statusOptions"
      @reset="resetFilters"
    />

    <div v-if="loading" class="directory-message">
      <RefreshCw :size="15" class="loading-icon" />
      {{ requests.length ? 'Refreshing undertime requests...' : 'Loading employee undertime requests...' }}
    </div>

    <div v-if="loadError" class="directory-message error-message" role="alert">
      <div>
        <strong>Undertime Requests Could Not Be Loaded</strong>
        <p>{{ loadError }}</p>
      </div>
      <AppButton variant="secondary" size="sm" :disabled="loading" @click="loadRequests">Retry</AppButton>
    </div>

    <UndertimeApprovalTable
      :requests="paginatedRequests"
      :approving-id="approvingId"
      @approve="handleApprove"
    />

    <div class="table-footer">
      <p>Showing <strong>{{ showingFrom }}–{{ showingTo }}</strong> of <strong>{{ filteredRequests.length }}</strong> requests</p>
      <AppPagination v-model="currentPage" :total-pages="totalPages" />
    </div>
  </section>
</template>

<style scoped>
.undertime-approvals-page{width:100%;max-width:1660px;margin:0 auto}
.back-button{display:inline-flex;align-items:center;gap:6px;margin-bottom:10px;padding:0;border:0;background:transparent;color:var(--primary);font-size:10px;font-weight:600;cursor:pointer}.back-button:hover{color:var(--primary-dark)}
.table-footer{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:13px 3px 0}.table-footer p{margin:0;color:var(--text-muted);font-size:10px}.table-footer strong{color:var(--text-primary);font-weight:650}
.directory-message{display:flex;align-items:center;justify-content:center;gap:9px;min-height:65px;margin-bottom:14px;padding:15px;border:1px solid var(--border);border-radius:10px;background:var(--bg-card);color:var(--text-secondary);font-size:11px}.loading-icon{color:var(--primary);animation:spin 1s linear infinite}.error-message{justify-content:space-between;border-color:var(--red)}.error-message strong{color:var(--red);font-size:11px}.error-message p{margin:5px 0 0;color:var(--text-muted);font-size:10px}
@keyframes spin{to{transform:rotate(360deg)}}
@media(max-width:650px){.table-footer{align-items:flex-start;flex-direction:column}.error-message{align-items:flex-start;flex-direction:column}}
</style>
