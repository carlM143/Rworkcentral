
<script setup lang="ts">
import { ArrowLeft, RefreshCw } from 'lucide-vue-next'

import LeaveApprovalStats from '~/components/admin/approvals/leaves/LeaveApprovalStats.vue'
import LeaveApprovalFilters from '~/components/admin/approvals/leaves/LeaveApprovalFilters.vue'
import LeaveApprovalTable from '~/components/admin/approvals/leaves/LeaveApprovalTable.vue'
import LeaveApprovalReviewModal from '~/components/admin/approvals/leaves/LeaveApprovalReviewModal.vue'
import { useLeaveApprovals } from '~/composables/admin/approvals/useLeaveApprovals'

definePageMeta({ layout: 'admin' })

const router = useRouter()

const {
  requests,
  search,
  statusFilter,
  currentPage,
  stats,
  paginatedRequests,
  filteredRequests,
  totalPages,
  showingFrom,
  showingTo,
  loading,
  loadError,
  selectedRequest,
  approving,
  approvalProblem,
  loadRequests,
  resetFilters,
  openApproval,
  closeApproval,
  handleApprove,
} = useLeaveApprovals()

onMounted(() => { void loadRequests() })
</script>

<template>
  <section class="leave-approvals-page">

    <!-- BACK -->
    <button
      type="button"
      class="back-button"
      @click="router.push('/admin/approvals')"
    >
      <ArrowLeft :size="15" />
      Back to Approval Center
    </button>

    <!-- HEADER -->
    <PageHeader
      title="Leave Approvals"
      description="Review employee leave applications, payment classifications and approval status."
    >
      <AppButton
        variant="secondary"
        :icon="RefreshCw"
        :disabled="loading"
        @click="loadRequests"
      >
        {{ loading ? 'Refreshing...' : 'Refresh' }}
      </AppButton>
    </PageHeader>

    <!-- STATISTICS -->
    <LeaveApprovalStats :stats="stats" />

    <!-- FILTERS -->
    <LeaveApprovalFilters
      v-model:search="search"
      v-model:status="statusFilter"
      @reset="resetFilters"
    />

    <!-- LOADING MESSAGE -->
    <div
      v-if="loading"
      class="directory-message"
    >
      <RefreshCw :size="15" class="loading-icon" />
      {{ requests.length ? 'Refreshing leave requests...' : 'Loading employee leave requests...' }}
    </div>

    <!-- API ERROR -->
    <div
      v-if="loadError"
      class="directory-message error-message"
      role="alert"
    >
      <div>
        <strong>Leave Requests Could Not Be Loaded</strong>
        <p>{{ loadError }}</p>
      </div>

      <AppButton
        variant="secondary"
        size="sm"
        :disabled="loading"
        @click="loadRequests"
      >
        Retry
      </AppButton>
    </div>

    <!-- TABLE: REMAINS MOUNTED -->
    <LeaveApprovalTable
      :requests="paginatedRequests"
      :status-filter="statusFilter"
      @review="openApproval"
    />

    <!-- PAGINATION -->
    <div class="table-footer">
      <p>
        Showing
        <strong>{{ showingFrom }}–{{ showingTo }}</strong>
        of
        <strong>{{ filteredRequests.length }}</strong>
        requests
      </p>

      <AppPagination
        v-model="currentPage"
        :total-pages="totalPages"
      />
    </div>

    <!-- APPROVAL MODAL -->
    <LeaveApprovalReviewModal
      :request="selectedRequest"
      :approving="approving"
      :blocked-reason="approvalProblem"
      @close="closeApproval"
      @approve="handleApprove"
    />

  </section>
</template>

<style scoped>
.leave-approvals-page{width:100%;max-width:1660px;margin:0 auto}
.back-button{display:inline-flex;align-items:center;gap:6px;margin-bottom:10px;padding:0;border:0;background:transparent;color:var(--primary);font-size:10px;font-weight:600;cursor:pointer}
.back-button:hover{color:var(--primary-dark)}
.table-footer{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:13px 3px 0}
.table-footer p{margin:0;color:var(--text-muted);font-size:10px}
.table-footer strong{color:var(--text-primary);font-weight:650}
.directory-message{display:flex;align-items:center;justify-content:center;gap:9px;min-height:65px;margin-bottom:14px;padding:15px;border:1px solid var(--border);border-radius:10px;background:var(--bg-card);color:var(--text-secondary);font-size:11px}
.loading-icon{color:var(--primary);animation:spin 1s linear infinite}
.error-message{justify-content:space-between;border-color:var(--red)}
.error-message strong{color:var(--red);font-size:11px}
.error-message p{margin:5px 0 0;color:var(--text-muted);font-size:10px}
@keyframes spin{to{transform:rotate(360deg)}}
@media(max-width:650px){
  .table-footer{align-items:flex-start;flex-direction:column}
  .error-message{align-items:flex-start;flex-direction:column}
}
</style>
