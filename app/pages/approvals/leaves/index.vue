<script setup lang="ts">
import {
  Download,
  FileText,
  X,
  FileSpreadsheet,
  Table2,
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
} from 'lucide-vue-next'
import type { LeaveApproval } from '~/types/leaveApproval'
import LeaveApprovalStats from '~/components/approvals/leaves/LeaveApprovalStats.vue'
import LeaveApprovalFilters from '~/components/approvals/leaves/LeaveApprovalFilters.vue'
import LeaveApprovalTable from '~/components/approvals/leaves/LeaveApprovalTable.vue'

const router = useRouter()
const { success, warning } = useToast()
const {
  requests,
  search,
  department,
  leaveType,
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
  leaveTypeOptions,
  statusOptions,
  resetFilters,
} = useLeaveApprovals()

type ModalMode = 'view' | 'approve' | 'reject' | 'review' | null
type ExportFormat = 'excel' | 'pdf' | 'csv'

const modalMode = ref<ModalMode>(null)
const selectedId = ref<number | null>(null)
const reviewRemarks = ref('')
const formError = ref('')
const showExport = ref(false)
const exportFormat = ref<ExportFormat>('excel')

const selectedRequest = computed(() =>
  requests.value.find(item => item.id === selectedId.value) ?? null,
)

const formatDate = (value?: string) => {
  if (!value) return '—'
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value)
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date)
}

const pending = (item: LeaveApproval) =>
  item.status === 'Pending' || item.status === 'For Review'

const openModal = (mode: Exclude<ModalMode, null>, request: LeaveApproval) => {
  if ((mode === 'approve' || mode === 'reject') && !pending(request)) return
  selectedId.value = request.id
  modalMode.value = mode
  reviewRemarks.value = ''
  formError.value = ''
}

const closeModal = () => {
  modalMode.value = null
  selectedId.value = null
  formError.value = ''
}

const confirmDecision = () => {
  const item = selectedRequest.value
  if (!item || !pending(item)) return

  if (modalMode.value === 'reject' && !reviewRemarks.value.trim()) {
    formError.value = 'Please provide a reason for rejecting this leave request.'
    return
  }

  if (
    modalMode.value === 'approve' &&
    item.leaveType !== 'Unpaid Leave' &&
    item.availableBalance < item.totalDays
  ) {
    formError.value = 'Insufficient displayed leave balance. Review the request before approving.'
    return
  }

  item.status = modalMode.value === 'approve' ? 'Approved' : 'Rejected'
  item.reviewedBy = 'Maria Santos' // UI demo reviewer; replace with authenticated user
  item.reviewedAt = new Date().toISOString()
  item.remarks = reviewRemarks.value.trim() || undefined

  if (item.status === 'Approved') {
    success('Leave Approved', `${item.requestNumber} was approved in mock data.`)
  } else {
    warning('Leave Rejected', `${item.requestNumber} was rejected in mock data.`)
  }

  closeModal()
}

const exportFormats = [
  { value: 'excel' as const, label: 'Excel', description: 'HR leave reports and analysis', icon: FileSpreadsheet },
  { value: 'pdf' as const, label: 'PDF', description: 'Printable leave approval report', icon: FileText },
  { value: 'csv' as const, label: 'CSV', description: 'Raw leave approval records', icon: Table2 },
]

const openExport = () => {
  exportFormat.value = 'excel'
  showExport.value = true
}

const closeOnEscape = (event: KeyboardEvent) => {
  if (event.key !== 'Escape') return
  closeModal()
  showExport.value = false
}

onMounted(() => window.addEventListener('keydown', closeOnEscape))
onBeforeUnmount(() => window.removeEventListener('keydown', closeOnEscape))
</script>

<template>
  <section class="leave-approval-page">
    <PageHeader
      title="Leave Approvals"
      description="Review employee leave requests, available leave balances, requested dates and approval status."
    >
      <div class="header-actions">
        <AppButton variant="secondary" :icon="Download" @click="openExport">
          Export
        </AppButton>
        <AppButton :icon="FileText" @click="router.push('/filed-leaves')">
          View Filed Leaves
        </AppButton>
      </div>
    </PageHeader>

    <LeaveApprovalStats :stats="stats" />

    <LeaveApprovalFilters
      v-model:search="search"
      v-model:department="department"
      v-model:leave-type="leaveType"
      v-model:status="status"
      v-model:date-from="dateFrom"
      v-model:date-to="dateTo"
      :departments="departmentOptions"
      :leave-types="leaveTypeOptions"
      :statuses="statusOptions"
      @reset="resetFilters"
    />

    <LeaveApprovalTable
      :requests="paginatedRequests"
      @view="openModal('view', $event)"
      @approve="openModal('approve', $event)"
      @reject="openModal('reject', $event)"
      @review="openModal('review', $event)"
    />

    <div class="table-footer">
      <p>
        Showing <strong>{{ showingFrom }}–{{ showingTo }}</strong>
        of <strong>{{ filteredRequests.length }}</strong> leave approval requests
      </p>
      <AppPagination v-model="currentPage" :total-pages="totalPages" />
    </div>

    <!-- VIEW / DECISION / REVIEW MODAL -->
    <Teleport to="body">
      <div v-if="modalMode && selectedRequest" class="leave-overlay" @click.self="closeModal">
        <div class="leave-dialog" role="dialog" aria-modal="true" aria-label="Leave approval details">
          <div class="dialog-header">
            <div class="heading-group">
              <div class="heading-icon">
                <CalendarDays v-if="modalMode === 'view'" :size="19" />
                <CheckCircle2 v-else-if="modalMode === 'approve'" :size="19" />
                <AlertTriangle v-else-if="modalMode === 'reject'" :size="19" />
                <ClipboardList v-else :size="19" />
              </div>
              <div>
                <h2>
                  {{ modalMode === 'view' ? 'Leave Request Details' :
                    modalMode === 'approve' ? 'Approve Leave Request' :
                    modalMode === 'reject' ? 'Reject Leave Request' : 'Leave Review Details' }}
                </h2>
                <p>{{ selectedRequest.requestNumber }} · {{ selectedRequest.leaveType }}</p>
              </div>
            </div>
            <button type="button" class="close-button" aria-label="Close modal" @click="closeModal">
              <X :size="17" />
            </button>
          </div>

          <div class="dialog-body">
            <div class="employee-profile">
              <div>
                <strong>{{ selectedRequest.employeeName }}</strong>
                <p>{{ selectedRequest.employeeNumber }} · {{ selectedRequest.position }}</p>
              </div>
              <span class="status-label">{{ selectedRequest.status }}</span>
            </div>

            <h3 class="section-heading">Request Information</h3>
            <div class="details-grid">
              <div class="detail"><span>Department</span><strong>{{ selectedRequest.department }}</strong></div>
              <div class="detail"><span>Leave Type</span><strong>{{ selectedRequest.leaveType }}</strong></div>
              <div class="detail"><span>Start Date</span><strong>{{ formatDate(selectedRequest.startDate) }}</strong></div>
              <div class="detail"><span>End Date</span><strong>{{ formatDate(selectedRequest.endDate) }}</strong></div>
              <div class="detail"><span>Requested Days</span><strong>{{ selectedRequest.totalDays }} day(s)</strong></div>
              <div class="detail"><span>Displayed Balance</span><strong>{{ selectedRequest.availableBalance }} day(s)</strong></div>
              <div class="detail"><span>Immediate Supervisor</span><strong>{{ selectedRequest.immediateSupervisor }}</strong></div>
              <div class="detail"><span>Filed Date</span><strong>{{ formatDate(selectedRequest.filedAt) }}</strong></div>
            </div>

            <div class="note"><strong>Reason for Leave</strong><p>{{ selectedRequest.reason }}</p></div>

            <template v-if="modalMode === 'view' || modalMode === 'review'">
              <h3 class="section-heading">Review Information</h3>
              <div class="details-grid">
                <div class="detail"><span>Reviewed By</span><strong>{{ selectedRequest.reviewedBy || 'Not reviewed' }}</strong></div>
                <div class="detail"><span>Review Date</span><strong>{{ formatDate(selectedRequest.reviewedAt) }}</strong></div>
              </div>
              <div class="note"><strong>Remarks</strong><p>{{ selectedRequest.remarks || 'No remarks' }}</p></div>
            </template>

            <template v-else>
              <h3 class="section-heading">{{ modalMode === 'reject' ? 'Rejection Reason' : 'Approval Remarks' }}</h3>
              <label class="remarks-field">
                {{ modalMode === 'reject' ? 'Reason is required' : 'Optional remarks' }}
                <textarea
                  v-model="reviewRemarks"
                  rows="3"
                  :placeholder="modalMode === 'reject' ? 'Explain why this request is rejected...' : 'Enter approval notes (optional)...'"
                />
              </label>
              <p v-if="formError" class="error-text" role="alert">{{ formError }}</p>
              <p class="helper-text">This updates the Approval UI mock record only; no actual leave credits are deducted.</p>
            </template>
          </div>

          <div class="dialog-footer">
            <button type="button" class="modal-btn secondary" @click="closeModal">
              {{ modalMode === 'view' || modalMode === 'review' ? 'Close' : 'Cancel' }}
            </button>
            <button
              v-if="modalMode === 'approve' || modalMode === 'reject'"
              type="button"
              class="modal-btn"
              :class="modalMode === 'reject' ? 'danger' : 'primary'"
              @click="confirmDecision"
            >
              {{ modalMode === 'approve' ? 'Confirm Approval' : 'Confirm Rejection' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- EXPORT MODAL: UI ONLY -->
    <Teleport to="body">
      <div v-if="showExport" class="leave-overlay" @click.self="showExport = false">
        <div class="leave-dialog" role="dialog" aria-modal="true" aria-label="Export leave approvals">
          <div class="dialog-header">
            <div class="heading-group">
              <div class="heading-icon"><Download :size="19" /></div>
              <div><h2>Export Leave Approvals</h2><p>Export employee leave requests and approval status.</p></div>
            </div>
            <button type="button" class="close-button" aria-label="Close modal" @click="showExport = false"><X :size="17" /></button>
          </div>

          <div class="dialog-body">
            <div class="export-stats">
              <div class="stat"><span>Total</span><strong>{{ stats.totalRequests }}</strong></div>
              <div class="stat"><span>Pending Review</span><strong>{{ stats.pendingReview }}</strong></div>
              <div class="stat"><span>Approved</span><strong>{{ stats.approved }}</strong></div>
              <div class="stat"><span>Rejected</span><strong>{{ stats.rejected }}</strong></div>
            </div>

            <h3 class="section-heading">Export Format</h3>
            <div class="formats">
              <button
                v-for="format in exportFormats"
                :key="format.value"
                type="button"
                class="format-option"
                :class="{ active: exportFormat === format.value }"
                :aria-pressed="exportFormat === format.value"
                @click="exportFormat = format.value"
              >
                <component :is="format.icon" :size="20" />
                <strong>{{ format.label }}</strong>
                <span>{{ format.description }}</span>
              </button>
            </div>
            <div class="note">
              <strong>Included Data</strong>
              <p>Leave reference, employee, department, leave type, dates, requested days, available balance, supervisor, reason, status, reviewer and remarks.</p>
            </div>
            <p class="helper-text">Export UI preview only. No file will be downloaded.</p>
          </div>

          <div class="dialog-footer">
            <button type="button" class="modal-btn secondary" @click="showExport = false">Cancel</button>
            <button type="button" class="modal-btn primary" disabled><Download :size="15" /> Export {{ exportFormat.toUpperCase() }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.leave-approval-page { width: 100%; max-width: 1660px; margin: 0 auto; }
.header-actions { display: flex; align-items: center; gap: 8px; }
.table-footer { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 14px 3px 0; }
.table-footer p { margin: 0; color: var(--text-muted); font-size: 11px; }
.table-footer strong { color: var(--text-primary); font-weight: 650; }
.leave-overlay { position: fixed; inset: 0; z-index: 10010; display: flex; align-items: center; justify-content: center; padding: 18px; background: rgba(3, 12, 29, .78); backdrop-filter: blur(5px); }
.leave-dialog { width: 100%; max-width: 570px; max-height: 90vh; overflow-y: auto; border: 1px solid var(--border); border-radius: 13px; background: var(--bg-card); color: var(--text-primary); box-shadow: 0 25px 65px rgba(0, 0, 0, .25); }
.dialog-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 18px; border-bottom: 1px solid var(--border); }
.heading-group { display: flex; align-items: center; gap: 10px; }
.heading-icon { display: grid; flex-shrink: 0; width: 37px; height: 37px; place-items: center; border-radius: 9px; background: var(--primary-soft); color: var(--primary); }
.dialog-header h2 { margin: 0; font-size: 13px; }
.dialog-header p { margin: 4px 0 0; font-size: 9px; color: var(--text-muted); }
.close-button { display: grid; width: 29px; height: 29px; flex-shrink: 0; place-items: center; border: 1px solid var(--border); border-radius: 7px; background: transparent; color: var(--text-secondary); cursor: pointer; }
.dialog-body { display: flex; flex-direction: column; gap: 14px; padding: 18px; }
.dialog-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 13px 18px; border-top: 1px solid var(--border); }
.employee-profile { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 13px; border: 1px solid var(--border); border-radius: 9px; background: var(--bg-card-soft); }
.employee-profile strong { font-size: 12px; }
.employee-profile p { margin: 5px 0 0; color: var(--text-muted); font-size: 10px; }
.status-label { border-radius: 7px; padding: 5px 8px; color: var(--primary); background: var(--primary-soft); font-size: 10px; white-space: nowrap; }
.section-heading { margin: 3px 0 -3px; font-size: 11px; font-weight: 700; }
.details-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; }
.detail { display: flex; flex-direction: column; gap: 7px; padding: 11px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); }
.detail span { color: var(--text-muted); font-size: 9px; }
.detail strong { font-size: 10px; overflow-wrap: anywhere; }
.note { padding: 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); }
.note strong { font-size: 10px; }
.note p { margin: 6px 0 0; color: var(--text-secondary); font-size: 10px; line-height: 1.6; }
.remarks-field { display: flex; flex-direction: column; gap: 7px; font-size: 10px; font-weight: 600; }
.remarks-field textarea { width: 100%; padding: 11px; resize: vertical; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); color: var(--text-primary); font: inherit; font-weight: 400; }
.remarks-field textarea:focus { outline: none; border-color: var(--primary); }
.error-text { margin: 0; color: var(--red); font-size: 10px; }
.helper-text { margin: 0; color: var(--text-muted); font-size: 9px; line-height: 1.5; }
.modal-btn { display: inline-flex; min-height: 36px; align-items: center; justify-content: center; gap: 7px; padding: 0 14px; border: 1px solid transparent; border-radius: 8px; font-size: 10px; font-weight: 600; cursor: pointer; }
.modal-btn.secondary { border-color: var(--border); background: transparent; color: var(--text-primary); }
.modal-btn.primary { background: var(--primary); color: white; }
.modal-btn.danger { background: var(--red); color: white; }
.modal-btn:disabled { opacity: .55; cursor: not-allowed; }
.export-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 7px; }
.stat { display: flex; flex-direction: column; gap: 6px; padding: 10px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); }
.stat span { color: var(--text-muted); font-size: 8px; }
.stat strong { font-size: 14px; }
.formats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.format-option { display: flex; flex-direction: column; align-items: flex-start; gap: 7px; min-height: 95px; padding: 10px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); color: var(--text-primary); text-align: left; cursor: pointer; }
.format-option.active { border-color: var(--primary); background: var(--primary-soft); }
.format-option strong { font-size: 10px; }
.format-option span { color: var(--text-muted); font-size: 8px; line-height: 1.4; }
@media (max-width: 650px) {
  .header-actions { flex-direction: column; align-items: stretch; }
  .table-footer { flex-direction: column; align-items: flex-start; }
  .details-grid, .formats { grid-template-columns: 1fr; }
  .export-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>
