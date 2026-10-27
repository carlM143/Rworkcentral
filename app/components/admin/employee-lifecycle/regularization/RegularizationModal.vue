
<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import {
  X, Download, UserRound, CalendarDays,
  ClipboardCheck, Clock3, FileText,
  ShieldCheck, AlertCircle, CheckCircle2,
} from 'lucide-vue-next'

type Mode = 'export' | 'process' | 'view' | 'status' | 'history'

type RecordData = Record<string, any>

const props = defineProps<{
  open: boolean
  mode: Mode
  records: RecordData[]
  selected?: RecordData | null
}>()

const emit = defineEmits<{
  close: []
}>()

const exportScope = ref<'all' | 'selected'>('all')
const search = ref('')
const validated = ref(false)
const error = ref('')

const form = reactive({
  employeeId: '',
  decision: '',
  effectiveDate: '',
  remarks: '',
})

const title = computed(() => ({
  export: 'Export Regularization',
  process: 'Process Regularization',
  view: 'Regularization Details',
  status: 'Regularization Status',
  history: 'Regularization History',
})[props.mode])

const get = (record: RecordData | null | undefined, ...keys: string[]) => {
  if (!record) return ''
  for (const key of keys) {
    const value = record[key]
    if (value !== undefined && value !== null && value !== '') {
      return String(value)
    }
  }
  return ''
}

const recordName = (record: RecordData) =>
  get(record, 'employeeName', 'employee_name', 'name') ||
  `Employee #${get(record, 'employeeId', 'employee_id', 'id')}`

const recordId = (record: RecordData) =>
  get(record, 'id', 'regularizationNumber', 'regularization_number')

const filteredRecords = computed(() => {
  const q = search.value.trim().toLowerCase()
  return props.records.filter(record =>
    !q || [
      recordName(record),
      get(record, 'regularizationNumber', 'regularization_number'),
    ].some(value => value.toLowerCase().includes(q))
  )
})

const exportRows = computed(() =>
  exportScope.value === 'selected'
    ? filteredRecords.value
    : props.records
)

const activeRecord = computed(() => {
  if (props.selected) return props.selected
  return props.records.find(r => recordId(r) === form.employeeId) ?? null
})

watch(
  () => [props.open, props.mode],
  () => {
    if (!props.open) return
    exportScope.value = 'all'
    search.value = ''
    validated.value = false
    error.value = ''

    form.employeeId = props.selected ? recordId(props.selected) : ''
    form.decision = ''
    form.effectiveDate = ''
    form.remarks = ''
  },
  { immediate: true }
)

const formatDate = (value: unknown) => {
  if (!value) return 'Not available'
  const text = String(value)
  const date = new Date(
    text.includes('T') ? text : `${text}T00:00:00`
  )
  return Number.isNaN(date.getTime())
    ? text
    : date.toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      })
}

const fields = computed(() => {
  const r = activeRecord.value

  return [
    ['Employee', r ? recordName(r) : '—'],
    ['Reference', get(r, 'regularizationNumber', 'regularization_number', 'reference') || '—'],
    ['Department', get(r, 'department') || '—'],
    ['Position', get(r, 'position') || '—'],
    ['Target Regularization', formatDate(get(r, 'targetRegularizationDate', 'targetDate', 'target_regularization_date'))],
    ['Evaluation', get(r, 'evaluationStatus', 'evaluation_status') || '—'],
    ['Recommendation', get(r, 'recommendation') || '—'],
    ['Status', get(r, 'status', 'regularizationStatus') || '—'],
    ['Effective Date', formatDate(get(r, 'effectiveDate', 'effective_date'))],
    ['Remarks', get(r, 'remarks') || 'No remarks'],
  ]
})

const csvCell = (value: unknown) => {
  const raw = String(value ?? '')
  const safe = /^\s*[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw
  return `"${safe.replace(/"/g, '""')}"`
}

const downloadCsv = () => {
  if (!import.meta.client || !exportRows.value.length) return

  const columns = [
    'Employee', 'Reference', 'Department', 'Position',
    'Evaluation', 'Recommendation', 'Target Date',
    'Effective Date', 'Status', 'Remarks',
  ]

  const rows = exportRows.value.map(r => [
    recordName(r),
    get(r, 'regularizationNumber', 'regularization_number'),
    get(r, 'department'),
    get(r, 'position'),
    get(r, 'evaluationStatus', 'evaluation_status'),
    get(r, 'recommendation'),
    get(r, 'targetRegularizationDate', 'targetDate', 'target_regularization_date'),
    get(r, 'effectiveDate', 'effective_date'),
    get(r, 'status', 'regularizationStatus'),
    get(r, 'remarks'),
  ])

  const csv = [columns, ...rows]
    .map(row => row.map(csvCell).join(','))
    .join('\r\n')

  const blob = new Blob(['\uFEFF', csv], {
    type: 'text/csv;charset=utf-8;',
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'employee-regularization.csv'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
  emit('close')
}

const validateProcess = () => {
  validated.value = false
  error.value = ''

  if (
    !form.employeeId ||
    !form.decision ||
    !form.effectiveDate
  ) {
    error.value = 'Please complete all required fields.'
    return
  }

  validated.value = true
  // Frontend validation only.
  // No database changes until Laravel API is connected.
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="modal-overlay" @click.self="emit('close')">
      <section class="modal-card" role="dialog" aria-modal="true" :aria-label="title">
        <header class="modal-header">
          <div class="modal-heading">
            <span class="header-icon"><ShieldCheck :size="21" /></span>
            <div>
              <h2>{{ title }}</h2>
              <p>Employee Lifecycle · Regularization</p>
            </div>
          </div>
          <button type="button" class="icon-btn" aria-label="Close" @click="emit('close')">
            <X :size="19" />
          </button>
        </header>

        <!-- EXPORT -->
        <div v-if="mode === 'export'" class="modal-body">
          <div class="info-banner">
            <Download :size="22" />
            <div>
              <strong>Regularization Report</strong>
              <p>Export employee regularization records to CSV.</p>
            </div>
          </div>

          <div class="field">
            <label>Export Scope</label>
            <select v-model="exportScope">
              <option value="all">All Records</option>
              <option value="selected">Search / Selected Records</option>
            </select>
          </div>

          <div v-if="exportScope === 'selected'" class="field">
            <label>Search Employee</label>
            <input v-model="search" placeholder="Search name or reference..." />
          </div>

          <div class="summary-row">
            <span>Records to export</span>
            <strong>{{ exportRows.length }}</strong>
          </div>
        </div>

        <!-- PROCESS REGULARIZATION -->
        <form
          v-else-if="mode === 'process'"
          id="regularization-form"
          class="modal-body"
          @submit.prevent="validateProcess"
        >
          <div class="section-title">
            <UserRound :size="16" /> Employee Information
          </div>

          <div class="field">
            <label>Select Employee *</label>
            <select v-model="form.employeeId" required>
              <option value="" disabled>Select an employee</option>
              <option
                v-for="r in records"
                :key="recordId(r)"
                :value="recordId(r)"
              >
                {{ recordName(r) }}
              </option>
            </select>
          </div>

          <div class="section-title">
            <ClipboardCheck :size="16" /> Regularization Details
          </div>

          <div class="form-grid">
            <div class="field">
              <label>Regularization Decision *</label>
              <select v-model="form.decision" required>
                <option value="" disabled>Select decision</option>
                <option value="Regularized">Regularized</option>
                <option value="Extended">Extend Probation</option>
                <option value="For Review">For Review</option>
              </select>
            </div>

            <div class="field">
              <label>Effective Date *</label>
              <input v-model="form.effectiveDate" type="date" required />
            </div>
          </div>

          <div class="field">
            <label>Remarks</label>
            <textarea
              v-model="form.remarks"
              rows="3"
              placeholder="Enter HR remarks..."
            />
          </div>

          <div class="notice">
            <AlertCircle :size="17" />
            <p>
              UI preview only. This form will not update an employee's
              status until the backend workflow is connected and authorized.
            </p>
          </div>

          <p v-if="error" class="error-text">{{ error }}</p>

          <div v-if="validated" class="success-note">
            <CheckCircle2 :size="17" />
            Form validation passed. Database processing is not connected yet.
          </div>
        </form>

        <!-- DETAILS / STATUS / HISTORY -->
        <div v-else class="modal-body">
          <div v-if="activeRecord" class="profile-card">
            <span class="profile-avatar"><UserRound :size="23" /></span>
            <div>
              <h3>{{ recordName(activeRecord) }}</h3>
              <p>
                {{ get(activeRecord, 'regularizationNumber', 'regularization_number') || 'Regularization record' }}
              </p>
            </div>
          </div>

          <template v-if="mode === 'view'">
            <div class="section-title">
              <FileText :size="16" /> Record Information
            </div>
            <div class="details-grid">
              <div v-for="field in fields" :key="field[0]" class="detail">
                <label>{{ field[0] }}</label>
                <strong>{{ field[1] }}</strong>
              </div>
            </div>
          </template>

          <template v-else-if="mode === 'status'">
            <div class="section-title">
              <ClipboardCheck :size="16" /> Current Regularization Status
            </div>
            <div class="status-panel">
              <span>Current Status</span>
              <strong>
                {{ get(activeRecord, 'status', 'regularizationStatus') || 'Not available' }}
              </strong>
            </div>
            <div class="details-grid">
              <div class="detail">
                <label>Evaluation</label>
                <strong>{{ get(activeRecord, 'evaluationStatus') || '—' }}</strong>
              </div>
              <div class="detail">
                <label>Recommendation</label>
                <strong>{{ get(activeRecord, 'recommendation') || '—' }}</strong>
              </div>
              <div class="detail">
                <label>Effective Date</label>
                <strong>{{ formatDate(get(activeRecord, 'effectiveDate')) }}</strong>
              </div>
            </div>
          </template>

          <template v-else-if="mode === 'history'">
            <div class="section-title">
              <History :size="16" /> Available Record Timestamps
            </div>
            <div class="timeline">
              <div class="timeline-item">
                <span class="dot" />
                <div>
                  <strong>Record Created</strong>
                  <p>{{ formatDate(get(activeRecord, 'createdAt', 'created_at')) }}</p>
                </div>
              </div>
              <div class="timeline-item">
                <span class="dot" />
                <div>
                  <strong>Last Updated</strong>
                  <p>{{ formatDate(get(activeRecord, 'updatedAt', 'updated_at')) }}</p>
                </div>
              </div>
            </div>
            <div class="notice">
              <Clock3 :size="17" />
              <p>Complete event-by-event history requires backend activity logs.</p>
            </div>
          </template>
        </div>

        <footer class="modal-footer">
          <button type="button" class="btn secondary" @click="emit('close')">
            {{ mode === 'export' || mode === 'process' ? 'Cancel' : 'Close' }}
          </button>

          <button
            v-if="mode === 'export'"
            type="button"
            class="btn primary"
            :disabled="!exportRows.length"
            @click="downloadCsv"
          >
            <Download :size="15" /> Download CSV
          </button>

          <button
            v-if="mode === 'process'"
            type="submit"
            form="regularization-form"
            class="btn primary"
          >
            <ClipboardCheck :size="15" /> Validate Form
          </button>
        </footer>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 10050;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  background: rgba(3,9,23,.78);
  backdrop-filter: blur(5px);
}
.modal-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 650px;
  max-height: 90vh;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--bg-card);
  color: var(--text-primary);
  box-shadow: 0 24px 65px rgba(0,0,0,.28);
}
.modal-header,.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 17px 20px;
}
.modal-header { border-bottom: 1px solid var(--border); }
.modal-footer { justify-content: flex-end; border-top: 1px solid var(--border); }
.modal-heading,.profile-card,.info-banner {
  display: flex;
  align-items: center;
  gap: 12px;
}
.header-icon,.profile-avatar {
  display: grid;
  width: 43px;
  height: 43px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 10px;
  background: var(--primary-soft);
  color: var(--primary);
}
.modal-heading h2 { margin: 0; font-size: 15px; }
.modal-heading p,.profile-card p,.info-banner p {
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: 11px;
}
.icon-btn {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--text-muted);
}
.modal-body { overflow-y: auto; padding: 20px; }
.profile-card,.info-banner,.status-panel {
  padding: 15px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card-soft);
}
.profile-card h3 { margin: 0; font-size: 14px; }
.info-banner { margin-bottom: 18px; }
.info-banner > svg { color: var(--primary); }
.info-banner strong { font-size: 12px; }
.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 20px 0 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-soft);
  font-size: 12px;
  font-weight: 700;
}
.section-title svg { color: var(--primary); }
.field { display: flex; flex-direction: column; gap: 7px; margin-bottom: 15px; }
.field label,.detail label {
  color: var(--text-muted);
  font-size: 10px;
}
.field input,.field select,.field textarea {
  width: 100%;
  min-height: 40px;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  outline: 0;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font: inherit;
  font-size: 11px;
}
.form-grid,.details-grid {
  display: grid;
  grid-template-columns: repeat(2,minmax(0,1fr));
  gap: 14px;
}
.detail { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.detail strong { overflow-wrap: anywhere; font-size: 11px; }
.status-panel { display: flex; justify-content: space-between; margin-bottom: 17px; }
.status-panel span { font-size: 11px; color: var(--text-muted); }
.status-panel strong { font-size: 12px; color: var(--primary); }
.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  border: 1px solid var(--border);
  border-radius: 9px;
  font-size: 11px;
}
.summary-row strong { font-size: 22px; color: var(--primary); }
.timeline { margin-top: 15px; padding-left: 8px; }
.timeline-item {
  display: flex;
  gap: 15px;
  padding: 0 0 25px;
  border-left: 1px solid var(--border);
}
.dot {
  width: 12px;
  height: 12px;
  margin-left: -7px;
  border: 3px solid var(--primary-soft);
  border-radius: 50%;
  background: var(--primary);
}
.timeline-item strong { font-size: 11px; }
.timeline-item p { font-size: 11px; color: var(--text-muted); }
.notice,.success-note {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 15px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--primary-soft);
}
.notice svg { flex-shrink: 0; color: var(--primary); }
.notice p { margin: 0; font-size: 11px; color: var(--text-secondary); line-height: 1.6; }
.success-note { background: var(--green-soft); color: var(--green); font-size: 11px; }
.error-text { color: var(--red); font-size: 11px; }
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 38px;
  padding: 0 16px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 11px;
  font-weight: 650;
}
.btn.secondary { background: var(--bg-card-soft); color: var(--text-primary); }
.btn.primary { border-color: var(--primary); background: var(--primary); color: #fff; }
.btn:disabled { opacity: .5; cursor: not-allowed; }
@media(max-width:600px) {
  .form-grid,.details-grid { grid-template-columns: 1fr; }
  .modal-header,.modal-body,.modal-footer { padding: 15px; }
}
</style>
