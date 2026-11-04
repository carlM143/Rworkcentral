<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Plus, RefreshCw, AlertTriangle, X } from 'lucide-vue-next'
import SalaryAdjustmentStats from '~/components/admin/employees/salary-adjustments/SalaryAdjustmentStats.vue'
import SalaryAdjustmentFilters from '~/components/admin/employees/salary-adjustments/SalaryAdjustmentFilters.vue'
import SalaryAdjustmentTable from '~/components/admin/employees/salary-adjustments/SalaryAdjustmentTable.vue'
import AddSalaryAdjustmentModal from '~/components/admin/employees/salary-adjustments/AddSalaryAdjustmentModal.vue'
import { useSalaryAdjustments, getSalaryAdjustmentApiError } from '~/composables/admin/salaryAdjustments/useSalaryAdjustments'
import { useToast } from '~/composables/useToast'
import type {
  ApprovalAction,
  CreateSalaryAdjustmentPayload,
  MoneyValue,
  SalaryAdjustment,
} from '~/types/salaryAdjustments/salaryAdjustment'

definePageMeta({ layout: 'admin' })

const {
  choices, loading, choicesLoading, loadError, choicesError,
  saving, mutating, mutationError, fieldErrors,
  search, status, adjustmentType, dateFrom, dateTo,
  currentPage, totalPages, showingFrom, showingTo,
  stats, filteredAdjustments, paginatedAdjustments,
  getAdjustments, getSalaryChoices, resetFilters, clearMutationError,
  createAdjustment, changeStatus,
} = useSalaryAdjustments()

const { success, error: showError } = useToast()
const showCreate = ref(false)
const selectedDetail = ref<SalaryAdjustment | null>(null)
const pendingConfirmation = ref<{ action: ApprovalAction; item: SalaryAdjustment } | null>(null)
const confirmationError = ref('')

onMounted(() => {
  void Promise.all([getAdjustments(), getSalaryChoices()])
})

const refresh = async () => {
  await Promise.all([getAdjustments(), getSalaryChoices()])
}

const openCreate = async () => {
  clearMutationError()
  showCreate.value = true
  if (choicesError.value || !choices.value.length) await getSalaryChoices()
}

const submitCreate = async (payload: CreateSalaryAdjustmentPayload) => {
  try {
    await createAdjustment(payload)
    showCreate.value = false
    success('Salary Adjustment Created', 'The adjustment is pending approval. Current salary is unchanged.')
    await getAdjustments()
  } catch {
    // Validation and API errors are displayed inside the modal.
  }
}

const askForConfirmation = (action: ApprovalAction, item: SalaryAdjustment) => {
  confirmationError.value = ''
  pendingConfirmation.value = { action, item }
}

const closeConfirmation = () => {
  if (!mutating.value) pendingConfirmation.value = null
}

const confirmAction = async () => {
  const target = pendingConfirmation.value
  if (!target) return
  confirmationError.value = ''
  try {
    await changeStatus(target.item, target.action)
    pendingConfirmation.value = null
    success('Salary Adjustment Updated', `Adjustment successfully ${target.action === 'apply' ? 'applied' : target.action === 'approve' ? 'approved' : 'rejected'}.`)
    await getAdjustments()
    if (target.action === 'apply') await getSalaryChoices()
  } catch (error: unknown) {
    confirmationError.value = getSalaryAdjustmentApiError(error).message
    showError('Unable to Update Salary Adjustment', confirmationError.value)
  }
}

const confirmationTitle = computed(() => {
  if (!pendingConfirmation.value) return ''
  return {
    approve: 'Approve Salary Adjustment?',
    reject: 'Reject Salary Adjustment?',
    apply: 'Apply Salary Adjustment?',
  }[pendingConfirmation.value.action]
})

const confirmationText = computed(() => {
  const target = pendingConfirmation.value
  if (!target) return ''
  if (target.action === 'apply') {
    return 'This will update the employee salary setup. The backend only allows approved adjustments on or after their effective date.'
  }
  if (target.action === 'approve') return 'Approval records the decision but does not change the employee salary yet.'
  return 'Rejecting will close this pending adjustment without changing the employee salary.'
})

const money = (value: MoneyValue) => value == null ? '—' :
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(value))
</script>

<template>
  <section class="salary-adjustments-page">
    <PageHeader title="Salary Adjustments" description="Review, approve and manually apply employee salary changes.">
      <div class="header-actions">
        <AppButton variant="secondary" :icon="RefreshCw" :disabled="loading || mutating || saving" @click="refresh">
          Refresh
        </AppButton>
        <AppButton :icon="Plus" :disabled="mutating || saving" @click="openCreate">
          Add Salary Adjustment
        </AppButton>
      </div>
    </PageHeader>

    <SalaryAdjustmentStats :stats="stats" />

    <SalaryAdjustmentFilters
      v-model:search="search"
      v-model:status="status"
      v-model:adjustment-type="adjustmentType"
      v-model:date-from="dateFrom"
      v-model:date-to="dateTo"
      @reset="resetFilters"
    />

    <div v-if="loadError" class="api-error" role="alert">
      <AlertTriangle :size="17" />
      <div><strong>Unable to load salary adjustments</strong><p>{{ loadError }}</p></div>
      <AppButton variant="secondary" size="sm" @click="getAdjustments">Retry</AppButton>
    </div>
    <SalaryAdjustmentTable
      v-else
      :adjustments="paginatedAdjustments"
      :loading="loading"
      :busy="mutating"
      @view="selectedDetail = $event"
      @approve="askForConfirmation('approve', $event)"
      @reject="askForConfirmation('reject', $event)"
      @apply="askForConfirmation('apply', $event)"
    />

    <div v-if="!loading && !loadError" class="table-footer">
      <p>Showing <strong>{{ showingFrom }}–{{ showingTo }}</strong> of <strong>{{ filteredAdjustments.length }}</strong> salary adjustments</p>
      <AppPagination v-model="currentPage" :total-pages="totalPages" />
    </div>

    <AddSalaryAdjustmentModal
      :open="showCreate"
      :employees="choices"
      :loading-employees="choicesLoading"
      :employees-error="choicesError"
      :saving="saving"
      :api-error="mutationError"
      :field-errors="fieldErrors"
      @close="showCreate = false"
      @save="submitCreate"
    />

    <!-- Record detail modal. -->
    <Teleport to="body">
      <div v-if="selectedDetail" class="dialog-backdrop" @mousedown.self="selectedDetail = null">
        <section class="detail-dialog" role="dialog" aria-modal="true" aria-labelledby="adjustment-details-title">
          <div class="dialog-header">
            <div>
              <h2 id="adjustment-details-title">Salary Adjustment #{{ selectedDetail.id }}</h2>
              <p>{{ selectedDetail.employee_name }} · {{ selectedDetail.emp_id || selectedDetail.employee_id }}</p>
            </div>
            <button type="button" class="close-button" aria-label="Close details" @click="selectedDetail = null"><X :size="17" /></button>
          </div>
          <div class="detail-grid">
            <div><span>Salary Type</span><strong>{{ selectedDetail.salary_type || '—' }}</strong></div>
            <div><span>Adjustment Type</span><strong class="capitalize">{{ selectedDetail.adjustment_type }}</strong></div>
            <div><span>Previous Basic Salary</span><strong>{{ money(selectedDetail.previous_basic_salary) }}</strong></div>
            <div><span>New Basic Salary</span><strong>{{ money(selectedDetail.new_basic_salary) }}</strong></div>
            <div><span>Previous Allowance</span><strong>{{ money(selectedDetail.previous_allowance) }}</strong></div>
            <div><span>New Allowance</span><strong>{{ money(selectedDetail.new_allowance) }}</strong></div>
            <div><span>Effective Date</span><strong>{{ selectedDetail.effective_date }}</strong></div>
            <div><span>Status</span><strong class="capitalize">{{ selectedDetail.status }}</strong></div>
            <div><span>Approved By</span><strong>{{ selectedDetail.approved_by_name || '—' }}</strong></div>
            <div><span>Approved At</span><strong>{{ selectedDetail.approved_at || '—' }}</strong></div>
            <div><span>Applied By</span><strong>{{ selectedDetail.applied_by_name || '—' }}</strong></div>
            <div><span>Applied At</span><strong>{{ selectedDetail.applied_at || '—' }}</strong></div>
            <div class="full-width"><span>Reason</span><strong>{{ selectedDetail.reason || 'Not provided' }}</strong></div>
          </div>
          <div class="dialog-footer"><button class="button secondary" type="button" @click="selectedDetail = null">Close</button></div>
        </section>
      </div>
    </Teleport>

    <!-- Confirmation required for approval, rejection and actual salary application. -->
    <Teleport to="body">
      <div v-if="pendingConfirmation" class="dialog-backdrop" @mousedown.self="closeConfirmation">
        <section class="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="adjustment-confirm-title">
          <div class="dialog-header">
            <div>
              <h2 id="adjustment-confirm-title">{{ confirmationTitle }}</h2>
              <p>{{ pendingConfirmation.item.employee_name }}</p>
            </div>
            <button type="button" class="close-button" aria-label="Cancel" :disabled="mutating" @click="pendingConfirmation = null"><X :size="17" /></button>
          </div>
          <div class="confirm-content">
            <p>{{ confirmationText }}</p>
            <p><strong>New basic salary:</strong> {{ money(pendingConfirmation.item.new_basic_salary) }}</p>
            <p v-if="confirmationError" class="inline-error" role="alert">{{ confirmationError }}</p>
          </div>
          <div class="dialog-footer">
            <button type="button" class="button secondary" :disabled="mutating" @click="pendingConfirmation = null">Cancel</button>
            <button type="button" class="button primary" :disabled="mutating" @click="confirmAction">{{ mutating ? 'Processing...' : 'Confirm' }}</button>
          </div>
        </section>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.salary-adjustments-page { width: 100%; max-width: 1660px; margin: 0 auto; }
.header-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
.api-error { display: flex; align-items: center; gap: 13px; margin-bottom: 12px; padding: 13px; border: 1px solid rgba(244,63,94,.3); border-radius: 10px; background: rgba(244,63,94,.07); color: #fb7185; }
.api-error div { flex: 1; min-width: 0; }
.api-error strong { font-size: 12px; }
.api-error p { margin: 5px 0 0; font-size: 11px; overflow-wrap: anywhere; }
.table-footer { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 13px 3px 0; }
.table-footer p { margin: 0; color: var(--text-muted); font-size: 10px; }
.table-footer strong { color: var(--text-primary); font-weight: 600; }
.dialog-backdrop { position: fixed; inset: 0; z-index: 9200; display: flex; align-items: center; justify-content: center; padding: 18px; background: rgba(2,6,23,.75); backdrop-filter: blur(5px); }
.detail-dialog, .confirm-dialog { width: min(610px, 100%); max-height: 90vh; overflow-y: auto; border: 1px solid var(--border); border-radius: 13px; background: var(--bg-card); box-shadow: 0 28px 70px rgba(0,0,0,.4); }
.confirm-dialog { width: min(460px, 100%); }
.dialog-header { display: flex; justify-content: space-between; gap: 15px; padding: 20px 22px; border-bottom: 1px solid var(--border); }
.dialog-header h2 { margin: 0; color: var(--text-primary); font-size: 17px; font-weight: 700; }
.dialog-header p { margin: 5px 0 0; color: var(--text-muted); font-size: 12px; }
.close-button { width: 33px; height: 33px; display: grid; place-items: center; flex-shrink: 0; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--text-secondary); cursor: pointer; }
.detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 15px; padding: 20px 22px; }
.detail-grid > div { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.detail-grid span { color: var(--text-muted); font-size: 11px; }
.detail-grid strong { color: var(--text-primary); font-size: 12px; font-weight: 600; overflow-wrap: anywhere; }
.full-width { grid-column: 1 / -1; }
.capitalize { text-transform: capitalize; }
.confirm-content { padding: 20px 22px; color: var(--text-secondary); font-size: 12px; line-height: 1.6; }
.confirm-content p { margin: 0 0 12px; }
.confirm-content strong { color: var(--text-primary); }
.confirm-content .inline-error { color: #fb7185; }
.dialog-footer { display: flex; gap: 8px; justify-content: flex-end; padding: 15px 22px 20px; border-top: 1px solid var(--border); }
.button { min-height: 36px; padding: 8px 15px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; }
.button.secondary { border: 1px solid var(--border); background: transparent; color: var(--text-primary); }
.button.primary { border: 1px solid #2563eb; background: #2563eb; color: #fff; }
.button:disabled { cursor: not-allowed; opacity: .5; }
@media (max-width: 650px) { .table-footer { flex-direction: column; align-items: flex-start; } .detail-grid { grid-template-columns: 1fr; } }
</style>