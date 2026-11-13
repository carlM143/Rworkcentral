<script setup lang="ts">
import { Download, Plus, X } from 'lucide-vue-next'
import type { OffboardingRecord, OffboardingChecklist } from '~/types/offboarding'
import OffboardingStats from '~/components/admin/employee-lifecycle/offboarding/OffboardingStats.vue'
import OffboardingFilters from '~/components/admin/employee-lifecycle/offboarding/OffboardingFilters.vue'
import OffboardingTable from '~/components/admin/employee-lifecycle/offboarding/OffboardingTable.vue'

definePageMeta({ layout: 'admin' })
const { $api } = useNuxtApp()
const toast = useToast()
const { loading, errorMessage, load, save, search, offboardingType, department, status, currentPage,
  offboardingTypeOptions, statusOptions, finalPayStatusOptions, departmentOptions, filteredRecords, stats,
  totalPages, paginatedRecords, showingFrom, showingTo, resetFilters } = useOffboarding()
const employees = ref<{ employeeId: number; employeeNumber: string; employeeName: string; department: string; position: string }[]>([])
const loadEmployees = async () => {
  try { employees.value = (await $api<any>('/admin/lifecycle/employees')).data }
  catch { toast.error('Unable to load employees', 'Please refresh and try again.') }
}
onMounted(loadEmployees)
const checklistLabels: Record<keyof OffboardingChecklist, string> = {
  hrClearance: 'HR clearance', departmentClearance: 'Department clearance', financeClearance: 'Finance clearance',
  itClearance: 'IT clearance', assetReturn: 'Company assets returned', exitInterview: 'Exit interview completed',
}
const emptyForm = () => ({ employeeId: '', offboardingType: 'Resignation', noticeDate: '', lastWorkingDay: '', separationDate: '',
  exitInterviewDate: '', status: 'Draft', finalPayStatus: 'Not Started', reason: '', remarks: '',
  checklist: { hrClearance: false, departmentClearance: false, financeClearance: false, itClearance: false, assetReturn: false, exitInterview: false },
})
const form = ref(emptyForm())
const modal = ref<'create' | 'edit' | 'view' | null>(null)
const selected = ref<OffboardingRecord | null>(null)
const saving = ref(false)
const formError = ref('')
const employee = computed(() => employees.value.find(e => e.employeeId === Number(form.value.employeeId)))
const readonly = computed(() => modal.value === 'view')
const open = (mode: 'create' | 'edit' | 'view', record?: OffboardingRecord) => {
  selected.value = record || null
  formError.value = ''
  form.value = record ? { ...emptyForm(), ...record, employeeId: String(record.employeeId),
    exitInterviewDate: record.exitInterviewDate || '', remarks: record.remarks || '', checklist: { ...record.checklist } } : emptyForm()
  modal.value = record && ['Completed', 'Cancelled'].includes(record.status) ? 'view' : mode
}
const close = () => { if (!saving.value) modal.value = null }
const submit = async () => {
  if (saving.value || readonly.value) return
  saving.value = true
  formError.value = ''
  try {
    await save({ ...form.value, employeeId: Number(form.value.employeeId) }, selected.value?.id)
    modal.value = null
    toast.success('Offboarding saved', 'The employee exit record has been updated.')
  } catch (err: any) {
    formError.value = Object.values(err?.data?.errors || {}).flat().join(' ') || err?.data?.message || 'Unable to save. Please try again.'
  } finally { saving.value = false }
}
const exportRecords = () => {
  const rows = [['Reference', 'Employee ID', 'Employee', 'Department', 'Type', 'Notice date', 'Last working day', 'Separation date', 'Clearance %', 'Final pay', 'Status', 'Reason', 'Remarks'],
    ...filteredRecords.value.map(r => [r.offboardingNumber, r.employeeNumber, r.employeeName, r.department, r.offboardingType, r.noticeDate, r.lastWorkingDay, r.separationDate, r.clearanceProgress, r.finalPayStatus, r.status, r.reason, r.remarks || ''])]
  const csv = rows.map(row => row.map(value => `"${String(value).replace(/^[=+@-]/, "'$&").replace(/"/g, '""')}"`).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' }))
  const link = document.createElement('a'); link.href = url; link.download = 'employee-offboarding.csv'; link.click(); URL.revokeObjectURL(url)
}
</script>

<template>
  <section class="offboarding-page">
    <PageHeader title="Employee Offboarding" description="Manage employee exits, clearance tasks, exit interviews and final pay status.">
      <AppButton variant="secondary" :icon="Download" @click="exportRecords">Export</AppButton>
      <AppButton :icon="Plus" @click="open('create')">Start Offboarding</AppButton>
    </PageHeader>
    <p v-if="loading" role="status">Loading offboarding records…</p>
    <p v-if="errorMessage" role="alert">{{ errorMessage }} <button @click="load">Retry</button></p>
    <OffboardingStats :stats="stats" />
    <OffboardingFilters v-model:search="search" v-model:offboarding-type="offboardingType" v-model:department="department" v-model:status="status"
      :offboarding-types="offboardingTypeOptions" :departments="departmentOptions" :statuses="statusOptions" @reset="resetFilters" />
    <OffboardingTable :records="paginatedRecords" @view="record => open('view', record)" @edit="record => open('edit', record)" />
    <div class="table-footer"><p>Showing <strong>{{ showingFrom }}–{{ showingTo }}</strong> of {{ filteredRecords.length }} records</p><AppPagination v-model="currentPage" :total-pages="totalPages" /></div>
    <Teleport to="body">
      <div v-if="modal" class="exit-overlay" @click.self="close" @keydown.esc="close">
        <section class="exit-modal" role="dialog" aria-modal="true" aria-labelledby="exit-title" tabindex="-1">
          <header><div><h2 id="exit-title">{{ modal === 'create' ? 'Start Offboarding' : readonly ? 'Offboarding Details' : 'Edit Offboarding' }}</h2><p>{{ selected?.offboardingNumber || 'Create an employee exit record' }}</p></div><button type="button" aria-label="Close" @click="close"><X :size="20" /></button></header>
          <form @submit.prevent="submit">
            <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>
            <fieldset :disabled="readonly || saving">
              <div class="form-grid">
                <label class="full">Employee *<select v-model="form.employeeId" required :disabled="!!selected"><option value="" disabled>Select employee</option><option v-for="e in employees" :key="e.employeeId" :value="String(e.employeeId)">{{ e.employeeNumber }} — {{ e.employeeName }}</option></select></label>
                <p v-if="employee || selected" class="full">{{ employee?.department || selected?.department }} · {{ employee?.position || selected?.position }}</p>
                <label>Offboarding type *<select v-model="form.offboardingType" required><option v-for="s in offboardingTypeOptions" :key="s">{{ s }}</option></select></label>
                <label>Status *<select v-model="form.status" required><option v-for="s in statusOptions" :key="s">{{ s }}</option></select></label>
                <label>Notice date *<input v-model="form.noticeDate" type="date" required></label>
                <label>Last working day *<input v-model="form.lastWorkingDay" type="date" :min="form.noticeDate" required></label>
                <label>Separation date *<input v-model="form.separationDate" type="date" :min="form.lastWorkingDay" required></label>
                <label>Exit interview date<input v-model="form.exitInterviewDate" type="date" :min="form.noticeDate"></label>
                <label class="full">Reason *<textarea v-model="form.reason" required maxlength="5000" rows="3" /></label>
              </div>
              <h3>Clearance checklist</h3>
              <div class="checklist"><label v-for="(label, key) in checklistLabels" :key="key"><input v-model="form.checklist[key]" type="checkbox">{{ label }}</label></div>
              <div class="form-grid">
                <label>Final pay status *<select v-model="form.finalPayStatus"><option v-for="s in finalPayStatusOptions" :key="s">{{ s }}</option></select></label>
                <label class="full">HR remarks<textarea v-model="form.remarks" maxlength="5000" rows="3" /></label>
              </div>
            </fieldset>
            <footer><AppButton variant="secondary" type="button" @click="close">Close</AppButton><AppButton v-if="!readonly" type="submit" :disabled="saving">{{ saving ? 'Saving…' : 'Save Offboarding' }}</AppButton><AppButton v-else-if="selected && !['Completed', 'Cancelled'].includes(selected.status)" type="button" @click="modal = 'edit'">Edit</AppButton></footer>
          </form>
        </section>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.offboarding-page { max-width: 1680px; margin: 0 auto; }
.table-footer, .exit-modal header, .exit-modal footer { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.table-footer { margin-top: 16px; font-size: 12px; color: var(--text-muted); }
.exit-overlay { position: fixed; inset: 0; background: #0f172a80; z-index: 1100; display: grid; place-items: center; padding: 20px; }
.exit-modal { width: min(760px, 100%); max-height: 90vh; overflow-y: auto; background: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border); border-radius: 16px; padding: 24px; box-shadow: var(--shadow); }
.exit-modal h2 { font-size: 20px; margin: 0; }.exit-modal h3 { font-size: 14px; margin-top: 24px; }
.exit-modal header { margin-bottom: 20px; }.exit-modal header p { color: var(--text-muted); font-size: 12px; }.exit-modal header button { border: 0; background: transparent; color: inherit; cursor: pointer; }
.exit-modal fieldset { padding: 0; border: 0; margin: 0; min-width: 0; }
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }.full { grid-column: 1 / -1; }
.form-grid label { display: flex; flex-direction: column; gap: 7px; font-size: 12px; font-weight: 600; }
.form-grid input, .form-grid select, .form-grid textarea { width: 100%; box-sizing: border-box; border: 1px solid var(--border); border-radius: 8px; padding: 10px; background: var(--bg-card); color: var(--text-primary); font: inherit; }
.checklist { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 16px 0 24px; font-size: 12px; }.checklist label { display: flex; gap: 8px; align-items: center; }
.exit-modal footer { justify-content: flex-end; margin-top: 24px; }.form-error { color: #dc2626; font-size: 13px; }
@media (max-width: 600px) { .form-grid, .checklist { grid-template-columns: 1fr; }.exit-modal { padding: 16px; }.table-footer { flex-wrap: wrap; } }
</style>
