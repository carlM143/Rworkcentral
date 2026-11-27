<script setup lang="ts">
import { RefreshCw } from 'lucide-vue-next'
import ObaApprovalStats from '~/components/admin/approvals/oba/ObaApprovalStats.vue'
import ObaApprovalFilters from '~/components/admin/approvals/oba/ObaApprovalFilters.vue'
import ObaApprovalTable from '~/components/admin/approvals/oba/ObaApprovalTable.vue'
import ObaRequestDetailsDialog from '~/components/admin/approvals/oba/ObaRequestDetailsDialog.vue'
import BaseTableFooter from '~/components/shared-table/BaseTableFooter.vue'
import { useObaApprovals } from '~/composables/admin/approvals/useObaApprovals'
import type { ObaRequestRecord } from '~/types/oba-request/obaRequest'

definePageMeta({ layout: 'admin' })
useHead({ title: 'OBA Requests | Admin — RWorkCentral' })

const {
  requests, summary, search, statusFilter, dateFrom, dateTo,
  currentPage, totalPages, total, showingFrom, showingTo,
  loading, loadError, loadRequests, resetFilters,
  actingId, actionError, approveRequest, rejectRequest, isPendingDepartmentApprover,
} = useObaApprovals()

const { success } = useToast()

const { error: showError } = useToast()

const selected = ref<ObaRequestRecord | null>(null)
const startWithReject = ref(false)

const handleReview = (request: ObaRequestRecord) => {
  actionError.value = ''
  startWithReject.value = false
  selected.value = request
}

// Table "Reject" action: open the details dialog on the reason form.
const handleRejectFromTable = (request: ObaRequestRecord) => {
  actionError.value = ''
  startWithReject.value = true
  selected.value = request
}

const closeDetails = () => {
  actionError.value = ''
  startWithReject.value = false
  selected.value = null
}

/* Table "Approve" action: confirm with the shared ConfirmationModal. */
const approveTarget = ref<ObaRequestRecord | null>(null)

const approveMessage = computed(() => {
  const target = approveTarget.value
  if (!target) return ''
  const count = target.oba_employees?.length ?? 0
  return `${target.filer_name || 'This employee'}'s request to ${target.destination} for ${count} employee(s) will be approved.\n${isPendingDepartmentApprover(target) ? 'This records your department approval.' : 'This is the final HR approval.'}`
})

const confirmApproveFromTable = async () => {
  const target = approveTarget.value
  if (!target) return
  const res = await approveRequest(target.id)
  approveTarget.value = null
  if (res) success('OBA Request Approved', res.message || 'OBA request approved successfully.')
  else showError('Unable to Approve', actionError.value)
}

// Keep the dialog open and show the new status (and rejection reason).
const handleApprove = async (id: number) => {
  const res = await approveRequest(id)
  if (!res) return
  selected.value = res.data
  success('OBA Request Approved', res.message || 'OBA request approved successfully.')
}

const handleReject = async (id: number, reason: string) => {
  const res = await rejectRequest(id, reason)
  if (!res) return
  selected.value = res.data
  success('OBA Request Rejected', res.message || 'OBA request rejected.')
}

const refreshSelected = async () => {
  const id = selected.value?.id
  await loadRequests()
  if (id) selected.value = requests.value.find(item => item.id === id) ?? null
}

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

    <ObaApprovalTable
      :requests="requests"
      :loading="loading"
      @review="handleReview"
      @approve="request => (approveTarget = request)"
      @reject="handleRejectFromTable"
    />

    <BaseTableFooter
      v-model="currentPage"
      :showing-from="showingFrom"
      :showing-to="showingTo"
      :total-items="total"
      :total-pages="totalPages"
      item-label="requests"
    />

    <ConfirmationModal
      :open="!!approveTarget"
      title="Approve OBA Request?"
      :message="approveMessage"
      :confirm-text="actingId ? 'Approving…' : 'Approve'"
      :loading="!!actingId"
      @confirm="confirmApproveFromTable"
      @cancel="approveTarget = null"
    />

    <ObaRequestDetailsDialog
      :request="selected"
      :busy="!!selected && actingId === selected.id"
      :error="actionError"
      :start-with-reject="startWithReject"
      @close="closeDetails"
      @approve="handleApprove"
      @reject="handleReject"
      @overridden="refreshSelected"
    />
  </section>
</template>

<style scoped>
.oba-approvals-page { width: 100%; max-width: 1660px; margin: 0 auto; }
.header-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.directory-message { display: flex; align-items: center; justify-content: center; gap: 9px; min-height: 65px; margin-bottom: 14px; padding: 15px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg-card); color: var(--text-secondary); font-size: 12px; }
.loading-icon { color: var(--primary); animation: spin 1s linear infinite; }
.error-message { justify-content: space-between; border-color: var(--red); }
.error-message strong { color: var(--red); font-size: 12px; }
.error-message p { margin: 5px 0 0; color: var(--text-muted); font-size: 12px; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 650px) { .error-message { align-items: flex-start; flex-direction: column; } }
@media (prefers-reduced-motion: reduce) { .loading-icon { animation: none; } }
</style>