<script setup lang="ts">
import {
  Download, FileClock, X, CheckCircle2, AlertTriangle,
  Eye, ClipboardCheck, FileSpreadsheet, FileText, Table2, Clock3,
} from 'lucide-vue-next'
import TimeLogApprovalStats from '~/components/approvals/time-logs/TimeLogApprovalStats.vue'
import TimeLogApprovalFilters from '~/components/approvals/time-logs/TimeLogApprovalFilters.vue'
import TimeLogApprovalTable from '~/components/approvals/time-logs/TimeLogApprovalTable.vue'
import type { TimeLogApproval } from '~/types/timeLogApproval'

const router = useRouter()
const {
  requests, search, department, correctionType, status, dateFrom, dateTo,
  currentPage, filteredRequests, paginatedRequests, totalPages,
  showingFrom, showingTo, stats, departmentOptions,
  correctionTypeOptions, statusOptions, resetFilters,
} = useTimeLogApprovals()
const { success, warning } = useToast()

type Modal = 'export' | 'view' | 'approve' | 'reject' | 'review' | null
type ExportFormat = 'excel' | 'pdf' | 'csv'
const modal = ref<Modal>(null)
const selectedId = ref<number | null>(null)
const remarks = ref('')
const error = ref('')
const exportFormat = ref<ExportFormat>('excel')
const selected = computed(() => requests.value.find(item => item.id === selectedId.value) ?? null)
const isPending = (item: TimeLogApproval) => ['Pending', 'For Review'].includes(item.status)

const formats = [
  { value: 'excel' as const, label: 'Excel', icon: FileSpreadsheet, description: 'HR analysis and reports' },
  { value: 'pdf' as const, label: 'PDF', icon: FileText, description: 'Printable correction report' },
  { value: 'csv' as const, label: 'CSV', icon: Table2, description: 'Raw correction records' },
]

const openModal = (mode: Exclude<Modal, null>, item?: TimeLogApproval) => {
  selectedId.value = item?.id ?? null
  remarks.value = ''
  error.value = ''
  exportFormat.value = 'excel'
  modal.value = mode
}
const closeModal = () => { modal.value = null }
const handleViewRequests = () => router.push('/timekeeping/time-log-correction-requests')

const formatDate = (value?: string) => {
  if (!value) return '—'
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value)
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    ...(value.includes('T') ? { hour: 'numeric', minute: '2-digit' } : {}),
  }).format(date)
}
const formatTime = (value?: string) => {
  if (!value) return 'Missing'
  const [hours, minutes] = value.split(':').map(Number)
  const date = new Date(2026, 0, 1, hours ?? 0, minutes ?? 0)
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(date)
}

const confirmDecision = () => {
  const item = selected.value
  if (!item || !isPending(item) || !['approve', 'reject'].includes(modal.value ?? '')) return
  if (modal.value === 'reject' && !remarks.value.trim()) {
    error.value = 'A rejection reason is required.'
    return
  }
  const decision = modal.value === 'approve' ? 'Approved' : 'Rejected'
  requests.value = requests.value.map(request => request.id === item.id ? {
    ...request,
    status: decision,
    reviewedBy: 'Maria Santos', // UI demo only; replace with authenticated reviewer
    reviewedAt: new Date().toISOString(),
    remarks: remarks.value.trim() || (decision === 'Approved' ? 'Approved after review.' : ''),
  } : request)
  if (decision === 'Approved') success('Correction Approved', `${item.requestNumber} has been approved in mock data.`)
  else warning('Correction Rejected', `${item.requestNumber} has been rejected in mock data.`)
  closeModal()
}

const onEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') closeModal() }
onMounted(() => document.addEventListener('keydown', onEscape))
onBeforeUnmount(() => document.removeEventListener('keydown', onEscape))
</script>

<template>
  <section class="time-log-approval-page">
    <PageHeader
      title="Time Log Corrections"
      description="Review employee attendance correction requests before applying changes to official timekeeping records."
    >
      <div class="header-actions">
        <AppButton variant="secondary" :icon="Download" @click="openModal('export')">Export</AppButton>
        <AppButton :icon="FileClock" @click="handleViewRequests">View Correction Requests</AppButton>
      </div>
    </PageHeader>

    <TimeLogApprovalStats :stats="stats" />

    <TimeLogApprovalFilters
      v-model:search="search"
      v-model:department="department"
      v-model:correction-type="correctionType"
      v-model:status="status"
      v-model:date-from="dateFrom"
      v-model:date-to="dateTo"
      :departments="departmentOptions"
      :correction-types="correctionTypeOptions"
      :statuses="statusOptions"
      @reset="resetFilters"
    />

    <TimeLogApprovalTable
      :requests="paginatedRequests"
      @view="openModal('view', $event)"
      @approve="openModal('approve', $event)"
      @reject="openModal('reject', $event)"
      @review="openModal('review', $event)"
    />

    <div class="table-footer">
      <p>Showing <strong>{{ showingFrom }}–{{ showingTo }}</strong> of
        <strong>{{ filteredRequests.length }}</strong> time log correction requests</p>
      <AppPagination v-model="currentPage" :total-pages="totalPages" />
    </div>

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="modal" class="modal-backdrop" @click.self="closeModal">
          <div class="modal-card" role="dialog" aria-modal="true" aria-label="Time log correction action">
            <div class="modal-header">
              <div class="modal-title-group">
                <div class="modal-icon">
                  <Download v-if="modal === 'export'" :size="18" />
                  <Eye v-else-if="modal === 'view'" :size="18" />
                  <CheckCircle2 v-else-if="modal === 'approve'" :size="18" />
                  <AlertTriangle v-else-if="modal === 'reject'" :size="18" />
                  <ClipboardCheck v-else :size="18" />
                </div>
                <div>
                  <h2>{{ modal === 'export' ? 'Export Time Log Corrections' : modal === 'view' ? 'Correction Request Details' : modal === 'approve' ? 'Approve Time Log Correction' : modal === 'reject' ? 'Reject Time Log Correction' : 'Review Details' }}</h2>
                  <p>{{ modal === 'export' ? 'Export correction requests and review statuses.' : selected?.requestNumber }}</p>
                </div>
              </div>
              <button class="close-button" type="button" aria-label="Close" @click="closeModal"><X :size="17" /></button>
            </div>

            <div class="modal-body">
              <template v-if="modal === 'export'">
                <div class="export-stats">
                  <div><span>Total</span><strong>{{ stats.totalRequests }}</strong></div>
                  <div><span>Pending Review</span><strong>{{ stats.pendingReview }}</strong></div>
                  <div><span>Approved</span><strong>{{ stats.approved }}</strong></div>
                  <div><span>Rejected</span><strong>{{ stats.rejected }}</strong></div>
                </div>
                <h3>Export Format</h3>
                <div class="format-grid">
                  <button v-for="format in formats" :key="format.value" type="button" class="format-card"
                    :class="{ selected: exportFormat === format.value }" @click="exportFormat = format.value">
                    <component :is="format.icon" :size="20" />
                    <strong>{{ format.label }}</strong>
                    <span>{{ format.description }}</span>
                  </button>
                </div>
                <div class="info-panel">
                  <strong>Included Data</strong>
                  <p>Request number, employee, department, attendance date, correction type, original and requested time logs, reason, supervisor, filed date, status, reviewer, review date and remarks.</p>
                </div>
              </template>

              <template v-else-if="selected">
                <div class="request-summary">
                  <div>
                    <span>Employee</span>
                    <strong>{{ selected.employeeName }}</strong>
                    <small>{{ selected.employeeNumber }} · {{ selected.department }} · {{ selected.position }}</small>
                  </div>
                  <div>
                    <span>Request Status</span>
                    <strong>{{ selected.status }}</strong>
                    <small>{{ selected.correctionType }}</small>
                  </div>
                </div>

                <div v-if="modal !== 'review'" class="section-title"><Clock3 :size="14" /> Attendance Log Comparison</div>
                <div v-if="modal !== 'review'" class="comparison-grid">
                  <div class="log-box">
                    <h3>Original Time Log</h3>
                    <div><span>Time In</span><strong>{{ formatTime(selected.originalTimeIn) }}</strong></div>
                    <div><span>Time Out</span><strong>{{ formatTime(selected.originalTimeOut) }}</strong></div>
                  </div>
                  <div class="log-box requested">
                    <h3>Requested Correction</h3>
                    <div><span>Time In</span><strong>{{ formatTime(selected.requestedTimeIn) }}</strong></div>
                    <div><span>Time Out</span><strong>{{ formatTime(selected.requestedTimeOut) }}</strong></div>
                  </div>
                </div>

                <div class="details-grid">
                  <div><span>Attendance Date</span><strong>{{ formatDate(selected.attendanceDate) }}</strong></div>
                  <div><span>Filed Date</span><strong>{{ formatDate(selected.filedAt) }}</strong></div>
                  <div><span>Immediate Supervisor</span><strong>{{ selected.immediateSupervisor }}</strong></div>
                  <div><span>Correction Type</span><strong>{{ selected.correctionType }}</strong></div>
                  <template v-if="modal === 'view' || modal === 'review'">
                    <div><span>Reviewed By</span><strong>{{ selected.reviewedBy || '—' }}</strong></div>
                    <div><span>Reviewed At</span><strong>{{ formatDate(selected.reviewedAt) }}</strong></div>
                  </template>
                </div>
                <div class="info-panel">
                  <strong>Employee Reason</strong>
                  <p>{{ selected.reason }}</p>
                </div>
                <div v-if="modal === 'view' || modal === 'review'" class="info-panel">
                  <strong>Review Remarks</strong>
                  <p>{{ selected.remarks || 'No remarks' }}</p>
                </div>
                <template v-if="modal === 'approve' || modal === 'reject'">
                  <div class="info-panel" :class="{ caution: modal === 'reject' }">
                    <strong>{{ modal === 'approve' ? 'Approve Request' : 'Reject Request' }}</strong>
                    <p>{{ modal === 'approve' ? 'This changes the request status only. It will not update official attendance records.' : 'A rejection reason is required. Official attendance records will remain unchanged.' }}</p>
                  </div>
                  <label class="form-label" for="decision-remarks">{{ modal === 'reject' ? 'Rejection Reason *' : 'Approval Remarks (optional)' }}</label>
                  <textarea id="decision-remarks" v-model="remarks" rows="3"
                    :placeholder="modal === 'reject' ? 'Explain why the correction is rejected...' : 'Enter optional approval remarks...'"
                    @input="error = ''" />
                  <p v-if="error" class="error-text">{{ error }}</p>
                </template>
              </template>
            </div>

            <div class="modal-footer">
              <button class="btn secondary" type="button" @click="closeModal">{{ modal === 'view' || modal === 'review' ? 'Close' : 'Cancel' }}</button>
              <button v-if="modal === 'export'" class="btn primary" type="button" disabled>
                <Download :size="15" /> Export {{ exportFormat.toUpperCase() }}
              </button>
              <button v-if="modal === 'approve' || modal === 'reject'" class="btn primary" :class="{ reject: modal === 'reject' }"
                type="button" @click="confirmDecision">
                {{ modal === 'approve' ? 'Confirm Approval' : 'Confirm Rejection' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<style scoped>
.time-log-approval-page { width: 100%; max-width: 1660px; margin: 0 auto; }
.header-actions { display: flex; align-items: center; gap: 8px; }
.table-footer { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 14px 3px 0; }
.table-footer p { margin: 0; color: var(--text-muted); font-size: 11px; }
.table-footer strong { color: var(--text-primary); font-weight: 650; }
.modal-backdrop { position: fixed; inset: 0; z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 18px; background: rgba(3, 12, 29, .78); backdrop-filter: blur(5px); }
.modal-card { width: 100%; max-width: 620px; max-height: 90vh; overflow-y: auto; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); box-shadow: 0 24px 70px rgba(0, 0, 0, .3); }
.modal-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px; border-bottom: 1px solid var(--border); }
.modal-title-group { display: flex; align-items: center; gap: 10px; }
.modal-icon { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 8px; background: var(--primary-soft); color: var(--primary); }
.modal-header h2 { margin: 0; color: var(--text-primary); font-size: 13px; }
.modal-header p { margin: 4px 0 0; color: var(--text-muted); font-size: 9px; }
.close-button { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border: 1px solid var(--border); border-radius: 7px; background: transparent; color: var(--text-secondary); cursor: pointer; }
.modal-body { display: flex; flex-direction: column; gap: 13px; padding: 16px; }
.modal-body h3 { margin: 0; color: var(--text-primary); font-size: 11px; }
.request-summary, .details-grid, .comparison-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; }
.request-summary > div, .details-grid > div, .log-box, .info-panel, .export-stats > div { padding: 11px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); }
.request-summary span, .details-grid span, .export-stats span { display: block; margin-bottom: 5px; color: var(--text-muted); font-size: 9px; }
.request-summary strong, .details-grid strong, .export-stats strong { display: block; color: var(--text-primary); font-size: 12px; }
.request-summary small { display: block; margin-top: 4px; color: var(--text-muted); font-size: 9px; }
.section-title { display: flex; align-items: center; gap: 6px; color: var(--text-primary); font-size: 11px; font-weight: 700; }
.log-box h3 { margin: 0 0 10px; }
.log-box > div { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 7px; }
.log-box span { color: var(--text-muted); font-size: 10px; }
.log-box strong { color: var(--text-primary); font-size: 11px; }
.log-box.requested { border-color: var(--primary); background: var(--primary-soft); }
.info-panel strong { color: var(--text-primary); font-size: 10px; }
.info-panel p { margin: 6px 0 0; color: var(--text-secondary); font-size: 10px; line-height: 1.6; }
.info-panel.caution { border-color: var(--red, #ef4444); }
.form-label { color: var(--text-primary); font-size: 10px; font-weight: 600; }
textarea { box-sizing: border-box; width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 8px; outline: none; background: var(--bg-card-soft); color: var(--text-primary); font: inherit; font-size: 11px; resize: vertical; }
textarea:focus { border-color: var(--primary); }
.error-text { margin: -7px 0 0; color: var(--red, #ef4444); font-size: 10px; }
.export-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 7px; }
.format-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.format-card { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; min-height: 90px; padding: 11px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); color: var(--text-primary); text-align: left; cursor: pointer; }
.format-card.selected { border-color: var(--primary); background: var(--primary-soft); }
.format-card strong { font-size: 10px; }
.format-card span { color: var(--text-muted); font-size: 9px; }
.modal-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 13px 16px; border-top: 1px solid var(--border); }
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 36px; padding: 0 13px; border-radius: 8px; font-size: 10px; font-weight: 600; cursor: pointer; }
.btn.secondary { border: 1px solid var(--border); background: transparent; color: var(--text-primary); }
.btn.primary { border: 1px solid var(--primary); background: var(--primary); color: white; }
.btn.primary.reject { border-color: var(--red, #dc2626); background: var(--red, #dc2626); }
.btn:disabled { opacity: .5; cursor: not-allowed; }
.modal-enter-active, .modal-leave-active { transition: opacity .2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
@media (max-width: 650px) { .header-actions { width: 100%; flex-direction: column; align-items: stretch; } .table-footer { flex-direction: column; align-items: flex-start; } }
@media (max-width: 440px) { .comparison-grid, .request-summary, .details-grid, .format-grid { grid-template-columns: 1fr; } .export-stats { grid-template-columns: repeat(2, 1fr); } }
</style>
