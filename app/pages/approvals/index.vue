<script setup lang="ts">
import {
  Download,
  X,
  Eye,
  CheckCircle2,
  XCircle,
  ClipboardCheck,
  FileSpreadsheet,
  FileText,
  Table2,
  UserRound,
  CalendarDays,
  Clock3,
  Building2,
  AlertCircle,
} from 'lucide-vue-next'

import type { ApprovalRequest } from '~/types/approval'

const {
  search,
  type,
  department,
  priority,
  currentPage,
  filteredRequests,
  paginatedRequests,
  totalPages,
  showingFrom,
  showingTo,
  stats,
  typeSummary,
  urgentRequests,
  typeOptions,
  priorityOptions,
  departments,
  approveRequest,
  rejectRequest,
  resetFilters,
} = useApprovalCenter()

const { success, warning } = useToast()

type ModalMode = 'view' | 'approve' | 'reject' | null
type ExportFormat = 'excel' | 'pdf' | 'csv'

const modalMode = ref<ModalMode>(null)
const selectedRequest = ref<ApprovalRequest | null>(null)
const showExportModal = ref(false)
const exportFormat = ref<ExportFormat>('excel')
const decisionRemarks = ref('')
const validationError = ref('')

const exportFormats = [
  {
    value: 'excel' as const,
    label: 'Excel',
    description: 'For HR approval reports and analysis.',
    icon: FileSpreadsheet,
  },
  {
    value: 'pdf' as const,
    label: 'PDF',
    description: 'Printable pending approval report.',
    icon: FileText,
  },
  {
    value: 'csv' as const,
    label: 'CSV',
    description: 'Raw request data for external processing.',
    icon: Table2,
  },
]

const formatDate = (value?: string) => {
  if (!value) return '—'

  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

const formatDateTime = (value?: string) => {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

const openRequestModal = (mode: Exclude<ModalMode, null>, request: ApprovalRequest) => {
  selectedRequest.value = request
  modalMode.value = mode
  decisionRemarks.value = ''
  validationError.value = ''
}

const closeRequestModal = () => {
  modalMode.value = null
  selectedRequest.value = null
  decisionRemarks.value = ''
  validationError.value = ''
}

const openExportModal = () => {
  exportFormat.value = 'excel'
  showExportModal.value = true
}

const closeExportModal = () => {
  showExportModal.value = false
}

const confirmDecision = () => {
  const request = selectedRequest.value
  if (!request || !modalMode.value || modalMode.value === 'view') return

  // Require a reason when rejecting an HR request.
  if (modalMode.value === 'reject' && !decisionRemarks.value.trim()) {
    validationError.value = 'Please provide a reason for rejection.'
    return
  }

  if (modalMode.value === 'approve') {
    approveRequest(request)
    success('Request Approved', `${request.reference} for ${request.employeeName} has been approved.`)
  } else {
    rejectRequest(request)
    warning('Request Rejected', `${request.reference} for ${request.employeeName} has been rejected.`)
  }

  // Existing composable removes the request from the pending list.
  // Review remarks are UI-only until the backend/data model supports them.
  closeRequestModal()
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key !== 'Escape') return
  closeRequestModal()
  closeExportModal()
}

onMounted(() => window.addEventListener('keydown', handleKeyDown))
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeyDown))
</script>

<template>
  <section class="approval-page">
    <PageHeader
      title="Approval Center"
      description="Review and manage pending leave, overtime, time correction and work-from-home requests."
    >
      <AppButton
        variant="secondary"
        :icon="Download"
        @click="openExportModal"
      >
        Export
      </AppButton>
    </PageHeader>

    <ApprovalStats :stats="stats" />

    <ApprovalFilters
      v-model:search="search"
      v-model:type="type"
      v-model:department="department"
      v-model:priority="priority"
      :departments="departments"
      :type-options="typeOptions"
      :priority-options="priorityOptions"
      @reset="resetFilters"
    />

    <div class="approval-layout">
      <div class="approval-main">
        <ApprovalRequestsTable
          :requests="paginatedRequests"
          @view="openRequestModal('view', $event)"
          @approve="openRequestModal('approve', $event)"
          @reject="openRequestModal('reject', $event)"
        />

        <div class="table-footer">
          <p>
            Showing <strong>{{ showingFrom }}–{{ showingTo }}</strong>
            of <strong>{{ filteredRequests.length }}</strong> pending requests
          </p>

          <AppPagination v-model="currentPage" :total-pages="totalPages" />
        </div>
      </div>

      <ApprovalSidePanel
        :urgent-requests="urgentRequests"
        :summary="typeSummary"
      />
    </div>

    <!-- REQUEST DETAILS / APPROVAL / REJECTION MODAL -->
    <Teleport to="body">
      <Transition name="approval-modal">
        <div
          v-if="modalMode && selectedRequest"
          class="approval-overlay"
          @click.self="closeRequestModal"
        >
          <div
            class="approval-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="approval-dialog-title"
          >
            <div class="dialog-header">
              <div class="dialog-heading">
                <span class="dialog-icon" :class="modalMode">
                  <Eye v-if="modalMode === 'view'" :size="19" />
                  <CheckCircle2 v-else-if="modalMode === 'approve'" :size="19" />
                  <XCircle v-else :size="19" />
                </span>

                <div>
                  <h2 id="approval-dialog-title">
                    {{ modalMode === 'view' ? 'Request Details' : modalMode === 'approve' ? 'Approve Request' : 'Reject Request' }}
                  </h2>
                  <p>{{ selectedRequest.reference }} · {{ selectedRequest.type }}</p>
                </div>
              </div>

              <button
                type="button"
                class="icon-close"
                aria-label="Close dialog"
                @click="closeRequestModal"
              >
                <X :size="17" />
              </button>
            </div>

            <div class="dialog-body">
              <div class="employee-profile">
                <div class="employee-avatar"><UserRound :size="20" /></div>
                <div class="employee-info">
                  <strong>{{ selectedRequest.employeeName }}</strong>
                  <span>{{ selectedRequest.employeeNumber }} · {{ selectedRequest.position }}</span>
                </div>
                <span class="priority-chip" :class="selectedRequest.priority.toLowerCase()">
                  {{ selectedRequest.priority }}
                </span>
              </div>

              <div class="section-title">
                <ClipboardCheck :size="15" />
                Request Information
              </div>

              <div class="details-grid">
                <div class="detail-box">
                  <span>Reference Number</span>
                  <strong>{{ selectedRequest.reference }}</strong>
                </div>
                <div class="detail-box">
                  <span>Request Type</span>
                  <strong>{{ selectedRequest.type === 'WFH' ? 'Work From Home' : selectedRequest.type }}</strong>
                </div>
                <div class="detail-box">
                  <span><Building2 :size="12" /> Department</span>
                  <strong>{{ selectedRequest.department }}</strong>
                </div>
                <div class="detail-box">
                  <span><CalendarDays :size="12" /> Request Date</span>
                  <strong>{{ formatDate(selectedRequest.requestDate) }}</strong>
                </div>
                <div class="detail-box">
                  <span><Clock3 :size="12" /> Submitted At</span>
                  <strong>{{ formatDateTime(selectedRequest.submittedAt) }}</strong>
                </div>
                <div class="detail-box">
                  <span>Assigned Approver</span>
                  <strong>{{ selectedRequest.approver || 'Not assigned' }}</strong>
                </div>
              </div>

              <div class="section-title"><FileText :size="15" /> Request Description</div>
              <div class="description-box">
                <strong>{{ selectedRequest.title }}</strong>
                <p>{{ selectedRequest.description || 'No description provided.' }}</p>
              </div>

              <div v-if="modalMode !== 'view'" class="review-section">
                <div class="section-title">
                  <CheckCircle2 v-if="modalMode === 'approve'" :size="15" />
                  <AlertCircle v-else :size="15" />
                  Decision Remarks
                </div>
                <label class="field-label" for="approval-remarks">
                  {{ modalMode === 'reject' ? 'Rejection Reason' : 'Approval Remarks' }}
                  <span v-if="modalMode === 'reject'" class="required">*</span>
                </label>
                <textarea
                  id="approval-remarks"
                  v-model="decisionRemarks"
                  rows="3"
                  :placeholder="modalMode === 'reject' ? 'Explain why this request is being rejected...' : 'Optional approval remarks...'"
                  @input="validationError = ''"
                />
                <p v-if="validationError" class="validation-error" role="alert">
                  {{ validationError }}
                </p>
                <p class="decision-note">
                  This action updates the mock pending-request list only. Remarks and decisions are not yet saved to a backend or synchronized with other HRIS modules.
                </p>
              </div>
            </div>

            <div class="dialog-footer">
              <button type="button" class="dialog-button secondary" @click="closeRequestModal">
                {{ modalMode === 'view' ? 'Close' : 'Cancel' }}
              </button>
              <button
                v-if="modalMode === 'approve'"
                type="button"
                class="dialog-button primary"
                @click="confirmDecision"
              >
                <CheckCircle2 :size="15" /> Confirm Approval
              </button>
              <button
                v-else-if="modalMode === 'reject'"
                type="button"
                class="dialog-button danger"
                @click="confirmDecision"
              >
                <XCircle :size="15" /> Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- EXPORT MODAL (UI ONLY) -->
    <Teleport to="body">
      <Transition name="approval-modal">
        <div v-if="showExportModal" class="approval-overlay" @click.self="closeExportModal">
          <div
            class="approval-dialog export-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="export-title"
          >
            <div class="dialog-header">
              <div class="dialog-heading">
                <span class="dialog-icon view"><Download :size="19" /></span>
                <div>
                  <h2 id="export-title">Export Pending Requests</h2>
                  <p>Export pending HR approval requests and their details.</p>
                </div>
              </div>
              <button type="button" class="icon-close" aria-label="Close export dialog" @click="closeExportModal">
                <X :size="17" />
              </button>
            </div>

            <div class="dialog-body">
              <div class="export-stats">
                <div class="export-stat"><span>Total Pending</span><strong>{{ stats.total }}</strong></div>
                <div class="export-stat"><span>Leave</span><strong>{{ stats.leaves }}</strong></div>
                <div class="export-stat"><span>Overtime</span><strong>{{ stats.overtime }}</strong></div>
                <div class="export-stat"><span>Corrections</span><strong>{{ stats.corrections }}</strong></div>
              </div>

              <div class="section-title">Export Format</div>
              <div class="export-format-grid">
                <button
                  v-for="format in exportFormats"
                  :key="format.value"
                  type="button"
                  class="format-card"
                  :class="{ selected: exportFormat === format.value }"
                  :aria-pressed="exportFormat === format.value"
                  @click="exportFormat = format.value"
                >
                  <component :is="format.icon" :size="20" />
                  <strong>{{ format.label }}</strong>
                  <span>{{ format.description }}</span>
                </button>
              </div>

              <div class="included-data">
                <strong>Included Data</strong>
                <p>Request reference, employee name and number, department, position, request type, title, description, request date, submitted date, priority and assigned approver.</p>
              </div>
              <p class="decision-note">Export is a UI preview only. No file will be downloaded yet.</p>
            </div>

            <div class="dialog-footer">
              <button type="button" class="dialog-button secondary" @click="closeExportModal">Cancel</button>
              <button type="button" class="dialog-button primary" disabled>
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
.approval-page {
  width: 100%;
  max-width: 1660px;
  margin: 0 auto;
}

.approval-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 12px;
}

.approval-main { min-width: 0; }
.table-footer { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 13px 3px 0; }
.table-footer p { margin: 0; color: var(--text-muted); font-size: 10px; }
.table-footer strong { color: var(--text-primary); font-weight: 600; }

.approval-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: rgba(3, 12, 29, 0.78);
  backdrop-filter: blur(5px);
}

.approval-dialog {
  width: 100%;
  max-width: 595px;
  max-height: 90vh;
  overflow-y: auto;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 13px;
  color: var(--text-primary);
  box-shadow: 0 25px 65px rgba(0, 0, 0, 0.25);
}

.dialog-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 18px; gap: 14px; border-bottom: 1px solid var(--border); }
.dialog-heading { display: flex; align-items: center; gap: 11px; min-width: 0; }
.dialog-icon { display: grid; flex-shrink: 0; width: 38px; height: 38px; place-items: center; border-radius: 9px; }
.dialog-icon.view { background: var(--primary-soft); color: var(--primary); }
.dialog-icon.approve { background: var(--green-soft); color: var(--green); }
.dialog-icon.reject { background: var(--red-soft); color: var(--red); }
.dialog-header h2 { margin: 0; font-size: 13px; font-weight: 700; }
.dialog-header p { margin: 4px 0 0; font-size: 9px; color: var(--text-muted); }
.icon-close { display: grid; width: 29px; height: 29px; place-items: center; flex-shrink: 0; background: transparent; border: 1px solid var(--border); border-radius: 7px; color: var(--text-secondary); cursor: pointer; }
.icon-close:hover { color: var(--text-primary); background: var(--bg-card-soft); }
.dialog-body { display: flex; flex-direction: column; gap: 15px; padding: 17px 18px; }

.employee-profile { display: flex; align-items: center; gap: 11px; padding: 13px; border: 1px solid var(--border); border-radius: 9px; background: var(--bg-card-soft); }
.employee-avatar { display: grid; width: 42px; height: 42px; flex-shrink: 0; place-items: center; border-radius: 10px; background: var(--primary-soft); color: var(--primary); }
.employee-info { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 0; }
.employee-info strong { font-size: 12px; }
.employee-info span { font-size: 9px; color: var(--text-muted); }
.priority-chip { padding: 5px 8px; border-radius: 20px; font-size: 9px; font-weight: 700; white-space: nowrap; }
.priority-chip.normal { background: var(--primary-soft); color: var(--primary); }
.priority-chip.urgent { background: var(--red-soft); color: var(--red); }

.section-title { display: flex; align-items: center; gap: 7px; margin: 0; font-size: 11px; font-weight: 700; color: var(--text-primary); }
.section-title svg { color: var(--primary); }
.details-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; }
.detail-box { display: flex; flex-direction: column; gap: 7px; padding: 11px 12px; background: var(--bg-card-soft); border: 1px solid var(--border); border-radius: 8px; }
.detail-box span { display: flex; align-items: center; gap: 5px; font-size: 9px; color: var(--text-muted); }
.detail-box strong { font-size: 11px; overflow-wrap: anywhere; }
.description-box { padding: 13px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); }
.description-box strong { font-size: 11px; }
.description-box p { margin: 6px 0 0; color: var(--text-secondary); font-size: 10px; line-height: 1.6; white-space: pre-wrap; }
.review-section { display: flex; flex-direction: column; gap: 9px; }
.field-label { color: var(--text-primary); font-size: 10px; font-weight: 600; }
.required, .validation-error { color: var(--red); }
.review-section textarea { display: block; width: 100%; padding: 11px 12px; border: 1px solid var(--border); border-radius: 8px; outline: none; resize: vertical; background: var(--bg-card-soft); color: var(--text-primary); font: inherit; font-size: 11px; }
.review-section textarea:focus { border-color: var(--primary); }
.validation-error { margin: 0; font-size: 10px; }
.decision-note { margin: 0; color: var(--text-muted); font-size: 9px; line-height: 1.6; }
.dialog-footer { display: flex; justify-content: flex-end; align-items: center; gap: 8px; padding: 13px 18px; border-top: 1px solid var(--border); }
.dialog-button { display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 36px; padding: 0 14px; border-radius: 8px; font-size: 10px; font-weight: 600; cursor: pointer; }
.dialog-button.secondary { color: var(--text-primary); background: transparent; border: 1px solid var(--border); }
.dialog-button.primary { color: #fff; background: var(--primary); border: 1px solid var(--primary); }
.dialog-button.danger { color: #fff; background: var(--red); border: 1px solid var(--red); }
.dialog-button:disabled { opacity: 0.55; cursor: not-allowed; }

.export-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 7px; }
.export-stat { display: flex; flex-direction: column; gap: 6px; padding: 10px; background: var(--bg-card-soft); border: 1px solid var(--border); border-radius: 8px; }
.export-stat span { font-size: 8px; color: var(--text-muted); text-transform: uppercase; }
.export-stat strong { font-size: 14px; }
.export-format-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.format-card { display: flex; flex-direction: column; align-items: flex-start; gap: 7px; min-height: 96px; padding: 11px; background: var(--bg-card-soft); color: var(--text-primary); border: 1px solid var(--border); border-radius: 8px; text-align: left; cursor: pointer; }
.format-card.selected { border-color: var(--primary); background: var(--primary-soft); }
.format-card svg { color: var(--text-muted); }
.format-card.selected svg { color: var(--primary); }
.format-card strong { font-size: 10px; }
.format-card span { font-size: 8px; line-height: 1.5; color: var(--text-muted); }
.included-data { padding: 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); }
.included-data strong { font-size: 10px; }
.included-data p { margin: 6px 0 0; font-size: 9px; color: var(--text-muted); line-height: 1.6; }
.approval-modal-enter-active, .approval-modal-leave-active { transition: opacity 0.18s ease; }
.approval-modal-enter-from, .approval-modal-leave-to { opacity: 0; }

@media (max-width: 1100px) {
  .approval-layout { grid-template-columns: 1fr; }
}

@media (max-width: 650px) {
  .table-footer { flex-direction: column; align-items: flex-start; }
  .details-grid, .export-format-grid { grid-template-columns: 1fr; }
  .export-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .dialog-header, .dialog-body, .dialog-footer { padding: 13px; }
  .employee-profile { flex-wrap: wrap; }
}
</style>
