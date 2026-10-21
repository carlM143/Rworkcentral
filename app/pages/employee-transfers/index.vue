<script setup lang="ts">
import {
  Download, Plus, X, ArrowRightLeft, FileSpreadsheet,
  FileText, Table2, Save, AlertTriangle, CheckCircle2,
} from 'lucide-vue-next'
import type { EmployeeTransfer, EmployeeTransferType } from '~/types/employeeTransfer'
import EmployeeTransferStats from '~/components/departments/transfers/EmployeeTransferStats.vue'
import EmployeeTransferFilters from '~/components/departments/transfers/EmployeeTransferFilters.vue'
import EmployeeTransferTable from '~/components/departments/transfers/EmployeeTransferTable.vue'

const {
  transfers, search, fromDepartment, toDepartment, transferType, status,
  dateFrom, dateTo, currentPage, filteredTransfers, paginatedTransfers,
  totalPages, showingFrom, showingTo, stats, departmentOptions,
  transferTypeOptions, statusOptions, resetFilters,
} = useEmployeeTransfers()
const { info } = useToast()

type Mode = 'add' | 'edit' | 'view' | 'review' | 'cancel' | 'complete' | null
type Format = 'excel' | 'pdf' | 'csv'
const mode = ref<Mode>(null)
const selectedId = ref<number | null>(null)
const showExport = ref(false)
const exportFormat = ref<Format>('excel')
const error = ref('')
const decision = ref<'Approved' | 'Rejected'>('Approved')
const actionRemarks = ref('')
const selected = computed(() => transfers.value.find(item => item.id === selectedId.value) ?? null)
const today = () => new Date().toLocaleDateString('en-CA')

const form = reactive({
  employeeId: 0,
  transferType: 'Department Transfer' as EmployeeTransferType,
  toDepartment: '',
  toPosition: '',
  effectiveDate: '',
  reason: '',
  remarks: '',
})

// Mock employee roster: substitute the master employee API when available.
const employeeOptions = computed(() => {
  const map = new Map<number, { id: number; name: string; number: string; department: string; position: string }>()
  transfers.value.forEach(item => {
    if (!map.has(item.employeeId)) {
      map.set(item.employeeId, {
        id: item.employeeId, name: item.employeeName, number: item.employeeNumber,
        department: item.fromDepartment, position: item.fromPosition,
      })
    }
    if (item.status === 'Completed') {
      map.set(item.employeeId, {
        id: item.employeeId, name: item.employeeName, number: item.employeeNumber,
        department: item.toDepartment, position: item.toPosition,
      })
    }
  })
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name))
})
const employee = computed(() => employeeOptions.value.find(item => item.id === Number(form.employeeId)))
const { positions } = usePositions()
const departments = computed(() => [...new Set([...departmentOptions.value, ...positions.value.map(item => item.department)])].sort())
const positionOptions = computed(() => [...new Set(positions.value
  .filter(item => item.department === form.toDepartment && item.status === 'Active')
  .map(item => item.name))].sort())
const exportFormats = [
  { value: 'excel' as const, label: 'Excel', description: 'HR transfer reports and analysis', icon: FileSpreadsheet },
  { value: 'pdf' as const, label: 'PDF', description: 'Printable employee transfer report', icon: FileText },
  { value: 'csv' as const, label: 'CSV', description: 'Raw data for external processing', icon: Table2 },
]
const formatDate = (value?: string) => value
  ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(value.length === 10 ? `${value}T00:00:00` : value))
  : '—'

const openAdd = () => {
  Object.assign(form, {
    employeeId: 0, transferType: 'Department Transfer', toDepartment: '',
    toPosition: '', effectiveDate: '', reason: '', remarks: '',
  })
  selectedId.value = null
  error.value = ''
  mode.value = 'add'
}
const openRecord = (kind: Exclude<Mode, 'add' | null>, item: EmployeeTransfer) => {
  selectedId.value = item.id
  error.value = ''
  actionRemarks.value = ''
  decision.value = 'Approved'
  if (kind === 'edit') {
    Object.assign(form, {
      employeeId: item.employeeId, transferType: item.transferType,
      toDepartment: item.toDepartment, toPosition: item.toPosition,
      effectiveDate: item.effectiveDate, reason: item.reason, remarks: item.remarks ?? '',
    })
  }
  mode.value = kind
}
const close = () => {
  mode.value = null
  selectedId.value = null
  error.value = ''
}
const pending = (item: EmployeeTransfer) => ['Pending', 'For Review'].includes(item.status)
const saveTransfer = () => {
  error.value = ''
  const person = employee.value
  if (!person || !form.toDepartment || !form.toPosition.trim() || !form.effectiveDate || !form.reason.trim()) {
    error.value = 'Complete all required fields before saving.'
    return
  }
  if (form.transferType === 'Position Change' && form.toDepartment !== person.department) {
    error.value = 'Position Change must remain within the current department.'
    return
  }
  if (form.transferType === 'Department Transfer' && form.toPosition !== person.position) {
    error.value = 'Department Transfer must keep the employee’s current position.'
    return
  }
  if (form.toDepartment === person.department && form.toPosition === person.position) {
    error.value = 'Select a destination different from the current assignment.'
    return
  }
  if (mode.value === 'edit' && selected.value) {
    if (!pending(selected.value)) return
    Object.assign(selected.value, {
      transferType: form.transferType, toDepartment: form.toDepartment,
      toPosition: form.toPosition.trim(), effectiveDate: form.effectiveDate,
      reason: form.reason.trim(), remarks: form.remarks.trim() || undefined,
    })
    info('Transfer Updated', 'Transfer request updated in mock data.')
  } else {
    const id = Math.max(0, ...transfers.value.map(item => item.id)) + 1
    transfers.value.unshift({
      id, transferNumber: `TRF-${new Date().getFullYear()}-${String(id).padStart(3, '0')}`,
      employeeId: person.id, employeeNumber: person.number, employeeName: person.name,
      transferType: form.transferType, fromDepartment: person.department,
      fromPosition: person.position, toDepartment: form.toDepartment,
      toPosition: form.toPosition.trim(), reason: form.reason.trim(),
      requestedDate: today(), effectiveDate: form.effectiveDate, status: 'Pending',
      requestedBy: 'Maria Santos', remarks: form.remarks.trim() || undefined,
    })
    info('Transfer Filed', 'Transfer request added to mock data.')
  }
  close()
}
const applyAction = () => {
  const item = selected.value
  if (!item) return
  if (mode.value === 'review' && pending(item)) {
    if (decision.value === 'Rejected' && !actionRemarks.value.trim()) {
      error.value = 'Provide a reason for rejection.'
      return
    }
    item.status = decision.value
    item.reviewedBy = 'Maria Santos'
    item.reviewedAt = new Date().toISOString()
    item.remarks = actionRemarks.value.trim() || item.remarks
    info('Review Recorded', `Transfer marked ${decision.value.toLowerCase()} in mock data.`)
  } else if (mode.value === 'cancel' && pending(item)) {
    if (!actionRemarks.value.trim()) {
      error.value = 'Provide a cancellation reason.'
      return
    }
    item.status = 'Cancelled'
    item.remarks = actionRemarks.value.trim()
    info('Transfer Cancelled', 'Transfer request cancelled in mock data.')
  } else if (mode.value === 'complete' && item.status === 'Approved') {
    item.status = 'Completed'
    item.completedAt = new Date().toISOString()
    item.remarks = actionRemarks.value.trim() || item.remarks
    info('Transfer Completed', 'Transfer marked completed in mock data. Employee master record is unchanged.')
  } else return
  close()
}
watch(() => form.employeeId, () => {
  if (mode.value !== 'add') return
  form.toDepartment = employee.value?.department ?? ''
  form.toPosition = employee.value?.position ?? ''
})
watch(() => form.toDepartment, () => {
  if (mode.value === 'add' && !positionOptions.value.includes(form.toPosition)) form.toPosition = ''
})
const onEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') { close(); showExport.value = false }
}
onMounted(() => window.addEventListener('keydown', onEscape))
onBeforeUnmount(() => window.removeEventListener('keydown', onEscape))
</script>

<template>
  <section class="employee-transfers-page">
    <PageHeader
      title="Employee Transfers"
      description="Track employee department and position movements, transfer requests, effective dates and completed internal transfers."
    >
      <div class="header-actions">
        <AppButton variant="secondary" :icon="Download" @click="showExport = true">Export</AppButton>
        <AppButton :icon="Plus" @click="openAdd">New Transfer</AppButton>
      </div>
    </PageHeader>

    <EmployeeTransferStats :stats="stats" />
    <EmployeeTransferFilters
      v-model:search="search"
      v-model:from-department="fromDepartment"
      v-model:to-department="toDepartment"
      v-model:transfer-type="transferType"
      v-model:status="status"
      v-model:date-from="dateFrom"
      v-model:date-to="dateTo"
      :departments="departmentOptions"
      :transfer-types="transferTypeOptions"
      :statuses="statusOptions"
      @reset="resetFilters"
    />
    <EmployeeTransferTable
      :transfers="paginatedTransfers"
      @view="openRecord('view', $event)"
      @edit="openRecord('edit', $event)"
      @review="openRecord('review', $event)"
      @cancel="openRecord('cancel', $event)"
      @complete="openRecord('complete', $event)"
    />
    <div class="table-footer">
      <p>Showing <strong>{{ showingFrom }}–{{ showingTo }}</strong> of <strong>{{ filteredTransfers.length }}</strong> employee transfers</p>
      <AppPagination v-model="currentPage" :total-pages="totalPages" />
    </div>

    <Teleport to="body">
      <div v-if="mode" class="modal-overlay" @click.self="close">
        <div class="dialog" role="dialog" aria-modal="true" aria-label="Employee transfer">
          <div class="dialog-header">
            <div class="dialog-heading">
              <span class="heading-icon"><ArrowRightLeft :size="19" /></span>
              <div>
                <h2>{{ mode === 'add' ? 'New Employee Transfer' : mode === 'edit' ? 'Edit Transfer' : mode === 'view' ? 'Transfer Details' : mode === 'review' ? 'Review Transfer' : mode === 'cancel' ? 'Cancel Transfer' : 'Complete Transfer' }}</h2>
                <p>{{ selected?.transferNumber ?? 'Create an internal transfer request' }}</p>
              </div>
            </div>
            <button class="icon-close" type="button" aria-label="Close" @click="close"><X :size="17" /></button>
          </div>

          <form v-if="mode === 'add' || mode === 'edit'" @submit.prevent="saveTransfer">
            <div class="dialog-body">
              <div class="section-label">Employee & Current Assignment</div>
              <div class="form-grid">
                <label class="field full">Employee <span class="required">*</span>
                  <select v-model.number="form.employeeId" required :disabled="mode === 'edit'">
                    <option :value="0" disabled>Select employee</option>
                    <option v-for="person in employeeOptions" :key="person.id" :value="person.id">{{ person.name }} ({{ person.number }})</option>
                  </select>
                </label>
                <div class="field"><span>From Department</span><div class="read-only">{{ mode === 'edit' ? selected?.fromDepartment : employee?.department || 'Select employee' }}</div></div>
                <div class="field"><span>From Position</span><div class="read-only">{{ mode === 'edit' ? selected?.fromPosition : employee?.position || 'Select employee' }}</div></div>
              </div>
              <div class="section-label">Destination & Request</div>
              <div class="form-grid">
                <label class="field full">Transfer Type <span class="required">*</span>
                  <select v-model="form.transferType"><option v-for="type in transferTypeOptions" :key="type" :value="type">{{ type }}</option></select>
                </label>
                <label class="field">To Department <span class="required">*</span>
                  <select v-model="form.toDepartment" required>
                    <option value="" disabled>Select department</option>
                    <option v-for="name in departments" :key="name" :value="name">{{ name }}</option>
                  </select>
                </label>
                <label class="field">To Position <span class="required">*</span>
                  <select v-model="form.toPosition" required>
                    <option value="" disabled>Select position</option>
                    <option v-for="name in positionOptions" :key="name" :value="name">{{ name }}</option>
                    <option v-if="form.toPosition && !positionOptions.includes(form.toPosition)" :value="form.toPosition">{{ form.toPosition }} (existing)</option>
                  </select>
                </label>
                <label class="field full">Effective Date <span class="required">*</span><input v-model="form.effectiveDate" type="date" required /></label>
                <label class="field full">Reason <span class="required">*</span><textarea v-model="form.reason" rows="3" required placeholder="State the business reason for this transfer" /></label>
                <label class="field full">Remarks <textarea v-model="form.remarks" rows="2" placeholder="Optional additional notes" /></label>
              </div>
              <p v-if="error" class="form-error" role="alert">{{ error }}</p>
              <p class="form-note">Mock data only. Submission creates a Pending request; it does not automatically move the employee.</p>
            </div>
            <div class="dialog-footer"><button type="button" class="btn secondary" @click="close">Cancel</button><button class="btn primary" type="submit"><Save :size="15" /> {{ mode === 'edit' ? 'Save Changes' : 'File Transfer Request' }}</button></div>
          </form>

          <template v-else-if="mode === 'view' && selected">
            <div class="dialog-body">
              <div class="profile"><strong>{{ selected.employeeName }}</strong><span>{{ selected.employeeNumber }} · {{ selected.transferNumber }}</span><b>{{ selected.status }}</b></div>
              <div class="section-label">Transfer Movement</div>
              <div class="detail-grid">
                <div class="detail"><span>From Department</span><strong>{{ selected.fromDepartment }}</strong></div>
                <div class="detail"><span>From Position</span><strong>{{ selected.fromPosition }}</strong></div>
                <div class="detail"><span>To Department</span><strong>{{ selected.toDepartment }}</strong></div>
                <div class="detail"><span>To Position</span><strong>{{ selected.toPosition }}</strong></div>
                <div class="detail"><span>Transfer Type</span><strong>{{ selected.transferType }}</strong></div>
                <div class="detail"><span>Effective Date</span><strong>{{ formatDate(selected.effectiveDate) }}</strong></div>
                <div class="detail"><span>Requested Date</span><strong>{{ formatDate(selected.requestedDate) }}</strong></div>
                <div class="detail"><span>Requested By</span><strong>{{ selected.requestedBy }}</strong></div>
                <div class="detail"><span>Reviewed By</span><strong>{{ selected.reviewedBy || 'Not reviewed' }}</strong></div>
                <div class="detail"><span>Reviewed At</span><strong>{{ formatDate(selected.reviewedAt) }}</strong></div>
                <div class="detail"><span>Completed At</span><strong>{{ formatDate(selected.completedAt) }}</strong></div>
              </div>
              <div class="section-label">Reason & Remarks</div>
              <div class="note"><strong>Reason</strong><p>{{ selected.reason }}</p></div>
              <div class="note"><strong>Remarks</strong><p>{{ selected.remarks || 'No remarks' }}</p></div>
            </div>
            <div class="dialog-footer"><button class="btn primary" type="button" @click="close">Close Details</button></div>
          </template>

          <template v-else-if="selected">
            <div class="dialog-body">
              <div class="profile"><strong>{{ selected.employeeName }}</strong><span>{{ selected.transferNumber }} · {{ selected.fromDepartment }} → {{ selected.toDepartment }}</span><b>{{ selected.status }}</b></div>
              <div class="note"><strong>Transfer reason</strong><p>{{ selected.reason }}</p></div>
              <template v-if="mode === 'review'">
                <div class="section-label">Review Decision</div>
                <div class="decision-row">
                  <button type="button" :class="['choice', { picked: decision === 'Approved' }]" @click="decision = 'Approved'"><CheckCircle2 :size="15" /> Approve</button>
                  <button type="button" :class="['choice', { picked: decision === 'Rejected' }]" @click="decision = 'Rejected'"><AlertTriangle :size="15" /> Reject</button>
                </div>
              </template>
              <div v-if="mode === 'cancel' || mode === 'complete'" class="form-note">{{ mode === 'cancel' ? 'This request will be cancelled and kept in history.' : 'This action updates transfer status only. Employee master record is not changed.' }}</div>
              <label class="field">{{ mode === 'review' ? 'Review Remarks' : mode === 'cancel' ? 'Cancellation Reason (required)' : 'Completion Remarks' }}
                <textarea v-model="actionRemarks" rows="3" placeholder="Enter remarks" />
              </label>
              <p v-if="error" class="form-error" role="alert">{{ error }}</p>
            </div>
            <div class="dialog-footer">
              <button type="button" class="btn secondary" @click="close">Back</button>
              <button type="button" :class="['btn', mode === 'cancel' || decision === 'Rejected' && mode === 'review' ? 'danger' : 'primary']" @click="applyAction">
                {{ mode === 'review' ? `Confirm ${decision}` : mode === 'cancel' ? 'Cancel Transfer' : 'Mark Completed' }}
              </button>
            </div>
          </template>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showExport" class="modal-overlay" @click.self="showExport = false">
        <div class="dialog" role="dialog" aria-modal="true" aria-label="Export Employee Transfers">
          <div class="dialog-header">
            <div class="dialog-heading"><span class="heading-icon"><Download :size="19" /></span><div><h2>Export Employee Transfers</h2><p>Export employee movement and review records.</p></div></div>
            <button type="button" class="icon-close" aria-label="Close" @click="showExport = false"><X :size="17" /></button>
          </div>
          <div class="dialog-body">
            <div class="export-stats">
              <div class="stat"><span>Total</span><strong>{{ stats.totalTransfers }}</strong></div>
              <div class="stat"><span>Pending Review</span><strong>{{ stats.pendingReview }}</strong></div>
              <div class="stat"><span>Approved</span><strong>{{ stats.approved }}</strong></div>
              <div class="stat"><span>Completed</span><strong>{{ stats.completed }}</strong></div>
            </div>
            <div class="section-label">Export Format</div>
            <div class="format-grid">
              <button v-for="format in exportFormats" :key="format.value" type="button" :class="['format-card', { active: exportFormat === format.value }]" @click="exportFormat = format.value">
                <component :is="format.icon" :size="20" /><strong>{{ format.label }}</strong><span>{{ format.description }}</span>
              </button>
            </div>
            <div class="note"><strong>Included Data</strong><p>Transfer number, employee, transfer type, source and destination department/position, reason, dates, request status, requester, reviewer and remarks.</p></div>
            <p class="form-note">Export UI preview only. No file will be generated.</p>
          </div>
          <div class="dialog-footer"><button type="button" class="btn secondary" @click="showExport = false">Cancel</button><button type="button" class="btn primary" disabled><Download :size="15" /> Export {{ exportFormat.toUpperCase() }}</button></div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.employee-transfers-page { width: 100%; max-width: 1660px; margin: 0 auto; }
.header-actions { display: flex; align-items: center; gap: 8px; }
.table-footer { display: flex; justify-content: space-between; align-items: center; gap: 20px; padding: 14px 3px 0; }
.table-footer p { margin: 0; color: var(--text-muted); font-size: 11px; }
.table-footer strong { color: var(--text-primary); font-weight: 650; }
.modal-overlay { position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 18px; background: rgba(3, 12, 29, .78); backdrop-filter: blur(5px); }
.dialog { width: 100%; max-width: 620px; max-height: 90vh; overflow-y: auto; border: 1px solid var(--border); border-radius: 13px; background: var(--bg-card); color: var(--text-primary); box-shadow: 0 25px 65px rgba(0,0,0,.25); }
.dialog-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 18px; border-bottom: 1px solid var(--border); }
.dialog-heading { display: flex; align-items: center; gap: 10px; }
.heading-icon { display: grid; width: 37px; height: 37px; flex-shrink: 0; place-items: center; border-radius: 9px; background: var(--primary-soft); color: var(--primary); }
.dialog-header h2 { margin: 0; font-size: 13px; }
.dialog-header p { margin: 4px 0 0; font-size: 9px; color: var(--text-muted); }
.icon-close { display: grid; width: 29px; height: 29px; place-items: center; border: 1px solid var(--border); border-radius: 7px; background: transparent; color: var(--text-secondary); }
.dialog-body { display: flex; flex-direction: column; gap: 14px; padding: 18px; }
.dialog-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 13px 18px; border-top: 1px solid var(--border); }
.section-label { margin: 2px 0 -4px; font-size: 11px; font-weight: 700; }
.form-grid, .detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 13px; }
.field { display: flex; flex-direction: column; gap: 7px; color: var(--text-primary); font-size: 10px; font-weight: 600; }
.field.full { grid-column: 1 / -1; }
.field input, .field select, .field textarea, .read-only { width: 100%; min-height: 39px; padding: 10px; border: 1px solid var(--border); border-radius: 8px; outline: none; background: var(--bg-card-soft); color: var(--text-primary); font: inherit; font-weight: 400; }
.field input:focus, .field select:focus, .field textarea:focus { border-color: var(--primary); }
.field textarea { resize: vertical; }
.read-only { color: var(--text-secondary); }
.required, .form-error { color: var(--red); }
.form-error { font-size: 10px; margin: 0; }
.form-note { margin: 0; color: var(--text-muted); font-size: 9px; line-height: 1.5; }
.profile { display: flex; flex-direction: column; gap: 5px; padding: 13px; border: 1px solid var(--border); border-radius: 9px; background: var(--bg-card-soft); }
.profile strong { font-size: 13px; }
.profile span { font-size: 10px; color: var(--text-muted); }
.profile b { font-size: 10px; color: var(--primary); }
.detail { display: flex; flex-direction: column; gap: 7px; padding: 11px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); }
.detail span { font-size: 9px; color: var(--text-muted); }
.detail strong { font-size: 10px; }
.note { padding: 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); }
.note strong { font-size: 10px; }
.note p { margin: 6px 0 0; font-size: 10px; line-height: 1.6; color: var(--text-secondary); }
.btn { display: inline-flex; min-height: 36px; align-items: center; justify-content: center; gap: 7px; padding: 0 14px; border-radius: 8px; font-size: 10px; font-weight: 600; }
.btn.secondary { border: 1px solid var(--border); background: transparent; color: var(--text-primary); }
.btn.primary { border: 1px solid var(--primary); background: var(--primary); color: #fff; }
.btn.danger { border: 1px solid var(--red); background: var(--red); color: #fff; }
.btn:disabled { opacity: .55; cursor: not-allowed; }
.decision-row, .format-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
.choice { display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 39px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); color: var(--text-secondary); font-size: 11px; }
.choice.picked { border-color: var(--primary); background: var(--primary-soft); color: var(--primary); }
.export-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 7px; }
.stat { display: flex; flex-direction: column; gap: 6px; padding: 10px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); }
.stat span { font-size: 8px; color: var(--text-muted); }
.stat strong { font-size: 14px; }
.format-grid { grid-template-columns: repeat(3, 1fr); }
.format-card { display: flex; flex-direction: column; align-items: flex-start; gap: 7px; min-height: 93px; padding: 10px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); color: var(--text-primary); text-align: left; }
.format-card.active { border-color: var(--primary); background: var(--primary-soft); }
.format-card strong { font-size: 10px; }
.format-card span { font-size: 8px; line-height: 1.4; color: var(--text-muted); }
@media (max-width: 650px) {
  .header-actions { flex-direction: column; align-items: stretch; }
  .table-footer { flex-direction: column; align-items: flex-start; }
  .form-grid, .detail-grid { grid-template-columns: 1fr; }
  .export-stats { grid-template-columns: repeat(2, 1fr); }
  .format-grid { grid-template-columns: 1fr; }
}
</style>
