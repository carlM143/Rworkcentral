<script setup lang="ts">
import { Plus, Download, X, Building2, FileSpreadsheet, FileText, Table2, Save, UserRound } from 'lucide-vue-next'
import type { Department } from '~/types/department'

const {
  search, status, currentPage, paginatedDepartments, filteredDepartments,
  totalPages, showingFrom, showingTo, stats, statusOptions,
  getEmployeeCount, getPositionCount, saveDepartment, resetFilters,
} = useDepartments()
const { info } = useToast()
type ExportFormat = 'excel' | 'pdf' | 'csv'
const showDepartmentModal = ref(false)
const showExportModal = ref(false)
const selectedExportFormat = ref<ExportFormat>('excel')
const editingId = ref<number | null>(null)
const formError = ref('')
const form = reactive({ name: '', code: '', description: '', head: '', status: 'Active' as 'Active' | 'Inactive' })
const exportFormats = [
  { value: 'excel' as const, label: 'Excel', description: 'Best for HR department reports and analysis.', icon: FileSpreadsheet },
  { value: 'pdf' as const, label: 'PDF', description: 'Printable department directory.', icon: FileText },
  { value: 'csv' as const, label: 'CSV', description: 'Raw department data for other systems.', icon: Table2 },
]
const openAdd = () => {
  editingId.value = null
  formError.value = ''
  Object.assign(form, { name: '', code: '', description: '', head: '', status: 'Active' })
  showDepartmentModal.value = true
}
const openEdit = (item: Department) => {
  editingId.value = item.id
  formError.value = ''
  Object.assign(form, { name: item.name, code: item.code, description: item.description ?? '', head: item.head ?? '', status: item.status })
  showDepartmentModal.value = true
}
const closeDepartmentModal = () => { showDepartmentModal.value = false; formError.value = '' }
const save = () => {
  const result = saveDepartment(form, editingId.value ?? undefined)
  if (!result.ok) { formError.value = result.message; return }
  closeDepartmentModal()
  info('Department Updated', result.message)
}
const openExport = () => { selectedExportFormat.value = 'excel'; showExportModal.value = true }
const closeExport = () => { showExportModal.value = false }
const onEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') { closeDepartmentModal(); closeExport() }
}
onMounted(() => window.addEventListener('keydown', onEscape))
onBeforeUnmount(() => window.removeEventListener('keydown', onEscape))
</script>

<template>
  <section class="departments-page">
    <PageHeader title="Departments" description="Manage organizational departments, department heads and workforce assignments.">
      <AppButton variant="secondary" :icon="Download" @click="openExport">Export</AppButton>
      <AppButton :icon="Plus" @click="openAdd">Add Department</AppButton>
    </PageHeader>
    <DepartmentStats :stats="stats" />
    <DepartmentFilters v-model:search="search" v-model:status="status" :status-options="statusOptions" @reset="resetFilters" />
    <DepartmentTable :departments="paginatedDepartments" :get-employee-count="getEmployeeCount" :get-position-count="getPositionCount" @edit="openEdit" />
    <div class="table-footer"><p>Showing <strong>{{ showingFrom }}–{{ showingTo }}</strong> of <strong>{{ filteredDepartments.length }}</strong> departments</p><AppPagination v-model="currentPage" :total-pages="totalPages" /></div>

    <!-- ADD / EDIT DEPARTMENT -->
    <Teleport to="body">
      <Transition name="dept-modal">
        <div v-if="showDepartmentModal" class="dept-overlay" @click.self="closeDepartmentModal">
          <div class="dept-dialog" role="dialog" aria-modal="true" aria-labelledby="dept-form-title">
            <div class="dept-modal-header"><div class="dept-header-left"><div class="dept-header-icon"><Building2 :size="19" /></div><div><h2 id="dept-form-title">{{ editingId === null ? 'Add New Department' : 'Edit Department' }}</h2><p>{{ editingId === null ? 'Create a new organizational department.' : 'Update department information.' }}</p></div></div><button class="dept-close" aria-label="Close" type="button" @click="closeDepartmentModal"><X :size="17" /></button></div>
            <form @submit.prevent="save">
              <div class="dept-modal-body">
                <h3 class="dept-section-label"><Building2 :size="15" /> Department Information</h3>
                <div class="dept-form-grid">
                  <div class="dept-field"><label for="dept-name">Department Name <span>*</span></label><input id="dept-name" v-model.trim="form.name" required maxlength="100" placeholder="e.g. Human Resources" /></div>
                  <div class="dept-field"><label for="dept-code">Department Code <span>*</span></label><input id="dept-code" v-model.trim="form.code" required maxlength="20" placeholder="e.g. HR" /></div>
                  <div class="dept-field full"><label for="dept-description">Description</label><textarea id="dept-description" v-model="form.description" rows="3" placeholder="Describe this department's responsibilities..." /></div>
                </div>
                <h3 class="dept-section-label spaced"><UserRound :size="15" /> Management & Status</h3>
                <div class="dept-form-grid">
                  <div class="dept-field"><label for="dept-head">Department Head</label><input id="dept-head" v-model.trim="form.head" placeholder="Optional department head" /><small>Text entry for mock UI; employee lookup can be connected later.</small></div>
                  <div class="dept-field"><label for="dept-status">Department Status</label><select id="dept-status" v-model="form.status"><option value="Active">Active</option><option value="Inactive">Inactive</option></select></div>
                </div>
                <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>
                <div class="dept-notice"><strong>Local preview</strong><p>Add/Edit changes update sample data in this Nuxt session only. No database or API connection yet.</p></div>
              </div>
              <div class="dept-modal-footer"><button type="button" class="dept-btn secondary" @click="closeDepartmentModal">Cancel</button><button type="submit" class="dept-btn primary"><Save :size="15" /> {{ editingId === null ? 'Save Department' : 'Save Changes' }}</button></div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- EXPORT MODAL - UI ONLY -->
    <Teleport to="body">
      <Transition name="dept-modal">
        <div v-if="showExportModal" class="dept-overlay" @click.self="closeExport">
          <div class="dept-dialog" role="dialog" aria-modal="true" aria-labelledby="dept-export-title">
            <div class="dept-modal-header"><div class="dept-header-left"><div class="dept-header-icon"><Download :size="19" /></div><div><h2 id="dept-export-title">Export Departments</h2><p>Export organizational departments and workforce data.</p></div></div><button type="button" class="dept-close" aria-label="Close" @click="closeExport"><X :size="17" /></button></div>
            <div class="dept-modal-body">
              <div class="dept-summary-grid"><div class="dept-summary"><span>Total</span><strong>{{ stats.total }}</strong></div><div class="dept-summary"><span>Active</span><strong>{{ stats.active }}</strong></div><div class="dept-summary"><span>Employees</span><strong>{{ stats.employees }}</strong></div><div class="dept-summary"><span>Vacant Heads</span><strong>{{ stats.vacantHeads }}</strong></div></div>
              <h3 class="dept-section-label">Export Format</h3>
              <div class="dept-format-grid"><button v-for="format in exportFormats" :key="format.value" type="button" class="dept-format-option" :class="{ selected: selectedExportFormat === format.value }" :aria-pressed="selectedExportFormat === format.value" @click="selectedExportFormat = format.value"><component :is="format.icon" :size="20" /><strong>{{ format.label }}</strong><span>{{ format.description }}</span></button></div>
              <div class="dept-notice"><strong>Included Data</strong><p>Department name, code, description, department head, assigned employees, positions and status.</p></div>
              <p class="preview-note">Export download will be connected later.</p>
            </div>
            <div class="dept-modal-footer"><button type="button" class="dept-btn secondary" @click="closeExport">Cancel</button><button type="button" class="dept-btn primary" disabled title="Export will be connected later"><Download :size="15" /> Export {{ selectedExportFormat === 'excel' ? 'Excel' : selectedExportFormat === 'pdf' ? 'PDF' : 'CSV' }}</button></div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<style scoped>
.departments-page{width:100%;max-width:1660px;margin:0 auto}.table-footer{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:13px 3px 0}.table-footer p{margin:0;color:var(--text-muted);font-size:10px}.table-footer strong{color:var(--text-primary);font-weight:600}.dept-overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(3,12,29,.78);backdrop-filter:blur(5px)}.dept-dialog{width:100%;max-width:565px;max-height:90vh;overflow-y:auto;border:1px solid var(--border);border-radius:13px;background:var(--bg-card);box-shadow:0 25px 65px rgba(0,0,0,.25)}.dept-modal-header{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:15px 16px;border-bottom:1px solid var(--border)}.dept-header-left{display:flex;align-items:center;gap:10px;min-width:0}.dept-header-icon{display:grid;place-items:center;width:35px;height:35px;flex-shrink:0;border-radius:8px;background:var(--primary-soft);color:var(--primary)}.dept-modal-header h2{margin:0;color:var(--text-primary);font-size:12px}.dept-modal-header p{margin:4px 0 0;color:var(--text-muted);font-size:8px}.dept-close{display:grid;place-items:center;width:28px;height:28px;border:1px solid var(--border);border-radius:7px;background:transparent;color:var(--text-secondary);cursor:pointer}.dept-close:hover{background:var(--red-soft);color:var(--red)}.dept-modal-body{padding:16px}.dept-section-label{display:flex;align-items:center;gap:8px;margin:0 0 12px;color:var(--text-primary);font-size:11px}.dept-section-label.spaced{margin-top:22px}.dept-section-label svg{color:var(--primary)}.dept-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px}.dept-field{display:flex;flex-direction:column;gap:7px}.dept-field.full{grid-column:1/-1}.dept-field label{color:var(--text-primary);font-size:10px;font-weight:600}.dept-field label span{color:var(--red)}.dept-field input,.dept-field select,.dept-field textarea{width:100%;min-height:38px;padding:10px 11px;border:1px solid var(--border);border-radius:8px;outline:0;background:var(--bg-card-soft);color:var(--text-primary);font:inherit;font-size:11px}.dept-field textarea{resize:vertical}.dept-field input:focus,.dept-field select:focus,.dept-field textarea:focus{border-color:var(--primary);box-shadow:0 0 0 3px rgba(36,107,253,.1)}.dept-field small{color:var(--text-muted);font-size:9px}.form-error{color:var(--red);font-size:10px}.dept-notice{margin-top:14px;padding:12px;border:1px solid var(--border);border-radius:8px;background:var(--bg-card-soft)}.dept-notice strong{color:var(--text-primary);font-size:9px}.dept-notice p{margin:6px 0 0;color:var(--text-muted);font-size:9px;line-height:1.6}.preview-note{color:var(--text-muted);font-size:9px}.dept-modal-footer{display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:12px 16px;border-top:1px solid var(--border)}.dept-btn{display:inline-flex;min-height:36px;align-items:center;justify-content:center;gap:7px;padding:0 14px;border-radius:8px;font-size:10px;font-weight:600;cursor:pointer}.dept-btn.secondary{border:1px solid var(--border);background:transparent;color:var(--text-primary)}.dept-btn.primary{border:1px solid var(--primary);background:var(--primary);color:white}.dept-btn:disabled{opacity:.55;cursor:not-allowed}.dept-summary-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin-bottom:15px}.dept-summary{display:flex;flex-direction:column;gap:5px;padding:10px;border:1px solid var(--border);border-radius:7px;background:var(--bg-card-soft)}.dept-summary span{color:var(--text-muted);font-size:7px;text-transform:uppercase}.dept-summary strong{color:var(--text-primary);font-size:13px}.dept-format-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}.dept-format-option{display:flex;min-height:95px;min-width:0;flex-direction:column;align-items:flex-start;gap:7px;padding:11px 9px;border:1px solid var(--border);border-radius:8px;background:var(--bg-card-soft);color:var(--text-primary);text-align:left;cursor:pointer}.dept-format-option.selected{border-color:var(--primary);background:var(--primary-soft)}.dept-format-option svg{color:var(--text-muted)}.dept-format-option.selected svg{color:var(--primary)}.dept-format-option strong{font-size:9px}.dept-format-option span{color:var(--text-muted);font-size:7px;line-height:1.5}.dept-modal-enter-active,.dept-modal-leave-active{transition:opacity .2s ease}.dept-modal-enter-from,.dept-modal-leave-to{opacity:0}@media(max-width:650px){.table-footer{flex-direction:column;align-items:flex-start}}@media(max-width:480px){.dept-form-grid,.dept-format-grid{grid-template-columns:1fr}.dept-summary-grid{grid-template-columns:repeat(2,1fr)}}
</style>
