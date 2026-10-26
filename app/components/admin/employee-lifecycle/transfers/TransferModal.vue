
<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import {
  X, ArrowRightLeft, UserRound, CalendarDays,
  Download, Pencil, History, FileText, CheckCircle2,
  AlertCircle, Building2,
} from 'lucide-vue-next'

type TransferRecord = Record<string, any>
type Mode = 'create' | 'edit' | 'view' | 'history' | 'export'

const props = defineProps<{
  open: boolean
  mode: Mode
  selected?: TransferRecord | null
  records: TransferRecord[]
}>()

const emit = defineEmits<{
  close: []
  save: [payload: Record<string, string>]
}>()

const form = reactive({
  employeeId: '',
  employeeName: '',
  transferType: 'Department Transfer',
  currentDepartment: '',
  currentPosition: '',
  destinationDepartment: '',
  destinationPosition: '',
  requestedDate: '',
  effectiveDate: '',
  requestedBy: '',
  reason: '',
  remarks: '',
})

const error = ref('')
const validated = ref(false)
const exportScope = ref<'all' | 'search'>('all')
const exportSearch = ref('')

const get = (r: TransferRecord | null | undefined, ...keys: string[]) => {
  if (!r) return ''
  for (const key of keys) {
    const value = r[key]
    if (value !== undefined && value !== null && value !== '') {
      if (typeof value === 'object') {
        if ('name' in value) return String(value.name)
        continue
      }
      return String(value)
    }
  }
  return ''
}

const name = (r: TransferRecord | null | undefined) =>
  get(r, 'employeeName', 'employee_name', 'name') ||
  `${get(r, 'firstname')} ${get(r, 'lastname')}`.trim() ||
  'Employee'

const currentDepartment = (r: TransferRecord | null | undefined) =>
  get(r, 'currentDepartment', 'fromDepartment', 'from_department')

const destinationDepartment = (r: TransferRecord | null | undefined) =>
  get(r, 'destinationDepartment', 'toDepartment', 'to_department', 'newDepartment')

const title = computed(() => ({
  create: 'New Employee Transfer',
  edit: 'Edit Employee Transfer',
  view: 'Employee Transfer Details',
  history: 'Transfer History',
  export: 'Export Employee Transfers',
})[props.mode])

const reference = computed(() =>
  get(props.selected, 'transferNumber', 'transfer_number', 'reference', 'referenceNumber')
)

const status = computed(() =>
  get(props.selected, 'status', 'transferStatus') || 'Not available'
)

const formatDate = (value?: string) => {
  if (!value) return 'Not available'
  const date = new Date(
    value.includes('T') ? value : `${value}T00:00:00`
  )
  return Number.isNaN(date.getTime()) ? value :
    date.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })
}

watch(
  () => [props.open, props.mode, props.selected],
  () => {
    if (!props.open) return
    const r = props.mode === 'edit' ? props.selected : null

    Object.assign(form, {
      employeeId: get(r, 'employeeId', 'employee_id'),
      employeeName: r ? name(r) : '',
      transferType: get(r, 'transferType', 'transfer_type') || 'Department Transfer',
      currentDepartment: currentDepartment(r),
      currentPosition: get(r, 'currentPosition', 'fromPosition'),
      destinationDepartment: destinationDepartment(r),
      destinationPosition: get(r, 'destinationPosition', 'toPosition'),
      requestedDate: get(r, 'requestedDate', 'requested_date').slice(0,10),
      effectiveDate: get(r, 'effectiveDate', 'effective_date').slice(0,10),
      requestedBy: get(r, 'requestedBy', 'requested_by'),
      reason: get(r, 'reason'),
      remarks: get(r, 'remarks'),
    })

    error.value = ''
    validated.value = false
    exportScope.value = 'all'
    exportSearch.value = ''
  },
  { immediate: true }
)

const exportRows = computed(() => {
  if (exportScope.value === 'all') return props.records
  const q = exportSearch.value.toLowerCase().trim()
  return props.records.filter(r =>
    [name(r), get(r, 'transferNumber', 'reference'), destinationDepartment(r)]
      .some(value => value.toLowerCase().includes(q))
  )
})

const csvCell = (value: unknown) => {
  const raw = String(value ?? '')
  const safe = /^\s*[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw
  return `"${safe.replace(/"/g, '""')}"`
}

const downloadCsv = () => {
  if (!import.meta.client || !exportRows.value.length) return

  const rows = [
    ['Reference','Employee','Transfer Type','From Department','To Department',
      'Requested Date','Effective Date','Requested By','Status','Reason','Remarks'],
    ...exportRows.value.map(r => [
      get(r, 'transferNumber', 'transfer_number', 'reference'),
      name(r),
      get(r, 'transferType', 'transfer_type'),
      currentDepartment(r),
      destinationDepartment(r),
      get(r, 'requestedDate', 'requested_date'),
      get(r, 'effectiveDate', 'effective_date'),
      get(r, 'requestedBy', 'requested_by'),
      get(r, 'status', 'transferStatus'),
      get(r, 'reason'),
      get(r, 'remarks'),
    ]),
  ]

  const csv = rows.map(row => row.map(csvCell).join(',')).join('\r\n')
  const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'employee-transfers.csv'
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  emit('close')
}

const submit = () => {
  validated.value = false
  error.value = ''

  if (!form.employeeName.trim() ||
      !form.currentDepartment.trim() ||
      !form.destinationDepartment.trim() ||
      !form.requestedDate ||
      !form.effectiveDate ||
      !form.reason.trim()) {
    error.value = 'Please complete all required fields.'
    return
  }

  if (form.effectiveDate < form.requestedDate) {
    error.value = 'Effective date cannot be earlier than requested date.'
    return
  }

  validated.value = true
  // Emit a validated draft. Parent must decide how to persist it.
  emit('save', { ...form })
}

const close = () => emit('close')
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="overlay" @click.self="close">
      <section class="modal" role="dialog" aria-modal="true" :aria-label="title">
        <header class="modal-header">
          <div class="heading">
            <span class="heading-icon"><ArrowRightLeft :size="20" /></span>
            <div>
              <h2>{{ title }}</h2>
              <p>{{ reference || 'Employee Lifecycle · Transfers' }}</p>
            </div>
          </div>
          <button type="button" class="close-btn" aria-label="Close" @click="close">
            <X :size="18" />
          </button>
        </header>

        <div v-if="mode === 'view' && selected" class="modal-body">
          <div class="profile">
            <span class="profile-icon"><UserRound :size="24" /></span>
            <div>
              <h3>{{ name(selected) }}</h3>
              <p>{{ get(selected, 'employeeNumber', 'employee_number', 'emp_id') || reference }}</p>
            </div>
            <span class="status-chip">{{ status }}</span>
          </div>

          <h4 class="section-title"><ArrowRightLeft :size="16" /> Assignment Changes</h4>
          <div class="assignment-grid">
            <div class="assignment">
              <label>Current Assignment</label>
              <strong>{{ currentDepartment(selected) || 'Not available' }}</strong>
              <span>{{ get(selected, 'currentPosition', 'fromPosition') || '—' }}</span>
              <small>{{ get(selected, 'currentBranch', 'fromBranch') || '—' }}</small>
            </div>
            <div class="assignment">
              <label>New Assignment</label>
              <strong>{{ destinationDepartment(selected) || 'Not available' }}</strong>
              <span>{{ get(selected, 'destinationPosition', 'toPosition') || '—' }}</span>
              <small>{{ get(selected, 'destinationBranch', 'toBranch') || '—' }}</small>
            </div>
          </div>

          <h4 class="section-title"><CalendarDays :size="16" /> Transfer Information</h4>
          <div class="details">
            <div><label>Transfer Type</label><strong>{{ get(selected, 'transferType', 'transfer_type') || '—' }}</strong></div>
            <div><label>Requested Date</label><strong>{{ formatDate(get(selected, 'requestedDate', 'requested_date')) }}</strong></div>
            <div><label>Effective Date</label><strong>{{ formatDate(get(selected, 'effectiveDate', 'effective_date')) }}</strong></div>
            <div><label>Requested By</label><strong>{{ get(selected, 'requestedBy', 'requested_by') || '—' }}</strong></div>
            <div><label>Approved By</label><strong>{{ get(selected, 'approvedBy', 'approved_by') || 'Pending' }}</strong></div>
            <div><label>Status</label><strong>{{ status }}</strong></div>
          </div>

          <div class="note"><FileText :size="16" /><div><label>Reason</label><p>{{ get(selected, 'reason') || 'No reason recorded.' }}</p></div></div>
          <div class="note"><FileText :size="16" /><div><label>Remarks</label><p>{{ get(selected, 'remarks') || 'No remarks.' }}</p></div></div>
        </div>

        <div v-else-if="mode === 'history' && selected" class="modal-body">
          <div class="profile">
            <span class="profile-icon"><History :size="24" /></span>
            <div><h3>{{ name(selected) }}</h3><p>{{ reference }}</p></div>
          </div>
          <h4 class="section-title"><History :size="16" /> Available Record History</h4>
          <div class="timeline">
            <div><strong>Record Created</strong><p>{{ formatDate(get(selected, 'createdAt', 'created_at')) }}</p></div>
            <div><strong>Last Updated</strong><p>{{ formatDate(get(selected, 'updatedAt', 'updated_at')) }}</p></div>
            <div><strong>Current Status</strong><p>{{ status }}</p></div>
          </div>
          <div class="notice">
            <AlertCircle :size="16" />
            <p>This shows available record timestamps, not a complete audit trail. Full history requires backend activity logs.</p>
          </div>
        </div>

        <div v-else-if="mode === 'export'" class="modal-body">
          <div class="profile">
            <span class="profile-icon"><Download :size="23" /></span>
            <div><h3>Employee Transfers Report</h3><p>Download a CSV file for Microsoft Excel.</p></div>
          </div>
          <div class="field">
            <label>Export Scope</label>
            <select v-model="exportScope">
              <option value="all">All Provided Records</option>
              <option value="search">Search Records</option>
            </select>
          </div>
          <div v-if="exportScope === 'search'" class="field">
            <label>Search Employee / Transfer</label>
            <input v-model="exportSearch" placeholder="Search name, reference or destination..." />
          </div>
          <div class="export-count"><span>Records to Export</span><strong>{{ exportRows.length }}</strong></div>
        </div>

        <form
          v-else-if="mode === 'create' || mode === 'edit'"
          id="transfer-form"
          class="modal-body"
          @submit.prevent="submit"
        >
          <h4 class="section-title first"><UserRound :size="16" /> Employee Information</h4>
          <div class="form-grid">
            <div class="field">
              <label>Employee ID</label>
              <input v-model="form.employeeId" placeholder="EMP-001" />
            </div>
            <div class="field">
              <label>Employee Name *</label>
              <input v-model="form.employeeName" required placeholder="Employee full name" />
            </div>
            <div class="field full">
              <label>Transfer Type</label>
              <select v-model="form.transferType">
                <option>Department Transfer</option>
                <option>Position Transfer</option>
                <option>Assignment Transfer</option>
              </select>
            </div>
          </div>

          <h4 class="section-title"><Building2 :size="16" /> Assignment Details</h4>
          <div class="form-grid">
            <div class="field">
              <label>Current Department *</label>
              <input v-model="form.currentDepartment" required />
            </div>
            <div class="field">
              <label>Current Position</label>
              <input v-model="form.currentPosition" />
            </div>
            <div class="field">
              <label>Destination Department *</label>
              <input v-model="form.destinationDepartment" required />
            </div>
            <div class="field">
              <label>Destination Position</label>
              <input v-model="form.destinationPosition" />
            </div>
          </div>

          <h4 class="section-title"><CalendarDays :size="16" /> Transfer Schedule</h4>
          <div class="form-grid">
            <div class="field">
              <label>Requested Date *</label>
              <input v-model="form.requestedDate" type="date" required />
            </div>
            <div class="field">
              <label>Effective Date *</label>
              <input v-model="form.effectiveDate" type="date" :min="form.requestedDate || undefined" required />
            </div>
            <div class="field full">
              <label>Requested By</label>
              <input v-model="form.requestedBy" placeholder="HR or requesting manager" />
            </div>
            <div class="field full">
              <label>Transfer Reason *</label>
              <textarea v-model="form.reason" rows="3" required placeholder="Reason for transfer..." />
            </div>
            <div class="field full">
              <label>Remarks</label>
              <textarea v-model="form.remarks" rows="2" placeholder="Additional notes..." />
            </div>
          </div>

          <div class="notice">
            <AlertCircle :size="16" />
            <p>This is a frontend draft form. It will not save to Laravel until its API endpoint is connected.</p>
          </div>
          <p v-if="error" class="error">{{ error }}</p>
          <p v-if="validated" class="validated"><CheckCircle2 :size="16" /> Draft validated successfully.</p>
        </form>

        <footer class="modal-footer">
          <button type="button" class="btn secondary" @click="close">
            {{ mode === 'view' || mode === 'history' ? 'Close' : 'Cancel' }}
          </button>
          <button v-if="mode === 'export'" type="button" class="btn primary" :disabled="!exportRows.length" @click="downloadCsv">
            <Download :size="15" /> Download CSV
          </button>
          <button v-if="mode === 'create' || mode === 'edit'" type="submit" form="transfer-form" class="btn primary">
            <Pencil :size="15" /> Validate Transfer
          </button>
        </footer>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay { position:fixed;inset:0;z-index:10050;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(3,9,23,.78);backdrop-filter:blur(5px); }
.modal { display:flex;flex-direction:column;width:100%;max-width:690px;max-height:90vh;overflow:hidden;border:1px solid var(--border);border-radius:14px;background:var(--bg-card);color:var(--text-primary);box-shadow:0 24px 65px rgba(0,0,0,.3); }
.modal-header,.modal-footer { display:flex;align-items:center;justify-content:space-between;gap:12px;padding:17px 20px; }
.modal-header { border-bottom:1px solid var(--border); }
.modal-footer { justify-content:flex-end;border-top:1px solid var(--border); }
.heading,.profile { display:flex;align-items:center;gap:12px; }
.heading-icon,.profile-icon { display:grid;place-items:center;flex-shrink:0;width:44px;height:44px;border-radius:10px;background:var(--primary-soft);color:var(--primary); }
.heading h2 { margin:0;font-size:15px; }
.heading p,.profile p { margin:5px 0 0;color:var(--text-muted);font-size:11px; }
.close-btn { display:grid;place-items:center;width:32px;height:32px;border:0;border-radius:7px;background:transparent;color:var(--text-muted);cursor:pointer; }
.modal-body { overflow-y:auto;padding:20px; }
.profile { padding:15px;border:1px solid var(--border);border-radius:10px;background:var(--bg-card-soft); }
.profile h3 { margin:0;font-size:13px; }
.status-chip { margin-left:auto;padding:6px 10px;border-radius:16px;background:var(--primary-soft);color:var(--primary);font-size:10px; }
.section-title { display:flex;align-items:center;gap:8px;margin:22px 0 15px;padding-bottom:10px;border-bottom:1px solid var(--border-soft);font-size:12px;font-weight:700; }
.section-title svg { color:var(--primary); }
.section-title.first { margin-top:0; }
.assignment-grid,.details,.form-grid { display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px; }
.assignment { display:flex;flex-direction:column;gap:7px;padding:14px;border:1px solid var(--border);border-radius:9px;background:var(--bg-card-soft); }
.assignment label,.assignment small,.field label,.details label,.note label { color:var(--text-muted);font-size:10px; }
.assignment strong { font-size:12px; }
.assignment span,.assignment small { font-size:11px; }
.details > div { display:flex;flex-direction:column;gap:7px; }
.details strong { font-size:11px;overflow-wrap:anywhere; }
.note { display:flex;gap:10px;margin-top:14px;padding:13px;border:1px solid var(--border);border-radius:9px;background:var(--bg-card-soft); }
.note svg { flex-shrink:0;color:var(--primary); }
.note p { margin:6px 0 0;color:var(--text-secondary);font-size:11px; }
.field { display:flex;flex-direction:column;gap:7px;margin-bottom:12px; }
.field.full { grid-column:1/-1; }
.field input,.field select,.field textarea { width:100%;min-height:40px;padding:10px;border:1px solid var(--border);border-radius:8px;outline:none;background:var(--bg-card-soft);color:var(--text-primary);font:inherit;font-size:11px; }
.field input:focus,.field select:focus,.field textarea:focus { border-color:var(--primary); }
.export-count { display:flex;align-items:center;justify-content:space-between;margin-top:12px;padding:15px;border:1px solid var(--border);border-radius:9px;font-size:11px; }
.export-count strong { color:var(--primary);font-size:23px; }
.timeline { margin:18px 0 0 7px; }
.timeline > div { min-height:65px;padding:0 0 18px 17px;border-left:2px solid var(--primary-soft); }
.timeline strong { font-size:11px; }
.timeline p { margin:7px 0 0;color:var(--text-muted);font-size:11px; }
.notice { display:flex;align-items:flex-start;gap:10px;margin-top:18px;padding:13px;border:1px solid var(--border);border-radius:9px;background:var(--primary-soft); }
.notice svg { flex-shrink:0;color:var(--primary); }
.notice p { margin:0;color:var(--text-secondary);font-size:11px;line-height:1.6; }
.error { color:var(--red);font-size:11px; }
.validated { display:flex;align-items:center;gap:8px;color:var(--green);font-size:11px; }
.btn { display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:38px;padding:0 16px;border:1px solid var(--border);border-radius:8px;font-size:11px;font-weight:650;cursor:pointer; }
.btn.secondary { background:var(--bg-card-soft);color:var(--text-primary); }
.btn.primary { border-color:var(--primary);background:var(--primary);color:#fff; }
.btn:disabled { opacity:.5;cursor:not-allowed; }
@media(max-width:600px) { .assignment-grid,.details,.form-grid { grid-template-columns:1fr; } .modal-header,.modal-body,.modal-footer { padding:15px; } }
</style>
