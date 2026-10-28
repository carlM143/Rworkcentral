
<script setup lang="ts">
import { onMounted } from 'vue'
import { ArrowLeft, Download, SlidersHorizontal, RefreshCw } from 'lucide-vue-next'

import LeaveBalanceStats from '~/components/admin/leave/balances/LeaveBalanceStats.vue'
import LeaveBalanceFilters from '~/components/admin/leave/balances/LeaveBalanceFilters.vue'
import LeaveBalanceTable from '~/components/admin/leave/balances/LeaveBalanceTable.vue'
import { useLeaveBalances } from '~/composables/admin/leave-balances/useLeaveBalances'

definePageMeta({ layout: 'admin' })

const router = useRouter()
const route = useRoute()
const { info } = useToast()

const {
  balances,
  loading,
  loadError,
  search,
  department,
  status,
  currentPage,
  leaveTypes,
  filteredBalances,
  paginatedBalances,
  totalPages,
  showingFrom,
  showingTo,
  stats,
  departmentOptions,
  statusOptions,
  loadBalances,
  resetFilters,
} = useLeaveBalances()

onMounted(() => {
  console.log('[LeaveBalancesPage] Mounted:', route.fullPath)
  void loadBalances()
})

const handleBack = () => {
  router.push('/admin/leave-management')
}

const handleExport = () => {
  info(
    'Export Leave Balances',
    'Leave balance export functionality will be connected later.',
  )
}

const handleAdjustCredits = () => {
  info(
    'Adjust Leave Credits',
    'Manual credit adjustment will be connected after verifying the balance API.',
  )
}
</script>

<template>
  <section class="leave-balance-page">
    <button type="button" class="back-button" @click="handleBack">
      <ArrowLeft :size="15" />
      Back to Leave Management
    </button>

    <PageHeader
      title="Leave Balances"
      description="Monitor employee leave allocations, used credits and remaining leave balances."
    >
      <div class="header-actions">
        <AppButton
          variant="secondary"
          :icon="RefreshCw"
          :disabled="loading"
          @click="loadBalances"
        >
          {{ loading ? 'Refreshing...' : 'Refresh' }}
        </AppButton>

        <AppButton
          variant="secondary"
          :icon="Download"
          @click="handleExport"
        >
          Export
        </AppButton>

        <AppButton
          :icon="SlidersHorizontal"
          @click="handleAdjustCredits"
        >
          Adjust Credits
        </AppButton>
      </div>
    </PageHeader>

    <!-- STATISTICS -->
    <LeaveBalanceStats :stats="stats" />

    <!-- FILTERS -->
    <LeaveBalanceFilters
      v-model:search="search"
      v-model:department="department"
      v-model:status="status"
      :departments="departmentOptions"
      :statuses="statusOptions"
      @reset="resetFilters"
    />

    <!-- LOADING -->
    <div v-if="loading" class="directory-message">
      <RefreshCw :size="15" class="loading-icon" />
      Loading employee leave balances...
    </div>

    <!-- ERROR -->
    <div
      v-if="loadError"
      class="directory-message error-message"
      role="alert"
    >
      <div>
        <strong>Unable to Load Leave Balances</strong>
        <p>{{ loadError }}</p>
      </div>

      <AppButton
        variant="secondary"
        size="sm"
        :disabled="loading"
        @click="loadBalances"
      >
        Retry
      </AppButton>
    </div>

    <!-- TABLE -->
    <LeaveBalanceTable
      :balances="paginatedBalances"
      :leave-types="leaveTypes"
      @adjust="handleAdjustCredits"
    />

    <!-- EMPTY DATA NOTICE -->
    <div
      v-if="!loading && !loadError && !balances.length"
      class="empty-notice"
    >
      No leave credit transactions recorded yet.
      Eligible employee credits will appear after allocation.
    </div>

    <!-- PAGINATION -->
    <div class="table-footer">
      <p>
        Showing
        <strong>{{ showingFrom }}–{{ showingTo }}</strong>
        of
        <strong>{{ filteredBalances.length }}</strong>
        employee leave balances
      </p>

      <AppPagination
        v-model="currentPage"
        :total-pages="totalPages"
      />
    </div>
  </section>
</template>

<style scoped>
.leave-balance-page{width:100%;max-width:1660px;margin:0 auto}
.back-button{display:inline-flex;align-items:center;gap:6px;margin-bottom:10px;padding:0;border:0;background:transparent;color:var(--primary);font-size:10px;font-weight:600;cursor:pointer}
.back-button:hover{color:var(--primary-dark)}
.header-actions{display:flex;align-items:center;gap:8px}
.table-footer{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:13px 3px 0}
.table-footer p{margin:0;color:var(--text-muted);font-size:10px}
.table-footer strong{color:var(--text-primary);font-weight:650}
.directory-message{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px;min-height:60px;padding:14px;border:1px solid var(--border);border-radius:9px;background:var(--bg-card);color:var(--text-secondary);font-size:11px}
.error-message{border-color:var(--red)}
.error-message strong{color:var(--red)}
.error-message p{margin:5px 0 0;color:var(--text-muted);font-size:10px}
.loading-icon{animation:spin 1s linear infinite}
.empty-notice{padding:12px 3px;color:var(--text-muted);font-size:11px}
@keyframes spin{to{transform:rotate(360deg)}}
@media(max-width:650px){
  .header-actions{width:100%;align-items:stretch;flex-direction:column}
  .table-footer{align-items:flex-start;flex-direction:column}
  .directory-message{align-items:flex-start;flex-direction:column}
}
</style>
