
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  ArrowLeftRight, Download, Plus, RefreshCw,
  X, Eye, Pencil, Save, AlertTriangle,
  CheckCircle2, Trash2, PlayCircle,
} from 'lucide-vue-next'

import EmployeeTransferStats from '~/components/admin/employees/transfer-department/EmployeeTransferStats.vue'
import EmployeeTransferFilters from '~/components/admin/employees/transfer-department/EmployeeTransferFilters.vue'
import EmployeeTransferTable from '~/components/admin/employees/transfer-department/EmployeeTransferTable.vue'
import { useEmployeeTransfers } from '~/composables/admin/employee-transfer-department/useEmployeeTransfers'

import type {
  EmployeeTransfer,
  TransferMode,
} from '~/types/employeeTransfer'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Employee Transfers | RWorkCentral' })

type ModalMode = 'create' | 'edit' | 'view' | 'confirm' | 'export' | null
type ActionName =
  | 'view' | 'edit' | 'approve' | 'reject'
  | 'apply' | 'cancel' | 'delete'

interface TransferForm {
  employee_id: number
  to_department_id: number
  effective_date: string
  reason: string
  mode: TransferMode
}

const formatDateTime = (value?: string | null) => {
  if (!value) return '—'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('en-PH', {
    timeZone: 'Asia/Manila',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

const {
  transfers, departments, employees,
  loading, optionsLoading, error: fetchError,
  stats: apiStats,
  fetchTransfers, fetchOptions, getDepartmentName,
  createTransfer, updateTransfer, deleteTransfer,
  approveTransfer, rejectTransfer, applyTransfer, cancelTransfer,
} = useEmployeeTransfers()

const search = ref('')
const fromDepartment = ref('')
const toDepartment = ref('')
const status = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const currentPage = ref(1)
const pageSize = 8

const modalMode = ref<ModalMode>(null)
const selected = ref<EmployeeTransfer | null>(null)
const action = ref<ActionName | null>(null)
const reviewRemarks = ref('')
const saving = ref(false)
const message = ref('')
const actionError = ref('')
const optionsError = ref('')
const exportScope = ref<'filtered' | 'all'>('filtered')

const todayPH = () => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())

  const value = (type: string) =>
    parts.find(part => part.type === type)?.value || ''

  return `${value('year')}-${value('month')}-${value('day')}`
}

const emptyForm = (): TransferForm => ({
  employee_id: 0,
  to_department_id: 0,
  effective_date: todayPH(),
  reason: '',
  mode: 'direct',
})

const form = ref<TransferForm>(emptyForm())

const departmentName = (item: EmployeeTransfer, side: 'from' | 'to') => {
  const department = side === 'from'
    ? item.from_department
    : item.to_department

  const id = side === 'from'
    ? item.from_department_id
    : item.to_department_id

  return department?.department_name ||
    department?.name ||
    getDepartmentName(id)
}

const employeeName = (item: EmployeeTransfer) =>
  [item.employee?.firstname, item.employee?.lastname]
    .filter(Boolean)
    .join(' ') || `Employee #${item.employee_id}`

const transferNumber = (item: EmployeeTransfer) =>
  `TRF-${String(item.id).padStart(5, '0')}`

const departmentOptions = computed(() =>
  [...new Set([
    ...departments.value.map(item =>
      item.department_name || item.name || ''
    ),
    ...transfers.value.flatMap(item => [
      departmentName(item, 'from'),
      departmentName(item, 'to'),
    ]),
  ].filter(Boolean))].sort()
)

const statusOptions = [
  'Pending', 'Approved', 'Scheduled',
  'Applied', 'Rejected', 'Cancelled',
]

const stats = computed(() => ({
  totalTransfers: apiStats.value.total,
  pendingReview: apiStats.value.pending,
  approved: apiStats.value.approved,
  completed: apiStats.value.applied,
}))

const filteredTransfers = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  return transfers.value.filter(item => {
    const from = departmentName(item, 'from')
    const to = departmentName(item, 'to')
    const effective = item.effective_date?.slice(0, 10) || ''

    const searchable = [
      transferNumber(item),
      employeeName(item),
      item.employee?.emp_id,
      from,
      to,
      item.reason,
      item.creator?.name,
    ].join(' ').toLowerCase()

    return (
      (!keyword || searchable.includes(keyword)) &&
      (!fromDepartment.value || from === fromDepartment.value) &&
      (!toDepartment.value || to === toDepartment.value) &&
      (!status.value || item.status === status.value.toLowerCase()) &&
      (!dateFrom.value || effective >= dateFrom.value) &&
      (!dateTo.value || effective <= dateTo.value)
    )
  })
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredTransfers.value.length / pageSize))
)

const paginatedTransfers = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredTransfers.value.slice(start, start + pageSize)
})

const showingFrom = computed(() =>
  filteredTransfers.value.length
    ? (currentPage.value - 1) * pageSize + 1
    : 0
)

const showingTo = computed(() =>
  Math.min(currentPage.value * pageSize, filteredTransfers.value.length)
)

watch(
  [search, fromDepartment, toDepartment, status, dateFrom, dateTo],
  () => { currentPage.value = 1 }
)

watch(totalPages, value => {
  if (currentPage.value > value) currentPage.value = value
})

const resetFilters = () => {
  search.value = ''
  fromDepartment.value = ''
  toDepartment.value = ''
  status.value = ''
  dateFrom.value = ''
  dateTo.value = ''
  currentPage.value = 1
}

const refresh = async () => {
  optionsError.value = ''

  const results = await Promise.allSettled([
    fetchTransfers(),
    fetchOptions(),
  ])

  if (results[1]?.status === 'rejected') {
    optionsError.value =
      'Employee or department options could not be loaded. Check the Admin employees and departments APIs.'
  }
}

onMounted(refresh)

const selectedEmployee = computed(() =>
  employees.value.find(item => item.id === form.value.employee_id)
)

const currentDepartmentText = computed(() => {
  if (modalMode.value === 'edit' && selected.value) {
    return departmentName(selected.value, 'from')
  }

  const departmentId = selectedEmployee.value?.currentDepartmentId

  return departmentId
    ? getDepartmentName(departmentId)
    : 'Automatically determined by the backend'
})

const modalTitle = computed(() => {
  if (modalMode.value === 'create') return 'New Department Transfer'
  if (modalMode.value === 'edit') return 'Edit Department Transfer'
  if (modalMode.value === 'view') return 'Transfer Details'
  if (modalMode.value === 'export') return 'Export Employee Transfers'

  const labels: Record<string, string> = {
    approve: 'Approve Transfer',
    reject: 'Reject Transfer',
    apply: 'Apply Department Transfer',
    cancel: 'Cancel Transfer',
    delete: 'Delete Transfer',
  }

  return labels[action.value || ''] || 'Confirm Action'
})

const closeModal = () => {
  if (saving.value) return
  modalMode.value = null
  selected.value = null
  action.value = null
  reviewRemarks.value = ''
  actionError.value = ''
}

const handleNewTransfer = () => {
  form.value = emptyForm()
  selected.value = null
  actionError.value = ''
  modalMode.value = 'create'
}

const handleView = (item: EmployeeTransfer) => {
  selected.value = item
  actionError.value = ''
  modalMode.value = 'view'
}

const handleEdit = (item: EmployeeTransfer) => {
  if (!['pending', 'scheduled'].includes(item.status)) return

  selected.value = item
  form.value = {
    employee_id: item.employee_id,
    to_department_id: item.to_department_id,
    effective_date: item.effective_date.slice(0, 10),
    reason: item.reason || '',
    mode: 'request',
  }

  actionError.value = ''
  modalMode.value = 'edit'
}

const handleTableAction = (payload: {
  type: ActionName
  transfer: EmployeeTransfer
}) => {
  if (payload.type === 'view') return handleView(payload.transfer)
  if (payload.type === 'edit') return handleEdit(payload.transfer)

  selected.value = payload.transfer
  action.value = payload.type
  reviewRemarks.value = ''
  actionError.value = ''
  modalMode.value = 'confirm'
}

const getError = (error: any) => {
  const errors = error?.data?.errors || error?.response?._data?.errors

  if (errors) {
    return Object.values(errors)
      .flat()
      .map(String)
      .join(' ')
  }

  return error?.data?.message ||
    error?.response?._data?.message ||
    error?.message ||
    'Unable to process the transfer.'
}

const handleSaveTransfer = async () => {
  if (saving.value) return

  if (!form.value.employee_id || !form.value.to_department_id || !form.value.effective_date) {
    actionError.value = 'Please select an employee, destination department and effective date.'
    return
  }

  if (
    selectedEmployee.value?.currentDepartmentId &&
    selectedEmployee.value.currentDepartmentId === form.value.to_department_id &&
    modalMode.value === 'create'
  ) {
    actionError.value = 'Destination department must be different from the current department.'
    return
  }

  saving.value = true
  actionError.value = ''
  const isEdit = modalMode.value === 'edit'

  try {
    let response

    if (isEdit && selected.value) {
      response = await updateTransfer(selected.value.id, {
        to_department_id: form.value.to_department_id,
        effective_date: form.value.effective_date,
        reason: form.value.reason.trim(),
      })
    } else {
      response = await createTransfer({
        employee_id: form.value.employee_id,
        to_department_id: form.value.to_department_id,
        effective_date: form.value.effective_date,
        reason: form.value.reason.trim(),
        mode: form.value.mode,
      })
    }

    message.value = response.message || (
      isEdit ? 'Transfer updated successfully.' : 'Transfer created successfully.'
    )

    modalMode.value = null
    selected.value = null

    await fetchTransfers()
    currentPage.value = 1
  } catch (error: any) {
    actionError.value = getError(error)
  } finally {
    saving.value = false
  }
}

const handleConfirmAction = async () => {
  if (!selected.value || !action.value || saving.value) return

  if (action.value === 'reject' && reviewRemarks.value.trim().length < 5) {
    actionError.value = 'Please provide at least five characters for rejection remarks.'
    return
  }

  saving.value = true
  actionError.value = ''

  try {
    const id = selected.value.id
    let response

    switch (action.value) {
      case 'approve':
        response = await approveTransfer(id, reviewRemarks.value.trim())
        break
      case 'reject':
        response = await rejectTransfer(id, reviewRemarks.value.trim())
        break
      case 'apply':
        response = await applyTransfer(id)
        break
      case 'cancel':
        response = await cancelTransfer(id)
        break
      case 'delete':
        response = await deleteTransfer(id)
        break
      default:
        return
    }

    message.value = response.message || 'Transfer processed successfully.'
    modalMode.value = null
    selected.value = null
    action.value = null

    await fetchTransfers()
  } catch (error: any) {
    actionError.value = getError(error)
  } finally {
    saving.value = false
  }
}

const detailFields = computed(() => {
  const item = selected.value
  if (!item) return []

  return [
    { label: 'Transfer No.', value: transferNumber(item) },
    { label: 'Employee', value: employeeName(item) },
    { label: 'Employee ID', value: item.employee?.emp_id },
    { label: 'From Department', value: departmentName(item, 'from') },
    { label: 'To Department', value: departmentName(item, 'to') },
    { label: 'Effective Date', value: item.effective_date.slice(0, 10) },
    { label: 'Status', value: item.status.toUpperCase() },
    { label: 'Created By', value: item.creator?.name },
    { label: 'Created At', value: formatDateTime(item.created_at) },
    { label: 'Reviewed By', value: item.reviewer?.name },
    { label: 'Reviewed At', value: formatDateTime(item.reviewed_at) },
    { label: 'Review Remarks', value: item.review_remarks },
    { label: 'Applied By', value: item.applier?.name },
    { label: 'Applied At', value: formatDateTime(item.applied_at) },
    { label: 'Reason', value: item.reason },
  ]
})

// CSV export: all records or current filtered records.
const exportCsv = () => {
  const rows = exportScope.value === 'all'
    ? transfers.value
    : filteredTransfers.value

  const columns = [
    'Transfer No', 'Employee ID', 'Employee', 'From Department',
    'To Department', 'Effective Date', 'Status', 'Created By',
    'Created At', 'Reviewed By', 'Reviewed At',
    'Applied By', 'Applied At', 'Reason',
  ]

  const escapeCsv = (value: unknown) => {
    let text = String(value ?? '')

    // Prevent spreadsheet formula execution when opening the CSV.
    if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`

    return `"${text.replace(/"/g, '""')}"`
  }

  const values = rows.map(item => [
    transferNumber(item),
    item.employee?.emp_id ?? item.employee_id,
    employeeName(item),
    departmentName(item, 'from'),
    departmentName(item, 'to'),
    item.effective_date.slice(0, 10),
    item.status,
    item.creator?.name,
    item.created_at,
    item.reviewer?.name,
    item.reviewed_at,
    item.applier?.name,
    item.applied_at,
    item.reason,
  ])

  const csv = [
    columns.map(escapeCsv).join(','),
    ...values.map(row => row.map(escapeCsv).join(',')),
  ].join('\r\n')

  const blob = new Blob(['\uFEFF', csv], {
    type: 'text/csv;charset=utf-8;',
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'employee-department-transfers.csv'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)

  closeModal()
}
</script>

<template>
  <section class="employee-transfers-page">
    <PageHeader
      title="Employee Department Transfers"
      description="Manage employee department movements, optional approvals, and transfer history."
    >
      <div class="header-actions">
        <AppButton
          variant="secondary"
          :icon="RefreshCw"
          :disabled="loading"
          @click="refresh"
        >
          Refresh
        </AppButton>

        <AppButton
          variant="secondary"
          :icon="Download"
          @click="exportScope = 'filtered'; modalMode = 'export'"
        >
          Export
        </AppButton>

        <AppButton :icon="Plus" @click="handleNewTransfer">
          New Transfer
        </AppButton>
      </div>
    </PageHeader>

    <div v-if="message" class="feedback success">
      <CheckCircle2 :size="16" /> {{ message }}
    </div>

    <div v-if="fetchError" class="feedback error">
      <AlertTriangle :size="16" /> {{ fetchError }}
    </div>

    <div v-if="optionsError" class="feedback error">
      <AlertTriangle :size="16" /> {{ optionsError }}
    </div>

    <EmployeeTransferStats :stats="stats" />

    <EmployeeTransferFilters
      v-model:search="search"
      v-model:from-department="fromDepartment"
      v-model:to-department="toDepartment"
      v-model:status="status"
      v-model:date-from="dateFrom"
      v-model:date-to="dateTo"
      :departments="departmentOptions"
      :statuses="statusOptions"
      @reset="resetFilters"
    />

    <div v-if="loading" class="loading-state">
      <RefreshCw :size="18" class="spinner" />
      Loading employee transfers...
    </div>

    <EmployeeTransferTable
      v-else
      :transfers="paginatedTransfers"
      @action="handleTableAction"
    />

    <div class="table-footer">
      <p>
        Showing <strong>{{ showingFrom }}–{{ showingTo }}</strong>
        of <strong>{{ filteredTransfers.length }}</strong> transfers
      </p>

      <AppPagination
        v-model="currentPage"
        :total-pages="totalPages"
      />
    </div>

    <Teleport to="body">
      <div
        v-if="modalMode"
        class="employee-transfer-overlay"
        @click.self="closeModal"
      >
        <div class="employee-transfer-modal" role="dialog" aria-modal="true" :aria-label="modalTitle">
          <header class="transfer-modal-header">
            <div class="modal-heading">
              <span class="modal-icon"><ArrowLeftRight :size="19" /></span>
              <div>
                <h2>{{ modalTitle }}</h2>
                <p>
                  {{
                    modalMode === 'create' ? 'Create a direct transfer or approval request.' :
                    modalMode === 'edit' ? 'Update the department transfer information.' :
                    modalMode === 'view' ? 'Review all transfer details and history.' :
                    modalMode === 'confirm' ? 'Confirm the selected transfer action.' :
                    'Export department transfer records.'
                  }}
                </p>
              </div>
            </div>

            <button
              type="button"
              class="icon-button"
              :disabled="saving"
              @click="closeModal"
            >
              <X :size="18" />
            </button>
          </header>

          <!-- CREATE / EDIT -->
          <form
            v-if="modalMode === 'create' || modalMode === 'edit'"
            @submit.prevent="handleSaveTransfer"
          >
            <div class="transfer-modal-body">
              <div class="transfer-form-grid">
                <label class="transfer-field full-width">
                  Employee *
                  <select
                    v-model.number="form.employee_id"
                    :disabled="modalMode === 'edit' || optionsLoading"
                    required
                  >
                    <option :value="0" disabled>Select employee</option>
                    <option
                      v-for="employee in employees"
                      :key="employee.id"
                      :value="employee.id"
                    >
                      {{ employee.label }}
                    </option>
                  </select>
                </label>

                <label class="transfer-field">
                  Current Department
                  <input
                    :value="currentDepartmentText"
                    readonly
                    class="readonly-field"
                  >
                </label>

                <label class="transfer-field">
                  Destination Department *
                  <select v-model.number="form.to_department_id" required>
                    <option :value="0" disabled>Select destination</option>
                    <option
                      v-for="department in departments"
                      :key="department.id"
                      :value="department.id"
                    >
                      {{ department.department_name || department.name }}
                    </option>
                  </select>
                </label>

                <label class="transfer-field">
                  Effective Date *
                  <input v-model="form.effective_date" type="date" required>
                </label>

                <label v-if="modalMode === 'create'" class="transfer-field">
                  Transfer Method *
                  <select v-model="form.mode">
                    <option value="direct">Direct Transfer</option>
                    <option value="request">Transfer Request (Requires Approval)</option>
                  </select>
                </label>

                <label class="transfer-field full-width">
                  Reason for Transfer (Optional)
                  <textarea
                    v-model="form.reason"
                    rows="3"
                    placeholder="Enter the reason for the department transfer..."
                  />
                </label>
              </div>

              <div v-if="modalMode === 'create'" class="form-note">
                <AlertTriangle :size="16" />
                <span v-if="form.mode === 'direct'">
                  Direct transfers take effect immediately if the effective date has arrived.
                  Future-dated direct transfers remain Scheduled until applied.
                </span>
                <span v-else>
                  The request starts as Pending. An authorized reviewer must approve it
                  before the transfer can be applied.
                </span>
              </div>

              <p v-if="actionError" class="form-error">{{ actionError }}</p>
            </div>

            <footer class="transfer-modal-footer">
              <button type="button" class="secondary-button" :disabled="saving" @click="closeModal">
                Cancel
              </button>

              <button type="submit" class="primary-button" :disabled="saving">
                <Save :size="15" />
                {{ saving ? 'Saving...' : modalMode === 'edit' ? 'Save Changes' : 'Create Transfer' }}
              </button>
            </footer>
          </form>

          <!-- VIEW -->
          <template v-else-if="modalMode === 'view' && selected">
            <div class="transfer-modal-body">
              <div class="detail-grid">
                <div v-for="field in detailFields" :key="field.label" class="detail-field">
                  <span>{{ field.label }}</span>
                  <strong>{{ field.value || '—' }}</strong>
                </div>
              </div>
            </div>

            <footer class="transfer-modal-footer">
              <button class="secondary-button" type="button" @click="closeModal">Close</button>
              <button
                v-if="['pending','scheduled'].includes(selected.status)"
                class="primary-button"
                type="button"
                @click="handleEdit(selected)"
              >
                <Pencil :size="15" /> Edit Transfer
              </button>
            </footer>
          </template>

          <!-- ACTION CONFIRMATION -->
          <template v-else-if="modalMode === 'confirm' && selected">
            <div class="transfer-modal-body">
              <div class="confirm-summary">
                <strong>{{ employeeName(selected) }}</strong>
                <p>
                  {{ departmentName(selected, 'from') }}
                  →
                  {{ departmentName(selected, 'to') }}
                </p>
                <small>
                  Effective: {{ selected.effective_date.slice(0, 10) }}
                </small>
              </div>

              <div class="form-note">
                <AlertTriangle :size="16" />
                <span v-if="action === 'approve'">
                  Approval will not change the employee's department.
                  The transfer must be applied separately.
                </span>
                <span v-else-if="action === 'apply'">
                  This action will update the employee's actual department.
                  Verify the effective date and destination before continuing.
                </span>
                <span v-else-if="action === 'delete'">
                  This will permanently delete the transfer record.
                </span>
                <span v-else-if="action === 'cancel'">
                  This will cancel the transfer without changing the employee's department.
                </span>
                <span v-else>
                  Rejected transfers cannot be applied.
                </span>
              </div>

              <label
                v-if="action === 'approve' || action === 'reject'"
                class="transfer-field remarks-field"
              >
                Review Remarks {{ action === 'reject' ? '*' : '(Optional)' }}
                <textarea
                  v-model="reviewRemarks"
                  rows="3"
                  :placeholder="action === 'reject' ? 'Enter rejection reason...' : 'Enter approval remarks...'"
                />
              </label>

              <p v-if="actionError" class="form-error">{{ actionError }}</p>
            </div>

            <footer class="transfer-modal-footer">
              <button class="secondary-button" type="button" :disabled="saving" @click="closeModal">
                Back
              </button>

              <button
                class="primary-button"
                :class="{ 'danger-button': ['reject','delete','cancel'].includes(action || '') }"
                type="button"
                :disabled="saving || (action === 'reject' && reviewRemarks.trim().length < 5)"
                @click="handleConfirmAction"
              >
                <PlayCircle v-if="action === 'apply'" :size="15" />
                <Trash2 v-else-if="action === 'delete'" :size="15" />
                <CheckCircle2 v-else :size="15" />
                {{ saving ? 'Processing...' : `Confirm ${action}` }}
              </button>
            </footer>
          </template>

          <!-- EXPORT -->
          <template v-else-if="modalMode === 'export'">
            <div class="transfer-modal-body">
              <label class="export-choice">
                <input v-model="exportScope" type="radio" value="filtered">
                Export filtered records ({{ filteredTransfers.length }})
              </label>
              <label class="export-choice">
                <input v-model="exportScope" type="radio" value="all">
                Export all loaded records ({{ transfers.length }})
              </label>
            </div>

            <footer class="transfer-modal-footer">
              <button class="secondary-button" type="button" @click="closeModal">Cancel</button>
              <button class="primary-button" type="button" @click="exportCsv">
                <Download :size="15" /> Export CSV
              </button>
            </footer>
          </template>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.employee-transfers-page{width:100%;max-width:1660px;margin:0 auto;color:var(--text-primary)}
.header-actions{display:flex;align-items:center;gap:9px}
.table-footer{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:15px 3px}
.table-footer p{margin:0;color:var(--text-muted);font-size:12px}
.table-footer strong{color:var(--text-primary)}
.feedback{display:flex;align-items:center;gap:9px;margin-bottom:13px;padding:11px 13px;border-radius:8px;font-size:12px}
.feedback.success{background:var(--green-soft,#dcfce7);color:var(--green,#15803d)}
.feedback.error{background:var(--red-soft,#fee2e2);color:var(--red,#dc2626)}
.loading-state{display:flex;align-items:center;justify-content:center;gap:10px;min-height:220px;border:1px solid var(--border);border-radius:10px;background:var(--bg-card);color:var(--text-muted);font-size:12px}
.spinner{animation:spin 1s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
@media(max-width:650px){.header-actions{flex-wrap:wrap}.table-footer{align-items:flex-start;flex-direction:column}}
</style>

<style>
.employee-transfer-overlay{position:fixed;inset:0;z-index:100000;display:grid;place-items:center;padding:16px;background:rgba(3,9,22,.7);backdrop-filter:blur(6px)}
.employee-transfer-modal{width:min(720px,100%);max-height:92vh;overflow-y:auto;border:1px solid var(--border);border-radius:14px;background:var(--bg-card);color:var(--text-primary);box-shadow:0 25px 70px rgba(0,0,0,.3)}
.transfer-modal-header{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:19px 23px;border-bottom:1px solid var(--border)}
.modal-heading{display:flex;align-items:center;gap:12px}
.modal-icon{display:grid;width:42px;height:42px;place-items:center;flex-shrink:0;border-radius:10px;background:var(--primary-soft);color:var(--primary)}
.modal-heading h2{margin:0;font-size:17px}
.modal-heading p{margin:5px 0 0;color:var(--text-muted);font-size:11px}
.icon-button{display:grid;place-items:center;width:34px;height:34px;border:0;border-radius:7px;background:var(--bg-card-soft);color:var(--text-secondary);cursor:pointer}
.transfer-modal-body{padding:22px}
.transfer-form-grid,.detail-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px}
.transfer-field{display:flex;flex-direction:column;gap:7px;color:var(--text-secondary);font-size:12px;font-weight:600}
.transfer-field.full-width{grid-column:1/-1}
.transfer-field input,.transfer-field select,.transfer-field textarea{width:100%;min-height:41px;box-sizing:border-box;padding:10px 12px;border:1px solid var(--border);border-radius:8px;outline:0;background:var(--bg-card-soft);color:var(--text-primary);font:inherit;font-size:12px;font-weight:400}
.transfer-field input:focus,.transfer-field select:focus,.transfer-field textarea:focus{border-color:var(--primary)}
.transfer-field input:disabled,.readonly-field{opacity:.75;cursor:not-allowed}
.transfer-field textarea{resize:vertical}
.form-note{display:flex;align-items:flex-start;gap:10px;margin-top:17px;padding:13px;border:1px solid var(--border);border-radius:8px;background:var(--bg-card-soft);color:var(--text-secondary);font-size:12px;line-height:1.7}
.form-note svg{flex-shrink:0;margin-top:2px;color:var(--primary)}
.form-error{margin:14px 0 0;color:var(--red,#dc2626);font-size:12px}
.transfer-modal-footer{display:flex;align-items:center;justify-content:flex-end;gap:10px;padding:16px 23px;border-top:1px solid var(--border)}
.secondary-button,.primary-button{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:39px;padding:9px 16px;border-radius:8px;font-family:inherit;font-size:12px;font-weight:650;cursor:pointer}
.secondary-button{border:1px solid var(--border);background:var(--bg-card-soft);color:var(--text-primary)}
.primary-button{border:1px solid var(--primary);background:var(--primary);color:#fff}
.primary-button.danger-button{border-color:#dc2626;background:#dc2626}
.secondary-button:disabled,.primary-button:disabled{opacity:.55;cursor:not-allowed}
.detail-field{display:flex;flex-direction:column;gap:6px;padding:11px;border:1px solid var(--border);border-radius:8px;background:var(--bg-card-soft);overflow-wrap:anywhere}
.detail-field span{color:var(--text-muted);font-size:11px}
.detail-field strong{color:var(--text-primary);font-size:12px;font-weight:650}
.confirm-summary{padding:15px;border:1px solid var(--border);border-radius:9px;background:var(--bg-card-soft)}
.confirm-summary strong{font-size:14px}
.confirm-summary p{margin:8px 0;color:var(--text-secondary);font-size:12px}
.confirm-summary small{color:var(--text-muted);font-size:11px}
.remarks-field{margin-top:17px}
.export-choice{display:flex;align-items:center;gap:10px;margin-bottom:10px;padding:14px;border:1px solid var(--border);border-radius:8px;background:var(--bg-card-soft);font-size:12px;cursor:pointer}
.export-choice input{accent-color:var(--primary)}
@media(max-width:650px){.transfer-modal-body{padding:16px}.transfer-form-grid,.detail-grid{grid-template-columns:1fr}.transfer-modal-footer{flex-wrap:wrap}}
</style>
