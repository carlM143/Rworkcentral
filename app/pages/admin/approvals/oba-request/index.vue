<script setup lang="ts">
import { RefreshCw } from 'lucide-vue-next'
import ObaApprovalStats from '~/components/admin/approvals/oba/ObaApprovalStats.vue'
import ObaApprovalFilters from '~/components/admin/approvals/oba/ObaApprovalFilters.vue'
import ObaApprovalTable from '~/components/admin/approvals/oba/ObaApprovalTable.vue'
import ObaRequestDetailsDialog from '~/components/admin/approvals/oba/ObaRequestDetailsDialog.vue'
import { useObaApprovals } from '~/composables/admin/approvals/useObaApprovals'
import type { ObaRequestRecord } from '~/types/oba-request/obaRequest'

definePageMeta({ layout: 'admin' })
useHead({ title: 'OBA Requests | Admin — RWorkCentral' })

const {
  requests, summary, search, statusFilter, dateFrom, dateTo,
  currentPage, totalPages, total, showingFrom, showingTo,
  loading, loadError, loadRequests, resetFilters,
} = useObaApprovals()

const selected = ref<ObaRequestRecord | null>(null)
const handleReview = (request: ObaRequestRecord) => { selected.value = request }

onMounted(() => { void loadRequests() })
</script>

<template>
  <section class="oba-approvals-page">
    <PageHeader
      title="Official Business Authorization"
      description="Review Official Business Authorization requests filed by employees."
    >
      <div class="header-actions">
        <AppButton variant="secondary" :icon="RefreshCw" :disabled="loading" @click="loadRequests">
          {{ loading ? 'Refreshing...' : 'Refresh' }}
        </AppButton>
      </div>
    </PageHeader>

    <ObaApprovalStats :summary="summary" />

    <ObaApprovalFilters
      v-model:search="search"
      v-model:status="statusFilter"
      v-model:date-from="dateFrom"
      v-model:date-to="dateTo"
      @reset="resetFilters"
    />

    <div v-if="loading" class="directory-message" role="status">
      <RefreshCw :size="15" class="loading-icon" />
      {{ requests.length ? 'Refreshing OBA requests...' : 'Loading OBA requests...' }}
    </div>

    <div v-if="loadError" class="directory-message error-message" role="alert">
      <div><strong>OBA Requests Could Not Be Loaded</strong><p>{{ loadError }}</p></div>
      <AppButton variant="secondary" size="sm" :disabled="loading" @click="loadRequests">Retry</AppButton>
    </div>

    <ObaApprovalTable :requests="requests" :loading="loading" @review="handleReview" />

    <div class="table-footer">
      <p>Showing <strong>{{ showingFrom }}–{{ showingTo }}</strong> of <strong>{{ total }}</strong> requests</p>
      <AppPagination v-model="currentPage" :total-pages="totalPages" />
    </div>

    <ObaRequestDetailsDialog :request="selected" @close="selected = null" />
  </section>
</template>

<style scoped>
.oba-approvals-page { width: 100%; max-width: 1660px; margin: 0 auto; }
.header-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.table-footer { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 13px 3px 0; }
.table-footer p { margin: 0; color: var(--text-muted); font-size: 12px; }
.table-footer strong { color: var(--text-primary); font-weight: 650; }
.directory-message { display: flex; align-items: center; justify-content: center; gap: 9px; min-height: 65px; margin-bottom: 14px; padding: 15px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg-card); color: var(--text-secondary); font-size: 12px; }
.loading-icon { color: var(--primary); animation: spin 1s linear infinite; }
.error-message { justify-content: space-between; border-color: var(--red); }
.error-message strong { color: var(--red); font-size: 12px; }
.error-message p { margin: 5px 0 0; color: var(--text-muted); font-size: 12px; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 650px) { .table-footer, .error-message { align-items: flex-start; flex-direction: column; } }
@media (prefers-reduced-motion: reduce) { .loading-icon { animation: none; } }
</style>