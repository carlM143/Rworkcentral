<script setup lang="ts">
import {
  CheckCircle2,
  Download,
  X,
  Timer,
  FileSpreadsheet,
  FileText,
  Table2,
  ShieldCheck,
  XCircle,
} from 'lucide-vue-next'
import type { OvertimeApproval } from '~/types/overtimeApproval'
import OvertimeApprovalStats from '~/components/approvals/overtime/OvertimeApprovalStats.vue'
import OvertimeApprovalFilters from '~/components/approvals/overtime/OvertimeApprovalFilters.vue'
import OvertimeApprovalTable from '~/components/approvals/overtime/OvertimeApprovalTable.vue'

const router = useRouter()
const { success, warning } = useToast()

const {
  requests,
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
} = useOvertimeApprovals()

type ModalMode = 'view' | 'approve' | 'reject' | 'review' | null
type ExportFormat = 'excel' | 'pdf' | 'csv'

const modalMode = ref<ModalMode>(null)
const selectedId = ref<number | null>(null)
const showExport = ref(false)
const exportFormat = ref<ExportFormat>('excel')
const approvedHours = ref<number | null>(null)
const remarks = ref('')
const errorMessage = ref('')

const selected = computed(() =>
  requests.value.find(item => item.id === selectedId.value) ?? null,
)

const exportFormats = [
  {
    value: 'excel' as const,
    label: 'Excel',
    description: 'HR overtime approval reports and analysis.',
    icon: FileSpreadsheet,
  },
  {
    value: 'pdf' as const,
    label: 'PDF',
    description: 'Printable overtime approval records.',
    icon: FileText,
  },
  {
    value: 'csv' as const,
    label: 'CSV',
    description: 'Raw data for external processing.',
    icon: Table2,
  },
]

const canReview = (item: OvertimeApproval) =>
  item.status === 'Pending' || item.status === 'For Review'

const formatDate = (value?: string) => {
  if (!value) return '—'
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value)
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date)
}

const formatTime = (value: string) => {
  const [hour = 0, minute = 0] = value.split(':').map(Number)
  const date = new Date(2000, 0, 1, hour, minute)
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

const openModal = (mode: Exclude<ModalMode, null>, item: OvertimeApproval) => {
  if ((mode === 'approve' || mode === 'reject') && !canReview(item)) return
  modalMode.value = mode
  selectedId.value = item.id
  approvedHours.value = mode === 'approve' ? item.requestedHours : null
  remarks.value = ''
  errorMessage.value = ''
}

const closeModal = () => {
  modalMode.value = null
  selectedId.value = null
  errorMessage.value = ''
}

const submitDecision = () => {
  const item = selected.value
  if (!item || !canReview(item)) return

  errorMessage.value = ''

  if (modalMode.value === 'approve') {
    const hours = approvedHours.value
    if (hours === null || !Number.isFinite(hours) || hours <= 0 || hours > item.requestedHours) {
      errorMessage.value = `Approved hours must be greater than 0 and no more than ${item.requestedHours} hours.`
      return
    }

    // Whole or half-hour approvals for the current mock workflow.
    if (!Number.isInteger(hours * 2)) {
      errorMessage.value = 'Use 0.5-hour increments (for example, 2.5 hours).'
      return
    }

    item.approvedHours = hours
    item.status = 'Approved'
    item.reviewedBy = 'Maria Santos' // Mock reviewer; replace with authenticated user later.
    item.reviewedAt = new Date().toISOString()
    item.remarks = remarks.value.trim() || undefined
    success('Overtime Approved', `${item.requestNumber} approved for ${hours} hours (mock data).`)
    closeModal()
    return
  }

  if (modalMode.value === 'reject') {
    if (!remarks.value.trim()) {
      errorMessage.value = 'A rejection reason is required.'
      return
    }

    item.approvedHours = 0
    item.status = 'Rejected'
    item.reviewedBy = 'Maria Santos' // Mock reviewer; replace with authenticated user later.
    item.reviewedAt = new Date().toISOString()
    item.remarks = remarks.value.trim()
    warning('Overtime Rejected', `${item.requestNumber} has been rejected (mock data).`)
    closeModal()
  }
}

const openExport = () => {
  exportFormat.value = 'excel'
  showExport.value = true
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key !== 'Escape') return
  closeModal()
  showExport.value = false
}

onMounted(() => window.addEventListener('keydown', handleEscape))
onBeforeUnmount(() => window.removeEventListener('keydown', handleEscape))
</script>

<template>
  <section class="overtime-approval-page">
    <PageHeader
      title="OT Approvals"
      description="Review employee overtime requests, requested hours, schedules, justification and approval status."
    >
      <div class="header-actions">
        <AppButton variant="secondary" :icon="Download" @click="openExport">
          Export
        </AppButton>
        <AppButton :icon="CheckCircle2" @click="router.push('/approved-overtime')">
          Approved Overtime
        </AppButton>
      </div>
    </PageHeader>

    <OvertimeApprovalStats :stats="stats" />

    <OvertimeApprovalFilters
      v-model:search="search"
      v-model:department="department"
      v-model:overtime-type="overtimeType"
      v-model:status="status"
      v-model:date-from="dateFrom"
      v-model:date-to="dateTo"
      :departments="departmentOptions"
      :overtime-types="overtimeTypeOptions"
      :statuses="statusOptions"
      @reset="resetFilters"
    />

    <OvertimeApprovalTable
      :requests="paginatedRequests"
      @view="openModal('view', $event)"
      @approve="openModal('approve', $event)"
      @reject="openModal('reject', $event)"
      @review="openModal('review', $event)"
    />

    <div class="table-footer">
      <p>
        Showing <strong>{{ showingFrom }}–{{ showingTo }}</strong>
        of <strong>{{ filteredRequests.length }}</strong> overtime approval requests
      </p>
      <AppPagination v-model="currentPage" :total-pages="totalPages" />
    </div>

    <!-- REQUEST MODALS -->
    <Teleport to="body">
      <Transition name="dialog-fade">
        <div v-if="modalMode && selected" class="modal-overlay" @click.self="closeModal">
          <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="ot-modal-title">
            <div class="dialog-header">
              <div class="heading-group">
                <div class="heading-icon"><Timer :size="19" /></div>
                <div>
                  <h2 id="ot-modal-title">
                    {{ modalMode === 'view' ? 'Overtime Request Details' :
                      modalMode === 'approve' ? 'Approve Overtime' :
                      modalMode === 'reject' ? 'Reject Overtime' : 'Overtime Review Details' }}
                  </h2>
                  <p>{{ selected.requestNumber }} · {{ selected.employeeName }}</p>
                </div>
              </div>
              <button type="button" class="close-button" aria-label="Close" @click="closeModal">
                <X :size="17" />
              </button>
            </div>

            <div class="dialog-body">
              <div class="employee-summary">
                <div>
                  <strong>{{ selected.employeeName }}</strong>
                  <p>{{ selected.employeeNumber }} · {{ selected.position }} · {{ selected.department }}</p>
                </div>
                <span class="pill">{{ selected.status }}</span>
              </div>

              <div class="section-heading">Overtime Information</div>
              <div class="details-grid">
                <div class="detail-item"><span>OT Date</span><strong>{{ formatDate(selected.overtimeDate) }}</strong></div>
                <div class="detail-item"><span>OT Type</span><strong>{{ selected.overtimeType }}</strong></div>
                <div class="detail-item"><span>Start Time</span><strong>{{ formatTime(selected.startTime) }}</strong></div>
                <div class="detail-item"><span>End Time</span><strong>{{ formatTime(selected.endTime) }}</strong></div>
                <div class="detail-item"><span>Requested Hours</span><strong>{{ selected.requestedHours }} hrs</strong></div>
                <div class="detail-item">
                  <span>Approved Hours</span>
                  <strong>{{ selected.approvedHours === undefined ? 'Not yet approved' : `${selected.approvedHours} hrs` }}</strong>
                </div>
                <div class="detail-item"><span>Immediate Supervisor</span><strong>{{ selected.immediateSupervisor }}</strong></div>
                <div class="detail-item"><span>Filed Date</span><strong>{{ formatDate(selected.filedAt) }}</strong></div>
              </div>

              <div class="note-box">
                <strong>Reason / Justification</strong>
                <p>{{ selected.reason }}</p>
              </div>

              <template v-if="modalMode === 'view' || modalMode === 'review'">
                <div class="section-heading">Review Information</div>
                <div class="details-grid">
                  <div class="detail-item"><span>Request Status</span><strong>{{ selected.status }}</strong></div>
                  <div class="detail-item"><span>Reviewed By</span><strong>{{ selected.reviewedBy || 'Not yet reviewed' }}</strong></div>
                  <div class="detail-item"><span>Reviewed Date</span><strong>{{ formatDate(selected.reviewedAt) }}</strong></div>
                </div>
                <div class="note-box">
                  <strong>Review Remarks</strong>
                  <p>{{ selected.remarks || 'No remarks' }}</p>
                </div>
              </template>

              <template v-if="modalMode === 'approve'">
                <div class="section-heading">Approval Decision</div>
                <label class="field">
                  Approved Hours <span class="required">*</span>
                  <input
                    v-model.number="approvedHours"
                    type="number"
                    min="0.5"
                    :max="selected.requestedHours"
                    step="0.5"
                    required
                  />
                  <small>Partial approval is allowed. Maximum: {{ selected.requestedHours }} hours.</small>
                </label>
                <label class="field">
                  Approval Remarks
                  <textarea v-model="remarks" rows="3" placeholder="Enter approval remarks (optional)..." />
                </label>
              </template>

              <template v-if="modalMode === 'reject'">
                <div class="notice-danger">
                  <XCircle :size="16" /> This request will be marked Rejected and retained in history.
                </div>
                <label class="field">
                  Rejection Reason <span class="required">*</span>
                  <textarea v-model="remarks" rows="3" placeholder="State the reason for rejection..." required />
                </label>
              </template>

              <p v-if="errorMessage" class="form-error" role="alert">{{ errorMessage }}</p>
            </div>

            <div class="dialog-footer">
              <button type="button" class="btn secondary" @click="closeModal">
                {{ modalMode === 'view' || modalMode === 'review' ? 'Close' : 'Cancel' }}
              </button>
              <button v-if="modalMode === 'approve'" type="button" class="btn primary" @click="submitDecision">
                <ShieldCheck :size="15" /> Confirm Approval
              </button>
              <button v-if="modalMode === 'reject'" type="button" class="btn danger" @click="submitDecision">
                <XCircle :size="15" /> Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- EXPORT MODAL - UI ONLY -->
    <Teleport to="body">
      <Transition name="dialog-fade">
        <div v-if="showExport" class="modal-overlay" @click.self="showExport = false">
          <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="export-modal-title">
            <div class="dialog-header">
              <div class="heading-group">
                <div class="heading-icon"><Download :size="19" /></div>
                <div>
                  <h2 id="export-modal-title">Export OT Approvals</h2>
                  <p>Export overtime approval records and review results.</p>
                </div>
              </div>
              <button type="button" class="close-button" aria-label="Close" @click="showExport = false">
                <X :size="17" />
              </button>
            </div>
            <div class="dialog-body">
              <div class="summary-grid">
                <div class="summary-item"><span>Total Requests</span><strong>{{ stats.totalRequests }}</strong></div>
                <div class="summary-item"><span>Pending Review</span><strong>{{ stats.pendingReview }}</strong></div>
                <div class="summary-item"><span>Approved</span><strong>{{ stats.approved }}</strong></div>
                <div class="summary-item"><span>Requested Hours</span><strong>{{ stats.requestedHours }} hrs</strong></div>
              </div>
              <div class="section-heading">Export Format</div>
              <div class="format-grid">
                <button
                  v-for="format in exportFormats"
                  :key="format.value"
                  type="button"
                  class="format-card"
                  :class="{ active: exportFormat === format.value }"
                  :aria-pressed="exportFormat === format.value"
                  @click="exportFormat = format.value"
                >
                  <component :is="format.icon" :size="19" />
                  <strong>{{ format.label }}</strong>
                  <span>{{ format.description }}</span>
                </button>
              </div>
              <div class="note-box">
                <strong>Included Data</strong>
                <p>OT number, employee, department, position, date, schedule, OT type, requested and approved hours, justification, status, supervisor, reviewer, review date and remarks.</p>
              </div>
              <p class="form-hint">Export is a UI preview only. No file will be generated yet.</p>
            </div>
            <div class="dialog-footer">
              <button type="button" class="btn secondary" @click="showExport = false">Cancel</button>
              <button type="button" class="btn primary" disabled>
                <Download :size="15" /> Export {{ exportFormat.toUpperCase() }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<style scoped>
.overtime-approval-page {
  width: 100%;
  max-width: 1660px;
  margin: 0 auto;
}

.header-actions { display: flex; align-items: center; gap: 8px; }
.table-footer { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 14px 3px 0; }
.table-footer p { margin: 0; color: var(--text-muted); font-size: 11px; }
.table-footer strong { color: var(--text-primary); font-weight: 650; }

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  background: rgba(3, 12, 29, .78);
  backdrop-filter: blur(5px);
}

.dialog {
  width: 100%;
  max-width: 620px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
  color: var(--text-primary);
  box-shadow: 0 25px 65px rgba(0, 0, 0, .25);
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 17px;
  gap: 12px;
  border-bottom: 1px solid var(--border);
}

.heading-group { display: flex; align-items: center; gap: 10px; }
.heading-icon { display: grid; width: 37px; height: 37px; flex-shrink: 0; place-items: center; border-radius: 8px; background: var(--primary-soft); color: var(--primary); }
.dialog-header h2 { margin: 0; font-size: 13px; }
.dialog-header p { margin: 4px 0 0; font-size: 9px; color: var(--text-muted); }
.close-button { display: grid; width: 29px; height: 29px; place-items: center; border: 1px solid var(--border); border-radius: 7px; background: transparent; color: var(--text-secondary); cursor: pointer; }
.dialog-body { display: flex; flex-direction: column; gap: 14px; padding: 17px; }
.dialog-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 13px 17px; border-top: 1px solid var(--border); }
.employee-summary { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); }
.employee-summary strong { font-size: 12px; }
.employee-summary p { margin: 5px 0 0; color: var(--text-muted); font-size: 9px; }
.pill { padding: 5px 8px; border-radius: 20px; background: var(--primary-soft); color: var(--primary); font-size: 9px; font-weight: 700; }
.section-heading { color: var(--text-primary); font-size: 11px; font-weight: 700; }
.details-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; }
.detail-item, .summary-item { display: flex; flex-direction: column; gap: 6px; padding: 11px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); }
.detail-item span, .summary-item span { color: var(--text-muted); font-size: 9px; }
.detail-item strong, .summary-item strong { color: var(--text-primary); font-size: 11px; }
.note-box { padding: 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); }
.note-box strong { color: var(--text-primary); font-size: 10px; }
.note-box p { margin: 6px 0 0; color: var(--text-secondary); font-size: 10px; line-height: 1.5; }
.field { display: flex; flex-direction: column; gap: 7px; color: var(--text-primary); font-size: 10px; font-weight: 600; }
.field input, .field textarea { width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 8px; outline: none; background: var(--bg-card-soft); color: var(--text-primary); font: inherit; font-weight: 400; }
.field input:focus, .field textarea:focus { border-color: var(--primary); }
.field textarea { resize: vertical; }
.field small, .form-hint { color: var(--text-muted); font-size: 9px; }
.form-hint { margin: 0; }
.required, .form-error { color: var(--red); }
.form-error { margin: 0; font-size: 10px; }
.notice-danger { display: flex; align-items: center; gap: 8px; padding: 11px; border: 1px solid var(--border); border-radius: 8px; color: var(--red); font-size: 10px; }
.btn { display: inline-flex; align-items: center; justify-content: center; min-height: 36px; gap: 7px; padding: 0 14px; border-radius: 8px; font-size: 10px; font-weight: 600; cursor: pointer; }
.btn.secondary { border: 1px solid var(--border); background: transparent; color: var(--text-primary); }
.btn.primary { border: 1px solid var(--primary); background: var(--primary); color: #fff; }
.btn.danger { border: 1px solid var(--red); background: var(--red); color: #fff; }
.btn:disabled { opacity: .55; cursor: not-allowed; }
.summary-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 7px; }
.summary-item strong { font-size: 13px; }
.format-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 7px; }
.format-card { display: flex; flex-direction: column; align-items: flex-start; gap: 7px; min-height: 94px; padding: 10px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); color: var(--text-primary); text-align: left; cursor: pointer; }
.format-card.active { border-color: var(--primary); background: var(--primary-soft); }
.format-card strong { font-size: 10px; }
.format-card span { color: var(--text-muted); font-size: 8px; line-height: 1.5; }
.dialog-fade-enter-active, .dialog-fade-leave-active { transition: opacity .18s ease; }
.dialog-fade-enter-from, .dialog-fade-leave-to { opacity: 0; }

@media (max-width: 650px) {
  .header-actions { flex-direction: column; align-items: stretch; }
  .table-footer { flex-direction: column; align-items: flex-start; }
  .details-grid { grid-template-columns: 1fr; }
  .summary-grid { grid-template-columns: repeat(2, 1fr); }
  .format-grid { grid-template-columns: 1fr; }
}
</style>
