<script setup lang="ts">
import {
  Download, Plus, X, Users, FileSpreadsheet, FileText,
  Table2, Save, Eye, AlertTriangle, CalendarDays,
} from 'lucide-vue-next'
import type { DepartmentAssignment, DepartmentAssignmentType } from '~/types/departmentAssignment'
import DepartmentAssignmentStats from '~/components/departments/assignments/DepartmentAssignmentStats.vue'
import DepartmentAssignmentFilters from '~/components/departments/assignments/DepartmentAssignmentFilters.vue'
import DepartmentAssignmentTable from '~/components/departments/assignments/DepartmentAssignmentTable.vue'

const {
  assignments, search, department, assignmentType, status, currentPage,
  filteredAssignments, paginatedAssignments, totalPages, showingFrom, showingTo,
  stats, departmentOptions, assignmentTypeOptions, statusOptions, resetFilters,
} = useDepartmentAssignments()

const { info } = useToast()
const route = useRoute()

type ModalMode = 'add' | 'edit' | 'view' | 'end' | null
type ExportFormat = 'excel' | 'pdf' | 'csv'

const mode = ref<ModalMode>(null)
const selectedId = ref<number | null>(null)
const showExport = ref(false)
const exportFormat = ref<ExportFormat>('excel')
const formError = ref('')
const endDate = ref('')
const endRemarks = ref('')
const selected = computed(() => assignments.value.find(item => item.id === selectedId.value) ?? null)

const form = reactive({
  employeeId: 0,
  department: '',
  position: '',
  assignmentType: 'Primary' as DepartmentAssignmentType,
  supervisor: '',
  effectiveDate: '',
  endDate: '',
  remarks: '',
})

// Employee choices come from the existing mock assignment records.
// When the employee master/API is connected, replace this list with active employees.
const employeeOptions = computed(() => {
  const found = new Map<number, { id: number; name: string; number: string }>()
  assignments.value.forEach(item => {
    found.set(item.employeeId, {
      id: item.employeeId,
      name: item.employeeName,
      number: item.employeeNumber,
    })
  })
  return [...found.values()].sort((a, b) => a.name.localeCompare(b.name))
})

const availableDepartments = computed(() => [...new Set([
  ...departmentOptions.value,
  ...assignments.value.map(item => item.department),
])].filter(Boolean).sort())

const positionOptions = computed(() => [...new Set(assignments.value
  .filter(item => item.department === form.department)
  .map(item => item.position))].sort())

const exportFormats = [
  { value: 'excel' as const, label: 'Excel', caption: 'HR reports and analysis', icon: FileSpreadsheet },
  { value: 'pdf' as const, label: 'PDF', caption: 'Printable assignment report', icon: FileText },
  { value: 'csv' as const, label: 'CSV', caption: 'Raw data for external systems', icon: Table2 },
]

const resetForm = () => {
  Object.assign(form, {
    employeeId: 0, department: '', position: '', assignmentType: 'Primary',
    supervisor: '', effectiveDate: '', endDate: '', remarks: '',
  })
  formError.value = ''
}

const openAdd = () => {
  resetForm()
  selectedId.value = null
  mode.value = 'add'
}

const openRecord = (kind: 'view' | 'edit' | 'end', item: DepartmentAssignment) => {
  selectedId.value = item.id
  formError.value = ''
  if (kind === 'edit') {
    Object.assign(form, {
      employeeId: item.employeeId, department: item.department,
      position: item.position, assignmentType: item.assignmentType,
      supervisor: item.supervisor, effectiveDate: item.effectiveDate,
      endDate: item.endDate ?? '', remarks: item.remarks ?? '',
    })
  }
  if (kind === 'end') {
    endDate.value = new Date().toLocaleDateString('en-CA')
    endRemarks.value = ''
  }
  mode.value = kind
}

const close = () => {
  mode.value = null
  selectedId.value = null
  formError.value = ''
}

const isOverlappingPrimary = (excludeId: number | null) => {
  if (form.assignmentType !== 'Primary') return false
  return assignments.value.some(item => {
    if (item.id === excludeId || item.employeeId !== Number(form.employeeId)) return false
    if (item.assignmentType !== 'Primary') return false
    const existingEnd = item.endDate || '9999-12-31'
    const newEnd = form.endDate || '9999-12-31'
    return item.effectiveDate <= newEnd && form.effectiveDate <= existingEnd
  })
}

const saveAssignment = () => {
  formError.value = ''
  const employee = employeeOptions.value.find(item => item.id === Number(form.employeeId))
  if (!employee || !form.department || !form.position.trim() || !form.supervisor.trim() || !form.effectiveDate) {
    formError.value = 'Complete all required fields before saving.'
    return
  }
  if (form.endDate && form.endDate < form.effectiveDate) {
    formError.value = 'End date cannot be earlier than the effective date.'
    return
  }
  if (isOverlappingPrimary(mode.value === 'edit' ? selectedId.value : null)) {
    formError.value = 'This employee already has an overlapping primary assignment.'
    return
  }

  const nextStatus = form.assignmentType === 'Primary' ? 'Active' : 'Temporary'
  const statusValue = form.endDate && form.endDate < new Date().toLocaleDateString('en-CA')
    ? 'Ended' as const
    : nextStatus

  if (mode.value === 'edit' && selected.value) {
    const row = selected.value
    Object.assign(row, {
      department: form.department, position: form.position.trim(),
      assignmentType: form.assignmentType, status: statusValue,
      supervisor: form.supervisor.trim(), effectiveDate: form.effectiveDate,
      endDate: form.endDate || undefined, remarks: form.remarks.trim() || undefined,
    })
    info('Assignment Updated', `${employee.name}'s assignment updated in mock data.`)
  } else {
    const id = Math.max(0, ...assignments.value.map(item => item.id)) + 1
    assignments.value.unshift({
      id,
      assignmentNumber: `DA-${new Date().getFullYear()}-${String(id).padStart(3, '0')}`,
      employeeId: employee.id,
      employeeNumber: employee.number,
      employeeName: employee.name,
      department: form.department,
      position: form.position.trim(),
      assignmentType: form.assignmentType,
      status: statusValue,
      supervisor: form.supervisor.trim(),
      effectiveDate: form.effectiveDate,
      endDate: form.endDate || undefined,
      assignedBy: 'Maria Santos', // Mock logged-in administrator
      assignedAt: new Date().toISOString(),
      remarks: form.remarks.trim() || undefined,
    })
    info('Assignment Created', `${employee.name} assigned in mock data.`)
  }
  close()
}

const confirmEnd = () => {
  if (!selected.value) return
  if (!endDate.value || endDate.value < selected.value.effectiveDate) {
    formError.value = 'Enter an end date on or after the effective date.'
    return
  }
  selected.value.status = 'Ended'
  selected.value.endDate = endDate.value
  if (endRemarks.value.trim()) {
    selected.value.remarks = [selected.value.remarks, endRemarks.value.trim()].filter(Boolean).join(' | ')
  }
  info('Assignment Ended', 'Assignment marked as ended in mock data.')
  close()
}

watch(() => form.department, () => {
  if (mode.value === 'add' && !positionOptions.value.includes(form.position)) form.position = ''
})

watch(() => route.query.department, value => {
  if (typeof value === 'string' && value) department.value = value
}, { immediate: true })

const formatDate = (value?: string) => value
  ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(`${value}T00:00:00`))
  : '—'
</script>

<template>
  <section class="department-assignment-page">
    <PageHeader
      title="Employee Assignment"
      description="Manage employee department assignments, positions, supervisors and temporary or acting designations."
    >
      <div class="header-actions">
        <AppButton variant="secondary" :icon="Download" @click="showExport = true">Export</AppButton>
        <AppButton :icon="Plus" @click="openAdd">Assign Employee</AppButton>
      </div>
    </PageHeader>

    <DepartmentAssignmentStats :stats="stats" />

    <DepartmentAssignmentFilters
      v-model:search="search"
      v-model:department="department"
      v-model:assignment-type="assignmentType"
      v-model:status="status"
      :departments="departmentOptions"
      :assignment-types="assignmentTypeOptions"
      :statuses="statusOptions"
      @reset="resetFilters"
    />

    <DepartmentAssignmentTable
      :assignments="paginatedAssignments"
      @view="item => openRecord('view', item)"
      @edit="item => openRecord('edit', item)"
      @end="item => openRecord('end', item)"
    />

    <div class="table-footer">
      <p>
        Showing <strong>{{ showingFrom }}–{{ showingTo }}</strong>
        of <strong>{{ filteredAssignments.length }}</strong> department assignments
      </p>
      <AppPagination v-model="currentPage" :total-pages="totalPages" />
    </div>

    <!-- ADD / EDIT / VIEW / END MODALS -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="mode" class="modal-backdrop" @click.self="close">
          <section class="modal-card" role="dialog" aria-modal="true" aria-label="Department assignment">
            <header class="modal-header">
              <div class="modal-heading">
                <div class="modal-icon"><Users :size="19" /></div>
                <div>
                  <h2>{{ mode === 'add' ? 'Assign Employee' : mode === 'edit' ? 'Edit Assignment' : mode === 'end' ? 'End Assignment' : 'Assignment Details' }}</h2>
                  <p>{{ selected?.assignmentNumber ?? 'Create a new department assignment' }}</p>
                </div>
              </div>
              <button class="icon-close" type="button" aria-label="Close" @click="close"><X :size="17" /></button>
            </header>

            <div v-if="mode === 'view' && selected" class="modal-body">
              <div class="profile-box">
                <div class="profile-avatar"><Users :size="21" /></div>
                <div>
                  <h3>{{ selected.employeeName }}</h3>
                  <p>{{ selected.employeeNumber }} · {{ selected.assignmentNumber }}</p>
                </div>
                <span class="pill">{{ selected.status }}</span>
              </div>
              <div class="details-grid">
                <div v-for="entry in [
                  ['Department', selected.department], ['Position', selected.position],
                  ['Assignment Type', selected.assignmentType], ['Supervisor', selected.supervisor],
                  ['Effective Date', formatDate(selected.effectiveDate)], ['End Date', formatDate(selected.endDate)],
                  ['Assigned By', selected.assignedBy], ['Assigned On', selected.assignedAt.slice(0, 10)],
                ]" :key="entry[0]" class="detail-box">
                  <span>{{ entry[0] }}</span><strong>{{ entry[1] }}</strong>
                </div>
              </div>
              <div class="notice"><strong>Remarks</strong><p>{{ selected.remarks || 'No remarks provided.' }}</p></div>
            </div>

            <form v-else-if="mode === 'add' || mode === 'edit'" @submit.prevent="saveAssignment">
              <div class="modal-body">
                <div class="section-title">Employee & Department</div>
                <div class="form-grid">
                  <label class="field">
                    <span>Employee <b>*</b></span>
                    <select v-model.number="form.employeeId" required :disabled="mode === 'edit'">
                      <option :value="0" disabled>Select employee</option>
                      <option v-for="person in employeeOptions" :key="person.id" :value="person.id">
                        {{ person.name }} ({{ person.number }})
                      </option>
                    </select>
                  </label>
                  <label class="field">
                    <span>Department <b>*</b></span>
                    <select v-model="form.department" required>
                      <option value="" disabled>Select department</option>
                      <option v-for="name in availableDepartments" :key="name" :value="name">{{ name }}</option>
                    </select>
                  </label>
                  <label class="field">
                    <span>Position <b>*</b></span>
                    <input v-model.trim="form.position" list="assignment-positions" required placeholder="Select or enter position" />
                    <datalist id="assignment-positions">
                      <option v-for="name in positionOptions" :key="name" :value="name" />
                    </datalist>
                  </label>
                  <label class="field">
                    <span>Assignment Type <b>*</b></span>
                    <select v-model="form.assignmentType" required>
                      <option v-for="type in assignmentTypeOptions" :key="type" :value="type">{{ type }}</option>
                    </select>
                  </label>
                  <label class="field full">
                    <span>Supervisor <b>*</b></span>
                    <input v-model.trim="form.supervisor" required placeholder="Supervisor's name" />
                  </label>
                </div>
                <div class="section-title">Assignment Period</div>
                <div class="form-grid">
                  <label class="field"><span>Effective Date <b>*</b></span><input v-model="form.effectiveDate" type="date" required /></label>
                  <label class="field"><span>End Date</span><input v-model="form.endDate" type="date" :min="form.effectiveDate || undefined" /></label>
                  <label class="field full"><span>Remarks</span><textarea v-model="form.remarks" rows="3" placeholder="Optional assignment notes" /></label>
                </div>
                <p class="helper-text">Only one non-overlapping Primary assignment is allowed per employee. Temporary and Acting assignments may run alongside it.</p>
                <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>
              </div>
              <footer class="modal-footer">
                <button type="button" class="btn secondary" @click="close">Cancel</button>
                <button type="submit" class="btn primary"><Save :size="15" />{{ mode === 'add' ? 'Save Assignment' : 'Save Changes' }}</button>
              </footer>
            </form>

            <form v-else-if="mode === 'end' && selected" @submit.prevent="confirmEnd">
              <div class="modal-body">
                <div class="notice warning"><AlertTriangle :size="17" /><p>End the assignment for <strong>{{ selected.employeeName }}</strong>? This keeps the historical record and changes its status to Ended.</p></div>
                <div class="form-grid">
                  <label class="field"><span>End Date <b>*</b></span><input v-model="endDate" type="date" :min="selected.effectiveDate" required /></label>
                  <label class="field full"><span>Remarks</span><textarea v-model="endRemarks" rows="3" placeholder="Reason for ending the assignment" /></label>
                </div>
                <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>
              </div>
              <footer class="modal-footer">
                <button type="button" class="btn secondary" @click="close">Cancel</button>
                <button type="submit" class="btn danger">Confirm End Assignment</button>
              </footer>
            </form>

            <footer v-else class="modal-footer">
              <button type="button" class="btn secondary" @click="close">Close Details</button>
            </footer>
          </section>
        </div>
      </Transition>
    </Teleport>

    <!-- EXPORT: UI ONLY -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showExport" class="modal-backdrop" @click.self="showExport = false">
          <section class="modal-card" role="dialog" aria-modal="true" aria-label="Export department assignments">
            <header class="modal-header">
              <div class="modal-heading">
                <div class="modal-icon"><Download :size="19" /></div>
                <div><h2>Export Employee Assignments</h2><p>Export department assignment records and their status.</p></div>
              </div>
              <button class="icon-close" type="button" aria-label="Close" @click="showExport = false"><X :size="17" /></button>
            </header>
            <div class="modal-body">
              <div class="stats-grid">
                <div v-for="stat in [
                  ['Total', stats.totalAssignments], ['Active', stats.activeAssignments],
                  ['Temporary / Acting', stats.temporaryAssignments], ['Departments', stats.departmentsCovered],
                ]" :key="stat[0]" class="stat-box"><span>{{ stat[0] }}</span><strong>{{ stat[1] }}</strong></div>
              </div>
              <div class="section-title">Export Format</div>
              <div class="format-grid">
                <button v-for="option in exportFormats" :key="option.value" type="button"
                  class="format-card" :class="{ chosen: exportFormat === option.value }"
                  :aria-pressed="exportFormat === option.value" @click="exportFormat = option.value">
                  <component :is="option.icon" :size="19" />
                  <strong>{{ option.label }}</strong>
                  <span>{{ option.caption }}</span>
                </button>
              </div>
              <div class="notice"><strong>Included Data</strong><p>Assignment number, employee, department, position, assignment type, supervisor, effective and end dates, status, assigned by, assigned date and remarks.</p></div>
              <p class="helper-text">Export is a UI preview only. No data will be downloaded.</p>
            </div>
            <footer class="modal-footer">
              <button type="button" class="btn secondary" @click="showExport = false">Cancel</button>
              <button type="button" class="btn primary" disabled><Download :size="15" /> Export {{ exportFormat.toUpperCase() }}</button>
            </footer>
          </section>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<style scoped>
.department-assignment-page { width: 100%; max-width: 1660px; margin: 0 auto; }
.header-actions { display: flex; align-items: center; gap: 8px; }
.table-footer { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 14px 3px 0; }
.table-footer p { margin: 0; color: var(--text-muted); font-size: 11px; }
.table-footer strong { color: var(--text-primary); font-weight: 650; }
.modal-backdrop { position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 18px; background: rgba(3, 12, 29, .78); backdrop-filter: blur(5px); }
.modal-card { width: 100%; max-width: 620px; max-height: 92vh; overflow-y: auto; border: 1px solid var(--border); border-radius: 13px; background: var(--bg-card); box-shadow: 0 24px 65px rgba(0, 0, 0, .3); }
.modal-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px; border-bottom: 1px solid var(--border); }
.modal-heading { display: flex; align-items: center; gap: 10px; }
.modal-heading h2 { margin: 0; color: var(--text-primary); font-size: 13px; }
.modal-heading p { margin: 3px 0 0; color: var(--text-muted); font-size: 9px; }
.modal-icon { display: grid; width: 36px; height: 36px; place-items: center; border-radius: 8px; background: var(--primary-soft); color: var(--primary); }
.icon-close { display: grid; width: 29px; height: 29px; place-items: center; border: 1px solid var(--border); border-radius: 7px; background: transparent; color: var(--text-secondary); }
.icon-close:hover { color: var(--red); background: var(--red-soft); }
.modal-body { padding: 16px; }
.section-title { margin: 0 0 11px; color: var(--text-primary); font-size: 11px; font-weight: 700; }
.section-title:not(:first-child) { margin-top: 20px; }
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.field { display: flex; flex-direction: column; gap: 6px; color: var(--text-primary); font-size: 10px; font-weight: 600; }
.field.full { grid-column: 1 / -1; }
.field b { color: var(--red); }
.field input, .field select, .field textarea { width: 100%; min-height: 38px; padding: 9px 10px; border: 1px solid var(--border); border-radius: 7px; outline: none; background: var(--bg-card-soft); color: var(--text-primary); font-size: 11px; font-weight: 400; font-family: inherit; }
.field textarea { resize: vertical; }
.field input:focus, .field select:focus, .field textarea:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(36, 107, 253, .08); }
.field input:disabled { opacity: .65; cursor: not-allowed; }
.helper-text { margin: 10px 0 0; color: var(--text-muted); font-size: 9px; line-height: 1.6; }
.form-error { margin: 12px 0 0; padding: 9px; border-radius: 6px; background: var(--red-soft); color: var(--red); font-size: 10px; }
.modal-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 13px 16px; border-top: 1px solid var(--border); }
.btn { display: inline-flex; min-height: 36px; align-items: center; justify-content: center; gap: 7px; padding: 0 14px; border: 1px solid var(--border); border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer; }
.btn.secondary { background: transparent; color: var(--text-primary); }
.btn.primary { border-color: var(--primary); background: var(--primary); color: #fff; }
.btn.danger { border-color: var(--red); background: var(--red); color: #fff; }
.btn:disabled { opacity: .5; cursor: not-allowed; }
.notice { display: block; margin-top: 15px; padding: 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); }
.notice strong { color: var(--text-primary); font-size: 10px; }
.notice p { margin: 5px 0 0; color: var(--text-muted); font-size: 10px; line-height: 1.65; }
.notice.warning { display: flex; align-items: flex-start; gap: 10px; margin: 0 0 16px; }
.notice.warning svg { flex-shrink: 0; color: var(--orange); }
.notice.warning p { margin: 0; }
.profile-box { display: flex; align-items: center; gap: 11px; padding: 13px; border: 1px solid var(--border); border-radius: 9px; background: var(--bg-card-soft); }
.profile-avatar { display: grid; width: 40px; height: 40px; place-items: center; border-radius: 8px; background: var(--primary-soft); color: var(--primary); }
.profile-box h3 { margin: 0; font-size: 12px; color: var(--text-primary); }
.profile-box p { margin: 4px 0 0; font-size: 9px; color: var(--text-muted); }
.pill { margin-left: auto; padding: 5px 9px; border-radius: 20px; background: var(--primary-soft); color: var(--primary); font-size: 9px; }
.details-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; margin-top: 14px; }
.detail-box { display: flex; flex-direction: column; gap: 7px; padding: 11px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); }
.detail-box span { color: var(--text-muted); font-size: 9px; }
.detail-box strong { color: var(--text-primary); font-size: 11px; }
.stats-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 7px; margin-bottom: 17px; }
.stat-box { display: flex; flex-direction: column; gap: 5px; padding: 10px; border: 1px solid var(--border); border-radius: 7px; background: var(--bg-card-soft); }
.stat-box span { color: var(--text-muted); font-size: 8px; }
.stat-box strong { color: var(--text-primary); font-size: 14px; }
.format-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 7px; }
.format-card { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; min-height: 100px; padding: 11px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); color: var(--text-primary); text-align: left; }
.format-card.chosen { border-color: var(--primary); background: var(--primary-soft); }
.format-card svg { color: var(--primary); }
.format-card strong { font-size: 10px; }
.format-card span { color: var(--text-muted); font-size: 9px; }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .18s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
@media (max-width: 650px) {
  .header-actions, .table-footer { flex-direction: column; align-items: flex-start; }
  .form-grid, .details-grid, .format-grid { grid-template-columns: 1fr; }
  .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>
