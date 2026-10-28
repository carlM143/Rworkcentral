
<script setup lang="ts">
import { ArrowLeft, Download, Plus } from 'lucide-vue-next'
import LeavePolicyStats from '~/components/admin/leave/policies/LeavePolicyStats.vue'
import LeavePolicyFilters from '~/components/admin/leave/policies/LeavePolicyFilters.vue'
import LeavePolicyTable from '~/components/admin/leave/policies/LeavePolicyTable.vue'
import { useLeavePolicies } from '~/composables/admin/leave/useLeavePolicies'
import { useLeavePolicyApi } from '~/composables/admin/leave/useLeavePolicyApi'
import type { LeavePolicy } from '~/types/leavePolicy'

const router = useRouter()
const { success, info, error: showError } = useToast()
const { deleteLeavePolicy } = useLeavePolicyApi()

const {
  leaveTypeOptions,
  employmentTypeOptions,
  loading,
  optionsLoading,
  loadError,
  optionsError,
  search,
  status,
  leaveTypeId,
  employmentTypeId,
  currentPage,
  stats,
  filteredPolicies,
  paginatedPolicies,
  totalPages,
  showingFrom,
  showingTo,
  resetFilters,
  loadPolicies,
  loadOptions,
} = useLeavePolicies()

const deleting = ref(false)
const pageUrl = '/admin/leave-management/leave-policies'

const getErrorMessage = (problem: any): string => {
  const data = problem?.data ?? problem?.response?._data ?? {}
  const firstError = Object.values(data.errors ?? {}).flat()[0]
  return String(firstError || data.message || problem?.message || 'Request failed.')
}

onMounted(() => {
  void loadPolicies()
  void loadOptions()
})

// NAVIGATION
const handleBack = () => router.push('/admin/leave-management')

const handleAdd = () => {
  router.push(`${pageUrl}/create`)
}

const handleEdit = (policy: LeavePolicy) => {
  router.push(`${pageUrl}/${policy.id}/edit`)
}

// DELETE
const handleDelete = async (policy: LeavePolicy) => {
  if (deleting.value) return

  const confirmed = window.confirm(
    `Delete the "${policy.leaveTypeName}" policy for "${policy.employmentTypeName}"?\n\nThis action cannot be undone.`
  )

  if (!confirmed) return

  deleting.value = true

  try {
    const response = await deleteLeavePolicy(policy.id)

    if (response.success === false) throw new Error(response.message)

    success(
      'Leave Policy Deleted',
      response.message || 'Leave policy deleted successfully.',
    )

    await loadPolicies()
  } catch (problem) {
    showError('Unable to Delete Leave Policy', getErrorMessage(problem))
  } finally {
    deleting.value = false
  }
}

// EXPORT CSV
const handleExport = () => {
  if (!filteredPolicies.value.length) {
    info('No Records', 'There are no leave policies to export.')
    return
  }

  const rows = [
    [
      'ID', 'Leave Type', 'Leave Code', 'Employment Type',
      'Eligible', 'Paid', 'Annual Credits', 'Min Service Months',
      'Carry Over', 'Max Carry Over Days', 'Requires Approval',
      'Usage Window', 'Validity Period', 'Effective From',
      'Effective To', 'Status',
    ],
    ...filteredPolicies.value.map(item => [
      item.id,
      item.leaveTypeName,
      item.leaveTypeCode,
      item.employmentTypeName,
      item.isEligible ? 'Yes' : 'No',
      item.isPaid ? 'Yes' : 'No',
      item.annualCredits,
      item.minServiceMonths,
      item.allowCarryOver ? 'Yes' : 'No',
      item.maxCarryOverDays,
      item.requiresApproval ? 'Yes' : 'No',
      item.usageWindow,
      item.validityPeriod,
      item.effectiveFrom,
      item.effectiveTo,
      item.status,
    ]),
  ]

  const csvCell = (value: string | number) => {
    const text = String(value ?? '')
    const safe = /^\s*[=+\-@\t\r]/.test(text) ? `'${text}` : text
    return `"${safe.replace(/"/g, '""')}"`
  }

  const csv = rows.map(row => row.map(csvCell).join(',')).join('\r\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = 'leave-policies.csv'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <section class="leave-policies-page">

    <!-- BACK -->
    <button type="button" class="back-button" @click="handleBack">
      <ArrowLeft :size="15" />
      Back to Leave Management
    </button>

    <!-- HEADER -->
    <PageHeader
      title="Leave Policies"
      description="Configure employee leave eligibility, annual credits, paid leave, carry-over, approvals and validity periods."
    >
      <div class="header-actions">
        <AppButton variant="secondary" :icon="Download" @click="handleExport">
          Export
        </AppButton>

        <AppButton :icon="Plus" @click="handleAdd">
          Add Leave Policy
        </AppButton>
      </div>
    </PageHeader>

    <!-- API ERROR -->
    <div v-if="loadError" class="directory-message error-message" role="alert">
      <div>
        <strong>Leave Policies Could Not Be Loaded</strong>
        <p>{{ loadError }}</p>
      </div>

      <AppButton variant="secondary" @click="loadPolicies">
        Retry
      </AppButton>
    </div>

    <!-- LOOKUP ERROR -->
    <div v-if="optionsError" class="directory-message warning-message" role="alert">
      <div>
        <strong>Dropdown Options Could Not Be Loaded</strong>
        <p>{{ optionsError }}</p>
      </div>

      <AppButton variant="secondary" @click="loadOptions">
        Retry
      </AppButton>
    </div>

    <template v-if="!loadError">

      <!-- STATS -->
      <LeavePolicyStats :stats="stats" />

      <!-- FILTERS -->
      <LeavePolicyFilters
        v-model:search="search"
        v-model:status="status"
        v-model:leave-type-id="leaveTypeId"
        v-model:employment-type-id="employmentTypeId"
        :leave-types="leaveTypeOptions"
        :employment-types="employmentTypeOptions"
        @reset="resetFilters"
      />

      <!-- LOADING -->
      <div v-if="loading" class="directory-message">
        Loading leave policies...
      </div>

      <template v-else>
        <!-- TABLE -->
        <LeavePolicyTable
          :policies="paginatedPolicies"
          :busy="deleting"
          @edit="handleEdit"
          @delete="handleDelete"
        />

        <!-- PAGINATION -->
        <div class="table-footer">
          <p>
            Showing
            <strong>{{ showingFrom }}–{{ showingTo }}</strong>
            of
            <strong>{{ filteredPolicies.length }}</strong>
            leave policies
          </p>

          <AppPagination
            v-model="currentPage"
            :total-pages="totalPages"
          />
        </div>
      </template>
    </template>
  </section>
</template>

<style scoped>
.leave-policies-page{width:100%;max-width:1660px;margin:0 auto}
.back-button{display:inline-flex;align-items:center;gap:6px;margin-bottom:10px;padding:0;border:0;background:transparent;color:var(--primary);font-size:10px;font-weight:600;cursor:pointer}
.back-button:hover{color:var(--primary-dark)}
.header-actions{display:flex;align-items:center;gap:8px}
.table-footer{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:13px 3px 0}
.table-footer p{margin:0;color:var(--text-muted);font-size:10px}
.table-footer strong{color:var(--text-primary);font-weight:650}
.directory-message{display:flex;align-items:center;justify-content:space-between;gap:15px;min-height:65px;margin-bottom:14px;padding:15px;border:1px solid var(--border);border-radius:10px;background:var(--bg-card);color:var(--text-secondary);font-size:11px}
.directory-message strong{font-size:11px}
.directory-message p{margin:5px 0 0;color:var(--text-muted);font-size:10px}
.error-message{border-color:var(--red)}
.error-message strong{color:var(--red)}
.warning-message{border-color:var(--orange)}
.warning-message strong{color:var(--orange)}
@media(max-width:650px){
  .header-actions{width:100%;align-items:stretch;flex-direction:column}
  .table-footer{align-items:flex-start;flex-direction:column}
  .directory-message{align-items:flex-start;flex-direction:column}
}
</style>
